// ====================================================================
// 🔑 PASSWORD RESET SERVICE - DIGIURBAN PASSWORD RECOVERY
// ====================================================================
// Serviço completo para recuperação de senhas com envio de e-mail
// Integrado com TokenService e EmailService
// ====================================================================

import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { UserModel } from '../models/User.js';
import { TokenService } from './TokenService.js';
import { EmailService } from './EmailService.js';
import { prisma } from "../database/prisma.js";

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
            nome_completo: user.nomeCompleto,
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
        userId: user.id,
        tenant_id: user.tenantId,
        action: 'password_reset_requested',
        details: JSON.stringify({
          email_sent: emailSent,
          ip_address: ipAddress,
          user_agent: userAgent,
          token_expiresAt: tokenData.expiresAt
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
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          updatedAt: new Date()
        }
      });

      // 7. Marcar token como usado
      await TokenService.usePasswordResetToken(token);

      // 8. Invalidar todas as sessões do usuário (forçar re-login)
      await prisma.userSession.deleteMany({
        where: { userId: user.id }
      });

      // 9. Registrar atividade
      await this.logPasswordResetActivity({
        userId: user.id,
        tenant_id: user.tenantId,
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
      const tokenData = await prisma.passwordResetToken.findFirst({
        where: {
          token: this.hashToken(token),
          userId: user.id,
          used: null
        },
        select: {
          expiresAt: true
        }
      });

      return {
        valid: true,
        message: 'Token válido',
        userEmail: user.email,
        expiresAt: tokenData?.expiresAt?.getTime()
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
   * Hash SHA-256 do token para armazenamento seguro
   */
  private static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Registrar atividade de recuperação de senha
   */
  private static async logPasswordResetActivity(activity: {
    userId: string;
    tenant_id?: string;
    action: string;
    details?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          userId: activity.userId,
          tenantId: activity.tenant_id || null,
          action: activity.action,
          resource: 'password_reset',
          details: activity.details || null,
          ipAddress: activity.ip_address || null,
          userAgent: activity.user_agent || null
        }
      });
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
      const whereRequestsToday: any = {
        action: 'password_reset_requested',
        created_at: { gt: new Date(dayStart) }
      };
      if (tenantId) whereRequestsToday.tenant_id = tenantId;

      const whereRequestsWeek: any = {
        action: 'password_reset_requested',
        created_at: { gt: new Date(weekStart) }
      };
      if (tenantId) whereRequestsWeek.tenant_id = tenantId;

      const requestsToday = await prisma.activityLog.count({ where: whereRequestsToday });
      const requestsWeek = await prisma.activityLog.count({ where: whereRequestsWeek });

      // Conclusões
      const whereCompletedToday: any = {
        action: 'password_reset_completed',
        created_at: { gt: new Date(dayStart) }
      };
      if (tenantId) whereCompletedToday.tenant_id = tenantId;

      const whereCompletedWeek: any = {
        action: 'password_reset_completed',
        created_at: { gt: new Date(weekStart) }
      };
      if (tenantId) whereCompletedWeek.tenant_id = tenantId;

      const completedToday = await prisma.activityLog.count({ where: whereCompletedToday });
      const completedWeek = await prisma.activityLog.count({ where: whereCompletedWeek });

      // Tokens ativos
      const whereActiveTokens: any = {
        expiresAt: { gt: new Date(now) },
        used: null
      };

      if (tenantId) {
        whereActiveTokens.user = {
          tenantId: tenantId
        };
      }

      const activeTokens = await prisma.passwordResetToken.count({
        where: whereActiveTokens
      });

      return {
        requestsToday: requestsToday || 0,
        requestsWeek: requestsWeek || 0,
        completedToday: completedToday || 0,
        completedWeek: completedWeek || 0,
        activeTokens: activeTokens || 0
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