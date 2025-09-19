// ====================================================================
// 🔐 JWT UTILITIES - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Utilitários para geração, verificação e manipulação de JWT tokens
// Segurança e flexibilidade para todo o sistema
// ====================================================================

import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/auth.js';
import { User } from '../database/generated/client/index.js';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  sessionId?: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface DecodedToken {
  payload: JWTPayload;
  valid: boolean;
  expired: boolean;
  error?: string;
}

// ====================================================================
// CLASSE JWT UTILITIES
// ====================================================================

export class JWTUtils {
  
  // ================================================================
  // GERAÇÃO DE TOKENS
  // ================================================================
  
  /**
   * Gerar token de acesso (Access Token)
   */
  static generateAccessToken(user: User, sessionId?: string): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      sessionId
    };
    
    return jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, {
      expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN,
      issuer: 'digiurban-auth',
      audience: 'digiurban-api'
    } as jwt.SignOptions);
  }
  
  /**
   * Gerar token de atualização (Refresh Token)
   */
  static generateRefreshToken(userId: string, sessionId: string): string {
    const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      userId: userId,
      sessionId
    };
    
    return jwt.sign(payload, AUTH_CONFIG.JWT_REFRESH_SECRET, {
      expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'digiurban-auth',
      audience: 'digiurban-refresh'
    } as jwt.SignOptions);
  }
  
  /**
   * Gerar par de tokens (Access + Refresh)
   */
  static generateTokenPair(user: User, sessionId?: string): TokenPair {
    const accessToken = this.generateAccessToken(user, sessionId);
    const refreshToken = this.generateRefreshToken(user.id, sessionId || '');
    
    // Calcular data de expiração
    const decoded = jwt.decode(accessToken) as JWTPayload;
    const expiresAt = new Date(decoded.exp * 1000).toISOString();
    
    return {
      accessToken,
      refreshToken,
      expiresAt
    };
  }
  
  // ================================================================
  // VERIFICAÇÃO DE TOKENS
  // ================================================================
  
  /**
   * Verificar token de acesso
   */
  static verifyAccessToken(token: string): DecodedToken {
    try {
      const payload = jwt.verify(token, AUTH_CONFIG.JWT_SECRET, {
        issuer: 'digiurban-auth',
        audience: 'digiurban-api'
      }) as JWTPayload;
      
      return {
        payload,
        valid: true,
        expired: false
      };
      
    } catch (error) {
      const isExpired = error instanceof jwt.TokenExpiredError;
      
      return {
        payload: {} as JWTPayload,
        valid: false,
        expired: isExpired,
        error: error instanceof Error ? error.message : 'Token inválido'
      };
    }
  }
  
  /**
   * Verificar token de atualização
   */
  static verifyRefreshToken(token: string): {
    payload?: RefreshTokenPayload;
    valid: boolean;
    expired: boolean;
    error?: string;
  } {
    try {
      const payload = jwt.verify(token, AUTH_CONFIG.JWT_REFRESH_SECRET, {
        issuer: 'digiurban-auth',
        audience: 'digiurban-refresh'
      }) as RefreshTokenPayload;
      
      return {
        payload,
        valid: true,
        expired: false
      };
      
    } catch (error) {
      const isExpired = error instanceof jwt.TokenExpiredError;
      
      return {
        valid: false,
        expired: isExpired,
        error: error instanceof Error ? error.message : 'Refresh token inválido'
      };
    }
  }
  
  // ================================================================
  // DECODIFICAÇÃO SEM VERIFICAÇÃO
  // ================================================================
  
  /**
   * Decodificar token sem verificar assinatura (para debug/logs)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
  
  /**
   * Extrair informações do token mesmo se expirado
   */
  static extractTokenInfo(token: string): {
    userId?: string;
    email?: string;
    role?: string;
    tenantId?: string;
    expired?: boolean;
    expiresAt?: string;
  } {
    const decoded = this.decodeToken(token);
    if (!decoded) return {};
    
    const now = Math.floor(Date.now() / 1000);
    const expired = decoded.exp < now;
    const expiresAt = new Date(decoded.exp * 1000).toISOString();
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
      expired,
      expiresAt
    };
  }
  
  // ================================================================
  // TOKENS ESPECIAIS
  // ================================================================
  
  /**
   * Gerar token de ativação de conta
   */
  static generateActivationToken(userId: string): string {
    const payload = {
      userId: userId,
      type: 'activation'
    };
    
    return jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, {
      expiresIn: AUTH_CONFIG.ACTIVATION_TOKEN_EXPIRES_IN,
      issuer: 'digiurban-auth',
      audience: 'digiurban-activation'
    } as jwt.SignOptions);
  }
  
  /**
   * Gerar token de reset de senha
   */
  static generatePasswordResetToken(userId: string): string {
    const payload = {
      userId: userId,
      type: 'password_reset'
    };
    
    return jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, {
      expiresIn: AUTH_CONFIG.PASSWORD_RESET_TOKEN_EXPIRES_IN,
      issuer: 'digiurban-auth',
      audience: 'digiurban-password-reset'
    } as jwt.SignOptions);
  }
  
  /**
   * Verificar token de ativação
   */
  static verifyActivationToken(token: string): {
    userId?: string;
    valid: boolean;
    error?: string;
  } {
    try {
      const payload = jwt.verify(token, AUTH_CONFIG.JWT_SECRET, {
        issuer: 'digiurban-auth',
        audience: 'digiurban-activation'
      }) as { userId: string; type: string };

      if (payload.type !== 'activation') {
        return { valid: false, error: 'Tipo de token inválido' };
      }

      return {
        userId: payload.userId,
        valid: true
      };
      
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Token de ativação inválido'
      };
    }
  }
  
  /**
   * Verificar token de reset de senha
   */
  static verifyPasswordResetToken(token: string): {
    userId?: string;
    valid: boolean;
    error?: string;
  } {
    try {
      const payload = jwt.verify(token, AUTH_CONFIG.JWT_SECRET, {
        issuer: 'digiurban-auth',
        audience: 'digiurban-password-reset'
      }) as { userId: string; type: string };

      if (payload.type !== 'password_reset') {
        return { valid: false, error: 'Tipo de token inválido' };
      }

      return {
        userId: payload.userId,
        valid: true
      };
      
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Token de reset inválido'
      };
    }
  }
  
  // ================================================================
  // UTILITÁRIOS DE EXTRAÇÃO
  // ================================================================
  
  /**
   * Extrair token do header Authorization
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
  
  /**
   * Extrair token de cookie
   */
  static extractTokenFromCookies(cookies: Record<string, string>, cookieName: string): string | null {
    return cookies[cookieName] || null;
  }
  
  // ================================================================
  // VALIDAÇÕES E CHECAGENS
  // ================================================================
  
  /**
   * Verificar se token está próximo do vencimento
   */
  static isTokenExpiringSoon(token: string, minutesThreshold: number = 5): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    const thresholdSeconds = minutesThreshold * 60;
    
    return expiresIn <= thresholdSeconds;
  }
  
  /**
   * Obter tempo restante do token em segundos
   */
  static getTokenRemainingTime(token: string): number {
    const decoded = this.decodeToken(token);
    if (!decoded) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;
    
    return Math.max(0, remaining);
  }
  
  /**
   * Verificar se usuário tem permissão no token
   */
  static hasTokenPermission(token: string, requiredRole: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return false;
    
    // Hierarquia de roles
    const roleHierarchy = {
      'guest': 0,
      'user': 1,
      'coordinator': 2,
      'manager': 3,
      'admin': 4,
      'super_admin': 5
    };
    
    const userLevel = roleHierarchy[decoded.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
    
    return userLevel >= requiredLevel;
  }
  
  // ================================================================
  // UTILITÁRIOS DE DESENVOLVIMENTO
  // ================================================================
  
  /**
   * Gerar token de desenvolvimento (apenas para testes)
   */
  static generateDevToken(overrides: Partial<JWTPayload> = {}): string {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Token de desenvolvimento não pode ser usado em produção');
    }
    
    const defaultPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: 'dev-user-id',
      email: 'dev@digiurban.com',
      role: 'admin',
      tenantId: 'dev-tenant-id',
      ...overrides
    };
    
    return jwt.sign(defaultPayload, AUTH_CONFIG.JWT_SECRET, {
      expiresIn: '1d',
      issuer: 'digiurban-auth',
      audience: 'digiurban-api'
    } as jwt.SignOptions);
  }
  
  /**
   * Verificar integridade do token (para debug)
   */
  static debugToken(token: string): {
    header: any;
    payload: any;
    signature: string;
    valid: boolean;
    expired: boolean;
    error?: string;
  } {
    try {
      const [headerB64, payloadB64, signature] = token.split('.');
      
      const header = JSON.parse(Buffer.from(headerB64, 'base64').toString());
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
      
      const verification = this.verifyAccessToken(token);
      
      return {
        header,
        payload,
        signature,
        valid: verification.valid,
        expired: verification.expired,
        error: verification.error
      };
      
    } catch (error) {
      return {
        header: null,
        payload: null,
        signature: '',
        valid: false,
        expired: false,
        error: error instanceof Error ? error.message : 'Token malformado'
      };
    }
  }
}

export default JWTUtils;