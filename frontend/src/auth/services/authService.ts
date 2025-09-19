// ====================================================================
// 🔐 AUTH SERVICE - DIGIURBAN JWT SYSTEM
// ====================================================================
// Serviço central de autenticação usando sistema JWT local
// Integração completa com backend Node.js + SQLite3
// ====================================================================

import type { 
  LoginCredentials, 
  UserProfile, 
  AuthResponse,
  TenantInfo 
} from "@/auth/types/auth.types";

// ====================================================================
// CONFIGURAÇÃO DA API
// ====================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3021/api';

// ====================================================================
// CLASSE PRINCIPAL DO SERVIÇO
// ====================================================================

export class AuthService {
  
  /**
   * Login - Sistema JWT local
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse<{
    user: any;
    profile: UserProfile;
    tenant: TenantInfo | null;
  }>> {
    try {
      console.log('🔐 [JWT-AUTH] Login iniciado');
      const startTime = Date.now();

      // 1. Fazer login na API local
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [JWT-AUTH] Erro de autenticação:', errorData);
        return {
          success: false,
          error: this.getErrorMessage(errorData)
        };
      }

      const loginData = await response.json();

      if (!loginData.success || !loginData.data) {
        return {
          success: false,
          error: loginData.error || 'Dados de login inválidos'
        };
      }

      const { user, tokens, tenant } = loginData.data;

      // 2. Armazenar tokens no localStorage
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);

      // 3. Transformar dados do usuário para o formato esperado
      const userProfile: UserProfile = {
        id: user.id,
        name: user.nomeCompleto,
        email: user.email,
        role: user.role,
        tenant_id: user.tenantId,
        tenant_name: tenant?.nome,
        avatar_url: user.avatarUrl,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      };

      const tenantInfo: TenantInfo | null = tenant ? {
        id: tenant.id,
        name: tenant.nome,
        plan_type: tenant.plano,
        status: tenant.status
      } : null;

      const duration = Date.now() - startTime;
      console.log(`✅ [JWT-AUTH] Login completo em ${duration}ms para role: ${user.role}`);

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            tenant_id: user.tenant_id
          },
          profile: userProfile,
          tenant: tenantInfo
        }
      };

    } catch (error: Error | unknown) {
      console.error('❌ [JWT-AUTH] Erro no login:', error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Erro inesperado durante o login'
      };
    }
  }

  /**
   * Logout - Invalidar tokens
   */
  static async logout(): Promise<AuthResponse> {
    try {
      console.log('🚪 [JWT-AUTH] Logout iniciado');
      
      const token = localStorage.getItem('access_token');
      
      if (token) {
        // Fazer logout na API (invalidar sessão)
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {
          // Ignorar erro de logout na API, continuar limpeza local
        });
      }

      // Limpar tokens locais
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth-cache');
      
      console.log('✅ [JWT-AUTH] Logout completo');
      return { success: true };

    } catch (error: Error | unknown) {
      console.error('❌ [JWT-AUTH] Erro no logout:', error);
      
      // Forçar limpeza mesmo com erro
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth-cache');
      
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Verificar sessão atual - Validar token armazenado
   */
  static async getCurrentSession(): Promise<AuthResponse<{
    user: any;
    profile: UserProfile;
    tenant: TenantInfo | null;
  } | null>> {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        return { success: true, data: null };
      }

      // Validar token na API
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        // Token inválido, limpar storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return { success: true, data: null };
      }

      const validationData = await response.json();

      if (!validationData.success || !validationData.data.valid) {
        // Token inválido, limpar storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return { success: true, data: null };
      }

      const user = validationData.data.user;

      // Recarregar perfil completo
      const profileResult = await this.getProfile(user.id);
      
