// =====================================================
// PADRÕES UNIFICADOS PARA OPERAÇÕES CRUD - FASE 3
// Implementação completa dos padrões de nomenclatura e operações
// =====================================================

import { z } from 'zod'
import { BaseEntity, FiltrosPadrao, PaginacaoPadrao, RespostaAPIPadrao, ErroPadrao } from './common';

// =====================================================
// NOMENCLATURA PADRONIZADA FASE 3
// =====================================================

// Padrões para operações CREATE
export type CreateOperationNames = 
  | 'createProtocolo' | 'createUsuario' | 'createSecretaria' | 'createTenant'
  | 'createServico' | 'createCategoria' | 'createSetor' | 'createNotificacao'
  | 'createAnexo' | 'createRelatorio' | 'createConfiguracao'

// Padrões para operações CREATE BULK
export type BulkCreateOperationNames = 
  | 'bulkProtocoloCreate' | 'bulkUsuarioCreate' | 'bulkServicoCreate'
  | 'bulkCategoriaCreate' | 'bulkSetorCreate' | 'bulkNotificacaoCreate'

// Padrões para operações READ
export type ReadOperationNames = 
  | 'getProtocoloById' | 'getUsuarioById' | 'getSecretariaById' | 'getTenantById'
  | 'getServicoById' | 'getCategoriaById' | 'getSetorById' | 'getNotificacaoById'

// Padrões para operações READ LIST
export type ReadListOperationNames = 
  | 'getProtocoloList' | 'getUsuarioList' | 'getSecretariaList' | 'getTenantList'
  | 'getServicoList' | 'getCategoriaList' | 'getSetorList' | 'getNotificacaoList'

// Padrões para operações SEARCH
export type SearchOperationNames = 
  | 'searchProtocolos' | 'searchUsuarios' | 'searchSecretarias' | 'searchTenants'
  | 'searchServicos' | 'searchCategorias' | 'searchSetores' | 'searchNotificacoes'

// Padrões para operações UPDATE
export type UpdateOperationNames = 
  | 'updateProtocolo' | 'updateUsuario' | 'updateSecretaria' | 'updateTenant'
  | 'updateServico' | 'updateCategoria' | 'updateSetor' | 'updateNotificacao'

// Padrões para operações UPDATE BULK
export type BulkUpdateOperationNames = 
  | 'bulkProtocoloUpdate' | 'bulkUsuarioUpdate' | 'bulkServicoUpdate'
  | 'bulkCategoriaUpdate' | 'bulkSetorUpdate' | 'bulkNotificacaoUpdate'

// Padrões para operações DELETE
export type DeleteOperationNames = 
  | 'deleteProtocolo' | 'deleteUsuario' | 'deleteSecretaria' | 'deleteTenant'
  | 'deleteServico' | 'deleteCategoria' | 'deleteSetor' | 'deleteNotificacao'

// Padrões para operações SOFT DELETE
export type SoftDeleteOperationNames = 
  | 'softProtocoloDelete' | 'softUsuarioDelete' | 'softSecretariaDelete'
  | 'softServicoDelete' | 'softCategoriaDelete' | 'softSetorDelete'

// =====================================================
// INTERFACES PARA PARÂMETROS PADRONIZADOS FASE 3
// =====================================================

export interface CreateEntityInput<T> {
  data: Omit<T, keyof BaseEntity>
}

export interface UpdateEntityInput<T> {
  id: string
  data: Partial<Omit<T, keyof BaseEntity>>
}

export interface GetEntityListParams {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  filters?: Record<string, any>
  search?: string
  include?: string[]
}

export interface GetEntityByIdParams {
  include?: string[]
  cache?: boolean
}

export interface SearchEntityParams extends GetEntityListParams {
  query: string
  fields?: string[]
  exact_match?: boolean
}

export interface DeleteEntityParams {
  id: string
  soft_delete?: boolean
  reason?: string
}

export interface BulkCreateEntityParams<T> {
  items: Omit<T, keyof BaseEntity>[]
  validate?: boolean
  batch_size?: number
}

export interface BulkUpdateEntityParams<T> {
  updates: Array<{
    id: string
    data: Partial<Omit<T, keyof BaseEntity>>
  }>
  validate?: boolean
}

