// =====================================================
// HOOK PADRONIZADO PARA ESPORTES - FASE 3
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

export interface EquipamentoEsportivoPadrao {
  id: string
  nome: string
  tipo: 'quadra' | 'campo' | 'piscina' | 'ginasio' | 'pista' | 'academia'
  endereco: string
  capacidade_maxima: number
  infraestrutura: any
  horario_funcionamento: any
  valor_locacao: number
  responsavel_id: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface AgendamentoEquipamentoPadrao {
  id: string
  equipamento_id: string
  solicitante_id: string
  data_inicio: string
  data_fim: string
  finalidade: string
  publico_esperado: number
  status: 'solicitado' | 'aprovado' | 'realizado' | 'cancelado'
  valor_total: number
  observacoes?: string
  created_at: string
}

export interface EscolinhaEsportivaPadrao {
  id: string
  nome: string
  modalidade: string
  faixa_etaria_minima: number
  faixa_etaria_maxima: number
  vagas_disponiveis: number
  professor_responsavel_id: string
  equipamento_id: string
  horarios: any
  valor_mensal: number
  material_necessario?: string[]
  status: 'ativa' | 'inativa' | 'em_formacao'
  created_at: string
  updated_at: string
}

export interface AtletaEscolinhasPadrao {
  id: string
  escolinha_id: string
  atleta_nome: string
  atleta_cpf: string
  data_nascimento: string
  responsavel_nome: string
  responsavel_telefone: string
  endereco: string
  data_matricula: string
  status: 'ativo' | 'inativo' | 'transferido'
  observacoes_medicas?: string
  created_at: string
}

export interface AtletaMunicipalPadrao {
  id: string
  nome_completo: string
  cpf: string
  rg: string
  data_nascimento: string
  modalidade_principal: string
  categoria: string
  nivel_competitivo: 'iniciante' | 'intermediario' | 'avancado' | 'elite'
  clube_origem?: string
  tecnico_responsavel?: string
  conquistas?: string[]
  status: 'ativo' | 'aposentado' | 'suspenso'
  created_at: string
  updated_at: string
}

export interface EventoEsportivoPadrao {
  id: string
  nome: string
  tipo_evento: 'campeonato' | 'torneio' | 'festival' | 'clinica' | 'demonstracao'
  modalidades: string[]
  data_inicio: string
  data_fim: string
  local_realizacao: string
  publico_esperado: number
  faixa_etaria?: string
  inscricoes_abertas: boolean
  valor_inscricao?: number
  premiacao?: any
  patrocinadores?: string[]
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'
  created_at: string
  updated_at: string
}

export interface RecursoEsportivoPadrao {
  id: string
  nome: string
  tipo_recurso: 'material' | 'equipamento' | 'uniforme' | 'medicamento'
  categoria: string
  quantidade_disponivel: number
  quantidade_minima: number
  valor_unitario: number
  fornecedor?: string
  data_validade?: string
  local_armazenamento: string
  responsavel_id: string
  observacoes?: string
  created_at: string
  updated_at: string
}

// Types para inputs
export interface CreateEquipamentoEsportivoInput extends Omit<EquipamentoEsportivoPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateEquipamentoEsportivoInput extends Partial<CreateEquipamentoEsportivoInput> {}

export interface CreateAgendamentoEquipamentoInput extends Omit<AgendamentoEquipamentoPadrao, 'id' | 'created_at'> {}
export interface UpdateAgendamentoEquipamentoInput extends Partial<CreateAgendamentoEquipamentoInput> {}

export interface CreateEscolinhaEsportivaInput extends Omit<EscolinhaEsportivaPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateEscolinhaEsportivaInput extends Partial<CreateEscolinhaEsportivaInput> {}

export interface CreateAtletaEscolinhasInput extends Omit<AtletaEscolinhasPadrao, 'id' | 'created_at'> {}
export interface UpdateAtletaEscolinhasInput extends Partial<CreateAtletaEscolinhasInput> {}

export interface CreateAtletaMunicipalInput extends Omit<AtletaMunicipalPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateAtletaMunicipalInput extends Partial<CreateAtletaMunicipalInput> {}

export interface CreateEventoEsportivoInput extends Omit<EventoEsportivoPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateEventoEsportivoInput extends Partial<CreateEventoEsportivoInput> {}

export interface CreateRecursoEsportivoInput extends Omit<RecursoEsportivoPadrao, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateRecursoEsportivoInput extends Partial<CreateRecursoEsportivoInput> {}

// =====================================================
// HOOK PADRONIZADO USEESPORTES
// =====================================================

export function useEsportesStandardized() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // 1. EQUIPAMENTOS ESPORTIVOS
  // =====================================================

