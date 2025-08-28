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


export interface ProtocoloSupabase {
  id: string;
  tenant_id: string;
  numero_protocolo: string;
  servico_id?: string;
  solicitante_id?: string;
  secretaria_id?: string;
  responsavel_id?: string;
  assunto: string;
  descricao?: string;
  status: string;
  prioridade: string;
  prazo_atendimento?: string;
  data_finalizacao?: string;
  observacoes?: string;
  avaliacao?: number;
  comentario_avaliacao?: string;
  created_at: string;
  updated_at: string;
}

export const useProtocolosSupabase = () => {
  const queryClient = useQueryClient();

  // Query para buscar todos os protocolos
  const {
    data: protocolos,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['protocolos'],
    queryFn: async () => {
      const data = await APIClient.get<ProtocoloSupabase[]>('/protocolos?include=servicos_municipais,secretarias&sort_by=created_at&sort_order=desc');
      return data || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation para criar protocolo
  const createMutation = useMutation({
    mutationFn: async (novoProtocolo: Partial<ProtocoloSupabase>) => {
      const data = await APIClient.post<ProtocoloSupabase>('/protocolos', novoProtocolo);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolos'] });
      toast({
        title: 'Sucesso',
        description: 'Protocolo criado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: (error instanceof Error ? error.message : String(error)) || 'Erro ao criar protocolo',
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar protocolo
  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<ProtocoloSupabase> }) => {
      const data = await APIClient.put<ProtocoloSupabase>(`/protocolos/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolos'] });
      toast({
        title: 'Sucesso',
        description: 'Protocolo atualizado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: (error instanceof Error ? error.message : String(error)) || 'Erro ao atualizar protocolo',
        variant: 'destructive',
      });
    },
  });

  // Função para atualizar status
  const updateStatus = async (id: string, novoStatus: string, observacoes?: string) => {
    return updateMutation.mutate({
      id,
      data: {
        status: novoStatus,
        observacoes,
        updated_at: new Date().toISOString(),
      }
    });
  };

  // Função para avaliar protocolo
  const avaliarProtocolo = async (id: string, avaliacao: number, comentario?: string) => {
    return updateMutation.mutate({
      id,
      data: {
        avaliacao,
        comentario_avaliacao: comentario,
        updated_at: new Date().toISOString(),
      }
    });
  };

  return {
    protocolos: protocolos || [],
    isLoading,
    error,
    refetch,
    
    // Operações CRUD
    create: createMutation.mutate,
    update: updateMutation.mutate,
    updateStatus,
    avaliarProtocolo,
    
    // Estados das operações
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    
    // Controle do cache
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['protocolos'] }),
  };
};