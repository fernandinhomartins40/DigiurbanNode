
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  ChevronDown, 
  Plus, 
  Bus, 
  Users, 
  Clock, 
  MapPin,
  Route,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { TransportRoute } from "@/types/educacao";

// Mock data for transport routes
const mockRoutes: TransportRoute[] = [
  {
    id: "route1",
    name: "Rota Norte - Zona Rural",
    description: "Atende comunidades rurais da região norte",
    vehicle: {
      id: "bus1",
      type: "Ônibus Escolar",
      plate: "ABC-1234",
      capacity: 45,
      driver: "João Silva",
      helper: "Maria Santos"
    },
    schools: [
      {
        id: "sch1",
        name: "Escola Municipal João Paulo",
        arrivalTime: "07:30",
        departureTime: "17:00"
      },
      {
        id: "sch2",
        name: "Escola Municipal Maria José",
        arrivalTime: "08:00",
        departureTime: "16:30"
      }
    ],
    stops: [
      {
        id: "stop1",
        name: "Fazenda Boa Vista",
        time: "06:45",
        location: "Estrada Rural, Km 15",
        studentsCount: 8
      },
      {
        id: "stop2",
        name: "Sítio São João",
        time: "07:00",
        location: "Estrada da Cachoeira, s/n",
        studentsCount: 12
      },
      {
        id: "stop3",
        name: "Vila Rural",
        time: "07:15",
        location: "Rua Principal, 100",
        studentsCount: 15
      }
    ],
    distance: 25.5,
    estimatedTime: 45,
    active: true
  },
  {
    id: "route2",
    name: "Rota Sul - Bairros Periféricos",
    description: "Conecta bairros periféricos ao centro educacional",
    vehicle: {
      id: "bus2",
      type: "Micro-ônibus",
      plate: "DEF-5678",
      capacity: 25,
      driver: "Carlos Oliveira"
    },
    schools: [
      {
        id: "sch3",
        name: "CMEI Pequeno Príncipe",
        arrivalTime: "07:45",
        departureTime: "16:45"
      }
    ],
    stops: [
      {
        id: "stop4",
        name: "Jardim América",
        time: "07:00",
        location: "Av. das Flores, 200",
        studentsCount: 6
      },
      {
        id: "stop5",
        name: "Vila Nova",
        time: "07:15",
        location: "Rua das Crianças, 45",
        studentsCount: 8
      },
      {
        id: "stop6",
        name: "Conjunto Habitacional",
        time: "07:30",
        location: "Rua Central, 300",
        studentsCount: 11
      }
    ],
    distance: 12.8,
    estimatedTime: 30,
    active: true
  },
  {
    id: "route3",
    name: "Rota Centro - Escolas Urbanas",
    description: "Atende estudantes da área central",
    vehicle: {
      id: "bus3",
      type: "Van Escolar",
      plate: "GHI-9012",
      capacity: 15,
      driver: "Ana Paula",
      helper: "Pedro Costa"
    },
    schools: [
      {
        id: "sch4",
        name: "Escola Municipal Paulo Freire",
        arrivalTime: "07:50",
        departureTime: "17:10"
      }
    ],
    stops: [
      {
        id: "stop7",
        name: "Centro Comercial",
        time: "07:20",
        location: "Praça Central, s/n",
        studentsCount: 5
      },
      {
        id: "stop8",
        name: "Residencial dos Professores",
        time: "07:35",
        location: "Rua dos Educadores, 150",
        studentsCount: 7
      }
    ],
    distance: 8.2,
    estimatedTime: 20,
    active: false
  }
];

