// ====================================================================
// 🛡️ PERMISSION MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo de permissões granulares
// RBAC (Role-Based Access Control) completo
// Migrado para Prisma ORM
// ====================================================================

import { prisma } from '../database/prisma.js';
import { UserRole } from './User.js';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

export interface Permission {
  id: number;
  code: string;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
}

export interface UserPermission {
  id: number;
  user_id: string;
  permissionId: number;
  grantedBy?: string;
  created_at: string;
}

export interface PermissionWithDetails extends Permission {
  grantedBy?: string;
  permissionGrantedAt?: string;
}

export interface CreatePermissionData {
  code: string;
  resource: string;
  action: string;
  description?: string;
}

// ====================================================================
// PERMISSÕES PADRÃO POR ROLE
// ====================================================================

export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: [
    { id: 1, code: 'read_public', resource: 'public', action: 'read', description: 'Acesso público', created_at: '' },
    { id: 2, code: 'create_protocol', resource: 'protocols', action: 'create', description: 'Criar protocolos', created_at: '' },
    { id: 3, code: 'read_own_protocols', resource: 'protocols', action: 'read_own', description: 'Ver próprios protocolos', created_at: '' }
  ],
  user: [
    { id: 4, code: 'read_own', resource: 'user_data', action: 'read', description: 'Ler próprios dados', created_at: '' },
    { id: 5, code: 'update_own', resource: 'user_data', action: 'update', description: 'Atualizar próprios dados', created_at: '' },
    { id: 6, code: 'manage_protocols', resource: 'protocols', action: 'manage', description: 'Gerenciar protocolos', created_at: '' },
    { id: 7, code: 'read_department_data', resource: 'department', action: 'read', description: 'Ler dados do departamento', created_at: '' }
  ],
  coordinator: [
    { id: 8, code: 'manage_team', resource: 'team', action: 'manage', description: 'Gerenciar equipe', created_at: '' },
    { id: 9, code: 'view_reports', resource: 'reports', action: 'read', description: 'Ver relatórios', created_at: '' },
    { id: 10, code: 'manage_department_protocols', resource: 'department_protocols', action: 'manage', description: 'Gerenciar protocolos do departamento', created_at: '' }
  ],
  manager: [
    { id: 11, code: 'manage_department', resource: 'department', action: 'manage', description: 'Gerenciar departamento', created_at: '' },
    { id: 12, code: 'manage_reports', resource: 'reports', action: 'manage', description: 'Gerenciar relatórios', created_at: '' },
    { id: 13, code: 'manage_department_users', resource: 'department_users', action: 'manage', description: 'Gerenciar usuários do departamento', created_at: '' },
    { id: 14, code: 'approve_protocols', resource: 'protocols', action: 'approve', description: 'Aprovar protocolos', created_at: '' }
  ],
  admin: [
    { id: 15, code: 'manage_tenant', resource: 'tenant', action: 'manage', description: 'Gerenciar tenant', created_at: '' },
    { id: 16, code: 'manage_users', resource: 'users', action: 'manage', description: 'Gerenciar usuários', created_at: '' },
    { id: 17, code: 'manage_all_departments', resource: 'departments', action: 'manage', description: 'Gerenciar todos departamentos', created_at: '' },
    { id: 18, code: 'manage_municipal_config', resource: 'municipal_config', action: 'manage', description: 'Gerenciar configurações municipais', created_at: '' },
    { id: 19, code: 'view_all_reports', resource: 'reports', action: 'read_all', description: 'Ver todos os relatórios', created_at: '' }
  ],
  super_admin: [
    { id: 20, code: 'all', resource: 'system', action: 'all', description: 'Acesso total ao sistema', created_at: '' },
    { id: 21, code: 'manage_tenants', resource: 'tenants', action: 'manage', description: 'Gerenciar tenants', created_at: '' },
    { id: 22, code: 'system_diagnostics', resource: 'diagnostics', action: 'manage', description: 'Diagnósticos do sistema', created_at: '' },
    { id: 23, code: 'database_access', resource: 'database', action: 'manage', description: 'Acesso ao banco de dados', created_at: '' }
  ]
};

// ====================================================================
// CLASSE DO MODELO PERMISSION
// ====================================================================

export class PermissionModel {

  // ================================================================
  // CRIAÇÃO DE PERMISSÃO
  // ================================================================

