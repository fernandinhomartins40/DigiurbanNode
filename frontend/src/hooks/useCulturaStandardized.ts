// =====================================================
// HOOK PADRONIZADO FASE 3 - CULTURA
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
import { ErrorHandler } from "@/lib/error-handler"

// =====================================================
// INTERFACES ESPECÍFICAS
// =====================================================

export interface EventoCulturalPadrao {
  id: string
  nome: string
  descricao: string
  tipo_evento: 'festival' | 'exposicao' | 'teatro' | 'musica' | 'danca' | 'literatura' | 'cinema' | 'workshop' | 'oficina' | 'palestra'
  categoria: 'infantil' | 'jovem' | 'adulto' | 'idoso' | 'familiar' | 'geral'
  data_inicio: string
  data_fim: string
  horario_inicio: string
  horario_fim: string
  local: {
    nome: string
    endereco: string
    capacidade: number
    acessibilidade: boolean
    coordenadas?: {
      latitude: number
      longitude: number
    }
  }
  organizador: {
    nome: string
    contato: string
    tipo: 'prefeitura' | 'parceiro' | 'terceiro'
  }
  publico_alvo: string[]
  faixa_etaria: {
    idade_minima?: number
    idade_maxima?: number
    livre: boolean
  }
  investimento: {
    custo_total: number
    fonte_recurso: 'municipal' | 'estadual' | 'federal' | 'privado' | 'misto'
    patrocinadores?: string[]
  }
  inscricoes: {
    necessaria: boolean
    gratuita: boolean
    valor?: number
    vagas_total?: number
    vagas_ocupadas?: number
    data_abertura?: string
    data_encerramento?: string
  }
  promocao: {
    divulgacao_oficial: boolean
    redes_sociais: string[]
    materiais_graficos: string[]
    parcerias_midia: string[]
  }
  status: 'planejamento' | 'divulgacao' | 'inscricoes_abertas' | 'em_andamento' | 'concluido' | 'cancelado'
  observacoes?: string
  created_at: string
  updated_at?: string
}

export interface EspacoCulturalPadrao {
  id: string
  nome: string
  tipo: 'teatro' | 'biblioteca' | 'museo' | 'centro_cultural' | 'galeria' | 'auditorio' | 'arena' | 'casa_cultura'
  endereco: {
    logradouro: string
    numero: string
    bairro: string
    cidade: string
    uf: string
    cep: string
    coordenadas?: {
      latitude: number
      longitude: number
    }
  }
  capacidade: {
    total: number
    sentados?: number
    em_pe?: number
    acessivel: number
  }
  infraestrutura: {
    climatizado: boolean
    som_profissional: boolean
    iluminacao_cenica: boolean
    projecao: boolean
    palco: boolean
    camarim: boolean
    estacionamento: boolean
    acessibilidade: boolean
  }
  horario_funcionamento: Record<string, {
    abertura: string
    fechamento: string
    funcionando: boolean
  }>
  administracao: {
    responsavel_id: string
    equipe_tecnica: number
    terceirizado: boolean
  }
  agenda: {
    disponivel_locacao: boolean
    valor_hora?: number
    antecedencia_minima: number
  }
  status: 'ativo' | 'reforma' | 'manutencao' | 'inativo'
  created_at: string
  updated_at?: string
}

export interface ArtistaPadrao {
  id: string
  nome_artistico: string
  nome_real: string
  cpf?: string
  rg?: string
  data_nascimento?: string
  endereco?: {
    logradouro: string
    numero: string
    bairro: string
    cidade: string
    uf: string
    cep: string
  }
  contato: {
    telefone?: string
    email?: string
    instagram?: string
    facebook?: string
    youtube?: string
  }
  modalidades: string[]
  biografia: string
  portfolio: {
    fotos: string[]
    videos: string[]
    audios: string[]
    documentos: string[]
  }
  experiencia: {
    anos_atividade: number
    principais_trabalhos: string[]
    premios: string[]
    formacao: string[]
  }
  disponibilidade: {
    dias_semana: string[]
    periodo: 'manha' | 'tarde' | 'noite' | 'integral' | 'flexivel'
    viagens: boolean
  }
  cachê: {
    valor_base?: number
    negociavel: boolean
    observacoes?: string
  }
  status: 'ativo' | 'inativo' | 'suspenso'
  created_at: string
  updated_at?: string
}