  const getEquipamentoEsportivoById = useCallback(async (id: string): Promise<EntityResponse<EquipamentoEsportivoPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const cached = CacheUtils.get<EquipamentoEsportivoPadrao>(`equipamento_esportivo:${id}`)
      if (cached) return { data: cached, success: true, message: 'Equipamento encontrado' }

      const { data, error } = await supabase
        .from('equipamentos_esportivos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Equipamento não encontrado')

      CacheUtils.set(`equipamento_esportivo:${id}`, data, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      
      return {
        data,
        success: true,
        message: 'Equipamento encontrado com sucesso'
      }
    }, 'read', 'Equipamento Esportivo')
  }, [])

  const getEquipamentoEsportivoList = useCallback(async (params: GetEntityListParams = {}): Promise<PaginatedResponse<EquipamentoEsportivoPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const {
        page = 1,
        limit = CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort_by = 'nome',
        sort_order = 'asc',
        filters = {}
      } = params

      const cacheKey = CacheUtils.generateCacheKey('equipamentos_esportivos:list', { page, limit, sort_by, sort_order, filters })
      const cached = CacheUtils.get<PaginatedResponse<EquipamentoEsportivoPadrao>>(cacheKey)
      if (cached) return cached

      const offset = (page - 1) * limit

      let query = supabase
        .from('equipamentos_esportivos')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`nome.ilike.%${filters.search}%,endereco.ilike.%${filters.search}%`)
      }
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo)
      }
      if (filters.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo)
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
        message: `${data?.length || 0} equipamentos encontrados`
      }

      CacheUtils.set(cacheKey, result, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      return result
    }, 'read', 'Equipamentos Esportivos')
  }, [])

  const createEquipamentoEsportivo = useCallback(async (data: CreateEquipamentoEsportivoInput): Promise<EntityResponse<EquipamentoEsportivoPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('CreateEquipamentoEsportivoSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await supabase
        .from('equipamentos_esportivos')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('equipamentos_esportivos')
      
      return {
        data: result,
        success: true,
        message: 'Equipamento esportivo criado com sucesso'
      }
    }, 'create', 'Equipamento Esportivo')
  }, [])

  const updateEquipamentoEsportivo = useCallback(async (id: string, data: UpdateEquipamentoEsportivoInput): Promise<EntityResponse<EquipamentoEsportivoPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('UpdateEquipamentoEsportivoSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await supabase
        .from('equipamentos_esportivos')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('equipamentos_esportivos')
      CacheUtils.delete(`equipamento_esportivo:${id}`)
      
      return {
        data: result,
        success: true,
        message: 'Equipamento esportivo atualizado com sucesso'
      }
    }, 'update', 'Equipamento Esportivo')
  }, [])

  const deleteEquipamentoEsportivo = useCallback(async (id: string): Promise<DeleteResponse> => {
    return ErrorHandler.withErrorHandling(async () => {
      const { error } = await supabase
        .from('equipamentos_esportivos')
        .update({
          ativo: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      CacheUtils.invalidateEntity('equipamentos_esportivos')
      CacheUtils.delete(`equipamento_esportivo:${id}`)
      
      return {
        success: true,
        message: 'Equipamento esportivo removido com sucesso'
      }
    }, 'delete', 'Equipamento Esportivo')
  }, [])

  // =====================================================
  // 2. AGENDAMENTOS DE EQUIPAMENTOS
  // =====================================================

  const getAgendamentoEquipamentoList = useCallback(async (params: GetEntityListParams = {}): Promise<PaginatedResponse<AgendamentoEquipamentoPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const {
        page = 1,
        limit = CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort_by = 'data_inicio',
        sort_order = 'desc',
        filters = {}
      } = params

      const cacheKey = CacheUtils.generateCacheKey('agendamentos_equipamentos:list', { page, limit, sort_by, sort_order, filters })
      const cached = CacheUtils.get<PaginatedResponse<AgendamentoEquipamentoPadrao>>(cacheKey)
      if (cached) return cached

      const offset = (page - 1) * limit

      let query = supabase
        .from('agendamentos_equipamentos')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters.equipamento_id) {
        query = query.eq('equipamento_id', filters.equipamento_id)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.data_inicio) {
        query = query.gte('data_inicio', filters.data_inicio)
      }
      if (filters.data_fim) {
        query = query.lte('data_fim', filters.data_fim)
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
        message: `${data?.length || 0} agendamentos encontrados`
      }

      CacheUtils.set(cacheKey, result, CRUD_CONSTANTS.CACHE_TTL_SECONDS)
      return result
    }, 'read', 'Agendamentos de Equipamentos')
  }, [])

  const createAgendamentoEquipamento = useCallback(async (data: CreateAgendamentoEquipamentoInput): Promise<EntityResponse<AgendamentoEquipamentoPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const validation = ValidationHelper.validateWithSchema('CreateAgendamentoEquipamentoSchema', data)
      if (!validation.success) {
        return { success: false, message: validation.errors.join(', ') }
      }

      const { data: result, error } = await supabase
        .from('agendamentos_equipamentos')
        .insert([{
          ...data,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('agendamentos_equipamentos')
      
      return {
        data: result,
        success: true,
        message: 'Agendamento criado com sucesso'
      }
    }, 'create', 'Agendamento de Equipamento')
  }, [])

  // =====================================================
  // OPERAÇÕES ESPECIALIZADAS
  // =====================================================

  const aprovarAgendamento = useCallback(async (agendamentoId: string): Promise<EntityResponse<AgendamentoEquipamentoPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('agendamentos_equipamentos')
        .update({
          status: 'aprovado',
          updated_at: new Date().toISOString()
        })
        .eq('id', agendamentoId)
        .select()
        .single()

      if (error) throw error

      CacheUtils.invalidateEntity('agendamentos_equipamentos')
      
      return {
        data,
        success: true,
        message: 'Agendamento aprovado com sucesso'
      }
    }, 'update', 'Agendamento')
  }, [])

  const verificarDisponibilidadeEquipamento = useCallback(async (
    equipamentoId: string, 
    dataInicio: string, 
    dataFim: string
  ): Promise<EntityResponse<{ disponivel: boolean; conflitos?: unknown[] }>> => {
    return ErrorHandler.withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('agendamentos_equipamentos')
        .select('*')
        .eq('equipamento_id', equipamentoId)
        .eq('status', 'aprovado')
        .or(`data_inicio.lte.${dataFim},data_fim.gte.${dataInicio}`)

      if (error) throw error

      const conflitos = data || []
      const disponivel = conflitos.length === 0

      return {
        data: { disponivel, conflitos },
        success: true,
        message: disponivel ? 'Equipamento disponível' : `${conflitos.length} conflitos encontrados`
      }
    }, 'read', 'Disponibilidade de Equipamento')
  }, [])

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    // Estados
    loading,
    error,

    // Equipamentos Esportivos
    getEquipamentoEsportivoById,
    getEquipamentoEsportivoList,
    createEquipamentoEsportivo,
    updateEquipamentoEsportivo,
    deleteEquipamentoEsportivo,

    // Agendamentos
    getAgendamentoEquipamentoList,
    createAgendamentoEquipamento,
    aprovarAgendamento,
    verificarDisponibilidadeEquipamento,

    // Operações especializadas
    aprovarAgendamento,
    verificarDisponibilidadeEquipamento
  }
}