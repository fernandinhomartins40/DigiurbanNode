// ====================================================================
// 📊 DATABASE RATE STORE - DIGIURBAN SYSTEM
// ====================================================================
// Store de rate limiting baseado em SQLite para fallback do Redis
// Implementa sliding window com persistência otimizada
// ====================================================================

import { getDatabase, query, execute } from '../database/connection.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';
import { RateLimitInfo, RateLimitStore } from './RedisRateStore.js';

// ====================================================================
// INTERFACES ADICIONAIS
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

  constructor() {
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
      // Tabela otimizada com sliding window
      await this.pool.executeStatement(`
        CREATE TABLE IF NOT EXISTS rate_limits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT NOT NULL UNIQUE,
          hits INTEGER NOT NULL DEFAULT 0,
          window_start INTEGER NOT NULL,
          window_ms INTEGER NOT NULL,
          max_hits INTEGER NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
        )
      `);

      // Índices otimizados para performance
      await this.pool.executeStatement(`
        CREATE INDEX IF NOT EXISTS idx_rate_limits_key 
        ON rate_limits(key)
      `);

      await this.pool.executeStatement(`
        CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start 
        ON rate_limits(window_start)
      `);

      await this.pool.executeStatement(`
        CREATE INDEX IF NOT EXISTS idx_rate_limits_updated_at 
        ON rate_limits(updated_at)
      `);

      this.initialized = true;
      SafeLogger.info('DatabaseRateStore otimizado inicializado');

    } catch (error) {
      SafeLogger.error('Erro ao inicializar DatabaseRateStore', error);
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
      return await this.pool.executeTransaction((db) => {
        // Buscar registro existente
        const existing = db
          .prepare('SELECT * FROM rate_limits WHERE key = ?')
          .get(key) as RateLimitRecord | undefined;

        if (!existing) {
          // Criar novo registro
          db.prepare(`
            INSERT INTO rate_limits (key, hits, window_start, window_ms, max_hits, created_at, updated_at)
            VALUES (?, 1, ?, ?, ?, ?, ?)
          `).run(key, now, windowMs, maxHits, now, now);

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
          db.prepare(`
            UPDATE rate_limits 
            SET hits = 1, window_start = ?, window_ms = ?, max_hits = ?, updated_at = ?
            WHERE key = ?
          `).run(now, windowMs, maxHits, now, key);

          return {
            totalHits: 1,
            remainingPoints: Math.max(0, maxHits - 1),
            msBeforeNext: windowMs,
            isFirstInDuration: true
          };
        }

        // Incrementar hits na janela atual
        const newHits = existing.hits + 1;
        db.prepare(`
          UPDATE rate_limits 
          SET hits = ?, max_hits = ?, updated_at = ?
          WHERE key = ?
        `).run(newHits, maxHits, now, key);

        const remainingWindowTime = (existing.window_start + existing.window_ms) - now;

        return {
          totalHits: newHits,
          remainingPoints: Math.max(0, maxHits - newHits),
          msBeforeNext: Math.max(0, remainingWindowTime),
          isFirstInDuration: newHits === 1
        };
      });

    } catch (error) {
      SafeLogger.error('Erro ao incrementar rate limit', error, { key, windowMs, maxHits });
      
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
      const result = await this.pool.executeStatement(
        'DELETE FROM rate_limits WHERE key = ?',
        [key]
      );

      SafeLogger.debug('Rate limit resetado', { 
        key: this.sanitizeKey(key), 
        affected: result.changes 
      });

    } catch (error) {
      SafeLogger.error('Erro ao resetar rate limit', error, { key: this.sanitizeKey(key) });
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

      const result = await this.pool.executeStatement(
        'DELETE FROM rate_limits WHERE updated_at < ?',
        [cutoff]
      );

      if (result.changes > 0) {
        SafeLogger.debug('Limpeza de rate limits concluída', {
          removidos: result.changes,
          cutoff: new Date(cutoff).toISOString()
        });
      }

    } catch (error) {
      SafeLogger.error('Erro durante limpeza de rate limits', error);
    }
  }

  /**
   * Obter estatísticas avançadas
   */
  async getStats(): Promise<{
    totalKeys: number;
    activeKeys: number;
    topKeys: Array<{ key: string; hits: number; remaining: number }>;
    oldestRecord: string;
    newestRecord: string;
  }> {
    await this.initialize();

    try {
      const now = Date.now();

      // Total de chaves
      const totalResult = await this.pool.executeQuery<{ count: number }>(
        'SELECT COUNT(*) as count FROM rate_limits'
      );
      const totalKeys = totalResult[0]?.count || 0;

      // Chaves ativas (não expiradas)
      const activeResult = await this.pool.executeQuery<{ count: number }>(
        'SELECT COUNT(*) as count FROM rate_limits WHERE (window_start + window_ms) > ?',
        [now]
      );
      const activeKeys = activeResult[0]?.count || 0;

      // Top 10 chaves por hits
      const topResult = await this.pool.executeQuery<{
        key: string;
        hits: number;
        window_start: number;
        window_ms: number;
      }>(
        'SELECT key, hits, window_start, window_ms FROM rate_limits ORDER BY hits DESC LIMIT 10'
      );

      const topKeys = topResult.map(record => ({
        key: this.sanitizeKey(record.key),
        hits: record.hits,
        remaining: Math.max(0, (record.window_start + record.window_ms) - now)
      }));

      // Registros mais antigo e mais novo
      const oldestResult = await this.pool.executeQuery<{ created_at: number }>(
        'SELECT created_at FROM rate_limits ORDER BY created_at ASC LIMIT 1'
      );
      const newestResult = await this.pool.executeQuery<{ created_at: number }>(
        'SELECT created_at FROM rate_limits ORDER BY created_at DESC LIMIT 1'
      );

      const oldestRecord = oldestResult[0] ? 
        new Date(oldestResult[0].created_at).toISOString() : 'N/A';
      const newestRecord = newestResult[0] ? 
        new Date(newestResult[0].created_at).toISOString() : 'N/A';

      return {
        totalKeys,
        activeKeys,
        topKeys,
        oldestRecord,
        newestRecord
      };

    } catch (error) {
      SafeLogger.error('Erro ao obter estatísticas do DatabaseRateStore', error);
      return {
        totalKeys: 0,
        activeKeys: 0,
        topKeys: [],
        oldestRecord: 'Error',
        newestRecord: 'Error'
      };
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
      SafeLogger.error('Health check do DatabaseRateStore falhou', error);
      return false;
    }
  }

  /**
   * Verificar integridade da base de dados
   */
  async verifyIntegrity(): Promise<{
    isValid: boolean;
    errors: string[];
    repaired: boolean;
  }> {
    await this.initialize();

    const errors: string[] = [];
    let repaired = false;

    try {
      // Verificar registros inconsistentes
      const inconsistentRecords = await this.pool.executeQuery<{ count: number }>(
        'SELECT COUNT(*) as count FROM rate_limits WHERE hits < 0 OR window_ms <= 0 OR max_hits <= 0'
      );

      if (inconsistentRecords[0]?.count > 0) {
        errors.push(`${inconsistentRecords[0].count} registros com dados inválidos`);
        
        // Reparar removendo registros inválidos
        const deleteResult = await this.pool.executeStatement(
          'DELETE FROM rate_limits WHERE hits < 0 OR window_ms <= 0 OR max_hits <= 0'
        );
        
        if (deleteResult.changes > 0) {
          repaired = true;
          SafeLogger.info('Registros inválidos removidos', { count: deleteResult.changes });
        }
      }

      const isValid = errors.length === 0;

      if (!isValid) {
        SafeLogger.warn('Problemas de integridade detectados no DatabaseRateStore', { errors });
      }

      return { isValid, errors, repaired };

    } catch (error) {
      SafeLogger.error('Erro ao verificar integridade do DatabaseRateStore', error);
      return {
        isValid: false,
        errors: [`Erro na verificação: ${error.message}`],
        repaired: false
      };
    }
  }

  /**
   * Sanitizar chave para logs (proteger PII)
   */
  private sanitizeKey(key: string): string {
    return key.startsWith('user:') ? key : key.replace(/\d+\.\d+\.\d+\.\d+/g, '[IP-REDACTED]');
  }
}