
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface ServicoMunicipal {
  id: string
  tenant_id: string
  secretaria_id: string
  nome: string
  descricao?: string
  categoria?: string
  status: string
  created_at: string
  updated_at: string
}

export const useServicos = () => {
  return useQuery({
    queryKey: ['servicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicos_municipais')
        .select('*')
        .eq('status', 'ativo')
        .order('nome')

      if (error) throw error
      return data as ServicoMunicipal[]
    },
  })
}

export const useServicosBySecretaria = (secretariaId: string) => {
  return useQuery({
    queryKey: ['servicos', 'secretaria', secretariaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicos_municipais')
        .select('*')
        .eq('secretaria_id', secretariaId)
        .eq('status', 'ativo')
        .order('nome')

      if (error) throw error
      return data as ServicoMunicipal[]
    },
    enabled: !!secretariaId,
  })
}
