// =====================================================
// HOOKS UNIFICADOS E PADRONIZADOS - FASE 3
// Implementação das especificações de padronização CRUD
// =====================================================

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { APIClient } from '@/auth/utils/httpInterceptor';
import { 
  FiltrosPadrao, 
  RespostaAPIPadrao, 
  BaseEntity,
  PaginacaoPadrao,
  ErroPadrao
} from "@/types/common";

// =====================================================
// INTERFACES PADRONIZADAS FASE 3
// =====================================================

// Interfaces para paginação padronizada
export interface PaginationParams {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginationInfo {
  current_page: number
  total_pages: number
  total_items: number
  items_per_page: number
  has_next: boolean
  has_previous: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
  success: boolean
  message?: string
}

// Interfaces para respostas padronizadas
export interface EntityResponse<T> {
  data: T
  success: boolean
  message?: string
  warnings?: string[]
}

export interface DeleteResponse {
  success: boolean
  message: string
  deleted_id?: string
}

export interface BulkResponse<T> {
  success: T[]
  errors: BulkError[]
  total_processed: number
  success_count: number
  error_count: number
  message: string
}

export interface BulkError {
  item: any
  error: string
  code?: string
}

// Interfaces para filtros e busca
export interface BaseFilters {
  search?: string
  status?: string
  created_at_start?: string
  created_at_end?: string
  updated_at_start?: string
  updated_at_end?: string
}

export interface SearchFilters extends BaseFilters {
  fields?: string[]
  exact_match?: boolean
}

// Interfaces para operações bulk
export interface BulkUpdate<T> {
  id: string
  data: Partial<T>
}

export interface BulkDeleteParams {
  ids: string[]
  soft_delete?: boolean
  reason?: string
}

// Parâmetros padrão para operações GET
export interface GetEntityListParams extends PaginationParams {
  filters?: BaseFilters
  include?: Record<string, boolean | string[]>
  search?: string
  distinct?: boolean
  count_only?: boolean
}

export interface GetEntityByIdParams {
  include?: Record<string, boolean | string[]>
  cache?: boolean
}

// Configurações de tratamento de erros
export const CRUD_ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

export type CrudErrorCode = typeof CRUD_ERROR_CODES[keyof typeof CRUD_ERROR_CODES]

export interface CrudError {
  code: CrudErrorCode
  message: string
  details?: any
  operation: 'create' | 'read' | 'update' | 'delete' | 'bulk_create' | 'bulk_update' | 'bulk_delete'
  entity: string
  timestamp: string
}

// Constantes padrão
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
export const MAX_BULK_OPERATIONS = 1000

// =====================================================
// INTERFACE PARA HOOKS PADRONIZADOS (LEGACY)
// =====================================================

export interface EstadoPadrao<T extends BaseEntity> {
  // Dados
  items: T[];
  itemAtual: T | null;
  
  // Estados de carregamento
  loading: boolean;
  loadingItem: boolean;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  loadingDelete: boolean;
  
  // Estados de erro
  error: string | null;
  errors: Record<string, string[]>;
  
  // Paginação
  pagination: PaginacaoPadrao | null;
  
  // Filtros
  filtros: FiltrosPadrao;
  
  // Meta informações
  totalRecords: number;
  lastUpdated: string | null;
}

export interface AcoesPadrao<T extends BaseEntity> {
  // Operações CRUD
  buscarTodos: (filtros?: FiltrosPadrao) => Promise<void>;
  buscarPorId: (id: string) => Promise<T | null>;
  criar: (dados: Omit<T, keyof BaseEntity>) => Promise<T | null>;
  atualizar: (id: string, dados: Partial<Omit<T, keyof BaseEntity>>) => Promise<T | null>;
  deletar: (id: string) => Promise<boolean>;
  deletarMultiplos: (ids: string[]) => Promise<boolean>;
  
  // Operações de busca
  buscarComPaginacao: (page: number, limit: number, filtros?: FiltrosPadrao) => Promise<void>;
  buscarTexto: (termo: string) => Promise<void>;
  
  // Operações de estado
  limparErrors: () => void;
  limparEstado: () => void;
  definirFiltros: (filtros: FiltrosPadrao) => void;
  definirItemAtual: (item: T | null) => void;
  
  // Operações de cache
  invalidarCache: () => Promise<void>;
  recarregar: () => Promise<void>;
  
