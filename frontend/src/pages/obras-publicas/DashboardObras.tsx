import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Building,
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Users,
  MapPin,
  FileText,
  Wrench,
  BarChart3
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const obrasData = [
  { mes: "Jan", iniciadas: 2, concluidas: 1, valor: 450000 },
  { mes: "Fev", iniciadas: 1, concluidas: 0, valor: 280000 },
  { mes: "Mar", iniciadas: 3, concluidas: 2, valor: 750000 },
  { mes: "Abr", iniciadas: 2, concluidas: 1, valor: 620000 },
  { mes: "Mai", iniciadas: 1, concluidas: 3, valor: 890000 }
];

const execucaoFinanceiraData = [
  { mes: "Jan", orcado: 500000, executado: 450000 },
  { mes: "Fev", orcado: 600000, executado: 580000 },
  { mes: "Mar", orcado: 750000, executado: 720000 },
  { mes: "Abr", orcado: 650000, executado: 630000 },
  { mes: "Mai", orcado: 800000, executado: 790000 }
];

const statusDistribuicao = [
  { name: "Em Andamento", value: 4, color: "#3b82f6" },
  { name: "Concluídas", value: 8, color: "#10b981" },
  { name: "Paralisadas", value: 1, color: "#ef4444" },
  { name: "Planejadas", value: 3, color: "#f59e0b" }
];

const obrasDetalhadas = [
  {
    id: 1,
    nome: "Pavimentação Av. Principal",
    categoria: "Pavimentação",
    progresso: 75,
    valor: 850000,
    valorExecutado: 637500,
    prazo: "15/06/2025",
    status: "em_andamento",
    empresa: "Construtora ABC"
  },
  {
    id: 2,
    nome: "Centro de Saúde Vila Nova",
    categoria: "Edificação",
    progresso: 40,
    valor: 1200000,
    valorExecutado: 480000,
    prazo: "01/08/2025",
    status: "em_andamento",
    empresa: "Construtora XYZ"
  },
  {
    id: 3,
    nome: "Reforma Escola Municipal",
    categoria: "Reforma",
    progresso: 100,
    valor: 450000,
    valorExecutado: 450000,
    prazo: "30/04/2025",
    status: "concluida",
    empresa: "Reformas Brasil"
  }
];

const intervencoesPendentes = [
  { id: 1, descricao: "Tapa buraco Rua das Flores", tipo: "Emergencial", prioridade: "Alta" },
  { id: 2, descricao: "Poda de árvores Av. Central", tipo: "Manutenção", prioridade: "Média" },
  { id: 3, descricao: "Reparo calçada Escola", tipo: "Infraestrutura", prioridade: "Alta" },
  { id: 4, descricao: "Limpeza terreno baldio", tipo: "Limpeza", prioridade: "Baixa" }
];

