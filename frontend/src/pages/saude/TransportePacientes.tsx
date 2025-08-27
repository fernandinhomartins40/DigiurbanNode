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
  Calendar, 
  User, 
  Ambulance, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck, 
  Car, 
  CalendarClock,
  FileText
} from "lucide-react";
import { PatientTransport } from "@/types/saude";

// Mock data
const mockTransports: PatientTransport[] = [
  {
    id: "1",
    patientId: "101",
    patientName: "Maria Silva",
    origin: "UBS Central",
    destination: "Hospital Regional",
    date: "2025-05-22",
    time: "08:30",
    returnScheduled: true,
    returnDate: "2025-05-22",
    returnTime: "14:00",
    reason: "Consulta com cardiologista",
    vehicleType: "van",
    status: "agendado",
    responsibleName: "Carlos Motorista"
  },
  {
    id: "2",
    patientId: "102",
    patientName: "João Oliveira",
    origin: "Residência - Rua das Flores, 123",
    destination: "Centro de Fisioterapia",
    date: "2025-05-22",
    time: "10:00",
    returnScheduled: true,
    returnDate: "2025-05-22",
    returnTime: "11:30",
    reason: "Sessão de fisioterapia",
    specialRequirements: "Paciente usa cadeira de rodas",
    vehicleType: "van",
    status: "agendado",
    responsibleName: "Pedro Motorista"
  },
  {
    id: "3",
    patientId: "103",
    patientName: "Antônio Ferreira",
    origin: "UBS Vila Nova",
    destination: "Hospital Universitário",
    date: "2025-05-21",
    time: "06:00",
    returnScheduled: true,
    returnDate: "2025-05-21",
    returnTime: "18:00",
    reason: "Exame de ressonância magnética",
    vehicleType: "ambulância",
    status: "concluído",
    responsibleName: "José Motorista"
  },
  {
    id: "4",
    patientId: "104",
    patientName: "Luiza Costa",
    origin: "Residência - Av. Principal, 456",
    destination: "Hospital Regional",
    date: "2025-05-23",
    time: "07:30",
    returnScheduled: false,
    reason: "Internação para cirurgia",
    specialRequirements: "Paciente acamado, necessita de maca",
    vehicleType: "ambulância",
    status: "agendado",
    responsibleName: "Roberto Motorista"
  },
  {
    id: "5",
    patientId: "105",
    patientName: "Roberto Gomes",
    origin: "UBS Jardim Esperança",
    destination: "Centro de Hemodiálise",
    date: "2025-05-22",
    time: "13:00",
    returnScheduled: true,
    returnDate: "2025-05-22",
    returnTime: "17:00",
    reason: "Sessão de hemodiálise",
    vehicleType: "van",
    status: "agendado",
    responsibleName: "Carlos Motorista"
  },
  {
    id: "6",
    patientId: "106",
    patientName: "Fernanda Martins",
    origin: "Residência - Rua dos Pinheiros, 789",
    destination: "Hospital Infantil",
    date: "2025-05-21",
    time: "09:00",
    returnScheduled: true,
    returnDate: "2025-05-21",
    returnTime: "12:00",
    reason: "Consulta pediátrica",
    vehicleType: "carro",
    status: "cancelado",
    responsibleName: "Ana Motorista"
  },
  {
    id: "7",
    patientId: "107",
    patientName: "Paulo Rodrigues",
    origin: "UBS Centro",
    destination: "Hospital Regional",
    date: "2025-05-21",
    time: "14:30",
    returnScheduled: true,
    returnDate: "2025-05-21",
    returnTime: "16:00",
    reason: "Consulta com neurologista",
    vehicleType: "carro",
    status: "em andamento",
    responsibleName: "Marcos Motorista"
  },
  {
    id: "8",
    patientId: "108",
    patientName: "Carla Mendes",
    origin: "Centro de Saúde",
    destination: "Hospital de Referência (Capital)",
    date: "2025-05-24",
    time: "05:00",
    returnScheduled: true,
    returnDate: "2025-05-24",
    returnTime: "19:00",
    reason: "Consulta de acompanhamento oncológico",
    vehicleType: "van",
    status: "agendado",
    responsibleName: "José Motorista"
  }
];

