
import React from 'react';
import { FC, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Users, 
  Eye,
  MessageSquare,
  AlertTriangle,
  Info,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  Settings,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Zap,
  Brain,
  RefreshCw
} from "lucide-react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";

// Tipos para as interfaces
interface CitizenAlert {
  id: string;
  title: string;
  message: string;
  alert_type: string;
  priority: number;
  created_at: string;
  category?: {
    name: string;
    color: string;
  };
  delivery_stats?: {
    total_recipients: number;
    read_count: number;
  };
}

// Dados mockados para sistema avançado de alertas e tendências
const alertasAutomatizados = [
  {
    id: "auto-001",
    nome: "Tempo de Resposta Elevado",
    descricao: "Alertar quando tempo médio de resposta superar 5 dias",
    categoria: "Performance",
    tipo: "tempo_resposta",
    status: "ativo",
    condicao: "tempo_medio > 5",
    secretarias: ["Infraestrutura", "Obras Públicas"],
    ultimoDisparo: "2025-01-25T14:30:00",
    frequencia: "diario",
    destinatarios: ["Secretário", "Coordenador", "Gabinete"],
    disparosHoje: 2,
    disparosSemana: 8,
    efetividade: 78
  },
  {
    id: "auto-002", 
    nome: "Estoque Baixo Medicamentos",
    descricao: "Notificar quando estoque de medicamentos ficar abaixo de 15%",
    categoria: "Recursos",
    tipo: "estoque_critico",
    status: "ativo",
    condicao: "estoque < 15%",
    secretarias: ["Saúde"],
    ultimoDisparo: "2025-01-26T09:15:00",
    frequencia: "tempo_real",
    destinatarios: ["Secretário Saúde", "Farmacêutico", "Compras"],
    disparosHoje: 1,
    disparosSemana: 3,
    efetividade: 92
  },
  {
    id: "auto-003",
    nome: "Aumento Súbito de Demandas",
    descricao: "Detectar picos anômalos de demandas por região",
    categoria: "Tendência",
    tipo: "anomalia_demandas",
    status: "ativo",
    condicao: "aumento > 40% em 24h",
    secretarias: ["Todas"],
    ultimoDisparo: "2025-01-24T16:45:00",
    frequencia: "tempo_real",
    destinatarios: ["Gabinete", "Todos Secretários"],
    disparosHoje: 0,
    disparosSemana: 2,
    efetividade: 85
  },
  {
    id: "auto-004",
    nome: "Meta de Satisfação Não Atingida",
    descricao: "Alerta quando satisfação do cidadão cair abaixo de 80%",
    categoria: "Qualidade",
    tipo: "satisfacao_baixa",
    status: "pausado",
    condicao: "satisfacao < 80%",
    secretarias: ["Atendimento", "Ouvidoria"],
    ultimoDisparo: "2025-01-20T11:20:00",
    frequencia: "semanal",
    destinatarios: ["Ouvidoria", "Coordenador Atendimento"],
    disparosHoje: 0,
    disparosSemana: 1,
    efetividade: 67
  }
];

const tendenciasDetectadas = [
  {
    id: "trend-001",
    titulo: "Crescimento de Demandas - Zona Sul",
    descricao: "Aumento de 35% nas demandas da Zona Sul nos últimos 7 dias",
    categoria: "Geográfica",
    criticidade: "alta",
    impacto: "Possível sobrecarga na equipe local",
    recomendacao: "Reforçar equipe ou redistribuir demandas",
    detectadoEm: "2025-01-26T08:30:00",
    secretariaAfetada: "Infraestrutura",
    dadosSuportivos: {
      variacao: "+35%",
      periodo: "7 dias",
      volumeAnterior: 45,
      volumeAtual: 61
    }
  },
  {
    id: "trend-002",
    titulo: "Melhoria na Satisfação - Saúde",
    descricao: "Índice de satisfação na saúde aumentou 12% este mês",
    categoria: "Qualidade",
    criticidade: "positiva",
    impacto: "Melhoria na percepção do serviço público",
    recomendacao: "Documentar e replicar boas práticas",
    detectadoEm: "2025-01-25T15:45:00",
    secretariaAfetada: "Saúde",
    dadosSuportivos: {
      variacao: "+12%",
      periodo: "30 dias",
      indiceAnterior: 79,
      indiceAtual: 89
    }
  },
  {
    id: "trend-003",
    titulo: "Atraso Crescente em Obras",
    descricao: "Taxa de obras no prazo caiu para 85% (meta: 95%)",
    categoria: "Cronograma",
    criticidade: "media",
    impacto: "Possível impacto no orçamento e satisfação",
    recomendacao: "Revisar planejamento e recursos das obras",
    detectadoEm: "2025-01-24T12:15:00",
    secretariaAfetada: "Obras Públicas",
    dadosSuportivos: {
      variacao: "-10%",
      periodo: "60 dias",
      taxaAnterior: 95,
      taxaAtual: 85
    }
  }
];