const DashboardObras = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("mes");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_andamento":
        return "bg-blue-100 text-blue-800";
      case "concluida":
        return "bg-green-100 text-green-800";
      case "paralisada":
        return "bg-red-100 text-red-800";
      case "planejada":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade.toLowerCase()) {
      case "alta":
        return "bg-red-100 text-red-800";
      case "média":
        return "bg-amber-100 text-amber-800";
      case "baixa":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalObras = obrasDetalhadas.length;
  const obrasAndamento = obrasDetalhadas.filter(o => o.status === "em_andamento").length;
  const obrasConcluidas = obrasDetalhadas.filter(o => o.status === "concluida").length;
  const progressoMedio = Math.round(obrasDetalhadas.reduce((sum, obra) => sum + obra.progresso, 0) / totalObras);

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Building className="mr-3 h-8 w-8 text-amber-500" />
              Dashboard Secretaria de Obras Públicas
            </h1>
            <p className="text-muted-foreground">Acompanhamento de obras, intervenções e investimentos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Relatório Mensal
            </Button>
            <Button size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Exportar Dados
            </Button>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obras em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{obrasAndamento}</div>
              <p className="text-xs text-muted-foreground">
                de {totalObras} obras totais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obras Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{obrasConcluidas}</div>
              <p className="text-xs text-muted-foreground">
                Este ano
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressoMedio}%</div>
              <p className="text-xs text-muted-foreground">
                Todas as obras
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intervenções Pendentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{intervencoesPendentes.length}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando execução
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList>
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="obras">Obras</TabsTrigger>
            <TabsTrigger value="financeiro">Execução Financeira</TabsTrigger>
            <TabsTrigger value="intervencoes">Intervenções</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                  <CardDescription>Situação atual das obras</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusDistribuicao}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusDistribuicao.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {statusDistribuicao.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evolução Mensal</CardTitle>
                  <CardDescription>Obras iniciadas vs concluídas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={obrasData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="iniciadas" fill="#3b82f6" name="Iniciadas" />
                      <Bar dataKey="concluidas" fill="#10b981" name="Concluídas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Indicadores de Performance</CardTitle>
                  <CardDescription>Principais métricas de execução</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Pontualidade</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">92%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Qualidade</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">95%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Satisfação</span>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">88%</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Execução Orçamentária</span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">87%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Empresas Ativas</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">8</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Fiscalizações</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">15</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertas e Avisos</CardTitle>
                  <CardDescription>Situações que requerem atenção</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 border border-amber-200 bg-amber-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">2 obras próximas ao prazo</p>
                      <p className="text-xs text-muted-foreground">Requer acompanhamento</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 border border-red-200 bg-red-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">1 obra paralisada</p>
                      <p className="text-xs text-muted-foreground">Aguarda resolução</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 border border-blue-200 bg-blue-50 rounded">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">3 fiscalizações agendadas</p>
                      <p className="text-xs text-muted-foreground">Esta semana</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="obras" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Obras em Execução</CardTitle>
                <CardDescription>Status detalhado das obras ativas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {obrasDetalhadas.map((obra) => (
                    <div key={obra.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{obra.nome}</h4>
                          <p className="text-sm text-muted-foreground">{obra.empresa}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            {obra.categoria}
                          </Badge>
                          <Badge className={getStatusColor(obra.status)}>
                            {obra.status === "em_andamento" ? "Em Andamento" : "Concluída"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Valor:</span>
                          <p className="font-medium">R$ {obra.valor.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Executado:</span>
                          <p className="font-medium">R$ {obra.valorExecutado.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prazo:</span>
                          <p className="font-medium">{obra.prazo}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso Físico</span>
                          <span className="font-medium">{obra.progresso}%</span>
                        </div>
                        <Progress value={obra.progresso} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Execução Financeira</span>
                          <span className="font-medium">
                            {Math.round((obra.valorExecutado / obra.valor) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(obra.valorExecutado / obra.valor) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Execução Financeira Mensal</CardTitle>
                  <CardDescription>Orçado vs Executado</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={execucaoFinanceiraData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, '']} />
                      <Bar dataKey="orcado" fill="#3b82f6" name="Orçado" />
                      <Bar dataKey="executado" fill="#10b981" name="Executado" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                  <CardDescription>Consolidado do ano</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Orçado</p>
                          <p className="text-2xl font-bold">R$ 4.2M</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Executado</p>
                          <p className="text-2xl font-bold text-green-600">R$ 3.7M</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                          <p className="text-2xl font-bold text-amber-600">R$ 0.5M</p>
                        </div>
                        <Building className="h-8 w-8 text-amber-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="intervencoes" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Intervenções Pendentes</CardTitle>
                  <CardDescription>Pequenas intervenções aguardando execução</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {intervencoesPendentes.map((intervencao) => (
                      <div key={intervencao.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          <Wrench className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{intervencao.descricao}</p>
                            <p className="text-xs text-muted-foreground">{intervencao.tipo}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getPrioridadeColor(intervencao.prioridade)}>
                          {intervencao.prioridade}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Intervenções</CardTitle>
                  <CardDescription>Resumo das atividades realizadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">142</div>
                      <div className="text-xs text-muted-foreground">Realizadas este mês</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">{intervencoesPendentes.length}</div>
                      <div className="text-xs text-muted-foreground">Pendentes</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Tempo Médio</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">2.3 dias</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Taxa de Conclusão</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">96%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Custo Médio</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">R$ 850</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default DashboardObras;