import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from '@/auth/utils/httpInterceptor';
import { toast } from '@/hooks/use-toast';

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


interface CRUDOptions {
  relations?: string[];
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
}

export function useModuleCRUD<T extends { id: string }>(
  module: string,
  entity: string,
  options: CRUDOptions = {},
  customTableName?: string
) {
  const queryClient = useQueryClient();
  const tableName = customTableName || `${module}_${entity}`;
  
  // Se o entity está vazio, usar apenas o module como nome da tabela
  const finalTableName = entity === '' ? module : tableName;

  // Query para buscar dados
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [module, entity, options.filters, options.orderBy],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      // Aplicar filtros
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }
      
      // Aplicar ordenação
      if (options.orderBy) {
        queryParams.append('sort_by', options.orderBy.column);
        queryParams.append('sort_order', options.orderBy.ascending ? 'asc' : 'desc');
      } else {
        queryParams.append('sort_by', 'created_at');
        queryParams.append('sort_order', 'desc');
      }
      
      const endpoint = `/${finalTableName}?${queryParams.toString()}`;
      const data = await APIClient.get<T[]>(endpoint);
      
      return data || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar
  const createMutation = useMutation({
    mutationFn: async (newData: Partial<T>) => {
      const data = await APIClient.post<T>(`/${finalTableName}`, newData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [module, entity] });
      toast({
        title: 'Sucesso',
        description: `${entity} criado com sucesso!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: (error instanceof Error ? error.message : String(error)) || `Erro ao criar ${entity}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<T> }) => {
      const data = await APIClient.put<T>(`/${finalTableName}/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [module, entity] });
      toast({
        title: 'Sucesso',
        description: `${entity} atualizado com sucesso!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: (error instanceof Error ? error.message : String(error)) || `Erro ao atualizar ${entity}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await APIClient.delete(`/${finalTableName}/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [module, entity] });
      toast({
        title: 'Sucesso',
        description: `${entity} removido com sucesso!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: (error instanceof Error ? error.message : String(error)) || `Erro ao remover ${entity}`,
        variant: 'destructive',
      });
    },
  });

  // Função para buscar um item específico
  const fetchOne = async (id: string): Promise<T | null> => {
    try {
      const data = await APIClient.get<T>(`/${finalTableName}/${id}`);
      return data;
    } catch (error: any) {
      if (error.status === 404) return null; // Not found
      throw error;
    }
  };

  return {
    // Dados e estados
    data: data || [],
    isLoading,
    error,
    
    // Funções de CRUD
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    fetchOne,
    refetch,
    
    // Estados das mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Controle do cache
    invalidate: () => queryClient.invalidateQueries({ queryKey: [module, entity] }),
  };
}

// Hook específico para buscar um único item
export function useModuleItem<T>(
  module: string,
  entity: string,
  id: string | undefined,
  customTableName?: string
) {
  const finalTableName = customTableName || (entity === '' ? module : `${module}_${entity}`);

  return useQuery({
    queryKey: [module, entity, 'item', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const data = await APIClient.get<T>(`/${finalTableName}/${id}`);
        return data;
      } catch (error: any) {
        if (error.status === 404) return null; // Not found
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para contagens e estatísticas
export function useModuleStats(
  module: string,
  entity: string,
  filters: Record<string, any> = {},
  customTableName?: string
) {
  const finalTableName = customTableName || (entity === '' ? module : `${module}_${entity}`);

  return useQuery({
    queryKey: [module, entity, 'stats', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('stats', 'true');
      
      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      const endpoint = `/${finalTableName}/stats?${queryParams.toString()}`;
      const data = await APIClient.get<{ total: number }>(endpoint);
      
      return data || { total: 0 };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}