const historicoAlertas = [
  { periodo: "Jan", automaticos: 45, manuais: 23, resolvidos: 62, pendentes: 6 },
  { periodo: "Fev", automaticos: 52, manuais: 28, resolvidos: 71, pendentes: 9 },
  { periodo: "Mar", automaticos: 38, manuais: 31, resolvidos: 59, pendentes: 10 },
  { periodo: "Abr", automaticos: 41, manuais: 19, resolvidos: 54, pendentes: 6 },
  { periodo: "Mai", automaticos: 47, manuais: 25, resolvidos: 68, pendentes: 4 }
];

const metricas = {
  alertasAtivos: 24,
  alertasHoje: 8,
  tempoMedioResolucao: 2.3,
  taxaEfetividade: 82,
  tendenciasDetectadas: 12,
  alertasAutomaticos: 16
};

const AlertTypeIcon: FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'urgent': return <Shield className="h-4 w-4 text-orange-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default: return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const PriorityBadge: FC<{ priority: number }> = ({ priority }) => {
  const colors = {
    1: 'bg-gray-100 text-gray-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-orange-100 text-orange-800',
    4: 'bg-red-100 text-red-800'
  };
  
  const labels = {
    1: 'Baixa',
    2: 'Média', 
    3: 'Alta',
    4: 'Crítica'
  };
  
  return (
    <Badge className={colors[priority as keyof typeof colors] || colors[1]}>
      {labels[priority as keyof typeof labels] || 'Baixa'}
    </Badge>
  );
};

