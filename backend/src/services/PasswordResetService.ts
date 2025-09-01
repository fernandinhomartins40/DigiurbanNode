// ====================================================================
// 🔑 PASSWORD RESET SERVICE - DIGIURBAN PASSWORD RECOVERY
// ====================================================================
// Serviço completo para recuperação de senhas com envio de e-mail
// Integrado com TokenService e EmailService
// ====================================================================

import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { TokenService } from './TokenService.js';
import { EmailService } from './EmailService.js';
import { execute } from '../database/connection.js';

// ====================================================================
// INTERFACES
// ====================================================================

export interface PasswordResetRequest {
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  tokenSent?: boolean;
}

export interface PasswordUpdateRequest {
  token: string;
  newPassword: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordUpdateResponse {
  success: boolean;
  message: string;
  userEmail?: string;
}

// ====================================================================
// CLASSE PASSWORD RESET SERVICE
// ====================================================================

export class PasswordResetService {

  // ================================================================
  // SOLICITAR RECUPERAÇÃO DE SENHA
  // ================================================================

  /**
   * Solicitar recuperação de senha por e-mail
   */
  static async requestPasswordReset(request: PasswordResetRequest): Promise<PasswordResetResponse> {
    const { email, ipAddress, userAgent } = request;

    try {
      // 1. Buscar usuário pelo e-mail
      const user = await UserModel.findByEmail(email);

      if (!user) {
        // Por segurança, não revelar se o e-mail existe ou não
        return {
          success: true,
          message: 'Se o e-mail existir em nossa base, você receberá instruções para recuperação de senha.',
          tokenSent: false
        };
      }

      // 2. Verificar se a conta está ativa
      if (user.status !== 'ativo') {
        return {
          success: false,
          message: 'Esta conta não está ativa. Entre em contato com o suporte.'
        };
      }

      // 3. Verificar rate limit para este usuário
      const canRequest = await TokenService.checkTokenRequestRateLimit(
        user.id, 
        'password_reset',
        15, // 15 minutos
        3   // máximo 3 tentativas
      );

      if (!canRequest) {
        return {
          success: false,
          message: 'Muitas solicitações recentes. Tente novamente em 15 minutos.'
        };
      }

      // 4. Criar token de recuperação
      const tokenData = await TokenService.createPasswordResetToken(user.id, {
        ipAddress,
        userAgent
      });

      // 5. Enviar e-mail de recuperação
      let emailSent = false;
      if (EmailService.isConfigured()) {
        try {
          const emailResult = await EmailService.sendPasswordResetEmail(user.email, {
            nome_completo: user.nome_completo,
            resetToken: tokenData.token,
            expiresAt: new Date(tokenData.expiresAt)
          });

          emailSent = emailResult.success;

          if (!emailResult.success) {
            console.error('Erro no envio de e-mail de recuperação:', emailResult.error);
          }
        } catch (emailError) {
          console.error('Erro no envio de e-mail de recuperação:', emailError);
        }
      }

      // 6. Registrar atividade
      await this.logPasswordResetActivity({
        user_id: user.id,
        tenant_id: user.tenant_id,
        action: 'password_reset_requested',
        details: JSON.stringify({
          email_sent: emailSent,
          ip_address: ipAddress,
          user_agent: userAgent,
          token_expires_at: tokenData.expiresAt
        }),
        ip_address: ipAddress,
        user_agent: userAgent
      });

      return {
        success: true,
        message: emailSent 
          ? 'Instruções para recuperação de senha foram enviadas para seu e-mail.'
          : 'Token de recuperação criado. Configure o serviço de e-mail para envio automático.',
        tokenSent: emailSent
      };

    } catch (error) {
      console.error('Erro na solicitação de recuperação de senha:', error);
      return {
        success: false,
        message: 'Erro interno do servidor. Tente novamente mais tarde.'
      };
    }
  }

