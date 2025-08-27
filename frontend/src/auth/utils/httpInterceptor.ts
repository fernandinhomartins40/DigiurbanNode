// ====================================================================
// 🌐 HTTP INTERCEPTOR - DIGIURBAN JWT SYSTEM
// ====================================================================
// Interceptador HTTP para gerenciamento automático de tokens JWT
// Implementa refresh automático e tratamento de erros
// ====================================================================

import { AuthService } from '../services/authService';
import { toast } from 'sonner';

// ====================================================================
// CONFIGURAÇÕES
// ====================================================================

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

// ====================================================================
// CLASSE DO INTERCEPTOR
// ====================================================================

export class HTTPInterceptor {
  private static isRefreshing = false;
  private static refreshPromise: Promise<boolean> | null = null;
  private static originalFetch: typeof fetch;

  /**
   * Instalar interceptor no fetch global
   */
  static install(): void {
    if (HTTPInterceptor.originalFetch) {
      console.warn('⚠️ [HTTPInterceptor] Interceptor já instalado');
      return;
    }

    HTTPInterceptor.originalFetch = window.fetch;
    window.fetch = HTTPInterceptor.interceptedFetch;
    
    console.log('✅ [HTTPInterceptor] Interceptor instalado');
  }

  /**
   * Desinstalar interceptor
   */
  static uninstall(): void {
    if (!HTTPInterceptor.originalFetch) {
      return;
    }

    window.fetch = HTTPInterceptor.originalFetch;
    HTTPInterceptor.originalFetch = undefined as any;
    HTTPInterceptor.isRefreshing = false;
    HTTPInterceptor.refreshPromise = null;

    console.log('✅ [HTTPInterceptor] Interceptor removido');
  }

  /**
   * Fetch interceptado
   */
  private static async interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url = input.toString();
    
    // Se não é uma requisição para nossa API, usar fetch original
    if (!url.includes(API_BASE_URL)) {
      return HTTPInterceptor.originalFetch(input, init);
    }

    // Preparar headers com token
    const modifiedInit = HTTPInterceptor.addAuthHeader(init);

    try {
      // Fazer requisição
      let response = await HTTPInterceptor.originalFetch(input, modifiedInit);

      // Se recebeu 401 e temos token, tentar refresh
      if (response.status === 401 && HTTPInterceptor.hasToken()) {
        console.log('🔄 [HTTPInterceptor] Token expirado, tentando refresh');

        const refreshSuccess = await HTTPInterceptor.handleTokenRefresh();
        
        if (refreshSuccess) {
          // Tentar novamente com novo token
          const newInit = HTTPInterceptor.addAuthHeader(init);
          response = await HTTPInterceptor.originalFetch(input, newInit);
          
          console.log('✅ [HTTPInterceptor] Requisição repetida com sucesso após refresh');
        } else {
          // Refresh falhou, redirecionar para login
          HTTPInterceptor.handleAuthenticationFailure();
        }
      }

      return response;

    } catch (error) {
      console.error('❌ [HTTPInterceptor] Erro na requisição:', error);
      throw error;
    }
  }

  /**
   * Adicionar header de autorização
   */
  private static addAuthHeader(init?: RequestInit): RequestInit {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return init || {};
    }

    return {
      ...init,
      headers: {
        ...init?.headers,
        'Authorization': `Bearer ${token}`,
      },
    };
  }

  /**
   * Verificar se tem token
   */
  private static hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Gerenciar refresh de token
   */
  private static async handleTokenRefresh(): Promise<boolean> {
    // Se já está fazendo refresh, aguardar
    if (HTTPInterceptor.isRefreshing) {
      return HTTPInterceptor.refreshPromise || Promise.resolve(false);
    }

    // Marcar como fazendo refresh
    HTTPInterceptor.isRefreshing = true;
    
    HTTPInterceptor.refreshPromise = AuthService.refreshToken()
      .then((success) => {
        if (success) {
          console.log('✅ [HTTPInterceptor] Token renovado com sucesso');
        } else {
          console.log('❌ [HTTPInterceptor] Falha na renovação do token');
        }
        return success;
      })
      .catch((error) => {
        console.error('❌ [HTTPInterceptor] Erro no refresh:', error);
        return false;
      })
      .finally(() => {
        HTTPInterceptor.isRefreshing = false;
        HTTPInterceptor.refreshPromise = null;
      });

    return HTTPInterceptor.refreshPromise;
  }

  /**
   * Tratar falha de autenticação
   */
  private static handleAuthenticationFailure(): void {
    console.log('🚪 [HTTPInterceptor] Sessão expirada, fazendo logout');
    
    // Limpar tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth-cache');
    
    // Mostrar notificação
    toast.error('Sessão expirada. Faça login novamente.');
    
    // Redirecionar para login
    window.location.href = '/auth/login';
  }

  /**
   * Obter estatísticas do interceptor
   */
  static getStats(): {
    installed: boolean;
    isRefreshing: boolean;
    hasToken: boolean;
  } {
    return {
      installed: !!HTTPInterceptor.originalFetch,
      isRefreshing: HTTPInterceptor.isRefreshing,
      hasToken: HTTPInterceptor.hasToken()
    };
  }
}

// ====================================================================
// UTILITÁRIO DE REQUISIÇÕES COM RETRY
// ====================================================================

export class APIClient {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 segundo

  /**
   * Fazer requisição com retry automático
   */
  static async request<T>(
    url: string,
    options: RequestInit = {},
    retries: number = APIClient.MAX_RETRIES
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        // Se é erro 5xx e ainda tem retries, tentar novamente
        if (response.status >= 500 && retries > 0) {
          console.warn(`⚠️ [APIClient] Erro ${response.status}, tentando novamente em ${APIClient.RETRY_DELAY}ms`);
          
          await APIClient.delay(APIClient.RETRY_DELAY);
          return APIClient.request<T>(url, options, retries - 1);
        }
        
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      // Se é erro de rede e ainda tem retries, tentar novamente
      if (retries > 0 && error instanceof TypeError) {
        console.warn(`⚠️ [APIClient] Erro de rede, tentando novamente em ${APIClient.RETRY_DELAY}ms`);
        
        await APIClient.delay(APIClient.RETRY_DELAY);
        return APIClient.request<T>(url, options, retries - 1);
      }

      throw error;
    }
  }

  /**
   * GET com retry
   */
  static get<T>(url: string): Promise<T> {
    return APIClient.request<T>(url, { method: 'GET' });
  }

  /**
   * POST com retry
   */
  static post<T>(url: string, data?: any): Promise<T> {
    return APIClient.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT com retry
   */
  static put<T>(url: string, data?: any): Promise<T> {
    return APIClient.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE com retry
   */
  static delete<T>(url: string): Promise<T> {
    return APIClient.request<T>(url, { method: 'DELETE' });
  }

  /**
   * Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ====================================================================
// AUTO-INSTALAÇÃO (SE NECESSÁRIO)
// ====================================================================

// Instalar automaticamente quando módulo for importado
if (typeof window !== 'undefined' && !HTTPInterceptor.getStats().installed) {
  HTTPInterceptor.install();
}

export default HTTPInterceptor;