export interface BulkDeleteEntityParams {
  ids: string[]
  soft_delete?: boolean
  reason?: string
}

// =====================================================
// INTERFACES PARA RESPOSTAS PADRONIZADAS FASE 3
// =====================================================

export interface EntityResponse<T> {
  data: T
  success: boolean
  message?: string
  warnings?: string[]
  meta?: {
    createdAt?: string
    updatedAt?: string
    version?: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
  success: boolean
  message?: string
  meta?: {
    total_count: number
    filtered_count: number
    cache_hit?: boolean
  }
}

export interface PaginationInfo {
  current_page: number
  total_pages: number
  total_items: number
  items_per_page: number
  has_next: boolean
  has_previous: boolean
}

export interface DeleteResponse {
  success: boolean
  message: string
  deleted_id?: string
  soft_deleted?: boolean
}

export interface BulkResponse<T> {
  success: T[]
  errors: BulkError[]
  total_processed: number
  success_count: number
  error_count: number
  message: string
  processing_time_ms?: number
}

export interface BulkError {
  item: any
  error: string
  code?: string
  field?: string
}

// =====================================================
// CÓDIGOS DE ERRO PADRONIZADOS FASE 3
// =====================================================

export const CRUD_ERROR_CODES = {
  // Validation Errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Not Found Errors
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  PARENT_NOT_FOUND: 'PARENT_NOT_FOUND',
  
  // Permission Errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INSUFFICIENT_PRIVILEGES: 'INSUFFICIENT_PRIVILEGES',
  TENANT_ACCESS_DENIED: 'TENANT_ACCESS_DENIED',
  
  // Constraint Errors
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  FOREIGN_KEY_CONSTRAINT: 'FOREIGN_KEY_CONSTRAINT',
  UNIQUE_CONSTRAINT: 'UNIQUE_CONSTRAINT',
  CHECK_CONSTRAINT: 'CHECK_CONSTRAINT',
  
  // Database Errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Business Logic Errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  CONCURRENT_MODIFICATION: 'CONCURRENT_MODIFICATION',
  
  // System Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
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
  user_id?: string
  tenant_id?: string
}

// =====================================================
// CONSTANTES PADRÃO FASE 3
// =====================================================

export const CRUD_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_BULK_OPERATIONS: 1000,
  CACHE_TTL_SECONDS: 300, // 5 minutos
  MAX_SEARCH_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 2000,
  
  // Timeouts
  QUERY_TIMEOUT_MS: 30000,
  BULK_OPERATION_TIMEOUT_MS: 300000, // 5 minutos
  
  // Rate limits
  MAX_REQUESTS_PER_MINUTE: 100,
  MAX_BULK_REQUESTS_PER_HOUR: 10
} as const

// =====================================================
// SCHEMAS ZOD PARA VALIDAÇÃO FASE 3
// =====================================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(CRUD_CONSTANTS.MAX_PAGE_SIZE).default(CRUD_CONSTANTS.DEFAULT_PAGE_SIZE),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc')
})

export const BaseFiltersSchema = z.object({
  search: z.string().max(CRUD_CONSTANTS.MAX_SEARCH_LENGTH).optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  createdAtStart: z.string().datetime().optional(),
  createdAtEnd: z.string().datetime().optional(),
  updatedAtStart: z.string().datetime().optional(),
  updatedAtEnd: z.string().datetime().optional(),
  active: z.boolean().optional(),
  tenantId: z.string().uuid().optional()
})

export const SearchEntityParamsSchema = PaginationSchema.extend({
  query: z.string().min(1).max(CRUD_CONSTANTS.MAX_SEARCH_LENGTH),
  fields: z.array(z.string()).optional(),
  exact_match: z.boolean().default(false)
})

export const BulkDeleteEntityParamsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(CRUD_CONSTANTS.MAX_BULK_OPERATIONS),
  soft_delete: z.boolean().default(true),
  reason: z.string().max(CRUD_CONSTANTS.MAX_DESCRIPTION_LENGTH).optional()
})

// =====================================================
// INTERFACES PARA OPERAÇÕES CRUD PADRONIZADAS
// =====================================================

