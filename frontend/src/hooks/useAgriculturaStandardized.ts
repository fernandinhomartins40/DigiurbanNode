// =====================================================
// HOOK PADRONIZADO FASE 3 - AGRICULTURA
// Padronização completa de todas as operações CRUD
// =====================================================

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { APIClient } from "@/auth/utils/httpInterceptor"
import { 
  GetEntityListParams, 
  EntityResponse, 
  PaginatedResponse, 
  DeleteResponse,
  BulkResponse,
  CRUD_CONSTANTS 
} from "@/types/crud-patterns"
import { ValidationHelper } from "@/lib/validation-schemas"
import { ErrorHandler } from "@/lib/error-handler"

// =====================================================
// INTERFACES ESPECÍFICAS DA AGRICULTURA
// =====================================================

export interface ProdutorRural {
  id: string
  nome_completo: string
  cpf_cnpj: string
  rg?: string
  telefone?: string
  email?: string
  endereco_residencia?: string
  nome_propriedade?: string
  endereco_propriedade: string
  area_hectares: number
  latitude?: number
  longitude?: number
  tipos_cultivo?: string[]
  criacao_animal?: string[]
  certificacoes?: string[]
  associacao_cooperativa?: string
  numero_dap?: string
  renda_anual_estimada?: number
  situacao: 'ativo' | 'inativo' | 'suspenso'
  observacoes?: string
  created_at: string
  updated_at?: string
}

export interface AssistenciaTecnica {
  id: string
  produtor_id: string
  tecnico_responsavel: string
  tipo_assistencia: 'agronomica' | 'veterinaria' | 'zootecnica'
  data_visita: string
  objetivo_visita: string
  diagnostico?: string
  recomendacoes: string
  produtos_indicados?: string[]
  proxima_visita?: string
  status: 'agendada' | 'concluida' | 'reagendada' | 'cancelada'
  custo_assistencia?: number
  resultado_obtido?: string
  avaliacao_produtor?: number
  observacoes?: string
  created_at: string
  produtor?: ProdutorRural
}

export interface ProgramaRural {
  id: string
  nome_programa: string
  descricao: string
  tipo_programa: 'credito' | 'sementes' | 'maquinas' | 'seguro'
  orcamento_total: number
  valor_por_beneficiario: number
  criterios_elegibilidade: string
  documentos_necessarios: string[]
  periodo_inscricoes_inicio?: string
  periodo_inscricoes_fim?: string
  numero_beneficiarios_previsto: number
  numero_beneficiarios_atual: number
  status: 'ativo' | 'suspenso' | 'finalizado' | 'planejamento'
  responsavel_programa: string
  observacoes?: string
  created_at: string
  updated_at?: string
}

export interface InsumoAgricola {
  id: string
  nome_insumo: string
  tipo_insumo: 'semente' | 'fertilizante' | 'defensivo' | 'ferramenta'
  marca?: string
  unidade_medida: string
  estoque_atual: number
  estoque_minimo?: number
  preco_unitario?: number
  fornecedor?: string
  data_validade?: string
  observacoes?: string
  ativo: boolean
  created_at: string
}

// =====================================================
// TIPOS PARA INPUTS
// =====================================================

export interface CreateProdutorInput {
  nome_completo: string
  cpf_cnpj: string
  endereco_propriedade: string
  area_hectares: number
  telefone?: string
  email?: string
  nome_propriedade?: string
  tipos_cultivo?: string[]
  criacao_animal?: string[]
}

export interface UpdateProdutorInput {
  nome_completo?: string
  telefone?: string
  email?: string
  endereco_propriedade?: string
  area_hectares?: number
  tipos_cultivo?: string[]
  criacao_animal?: string[]
  situacao?: 'ativo' | 'inativo' | 'suspenso'
}

export interface CreateAssistenciaInput {
  produtor_id: string
  tecnico_responsavel: string
  tipo_assistencia: 'agronomica' | 'veterinaria' | 'zootecnica'
  data_visita: string
  objetivo_visita: string
  recomendacoes: string
}

export interface AgriculturaFilters {
  nome?: string
  cpf_cnpj?: string
  situacao?: string | string[]
  tipo_cultivo?: string
  municipio?: string
  area_min?: number
  area_max?: number
  data_cadastro_start?: string
  data_cadastro_end?: string
  search?: string
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useAgriculturaStandardized() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // PRODUTORES RURAIS - OPERAÇÕES CRUD
  // =====================================================

