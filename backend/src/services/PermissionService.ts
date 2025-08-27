// ====================================================================
// 🛡️ PERMISSION SERVICE - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Serviço completo para gerenciamento de permissões RBAC
// Verificação hierárquica, gestão granular e middleware
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { UserModel, User, UserRole, USER_HIERARCHY } from '../models/User.js';
import { PermissionModel, Permission, DEFAULT_PERMISSIONS } from '../models/Permission.js';
import { ActivityService } from './ActivityService.js';
import { query, execute } from '../database/connection.js';
import { ERROR_MESSAGES } from '../config/auth.js';

// ====================================================================
// INTERFACES
// ====================================================================

export interface PermissionCheck {
  userId: string;
  permissionCode: string;
  tenantId?: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export interface UserPermissionSummary {
  userId: string;
  userName: string;
  role: UserRole;
  directPermissions: Permission[];
  rolePermissions: Permission[];
  allPermissions: Permission[];
  canAccess: (resource: string, action: string) => boolean;
}

// ====================================================================
// CLASSE PERMISSION SERVICE
// ====================================================================

export class PermissionService {

  // ================================================================
  // VERIFICAÇÃO DE PERMISSÕES
  // ================================================================

  /**
   * Verificar se usuário tem permissão específica
   */
  static async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) return false;

      // Super admin tem acesso total
      if (user.role === 'super_admin') return true;

      // Verificar permissões diretas
      const directPermission = await query(`
        SELECT 1 FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ? AND p.code = ?
      `, [userId, permissionCode]);

      if (directPermission.length > 0) return true;

