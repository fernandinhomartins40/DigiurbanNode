import { useState } from "react";
// Layout removido - já está no App.tsx
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
import { 
  GraduationCap,
  Users,
  School,
  Bus,
  TrendingUp,
  BookOpen,
  UserPlus,
  MapPin,
  Calendar,
  FileText,
  Apple,
  Route
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const matriculasData = [
  { mes: "Jan", novas: 45, transferencias: 12, evasoes: 8 },
  { mes: "Fev", novas: 52, transferencias: 15, evasoes: 5 },
  { mes: "Mar", novas: 38, transferencias: 8, evasoes: 12 },
  { mes: "Abr", novas: 41, transferencias: 18, evasoes: 7 },
  { mes: "Mai", novas: 49, transferencias: 14, evasoes: 9 }
];

const frequenciaData = [
  { mes: "Jan", frequencia: 92.5 },
  { mes: "Fev", frequencia: 94.2 },
  { mes: "Mar", frequencia: 91.8 },
  { mes: "Abr", frequencia: 93.7 },
  { mes: "Mai", frequencia: 95.1 }
];

const escolasData = [
  { nome: "E.M. João Paulo", alunos: 450, color: "#3b82f6" },
  { nome: "E.M. Maria José", alunos: 380, color: "#10b981" },
  { nome: "CMEI Pequeno Príncipe", alunos: 220, color: "#f59e0b" },
  { nome: "E.M. Paulo Freire", alunos: 325, color: "#8b5cf6" }
];

const transporteEstatisticas = [
  { rota: "Rota Norte", estudantes: 35, distancia: 25.5 },
  { rota: "Rota Sul", estudantes: 25, distancia: 12.8 },
  { rota: "Rota Centro", estudantes: 12, distancia: 8.2 }
];

const DashboardEducacao = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("mes");

  const totalAlunos = escolasData.reduce((sum, escola) => sum + escola.alunos, 0);
  const totalTransportados = transporteEstatisticas.reduce((sum, rota) => sum + rota.estudantes, 0);

  return (
    <div>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <GraduationCap className="mr-3 h-8 w-8 text-blue-500" />
              Dashboard Secretaria de Educação
            </h1>
            <p className="text-muted-foreground">Indicadores e métricas da educação municipal</p>
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
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAlunos.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +3.2% em relação ao ano anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escolas Ativas</CardTitle>
              <School className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{escolasData.length}</div>
              <p className="text-xs text-muted-foreground">
                100% em funcionamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.3%</div>
              <p className="text-xs text-muted-foregreen">
                Meta: 90%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transporte Escolar</CardTitle>
              <Bus className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransportados}</div>
              <p className="text-xs text-muted-foreground">
                Estudantes transportados
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList>
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="matriculas">Matrículas</TabsTrigger>
            <TabsTrigger value="escolas">Escolas</TabsTrigger>
            <TabsTrigger value="transporte">Transporte</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Alunos por Escola</CardTitle>
                  <CardDescription>Número de alunos matriculados por unidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={escolasData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="alunos" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evolução da Frequência</CardTitle>
                  <CardDescription>Percentual de frequência mensal</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={frequenciaData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis domain={[85, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="frequencia" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Indicadores de Qualidade</CardTitle>
                  <CardDescription>Principais métricas educacionais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Taxa de Aprovação</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">96.5%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Taxa de Evasão</span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">2.1%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Alunos por Turma</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">23</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Professores Qualificados</span>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">98%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Alimentação Escolar</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">100%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Infraestrutura Adequada</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">95%</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximos Eventos</CardTitle>
                  <CardDescription>Agenda educacional</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 border rounded">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Conselho de Classe</p>
                      <p className="text-xs text-muted-foreground">25/05/2025</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 border rounded">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Feira de Ciências</p>
                      <p className="text-xs text-muted-foreground">02/06/2025</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 border rounded">
                    <Users className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Reunião de Pais</p>
                      <p className="text-xs text-muted-foreground">10/06/2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matriculas" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Movimentação de Matrículas</CardTitle>
                  <CardDescription>Novas matrículas, transferências e evasões</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={matriculasData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="novas" fill="#10b981" name="Novas" />
                      <Bar dataKey="transferencias" fill="#3b82f6" name="Transferências" />
                      <Bar dataKey="evasoes" fill="#ef4444" name="Evasões" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Matrículas por Nível</CardTitle>
                  <CardDescription>Distribuição por etapa de ensino</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Educação Infantil", value: 380, color: "#3b82f6" },
                          { name: "Ensino Fundamental I", value: 620, color: "#10b981" },
                          { name: "Ensino Fundamental II", value: 375, color: "#f59e0b" }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Educação Infantil</span>
                      </div>
                      <span className="text-sm font-medium">380</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Fundamental I</span>
                      </div>
                      <span className="text-sm font-medium">620</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-sm">Fundamental II</span>
                      </div>
                      <span className="text-sm font-medium">375</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="escolas" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status das Escolas</CardTitle>
                  <CardDescription>Situação de cada unidade educacional</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {escolasData.map((escola, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <School className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">{escola.nome}</p>
                          <p className="text-xs text-muted-foreground">{escola.alunos} alunos matriculados</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Ativa
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Infraestrutura</CardTitle>
                  <CardDescription>Status das instalações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Salas de Aula</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">95%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Laboratórios</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">75%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bibliotecas</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">100%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quadras Esportivas</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-amber-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">50%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transporte" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rotas de Transporte</CardTitle>
                  <CardDescription>Estatísticas por rota ativa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transporteEstatisticas.map((rota, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Route className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">{rota.rota}</p>
                          <p className="text-xs text-muted-foreground">
                            {rota.estudantes} estudantes • {rota.distancia} km
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Ativa
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Merenda Escolar</CardTitle>
                  <CardDescription>Estatísticas de alimentação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded">
                      <Apple className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <div className="text-2xl font-bold">1.850</div>
                      <div className="text-xs text-muted-foreground">Refeições/dia</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <FileText className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <div className="text-2xl font-bold">5</div>
                      <div className="text-xs text-muted-foreground">Cardápios ativos</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Adequação Nutricional</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">98%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Aceitação dos Alunos</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">92%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Controle de Estoque</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">95%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardEducacao;