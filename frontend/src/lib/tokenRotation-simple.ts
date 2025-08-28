/**
 * SISTEMA SIMPLIFICADO DE ROTAÇÃO DE TOKENS - SEM SUPABASE
 * 
 * Implementação básica usando apenas JWT e Local Storage.
 * Remove todas as dependências do Supabase.
 */

import { APIClient } from '@/auth/utils/httpInterceptor';

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
}

export class SimpleTokenManager {
  private static instance: SimpleTokenManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  
  private constructor() {}

  static getInstance(): SimpleTokenManager {
    if (!SimpleTokenManager.instance) {
      SimpleTokenManager.instance = new SimpleTokenManager();
    }
    return SimpleTokenManager.instance;
  }

  // Salvar token no localStorage
  saveToken(tokenData: TokenData) {
    try {
      localStorage.setItem('digiurban_token', tokenData.access_token);
      
      if (tokenData.refresh_token) {
        localStorage.setItem('digiurban_refresh_token', tokenData.refresh_token);
      }
      
      if (tokenData.expires_at) {
        localStorage.setItem('digiurban_token_expires', tokenData.expires_at.toString());
      }

      console.log('🔐 Token salvo com sucesso');
      
      // Configurar renovação automática se tiver expiração
      if (tokenData.expires_at) {
        this.scheduleTokenRefresh(tokenData.expires_at);
      }
      
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  }

  // Obter token do localStorage
  getToken(): string | null {
    try {
      return localStorage.getItem('digiurban_token');
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  // Obter refresh token
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem('digiurban_refresh_token');
    } catch (error) {
      console.error('Erro ao obter refresh token:', error);
      return null;
    }
  }

  // Verificar se token está válido
  isTokenValid(): boolean {
    try {
      const token = this.getToken();
      if (!token) return false;

      const expiresAt = localStorage.getItem('digiurban_token_expires');
      if (expiresAt) {
        const expirationTime = parseInt(expiresAt, 10);
        const now = Date.now();
        
        // Considerar inválido se expira em menos de 5 minutos
        return (expirationTime - now) > (5 * 60 * 1000);
      }

      // Se não tem expiração, assumir que é válido
      return true;
    } catch (error) {
      console.error('Erro ao verificar validade do token:', error);
      return false;
    }
  }

  // Renovar token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.warn('Nenhum refresh token disponível');
        return false;
      }

      console.log('🔄 Renovando token...');

      // Chamar endpoint de refresh (se existir)
      try {
        const response = await APIClient.post<TokenData>('/auth/refresh', {
          refresh_token: refreshToken
        });

        if (response) {
          this.saveToken(response);
          console.log('✅ Token renovado com sucesso');
          return true;
        }
      } catch (apiError) {
        console.warn('Endpoint de refresh não disponível, usando token atual');
        return true; // Por enquanto, aceitar token atual
      }

      return false;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return false;
    }
  }

  // Agendar renovação do token
  private scheduleTokenRefresh(expiresAt: number) {
    // Limpar timer anterior
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    
    // Renovar 5 minutos antes da expiração
    const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 30000);

    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);

    console.log(`⏰ Renovação do token agendada para ${new Date(now + refreshTime).toLocaleTimeString()}`);
  }

  // Limpar tokens
  clearTokens() {
    try {
      localStorage.removeItem('digiurban_token');
      localStorage.removeItem('digiurban_refresh_token');
      localStorage.removeItem('digiurban_token_expires');
      
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      console.log('🗑️ Tokens limpos');
    } catch (error) {
      console.error('Erro ao limpar tokens:', error);
    }
  }

  // Inicializar sistema de tokens
  init() {
    const token = this.getToken();
    if (token && this.isTokenValid()) {
      const expiresAt = localStorage.getItem('digiurban_token_expires');
      if (expiresAt) {
        this.scheduleTokenRefresh(parseInt(expiresAt, 10));
      }
      console.log('🔐 Sistema de tokens inicializado');
    }
  }
}

// Instância global
export const tokenManager = SimpleTokenManager.getInstance();

// Inicializar automaticamente
tokenManager.init();