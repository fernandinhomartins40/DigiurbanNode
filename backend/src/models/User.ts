// ====================================================================
// 👤 USER MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo de usuário com validações e métodos seguros
// Hierarquia: guest → user → coordinator → manager → admin → super_admin
// Migrado para Knex.js Query Builder
// ====================================================================

import { getDatabase } from '../database/connection.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

export type UserRole = 'guest' | 'user' | 'coordinator' | 'manager' | 'admin' | 'super_admin';
export type UserStatus = 'ativo' | 'inativo' | 'pendente' | 'bloqueado';

export interface User {
  id: string;
  tenant_id?: string;
  nome_completo: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  ultimo_login?: string;
  failed_login_attempts: number;
  locked_until?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  tenant_id?: string;
  nome_completo: string;
  email: string;
  password: string;
  role?: UserRole;
  status?: UserStatus;
  avatar_url?: string;
}

export interface UpdateUserData {
  nome_completo?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  avatar_url?: string;
  tenant_id?: string;
}

export interface UserProfile extends Omit<User, 'password_hash'> {
  tenant_name?: string;
  tenant_cidade?: string;
  tenant_estado?: string;
  tenant_plano?: string;
  tenant_status?: string;
}

export interface UserListOptions {
  limit?: number;
  offset?: number;
  status?: UserStatus;
  role?: UserRole;
  tenant_id?: string;
  search?: string;
  sortBy?: 'created_at' | 'nome_completo' | 'ultimo_login';
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  blocked: number;
  byRole: Record<UserRole, number>;
  recentLogins: number;
}

// ====================================================================
// HIERARQUIA DE USUÁRIOS
// ====================================================================

export const USER_HIERARCHY: Record<UserRole, number> = {
  'guest': 0,
  'user': 1,
  'coordinator': 2,
  'manager': 3,
  'admin': 4,
  'super_admin': 5
};

// ====================================================================
// CLASSE DO MODELO USER
// ====================================================================

export class UserModel {
  
  // Propriedade estática para hierarquia
  static USER_HIERARCHY = USER_HIERARCHY;
  
  // ================================================================
  // CRIAÇÃO DE USUÁRIO
  // ================================================================
  
