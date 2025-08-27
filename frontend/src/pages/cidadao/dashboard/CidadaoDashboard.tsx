import { CidadaoLayout } from "@/components/CidadaoLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { FileText, MessageSquare, User, Star, Clock, CheckCircle, AlertCircle, Search, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useProtocols } from "@/hooks/useProtocols";
import { useAuth } from '@/auth'

const CidadaoDashboard = () => {
  const { profile: user } = useAuth()
  const { myProtocols, services, loading } = useProtocols()
  
  // Calcular estatísticas dos protocolos
  const estatisticas = {
    total: myProtocols.length,
    abertos: myProtocols.filter(p => p.status === 'aberto').length,
    em_andamento: myProtocols.filter(p => ['em_andamento', 'aguardando_aprovacao', 'aprovado'].includes(p.status)).length,
    concluidos: myProtocols.filter(p => p.status === 'concluido').length,
    aguardando_documentos: myProtocols.filter(p => p.status === 'aguardando_documentos').length
  }

  // Protocolos recentes (últimos 5)
  const protocolosRecentes = myProtocols.slice(0, 5)

  // Serviços mais utilizados
  const servicosMaisUsados = services
    .map(service => ({
      ...service,
      total_usos: myProtocols.filter(p => p.servico_id === service.id).length
    }))
    .filter(s => s.total_usos > 0)
    .sort((a, b) => b.total_usos - a.total_usos)
    .slice(0, 3)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'bg-blue-500'
      case 'em_andamento': return 'bg-yellow-500'
      case 'aguardando_documentos': return 'bg-orange-500'
      case 'aguardando_aprovacao': return 'bg-purple-500'
      case 'aprovado': return 'bg-green-500'
      case 'concluido': return 'bg-emerald-500'
      case 'rejeitado': return 'bg-red-500'
      case 'cancelado': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aberto': return 'Aberto'
      case 'em_andamento': return 'Em Andamento'
      case 'aguardando_documentos': return 'Aguarda Docs'
      case 'aguardando_aprovacao': return 'Aguarda Aprovação'
      case 'aprovado': return 'Aprovado'
      case 'concluido': return 'Concluído'
      case 'rejeitado': return 'Rejeitado'
      case 'cancelado': return 'Cancelado'
      default: return status
    }
  }

  if (loading) {
    return (
      <CidadaoLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando dashboard...</span>
        </div>
      </CidadaoLayout>
    )
  }

  return (
    <CidadaoLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo, {user?.nome || 'Cidadão'}!
          </h1>
          <p className="text-muted-foreground">
            Acesse os serviços municipais de forma rápida e prática
          </p>
        </div>

        {/* Cards de Acesso Rápido */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novo Protocolo</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Solicite um novo serviço
              </p>
              <Button asChild className="w-full" size="sm">
                <Link to="/catalogo-servicos">Solicitar Serviço</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meus Protocolos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{estatisticas.total}</div>
              <p className="text-xs text-muted-foreground mb-3">
                Total de protocolos
              </p>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link to="/meus-protocolos">Ver Protocolos</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catálogo</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{services.length}</div>
              <p className="text-xs text-muted-foreground mb-3">
                Serviços disponíveis
              </p>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link to="/catalogo-servicos">Explorar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Avalie os serviços utilizados
              </p>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link to="/minhas-avaliacoes">Ver Avaliações</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Protocolos por Status */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abertos</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {estatisticas.abertos}
              </div>
              <p className="text-xs text-muted-foreground">
                Aguardando atendimento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {estatisticas.em_andamento}
              </div>
              <p className="text-xs text-muted-foreground">
                Sendo processados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {estatisticas.concluidos}
              </div>
              <p className="text-xs text-muted-foreground">
                Finalizados com sucesso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aguarda Docs</CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {estatisticas.aguardando_documentos}
              </div>
              <p className="text-xs text-muted-foreground">
                Precisa de documentos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Protocolos Recentes */}
        {protocolosRecentes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Protocolos Recentes</CardTitle>
              <CardDescription>
                Seus últimos protocolos abertos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {protocolosRecentes.map((protocolo) => (
                  <div key={protocolo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(protocolo.status)}`} />
                      <div>
                        <div className="font-medium">{protocolo.numero_protocolo}</div>
                        <div className="text-sm text-muted-foreground">{protocolo.assunto}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {getStatusLabel(protocolo.status)}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(protocolo.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {myProtocols.length > 5 && (
                <div className="mt-4 text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/meus-protocolos">Ver todos os protocolos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Serviços Mais Utilizados */}
        {servicosMaisUsados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Serviços Mais Utilizados</CardTitle>
              <CardDescription>
                Acesse rapidamente os serviços que você mais usa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {servicosMaisUsados.map((servico) => (
                  <Button key={servico.id} asChild variant="outline" className="justify-start h-auto p-4">
                    <Link to={`/solicitar-servico?service=${servico.id}`}>
                      <div className="text-left">
                        <div className="font-medium">{servico.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {servico.categoria} • {servico.total_usos} usos
                        </div>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Primeira visita - Tutorial */}
        {estatisticas.total === 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Seja bem-vindo ao Portal do Cidadão! 👋
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Este é o seu primeiro acesso. Que tal começar solicitando um serviço?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Como funciona:</strong>
                </p>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4">
                  <li>1. Escolha um serviço no catálogo</li>
                  <li>2. Preencha o formulário com suas informações</li>
                  <li>3. Acompanhe o andamento em tempo real</li>
                  <li>4. Receba notificações sobre atualizações</li>
                </ol>
                <div className="pt-3">
                  <Button asChild className="w-full">
                    <Link to="/catalogo-servicos">Explorar Serviços Disponíveis</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </CidadaoLayout>
  );
};

export default CidadaoDashboard;