  static async create(permissionData: CreatePermissionData): Promise<Permission> {
    // Verificar se código já existe
    const existing = await this.findByCode(permissionData.code);
    if (existing) {
      throw new Error('Código de permissão já existe');
    }

    const permission = await prisma.permission.create({
      data: {
        code: permissionData.code,
        resource: permissionData.resource,
        action: permissionData.action,
        description: permissionData.description
      }
    });

    return {
      id: permission.id,
      code: permission.code,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || undefined,
      created_at: permission.createdAt?.toISOString() || new Date().toISOString()
    };
  }

  // ================================================================
  // BUSCA DE PERMISSÕES
  // ================================================================

  static async findById(id: number): Promise<Permission | null> {
    const permission = await prisma.permission.findUnique({
      where: { id }
    });

    if (!permission) return null;

    return {
      id: permission.id,
      code: permission.code,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || undefined,
      created_at: permission.createdAt?.toISOString() || new Date().toISOString()
    };
  }

  static async findByCode(code: string): Promise<Permission | null> {
    const permission = await prisma.permission.findUnique({
      where: { code }
    });

    if (!permission) return null;

    return {
      id: permission.id,
      code: permission.code,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || undefined,
      created_at: permission.createdAt?.toISOString() || new Date().toISOString()
    };
  }

