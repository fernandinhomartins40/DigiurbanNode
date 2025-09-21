// ====================================================================
// 🛡️ MIDDLEWARE DE RATE LIMITING
// ====================================================================
// Proteção contra abuso das APIs com rate limiting inteligente
// Diferentes limites para diferentes tipos de endpoints
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

export interface RateLimitConfig {
  windowMs: number;        // Janela de tempo em ms
  maxRequests: number;     // Máximo de requests na janela
  message?: string;        // Mensagem de erro customizada
  skipSuccessfulRequests?: boolean;  // Não contar requests bem-sucedidos
  skipFailedRequests?: boolean;      // Não contar requests que falharam
  keyGenerator?: (req: Request) => string;  // Função para gerar chave personalizada
}

export interface RateLimitStore {
  key: string;
  requests: number;
  resetTime: number;
  lastRequest: number;
}

// ====================================================================
// CONFIGURAÇÕES DE RATE LIMIT POR TIPO DE ENDPOINT
// ====================================================================

export const RATE_LIMIT_CONFIGS = {
  // APIs de analytics - limite mais restritivo
  analytics: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,          // 100 requests por 15 min
    message: 'Muitas requisições para analytics. Tente novamente em alguns minutos.'
  },

  // APIs de autenticação - muito restritivo
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 20,           // 20 tentativas por 15 min
    message: 'Muitas tentativas de login. Tente novamente em alguns minutos.'
  },

  // APIs gerais - limite padrão
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 300,          // 300 requests por 15 min
    message: 'Muitas requisições. Tente novamente em alguns minutos.'
  },

  // Upload de arquivos - limite baixo
  upload: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 10,           // 10 uploads por 15 min
    message: 'Limite de upload atingido. Tente novamente em alguns minutos.'
  },

  // APIs de relatórios - limite médio
  reports: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 50,           // 50 requests por 15 min
    message: 'Muitas requisições de relatórios. Tente novamente em alguns minutos.'
  }
};

// ====================================================================
// CLASSE DE RATE LIMITING
// ====================================================================

class RateLimiter {
  private static instance: RateLimiter;
  private store: Map<string, RateLimitStore> = new Map();
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutos

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
      RateLimiter.instance.setupCleanup();
    }
    return RateLimiter.instance;
  }

  /**
   * Verificar se a requisição deve ser limitada
   */
  checkLimit(key: string, config: RateLimitConfig): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    totalHits: number;
  } {
    const now = Date.now();
    const existingRecord = this.store.get(key);

    // Se não há registro ou a janela expirou, criar novo
    if (!existingRecord || now >= existingRecord.resetTime) {
      const newRecord: RateLimitStore = {
        key,
        requests: 1,
        resetTime: now + config.windowMs,
        lastRequest: now
      };

      this.store.set(key, newRecord);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newRecord.resetTime,
        totalHits: 1
      };
    }

    // Incrementar contador de requests
    existingRecord.requests++;
    existingRecord.lastRequest = now;

    const allowed = existingRecord.requests <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - existingRecord.requests);

    // Log se o limite foi atingido
    if (!allowed) {
      StructuredLogger.warn('Rate limit atingido', {
        key,
        requests: existingRecord.requests,
        maxRequests: config.maxRequests,
        windowMs: config.windowMs,
        resetTime: existingRecord.resetTime
      });
    }

    return {
      allowed,
      remaining,
      resetTime: existingRecord.resetTime,
      totalHits: existingRecord.requests
    };
  }

  /**
   * Obter estatísticas de rate limiting
   */
  getStats(): {
    totalKeys: number;
    activeKeys: number;
    topAbusers: Array<{ key: string; requests: number; lastRequest: Date }>;
  } {
    const now = Date.now();
    const activeKeys = Array.from(this.store.values()).filter(record => now < record.resetTime);

    const topAbusers = activeKeys
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10)
      .map(record => ({
        key: record.key,
        requests: record.requests,
        lastRequest: new Date(record.lastRequest)
      }));

    return {
      totalKeys: this.store.size,
      activeKeys: activeKeys.length,
      topAbusers
    };
  }

  /**
   * Limpar registros expirados
   */
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetTime) {
        this.store.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      StructuredLogger.debug('Limpeza de rate limit concluída', {
        removedRecords: removedCount,
        remainingRecords: this.store.size
      });
    }
  }

  /**
   * Configurar limpeza automática
   */
  private setupCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);

    StructuredLogger.info('Limpeza automática de rate limit configurada');
  }

  /**
   * Resetar limite para uma chave específica (uso administrativo)
   */
  resetKey(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) {
      StructuredLogger.info('Rate limit resetado manualmente', { key });
    }
    return deleted;
  }

  /**
   * Listar todas as chaves ativas
   */
  listActiveKeys(): Array<{ key: string; requests: number; resetTime: Date }> {
    const now = Date.now();
    return Array.from(this.store.entries())
      .filter(([, record]) => now < record.resetTime)
      .map(([key, record]) => ({
        key,
        requests: record.requests,
        resetTime: new Date(record.resetTime)
      }));
  }
}

