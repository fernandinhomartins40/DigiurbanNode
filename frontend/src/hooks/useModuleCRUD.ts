import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      let query = supabase.from(finalTableName).select('*');
      
      // Aplicar filtros
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value);
          }
        });
      }
      
      // Aplicar ordenação
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? false 
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as T[];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar
  const createMutation = useMutation({
    mutationFn: async (newData: Partial<T>) => {
      const { data, error } = await supabase
        .from(finalTableName)
        .insert([newData])
        .select()
        .single();
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from(finalTableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
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
      const { error } = await supabase
        .from(finalTableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
    const { data, error } = await supabase
      .from(finalTableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return data as T;
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
      
      const { data, error } = await supabase
        .from(finalTableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      
      return data as T;
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
      let query = supabase.from(finalTableName).select('*', { count: 'exact', head: true });
      
      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
      
      const { count, error } = await query;
      
      if (error) throw error;
      return { total: count || 0 };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}