// ====================================================================
// 🔐 AUTH CONFIG - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Configurações centralizadas de autenticação e JWT
// Segurança, timeouts e constantes do sistema
// ====================================================================

// ====================================================================
// CONFIGURAÇÕES DE JWT
// ====================================================================

export const AUTH_CONFIG = {
  // Segredos e chaves - NEVER USE DEFAULT IN PRODUCTION
  JWT_SECRET: process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('🚨 ERRO CRÍTICO: JWT_SECRET deve ser definido em produção!');
    }
    return 'dev-jwt-secret-for-development-only';
  })(),
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('🚨 ERRO CRÍTICO: JWT_REFRESH_SECRET deve ser definido em produção!');
    }
    return 'dev-refresh-secret-for-development-only';
  })(),
  
  // Expiração de tokens
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  ACTIVATION_TOKEN_EXPIRES_IN: process.env.ACTIVATION_TOKEN_EXPIRES_IN || '24h',
  PASSWORD_RESET_TOKEN_EXPIRES_IN: process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || '1h',
  
  // Configurações de senha - SEGURANÇA MANTIDA
  PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
  PASSWORD_REQUIRE_UPPERCASE: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
  PASSWORD_REQUIRE_LOWERCASE: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
  PASSWORD_REQUIRE_NUMBERS: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
  PASSWORD_REQUIRE_SPECIAL: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
  
  // Controle de tentativas de login
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  LOCKOUT_DURATION: parseInt(process.env.LOCKOUT_DURATION || '900000'), // 15 minutos em ms
  
  // Sessões
  SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT || '86400000'), // 24 horas em ms
  CONCURRENT_SESSIONS_LIMIT: parseInt(process.env.CONCURRENT_SESSIONS_LIMIT || '3'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutos
  RATE_LIMIT_MAX_ATTEMPTS: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '10'),
  
  // Outros
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  TOKEN_CLEANUP_INTERVAL: parseInt(process.env.TOKEN_CLEANUP_INTERVAL || '3600000'), // 1 hora
} as const;

// ====================================================================
// CONFIGURAÇÕES DE COOKIES
// ====================================================================

export const COOKIE_CONFIG = {
  REFRESH_TOKEN_COOKIE: 'refresh_token',
  SESSION_COOKIE: 'session_id',
  
  OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: AUTH_CONFIG.SESSION_TIMEOUT,
    path: '/'
  }
} as const;

// ====================================================================
// HEADERS DE SEGURANÇA
// ====================================================================

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': process.env.NODE_ENV === 'production' 
    ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    : "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ws: wss: http: https:",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'X-Permitted-Cross-Domain-Policies': 'none'
} as const;

// ====================================================================
// CONFIGURAÇÕES DE CORS
// ====================================================================

