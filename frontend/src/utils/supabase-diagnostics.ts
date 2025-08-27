// =====================================================
// 🔍 SCRIPT DE DIAGNÓSTICO DO SUPABASE
// Ferramenta para investigar configuração de autenticação
// =====================================================

import { supabase } from "@/lib/supabase"

/**
 * Extrai mensagem segura de erro
 */
const getErrorMessage = (error): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido';
};


export interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  data?: any
  error?: any
}

export class SupabaseDiagnostics {
  private results: DiagnosticResult[] = []

  // =====================================================
  // 1. TESTE DE CONECTIVIDADE
  // =====================================================
  
  async testConnection(): Promise<DiagnosticResult> {
    try {
      console.log('🔗 Testando conectividade com Supabase...')
      
      const startTime = Date.now()
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count(*)', { count: 'exact', head: true })
      
      const responseTime = Date.now() - startTime
      
      if (error) {
        return {
          test: 'Conectividade',
          status: 'error',
          message: `Falha na conexão: ${error.message}`,
          error: error
        }
      }

      return {
        test: 'Conectividade',
        status: 'success',
        message: `Conexão OK (${responseTime}ms)`,
        data: { responseTime, count: data }
      }
    } catch (error: Error | unknown) {
      return {
        test: 'Conectividade',
        status: 'error',
        message: `Erro de rede: ${error.message}`,
        error: error
      }
    }
  }

  // =====================================================
  // 2. VERIFICAÇÃO DA CONFIGURAÇÃO AUTH
  // =====================================================
  
  async checkAuthConfig(): Promise<DiagnosticResult> {
    try {
      console.log('🔐 Verificando configuração de autenticação...')
      
      // Testar se consegue acessar informações de auth
      const { data: { session }, error } = await supabase.auth.getSession()
      
      const config = {
        hasSession: !!session,
        sessionUser: session?.user?.email || null,
        authUrl: supabase.supabaseUrl,
        storageKey: supabase.auth.storageKey,
        autoRefresh: supabase.auth.autoRefreshToken
      }
      
      return {
        test: 'Configuração Auth',
        status: 'success',
        message: `Configuração carregada. Sessão ativa: ${config.hasSession ? 'Sim' : 'Não'}`,
        data: config
      }
    } catch (error: Error | unknown) {
      return {
        test: 'Configuração Auth',
        status: 'error',
        message: `Erro ao verificar auth: ${error.message}`,
        error: error
      }
    }
  }

  // =====================================================
  // 3. VERIFICAÇÃO DA ESTRUTURA DE TABELAS
  // =====================================================
  
  async checkTableStructure(): Promise<DiagnosticResult> {
    try {
      console.log('📋 Verificando estrutura de tabelas...')
      
      const tables = [
        'user_profiles',
        'secretarias', 
        'perfis_acesso',
        'permissoes',
        'perfil_permissoes'
      ]
      
      const tableInfo: any = {}
      
      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          tableInfo[table] = {
            exists: !error,
            count: count,
            error: error?.message || null
          }
        } catch (err: Error | unknown) {
          tableInfo[table] = {
            exists: false,
            count: null,
            error: err.message
          }
        }
      }
      
      const missingTables = Object.entries(tableInfo)
        .filter(([_, info]: [string, any]) => !info.exists)
        .map(([name]) => name)
      
      if (missingTables.length > 0) {
        return {
          test: 'Estrutura de Tabelas',
          status: 'error',
          message: `Tabelas ausentes: ${missingTables.join(', ')}`,
          data: tableInfo
        }
      }
      
