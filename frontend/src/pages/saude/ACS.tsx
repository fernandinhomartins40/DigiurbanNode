
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Users, 
  Calendar, 
  ClipboardCheck,
  Home,
  Map,
  CheckCircle,
  FileText,
  UserCheck,
  AlertTriangle,
  User
} from "lucide-react";
import { ACSVisit } from "@/types/saude";

// Mock data for ACS visits
const mockVisits: ACSVisit[] = [
  {
    id: "1",
    agentName: "Ana Maria Silva",
    area: "01",
    micro: "02",
    familyId: "F12345",
    address: "Rua das Flores, 123 - Centro",
    visitDate: "2025-05-20",
    visitTime: "09:30",
    visitType: "rotina",
    completed: true,
    findings: "Família completa. Criança com vacinas em dia. Idoso com hipertensão controlada.",
    followUpRequired: false
  },
  {
    id: "2",
    agentName: "Carlos Santos",
    area: "01",
    micro: "03",
    familyId: "F23456",
    address: "Av. Principal, 456 - Jardim América",
    visitDate: "2025-05-20",
    visitTime: "11:00",
    visitType: "acompanhamento",
    completed: true,
    findings: "Gestante no 7º mês. Consulta pré-natal agendada para próxima semana. Pressão arterial normal.",
    followUpRequired: true
  },
  {
    id: "3",
    agentName: "João Oliveira",
    area: "02",
    micro: "01",
    familyId: "F34567",
    address: "Rua dos Pinheiros, 789 - Vila Nova",
    visitDate: "2025-05-21",
    visitTime: "08:30",
    visitType: "busca ativa",
    completed: false,
    findings: "",
    followUpRequired: false
  },
  {
    id: "4",
    agentName: "Ana Maria Silva",
    area: "01",
    micro: "02",
    familyId: "F45678",
    address: "Rua das Acácias, 234 - Centro",
    visitDate: "2025-05-21",
    visitTime: "10:00",
    visitType: "rotina",
    completed: false,
    findings: "",
    followUpRequired: false
  },
  {
    id: "5",
    agentName: "Paulo Ribeiro",
    area: "03",
    micro: "02",
    familyId: "F56789",
    address: "Av. São Paulo, 567 - Jardim Esperança",
    visitDate: "2025-05-19",
    visitTime: "14:30",
    visitType: "primeira visita",
    completed: true,
    findings: "Família recém-chegada ao município. 4 pessoas (casal e 2 filhos). Documentação completa. Crianças precisam atualizar caderneta de vacinação.",
    followUpRequired: true
  },
  {
    id: "6",
    agentName: "Mariana Costa",
    area: "02",
    micro: "03",
    familyId: "F67890",
    address: "Rua das Margaridas, 890 - Jardim das Flores",
    visitDate: "2025-05-19",
    visitTime: "15:45",
    visitType: "acompanhamento",
    completed: true,
    findings: "Idoso acamado com úlcera de pressão em tratamento. Cuidador orientado sobre os cuidados necessários.",
    followUpRequired: true
  }
];

// Mock data for ACS agents
const mockAgents = [
  { name: "Ana Maria Silva", area: "01", micro: "02", familiesCount: 120, pendingVisits: 8 },
  { name: "Carlos Santos", area: "01", micro: "03", familiesCount: 115, pendingVisits: 5 },
  { name: "João Oliveira", area: "02", micro: "01", familiesCount: 98, pendingVisits: 12 },
  { name: "Paulo Ribeiro", area: "03", micro: "02", familiesCount: 105, pendingVisits: 3 },
  { name: "Mariana Costa", area: "02", micro: "03", familiesCount: 110, pendingVisits: 7 }
];

// Mock data for microareas coverage
const mockMicroareasCoverage = [
  { area: "01", micro: "01", coverage: 98, families: 125, complete: true },
  { area: "01", micro: "02", coverage: 100, families: 120, complete: true },
  { area: "01", micro: "03", coverage: 95, families: 115, complete: true },
  { area: "02", micro: "01", coverage: 90, families: 98, complete: true },
  { area: "02", micro: "02", coverage: 0, families: 110, complete: false },
  { area: "02", micro: "03", coverage: 85, families: 110, complete: true },
  { area: "03", micro: "01", coverage: 0, families: 105, complete: false },
  { area: "03", micro: "02", coverage: 93, families: 105, complete: true },
  { area: "03", micro: "03", coverage: 0, families: 112, complete: false }
];

