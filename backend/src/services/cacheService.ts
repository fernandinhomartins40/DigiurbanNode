// ====================================================================
// 🚀 CACHE SERVICE - DIGIURBAN ANALYTICS OPTIMIZATION
// ====================================================================
// Sistema de cache Redis para otimização de métricas pesadas
// Implementação da Fase 4: Cache inteligente com TTL dinâmico
// ====================================================================

import { StructuredLogger } from '../monitoring/structuredLogger.js';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

export interface CacheConfig {
  enabled: boolean;
  defaultTTL: number; // seconds
  maxMemory: string;
  evictionPolicy: 'allkeys-lru' | 'volatile-lru' | 'allkeys-lfu';
  keyPrefix: string;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: number;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  accessCount: number;
  lastAccess: Date;
}

// ====================================================================
// CLASSE PRINCIPAL DO CACHE SERVICE
// ====================================================================

export class CacheService {
  private static instance: CacheService;
  private isRedisAvailable: boolean = false;
  private redisClient: any = null;
  private fallbackCache: Map<string, CacheEntry> = new Map();
  private metrics: CacheMetrics;
  private config: CacheConfig;

  private constructor() {
    this.config = {
      enabled: process.env.CACHE_ENABLED !== 'false',
      defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300'), // 5 minutes
      maxMemory: process.env.CACHE_MAX_MEMORY || '100mb',
      evictionPolicy: 'allkeys-lru',
      keyPrefix: 'digiurban:'
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
      totalKeys: 0,
      memoryUsage: 0
    };

    this.initializeCache();
    this.setupCleanupInterval();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // ====================================================================
  // INICIALIZAÇÃO E CONFIGURAÇÃO
  // ====================================================================

  private async initializeCache(): Promise<void> {
    if (!this.config.enabled) {
      StructuredLogger.info('Cache desabilitado via configuração');
      return;
    }

    try {
      // Tentar inicializar Redis se disponível
      await this.initializeRedis();
    } catch (error) {
      StructuredLogger.warn('Redis não disponível, usando cache em memória', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.isRedisAvailable = false;
    }

    StructuredLogger.info('Cache Service inicializado', {
      provider: this.isRedisAvailable ? 'Redis' : 'Memory',
      config: this.config
    });
  }

  private async initializeRedis(): Promise<void> {
    try {
      // Simular inicialização do Redis (implementação real dependeria da biblioteca escolhida)
      // const redis = require('redis');
      // this.redisClient = redis.createClient({
      //   host: process.env.REDIS_HOST || 'localhost',
      //   port: parseInt(process.env.REDIS_PORT || '6379'),
      //   password: process.env.REDIS_PASSWORD
      // });
      //
      // await this.redisClient.connect();
      // this.isRedisAvailable = true;

      // Por enquanto, usar cache em memória
      this.isRedisAvailable = false;
      StructuredLogger.info('Redis simulado - usando cache em memória');
    } catch (error) {
      throw new Error(`Falha ao conectar com Redis: ${error}`);
    }
  }

  private setupCleanupInterval(): void {
    // Limpeza automática do cache em memória a cada 5 minutos
    setInterval(() => {
      this.cleanupExpiredKeys();
    }, 5 * 60 * 1000);
  }

  // ====================================================================
  // OPERAÇÕES PRINCIPAIS DO CACHE
  // ====================================================================

  /**
   * Obter valor do cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);

    try {
      if (this.isRedisAvailable && this.redisClient) {
        const value = await this.redisClient.get(fullKey);
        if (value) {
          this.metrics.hits++;
          return JSON.parse(value);
        }
      } else {
        const entry = this.fallbackCache.get(fullKey);
        if (entry && !this.isExpired(entry)) {
          entry.accessCount++;
          entry.lastAccess = new Date();
          this.metrics.hits++;
          return entry.value;
        }
      }

      this.metrics.misses++;
      this.updateHitRate();
      return null;
    } catch (error) {
      StructuredLogger.error('Erro ao obter do cache', error as Error, { key: fullKey });
      this.metrics.misses++;
      return null;
    }
  }

  /**
   * Armazenar valor no cache
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    const cacheTTL = ttl || this.config.defaultTTL;

    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.setEx(fullKey, cacheTTL, JSON.stringify(value));
      } else {
        const entry: CacheEntry<T> = {
          key: fullKey,
          value,
          ttl: cacheTTL,
          createdAt: new Date(),
          accessCount: 0,
          lastAccess: new Date()
        };
        this.fallbackCache.set(fullKey, entry);
      }

      this.metrics.sets++;
      StructuredLogger.debug('Item armazenado no cache', {
        key: fullKey,
        ttl: cacheTTL,
        size: JSON.stringify(value).length
      });

      return true;
    } catch (error) {
      StructuredLogger.error('Erro ao armazenar no cache', error as Error, { key: fullKey });
      return false;
    }
  }

  /**
   * Remover item do cache
   */
  async delete(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);

    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.del(fullKey);
      } else {
        this.fallbackCache.delete(fullKey);
      }

      this.metrics.deletes++;
      return true;
    } catch (error) {
      StructuredLogger.error('Erro ao remover do cache', error as Error, { key: fullKey });
      return false;
    }
  }

  /**
   * Limpar todo o cache
   */
  async clear(): Promise<boolean> {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.flushDb();
      } else {
        this.fallbackCache.clear();
      }

      StructuredLogger.info('Cache limpo completamente');
      return true;
    } catch (error) {
      StructuredLogger.error('Erro ao limpar cache', error as Error);
      return false;
    }
  }

  // ====================================================================
  // MÉTODOS ESPECÍFICOS PARA ANALYTICS
  // ====================================================================

  /**
   * Cache para métricas do dashboard (TTL: 5 minutos)
   */
  async getDashboardMetrics(tenantId?: string): Promise<any> {
    const key = tenantId ? `dashboard:metrics:${tenantId}` : 'dashboard:metrics:global';
    return this.get(key);
  }

  async setDashboardMetrics(data: any, tenantId?: string): Promise<boolean> {
    const key = tenantId ? `dashboard:metrics:${tenantId}` : 'dashboard:metrics:global';
    return this.set(key, data, 300); // 5 minutos
  }

  /**
   * Cache para analytics de usuários (TTL: 10 minutos)
   */
  async getAnalyticsOverview(period: string): Promise<any> {
    const key = `analytics:overview:${period}`;
    return this.get(key);
  }

  async setAnalyticsOverview(data: any, period: string): Promise<boolean> {
    const key = `analytics:overview:${period}`;
    return this.set(key, data, 600); // 10 minutos
  }

  /**
   * Cache para dados geográficos (TTL: 30 minutos)
   */
  async getGeographicData(period: string, groupBy: string): Promise<any> {
    const key = `geographic:${period}:${groupBy}`;
    return this.get(key);
  }

  async setGeographicData(data: any, period: string, groupBy: string): Promise<boolean> {
    const key = `geographic:${period}:${groupBy}`;
    return this.set(key, data, 1800); // 30 minutos
  }

  /**
   * Cache para relatórios (TTL: 1 hora)
   */
  async getReportData(reportId: number, period?: string): Promise<any> {
    const key = `report:${reportId}:${period || 'default'}`;
    return this.get(key);
  }

  async setReportData(data: any, reportId: number, period?: string): Promise<boolean> {
    const key = `report:${reportId}:${period || 'default'}`;
    return this.set(key, data, 3600); // 1 hora
  }

  /**
   * Cache para métricas de performance (TTL: 2 minutos)
   */
  async getPerformanceMetrics(): Promise<any> {
    return this.get('performance:metrics');
  }

  async setPerformanceMetrics(data: any): Promise<boolean> {
    return this.set('performance:metrics', data, 120); // 2 minutos
  }

  // ====================================================================
  // INVALIDAÇÃO INTELIGENTE
  // ====================================================================

  /**
   * Invalidar cache relacionado a um tenant específico
   */
  async invalidateTenant(tenantId: string): Promise<void> {
    const patterns = [
      `dashboard:metrics:${tenantId}`,
      `analytics:tenant:${tenantId}`,
      `geographic:*:tenant:${tenantId}`
    ];

    for (const pattern of patterns) {
      await this.delete(pattern);
    }

    StructuredLogger.info('Cache invalidado para tenant', { tenantId });
  }

  /**
   * Invalidar cache global quando dados críticos mudam
   */
  async invalidateGlobal(): Promise<void> {
    const patterns = [
      'dashboard:metrics:global',
      'analytics:overview:*',
      'geographic:*',
      'performance:metrics'
    ];

    for (const pattern of patterns) {
      await this.delete(pattern);
    }

    StructuredLogger.info('Cache global invalidado');
  }

  // ====================================================================
  // MÉTRICAS E MONITORAMENTO
  // ====================================================================

  /**
   * Obter métricas do cache
   */
  getMetrics(): CacheMetrics {
    this.updateHitRate();
    this.metrics.totalKeys = this.isRedisAvailable ? 0 : this.fallbackCache.size; // Redis keys count seria obtido diferentemente
    this.metrics.memoryUsage = this.calculateMemoryUsage();
    return { ...this.metrics };
  }

  /**
   * Resetar métricas
   */
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
      totalKeys: 0,
      memoryUsage: 0
    };
  }

  // ====================================================================
  // MÉTODOS AUXILIARES
  // ====================================================================

  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    const now = new Date();
    const expirationTime = new Date(entry.createdAt.getTime() + entry.ttl * 1000);
    return now > expirationTime;
  }

  private cleanupExpiredKeys(): void {
    if (this.isRedisAvailable) return; // Redis gerencia expiração automaticamente

    let removedCount = 0;
    for (const [key, entry] of this.fallbackCache.entries()) {
      if (this.isExpired(entry)) {
        this.fallbackCache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      StructuredLogger.debug('Limpeza automática do cache', { removedKeys: removedCount });
    }
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  private calculateMemoryUsage(): number {
    if (this.isRedisAvailable) return 0; // Seria obtido do Redis

    let totalSize = 0;
    for (const entry of this.fallbackCache.values()) {
      totalSize += JSON.stringify(entry).length;
    }
    return totalSize;
  }

  // ====================================================================
  // HEALTH CHECK
  // ====================================================================

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy', details: any }> {
    try {
      const testKey = 'health:check';
      const testValue = { timestamp: Date.now(), test: true };

      // Teste de escrita
      const setResult = await this.set(testKey, testValue, 10);
      if (!setResult) {
        return {
          status: 'unhealthy',
          details: { error: 'Falha ao escrever no cache' }
        };
      }

      // Teste de leitura
      const getValue = await this.get(testKey);
      if (!getValue || getValue.test !== true) {
        return {
          status: 'degraded',
          details: { error: 'Falha ao ler do cache' }
        };
      }

      // Limpeza
      await this.delete(testKey);

      const metrics = this.getMetrics();
      return {
        status: 'healthy',
        details: {
          provider: this.isRedisAvailable ? 'Redis' : 'Memory',
          metrics,
          config: this.config
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

// ====================================================================
// SINGLETON EXPORT
// ====================================================================

export const cacheService = CacheService.getInstance();
export default cacheService;