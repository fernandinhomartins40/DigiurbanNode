import { supabase } from "@/lib/supabase";
import { supabaseAdmin, logSystemActivity } from "@/lib/supabaseAdmin";
import { validateUUID, formatUUIDForLog } from '../utils/uuid';
import { TenantPadrao, PlanoTenant, StatusTenant, EnderecoPadrao } from "@/types/common";
import UserManagementService from './userManagementService';

// ====================================================================
// INTERFACES - USANDO TIPOS PADRONIZADOS
// ====================================================================

export interface CreateTenantData {
  nome: string;
  cidade: string;
  estado: string;
  populacao: number;
  cnpj: string;
  endereco?: string;
  cep?: string;
  plano: PlanoTenant;
  // Dados de contato (NÃO criam usuário, apenas informações)
  responsavel_nome?: string;
  responsavel_email?: string;
  responsavel_telefone?: string;
}

export interface UpdateTenantData {
  nome?: string;
  cidade?: string;
  estado?: string;
  populacao?: number;
  endereco?: EnderecoPadrao;
  plano?: PlanoTenant;
  responsavel?: {
    nome?: string;
    email?: string;
    telefone?: string;
    cargo?: string;
  };
}

// ====================================================================
// SERVIÇO DE TENANT - APENAS OPERAÇÕES ORGANIZACIONAIS
// ====================================================================

export class TenantService {
  
