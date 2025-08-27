
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DownloadIcon, 
  Filter, 
  Info, 
  MapPin, 
  PieChart, 
  Share2, 
  Search,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
  Target,
  BarChart3
} from "lucide-react";
import { FC, useState, useEffect } from "react";
// import { ResponsiveBar } from "@nivo/bar";
// import { ResponsiveLine } from "@nivo/line";
// import { ResponsivePie } from "@nivo/pie";

// Dados avançados de regiões e demandas com coordenadas e heat map
const regioesData = [
  { 
    id: 1, 
    nome: "Centro", 
    totalDemandas: 124, 
    pendentes: 45, 
    emAndamento: 32, 
    concluidas: 47,
    coordenadas: { lat: -15.7801, lng: -47.9292 },
    densidade: "alta",
    tempoMedioResposta: 3.2,
    satisfacao: 78,
    criticidade: "media",
    populacao: 15400
  },
  { 
    id: 2, 
    nome: "Zona Norte", 
    totalDemandas: 87, 
    pendentes: 28, 
    emAndamento: 41, 
    concluidas: 18,
    coordenadas: { lat: -15.7701, lng: -47.9192 },
    densidade: "media",
    tempoMedioResposta: 4.1,
    satisfacao: 82,
    criticidade: "baixa",
    populacao: 32100
  },
  { 
    id: 3, 
    nome: "Zona Sul", 
    totalDemandas: 152, 
    pendentes: 63, 
    emAndamento: 57, 
    concluidas: 32,
    coordenadas: { lat: -15.7901, lng: -47.9392 },
    densidade: "alta",
    tempoMedioResposta: 5.8,
    satisfacao: 65,
    criticidade: "alta",
    populacao: 45200
  },
  { 
    id: 4, 
    nome: "Zona Leste", 
    totalDemandas: 98, 
    pendentes: 37, 
    emAndamento: 29, 
    concluidas: 32,
    coordenadas: { lat: -15.7801, lng: -47.9092 },
    densidade: "media",
    tempoMedioResposta: 3.8,
    satisfacao: 75,
    criticidade: "media",
    populacao: 28700
  },
  { 
    id: 5, 
    nome: "Zona Oeste", 
    totalDemandas: 115, 
    pendentes: 51, 
    emAndamento: 38, 
    concluidas: 26,
    coordenadas: { lat: -15.7801, lng: -47.9492 },
    densidade: "baixa",
    tempoMedioResposta: 4.5,
    satisfacao: 70,
    criticidade: "media",
    populacao: 19800
  },
];

// Tipos de demandas por categoria e prioridade
const categoriasDemandas = [
  { 
    categoria: "Infraestrutura", 
    subcategorias: [
      { tipo: "Iluminação pública", quantidade: 87, urgentes: 12, media: 45, baixa: 30 },
      { tipo: "Pavimentação", quantidade: 74, urgentes: 18, media: 35, baixa: 21 },
      { tipo: "Sinalização", quantidade: 34, urgentes: 5, media: 20, baixa: 9 }
    ],
    total: 195,
    cor: "#3B82F6"
  },
  { 
    categoria: "Limpeza Urbana", 
    subcategorias: [
      { tipo: "Coleta irregular", quantidade: 64, urgentes: 8, media: 35, baixa: 21 },
      { tipo: "Limpeza de praças", quantidade: 28, urgentes: 3, media: 15, baixa: 10 },
      { tipo: "Capina e poda", quantidade: 19, urgentes: 2, media: 10, baixa: 7 }
    ],
    total: 111,
    cor: "#10B981"
  },
  { 
    categoria: "Segurança", 
    subcategorias: [
      { tipo: "Policiamento", quantidade: 49, urgentes: 15, media: 25, baixa: 9 },
      { tipo: "Iluminação segurança", quantidade: 23, urgentes: 8, media: 12, baixa: 3 }
    ],
    total: 72,
    cor: "#EF4444"
  },
  { 
    categoria: "Saúde", 
    subcategorias: [
      { tipo: "Atendimento UBS", quantidade: 43, urgentes: 12, media: 20, baixa: 11 },
      { tipo: "Medicamentos", quantidade: 21, urgentes: 7, media: 10, baixa: 4 }
    ],
    total: 64,
    cor: "#8B5CF6"
  }
];