export interface CreateEventoInput {
  nome: string
  descricao: string
  tipo_evento: EventoCulturalPadrao['tipo_evento']
  categoria: EventoCulturalPadrao['categoria']
  data_inicio: string
  data_fim: string
  horario_inicio: string
  horario_fim: string
  local: EventoCulturalPadrao['local']
  organizador: EventoCulturalPadrao['organizador']
  publico_alvo: string[]
  faixa_etaria: EventoCulturalPadrao['faixa_etaria']
  investimento: EventoCulturalPadrao['investimento']
  inscricoes?: EventoCulturalPadrao['inscricoes']
}

export interface UpdateEventoInput {
  nome?: string
  descricao?: string
  data_inicio?: string
  data_fim?: string
  horario_inicio?: string
  horario_fim?: string
  local?: Partial<EventoCulturalPadrao['local']>
  organizador?: Partial<EventoCulturalPadrao['organizador']>
  publico_alvo?: string[]
  investimento?: Partial<EventoCulturalPadrao['investimento']>
  inscricoes?: Partial<EventoCulturalPadrao['inscricoes']>
  promocao?: Partial<EventoCulturalPadrao['promocao']>
  status?: EventoCulturalPadrao['status']
  observacoes?: string
}

export interface EventoFilters {
  nome?: string
  tipo_evento?: string | string[]
  categoria?: string | string[]
  status?: string | string[]
  data_inicio_start?: string
  data_inicio_end?: string
  local_nome?: string
  organizador_tipo?: string
  publico_alvo?: string
  gratuito?: boolean
  search?: string
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useCulturaStandardized() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // OPERAÇÕES READ - EVENTOS CULTURAIS
  // =====================================================

