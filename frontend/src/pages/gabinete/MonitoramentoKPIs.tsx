

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FC } from "react";
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";

// KPIs organizados por secretaria e categoria
const kpisPorSecretaria = {
  saude: [
    {
      id: "saude-001",
      nome: "Consultas Realizadas",
      secretaria: "Saúde",
      categoria: "Atendimento",
      valor: 1247,
      meta: 1200,
      unidade: "consultas",
      status: "sucesso",
      tendencia: "up",
      descricao: "Total de consultas médicas realizadas no mês",
      ultimaAtualizacao: "2025-01-27",
      variacao: "+8.2%"
    },
    {
      id: "saude-002",
      nome: "Satisfação Pacientes",
      secretaria: "Saúde", 
      categoria: "Qualidade",
      valor: 89,
      meta: 85,
      unidade: "%",
      status: "sucesso",
      tendencia: "up",
      descricao: "Índice de satisfação dos pacientes",
      ultimaAtualizacao: "2025-01-27",
      variacao: "+3.1%"
    },
    {
      id: "saude-003",
      nome: "Tempo Médio Espera",
      secretaria: "Saúde",
      categoria: "Eficiência",
      valor: 25,
      meta: 20,
      unidade: "min",
      status: "atencao",
      tendencia: "down",
      descricao: "Tempo médio de espera para consultas",
      ultimaAtualizacao: "2025-01-27",
      variacao: "-2.1%"
    },
    {
      id: "saude-004",
      nome: "Estoque Medicamentos",
      secretaria: "Saúde",
      categoria: "Recursos",
      valor: 78,
      meta: 85,
      unidade: "%",
      status: "atencao",
      tendencia: "stable",
      descricao: "Percentual de medicamentos em estoque adequado",
      ultimaAtualizacao: "2025-01-27",
      variacao: "0%"
    }
  ],
  educacao: [
    {
      id: "edu-001",
      nome: "Taxa de Matrícula",
      secretaria: "Educação",
      categoria: "Acesso",
      valor: 98.5,
      meta: 95,
      unidade: "%",
      status: "sucesso",
      tendencia: "up",
      descricao: "Percentual de crianças matriculadas",
      ultimaAtualizacao: "2025-01-27",
      variacao: "+1.8%"
    },
    {
      id: "edu-002",
      nome: "Frequência Escolar",
      secretaria: "Educação",
      categoria: "Frequência",
      valor: 92,
      meta: 90,
      unidade: "%", 
      status: "sucesso",
      tendencia: "up",
      descricao: "Taxa de frequência escolar média",
      ultimaAtualizacao: "2025-01-27",
      variacao: "+2.3%"
    },
    {
      id: "edu-003",
      nome: "Transporte Escolar",
      secretaria: "Educação",
      categoria: "Logística",
      valor: 94,
      meta: 98,
      unidade: "%",
      status: "atencao",
      tendencia: "stable",
      descricao: "Cobertura do transporte escolar",
      ultimaAtualizacao: "2025-01-27",
      variacao: "0%"
    },
    {
      id: "edu-004",
      nome: "Merenda Escolar",
      secretaria: "Educação",
      categoria: "Alimentação",
      valor: 96,
      meta: 95,
      unidade: "%",
      status: "sucesso",
      tendencia: "up",
      descricao: "Qualidade nutricional da merenda",
      ultimaAtualizacao: "2025-01-27",
      variacao: "+1.2%"
    }
  ],
  obras: [
    {
      id: "obras-001",
      nome: "Obras Concluídas",
      secretaria: "Obras Públicas",
      categoria: "Execução",
      valor: 15,
      meta: 12,
      unidade: "obras",
      status: "sucesso",
      tendencia: "up",
      descricao: "Número de obras finalizadas no período",
      ultimaAtualizacao: "2025-01-27",
      variacao: "+25%"
    },
    {
      id: "obras-002",
      nome: "Execução Orçamentária",
      secretaria: "Obras Públicas",
      categoria: "Financeiro",
      valor: 78,
      meta: 85,
      unidade: "%",
      status: "atencao",
      tendencia: "up",
      descricao: "Percentual do orçamento executado",
      ultimaAtualizacao: "2025-01-27",
      variacao: "+5.2%"
    },
    {
      id: "obras-003",
      nome: "Prazo Médio Obras",
      secretaria: "Obras Públicas",
      categoria: "Prazo",
      valor: 95,
      meta: 100,
      unidade: "%",
      status: "atencao",
      tendencia: "down",
      descricao: "Percentual de obras entregues no prazo",
      ultimaAtualizacao: "2025-01-27",
      variacao: "-3.1%"
    },
    {
      id: "obras-004",
      nome: "Pequenas Intervenções",
      secretaria: "Obras Públicas",
      categoria: "Manutenção",
      valor: 87,
      meta: 80,
      unidade: "intervenções",
      status: "sucesso",
      tendencia: "up",
      descricao: "Número de pequenas intervenções realizadas",
      ultimaAtualizacao: "2025-01-27",
      variacao: "+8.7%"
    }
  ],
  administracao: [
    {
      id: "adm-001",
      nome: "Atendimento ao Cidadão",
      secretaria: "Administração",
      categoria: "Atendimento",
      valor: 92,
      meta: 95,
      unidade: "%",
      status: "atencao",
      tendencia: "up",
      descricao: "Percentual de satisfação no atendimento",
      ultimaAtualizacao: "2025-01-27",
      variacao: "+2.8%"
    },
    {
      id: "adm-002",
      nome: "Tempo Médio Resposta",
      secretaria: "Administração",
      categoria: "Eficiência",
      valor: 3.2,
      meta: 2.5,
      unidade: "dias",
      status: "atencao",
      tendencia: "down",
      descricao: "Tempo médio para resposta aos protocolos",
      ultimaAtualizacao: "2025-01-27",
      variacao: "-0.5 dias"
    },
    {
      id: "adm-003",
      nome: "Transparência Ativa",
      secretaria: "Administração",
      categoria: "Transparência",
      valor: 95,
      meta: 90,
      unidade: "%",
      status: "sucesso",
      tendencia: "up",
      descricao: "Percentual de informações publicadas no prazo",
      ultimaAtualizacao: "2025-01-27",
      variacao: "+3.2%"
    },
    {
      id: "adm-004",
      nome: "Receita Própria",
      secretaria: "Administração",
      categoria: "Financeiro",
      valor: 2.1,
      meta: 1.8,
      unidade: "M",
      status: "sucesso",
      tendencia: "up",
      descricao: "Receita própria arrecadada (em milhões)",
      ultimaAtualizacao: "2025-01-27",
      variacao: "+16.7%"
    }
  ]
};