  // Validações
  validarCriacao: (dados: Partial<T>) => Promise<{ valido: boolean; erros: Record<string, string[]> }>;
  validarAtualizacao: (id: string, dados: Partial<T>) => Promise<{ valido: boolean; erros: Record<string, string[]> }>;
}

// =====================================================
// HOOK BASE PADRONIZADO
// =====================================================

export interface ConfiguracaoHookPadrao<T extends BaseEntity> {
  nomeTabela: string;
  nomeEntidade: string;
  camposSelect?: string;
  relacionamentos?: string[];
  cacheKey?: string;
  validacoes?: {
    criar?: (dados: Partial<T>) => Promise<{ valido: boolean; erros: Record<string, string[]> }>;
    atualizar?: (id: string, dados: Partial<T>) => Promise<{ valido: boolean; erros: Record<string, string[]> }>;
    deletar?: (id: string) => Promise<{ valido: boolean; erros: Record<string, string[]> }>;
  };
  hooks?: {
    antesCriar?: (dados: Partial<T>) => Promise<Partial<T>>;
    aposCriar?: (item: T) => Promise<void>;
    antesAtualizar?: (id: string, dados: Partial<T>) => Promise<Partial<T>>;
    aposAtualizar?: (item: T) => Promise<void>;
    antesDeletar?: (id: string) => Promise<boolean>;
    aposDeletar?: (id: string) => Promise<void>;
  };
  configuracoes?: {
    carregarAutomaticamente?: boolean;
    mostrarToasts?: boolean;
    cacheTTL?: number;
    limitePadrao?: number;
  };
}

export const useHookPadrao = <T extends BaseEntity>(
  config: ConfiguracaoHookPadrao<T>
): [EstadoPadrao<T>, AcoesPadrao<T>] => {
  
  // =====================================================
  // ESTADO INICIAL
  // =====================================================
  
  const [estado, setEstado] = useState<EstadoPadrao<T>>({
    items: [],
    itemAtual: null,
    loading: false,
    loadingItem: false,
    loadingCreate: false,
    loadingUpdate: false,
    loadingDelete: false,
    error: null,
    errors: {},
    pagination: null,
    filtros: {},
    totalRecords: 0,
    lastUpdated: null,
  });

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  const mostrarToast = useCallback((tipo: 'success' | 'error', mensagem: string) => {
    if (config.configuracoes?.mostrarToasts !== false) {
      if (tipo === 'success') {
        toast.success(mensagem);
      } else {
        toast.error(mensagem);
      }
    }
  }, [config.configuracoes?.mostrarToasts]);

  const tratarErro = useCallback((erro: any, operacao: string) => {
    console.error(`Erro na operação ${operacao}:`, erro);
    const mensagemErro = erro?.message || `Erro na operação: ${operacao}`;
    setEstado(prev => ({ ...prev, error: mensagemErro }));
    mostrarToast('error', mensagemErro);
    return mensagemErro;
  }, [mostrarToast]);

  const criarQueryBase = useCallback(() => {
    const campos = config.camposSelect || '*';
    let query = APIClient.get("config.nomeTabela).select(campos);
    
    // Filtrar apenas registros não deletados
    query = query.is('deleted_at', null);
    
    return query;
  }, [config.nomeTabela, config.camposSelect]);

  const aplicarFiltros = useCallback((query: any, filtros: FiltrosPadrao) => {
    if (filtros.busca_texto) {
      // Implementar busca em texto - assumindo que há um campo 'nome' ou similar
      query = query.ilike('nome', `%${filtros.busca_texto}%`);
    }

    if (filtros.data_inicio) {
      query = query.gte('created_at', filtros.data_inicio);
    }

    if (filtros.data_fim) {
      query = query.lte('created_at', filtros.data_fim);
    }

    if (filtros.status) {
      if (Array.isArray(filtros.status)) {
        query = query.in('status', filtros.status);
      } else {
        query = query.eq('status', filtros.status);
      }
    }

    if (filtros.responsavel_id) {
      query = query.eq('responsavel_id', filtros.responsavel_id);
    }

    if (filtros.secretaria_id) {
      query = query.eq('secretaria_id', filtros.secretaria_id);
    }

    if (filtros.ativo !== undefined) {
      query = query.eq('ativo', filtros.ativo);
    }

    // Ordenação
    const orderBy = filtros.order_by || 'created_at';
    const orderDirection = filtros.order_direction || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    return query;
  }, []);

  // =====================================================
  // OPERAÇÕES CRUD
  // =====================================================

  const buscarTodos = useCallback(async (filtros: FiltrosPadrao = {}) => {
    try {
      setEstado(prev => ({ ...prev, loading: true, error: null }));

      let query = criarQueryBase();
      query = aplicarFiltros(query, filtros);

      const { data, error } = await query;

      if (error) throw error;

      setEstado(prev => ({
        ...prev,
        items: data || [],
        totalRecords: data?.length || 0,
        lastUpdated: new Date().toISOString(),
        filtros,
      }));

    } catch (erro) {
      tratarErro(erro, 'buscar todos');
    } finally {
      setEstado(prev => ({ ...prev, loading: false }));
    }
  }, [criarQueryBase, aplicarFiltros, tratarErro]);

  const buscarPorId = useCallback(async (id: string): Promise<T | null> => {
    try {
      setEstado(prev => ({ ...prev, loadingItem: true, error: null }));

      const { data, error } = await criarQueryBase().eq('id', id).single();

      if (error) throw error;

      setEstado(prev => ({ ...prev, itemAtual: data }));
      return data;

    } catch (erro) {
      tratarErro(erro, 'buscar por ID');
      return null;
    } finally {
      setEstado(prev => ({ ...prev, loadingItem: false }));
    }
  }, [criarQueryBase, tratarErro]);

  const criar = useCallback(async (dados: Omit<T, keyof BaseEntity>): Promise<T | null> => {
    try {
      setEstado(prev => ({ ...prev, loadingCreate: true, error: null, errors: {} }));

      // Validação
      if (config.validacoes?.criar) {
        const { valido, erros } = await config.validacoes.criar(dados);
        if (!valido) {
          setEstado(prev => ({ ...prev, errors: erros }));
          mostrarToast('error', 'Dados inválidos. Verifique os campos.');
          return null;
        }
      }

      // Hook antes de criar
      let dadosFinais = dados;
      if (config.hooks?.antesCriar) {
        dadosFinais = await config.hooks.antesCriar(dados);
      }

      const { data, error } = await supabase
        .from(config.nomeTabela)
        .insert([dadosFinais])
        .select()
        .single();

      if (error) throw error;

      // Hook após criar
      if (config.hooks?.aposCriar) {
        await config.hooks.aposCriar(data);
      }

      setEstado(prev => ({
        ...prev,
        items: [data, ...prev.items],
        totalRecords: prev.totalRecords + 1,
        lastUpdated: new Date().toISOString(),
      }));

      mostrarToast('success', `${config.nomeEntidade} criado com sucesso!`);
      return data;

    } catch (erro) {
      tratarErro(erro, 'criar');
      return null;
    } finally {
      setEstado(prev => ({ ...prev, loadingCreate: false }));
    }
  }, [config, mostrarToast, tratarErro]);

  const atualizar = useCallback(async (id: string, dados: Partial<Omit<T, keyof BaseEntity>>): Promise<T | null> => {
    try {
      setEstado(prev => ({ ...prev, loadingUpdate: true, error: null, errors: {} }));

      // Validação
      if (config.validacoes?.atualizar) {
        const { valido, erros } = await config.validacoes.atualizar(id, dados);
        if (!valido) {
          setEstado(prev => ({ ...prev, errors: erros }));
          mostrarToast('error', 'Dados inválidos. Verifique os campos.');
          return null;
        }
      }

      // Hook antes de atualizar
      let dadosFinais = dados;
      if (config.hooks?.antesAtualizar) {
        dadosFinais = await config.hooks.antesAtualizar(id, dados);
      }

      const { data, error } = await supabase
        .from(config.nomeTabela)
        .update({
          ...dadosFinais,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Hook após atualizar
      if (config.hooks?.aposAtualizar) {
        await config.hooks.aposAtualizar(data);
      }

      setEstado(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === id ? data : item),
        itemAtual: prev.itemAtual?.id === id ? data : prev.itemAtual,
        lastUpdated: new Date().toISOString(),
      }));

      mostrarToast('success', `${config.nomeEntidade} atualizado com sucesso!`);
      return data;

    } catch (erro) {
      tratarErro(erro, 'atualizar');
      return null;
    } finally {
      setEstado(prev => ({ ...prev, loadingUpdate: false }));
    }
  }, [config, mostrarToast, tratarErro]);

  const deletar = useCallback(async (id: string): Promise<boolean> => {
    try {
      setEstado(prev => ({ ...prev, loadingDelete: true, error: null }));

      // Validação
      if (config.validacoes?.deletar) {
        const { valido, erros } = await config.validacoes.deletar(id);
        if (!valido) {
          setEstado(prev => ({ ...prev, errors: erros }));
          mostrarToast('error', 'Não é possível deletar este registro.');
          return false;
        }
      }

      // Hook antes de deletar
      if (config.hooks?.antesDeletar) {
        const podeDeeletar = await config.hooks.antesDeletar(id);
        if (!podeDeeletar) {
          mostrarToast('error', 'Operação cancelada.');
          return false;
        }
      }

      // Soft delete
      const { error } = await supabase
        .from(config.nomeTabela)
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Hook após deletar
      if (config.hooks?.aposDeletar) {
        await config.hooks.aposDeletar(id);
      }

      setEstado(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id),
        itemAtual: prev.itemAtual?.id === id ? null : prev.itemAtual,
        totalRecords: prev.totalRecords - 1,
        lastUpdated: new Date().toISOString(),
      }));

      mostrarToast('success', `${config.nomeEntidade} deletado com sucesso!`);
      return true;

    } catch (erro) {
      tratarErro(erro, 'deletar');
      return false;
    } finally {
      setEstado(prev => ({ ...prev, loadingDelete: false }));
    }
  }, [config, mostrarToast, tratarErro]);

  const deletarMultiplos = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      setEstado(prev => ({ ...prev, loadingDelete: true, error: null }));

      const { error } = await supabase
        .from(config.nomeTabela)
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (error) throw error;

      setEstado(prev => ({
        ...prev,
        items: prev.items.filter(item => !ids.includes(item.id)),
        totalRecords: prev.totalRecords - ids.length,
        lastUpdated: new Date().toISOString(),
      }));

      mostrarToast('success', `${ids.length} registros deletados com sucesso!`);
      return true;

    } catch (erro) {
      tratarErro(erro, 'deletar múltiplos');
      return false;
    } finally {
      setEstado(prev => ({ ...prev, loadingDelete: false }));
    }
  }, [config.nomeTabela, mostrarToast, tratarErro]);

  // =====================================================
  // OPERAÇÕES DE BUSCA
  // =====================================================

  const buscarComPaginacao = useCallback(async (page: number, limit: number, filtros: FiltrosPadrao = {}) => {
    try {
      setEstado(prev => ({ ...prev, loading: true, error: null }));

      let query = criarQueryBase();
      query = aplicarFiltros(query, filtros);

      // Contar total de registros
      const { count, error: countError } = await supabase
        .from(config.nomeTabela)
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      if (countError) throw countError;

      // Buscar registros com paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);
      
      const pagination: PaginacaoPadrao = {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
      };

      setEstado(prev => ({
        ...prev,
        items: data || [],
        pagination,
        totalRecords: count || 0,
        lastUpdated: new Date().toISOString(),
        filtros: { ...filtros, page, limit },
      }));

    } catch (erro) {
      tratarErro(erro, 'buscar com paginação');
    } finally {
      setEstado(prev => ({ ...prev, loading: false }));
    }
  }, [criarQueryBase, aplicarFiltros, config.nomeTabela, tratarErro]);

  const buscarTexto = useCallback(async (termo: string) => {
    const filtros = { ...estado.filtros, busca_texto: termo };
    await buscarTodos(filtros);
  }, [estado.filtros, buscarTodos]);

  // =====================================================
  // OPERAÇÕES DE ESTADO
  // =====================================================

  const limparErrors = useCallback(() => {
    setEstado(prev => ({ ...prev, error: null, errors: {} }));
  }, []);

  const limparEstado = useCallback(() => {
    setEstado({
      items: [],
      itemAtual: null,
      loading: false,
      loadingItem: false,
      loadingCreate: false,
      loadingUpdate: false,
      loadingDelete: false,
      error: null,
      errors: {},
      pagination: null,
      filtros: {},
      totalRecords: 0,
      lastUpdated: null,
    });
  }, []);

  const definirFiltros = useCallback((filtros: FiltrosPadrao) => {
    setEstado(prev => ({ ...prev, filtros }));
  }, []);

  const definirItemAtual = useCallback((item: T | null) => {
    setEstado(prev => ({ ...prev, itemAtual: item }));
  }, []);

  // =====================================================
  // OPERAÇÕES DE CACHE
  // =====================================================

  const invalidarCache = useCallback(async () => {
    // Implementar invalidação de cache se necessário
    setEstado(prev => ({ ...prev, lastUpdated: null }));
  }, []);

  const recarregar = useCallback(async () => {
    await invalidarCache();
    await buscarTodos(estado.filtros);
  }, [invalidarCache, buscarTodos, estado.filtros]);

  // =====================================================
  // VALIDAÇÕES
  // =====================================================

  const validarCriacao = useCallback(async (dados: Partial<T>) => {
    if (config.validacoes?.criar) {
      return await config.validacoes.criar(dados);
    }
    return { valido: true, erros: {} };
  }, [config.validacoes]);

  const validarAtualizacao = useCallback(async (id: string, dados: Partial<T>) => {
    if (config.validacoes?.atualizar) {
      return await config.validacoes.atualizar(id, dados);
    }
    return { valido: true, erros: {} };
  }, [config.validacoes]);

  // =====================================================
  // CARREGAMENTO INICIAL
  // =====================================================

  useEffect(() => {
    if (config.configuracoes?.carregarAutomaticamente !== false) {
      buscarTodos();
    }
  }, [buscarTodos, config.configuracoes?.carregarAutomaticamente]);

  // =====================================================
  // RETORNO
  // =====================================================

  const acoes: AcoesPadrao<T> = {
    buscarTodos,
    buscarPorId,
    criar,
    atualizar,
    deletar,
    deletarMultiplos,
    buscarComPaginacao,
    buscarTexto,
    limparErrors,
    limparEstado,
    definirFiltros,
    definirItemAtual,
    invalidarCache,
    recarregar,
    validarCriacao,
    validarAtualizacao,
  };

  return [estado, acoes];
};

