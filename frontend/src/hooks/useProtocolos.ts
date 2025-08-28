
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { APIClient } from '@/auth/utils/httpInterceptor'
import { useToast } from '@/hooks/use-toast'

export interface Protocolo {
  id: string
  tenant_id: string
  numero_protocolo: string
  assunto: string
  descricao: string
  status: string
  prioridade: string
  created_at: string
  updated_at: string
  data_vencimento?: string
  data_conclusao?: string
  cidadao_id?: string
  funcionario_responsavel_id?: string
  secretaria_id?: string
  servico_id?: string
  avaliacao_nota?: number
  avaliacao_comentario?: string
  avaliado_em?: string
}

export const useProtocolos = () => {
  return useQuery({
    queryKey: ['protocolos'],
    queryFn: async () => {
      const data = await APIClient.get<Protocolo[]>('/protocolos?sort_by=created_at&sort_order=desc')
      return data || []
    },
  })
}

export const useProtocolo = (id: string) => {
  return useQuery({
    queryKey: ['protocolo', id],
    queryFn: async () => {
      const data = await APIClient.get<Protocolo>(`/protocolos/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export const useCreateProtocolo = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (protocolo: Partial<Protocolo>) => {
      const data = await APIClient.post<Protocolo>('/protocolos', protocolo)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolos'] })
      toast({
        title: "Protocolo criado",
        description: "O protocolo foi criado com sucesso.",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar protocolo",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useUpdateProtocolo = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Protocolo> & { id: string }) => {
      const data = await APIClient.put<Protocolo>(`/protocolos/${id}`, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolos'] })
      toast({
        title: "Protocolo atualizado",
        description: "O protocolo foi atualizado com sucesso.",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar protocolo",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}