  const getProdutorById = useCallback(async (
    id: string,
    params?: { include?: string[] }
  ): Promise<EntityResponse<ProdutorRural>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)

      let query = APIClient
        .from('produtores_rurais')
        .select(`
          *,
          assistencias:assistencias_tecnicas(*),
          inscricoes:inscricoes_programas(*)
        `)
        .eq('id', id)
        .single()

      const { data, error } = await query

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null as any,
            success: false,
            message: 'Produtor não encontrado'
          }
        }
        throw error
      }

      return {
        data,
        success: true,
        message: 'Produtor carregado com sucesso'
      }
    }, 'read', 'Produtor Rural', { showToast: false, logError: true })
      .finally(() => setLoading(false))
  }, [])

  const getProdutorList = useCallback(async (
    params?: GetEntityListParams & { filters?: AgriculturaFilters }
  ): Promise<PaginatedResponse<ProdutorRural>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)

      let query = APIClient
        .from('produtores_rurais')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (params?.filters) {
        const { filters } = params
        
        if (filters.search) {
          query = query.or(`nome_completo.ilike.%${filters.search}%,cpf_cnpj.ilike.%${filters.search}%,nome_propriedade.ilike.%${filters.search}%`)
        }
        
        if (filters.situacao) {
          if (Array.isArray(filters.situacao)) {
            query = query.in('situacao', filters.situacao)
          } else {
            query = query.eq('situacao', filters.situacao)
          }
        }
        
        if (filters.area_min) {
          query = query.gte('area_hectares', filters.area_min)
        }
        
        if (filters.area_max) {
          query = query.lte('area_hectares', filters.area_max)
        }
        
        if (filters.data_cadastro_start) {
          query = query.gte('created_at', filters.data_cadastro_start)
        }
        
        if (filters.data_cadastro_end) {
          query = query.lte('created_at', filters.data_cadastro_end)
        }
      }

      // Aplicar ordenação
      const sortField = params?.sort_by || 'created_at'
      const sortOrder = params?.sort_order || 'desc'
      query = query.order(sortField, { ascending: sortOrder === 'asc' })

      // Aplicar paginação
      const pageSize = params?.limit || CRUD_CONSTANTS.DEFAULT_PAGE_SIZE
      const currentPage = params?.page || 1
      
      if (pageSize <= CRUD_CONSTANTS.MAX_PAGE_SIZE) {
        const offset = (currentPage - 1) * pageSize
        query = query.range(offset, offset + pageSize - 1)
      }

      const { data, error, count } = await query

      if (error) throw error

      const totalPages = Math.ceil((count || 0) / pageSize)

      return {
        data: data || [],
        pagination: {
          current_page: currentPage,
          total_pages: totalPages,
          total_items: count || 0,
          items_per_page: pageSize,
          has_next: currentPage < totalPages,
          has_previous: currentPage > 1
        },
        success: true,
        message: 'Produtores carregados com sucesso',
        meta: {
          total_count: count || 0,
          filtered_count: data?.length || 0
        }
      }
    }, 'read', 'Produtores Rurais', { showToast: false })
      .finally(() => setLoading(false))
  }, [])

  const searchProdutores = useCallback(async (
    query: string,
    filters?: AgriculturaFilters
  ): Promise<PaginatedResponse<ProdutorRural>> => {
    return getProdutorList({
      filters: {
        ...filters,
        search: query
      }
    })
  }, [getProdutorList])

  const createProdutor = useCallback(async (
    data: CreateProdutorInput
  ): Promise<EntityResponse<ProdutorRural>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)

      const { data: produtor, error } = await APIClient
        .from('produtores_rurais')
        .insert([{
          ...data,
          situacao: 'ativo'
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Produtor cadastrado com sucesso!')

      return {
        data: produtor,
        success: true,
        message: 'Produtor cadastrado com sucesso!',
        meta: {
          created_at: produtor.created_at
        }
      }
    }, 'create', 'Produtor Rural')
      .finally(() => setLoading(false))
  }, [])

  const updateProdutor = useCallback(async (
    id: string,
    data: UpdateProdutorInput
  ): Promise<EntityResponse<ProdutorRural>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)

      const { data: produtor, error } = await APIClient
        .from('produtores_rurais')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      toast.success('Produtor atualizado com sucesso!')

      return {
        data: produtor,
        success: true,
        message: 'Produtor atualizado com sucesso!',
        meta: {
          updated_at: produtor.updated_at
        }
      }
    }, 'update', 'Produtor Rural')
      .finally(() => setLoading(false))
  }, [])

  const deleteProdutor = useCallback(async (id: string): Promise<DeleteResponse> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)

      const { error } = await APIClient
        .from('produtores_rurais')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Produtor removido com sucesso!')

      return {
        success: true,
        message: 'Produtor removido com sucesso!',
        deleted_id: id
      }
    }, 'delete', 'Produtor Rural')
      .finally(() => setLoading(false))
  }, [])

  const softProdutorDelete = useCallback(async (
    id: string,
    reason?: string
  ): Promise<DeleteResponse> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)

      const { error } = await APIClient
        .from('produtores_rurais')
        .update({
          situacao: 'inativo',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Produtor desativado com sucesso!')

      return {
        success: true,
        message: 'Produtor desativado com sucesso!',
        deleted_id: id,
        soft_deleted: true
      }
    }, 'delete', 'Produtor Rural')
      .finally(() => setLoading(false))
  }, [])

  // =====================================================
  // ASSISTÊNCIA TÉCNICA - OPERAÇÕES CRUD
  // =====================================================

  const getAssistenciaById = useCallback(async (
    id: string
  ): Promise<EntityResponse<AssistenciaTecnica>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)

      const { data, error } = await APIClient
        .from('assistencias_tecnicas')
        .select(`
          *,
          produtor:produtores_rurais(nome_completo, nome_propriedade)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null as any,
            success: false,
            message: 'Assistência técnica não encontrada'
          }
        }
        throw error
      }

      return {
        data,
        success: true,
        message: 'Assistência técnica carregada com sucesso'
      }
    }, 'read', 'Assistência Técnica', { showToast: false })
      .finally(() => setLoading(false))
  }, [])

  const createAssistencia = useCallback(async (
    data: CreateAssistenciaInput
  ): Promise<EntityResponse<AssistenciaTecnica>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)

      const { data: assistencia, error } = await APIClient
        .from('assistencias_tecnicas')
        .insert([{
          ...data,
          status: 'agendada'
        }])
        .select(`
          *,
          produtor:produtores_rurais(nome_completo, nome_propriedade)
        `)
        .single()

      if (error) throw error

      toast.success('Assistência técnica agendada com sucesso!')

      return {
        data: assistencia,
        success: true,
        message: 'Assistência técnica agendada com sucesso!'
      }
    }, 'create', 'Assistência Técnica')
      .finally(() => setLoading(false))
  }, [])

  // =====================================================
  // OPERAÇÕES ESPECIALIZADAS
  // =====================================================

  const ativarProdutor = useCallback(async (id: string): Promise<EntityResponse<ProdutorRural>> => {
    return updateProdutor(id, { situacao: 'ativo' })
  }, [updateProdutor])

  const suspenderProdutor = useCallback(async (id: string): Promise<EntityResponse<ProdutorRural>> => {
    return updateProdutor(id, { situacao: 'suspenso' })
  }, [updateProdutor])

  const concluirAssistencia = useCallback(async (
    id: string,
    resultado: string,
    recomendacoes?: string
  ): Promise<EntityResponse<AssistenciaTecnica>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)

      const { data, error } = await APIClient
        .from('assistencias_tecnicas')
        .update({
          status: 'concluida',
          resultado_obtido: resultado,
          recomendacoes: recomendacoes || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Assistência técnica concluída com sucesso!'
      }
    }, 'update', 'Assistência Técnica')
      .finally(() => setLoading(false))
  }, [])

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    loading,
    error,
    
    // Operações READ - Nomenclatura Padronizada FASE 3
    getProdutorById,
    getProdutorList,
    searchProdutores,
    getAssistenciaById,
    
    // Operações CREATE - Nomenclatura Padronizada FASE 3
    createProdutor,
    createAssistencia,
    
    // Operações UPDATE - Nomenclatura Padronizada FASE 3
    updateProdutor,
    
    // Operações DELETE - Nomenclatura Padronizada FASE 3
    deleteProdutor,
    softProdutorDelete,
    
    // Operações Especializadas
    ativarProdutor,
    suspenderProdutor,
    concluirAssistencia,
    
    // Utility
    clearError: () => setError(null)
  }
}