export const CORS_CONFIG = {
  origin: (origin: string | undefined, callback: (error: Error | null, success?: boolean) => void) => {
    // Lista permitida baseada no ambiente
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? process.env.CORS_ORIGIN?.split(',') || []
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8082'];

    // Permitir requests sem origin (mobile apps, Postman, etc.) apenas em dev
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Em produção, permitir requests sem origin apenas para health checks internos
    if (!origin && process.env.NODE_ENV === 'production') {
      console.log('⚠️ [CORS] Request sem origin em produção (provavelmente health check interno)');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ [CORS] Origin bloqueado: ${origin}`);
      callback(new Error(`Origin ${origin} não permitido pelo CORS`), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] as string[],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'] as string[],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'] as string[],
  optionsSuccessStatus: 200 // Para legacy browsers
} as const;

// ====================================================================
// CONFIGURAÇÕES DE RATE LIMITING
// ====================================================================

export const RATE_LIMITS = {
  // Geral - AUMENTADO PARA DESENVOLVIMENTO
  GENERAL: {
    windowMs: 1 * 60 * 1000, // 1 minuto (era 15 minutos)
    max: 1000, // 1000 requests por IP (era 100)
    message: 'Muitas requisições deste IP, tente novamente em 1 minuto'
  },
  
  // Login - AUMENTADO PARA DESENVOLVIMENTO
  LOGIN: {
    windowMs: 5 * 60 * 1000, // 5 minutos (era 15 minutos)
    max: 50, // 50 tentativas de login por IP (era 5)
    skipSuccessfulRequests: true,
    message: 'Muitas tentativas de login, tente novamente em 5 minutos'
  },
  
  // Registro - AUMENTADO CONSIDERAVELMENTE PARA DESENVOLVIMENTO
  REGISTER: {
    windowMs: 1 * 60 * 1000, // 1 minuto (era 5 minutos)
    max: 100, // 100 registros por IP (era 10)
    message: 'Muitos registros deste IP, tente novamente em 1 minuto'
  },
  
  // Reset de senha - AUMENTADO PARA DESENVOLVIMENTO
  PASSWORD_RESET: {
    windowMs: 5 * 60 * 1000, // 5 minutos (era 1 hora)
    max: 50, // 50 tentativas por IP (era 3)
    message: 'Muitas tentativas de reset de senha, tente novamente em 5 minutos'
  },
  
  // API - AUMENTADO CONSIDERAVELMENTE PARA DESENVOLVIMENTO
  API: {
    windowMs: 1 * 60 * 1000, // 1 minuto (era 15 minutos)
    max: 2000, // 2000 requests por IP para APIs (era 200)
    message: 'Muitas requisições de API, tente novamente em 1 minuto'
  }
} as const;

// ====================================================================
// CONFIGURAÇÕES DE VALIDAÇÃO
// ====================================================================

export const VALIDATION_CONFIG = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CNPJ_REGEX: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/,
  PHONE_REGEX: /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/,
  
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  
  // Estados brasileiros
  VALID_STATES: [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]
} as const;

// ====================================================================
// MENSAGENS DE ERRO PADRÃO
// ====================================================================

export const ERROR_MESSAGES = {
  // Autenticação
  INVALID_CREDENTIALS: 'Email ou senha incorretos',
  USER_NOT_FOUND: 'Usuário não encontrado',
  USER_INACTIVE: 'Usuário inativo ou bloqueado',
  USER_LOCKED: 'Usuário temporariamente bloqueado devido a tentativas excessivas',
  ACCOUNT_NOT_VERIFIED: 'Conta não verificada. Verifique seu email',
  
  // Token
  TOKEN_MISSING: 'Token de acesso não fornecido',
  TOKEN_INVALID: 'Token de acesso inválido',
  TOKEN_EXPIRED: 'Token de acesso expirado',
  REFRESH_TOKEN_INVALID: 'Token de atualização inválido',
  
  // Permissões
  INSUFFICIENT_PERMISSIONS: 'Permissões insuficientes para esta ação',
  ACCESS_DENIED: 'Acesso negado',
  
  // Validação
  INVALID_EMAIL: 'Email inválido',
  WEAK_PASSWORD: 'Senha não atende aos critérios de segurança',
  PASSWORDS_DONT_MATCH: 'Senhas não coincidem',
  INVALID_CNPJ: 'CNPJ inválido',
  INVALID_PHONE: 'Telefone inválido',
  
  // Recursos
  EMAIL_ALREADY_EXISTS: 'Email já está em uso',
  CNPJ_ALREADY_EXISTS: 'CNPJ já está em uso',
  TENANT_NOT_FOUND: 'Tenant não encontrado',
  
  // Sistema
  INTERNAL_ERROR: 'Erro interno do servidor',
  MAINTENANCE_MODE: 'Sistema em manutenção',
  FEATURE_DISABLED: 'Funcionalidade temporariamente desabilitada'
} as const;

// ====================================================================
// MENSAGENS DE SUCESSO
// ====================================================================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login realizado com sucesso',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso',
  REGISTER_SUCCESS: 'Cadastro realizado com sucesso. Verifique seu email',
  EMAIL_VERIFIED: 'Email verificado com sucesso',
  PASSWORD_UPDATED: 'Senha atualizada com sucesso',
  PASSWORD_RESET_SENT: 'Instruções de reset de senha enviadas por email',
  PROFILE_UPDATED: 'Perfil atualizado com sucesso',
  TENANT_CREATED: 'Tenant criado com sucesso',
  TENANT_UPDATED: 'Tenant atualizado com sucesso'
} as const;

// ====================================================================
// CONFIGURAÇÕES DE LOG
// ====================================================================

export const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Ações que devem ser logadas
  ACTIONS_TO_LOG: [
    'login',
    'logout', 
    'register',
    'password_change',
    'password_reset',
    'email_verification',
    'permission_granted',
    'permission_revoked',
    'user_created',
    'user_updated',
    'user_deleted',
    'tenant_created',
    'tenant_updated',
    'tenant_deleted'
  ],
  
  // Campos sensíveis que não devem ser logados
  SENSITIVE_FIELDS: [
    'password',
    'password_hash',
    'token',
    'refresh_token',
    'authorization'
  ]
} as const;

// ====================================================================
// UTILITÁRIOS DE CONFIGURAÇÃO
// ====================================================================

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isTest = (): boolean => {
  return process.env.NODE_ENV === 'test';
};

// Validar configurações essenciais
export const validateConfig = (): void => {
  if (isProduction()) {
    const requiredEnvVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'CORS_ORIGIN'
    ];
    
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      throw new Error(`🚨 ERRO CRÍTICO: Variáveis de ambiente obrigatórias em produção: ${missing.join(', ')}`);
    }

    // Validar tamanho das chaves JWT
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      throw new Error('🚨 ERRO CRÍTICO: JWT_SECRET deve ter pelo menos 32 caracteres!');
    }

    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
      throw new Error('🚨 ERRO CRÍTICO: JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres!');
    }

    // Validar CORS
    const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [];
    const hasLocalhost = corsOrigins.some(origin => origin.includes('localhost') || origin.includes('127.0.0.1'));
    
    if (hasLocalhost) {
      console.warn('⚠️ AVISO: CORS configurado com localhost em produção!');
    }
  }
};

// Exibir configurações (sem segredos)
export const logConfig = (): void => {
  console.log('📋 Configurações de autenticação carregadas:');
  console.log(`   • JWT expira em: ${AUTH_CONFIG.JWT_EXPIRES_IN}`);
  console.log(`   • Refresh token expira em: ${AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN}`);
  console.log(`   • Máximo de tentativas de login: ${AUTH_CONFIG.MAX_LOGIN_ATTEMPTS}`);
  console.log(`   • Duração do bloqueio: ${AUTH_CONFIG.LOCKOUT_DURATION / 1000 / 60} minutos`);
  console.log(`   • Timeout da sessão: ${AUTH_CONFIG.SESSION_TIMEOUT / 1000 / 60 / 60} horas`);
  console.log(`   • Ambiente: ${process.env.NODE_ENV || 'development'}`);
};

export default AUTH_CONFIG;