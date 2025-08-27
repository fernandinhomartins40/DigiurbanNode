
import { FC, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { BarChart, Bar } from "recharts";
import { FileText, Download, Printer, Filter } from "lucide-react";

// Dados de exemplo para os gráficos
const pieData = [
  { name: "Saúde", value: 400 },
  { name: "Educação", value: 300 },
  { name: "Urbanismo", value: 300 },
  { name: "Assistência", value: 200 },
  { name: "Outros", value: 100 }
];

const lineData = [
  { name: "Jan", atendimentos: 400, protocolos: 240 },
  { name: "Fev", atendimentos: 300, protocolos: 139 },
  { name: "Mar", atendimentos: 200, protocolos: 980 },
  { name: "Abr", atendimentos: 278, protocolos: 390 },
  { name: "Mai", atendimentos: 189, protocolos: 480 },
  { name: "Jun", atendimentos: 239, protocolos: 380 }
];

const barData = [
  { name: "Pendentes", quantidade: 400 },
  { name: "Em Análise", quantidade: 300 },
  { name: "Concluídos", quantidade: 600 },
  { name: "Arquivados", quantidade: 200 }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Relatorios: FC = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  return (
    
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" /> Imprimir
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Exportar
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Selecione os filtros para personalizar seu relatório</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Setor</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="assistencia">Assistência Social</SelectItem>
                    <SelectItem value="urbanismo">Urbanismo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Relatório</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atendimentos">Atendimentos</SelectItem>
                    <SelectItem value="protocolos">Protocolos</SelectItem>
                    <SelectItem value="usuarios">Usuários</SelectItem>
                    <SelectItem value="desempenho">Desempenho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Inicial</label>
                <DatePicker date={startDate} setDate={setStartDate} placeholder="Selecionar data inicial" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Final</label>
                <DatePicker date={endDate} setDate={setEndDate} placeholder="Selecionar data final" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Filter className="h-4 w-4 mr-2" /> Aplicar Filtros
            </Button>
          </CardFooter>
        </Card>

        <Tabs defaultValue="resumo">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="atendimentos">Atendimentos</TabsTrigger>
            <TabsTrigger value="protocolos">Protocolos</TabsTrigger>
            <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resumo">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Setor</CardTitle>
                  <CardDescription>Relatórios por área de atendimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status de Protocolos</CardTitle>
                  <CardDescription>Visão geral por situação</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantidade" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Histórico de Atendimentos e Protocolos</CardTitle>
                  <CardDescription>Últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="atendimentos" stroke="#8884d8" />
                      <Line type="monotone" dataKey="protocolos" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="atendimentos">
            <Card>
              <CardHeader>
                <CardTitle>Relatório Detalhado de Atendimentos</CardTitle>
                <CardDescription>Dados detalhados sobre os atendimentos realizados no período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidadão</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setor</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from({length: 5}).map((_, index) => (
                        <tr key={index}>
                          <td className="py-4 px-4 whitespace-nowrap">{10001 + index}</td>
                          <td className="py-4 px-4 whitespace-nowrap">01/06/2025</td>
                          <td className="py-4 px-4 whitespace-nowrap">João Silva</td>
                          <td className="py-4 px-4 whitespace-nowrap">Presencial</td>
                          <td className="py-4 px-4 whitespace-nowrap">Saúde</td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Concluído
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="protocolos">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Protocolos</CardTitle>
                <CardDescription>Visão geral dos protocolos abertos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abertura</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requerente</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assunto</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempo</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from({length: 5}).map((_, index) => (
                        <tr key={index}>
                          <td className="py-4 px-4 whitespace-nowrap">2025/{5001 + index}</td>
                          <td className="py-4 px-4 whitespace-nowrap">05/06/2025</td>
                          <td className="py-4 px-4 whitespace-nowrap">Maria Oliveira</td>
                          <td className="py-4 px-4 whitespace-nowrap">Solicitação de Alvará</td>
                          <td className="py-4 px-4 whitespace-nowrap">5 dias</td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Em Análise
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="desempenho">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Desempenho</CardTitle>
                <CardDescription>Avaliação de performance por setor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Saúde</h4>
                      <span className="text-sm font-bold">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Educação</h4>
                      <span className="text-sm font-bold">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Urbanismo</h4>
                      <span className="text-sm font-bold">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Assistência Social</h4>
                      <span className="text-sm font-bold">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default Relatorios;
