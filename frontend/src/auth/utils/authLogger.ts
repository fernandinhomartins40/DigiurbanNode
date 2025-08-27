// ====================================================================
// 📊 SISTEMA DE MONITORAMENTO - AUTH2
// ====================================================================
// Logging estruturado e métricas de performance
// Sistema simples para monitorar o AUTH2
// ====================================================================

import type { AuthLogger } from "@/auth/types/auth.types";
import { PERFORMANCE_CONFIG } from '../config/authConfig';

// ====================================================================
// MÉTRICAS EM MEMÓRIA
// ====================================================================

interface AuthMetrics {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  totalLogouts: number;
  averageLoginTime: number;
  cacheHitRate: number;
  lastError: string | null;
  lastErrorTime: number | null;
}

let metrics: AuthMetrics = {
  totalLogins: 0,
  successfulLogins: 0,
  failedLogins: 0,
  totalLogouts: 0,
  averageLoginTime: 0,
  cacheHitRate: 0,
  lastError: null,
  lastErrorTime: null
};

const loginTimes: number[] = [];
const MAX_LOGIN_TIMES = 100; // Manter apenas as últimas 100

// ====================================================================
// LOGGER PRINCIPAL
// ====================================================================

export const authLogger: AuthLogger = {
  /**
   * Log de login bem-sucedido
   */
  login: (userId: string, duration: number): void => {
    metrics.totalLogins++;
    metrics.successfulLogins++;
    
    // Atualizar tempo médio
    loginTimes.push(duration);
    if (loginTimes.length > MAX_LOGIN_TIMES) {
      loginTimes.shift();
    }
    
    metrics.averageLoginTime = loginTimes.reduce((a, b) => a + b, 0) / loginTimes.length;
    
    // Log estruturado
    const logData = {
      event: 'AUTH2_LOGIN_SUCCESS',
      userId,
      duration,
      timestamp: Date.now(),
      withinTarget: duration < PERFORMANCE_CONFIG.TARGET_LOGIN_TIME
    };
    
    if (PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_LOGS) {
      console.log('✅ [AUTH2]', logData);
    }
    
    // Alerta se login lento
    if (duration > PERFORMANCE_CONFIG.SLOW_OPERATION_THRESHOLD) {
      console.warn(`🐌 [AUTH2] Login lento: ${duration}ms (meta: ${PERFORMANCE_CONFIG.TARGET_LOGIN_TIME}ms)`);
    }
  },

  /**
   * Log de logout
   */
  logout: (userId: string): void => {
    metrics.totalLogouts++;
    
    const logData = {
      event: 'AUTH2_LOGOUT',
      userId,
      timestamp: Date.now()
    };
    
    if (PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_LOGS) {
      console.log('🚪 [AUTH2]', logData);
    }
  },

  /**
   * Log de erro
   */
  error: (error: string, context: object): void => {
    metrics.failedLogins++;
    metrics.lastError = error;
    metrics.lastErrorTime = Date.now();
    
    const logData = {
      event: 'AUTH2_ERROR',
      error,
      context,
      timestamp: Date.now()
    };
    
    console.error('❌ [AUTH2]', logData);
  },

  /**
   * Log de performance geral
   */
  performance: (action: string, duration: number): void => {
    const logData = {
      event: 'AUTH2_PERFORMANCE',
      action,
      duration,
      timestamp: Date.now(),
      isSlow: duration > PERFORMANCE_CONFIG.SLOW_OPERATION_THRESHOLD
    };
    
    if (PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_LOGS) {
      console.log('⚡ [AUTH2]', logData);
    }
    
    if (logData.isSlow && PERFORMANCE_CONFIG.LOG_SLOW_OPERATIONS) {
      console.warn(`🐌 [AUTH2] Operação lenta: ${action} - ${duration}ms`);
    }
  }
};

// ====================================================================
// MÉTRICAS E RELATÓRIOS
// ====================================================================

