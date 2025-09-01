// ====================================================================
// 🔑 TOKEN SERVICE - DIGIURBAN TOKEN SYSTEM
// ====================================================================
// Serviço para gerenciamento de tokens de recuperação de senha e
// verificação de e-mail com controle de expiração
// ====================================================================

import { randomBytes, createHash } from 'crypto';
import { execute } from '../database/connection.js';
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
      await execute(
        'UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL',
        [Date.now(), userId]
      );

      // Inserir novo token
      await execute(`
        INSERT INTO password_reset_tokens 
        (user_id, token, expires_at, ip_address, user_agent) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        userId,
        hashedToken,
        expiresAt,
        metadata?.ipAddress || null,
        metadata?.userAgent || null
      ]);

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

      const tokenRecord = await execute(`
        SELECT user_id, expires_at, used_at
        FROM password_reset_tokens 
        WHERE token = ? AND expires_at > ? AND used_at IS NULL
        LIMIT 1
      `, [hashedToken, now]) as any;

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

      const result = await execute(`
        UPDATE password_reset_tokens 
        SET used_at = ? 
        WHERE token = ? AND expires_at > ? AND used_at IS NULL
      `, [now, hashedToken, now]);

      return result && (result as any).changes > 0;

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
      await execute(
        'UPDATE email_verification_tokens SET verified_at = ? WHERE user_id = ? AND verified_at IS NULL',
        [Date.now(), userId]
      );

      // Inserir novo token
      await execute(`
        INSERT INTO email_verification_tokens 
        (user_id, token, expires_at, ip_address, user_agent) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        userId,
        hashedToken,
        expiresAt,
        metadata?.ipAddress || null,
        metadata?.userAgent || null
      ]);

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

      const tokenRecord = await execute(`
        SELECT user_id, expires_at, verified_at
        FROM email_verification_tokens 
        WHERE token = ? AND expires_at > ? AND verified_at IS NULL
        LIMIT 1
      `, [hashedToken, now]) as any;

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

      const result = await execute(`
        UPDATE email_verification_tokens 
        SET verified_at = ? 
        WHERE token = ? AND expires_at > ? AND verified_at IS NULL
      `, [now, hashedToken, now]);

      return result && (result as any).changes > 0;

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
      const passwordResult = await execute(
        'DELETE FROM password_reset_tokens WHERE expires_at < ?',
        [now]
      ) as any;

      // Limpar tokens de verificação de e-mail expirados
      const emailResult = await execute(
        'DELETE FROM email_verification_tokens WHERE expires_at < ?',
        [now]
      ) as any;

      return {
        passwordResetTokens: passwordResult.changes || 0,
        emailVerificationTokens: emailResult.changes || 0
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
      const passwordActive = await execute(
        'SELECT COUNT(*) as count FROM password_reset_tokens WHERE expires_at > ? AND used_at IS NULL',
        [now]
      ) as any;

      // Tokens de recuperação expirados
      const passwordExpired = await execute(
        'SELECT COUNT(*) as count FROM password_reset_tokens WHERE expires_at <= ?',
        [now]
      ) as any;

      // Tokens de verificação ativos
      const emailActive = await execute(
        'SELECT COUNT(*) as count FROM email_verification_tokens WHERE expires_at > ? AND verified_at IS NULL',
        [now]
      ) as any;

      // Tokens de verificação expirados
      const emailExpired = await execute(
        'SELECT COUNT(*) as count FROM email_verification_tokens WHERE expires_at <= ?',
        [now]
      ) as any;

      return {
        passwordResetActive: passwordActive.count || 0,
        passwordResetExpired: passwordExpired.count || 0,
        emailVerificationActive: emailActive.count || 0,
        emailVerificationExpired: emailExpired.count || 0
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

      const count = await execute(`
        SELECT COUNT(*) as count 
        FROM ${tableName} 
        WHERE user_id = ? AND created_at > ?
      `, [userId, windowStart]) as any;

      return (count.count || 0) < maxRequests;

    } catch (error) {
      console.error('Erro ao verificar rate limit de tokens:', error);
      return true; // Em caso de erro, permitir a solicitação
    }
  }
}

export default TokenService;