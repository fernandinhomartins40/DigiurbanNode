import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Stethoscope, ArrowRight } from 'lucide-react'
// import { useSupabaseDiagnostics } from "@/hooks/useSupabaseDiagnostics" // TODO: Migrar para novo sistema

export default function DiagnosticQuickAccess() {
  // const { runQuickTest, loading } = useSupabaseDiagnostics()
  const runQuickTest = async () => console.log('Diagnóstico desabilitado temporariamente')
  const loading = false

  const handleQuickTest = async () => {
    try {
      await runQuickTest()
    } catch (error) {
      console.error('Erro no teste rápido:', error)
    }
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-lg text-yellow-800">
            Diagnóstico do Sistema
          </CardTitle>
        </div>
        <CardDescription>
          Ferramenta para investigar problemas de autenticação e conectividade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickTest}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Testando...' : 'Teste Rápido'}
          </Button>
          <Button
            size="sm"
            asChild
            className="flex-1"
          >
            <Link to="/diagnostics/supabase" className="flex items-center gap-1">
              Diagnóstico Completo
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
        <p className="text-xs text-yellow-700">
          Use esta ferramenta se estiver enfrentando problemas de login ou conexão
        </p>
      </CardContent>
    </Card>
  )
}