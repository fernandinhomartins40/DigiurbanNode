/**
 * CONFIGURAÇÃO CENTRALIZADA SUPABASE - DIGIURBAN2
 * 
 * Este arquivo centraliza todas as configurações do Supabase,
 * fornecendo fallbacks robustos e validação consistente.
 */

// Credenciais da nova instância Supabase
const FALLBACK_CONFIG = {
  url: 'https://apidigiruban.com.br',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWluc3RhbmNlLW1hbmFnZXIiLCJpYXQiOjE3NTU2NDQ1NzAsImV4cCI6MTc4NzE4MDU3MH0._yAg0U_wQQthjB6G-_2h461SNj0WjuOvBo6JukLYmDA',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UtaW5zdGFuY2UtbWFuYWdlciIsImlhdCI6MTc1NTY0NDU3MCwiZXhwIjoxNzg3MTgwNTcwfQ.3078wGGrZlDFZaMVaiQdxGsJG0IWXGKqOuUp7inxkBY'
}

/**
 * Função para obter variáveis de ambiente de forma unificada
 * Suporta Vite, Next.js e Node.js
 */
function getEnvVar(key: string): string | undefined {
  // Verificar se estamos no browser ou Node.js
  const isBrowser = typeof window !== 'undefined'
  const isVite = typeof import.meta !== 'undefined' && import.meta.env
  const isNode = typeof process !== 'undefined' && process.env

  if (isVite) {
    // Ambiente Vite (desenvolvimento/build)
    return (
      import.meta.env[`VITE_${key}`] ||
      import.meta.env[`NEXT_PUBLIC_${key}`] ||
      import.meta.env[key]
    )
  }

  if (isNode) {
    // Ambiente Node.js (Next.js server side)
    return (
      process.env[`VITE_${key}`] ||
      process.env[`NEXT_PUBLIC_${key}`] ||
      process.env[key]
    )
  }

  return undefined
}

/**
 * Configuração principal do Supabase com fallbacks
 */
export const SUPABASE_CONFIG = {
  url: getEnvVar('SUPABASE_URL') || FALLBACK_CONFIG.url,
  anonKey: getEnvVar('SUPABASE_ANON_KEY') || FALLBACK_CONFIG.anonKey,
  serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY') || FALLBACK_CONFIG.serviceRoleKey,
}

/**
 * Validar configuração e fornecer debug info
 */
export function validateSupabaseConfig(context: unknown = 'unknown') {
  const config = {
    url: SUPABASE_CONFIG.url,
    hasAnonKey: !!SUPABASE_CONFIG.anonKey,
    hasServiceKey: !!SUPABASE_CONFIG.serviceRoleKey,
    context,
    timestamp: new Date().toISOString(),
    environment: {
      isVite: typeof import.meta !== 'undefined',
      isNode: typeof process !== 'undefined',
      isBrowser: typeof window !== 'undefined',
      mode: getEnvVar('MODE') || getEnvVar('NODE_ENV') || 'unknown'
    },
    envVars: {
      hasViteUrl: !!getEnvVar('SUPABASE_URL'),
      hasViteKey: !!getEnvVar('SUPABASE_ANON_KEY'),
      hasServiceKey: !!getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
    }
  }

  console.log(`🔧 Supabase Config Validation [${context}]:`, config)

  // Validações críticas
  if (!config.url) {
    throw new Error(`❌ [${context}] Supabase URL não configurada`)
  }

  if (!config.hasAnonKey) {
    throw new Error(`❌ [${context}] Supabase Anon Key não configurada`)
  }

  // URL deve ser HTTPS
  if (!config.url.startsWith('https://')) {
    throw new Error(`❌ [${context}] Supabase URL deve ser HTTPS: ${config.url}`)
  }

  // Anon key deve ser JWT válida
  if (!SUPABASE_CONFIG.anonKey.startsWith('eyJ')) {
    throw new Error(`❌ [${context}] Supabase Anon Key deve ser um JWT válido`)
  }

  return config
}

/**
 * Storage estável e confiável para autenticação
 */
