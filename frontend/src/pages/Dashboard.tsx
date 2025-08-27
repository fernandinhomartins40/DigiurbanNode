
import { useProtocolos } from '@/hooks/useProtocolos'
import { useSecretarias } from '@/hooks/useSecretarias'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Users, Building2, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { data: protocolos, isLoading: loadingProtocolos } = useProtocolos()
  const { data: secretarias, isLoading: loadingSecretarias } = useSecretarias()

  if (loadingProtocolos || loadingSecretarias) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const protocolosAbertos = protocolos?.filter(p => p.status === 'aberto').length || 0
  const protocolosAndamento = protocolos?.filter(p => p.status === 'em_andamento').length || 0
  const protocolosConcluidos = protocolos?.filter(p => p.status === 'concluido').length || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de gestão municipal
          </p>
        </div>
        <Button asChild>
          <Link to="/protocolos/criar">
            <Plus className="mr-2 h-4 w-4" />
            Novo Protocolo
          </Link>
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protocolos Abertos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{protocolosAbertos}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando atendimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{protocolosAndamento}</div>
            <p className="text-xs text-muted-foreground">
              Sendo processados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{protocolosConcluidos}</div>
            <p className="text-xs text-muted-foreground">
              Finalizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secretarias</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{secretarias?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ativas no sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Protocolos recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Protocolos Recentes</CardTitle>
          <CardDescription>
            Últimos protocolos criados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {protocolos?.slice(0, 5).map((protocolo) => (
              <div key={protocolo.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{protocolo.numero_protocolo}</span>
                    <Badge variant="outline">
                      {protocolo.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {protocolo.assunto}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Criado em {new Date(protocolo.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Button variant="ghost" asChild>
                  <Link to={`/protocolos/${protocolo.id}`}>
                    Ver detalhes
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Secretarias */}
      <Card>
        <CardHeader>
          <CardTitle>Secretarias</CardTitle>
          <CardDescription>
            Acesso rápido às secretarias municipais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {secretarias?.map((secretaria) => (
              <Link
                key={secretaria.id}
                to={`/secretarias/${secretaria.codigo.toLowerCase()}`}
                className="block"
              >
                <Card className="hover:bg-accent transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: secretaria.cor_tema || '#3b82f6' }}
                      >
                        {secretaria.sigla}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{secretaria.nome}</CardTitle>
                        <CardDescription className="text-xs">
                          {secretaria.codigo}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
