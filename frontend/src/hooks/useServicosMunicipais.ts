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


export interface ServicoMunicipal {
  id: string;
  tenant_id: string;
  secretaria_id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  documentos_necessarios?: string[];
  prazo_dias: number;
  taxa: number;
  tipo_servico: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useServicosMunicipais = (secretariaId?: string) => {
  const queryClient = useQueryClient();

  // Query para buscar serviços
  const {
    data: servicos,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['servicos_municipais', secretariaId],
    queryFn: async () => {
      let query = supabase.from('servicos_municipais').select(`
        *,
        secretarias (
          nome,
          sigla,
          cor_tema
        )
      `);
      
      if (secretariaId) {
        query = query.eq('secretaria_id', secretariaId);
      }
      
      query = query.eq('status', 'ativo').order('nome');
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as ServicoMunicipal[];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation para criar serviço
  const createMutation = useMutation({
    mutationFn: async (newServico: Partial<ServicoMunicipal>) => {
      const { data, error } = await supabase
        .from('servicos_municipais')
        .insert([newServico])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos_municipais'] });
      toast({
        title: 'Sucesso',
        description: 'Serviço municipal criado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: (error instanceof Error ? error.message : String(error)) || 'Erro ao criar serviço municipal',
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar serviço
  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<ServicoMunicipal> }) => {
      const { data, error } = await supabase
        .from('servicos_municipais')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos_municipais'] });
      toast({
        title: 'Sucesso',
        description: 'Serviço municipal atualizado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: (error instanceof Error ? error.message : String(error)) || 'Erro ao atualizar serviço municipal',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar serviço
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('servicos_municipais')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos_municipais'] });
      toast({
        title: 'Sucesso',
        description: 'Serviço municipal removido com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: (error instanceof Error ? error.message : String(error)) || 'Erro ao remover serviço municipal',
        variant: 'destructive',
      });
    },
  });

  return {
    servicos: servicos || [],
    isLoading,
    error,
    refetch,
    
    // Operações CRUD
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    
    // Estados das operações
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Controle do cache
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['servicos_municipais'] }),
  };
};