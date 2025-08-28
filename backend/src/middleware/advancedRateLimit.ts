// ====================================================================
// 🛡️ ADVANCED RATE LIMITING - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Rate limiting inteligente com detecção de ataques
// Múltiplas estratégias e whitelist automática
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

interface RateLimitConfig {
  points: number;        // Número de requests permitidos
  duration: number;      // Janela de tempo em segundos
  blockDuration: number; // Tempo de bloqueio em segundos
  execEvenly?: boolean;  // Distribuir requests uniformemente
}

interface AttackPattern {
  suspiciousIPs: Set<string>;
  failedAttempts: Map<string, number>;
  lastAttempt: Map<string, number>;
}

// ====================================================================
// CONFIGURAÇÕES
// ====================================================================

const RATE_LIMIT_CONFIGS = {
  // Rate limit geral para API
  GENERAL: {
    points: 100,           // 100 requests
    duration: 60,          // por minuto
    blockDuration: 300     // bloqueio de 5 minutos
  } as RateLimitConfig,

  // Rate limit específico para login (aumentado para testes)
  LOGIN: {
    points: 50,            // 50 tentativas
    duration: 300,         // em 5 minutos
    blockDuration: 60,     // bloqueio de 1 minuto
    execEvenly: true
  } as RateLimitConfig,

  // Rate limit para registro
  REGISTER: {
    points: 3,             // 3 registros
    duration: 3600,        // por hora
    blockDuration: 3600    // bloqueio de 1 hora
  } as RateLimitConfig,

  // Rate limit para refresh token
  REFRESH: {
    points: 10,            // 10 refreshes
    duration: 600,         // em 10 minutos
    blockDuration: 1800    // bloqueio de 30 minutos
  } as RateLimitConfig,

  // Rate limit rigoroso para operações críticas
  CRITICAL: {
    points: 2,             // 2 tentativas
    duration: 3600,        // por hora
    blockDuration: 7200    // bloqueio de 2 horas
  } as RateLimitConfig
} as const;

// IPs confiáveis (whitelist)
const TRUSTED_IPS = new Set([
  '127.0.0.1',
  '::1',
  'localhost'
]);

// ====================================================================
// CLASSE PRINCIPAL
// ====================================================================

class AdvancedRateLimit {
  private limiters: Map<string, RateLimiterMemory> = new Map();
  private attackPatterns: AttackPattern = {
    suspiciousIPs: new Set(),
    failedAttempts: new Map(),
    lastAttempt: new Map()
  };
  
  private bruteForceDetector = new RateLimiterMemory({
    points: 10,            // 10 tentativas falhadas
    duration: 900,         // em 15 minutos
    blockDuration: 3600    // bloquear por 1 hora
  });

  constructor() {
    this.initializeLimiters();
    this.startCleanupTask();
  }

  /**
   * Inicializar limitadores
   */
  private initializeLimiters(): void {
    Object.entries(RATE_LIMIT_CONFIGS).forEach(([key, config]) => {
      this.limiters.set(key.toLowerCase(), new RateLimiterMemory({
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration,
        execEvenly: config.execEvenly || false
      }));
    });
  }

  /**
   * Middleware factory para rate limiting
   */
  createLimiter(type: keyof typeof RATE_LIMIT_CONFIGS, options?: {
    skipTrusted?: boolean;
    customKey?: (req: Request) => string;
    onLimitReached?: (req: Request, res: Response) => void;
  }) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ip = this.getClientIP(req);
        const limiter = this.limiters.get(type.toLowerCase());
        
        if (!limiter) {
          console.error(`❌ [RATE-LIMIT] Limiter não encontrado: ${type}`);
          return next();
        }

        // Verificar whitelist
        if (options?.skipTrusted && this.isTrustedIP(ip)) {
          console.log(`✅ [RATE-LIMIT] IP confiável permitido: ${ip}`);
          return next();
        }

        // Chave personalizada ou usar IP
        const key = options?.customKey ? options.customKey(req) : ip;

        // Verificar se IP está em lista de suspeitos
        if (this.attackPatterns.suspiciousIPs.has(ip)) {
          console.log(`🚫 [RATE-LIMIT] IP suspeito bloqueado: ${ip}`);
          return this.sendRateLimitResponse(res, {
            message: 'IP temporariamente bloqueado por atividade suspeita',
            retryAfter: 3600
          });
        }

        // Aplicar rate limit
        const result = await limiter.consume(key);
        
        // Adicionar headers informativos
        res.set({
          'X-RateLimit-Limit': RATE_LIMIT_CONFIGS[type].points.toString(),
          'X-RateLimit-Remaining': result.remainingPoints?.toString() || '0',
          'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext).toISOString()
        });