export const AuthMetrics = {
  /**
   * Obter métricas atuais
   */
  getMetrics: (): AuthMetrics => {
    return { ...metrics };
  },

  /**
   * Taxa de sucesso de login
   */
  getSuccessRate: (): number => {
    if (metrics.totalLogins === 0) return 100;
    return (metrics.successfulLogins / metrics.totalLogins) * 100;
  },

  /**
   * Verificar se performance está dentro da meta
   */
  isPerformanceHealthy: (): boolean => {
    const successRate = AuthMetrics.getSuccessRate();
    const avgTime = metrics.averageLoginTime;
    
    return successRate >= 95 && avgTime < PERFORMANCE_CONFIG.TARGET_LOGIN_TIME;
  },

  /**
   * Relatório resumido
   */
  getSummaryReport: (): object => {
    const successRate = AuthMetrics.getSuccessRate();
    const isHealthy = AuthMetrics.isPerformanceHealthy();
    
    return {
      status: isHealthy ? 'HEALTHY' : 'NEEDS_ATTENTION',
      metrics: {
        totalLogins: metrics.totalLogins,
        successRate: Math.round(successRate * 100) / 100,
        averageLoginTime: Math.round(metrics.averageLoginTime),
        cacheHitRate: Math.round(metrics.cacheHitRate * 100) / 100,
        lastError: metrics.lastError,
        timeSinceLastError: metrics.lastErrorTime 
          ? Date.now() - metrics.lastErrorTime 
          : null
      },
      targets: {
        targetLoginTime: PERFORMANCE_CONFIG.TARGET_LOGIN_TIME,
        targetCacheHitRate: PERFORMANCE_CONFIG.TARGET_CACHE_HIT_RATE,
        withinTargets: {
          loginTime: metrics.averageLoginTime < PERFORMANCE_CONFIG.TARGET_LOGIN_TIME,
          successRate: successRate >= 95
        }
      },
      timestamp: Date.now()
    };
  },

  /**
   * Resetar métricas
   */
  reset: (): void => {
    metrics = {
      totalLogins: 0,
      successfulLogins: 0,
      failedLogins: 0,
      totalLogouts: 0,
      averageLoginTime: 0,
      cacheHitRate: 0,
      lastError: null,
      lastErrorTime: null
    };
    loginTimes.length = 0;
    
    console.log('🔄 [AUTH2] Métricas resetadas');
  },

  /**
   * Atualizar cache hit rate
   */
  updateCacheHitRate: (hitRate: number): void => {
    metrics.cacheHitRate = hitRate;
  }
};

// ====================================================================
// HELPER PARA DEBUGGING
// ====================================================================

export const AuthDebug = {
  /**
   * Log detalhado do estado atual
   */
  logCurrentState: (authState: any): void => {
    if (!PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_LOGS) return;
    
    console.group('🔍 [AUTH2] Estado Atual');
    console.log('User:', authState.user?.id || 'Não autenticado');
    console.log('Profile:', authState.profile?.name || 'Não carregado');
    console.log('Tenant:', authState.tenant?.name || 'Não carregado');
    console.log('Loading:', authState.isLoading);
    console.log('Error:', authState.error || 'Nenhum');
    console.log('Métricas:', AuthMetrics.getSummaryReport());
    console.groupEnd();
  },

  /**
   * Verificar integridade do sistema
   */
  healthCheck: (): object => {
    const report = AuthMetrics.getSummaryReport();
    const cacheStats = { hitRate: metrics.cacheHitRate }; // Seria obtido do cache real
    
    return {
      overall: AuthMetrics.isPerformanceHealthy() ? 'HEALTHY' : 'DEGRADED',
      components: {
        authentication: metrics.totalLogins > 0 ? 'ACTIVE' : 'UNUSED',
        performance: metrics.averageLoginTime < PERFORMANCE_CONFIG.TARGET_LOGIN_TIME ? 'GOOD' : 'SLOW',
        cache: cacheStats.hitRate > PERFORMANCE_CONFIG.TARGET_CACHE_HIT_RATE ? 'EFFICIENT' : 'INEFFICIENT',
        errors: metrics.lastErrorTime && (Date.now() - metrics.lastErrorTime) < 300000 ? 'RECENT_ERRORS' : 'STABLE'
      },
      recommendations: AuthDebug.getRecommendations(),
      report
    };
  },

  /**
   * Recomendações baseadas nas métricas
   */
  getRecommendations: (): string[] => {
    const recommendations: string[] = [];
    
    if (metrics.averageLoginTime > PERFORMANCE_CONFIG.TARGET_LOGIN_TIME) {
      recommendations.push('Otimizar tempo de login - atual: ' + Math.round(metrics.averageLoginTime) + 'ms');
    }
    
    if (AuthMetrics.getSuccessRate() < 95) {
      recommendations.push('Investigar falhas de login - taxa de sucesso: ' + Math.round(AuthMetrics.getSuccessRate()) + '%');
    }
    
    if (metrics.cacheHitRate < PERFORMANCE_CONFIG.TARGET_CACHE_HIT_RATE) {
      recommendations.push('Melhorar eficiência do cache - hit rate: ' + Math.round(metrics.cacheHitRate) + '%');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Sistema operando dentro das metas 🎉');
    }
    
    return recommendations;
  }
};

// ====================================================================
// EXPOSIÇÃO GLOBAL PARA DEBUGGING (APENAS DEV)
// ====================================================================

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).AUTH2_DEBUG = {
    metrics: AuthMetrics,
    debug: AuthDebug,
    logger: authLogger
  };
  
  console.log('🛠️ [AUTH2] Debug tools disponíveis em window.AUTH2_DEBUG');
}

export default authLogger;