// ====================================================================
// 🔐 AUTH SERVICE - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Serviço completo de autenticação com JWT, login, logout e refresh
// Controle de tentativas, logs e segurança avançada
// ====================================================================

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User, { UserModel, UserRole } from '../models/User.js';
import { SessionModel } from '../models/Session.js';
import { JWTUtils, TokenPair } from '../utils/jwt.js';
import { AUTH_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/auth.js';
import { prisma } from "../database/prisma.js";

// ====================================================================
// INTERFACES
// ====================================================================

export interface LoginCredentials {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResponse {
  success: boolean;
  user: Omit<User, 'passwordHash'>;
  tokens: TokenPair;
  tenant?: {
    id: string;
    nome: string;
    plano: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  expiresAt: string;
}

// ====================================================================
// CLASSE AUTH SERVICE
// ====================================================================

export class AuthService {

  // ================================================================
  // LOGIN COM EMAIL E SENHA
  // ================================================================

  /**
   * Realizar login com email e senha
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { email, password, ipAddress, userAgent } = credentials;

    try {
      // 1. Buscar usuário pelo email
      const user = await UserModel.findByEmail(email);

      if (!user) {
        await this.logFailedAttempt(email, ipAddress);
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // 2. Verificar se conta está bloqueada
      if (await UserModel.isLocked(user)) {
        throw new Error(ERROR_MESSAGES.USER_LOCKED);
      }

      // 3. Verificar senha
      const isPasswordValid = await UserModel.verifyPassword(user, password);
      
      if (!isPasswordValid) {
        await UserModel.incrementFailedAttempts(user.id);
        await this.logFailedAttempt(email, ipAddress);
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // 4. Verificar status da conta
      if (user.status !== 'ativo') {
        throw new Error(this.getStatusErrorMessage(user.status));
      }

      // 5. Resetar tentativas falhadas
      await UserModel.resetFailedAttempts(user.id);

      // 6. Gerar tokens JWT
      const sessionId = uuidv4();
      const tokens = JWTUtils.generateTokenPair(user, sessionId);

      // 7. Salvar sessão no banco
      await SessionModel.create({
        userId: user.id,
        token: tokens.accessToken,
        ipAddress: ipAddress,
        userAgent: userAgent,
        expiresAt: tokens.expiresAt
      });

      // 8. Atualizar último login
      await UserModel.updateLastLogin(user.id);

      // 9. Log da atividade
      await this.logActivity({
        userId: user.id,
        tenantId: user.tenantId,
        action: 'login',
        resource: 'auth',
        details: JSON.stringify({
          ipAddress: ipAddress,
          userAgent: userAgent,
          login_method: 'email_password'
        }),
        ipAddress: ipAddress,
        userAgent: userAgent
      });

      // 10. Buscar dados do tenant se existir
      let tenant = undefined;
      if (user.tenantId) {
        const tenantData = await prisma.tenant.findUnique({
          where: { id: user.tenantId },
          select: { id: true, nome: true, plano: true }
        });
        if (tenantData) {
          tenant = tenantData;
        }
      }

      return {
        success: true,
        user: UserModel.sanitizeUser(user),
        tokens,
        tenant
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  // ================================================================
  // REFRESH TOKEN
  // ================================================================

  /**
   * Renovar token de acesso usando refresh token
   */
  static async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const { refreshToken } = request;

    try {
      // 1. Verificar refresh token
      const refreshVerification = JWTUtils.verifyRefreshToken(refreshToken);
      
      if (!refreshVerification.valid || !refreshVerification.payload) {
        throw new Error(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
      }

      // 2. Buscar usuário
      const user = await UserModel.findById(refreshVerification.payload.userId);
      
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // 3. Verificar se usuário ainda está ativo
      if (user.status !== 'ativo') {
        throw new Error(ERROR_MESSAGES.USER_INACTIVE);
      }

      // 4. Verificar se sessão ainda existe e está ativa
      const sessionValid = await SessionModel.validateSession(refreshToken);
      
      if (!sessionValid.valid) {
        throw new Error('Sessão inválida ou expirada');
      }

      // 5. Gerar novo access token
      const newAccessToken = JWTUtils.generateAccessToken(user, refreshVerification.payload.sessionId);
      const decoded = JWTUtils.decodeToken(newAccessToken);
      const expiresAt = new Date(decoded!.exp * 1000).toISOString();

      // 6. Log da atividade
      await this.logActivity({
        userId: user.id,
        tenantId: user.tenantId,
        action: 'token_refresh',
        resource: 'auth',
        details: JSON.stringify({
          session_id: refreshVerification.payload.sessionId
        })
      });

      return {
        success: true,
        accessToken: newAccessToken,
        expiresAt
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  // ================================================================
  // LOGOUT
  // ================================================================

  /**
   * Realizar logout e invalidar sessão
   */
  static async logout(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Invalidar sessão no banco
      await SessionModel.invalidateByToken(token);

      // 2. Log da atividade
      await this.logActivity({
        userId: userId,
        action: 'logout',
        resource: 'auth',
        details: JSON.stringify({
          logout_method: 'manual'
        })
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  // ================================================================
  // LOGOUT DE TODAS AS SESSÕES
  // ================================================================

  /**
   * Fazer logout de todas as sessões do usuário
   */
  static async logoutAll(userId: string): Promise<{ success: boolean; message: string; sessionsTerminated: number }> {
    try {
      // 1. Buscar usuário
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // 2. Invalidar todas as sessões
      await SessionModel.invalidateAllByUser(userId);
      const terminatedCount = 1; // Placeholder já que invalidateAllByUser não retorna count

      // 3. Log da atividade
      await this.logActivity({
        userId: userId,
        tenantId: user.tenantId,
        action: 'logout_all',
        resource: 'auth',
        details: JSON.stringify({
          sessions_terminated: terminatedCount,
          logout_method: 'logout_all'
        })
      });

      return {
        success: true,
        message: `${terminatedCount} sessões foram encerradas`,
        sessionsTerminated: terminatedCount
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  // ================================================================
  // VALIDAÇÃO DE TOKEN
  // ================================================================

  /**
   * Validar token e retornar informações do usuário
   */
  static async validateToken(token: string): Promise<{
    valid: boolean;
    user?: Omit<User, 'passwordHash'>;
    error?: string;
  }> {
    try {
      // 1. Verificar token
      const tokenVerification = JWTUtils.verifyAccessToken(token);
      
      if (!tokenVerification.valid) {
        return {
          valid: false,
          error: tokenVerification.error
        };
      }

      // 2. Buscar usuário
      const user = await UserModel.findById(tokenVerification.payload.userId);
      
      if (!user) {
        return {
          valid: false,
          error: ERROR_MESSAGES.USER_NOT_FOUND
        };
      }

      // 3. Verificar se usuário está ativo
      if (user.status !== 'ativo') {
        return {
          valid: false,
          error: ERROR_MESSAGES.USER_INACTIVE
        };
      }

      // 4. Verificar sessão se sessionId estiver presente
      if (tokenVerification.payload.sessionId) {
        const sessionValid = await SessionModel.validateSession(token);
        
        if (!sessionValid.valid) {
          return {
            valid: false,
            error: 'Sessão inválida ou expirada'
          };
        }
      }

      return {
        valid: true,
        user: UserModel.sanitizeUser(user)
      };

    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR
      };
    }
  }

  // ================================================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ================================================================

  /**
   * Registrar tentativa de login falhada
   */
  private static async logFailedAttempt(email: string, ipAddress?: string): Promise<void> {
    try {
      await this.logActivity({
        action: 'login_failed',
        resource: 'auth',
        details: JSON.stringify({
          email,
          ipAddress: ipAddress,
          reason: 'invalid_credentials'
        }),
        ipAddress: ipAddress
      });
    } catch (error) {
      console.error('Erro ao registrar tentativa falhada:', error);
    }
  }

  /**
   * Registrar atividade no log
   */
  private static async logActivity(activity: {
    userId?: string;
    tenantId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          userId: activity.userId || null,
          tenantId: activity.tenantId || null,
          action: activity.action,
          resource: activity.resource,
          resourceId: activity.resourceId || null,
          details: activity.details || null,
          ipAddress: activity.ipAddress || null,
          userAgent: activity.userAgent || null
        }
      });
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  }

  /**
   * Obter mensagem de erro baseada no status do usuário
   */
  private static getStatusErrorMessage(status: string): string {
    switch (status) {
      case 'inativo':
        return ERROR_MESSAGES.USER_INACTIVE;
      case 'pendente':
        return ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED;
      case 'bloqueado':
        return ERROR_MESSAGES.USER_LOCKED;
      default:
        return ERROR_MESSAGES.USER_INACTIVE;
    }
  }

  // ================================================================
  // MÉTODOS DE ADMINISTRAÇÃO
  // ================================================================

  /**
   * Listar sessões ativas de um usuário
   */
  static async getActiveSessions(userId: string): Promise<any[]> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      return await SessionModel.getActiveByUser(userId);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  /**
   * Encerrar sessão específica
   */
  static async terminateSession(sessionId: string, requestingUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      const session = await SessionModel.findById(sessionId);
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      // Verificar se o usuário pode encerrar esta sessão
      const requestingUser = await UserModel.findById(requestingUserId);
      if (!requestingUser) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Usuário pode encerrar próprias sessões ou admin pode encerrar qualquer sessão
      const canTerminate = 
        session.userId === requestingUserId || 
        ['admin', 'super_admin'].includes(requestingUser.role);

      if (!canTerminate) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }

      // Encerrar sessão
      await SessionModel.invalidateById(sessionId);

      // Log da atividade
      await this.logActivity({
        userId: requestingUserId,
        tenantId: requestingUser.tenantId,
        action: 'session_terminated',
        resource: 'auth',
        resourceId: sessionId,
        details: JSON.stringify({
          terminatedUserId: session.userId,
          session_id: sessionId
        })
      });

      return {
        success: true,
        message: 'Sessão encerrada com sucesso'
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  /**
   * Obter estatísticas de autenticação
   */
  static async getAuthStats(tenantId?: string): Promise<{
    activeSessions: number;
    totalUsers: number;
    recentLogins: number;
    failedAttempts: number;
  }> {
    try {
      // Sessões ativas
      const whereClauseActiveSessions: any = {
        is_active: true,
        expiresAt: { gt: new Date() }
      };

      if (tenantId) {
        whereClauseActiveSessions.user = {
          tenantId: tenantId
        };
      }

      const activeSessions = await prisma.userSession.count({
        where: whereClauseActiveSessions
      });

      // Total de usuários
      const whereClauseTotalUsers: any = {
        status: 'ativo'
      };

      if (tenantId) {
        whereClauseTotalUsers.tenant_id = tenantId;
      }

      const totalUsers = await prisma.user.count({
        where: whereClauseTotalUsers
      });

      // Logins recentes (últimas 24 horas)
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const whereClauseRecentLogins: any = {
        action: 'login',
        created_at: { gt: last24Hours }
      };

      if (tenantId) {
        whereClauseRecentLogins.tenant_id = tenantId;
      }

      const recentLogins = await prisma.activityLog.count({
        where: whereClauseRecentLogins
      });

      // Tentativas falhadas (últimas 24 horas)
      const whereClauseFailedAttempts: any = {
        action: 'login_failed',
        created_at: { gt: last24Hours }
      };

      if (tenantId) {
        whereClauseFailedAttempts.tenant_id = tenantId;
      }

      const failedAttempts = await prisma.activityLog.count({
        where: whereClauseFailedAttempts
      });

      return {
        activeSessions: activeSessions || 0,
        totalUsers: totalUsers || 0,
        recentLogins: recentLogins || 0,
        failedAttempts: failedAttempts || 0
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }
}

export default AuthService;