      if (!profileResult.success || !profileResult.data) {
        return { success: true, data: null };
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            tenant_id: user.tenant_id
          },
          profile: profileResult.data.profile,
          tenant: profileResult.data.tenant
        }
      };

    } catch (error: Error | unknown) {
      console.error('❌ [JWT-AUTH] Erro ao verificar sessão:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Obter perfil do usuário - Usando token JWT
   */
  static async getProfile(userId: string): Promise<AuthResponse<{
    profile: UserProfile;
    tenant: TenantInfo | null;
  }>> {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        return { success: false, error: 'Token não encontrado' };
      }

      // Buscar perfil na API
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, tentar refresh
          const refreshSuccess = await this.refreshToken();
          if (refreshSuccess) {
            // Tentar novamente com novo token
            return this.getProfile(userId);
          }
        }
        return { success: false, error: 'Erro ao carregar perfil' };
      }

      const profileData = await response.json();

      if (!profileData.success || !profileData.data.user) {
        return { success: false, error: 'Perfil não encontrado' };
      }

      const userData = profileData.data.user;

      const profile: UserProfile = {
        id: userData.id,
        name: userData.nome_completo,
        email: userData.email,
        role: userData.role,
        tenant_id: userData.tenant_id,
        tenant_name: userData.tenant_name || null,
        avatar_url: userData.avatar_url,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };

      // TODO: Buscar dados do tenant se necessário
      const tenant: TenantInfo | null = userData.tenant_id ? {
        id: userData.tenant_id,
        name: userData.tenant_name || 'Tenant',
        plan_type: 'basico',
        status: 'ativo'
      } : null;

      return {
        success: true,
        data: { profile, tenant }
      };

    } catch (error: Error | unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Refresh token - Renovar token automaticamente
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        // Refresh token inválido, limpar storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return false;
      }

      const refreshData = await response.json();

      if (refreshData.success && refreshData.data.accessToken) {
        localStorage.setItem('access_token', refreshData.data.accessToken);
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ [JWT-AUTH] Erro ao renovar token:', error);
      return false;
    }
  }

  /**
   * Registrar novo usuário cidadão
   */
  static async registerCitizen(userData: {
    nome_completo: string;
    email: string;
    password: string;
  }): Promise<AuthResponse<{ user: any; requiresActivation: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/registration/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: this.getErrorMessage(data)
        };
      }

      return {
        success: true,
        data: {
          user: data.data.user,
          requiresActivation: data.data.requiresActivation || true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no registro'
      };
    }
  }

  /**
   * Registrar novo tenant (prefeitura) com admin
   */
  static async registerTenant(tenantData: {
    nome: string;
    email: string;
    telefone?: string;
    endereco?: string;
    plano: string;
    admin_nome_completo: string;
    admin_email: string;
    admin_password: string;
  }): Promise<AuthResponse<{ tenant: any; admin: any }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/registration/tenant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: this.getErrorMessage(data)
        };
      }

      return {
        success: true,
        data: {
          tenant: data.data.tenant,
          admin: data.data.admin
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no registro do tenant'
      };
    }
  }

  /**
   * Ativar conta com token
   */
  static async activateAccount(token: string): Promise<AuthResponse<{ user: any }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/registration/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: this.getErrorMessage(data)
        };
      }

      return {
        success: true,
        data: {
          user: data.data.user
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na ativação'
      };
    }
  }

  /**
   * Helper para tratar mensagens de erro
   */
  private static getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    
    const message = error?.error?.toLowerCase() || error?.message?.toLowerCase() || '';
    
    if (message.includes('credenciais inválidas') || message.includes('invalid credentials')) {
      return 'Email ou senha incorretos';
    }
    if (message.includes('email já está em uso') || message.includes('email already exists')) {
      return 'Este email já está cadastrado';
    }
    if (message.includes('usuário não encontrado') || message.includes('user not found')) {
      return 'Usuário não encontrado';
    }
    if (message.includes('conta bloqueada') || message.includes('account locked')) {
      return 'Conta temporariamente bloqueada. Tente novamente mais tarde';
    }
    if (message.includes('muitas tentativas') || message.includes('too many attempts')) {
      return 'Muitas tentativas. Tente novamente em alguns minutos';
    }
    if (message.includes('token inválido') || message.includes('invalid token')) {
      return 'Token de ativação inválido ou expirado';
    }
    
    return error?.error || error?.message || 'Erro desconhecido';
  }

  /**
   * Configurar interceptador para refresh automático
   */
  static setupTokenRefreshInterceptor(): void {
    // Usar o HTTPInterceptor mais robusto
    import('../utils/httpInterceptor').then(({ HTTPInterceptor }) => {
      HTTPInterceptor.install();
    });
  }
}

export default AuthService;