function createStableStorage() {
  const storage = window.localStorage;
  
  // Limpeza única e controlada de chaves antigas (apenas na primeira execução)
  const cleanupKey = 'digiurban-storage-cleaned-v2';
  if (!storage.getItem(cleanupKey)) {
    const keysToClean = [
      'digiurban-main-auth',
      'digiurban-typed-auth', 
      'digiurban-service-role',
      'digiurban-nextjs-auth',
      'sb-localhost-auth-token',
      'sb-auth-token'
    ];
    
    keysToClean.forEach(key => {
      try {
        storage.removeItem(key);
      } catch (error) {
        console.warn(`Erro ao limpar chave ${key}:`, error);
      }
    });
    
    storage.setItem(cleanupKey, 'true');
    console.log('🧹 Limpeza única de storage realizada');
  }
  
  return {
    getItem: (key: string) => {
      try {
        return storage.getItem(key);
      } catch (error) {
        console.warn(`Erro ao ler storage ${key}:`, error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        storage.setItem(key, value);
      } catch (error) {
        console.error(`Erro ao salvar no storage ${key}:`, error);
      }
    },
    removeItem: (key: string) => {
      try {
        storage.removeItem(key);
      } catch (error) {
        console.warn(`Erro ao remover do storage ${key}:`, error);
      }
    }
  };
}

/**
 * Configurações específicas por tipo de cliente
 */
export const CLIENT_CONFIGS = {
  // Cliente principal (React/Vite) - ÚNICO CLIENTE COM SESSÃO
  client: {
    auth: {
      persistSession: true,
      storageKey: 'digiurban-auth-stable', // Chave estável
      storage: typeof window !== 'undefined' ? createStableStorage() : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce' // Usar PKCE para melhor segurança
    }
  },

  // Cliente com tipos (Integrations) - SEM SESSÃO PRÓPRIA
  typed: {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },

  // Cliente Admin (Service Role) - SEM SESSÃO
  admin: {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }
    },
    db: {
      schema: 'public'
    }
  },

  // Cliente Next.js - SEM SESSÃO (evitar conflitos)
  nextjs: {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }
    }
  }
}

/**
 * Função para limpar completamente todas as sessões (troubleshooting)
 */
export function clearAllAuthSessions() {
  if (typeof window === 'undefined') return;
  
  const allAuthKeys = [
    'digiurban-auth-stable',
    'digiurban-auth-v2',
    'digiurban-main-auth',
    'digiurban-typed-auth', 
    'digiurban-service-role',
    'digiurban-nextjs-auth',
    'supabase.auth.token',
    'sb-localhost-auth-token',
    'sb-auth-token',
    'sb-apidigiruban.com.br-auth-token'
  ];
  
  allAuthKeys.forEach(key => {
    try {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Erro ao limpar ${key}:`, error);
    }
  });
  
  console.log('🧹 Todas as sessões de autenticação foram limpas');
}

/**
 * Função para debug de configuração
 */
export function debugSupabaseConfig() {
  const debug = {
    config: SUPABASE_CONFIG,
    fallback: FALLBACK_CONFIG,
    storageKeys: typeof window !== 'undefined' ? {
      localStorage: Object.keys(window.localStorage).filter(k => k.includes('auth')),
      sessionStorage: Object.keys(window.sessionStorage).filter(k => k.includes('auth'))
    } : null,
    environment: {
      viteEnv: typeof import.meta !== 'undefined' ? import.meta.env : null,
      processEnv: typeof process !== 'undefined' ? {
        NODE_ENV: import.meta.env.NODE_ENV,
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_URL: import.meta.env.NEXT_PUBLIC_SUPABASE_URL
      } : null
    }
  }
  
  console.log('🔍 Complete Supabase Debug Info:', debug)
  return debug
}

/**
 * Função para limpar cookies e storage quando houver problemas de login
 * Use no console: window.fixAuthCookies()
 */
export function fixAuthCookies() {
  if (typeof window === 'undefined') return;
  
  console.log('🔧 Iniciando correção de cookies de autenticação...');
  
  // Limpar localStorage
  Object.keys(window.localStorage).forEach(key => {
    if (key.includes('auth') || key.includes('supabase') || key.includes('sb-')) {
      window.localStorage.removeItem(key);
      console.log(`🧹 Removido localStorage: ${key}`);
    }
  });
  
  // Limpar sessionStorage
  Object.keys(window.sessionStorage).forEach(key => {
    if (key.includes('auth') || key.includes('supabase') || key.includes('sb-')) {
      window.sessionStorage.removeItem(key);
      console.log(`🧹 Removido sessionStorage: ${key}`);
    }
  });
  
  // Limpar cookies se possível
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  console.log('✅ Limpeza de cookies concluída. Recarregue a página e tente fazer login novamente.');
  
  // Recarregar página automaticamente após 2 segundos
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// Expor função globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).fixAuthCookies = fixAuthCookies;
  (window as any).debugSupabaseConfig = debugSupabaseConfig;
  (window as any).clearAllAuthSessions = clearAllAuthSessions;
}

export default SUPABASE_CONFIG