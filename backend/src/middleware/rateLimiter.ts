// ====================================================================
// 🚦 RATE LIMITER MIDDLEWARE - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Sistema avançado de rate limiting com diferentes estratégias
// Controle por IP, usuário e endpoint específico
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { RATE_LIMITS } from '../config/auth.js';
import { ActivityService } from '../services/ActivityService.js';

// ====================================================================
// INTERFACES
// ====================================================================

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    firstRequest: number;
  };
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
}

// ====================================================================
// ARMAZENAMENTO EM MEMÓRIA
// ====================================================================

class MemoryStore {
  private store: RateLimitStore = {};

  get(key: string): { count: number; resetTime: number; firstRequest: number } | undefined {
    return this.store[key];
  }

  set(key: string, value: { count: number; resetTime: number; firstRequest: number }): void {
    this.store[key] = value;
  }

  increment(key: string): number {
    if (!this.store[key]) {
      const now = Date.now();
      this.store[key] = {
        count: 1,
        resetTime: now + RATE_LIMITS.GENERAL.windowMs,
        firstRequest: now
      };
      return 1;
    }

    this.store[key].count++;
    return this.store[key].count;
  }

  reset(key: string): void {
    delete this.store[key];
  }

  cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }
}

// ====================================================================
// INSTÂNCIA GLOBAL DO STORE
// ====================================================================

const memoryStore = new MemoryStore();

// Limpeza automática a cada 5 minutos
setInterval(() => {
  memoryStore.cleanup();
}, 5 * 60 * 1000);

// ====================================================================
// GERADOR DE CHAVES
// ====================================================================

const defaultKeyGenerator = (req: Request): string => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

const userKeyGenerator = (req: Request): string => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  return defaultKeyGenerator(req);
};

const endpointKeyGenerator = (req: Request): string => {
  const baseKey = req.user?.id ? `user:${req.user.id}` : defaultKeyGenerator(req);
  return `${baseKey}:${req.method}:${req.route?.path || req.path}`;
};

// ====================================================================
// FUNÇÃO PRINCIPAL DE RATE LIMITING
// ====================================================================

function createRateLimit(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = config.keyGenerator ? config.keyGenerator(req) : defaultKeyGenerator(req);
      const now = Date.now();
      
      let record = memoryStore.get(key);
      
      // Se não existe registro ou janela expirou, criar novo
      if (!record || now > record.resetTime) {
        record = {
          count: 0,
          resetTime: now + config.windowMs,
          firstRequest: now
        };
        memoryStore.set(key, record);
      }

      // Incrementar contador
      record.count++;
      
      // Headers informativos
      res.set({
        'X-RateLimit-Limit': config.max.toString(),
        'X-RateLimit-Remaining': Math.max(0, config.max - record.count).toString(),
        'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
      });

      // Verificar se excedeu limite
      if (record.count > config.max) {
        // Log da atividade de rate limit
        await ActivityService.log({
          user_id: req.user?.id,
          tenant_id: req.user?.tenant_id,
          action: 'rate_limit_exceeded',
          resource: 'security',
          details: JSON.stringify({
            endpoint: req.path,
            method: req.method,
            limit: config.max,
            window_ms: config.windowMs,
            key: key.startsWith('user:') ? key : '[IP_HIDDEN]',
            attempts: record.count
          }),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });

        // Handler customizado ou resposta padrão
        if (config.handler) {
          config.handler(req, res);
          return;
        }

        res.status(429).json({
          success: false,
          error: config.message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
          limit: config.max,
          remaining: 0,
          resetTime: new Date(record.resetTime).toISOString()
        });
        return;
      }

      next();

    } catch (error) {
      console.error('Erro no rate limiter:', error);
      // Em caso de erro, permitir requisição (fail open)
      next();
    }
  };
}

// ====================================================================
// MIDDLEWARE PRÉ-CONFIGURADOS
// ====================================================================

/**
 * Rate limit geral para todas as rotas
 */
export const generalRateLimit = createRateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  message: RATE_LIMITS.GENERAL.message,
  keyGenerator: defaultKeyGenerator
});

/**
 * Rate limit para login
 */
export const loginRateLimit = createRateLimit({
  windowMs: RATE_LIMITS.LOGIN.windowMs,
  max: RATE_LIMITS.LOGIN.max,
  message: RATE_LIMITS.LOGIN.message,
  skipSuccessfulRequests: RATE_LIMITS.LOGIN.skipSuccessfulRequests,
  keyGenerator: defaultKeyGenerator
});

/**
 * Rate limit para registro
 */
export const registerRateLimit = createRateLimit({
  windowMs: RATE_LIMITS.REGISTER.windowMs,
  max: RATE_LIMITS.REGISTER.max,
  message: RATE_LIMITS.REGISTER.message,
  keyGenerator: defaultKeyGenerator
});

/**
 * Rate limit para reset de senha
 */
