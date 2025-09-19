// ====================================================================
// 📊 DATABASE RATE STORE - DIGIURBAN SYSTEM
// ====================================================================
// Store de rate limiting baseado em SQLite para fallback do Redis
// Implementa sliding window com persistência otimizada
// Migrado para Knex.js Query Builder
// ====================================================================

import { prisma } from '../database/prisma.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';
import { RateLimitInfo, RateLimitStore } from './RedisRateStore.js';
import { Knex } from 'knex';

// ====================================================================
// INTERFACES
// ====================================================================

interface RateLimitRecord {
  id: number;
  key: string;
  hits: number;
  window_start: number;
  window_ms: number;
  max_hits: number;
  created_at: number;
  updated_at: number;
}

// ====================================================================
// DATABASE RATE STORE OTIMIZADO
// ====================================================================

export class DatabaseRateStore implements RateLimitStore {
  private initialized: boolean = false;
  private client: typeof prisma;

  constructor() {
    this.client = prisma;
    this.initialize();
  }

  /**
   * Inicializar tabelas otimizadas
   */
  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Verificar se tabela existe
      const hasTable = await this.client.schema.hasTable('rate_limits');
      
      if (!hasTable) {
        // Criar tabela otimizada com sliding window
        await this.client.schema.createTable('rate_limits', (table) => {
          table.increments('id').primary();
          table.string('key').notNullable().unique();
          table.integer('hits').notNullable().defaultTo(0);
          table.bigInteger('window_start').notNullable();
          table.integer('window_ms').notNullable();
          table.integer('max_hits').notNullable();
          table.bigInteger('created_at').notNullable().defaultTo(this.client.raw('(unixepoch() * 1000)'));
          table.bigInteger('updated_at').notNullable().defaultTo(this.client.raw('(unixepoch() * 1000)'));
          
          // Índices otimizados para performance
          table.index(['key'], 'idx_rate_limits_key');
          table.index(['window_start'], 'idx_rate_limits_window_start');
          table.index(['updated_at'], 'idx_rate_limits_updated_at');
        });
      }

      this.initialized = true;
      StructuredLogger.info('DatabaseRateStore otimizado inicializado');

    } catch (error) {
      StructuredLogger.error('Erro ao inicializar DatabaseRateStore', error);
      throw error;
    }
  }

  /**
   * Incrementar contador com sliding window otimizado
   */
  async increment(key: string, windowMs: number, maxHits: number): Promise<RateLimitInfo> {
    await this.initialize();

    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Buscar registro existente
      const existing = await this.client('rate_limits')
        .where('key', key)
        .first() as RateLimitRecord | undefined;

      if (!existing) {
        // Criar novo registro
        await this.client('rate_limits').insert({
          key,
          hits: 1,
          window_start: now,
          window_ms: windowMs,
          max_hits: maxHits,
          created_at: now,
          updated_at: now
        });

        return {
          totalHits: 1,
          remainingPoints: Math.max(0, maxHits - 1),
          msBeforeNext: windowMs,
          isFirstInDuration: true
        };
      }

      // Verificar se janela expirou
      if (existing.window_start < windowStart) {
        // Reset da janela
        await this.client('rate_limits')
          .where('key', key)
          .update({
            hits: 1,
            window_start: now,
            window_ms: windowMs,
            max_hits: maxHits,
            updated_at: now
          });

        return {
          totalHits: 1,
          remainingPoints: Math.max(0, maxHits - 1),
          msBeforeNext: windowMs,
          isFirstInDuration: true
        };
      }

      // Incrementar hits na janela atual
      const newHits = existing.hits + 1;
      await this.client('rate_limits')
        .where('key', key)
        .update({
          hits: newHits,
          max_hits: maxHits,
          updated_at: now
        });

      const remainingWindowTime = (existing.window_start + existing.window_ms) - now;

      return {
        totalHits: newHits,
        remainingPoints: Math.max(0, maxHits - newHits),
        msBeforeNext: Math.max(0, remainingWindowTime),
        isFirstInDuration: newHits === 1
      };

    } catch (error) {
      StructuredLogger.error('Erro ao incrementar rate limit', error as Error, {
        metadata: { key, windowMs, maxHits }
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
    await this.initialize();

    try {
      const deletedCount = await this.client('rate_limits')
        .where('key', key)
        .del();

      StructuredLogger.debug('Rate limit resetado', {
        metadata: {
          key: this.sanitizeKey(key),
          affected: deletedCount
        }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao resetar rate limit', error as Error, {
        metadata: { key: this.sanitizeKey(key) }
      });
    }
  }

  /**
   * Limpeza otimizada de registros expirados
   */
  async cleanup(): Promise<void> {
    await this.initialize();

    try {
      const now = Date.now();
      
      // Remover registros mais antigos que 24 horas
      const maxAge = 24 * 60 * 60 * 1000;
      const cutoff = now - maxAge;

      const deletedCount = await this.client('rate_limits')
        .where('updated_at', '<', cutoff)
        .del();

      if (deletedCount > 0) {
        StructuredLogger.debug('Limpeza de rate limits concluída', {
          metadata: {
            removidos: deletedCount,
            cutoff: new Date(cutoff).toISOString()
          }
        });
      }

    } catch (error) {
      StructuredLogger.error('Erro durante limpeza de rate limits', error);
    }
  }

  /**
   * Health check otimizado
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.initialize();
      
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
      await this.initialize();
      
      const now = Date.now();
      const recentThreshold = now - (60 * 60 * 1000); // 1 hora atrás

      // Total de chaves
      const totalResult = await this.client('rate_limits')
        .count('* as total')
        .first() as { total: number };

      // Chaves ativas (atualizadas na última hora)
      const activeResult = await this.client('rate_limits')
        .where('updated_at', '>=', recentThreshold)
        .count('* as total')
        .first() as { total: number };

      // Média de hits por chave
      const avgResult = await this.client('rate_limits')
        .avg('hits as average')
        .first() as { average: number };

      // Top chaves com mais hits
      const topKeys = await this.client('rate_limits')
        .select('key', 'hits', 'window_start')
        .orderBy('hits', 'desc')
        .limit(10) as Array<{ key: string; hits: number; window_start: number }>;

      return {
        totalKeys: totalResult.total,
        activeKeys: activeResult.total,
        avgHitsPerKey: Math.round(avgResult.average || 0),
        topKeys: topKeys.map(key => ({
          ...key,
          key: this.sanitizeKey(key.key)
        }))
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
      await this.initialize();

      const now = Date.now();
      const windowStart = now - windowMs;

      const record = await this.client('rate_limits')
        .where('key', key)
        .first() as RateLimitRecord | undefined;

      if (!record) {
        return false; // Sem registro = não limitado
      }

      // Se janela expirou, não está limitado
      if (record.window_start < windowStart) {
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
   * Sanitizar chave para logs (proteger PII)
   */
  private sanitizeKey(key: string): string {
    return key.startsWith('user:') ? key : key.replace(/\d+\.\d+\.\d+\.\d+/g, '[IP-REDACTED]');
  }
}