export interface OperacoesCRUDBase<T extends BaseEntity> {
  // READ
  buscarTodos(filtros?: FiltrosPadrao): Promise<RespostaAPIPadrao<T[]>>;
  buscarPorId(id: string): Promise<RespostaAPIPadrao<T>>;
  buscarComPaginacao(filtros: FiltrosPadrao & { page: number; limit: number }): Promise<RespostaAPIPadrao<T[]> & { meta: { pagination: PaginacaoPadrao } }>;
  
  // CREATE
  criar(dados: Omit<T, keyof BaseEntity>): Promise<RespostaAPIPadrao<T>>;
  criarMultiplos(dados: Omit<T, keyof BaseEntity>[]): Promise<RespostaAPIPadrao<T[]>>;
  
  // UPDATE
  atualizar(id: string, dados: Partial<Omit<T, keyof BaseEntity>>): Promise<RespostaAPIPadrao<T>>;
  atualizarMultiplos(updates: { id: string; dados: Partial<Omit<T, keyof BaseEntity>> }[]): Promise<RespostaAPIPadrao<T[]>>;
  
  // DELETE
  deletar(id: string): Promise<RespostaAPIPadrao<void>>;
  deletarMultiplos(ids: string[]): Promise<RespostaAPIPadrao<void>>;
  deletarSoft(id: string): Promise<RespostaAPIPadrao<T>>; // Soft delete
  restaurar(id: string): Promise<RespostaAPIPadrao<T>>; // Restaurar soft delete
}

// =====================================================
// INTERFACE PARA VALIDAÇÕES PADRONIZADAS
// =====================================================

export interface ValidacoesPadrao<T> {
  validarCriacao(dados: Partial<T>): Promise<{ valido: boolean; erros: ErroPadrao[] }>;
  validarAtualizacao(id: string, dados: Partial<T>): Promise<{ valido: boolean; erros: ErroPadrao[] }>;
  validarDelecao(id: string): Promise<{ valido: boolean; erros: ErroPadrao[] }>;
  validarPermissao(operacao: 'create' | 'read' | 'update' | 'delete', resourceId?: string): Promise<boolean>;
}

// =====================================================
// INTERFACE PARA AUDITORIA PADRONIZADA
// =====================================================

export interface AuditoriaPadrao {
  registrarOperacao(
    acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
    tabela: string,
    registroId: string,
    dadosAnteriores?: any,
    dadosNovos?: any,
    observacoes?: string
  ): Promise<void>;
  
  obterHistoricoEntidade(tabela: string, registroId: string): Promise<RespostaAPIPadrao<any[]>>;
  obterLogUsuario(usuarioId: string, dataInicio?: string, dataFim?: string): Promise<RespostaAPIPadrao<any[]>>;
}

// =====================================================
// INTERFACE PARA CACHE PADRONIZADO
// =====================================================

export interface CachePadrao<T> {
  obter(chave: string): Promise<T | null>;
  definir(chave: string, valor: T, ttl?: number): Promise<void>;
  invalidar(chave: string): Promise<void>;
  invalidarPadrao(padraoChave: string): Promise<void>;
  limparCache(): Promise<void>;
}

// =====================================================
// INTERFACE PARA NOTIFICAÇÕES PADRONIZADAS
// =====================================================

export interface NotificacoesPadrao {
  notificarCriacao(entidade: string, dadosEntidade: any, destinatarios: string[]): Promise<void>;
  notificarAtualizacao(entidade: string, dadosAnteriores: any, dadosNovos: any, destinatarios: string[]): Promise<void>;
  notificarDelecao(entidade: string, dadosEntidade: any, destinatarios: string[]): Promise<void>;
  notificarCustomizada(titulo: string, mensagem: string, tipo: string, destinatarios: string[]): Promise<void>;
}

// =====================================================
// INTERFACE PARA BUSCA AVANÇADA PADRONIZADA
// =====================================================

