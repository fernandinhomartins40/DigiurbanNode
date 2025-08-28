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


export interface ProtocoloCompleto {
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
  // Campos da view com joins
  servico_nome?: string;
  secretaria_nome?: string;
  secretaria_sigla?: string;
}

// Hook que funciona com a tabela protocolos e a view protocolos_completos
export const useProtocolosCompleto = () => {
  const queryClient = useQueryClient();

  // Query para buscar protocolos via API JWT
  const {
    data: protocolos,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['protocolos_completos'],
    queryFn: async () => {
      const data = await APIClient.get<ProtocoloCompleto[]>('/protocolos/completos?sort_by=created_at&sort_order=desc');
      return data || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation para criar protocolo
  const createMutation = useMutation({
    mutationFn: async (novoProtocolo: Partial<ProtocoloCompleto>) => {
      const data = await APIClient.post<ProtocoloCompleto>('/protocolos', {
        assunto: novoProtocolo.assunto,
        descricao: novoProtocolo.descricao,
        servico_id: novoProtocolo.servico_id,
        secretaria_id: novoProtocolo.secretaria_id,
        solicitante_id: novoProtocolo.solicitante_id,
        status: novoProtocolo.status || 'aberto',
        prioridade: novoProtocolo.prioridade || 'normal',
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolos_completos'] });
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

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, observacoes }: { id: string; status: string; observacoes?: string }) => {
      const updateData: any = { status };
      if (observacoes) updateData.observacoes = observacoes;
      if (status === 'finalizado') updateData.data_finalizacao = new Date().toISOString();
      
      const data = await APIClient.put<ProtocoloCompleto>(`/protocolos/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolos_completos'] });
      toast({
        title: 'Sucesso',
        description: 'Status do protocolo atualizado!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: (error instanceof Error ? error.message : String(error)) || 'Erro ao atualizar status',
        variant: 'destructive',
      });
    },
  });

  // Função para buscar protocolo por número
  const buscarPorNumero = async (numeroProtocolo: string): Promise<ProtocoloCompleto | null> => {
    try {
      const data = await APIClient.get<ProtocoloCompleto>(`/protocolos/numero/${numeroProtocolo}`);
      return data;
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  };

  return {
    protocolos: protocolos || [],
    isLoading,
    error,
    refetch,
    
    // Operações CRUD
    create: createMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    buscarPorNumero,
    
    // Estados das operações
    isCreating: createMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    
    // Controle do cache
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolos_completos'] });
      queryClient.invalidateQueries({ queryKey: ['protocolos'] });
    },
  };
};