  // ================================================================
  // REDEFINIR SENHA
  // ================================================================

  /**
   * Redefinir senha usando token de recuperação
   */
  static async updatePassword(request: PasswordUpdateRequest): Promise<PasswordUpdateResponse> {
    const { token, newPassword, ipAddress, userAgent } = request;

    try {
      // 1. Validar token
      const tokenValidation = await TokenService.validatePasswordResetToken(token);

      if (!tokenValidation.valid || !tokenValidation.userId) {
        return {
          success: false,
          message: tokenValidation.error || 'Token inválido ou expirado'
        };
      }

      // 2. Buscar usuário
      const user = await UserModel.findById(tokenValidation.userId);

      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        };
      }

      // 3. Verificar se a conta ainda está ativa
      if (user.status !== 'ativo') {
        return {
          success: false,
          message: 'Esta conta não está ativa. Entre em contato com o suporte.'
        };
      }

      // 4. Validar nova senha (usando mesmas regras do registro)
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return {
          success: false,
          message: passwordValidation.message || 'Senha não atende aos critérios de segurança'
        };
      }

      // 5. Hash da nova senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // 6. Atualizar senha no banco
      await execute(
        'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
        [hashedPassword, Date.now(), user.id]
      );

      // 7. Marcar token como usado
      await TokenService.usePasswordResetToken(token);

      // 8. Invalidar todas as sessões do usuário (forçar re-login)
      await execute(
        'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?',
        [user.id]
      );

      // 9. Registrar atividade
      await this.logPasswordResetActivity({
        user_id: user.id,
        tenant_id: user.tenant_id,
        action: 'password_reset_completed',
        details: JSON.stringify({
          ip_address: ipAddress,
          user_agent: userAgent,
          sessions_invalidated: true
        }),
        ip_address: ipAddress,
        user_agent: userAgent
      });

      // 10. Enviar notificação de senha alterada (se e-mail configurado)
      if (EmailService.isConfigured()) {
        try {
          // Você pode implementar um template específico para notificação de senha alterada
          // Por enquanto, vamos usar o template de novo login como notificação de segurança
        } catch (emailError) {
          console.error('Erro ao enviar notificação de senha alterada:', emailError);
        }
      }

