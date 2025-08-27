// =====================================================
// SISTEMA DE CACHE UNIFICADO - FASE 3
// =====================================================

import { CRUD_CONSTANTS } from "@/types/crud-patterns"

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

interface CacheStats {
  hits: number
  misses: number
  entries: number
  hitRate: number
}

// =====================================================
// CACHE MANAGER PRINCIPAL
// =====================================================

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private stats = { hits: 0, misses: 0 }

  /**
   * Armazena item no cache
   */
  set<T>(key: string, data: T, ttl: number = CRUD_CONSTANTS.CACHE_TTL_SECONDS): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Converter para ms
      key
    }

    this.cache.set(key, entry)
    this.cleanup() // Limpar entradas expiradas
  }

  /**
   * Recupera item do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return entry.data as T
  }

  /**
   * Remove item específico do cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Remove itens por padrão
   */
  deletePattern(pattern: string): number {
    let deleted = 0
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }
    
    return deleted
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0 }
  }

  /**
   * Remove entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): CacheStats {
    const entries = this.cache.size
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      entries,
      hitRate: Math.round(hitRate * 100) / 100
    }
  }

  /**
   * Lista todas as chaves do cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Verifica se uma chave existe
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
}

// =====================================================
// INSTÂNCIA GLOBAL DO CACHE
// =====================================================

export const globalCache = new CacheManager()

// =====================================================
// UTILITY FUNCTIONS PARA CACHE
// =====================================================

export class CacheUtils {
  
  /**
   * Gera chave de cache padronizada
   */
  static generateKey(entity: string, operation: string, params?: any): string {
    const baseKey = `${entity}:${operation}`
    
    if (!params) return baseKey
    
    // Ordenar parâmetros para chave consistente
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&')
    
    return `${baseKey}:${btoa(sortedParams)}`
  }

  /**
   * Gera chave para entidade específica
   */
  static entityKey(entity: string, id: string): string {
    return `${entity}:entity:${id}`
  }

  /**
   * Gera chave para lista de entidades
   */
  static listKey(entity: string, filters?: any, pagination?: any): string {
    const params = { filters, pagination }
    return this.generateKey(entity, 'list', params)
  }

  /**
   * Gera chave para busca
   */
  static searchKey(entity: string, query: string, filters?: any): string {
    const params = { query, filters }
    return this.generateKey(entity, 'search', params)
  }

  /**
   * Invalida cache relacionado a uma entidade
   */
  static invalidateEntity(entity: string, id?: string): number {
    if (id) {
      // Invalidar entidade específica
      globalCache.delete(this.entityKey(entity, id))
    }
    
    // Invalidar todas as listas e buscas da entidade
    return globalCache.deletePattern(`${entity}:`)
  }

  /**
   * Invalida cache de listas após operação CRUD
   */
  static invalidateAfterWrite(entity: string, operation: 'create' | 'update' | 'delete'): void {
    // Invalidar listas e buscas
    globalCache.deletePattern(`${entity}:list:`)
    globalCache.deletePattern(`${entity}:search:`)
    
    // Log da invalidação
    console.log(`🗑️ Cache invalidated for ${entity} after ${operation}`)
  }
}

// =====================================================
// DECORADOR PARA CACHE AUTOMÁTICO
// =====================================================

export function withCache<T>(
  cacheKey: string,
  ttl: number = CRUD_CONSTANTS.CACHE_TTL_SECONDS
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args[]): Promise<T> {
      // Verificar se está no cache
      const cachedResult = globalCache.get<T>(cacheKey)
      if (cachedResult) {
        console.log(`🎯 Cache hit for ${cacheKey}`)
        return cachedResult
      }

      // Executar método original
      console.log(`💫 Cache miss for ${cacheKey}`)
      const result = await method.apply(this, args)
      
      // Armazenar no cache se resultado foi bem-sucedido
      if (result && (result as any).success !== false) {
        globalCache.set(cacheKey, result, ttl)
      }

      return result
    }
  }
}

// =====================================================
// HOOK PARA CACHE EM COMPONENTES
// =====================================================

export function useCache() {
  const get = <T>(key: string): T | null => {
    return globalCache.get<T>(key)
  }

  const set = <T>(key: string, data: T, ttl?: number): void => {
    globalCache.set(key, data, ttl)
  }

  const invalidate = (pattern: string): number => {
    return globalCache.deletePattern(pattern)
  }

  const clear = (): void => {
    globalCache.clear()
  }

  const stats = (): CacheStats => {
    return globalCache.getStats()
  }

  const has = (key: string): boolean => {
    return globalCache.has(key)
  }

  return {
    get,
    set,
    invalidate,
    clear,
    stats,
    has,
    utils: CacheUtils
  }
}

// =====================================================
// MIDDLEWARE PARA HOOKS CRUD
// =====================================================

export class CacheCRUDMiddleware {
  
  /**
   * Middleware para operações READ
   */
  static async withReadCache<T>(
    entity: string,
    operation: string,
    params: any,
    executor: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cacheKey = CacheUtils.generateKey(entity, operation, params)
    
    // Tentar buscar no cache
    const cached = globalCache.get<T>(cacheKey)
    if (cached) {
      console.log(`🎯 Cache hit: ${cacheKey}`)
      return cached
    }

    console.log(`💫 Cache miss: ${cacheKey}`)
    
    // Executar operação
    const result = await executor()
    
    // Armazenar no cache se sucesso
    if (result && (result as any).success !== false) {
      globalCache.set(cacheKey, result, ttl)
    }

    return result
  }

  /**
   * Middleware para operações WRITE
   */
  static async withWriteInvalidation<T>(
    entity: string,
    operation: 'create' | 'update' | 'delete',
    id: string | undefined,
    executor: () => Promise<T>
  ): Promise<T> {
    // Executar operação
    const result = await executor()
    
    // Se operação foi bem-sucedida, invalidar cache
    if (result && (result as any).success !== false) {
      CacheUtils.invalidateAfterWrite(entity, operation)
      
      // Para updates e deletes, invalidar entidade específica
      if (id && (operation === 'update' || operation === 'delete')) {
        globalCache.delete(CacheUtils.entityKey(entity, id))
      }
    }

    return result
  }
}

// =====================================================
// CONFIGURAÇÕES DE CACHE POR ENTIDADE
// =====================================================

export const CACHE_CONFIG = {
  // TTL específico por tipo de operação
  TTL: {
    ENTITY_DETAIL: 300, // 5 minutos
    ENTITY_LIST: 180,   // 3 minutos
    SEARCH_RESULTS: 120, // 2 minutos
    STATISTICS: 600,     // 10 minutos
    METADATA: 1800       // 30 minutos
  },
  
  // Padrões de invalidação
  INVALIDATION_PATTERNS: {
    ENTITY_ALL: (entity: string) => `${entity}:*`,
    ENTITY_LISTS: (entity: string) => `${entity}:list:*`,
    ENTITY_SEARCHES: (entity: string) => `${entity}:search:*`,
    ENTITY_STATS: (entity: string) => `${entity}:stats:*`
  }
} as const