// Dados de evolução temporal das demandas
const evolucaoTemporal = [
  { periodo: "Jan", demandas: 45, resolvidas: 38, pendentes: 7, satisfacao: 82 },
  { periodo: "Fev", demandas: 52, resolvidas: 44, pendentes: 8, satisfacao: 79 },
  { periodo: "Mar", demandas: 67, resolvidas: 51, pendentes: 16, satisfacao: 76 },
  { periodo: "Abr", demandas: 59, resolvidas: 48, pendentes: 11, satisfacao: 81 },
  { periodo: "Mai", demandas: 73, resolvidas: 55, pendentes: 18, satisfacao: 78 }
];

// Indicadores de performance regionais
const indicadoresRegionais = {
  tempoMedioGeral: 4.3,
  satisfacaoGeral: 74,
  taxaResolucao: 76,
  regiaoMelhorPerformance: "Zona Norte",
  regiaoPiorPerformance: "Zona Sul",
  tendenciaGeral: "crescente"
};

// Dados de exemplo de demandas específicas
const demandasExemplo = [
  {
    id: "DM-2025-001",
    descricao: "Falta de iluminação na Rua das Flores",
    bairro: "Centro",
    status: "pendente",
    prioridade: "alta",
    dataCriacao: "2025-05-10",
  },
  {
    id: "DM-2025-002",
    descricao: "Buraco na pavimentação da Av. Principal",
    bairro: "Zona Norte",
    status: "em_andamento",
    prioridade: "média",
    dataCriacao: "2025-05-08",
  },
  {
    id: "DM-2025-003",
    descricao: "Coleta de lixo irregular",
    bairro: "Zona Sul",
    status: "concluida",
    prioridade: "baixa",
    dataCriacao: "2025-05-05",
  },
];

// Componente para a barra de estatísticas
const EstatsBar: FC<{
  totalDemandas: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
}> = ({ totalDemandas, pendentes, emAndamento, concluidas }) => {
  const pendentesPerc = (pendentes / totalDemandas) * 100;
  const emAndamentoPerc = (emAndamento / totalDemandas) * 100;
  const concluidasPerc = (concluidas / totalDemandas) * 100;

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
      <div
        className="bg-yellow-500 h-full float-left"
        style={{ width: `${pendentesPerc}%` }}
      />
      <div
        className="bg-blue-500 h-full float-left"
        style={{ width: `${emAndamentoPerc}%` }}
      />
      <div
        className="bg-green-500 h-full float-left"
        style={{ width: `${concluidasPerc}%` }}
      />
    </div>
  );
};

// Componente para o indicador de status
const StatusIndicator: FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pendente: { label: "Pendente", className: "bg-yellow-500 text-yellow-50" },
    em_andamento: { label: "Em Andamento", className: "bg-blue-500 text-blue-50" },
    concluida: { label: "Concluída", className: "bg-green-500 text-green-50" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-500 text-gray-50" };

  return (
    <Badge className={config.className}>{config.label}</Badge>
  );
};

// Componente para o indicador de prioridade
const PriorityIndicator: FC<{ prioridade: string }> = ({ prioridade }) => {
  const prioridadeConfig = {
    alta: { label: "Alta", className: "bg-red-500 text-red-50" },
    média: { label: "Média", className: "bg-orange-500 text-orange-50" },
    baixa: { label: "Baixa", className: "bg-green-500 text-green-50" },
  };

  const config = prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || { label: prioridade, className: "bg-gray-500 text-gray-50" };

  return (
    <Badge className={config.className}>{config.label}</Badge>
  );
};

// Componente KPI Card para indicadores regionais
const IndicadorRegional: FC<{
  titulo: string;
  valor: string | number;
  unidade?: string;
  tendencia?: 'up' | 'down' | 'stable';
  cor?: string;
  meta?: number;
}> = ({ titulo, valor, unidade = "", tendencia, cor = "blue", meta }) => {
  const getTendenciaIcon = () => {
    switch(tendencia) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
      <div>
        <p className="text-sm text-muted-foreground">{titulo}</p>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold">{valor}{unidade}</span>
          {getTendenciaIcon()}
        </div>
        {meta && (
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-muted-foreground">Meta: {meta}{unidade}</span>
            <Progress value={(Number(valor) / meta) * 100} className="w-12 h-1" />
          </div>
        )}
      </div>
      <Target className={`h-8 w-8 text-${cor}-500`} />
    </div>
  );
};

