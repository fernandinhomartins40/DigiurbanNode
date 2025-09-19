// ====================================================================
// 📊 DATABASE RATE STORE - DIGIURBAN SYSTEM
// ====================================================================
// Store de rate limiting baseado em ActivityLog para fallback do Redis
// Implementa sliding window usando logs de atividade
// Migrado de Knex para Prisma ORM
// ====================================================================

import { prisma } from '../database/prisma.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';
import { RateLimitInfo, RateLimitStore } from './RedisRateStore.js';

// ====================================================================
// INTERFACES
// ====================================================================

interface RateLimitRecord {
  key: string;
  hits: number;
  windowStart: Date;
  windowMs: number;
  maxHits: number;
}

// ====================================================================
// DATABASE RATE STORE SIMPLIFICADO (usando ActivityLog)
// ====================================================================

export class DatabaseRateStore implements RateLimitStore {
  private cache: Map<string, RateLimitRecord> = new Map();
  private initialized: boolean = true; // Sempre inicializado pois usa ActivityLog existente

  constructor() {
    // Cache em memória para performance já que não podemos criar tabelas customizadas facilmente no Prisma
    this.startCleanupTimer();
  }

  /**
   * Incrementar contador com sliding window em memória
   */
  async increment(key: string, windowMs: number, maxHits: number): Promise<RateLimitInfo> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    try {
      // Verificar se existe no cache
      let record = this.cache.get(key);

      if (!record || record.windowStart < windowStart) {
        // Criar novo registro ou resetar janela
        record = {
          key,
          hits: 1,
          windowStart: now,
          windowMs,
          maxHits
        };
        this.cache.set(key, record);

        // Log da atividade de rate limit no banco
        await this.logRateLimitActivity(key, 1, 'increment');

        return {
          totalHits: 1,
          remainingPoints: Math.max(0, maxHits - 1),
          msBeforeNext: windowMs,
          isFirstInDuration: true
        };
      }

      // Incrementar hits na janela atual
      record.hits += 1;
      record.maxHits = maxHits; // Atualizar limite se mudou
      this.cache.set(key, record);

      // Log no banco (apenas para hits significativos para não sobrecarregar)
      if (record.hits % 10 === 0 || record.hits >= maxHits) {
        await this.logRateLimitActivity(key, record.hits, 'increment');
      }

      const remainingWindowTime = (record.windowStart.getTime() + record.windowMs) - now.getTime();

      return {
        totalHits: record.hits,
        remainingPoints: Math.max(0, maxHits - record.hits),
        msBeforeNext: Math.max(0, remainingWindowTime),
        isFirstInDuration: record.hits === 1
      };

    } catch (error) {
      StructuredLogger.error('Erro ao incrementar rate limit', error as Error, {
        metadata: { key: this.sanitizeKey(key), windowMs, maxHits }
      });

      // Fallback seguro em caso de erro
      return {
        totalHits: 1,
        remainingPoints: Math.max(0, maxHits - 1),
        msBeforeNext: windowMs,
        isFirstInDuration: true
      };
    }
  }

  /**
   * Resetar rate limit para chave específica
   */
  async reset(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      await this.logRateLimitActivity(key, 0, 'reset');

      StructuredLogger.debug('Rate limit resetado', {
        metadata: { key: this.sanitizeKey(key) }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao resetar rate limit', error as Error, {
        metadata: { key: this.sanitizeKey(key) }
      });
    }
  }

  /**
   * Limpeza de registros expirados do cache
   */
  async cleanup(): Promise<void> {
    try {
      const now = new Date();
      let removedCount = 0;

      for (const [key, record] of this.cache.entries()) {
        const windowEnd = new Date(record.windowStart.getTime() + record.windowMs);

        // Remover se janela expirou há mais de 1 hora
        if (windowEnd.getTime() < (now.getTime() - 60 * 60 * 1000)) {
          this.cache.delete(key);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        StructuredLogger.debug('Limpeza de rate limits concluída', {
          metadata: { removidos: removedCount }
        });
      }

    } catch (error) {
      StructuredLogger.error('Erro durante limpeza de rate limits', error);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = `healthcheck_${Date.now()}`;

      // Test write & read
      const result = await this.increment(testKey, 60000, 10);

      // Test delete
      await this.reset(testKey);

      return result.totalHits === 1 && result.isFirstInDuration;

    } catch (error) {
      StructuredLogger.error('Health check do DatabaseRateStore falhou', error);
      return false;
    }
  }

  /**
   * Obter estatísticas do rate limiting
   */
  async getStats(): Promise<{
    totalKeys: number;
    activeKeys: number;
    avgHitsPerKey: number;
    topKeys: Array<{ key: string; hits: number; window_start: number }>;
  }> {
    try {
      const now = new Date();
      const recentThreshold = new Date(now.getTime() - (60 * 60 * 1000)); // 1 hora atrás

      let activeKeys = 0;
      let totalHits = 0;
      const topKeys: Array<{ key: string; hits: number; window_start: number }> = [];

      for (const [key, record] of this.cache.entries()) {
        const windowEnd = new Date(record.windowStart.getTime() + record.windowMs);

        if (windowEnd > recentThreshold) {
          activeKeys++;
          totalHits += record.hits;
          topKeys.push({
            key: this.sanitizeKey(key),
            hits: record.hits,
            window_start: record.windowStart.getTime()
          });
        }
      }

      // Ordenar por hits e pegar top 10
      topKeys.sort((a, b) => b.hits - a.hits);
      topKeys.splice(10);

      return {
        totalKeys: this.cache.size,
        activeKeys,
        avgHitsPerKey: activeKeys > 0 ? Math.round(totalHits / activeKeys) : 0,
        topKeys
      };

    } catch (error) {
      StructuredLogger.error('Erro ao obter stats do rate limiting', error);
      return {
        totalKeys: 0,
        activeKeys: 0,
        avgHitsPerKey: 0,
        topKeys: []
      };
    }
  }

  /**
   * Verificar se chave está sendo rate limited
   */
  async isRateLimited(key: string, windowMs: number, maxHits: number): Promise<boolean> {
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - windowMs);

      const record = this.cache.get(key);

      if (!record) {
        return false; // Sem registro = não limitado
      }

      // Se janela expirou, não está limitado
      if (record.windowStart < windowStart) {
        return false;
      }

      // Verificar se excedeu o limite
      return record.hits >= maxHits;

    } catch (error) {
      StructuredLogger.error('Erro ao verificar rate limit', error as Error, {
        metadata: { key: this.sanitizeKey(key) }
      });
      return false; // Em caso de erro, não bloquear
    }
  }

  /**
   * Log de atividade de rate limit no banco (usando ActivityLog)
   */
  private async logRateLimitActivity(key: string, hits: number, action: string): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          action: `rate_limit_${action}`,
          resource: 'rate_limit',
          details: JSON.stringify({
            key: this.sanitizeKey(key),
            hits,
            timestamp: new Date().toISOString()
          }),
          createdAt: new Date()
        }
      });
    } catch (error) {
      // Log silencioso - não queremos que rate limiting falhe por erro de log
      console.debug('Erro ao logar rate limit activity:', error?.message || 'Unknown error');
    }
  }

  /**
   * Timer de limpeza automática
   */
  private startCleanupTimer(): void {
    // Limpeza a cada 15 minutos
    setInterval(() => {
      this.cleanup().catch(console.error);
    }, 15 * 60 * 1000);
  }

  /**
   * Sanitizar chave para logs (proteger PII)
   */
  private sanitizeKey(key: string): string {
    return key.startsWith('user:') ? key : key.replace(/\d+\.\d+\.\d+\.\d+/g, '[IP-REDACTED]');
  }
}