
import { FC, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart, Bar } from "recharts";
import { Filter, Download, Users, Activity } from "lucide-react";

// Dados de exemplo para os gráficos
const usoDiarioData = [
  { name: "Seg", acessos: 120, acoes: 240 },
  { name: "Ter", acessos: 140, acoes: 280 },
  { name: "Qua", acessos: 190, acoes: 390 },
  { name: "Qui", acessos: 150, acoes: 310 },
  { name: "Sex", acessos: 180, acoes: 320 },
  { name: "Sáb", acessos: 40, acoes: 60 },
  { name: "Dom", acessos: 30, acoes: 40 }
];

const setoresData = [
  { name: "Saúde", acessos: 400, usuarios: 20 },
  { name: "Educação", acessos: 300, usuarios: 15 },
  { name: "Urbanismo", acessos: 200, usuarios: 10 },
  { name: "Assistência", acessos: 180, usuarios: 8 },
  { name: "Meio Ambiente", acessos: 120, usuarios: 5 }
];

const dispositivosData = [
  { name: "Desktop", valor: 65 },
  { name: "Mobile", valor: 30 },
  { name: "Tablet", valor: 5 }
];

const modulosData = [
  { name: "Portal do Cidadão", acessos: 280 },
  { name: "Gabinete", acessos: 150 },
  { name: "Correio", acessos: 240 },
  { name: "Administração", acessos: 90 },
  { name: "Relatórios", acessos: 120 }
];

const EstatisticasUso: FC = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  return (
    
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Estatísticas de Uso</h1>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Exportar Dados
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros de Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Módulo</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="portal">Portal do Cidadão</SelectItem>
                    <SelectItem value="gabinete">Gabinete</SelectItem>
                    <SelectItem value="correio">Correio</SelectItem>
                    <SelectItem value="admin">Administração</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grupo de Usuários</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="administradores">Administradores</SelectItem>
                    <SelectItem value="gestores">Gestores</SelectItem>
                    <SelectItem value="atendentes">Atendentes</SelectItem>
                    <SelectItem value="cidadaos">Cidadãos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Inicial</label>
                <DatePicker date={startDate} setDate={setStartDate} placeholder="Selecionar data" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Final</label>
                <DatePicker date={endDate} setDate={setEndDate} placeholder="Selecionar data" />
              </div>
            </div>
            <div className="mt-4">
              <Button>
                <Filter className="h-4 w-4 mr-2" /> Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Usuários Ativos</CardTitle>
              <CardDescription>Último período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-10 w-10 text-blue-500 mr-4" />
                <div>
                  <p className="text-3xl font-bold">158</p>
                  <p className="text-sm text-green-600">+12% comparado ao período anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total de Acessos</CardTitle>
              <CardDescription>Último período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="h-10 w-10 text-purple-500 mr-4" />
                <div>
                  <p className="text-3xl font-bold">1.245</p>
                  <p className="text-sm text-green-600">+8% comparado ao período anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Tempo Médio de Sessão</CardTitle>
              <CardDescription>Último período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 mr-4">
                  <span className="text-xl">⏱</span>
                </div>
                <div>
                  <p className="text-3xl font-bold">18:32</p>
                  <p className="text-sm text-red-600">-5% comparado ao período anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="uso">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="uso">Uso Diário</TabsTrigger>
            <TabsTrigger value="setores">Por Setor</TabsTrigger>
            <TabsTrigger value="modulos">Por Módulo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="uso">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Uso Diário</CardTitle>
                <CardDescription>Acessos e ações realizadas no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={usoDiarioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="acessos" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="acoes" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="setores">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acessos por Setor</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={setoresData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="acessos" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Dispositivos</CardTitle>
                  <CardDescription>Tipos de dispositivos usados para acesso</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dispositivosData.map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm">{item.valor}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.name === "Desktop" 
                                ? "bg-blue-500" 
                                : item.name === "Mobile" 
                                  ? "bg-green-500" 
                                  : "bg-purple-500"
                            }`} 
                            style={{ width: `${item.valor}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="modulos">
            <Card>
              <CardHeader>
                <CardTitle>Acessos por Módulo do Sistema</CardTitle>
                <CardDescription>Distribuição de uso entre os módulos principais</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={modulosData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="acessos" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Histórico de Usuários Ativos</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="py-2 px-4 font-medium">Usuário</th>
                  <th className="py-2 px-4 font-medium">Grupo</th>
                  <th className="py-2 px-4 font-medium">Último Acesso</th>
                  <th className="py-2 px-4 font-medium">Sessões</th>
                  <th className="py-2 px-4 font-medium">Tempo Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">João Silva</td>
                  <td className="py-2 px-4">Administrador</td>
                  <td className="py-2 px-4">20/05/2025 08:35</td>
                  <td className="py-2 px-4">45</td>
                  <td className="py-2 px-4">22h 15min</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Maria Oliveira</td>
                  <td className="py-2 px-4">Gestor</td>
                  <td className="py-2 px-4">20/05/2025 10:12</td>
                  <td className="py-2 px-4">38</td>
                  <td className="py-2 px-4">18h 42min</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Carlos Santos</td>
                  <td className="py-2 px-4">Atendente</td>
                  <td className="py-2 px-4">19/05/2025 16:48</td>
                  <td className="py-2 px-4">32</td>
                  <td className="py-2 px-4">15h 10min</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Ana Costa</td>
                  <td className="py-2 px-4">Atendente</td>
                  <td className="py-2 px-4">18/05/2025 14:22</td>
                  <td className="py-2 px-4">28</td>
                  <td className="py-2 px-4">12h 35min</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Lucas Ferreira</td>
                  <td className="py-2 px-4">Gestor</td>
                  <td className="py-2 px-4">17/05/2025 09:15</td>
                  <td className="py-2 px-4">20</td>
                  <td className="py-2 px-4">9h 20min</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    
  );
};

export default EstatisticasUso;