// Componente para a página de Mapa de Demandas
const MapaDemandas: FC = () => {
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(regioesData[0]);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState("30d");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());

  const atualizarDados = () => {
    setUltimaAtualizacao(new Date());
    // Aqui seria feita a atualização dos dados do backend
  };

  // Extrair os tipos de demandas mais comuns das categorias
  const tiposDemandas = categoriasDemandas
    .flatMap(cat => cat.subcategorias)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  return (
    
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Mapa de Demandas Georreferenciado</h1>
            <p className="text-sm text-muted-foreground">
              Última atualização: {ultimaAtualizacao.toLocaleTimeString("pt-BR")}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={atualizarDados}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Ajuda
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sobre o Mapa de Demandas</DialogTitle>
                  <DialogDescription>
                    Visualização georreferenciada avançada de todas as demandas municipais com análise de tendências,
                    indicadores de performance e alertas de criticidade por região.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <h4 className="font-medium">Funcionalidades avançadas:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Mapa de calor por densidade de demandas</li>
                    <li>Indicadores de tempo médio de resposta por região</li>
                    <li>Análise de satisfação do cidadão</li>
                    <li>Alertas de criticidade automáticos</li>
                    <li>Comparativo de performance entre regiões</li>
                    <li>Evolução temporal das demandas</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Indicadores Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <IndicadorRegional
            titulo="Tempo Médio de Resposta"
            valor={indicadoresRegionais.tempoMedioGeral}
            unidade=" dias"
            tendencia="down"
            meta={3.5}
            cor="blue"
          />
          <IndicadorRegional
            titulo="Satisfação Geral"
            valor={indicadoresRegionais.satisfacaoGeral}
            unidade="%"
            tendencia="up"
            meta={80}
            cor="green"
          />
          <IndicadorRegional
            titulo="Taxa de Resolução"
            valor={indicadoresRegionais.taxaResolucao}
            unidade="%"
            tendencia="up"
            meta={85}
            cor="purple"
          />
          <IndicadorRegional
            titulo="Total de Demandas"
            valor={regioesData.reduce((sum, r) => sum + r.totalDemandas, 0)}
            tendencia={indicadoresRegionais.tendenciaGeral as any}
            cor="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Visualização do Mapa</CardTitle>
                <CardDescription>Clique em uma região para ver detalhes</CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Select defaultValue="todas">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as categorias</SelectItem>
                      <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="saneamento">Saneamento</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="seguranca">Segurança</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="todos">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="pendente">Pendentes</SelectItem>
                      <SelectItem value="andamento">Em andamento</SelectItem>
                      <SelectItem value="concluido">Concluídas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="30d">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="90d">Últimos 90 dias</SelectItem>
                      <SelectItem value="1a">Último ano</SelectItem>
                      <SelectItem value="todos">Todo o período</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Mais filtros
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative h-96 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>Mapa interativo será carregado aqui</p>
                    <p className="text-sm">Visualização georreferenciada de demandas por região</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs">Pendentes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs">Em andamento</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs">Concluídas</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: 576 demandas
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Detalhes da Região</CardTitle>
                <CardDescription>Estatísticas e demandas específicas</CardDescription>
                <Select defaultValue="1">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma região" />
                  </SelectTrigger>
                  <SelectContent>
                    {regioesData.map((regiao) => (
                      <SelectItem key={regiao.id} value={regiao.id.toString()}>
                        {regiao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[480px]">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Estatísticas da Região Centro</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Total de Demandas</span>
                          <span className="font-medium">124</span>
                        </div>
                        <EstatsBar
                          totalDemandas={124}
                          pendentes={45}
                          emAndamento={32}
                          concluidas={47}
                        />
                        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                          <span>45 Pendentes</span>
                          <span>32 Em andamento</span>
                          <span>47 Concluídas</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Tipos de demandas mais comuns</h4>
                        <div className="space-y-2">
                          {tiposDemandas.map((tipo, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{tipo.tipo}</span>
                              <span className="font-medium">{tipo.quantidade}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-3">Demandas específicas</h3>
                    <Tabs defaultValue="todas">
                      <TabsList className="w-full">
                        <TabsTrigger value="todas" className="flex-1">Todas</TabsTrigger>
                        <TabsTrigger value="pendentes" className="flex-1">Pendentes</TabsTrigger>
                        <TabsTrigger value="emAndamento" className="flex-1">Em andamento</TabsTrigger>
                        <TabsTrigger value="concluidas" className="flex-1">Concluídas</TabsTrigger>
                      </TabsList>

                      <TabsContent value="todas" className="mt-4 space-y-4">
                        {demandasExemplo.map((demanda) => (
                          <div
                            key={demanda.id}
                            className="p-3 border rounded-lg border-border hover:bg-muted cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{demanda.descricao}</p>
                                <p className="text-sm text-muted-foreground">
                                  {demanda.bairro} - {new Date(demanda.dataCriacao).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <StatusIndicator status={demanda.status} />
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-xs text-muted-foreground">{demanda.id}</div>
                              <PriorityIndicator prioridade={demanda.prioridade} />
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                      
                      <TabsContent value="pendentes" className="mt-4 space-y-4">
                        <div className="p-3 border rounded-lg border-border hover:bg-muted cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Falta de iluminação na Rua das Flores</p>
                              <p className="text-sm text-muted-foreground">
                                Centro - 10/05/2025
                              </p>
                            </div>
                            <div>
                              <StatusIndicator status="pendente" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-muted-foreground">DM-2025-001</div>
                            <PriorityIndicator prioridade="alta" />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="emAndamento" className="mt-4 space-y-4">
                        <div className="p-3 border rounded-lg border-border hover:bg-muted cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Buraco na pavimentação da Av. Principal</p>
                              <p className="text-sm text-muted-foreground">
                                Zona Norte - 08/05/2025
                              </p>
                            </div>
                            <div>
                              <StatusIndicator status="em_andamento" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-muted-foreground">DM-2025-002</div>
                            <PriorityIndicator prioridade="média" />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="concluidas" className="mt-4 space-y-4">
                        <div className="p-3 border rounded-lg border-border hover:bg-muted cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Coleta de lixo irregular</p>
                              <p className="text-sm text-muted-foreground">
                                Zona Sul - 05/05/2025
                              </p>
                            </div>
                            <div>
                              <StatusIndicator status="concluida" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-muted-foreground">DM-2025-003</div>
                            <PriorityIndicator prioridade="baixa" />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline">Carregar mais</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gráficos de Análise Avançada */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
              <CardDescription>Volume de demandas por área</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Gráfico de Pizza - Categorias</p>
                  </div>
                </div>
                {/* <ResponsivePie
                  data={categoriasDemandas.map(cat => ({
                    id: cat.categoria,
                    label: cat.categoria,
                    value: cat.total,
                    color: cat.cor
                  }))}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  borderWidth={1}
                  borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: "color" }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                /> */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução Temporal</CardTitle>
              <CardDescription>Demandas vs Resolvidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Gráfico de Linha - Evolução Temporal</p>
                  </div>
                </div>
                {/* <ResponsiveLine
                  data={[
                    {
                      id: "Demandas",
                      color: "hsl(210, 70%, 50%)",
                      data: evolucaoTemporal.map(d => ({ x: d.periodo, y: d.demandas })),
                    },
                    {
                      id: "Resolvidas",
                      color: "hsl(142, 70%, 45%)",
                      data: evolucaoTemporal.map(d => ({ x: d.periodo, y: d.resolvidas })),
                    },
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
                /> */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance por Região</CardTitle>
              <CardDescription>Tempo de resposta por área</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Gráfico de Barras - Performance Regional</p>
                  </div>
                </div>
                {/* <ResponsiveBar
                  data={regioesData.map(regiao => ({
                    regiao: regiao.nome,
                    tempo: regiao.tempoMedioResposta,
                    satisfacao: regiao.satisfacao,
                    demandas: regiao.totalDemandas
                  }))}
                  keys={["tempo"]}
                  indexBy="regiao"
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
                    legend: "Região",
                    legendPosition: "middle",
                    legendOffset: 32,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Dias",
                    legendPosition: "middle",
                    legendOffset: -40,
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                /> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Executivo */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumo Executivo</CardTitle>
            <CardDescription>Insights e recomendações baseadas na análise georreferenciada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-sm">Região de Maior Criticidade</h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>{indicadoresRegionais.regiaoPiorPerformance}</strong> apresenta maior tempo de resposta 
                      (5.8 dias) e menor satisfação (65%). Recomenda-se reforço de equipe.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-sm">Melhor Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>{indicadoresRegionais.regiaoMelhorPerformance}</strong> mantém excelente performance 
                      com 4.1 dias de resposta médio e 82% de satisfação.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-sm">Tendência Geral</h4>
                    <p className="text-sm text-muted-foreground">
                      Volume de demandas em crescimento de 15% este mês. 
                      Categoria "Infraestrutura" representa 44% do total.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Recomendações Estratégicas</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="h-1.5 w-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Priorizar atendimento na Zona Sul com equipe adicional</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="h-1.5 w-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Implementar programa preventivo de infraestrutura</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Expandir canais de comunicação com cidadãos</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Replicar boas práticas da Zona Norte</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
};

export default MapaDemandas;
