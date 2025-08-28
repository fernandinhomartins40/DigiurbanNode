// =====================================================
// HOOK PADRONIZADO PARA OBRAS PÚBLICAS - FASE 3
// =====================================================

import { useState, useCallback } from 'react'
import { APIClient } from "@/auth/utils/httpInterceptor"
import { ErrorHandler } from "@/lib/error-handler"
import { ValidationHelper } from "@/lib/validation-schemas"
import { CacheUtils } from "@/lib/cache-system"
import { 
  EntityResponse, 
  PaginatedResponse, 
  DeleteResponse,
  GetEntityListParams,
  CRUD_CONSTANTS 
} from "@/types/crud-patterns"

// =====================================================
// INTERFACES PADRONIZADAS
// =====================================================

export interface ObraPublicaPadrao {
  id: string
  nome: string
  tipo: 'pavimentacao' | 'drenagem' | 'edificacao' | 'saneamento' | 'iluminacao' | 'praca' | 'ponte' | 'outros'
  descricao: string
  endereco: string
  bairro: string
  valor_orcado: number
  valor_executado?: number
  data_inicio_prevista: string
  data_fim_prevista: string
  data_inicio_real?: string
  data_fim_real?: string
  status: 'planejada' | 'licitacao' | 'contratada' | 'em_execucao' | 'suspensa' | 'concluida' | 'cancelada'
  percentual_execucao: number
  fonte_recurso: string
  empresa_executora_id?: string
  responsavel_tecnico_id: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface LicitacaoObraPadrao {
  id: string
  obra_id: string
  numero_processo: string
  modalidade: 'concorrencia' | 'tomada_precos' | 'convite' | 'pregao' | 'inexigibilidade' | 'dispensa'
  valor_estimado: number
  data_abertura: string
  data_julgamento?: string
  empresa_vencedora_id?: string
  valor_vencedor?: number
  status: 'edital_publicado' | 'habilitacao' | 'julgamento' | 'adjudicada' | 'homologada' | 'fracassada' | 'deserta'
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface FiscalizacaoObraPadrao {
  id: string
  obra_id: string
  data_fiscalizacao: string
  fiscal_responsavel_id: string
  tipo_fiscalizacao: 'rotina' | 'medicao' | 'vistoria' | 'recepcao'
  percentual_executado: number
  servicos_executados: string[]
  problemas_encontrados?: string[]
  recomendacoes?: string[]
  fotos_anexadas?: string[]
  proxima_fiscalizacao?: string
  status_qualidade: 'aprovado' | 'aprovado_ressalvas' | 'reprovado'
  observacoes?: string
  created_at: string
}

export interface ManutencaoInfraestruturaPadrao {
  id: string
  tipo_infraestrutura: 'via_publica' | 'praca' | 'ponte' | 'iluminacao' | 'drenagem' | 'edificio_publico'
  endereco: string
  descricao_problema: string
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  tipo_manutencao: 'preventiva' | 'corretiva' | 'emergencial'
  status: 'solicitada' | 'aprovada' | 'em_execucao' | 'concluida' | 'cancelada'
  data_solicitacao: string
  data_inicio?: string
  data_conclusao?: string
  custo_estimado?: number
  custo_real?: number
  responsavel_execucao_id?: string
  materiais_utilizados?: unknown[]
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface EquipamentoObraPadrao {
  id: string
  nome: string
  tipo: 'maquina' | 'veiculo' | 'ferramenta' | 'equipamento_medicao' | 'equipamento_seguranca'
  modelo?: string
  numero_patrimonio: string
  estado_conservacao: 'excelente' | 'bom' | 'regular' | 'ruim' | 'inutilizado'
  localizacao_atual: string
  responsavel_atual_id?: string
  data_aquisicao: string
  valor_aquisicao: number
  manutencoes_realizadas?: unknown[]
  proxima_manutencao?: string
  disponivel: boolean
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface MedicaoObraPadrao {
  id: string
  obra_id: string
  numero_medicao: number
  data_medicao: string
  periodo_inicio: string
  periodo_fim: string
  servicos_medidos: unknown[]
  valor_medido: number
  percentual_executado: number
  fiscal_responsavel_id: string
  empresa_executora_confirma: boolean
  status: 'elaborada' | 'aprovada' | 'rejeitada' | 'paga'
  observacoes?: string
  data_aprovacao?: string
  data_pagamento?: string
  created_at: string
}

// Types para inputs
export interface CreateObraPublicaInput extends Omit<ObraPublicaPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateObraPublicaInput extends Partial<CreateObraPublicaInput> {}

export interface CreateLicitacaoObraInput extends Omit<LicitacaoObraPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateLicitacaoObraInput extends Partial<CreateLicitacaoObraInput> {}

export interface CreateFiscalizacaoObraInput extends Omit<FiscalizacaoObraPadrao, 'id' | 'created_at'> {}
export interface UpdateFiscalizacaoObraInput extends Partial<CreateFiscalizacaoObraInput> {}

export interface CreateManutencaoInfraestruturaInput extends Omit<ManutencaoInfraestruturaPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateManutencaoInfraestruturaInput extends Partial<CreateManutencaoInfraestruturaInput> {}

export interface CreateEquipamentoObraInput extends Omit<EquipamentoObraPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateEquipamentoObraInput extends Partial<CreateEquipamentoObraInput> {}

export interface CreateMedicaoObraInput extends Omit<MedicaoObraPadrao, 'id' | 'created_at'> {}
export interface UpdateMedicaoObraInput extends Partial<CreateMedicaoObraInput> {}

// =====================================================
// HOOK PADRONIZADO USEOBRAS
// =====================================================

export function useObrasStandardized() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // 1. OBRAS PÚBLICAS
  // =====================================================

  const getObraPublicaById = useCallback(async (id: string): Promise<EntityResponse<ObraPublicaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const cached = CacheUtils.get<ObraPublicaPadrao>(`obra_publica:${id}`)
      if (cached) return { data: cached, success: true, message: 'Obra encontrada' }

      const { data, error } = await APIClient
        .from('obras_publicas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Obra não encontrada')

      CacheUtils.set(`obra_publica:${id}`, data, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      
      return {
        data,
        success: true,
        message: 'Obra encontrada com sucesso'
      }
    }, 'read', 'Obra Pública')
  }, [])

  const getObraPublicaList = useCallback(async (params: GetEntityListParams = {}): Promise<PaginatedResponse<ObraPublicaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const {
        page = 1,
        limit = CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort_by = 'data_inicio_prevista',
        sort_order = 'desc',
        filters = {}
      } = params

      const cacheKey = CacheUtils.generateCacheKey('obras_publicas:list', { page, limit, sort_by, sort_order, filters })
      const cached = CacheUtils.get<PaginatedResponse<ObraPublicaPadrao>>(cacheKey)
      if (cached) return cached

      const offset = (page - 1) * limit

      let query = APIClient
        .from('obras_publicas')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`nome.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%,endereco.ilike.%${filters.search}%`)
      }
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.bairro) {
        query = query.eq('bairro', filters.bairro)
      }
      if (filters.fonte_recurso) {
        query = query.eq('fonte_recurso', filters.fonte_recurso)
      }

      // Aplicar ordenação e paginação
      query = query
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw error

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / limit)

      const result = {
        data: data || [],
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: totalCount,
          items_per_page: limit,
          has_next: page < totalPages,
          has_previous: page > 1
        },
        success: true,
        message: `${data?.length || 0} obras encontradas`
      }

      CacheUtils.set(cacheKey, result, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      return result
    }, 'read', 'Obras Públicas')
  }, [])

  const createObraPublica = useCallback(async (data: CreateObraPublicaInput): Promise<EntityResponse<ObraPublicaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('CreateObraPublicaSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await APIClient
        .from('obras_publicas')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('obras_publicas')
      
      return {
        data: result,
        success: true,
        message: 'Obra pública criada com sucesso'
      }
    }, 'create', 'Obra Pública')
  }, [])

  const updateObraPublica = useCallback(async (id: string, data: UpdateObraPublicaInput): Promise<EntityResponse<ObraPublicaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('UpdateObraPublicaSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await APIClient
        .from('obras_publicas')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('obras_publicas')
      CacheUtils.delete(`obra_publica:${id}`)
      
      return {
        data: result,
        success: true,
        message: 'Obra pública atualizada com sucesso'
      }
    }, 'update', 'Obra Pública')
  }, [])

  // =====================================================
  // 2. FISCALIZAÇÃO DE OBRAS
  // =====================================================

  const getFiscalizacaoObraList = useCallback(async (params: GetEntityListParams = {}): Promise<PaginatedResponse<FiscalizacaoObraPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const {
        page = 1,
        limit = CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort_by = 'data_fiscalizacao',
        sort_order = 'desc',
        filters = {}
      } = params

      const cacheKey = CacheUtils.generateCacheKey('fiscalizacoes_obra:list', { page, limit, sort_by, sort_order, filters })
      const cached = CacheUtils.get<PaginatedResponse<FiscalizacaoObraPadrao>>(cacheKey)
      if (cached) return cached

      const offset = (page - 1) * limit

      let query = APIClient
        .from('fiscalizacoes_obra')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.obra_id) {
        query = query.eq('obra_id', filters.obra_id)
      }
      if (filters.tipo_fiscalizacao) {
        query = query.eq('tipo_fiscalizacao', filters.tipo_fiscalizacao)
      }
      if (filters.status_qualidade) {
        query = query.eq('status_qualidade', filters.status_qualidade)
      }
      if (filters.data_inicio) {
        query = query.gte('data_fiscalizacao', filters.data_inicio)
      }
      if (filters.data_fim) {
        query = query.lte('data_fiscalizacao', filters.data_fim)
      }

      // Aplicar ordenação e paginação
      query = query
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw error

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / limit)

      const result = {
        data: data || [],
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: totalCount,
          items_per_page: limit,
          has_next: page < totalPages,
          has_previous: page > 1
        },
        success: true,
        message: `${data?.length || 0} fiscalizações encontradas`
      }

      CacheUtils.set(cacheKey, result, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      return result
    }, 'read', 'Fiscalizações de Obra')
  }, [])

  const createFiscalizacaoObra = useCallback(async (data: CreateFiscalizacaoObraInput): Promise<EntityResponse<FiscalizacaoObraPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('CreateFiscalizacaoObraSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await APIClient
        .from('fiscalizacoes_obra')
        .insert([{
          ...data,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      // Atualizar percentual de execução da obra
      if (data.percentual_executado) {
        await APIClient
          .from('obras_publicas')
          .update({
            percentual_execucao: data.percentual_executado,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.obra_id)
      }

      CacheUtils.invalidateEntity('fiscalizacoes_obra')
      CacheUtils.invalidateEntity('obras_publicas')
      
      return {
        data: result,
        success: true,
        message: 'Fiscalização registrada com sucesso'
      }
    }, 'create', 'Fiscalização de Obra')
  }, [])

  // =====================================================
  // 3. MANUTENÇÃO DE INFRAESTRUTURA
  // =====================================================

  const getManutencaoInfraestruturaList = useCallback(async (params: GetEntityListParams = {}): Promise<PaginatedResponse<ManutencaoInfraestruturaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const {
        page = 1,
        limit = CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort_by = 'data_solicitacao',
        sort_order = 'desc',
        filters = {}
      } = params

      const cacheKey = CacheUtils.generateCacheKey('manutencoes_infraestrutura:list', { page, limit, sort_by, sort_order, filters })
      const cached = CacheUtils.get<PaginatedResponse<ManutencaoInfraestruturaPadrao>>(cacheKey)
      if (cached) return cached

      const offset = (page - 1) * limit

      let query = APIClient
        .from('manutencoes_infraestrutura')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`endereco.ilike.%${filters.search}%,descricao_problema.ilike.%${filters.search}%`)
      }
      if (filters.tipo_infraestrutura) {
        query = query.eq('tipo_infraestrutura', filters.tipo_infraestrutura)
      }
      if (filters.prioridade) {
        query = query.eq('prioridade', filters.prioridade)
      }
      if (filters.tipo_manutencao) {
        query = query.eq('tipo_manutencao', filters.tipo_manutencao)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      // Aplicar ordenação e paginação
      query = query
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw error

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / limit)

      const result = {
        data: data || [],
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: totalCount,
          items_per_page: limit,
          has_next: page < totalPages,
          has_previous: page > 1
        },
        success: true,
        message: `${data?.length || 0} manutenções encontradas`
      }

      CacheUtils.set(cacheKey, result, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      return result
    }, 'read', 'Manutenções de Infraestrutura')
  }, [])

  const createManutencaoInfraestrutura = useCallback(async (data: CreateManutencaoInfraestruturaInput): Promise<EntityResponse<ManutencaoInfraestruturaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('CreateManutencaoInfraestruturaSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await APIClient
        .from('manutencoes_infraestrutura')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('manutencoes_infraestrutura')
      
      return {
        data: result,
        success: true,
        message: 'Solicitação de manutenção criada com sucesso'
      }
    }, 'create', 'Manutenção de Infraestrutura')
  }, [])

  // =====================================================
  // OPERAÇÕES ESPECIALIZADAS
  // =====================================================

  const iniciarObra = useCallback(async (obraId: string): Promise<EntityResponse<ObraPublicaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const { data, error } = await APIClient
        .from('obras_publicas')
        .update({
          status: 'em_execucao',
          data_inicio_real: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', obraId)
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('obras_publicas')
      CacheUtils.delete(`obra_publica:${obraId}`)
      
      return {
        data,
        success: true,
        message: 'Obra iniciada com sucesso'
      }
    }, 'update', 'Obra Pública')
  }, [])

  const concluirObra = useCallback(async (obraId: string): Promise<EntityResponse<ObraPublicaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const { data, error } = await APIClient
        .from('obras_publicas')
        .update({
          status: 'concluida',
          data_fim_real: new Date().toISOString().split('T')[0],
          percentual_execucao: 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', obraId)
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('obras_publicas')
      CacheUtils.delete(`obra_publica:${obraId}`)
      
      return {
        data,
        success: true,
        message: 'Obra concluída com sucesso'
      }
    }, 'update', 'Obra Pública')
  }, [])

  const gerarRelatorioObras = useCallback(async (
    dataInicio: string,
    dataFim: string
  ): Promise<EntityResponse<any>> => {
    return ErrorHandler.withErrorHandling(async () => {
      // Buscar obras no período
      const { data: obras, error } = await APIClient
        .from('obras_publicas')
        .select('*')
        .gte('data_inicio_real', dataInicio)
        .lte('data_fim_real', dataFim)

      if (error) throw error

      // Calcular estatísticas
      const stats = {
        total_obras: obras?.length || 0,
        valor_total_orcado: obras?.reduce((acc, obra) => acc + obra.valor_orcado, 0) || 0,
        valor_total_executado: obras?.reduce((acc, obra) => acc + (obra.valor_executado || 0), 0) || 0,
        obras_por_status: {},
        obras_por_tipo: {},
        periodo: { inicio: dataInicio, fim: dataFim }
      }

      // Agrupar por status
      obras?.forEach(obra => {
        stats.obras_por_status[obra.status] = 
          (stats.obras_por_status[obra.status] || 0) + 1
      })

      // Agrupar por tipo
      obras?.forEach(obra => {
        stats.obras_por_tipo[obra.tipo] = 
          (stats.obras_por_tipo[obra.tipo] || 0) + 1
      })

      return {
        data: {
          estatisticas: stats,
          obras: obras || []
        },
        success: true,
        message: 'Relatório gerado com sucesso'
      }
    }, 'read', 'Relatório de Obras')
  }, [])

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    // Estados
    loading,
    error,

    // Obras Públicas
    getObraPublicaById,
    getObraPublicaList,
    createObraPublica,
    updateObraPublica,

    // Fiscalização
    getFiscalizacaoObraList,
    createFiscalizacaoObra,

    // Manutenção
    getManutencaoInfraestruturaList,
    createManutencaoInfraestrutura,

    // Operações especializadas
    iniciarObra,
    concluirObra,
    gerarRelatorioObras
  }
}