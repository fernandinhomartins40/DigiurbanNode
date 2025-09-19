// ====================================================================
// 🔑 TOKEN SERVICE - DIGIURBAN TOKEN SYSTEM
// ====================================================================
// Serviço para gerenciamento de tokens de recuperação de senha e
// verificação de e-mail com controle de expiração
// ====================================================================

import { randomBytes, createHash } from 'crypto';
import { prisma } from "../database/prisma.js";
import { EMAIL_CONFIG } from '../config/email.js';

// ====================================================================
// INTERFACES
// ====================================================================

export interface TokenData {
  token: string;
  hashedToken: string;
  expiresAt: number;
}

export interface PasswordResetTokenData extends TokenData {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface EmailVerificationTokenData extends TokenData {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface TokenValidation {
  valid: boolean;
  userId?: string;
  error?: string;
}

// ====================================================================
// CLASSE TOKEN SERVICE
// ====================================================================

export class TokenService {

  // ================================================================
  // TOKENS DE RECUPERAÇÃO DE SENHA
  // ================================================================

  /**
   * Criar token de recuperação de senha
   */
  static async createPasswordResetToken(
    userId: string, 
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<TokenData> {
    try {
      // Gerar token seguro
      const token = this.generateSecureToken();
      const hashedToken = this.hashToken(token);
      const expiresAt = Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_LIFETIME || '3600000'); // 1 hora

      // Invalidar tokens anteriores deste usuário
      await prisma.passwordResetToken.updateMany({
        where: {
          user_id: userId,
          used_at: null
        },
        data: {
          used_at: new Date()
        }
      });

      // Inserir novo token
      await prisma.passwordResetToken.create({
        data: {
          user_id: userId,
          token: hashedToken,
          expires_at: new Date(expiresAt),
          ip_address: metadata?.ipAddress || null,
          user_agent: metadata?.userAgent || null
        }
      });

      return {
        token,
        hashedToken,
        expiresAt
      };

    } catch (error) {
      console.error('Erro ao criar token de recuperação:', error);
      throw new Error('Erro interno ao gerar token de recuperação');
    }
  }

  /**
   * Validar token de recuperação de senha
   */
  static async validatePasswordResetToken(token: string): Promise<TokenValidation> {
    try {
      const hashedToken = this.hashToken(token);
      const now = Date.now();

      const tokenRecord = await prisma.passwordResetToken.findFirst({
        where: {
          token: hashedToken,
          expires_at: { gt: new Date(now) },
          used_at: null
        },
        select: {
          user_id: true,
          expires_at: true,
          used_at: true
        }
      });

      if (!tokenRecord) {
        return {
          valid: false,
          error: 'Token inválido ou expirado'
        };
      }

      return {
        valid: true,
        userId: tokenRecord.user_id
      };

    } catch (error) {
      console.error('Erro ao validar token de recuperação:', error);
      return {
        valid: false,
        error: 'Erro interno na validação do token'
      };
    }
  }

  /**
   * Marcar token de recuperação como usado
   */
  static async usePasswordResetToken(token: string): Promise<boolean> {
    try {
      const hashedToken = this.hashToken(token);
      const now = Date.now();

      const result = await prisma.passwordResetToken.updateMany({
        where: {
          token: hashedToken,
          expires_at: { gt: new Date(now) },
          used_at: null
        },
        data: {
          used_at: new Date(now)
        }
      });

      return result && result.count > 0;

    } catch (error) {
      console.error('Erro ao marcar token como usado:', error);
      return false;
    }
  }

  // ================================================================
  // TOKENS DE VERIFICAÇÃO DE E-MAIL
  // ================================================================

