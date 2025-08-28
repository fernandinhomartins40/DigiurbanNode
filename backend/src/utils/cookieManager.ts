// ====================================================================
// 🍪 COOKIE MANAGER - DIGIURBAN SECURE COOKIES
// ====================================================================
// Gerenciamento seguro de cookies JWT com httpOnly
// Proteção contra XSS e CSRF
// ====================================================================

import { Request, Response } from 'express';
import { COOKIE_CONFIG, isProduction } from '../config/auth.js';

export class CookieManager {
  
  /**
   * Definir cookie de access token de forma segura
   */
  static setAccessToken(res: Response, token: string): void {
    res.cookie('access_token', token, {
      ...COOKIE_CONFIG.OPTIONS,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      secure: isProduction(),
      domain: process.env.COOKIE_DOMAIN || undefined
    });
  }

  /**
   * Definir cookie de refresh token de forma segura
   */
  static setRefreshToken(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_CONFIG.OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      secure: isProduction(),
      domain: process.env.COOKIE_DOMAIN || undefined
    });
  }

  /**
   * Extrair access token do cookie
   */
  static getAccessToken(req: Request): string | null {
    return req.cookies?.access_token || null;
  }

  /**
   * Extrair refresh token do cookie
   */
  static getRefreshToken(req: Request): string | null {
    return req.cookies?.refresh_token || null;
  }

  /**
   * Limpar todos os cookies de autenticação
   */
  static clearAuthCookies(res: Response): void {
    const cookieOptions = {
      ...COOKIE_CONFIG.OPTIONS,
      maxAge: 0,
      secure: isProduction(),
      domain: process.env.COOKIE_DOMAIN || undefined
    };

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);
    res.clearCookie('session_id', cookieOptions);
  }

  /**
   * Definir cookie de sessão
   */
  static setSessionId(res: Response, sessionId: string): void {
    res.cookie('session_id', sessionId, {
      ...COOKIE_CONFIG.OPTIONS,
      maxAge: COOKIE_CONFIG.OPTIONS.maxAge,
      secure: isProduction(),
      domain: process.env.COOKIE_DOMAIN || undefined
    });
  }

  /**
   * Extrair session ID do cookie
   */
  static getSessionId(req: Request): string | null {
    return req.cookies?.session_id || null;
  }

  /**
   * Definir cookie de CSRF token
   */
  static setCSRFToken(res: Response, csrfToken: string): void {
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false, // Precisa ser acessível pelo JS para ser enviado nos headers
      secure: isProduction(),
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      domain: process.env.COOKIE_DOMAIN || undefined
    });
  }

  /**
   * Extrair CSRF token do cookie
   */
  static getCSRFToken(req: Request): string | null {
    return req.cookies?.csrf_token || null;
  }

  /**
   * Verificar se o request tem cookies válidos
   */
  static hasValidAuthCookies(req: Request): boolean {
    const accessToken = this.getAccessToken(req);
    const refreshToken = this.getRefreshToken(req);
    
    return !!(accessToken && refreshToken);
  }

  /**
   * Extrair token do header Authorization OU cookie
   */
  static extractToken(req: Request): string | null {
    // Primeiro tenta extrair do cookie (mais seguro)
    const cookieToken = this.getAccessToken(req);
    if (cookieToken) {
      return cookieToken;
    }

    // Fallback para Authorization header (compatibilidade)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  /**
   * Definir todos os cookies de autenticação de uma vez
   */
  static setAuthCookies(res: Response, data: {
    accessToken: string;
    refreshToken: string;
    sessionId?: string;
    csrfToken?: string;
  }): void {
    this.setAccessToken(res, data.accessToken);
    this.setRefreshToken(res, data.refreshToken);
    
    if (data.sessionId) {
      this.setSessionId(res, data.sessionId);
    }

    if (data.csrfToken) {
      this.setCSRFToken(res, data.csrfToken);
    }
  }

  /**
   * Rotacionar cookies de autenticação
   */
  static rotateAuthCookies(res: Response, data: {
    newAccessToken: string;
    newRefreshToken?: string;
  }): void {
    this.setAccessToken(res, data.newAccessToken);
    
    if (data.newRefreshToken) {
      this.setRefreshToken(res, data.newRefreshToken);
    }
  }

  /**
   * Validar se o environment está configurado corretamente para cookies
   */
  static validateCookieConfig(): void {
    if (isProduction()) {
      if (!process.env.COOKIE_DOMAIN) {
        console.warn('⚠️ AVISO: COOKIE_DOMAIN não definido em produção');
      }

      if (!COOKIE_CONFIG.OPTIONS.secure) {
        throw new Error('🚨 ERRO: Cookies devem ser secure em produção!');
      }
    }
  }
}

export default CookieManager;