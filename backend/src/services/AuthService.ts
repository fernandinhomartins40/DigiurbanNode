// ====================================================================
// 🔐 AUTH SERVICE - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Serviço completo de autenticação com JWT, login, logout e refresh
// Controle de tentativas, logs e segurança avançada
// ====================================================================

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserModel, User, UserRole } from '../models/User.js';
import { SessionModel } from '../models/Session.js';
import { JWTUtils, TokenPair } from '../utils/jwt.js';
import { AUTH_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/auth.js';
import { execute } from '../database/connection.js';

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
  user: Omit<User, 'password_hash'>;
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
        user_id: user.id,
        token: tokens.accessToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: tokens.expiresAt
      });

      // 8. Atualizar último login
      await UserModel.updateLastLogin(user.id);

      // 9. Log da atividade
      await this.logActivity({
        user_id: user.id,
        tenant_id: user.tenant_id,
        action: 'login',
        resource: 'auth',
        details: JSON.stringify({
          ip_address: ipAddress,
          user_agent: userAgent,
          login_method: 'email_password'
        }),
        ip_address: ipAddress,
        user_agent: userAgent
      });

      // 10. Buscar dados do tenant se existir
      let tenant = undefined;
      if (user.tenant_id) {
        const tenantData = await execute(
          'SELECT id, nome, plano FROM tenants WHERE id = ?',
          [user.tenant_id]
        );
        if (tenantData) {
          tenant = tenantData as any;
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
        user_id: user.id,
        tenant_id: user.tenant_id,
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
        user_id: userId,
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
      const terminatedCount = await SessionModel.invalidateAllByUser(userId);

      // 3. Log da atividade
      await this.logActivity({
        user_id: userId,
        tenant_id: user.tenant_id,
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
    user?: Omit<User, 'password_hash'>;
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
          ip_address: ipAddress,
          reason: 'invalid_credentials'
        }),
        ip_address: ipAddress
      });
    } catch (error) {
      console.error('Erro ao registrar tentativa falhada:', error);
    }
  }

  /**
   * Registrar atividade no log
   */
  private static async logActivity(activity: {
    user_id?: string;
    tenant_id?: string;
    action: string;
    resource: string;
    resource_id?: string;
    details?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void> {
    try {
      await execute(`
        INSERT INTO activity_logs (
          user_id, tenant_id, action, resource, resource_id, 
          details, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        activity.user_id || null,
        activity.tenant_id || null,
        activity.action,
        activity.resource,
        activity.resource_id || null,
        activity.details || null,
        activity.ip_address || null,
        activity.user_agent || null
      ]);
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
        session.user_id === requestingUserId || 
        ['admin', 'super_admin'].includes(requestingUser.role);

      if (!canTerminate) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }

      // Encerrar sessão
      await SessionModel.invalidateById(sessionId);

      // Log da atividade
      await this.logActivity({
        user_id: requestingUserId,
        tenant_id: requestingUser.tenant_id,
        action: 'session_terminated',
        resource: 'auth',
        resource_id: sessionId,
        details: JSON.stringify({
          terminated_user_id: session.user_id,
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
      let activeSessionsQuery = `
        SELECT COUNT(*) as count FROM user_sessions 
        WHERE is_active = TRUE AND expires_at > datetime('now')
      `;
      let params: any[] = [];

      if (tenantId) {
        activeSessionsQuery += ` AND user_id IN (SELECT id FROM users WHERE tenant_id = ?)`;
        params.push(tenantId);
      }

      const activeSessions = await execute(activeSessionsQuery, params) as any;

      // Total de usuários
      let totalUsersQuery = `SELECT COUNT(*) as count FROM users WHERE status = 'ativo'`;
      let userParams: any[] = [];

      if (tenantId) {
        totalUsersQuery += ` AND tenant_id = ?`;
        userParams.push(tenantId);
      }

      const totalUsers = await execute(totalUsersQuery, userParams) as any;

      // Logins recentes (últimas 24 horas)
      let recentLoginsQuery = `
        SELECT COUNT(*) as count FROM activity_logs 
        WHERE action = 'login' AND created_at > datetime('now', '-24 hours')
      `;
      let loginParams: any[] = [];

      if (tenantId) {
        recentLoginsQuery += ` AND tenant_id = ?`;
        loginParams.push(tenantId);
      }

      const recentLogins = await execute(recentLoginsQuery, loginParams) as any;

      // Tentativas falhadas (últimas 24 horas)
      let failedAttemptsQuery = `
        SELECT COUNT(*) as count FROM activity_logs 
        WHERE action = 'login_failed' AND created_at > datetime('now', '-24 hours')
      `;
      let failedParams: any[] = [];

      if (tenantId) {
        failedAttemptsQuery += ` AND tenant_id = ?`;
        failedParams.push(tenantId);
      }

      const failedAttempts = await execute(failedAttemptsQuery, failedParams) as any;

      return {
        activeSessions: activeSessions.count || 0,
        totalUsers: totalUsers.count || 0,
        recentLogins: recentLogins.count || 0,
        failedAttempts: failedAttempts.count || 0
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }
}

export default AuthService;