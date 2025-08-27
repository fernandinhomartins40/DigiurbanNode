// Proxy para resolver problemas de Mixed Content no Lovable.dev
import { createClient } from '@supabase/supabase-js'

// Configuração específica para diferentes ambientes
const getSupabaseConfig = () => {
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  // Se estamos no Lovable.dev (HTTPS), usamos um proxy ou configuração especial
  if (hostname.includes('lovable')) {
    console.log('🌐 Detectado ambiente Lovable.dev - usando configuração proxy')
    
    // Opção 1: Tentar usar um serviço de proxy público (cors-anywhere)
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/http://72.60.10.108:8191'
    
    // Opção 2: Usar configuração direta - DigiurbanFinal
    const directUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ultrabase.com.br/instancia0135103'
    
    return {
      url: directUrl, // Tenta direto primeiro
      key: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWluc3RhbmNlLW1hbmFnZXIiLCJpYXQiOjE3NTU1MjIxOTEsImV4cCI6MTc4NzA1ODE5MX0.uCya7QeSL9f8dIkLjqfpyed8xgGFNROzT48FuRwSPWM',
      options: {
        auth: {
          persistSession: true,
          storageKey: 'digiurban-auth',
          storage: window.localStorage,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        // Configurações específicas para proxy
        global: {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*'
          }
        }
      }
    }
  }
  
  // Desenvolvimento local ou outros ambientes - DigiurbanFinal
  return {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://ultrabase.com.br/instancia0135103',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWluc3RhbmNlLW1hbmFnZXIiLCJpYXQiOjE3NTU1MjIxOTEsImV4cCI6MTc4NzA1ODE5MX0.uCya7QeSL9f8dIkLjqfpyed8xgGFNROzT48FuRwSPWM',
    options: {
      auth: {
        persistSession: true,
        storageKey: 'digiurban-auth', 
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  }
}

const config = getSupabaseConfig()

console.log('🔧 Supabase Proxy Config:', {
  url: config.url,
  hostname: window.location.hostname,
  protocol: window.location.protocol
})

export const supabase = createClient(config.url, config.key, config.options)