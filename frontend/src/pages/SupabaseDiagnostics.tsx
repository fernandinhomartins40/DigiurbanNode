import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { supabaseDiagnostics, DiagnosticResult, SupabaseDiagnostics as SupabaseDiagnosticsClass } from '../utils/supabase-diagnostics'
import { Play, Download, RefreshCw, ArrowLeft, Shield } from 'lucide-react'
import { useAuth } from '@/auth';

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


export default function SupabaseDiagnostics() {
  const { profile: user, profile } = useAuth()
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(false)
  const [testCredentials, setTestCredentials] = useState({
    email: 'fernandinhomartins040@gmail.com',
    password: ''
  })
  
  const isPublicAccess = !user // Se não está logado, é acesso público

  const handleRunDiagnostic = async () => {
    setLoading(true)
    try {
      const diagnosticResults = await supabaseDiagnostics.runFullDiagnostic(
        testCredentials.email && testCredentials.password 
          ? testCredentials 
          : undefined
      )
      setResults(diagnosticResults)
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = () => {
    const report = SupabaseDiagnostics.formatResults(results)
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supabase-diagnostic-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Início
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  🔍 Diagnóstico Supabase
                  {isPublicAccess && <Shield className="h-5 w-5 text-yellow-500" />}
                </h1>
                <p className="text-gray-600 text-sm">
                  {isPublicAccess 
                    ? "Acesso público para troubleshooting" 
                    : "Ferramenta administrativa para investigar a configuração"
                  }
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleRunDiagnostic}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {loading ? 'Executando...' : 'Executar Diagnóstico'}
              </Button>
              
              {results.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar Relatório
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Aviso de acesso público */}
        {isPublicAccess && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Acesso Público:</strong> Esta ferramenta está disponível publicamente 
              para facilitar o troubleshooting. Algumas funcionalidades podem estar limitadas 
              quando não logado. Para acesso completo, faça login como administrador.
            </AlertDescription>
          </Alert>
        )}

      {/* Configuração de Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Teste</CardTitle>
          <CardDescription>
            Credenciais para teste de login (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email de Teste</Label>
              <Input
                id="email"
                type="email"
                value={testCredentials.email}
                onChange={(e) => setTestCredentials({
                  ...testCredentials,
                  email: e.target.value
                })}
                placeholder="email@teste.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha de Teste</Label>
              <Input
                id="password"
                type="password"
                value={testCredentials.password}
                onChange={(e) => setTestCredentials({
                  ...testCredentials,
                  password: e.target.value
                })}
                placeholder="Digite a senha para testar login"
              />
            </div>
          </div>
          <Alert>
            <AlertDescription>
              <strong>Opcional:</strong> Se preenchidas, as credenciais serão usadas para testar o fluxo de login.
              Deixe em branco para pular o teste de autenticação.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados do Diagnóstico</CardTitle>
            <CardDescription>
              Relatório completo da configuração do Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.test === 'RESUMO GERAL' ? 'border-blue-200 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                      <h3 className={`font-semibold ${
                        result.test === 'RESUMO GERAL' ? 'text-lg text-blue-800' : ''
                      }`}>
                        {result.test}
                      </h3>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{result.message}</p>
                  
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                        Ver detalhes
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {result.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>
                        <strong>Erro:</strong> {result.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      {results.length === 0 && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Como usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>🔍 <strong>Este diagnóstico irá verificar:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Conectividade com o Supabase</li>
                <li>Configuração do sistema de autenticação</li>
                <li>Estrutura das tabelas necessárias</li>
                <li>Usuários e perfis cadastrados</li>
                <li>Políticas de segurança RLS</li>
                <li>Teste de login (se credenciais fornecidas)</li>
              </ul>
              <p className="mt-4">
                🚀 <strong>Clique em "Executar Diagnóstico"</strong> para começar a análise.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}