// =====================================================
// HOOK PADRONIZADO PARA HABITAÇÃO - FASE 3
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

export interface ProgramaHabitacionalPadrao {
  id: string
  nome: string
  tipo: 'casa_propria' | 'aluguel_social' | 'lote_urbanizado' | 'regularizacao' | 'melhorias'
  descricao: string
  requisitos: any
  beneficios: any
  valor_beneficio: number
  prazo_vigencia: string
  meta_familias: number
  familias_beneficiadas: number
  orcamento_total: number
  fonte_recurso: string
  status: 'planejamento' | 'ativo' | 'suspenso' | 'encerrado'
  responsavel_id: string
  created_at: string
  updated_at: string
}

export interface RegularizacaoFundiariaPadrao {
  id: string
  protocolo: string
  solicitante_id: string
  endereco_imovel: string
  area_m2: number
  situacao: 'irregular' | 'em_processo' | 'regularizada' | 'indeferida'
  tipo_regularizacao: 'usucapiao' | 'concessao_uso' | 'legitimacao_posse' | 'demarcacao'
  documentos_apresentados: string[]
  etapa_atual: string
  data_protocolo: string
  previsao_conclusao?: string
  observacoes?: string
  tecnico_responsavel_id?: string
  valor_taxas?: number
  created_at: string
  updated_at: string
}

export interface MelhoriaHabitacionalPadrao {
  id: string
  protocolo: string
  solicitante_id: string
  endereco_residencia: string
  tipo_melhoria: 'reforma' | 'ampliacao' | 'construcao' | 'saneamento' | 'eletrica'
  descricao_solicitacao: string
  justificativa: string
  orcamento_estimado: number
  status: 'solicitado' | 'aprovado' | 'em_execucao' | 'concluido' | 'rejeitado'
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  data_vistoria?: string
  tecnico_responsavel_id?: string
  laudos_tecnicos?: any
  data_inicio_obra?: string
  previsao_conclusao?: string
  valor_aprovado?: number
  created_at: string
  updated_at: string
}

export interface CadastroHabitacionalPadrao {
  id: string
  protocolo: string
  responsavel_familiar_id: string
  endereco_atual: string
  situacao_moradia: 'casa_propria' | 'alugada' | 'cedida' | 'ocupacao' | 'abrigo'
  renda_familiar_total: number
  numero_membros_familia: number
  membros_familia: unknown[]
  condicoes_habitabilidade: any
  necessidades_especiais?: string[]
  interesse_programas: string[]
  pontuacao_social: number
  situacao_cadastral: 'ativo' | 'inativo' | 'pendente_documentacao' | 'validado'
  data_atualizacao: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface InscricaoHabitacionalPadrao {
  id: string
  programa_id: string
  cadastro_habitacional_id: string
  data_inscricao: string
  status: 'inscrita' | 'pre_selecionada' | 'selecionada' | 'rejeitada' | 'beneficiada'
  pontuacao_obtida: number
  documentos_entregues: string[]
  observacoes_avaliacao?: string
  data_resultado?: string
  posicao_fila?: number
  created_at: string
}

// Types para inputs
export interface CreateProgramaHabitacionalInput extends Omit<ProgramaHabitacionalPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateProgramaHabitacionalInput extends Partial<CreateProgramaHabitacionalInput> {}

export interface CreateRegularizacaoFundiaria extends Omit<RegularizacaoFundiariaPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateRegularizacaoFundiaria extends Partial<CreateRegularizacaoFundiaria> {}

export interface CreateMelhoriaHabitacionalInput extends Omit<MelhoriaHabitacionalPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateMelhoriaHabitacionalInput extends Partial<CreateMelhoriaHabitacionalInput> {}

export interface CreateCadastroHabitacionalInput extends Omit<CadastroHabitacionalPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateCadastroHabitacionalInput extends Partial<CreateCadastroHabitacionalInput> {}

export interface CreateInscricaoHabitacionalInput extends Omit<InscricaoHabitacionalPadrao, 'id' | 'created_at'> {}
export interface UpdateInscricaoHabitacionalInput extends Partial<CreateInscricaoHabitacionalInput> {}

// =====================================================
// HOOK PADRONIZADO USEHABITACAO
// =====================================================

export function useHabitacaoStandardized() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // 1. PROGRAMAS HABITACIONAIS
  // =====================================================