export interface BuscaAvancadaPadrao<T> {
  buscarTextoCompleto(termo: string, campos?: string[]): Promise<RespostaAPIPadrao<T[]>>;
  buscarComFiltrosComplexos(filtros: Record<string, any>): Promise<RespostaAPIPadrao<T[]>>;
  buscarComRelacionamentos(id: string, includes: string[]): Promise<RespostaAPIPadrao<T>>;
  buscarComAgregacoes(agregacoes: Record<string, 'count' | 'sum' | 'avg' | 'min' | 'max'>): Promise<RespostaAPIPadrao<Record<string, number>>>;
}

// =====================================================
// INTERFACE PARA EXPORTAÇÃO PADRONIZADA
// =====================================================

export interface ExportacaoPadrao<T> {
  exportarCSV(filtros?: FiltrosPadrao): Promise<RespostaAPIPadrao<string>>;
  exportarExcel(filtros?: FiltrosPadrao): Promise<RespostaAPIPadrao<Blob>>;
  exportarPDF(filtros?: FiltrosPadrao, template?: string): Promise<RespostaAPIPadrao<Blob>>;
  exportarJSON(filtros?: FiltrosPadrao): Promise<RespostaAPIPadrao<T[]>>;
}

// =====================================================
// INTERFACE PARA IMPORTAÇÃO PADRONIZADA
// =====================================================

export interface ImportacaoPadrao<T> {
  importarCSV(arquivo: File, mapeamento?: Record<string, string>): Promise<RespostaAPIPadrao<{ sucesso: T[]; erros: unknown[] }>>;
  importarExcel(arquivo: File, aba?: string, mapeamento?: Record<string, string>): Promise<RespostaAPIPadrao<{ sucesso: T[]; erros: unknown[] }>>;
  importarJSON(dados: unknown[]): Promise<RespostaAPIPadrao<{ sucesso: T[]; erros: unknown[] }>>;
  validarArquivoImportacao(arquivo: File): Promise<{ valido: boolean; erros: string[] }>;
}

// =====================================================
// INTERFACE PARA RELATÓRIOS PADRONIZADOS
// =====================================================

export interface RelatoriosPadrao<T> {
  gerarRelatorioBasico(filtros?: FiltrosPadrao): Promise<RespostaAPIPadrao<any>>;
  gerarRelatorioDetalhado(id: string): Promise<RespostaAPIPadrao<any>>;
  gerarEstatisticas(periodo?: { inicio: string; fim: string }): Promise<RespostaAPIPadrao<Record<string, number>>>;
  gerarGraficosDados(tipo: 'linha' | 'barra' | 'pizza' | 'area', campo: string, agrupamento?: string): Promise<RespostaAPIPadrao<any>>;
}

// =====================================================
// INTERFACE PARA CONFIGURAÇÕES PADRONIZADAS
// =====================================================

export interface ConfiguracoesPadrao {
  obterConfiguracao(chave: string): Promise<any>;
  definirConfiguracao(chave: string, valor: any): Promise<void>;
  obterTodasConfiguracoes(): Promise<Record<string, any>>;
  resetarConfiguracoes(): Promise<void>;
}

// =====================================================
// INTERFACE COMPLETA PARA SERVIÇOS PADRONIZADOS
// =====================================================

export interface ServicoPadrao<T extends BaseEntity> 
  extends OperacoesCRUDBase<T>,
          ValidacoesPadrao<T>,
          BuscaAvancadaPadrao<T>,
          ExportacaoPadrao<T>,
          ImportacaoPadrao<T>,
          RelatoriosPadrao<T> {
  
  // Propriedades do serviço
  readonly nomeEntidade: string;
  readonly nomeTabela: string;
  readonly camposObrigatorios: (keyof T)[];
  readonly camposEditaveis: (keyof T)[];
  readonly relacionamentos: string[];
  
  // Métodos de utilidade
  obterEstatisticasRapidas(): Promise<RespostaAPIPadrao<Record<string, number>>>;
  validarIntegridade(): Promise<{ valido: boolean; problemas: string[] }>;
  otimizarPerformance(): Promise<void>;
  
  // Hooks do ciclo de vida
  antesCriar?(dados: Partial<T>): Promise<Partial<T>>;
  aposCriar?(entidade: T): Promise<void>;
  antesAtualizar?(id: string, dados: Partial<T>): Promise<Partial<T>>;
  aposAtualizar?(entidadeAntiga: T, entidadeNova: T): Promise<void>;
  antesDeletar?(id: string): Promise<boolean>;
  aposDeletar?(entidade: T): Promise<void>;
}