// Mock data for vehicles
const mockVehicles = [
  { id: "V1", plate: "ABC-1234", type: "van", capacity: 15, status: "disponível", driver: "Carlos Motorista" },
  { id: "V2", plate: "DEF-5678", type: "van", capacity: 12, status: "em uso", driver: "Pedro Motorista" },
  { id: "V3", plate: "GHI-9012", type: "ambulância", capacity: 3, status: "disponível", driver: "Roberto Motorista" },
  { id: "V4", plate: "JKL-3456", type: "ambulância", capacity: 3, status: "em manutenção", driver: "N/A" },
  { id: "V5", plate: "MNO-7890", type: "carro", capacity: 4, status: "em uso", driver: "Marcos Motorista" },
  { id: "V6", plate: "PQR-1234", type: "carro", capacity: 4, status: "disponível", driver: "Ana Motorista" }
];

// Calculate stats
const totalTransportsToday = mockTransports.filter(t => t.date === "2025-05-22").length;
const scheduledTransports = mockTransports.filter(t => t.status === "agendado").length;
const inProgressTransports = mockTransports.filter(t => t.status === "em andamento").length;
const completedTransports = mockTransports.filter(t => t.status === "concluído").length;

const statusColors: Record<string, string> = {
  "agendado": "bg-blue-500",
  "em andamento": "bg-amber-500",
  "concluído": "bg-green-500",
  "cancelado": "bg-red-500"
};

const vehicleTypeColors: Record<string, string> = {
  "ambulância": "bg-red-500",
  "van": "bg-blue-500",
  "carro": "bg-green-500",
  "outro": "bg-gray-500"
};

const vehicleStatusColors: Record<string, string> = {
  "disponível": "bg-green-500",
  "em uso": "bg-blue-500",
  "em manutenção": "bg-red-500"
};

const TransportePacientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [vehicleFilter, setVehicleFilter] = useState("todos");

  // Filter transports based on search term, date, status, and vehicle type
  const filteredTransports = mockTransports.filter((transport) => {
    const matchesSearch = 
      transport.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? transport.date === dateFilter : true;
    const matchesStatus = statusFilter === "todos" ? true : transport.status === statusFilter;
    const matchesVehicle = vehicleFilter === "todos" ? true : transport.vehicleType === vehicleFilter;
    
    return matchesSearch && matchesDate && matchesStatus && matchesVehicle;
  });

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Transporte de Pacientes</h1>
          <Button>
            <Calendar className="mr-2 h-4 w-4" /> Novo Agendamento
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className={totalTransportsToday > 0 ? "border-blue-500" : ""}>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle>Transportes Hoje</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{totalTransportsToday}</div>
              <p className="text-sm text-muted-foreground mt-2">Viagens para 22/05/2025</p>
            </CardContent>
          </Card>
          
          <Card className={scheduledTransports > 0 ? "border-amber-500" : ""}>
            <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
              <CardTitle>Agendados</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{scheduledTransports}</div>
              <p className="text-sm text-muted-foreground mt-2">Aguardando realização</p>
            </CardContent>
          </Card>
          
          <Card className={inProgressTransports > 0 ? "border-green-500" : ""}>
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle>Em Andamento</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{inProgressTransports}</div>
              <p className="text-sm text-muted-foreground mt-2">Transportes em curso</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
              <CardTitle>Concluídos</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{completedTransports}</div>
              <p className="text-sm text-muted-foreground mt-2">Transportes realizados</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="agendamentos">
          <TabsList className="grid grid-cols-3 mb-4 w-[400px]">
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="veiculos">Veículos</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agendamentos">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos de Transporte</CardTitle>
                <CardDescription>
                  Gerenciamento de transporte de pacientes para consultas e tratamentos
                </CardDescription>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por paciente ou destino..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full sm:w-[180px]"
                  />
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="em andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluído">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os veículos</SelectItem>
                      <SelectItem value="ambulância">Ambulância</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="carro">Carro</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Veículo</TableHead>
                        <TableHead>Retorno</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            Nenhum transporte encontrado com os filtros aplicados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransports.map((transport) => (
                          <TableRow key={transport.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                {transport.patientName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4" />
                                {transport.destination}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{new Date(transport.date).toLocaleDateString('pt-BR')}</span>
                                <span className="text-xs text-muted-foreground">{transport.time}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{transport.reason}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`${vehicleTypeColors[transport.vehicleType]} text-white`}>
                                {transport.vehicleType.charAt(0).toUpperCase() + transport.vehicleType.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {transport.returnScheduled ? (
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(transport.returnDate!).toLocaleDateString('pt-BR')}
                                  </span>
                                  <span className="text-xs">{transport.returnTime}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Não programado</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`${statusColors[transport.status]} text-white`}>
                                {transport.status.charAt(0).toUpperCase() + transport.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                {transport.status === "agendado" && (
                                  <Button variant="outline" size="sm">
                                    <CheckCircle className="h-4 w-4" />
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
                  Exibindo {filteredTransports.length} de {mockTransports.length} transportes
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Anterior</Button>
                  <Button variant="outline" size="sm">Próximo</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="veiculos">
            <Card>
              <CardHeader>
                <CardTitle>Frota de Veículos</CardTitle>
                <CardDescription>
                  Gerenciamento da frota disponível para transporte de pacientes
                </CardDescription>
                
                <div className="flex justify-end mt-4">
                  <Button>
                    <Truck className="mr-2 h-4 w-4" /> Cadastrar Veículo
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="bg-red-50 dark:bg-red-900/20 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Ambulâncias</CardTitle>
                        <Ambulance className="h-6 w-6 text-red-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-3xl font-bold">
                            {mockVehicles.filter(v => v.type === "ambulância").length}
                          </p>
                          <p className="text-sm text-muted-foreground">Total na frota</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-semibold text-green-500">
                            {mockVehicles.filter(v => v.type === "ambulância" && v.status === "disponível").length}
                          </p>
                          <p className="text-sm text-muted-foreground">Disponíveis</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="bg-blue-50 dark:bg-blue-900/20 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Vans</CardTitle>
                        <Truck className="h-6 w-6 text-blue-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-3xl font-bold">
                            {mockVehicles.filter(v => v.type === "van").length}
                          </p>
                          <p className="text-sm text-muted-foreground">Total na frota</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-semibold text-green-500">
                            {mockVehicles.filter(v => v.type === "van" && v.status === "disponível").length}
                          </p>
                          <p className="text-sm text-muted-foreground">Disponíveis</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="bg-green-50 dark:bg-green-900/20 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Carros</CardTitle>
                        <Car className="h-6 w-6 text-green-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-3xl font-bold">
                            {mockVehicles.filter(v => v.type === "carro").length}
                          </p>
                          <p className="text-sm text-muted-foreground">Total na frota</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-semibold text-green-500">
                            {mockVehicles.filter(v => v.type === "carro" && v.status === "disponível").length}
                          </p>
                          <p className="text-sm text-muted-foreground">Disponíveis</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Placa</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Capacidade</TableHead>
                        <TableHead>Motorista</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Próxima Manutenção</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockVehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.plate}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${vehicleTypeColors[vehicle.type]} text-white`}>
                              {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{vehicle.capacity} lugares</TableCell>
                          <TableCell>{vehicle.driver}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${vehicleStatusColors[vehicle.status]} text-white`}>
                              {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>15/06/2025</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">Detalhes</Button>
                              <Button variant="outline" size="sm">
                                <CalendarClock className="h-4 w-4" />
                              </Button>
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
          
          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Transporte</CardTitle>
                <CardDescription>
                  Estatísticas e relatórios sobre o transporte de pacientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transportes por Tipo</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="flex justify-center space-x-4">
                          <Ambulance className="h-8 w-8 text-red-500" />
                          <Truck className="h-8 w-8 text-blue-500" />
                          <Car className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="text-muted-foreground mt-4">
                          Aqui será exibido um gráfico com a distribuição de transportes por tipo de veículo.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Destinos Mais Frequentes</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <MapPin size={48} className="mx-auto text-blue-500 mb-4" />
                        <p className="text-muted-foreground">
                          Aqui será exibido um gráfico com os destinos mais frequentes dos transportes.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Volumetria de Transportes</CardTitle>
                      <CardDescription>Análise por período</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <Calendar size={48} className="mx-auto text-green-500 mb-4" />
                        <p className="text-muted-foreground">
                          Aqui será exibido um gráfico com a volumetria de transportes ao longo do tempo.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Gerar Relatório Completo</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default TransportePacientes;