  /**
   * Criar apenas tenant (organização) - SEM usuário
   */
  static async createTenant(tenantData: CreateTenantData): Promise<TenantPadrao> {
    try {
      console.log('🏛️ Criando tenant (apenas organização):', tenantData.nome);
      
      // 1. Gerar código único para o tenant
      const tenantCode = await TenantService.generateUniqueTenantCode(tenantData.nome);
      console.log('🏷️ Código do tenant gerado:', tenantCode);
      
      // 2. Validar CNPJ único
      const cnpjExists = await TenantService.checkCnpjExists(tenantData.cnpj);
      if (cnpjExists) {
        throw new Error('CNPJ já está sendo usado por outro tenant');
      }
      
      // 3. Criar tenant usando RPC segura
      const { data: result, error: tenantError } = await supabase.rpc('create_tenant_safe', {
        tenant_data: {
          nome: tenantData.nome,
          cidade: tenantData.cidade,
          estado: tenantData.estado,
          populacao: tenantData.populacao,
          cnpj: tenantData.cnpj,
          endereco: tenantData.endereco,
          plano: tenantData.plano,
          responsavel_nome: tenantData.responsavel_nome,
          responsavel_email: tenantData.responsavel_email,
          responsavel_telefone: tenantData.responsavel_telefone
        }
      });
      
      if (tenantError || !result?.success) {
        console.error('❌ Erro ao criar tenant:', tenantError || result?.error);
        throw new Error(`Erro ao criar tenant: ${tenantError?.message || result?.error}`);
      }
      
      // Buscar tenant criado para retornar
      const { data: tenant, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', result.tenant_id)
        .single();
        
      if (fetchError) {
        console.error('❌ Erro ao buscar tenant criado:', fetchError);
        throw new Error(`Tenant criado mas erro ao buscar: ${fetchError.message}`);
      }
      
      console.log('✅ Tenant criado com sucesso:', tenant.id);
      
      // 4. Registrar atividade de criação
      await logSystemActivity({
        user_id: null, // Criado pelo super admin
        tenant_id: tenant.id,
        acao: 'Tenant criado',
        detalhes: `Tenant ${tenant.nome} (${tenant.tenant_code}) criado na cidade ${tenant.cidade}/${tenant.estado}`,
        categoria: 'tenants',
        metadata: {
          tenant_id: tenant.id,
          tenant_code: tenant.tenant_code,
          tenant_name: tenant.nome,
          plano: tenant.plano,
          created_by: 'super_admin'
        }
      });
      
      return tenant;
      
    } catch (error) {
      console.error('❌ Erro ao criar tenant:', error);
      throw error;
    }
  }
  
  /**
   * Atualizar tenant via RPC segura
   */
  static async updateTenant(tenantId: string, updates: UpdateTenantData): Promise<TenantPadrao> {
    try {
      // Validar UUID
      validateUUID(tenantId, 'ID do tenant');
      
      console.log('🏛️ Atualizando tenant via RPC:', formatUUIDForLog(tenantId));
      console.log('📝 Dados para atualização:', updates);
      
      // 1. Verificar se tenant existe
      const existingTenant = await TenantService.getTenantById(tenantId);
      if (!existingTenant) {
        throw new Error('Tenant não encontrado');
      }
      
      // 2. Usar RPC segura com SECURITY DEFINER para bypass de RLS
      const { data: rpcResult, error: rpcError } = await supabase.rpc('update_tenant_safe', {
        p_tenant_id: tenantId,
        p_updates: updates
      });
      
      if (rpcError) {
        console.error('❌ Erro na RPC update_tenant_safe:', rpcError);
        throw new Error(`Erro RPC ao atualizar tenant: ${rpcError.message}`);
      }
      
      console.log('📋 Resultado da RPC update:', rpcResult);
      
      // Verificar se a RPC foi bem-sucedida
      if (!rpcResult?.success) {
        const errorMsg = rpcResult?.error || 'Erro desconhecido na RPC';
        console.error('❌ RPC retornou falha:', errorMsg);
        throw new Error(`Falha na atualização via RPC: ${errorMsg}`);
      }
      
      console.log('✅ Tenant atualizado com sucesso via RPC:', tenantId, rpcResult.tenant_name);
      
      // 3. Registrar atividade (será feito via RPC segura também)
      try {
        await logSystemActivity({
          user_id: null,
          tenant_id: tenantId,
          acao: 'Tenant atualizado',
          detalhes: `Tenant ${rpcResult.tenant_name} foi atualizado via RPC segura`,
          categoria: 'tenants',
          metadata: {
            tenant_id: tenantId,
            tenant_name: rpcResult.tenant_name,
            updates: updates,
            updated_by: 'super_admin',
            update_type: 'rpc_security_definer'
          }
        });
      } catch (logError) {
        console.warn('⚠️ Falha ao registrar log (tenant foi atualizado com sucesso):', logError);
      }
      
      // Retornar o tenant atualizado da RPC
      return rpcResult.updated_tenant;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar tenant:', error);
      throw error;
    }
  }
  
  /**
   * Excluir tenant (soft delete) - Método simplificado
   */
  static async deleteTenant(tenantId: string): Promise<void> {
    try {
      // Validar UUID usando função utilitária
      validateUUID(tenantId, 'ID do tenant');
      
      console.log('🗑️ Excluindo tenant:', formatUUIDForLog(tenantId));
      console.log('🔍 UUID bruto recebido:', JSON.stringify(tenantId));
      console.log('🔍 Tipo do UUID:', typeof tenantId);
      console.log('🔍 Comprimento do UUID:', tenantId?.length);
      
      // 1. Verificar se tenant existe antes de tentar excluir
      const existingTenant = await TenantService.getTenantById(tenantId);
      if (!existingTenant) {
        throw new Error('Tenant não encontrado');
      }
      
      console.log('✅ Tenant encontrado:', existingTenant.nome);
      console.log('🔍 ID do tenant existente:', existingTenant.id);
      
      // 2. Preparar dados para atualização (apenas campos necessários)
      const updateData = {
        status: 'suspenso',
        updated_at: new Date().toISOString()
      };
      
      console.log('🔧 Dados para atualização:', JSON.stringify(updateData));
      console.log('🎯 Condição WHERE - tenantId:', JSON.stringify(tenantId));
      
      // 3. Usar RPC segura com SECURITY DEFINER para bypass de RLS
      const { data: rpcResult, error: rpcError } = await supabase.rpc('delete_tenant_safe', {
        p_tenant_id: tenantId
      });
      
      if (rpcError) {
        console.error('❌ Erro na RPC delete_tenant_safe:', rpcError);
        throw new Error(`Erro RPC ao excluir tenant: ${rpcError.message}`);
      }
      
      console.log('📋 Resultado da RPC:', rpcResult);
      
      // Verificar se a RPC foi bem-sucedida
      if (!rpcResult?.success) {
        const errorMsg = rpcResult?.error || 'Erro desconhecido na RPC';
        console.error('❌ RPC retornou falha:', errorMsg);
        throw new Error(`Falha na exclusão via RPC: ${errorMsg}`);
      }
      
      console.log('✅ Tenant excluído com sucesso via RPC:', tenantId, rpcResult.tenant_name);
      
      // 4. Atualizar usuários órfãos (definir como 'sem_vinculo')
      try {
        const orphanResult = await UserManagementService.handleTenantDeletion(tenantId);
        if (orphanResult.success && orphanResult.data && orphanResult.data > 0) {
          console.log(`✅ ${orphanResult.data} usuários marcados como 'sem_vinculo'`);
        }
      } catch (orphanError) {
        console.warn('⚠️ Falha ao processar usuários órfãos (tenant foi excluído com sucesso):', orphanError);
      }
      
      // 5. Registrar atividade
      await logSystemActivity({
        user_id: null,
        tenant_id: tenantId,
        acao: 'Tenant excluído',
        detalhes: `Tenant ${existingTenant.nome} foi suspenso via RPC segura`,
        categoria: 'tenants',
        metadata: {
          tenant_id: tenantId,
          tenant_name: existingTenant.nome,
          deleted_by: 'super_admin',
          deletion_type: 'rpc_security_definer',
          rpc_result: rpcResult
        }
      });
      
    } catch (error) {
      console.error('❌ Erro ao excluir tenant:', error);
      throw error;
    }
  }
  
  /**
   * Buscar tenant por ID
   */
  static async getTenantById(tenantId: string): Promise<TenantPadrao | null> {
    try {
      const { data: tenant, error } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .neq('status', 'suspenso')
        .neq('status', 'cancelado')
        .single();
      
      if (error || !tenant) {
        return null;
      }
      
      return tenant;
    } catch (error) {
      console.error('❌ Erro ao buscar tenant:', error);
      return null;
    }
  }
  
  /**
   * Listar todos os tenants usando RPC segura
   */
  static async getAllTenants(): Promise<TenantPadrao[]> {
    try {
      console.log('🔄 Buscando tenants via RPC segura...');
      
      const { data: tenants, error } = await supabase.rpc('get_tenants_for_user');
      
      if (error) {
        console.error('❌ Erro ao buscar tenants via RPC:', error);
        throw new Error(`Erro ao buscar tenants: ${error.message}`);
      }
      
      console.log('✅ Tenants carregados via RPC:', tenants?.length || 0);
      return tenants || [];
    } catch (error) {
      console.error('❌ Erro ao listar tenants:', error);
      throw error;
    }
  }
  
  /**
   * Verificar se CNPJ já existe usando RPC segura
   */
  static async checkCnpjExists(cnpj: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_cnpj_available', { cnpj_input: cnpj });
      
      if (error) {
        console.error('❌ Erro ao verificar CNPJ:', error);
        return false;
      }
      
      return !data?.available; // Se não está disponível, então existe
    } catch {
      return false;
    }
  }
  