// =====================================================
// HOOKS ESPECÍFICOS PRÉ-CONFIGURADOS
// =====================================================

// Hook para módulo de Saúde
export const useSaudeUnificado = () => {
  return useHookPadrao({
    nomeTabela: 'unidades_saude',
    nomeEntidade: 'Unidade de Saúde',
    camposSelect: '*',
    configuracoes: {
      carregarAutomaticamente: true,
      mostrarToasts: true,
      limitePadrao: 20,
    }
  });
};

// Hook para módulo de Educação
export const useEducacaoUnificado = () => {
  return useHookPadrao({
    nomeTabela: 'escolas',
    nomeEntidade: 'Escola',
    camposSelect: '*',
    configuracoes: {
      carregarAutomaticamente: true,
      mostrarToasts: true,
      limitePadrao: 20,
    }
  });
};

// Hook para módulo de Assistência Social
export const useAssistenciaSocialUnificado = () => {
  return useHookPadrao({
    nomeTabela: 'familias',
    nomeEntidade: 'Família',
    camposSelect: '*',
    configuracoes: {
      carregarAutomaticamente: true,
      mostrarToasts: true,
      limitePadrao: 20,
    }
  });
};

// =====================================================
// NOVO HOOK UNIFICADO FASE 3
// Implementação completa dos padrões CRUD
// =====================================================