export const passwordResetRateLimit = createRateLimit({
  windowMs: RATE_LIMITS.PASSWORD_RESET.windowMs,
  max: RATE_LIMITS.PASSWORD_RESET.max,
  message: RATE_LIMITS.PASSWORD_RESET.message,
  keyGenerator: defaultKeyGenerator
});

/**
 * Rate limit para APIs
 */
export const apiRateLimit = createRateLimit({
  windowMs: RATE_LIMITS.API.windowMs,
  max: RATE_LIMITS.API.max,
  message: RATE_LIMITS.API.message,
  keyGenerator: userKeyGenerator
});

// ====================================================================
// RATE LIMITS ESPECIALIZADOS
// ====================================================================

/**
 * Rate limit rigoroso para operações sensíveis
 */
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 3,
  message: 'Muitas tentativas para operação sensível. Tente novamente em 1 minuto.',
  keyGenerator: userKeyGenerator
});

/**
 * Rate limit flexível para usuários autenticados
 */
export const authenticatedRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500,
  message: 'Limite de requisições excedido. Tente novamente em 15 minutos.',
  keyGenerator: userKeyGenerator
});

/**
 * Rate limit por endpoint específico
 */
export const endpointRateLimit = (max: number, windowMs: number = 60 * 1000) => {
  return createRateLimit({
    windowMs,
    max,
    message: `Muitas requisições para este endpoint. Limite: ${max} por ${windowMs / 1000} segundos.`,
    keyGenerator: endpointKeyGenerator
  });
};

// ====================================================================
// MIDDLEWARE DINÂMICO
// ====================================================================

/**
 * Rate limit adaptativo baseado no tipo de usuário
 */
export const adaptiveRateLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let config: RateLimitConfig;

  if (!req.user) {
    // Usuário não autenticado - limite mais restritivo
    config = {
      windowMs: 15 * 60 * 1000,
      max: 50,
      message: 'Limite de requisições para usuários não autenticados excedido',
      keyGenerator: defaultKeyGenerator
    };
  } else {
    // Ajustar limite baseado no role do usuário
    const roleMultipliers = {
      'guest': 1,
      'user': 2,
      'coordinator': 3,
      'manager': 4,
      'admin': 5,
      'super_admin': 10
    };

    const multiplier = roleMultipliers[req.user.role] || 1;
    const baseLimit = 100;

    config = {
      windowMs: 15 * 60 * 1000,
      max: baseLimit * multiplier,
      message: `Limite de requisições excedido para o perfil ${req.user.role}`,
      keyGenerator: userKeyGenerator
    };
  }

  const rateLimiter = createRateLimit(config);
  return rateLimiter(req, res, next);
};

// ====================================================================
// BYPASS E WHITELIST
// ====================================================================

/**
 * Middleware para bypass de rate limiting para IPs/usuários específicos
 */
export const rateLimitBypass = (bypassed: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress;
    const userId = req.user?.id;

    // Verificar se IP está na whitelist
    if (ip && bypassed.includes(ip)) {
      next();
      return;
    }

    // Verificar se usuário está na whitelist
    if (userId && bypassed.includes(userId)) {
      next();
      return;
    }

    // Super admins sempre têm bypass
    if (req.user?.role === 'super_admin') {
      next();
      return;
    }

    next();
  };
};

// ====================================================================
// UTILIDADES
// ====================================================================

/**
 * Obter estatísticas do rate limiter
 */
export const getRateLimitStats = (): {
  totalKeys: number;
  activeWindows: number;
  topKeys: Array<{ key: string; count: number; resetTime: string }>;
} => {
  const store = (memoryStore as any).store;
  const keys = Object.keys(store);
  const now = Date.now();
  
  const activeWindows = keys.filter(key => store[key].resetTime > now);
  
  const topKeys = keys
    .map(key => ({
      key: key.startsWith('user:') ? key : '[IP_HIDDEN]',
      count: store[key].count,
      resetTime: new Date(store[key].resetTime).toISOString()
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalKeys: keys.length,
    activeWindows: activeWindows.length,
    topKeys
  };
};

/**
 * Limpar rate limits de um usuário/IP específico
 */
export const clearRateLimit = (key: string): boolean => {
  try {
    memoryStore.reset(key);
    return true;
  } catch {
    return false;
  }
};

/**
 * Limpar todos os rate limits
 */
export const clearAllRateLimits = (): void => {
  (memoryStore as any).store = {};
};

// ====================================================================
// EXPORTAÇÕES
// ====================================================================

export default {
  // Middleware principais
  generalRateLimit,
  loginRateLimit,
  registerRateLimit,
  passwordResetRateLimit,
  apiRateLimit,
  
  // Middleware especializados
  strictRateLimit,
  authenticatedRateLimit,
  adaptiveRateLimit,
  endpointRateLimit,
  rateLimitBypass,
  
  // Utilitários
  getRateLimitStats,
  clearRateLimit,
  clearAllRateLimits,
  
  // Função factory
  createRateLimit
};