  const getEventoById = useCallback(async (
    id: string,
    params?: { include?: string[]; cache?: boolean }
  ): Promise<EntityResponse<EventoCulturalPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      let query = APIClient
        .from('eventos_culturais')
        .select(`
          *,
          organizador_usuario:user_profiles(nome_completo, telefone),
          inscricoes_evento:inscricoes_eventos(
            id,
            nome_participante,
            data_inscricao,
            status
          )
        `)
        .eq('id', id)
        .single()

      const { data, error } = await query

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null as any,
            success: false,
            message: 'Evento cultural não encontrado'
          }
        }
        throw error
      }

      return {
        data,
        success: true,
        message: 'Evento cultural carregado com sucesso'
      }
    }, 'read', 'Evento Cultural', { showToast: false })
      .finally(() => setLoading(false))
  }, [])

  const getEventoList = useCallback(async (
    params?: GetEntityListParams & { filters?: EventoFilters }
  ): Promise<PaginatedResponse<EventoCulturalPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      let query = APIClient
        .from('eventos_culturais')
        .select(`
          *,
          organizador_usuario:user_profiles(nome_completo)
        `, { count: 'exact' })

      // Aplicar filtros
      if (params?.filters) {
        const { filters } = params
        
        if (filters.search) {
          query = query.or(`nome.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%,local->>nome.ilike.%${filters.search}%`)
        }
        
        if (filters.nome) {
          query = query.ilike('nome', `%${filters.nome}%`)
        }
        
        if (filters.tipo_evento) {
          if (Array.isArray(filters.tipo_evento)) {
            query = query.in('tipo_evento', filters.tipo_evento)
          } else {
            query = query.eq('tipo_evento', filters.tipo_evento)
          }
        }
        
        if (filters.categoria) {
          if (Array.isArray(filters.categoria)) {
            query = query.in('categoria', filters.categoria)
          } else {
            query = query.eq('categoria', filters.categoria)
          }
        }
        
        if (filters.status) {
          if (Array.isArray(filters.status)) {
            query = query.in('status', filters.status)
          } else {
            query = query.eq('status', filters.status)
          }
        }
        
        if (filters.data_inicio_start) {
          query = query.gte('data_inicio', filters.data_inicio_start)
        }
        
        if (filters.data_inicio_end) {
          query = query.lte('data_inicio', filters.data_inicio_end)
        }
        
        if (filters.local_nome) {
          query = query.ilike('local->>nome', `%${filters.local_nome}%`)
        }
        
        if (filters.organizador_tipo) {
          query = query.eq('organizador->>tipo', filters.organizador_tipo)
        }
        
        if (filters.gratuito !== undefined) {
          query = query.eq('inscricoes->>gratuita', filters.gratuito)
        }
      }

      // Aplicar ordenação
      const sortField = params?.sort_by || 'data_inicio'
      const sortOrder = params?.sort_order || 'asc'
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
        message: 'Eventos culturais carregados com sucesso',
        meta: {
          total_count: count || 0,
          filtered_count: data?.length || 0
        }
      }
    }, 'read', 'Eventos Culturais', { showToast: false })
      .finally(() => setLoading(false))
  }, [])

  const searchEventos = useCallback(async (
    query: string,
    filters?: EventoFilters
  ): Promise<PaginatedResponse<EventoCulturalPadrao>> => {
    return getEventoList({
      filters: {
        ...filters,
        search: query
      }
    })
  }, [getEventoList])

  // =====================================================
  // OPERAÇÕES CREATE - EVENTOS CULTURAIS
  // =====================================================

  const createEvento = useCallback(async (
    data: CreateEventoInput
  ): Promise<EntityResponse<EventoCulturalPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      // Validações de negócio
      const dataInicio = new Date(data.data_inicio)
      const dataFim = new Date(data.data_fim)
      
      if (dataFim < dataInicio) {
        return {
          data: null as any,
          success: false,
          message: 'Data de fim deve ser posterior à data de início'
        }
      }

      const { data: evento, error } = await APIClient
        .from('eventos_culturais')
        .insert([{
          ...data,
          status: 'planejamento',
          promocao: {
            divulgacao_oficial: false,
            redes_sociais: [],
            materiais_graficos: [],
            parcerias_midia: []
          }
        }])
        .select(`
          *,
          organizador_usuario:user_profiles(nome_completo)
        `)
        .single()

      if (error) throw error

      toast.success('Evento cultural criado com sucesso!')

      return {
        data: evento,
        success: true,
        message: 'Evento cultural criado com sucesso!',
        meta: {
          created_at: evento.created_at
        }
      }
    }, 'create', 'Evento Cultural')
      .finally(() => setLoading(false))
  }, [])

  // =====================================================
  // OPERAÇÕES UPDATE - EVENTOS CULTURAIS
  // =====================================================

  const updateEvento = useCallback(async (
    id: string,
    data: UpdateEventoInput
  ): Promise<EntityResponse<EventoCulturalPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      // Validações de negócio
      if (data.data_inicio && data.data_fim) {
        const dataInicio = new Date(data.data_inicio)
        const dataFim = new Date(data.data_fim)
        
        if (dataFim < dataInicio) {
          return {
            data: null as any,
            success: false,
            message: 'Data de fim deve ser posterior à data de início'
          }
        }
      }

      const { data: evento, error } = await APIClient
        .from('eventos_culturais')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          organizador_usuario:user_profiles(nome_completo)
        `)
        .single()

      if (error) throw error

      toast.success('Evento cultural atualizado com sucesso!')

      return {
        data: evento,
        success: true,
        message: 'Evento cultural atualizado com sucesso!',
        meta: {
          updated_at: evento.updated_at
        }
      }
    }, 'update', 'Evento Cultural')
      .finally(() => setLoading(false))
  }, [])

  // =====================================================
  // OPERAÇÕES DELETE - EVENTOS CULTURAIS
  // =====================================================

  const deleteEvento = useCallback(async (id: string): Promise<DeleteResponse> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      // Verificar se evento tem inscrições
      const { data: inscricoes } = await APIClient
        .from('inscricoes_eventos')
        .select('id')
        .eq('evento_id', id)
        .limit(1)

      if (inscricoes && inscricoes.length > 0) {
        return {
          success: false,
          message: 'Não é possível deletar evento com inscrições realizadas'
        }
      }

      const { error } = await APIClient
        .from('eventos_culturais')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Evento cultural removido com sucesso!')

      return {
        success: true,
        message: 'Evento cultural removido com sucesso!',
        deleted_id: id
      }
    }, 'delete', 'Evento Cultural')
      .finally(() => setLoading(false))
  }, [])

  const softEventoDelete = useCallback(async (
    id: string,
    reason?: string
  ): Promise<DeleteResponse> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      const { error } = await APIClient
        .from('eventos_culturais')
        .update({
          status: 'cancelado',
          observacoes: reason ? `Cancelado: ${reason}` : 'Cancelado pelo sistema',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Evento cultural cancelado com sucesso!')

      return {
        success: true,
        message: 'Evento cultural cancelado com sucesso!',
        deleted_id: id,
        soft_deleted: true
      }
    }, 'delete', 'Evento Cultural')
      .finally(() => setLoading(false))
  }, [])

  // =====================================================
  // OPERAÇÕES ESPECIALIZADAS
  // =====================================================

  const iniciarInscricoes = useCallback(async (
    eventoId: string,
    configInscricoes: {
      vagas_total: number
      gratuita: boolean
      valor?: number
      data_abertura: string
      data_encerramento: string
    }
  ): Promise<EntityResponse<EventoCulturalPadrao>> => {
    return updateEvento(eventoId, {
      status: 'inscricoes_abertas',
      inscricoes: {
        necessaria: true,
        vagas_ocupadas: 0,
        ...configInscricoes
      }
    })
  }, [updateEvento])

  const iniciarEvento = useCallback(async (
    eventoId: string
  ): Promise<EntityResponse<EventoCulturalPadrao>> => {
    return updateEvento(eventoId, {
      status: 'em_andamento'
    })
  }, [updateEvento])

  const concluirEvento = useCallback(async (
    eventoId: string,
    observacoes?: string
  ): Promise<EntityResponse<EventoCulturalPadrao>> => {
    return updateEvento(eventoId, {
      status: 'concluido',
      observacoes
    })
  }, [updateEvento])

  const getEventosPorPeriodo = useCallback(async (
    dataInicio: string,
    dataFim: string
  ): Promise<PaginatedResponse<EventoCulturalPadrao>> => {
    return getEventoList({
      filters: {
        data_inicio_start: dataInicio,
        data_inicio_end: dataFim,
        status: ['divulgacao', 'inscricoes_abertas', 'em_andamento']
      },
      sort_by: 'data_inicio',
      sort_order: 'asc'
    })
  }, [getEventoList])

  const getEventosGratuitos = useCallback(async (): Promise<PaginatedResponse<EventoCulturalPadrao>> => {
    return getEventoList({
      filters: {
        gratuito: true,
        status: ['divulgacao', 'inscricoes_abertas', 'em_andamento']
      }
    })
  }, [getEventoList])

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    loading,
    error,
    
    // Operações READ - Nomenclatura Padronizada FASE 3
    getEventoById,
    getEventoList,
    searchEventos,
    
    // Operações CREATE - Nomenclatura Padronizada FASE 3
    createEvento,
    
    // Operações UPDATE - Nomenclatura Padronizada FASE 3
    updateEvento,
    
    // Operações DELETE - Nomenclatura Padronizada FASE 3
    deleteEvento,
    softEventoDelete,
    
    // Operações Especializadas
    iniciarInscricoes,
    iniciarEvento,
    concluirEvento,
    getEventosPorPeriodo,
    getEventosGratuitos,
    
    // Utility
    clearError: () => setError(null)
  }
}