// ====================================================================
// GERADORES DE CHAVE
// ====================================================================

/**
 * Gerador de chave baseado em IP
 */
export function ipKeyGenerator(req: Request): string {
  return `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
}

/**
 * Gerador de chave baseado em usuário
 */
export function userKeyGenerator(req: Request): string {
  const userId = (req as any).user?.id;
  if (userId) {
    return `user:${userId}`;
  }
  return ipKeyGenerator(req);
}

/**
 * Gerador de chave baseado em tenant
 */
export function tenantKeyGenerator(req: Request): string {
  const tenantId = (req as any).user?.tenant_id || (req as any).tenant?.id;
  if (tenantId) {
    return `tenant:${tenantId}`;
  }
  return userKeyGenerator(req);
}

/**
 * Gerador de chave combinado (IP + User Agent)
 */
export function combinedKeyGenerator(req: Request): string {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent')?.substring(0, 50) || 'unknown';
  return `combined:${ip}:${userAgent}`;
}

// ====================================================================
// FACTORY DE MIDDLEWARE
// ====================================================================

export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = RateLimiter.getInstance();

  return (req: Request, res: Response, next: NextFunction) => {
    // Gerar chave para identificar o cliente
    const keyGenerator = config.keyGenerator || ipKeyGenerator;
    const key = keyGenerator(req);

    // Verificar limite
    const result = limiter.checkLimit(key, config);

    // Adicionar headers de rate limit
    res.set({
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      'X-RateLimit-Window': config.windowMs.toString()
    });

    if (!result.allowed) {
      // Request bloqueada por rate limit
      StructuredLogger.warn('Request bloqueada por rate limit', {
        key,
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        totalHits: result.totalHits,
        limit: config.maxRequests
      });

      res.status(429).json({
        success: false,
        error: config.message || 'Muitas requisições',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        details: {
          limit: config.maxRequests,
          windowMs: config.windowMs,
          resetTime: new Date(result.resetTime).toISOString()
        }
      });
      return;
    }

    // Log para requests próximas do limite
    if (result.remaining <= 10) {
      StructuredLogger.info('Request próxima do rate limit', {
        key,
        remaining: result.remaining,
        limit: config.maxRequests,
        url: req.originalUrl
      });
    }

    next();
  };
}

// ====================================================================
// MIDDLEWARES PRÉ-CONFIGURADOS
// ====================================================================

/**
 * Rate limit para APIs de analytics
 */
export const analyticsRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_CONFIGS.analytics,
  keyGenerator: userKeyGenerator
});

/**
 * Rate limit para APIs de autenticação
 */
export const authRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_CONFIGS.auth,
  keyGenerator: combinedKeyGenerator
});

/**
 * Rate limit geral
 */
export const generalRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_CONFIGS.general,
  keyGenerator: ipKeyGenerator
});

/**
 * Rate limit para uploads
 */
export const uploadRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_CONFIGS.upload,
  keyGenerator: userKeyGenerator
});

/**
 * Rate limit para relatórios
 */
export const reportsRateLimit = createRateLimitMiddleware({
  ...RATE_LIMIT_CONFIGS.reports,
  keyGenerator: tenantKeyGenerator
});

// ====================================================================
// ENDPOINT DE ADMINISTRAÇÃO
// ====================================================================

export function createRateLimitAdminEndpoint() {
  const limiter = RateLimiter.getInstance();

  return {
    // Obter estatísticas
    getStats: (req: Request, res: Response) => {
      try {
        const stats = limiter.getStats();
        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        StructuredLogger.error('Erro ao obter estatísticas de rate limit', error as Error);
        res.status(500).json({
          success: false,
          error: 'Erro interno'
        });
      }
    },

    // Listar chaves ativas
    listActive: (req: Request, res: Response) => {
      try {
        const activeKeys = limiter.listActiveKeys();
        res.json({
          success: true,
          data: activeKeys
        });
      } catch (error) {
        StructuredLogger.error('Erro ao listar chaves ativas de rate limit', error as Error);
        res.status(500).json({
          success: false,
          error: 'Erro interno'
        });
      }
    },

    // Resetar chave específica
    resetKey: (req: Request, res: Response) => {
      try {
        const { key } = req.params;
        const success = limiter.resetKey(key);

        if (success) {
          StructuredLogger.info('Chave de rate limit resetada via admin', {
            key,
            adminUser: (req as any).user?.id
          });

          res.json({
            success: true,
            message: 'Chave resetada com sucesso'
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Chave não encontrada'
          });
        }
      } catch (error) {
        StructuredLogger.error('Erro ao resetar chave de rate limit', error as Error);
        res.status(500).json({
          success: false,
          error: 'Erro interno'
        });
      }
    }
  };
}

// ====================================================================
// EXPORTS
// ====================================================================

export { RateLimiter };
export default createRateLimitMiddleware;