// Calculate some statistics
const totalAgents = mockAgents.length;
const totalFamilies = mockAgents.reduce((acc, agent) => acc + agent.familiesCount, 0);
const totalVisitsToday = mockVisits.filter(v => v.visitDate === "2025-05-20").length;
const totalCompletedVisits = mockVisits.filter(v => v.completed).length;
const totalPendingVisits = mockVisits.filter(v => !v.completed).length;
const followUpsRequired = mockVisits.filter(v => v.followUpRequired).length;

// Coverage statistics
const totalMicroareas = mockMicroareasCoverage.length;
const coveredMicroareas = mockMicroareasCoverage.filter(m => m.complete).length;
const coveragePercentage = (coveredMicroareas / totalMicroareas) * 100;

const visitTypeColors: Record<string, string> = {
  "rotina": "bg-blue-500",
  "acompanhamento": "bg-green-500",
  "busca ativa": "bg-amber-500",
  "primeira visita": "bg-purple-500"
};

const ACS = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("todas");
  const [selectedAgent, setSelectedAgent] = useState<string>("todos");
  const [dateFilter, setDateFilter] = useState<string>("");
  
  // Filter visits based on search term, area, agent, and date
  const filteredVisits = mockVisits.filter((visit) => {
    const matchesSearch = 
      visit.familyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === "todas" ? true : visit.area === selectedArea;
    const matchesAgent = selectedAgent === "todos" ? true : visit.agentName === selectedAgent;
    const matchesDate = dateFilter ? visit.visitDate === dateFilter : true;
    
    return matchesSearch && matchesArea && matchesAgent && matchesDate;
  });

  // Get unique areas for filtering
  const areas = Array.from(new Set(mockVisits.map(v => v.area)));
  
  // Get unique agent names for filtering
  const agents = Array.from(new Set(mockVisits.map(v => v.agentName)));

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Agentes Comunitários de Saúde (ACS)</h1>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Map className="mr-2 h-4 w-4" /> Mapa de Microáreas
            </Button>
            <Button>
              <Calendar className="mr-2 h-4 w-4" /> Nova Visita
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle>Agentes ACS</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{totalAgents}</div>
              <p className="text-sm text-muted-foreground mt-2">Agentes ativos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle>Famílias Cadastradas</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{totalFamilies}</div>
              <p className="text-sm text-muted-foreground mt-2">Total de famílias</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
              <CardTitle>Visitas Hoje</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{totalVisitsToday}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {totalCompletedVisits} realizadas, {totalPendingVisits} pendentes
              </p>
            </CardContent>
          </Card>
          
          <Card className={coveragePercentage < 100 ? "border-red-500" : ""}>
            <CardHeader className={`${coveragePercentage < 100 ? "bg-red-50 dark:bg-red-900/20" : "bg-green-50 dark:bg-green-900/20"}`}>
              <CardTitle>Cobertura Territorial</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{coveragePercentage.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground mt-2">
                {coveredMicroareas}/{totalMicroareas} microáreas com ACS
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="visitas">
          <TabsList className="grid grid-cols-4 mb-4 w-[500px]">
            <TabsTrigger value="visitas">Registro de Visitas</TabsTrigger>
            <TabsTrigger value="agentes">Agentes</TabsTrigger>
            <TabsTrigger value="microareas">Microáreas</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visitas">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Visitas Domiciliares</CardTitle>
                <CardDescription>
                  Gerencie as visitas dos Agentes Comunitários de Saúde
                </CardDescription>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por família ou endereço..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as áreas</SelectItem>
                      {areas.map((area) => (
                        <SelectItem key={area} value={area}>
                          Área {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Agente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os agentes</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent} value={agent}>
                          {agent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full sm:w-[180px]"
                  />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Família/Endereço</TableHead>
                        <TableHead>Agente</TableHead>
                        <TableHead>Área/Micro</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Acompanhamento</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            Nenhuma visita encontrada com os filtros aplicados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredVisits.map((visit) => (
                          <TableRow key={visit.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span className="font-medium">{visit.familyId}</span>
                                <span className="text-xs text-muted-foreground">{visit.address}</span>
                              </div>
                            </TableCell>
                            <TableCell>{visit.agentName}</TableCell>
                            <TableCell>{`Área ${visit.area} / Micro ${visit.micro}`}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{new Date(visit.visitDate).toLocaleDateString('pt-BR')}</span>
                                <span className="text-xs text-muted-foreground">{visit.visitTime}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`${visitTypeColors[visit.visitType]} text-white`}>
                                {visit.visitType.charAt(0).toUpperCase() + visit.visitType.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {visit.completed ? (
                                <Badge variant="outline" className="bg-green-500 text-white">
                                  Realizada
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-blue-500 text-white">
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {visit.followUpRequired && visit.completed ? (
                                <Badge variant="outline" className="bg-red-500 text-white">
                                  Necessário
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {!visit.completed ? (
                                  <Button variant="outline" size="sm">
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Exibindo {filteredVisits.length} de {mockVisits.length} visitas
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Anterior</Button>
                  <Button variant="outline" size="sm">Próximo</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="agentes">
            <Card>
              <CardHeader>
                <CardTitle>Equipe de Agentes Comunitários</CardTitle>
                <CardDescription>
                  Gerenciamento da equipe de ACS por área e microárea
                </CardDescription>
                
                <div className="flex justify-end mt-4">
                  <Button>
                    <UserCheck className="mr-2 h-4 w-4" /> Cadastrar Novo Agente
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agente</TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead>Microárea</TableHead>
                        <TableHead>Famílias Cadastradas</TableHead>
                        <TableHead>Visitas Pendentes</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAgents.map((agent, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              {agent.name}
                            </div>
                          </TableCell>
                          <TableCell>{agent.area}</TableCell>
                          <TableCell>{agent.micro}</TableCell>
                          <TableCell>{agent.familiesCount}</TableCell>
                          <TableCell>
                            <Badge variant={agent.pendingVisits > 0 ? "destructive" : "default"}>
                              {agent.pendingVisits}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">Detalhes</Button>
                              <Button variant="outline" size="sm">Produção</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="microareas">
            <Card>
              <CardHeader>
                <CardTitle>Cobertura por Microáreas</CardTitle>
                <CardDescription>
                  Mapa de cobertura de agentes por território
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Área</TableHead>
                        <TableHead>Microárea</TableHead>
                        <TableHead>Famílias</TableHead>
                        <TableHead>Cobertura</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockMicroareasCoverage.map((micro, index) => (
                        <TableRow key={index}>
                          <TableCell>{micro.area}</TableCell>
                          <TableCell>{micro.micro}</TableCell>
                          <TableCell>{micro.families}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${micro.coverage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{micro.coverage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {micro.complete ? (
                              <Badge className="bg-green-500 text-white">Coberta</Badge>
                            ) : (
                              <Badge variant="destructive">Descoberta</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">Detalhes</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Áreas Descobertas</CardTitle>
                <CardDescription>
                  Microáreas sem cobertura de ACS
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {mockMicroareasCoverage.filter(micro => !micro.complete).length > 0 ? (
                  <div className="space-y-4">
                    {mockMicroareasCoverage
                      .filter(micro => !micro.complete)
                      .map((micro, index) => (
                        <Card key={index} className="border-red-200 dark:border-red-900/50">
                          <CardHeader className="bg-red-50 dark:bg-red-900/20 pb-2">
                            <div className="flex justify-between">
                              <CardTitle>Área {micro.area} / Microárea {micro.micro}</CardTitle>
                              <Badge variant="destructive">Sem Cobertura</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Famílias cadastradas</p>
                                <p className="text-lg font-semibold">{micro.families}</p>
                              </div>
                              <Button className="ml-auto">
                                <UserCheck className="mr-2 h-4 w-4" />
                                Atribuir Agente
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium">Cobertura Total</h3>
                    <p className="text-muted-foreground mt-2">
                      Todas as microáreas possuem cobertura de ACS.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="relatorios">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtividade dos Agentes</CardTitle>
                  <CardDescription>Análise das visitas realizadas por agente</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <ClipboardCheck size={48} className="mx-auto text-blue-500 mb-4" />
                    <p className="text-muted-foreground">
                      Aqui serão exibidos gráficos de produtividade dos agentes.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Necessidades Identificadas</CardTitle>
                  <CardDescription>Demandas encontradas durante as visitas</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
                    <p className="text-muted-foreground">
                      Aqui serão exibidos gráficos de necessidades identificadas.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Indicadores Territoriais</CardTitle>
                  <CardDescription>Análise de indicadores por área e microárea</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <Map size={48} className="mx-auto text-green-500 mb-4" />
                    <p className="text-muted-foreground">
                      Aqui serão exibidos mapas e gráficos com indicadores territoriais.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default ACS;
