// ====================================================================
// 👤 USER MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo de usuário com validações e métodos seguros
// Hierarquia: guest → user → coordinator → manager → admin → super_admin
// ====================================================================

import { query, queryOne, execute } from '../database/connection.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Validar dados
    this.validateUserData(userData);
    
    // Verificar se email já existe
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }
    
    const sql = `
      INSERT INTO users (
        id, tenant_id, nome_completo, email, password_hash, 
        role, status, avatar_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      userData.tenant_id || null,
      userData.nome_completo,
      userData.email.toLowerCase(),
      hashedPassword,
      userData.role || 'user',
      userData.status || 'pendente',
      userData.avatar_url || null
    ];
    
    await execute(sql, params);
    
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Erro ao criar usuário');
    }
    
    return user;
  }
  
  // ================================================================
  // BUSCA DE USUÁRIOS
  // ================================================================
  
  static async findById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const user = await queryOne(sql, [id]) as User;
    return user || null;
  }
  
  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const user = await queryOne(sql, [email.toLowerCase()]) as User;
    return user || null;
  }
  
  static async findByTenant(tenantId: string): Promise<User[]> {
    const sql = 'SELECT * FROM users WHERE tenant_id = ? ORDER BY created_at DESC';
    return await query(sql, [tenantId]) as User[];
  }
  
  static async findByRole(role: UserRole): Promise<User[]> {
    const sql = 'SELECT * FROM users WHERE role = ? ORDER BY created_at DESC';
    return await query(sql, [role]) as User[];
  }
  
  // ================================================================
  // BUSCA COM PERFIL COMPLETO
  // ================================================================
  
  static async getProfile(id: string): Promise<UserProfile | null> {
    const sql = `
      SELECT 
        u.*,
        t.nome as tenant_name,
        t.cidade as tenant_cidade,
        t.estado as tenant_estado,
        t.plano as tenant_plano,
        t.status as tenant_status
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = ?
    `;
    const user = await queryOne(sql, [id]) as any;
    
    if (!user) return null;
    
    // Remove password_hash e retorna UserProfile
    const { password_hash, ...profile } = user;
    return profile as UserProfile;
  }
  
  static async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const sql = `
      SELECT 
        u.*,
        t.nome as tenant_name,
        t.cidade as tenant_cidade,
        t.estado as tenant_estado,
        t.plano as tenant_plano,
        t.status as tenant_status
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.email = ?
    `;
    const user = await queryOne(sql, [email.toLowerCase()]) as any;
    
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
    
    // Construir query dinâmica
    const updateFields: string[] = [];
    const params: any[] = [];
    
    if (updates.nome_completo) {
      updateFields.push('nome_completo = ?');
      params.push(updates.nome_completo);
    }
    
    if (updates.email) {
      // Verificar se novo email já existe
      const existingUser = await this.findByEmail(updates.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email já está em uso');
      }
      updateFields.push('email = ?');
      params.push(updates.email.toLowerCase());
    }
    
    if (updates.role) {
      updateFields.push('role = ?');
      params.push(updates.role);
    }
    
    if (updates.status) {
      updateFields.push('status = ?');
      params.push(updates.status);
    }
    
    if (updates.avatar_url !== undefined) {
      updateFields.push('avatar_url = ?');
      params.push(updates.avatar_url);
    }
    
    if (updates.tenant_id !== undefined) {
      updateFields.push('tenant_id = ?');
      params.push(updates.tenant_id);
    }
    
    if (updateFields.length === 0) {
      return user; // Nenhuma atualização
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await execute(sql, params);
    
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
    const sql = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await execute(sql, [hashedPassword, id]);
  }
  
  static async updateLastLogin(id: string): Promise<void> {
    const sql = 'UPDATE users SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?';
    await execute(sql, [id]);
  }
  
  // ================================================================
  // CONTROLE DE TENTATIVAS DE LOGIN
  // ================================================================
  
  static async incrementFailedAttempts(id: string): Promise<void> {
    const sql = `
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1,
          locked_until = CASE 
            WHEN failed_login_attempts >= 4 THEN datetime('now', '+15 minutes')
            ELSE locked_until
          END
      WHERE id = ?
    `;
    await execute(sql, [id]);
  }
  
  static async resetFailedAttempts(id: string): Promise<void> {
    const sql = 'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?';
    await execute(sql, [id]);
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
    const sql = 'UPDATE users SET email_verified = TRUE WHERE id = ?';
    await execute(sql, [id]);
  }
  
  // ================================================================
  // SOFT DELETE
  // ================================================================
  
  static async softDelete(id: string): Promise<void> {
    const sql = 'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await execute(sql, ['inativo', id]);
  }
  
  static async hardDelete(id: string): Promise<void> {
    const sql = 'DELETE FROM users WHERE id = ?';
    await execute(sql, [id]);
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
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];
    
    if (options.role) {
      sql += ' AND role = ?';
      params.push(options.role);
    }
    
    if (options.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }
    
    if (options.tenant_id) {
      sql += ' AND tenant_id = ?';
      params.push(options.tenant_id);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
      
      if (options.offset) {
        sql += ' OFFSET ?';
        params.push(options.offset);
      }
    }
    
    return await query(sql, params) as User[];
  }
  
  static async count(filters: {
    role?: UserRole;
    status?: UserStatus;
    tenant_id?: string;
  } = {}): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
    const params: any[] = [];
    
    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.tenant_id) {
      sql += ' AND tenant_id = ?';
      params.push(filters.tenant_id);
    }
    
    const result = await queryOne(sql, params) as { count: number };
    return result.count;
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
}

export default UserModel;