// =====================================================
// TIPOS PARA CONFIGURAÇÃO DE HOOKS
// =====================================================

export interface HookConfiguracoes<T extends BaseEntity> {
  antesCriar?: (dados: Partial<T>) => Promise<Partial<T>>;
  aposCriar?: (entidade: T) => Promise<void>;
  antesAtualizar?: (id: string, dados: Partial<T>) => Promise<Partial<T>>;
  aposAtualizar?: (entidadeAntiga: T, entidadeNova: T) => Promise<void>;
  antesDeletar?: (id: string) => Promise<boolean>;
  aposDeletar?: (entidade: T) => Promise<void>;
  antesValidar?: (dados: Partial<T>) => Promise<Partial<T>>;
  aposValidar?: (dados: Partial<T>, erros: ErroPadrao[]) => Promise<ErroPadrao[]>;
}

// =====================================================
// TIPOS PARA MIDDLEWARE DE SERVIÇOS
// =====================================================

export interface MiddlewareServico<T extends BaseEntity> {
  nome: string;
  prioridade: number;
  aplicarAntes?: (operacao: string, dados: Record<string, unknown>) => Promise<any>;
  aplicarDepois?: (operacao: string, resultado: any) => Promise<any>;
  tratarErro?: (operacao: string, erro: Error) => Promise<Error>;
}

// =====================================================
// INTERFACE PARA FACTORY DE SERVIÇOS
// =====================================================

export interface ServicoFactory {
  criarServico<T extends BaseEntity>(
    configuracao: {
      nomeEntidade: string;
      nomeTabela: string;
      schema: any;
      hooks?: HookConfiguracoes<T>;
      middlewares?: MiddlewareServico<T>[];
      configuracoes?: Record<string, any>;
    }
  ): ServicoPadrao<T>;
  
  obterServico<T extends BaseEntity>(nomeEntidade: string): ServicoPadrao<T>;
  listarServicos(): string[];
  removerServico(nomeEntidade: string): void;
}

// =====================================================
// TIPOS PARA EVENTOS DO SISTEMA
// =====================================================

export interface EventoSistema {
  id: string;
  tipo: 'ENTIDADE_CRIADA' | 'ENTIDADE_ATUALIZADA' | 'ENTIDADE_DELETADA' | 'ERRO_OPERACAO' | 'CUSTOM';
  entidade: string;
  entidadeId?: string;
  dados?: any;
  usuario?: string;
  timestamp: string;
  contexto?: Record<string, any>;
}

export interface GerenciadorEventos {
  publicar(evento: Omit<EventoSistema, 'id' | 'timestamp'>): Promise<void>;
  subscrever(tipoEvento: string, callback: (evento: EventoSistema) => Promise<void>): () => void;
  obterHistoricoEventos(filtros?: { entidade?: string; tipo?: string; dataInicio?: string; dataFim?: string }): Promise<EventoSistema[]>;
}

// =====================================================
// PADRÕES DE RESPOSTA PARA HOOKS
// =====================================================

export interface RespostaHook<T = any> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  pular?: boolean; // Indica se deve pular a operação principal
  metadata?: Record<string, any>;
}

// =====================================================
// UTILITÁRIOS PARA IMPLEMENTAÇÃO
// =====================================================

export abstract class ServicoBase<T extends BaseEntity> implements ServicoPadrao<T> {
  abstract readonly nomeEntidade: string;
  abstract readonly nomeTabela: string;
  abstract readonly camposObrigatorios: (keyof T)[];
  abstract readonly camposEditaveis: (keyof T)[];
  abstract readonly relacionamentos: string[];

