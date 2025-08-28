
import { useQuery } from '@tanstack/react-query'
import { APIClient } from '@/auth/utils/httpInterceptor'

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
      const data = await APIClient.get<Secretaria[]>('/secretarias?status=ativo&sort_by=nome&sort_order=asc')
      return data || []
    },
  })
}

export const useSecretaria = (id: string) => {
  return useQuery({
    queryKey: ['secretaria', id],
    queryFn: async () => {
      const data = await APIClient.get<Secretaria>(`/secretarias/${id}`)
      return data
    },
    enabled: !!id,
  })
}