      // Verificar permissões por role
      const rolePermissions = this.getRolePermissions(user.role);
      return rolePermissions.some(p => p.code === permissionCode);

    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }

  /**
   * Verificar múltiplas permissões
   */
  static async hasAnyPermission(userId: string, permissionCodes: string[]): Promise<boolean> {
    for (const code of permissionCodes) {
      if (await this.hasPermission(userId, code)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Verificar todas as permissões
   */
  static async hasAllPermissions(userId: string, permissionCodes: string[]): Promise<boolean> {
    for (const code of permissionCodes) {
      if (!(await this.hasPermission(userId, code))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Verificar permissão com contexto de resource
   */
  static async canAccessResource(
    userId: string, 
    resource: string, 
    action: string, 
    tenantId?: string
  ): Promise<boolean> {
    const permissionCode = `${action}_${resource}`;
    const hasSpecific = await this.hasPermission(userId, permissionCode);
    
    if (hasSpecific) return true;

    // Verificar permissão genérica
    const genericCode = `${action}_all`;
    return await this.hasPermission(userId, genericCode);
  }

  // ================================================================
  // VERIFICAÇÃO HIERÁRQUICA
  // ================================================================

  /**
   * Verificar se usuário tem level mínimo necessário
   */
  static hasMinimumRole(user: User, minimumRole: UserRole): boolean {
    const userLevel = USER_HIERARCHY[user.role] || 0;
    const requiredLevel = USER_HIERARCHY[minimumRole] || 0;
    return userLevel >= requiredLevel;
  }

  /**
   * Verificar se usuário pode gerenciar outro usuário
   */
  static async canManageUser(managerId: string, targetUserId: string): Promise<boolean> {
    try {
      const manager = await UserModel.findById(managerId);
      const target = await UserModel.findById(targetUserId);

      if (!manager || !target) return false;

      // Super admin pode gerenciar todos
      if (manager.role === 'super_admin') return true;

      // Admin pode gerenciar usuários do mesmo tenant
      if (manager.role === 'admin' && manager.tenant_id === target.tenant_id) {
        return USER_HIERARCHY[manager.role] > USER_HIERARCHY[target.role];
      }

      // Manager pode gerenciar usuários de nível inferior no mesmo tenant
      if (['manager', 'coordinator'].includes(manager.role) && manager.tenant_id === target.tenant_id) {
        return USER_HIERARCHY[manager.role] > USER_HIERARCHY[target.role];
      }

      return false;

    } catch (error) {
      console.error('Erro ao verificar permissão de gerenciamento:', error);
      return false;
    }
  }

  // ================================================================
  // GESTÃO DE PERMISSÕES
  // ================================================================

  /**
   * Conceder permissão a usuário
   */
  static async grantPermission(
    userId: string, 
    permissionCode: string, 
    grantedBy: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar se usuários existem
      const user = await UserModel.findById(userId);
      const granter = await UserModel.findById(grantedBy);

      if (!user || !granter) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se granter tem permissão para conceder
      if (!await this.hasPermission(grantedBy, 'manage_permissions')) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }

      // Buscar permissão
      const permission = await PermissionModel.findByCode(permissionCode);
      if (!permission) {
        throw new Error('Permissão não encontrada');
      }

      // Verificar se já possui a permissão
      const hasPermission = await this.hasPermission(userId, permissionCode);
      if (hasPermission) {
        return { success: true, message: 'Usuário já possui esta permissão' };
      }

      // Conceder permissão
      await execute(`
        INSERT OR IGNORE INTO user_permissions (user_id, permission_id, granted_by)
        VALUES (?, ?, ?)
      `, [userId, permission.id, grantedBy]);

      // Registrar atividade
      await ActivityService.log({
        user_id: grantedBy,
        tenant_id: granter.tenant_id,
        action: 'permission_granted',
        resource: 'permissions',
        resource_id: permission.id.toString(),
        details: JSON.stringify({
          target_user_id: userId,
          target_user_name: user.nome_completo,
          permission_code: permissionCode,
          permission_description: permission.description
        })
      });

      return {
        success: true,
        message: `Permissão "${permissionCode}" concedida com sucesso`
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao conceder permissão');
    }
  }

  /**
   * Revogar permissão de usuário
   */
  static async revokePermission(
    userId: string, 
    permissionCode: string, 
    revokedBy: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar se usuários existem
      const user = await UserModel.findById(userId);
      const revoker = await UserModel.findById(revokedBy);

      if (!user || !revoker) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se revoker tem permissão
      if (!await this.hasPermission(revokedBy, 'manage_permissions')) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }

      // Buscar permissão
      const permission = await PermissionModel.findByCode(permissionCode);
      if (!permission) {
        throw new Error('Permissão não encontrada');
      }

      // Revogar permissão
      const result = await execute(`
        DELETE FROM user_permissions 
        WHERE user_id = ? AND permission_id = ?
      `, [userId, permission.id]);

      if (result.changes === 0) {
        return { success: true, message: 'Usuário não possuía esta permissão' };
      }

      // Registrar atividade
      await ActivityService.log({
        user_id: revokedBy,
        tenant_id: revoker.tenant_id,
        action: 'permission_revoked',
        resource: 'permissions',
        resource_id: permission.id.toString(),
        details: JSON.stringify({
          target_user_id: userId,
          target_user_name: user.nome_completo,
          permission_code: permissionCode,
          permission_description: permission.description
        })
      });

      return {
        success: true,
        message: `Permissão "${permissionCode}" revogada com sucesso`
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao revogar permissão');
    }
  }

  // ================================================================
  // CONSULTAS E RELATÓRIOS
  // ================================================================

  /**
   * Obter resumo completo de permissões do usuário
   */
  static async getUserPermissionSummary(userId: string): Promise<UserPermissionSummary> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Permissões diretas
      const directPermissions = await query(`
        SELECT p.* FROM permissions p
        JOIN user_permissions up ON p.id = up.permission_id
        WHERE up.user_id = ?
        ORDER BY p.code
      `, [userId]) as Permission[];

      // Permissões por role
      const rolePermissions = this.getRolePermissions(user.role);

      // Todas as permissões (união sem duplicatas)
      const allPermissionCodes = new Set([
        ...directPermissions.map(p => p.code),
        ...rolePermissions.map(p => p.code)
      ]);

      const allPermissions = [
        ...directPermissions,
        ...rolePermissions.filter(rp => !directPermissions.some(dp => dp.code === rp.code))
      ];

      return {
        userId: user.id,
        userName: user.nome_completo,
        role: user.role,
        directPermissions,
        rolePermissions,
        allPermissions,
        canAccess: (resource: string, action: string) => {
          const permissionCode = `${action}_${resource}`;
          return allPermissionCodes.has(permissionCode) || 
                 allPermissionCodes.has(`${action}_all`) || 
                 user.role === 'super_admin';
        }
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao obter resumo de permissões');
    }
  }

  /**
   * Listar usuários com uma permissão específica
   */
  static async getUsersWithPermission(permissionCode: string, tenantId?: string): Promise<User[]> {
    try {
      let sql = `
        SELECT DISTINCT u.* FROM users u
        LEFT JOIN user_permissions up ON u.id = up.user_id
        LEFT JOIN permissions p ON up.permission_id = p.id
        WHERE u.status = 'ativo' AND (
          p.code = ? OR 
          u.role = 'super_admin'
        )
      `;
      
      const params = [permissionCode];

      if (tenantId) {
        sql += ` AND (u.tenant_id = ? OR u.role = 'super_admin')`;
        params.push(tenantId);
      }

      sql += ` ORDER BY u.nome_completo`;

      const users = await query(sql, params) as User[];

      // Filtrar também por permissões de role
      const filteredUsers = [];
      for (const user of users) {
        if (user.role === 'super_admin' || await this.hasPermission(user.id, permissionCode)) {
          filteredUsers.push(user);
        }
      }

      return filteredUsers;

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao buscar usuários com permissão');
    }
  }

  // ================================================================
  // MIDDLEWARE DE AUTORIZAÇÃO
  // ================================================================

  /**
   * Middleware para verificar permissão específica
   */
  static requirePermission(permissionCode: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            error: ERROR_MESSAGES.TOKEN_MISSING
          });
          return;
        }

        const hasPermission = await this.hasPermission(req.user.id, permissionCode);
        
        if (!hasPermission) {
          // Registrar tentativa não autorizada
          await ActivityService.log({
            user_id: req.user.id,
            tenant_id: req.user.tenant_id,
            action: 'permission_denied',
            resource: 'auth',
            details: JSON.stringify({
              required_permission: permissionCode,
              user_role: req.user.role,
              endpoint: req.path,
              method: req.method
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          });

          res.status(403).json({
            success: false,
            error: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
            required: permissionCode,
            current: req.user.role
          });
          return;
        }

        next();

      } catch (error) {
        res.status(500).json({
          success: false,
          error: ERROR_MESSAGES.INTERNAL_ERROR
        });
      }
    };
  }

  /**
   * Middleware para verificar role mínima
   */
  static requireMinimumRole(minimumRole: UserRole) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: ERROR_MESSAGES.TOKEN_MISSING
        });
        return;
      }

      if (!this.hasMinimumRole(req.user, minimumRole)) {
        res.status(403).json({
          success: false,
          error: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
          required: minimumRole,
          current: req.user.role
        });
        return;
      }

      next();
    };
  }

  /**
   * Middleware para verificar qualquer uma das permissões
   */
  static requireAnyPermission(permissionCodes: string[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            error: ERROR_MESSAGES.TOKEN_MISSING
          });
          return;
        }

        const hasAnyPermission = await this.hasAnyPermission(req.user.id, permissionCodes);
        
        if (!hasAnyPermission) {
          res.status(403).json({
            success: false,
            error: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
            required: permissionCodes,
            current: req.user.role
          });
          return;
        }

        next();

      } catch (error) {
        res.status(500).json({
          success: false,
          error: ERROR_MESSAGES.INTERNAL_ERROR
        });
      }
    };
  }

  // ================================================================
  // MÉTODOS AUXILIARES
  // ================================================================

  /**
   * Obter permissões padrão por role
   */
  static getRolePermissions(role: UserRole): Permission[] {
    // Permissões acumulativas (inclui permissões dos níveis inferiores)
    let permissions: Permission[] = [];

    switch (role) {
      case 'super_admin':
        permissions = [...permissions, ...DEFAULT_PERMISSIONS.super_admin];
        // fall through
      case 'admin':
        permissions = [...permissions, ...DEFAULT_PERMISSIONS.admin];
        // fall through
      case 'manager':
        permissions = [...permissions, ...DEFAULT_PERMISSIONS.manager];
        // fall through
      case 'coordinator':
        permissions = [...permissions, ...DEFAULT_PERMISSIONS.coordinator];
        // fall through
      case 'user':
        permissions = [...permissions, ...DEFAULT_PERMISSIONS.user];
        // fall through
      case 'guest':
        permissions = [...permissions, ...DEFAULT_PERMISSIONS.guest];
        break;
    }

    // Remover duplicatas
    const uniquePermissions = permissions.filter(
      (permission, index, self) => 
        self.findIndex(p => p.code === permission.code) === index
    );

    return uniquePermissions;
  }

  /**
   * Verificar se permission existe
   */
  static async permissionExists(permissionCode: string): Promise<boolean> {
    try {
      const permission = await PermissionModel.findByCode(permissionCode);
      return !!permission;
    } catch {
      return false;
    }
  }

  // ================================================================
  // EXPORTAÇÕES DE CONVENIÊNCIA
  // ================================================================

  // Middleware pré-configurados
  static requireAdmin = PermissionService.requireMinimumRole('admin');
  static requireManager = PermissionService.requireMinimumRole('manager');
  static requireCoordinator = PermissionService.requireMinimumRole('coordinator');
  static requireSuperAdmin = PermissionService.requireMinimumRole('super_admin');

  static requireStaff = PermissionService.requireAnyPermission([
    'read_department_data',
    'manage_team',
    'manage_department',
    'manage_tenant'
  ]);

  static requireManagement = PermissionService.requireAnyPermission([
    'manage_department',
    'manage_tenant',
    'manage_tenants'
  ]);
}

export default PermissionService;