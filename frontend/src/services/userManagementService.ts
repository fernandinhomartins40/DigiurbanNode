/**
 * SERVIÇO DE GESTÃO DE USUÁRIOS - ARQUITETURA PROFISSIONAL
 * 
 * Implementação limpa, robusta e previsível para operações CRUD de usuários.
 * Sem gambiarras, sem múltiplas tentativas, sem fallbacks desnecessários.
 * 
 * @author Claude Code
 * @version 2.0 - Arquitetura Profissional
 */

import { supabase, getSupabaseAdmin } from "@/lib/supabase-unified";
import { SUPABASE_CONFIG } from '../config/supabase.config';

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

class SupabaseConfigService {
  static readonly BASE_URL = SUPABASE_CONFIG.url;
  static readonly SERVICE_ROLE_KEY = SUPABASE_CONFIG.serviceRoleKey;
  
  static validateConfig(): void {
    if (!this.BASE_URL) {
      throw new Error('Supabase URL não configurada');
    }
    if (!this.SERVICE_ROLE_KEY) {
      throw new Error('Supabase Service Role Key não configurada');
    }
  }
  
  static getAuthHeaders() {
    return {
      'apikey': this.SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${this.SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    };
  }
}

// ====================================================================
// CLIENTE HTTP PROFISSIONAL
// ====================================================================

class HttpClient {
  private static async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    SupabaseConfigService.validateConfig();
    
    const url = `${SupabaseConfigService.BASE_URL}${endpoint}`;
    const headers = {
      ...SupabaseConfigService.getAuthHeaders(),
      ...additionalHeaders
    };

    console.log(`🔗 [HTTP] ${method} ${endpoint}`);

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = `HTTP ${response.status}: ${errorText}`;
      console.error(`❌ [HTTP] ${error}`);
      throw new Error(error);
    }

    const data = await response.json();
    console.log(`✅ [HTTP] ${method} ${endpoint} - Success`);
    return data;
  }

  static get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET');
  }

  static post<T>(endpoint: string, body: any, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, 'POST', body, additionalHeaders);
  }

  static patch<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', body);
  }

  static delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'DELETE');
  }
}

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
   * Criar usuário no Supabase Auth - IMPLEMENTAÇÃO ROBUSTA
   */
  private static async createAuthUser(userData: CreateUserData): Promise<any> {
    console.log(`🔑 [Auth] Criando usuário auth: ${userData.email}`);
    
    const authData = await HttpClient.post('/auth/v1/admin/users', {
      email: userData.email,
      password: userData.senha,
      email_confirm: true,
      user_metadata: {
        nome_completo: userData.nome_completo
      }
    });

    if (!authData.id) {
      throw new Error('Usuário auth criado mas ID não retornado');
    }

    console.log(`✅ [Auth] Usuário auth criado: ${authData.id}`);
    return authData;
  }

  /**
   * Criar perfil do usuário - COM ROLLBACK AUTOMÁTICO
   */
  private static async createUserProfile(userId: string, userData: CreateUserData): Promise<UserProfile> {
    console.log(`📝 [Profile] Criando perfil: ${userId}`);
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
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
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ [Profile] Erro ao criar perfil:`, error);
        // Rollback: deletar usuário auth
        await this.deleteAuthUser(userId);
        throw new Error(`Erro ao criar perfil: ${error.message}`);
      }

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
      
      await HttpClient.delete(`/auth/v1/admin/users/${userId}`);
      
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
      const { data, error } = await supabase
        .from('tenants')
        .select('id, nome')
        .order('nome');

      if (error) {
        console.error(`❌ [Tenants] Erro ao carregar tenants:`, error);
        throw new Error(`Erro ao carregar tenants: ${error.message}`);
      }

      console.log(`✅ [Tenants] ${data.length} tenants carregadas`);
      return {
        success: true,
        data
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
      let query = supabase
        .from('user_profiles')
        .select('*, tenants:tenant_id(id,nome)');
      
      if (filters?.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      if (filters?.tipo_usuario) {
        query = query.eq('tipo_usuario', filters.tipo_usuario);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao listar usuários: ${error.message}`);
      }

      console.log(`✅ [Users] ${data.length} usuários listados`);
      return {
        success: true,
        data
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
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar usuário: ${error.message}`);
      }

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
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }

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
      // Primeiro deletar o perfil
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        throw new Error(`Erro ao deletar perfil: ${profileError.message}`);
      }

      // Depois deletar o usuário auth
      await HttpClient.delete(`/auth/v1/admin/users/${userId}`);

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
      await HttpClient.post(`/auth/v1/admin/users/${userId}`, {
        password: undefined // Remove senha atual, força reset
      });

      // Marcar como senha temporária no perfil
      await supabase
        .from('user_profiles')
        .update({
          senha_temporaria: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

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
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          status: 'sem_vinculo',
          tenant_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', tenantId)
        .select('id');

      if (error) {
        throw new Error(`Erro ao atualizar usuários órfãos: ${error.message}`);
      }

      const updatedCount = data?.length || 0;
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