      return {
        success: true,
        message: 'Senha alterada com sucesso. Faça login com sua nova senha.',
        userEmail: user.email
      };

    } catch (error) {
      console.error('Erro na atualização de senha:', error);
      return {
        success: false,
        message: 'Erro interno do servidor. Tente novamente mais tarde.'
      };
    }
  }

  // ================================================================
  // VALIDAR TOKEN
  // ================================================================

  /**
   * Validar se um token de recuperação é válido
   */
  static async validateResetToken(token: string): Promise<{
    valid: boolean;
    message: string;
    userEmail?: string;
    expiresAt?: number;
  }> {
    try {
      // Validar token
      const tokenValidation = await TokenService.validatePasswordResetToken(token);

      if (!tokenValidation.valid || !tokenValidation.userId) {
        return {
          valid: false,
          message: tokenValidation.error || 'Token inválido ou expirado'
        };
      }

      // Buscar dados do usuário
      const user = await UserModel.findById(tokenValidation.userId);

      if (!user) {
        return {
          valid: false,
          message: 'Usuário não encontrado'
        };
      }

      // Obter dados do token
      const tokenData = await execute(`
        SELECT expires_at FROM password_reset_tokens 
        WHERE token = ? AND user_id = ? AND used_at IS NULL 
        LIMIT 1
      `, [TokenService['hashToken'](token), user.id]) as any;

      return {
        valid: true,
        message: 'Token válido',
        userEmail: user.email,
        expiresAt: tokenData?.expires_at
      };

    } catch (error) {
      console.error('Erro na validação do token:', error);
      return {
        valid: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  // ================================================================
  // MÉTODOS AUXILIARES
  // ================================================================

  /**
   * Validar critérios de senha
   */
  private static validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password || password.length < 8) {
      return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
    }

    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
    }

    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
    }

    if (!/\d/.test(password)) {
      return { valid: false, message: 'Senha deve conter pelo menos um número' };
    }

    if (!/[@$!%*?&]/.test(password)) {
      return { valid: false, message: 'Senha deve conter pelo menos um caractere especial (@$!%*?&)' };
    }

    return { valid: true };
  }

  /**
   * Registrar atividade de recuperação de senha
   */
  private static async logPasswordResetActivity(activity: {
    user_id: string;
    tenant_id?: string;
    action: string;
    details?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void> {
    try {
      await execute(`
        INSERT INTO activity_logs (
          user_id, tenant_id, action, resource, details, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        activity.user_id,
        activity.tenant_id || null,
        activity.action,
        'password_reset',
        activity.details || null,
        activity.ip_address || null,
        activity.user_agent || null
      ]);
    } catch (error) {
      console.error('Erro ao registrar atividade de recuperação de senha:', error);
    }
  }

  // ================================================================
  // MÉTODOS ADMINISTRATIVOS
  // ================================================================

  /**
   * Obter estatísticas de recuperação de senhas
   */
  static async getPasswordResetStats(tenantId?: string): Promise<{
    requestsToday: number;
    requestsWeek: number;
    completedToday: number;
    completedWeek: number;
    activeTokens: number;
  }> {
    try {
      const now = Date.now();
      const dayStart = now - (24 * 60 * 60 * 1000);
      const weekStart = now - (7 * 24 * 60 * 60 * 1000);

      let tenantFilter = '';
      let params: any[] = [];

      if (tenantId) {
        tenantFilter = ' AND a.tenant_id = ?';
        params = [tenantId, tenantId, tenantId, tenantId];
      }

      // Solicitações
      const requestsToday = await execute(`
        SELECT COUNT(*) as count FROM activity_logs a
        WHERE a.action = 'password_reset_requested' 
        AND a.created_at > ? ${tenantFilter}
      `, [dayStart, ...params.slice(0, 1)]) as any;

      const requestsWeek = await execute(`
        SELECT COUNT(*) as count FROM activity_logs a
        WHERE a.action = 'password_reset_requested' 
        AND a.created_at > ? ${tenantFilter}
      `, [weekStart, ...params.slice(0, 1)]) as any;

      // Conclusões
      const completedToday = await execute(`
        SELECT COUNT(*) as count FROM activity_logs a
        WHERE a.action = 'password_reset_completed' 
        AND a.created_at > ? ${tenantFilter}
      `, [dayStart, ...params.slice(0, 1)]) as any;

      const completedWeek = await execute(`
        SELECT COUNT(*) as count FROM activity_logs a
        WHERE a.action = 'password_reset_completed' 
        AND a.created_at > ? ${tenantFilter}
      `, [weekStart, ...params.slice(0, 1)]) as any;

      // Tokens ativos
      let activeTokensQuery = `
        SELECT COUNT(*) as count FROM password_reset_tokens p
        JOIN users u ON p.user_id = u.id
        WHERE p.expires_at > ? AND p.used_at IS NULL
      `;

      if (tenantId) {
        activeTokensQuery += ' AND u.tenant_id = ?';
        params.push(tenantId);
      }

      const activeTokens = await execute(activeTokensQuery, [now, ...params.slice(-1)]) as any;

      return {
        requestsToday: requestsToday.count || 0,
        requestsWeek: requestsWeek.count || 0,
        completedToday: completedToday.count || 0,
        completedWeek: completedWeek.count || 0,
        activeTokens: activeTokens.count || 0
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de recuperação:', error);
      return {
        requestsToday: 0,
        requestsWeek: 0,
        completedToday: 0,
        completedWeek: 0,
        activeTokens: 0
      };
    }
  }
}

export default PasswordResetService;