// =====================================================
// HOOK PADRONIZADO PARA SEGURANÇA PÚBLICA - FASE 3
// =====================================================

import { useState, useCallback } from 'react'
import { supabase } from "@/lib/supabase"
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

export interface OcorrenciaSegurancaPadrao {
  id: string
  numero_bo: string
  tipo_ocorrencia: 'furto' | 'roubo' | 'agressao' | 'vandalismo' | 'transito' | 'perturbacao' | 'drogas' | 'outros'
  descricao: string
  data_ocorrencia: string
  hora_ocorrencia: string
  local_ocorrencia: string
  latitude?: number
  longitude?: number
  vitima_nome?: string
  vitima_telefone?: string
  testemunhas?: unknown[]
  evidencias?: string[]
  gravidade: 'baixa' | 'media' | 'alta' | 'critica'
  status: 'registrada' | 'em_investigacao' | 'resolvida' | 'arquivada'
  agente_responsavel_id?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface PatrulhamentoPadrao {
  id: string
  ronda_id: string
  agente_id: string
  data_patrulha: string
  horario_inicio: string
  horario_fim?: string
  rota_percorrida: unknown[]
  areas_visitadas: string[]
  ocorrencias_encontradas?: string[]
  observacoes?: string
  status: 'em_andamento' | 'concluida' | 'interrompida'
  km_percorridos?: number
  combustivel_usado?: number
  veiculo_utilizado?: string
  created_at: string
}

export interface AgenteSegurancaPadrao {
  id: string
  nome_completo: string
  matricula: string
  cargo: 'guarda_municipal' | 'supervisor' | 'coordenador' | 'diretor'
  especialidade?: 'transito' | 'escolar' | 'ambiental' | 'patrimonial' | 'operacional'
  telefone: string
  email?: string
  data_admissao: string
  status: 'ativo' | 'inativo' | 'licenca' | 'aposentado'
  equipamentos_atribuidos?: string[]
  area_atuacao?: string[]
  turno_trabalho: 'matutino' | 'vespertino' | 'noturno' | 'integral'
  created_at: string
  updated_at: string
}

export interface EquipamentoSegurancaPadrao {
  id: string
  nome: string
  tipo: 'veiculo' | 'radio' | 'uniforme' | 'armamento' | 'protecao' | 'tecnologico'
  modelo?: string
  numero_serie?: string
  estado_conservacao: 'novo' | 'bom' | 'regular' | 'ruim' | 'inutilizado'
  data_aquisicao: string
  valor_aquisicao?: number
  responsavel_atual_id?: string
  localizacao_atual: string
  manutencao_programada?: string
  observacoes?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CameraSegurancaPadrao {
  id: string
  codigo_camera: string
  localizacao: string
  latitude: number
  longitude: number
  tipo: 'fixa' | 'movel' | 'speed' | 'reconhecimento_facial'
  resolucao: string
  status_funcionamento: 'operacional' | 'manutencao' | 'danificada' | 'desativada'
  data_instalacao: string
  responsavel_monitamento_id?: string
  gravacao_ativa: boolean
  visualizacao_remota: boolean
  alertas_configurados?: unknown[]
  ultima_manutencao?: string
  proxima_manutencao?: string
  created_at: string
  updated_at: string
}

export interface OperacaoSegurancaPadrao {
  id: string
  nome_operacao: string
  tipo: 'preventiva' | 'repressiva' | 'investigativa' | 'educativa' | 'especial'
  objetivo: string
  data_inicio: string
  data_fim?: string
  areas_abrangencia: string[]
  agentes_envolvidos: string[]
  recursos_utilizados?: unknown[]
  resultados_obtidos?: any
  custos_operacao?: number
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada'
  coordenador_id: string
  relatorio_final?: string
  created_at: string
  updated_at: string
}

// Types para inputs
export interface CreateOcorrenciaSegurancaInput extends Omit<OcorrenciaSegurancaPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateOcorrenciaSegurancaInput extends Partial<CreateOcorrenciaSegurancaInput> {}

export interface CreatePatrulhamentoInput extends Omit<PatrulhamentoPadrao, 'id' | 'created_at'> {}
export interface UpdatePatrulhamentoInput extends Partial<CreatePatrulhamentoInput> {}

export interface CreateAgenteSegurancaInput extends Omit<AgenteSegurancaPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateAgenteSegurancaInput extends Partial<CreateAgenteSegurancaInput> {}

export interface CreateEquipamentoSegurancaInput extends Omit<EquipamentoSegurancaPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateEquipamentoSegurancaInput extends Partial<CreateEquipamentoSegurancaInput> {}

export interface CreateCameraSegurancaInput extends Omit<CameraSegurancaPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateCameraSegurancaInput extends Partial<CreateCameraSegurancaInput> {}

export interface CreateOperacaoSegurancaInput extends Omit<OperacaoSegurancaPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateOperacaoSegurancaInput extends Partial<CreateOperacaoSegurancaInput> {}

// =====================================================
// HOOK PADRONIZADO USESEGURANCA
// =====================================================

export function useSegurancaStandardized() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // 1. OCORRÊNCIAS DE SEGURANÇA
  // =====================================================

