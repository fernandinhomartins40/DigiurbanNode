// ====================================================================
// 👤 USER MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo de usuário com validações e métodos seguros
// Hierarquia: guest → user → coordinator → manager → admin → super_admin
// MIGRADO PARA PRISMA ORM
// ====================================================================

import { prisma } from '../database/prisma.js'
import { User, Prisma } from '../database/generated/client/index.js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { StructuredLogger } from '../monitoring/structuredLogger.js'

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

export type UserRole = 'guest' | 'user' | 'coordinator' | 'manager' | 'admin' | 'super_admin'
export type UserStatus = 'ativo' | 'inativo' | 'pendente' | 'bloqueado'

export interface CreateUserData {
  tenantId?: string
  nomeCompleto: string
  email: string
  password: string
  role?: UserRole
  status?: UserStatus
  avatarUrl?: string
}

export interface UpdateUserData {
  nomeCompleto?: string
  email?: string
  role?: UserRole
  status?: UserStatus
  avatarUrl?: string
  tenantId?: string
}

export interface UserProfile extends Omit<User, 'passwordHash'> {
  tenantName?: string
  tenantCidade?: string
  tenantEstado?: string
  tenantPlano?: string
  tenantStatus?: string
}

export interface UserListOptions {
  limit?: number
  offset?: number
  status?: UserStatus
  role?: UserRole
  tenantId?: string
  search?: string
  sortBy?: 'createdAt' | 'nomeCompleto' | 'ultimoLogin'
  sortOrder?: 'asc' | 'desc'
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  pending: number
  blocked: number
  byRole: Record<UserRole, number>
  recentLogins: number
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
}

// ====================================================================
// CLASSE DO MODELO USER (PRISMA)
// ====================================================================

export class UserModel {

  // Propriedade estática para hierarquia
  static USER_HIERARCHY = USER_HIERARCHY

  // ================================================================
  // CRIAÇÃO DE USUÁRIO
  // ================================================================