// Todos os KPIs em uma lista única para views gerais
const todosKpis = [
  ...kpisPorSecretaria.saude,
  ...kpisPorSecretaria.educacao,
  ...kpisPorSecretaria.obras,
  ...kpisPorSecretaria.administracao
];

const evolucaoMensal = [
  { mes: "Jan", atendimento: 85, orcamento: 65, obras: 8 },
  { mes: "Fev", atendimento: 88, orcamento: 70, obras: 10 },
  { mes: "Mar", atendimento: 90, orcamento: 75, obras: 12 },
  { mes: "Abr", atendimento: 91, orcamento: 76, obras: 13 },
  { mes: "Mai", atendimento: 92, orcamento: 78, obras: 15 }
];

const StatusIndicator: FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    sucesso: { icon: <CheckCircle className="h-4 w-4" />, color: "text-green-600", bg: "bg-green-100" },
    atencao: { icon: <AlertTriangle className="h-4 w-4" />, color: "text-yellow-600", bg: "bg-yellow-100" },
    critico: { icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-600", bg: "bg-red-100" }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.atencao;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
      {config.icon}
    </div>
  );
};

const TendenciaIcon: FC<{ tendencia: string }> = ({ tendencia }) => {
  const tendenciaConfig = {
    up: { icon: <TrendingUp className="h-4 w-4 text-green-600" />, label: "Crescendo" },
    down: { icon: <TrendingDown className="h-4 w-4 text-red-600" />, label: "Decrescendo" },
    stable: { icon: <Clock className="h-4 w-4 text-gray-600" />, label: "Estável" }
  };

  const config = tendenciaConfig[tendencia as keyof typeof tendenciaConfig] || tendenciaConfig.stable;

  return (
    <div className="flex items-center gap-1" title={config.label}>
      {config.icon}
    </div>
  );
};

