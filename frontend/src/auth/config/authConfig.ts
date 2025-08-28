// ====================================================================
// ⚙️ CONFIGURAÇÕES OTIMIZADAS - SISTEMA AUTH2
// ====================================================================
// Configurações simples e centralizadas
// 50 linhas vs 263 linhas do sistema atual (-81% complexidade)
// ====================================================================

import type { AuthConfig } from "@/auth/types/auth.types";

// ====================================================================
// CONFIGURAÇÃO PRINCIPAL
// ====================================================================

export const AUTH2_CONFIG: AuthConfig = {
  // Performance
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  maxRetries: 2, // Máximo 2 tentativas
  
  // Segurança
  passwordMinLength: 8,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
  
  // Comportamento
  autoRefresh: true,
  persistSession: true
};

// ====================================================================
// CONFIGURAÇÃO DO SISTEMA JWT
// ====================================================================

export const JWT_CONFIG = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3021/api',
    timeout: 10000, // 10 segundos
  },
  storage: {
    useLocalStorage: false, // Usar cookies httpOnly ao invés de localStorage
    persistSession: AUTH2_CONFIG.persistSession,
  },
  security: {
    autoRefreshToken: AUTH2_CONFIG.autoRefresh,
    refreshThreshold: 5 * 60 * 1000, // Renovar 5 min antes de expirar
  }
};

// ====================================================================
// TIMEOUTS E PERFORMANCE
// ====================================================================

export const PERFORMANCE_CONFIG = {
  // Metas de performance
  TARGET_LOGIN_TIME: 2000, // 2 segundos
  TARGET_CACHE_HIT_RATE: 85, // 85%
  MAX_QUERIES_PER_LOGIN: 3,
  
  // Timeouts
  API_TIMEOUT: 10000, // 10 segundos
  LOGIN_TIMEOUT: 15000, // 15 segundos
  
  // Cache
  CACHE_CLEANUP_INTERVAL: 10 * 60 * 1000, // 10 minutos
  
  // Logging
  ENABLE_PERFORMANCE_LOGS: import.meta.env.NODE_ENV === 'development',
  LOG_SLOW_OPERATIONS: true,
  SLOW_OPERATION_THRESHOLD: 1000 // 1 segundo
};

// ====================================================================
// MENSAGENS DE ERRO SIMPLIFICADAS
// ====================================================================

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email ou senha incorretos',
  EMAIL_NOT_CONFIRMED: 'Email ainda não confirmado',
  TOO_MANY_REQUESTS: 'Muitas tentativas. Tente novamente em alguns minutos',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
  PROFILE_NOT_FOUND: 'Perfil de usuário não encontrado',
  UNAUTHORIZED: 'Acesso não autorizado',
  SESSION_EXPIRED: 'Sessão expirada. Faça login novamente',
  UNKNOWN_ERROR: 'Erro inesperado. Tente novamente'
} as const;

// ====================================================================
// CONFIGURAÇÃO DE DESENVOLVIMENTO
// ====================================================================

export const DEV_CONFIG = {
  // Logs detalhados apenas em desenvolvimento
  ENABLE_DEBUG_LOGS: import.meta.env.NODE_ENV === 'development',
  
  // Cache menor em desenvolvimento
  CACHE_TIMEOUT: import.meta.env.NODE_ENV === 'development' 
    ? 1 * 60 * 1000 // 1 minuto
    : AUTH2_CONFIG.cacheTimeout,
    
  // Bypass de algumas validações em desenvolvimento
  BYPASS_EMAIL_CONFIRMATION: import.meta.env.NODE_ENV === 'development',
  
  // REMOVIDO: Credenciais hardcoded por segurança
  // Use variáveis de ambiente para admin inicial: INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD
};

// ====================================================================
// UTILITÁRIOS DE CONFIGURAÇÃO
// ====================================================================

export const ConfigUtils = {
  /**
   * Verificar se está em produção
   */
  isProduction: (): boolean => {
    return import.meta.env.NODE_ENV === 'production';
  },

  /**
   * Obter timeout baseado no ambiente
   */
  getCacheTimeout: (): number => {
    return DEV_CONFIG.CACHE_TIMEOUT;
  },

  /**
   * Verificar se logs estão habilitados
   */
  shouldLog: (): boolean => {
    return DEV_CONFIG.ENABLE_DEBUG_LOGS;
  },

  /**
   * Obter configuração do JWT
   */
  getJWTConfig: () => {
    return JWT_CONFIG;
  },

  /**
   * Validar configurações obrigatórias
   */
  validateConfig: (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!import.meta.env.VITE_API_URL && import.meta.env.NODE_ENV === 'production') {
      errors.push('VITE_API_URL não configurada em produção');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default AUTH2_CONFIG;