  static async create(userData: CreateUserData): Promise<User> {
    const startTime = Date.now()
    const id = uuidv4()
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    try {
      // Validar dados
      this.validateUserData(userData)

      // Verificar se email já existe
      const existingUser = await this.findByEmail(userData.email)
      if (existingUser) {
        StructuredLogger.business('User creation failed - email exists', {
          action: 'user_create',
          tenantId: userData.tenantId,
          metadata: { email: userData.email.substring(0, 3) + '***' }
        })
        throw new Error('Email já está em uso')
      }

      const user = await prisma.user.create({
        data: {
          id,
          tenantId: userData.tenantId || null,
          nomeCompleto: userData.nomeCompleto,
          email: userData.email.toLowerCase(),
          passwordHash: hashedPassword,
          role: userData.role || 'user',
          status: userData.status || 'pendente',
          avatarUrl: userData.avatarUrl || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Log de sucesso
      const duration = Date.now() - startTime
      StructuredLogger.business('User created successfully', {
        action: 'user_create',
        tenantId: userData.tenantId,
        operation: 'create',
        metadata: { role: userData.role || 'user', status: userData.status || 'pendente' }
      })

      StructuredLogger.performance('User creation', {
        action: 'user_create',
        duration,
        threshold: 1000
      })

      return user
    } catch (error) {
      StructuredLogger.error('User creation failed', error, {
        action: 'user_create',
        tenantId: userData.tenantId,
        errorType: 'database_error'
      })
      throw error
    }
  }

  // ================================================================
  // BUSCA DE USUÁRIOS
  // ================================================================

  static async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id }
      })
    } catch (error) {
      StructuredLogger.error('Error finding user by ID', error, {
        action: 'user_find_by_id',
        errorType: 'database_error'
      })
      throw error
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })
    } catch (error) {
      StructuredLogger.error('Error finding user by email', error, {
        action: 'user_find_by_email',
        metadata: { email: email.substring(0, 3) + '***' },
        errorType: 'database_error'
      })
      throw error
    }
  }

  static async findByTenant(tenant_id: string): Promise<User[]> {
    return await prisma.user.findMany({
      where: { tenantId: tenant_id },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async findByRole(role: UserRole): Promise<User[]> {
    return await prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' }
    })
  }

  // ================================================================
  // BUSCA COM PERFIL COMPLETO
  // ================================================================

  static async getProfile(id: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { tenant: true }
    })

    if (!user) return null

    // Remove password_hash e retorna UserProfile
    const { passwordHash, ...profile } = user
    return {
      ...profile,
      tenantName: user.tenant?.nome,
      tenantCidade: user.tenant?.cidade,
      tenantEstado: user.tenant?.estado,
      tenantPlano: user.tenant?.plano || undefined,
      tenantStatus: user.tenant?.status || undefined
    } as UserProfile
  }

  static async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { tenant: true }
    })

    if (!user) return null

    // Remove password_hash e retorna UserProfile
    const { passwordHash, ...profile } = user
    return {
      ...profile,
      tenantName: user.tenant?.nome,
      tenantCidade: user.tenant?.cidade,
      tenantEstado: user.tenant?.estado,
      tenantPlano: user.tenant?.plano || undefined,
      tenantStatus: user.tenant?.status || undefined
    } as UserProfile
  }

  // ================================================================
  // ATUALIZAÇÃO DE USUÁRIO
  // ================================================================

  static async update(id: string, updates: UpdateUserData): Promise<User> {
    const user = await this.findById(id)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Verificar se novo email já existe
    if (updates.email) {
      const existingUser = await this.findByEmail(updates.email)
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email já está em uso')
      }
    }

    // Verificar se há atualizações
    const hasUpdates = Object.keys(updates).length > 0
    if (!hasUpdates) {
      return user // Nenhuma atualização
    }

    const updateData: any = {}

    if (updates.nomeCompleto) updateData.nomeCompleto = updates.nomeCompleto
    if (updates.email) updateData.email = updates.email.toLowerCase()
    if (updates.role) updateData.role = updates.role
    if (updates.status) updateData.status = updates.status
    if (updates.avatarUrl !== undefined) updateData.avatarUrl = updates.avatarUrl
    if (updates.tenantId !== undefined) updateData.tenantId = updates.tenantId

    updateData.updatedAt = new Date()

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    })

    return updatedUser
  }

  // ================================================================
  // AUTENTICAÇÃO
  // ================================================================

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.passwordHash)
  }

  static async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
        updatedAt: new Date()
      }
    })
  }

  static async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        ultimoLogin: new Date()
      }
    })
  }

  // ================================================================
  // CONTROLE DE TENTATIVAS DE LOGIN
  // ================================================================

  static async incrementFailedAttempts(id: string): Promise<void> {
    const user = await this.findById(id)
    if (!user) throw new Error('Usuário não encontrado')

    const newAttempts = (user.failedLoginAttempts || 0) + 1
    const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null

    await prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: newAttempts,
        lockedUntil
      }
    })
  }

  static async resetFailedAttempts(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    })
  }

  static async isLocked(user: User): Promise<boolean> {
    if (!user.lockedUntil) return false
    return user.lockedUntil > new Date()
  }

  // ================================================================
  // VERIFICAÇÃO DE EMAIL
  // ================================================================

  static async markEmailAsVerified(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { emailVerified: true }
    })
  }

  // ================================================================
  // SOFT DELETE
  // ================================================================

  static async softDelete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        status: 'inativo',
        updatedAt: new Date()
      }
    })
  }

  static async hardDelete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id }
    })
  }

  // ================================================================
  // LISTAGEM E PAGINAÇÃO
  // ================================================================

  static async list(options: {
    limit?: number
    offset?: number
    role?: UserRole
    status?: UserStatus
    tenantId?: string
  } = {}): Promise<User[]> {
    const where: Prisma.UserWhereInput = {}

    if (options.role) where.role = options.role
    if (options.status) where.status = options.status
    if (options.tenantId) where.tenantId = options.tenantId

    return await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset
    })
  }

  static async count(filters: {
    role?: UserRole
    status?: UserStatus
    tenantId?: string
  } = {}): Promise<number> {
    const where: Prisma.UserWhereInput = {}

    if (filters.role) where.role = filters.role
    if (filters.status) where.status = filters.status
    if (filters.tenantId) where.tenantId = filters.tenantId

    return await prisma.user.count({ where })
  }

  // ================================================================
  // VALIDAÇÕES
  // ================================================================

  private static validateUserData(userData: CreateUserData): void {
    if (!userData.nomeCompleto || userData.nomeCompleto.trim().length < 2) {
      throw new Error('Nome completo é obrigatório (mínimo 2 caracteres)')
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error('Email válido é obrigatório')
    }

    if (!userData.password || userData.password.length < 8) {
      throw new Error('Senha deve ter no mínimo 8 caracteres')
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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
      tenantId: options.tenantId
    })

    const total = await this.count({
      role: options.role,
      status: options.status,
      tenantId: options.tenantId
    })

    return { users, total }
  }

  static async updateUser(id: string, updates: UpdateUserData): Promise<User> {
    return this.update(id, updates)
  }

  static async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    return this.update(id, { status })
  }

  static async deleteUser(id: string): Promise<void> {
    await this.hardDelete(id)
  }

  static async resetPassword(id: string, newPassword: string): Promise<void> {
    await this.updatePassword(id, newPassword)
  }

  static async createProfile(userData: CreateUserData): Promise<UserProfile | null> {
    const user = await this.create(userData)
    return this.getProfile(user.id)
  }

  static async markOrphanUsers(tenant_id: string): Promise<void> {
    await prisma.user.updateMany({
      where: { tenantId: tenant_id },
      data: {
        tenantId: null,
        status: 'inativo'
      }
    })
  }

  // ================================================================
  // MÉTODOS DE CONVENIÊNCIA
  // ================================================================

  static sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...sanitized } = user
    return sanitized
  }

  static hasPermissionLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return USER_HIERARCHY[userRole] >= USER_HIERARCHY[requiredRole]
  }

  static isSuperAdmin(user: User): boolean {
    return user.role === 'super_admin'
  }

  static isAdmin(user: User): boolean {
    return ['admin', 'super_admin'].includes(user.role || '')
  }

  static isManager(user: User): boolean {
    return ['manager', 'admin', 'super_admin'].includes(user.role || '')
  }

  /**
   * Obter estatísticas básicas de usuários para métricas SaaS
   */
  static async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
  }> {
    try {
      const [total, active, inactive] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ativo' } }),
        prisma.user.count({ where: { status: { not: 'ativo' } } })
      ])

      return { total, active, inactive }
    } catch (error) {
      StructuredLogger.error('Erro ao obter estatísticas de usuários', error as Error)
      return { total: 0, active: 0, inactive: 0 }
    }
  }
}

export default UserModel