export interface UnifiedCrudHookConfig<T> {
  entityName: string
  tableName: string
  validationSchema?: z.ZodSchema<any>
  relations?: string[]
  searchFields?: string[]
  defaultSort?: {
    field: string
    order: 'asc' | 'desc'
  }
  pageSize?: number
  enableSoftDelete?: boolean
  enableAudit?: boolean
}

export interface UnifiedCrudHookState<T> {
  items: T[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalItems: number
}

export interface UnifiedCrudHookActions<T, CreateInput, UpdateInput> {
  // READ Operations - Nomenclatura Padrão Fase 3
  getEntityById: (id: string, params?: GetEntityByIdParams) => Promise<T | null>
  getEntityList: (params?: GetEntityListParams) => Promise<PaginatedResponse<T>>
  searchEntity: (query: string, filters?: SearchFilters) => Promise<PaginatedResponse<T>>
  
  // CREATE Operations - Nomenclatura Padrão Fase 3
  createEntity: (data: CreateInput) => Promise<EntityResponse<T>>
  bulkEntityCreate: (items: CreateInput[]) => Promise<BulkResponse<T>>
  
  // UPDATE Operations - Nomenclatura Padrão Fase 3
  updateEntity: (id: string, data: UpdateInput) => Promise<EntityResponse<T>>
  bulkEntityUpdate: (updates: BulkUpdate<T>[]) => Promise<BulkResponse<T>>
  