const getVehicleTypeColor = (type: string) => {
  switch (type) {
    case "Ônibus Escolar":
      return "bg-blue-100 text-blue-800";
    case "Micro-ônibus":
      return "bg-green-100 text-green-800";
    case "Van Escolar":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const TransporteEscolar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [routeFilter, setRouteFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [activeTab, setActiveTab] = useState("rotas");
  
  // Filter routes based on search and filters
  const filteredRoutes = mockRoutes.filter((route) => {
    return (
      (route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       route.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       route.vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (routeFilter === "todos" || route.vehicle.type === routeFilter) &&
      (statusFilter === "todos" || 
       (statusFilter === "active" && route.active) ||
       (statusFilter === "inactive" && !route.active))
    );
  });

  return (
    
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Transporte Escolar</h1>
        
        <Tabs defaultValue="rotas" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="rotas">Rotas de Transporte</TabsTrigger>
            <TabsTrigger value="veiculos">Veículos</TabsTrigger>
            <TabsTrigger value="motoristas">Motoristas e Monitores</TabsTrigger>
            <TabsTrigger value="estudantes">Estudantes Transportados</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="rotas">
            <Card>
              <CardHeader>
                <CardTitle>Rotas de Transporte Escolar</CardTitle>
                <CardDescription>
                  Gerenciamento das rotas, paradas e horários do transporte escolar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar por rota, motorista ou descrição..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <Select value={routeFilter} onValueChange={setRouteFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="Ônibus Escolar">Ônibus Escolar</SelectItem>
                      <SelectItem value="Micro-ônibus">Micro-ônibus</SelectItem>
                      <SelectItem value="Van Escolar">Van Escolar</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="active">Ativas</SelectItem>
                      <SelectItem value="inactive">Inativas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={() => setActiveTab("nova-rota")} className="whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Rota
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rota</TableHead>
                        <TableHead>Veículo</TableHead>
                        <TableHead>Motorista</TableHead>
                        <TableHead>Paradas</TableHead>
                        <TableHead>Estudantes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoutes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Nenhuma rota encontrada com os filtros selecionados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRoutes.map((route) => (
                          <TableRow key={route.id}>
                            <TableCell className="font-medium">
                              <div>
                                {route.name}
                                <div className="text-xs text-gray-500 mt-1">{route.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge
                                  variant="outline"
                                  className={getVehicleTypeColor(route.vehicle.type)}
                                >
                                  {route.vehicle.type}
                                </Badge>
                                <div className="text-xs text-gray-500 mt-1">{route.vehicle.plate}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                {route.vehicle.driver}
                                {route.vehicle.helper && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Monitor: {route.vehicle.helper}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{route.stops.length}</TableCell>
                            <TableCell>
                              {route.stops.reduce((sum, stop) => sum + stop.studentsCount, 0)}
                            </TableCell>
                            <TableCell>
                              {route.active ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Ativa
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inativa
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                  <DropdownMenuItem>Editar Rota</DropdownMenuItem>
                                  <DropdownMenuItem>Gerenciar Paradas</DropdownMenuItem>
                                  <DropdownMenuItem>Ver no Mapa</DropdownMenuItem>
                                  <DropdownMenuItem>{route.active ? 'Desativar' : 'Ativar'}</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Exibindo {filteredRoutes.length} de {mockRoutes.length} rotas
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Exportar Relatório</Button>
                  <Button variant="outline">Ver no Mapa</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="veiculos">
            <Card>
              <CardHeader>
                <CardTitle>Frota de Veículos</CardTitle>
                <CardDescription>
                  Gerenciamento da frota de transporte escolar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar por placa, tipo ou motorista..."
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="onibus">Ônibus Escolar</SelectItem>
                      <SelectItem value="micro">Micro-ônibus</SelectItem>
                      <SelectItem value="van">Van Escolar</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="ativo">Em operação</SelectItem>
                      <SelectItem value="manutencao">Em manutenção</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button className="whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Veículo
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockRoutes.map((route) => (
                    <Card key={route.vehicle.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <Bus className="h-8 w-8 text-blue-500 mr-3" />
                          <div>
                            <h4 className="font-medium">{route.vehicle.plate}</h4>
                            <p className="text-sm text-gray-500">{route.vehicle.type}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={route.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {route.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Capacidade:</span>
                          <span>{route.vehicle.capacity} lugares</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Motorista:</span>
                          <span>{route.vehicle.driver}</span>
                        </div>
                        {route.vehicle.helper && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Monitor:</span>
                            <span>{route.vehicle.helper}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Rota:</span>
                          <span className="text-right">{route.name}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Ver Detalhes
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Editar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="motoristas">
            <Card>
              <CardHeader>
                <CardTitle>Motoristas e Monitores</CardTitle>
                <CardDescription>
                  Gerenciamento da equipe responsável pelo transporte escolar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar por nome ou função..."
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as funções</SelectItem>
                      <SelectItem value="motorista">Motorista</SelectItem>
                      <SelectItem value="monitor">Monitor</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button className="whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Funcionário
                  </Button>
                </div>

                <div className="p-8 text-center border rounded-md">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <h4 className="text-lg font-medium text-gray-500">Nenhum funcionário cadastrado</h4>
                  <p className="text-gray-400 mt-2">
                    Clique no botão "Novo Funcionário" para adicionar o primeiro registro
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estudantes">
            <Card>
              <CardHeader>
                <CardTitle>Estudantes Transportados</CardTitle>
                <CardDescription>
                  Lista de alunos que utilizam o transporte escolar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar por nome do aluno..."
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Rota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as rotas</SelectItem>
                      {mockRoutes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Escola" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as escolas</SelectItem>
                      <SelectItem value="sch1">Escola Municipal João Paulo</SelectItem>
                      <SelectItem value="sch2">Escola Municipal Maria José</SelectItem>
                      <SelectItem value="sch3">CMEI Pequeno Príncipe</SelectItem>
                      <SelectItem value="sch4">Escola Municipal Paulo Freire</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button className="whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Estudante
                  </Button>
                </div>

                <div className="p-8 text-center border rounded-md">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <h4 className="text-lg font-medium text-gray-500">Nenhum estudante cadastrado</h4>
                  <p className="text-gray-400 mt-2">
                    Clique no botão "Adicionar Estudante" para começar o cadastro
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Estatísticas</CardTitle>
                <CardDescription>
                  Dados sobre utilização e eficiência do transporte escolar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total de Rotas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Route className="h-10 w-10 text-blue-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">{mockRoutes.length}</p>
                          <p className="text-sm text-gray-500">
                            Ativas: {mockRoutes.filter(r => r.active).length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Estudantes Transportados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Users className="h-10 w-10 text-green-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">
                            {mockRoutes.reduce((sum, route) => 
                              sum + route.stops.reduce((stopSum, stop) => stopSum + stop.studentsCount, 0), 0
                            )}
                          </p>
                          <p className="text-sm text-gray-500">Alunos ativos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Veículos em Operação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Bus className="h-10 w-10 text-purple-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">
                            {mockRoutes.filter(r => r.active).length}
                          </p>
                          <p className="text-sm text-gray-500">De {mockRoutes.length} total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Distância Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <MapPin className="h-10 w-10 text-amber-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">
                            {mockRoutes.reduce((sum, route) => sum + route.distance, 0).toFixed(1)}
                          </p>
                          <p className="text-sm text-gray-500">Km por dia</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Relatórios Disponíveis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Clock className="h-5 w-5 mr-2 text-blue-500" />
                          Pontualidade das Rotas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Relatório de cumprimento de horários e atrasos por rota.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Users className="h-5 w-5 mr-2 text-green-500" />
                          Frequência de Estudantes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Análise da utilização do transporte por estudante e período.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Bus className="h-5 w-5 mr-2 text-purple-500" />
                          Manutenção de Veículos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Histórico de manutenções e custos operacionais da frota.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <MapPin className="h-5 w-5 mr-2 text-amber-500" />
                          Otimização de Rotas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Sugestões para otimização de percursos e redução de custos.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>
                  <Route className="h-4 w-4 mr-2" />
                  Gerar Novo Relatório
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default TransporteEscolar;
