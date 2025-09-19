// ====================================================================
// 🔐 PERMISSION SERVICE - DIGIURBAN SECURITY SYSTEM
// ====================================================================
// Serviço principal para gerenciamento de permissões granulares
// Substitui sistema legado por RBAC baseado em recursos
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../database/generated/client/index.js';
import { PERMISSIONS, Permission, ROLE_HIERARCHY, ROLE_PERMISSIONS } from '../types/permissions.js';
import { ActivityService } from './ActivityService.js';

const prisma = new PrismaClient();

// ====================================================================
// INTERFACES
// ====================================================================

export interface UserPermissions {
  userId: string;
  permissions: string[];
  role: string;
  tenantId: string;
}

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
  requiredLevel?: number;
  userLevel?: number;
}

// ====================================================================
// PERMISSION SERVICE CLASS
// ====================================================================

export class PermissionService {

  // ====================================================================
  // CORE PERMISSION MANAGEMENT
  // ====================================================================

  /**
   * Verificar se usuário tem uma permissão específica
   */
  static async userHasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });

      if (!user) return false;

      // Super admin tem todas as permissões
      if (user.role === 'super_admin') return true;

      // Verificar permissões diretas
      const hasDirectPermission = user.permissions.some(
        up => up.permission.code === permission
      );

      if (hasDirectPermission) return true;

      // Verificar permissões baseadas em role
      return this.roleHasPermission(user.role, permission);
    } catch (error) {
      console.error('❌ [PERMISSION] Erro ao verificar permissão:', error);
      return false;
    }
  }

  /**
   * Verificar se role tem permissão específica
   */
  static roleHasPermission(role: string, permission: string): boolean {
    const permissionDef = PERMISSIONS[permission];
    if (!permissionDef) return false;

    // Verificar se o role tem a permissão no mapeamento ROLE_PERMISSIONS
    const userPermissions = ROLE_PERMISSIONS[role] || [];

    return userPermissions.includes(permission);
  }

  /**
   * Obter todas as permissões de um usuário
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });

      if (!user) return [];

      // Super admin tem todas as permissões
      if (user.role === 'super_admin') {
        return Object.keys(PERMISSIONS);
      }

      const permissions = new Set<string>();

      // Adicionar permissões diretas
      user.permissions.forEach(up => {
        permissions.add(up.permission.code);
      });

      // Adicionar permissões baseadas em role
      Object.entries(PERMISSIONS).forEach(([code, permission]) => {
        if (this.roleHasPermission(user.role, code)) {
          permissions.add(code);
        }
      });

      return Array.from(permissions);
    } catch (error) {
      console.error('❌ [PERMISSION] Erro ao buscar permissões:', error);
      return [];
    }
  }

  /**
   * Verificar se usuário pode gerenciar outro usuário
   */
  static async canManageUserPermissions(managerId: string, targetUserId: string): Promise<boolean> {
    try {
      const manager = await prisma.user.findUnique({ where: { id: managerId } });
      const target = await prisma.user.findUnique({ where: { id: targetUserId } });

      if (!manager || !target) return false;

      const managerLevel = ROLE_HIERARCHY[manager.role] || 0;
      const targetLevel = ROLE_HIERARCHY[target.role] || 0;

      // Manager deve ter nível superior ou ser do mesmo tenant
      return managerLevel > targetLevel ||
             (manager.tenantId === target.tenantId && managerLevel >= targetLevel);
    } catch (error) {
      console.error('❌ [PERMISSION] Erro ao verificar gestão:', error);
      return false;
    }
  }

  /**
   * Verificar se usuário pode acessar recurso específico
   */
  static async canAccessResource(userId: string, resource: string, action: string, tenantId?: string): Promise<boolean> {
    try {
      const permissionCode = `${resource}.${action}`;
      return await this.userHasPermission(userId, permissionCode);
    } catch (error) {
      console.error('❌ [PERMISSION] Erro ao verificar acesso a recurso:', error);
      return false;
    }
  }

  /**
   * Obter resumo de permissões do usuário
   */
  static async getUserPermissionSummary(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });

      if (!user) return null;

      const permissions = await this.getUserPermissions(userId);

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        permissions: permissions,
        directPermissions: user.permissions.map(up => up.permission.code),
        inheritedPermissions: permissions.filter(p =>
          !user.permissions.some(up => up.permission.code === p)
        )
      };
    } catch (error) {
      console.error('❌ [PERMISSION] Erro ao obter resumo:', error);
      return null;
    }
  }

  /**
   * Obter usuários com permissão específica
   */
  static async getUsersWithPermission(permissionCode: string, tenantId?: string): Promise<any[]> {
    try {
      const permission = await prisma.permission.findUnique({
        where: { code: permissionCode }
      });

      if (!permission) return [];

      const whereClause: any = {};
      if (tenantId) {
        whereClause.tenantId = tenantId;
      }

      const users = await prisma.user.findMany({
        where: {
          ...whereClause,
          OR: [
            {
              permissions: {
                some: {
                  permission_id: permission.id
                }
              }
            },
            {
              role: 'super_admin' // Super admin tem todas as permissões
            }
          ]
        },
        select: {
          id: true,
          email: true,
          nomeCompleto: true,
          role: true,
          tenantId: true
        }
      });

      return users;
    } catch (error) {
      console.error('❌ [PERMISSION] Erro ao buscar usuários:', error);
      return [];
    }
  }

  /**
   * Verificar se um usuário pode gerenciar outro (alias para compatibilidade)
   */
  static async canManageUser(managerId: string, targetUserId: string): Promise<boolean> {
    return this.canManageUserPermissions(managerId, targetUserId);
  }

  /**
   * Conceder permissão (alias para compatibilidade)
   */
  static async grantPermission(userId: string, permissionCode: string, grantedBy: string): Promise<{ message: string }> {
    const success = await this.grantPermissionToUser(userId, permissionCode, grantedBy);
    return {
      message: success ? 'Permissão concedida com sucesso' : 'Falha ao conceder permissão'
    };
  }

  /**
   * Revogar permissão (alias para compatibilidade)
   */
  static async revokePermission(userId: string, permissionCode: string, revokedBy: string): Promise<{ message: string }> {
    const success = await this.revokePermissionFromUser(userId, permissionCode, revokedBy);
    return {
      message: success ? 'Permissão revogada com sucesso' : 'Falha ao revogar permissão'
    };
  }

  // ====================================================================
  // MIDDLEWARE FUNCTIONS
  // ====================================================================

  /**
   * Middleware para verificar permissões específicas
   */
  static requirePermissions(permissions: string[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ success: false, error: 'Usuário não autenticado' });
          return;
        }

        const userPermissions = await this.getUserPermissions(req.user.id);
        const hasAllPermissions = permissions.every(perm => userPermissions.includes(perm));

        if (!hasAllPermissions) {
          await ActivityService.log({
            userId: req.user.id,
            action: 'permission_denied',
            resource: 'permissions',
            details: JSON.stringify({
              required: permissions,
              user_permissions: userPermissions,
              user_role: req.user.role
            }),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          });

          res.status(403).json({
            success: false,
            error: 'Permissões insuficientes'
          });
          return;
        }

        next();
      } catch (error) {
        console.error('❌ [PERMISSION] Erro no middleware:', error);
        res.status(500).json({ success: false, error: 'Erro interno' });
      }
    };
  }

  /**
   * Middleware para permissão única (compatibilidade)
   */
  static requirePermission(permission: string) {
    return this.requirePermissions([permission]);
  }

  /**
   * Middleware para operações de usuários
   */
  static get requireUserCreate() { return this.requirePermissions(['users.create']); }
  static get requireUserRead() { return this.requirePermissions(['users.read']); }
  static get requireUserUpdate() { return this.requirePermissions(['users.update']); }
  static get requireUserDelete() { return this.requirePermissions(['users.delete']); }
  static get requireUserResetPassword() { return this.requirePermissions(['users.reset_password']); }
  static get requireUserManagePermissions() { return this.requirePermissions(['users.manage_permissions']); }

  /**
   * Middleware para operações de sistema
   */
  static get requireSystemAdmin() { return this.requirePermissions(['system.admin']); }
  static get requireSuperAdmin() { return this.requirePermissions(['system.admin']); } // Alias para compatibilidade
  static get requireAuditRead() { return this.requirePermissions(['audit.read']); }
  static get requireAuditExport() { return this.requirePermissions(['audit.export']); }

  /**
   * Middleware para painel do cidadão
   */
  static get requireCidadaoDashboard() { return this.requirePermissions(['cidadao.dashboard']); }
  static get requireCidadaoProtocolosCreate() { return this.requirePermissions(['cidadao.protocolos.create']); }
  static get requireCidadaoProtocolosRead() { return this.requirePermissions(['cidadao.protocolos.read']); }
  static get requireCidadaoServicos() { return this.requirePermissions(['cidadao.servicos.read']); }
  static get requireCidadaoInformacoes() { return this.requirePermissions(['cidadao.informacoes.read']); }
  static get requireCidadaoDocumentos() { return this.requirePermissions(['cidadao.documentos.download']); }
  static get requireCidadaoContato() { return this.requirePermissions(['cidadao.contato.create']); }
  static get requireCidadaoAgenda() { return this.requirePermissions(['cidadao.agenda.read']); }
  static get requireCidadaoNoticias() { return this.requirePermissions(['cidadao.noticias.read']); }
  static get requireCidadaoPerfil() { return this.requirePermissions(['cidadao.perfil.update']); }

  // ====================================================================
  // SECRETARIA PERMISSIONS
  // ====================================================================

  /**
   * Configurar permissões de secretaria para usuário
   */
  static async setSecretariaPermissions(
    userId: string,
    secretaria: string,
    level: 'read' | 'write' | 'admin',
    grantedBy: string
  ): Promise<boolean> {
    try {
      const levelPermissions = {
        read: [`${secretaria}.read`],
        write: [`${secretaria}.read`, `${secretaria}.write`],
        admin: [`${secretaria}.read`, `${secretaria}.write`, `${secretaria}.admin`]
      };

      const permissions = levelPermissions[level];

      for (const permissionCode of permissions) {
        await this.grantPermissionToUser(userId, permissionCode, grantedBy);
      }

      return true;
    } catch (error) {
      console.error('❌ [PERMISSION] Erro ao configurar secretaria:', error);
      return false;
    }
  }

  /**
   * Conceder permissão específica a usuário
   */
  static async grantPermissionToUser(userId: string, permissionCode: string, grantedBy: string): Promise<boolean> {
    try {
      // Buscar permissão
      const permission = await prisma.permission.findUnique({
        where: { code: permissionCode }
      });

      if (!permission) {
        console.error(`❌ [PERMISSION] Permissão não encontrada: ${permissionCode}`);
        return false;
      }

      // Verificar se já existe
      const existing = await prisma.userPermission.findUnique({
        where: {
          userId_permissionId: {
            userId: userId,
            permissionId: permission.id
          }
        }
      });

      if (existing) return true;

      // Criar permissão
      await prisma.userPermission.create({
        data: {
          userId: userId,
          permissionId: permission.id,
          grantedBy: grantedBy
        }
      });

      return true;
    } catch (error) {
      console.error('❌ [PERMISSION] Erro ao conceder permissão:', error);
      return false;
    }
  }

  /**
   * Revogar permissão de usuário
   */
  static async revokePermissionFromUser(userId: string, permissionCode: string, revokedBy: string): Promise<boolean> {
    try {
      const permission = await prisma.permission.findUnique({
        where: { code: permissionCode }
      });

      if (!permission) return false;

      await prisma.userPermission.delete({
        where: {
          userId_permissionId: {
            userId: userId,
            permissionId: permission.id
          }
        }
      });

      return true;
    } catch (error) {
      console.error('❌ [PERMISSION] Erro ao revogar permissão:', error);
      return false;
    }
  }

  // ====================================================================
  // SYNC OPERATIONS
  // ====================================================================

  /**
   * Sincronizar permissões do código com banco
   */
  static async syncPermissions(): Promise<void> {
    try {
      console.log('🔄 Sincronizando permissões com banco...');

      for (const [code, permission] of Object.entries(PERMISSIONS)) {
        await prisma.permission.upsert({
          where: { code },
          update: {
            resource: permission.resource,
            action: permission.action,
            description: permission.description
          },
          create: {
            code: permission.code,
            resource: permission.resource,
            action: permission.action,
            description: permission.description
          }
        });
      }

      console.log(`✅ ${Object.keys(PERMISSIONS).length} permissões sincronizadas`);
    } catch (error) {
      console.error('❌ [PERMISSION] Erro ao sincronizar:', error);
      throw error;
    }
  }

  /**
   * Limpar permissões órfãs
   */
  static async cleanupOrphanedPermissions(): Promise<void> {
    try {
      const validCodes = Object.keys(PERMISSIONS);

      const deleted = await prisma.permission.deleteMany({
        where: {
          code: {
            notIn: validCodes
          }
        }
      });

      if (deleted.count > 0) {
        console.log(`🧹 ${deleted.count} permissões órfãs removidas`);
      }
    } catch (error) {
      console.error('❌ [PERMISSION] Erro ao limpar órfãs:', error);
    }
  }
}

export default PermissionService;