        console.log(`✅ [RATE-LIMIT] ${type}: ${key} (${result.remainingPoints} restantes)`);
        next();

      } catch (rateLimitError: any) {
        const ip = this.getClientIP(req);
        
        // Registrar tentativa bloqueada
        this.recordFailedAttempt(ip, type);
        
        console.log(`🚫 [RATE-LIMIT] ${type}: ${ip} bloqueado (${rateLimitError.msBeforeNext}ms)`);
        
        // Callback personalizado
        if (options?.onLimitReached) {
          options.onLimitReached(req, res);
          return;
        }

        // Response padrão
        this.sendRateLimitResponse(res, {
          message: 'Muitas tentativas. Tente novamente mais tarde.',
          retryAfter: Math.ceil(rateLimitError.msBeforeNext / 1000),
          type
        });
      }
    };
  }

  /**
   * Middleware específico para detecção de ataques de força bruta
   */
  bruteForceProtection() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ip = this.getClientIP(req);
        
        // Verificar detector de força bruta
        await this.bruteForceDetector.consume(ip);
        next();
        
      } catch (error: any) {
        const ip = this.getClientIP(req);
        
        // Marcar IP como suspeito
        this.attackPatterns.suspiciousIPs.add(ip);
        
        console.log(`🚨 [SECURITY] Possível ataque de força bruta detectado: ${ip}`);
        
        // Log de segurança detalhado
        this.logSecurityEvent({
          type: 'BRUTE_FORCE_DETECTED',
          ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.path,
          timestamp: new Date().toISOString()
        });

        this.sendRateLimitResponse(res, {
          message: 'Atividade suspeita detectada. Acesso temporariamente bloqueado.',
          retryAfter: Math.ceil(error.msBeforeNext / 1000)
        });
      }
    };
  }

  /**
   * Middleware para login com proteção especial
   */
  loginProtection() {
    return [
      this.bruteForceProtection(),
      this.createLimiter('LOGIN', {
        skipTrusted: true,
        onLimitReached: (req, res) => {
          const ip = this.getClientIP(req);
          
          // Log de tentativa suspeita
          this.logSecurityEvent({
            type: 'LOGIN_RATE_LIMITED',
            ip,
            email: req.body?.email,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
          });
        }
      })
    ];
  }

  /**
   * Registrar tentativa falhada
   */
  private recordFailedAttempt(ip: string, type: string): void {
    const key = `${ip}:${type}`;
    const current = this.attackPatterns.failedAttempts.get(key) || 0;
    
    this.attackPatterns.failedAttempts.set(key, current + 1);
    this.attackPatterns.lastAttempt.set(key, Date.now());
    
    // Marcar como suspeito após muitas tentativas
    if (current >= 5) {
      this.attackPatterns.suspiciousIPs.add(ip);
      console.log(`🚨 [SECURITY] IP marcado como suspeito após ${current + 1} tentativas: ${ip}`);
    }
  }

  /**
   * Obter IP real do cliente
   */
  private getClientIP(req: Request): string {
    return (
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Verificar se IP é confiável
   */
  private isTrustedIP(ip: string): boolean {
    return TRUSTED_IPS.has(ip);
  }

  /**
   * Enviar response de rate limit
   */
  private sendRateLimitResponse(res: Response, options: {
    message: string;
    retryAfter: number;
    type?: string;
  }): void {
    res.set({
      'Retry-After': options.retryAfter.toString(),
      'X-RateLimit-Blocked': 'true'
    });

    res.status(429).json({
      success: false,
      error: options.message,
      retryAfter: options.retryAfter,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log de evento de segurança
   */
  private logSecurityEvent(event: any): void {
    console.log('🛡️ [SECURITY-LOG]', JSON.stringify(event, null, 2));
    
    // Aqui você pode integrar com sistema de logging externo
    // como Sentry, LogRocket, etc.
  }

  /**
   * Remover IP da lista de suspeitos
   */
  whitelistIP(ip: string): void {
    this.attackPatterns.suspiciousIPs.delete(ip);
    this.attackPatterns.failedAttempts.delete(ip);
    this.attackPatterns.lastAttempt.delete(ip);
    console.log(`✅ [RATE-LIMIT] IP removido da lista de suspeitos: ${ip}`);
  }

  /**
   * Obter estatísticas
   */
  getStats(): {
    suspiciousIPs: number;
    totalFailedAttempts: number;
    recentAttempts: number;
  } {
    const now = Date.now();
    const recentThreshold = 30 * 60 * 1000; // 30 minutos
    
    let recentAttempts = 0;
    this.attackPatterns.lastAttempt.forEach(timestamp => {
      if (now - timestamp < recentThreshold) {
        recentAttempts++;
      }
    });

    return {
      suspiciousIPs: this.attackPatterns.suspiciousIPs.size,
      totalFailedAttempts: this.attackPatterns.failedAttempts.size,
      recentAttempts
    };
  }

  /**
   * Tarefa de limpeza automática
   */
  private startCleanupTask(): void {
    // Executar limpeza a cada hora
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Limpeza de dados antigos
   */
  private cleanup(): void {
    const now = Date.now();
    const cleanupThreshold = 24 * 60 * 60 * 1000; // 24 horas
    
    let cleaned = 0;
    
    // Limpar tentativas antigas
    this.attackPatterns.lastAttempt.forEach((timestamp, key) => {
      if (now - timestamp > cleanupThreshold) {
        this.attackPatterns.lastAttempt.delete(key);
        this.attackPatterns.failedAttempts.delete(key);
        
        // Remover IP suspeito se não teve atividade recente
        const ip = key.split(':')[0];
        let hasRecentActivity = false;
        
        this.attackPatterns.lastAttempt.forEach((ts, k) => {
          if (k.startsWith(ip) && now - ts < cleanupThreshold) {
            hasRecentActivity = true;
          }
        });
        
        if (!hasRecentActivity) {
          this.attackPatterns.suspiciousIPs.delete(ip);
        }
        
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      console.log(`🧹 [RATE-LIMIT] Cleanup: removidos ${cleaned} registros antigos`);
    }
  }
}

// ====================================================================
// INSTÂNCIA GLOBAL E EXPORTS
// ====================================================================

export const advancedRateLimit = new AdvancedRateLimit();

// Middleware exports for convenience
export const generalRateLimit = advancedRateLimit.createLimiter('GENERAL', { skipTrusted: true });
export const loginRateLimit = advancedRateLimit.loginProtection();
export const registerRateLimit = advancedRateLimit.createLimiter('REGISTER', { skipTrusted: true });
export const refreshRateLimit = advancedRateLimit.createLimiter('REFRESH', { skipTrusted: true });
export const criticalRateLimit = advancedRateLimit.createLimiter('CRITICAL');

export default advancedRateLimit;