  // DELETE Operations - Nomenclatura Padrão Fase 3
  deleteEntity: (id: string) => Promise<DeleteResponse>
  softEntityDelete: (id: string) => Promise<DeleteResponse>
  bulkEntityDelete: (params: BulkDeleteParams) => Promise<BulkResponse<void>>
  
  // Utility Operations
  refreshEntity: () => Promise<void>
  clearError: () => void
  resetState: () => void
}

// =====================================================
// IMPLEMENTAÇÃO DO HOOK UNIFICADO FASE 3
// =====================================================

export function useUnifiedCrud<T, CreateInput = Partial<T>, UpdateInput = Partial<T>>(
  config: UnifiedCrudHookConfig<T>
): UnifiedCrudHookState<T> & UnifiedCrudHookActions<T, CreateInput, UpdateInput> {
  
  const [state, setState] = useState<UnifiedCrudHookState<T>>({
    items: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 0,
    totalItems: 0
  })

  // =====================================================
  // UTILITIES
  // =====================================================

  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Erro na operação ${operation}:`, error)
    
    let message = 'Erro inesperado'
    if (error?.message) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    
    setState(prev => ({ ...prev, error: message, loading: false }))
    toast.error(`Erro ao ${operation}: ${message}`)
    
    return null
  }, [])

  const buildQuery = useCallback((params?: GetEntityListParams) => {
    let query = supabase
      .from(config.tableName)
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (params?.filters) {
      const { filters } = params
      
      if (filters.search && config.searchFields) {
        const searchConditions = config.searchFields.map(field => 
          `${field}.ilike.%${filters.search}%`
        ).join(',')
        query = query.or(searchConditions)
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.created_at_start) {
        query = query.gte('created_at', filters.created_at_start)
      }
      
      if (filters.created_at_end) {
        query = query.lte('created_at', filters.created_at_end)
      }
    }

    // Aplicar ordenação
    const sortField = params?.sort_by || config.defaultSort?.field || 'created_at'
    const sortOrder = params?.sort_order || config.defaultSort?.order || 'desc'
    query = query.order(sortField, { ascending: sortOrder === 'asc' })

    // Aplicar paginação
    if (params?.page && params?.limit) {
      const offset = (params.page - 1) * params.limit
      query = query.range(offset, offset + params.limit - 1)
    }

    return query
  }, [config])

  // =====================================================
  // READ OPERATIONS
  // =====================================================

  const getEntityById = useCallback(async (
    id: string, 
    params?: GetEntityByIdParams
  ): Promise<T | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      let query = supabase
        .from(config.tableName)
        .select('*')
        .eq('id', id)
        .single()

      const { data, error } = await query

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Não encontrado
        }
        throw error
      }

      setState(prev => ({ ...prev, loading: false }))
      return data
    } catch (error) {
      return handleError(error, `buscar ${config.entityName}`)
    }
  }, [config, handleError])

  const getEntityList = useCallback(async (
    params?: GetEntityListParams
  ): Promise<PaginatedResponse<T>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const query = buildQuery(params)
      const { data, error, count } = await query

      if (error) throw error

      const pageSize = params?.limit || config.pageSize || DEFAULT_PAGE_SIZE
      const currentPage = params?.page || 1
      const totalPages = Math.ceil((count || 0) / pageSize)

      const paginatedResponse: PaginatedResponse<T> = {
        data: data || [],
        pagination: {
          current_page: currentPage,
          total_pages: totalPages,
          total_items: count || 0,
          items_per_page: pageSize,
          has_next: currentPage < totalPages,
          has_previous: currentPage > 1
        },
        success: true
      }

      setState(prev => ({
        ...prev,
        items: data || [],
        loading: false,
        currentPage,
        totalPages,
        totalItems: count || 0
      }))

      return paginatedResponse
    } catch (error) {
      handleError(error, `carregar lista de ${config.entityName}`)
      return {
        data: [],
        pagination: {
          current_page: 1,
          total_pages: 0,
          total_items: 0,
          items_per_page: config.pageSize || DEFAULT_PAGE_SIZE,
          has_next: false,
          has_previous: false
        },
        success: false
      }
    }
  }, [config, buildQuery, handleError])

  const searchEntity = useCallback(async (
    query: string,
    filters?: SearchFilters
  ): Promise<PaginatedResponse<T>> => {
    const searchParams: GetEntityListParams = {
      filters: {
        search: query,
        ...filters
      },
      page: filters?.page || 1,
      limit: filters?.limit || config.pageSize || DEFAULT_PAGE_SIZE
    }

    return getEntityList(searchParams)
  }, [getEntityList, config])

  // =====================================================
  // CREATE OPERATIONS
  // =====================================================

  const createEntity = useCallback(async (
    data: CreateInput
  ): Promise<EntityResponse<T>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Validação Zod se configurada
      if (config.validationSchema) {
        const validation = config.validationSchema.safeParse(data)
        if (!validation.success) {
          throw new Error(`Erro de validação: ${validation.error.message}`)
        }
      }

      const { data: result, error } = await supabase
        .from(config.tableName)
        .insert([data])
        .select()
        .single()

      if (error) throw error

      setState(prev => ({ 
        ...prev, 
        loading: false,
        items: [result, ...prev.items]
      }))

      toast.success(`${config.entityName} criado com sucesso!`)

      return {
        data: result,
        success: true,
        message: `${config.entityName} criado com sucesso!`
      }
    } catch (error) {
      handleError(error, `criar ${config.entityName}`)
      return {
        data: null as any,
        success: false,
        message: `Erro ao criar ${config.entityName}`
      }
    }
  }, [config, handleError])

  const bulkEntityCreate = useCallback(async (
    items: CreateInput[]
  ): Promise<BulkResponse<T>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      if (items.length > MAX_BULK_OPERATIONS) {
        throw new Error(`Máximo de ${MAX_BULK_OPERATIONS} itens por operação bulk`)
      }

      const results: T[] = []
      const errors: BulkError[] = []

      // Processar em lotes
      for (let i = 0; i < items.length; i += 100) {
        const batch = items.slice(i, i + 100)
        
        try {
          const { data, error } = await supabase
            .from(config.tableName)
            .insert(batch)
            .select()

          if (error) throw error
          results.push(...(data || []))
        } catch (error) {
          batch.forEach(item => {
            errors.push({
              item,
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            })
          })
        }
      }

      setState(prev => ({ 
        ...prev, 
        loading: false,
        items: [...results, ...prev.items]
      }))

      const message = `Processados ${items.length} itens. ${results.length} sucessos, ${errors.length} erros.`
      
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
    } catch (error) {
      handleError(error, `criar múltiplos ${config.entityName}`)
      return {
        success: [],
        errors: items.map(item => ({
          item,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })),
        total_processed: items.length,
        success_count: 0,
        error_count: items.length,
        message: `Erro ao criar múltiplos ${config.entityName}`
      }
    }
  }, [config, handleError])

  // =====================================================
  // UPDATE OPERATIONS
  // =====================================================

  const updateEntity = useCallback(async (
    id: string,
    data: UpdateInput
  ): Promise<EntityResponse<T>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { data: result, error } = await supabase
        .from(config.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        loading: false,
        items: prev.items.map(item => 
          (item as any).id === id ? result : item
        )
      }))

      toast.success(`${config.entityName} atualizado com sucesso!`)

      return {
        data: result,
        success: true,
        message: `${config.entityName} atualizado com sucesso!`
      }
    } catch (error) {
      handleError(error, `atualizar ${config.entityName}`)
      return {
        data: null as any,
        success: false,
        message: `Erro ao atualizar ${config.entityName}`
      }
    }
  }, [config, handleError])

  const bulkEntityUpdate = useCallback(async (
    updates: BulkUpdate<T>[]
  ): Promise<BulkResponse<T>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const results: T[] = []
      const errors: BulkError[] = []

      for (const update of updates) {
        try {
          const { data, error } = await supabase
            .from(config.tableName)
            .update(update.data)
            .eq('id', update.id)
            .select()
            .single()

          if (error) throw error
          results.push(data)
        } catch (error) {
          errors.push({
            item: update,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          })
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        items: prev.items.map(item => {
          const updatedItem = results.find(r => (r as any).id === (item as any).id)
          return updatedItem || item
        })
      }))

      const message = `Atualizados ${results.length} de ${updates.length} itens.`
      
      if (errors.length === 0) {
        toast.success(message)
      } else {
        toast.error(message)
      }

      return {
        success: results,
        errors,
        total_processed: updates.length,
        success_count: results.length,
        error_count: errors.length,
        message
      }
    } catch (error) {
      handleError(error, `atualizar múltiplos ${config.entityName}`)
      return {
        success: [],
        errors: updates.map(update => ({
          item: update,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })),
        total_processed: updates.length,
        success_count: 0,
        error_count: updates.length,
        message: `Erro ao atualizar múltiplos ${config.entityName}`
      }
    }
  }, [config, handleError])

  // =====================================================
  // DELETE OPERATIONS
  // =====================================================

  const deleteEntity = useCallback(async (id: string): Promise<DeleteResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { error } = await supabase
        .from(config.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        loading: false,
        items: prev.items.filter(item => (item as any).id !== id)
      }))

      toast.success(`${config.entityName} removido com sucesso!`)

      return {
        success: true,
        message: `${config.entityName} removido com sucesso!`,
        deleted_id: id
      }
    } catch (error) {
      handleError(error, `remover ${config.entityName}`)
      return {
        success: false,
        message: `Erro ao remover ${config.entityName}`
      }
    }
  }, [config, handleError])

  const softEntityDelete = useCallback(async (id: string): Promise<DeleteResponse> => {
    if (!config.enableSoftDelete) {
      return deleteEntity(id)
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { error } = await supabase
        .from(config.tableName)
        .update({ 
          deleted_at: new Date().toISOString(),
          active: false 
        })
        .eq('id', id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        loading: false,
        items: prev.items.filter(item => (item as any).id !== id)
      }))

      toast.success(`${config.entityName} desativado com sucesso!`)

      return {
        success: true,
        message: `${config.entityName} desativado com sucesso!`,
        deleted_id: id
      }
    } catch (error) {
      handleError(error, `desativar ${config.entityName}`)
      return {
        success: false,
        message: `Erro ao desativar ${config.entityName}`
      }
    }
  }, [config, deleteEntity, handleError])

  const bulkEntityDelete = useCallback(async (
    params: BulkDeleteParams
  ): Promise<BulkResponse<void>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { ids, soft_delete = config.enableSoftDelete } = params
      let successCount = 0
      const errors: BulkError[] = []

      if (soft_delete) {
        const { error } = await supabase
          .from(config.tableName)
          .update({ 
            deleted_at: new Date().toISOString(),
            active: false 
          })
          .in('id', ids)

        if (error) throw error
        successCount = ids.length
      } else {
        const { error } = await supabase
          .from(config.tableName)
          .delete()
          .in('id', ids)

        if (error) throw error
        successCount = ids.length
      }

      setState(prev => ({
        ...prev,
        loading: false,
        items: prev.items.filter(item => !ids.includes((item as any).id))
      }))

      const message = `${successCount} ${config.entityName}(s) removido(s) com sucesso!`
      toast.success(message)

      return {
        success: [],
        errors,
        total_processed: ids.length,
        success_count: successCount,
        error_count: 0,
        message
      }
    } catch (error) {
      handleError(error, `remover múltiplos ${config.entityName}`)
      return {
        success: [],
        errors: params.ids.map(id => ({
          item: { id },
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })),
        total_processed: params.ids.length,
        success_count: 0,
        error_count: params.ids.length,
        message: `Erro ao remover múltiplos ${config.entityName}`
      }
    }
  }, [config, handleError])

  // =====================================================
  // UTILITY OPERATIONS
  // =====================================================

  const refreshEntity = useCallback(async () => {
    await getEntityList({
      page: state.currentPage,
      limit: config.pageSize || DEFAULT_PAGE_SIZE
    })
  }, [getEntityList, state.currentPage, config.pageSize])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const resetState = useCallback(() => {
    setState({
      items: [],
      loading: false,
      error: null,
      currentPage: 1,
      totalPages: 0,
      totalItems: 0
    })
  }, [])

  return {
    // State
    ...state,
    
    // Actions
    getEntityById,
    getEntityList,
    searchEntity,
    createEntity,
    bulkEntityCreate,
    updateEntity,
    bulkEntityUpdate,
    deleteEntity,
    softEntityDelete,
    bulkEntityDelete,
    refreshEntity,
    clearError,
    resetState
  }
}