  const getOcorrenciaSegurancaById = useCallback(async (id: string): Promise<EntityResponse<OcorrenciaSegurancaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const cached = CacheUtils.get<OcorrenciaSegurancaPadrao>(`ocorrencia_seguranca:${id}`)
      if (cached) return { data: cached, success: true, message: 'Ocorrência encontrada' }

      const { data, error } = await supabase
        .from('ocorrencias_seguranca')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Ocorrência não encontrada')

      CacheUtils.set(`ocorrencia_seguranca:${id}`, data, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      
      return {
        data,
        success: true,
        message: 'Ocorrência encontrada com sucesso'
      }
    }, 'read', 'Ocorrência de Segurança')
  }, [])

  const getOcorrenciaSegurancaList = useCallback(async (params: GetEntityListParams = {}): Promise<PaginatedResponse<OcorrenciaSegurancaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const {
        page = 1,
        limit = CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort_by = 'data_ocorrencia',
        sort_order = 'desc',
        filters = {}
      } = params

      const cacheKey = CacheUtils.generateCacheKey('ocorrencias_seguranca:list', { page, limit, sort_by, sort_order, filters })
      const cached = CacheUtils.get<PaginatedResponse<OcorrenciaSegurancaPadrao>>(cacheKey)
      if (cached) return cached

      const offset = (page - 1) * limit

      let query = supabase
        .from('ocorrencias_seguranca')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`numero_bo.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%,local_ocorrencia.ilike.%${filters.search}%`)
      }
      if (filters.tipo_ocorrencia) {
        query = query.eq('tipo_ocorrencia', filters.tipo_ocorrencia)
      }
      if (filters.gravidade) {
        query = query.eq('gravidade', filters.gravidade)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.data_inicio) {
        query = query.gte('data_ocorrencia', filters.data_inicio)
      }
      if (filters.data_fim) {
        query = query.lte('data_ocorrencia', filters.data_fim)
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
        message: `${data?.length || 0} ocorrências encontradas`
      }

      CacheUtils.set(cacheKey, result, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      return result
    }, 'read', 'Ocorrências de Segurança')
  }, [])

  const createOcorrenciaSeguranca = useCallback(async (data: CreateOcorrenciaSegurancaInput): Promise<EntityResponse<OcorrenciaSegurancaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('CreateOcorrenciaSegurancaSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      // Gerar número de BO automático
      const numeroBo = `BO${Date.now().toString().slice(-6)}`

      const { data: result, error } = await supabase
        .from('ocorrencias_seguranca')
        .insert([{
          ...data,
          numero_bo: numeroBo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('ocorrencias_seguranca')
      
      return {
        data: result,
        success: true,
        message: `Ocorrência registrada com sucesso. BO: ${numeroBo}`
      }
    }, 'create', 'Ocorrência de Segurança')
  }, [])

  const updateOcorrenciaSeguranca = useCallback(async (id: string, data: UpdateOcorrenciaSegurancaInput): Promise<EntityResponse<OcorrenciaSegurancaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('UpdateOcorrenciaSegurancaSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await supabase
        .from('ocorrencias_seguranca')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('ocorrencias_seguranca')
      CacheUtils.delete(`ocorrencia_seguranca:${id}`)
      
      return {
        data: result,
        success: true,
        message: 'Ocorrência atualizada com sucesso'
      }
    }, 'update', 'Ocorrência de Segurança')
  }, [])

  // =====================================================
  // 2. PATRULHAMENTO
  // =====================================================

  const getPatrulhamentoList = useCallback(async (params: GetEntityListParams = {}): Promise<PaginatedResponse<PatrulhamentoPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const {
        page = 1,
        limit = CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort_by = 'data_patrulha',
        sort_order = 'desc',
        filters = {}
      } = params

      const cacheKey = CacheUtils.generateCacheKey('patrulhamentos:list', { page, limit, sort_by, sort_order, filters })
      const cached = CacheUtils.get<PaginatedResponse<PatrulhamentoPadrao>>(cacheKey)
      if (cached) return cached

      const offset = (page - 1) * limit

      let query = supabase
        .from('patrulhamentos')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.agente_id) {
        query = query.eq('agente_id', filters.agente_id)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.data_inicio) {
        query = query.gte('data_patrulha', filters.data_inicio)
      }
      if (filters.data_fim) {
        query = query.lte('data_patrulha', filters.data_fim)
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
        message: `${data?.length || 0} patrulhamentos encontrados`
      }

      CacheUtils.set(cacheKey, result, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      return result
    }, 'read', 'Patrulhamentos')
  }, [])

  const iniciarPatrulhamento = useCallback(async (data: CreatePatrulhamentoInput): Promise<EntityResponse<PatrulhamentoPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('CreatePatrulhamentoSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await supabase
        .from('patrulhamentos')
        .insert([{
          ...data,
          status: 'em_andamento',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('patrulhamentos')
      
      return {
        data: result,
        success: true,
        message: 'Patrulhamento iniciado com sucesso'
      }
    }, 'create', 'Patrulhamento')
  }, [])

  const finalizarPatrulhamento = useCallback(async (
    patrulhamentoId: string, 
    observacoes: string,
    kmPercorridos?: number
  ): Promise<EntityResponse<PatrulhamentoPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('patrulhamentos')
        .update({
          status: 'concluida',
          horario_fim: new Date().toTimeString().slice(0, 8),
          observacoes,
          km_percorridos: kmPercorridos
        })
        .eq('id', patrulhamentoId)
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('patrulhamentos')
      
      return {
        data,
        success: true,
        message: 'Patrulhamento finalizado com sucesso'
      }
    }, 'update', 'Patrulhamento')
  }, [])

  // =====================================================
  // 3. AGENTES DE SEGURANÇA
  // =====================================================

  const getAgenteSegurancaList = useCallback(async (params: GetEntityListParams = {}): Promise<PaginatedResponse<AgenteSegurancaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const {
        page = 1,
        limit = CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort_by = 'nome_completo',
        sort_order = 'asc',
        filters = {}
      } = params

      const cacheKey = CacheUtils.generateCacheKey('agentes_seguranca:list', { page, limit, sort_by, sort_order, filters })
      const cached = CacheUtils.get<PaginatedResponse<AgenteSegurancaPadrao>>(cacheKey)
      if (cached) return cached

      const offset = (page - 1) * limit

      let query = supabase
        .from('agentes_seguranca')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`nome_completo.ilike.%${filters.search}%,matricula.ilike.%${filters.search}%`)
      }
      if (filters.cargo) {
        query = query.eq('cargo', filters.cargo)
      }
      if (filters.especialidade) {
        query = query.eq('especialidade', filters.especialidade)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.turno_trabalho) {
        query = query.eq('turno_trabalho', filters.turno_trabalho)
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
        message: `${data?.length || 0} agentes encontrados`
      }

      CacheUtils.set(cacheKey, result, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      return result
    }, 'read', 'Agentes de Segurança')
  }, [])

  // =====================================================
  // OPERAÇÕES ESPECIALIZADAS
  // =====================================================

  const gerarRelatorioSeguranca = useCallback(async (
    dataInicio: string,
    dataFim: string,
    tipo?: string
  ): Promise<EntityResponse<any>> => {
    return ErrorHandler.withErrorHandling(async () => {
      // Buscar ocorrências no período
      const { data: ocorrencias, error: errorOcorrencias } = await supabase
        .from('ocorrencias_seguranca')
        .select('*')
        .gte('data_ocorrencia', dataInicio)
        .lte('data_ocorrencia', dataFim)

      if (errorOcorrencias) throw errorOcorrencias

      // Buscar patrulhamentos no período
      const { data: patrulhamentos, error: errorPatrulhamentos } = await supabase
        .from('patrulhamentos')
        .select('*')
        .gte('data_patrulha', dataInicio)
        .lte('data_patrulha', dataFim)
        .eq('status', 'concluida')

      if (errorPatrulhamentos) throw errorPatrulhamentos

      // Estatísticas
      const stats = {
        total_ocorrencias: ocorrencias?.length || 0,
        ocorrencias_por_tipo: {},
        ocorrencias_por_gravidade: {},
        total_patrulhamentos: patrulhamentos?.length || 0,
        km_total_percorrido: patrulhamentos?.reduce((acc, p) => acc + (p.km_percorridos || 0), 0) || 0,
        areas_mais_criticas: [],
        periodo: { inicio: dataInicio, fim: dataFim }
      }

      // Agrupar ocorrências por tipo
      ocorrencias?.forEach(o => {
        stats.ocorrencias_por_tipo[o.tipo_ocorrencia] = 
          (stats.ocorrencias_por_tipo[o.tipo_ocorrencia] || 0) + 1
      })

      // Agrupar por gravidade
      ocorrencias?.forEach(o => {
        stats.ocorrencias_por_gravidade[o.gravidade] = 
          (stats.ocorrencias_por_gravidade[o.gravidade] || 0) + 1
      })

      return {
        data: {
          estatisticas: stats,
          ocorrencias: ocorrencias || [],
          patrulhamentos: patrulhamentos || []
        },
        success: true,
        message: 'Relatório gerado com sucesso'
      }
    }, 'read', 'Relatório de Segurança')
  }, [])

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    // Estados
    loading,
    error,

    // Ocorrências de Segurança
    getOcorrenciaSegurancaById,
    getOcorrenciaSegurancaList,
    createOcorrenciaSeguranca,
    updateOcorrenciaSeguranca,

    // Patrulhamento
    getPatrulhamentoList,
    iniciarPatrulhamento,
    finalizarPatrulhamento,

    // Agentes de Segurança
    getAgenteSegurancaList,

    // Operações especializadas
    gerarRelatorioSeguranca
  }
}