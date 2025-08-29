/**
 * SERVIÇO DE GESTÃO DE USUÁRIOS - ARQUITETURA PROFISSIONAL
 * 
 * Implementação limpa, robusta e previsível para operações CRUD de usuários.
 * Sem gambiarras, sem múltiplas tentativas, sem fallbacks desnecessários.
 * 
 * @author Claude Code
 * @version 2.0 - Arquitetura Profissional
 */

import { APIClient } from '@/auth/utils/httpInterceptor';
import { JWT_CONFIG } from '@/auth/config/authConfig';

/**
 * Extrai mensagem segura de erro
 */
const getErrorMessage = (error): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido';
};


// ====================================================================
// INTERFACES TYPESCRIPT PARA TYPE SAFETY
// ====================================================================

export interface CreateUserData {
  nome_completo: string;
  email: string;
  tipo_usuario: string;
  tenant_id: string;
  cargo?: string;
  departamento?: string;
  senha: string;
  telefone?: string;
}

export interface UserProfile {
  id: string;
  nome_completo: string;
  email: string;
  tipo_usuario: string;
  tenant_id: string;
  cargo?: string;
  departamento?: string;
  telefone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Tenant {
  id: string;
  nome: string;
}

// ====================================================================
// CONFIGURAÇÃO CENTRALIZADA
// ====================================================================

class APIConfigService {
  static readonly BASE_URL = JWT_CONFIG.api.baseUrl;
  
  static validateConfig(): void {
    if (!this.BASE_URL) {
      throw new Error('API URL não configurada');
    }
  }
  
  static getHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }
}

// ====================================================================
// CLIENTE HTTP JWT - USA O INTERCEPTOR AUTOMÁTICO
// ====================================================================

// O APIClient já inclui interceptação automática de tokens
// Não precisamos reimplementar a lógica HTTP

// ====================================================================
// SERVIÇO DE GESTÃO DE USUÁRIOS - ARQUITETURA LIMPA
// ====================================================================

class UserManagementService {
  
  /**
   * Criar usuário completo (Auth + Profile) - MÉTODO ÚNICO E ROBUSTO
   */
  static async createUser(userData: CreateUserData): Promise<ApiResponse<UserProfile>> {
    console.log(`🔐 [UserService] Criando usuário: ${userData.email}`);
    
    try {
      // Etapa 1: Criar usuário no Supabase Auth
      const authUser = await this.createAuthUser(userData);
      
      // Etapa 2: Criar perfil do usuário
      const profile = await this.createUserProfile(authUser.id, userData);
      
      console.log(`✅ [UserService] Usuário criado com sucesso: ${profile.id}`);
      return {
        success: true,
        data: profile
      };
      
    } catch (error: Error | unknown) {
      console.error(`❌ [UserService] Erro na criação do usuário:`, error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Erro interno na criação do usuário'
      };
    }
  }

  /**
   * Criar usuário via API JWT - IMPLEMENTAÇÃO ROBUSTA
   */
  private static async createAuthUser(userData: CreateUserData): Promise<any> {
    console.log(`🔑 [Auth] Criando usuário auth: ${userData.email}`);
    
    const authData = await APIClient.post('/auth/register', {
      email: userData.email,
      password: userData.senha,
      nome_completo: userData.nome_completo,
      tenant_id: userData.tenant_id
    });

    if (!authData.data?.user?.id) {
      throw new Error('Usuário auth criado mas ID não retornado');
    }

    console.log(`✅ [Auth] Usuário auth criado: ${authData.data.user.id}`);
    return authData.data.user;
  }

  /**
   * Criar perfil do usuário - COM ROLLBACK AUTOMÁTICO
   */
  private static async createUserProfile(userId: string, userData: CreateUserData): Promise<UserProfile> {
    console.log(`📝 [Profile] Criando perfil: ${userId}`);
    
    try {
      const data = await APIClient.post('/users/profile', {
        id: userId,
        nome_completo: userData.nome_completo,
        email: userData.email,
        tipo_usuario: userData.tipo_usuario,
        tenant_id: userData.tenant_id,
        cargo: userData.cargo || userData.tipo_usuario,
        departamento: userData.departamento,
        telefone: userData.telefone,
        status: 'ativo',
        primeiro_acesso: true,
        senha_temporaria: true
      });

      if (!data) {
        await this.deleteAuthUser(userId);
        throw new Error('Perfil não foi criado corretamente');
      }

      console.log(`✅ [Profile] Perfil criado: ${data.id}`);
      return data;
      
    } catch (error: Error | unknown) {
      // Garantir rollback em qualquer erro
      await this.deleteAuthUser(userId);
      throw error;
    }
  }

  /**
   * Deletar usuário auth (para rollback) - IMPLEMENTAÇÃO ROBUSTA
   */
  private static async deleteAuthUser(userId: string): Promise<void> {
    try {
      console.log(`🗑️ [Rollback] Removendo usuário auth: ${userId}`);
      
      await APIClient.delete(`/users/${userId}`);
      
      console.log(`✅ [Rollback] Usuário auth removido: ${userId}`);
    } catch (error) {
      console.error(`⚠️ [Rollback] Falha ao remover usuário auth:`, error);
      // Não propagar erro de rollback para não mascarar erro original
    }
  }