      return {
        test: 'Estrutura de Tabelas',
        status: 'success',
        message: 'Todas as tabelas encontradas',
        data: tableInfo
      }
    } catch (error: Error | unknown) {
      return {
        test: 'Estrutura de Tabelas',
        status: 'error',
        message: `Erro ao verificar tabelas: ${error.message}`,
        error: error
      }
    }
  }

  // =====================================================
  // 4. VERIFICAÇÃO DE USUÁRIOS E PERFIS
  // =====================================================
  
  async checkUsers(): Promise<DiagnosticResult> {
    try {
      console.log('👥 Verificando usuários e perfis...')
      
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          nome_completo,
          tipo_usuario,
          status,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) {
        return {
          test: 'Usuários e Perfis',
          status: 'error',
          message: `Erro ao buscar perfis: ${error.message}`,
          error: error
        }
      }
      
      const userStats = {
        total: profiles?.length || 0,
        byType: profiles?.reduce((acc: Record<string, unknown>, profile) => {
          acc[profile.tipo_usuario] = (acc[profile.tipo_usuario] || 0) + 1
          return acc
        }, {}) || {},
        byStatus: profiles?.reduce((acc: Record<string, unknown>, profile) => {
          acc[profile.status] = (acc[profile.status] || 0) + 1
          return acc
        }, {}) || {},
        superAdmins: profiles?.filter(p => p.tipo_usuario === 'super_admin') || [],
        recent: profiles?.slice(0, 5) || []
      }
      
      return {
        test: 'Usuários e Perfis',
        status: 'success',
        message: `${userStats.total} perfis encontrados`,
        data: userStats
      }
    } catch (error: Error | unknown) {
      return {
        test: 'Usuários e Perfis',
        status: 'error',
        message: `Erro ao verificar usuários: ${error.message}`,
        error: error
      }
    }
  }

  // =====================================================
  // 5. TESTE DE AUTENTICAÇÃO BÁSICA
  // =====================================================
  
  async testBasicAuth(email: string, password: string): Promise<DiagnosticResult> {
    try {
      console.log(`🔑 Testando autenticação básica para: ${email}...`)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })
      
      if (error) {
        return {
          test: 'Teste de Login',
          status: 'error',
          message: `Falha no login: ${error.message}`,
          error: error
        }
      }
      
      // Fazer logout imediato para não afetar o estado
      await supabase.auth.logout()
      
      return {
        test: 'Teste de Login',
        status: 'success',
        message: 'Login funcionando corretamente',
        data: {
          userId: data.user?.id,
          email: data.user?.email,
          verified: data.user?.email_confirmed_at !== null
        }
      }
    } catch (error: Error | unknown) {
      return {
        test: 'Teste de Login',
        status: 'error',
        message: `Erro no teste de login: ${error.message}`,
        error: error
      }
    }
  }

  // =====================================================
  // 6. VERIFICAÇÃO DE POLÍTICAS RLS
  // =====================================================
  
  async checkRLSPolicies(): Promise<DiagnosticResult> {
    try {
      console.log('🔒 Verificando políticas RLS...')
      
      // Tentar acessar dados sem autenticação (deve falhar se RLS estiver ativo)
      await supabase.auth.logout()
      
      const { data: publicData, error: publicError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)
      
      const rlsActive = !!publicError && publicError.message.includes('RLS')
      
      return {
        test: 'Políticas RLS',
        status: rlsActive ? 'success' : 'warning',
        message: rlsActive 
          ? 'RLS ativo - segurança OK'
          : 'RLS pode estar desabilitado - verificar segurança',
        data: {
          rlsActive,
          publicAccess: !publicError,
          error: publicError?.message || null
        }
      }
    } catch (error: Error | unknown) {
      return {
        test: 'Políticas RLS',
        status: 'error',
        message: `Erro ao verificar RLS: ${error.message}`,
        error: error
      }
    }
  }

  // =====================================================
  // 7. EXECUTAR DIAGNÓSTICO COMPLETO
  // =====================================================
  
  async runFullDiagnostic(testCredentials?: { email: string; password: string }): Promise<DiagnosticResult[]> {
    console.log('🚀 Iniciando diagnóstico completo do Supabase...')
    
    this.results = []
    
    // Executar todos os testes
    this.results.push(await this.testConnection())
    this.results.push(await this.checkAuthConfig())
    this.results.push(await this.checkTableStructure())
    this.results.push(await this.checkUsers())
    this.results.push(await this.checkRLSPolicies())
    
    // Teste de login opcional
    if (testCredentials) {
      this.results.push(await this.testBasicAuth(testCredentials.email, testCredentials.password))
    }
    
    // Gerar resumo
    const summary = this.generateSummary()
    this.results.unshift(summary)
    
    return this.results
  }

  // =====================================================
  // 8. GERAR RESUMO DO DIAGNÓSTICO
  // =====================================================
  
  private generateSummary(): DiagnosticResult {
    const total = this.results.length
    const success = this.results.filter(r => r.status === 'success').length
    const errors = this.results.filter(r => r.status === 'error').length
    const warnings = this.results.filter(r => r.status === 'warning').length
    
    let status: 'success' | 'error' | 'warning' = 'success'
    let message = ''
    
    if (errors > 0) {
      status = 'error'
      message = `${errors} erro(s) encontrado(s)`
    } else if (warnings > 0) {
      status = 'warning'
      message = `${warnings} aviso(s) encontrado(s)`
    } else {
      message = 'Todos os testes passaram'
    }
    
    return {
      test: 'RESUMO GERAL',
      status,
      message: `${message} (${success}/${total} testes OK)`,
      data: {
        total,
        success,
        errors,
        warnings,
        details: this.results
      }
    }
  }

  // =====================================================
  // 9. FORMATADOR DE RESULTADOS
  // =====================================================
  
  static formatResults(results: DiagnosticResult[]): string {
    let output = '\n🔍 RELATÓRIO DE DIAGNÓSTICO DO SUPABASE\n'
    output += '================================================\n\n'
    
    results.forEach((result, index) => {
      const icon = result.status === 'success' ? '✅' : 
                   result.status === 'warning' ? '⚠️' : '❌'
      
      output += `${icon} ${result.test}\n`
      output += `   ${result.message}\n`
      
      if (result.data && typeof result.data === 'object') {
        output += `   Dados: ${JSON.stringify(result.data, null, 2).replace(/\n/g, '\n   ')}\n`
      }
      
      if (result.error) {
        output += `   Erro: ${result.error}\n`
      }
      
      output += '\n'
    })
    
    return output
  }
}

// Instância singleton para uso fácil
export const supabaseDiagnostics = new SupabaseDiagnostics()