const AlertCard: FC<{ alert: CitizenAlert; onClick: () => void }> = ({ alert, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const deliveryRate = alert.delivery_stats?.total_recipients 
    ? ((alert.delivery_stats.read_count / alert.delivery_stats.total_recipients) * 100).toFixed(1)
    : 0;

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTypeIcon type={alert.alert_type} />
            <h3 className="font-medium text-sm">{alert.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={alert.priority} />
            {alert.category && (
              <Badge 
                variant="outline" 
                style={{ borderColor: alert.category.color, color: alert.category.color }}
              >
                {alert.category.name}
              </Badge>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {alert.message}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {alert.delivery_stats?.total_recipients || 0} destinatários
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {alert.delivery_stats?.read_count || 0} lidas ({deliveryRate}%)
            </span>
          </div>
          <span>{formatDate(alert.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Componentes específicos para o sistema avançado
const TendenciaCard: FC<{ tendencia: any }> = ({ tendencia }) => {
  const getCriticidadeColor = (criticidade: string) => {
    switch(criticidade) {
      case 'alta': return 'border-red-200 bg-red-50';
      case 'media': return 'border-yellow-200 bg-yellow-50';
      case 'positiva': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getCriticidadeIcon = (criticidade: string) => {
    switch(criticidade) {
      case 'alta': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'media': return <Info className="h-5 w-5 text-yellow-500" />;
      case 'positiva': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className={`${getCriticidadeColor(tendencia.criticidade)} border`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getCriticidadeIcon(tendencia.criticidade)}
            <h3 className="font-medium text-sm">{tendencia.titulo}</h3>
          </div>
          <Badge variant="outline">{tendencia.categoria}</Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{tendencia.descricao}</p>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Secretaria:</span>
            <span className="font-medium">{tendencia.secretariaAfetada}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Variação:</span>
            <span className={`font-medium ${tendencia.dadosSuportivos.variacao.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {tendencia.dadosSuportivos.variacao}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Detectado:</span>
            <span>{new Date(tendencia.detectadoEm).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        <div className="mt-3 p-2 bg-white rounded border">
          <p className="text-xs font-medium text-blue-700">Recomendação:</p>
          <p className="text-xs text-blue-600">{tendencia.recomendacao}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const AlertaAutomaticoCard: FC<{ alerta: any }> = ({ alerta }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-sm">{alerta.nome}</h3>
            <p className="text-xs text-muted-foreground">{alerta.descricao}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={alerta.status === 'ativo' ? 'default' : 'secondary'}>
              {alerta.status}
            </Badge>
            <Badge variant="outline">{alerta.categoria}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs mb-3">
          <div>
            <span className="text-muted-foreground">Frequência:</span>
            <p className="font-medium">{alerta.frequencia}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Efetividade:</span>
            <p className="font-medium">{alerta.efetividade}%</p>
          </div>
          <div>
            <span className="text-muted-foreground">Hoje:</span>
            <p className="font-medium">{alerta.disparosHoje} disparos</p>
          </div>
          <div>
            <span className="text-muted-foreground">Semana:</span>
            <p className="font-medium">{alerta.disparosSemana} disparos</p>
          </div>
        </div>

        <div className="text-xs">
          <span className="text-muted-foreground">Condição:</span>
          <code className="ml-2 px-1 py-0.5 bg-gray-100 rounded text-xs">{alerta.condicao}</code>
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-muted-foreground">
            Último: {new Date(alerta.ultimoDisparo).toLocaleDateString("pt-BR")}
          </span>
          <Switch checked={alerta.status === 'ativo'} />
        </div>
      </CardContent>
    </Card>
  );
};

const GerenciarAlertas: FC = () => {
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<CitizenAlert[]>([]);

  const atualizarDados = () => {
    setUltimaAtualizacao(new Date());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria implementada a lógica de busca
    console.log('Buscar por:', searchTerm);
  };

  return (
    
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Sistema de Alertas e Tendências</h1>
            <p className="text-sm text-muted-foreground">
              Última atualização: {ultimaAtualizacao.toLocaleTimeString("pt-BR")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={atualizarDados}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Alerta
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{metricas.alertasAtivos}</div>
              <div className="text-xs text-muted-foreground">Alertas Ativos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{metricas.alertasHoje}</div>
              <div className="text-xs text-muted-foreground">Disparos Hoje</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{metricas.tempoMedioResolucao}</div>
              <div className="text-xs text-muted-foreground">Tempo Médio (dias)</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{metricas.taxaEfetividade}%</div>
              <div className="text-xs text-muted-foreground">Efetividade</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
              <div className="text-2xl font-bold">{metricas.tendenciasDetectadas}</div>
              <div className="text-xs text-muted-foreground">Tendências</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{metricas.alertasAutomaticos}</div>
              <div className="text-xs text-muted-foreground">Automáticos</div>
            </CardContent>
          </Card>
        </div>

        {/* Sistema de Abas */}
        <Tabs defaultValue="tendencias" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tendencias">Tendências</TabsTrigger>
            <TabsTrigger value="automaticos">Alertas Automáticos</TabsTrigger>
            <TabsTrigger value="manuais">Alertas Manuais</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          {/* Aba Tendências */}
          <TabsContent value="tendencias" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-500" />
                    Tendências Críticas Detectadas
                  </CardTitle>
                  <CardDescription>
                    Padrões anômalos identificados pelo sistema de inteligência
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tendenciasDetectadas.filter(t => t.criticidade === 'alta').map(tendencia => (
                      <TendenciaCard key={tendencia.id} tendencia={tendencia} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Melhorias Detectadas
                  </CardTitle>
                  <CardDescription>
                    Tendências positivas e oportunidades identificadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tendenciasDetectadas.filter(t => t.criticidade === 'positiva' || t.criticidade === 'media').map(tendencia => (
                      <TendenciaCard key={tendencia.id} tendencia={tendencia} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Alertas Automáticos */}
          <TabsContent value="automaticos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Alertas Automáticos Configurados
                </CardTitle>
                <CardDescription>
                  Sistema de monitoramento inteligente em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alertasAutomatizados.map(alerta => (
                    <AlertaAutomaticoCard key={alerta.id} alerta={alerta} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Alertas</CardTitle>
                  <CardDescription>Evolução dos alertas ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveLine
                      data={[
                        {
                          id: "Automáticos",
                          color: "hsl(142, 70%, 45%)",
                          data: historicoAlertas.map(d => ({ x: d.periodo, y: d.automaticos })),
                        },
                        {
                          id: "Manuais",
                          color: "hsl(210, 70%, 50%)",
                          data: historicoAlertas.map(d => ({ x: d.periodo, y: d.manuais })),
                        },
                        {
                          id: "Resolvidos",
                          color: "hsl(120, 70%, 50%)",
                          data: historicoAlertas.map(d => ({ x: d.periodo, y: d.resolvidos })),
                        }
                      ]}
                      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                      xScale={{ type: "point" }}
                      yScale={{
                        type: "linear",
                        min: "auto",
                        max: "auto",
                        stacked: false,
                        reverse: false,
                      }}
                      curve="cardinal"
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Período",
                        legendOffset: 36,
                        legendPosition: "middle",
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Quantidade",
                        legendOffset: -40,
                        legendPosition: "middle",
                      }}
                      pointSize={10}
                      pointColor={{ theme: "background" }}
                      pointBorderWidth={2}
                      pointBorderColor={{ from: "serieColor" }}
                      useMesh={true}
                      legends={[
                        {
                          anchor: "bottom-right",
                          direction: "column",
                          justify: false,
                          translateX: 100,
                          translateY: 0,
                          itemsSpacing: 0,
                          itemDirection: "left-to-right",
                          itemWidth: 80,
                          itemHeight: 20,
                          itemOpacity: 0.75,
                          symbolSize: 12,
                          symbolShape: "circle",
                        },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>Tipos de alertas mais frequentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveBar
                      data={[
                        { categoria: "Performance", quantidade: 15, resolvidos: 12 },
                        { categoria: "Recursos", quantidade: 8, resolvidos: 7 },
                        { categoria: "Tendência", quantidade: 12, resolvidos: 9 },
                        { categoria: "Qualidade", quantidade: 6, resolvidos: 4 },
                        { categoria: "Cronograma", quantidade: 4, resolvidos: 3 }
                      ]}
                      keys={["quantidade", "resolvidos"]}
                      indexBy="categoria"
                      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                      padding={0.3}
                      colors={["hsl(210, 70%, 50%)", "hsl(142, 70%, 45%)"]}
                      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: "Categoria",
                        legendPosition: "middle",
                        legendOffset: 32,
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Quantidade",
                        legendPosition: "middle",
                        legendOffset: -40,
                      }}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                      legends={[
                        {
                          dataFrom: "keys",
                          anchor: "bottom-right",
                          direction: "column",
                          justify: false,
                          translateX: 120,
                          translateY: 0,
                          itemsSpacing: 2,
                          itemWidth: 100,
                          itemHeight: 20,
                          itemDirection: "left-to-right",
                          itemOpacity: 0.85,
                          symbolSize: 20,
                        },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">92%</div>
                  <div className="text-sm text-muted-foreground">Taxa de Resolução</div>
                  <Progress value={92} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">2.1h</div>
                  <div className="text-sm text-muted-foreground">Tempo Médio Resposta</div>
                  <Progress value={75} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">87%</div>
                  <div className="text-sm text-muted-foreground">Satisfação Usuários</div>
                  <Progress value={87} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">+15%</div>
                  <div className="text-sm text-muted-foreground">Melhoria vs Mês Anterior</div>
                  <Progress value={85} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Outras abas placeholder */}
          <TabsContent value="manuais">
            <Card>
              <CardHeader>
                <CardTitle>Alertas Manuais</CardTitle>
                <CardDescription>Alertas enviados manualmente pelos gestores</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>Configurar regras e parâmetros dos alertas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Painel de configurações em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch}>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar alertas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" size="icon" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {/* Filter options would go here */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Tipo de Alerta</h4>
                {['info', 'warning', 'urgent', 'emergency'].map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, alert_type: type }));
                        } else {
                          setFilters(prev => ({ ...prev, alert_type: undefined }));
                        }
                      }}
                    />
                    <AlertTypeIcon type={type} />
                    {type === 'info' ? 'Informação' : 
                     type === 'warning' ? 'Aviso' :
                     type === 'urgent' ? 'Urgente' : 'Emergência'}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Alertas Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {isLoading && <p className="text-center py-4">Carregando...</p>}
                {error && <p className="text-center py-4 text-red-500">{error}</p>}
                {alerts.length === 0 && !isLoading && (
                  <p className="text-center py-4 text-gray-500">Nenhum alerta encontrado</p>
                )}
                {alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onClick={() => {
                      // TODO: Open alert details modal
                      console.log('Open alert details:', alert.id);
                    }}
                  />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    
  );
};

export default GerenciarAlertas;