  // Implementações padrão que podem ser sobrescritas
  abstract buscarTodos(filtros?: FiltrosPadrao): Promise<RespostaAPIPadrao<T[]>>;
  abstract buscarPorId(id: string): Promise<RespostaAPIPadrao<T>>;
  abstract buscarComPaginacao(filtros: FiltrosPadrao & { page: number; limit: number }): Promise<RespostaAPIPadrao<T[]> & { meta: { pagination: PaginacaoPadrao } }>;
  abstract criar(dados: Omit<T, keyof BaseEntity>): Promise<RespostaAPIPadrao<T>>;
  abstract criarMultiplos(dados: Omit<T, keyof BaseEntity>[]): Promise<RespostaAPIPadrao<T[]>>;
  abstract atualizar(id: string, dados: Partial<Omit<T, keyof BaseEntity>>): Promise<RespostaAPIPadrao<T>>;
  abstract atualizarMultiplos(updates: { id: string; dados: Partial<Omit<T, keyof BaseEntity>> }[]): Promise<RespostaAPIPadrao<T[]>>;
  abstract deletar(id: string): Promise<RespostaAPIPadrao<void>>;
  abstract deletarMultiplos(ids: string[]): Promise<RespostaAPIPadrao<void>>;
  abstract deletarSoft(id: string): Promise<RespostaAPIPadrao<T>>;
  abstract restaurar(id: string): Promise<RespostaAPIPadrao<T>>;
  abstract validarCriacao(dados: Partial<T>): Promise<{ valido: boolean; erros: ErroPadrao[] }>;
  abstract validarAtualizacao(id: string, dados: Partial<T>): Promise<{ valido: boolean; erros: ErroPadrao[] }>;
  abstract validarDelecao(id: string): Promise<{ valido: boolean; erros: ErroPadrao[] }>;
  abstract validarPermissao(operacao: 'create' | 'read' | 'update' | 'delete', resourceId?: string): Promise<boolean>;
  abstract buscarTextoCompleto(termo: string, campos?: string[]): Promise<RespostaAPIPadrao<T[]>>;
  abstract buscarComFiltrosComplexos(filtros: Record<string, any>): Promise<RespostaAPIPadrao<T[]>>;
  abstract buscarComRelacionamentos(id: string, includes: string[]): Promise<RespostaAPIPadrao<T>>;
  abstract buscarComAgregacoes(agregacoes: Record<string, 'count' | 'sum' | 'avg' | 'min' | 'max'>): Promise<RespostaAPIPadrao<Record<string, number>>>;
  abstract exportarCSV(filtros?: FiltrosPadrao): Promise<RespostaAPIPadrao<string>>;
  abstract exportarExcel(filtros?: FiltrosPadrao): Promise<RespostaAPIPadrao<Blob>>;
  abstract exportarPDF(filtros?: FiltrosPadrao, template?: string): Promise<RespostaAPIPadrao<Blob>>;
  abstract exportarJSON(filtros?: FiltrosPadrao): Promise<RespostaAPIPadrao<T[]>>;
  abstract importarCSV(arquivo: File, mapeamento?: Record<string, string>): Promise<RespostaAPIPadrao<{ sucesso: T[]; erros: unknown[] }>>;
  abstract importarExcel(arquivo: File, aba?: string, mapeamento?: Record<string, string>): Promise<RespostaAPIPadrao<{ sucesso: T[]; erros: unknown[] }>>;
  abstract importarJSON(dados: unknown[]): Promise<RespostaAPIPadrao<{ sucesso: T[]; erros: unknown[] }>>;
  abstract validarArquivoImportacao(arquivo: File): Promise<{ valido: boolean; erros: string[] }>;
  abstract gerarRelatorioBasico(filtros?: FiltrosPadrao): Promise<RespostaAPIPadrao<any>>;
  abstract gerarRelatorioDetalhado(id: string): Promise<RespostaAPIPadrao<any>>;
  abstract gerarEstatisticas(periodo?: { inicio: string; fim: string }): Promise<RespostaAPIPadrao<Record<string, number>>>;
  abstract gerarGraficosDados(tipo: 'linha' | 'barra' | 'pizza' | 'area', campo: string, agrupamento?: string): Promise<RespostaAPIPadrao<any>>;
  abstract obterEstatisticasRapidas(): Promise<RespostaAPIPadrao<Record<string, number>>>;
  abstract validarIntegridade(): Promise<{ valido: boolean; problemas: string[] }>;
  abstract otimizarPerformance(): Promise<void>;
}