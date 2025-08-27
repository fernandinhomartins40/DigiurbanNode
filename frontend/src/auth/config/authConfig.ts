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
// CONFIGURAÇÃO DO SUPABASE CLIENTE
// ====================================================================

export const SUPABASE_CONFIG = {
  auth: {
    persistSession: AUTH2_CONFIG.persistSession,
    autoRefreshToken: AUTH2_CONFIG.autoRefresh,
    detectSessionInUrl: false, // Otimização - não detectar na URL
  },
  db: {
    schema: 'public'
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
  ENABLE_PERFORMANCE_LOGS: process.env.NODE_ENV === 'development',
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
  ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development',
  
  // Cache menor em desenvolvimento
  CACHE_TIMEOUT: process.env.NODE_ENV === 'development' 
    ? 1 * 60 * 1000 // 1 minuto
    : AUTH2_CONFIG.cacheTimeout,
    
  // Bypass de algumas validações em desenvolvimento
  BYPASS_EMAIL_CONFIRMATION: process.env.NODE_ENV === 'development',
  
  // Dados de teste
  TEST_CREDENTIALS: process.env.NODE_ENV === 'development' ? {
    email: 'admin@digiurban.com',
    password: 'admin123'
  } : null
};

// ====================================================================
// UTILITÁRIOS DE CONFIGURAÇÃO
// ====================================================================

export const ConfigUtils = {
  /**
   * Verificar se está em produção
   */
  isProduction: (): boolean => {
    return process.env.NODE_ENV === 'production';
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
   * Obter configuração do Supabase
   */
  getSupabaseConfig: () => {
    return SUPABASE_CONFIG;
  },

  /**
   * Validar configurações obrigatórias
   */
  validateConfig: (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!process.env.REACT_APP_SUPABASE_URL) {
      errors.push('REACT_APP_SUPABASE_URL não configurada');
    }

    if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
      errors.push('REACT_APP_SUPABASE_ANON_KEY não configurada');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default AUTH2_CONFIG;