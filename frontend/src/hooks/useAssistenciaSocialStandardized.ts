// =====================================================
// HOOK PADRONIZADO FASE 3 - ASSISTÊNCIA SOCIAL
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

export interface FamiliaPadrao {
  id: string
  codigo_familia: string
  nome_referencia: string
  responsavel_familiar: {
    nome_completo: string
    cpf: string
    rg?: string
    data_nascimento: string
    telefone?: string
    email?: string
    escolaridade: string
    situacao_trabalho: string
    renda_individual?: number
    parentesco: 'pai' | 'mae' | 'avo_ava' | 'tio_tia' | 'irmao_irma' | 'outro'
  }
  endereco: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    uf: string
    cep: string
    coordenadas?: {
      latitude: number
      longitude: number
    }
  }
  composicao_familiar: {
    total_membros: number
    criancas_0_6: number
    criancas_7_14: number
    adolescentes_15_17: number
    adultos_18_59: number
    idosos_60_mais: number
    gestantes: number
    deficientes: number
  }
  nis_responsavel: string
  renda_mensal_total: number
  renda_per_capita: number
  vulnerabilidades: Array<{
    tipo: 'pobreza_extrema' | 'trabalho_infantil' | 'violencia_domestica' | 'uso_drogas' | 'abandono_escolar' | 'situacao_rua' | 'deficiencia' | 'idoso_vulneravel' | 'outro'
    descricao?: string
    gravidade: 'baixa' | 'media' | 'alta' | 'critica'
  }>
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  territorio: {
    microarea?: string
    area_cras: string
    referencia_cras: string
  }
  data_ultimo_atendimento?: string
  tecnico_referencia_id?: string
  observacoes?: string
  status: 'ativo' | 'inativo' | 'suspenso'
  created_at: string
  updated_at?: string
}

export interface CreateFamiliaInput {
  codigo_familia?: string
  nome_referencia: string
  responsavel_familiar: {
    nome_completo: string
    cpf: string
    data_nascimento: string
    telefone?: string
    escolaridade: string
    situacao_trabalho: string
    renda_individual?: number
    parentesco: 'pai' | 'mae' | 'avo_ava' | 'tio_tia' | 'irmao_irma' | 'outro'
  }
  endereco: {
    logradouro: string
    numero: string
    bairro: string
    cidade: string
    uf: string
    cep: string
  }
  composicao_familiar: {
    total_membros: number
    criancas_0_6: number
    criancas_7_14: number
    adolescentes_15_17: number
    adultos_18_59: number
    idosos_60_mais: number
  }
  nis_responsavel: string
  renda_mensal_total: number
  territorio: {
    area_cras: string
    referencia_cras: string
  }
}

export interface UpdateFamiliaInput {
  nome_referencia?: string
  responsavel_familiar?: Partial<FamiliaPadrao['responsavel_familiar']>
  endereco?: Partial<FamiliaPadrao['endereco']>
  composicao_familiar?: Partial<FamiliaPadrao['composicao_familiar']>
  renda_mensal_total?: number
  vulnerabilidades?: FamiliaPadrao['vulnerabilidades']
  prioridade?: 'baixa' | 'media' | 'alta' | 'urgente'
  tecnico_referencia_id?: string
  observacoes?: string
  status?: 'ativo' | 'inativo' | 'suspenso'
}

export interface FamiliaFilters {
  codigo_familia?: string
  nome_referencia?: string
  responsavel_cpf?: string
  nis_responsavel?: string
  area_cras?: string
  referencia_cras?: string
  tecnico_referencia_id?: string
  prioridade?: string | string[]
  status?: string | string[]
  renda_max?: number
  vulnerabilidade_tipo?: string
  data_cadastro_start?: string
  data_cadastro_end?: string
  search?: string
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useAssistenciaSocialStandardized() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // OPERAÇÕES READ - FAMÍLIAS
  // =====================================================