  const getProgramaHabitacionalById = useCallback(async (id: string): Promise<EntityResponse<ProgramaHabitacionalPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const cached = CacheUtils.get<ProgramaHabitacionalPadrao>(`programa_habitacional:${id}`)
      if (cached) return { data: cached, success: true, message: 'Programa encontrado' }

      const { data, error } = await APIClient
        .from('programas_habitacionais')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Programa não encontrado')

      CacheUtils.set(`programa_habitacional:${id}`, data, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      
      return {
        data,
        success: true,
        message: 'Programa encontrado com sucesso'
      }
    }, 'read', 'Programa Habitacional')
  }, [])

  const getProgramaHabitacionalList = useCallback(async (params: GetEntityListParams = {}): Promise<PaginatedResponse<ProgramaHabitacionalPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const {
        page = 1,
        limit = CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort_by = 'nome',
        sort_order = 'asc',
        filters = {}
      } = params

      const cacheKey = CacheUtils.generateCacheKey('programas_habitacionais:list', { page, limit, sort_by, sort_order, filters })
      const cached = CacheUtils.get<PaginatedResponse<ProgramaHabitacionalPadrao>>(cacheKey)
      if (cached) return cached

      const offset = (page - 1) * limit

      let query = APIClient
        .from('programas_habitacionais')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`nome.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`)
      }
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo)
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
        message: `${data?.length || 0} programas encontrados`
      }

      CacheUtils.set(cacheKey, result, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      return result
    }, 'read', 'Programas Habitacionais')
  }, [])

  const createProgramaHabitacional = useCallback(async (data: CreateProgramaHabitacionalInput): Promise<EntityResponse<ProgramaHabitacionalPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('CreateProgramaHabitacionalSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await APIClient
        .from('programas_habitacionais')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('programas_habitacionais')
      
      return {
        data: result,
        success: true,
        message: 'Programa habitacional criado com sucesso'
      }
    }, 'create', 'Programa Habitacional')
  }, [])

  const updateProgramaHabitacional = useCallback(async (id: string, data: UpdateProgramaHabitacionalInput): Promise<EntityResponse<ProgramaHabitacionalPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('UpdateProgramaHabitacionalSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await APIClient
        .from('programas_habitacionais')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('programas_habitacionais')
      CacheUtils.delete(`programa_habitacional:${id}`)
      
      return {
        data: result,
        success: true,
        message: 'Programa habitacional atualizado com sucesso'
      }
    }, 'update', 'Programa Habitacional')
  }, [])

  // =====================================================
  // 2. REGULARIZAÇÃO FUNDIÁRIA
  // =====================================================

  const getRegularizacaoFundiariaList = useCallback(async (params: GetEntityListParams = {}): Promise<PaginatedResponse<RegularizacaoFundiariaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const {
        page = 1,
        limit = CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort_by = 'data_protocolo',
        sort_order = 'desc',
        filters = {}
      } = params

      const cacheKey = CacheUtils.generateCacheKey('regularizacoes_fundiarias:list', { page, limit, sort_by, sort_order, filters })
      const cached = CacheUtils.get<PaginatedResponse<RegularizacaoFundiariaPadrao>>(cacheKey)
      if (cached) return cached

      const offset = (page - 1) * limit

      let query = APIClient
        .from('regularizacoes_fundiarias')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`protocolo.ilike.%${filters.search}%,endereco_imovel.ilike.%${filters.search}%`)
      }
      if (filters.situacao) {
        query = query.eq('situacao', filters.situacao)
      }
      if (filters.tipo_regularizacao) {
        query = query.eq('tipo_regularizacao', filters.tipo_regularizacao)
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
        message: `${data?.length || 0} regularizações encontradas`
      }

      CacheUtils.set(cacheKey, result, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      return result
    }, 'read', 'Regularizações Fundiárias')
  }, [])

  const createRegularizacaoFundiaria = useCallback(async (data: CreateRegularizacaoFundiaria): Promise<EntityResponse<RegularizacaoFundiariaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('CreateRegularizacaoFundiariaSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await APIClient
        .from('regularizacoes_fundiarias')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('regularizacoes_fundiarias')
      
      return {
        data: result,
        success: true,
        message: 'Regularização fundiária criada com sucesso'
      }
    }, 'create', 'Regularização Fundiária')
  }, [])

  // =====================================================
  // 3. MELHORIAS HABITACIONAIS
  // =====================================================

  const getMelhoriaHabitacionalList = useCallback(async (params: GetEntityListParams = {}): Promise<PaginatedResponse<MelhoriaHabitacionalPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const {
        page = 1,
        limit = CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort_by = 'created_at',
        sort_order = 'desc',
        filters = {}
      } = params

      const cacheKey = CacheUtils.generateCacheKey('melhorias_habitacionais:list', { page, limit, sort_by, sort_order, filters })
      const cached = CacheUtils.get<PaginatedResponse<MelhoriaHabitacionalPadrao>>(cacheKey)
      if (cached) return cached

      const offset = (page - 1) * limit

      let query = APIClient
        .from('melhorias_habitacionais')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`protocolo.ilike.%${filters.search}%,endereco_residencia.ilike.%${filters.search}%`)
      }
      if (filters.tipo_melhoria) {
        query = query.eq('tipo_melhoria', filters.tipo_melhoria)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.prioridade) {
        query = query.eq('prioridade', filters.prioridade)
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
        message: `${data?.length || 0} melhorias encontradas`
      }

      CacheUtils.set(cacheKey, result, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      return result
    }, 'read', 'Melhorias Habitacionais')
  }, [])

  const createMelhoriaHabitacional = useCallback(async (data: CreateMelhoriaHabitacionalInput): Promise<EntityResponse<MelhoriaHabitacionalPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('CreateMelhoriaHabitacionalSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await APIClient
        .from('melhorias_habitacionais')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('melhorias_habitacionais')
      
      return {
        data: result,
        success: true,
        message: 'Melhoria habitacional criada com sucesso'
      }
    }, 'create', 'Melhoria Habitacional')
  }, [])

  // =====================================================
  // OPERAÇÕES ESPECIALIZADAS
  // =====================================================

  const aprovarMelhoria = useCallback(async (melhoriaId: string, valorAprovado: number): Promise<EntityResponse<MelhoriaHabitacionalPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const { data, error } = await APIClient
        .from('melhorias_habitacionais')
        .update({
          status: 'aprovado',
          valor_aprovado: valorAprovado,
          updated_at: new Date().toISOString()
        })
        .eq('id', melhoriaId)
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('melhorias_habitacionais')
      
      return {
        data,
        success: true,
        message: 'Melhoria habitacional aprovada com sucesso'
      }
    }, 'update', 'Melhoria Habitacional')
  }, [])

  const calcularPontuacaoSocial = useCallback(async (cadastroId: string): Promise<EntityResponse<{ pontuacao: number; criterios: any }>> => {
    return ErrorHandler.withErrorHandling(async () => {
      // Lógica de cálculo de pontuação social
      // baseada em critérios do cadastro habitacional
      
      const { data: cadastro, error } = await APIClient
        .from('cadastros_habitacionais')
        .select('*')
        .eq('id', cadastroId)
        .single()

      if (error) throw error

      let pontuacao = 0
      const criterios: any = {}

      // Critério 1: Renda familiar
      if (cadastro.renda_familiar_total <= 1000) {
        pontuacao += 30
        criterios.renda = 30
      } else if (cadastro.renda_familiar_total <= 2000) {
        pontuacao += 20
        criterios.renda = 20
      } else {
        pontuacao += 10
        criterios.renda = 10
      }

      // Critério 2: Número de membros
      if (cadastro.numero_membros_familia >= 5) {
        pontuacao += 20
        criterios.membros = 20
      } else if (cadastro.numero_membros_familia >= 3) {
        pontuacao += 15
        criterios.membros = 15
      } else {
        pontuacao += 10
        criterios.membros = 10
      }

      // Critério 3: Situação da moradia
      if (cadastro.situacao_moradia === 'ocupacao' || cadastro.situacao_moradia === 'abrigo') {
        pontuacao += 25
        criterios.moradia = 25
      } else if (cadastro.situacao_moradia === 'alugada') {
        pontuacao += 15
        criterios.moradia = 15
      } else {
        pontuacao += 5
        criterios.moradia = 5
      }

      // Atualizar pontuação no cadastro
      await APIClient
        .from('cadastros_habitacionais')
        .update({
          pontuacao_social: pontuacao,
          updated_at: new Date().toISOString()
        })
        .eq('id', cadastroId)

      return {
        data: { pontuacao, criterios },
        success: true,
        message: `Pontuação calculada: ${pontuacao} pontos`
      }
    }, 'update', 'Pontuação Social')
  }, [])

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    // Estados
    loading,
    error,

    // Programas Habitacionais
    getProgramaHabitacionalById,
    getProgramaHabitacionalList,
    createProgramaHabitacional,
    updateProgramaHabitacional,

    // Regularização Fundiária
    getRegularizacaoFundiariaList,
    createRegularizacaoFundiaria,

    // Melhorias Habitacionais
    getMelhoriaHabitacionalList,
    createMelhoriaHabitacional,
    aprovarMelhoria,

    // Operações especializadas
    calcularPontuacaoSocial
  }
}