/**
 * CLIENTE SUPABASE UNIFICADO - DIGIURBAN2
 * 
 * Este arquivo fornece uma interface unificada para todos os tipos de
 * clientes Supabase, substituindo gradualmente os arquivos fragmentados.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, CLIENT_CONFIGS, validateSupabaseConfig } from '../config/supabase.config'
import type { Database } from '../integrations/supabase/types'

// Cache para clientes criados
const clientCache = new Map<string, SupabaseClient>()

/**
 * Factory function para criar clientes Supabase
 */
export function createSupabaseClient(
  type: 'client' | 'typed' | 'admin' | 'nextjs' = 'client'
): SupabaseClient<Database> {
  // Verificar cache primeiro
  const cacheKey = `${type}-${SUPABASE_CONFIG.url}`
  if (clientCache.has(cacheKey)) {
    console.log(`♻️ Usando cliente Supabase em cache: ${type}`)
    return clientCache.get(cacheKey)!
  }

  // Validar configuração
  validateSupabaseConfig(`create-${type}-client`)

  let client: SupabaseClient<Database>
  let config = CLIENT_CONFIGS[type]

  try {
    switch (type) {
      case 'admin':
        if (!SUPABASE_CONFIG.serviceRoleKey) {
          throw new Error('Service Role Key necessária para cliente admin')
        }
        client = createClient<Database>(
          SUPABASE_CONFIG.url,
          SUPABASE_CONFIG.serviceRoleKey,
          config
        )
        console.log('🔑 Cliente Supabase Admin criado (Service Role)')
        break

      case 'typed':
        client = createClient<Database>(
          SUPABASE_CONFIG.url,
          SUPABASE_CONFIG.anonKey,
          config
        )
        console.log('🔧 Cliente Supabase Typed criado (com Database types)')
        break

      case 'nextjs':
        client = createClient<Database>(
          SUPABASE_CONFIG.url,
          SUPABASE_CONFIG.anonKey,
          config
        )
        console.log('⚛️ Cliente Supabase Next.js criado')
        break

      case 'client':
      default:
        client = createClient<Database>(
          SUPABASE_CONFIG.url,
          SUPABASE_CONFIG.anonKey,
          config
        )
        console.log('🚀 Cliente Supabase Principal criado')
        break
    }

    // Adicionar ao cache
    clientCache.set(cacheKey, client)
    
    return client
  } catch (error) {
    console.error(`❌ Erro ao criar cliente Supabase ${type}:`, error)
    throw error
  }
}

/**
 * Clientes pré-configurados para uso direto (singleton real)
 */

// Singleton principal - apenas um cliente por aplicação
let _supabaseInstance: SupabaseClient<Database> | null = null

export const supabase = (() => {
  if (!_supabaseInstance) {
    console.log('🔄 Criando instância singleton Supabase...')
    _supabaseInstance = createSupabaseClient('client')
  }
  return _supabaseInstance
})()

// Cliente typed usa o mesmo client singleton mas com configuração diferente
export const supabaseTyped = supabase

// Funções para obter clientes especializados apenas quando necessário
export const getSupabaseAdmin = () => createSupabaseClient('admin')
export const getSupabaseNextjs = () => createSupabaseClient('nextjs')

/**
 * Função para limpar cache (útil para testes)
 */
export function clearSupabaseCache() {
  clientCache.clear()
  console.log('🧹 Cache de clientes Supabase limpo')
}

/**
 * Função para reconectar todos os clientes (útil para mudanças de configuração)
 */
export function reconnectAllClients() {
  clearSupabaseCache()
  // Reset singleton
  _supabaseInstance = null
  
  return {
    client: createSupabaseClient('client'),
    typed: supabase, // usa o mesmo singleton
    admin: getSupabaseAdmin(),
    nextjs: getSupabaseNextjs()
  }
}

/**
 * Health check para verificar conectividade
 */
export async function healthCheck(clientType: 'client' | 'typed' | 'admin' | 'nextjs' = 'client') {
  try {
    const client = createSupabaseClient(clientType)
    
    // Teste básico de conectividade
    const { data, error } = await client
      .from('tenants')
      .select('id')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = tabela não encontrada (ok)
      throw error
    }

    console.log(`✅ Health check OK para cliente ${clientType}`)
    return { status: 'ok', client: clientType, timestamp: new Date().toISOString() }
  } catch (error) {
    console.error(`❌ Health check falhou para cliente ${clientType}:`, error)
    return { status: 'error', client: clientType, error: error.message }
  }
}

/**
 * Função de debug para todas as configurações
 */
export function debugAllClients() {
  const debug = {
    config: SUPABASE_CONFIG,
    cache: Array.from(clientCache.keys()),
    clients: {
      client: !!_supabaseInstance,
      typed: !!_supabaseInstance, // mesmo singleton
      admin: !!clientCache.get(`admin-${SUPABASE_CONFIG.url}`),
      nextjs: !!clientCache.get(`nextjs-${SUPABASE_CONFIG.url}`)
    },
    singleton: {
      instance: !!_supabaseInstance
    },
    timestamp: new Date().toISOString()
  }
  
  console.log('🔍 Debug Todos os Clientes Supabase:', debug)
  return debug
}

// Export default para compatibilidade
export default supabase