  /**
   * Obter lista de tenants - IMPLEMENTAÇÃO SIMPLES E DIRETA
   */
  static async getTenants(): Promise<ApiResponse<Tenant[]>> {
    console.log(`🏢 [Tenants] Carregando lista de tenants`);
    
    try {
      const response = await APIClient.get<{
        success: boolean;
        data: {
          tenants: Tenant[];
          total: number;
        };
      }>('/tenants');

      const tenants = response?.data?.tenants || [];
      console.log(`✅ [Tenants] ${tenants.length} tenants carregadas`);
      return {
        success: true,
        data: tenants
      };
      
    } catch (error: Error | unknown) {
      console.error(`❌ [Tenants] Erro geral:`, error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Erro interno ao carregar tenants'
      };
    }
  }

  /**
   * Listar usuários com filtros - IMPLEMENTAÇÃO PROFISSIONAL
   */
  static async getUsers(filters?: {
    tenant_id?: string;
    tipo_usuario?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<UserProfile[]>> {
    console.log(`👥 [Users] Listando usuários`);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.tenant_id) queryParams.append('tenant_id', filters.tenant_id);
      if (filters?.tipo_usuario) queryParams.append('tipo_usuario', filters.tipo_usuario);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.offset) queryParams.append('offset', filters.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/users?${queryString}` : '/users';
      
      const response = await APIClient.get<{
        success: boolean;
        data: {
          users: UserProfile[];
          total: number;
        };
      }>(endpoint);

      const users = response?.data?.users || [];
      console.log(`✅ [Users] ${users.length} usuários listados`);
      return {
        success: true,
        data: users
      };
      
    } catch (error: Error | unknown) {
      console.error(`❌ [Users] Erro ao listar usuários:`, error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Erro interno ao listar usuários'
      };
    }
  }

  /**
   * Atualizar usuário - IMPLEMENTAÇÃO ROBUSTA
   */
  static async updateUser(userId: string, updates: Partial<CreateUserData>): Promise<ApiResponse<UserProfile>> {
    console.log(`📝 [Users] Atualizando usuário: ${userId}`);
    
    try {
      const data = await APIClient.put<UserProfile>(`/users/${userId}`, {
        ...updates,
        updated_at: new Date().toISOString()
      });

      if (!data) {
        throw new Error('Usuário não encontrado para atualização');
      }

      console.log(`✅ [Users] Usuário atualizado: ${data.id}`);
      return {
        success: true,
        data
      };
      
    } catch (error: Error | unknown) {
      console.error(`❌ [Users] Erro ao atualizar usuário:`, error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Erro interno ao atualizar usuário'
      };
    }
  }

  /**
   * Alterar status do usuário - IMPLEMENTAÇÃO REAL
   */
  static async updateUserStatus(userId: string, status: 'ativo' | 'suspenso' | 'inativo' | 'sem_vinculo'): Promise<ApiResponse<UserProfile>> {
    console.log(`🔄 [Users] Alterando status do usuário: ${userId} para ${status}`);
    
    try {
      const data = await APIClient.put<UserProfile>(`/users/${userId}/status`, {
        status,
        updated_at: new Date().toISOString()
      });

      if (!data) {
        throw new Error('Usuário não encontrado');
      }

      console.log(`✅ [Users] Status atualizado: ${data.id} -> ${status}`);
      return {
        success: true,
        data
      };
      
    } catch (error: Error | unknown) {
      console.error(`❌ [Users] Erro ao atualizar status:`, error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Erro interno ao atualizar status'
      };
    }
  }

  /**
   * Deletar usuário - IMPLEMENTAÇÃO REAL
   */
  static async deleteUser(userId: string): Promise<ApiResponse<void>> {
    console.log(`🗑️ [Users] Deletando usuário: ${userId}`);
    
    try {
      await APIClient.delete(`/users/${userId}`);

      console.log(`✅ [Users] Usuário deletado: ${userId}`);
      return {
        success: true
      };
      
    } catch (error: Error | unknown) {
      console.error(`❌ [Users] Erro ao deletar usuário:`, error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Erro interno ao deletar usuário'
      };
    }
  }

  /**
   * Reset de senha - IMPLEMENTAÇÃO REAL
   */
  static async resetUserPassword(userId: string): Promise<ApiResponse<void>> {
    console.log(`🔑 [Users] Reset de senha para usuário: ${userId}`);
    
    try {
      await APIClient.post(`/users/${userId}/reset-password`, {
        force_reset: true
      });

      console.log(`✅ [Users] Reset de senha realizado: ${userId}`);
      return {
        success: true
      };
      
    } catch (error: Error | unknown) {
      console.error(`❌ [Users] Erro no reset de senha:`, error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Erro interno no reset de senha'
      };
    }
  }

  /**
   * Atualizar usuários órfãos quando tenant é deletada
   */
  static async handleTenantDeletion(tenantId: string): Promise<ApiResponse<number>> {
    console.log(`🏢 [Users] Atualizando usuários órfãos do tenant: ${tenantId}`);
    
    try {
      const data = await APIClient.post<{updated_count: number}>(`/tenants/${tenantId}/orphan-users`, {
        status: 'sem_vinculo'
      });

      const updatedCount = data?.updated_count || 0;
      console.log(`✅ [Users] ${updatedCount} usuários marcados como 'sem_vinculo'`);
      
      return {
        success: true,
        data: updatedCount
      };
      
    } catch (error: Error | unknown) {
      console.error(`❌ [Users] Erro ao processar usuários órfãos:`, error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Erro interno ao processar usuários órfãos'
      };
    }
  }
}

export default UserManagementService;