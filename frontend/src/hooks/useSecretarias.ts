
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface Secretaria {
  id: string
  tenant_id: string
  codigo: string
  nome: string
  sigla: string
  descricao?: string
  cor_tema?: string
  icone?: string
  status: string
  created_at: string
  updated_at: string
}

export const useSecretarias = () => {
  return useQuery({
    queryKey: ['secretarias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secretarias')
        .select('*')
        .eq('status', 'ativo')
        .order('nome')

      if (error) throw error
      return data as Secretaria[]
    },
  })
}

export const useSecretaria = (id: string) => {
  return useQuery({
    queryKey: ['secretaria', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secretarias')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Secretaria
    },
    enabled: !!id,
  })
}
