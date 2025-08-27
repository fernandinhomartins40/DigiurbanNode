import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGabinete } from "@/hooks/modules/useGabinete";
import { 
  Calendar, Users, TrendingUp, Clock, AlertTriangle, DollarSign, 
  FileText, Building, MapPin, Target, Activity, ChevronRight,
  CheckCircle, AlertCircle, XCircle, PieChart, BarChart3,
  Bell, MessageSquare, Briefcase, BookOpen, Heart, School,
  Home, Trees, Car, Shield, Building2, Users2, HandHeart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function DashboardGabinete() {
  const { atendimentos, audiencias, projetosEstrategicos, agenda, indicadores } = useGabinete();

  // Métricas principais
  const atendimentosPendentes = atendimentos.data?.filter(a => a.status === 'protocolado' || a.status === 'andamento').length || 0;
  const audienciasAgendadas = audiencias.data?.filter(a => a.status === 'agendada').length || 0;
  const projetosAndamento = projetosEstrategicos.data?.filter(p => p.status === 'execucao').length || 0;
  const eventosHoje = agenda.data?.filter(e => {
    const hoje = new Date().toDateString();
    const dataEvento = new Date(e.data_evento).toDateString();
    return hoje === dataEvento;
  }).length || 0;

  // Dados mock para demonstração (em produção viriam do backend)
  const metricas = {
    orcamento: {
      executado: 68.4,
      disponivel: 2450000,
      total: 7800000
    },
    kpis: {
      satisfacao: 87.2,
      resolutividade: 92.1,
      tempo_medio: 3.2
    },
    alertas: [
      { tipo: 'critico', titulo: 'Orçamento de Obras em 95%', departamento: 'Obras Públicas' },
      { tipo: 'atencao', titulo: '15 Licenças Ambientais vencendo', departamento: 'Meio Ambiente' },
      { tipo: 'info', titulo: 'Nova lei municipal aprovada', departamento: 'Jurídico' }
    ]
  };

  const secretarias = [
    { nome: 'Saúde', icon: Heart, atendimentos: 245, status: 'normal', cor: 'text-red-600' },
    { nome: 'Educação', icon: School, atendimentos: 89, status: 'atencao', cor: 'text-blue-600' },
    { nome: 'Assistência Social', icon: HandHeart, atendimentos: 156, status: 'normal', cor: 'text-purple-600' },
    { nome: 'Obras Públicas', icon: Building2, atendimentos: 78, status: 'critico', cor: 'text-orange-600' },
    { nome: 'Habitação', icon: Home, atendimentos: 134, status: 'normal', cor: 'text-green-600' },
    { nome: 'Meio Ambiente', icon: Trees, atendimentos: 45, status: 'atencao', cor: 'text-emerald-600' },
    { nome: 'Transporte', icon: Car, atendimentos: 67, status: 'normal', cor: 'text-yellow-600' },
    { nome: 'Segurança', icon: Shield, atendimentos: 23, status: 'normal', cor: 'text-gray-600' }
  ];

  const cards = [
    {
      title: "Atendimentos Pendentes",
      value: atendimentosPendentes,
      icon: Clock,
      color: "text-orange-600",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "Audiências Agendadas",
      value: audienciasAgendadas,
      icon: Users,
      color: "text-blue-600",
      change: "+5%",
      changeType: "increase"
    },
    {
      title: "Projetos Estratégicos",
      value: projetosAndamento,
      icon: TrendingUp,
      color: "text-green-600",
      change: "-3%",
      changeType: "decrease"
    },
    {
      title: "Eventos Hoje",
      value: eventosHoje,
      icon: Calendar,
      color: "text-purple-600",
      change: "0%",
      changeType: "neutral"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Panorama completo da gestão municipal - {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Relatório Executivo
          </Button>
          <Button size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alertas ({metricas.alertas.length})
          </Button>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className={`text-xs ${
                  card.changeType === 'increase' ? 'text-green-600' :
                  card.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {card.change} em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Métricas Financeiras e KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Execução Orçamentária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Executado</span>
                  <span>{metricas.orcamento.executado}%</span>
                </div>
                <Progress value={metricas.orcamento.executado} className="mt-1" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Disponível</span>
                <span>R$ {metricas.orcamento.disponivel.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Total</span>
                <span>R$ {metricas.orcamento.total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              KPIs Municipais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Satisfação do Cidadão</span>
                <span className="text-sm font-medium">{metricas.kpis.satisfacao}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Resolutividade</span>
                <span className="text-sm font-medium">{metricas.kpis.resolutividade}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tempo Médio de Atendimento</span>
                <span className="text-sm font-medium">{metricas.kpis.tempo_medio} dias</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertas Prioritários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metricas.alertas.map((alerta, index) => (
                <div key={index} className="flex items-start gap-2">
                  {alerta.tipo === 'critico' && <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />}
                  {alerta.tipo === 'atencao' && <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />}
                  {alerta.tipo === 'info' && <Activity className="h-4 w-4 text-blue-600 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-xs font-medium">{alerta.titulo}</p>
                    <p className="text-xs text-muted-foreground">{alerta.departamento}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview das Secretarias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-gray-600" />
            Status das Secretarias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {secretarias.map((secretaria) => {
              const Icon = secretaria.icon;
              return (
                <div key={secretaria.nome} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Icon className={`h-5 w-5 ${secretaria.cor}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{secretaria.nome}</p>
                    <p className="text-xs text-muted-foreground">{secretaria.atendimentos} atendimentos</p>
                  </div>
                  <Badge variant={
                    secretaria.status === 'normal' ? 'secondary' :
                    secretaria.status === 'atencao' ? 'outline' : 'destructive'
                  } className="text-xs">
                    {secretaria.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Agenda e Projetos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Agenda Executiva
            </CardTitle>
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agenda.data?.filter(e => {
                const hoje = new Date().toDateString();
                const dataEvento = new Date(e.data_evento).toDateString();
                return hoje === dataEvento;
              }).slice(0, 5).map((evento) => (
                <div key={evento.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{evento.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {evento.horario_inicio} - {evento.local_evento}
                    </p>
                  </div>
                  <Badge variant={
                    evento.status === 'confirmado' ? 'default' :
                    evento.status === 'agendado' ? 'secondary' : 'outline'
                  }>
                    {evento.status}
                  </Badge>
                </div>
              ))}
              {(!agenda.data || agenda.data.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum evento agendado para hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Projetos Estratégicos
            </CardTitle>
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projetosEstrategicos.data?.slice(0, 5).map((projeto) => (
                <div key={projeto.id} className="flex items-center gap-3 p-2 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{projeto.nome_projeto}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={projeto.percentual_executado} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground">{projeto.percentual_executado}%</span>
                    </div>
                  </div>
                  <Badge variant={
                    projeto.status === 'execucao' ? 'default' :
                    projeto.status === 'planejamento' ? 'secondary' :
                    projeto.status === 'concluido' ? 'outline' : 'destructive'
                  }>
                    {projeto.status}
                  </Badge>
                </div>
              ))}
              {(!projetosEstrategicos.data || projetosEstrategicos.data.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum projeto estratégico ativo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm">Nova Comunicação</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Agendar Audiência</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Gerar Relatório</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <PieChart className="h-5 w-5" />
              <span className="text-sm">Ver Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}