  static async create(userData: CreateUserData): Promise<User> {
    const startTime = Date.now();
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    try {
      // Validar dados
      this.validateUserData(userData);
      
      // Verificar se email já existe
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        StructuredLogger.business('User creation failed - email exists', {
          action: 'user_create',
            tenantId: userData.tenant_id,
          metadata: { email: userData.email.substring(0, 3) + '***' }
        });
        throw new Error('Email já está em uso');
      }
    
      const db = getDatabase();
      
      await db('users').insert({
        id,
        tenant_id: userData.tenant_id || null,
        nome_completo: userData.nome_completo,
        email: userData.email.toLowerCase(),
        password_hash: hashedPassword,
        role: userData.role || 'user',
        status: userData.status || 'pendente',
        avatar_url: userData.avatar_url || null
      });
      
      const user = await this.findById(id);
      if (!user) {
        throw new Error('Erro ao criar usuário');
      }
      
      // Log de sucesso
      const duration = Date.now() - startTime;
      StructuredLogger.business('User created successfully', {
        action: 'user_create',
        tenantId: userData.tenant_id,
        operation: 'create',
        metadata: { role: userData.role || 'user', status: userData.status || 'pendente' }
      });
      
      StructuredLogger.performance('User creation', {
        action: 'user_create',
        duration,
        threshold: 1000
      });
      
      return user;
    } catch (error) {
      StructuredLogger.error('User creation failed', error, {
        action: 'user_create',
        tenantId: userData.tenant_id,
        errorType: 'database_error'
      });
      throw error;
    }
  }
  
  // ================================================================
  // BUSCA DE USUÁRIOS
  // ================================================================
  
  static async findById(id: string): Promise<User | null> {
    try {
      const db = getDatabase();
      const user = await db('users')
        .where('id', id)
        .first() as User | undefined;
      return user || null;
    } catch (error) {
      StructuredLogger.error('Error finding user by ID', error, {
        action: 'user_find_by_id',
        errorType: 'database_error'
      });
      throw error;
    }
  }
  
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const db = getDatabase();
      const user = await db('users')
        .where('email', email.toLowerCase())
        .first() as User | undefined;
      return user || null;
    } catch (error) {
      StructuredLogger.error('Error finding user by email', error, {
        action: 'user_find_by_email',
        metadata: { email: email.substring(0, 3) + '***' },
        errorType: 'database_error'
      });
      throw error;
    }
  }
  
  static async findByTenant(tenantId: string): Promise<User[]> {
    const db = getDatabase();
    return await db('users')
      .where('tenant_id', tenantId)
      .orderBy('created_at', 'desc') as User[];
  }
  
  static async findByRole(role: UserRole): Promise<User[]> {
    const db = getDatabase();
    return await db('users')
      .where('role', role)
      .orderBy('created_at', 'desc') as User[];
  }
  
  // ================================================================
  // BUSCA COM PERFIL COMPLETO
  // ================================================================
  
  static async getProfile(id: string): Promise<UserProfile | null> {
    const db = getDatabase();
    const user = await db('users as u')
      .leftJoin('tenants as t', 'u.tenant_id', 't.id')
      .select(
        'u.*',
        't.nome as tenant_name',
        't.cidade as tenant_cidade',
        't.estado as tenant_estado',
        't.plano as tenant_plano',
        't.status as tenant_status'
      )
      .where('u.id', id)
      .first() as any;
    
    if (!user) return null;
    
    // Remove password_hash e retorna UserProfile
    const { password_hash, ...profile } = user;
    return profile as UserProfile;
  }
  
  static async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const db = getDatabase();
    const user = await db('users as u')
      .leftJoin('tenants as t', 'u.tenant_id', 't.id')
      .select(
        'u.*',
        't.nome as tenant_name',
        't.cidade as tenant_cidade',
        't.estado as tenant_estado',
        't.plano as tenant_plano',
        't.status as tenant_status'
      )
      .where('u.email', email.toLowerCase())
      .first() as any;
    
    if (!user) return null;
    
    // Remove password_hash e retorna UserProfile
    const { password_hash, ...profile } = user;
    return profile as UserProfile;
  }
  
  // ================================================================
  // ATUALIZAÇÃO DE USUÁRIO
  // ================================================================
  
  static async update(id: string, updates: UpdateUserData): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    // Verificar se novo email já existe
    if (updates.email) {
      const existingUser = await this.findByEmail(updates.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email já está em uso');
      }
    }
    
    // Verificar se há atualizações
    const hasUpdates = Object.keys(updates).length > 0;
    if (!hasUpdates) {
      return user; // Nenhuma atualização
    }
    
    const db = getDatabase();
    const updateData: any = {};
    
    if (updates.nome_completo) updateData.nome_completo = updates.nome_completo;
    if (updates.email) updateData.email = updates.email.toLowerCase();
    if (updates.role) updateData.role = updates.role;
    if (updates.status) updateData.status = updates.status;
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
    if (updates.tenant_id !== undefined) updateData.tenant_id = updates.tenant_id;
    
    updateData.updated_at = db.fn.now();
    
    await db('users')
      .where('id', id)
      .update(updateData);
    
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('Erro ao atualizar usuário');
    }
    
    return updatedUser;
  }
  
  // ================================================================
  // AUTENTICAÇÃO
  // ================================================================
  
  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password_hash);
  }
  
  static async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const db = getDatabase();
    await db('users')
      .where('id', id)
      .update({
        password_hash: hashedPassword,
        updated_at: db.fn.now()
      });
  }
  
  static async updateLastLogin(id: string): Promise<void> {
    const db = getDatabase();
    await db('users')
      .where('id', id)
      .update({
        ultimo_login: db.fn.now()
      });
  }
  
  // ================================================================
  // CONTROLE DE TENTATIVAS DE LOGIN
  // ================================================================
  
  static async incrementFailedAttempts(id: string): Promise<void> {
    const db = getDatabase();
    await db.raw(`
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1,
          locked_until = CASE 
            WHEN failed_login_attempts >= 4 THEN datetime('now', '+15 minutes')
            ELSE locked_until
          END
      WHERE id = ?
    `, [id]);
  }
  
  static async resetFailedAttempts(id: string): Promise<void> {
    const db = getDatabase();
    await db('users')
      .where('id', id)
      .update({
        failed_login_attempts: 0,
        locked_until: null
      });
  }
  
  static async isLocked(user: User): Promise<boolean> {
    if (!user.locked_until) return false;
    
    const now = new Date().toISOString();
    return user.locked_until > now;
  }
  
  // ================================================================
  // VERIFICAÇÃO DE EMAIL
  // ================================================================
  
  static async markEmailAsVerified(id: string): Promise<void> {
    const db = getDatabase();
    await db('users')
      .where('id', id)
      .update({
        email_verified: true
      });
  }
  
  // ================================================================
  // SOFT DELETE
  // ================================================================
  
  static async softDelete(id: string): Promise<void> {
    const db = getDatabase();
    await db('users')
      .where('id', id)
      .update({
        status: 'inativo',
        updated_at: db.fn.now()
      });
  }
  
  static async hardDelete(id: string): Promise<void> {
    const db = getDatabase();
    await db('users')
      .where('id', id)
      .del();
  }
  
  // ================================================================
  // LISTAGEM E PAGINAÇÃO
  // ================================================================
  
  static async list(options: {
    limit?: number;
    offset?: number;
    role?: UserRole;
    status?: UserStatus;
    tenant_id?: string;
  } = {}): Promise<User[]> {
    const db = getDatabase();
    let query = db('users').select('*');
    
    if (options.role) {
      query = query.where('role', options.role);
    }
    
    if (options.status) {
      query = query.where('status', options.status);
    }
    
    if (options.tenant_id) {
      query = query.where('tenant_id', options.tenant_id);
    }
    
    query = query.orderBy('created_at', 'desc');
    
    if (options.limit) {
      query = query.limit(options.limit);
      
      if (options.offset) {
        query = query.offset(options.offset);
      }
    }
    
    return await query as User[];
  }
  
  static async count(filters: {
    role?: UserRole;
    status?: UserStatus;
    tenant_id?: string;
  } = {}): Promise<number> {
    const db = getDatabase();
    let query = db('users');
    
    if (filters.role) {
      query = query.where('role', filters.role);
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.tenant_id) {
      query = query.where('tenant_id', filters.tenant_id);
    }
    
    const result = await query.count('* as total').first() as { total: number };
    return result.total;
  }
  
  // ================================================================
  // VALIDAÇÕES
  // ================================================================
  
  private static validateUserData(userData: CreateUserData): void {
    if (!userData.nome_completo || userData.nome_completo.trim().length < 2) {
      throw new Error('Nome completo é obrigatório (mínimo 2 caracteres)');
    }
    
    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error('Email válido é obrigatório');
    }
    
    if (!userData.password || userData.password.length < 8) {
      throw new Error('Senha deve ter no mínimo 8 caracteres');
    }
  }
  
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // ================================================================
  // MÉTODOS ADICIONAIS REQUERIDOS
  // ================================================================
  
  static async getUsers(options: UserListOptions = {}): Promise<{ users: User[], total: number }> {
    const users = await this.list({
      limit: options.limit,
      offset: options.offset,
      role: options.role,
      status: options.status,
      tenant_id: options.tenant_id
    });
    
    const total = await this.count({
      role: options.role,
      status: options.status,
      tenant_id: options.tenant_id
    });
    
    return { users, total };
  }
  
  static async updateUser(id: string, updates: UpdateUserData): Promise<User> {
    return this.update(id, updates);
  }
  
  static async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    return this.update(id, { status });
  }
  
  static async deleteUser(id: string): Promise<void> {
    await this.hardDelete(id);
  }
  
  static async resetPassword(id: string, newPassword: string): Promise<void> {
    await this.updatePassword(id, newPassword);
  }
  
  static async createProfile(userData: CreateUserData): Promise<UserProfile | null> {
    const user = await this.create(userData);
    return this.getProfile(user.id);
  }
  
  static async markOrphanUsers(tenantId: string): Promise<void> {
    const db = getDatabase();
    await db('users')
      .where('tenant_id', tenantId)
      .update({
        tenant_id: null,
        status: 'inativo'
      });
  }

  // ================================================================
  // MÉTODOS DE CONVENIÊNCIA
  // ================================================================
  
  static sanitizeUser(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
  
  static hasPermissionLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return USER_HIERARCHY[userRole] >= USER_HIERARCHY[requiredRole];
  }
  
  static isSuperAdmin(user: User): boolean {
    return user.role === 'super_admin';
  }
  
  static isAdmin(user: User): boolean {
    return ['admin', 'super_admin'].includes(user.role);
  }
  
  static isManager(user: User): boolean {
    return ['manager', 'admin', 'super_admin'].includes(user.role);
  }

  /**
   * Obter estatísticas básicas de usuários para métricas SaaS
   */
  static async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    try {
      const db = getDatabase();
      const result = await db('users')
        .select(
          db.raw('COUNT(*) as total'),
          db.raw('SUM(CASE WHEN status = "ativo" THEN 1 ELSE 0 END) as active'),
          db.raw('SUM(CASE WHEN status != "ativo" THEN 1 ELSE 0 END) as inactive')
        )
        .first();

      const stats = result as any;
      return {
        total: Number(stats?.total) || 0,
        active: Number(stats?.active) || 0,
        inactive: Number(stats?.inactive) || 0
      };
    } catch (error) {
      StructuredLogger.error('Erro ao obter estatísticas de usuários', error as Error);
      return { total: 0, active: 0, inactive: 0 };
    }
  }
}

export default UserModel;