  /**
   * Criar token de verificação de e-mail
   */
  static async createEmailVerificationToken(
    userId: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<TokenData> {
    try {
      // Gerar token seguro
      const token = this.generateSecureToken();
      const hashedToken = this.hashToken(token);
      const expiresAt = Date.now() + parseInt(process.env.EMAIL_VERIFICATION_TOKEN_LIFETIME || '86400000'); // 24 horas

      // Invalidar tokens anteriores deste usuário
      await prisma.emailVerificationToken.updateMany({
        where: {
          user_id: userId,
          verified_at: null
        },
        data: {
          verified_at: new Date()
        }
      });

      // Inserir novo token
      await prisma.emailVerificationToken.create({
        data: {
          user_id: userId,
          token: hashedToken,
          expires_at: new Date(expiresAt),
          ip_address: metadata?.ipAddress || null,
          user_agent: metadata?.userAgent || null
        }
      });

      return {
        token,
        hashedToken,
        expiresAt
      };

    } catch (error) {
      console.error('Erro ao criar token de verificação:', error);
      throw new Error('Erro interno ao gerar token de verificação');
    }
  }

  /**
   * Validar token de verificação de e-mail
   */
  static async validateEmailVerificationToken(token: string): Promise<TokenValidation> {
    try {
      const hashedToken = this.hashToken(token);
      const now = Date.now();

      const tokenRecord = await prisma.emailVerificationToken.findFirst({
        where: {
          token: hashedToken,
          expires_at: { gt: new Date(now) },
          verified_at: null
        },
        select: {
          user_id: true,
          expires_at: true,
          verified_at: true
        }
      });

      if (!tokenRecord) {
        return {
          valid: false,
          error: 'Token inválido ou expirado'
        };
      }

      return {
        valid: true,
        userId: tokenRecord.user_id
      };

    } catch (error) {
      console.error('Erro ao validar token de verificação:', error);
      return {
        valid: false,
        error: 'Erro interno na validação do token'
      };
    }
  }

  /**
   * Marcar token de verificação como usado
   */
  static async useEmailVerificationToken(token: string): Promise<boolean> {
    try {
      const hashedToken = this.hashToken(token);
      const now = Date.now();

      const result = await prisma.emailVerificationToken.updateMany({
        where: {
          token: hashedToken,
          expires_at: { gt: new Date(now) },
          verified_at: null
        },
        data: {
          verified_at: new Date(now)
        }
      });

      return result && result.count > 0;

    } catch (error) {
      console.error('Erro ao marcar token como verificado:', error);
      return false;
    }
  }

  // ================================================================
  // MÉTODOS AUXILIARES
  // ================================================================

  /**
   * Gerar token seguro de 32 bytes
   */
  private static generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Hash SHA-256 do token para armazenamento seguro
   */
  private static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Limpar tokens expirados (manual)
   */
  static async cleanupExpiredTokens(): Promise<{ 
    passwordResetTokens: number; 
    emailVerificationTokens: number; 
  }> {
    try {
      const now = Date.now();

      // Limpar tokens de recuperação de senha expirados
      const passwordResult = await prisma.passwordResetToken.deleteMany({
        where: {
          expires_at: { lt: new Date(now) }
        }
      });

      // Limpar tokens de verificação de e-mail expirados
      const emailResult = await prisma.emailVerificationToken.deleteMany({
        where: {
          expires_at: { lt: new Date(now) }
        }
      });

      return {
        passwordResetTokens: passwordResult.count || 0,
        emailVerificationTokens: emailResult.count || 0
      };

    } catch (error) {
      console.error('Erro na limpeza de tokens expirados:', error);
      return {
        passwordResetTokens: 0,
        emailVerificationTokens: 0
      };
    }
  }

  /**
   * Obter estatísticas de tokens
   */
  static async getTokenStats(): Promise<{
    passwordResetActive: number;
    passwordResetExpired: number;
    emailVerificationActive: number;
    emailVerificationExpired: number;
  }> {
    try {
      const now = Date.now();

      // Tokens de recuperação ativos
      const passwordActive = await prisma.passwordResetToken.count({
        where: {
          expires_at: { gt: new Date(now) },
          used_at: null
        }
      });

      // Tokens de recuperação expirados
      const passwordExpired = await prisma.passwordResetToken.count({
        where: {
          expires_at: { lte: new Date(now) }
        }
      });

      // Tokens de verificação ativos
      const emailActive = await prisma.emailVerificationToken.count({
        where: {
          expires_at: { gt: new Date(now) },
          verified_at: null
        }
      });

      // Tokens de verificação expirados
      const emailExpired = await prisma.emailVerificationToken.count({
        where: {
          expires_at: { lte: new Date(now) }
        }
      });

      return {
        passwordResetActive: passwordActive || 0,
        passwordResetExpired: passwordExpired || 0,
        emailVerificationActive: emailActive || 0,
        emailVerificationExpired: emailExpired || 0
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de tokens:', error);
      return {
        passwordResetActive: 0,
        passwordResetExpired: 0,
        emailVerificationActive: 0,
        emailVerificationExpired: 0
      };
    }
  }

  /**
   * Verificar rate limit para solicitação de tokens
   */
  static async checkTokenRequestRateLimit(
    userId: string, 
    tokenType: 'password_reset' | 'email_verification',
    windowMinutes: number = 15,
    maxRequests: number = 3
  ): Promise<boolean> {
    try {
      const windowStart = Date.now() - (windowMinutes * 60 * 1000);
      
      const tableName = tokenType === 'password_reset' 
        ? 'password_reset_tokens' 
        : 'email_verification_tokens';

      let count;
      if (tokenType === 'password_reset') {
        count = await prisma.passwordResetToken.count({
          where: {
            user_id: userId,
            created_at: { gt: new Date(windowStart) }
          }
        });
      } else {
        count = await prisma.emailVerificationToken.count({
          where: {
            user_id: userId,
            created_at: { gt: new Date(windowStart) }
          }
        });
      }

      return (count || 0) < maxRequests;

    } catch (error) {
      console.error('Erro ao verificar rate limit de tokens:', error);
      return true; // Em caso de erro, permitir a solicitação
    }
  }
}

export default TokenService;