  /**
   * Marcar tenant como tendo admin
   */
  static async markTenantAsHavingAdmin(tenantId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('tenants')
        .update({
          has_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId);
      
      if (error) {
        throw new Error(`Erro ao marcar tenant com admin: ${error.message}`);
      }
      
      console.log('✅ Tenant marcado como tendo admin:', tenantId);
    } catch (error) {
      console.error('❌ Erro ao marcar tenant com admin:', error);
      throw error;
    }
  }
  
  /**
   * Gerar código único para o tenant
   */
  private static async generateUniqueTenantCode(nome: string): Promise<string> {
    // Criar código baseado no nome (primeiras 3 letras + 3 dígitos)
    const baseCode = nome
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .substring(0, 3)
      .padEnd(3, 'A');
    
    // Tentar códigos sequenciais até encontrar um único
    for (let i = 1; i <= 999; i++) {
      const code = `${baseCode}${i.toString().padStart(3, '0')}`;
      
      const { data, error } = await supabaseAdmin
        .from('tenants')
        .select('tenant_code')
        .eq('tenant_code', code)
        .maybeSingle();
      
      if (!data) {
        return code;
      }
    }
    
    // Fallback: usar timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `TEN${timestamp}`;
  }
}

// ====================================================================
// HOOK PARA USO EM COMPONENTES REACT
// ====================================================================

export const useTenantService = () => {
  const createTenant = async (tenantData: CreateTenantData) => {
    return await TenantService.createTenant(tenantData);
  };
  
  const updateTenant = async (tenantId: string, updates: UpdateTenantData) => {
    return await TenantService.updateTenant(tenantId, updates);
  };
  
  const deleteTenant = async (tenantId: string) => {
    return await TenantService.deleteTenant(tenantId);
  };
  
  const getTenantById = async (tenantId: string) => {
    return await TenantService.getTenantById(tenantId);
  };
  
  const getAllTenants = async () => {
    return await TenantService.getAllTenants();
  };
  
  return {
    createTenant,
    updateTenant,
    deleteTenant,
    getTenantById,
    getAllTenants,
    checkCnpjExists: TenantService.checkCnpjExists,
    markTenantAsHavingAdmin: TenantService.markTenantAsHavingAdmin
  };
};

export default TenantService;