  static async findByResource(resource: string): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      where: { resource },
      orderBy: { action: 'asc' }
    });

    return permissions.map(permission => ({
      id: permission.id,
      code: permission.code,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || undefined,
      created_at: permission.createdAt?.toISOString() || new Date().toISOString()
    }));
  }

  static async list(): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    });

    return permissions.map(permission => ({
      id: permission.id,
      code: permission.code,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || undefined,
      created_at: permission.createdAt?.toISOString() || new Date().toISOString()
    }));
  }

  // ================================================================
  // PERMISSÕES DO USUÁRIO
  // ================================================================

  static async getUserPermissions(user_id: string): Promise<PermissionWithDetails[]> {
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId: user_id },
      include: {
        permission: true
      },
      orderBy: [
        { permission: { resource: 'asc' } },
        { permission: { action: 'asc' } }
      ]
    });

    return userPermissions.map(up => ({
      id: up.permission.id,
      code: up.permission.code,
      resource: up.permission.resource,
      action: up.permission.action,
      description: up.permission.description || undefined,
      created_at: up.permission.createdAt?.toISOString() || new Date().toISOString(),
      granted_by: up.grantedBy || undefined,
      permission_granted_at: up.createdAt?.toISOString() || new Date().toISOString()
    }));
  }

  static async hasPermission(user_id: string, permissionCode: string): Promise<boolean> {
    // Super admin sempre tem permissão
    const userRole = await this.getUserRole(user_id);
    if (userRole === 'super_admin') {
      return true;
    }

    // Verificar permissão direta
    const userPermission = await prisma.userPermission.findFirst({
      where: {
        userId: user_id,
        permission: {
          code: permissionCode
        }
      }
    });

    if (userPermission) {
      return true;
    }

    // Verificar permissões padrão por role
    if (userRole) {
      const rolePermissions = DEFAULT_PERMISSIONS[userRole] || [];
      return rolePermissions.some(p => p.code === permissionCode);
    }

    return false;
  }

  static async hasResource(user_id: string, resource: string, action: string): Promise<boolean> {
    const permissionCode = `${action}_${resource}`;
    return await this.hasPermission(user_id, permissionCode);
  }

  // ================================================================
  // CONCESSÃO E REVOGAÇÃO DE PERMISSÕES
  // ================================================================

  static async grantPermission(
    user_id: string,
    permissionId: number,
    grantedBy?: string
  ): Promise<void> {
    // Verificar se permissão existe
    const permission = await this.findById(permissionId);
    if (!permission) {
      throw new Error('Permissão não encontrada');
    }

    // Verificar se já foi concedida
    const existing = await this.getUserPermissionRecord(user_id, permissionId);
    if (existing) {
      return; // Já concedida
    }

    await prisma.userPermission.create({
      data: {
        userId: user_id,
        permissionId,
        grantedBy
      }
    });
  }

  static async grantPermissionByCode(
    user_id: string,
    permissionCode: string,
    grantedBy?: string
  ): Promise<void> {
    const permission = await this.findByCode(permissionCode);
    if (!permission) {
      throw new Error('Permissão não encontrada');
    }

    await this.grantPermission(user_id, permission.id, grantedBy);
  }

  static async revokePermission(user_id: string, permissionId: number): Promise<void> {
    await prisma.userPermission.deleteMany({
      where: {
        userId: user_id,
        permissionId
      }
    });
  }

  static async revokePermissionByCode(user_id: string, permissionCode: string): Promise<void> {
    const permission = await this.findByCode(permissionCode);
    if (!permission) {
      throw new Error('Permissão não encontrada');
    }

    await this.revokePermission(user_id, permission.id);
  }

  static async revokeAllUserPermissions(user_id: string): Promise<void> {
    await prisma.userPermission.deleteMany({
      where: { userId: user_id }
    });
  }

  // ================================================================
  // PERMISSÕES POR ROLE
  // ================================================================

  static async syncRolePermissions(user_id: string, role: UserRole): Promise<void> {
    // Remover permissões existentes
    await this.revokeAllUserPermissions(user_id);

    // Adicionar permissões padrão da role
    const rolePermissions = this.getRolePermissions(role);

    for (const permission of rolePermissions) {
      // Garantir que a permissão existe no banco
      let dbPermission = await this.findByCode(permission.code);

      if (!dbPermission) {
        dbPermission = await this.create({
          code: permission.code,
          resource: permission.resource,
          action: permission.action,
          description: permission.description
        });
      }

      await this.grantPermission(user_id, dbPermission.id);
    }
  }

  static getRolePermissions(role: UserRole): Permission[] {
    const permissions: Permission[] = [];

    // Adicionar permissões hierárquicas (roles inferiores incluídas)
    const hierarchy: UserRole[] = ['guest', 'user', 'coordinator', 'manager', 'admin', 'super_admin'];
    const userLevel = hierarchy.indexOf(role);

    for (let i = 0; i <= userLevel; i++) {
      const levelRole = hierarchy[i];
      const levelPermissions = DEFAULT_PERMISSIONS[levelRole] || [];
      permissions.push(...levelPermissions);
    }

    // Remover duplicatas
    const uniquePermissions = permissions.filter(
      (permission, index, self) =>
        self.findIndex(p => p.code === permission.code) === index
    );

    return uniquePermissions;
  }

  // ================================================================
  // MIDDLEWARE DE VERIFICAÇÃO
  // ================================================================

  static createPermissionChecker(permissionCode: string) {
    return async (req: any, res: any, next: any) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const hasPermission = await this.hasPermission(req.user.id, permissionCode);
      if (!hasPermission) {
        return res.status(403).json({
          error: 'Permissão insuficiente',
          required: permissionCode
        });
      }

      next();
    };
  }

  static createResourceChecker(resource: string, action: string) {
    return async (req: any, res: any, next: any) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const hasPermission = await this.hasResource(req.user.id, resource, action);
      if (!hasPermission) {
        return res.status(403).json({
          error: 'Permissão insuficiente',
          required: `${action}_${resource}`
        });
      }

      next();
    };
  }

  // ================================================================
  // UTILITÁRIOS PRIVADOS
  // ================================================================

  private static async getUserPermissionRecord(
    user_id: string,
    permissionId: number
  ): Promise<UserPermission | null> {
    const record = await prisma.userPermission.findFirst({
      where: {
        userId: user_id,
        permissionId
      }
    });

    if (!record) return null;

    return {
      id: record.id,
      user_id: record.userId,
      permissionId: record.permissionId,
      grantedBy: record.grantedBy || undefined,
      created_at: record.createdAt?.toISOString() || new Date().toISOString()
    };
  }

  private static async getUserRole(user_id: string): Promise<UserRole | null> {
    const user = await prisma.user.findUnique({
      where: { id: user_id },
      select: { role: true }
    });

    return user?.role as UserRole || null;
  }

  // ================================================================
  // INICIALIZAÇÃO DAS PERMISSÕES
  // ================================================================

  static async initializePermissions(): Promise<void> {
    console.log('🔄 Inicializando permissões padrão...');

    const allPermissions = new Set<string>();

    // Coletar todas as permissões únicas
    Object.values(DEFAULT_PERMISSIONS).forEach(rolePermissions => {
      rolePermissions.forEach(permission => {
        allPermissions.add(permission.code);
      });
    });

    // Criar permissões que não existem
    for (const permissionCode of allPermissions) {
      const existing = await this.findByCode(permissionCode);

      if (!existing) {
        // Encontrar a permissão nos defaults para obter detalhes
        let permissionData: Permission | null = null;

        for (const rolePermissions of Object.values(DEFAULT_PERMISSIONS)) {
          permissionData = rolePermissions.find(p => p.code === permissionCode) || null;
          if (permissionData) break;
        }

        if (permissionData) {
          await this.create({
            code: permissionData.code,
            resource: permissionData.resource,
            action: permissionData.action,
            description: permissionData.description
          });
        }
      }
    }

    console.log(`✅ ${allPermissions.size} permissões inicializadas`);
  }
}

export default PermissionModel;