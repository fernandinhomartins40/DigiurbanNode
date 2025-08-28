// ====================================================================
// ⚡ REDIS RATE STORE - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Store persistente para rate limiting usando Redis
// Suporte a clusters e alta disponibilidade
// ====================================================================

import Redis from 'ioredis';
import { logger } from '../config/logger.js';

export interface RateLimitInfo {
  totalHits: number;
  remainingPoints: number;
  msBeforeNext: number;
  isFirstInDuration: boolean;
}

export interface RateLimitStore {
  increment(key: string, windowMs: number, maxHits: number): Promise<RateLimitInfo>;
  reset(key: string): Promise<void>;
  cleanup(): Promise<void>;
}

export class RedisRateStore implements RateLimitStore {
  private redis: Redis;
  private connected: boolean = false;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0'),
      password: process.env.REDIS_PASSWORD,
      
      // Configurações de conexão
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
      
      // Timeouts
      connectTimeout: 10000,
      lazyConnect: true,
      
      // Configurações de cluster (se necessário)
      enableReadyCheck: true,
      maxLoadBalanceRange: 3
    });

    this.setupEventHandlers();
    this.connect();
  }

  /**
   * Configurar event handlers do Redis
   */
  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      console.log('✅ Redis conectado para rate limiting');
      this.connected = true;
    });

    this.redis.on('disconnect', () => {
      console.log('⚠️ Redis desconectado');
      this.connected = false;
    });

    this.redis.on('error', (error) => {
      logger.error('Redis rate store error', { error: error.message });
      this.connected = false;
    });

    this.redis.on('reconnecting', () => {
      console.log('🔄 Reconectando ao Redis...');
    });
  }

  /**
   * Conectar ao Redis
   */
  private async connect(): Promise<void> {
    try {
      await this.redis.connect();
    } catch (error) {
      logger.error('Falha ao conectar ao Redis', { error: error.message });
      throw error;
    }
  }

  /**
   * Incrementar contador com sliding window
   */
  async increment(key: string, windowMs: number, maxHits: number): Promise<RateLimitInfo> {
    if (!this.connected) {
      throw new Error('Redis não conectado para rate limiting');
    }

    try {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Usar pipeline para operações atômicas
      const pipeline = this.redis.pipeline();
      
      // Remover entradas expiradas
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Adicionar hit atual
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Contar hits na janela atual
      pipeline.zcard(key);
      
      // Definir TTL para limpeza automática
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      
      // Executar pipeline
      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Falha ao executar pipeline Redis');
      }

      // Extrair resultado do count
      const hitCount = results[2][1] as number;
      
      const remaining = Math.max(0, maxHits - hitCount);
      const msBeforeReset = windowMs - (now % windowMs);

      return {
        totalHits: hitCount,
        remainingPoints: remaining,
        msBeforeNext: remaining > 0 ? 0 : msBeforeReset,
        isFirstInDuration: hitCount === 1
      };

    } catch (error) {
      logger.error('Erro no Redis rate limiting', { 
        error: error.message, 
        key: this.sanitizeKey(key)
      });
      throw error;
    }
  }

  /**
   * Resetar contador para uma chave específica
   */
  async reset(key: string): Promise<void> {
    if (!this.connected) {
      return; // Fail silently se Redis não estiver conectado
    }

    try {
      await this.redis.del(key);
      logger.info('Rate limit reset', { key: this.sanitizeKey(key) });
    } catch (error) {
      logger.error('Erro ao resetar rate limit', { 
        error: error.message, 
        key: this.sanitizeKey(key) 
      });
    }
  }

  /**
   * Limpeza geral (executada periodicamente)
   */
  async cleanup(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      // Usar SCAN para encontrar chaves de rate limit
      const stream = this.redis.scanStream({
        match: 'rate_limit:*',
        count: 100
      });

      const keysToCheck: string[] = [];
      
      stream.on('data', (keys: string[]) => {
        keysToCheck.push(...keys);
      });

      stream.on('end', async () => {
        if (keysToCheck.length === 0) return;

        // Verificar TTL das chaves e remover se necessário
        const pipeline = this.redis.pipeline();
        keysToCheck.forEach(key => {
          pipeline.ttl(key);
        });

        const ttlResults = await pipeline.exec();
        const expiredKeys: string[] = [];

        ttlResults?.forEach((result, index) => {
          const ttl = result[1] as number;
          if (ttl <= 0) {
            expiredKeys.push(keysToCheck[index]);
          }
        });

        // Remover chaves expiradas
        if (expiredKeys.length > 0) {
          await this.redis.del(...expiredKeys);
          logger.info(`Rate limit cleanup: removed ${expiredKeys.length} expired keys`);
        }
      });

    } catch (error) {
      logger.error('Erro na limpeza de rate limiting', { error: error.message });
    }
  }

  /**
   * Verificar se Redis está conectado
   */
  isConnected(): boolean {
    return this.connected && this.redis.status === 'ready';
  }

  /**
   * Obter estatísticas do Redis
   */
  async getStats(): Promise<{ keys: number; memory: string; connections: number }> {
    if (!this.connected) {
      return { keys: 0, memory: '0B', connections: 0 };
    }

    try {
      const info = await this.redis.info('memory');
      const keyCount = await this.redis.dbsize();
      const clients = await this.redis.info('clients');
      
      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch ? memoryMatch[1] : '0B';
      
      // Parse connections
      const connectionMatch = clients.match(/connected_clients:(\d+)/);
      const connections = connectionMatch ? parseInt(connectionMatch[1]) : 0;

      return {
        keys: keyCount,
        memory,
        connections
      };
    } catch (error) {
      logger.error('Erro ao obter stats Redis', { error: error.message });
      return { keys: 0, memory: '0B', connections: 0 };
    }
  }

  /**
   * Fechar conexão Redis
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.disconnect();
      console.log('✅ Redis desconectado');
    } catch (error) {
      logger.error('Erro ao desconectar Redis', { error: error.message });
    }
  }

  /**
   * Sanitizar chave para logs (remover dados sensíveis)
   */
  private sanitizeKey(key: string): string {
    // Remover IPs e dados sensíveis das chaves para logs
    return key.replace(/\d+\.\d+\.\d+\.\d+/g, '[IP]');
  }
}

export default RedisRateStore;