const KPICard: FC<{ kpi: any }> = ({ kpi }) => {
  const percentualMeta = (kpi.valor / kpi.meta) * 100;
  const atingiuMeta = kpi.valor >= kpi.meta;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">{kpi.nome}</CardTitle>
            <Badge variant="outline" className="text-xs mt-1">
              {kpi.secretaria}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status={kpi.status} />
            <TendenciaIcon tendencia={kpi.tendencia} />
          </div>
        </div>
        <CardDescription className="text-xs">{kpi.descricao}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{kpi.valor}</span>
            <span className="text-sm text-muted-foreground">{kpi.unidade}</span>
            <span className={`text-xs ml-auto ${kpi.tendencia === 'up' ? 'text-green-600' : kpi.tendencia === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
              {kpi.variacao}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Meta: {kpi.meta}{kpi.unidade}</span>
              <span className={atingiuMeta ? "text-green-600" : "text-red-600"}>
                {atingiuMeta ? "✓ Atingida" : "Não atingida"}
              </span>
            </div>
            <Progress 
              value={Math.min(percentualMeta, 100)} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {percentualMeta.toFixed(1)}% da meta
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Categoria: {kpi.categoria}</span>
            <span>{new Date(kpi.ultimaAtualizacao).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para estatísticas resumidas por secretaria
const SecretariaResumo: FC<{ secretaria: string; kpis: unknown[] }> = ({ secretaria, kpis }) => {
  const metasAtingidas = kpis.filter(kpi => kpi.valor >= kpi.meta).length;
  const indicadoresCriticos = kpis.filter(kpi => kpi.status === 'critico').length;
  const performanceMedia = kpis.reduce((acc, kpi) => acc + (kpi.valor / kpi.meta), 0) / kpis.length * 100;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{secretaria}</CardTitle>
        <CardDescription>Resumo de performance da secretaria</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{kpis.length}</div>
            <div className="text-xs text-muted-foreground">KPIs Monitorados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metasAtingidas}</div>
            <div className="text-xs text-muted-foreground">Metas Atingidas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{indicadoresCriticos}</div>
            <div className="text-xs text-muted-foreground">Indicadores Críticos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{performanceMedia.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Performance Média</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MonitoramentoKPIs: FC = () => {
  return (
    
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Monitoramento de KPIs</h1>
          <div className="flex gap-2">
            <Select defaultValue="mensal">
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="semestral">Semestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Exportar Relatório</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">KPIs Monitorados</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todosKpis.length}</div>
              <p className="text-xs text-muted-foreground">Indicadores ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Metas Atingidas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {todosKpis.filter(kpi => kpi.valor >= kpi.meta).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((todosKpis.filter(kpi => kpi.valor >= kpi.meta).length / todosKpis.length) * 100)}% das metas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Indicadores Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {todosKpis.filter(kpi => kpi.status === 'critico').length}
              </div>
              <p className="text-xs text-muted-foreground">Requerem atenção</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Performance Geral</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(todosKpis.reduce((acc, kpi) => acc + (kpi.valor / kpi.meta), 0) / todosKpis.length * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Performance média geral</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="visao-geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="saude">Saúde</TabsTrigger>
            <TabsTrigger value="educacao">Educação</TabsTrigger>
            <TabsTrigger value="obras">Obras Públicas</TabsTrigger>
            <TabsTrigger value="administracao">Administração</TabsTrigger>
            <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {todosKpis.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução dos KPIs Principais</CardTitle>
                  <CardDescription>Tendência dos indicadores ao longo dos meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveLine
                      data={[
                        {
                          id: "Atendimento",
                          color: "hsl(210, 70%, 50%)",
                          data: evolucaoMensal.map(item => ({ x: item.mes, y: item.atendimento }))
                        },
                        {
                          id: "Orçamento",
                          color: "hsl(120, 70%, 50%)",
                          data: evolucaoMensal.map(item => ({ x: item.mes, y: item.orcamento }))
                        }
                      ]}
                      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                      xScale={{ type: "point" }}
                      yScale={{ type: "linear", min: "auto", max: "auto" }}
                      curve="cardinal"
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Mês",
                        legendOffset: 36,
                        legendPosition: "middle"
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Percentual",
                        legendOffset: -40,
                        legendPosition: "middle"
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
                          symbolShape: "circle"
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                  <CardDescription>Status atual dos KPIs monitorados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Sucesso</span>
                      </div>
                      <span className="text-sm font-medium">18 (75%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Atenção</span>
                      </div>
                      <span className="text-sm font-medium">3 (12.5%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Crítico</span>
                      </div>
                      <span className="text-sm font-medium">3 (12.5%)</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-l-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="saude" className="space-y-4">
            <SecretariaResumo secretaria="Secretaria de Saúde" kpis={kpisPorSecretaria.saude} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpisPorSecretaria.saude.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="educacao" className="space-y-4">
            <SecretariaResumo secretaria="Secretaria de Educação" kpis={kpisPorSecretaria.educacao} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpisPorSecretaria.educacao.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="obras" className="space-y-4">
            <SecretariaResumo secretaria="Secretaria de Obras Públicas" kpis={kpisPorSecretaria.obras} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpisPorSecretaria.obras.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="administracao" className="space-y-4">
            <SecretariaResumo secretaria="Secretaria de Administração" kpis={kpisPorSecretaria.administracao} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpisPorSecretaria.administracao.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparativo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparativo de Performance entre Secretarias</CardTitle>
                <CardDescription>Análise comparativa dos principais indicadores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveBar
                    data={[
                      {
                        secretaria: "Saúde",
                        performance: Math.round(kpisPorSecretaria.saude.reduce((acc, kpi) => acc + (kpi.valor / kpi.meta), 0) / kpisPorSecretaria.saude.length * 100),
                        metasAtingidas: kpisPorSecretaria.saude.filter(kpi => kpi.valor >= kpi.meta).length,
                        indicadoresCriticos: kpisPorSecretaria.saude.filter(kpi => kpi.status === 'critico').length
                      },
                      {
                        secretaria: "Educação",
                        performance: Math.round(kpisPorSecretaria.educacao.reduce((acc, kpi) => acc + (kpi.valor / kpi.meta), 0) / kpisPorSecretaria.educacao.length * 100),
                        metasAtingidas: kpisPorSecretaria.educacao.filter(kpi => kpi.valor >= kpi.meta).length,
                        indicadoresCriticos: kpisPorSecretaria.educacao.filter(kpi => kpi.status === 'critico').length
                      },
                      {
                        secretaria: "Obras",
                        performance: Math.round(kpisPorSecretaria.obras.reduce((acc, kpi) => acc + (kpi.valor / kpi.meta), 0) / kpisPorSecretaria.obras.length * 100),
                        metasAtingidas: kpisPorSecretaria.obras.filter(kpi => kpi.valor >= kpi.meta).length,
                        indicadoresCriticos: kpisPorSecretaria.obras.filter(kpi => kpi.status === 'critico').length
                      },
                      {
                        secretaria: "Administração",
                        performance: Math.round(kpisPorSecretaria.administracao.reduce((acc, kpi) => acc + (kpi.valor / kpi.meta), 0) / kpisPorSecretaria.administracao.length * 100),
                        metasAtingidas: kpisPorSecretaria.administracao.filter(kpi => kpi.valor >= kpi.meta).length,
                        indicadoresCriticos: kpisPorSecretaria.administracao.filter(kpi => kpi.status === 'critico').length
                      }
                    ]}
                    keys={["performance"]}
                    indexBy="secretaria"
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    padding={0.3}
                    colors={["hsl(210, 70%, 50%)"]}
                    borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: "Secretaria",
                      legendPosition: "middle",
                      legendOffset: 32,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "Performance (%)",
                      legendPosition: "middle",
                      legendOffset: -40,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ranking de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(kpisPorSecretaria)
                      .map(([key, kpis]) => ({
                        nome: key === 'saude' ? 'Saúde' : key === 'educacao' ? 'Educação' : key === 'obras' ? 'Obras' : 'Administração',
                        performance: Math.round(kpis.reduce((acc, kpi) => acc + (kpi.valor / kpi.meta), 0) / kpis.length * 100)
                      }))
                      .sort((a, b) => b.performance - a.performance)
                      .map((item, index) => (
                        <div key={item.nome} className="flex justify-between items-center">
                          <span className="text-sm">{index + 1}. {item.nome}</span>
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            {item.performance}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Metas Atingidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(kpisPorSecretaria).map(([key, kpis]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm">
                          {key === 'saude' ? 'Saúde' : key === 'educacao' ? 'Educação' : key === 'obras' ? 'Obras' : 'Administração'}
                        </span>
                        <span className="text-sm font-medium">
                          {kpis.filter(kpi => kpi.valor >= kpi.meta).length}/{kpis.length}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Indicadores Críticos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(kpisPorSecretaria).map(([key, kpis]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm">
                          {key === 'saude' ? 'Saúde' : key === 'educacao' ? 'Educação' : key === 'obras' ? 'Obras' : 'Administração'}
                        </span>
                        <Badge variant={kpis.filter(kpi => kpi.status === 'critico').length > 0 ? "destructive" : "secondary"}>
                          {kpis.filter(kpi => kpi.status === 'critico').length}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tendências Gerais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(kpisPorSecretaria).map(([key, kpis]) => {
                      const tendenciaPositiva = kpis.filter(kpi => kpi.tendencia === 'up').length;
                      const total = kpis.length;
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm">
                            {key === 'saude' ? 'Saúde' : key === 'educacao' ? 'Educação' : key === 'obras' ? 'Obras' : 'Administração'}
                          </span>
                          <div className="flex items-center gap-1">
                            {tendenciaPositiva > total/2 ? 
                              <TrendingUp className="h-4 w-4 text-green-600" /> : 
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            }
                            <span className="text-xs">
                              {Math.round((tendenciaPositiva/total)*100)}%
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default MonitoramentoKPIs;
