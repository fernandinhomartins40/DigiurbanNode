import { useState, useCallback } from 'react'
import { supabaseDiagnostics, DiagnosticResult } from '../utils/supabase-diagnostics'

export function useSupabaseDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostic = useCallback(async (credentials?: { email: string; password: string }) => {
    setLoading(true)
    setError(null)
    
    try {
      const diagnosticResults = await supabaseDiagnostics.runFullDiagnostic(credentials)
      setResults(diagnosticResults)
      return diagnosticResults
    } catch (err: Error | unknown) {
      const errorMessage = err.message || 'Erro desconhecido ao executar diagnóstico'
      setError(errorMessage)
      console.error('Erro no diagnóstico:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const runQuickTest = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const connectionResult = await supabaseDiagnostics.testConnection()
      setResults([connectionResult])
      return [connectionResult]
    } catch (err: Error | unknown) {
      const errorMessage = err.message || 'Erro no teste rápido de conexão'
      setError(errorMessage)
      console.error('Erro no teste rápido:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  const getSummary = useCallback(() => {
    if (results.length === 0) return null
    
    const summary = results.find(r => r.test === 'RESUMO GERAL')
    return summary || null
  }, [results])

  const getFailedTests = useCallback(() => {
    return results.filter(r => r.status === 'error')
  }, [results])

  const getWarningTests = useCallback(() => {
    return results.filter(r => r.status === 'warning')
  }, [results])

  const getSuccessfulTests = useCallback(() => {
    return results.filter(r => r.status === 'success')
  }, [results])

  const hasErrors = results.some(r => r.status === 'error')
  const hasWarnings = results.some(r => r.status === 'warning')
  const allGood = results.length > 0 && !hasErrors && !hasWarnings

  return {
    // Estados
    results,
    loading,
    error,
    
    // Flags de status
    hasErrors,
    hasWarnings,
    allGood,
    hasResults: results.length > 0,
    
    // Ações
    runDiagnostic,
    runQuickTest,
    clearResults,
    
    // Utilitários
    getSummary,
    getFailedTests,
    getWarningTests,
    getSuccessfulTests
  }
}