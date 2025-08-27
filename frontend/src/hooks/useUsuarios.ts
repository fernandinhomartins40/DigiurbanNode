// =====================================================
// HOOK PADRONIZADO FASE 3 - USUÁRIOS
// =====================================================

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from "@/lib/supabase"
import { 
  GetEntityListParams, 
  EntityResponse, 
  PaginatedResponse, 
  DeleteResponse,
  BulkResponse,
  CRUD_CONSTANTS 
} from "@/types/crud-patterns"
import { 
  CreateUsuarioSchema, 
  UpdateUsuarioSchema, 
  UsuarioFiltersSchema,
  ValidationHelper 
} from "@/lib/validation-schemas"

// =====================================================
// INTERFACES ESPECÍFICAS
// =====================================================

export interface UsuarioPadrao {
  id: string
  email: string
  nome_completo: string
  tipo_usuario: 'super_admin' | 'admin' | 'secretario' | 'diretor' | 'coordenador' | 'funcionario' | 'atendente' | 'cidadao'
  tenant_id?: string
  secretaria_id?: string
  setor_id?: string
  cpf?: string
  telefone?: string
  cargo?: string
  avatar_url?: string
  data_nascimento?: string
  endereco?: {
    cep: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    pais?: string
  }
  ativo: boolean
  created_at: string
  updated_at?: string
  deleted_at?: string
}

export interface CreateUsuarioInput {
  email: string
  nome_completo: string
  tipo_usuario: 'super_admin' | 'admin' | 'secretario' | 'diretor' | 'coordenador' | 'funcionario' | 'atendente' | 'cidadao'
  tenant_id?: string
  secretaria_id?: string
  setor_id?: string
  cpf?: string
  telefone?: string
  cargo?: string
  enviar_email?: boolean
  senha_temporaria?: string
}

export interface UpdateUsuarioInput {
  nome_completo?: string
  tipo_usuario?: 'super_admin' | 'admin' | 'secretario' | 'diretor' | 'coordenador' | 'funcionario' | 'atendente' | 'cidadao'
  secretaria_id?: string
  setor_id?: string
  cpf?: string
  telefone?: string
  cargo?: string
  avatar_url?: string
  endereco?: {
    cep: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
  }
  ativo?: boolean
}

export interface UsuarioFilters {
  email?: string
  nome_completo?: string
  tipo_usuario?: string | string[]
  secretaria_id?: string
  setor_id?: string
  ativo?: boolean
  data_criacao_start?: string
  data_criacao_end?: string
  search?: string
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useUsuarios() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // OPERAÇÕES READ
  // =====================================================

  const getUsuarioById = useCallback(async (
    id: string,
    params?: { include?: string[]; cache?: boolean }
  ): Promise<EntityResponse<UsuarioPadrao>> => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          secretaria:secretarias(nome, sigla),
          setor:setores(nome),
          tenant:tenants(nome)
        `)
        .eq('id', id)
        .single()

      const { data, error } = await query

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null as any,
            success: false,
            message: 'Usuário não encontrado'
          }
        }
        throw error
      }

      return {
        data,
        success: true,
        message: 'Usuário carregado com sucesso'
      }
    } catch (err: Error | unknown) {
      setError(err.message)
      return {
        data: null as any,
        success: false,
        message: `Erro ao carregar usuário: ${err.message}`
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const getUsuarioList = useCallback(async (
    params?: GetEntityListParams & { filters?: UsuarioFilters }
  ): Promise<PaginatedResponse<UsuarioPadrao>> => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          secretaria:secretarias(nome, sigla),
          setor:setores(nome),
          tenant:tenants(nome)
        `, { count: 'exact' })

