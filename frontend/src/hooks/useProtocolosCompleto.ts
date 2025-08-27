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

  // Query para buscar protocolos via view (se existir) ou tabela direta
  const {
    data: protocolos,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['protocolos_completos'],
    queryFn: async () => {
      // Tentar usar a view primeiro, se falhar usar a tabela direta
      try {
        const { data, error } = await supabase
          .from('protocolos_completos')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as ProtocoloCompleto[];
      } catch (viewError) {
        // Fallback para tabela direta com joins manuais
        const { data, error } = await supabase
          .from('protocolos')
          .select(`
            *,
            servicos_municipais (
              nome
            ),
            secretarias (
              nome,
              sigla
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data?.map(p => ({
          ...p,
          servico_nome: p.servicos_municipais?.nome,
          secretaria_nome: p.secretarias?.nome,
          secretaria_sigla: p.secretarias?.sigla,
        })) as ProtocoloCompleto[];
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation para criar protocolo
  const createMutation = useMutation({
    mutationFn: async (novoProtocolo: Partial<ProtocoloCompleto>) => {
      const { data, error } = await supabase
        .from('protocolos')
        .insert([{
          assunto: novoProtocolo.assunto,
          descricao: novoProtocolo.descricao,
          servico_id: novoProtocolo.servico_id,
          secretaria_id: novoProtocolo.secretaria_id,
          solicitante_id: novoProtocolo.solicitante_id,
          status: novoProtocolo.status || 'aberto',
          prioridade: novoProtocolo.prioridade || 'normal',
        }])
        .select()
        .single();
      
      if (error) throw error;
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
      
      const { data, error } = await supabase
        .from('protocolos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
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
    const { data, error } = await supabase
      .from('protocolos')
      .select(`
        *,
        servicos_municipais (
          nome,
          categoria
        ),
        secretarias (
          nome,
          sigla
        )
      `)
      .eq('numero_protocolo', numeroProtocolo)
      .maybeSingle();
    
    if (error) throw error;
    return data ? {
      ...data,
      servico_nome: data.servicos_municipais?.nome,
      secretaria_nome: data.secretarias?.nome,
      secretaria_sigla: data.secretarias?.sigla,
    } as ProtocoloCompleto : null;
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