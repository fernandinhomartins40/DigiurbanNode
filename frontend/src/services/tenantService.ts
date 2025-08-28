import { APIClient } from '@/auth/utils/httpInterceptor';
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
      
      // 3. Criar tenant via API JWT
      const tenant = await APIClient.post<TenantPadrao>('/tenants', {
        nome: tenantData.nome,
        cidade: tenantData.cidade,
        estado: tenantData.estado,
        populacao: tenantData.populacao,
        cnpj: tenantData.cnpj,
        endereco: tenantData.endereco,
        plano: tenantData.plano,
        responsavel_nome: tenantData.responsavel_nome,
        responsavel_email: tenantData.responsavel_email,
        responsavel_telefone: tenantData.responsavel_telefone,
        tenant_code: tenantCode
      });
      
      if (!tenant?.id) {
        throw new Error('Erro ao criar tenant: ID não retornado');
      }
      
      console.log('✅ Tenant criado com sucesso:', tenant.id);
      
      // 4. Registrar atividade de criação via API
      try {
        await APIClient.post('/system/activity-logs', {
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
      } catch (logError) {
        console.warn('⚠️ Falha ao registrar log (tenant foi criado com sucesso):', logError);
      }
      
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
      
      // 2. Atualizar tenant via API JWT
      const updatedTenant = await APIClient.put<TenantPadrao>(`/tenants/${tenantId}`, updates);
      
      if (!updatedTenant?.id) {
        throw new Error('Erro ao atualizar tenant: dados não retornados');
      }
      
      console.log('✅ Tenant atualizado com sucesso:', tenantId, updatedTenant.nome);
      
      // 3. Registrar atividade via API
      try {
        await APIClient.post('/system/activity-logs', {
          tenant_id: tenantId,
          acao: 'Tenant atualizado',
          detalhes: `Tenant ${updatedTenant.nome} foi atualizado`,
          categoria: 'tenants',
          metadata: {
            tenant_id: tenantId,
            tenant_name: updatedTenant.nome,
            updates: updates,
            updated_by: 'super_admin'
          }
        });
      } catch (logError) {
        console.warn('⚠️ Falha ao registrar log (tenant foi atualizado com sucesso):', logError);
      }
      
      return updatedTenant;
      
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
      
      // 3. Excluir tenant via API JWT
      await APIClient.delete(`/tenants/${tenantId}`);
      
      console.log('✅ Tenant excluído com sucesso:', tenantId, existingTenant.nome);
      
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
      try {
        await APIClient.post('/system/activity-logs', {
          tenant_id: tenantId,
          acao: 'Tenant excluído',
          detalhes: `Tenant ${existingTenant.nome} foi suspenso`,
          categoria: 'tenants',
          metadata: {
            tenant_id: tenantId,
            tenant_name: existingTenant.nome,
            deleted_by: 'super_admin'
          }
        });
      } catch (logError) {
        console.warn('⚠️ Falha ao registrar log (tenant foi excluído com sucesso):', logError);
      }
      
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
      const tenant = await APIClient.get<TenantPadrao>(`/tenants/${tenantId}`);
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
      console.log('🔄 Buscando tenants via API JWT...');
      
      const tenants = await APIClient.get<TenantPadrao[]>('/tenants');
      
      console.log('✅ Tenants carregados:', tenants?.length || 0);
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
      const data = await APIClient.get<{available: boolean}>(`/tenants/check-cnpj?cnpj=${cnpj}`);
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
      await APIClient.put(`/tenants/${tenantId}/admin-status`, {
        has_admin: true
      });
      
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
      
      try {
        const exists = await APIClient.get<{exists: boolean}>(`/tenants/check-code?code=${code}`);
        if (!exists.exists) {
          return code;
        }
      } catch {
        // Se houve erro, assumir que código está livre
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