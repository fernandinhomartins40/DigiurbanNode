
import { FC } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Clock,
  Users,
  Target
} from "lucide-react";

const dadosEvolucao = [
  { mes: 'Jan', ocorrencias: 45 },
  { mes: 'Fev', ocorrencias: 52 },
  { mes: 'Mar', ocorrencias: 38 },
  { mes: 'Abr', ocorrencias: 41 },
  { mes: 'Mai', ocorrencias: 35 },
  { mes: 'Jun', ocorrencias: 43 }
];

const dadosPorTipo = [
  { tipo: 'Furto', quantidade: 28, percentual: 35, color: '#ef4444' },
  { tipo: 'Vandalismo', quantidade: 18, percentual: 22.5, color: '#f97316' },
  { tipo: 'Perturbação', quantidade: 15, percentual: 18.8, color: '#eab308' },
  { tipo: 'Roubo', quantidade: 12, percentual: 15, color: '#3b82f6' },
  { tipo: 'Outros', quantidade: 7, percentual: 8.7, color: '#6b7280' }
];

const pontosQuentes = [
  { local: 'Praça Central', ocorrencias: 15, tipo: 'Alto Risco' },
  { local: 'Terminal Rodoviário', ocorrencias: 12, tipo: 'Médio Risco' },
  { local: 'Parque Municipal', ocorrencias: 8, tipo: 'Médio Risco' },
  { local: 'Centro Comercial', ocorrencias: 6, tipo: 'Baixo Risco' },
  { local: 'Escola Central', ocorrencias: 4, tipo: 'Baixo Risco' }
];

const horariosFrequentes = [
  { horario: '18-20h', quantidade: 18 },
  { horario: '20-22h', quantidade: 15 },
  { horario: '14-16h', quantidade: 12 },
  { horario: '22-00h', quantidade: 10 },
  { horario: '16-18h', quantidade: 8 },
  { horario: '12-14h', quantidade: 7 }
];

const EstatisticasRegionais: FC = () => {
  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-purple-600" />
              Estatísticas Regionais
            </h1>
            <p className="text-muted-foreground mt-2">
              Análise estatística da segurança pública por região
            </p>
          </div>
          <div className="flex space-x-2">
            <Select defaultValue="todos">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Regiões</SelectItem>
                <SelectItem value="centro">Centro</SelectItem>
                <SelectItem value="norte">Zona Norte</SelectItem>
                <SelectItem value="sul">Zona Sul</SelectItem>
                <SelectItem value="leste">Zona Leste</SelectItem>
                <SelectItem value="oeste">Zona Oeste</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="6meses">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1mes">1 Mês</SelectItem>
                <SelectItem value="3meses">3 Meses</SelectItem>
                <SelectItem value="6meses">6 Meses</SelectItem>
                <SelectItem value="1ano">1 Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total de Ocorrências</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold">234</p>
                    <div className="flex items-center ml-2 text-sm text-green-600">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span>8.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Tempo Médio Resolução</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold">3.2 dias</p>
                    <div className="flex items-center ml-2 text-sm text-green-600">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span>12%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <PieChartIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Resolução</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold">92.4%</p>
                    <div className="flex items-center ml-2 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>3.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pontos Críticos</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold">21</p>
                    <div className="flex items-center ml-2 text-sm text-red-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>2</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Evolução de Ocorrências</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dadosEvolucao}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="ocorrencias"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Ocorrências por Tipo</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosPorTipo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="quantidade"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dadosPorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Horários com Mais Ocorrências</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={horariosFrequentes}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="horario" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Principais Pontos Quentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pontosQuentes.map((ponto, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-500">{index + 1}</span>
                      <div>
                        <p className="font-medium">{ponto.local}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <Badge
                            className={
                              ponto.tipo === 'Alto Risco' ? 'bg-red-100 text-red-800' :
                              ponto.tipo === 'Médio Risco' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {ponto.tipo}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{ponto.ocorrencias}</span>
                      <span className="text-sm text-muted-foreground">ocorrências</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Análise Comparativa por Região</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-2">Centro</p>
                  <p className="text-2xl font-bold">68</p>
                  <p className="text-sm text-red-600 flex items-center justify-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>5.2%</span>
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-2">Zona Norte</p>
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-sm text-green-600 flex items-center justify-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    <span>3.8%</span>
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-2">Zona Sul</p>
                  <p className="text-2xl font-bold">52</p>
                  <p className="text-sm text-green-600 flex items-center justify-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    <span>7.5%</span>
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-2">Zona Leste</p>
                  <p className="text-2xl font-bold">36</p>
                  <p className="text-sm text-red-600 flex items-center justify-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>2.1%</span>
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-2">Zona Oeste</p>
                  <p className="text-2xl font-bold">33</p>
                  <p className="text-sm text-green-600 flex items-center justify-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    <span>4.3%</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Eficiência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-blue-500" />
                      Tempo de Resposta
                    </p>
                    <Badge className="bg-green-100 text-green-800">8.2% melhor</Badge>
                  </div>
                  <p className="text-2xl font-bold">15.4 min</p>
                  <div className="bg-gray-100 h-2 rounded-full">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium flex items-center">
                      <Users className="mr-2 h-4 w-4 text-purple-500" />
                      Satisfação do Cidadão
                    </p>
                    <Badge className="bg-green-100 text-green-800">3.5% melhor</Badge>
                  </div>
                  <p className="text-2xl font-bold">87.2%</p>
                  <div className="bg-gray-100 h-2 rounded-full">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87.2%' }}></div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium flex items-center">
                      <Target className="mr-2 h-4 w-4 text-red-500" />
                      Reincidência
                    </p>
                    <Badge className="bg-green-100 text-green-800">5.8% melhor</Badge>
                  </div>
                  <p className="text-2xl font-bold">12.5%</p>
                  <div className="bg-gray-100 h-2 rounded-full">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '12.5%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
};

export default EstatisticasRegionais;