      // Aplicar filtros
      if (params?.filters) {
        const { filters } = params
        
        if (filters.search) {
          query = query.or(`nome_completo.ilike.%${filters.search}%,email.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%`)
        }
        
        if (filters.email) {
          query = query.ilike('email', `%${filters.email}%`)
        }
        
        if (filters.nome_completo) {
          query = query.ilike('nome_completo', `%${filters.nome_completo}%`)
        }
        
        if (filters.tipo_usuario) {
          if (Array.isArray(filters.tipo_usuario)) {
            query = query.in('tipo_usuario', filters.tipo_usuario)
          } else {
            query = query.eq('tipo_usuario', filters.tipo_usuario)
          }
        }
        
        if (filters.secretaria_id) {
          query = query.eq('secretaria_id', filters.secretaria_id)
        }
        
        if (filters.setor_id) {
          query = query.eq('setor_id', filters.setor_id)
        }
        
        if (filters.ativo !== undefined) {
          query = query.eq('ativo', filters.ativo)
        }
        
        if (filters.data_criacao_start) {
          query = query.gte('created_at', filters.data_criacao_start)
        }
        
        if (filters.data_criacao_end) {
          query = query.lte('created_at', filters.data_criacao_end)
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
        message: 'Usuários carregados com sucesso',
        meta: {
          total_count: count || 0,
          filtered_count: data?.length || 0
        }
      }
    } catch (err: Error | unknown) {
      setError(err.message)
      return {
        data: [],
        pagination: {
          current_page: 1,
          total_pages: 0,
          total_items: 0,
          items_per_page: CRUD_CONSTANTS.DEFAULT_PAGE_SIZE,
          has_next: false,
          has_previous: false
        },
        success: false,
        message: `Erro ao carregar usuários: ${err.message}`
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const searchUsuarios = useCallback(async (
    query: string,
    filters?: UsuarioFilters
  ): Promise<PaginatedResponse<UsuarioPadrao>> => {
    return getUsuarioList({
      filters: {
        ...filters,
        search: query
      }
    })
  }, [getUsuarioList])

  // =====================================================
  // OPERAÇÕES CREATE
  // =====================================================

  const createUsuario = useCallback(async (
    data: CreateUsuarioInput
  ): Promise<EntityResponse<UsuarioPadrao>> => {
    try {
      setLoading(true)
      setError(null)

      // Validação com Zod
      const validation = ValidationHelper.validateWithSchema(CreateUsuarioSchema, data)
      if (!validation.success) {
        return {
          data: null as any,
          success: false,
          message: `Erro de validação: ${validation.errors?.join(', ')}`
        }
      }

      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', data.email)
        .single()

      if (existingUser) {
        return {
          data: null as any,
          success: false,
          message: 'Email já está em uso por outro usuário'
        }
      }

      // Usar o serviço hierárquico para criar usuário
      const { HierarchicalUserService } = await import('../services/hierarchicalUserService')
      
      const result = await HierarchicalUserService.createUser({
        email: data.email,
        nome_completo: data.nome_completo,
        tipo_usuario: data.tipo_usuario,
        tenant_id: data.tenant_id,
        secretaria_id: data.secretaria_id,
        setor_id: data.setor_id,
        cpf: data.cpf,
        telefone: data.telefone,
        cargo: data.cargo,
        enviar_email: data.enviar_email
      })

      if (!result.success) {
        return {
          data: null as any,
          success: false,
          message: result.message
        }
      }

      // Buscar usuário criado com relacionamentos
      const { data: usuario } = await supabase
        .from('user_profiles')
        .select(`
          *,
          secretaria:secretarias(nome, sigla),
          setor:setores(nome)
        `)
        .eq('id', result.user_id)
        .single()

      return {
        data: usuario,
        success: true,
        message: 'Usuário criado com sucesso!',
        meta: {
          created_at: usuario?.created_at,
          senha_temporaria: result.senha_temporaria
        }
      }
    } catch (err: Error | unknown) {
      setError(err.message)
      toast.error(`Erro ao criar usuário: ${err.message}`)
      return {
        data: null as any,
        success: false,
        message: `Erro ao criar usuário: ${err.message}`
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkUsuarioCreate = useCallback(async (
    items: CreateUsuarioInput[]
  ): Promise<BulkResponse<UsuarioPadrao>> => {
    try {
      setLoading(true)
      setError(null)

      if (items.length > CRUD_CONSTANTS.MAX_BULK_OPERATIONS) {
        throw new Error(`Máximo de ${CRUD_CONSTANTS.MAX_BULK_OPERATIONS} usuários por operação bulk`)
      }

      const results: UsuarioPadrao[] = []
      const errors: unknown[] = []

      for (const item of items) {
        try {
          const result = await createUsuario(item)
          if (result.success && result.data) {
            results.push(result.data)
          } else {
            errors.push({
              item,
              error: result.message
            })
          }
        } catch (error) {
          errors.push({
            item,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          })
        }
      }

      const message = `Processados ${items.length} usuários. ${results.length} sucessos, ${errors.length} erros.`
      
      if (errors.length === 0) {
        toast.success(message)
      } else {
        toast.error(message)
      }

      return {
        success: results,
        errors,
        total_processed: items.length,
        success_count: results.length,
        error_count: errors.length,
        message
      }
    } catch (err: Error | unknown) {
      setError(err.message)
      return {
        success: [],
        errors: items.map(item => ({
          item,
          error: err.message
        })),
        total_processed: items.length,
        success_count: 0,
        error_count: items.length,
        message: `Erro ao criar usuários: ${err.message}`
      }
    } finally {
      setLoading(false)
    }
  }, [createUsuario])

  // =====================================================
  // OPERAÇÕES UPDATE
  // =====================================================

  const updateUsuario = useCallback(async (
    id: string,
    data: UpdateUsuarioInput
  ): Promise<EntityResponse<UsuarioPadrao>> => {
    try {
      setLoading(true)
      setError(null)

      // Validação com Zod
      const validation = ValidationHelper.validateWithSchema(UpdateUsuarioSchema, data)
      if (!validation.success) {
        return {
          data: null as any,
          success: false,
          message: `Erro de validação: ${validation.errors?.join(', ')}`
        }
      }

      const { data: usuario, error } = await supabase
        .from('user_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          secretaria:secretarias(nome, sigla),
          setor:setores(nome)
        `)
        .single()

      if (error) throw error

      toast.success('Usuário atualizado com sucesso!')

      return {
        data: usuario,
        success: true,
        message: 'Usuário atualizado com sucesso!',
        meta: {
          updated_at: usuario.updated_at
        }
      }
    } catch (err: Error | unknown) {
      setError(err.message)
      toast.error(`Erro ao atualizar usuário: ${err.message}`)
      return {
        data: null as any,
        success: false,
        message: `Erro ao atualizar usuário: ${err.message}`
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // =====================================================
  // OPERAÇÕES DELETE
  // =====================================================

  const deleteUsuario = useCallback(async (id: string): Promise<DeleteResponse> => {
    try {
      setLoading(true)
      setError(null)

      // Verificar se usuário pode ser deletado
      const { data: protocolos } = await supabase
        .from('protocolos_completos')
        .select('id')
        .or(`solicitante_id.eq.${id},responsavel_id.eq.${id}`)
        .limit(1)

      if (protocolos && protocolos.length > 0) {
        return {
          success: false,
          message: 'Não é possível deletar usuário que possui protocolos associados'
        }
      }

      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Usuário removido com sucesso!')

      return {
        success: true,
        message: 'Usuário removido com sucesso!',
        deleted_id: id
      }
    } catch (err: Error | unknown) {
      setError(err.message)
      toast.error(`Erro ao remover usuário: ${err.message}`)
      return {
        success: false,
        message: `Erro ao remover usuário: ${err.message}`
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const softUsuarioDelete = useCallback(async (
    id: string,
    reason?: string
  ): Promise<DeleteResponse> => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ativo: false,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Usuário desativado com sucesso!')

      return {
        success: true,
        message: 'Usuário desativado com sucesso!',
        deleted_id: id,
        soft_deleted: true
      }
    } catch (err: Error | unknown) {
      setError(err.message)
      toast.error(`Erro ao desativar usuário: ${err.message}`)
      return {
        success: false,
        message: `Erro ao desativar usuário: ${err.message}`
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // =====================================================
  // OPERAÇÕES ESPECIALIZADAS
  // =====================================================

  const ativarUsuario = useCallback(async (id: string): Promise<EntityResponse<UsuarioPadrao>> => {
    return updateUsuario(id, { ativo: true })
  }, [updateUsuario])

  const desativarUsuario = useCallback(async (id: string): Promise<EntityResponse<UsuarioPadrao>> => {
    return updateUsuario(id, { ativo: false })
  }, [updateUsuario])

  const alterarTipoUsuario = useCallback(async (
    id: string,
    novoTipo: 'super_admin' | 'admin' | 'secretario' | 'diretor' | 'coordenador' | 'funcionario' | 'atendente' | 'cidadao'
  ): Promise<EntityResponse<UsuarioPadrao>> => {
    return updateUsuario(id, { tipo_usuario: novoTipo })
  }, [updateUsuario])

  const transferirSecretaria = useCallback(async (
    id: string,
    novaSecretariaId: string,
    novoSetorId?: string
  ): Promise<EntityResponse<UsuarioPadrao>> => {
    return updateUsuario(id, { 
      secretaria_id: novaSecretariaId,
      setor_id: novoSetorId 
    })
  }, [updateUsuario])

  const getUsuariosBySecretaria = useCallback(async (
    secretariaId: string
  ): Promise<PaginatedResponse<UsuarioPadrao>> => {
    return getUsuarioList({
      filters: { secretaria_id: secretariaId }
    })
  }, [getUsuarioList])

  const getUsuariosByTipo = useCallback(async (
    tipoUsuario: string
  ): Promise<PaginatedResponse<UsuarioPadrao>> => {
    return getUsuarioList({
      filters: { tipo_usuario: tipoUsuario }
    })
  }, [getUsuarioList])

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    loading,
    error,
    
    // Operações READ - Nomenclatura Padronizada FASE 3
    getUsuarioById,
    getUsuarioList,
    searchUsuarios,
    
    // Operações CREATE - Nomenclatura Padronizada FASE 3
    createUsuario,
    bulkUsuarioCreate,
    
    // Operações UPDATE - Nomenclatura Padronizada FASE 3
    updateUsuario,
    
    // Operações DELETE - Nomenclatura Padronizada FASE 3
    deleteUsuario,
    softUsuarioDelete,
    
    // Operações Especializadas
    ativarUsuario,
    desativarUsuario,
    alterarTipoUsuario,
    transferirSecretaria,
    getUsuariosBySecretaria,
    getUsuariosByTipo,
    
    // Utility
    clearError: () => setError(null)
  }
}