  const getFamiliaById = useCallback(async (
    id: string,
    params?: { include?: string[]; cache?: boolean }
  ): Promise<EntityResponse<FamiliaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      let query = APIClient
        .from('familias_assistencia_social')
        .select(`
          *,
          centro_referencia:centros_assistencia(nome, telefone),
          tecnico_referencia:user_profiles(nome_completo, telefone),
          atendimentos:atendimentos_sociais(
            id,
            data_atendimento,
            tipo_atendimento,
            status,
            tecnico_responsavel:user_profiles(nome_completo)
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
            message: 'Família não encontrada'
          }
        }
        throw error
      }

      return {
        data,
        success: true,
        message: 'Família carregada com sucesso'
      }
    }, 'read', 'Família Assistência Social', { showToast: false })
      .finally(() => setLoading(false))
  }, [])

  const getFamiliaList = useCallback(async (
    params?: GetEntityListParams & { filters?: FamiliaFilters }
  ): Promise<PaginatedResponse<FamiliaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      let query = APIClient
        .from('familias_assistencia_social')
        .select(`
          *,
          centro_referencia:centros_assistencia(nome),
          tecnico_referencia:user_profiles(nome_completo)
        `, { count: 'exact' })

      // Aplicar filtros
      if (params?.filters) {
        const { filters } = params
        
        if (filters.search) {
          query = query.or(`codigo_familia.ilike.%${filters.search}%,nome_referencia.ilike.%${filters.search}%,responsavel_familiar->>nome_completo.ilike.%${filters.search}%`)
        }
        
        if (filters.codigo_familia) {
          query = query.eq('codigo_familia', filters.codigo_familia)
        }
        
        if (filters.nis_responsavel) {
          query = query.eq('nis_responsavel', filters.nis_responsavel)
        }
        
        if (filters.area_cras) {
          query = query.eq('territorio->>area_cras', filters.area_cras)
        }
        
        if (filters.referencia_cras) {
          query = query.eq('territorio->>referencia_cras', filters.referencia_cras)
        }
        
        if (filters.tecnico_referencia_id) {
          query = query.eq('tecnico_referencia_id', filters.tecnico_referencia_id)
        }
        
        if (filters.prioridade) {
          if (Array.isArray(filters.prioridade)) {
            query = query.in('prioridade', filters.prioridade)
          } else {
            query = query.eq('prioridade', filters.prioridade)
          }
        }
        
        if (filters.status) {
          if (Array.isArray(filters.status)) {
            query = query.in('status', filters.status)
          } else {
            query = query.eq('status', filters.status)
          }
        }
        
        if (filters.renda_max) {
          query = query.lte('renda_mensal_total', filters.renda_max)
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
        message: 'Famílias carregadas com sucesso',
        meta: {
          total_count: count || 0,
          filtered_count: data?.length || 0
        }
      }
    }, 'read', 'Famílias Assistência Social', { showToast: false })
      .finally(() => setLoading(false))
  }, [])

  const searchFamilias = useCallback(async (
    query: string,
    filters?: FamiliaFilters
  ): Promise<PaginatedResponse<FamiliaPadrao>> => {
    return getFamiliaList({
      filters: {
        ...filters,
        search: query
      }
    })
  }, [getFamiliaList])

  // =====================================================
  // OPERAÇÕES CREATE - FAMÍLIAS
  // =====================================================

  const createFamilia = useCallback(async (
    data: CreateFamiliaInput
  ): Promise<EntityResponse<FamiliaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      // Gerar código da família se não fornecido
      if (!data.codigo_familia) {
        const year = new Date().getFullYear()
        const timestamp = Date.now().toString().slice(-6)
        data.codigo_familia = `FAM-${year}-${timestamp}`
      }

      // Calcular renda per capita
      const renda_per_capita = data.renda_mensal_total / data.composicao_familiar.total_membros

      const { data: familia, error } = await APIClient
        .from('familias_assistencia_social')
        .insert([{
          ...data,
          renda_per_capita,
          status: 'ativo',
          prioridade: 'media', // Padrão inicial
          vulnerabilidades: []
        }])
        .select(`
          *,
          centro_referencia:centros_assistencia(nome),
          tecnico_referencia:user_profiles(nome_completo)
        `)
        .single()

      if (error) throw error

      toast.success('Família cadastrada com sucesso!')

      return {
        data: familia,
        success: true,
        message: 'Família cadastrada com sucesso!',
        meta: {
          created_at: familia.created_at
        }
      }
    }, 'create', 'Família Assistência Social')
      .finally(() => setLoading(false))
  }, [])

  // =====================================================
  // OPERAÇÕES UPDATE - FAMÍLIAS
  // =====================================================

  const updateFamilia = useCallback(async (
    id: string,
    data: UpdateFamiliaInput
  ): Promise<EntityResponse<FamiliaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      // Se atualizou composição familiar, recalcular renda per capita
      let updateData = { ...data }
      if (data.renda_mensal_total || data.composicao_familiar?.total_membros) {
        const { data: familiaAtual } = await APIClient
          .from('familias_assistencia_social')
          .select('renda_mensal_total, composicao_familiar')
          .eq('id', id)
          .single()

        if (familiaAtual) {
          const renda = data.renda_mensal_total ?? familiaAtual.renda_mensal_total
          const membros = data.composicao_familiar?.total_membros ?? familiaAtual.composicao_familiar.total_membros
          updateData.renda_per_capita = renda / membros
        }
      }

      const { data: familia, error } = await APIClient
        .from('familias_assistencia_social')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          centro_referencia:centros_assistencia(nome),
          tecnico_referencia:user_profiles(nome_completo)
        `)
        .single()

      if (error) throw error

      toast.success('Família atualizada com sucesso!')

      return {
        data: familia,
        success: true,
        message: 'Família atualizada com sucesso!',
        meta: {
          updated_at: familia.updated_at
        }
      }
    }, 'update', 'Família Assistência Social')
      .finally(() => setLoading(false))
  }, [])

  // =====================================================
  // OPERAÇÕES DELETE - FAMÍLIAS
  // =====================================================

  const deleteFamilia = useCallback(async (id: string): Promise<DeleteResponse> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      // Verificar se família tem atendimentos ativos
      const { data: atendimentos } = await APIClient
        .from('atendimentos_sociais')
        .select('id')
        .eq('familia_id', id)
        .eq('status', 'aberto')
        .limit(1)

      if (atendimentos && atendimentos.length > 0) {
        return {
          success: false,
          message: 'Não é possível deletar família com atendimentos em aberto'
        }
      }

      const { error } = await APIClient
        .from('familias_assistencia_social')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Família removida com sucesso!')

      return {
        success: true,
        message: 'Família removida com sucesso!',
        deleted_id: id
      }
    }, 'delete', 'Família Assistência Social')
      .finally(() => setLoading(false))
  }, [])

  const softFamiliaDelete = useCallback(async (
    id: string,
    reason?: string
  ): Promise<DeleteResponse> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      const { error } = await APIClient
        .from('familias_assistencia_social')
        .update({
          status: 'inativo',
          observacoes: reason ? `Desativada: ${reason}` : 'Desativada pelo sistema',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Família desativada com sucesso!')

      return {
        success: true,
        message: 'Família desativada com sucesso!',
        deleted_id: id,
        soft_deleted: true
      }
    }, 'delete', 'Família Assistência Social')
      .finally(() => setLoading(false))
  }, [])

  // =====================================================
  // OPERAÇÕES ESPECIALIZADAS
  // =====================================================

  const adicionarVulnerabilidade = useCallback(async (
    familiaId: string,
    vulnerabilidade: {
      tipo: string
      descricao?: string
      gravidade: 'baixa' | 'media' | 'alta' | 'critica'
    }
  ): Promise<EntityResponse<FamiliaPadrao>> => {
    return ErrorHandler.withErrorHandling(async () => {
      setLoading(true)

      // Buscar vulnerabilidades atuais
      const { data: familia } = await APIClient
        .from('familias_assistencia_social')
        .select('vulnerabilidades')
        .eq('id', familiaId)
        .single()

      if (!familia) throw new Error('Família não encontrada')

      const vulnerabilidades = Array.isArray(familia.vulnerabilidades) 
        ? [...familia.vulnerabilidades, vulnerabilidade]
        : [vulnerabilidade]

      // Recalcular prioridade baseada na gravidade
      const gravidadeMaxima = Math.max(...vulnerabilidades.map(v => {
        switch (v.gravidade) {
          case 'critica': return 4
          case 'alta': return 3
          case 'media': return 2
          case 'baixa': return 1
          default: return 1
        }
      }))

      let prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
      switch (gravidadeMaxima) {
        case 4: prioridade = 'urgente'; break
        case 3: prioridade = 'alta'; break
        case 2: prioridade = 'media'; break
        default: prioridade = 'baixa'
      }

      const { data: familiaAtualizada, error } = await APIClient
        .from('familias_assistencia_social')
        .update({
          vulnerabilidades,
          prioridade,
          updated_at: new Date().toISOString()
        })
        .eq('id', familiaId)
        .select()
        .single()

      if (error) throw error

      return {
        data: familiaAtualizada,
        success: true,
        message: 'Vulnerabilidade adicionada com sucesso!'
      }
    }, 'update', 'Vulnerabilidade Família')
      .finally(() => setLoading(false))
  }, [])

  const definirTecnicoReferencia = useCallback(async (
    familiaId: string,
    tecnicoId: string
  ): Promise<EntityResponse<FamiliaPadrao>> => {
    return updateFamilia(familiaId, { tecnico_referencia_id: tecnicoId })
  }, [updateFamilia])

  const getFamiliasPorPrioridade = useCallback(async (
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  ): Promise<PaginatedResponse<FamiliaPadrao>> => {
    return getFamiliaList({
      filters: { prioridade, status: 'ativo' },
      sort_by: 'created_at',
      sort_order: 'desc'
    })
  }, [getFamiliaList])

  const getFamiliasComVulnerabilidade = useCallback(async (
    tipoVulnerabilidade: string
  ): Promise<PaginatedResponse<FamiliaPadrao>> => {
    return getFamiliaList({
      filters: { vulnerabilidade_tipo: tipoVulnerabilidade, status: 'ativo' }
    })
  }, [getFamiliaList])

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    loading,
    error,
    
    // Operações READ - Nomenclatura Padronizada FASE 3
    getFamiliaById,
    getFamiliaList,
    searchFamilias,
    
    // Operações CREATE - Nomenclatura Padronizada FASE 3
    createFamilia,
    
    // Operações UPDATE - Nomenclatura Padronizada FASE 3
    updateFamilia,
    
    // Operações DELETE - Nomenclatura Padronizada FASE 3
    deleteFamilia,
    softFamiliaDelete,
    
    // Operações Especializadas
    adicionarVulnerabilidade,
    definirTecnicoReferencia,
    getFamiliasPorPrioridade,
    getFamiliasComVulnerabilidade,
    
    // Utility
    clearError: () => setError(null)
  }
}