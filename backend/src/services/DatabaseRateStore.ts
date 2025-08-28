// ====================================================================
// 📊 DATABASE RATE STORE - DIGIURBAN SYSTEM
// ====================================================================
// Store de rate limiting baseado em SQLite para fallback do Redis
// Implementa sliding window com persistência otimizada
// ====================================================================

import { getDatabase } from '../database/connection.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';
import { RateLimitInfo, RateLimitStore } from './RedisRateStore.js';

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
  private db: any;

  constructor() {
    this.db = getDatabase();
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
      this.db.prepare(`
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
      `).run();

      // Índices otimizados para performance
      this.db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_rate_limits_key 
        ON rate_limits(key)
      `).run();

      this.db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start 
        ON rate_limits(window_start)
      `).run();

      this.db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_rate_limits_updated_at 
        ON rate_limits(updated_at)
      `).run();

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
      const existing = this.db
        .prepare('SELECT * FROM rate_limits WHERE key = ?')
        .get(key) as RateLimitRecord | undefined;

      if (!existing) {
        // Criar novo registro
        this.db.prepare(`
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
        this.db.prepare(`
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
      this.db.prepare(`
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
      const result = this.db.prepare(
        'DELETE FROM rate_limits WHERE key = ?'
      ).run(key);

      StructuredLogger.debug('Rate limit resetado', {
        metadata: {
          key: this.sanitizeKey(key),
          affected: result.changes
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

      const result = this.db.prepare(
        'DELETE FROM rate_limits WHERE updated_at < ?'
      ).run(cutoff);

      if (result.changes > 0) {
        StructuredLogger.debug('Limpeza de rate limits concluída', {
          metadata: {
            removidos: result.changes,
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
   * Sanitizar chave para logs (proteger PII)
   */
  private sanitizeKey(key: string): string {
    return key.startsWith('user:') ? key : key.replace(/\d+\.\d+\.\d+\.\d+/g, '[IP-REDACTED]');
  }
}