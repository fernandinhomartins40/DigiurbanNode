// ====================================================================
// 🛡️ PERMISSION MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo de permissões granulares
// RBAC (Role-Based Access Control) completo
// Migrado para Knex.js Query Builder
// ====================================================================

import { getDatabase } from '../database/connection.js';
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
  permission_id: number;
  granted_by?: string;
  created_at: string;
}

export interface PermissionWithDetails extends Permission {
  granted_by?: string;
  permission_granted_at?: string;
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
    
    const db = getDatabase();
    
    const [id] = await db('permissions').insert({
      code: permissionData.code,
      resource: permissionData.resource,
      action: permissionData.action,
      description: permissionData.description || null
    });
    
    const permission = await this.findById(Number(id));
    if (!permission) {
      throw new Error('Erro ao criar permissão');
    }
    
    return permission;
  }
  
  // ================================================================
  // BUSCA DE PERMISSÕES
  // ================================================================
  
  static async findById(id: number): Promise<Permission | null> {
    const db = getDatabase();
    const permission = await db('permissions')
      .where('id', id)
      .first() as Permission | undefined;
    return permission || null;
  }
  
  static async findByCode(code: string): Promise<Permission | null> {
    const db = getDatabase();
    const permission = await db('permissions')
      .where('code', code)
      .first() as Permission | undefined;
    return permission || null;
  }
  
  static async findByResource(resource: string): Promise<Permission[]> {
    const db = getDatabase();
    return await db('permissions')
      .where('resource', resource)
      .orderBy('action') as Permission[];
  }
  
  static async list(): Promise<Permission[]> {
    const db = getDatabase();
    return await db('permissions')
      .orderBy('resource')
      .orderBy('action') as Permission[];
  }
  
  // ================================================================
  // PERMISSÕES DO USUÁRIO
  // ================================================================
  
  static async getUserPermissions(userId: string): Promise<PermissionWithDetails[]> {
    const db = getDatabase();
    return await db('permissions as p')
      .join('user_permissions as up', 'p.id', 'up.permission_id')
      .select(
        'p.*',
        'up.granted_by',
        'up.created_at as permission_granted_at'
      )
      .where('up.user_id', userId)
      .orderBy('p.resource')
      .orderBy('p.action') as PermissionWithDetails[];
  }
  
  static async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    // Super admin sempre tem permissão
    const userRole = await this.getUserRole(userId);
    if (userRole === 'super_admin') {
      return true;
    }
    
    // Verificar permissão direta
    const db = getDatabase();
    const result = await db('user_permissions as up')
      .join('permissions as p', 'up.permission_id', 'p.id')
      .where('up.user_id', userId)
      .where('p.code', permissionCode)
      .first();
    if (result) {
      return true;
    }
    
    // Verificar permissões padrão por role
    if (userRole) {
      const rolePermissions = DEFAULT_PERMISSIONS[userRole] || [];
      return rolePermissions.some(p => p.code === permissionCode);
    }
    
    return false;
  }
  
  static async hasResource(userId: string, resource: string, action: string): Promise<boolean> {
    const permissionCode = `${action}_${resource}`;
    return await this.hasPermission(userId, permissionCode);
  }
  
  // ================================================================
  // CONCESSÃO E REVOGAÇÃO DE PERMISSÕES
  // ================================================================
  
  static async grantPermission(
    userId: string,
    permissionId: number,
    grantedBy?: string
  ): Promise<void> {
    // Verificar se permissão existe
    const permission = await this.findById(permissionId);
    if (!permission) {
      throw new Error('Permissão não encontrada');
    }
    
    // Verificar se já foi concedida
    const existing = await this.getUserPermissionRecord(userId, permissionId);
    if (existing) {
      return; // Já concedida
    }
    
    const db = getDatabase();
    
    await db('user_permissions').insert({
      user_id: userId,
      permission_id: permissionId,
      granted_by: grantedBy || null
    });
  }
  
  static async grantPermissionByCode(
    userId: string,
    permissionCode: string,
    grantedBy?: string
  ): Promise<void> {
    const permission = await this.findByCode(permissionCode);
    if (!permission) {
      throw new Error('Permissão não encontrada');
    }
    
    await this.grantPermission(userId, permission.id, grantedBy);
  }
  
  static async revokePermission(userId: string, permissionId: number): Promise<void> {
    const db = getDatabase();
    await db('user_permissions')
      .where('user_id', userId)
      .where('permission_id', permissionId)
      .del();
  }
  
  static async revokePermissionByCode(userId: string, permissionCode: string): Promise<void> {
    const permission = await this.findByCode(permissionCode);
    if (!permission) {
      throw new Error('Permissão não encontrada');
    }
    
    await this.revokePermission(userId, permission.id);
  }
  
  static async revokeAllUserPermissions(userId: string): Promise<void> {
    const db = getDatabase();
    await db('user_permissions')
      .where('user_id', userId)
      .del();
  }
  
  // ================================================================
  // PERMISSÕES POR ROLE
  // ================================================================
  
  static async syncRolePermissions(userId: string, role: UserRole): Promise<void> {
    // Remover permissões existentes
    await this.revokeAllUserPermissions(userId);
    
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
      
      await this.grantPermission(userId, dbPermission.id);
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
    userId: string,
    permissionId: number
  ): Promise<UserPermission | null> {
    const db = getDatabase();
    const record = await db('user_permissions')
      .where('user_id', userId)
      .where('permission_id', permissionId)
      .first() as UserPermission | undefined;
    return record || null;
  }
  
  private static async getUserRole(userId: string): Promise<UserRole | null> {
    const db = getDatabase();
    const result = await db('users')
      .select('role')
      .where('id', userId)
      .first() as { role: UserRole } | undefined;
    return result?.role || null;
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