import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from '@/auth/utils/httpInterceptor';
import { TenantPadrao, PlanoTenant, StatusTenant, BaseEntity } from "@/types/common";
import { toast } from 'sonner';

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


export interface TenantConfig extends BaseEntity {
  tenant_id: string;
  secretarias_ativas: string[];
  limite_usuarios: number;
  limite_protocolos_mes: number;
  limite_storage_gb: number;
  portal_transparencia: boolean;
  app_mobile_cidadao: boolean;
  bi_avancado: boolean;
  integracoes_federais: boolean;
}

export interface TenantSubscription extends BaseEntity {
  tenant_id: string;
  plano: string;
  valor_mensal: number;
  valor_anual?: number;
  tipo_cobranca: 'mensal' | 'anual';
  status: StatusTenant;
  proxima_cobranca: string;
  portal_transparencia: number;
  app_mobile: number;
  bi_avancado: number;
  integracoes_federais: number;
}

export interface CreateTenantData {
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  regiao: string;
  populacao: number;
  plano: PlanoTenant;
  responsavel: {
    nome: string;
    email: string;
    telefone?: string;
    cargo: string;
  };
}

// =====================================================
// HOOK PADRONIZADO PARA TENANTS - FASE 3
// =====================================================

export function useTenants() {
  const queryClient = useQueryClient();

  // Query para buscar tenants
  const {
    data: tenants = [],
    isLoading: loading,
    error,
    refetch: refetchTenants
  } = useQuery({
    queryKey: ['tenants'],
    queryFn: async (): Promise<TenantPadrao[]> => {
      const data = await APIClient.get<TenantPadrao[]>('/tenants');
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // =====================================================
  // MUTATIONS PADRONIZADAS
  // =====================================================

  // Mutation para criar tenant
  const createMutation = useMutation({
    mutationFn: async (tenantData: CreateTenantData) => {
      const data = await APIClient.post<TenantPadrao>('/tenants', {
        nome: tenantData.nome,
        cnpj: tenantData.cnpj,
        cidade: tenantData.cidade,
        estado: tenantData.estado,
        regiao: tenantData.regiao,
        populacao: tenantData.populacao,
        plano: tenantData.plano,
        responsavel_nome: tenantData.responsavel.nome,
        responsavel_email: tenantData.responsavel.email,
        responsavel_telefone: tenantData.responsavel.telefone,
        responsavel_cargo: tenantData.responsavel.cargo
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar tenant: ${error.message}`);
    }
  });

  // Mutation para atualizar tenant
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTenantData> }) => {
      const result = await APIClient.put<TenantPadrao>(`/tenants/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar tenant: ${error.message}`);
    }
  });

  // Mutation para deletar tenant
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await APIClient.delete(`/tenants/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover tenant: ${error.message}`);
    }
  });

  // =====================================================
  // FUNÇÕES PADRONIZADAS FASE 3
  // =====================================================

  // NOMENCLATURA PADRONIZADA: getTenantList
  const getTenantList = async (params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }) => {
    try {
      const queryParams = new URLSearchParams();

      // Aplicar filtros se fornecidos
      if (params?.filters) {
        const { filters } = params;
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.plano) queryParams.append('plano', filters.plano);
        if (filters.estado) queryParams.append('estado', filters.estado);
      }

      // Aplicar ordenação
      const sortField = params?.sort_by || 'created_at';
      const sortOrder = params?.sort_order || 'desc';
      queryParams.append('sort_by', sortField);
      queryParams.append('sort_order', sortOrder);

      // Aplicar paginação se fornecida
      if (params?.page && params?.limit) {
        const offset = (params.page - 1) * params.limit;
        queryParams.append('limit', params.limit.toString());
        queryParams.append('offset', offset.toString());
      }

      const endpoint = `/tenants?${queryParams.toString()}`;
      const response = await APIClient.get<{data: TenantPadrao[], total: number}>(endpoint);
      
      const data = response.data || [];
      const count = response.total || 0;
      
      // Retornar resposta padronizada
      return {
        data,
        pagination: params?.page && params?.limit ? {
          current_page: params.page,
          total_pages: Math.ceil(count / params.limit),
          total_items: count,
          items_per_page: params.limit,
          has_next: params.page < Math.ceil(count / params.limit),
          has_previous: params.page > 1
        } : undefined,
        success: true,
        message: 'Tenants carregados com sucesso'
      };
    } catch (err: Error | unknown) {
      return {
        data: [],
        success: false,
        message: `Erro ao carregar tenants: ${err.message}`
      };
    }
  };

  // NOMENCLATURA PADRONIZADA: createTenant
  const createTenant = async (tenantData: CreateTenantData) => {
    return createMutation.mutateAsync(tenantData);
  };

  // NOMENCLATURA PADRONIZADA: updateTenant  
  const updateTenant = async (id: string, data: Partial<CreateTenantData>) => {
    return updateMutation.mutateAsync({ id, data });
  };

  // NOMENCLATURA PADRONIZADA: deleteTenant
  const deleteTenant = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  // =====================================================
  // FUNÇÕES LEGADAS PARA COMPATIBILIDADE
  // =====================================================

  const fetchTenants = () => refetchTenants();

  const addTenant = createTenant; // Alias legado

  // =====================================================
  // RETURN PADRONIZADO
  // =====================================================

  return {
    // Dados
    tenants,
    loading,
    error: error?.message || null,

    // Funções CRUD padronizadas (FASE 3)
    getTenantList,
    createTenant,
    updateTenant,
    deleteTenant,

    // Estados das mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Funções de refresh
    refetchTenants,

    // Funções legadas (mantidas para compatibilidade)
    fetchTenants,
    addTenant,

    // Aliases para compatibilidade
    isLoading: loading,
    refresh: refetchTenants
  };
}