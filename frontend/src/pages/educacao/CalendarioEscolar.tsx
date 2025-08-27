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
import { Textarea } from "@/components/ui/textarea";
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
  Calendar as CalendarIcon, 
  ChevronDown, 
  Plus, 
  FileText, 
  Users, 
  School, 
  CalendarDays,
  Search,
  Filter,
  Download,
  Printer,
  MapPin,
  BookOpen
} from "lucide-react";
import { SchoolEvent } from "@/types/educacao";
import { Calendar } from "@/components/ui/calendar";

// Mock data for school events
const mockEvents: SchoolEvent[] = [
  {
    id: "event1",
    title: "Reunião de Pais e Mestres",
    description: "Reunião bimestral para apresentação dos resultados e discussão do desempenho dos alunos.",
    startDate: "2023-04-15T18:00:00",
    endDate: "2023-04-15T21:00:00",
    allDay: false,
    location: "Auditório da Escola",
    type: "meeting",
    schoolId: "sch1",
    schoolName: "Escola Municipal João Paulo",
    grades: ["5º ano", "6º ano"],
    classes: ["5º ano A", "5º ano B", "6º ano A", "6º ano B"],
    organizer: {
      id: "dir1",
      name: "Carlos Alberto",
      role: "Diretor"
    },
    participants: [
      {
        type: "parents",
        required: true
      },
      {
        type: "teachers",
        required: true
      }
    ],
    color: "#3498db"
  },
  {
    id: "event2",
    title: "Feriado - Tiradentes",
    description: "Feriado nacional em comemoração ao Dia de Tiradentes.",
    startDate: "2023-04-21T00:00:00",
    endDate: "2023-04-21T23:59:59",
    allDay: true,
    location: "",
    type: "holiday",
    organizer: {
      id: "system",
      name: "Sistema",
      role: "Sistema"
    },
    color: "#e74c3c"
  },
  {
    id: "event3",
    title: "Feira de Ciências",
    description: "Apresentação dos projetos científicos desenvolvidos pelos alunos durante o bimestre.",
    startDate: "2023-04-28T08:00:00",
    endDate: "2023-04-28T16:00:00",
    allDay: false,
    location: "Pátio da Escola",
    type: "cultural",
    schoolId: "sch1",
    schoolName: "Escola Municipal João Paulo",
    grades: ["6º ano", "7º ano", "8º ano", "9º ano"],
    classes: ["6º ano A", "6º ano B", "7º ano A", "7º ano B", "8º ano A", "8º ano B", "9º ano A", "9º ano B"],
    organizer: {
      id: "coord1",
      name: "Regina Souza",
      role: "Coordenadora"
    },
    participants: [
      {
        type: "students",
        required: true
      },
      {
        type: "teachers",
        required: true
      },
      {
        type: "parents",
        required: false
      },
      {
        type: "community",
        required: false
      }
    ],
    color: "#9b59b6"
  },
  {
    id: "event4",
    title: "Avaliação Bimestral - Matemática",
    description: "Avaliação referente ao 1º bimestre.",
    startDate: "2023-04-17T08:00:00",
    endDate: "2023-04-17T10:00:00",
    allDay: false,
    location: "Salas de Aula",
    type: "exam",
    schoolId: "sch1",
    schoolName: "Escola Municipal João Paulo",
    grades: ["6º ano", "7º ano", "8º ano", "9º ano"],
    organizer: {
      id: "tch1",
      name: "Carlos Ferreira",
      role: "Professor"
    },
    participants: [
      {
        type: "students",
        required: true
      }
    ],
    color: "#f39c12"
  },
  {
    id: "event5",
    title: "Conselho de Classe",
    description: "Reunião para avaliação do desempenho das turmas e alunos no 1º bimestre.",
    startDate: "2023-04-14T14:00:00",
    endDate: "2023-04-14T18:00:00",
    allDay: false,
    location: "Sala dos Professores",
    type: "pedagogical",
    schoolId: "sch1",
    schoolName: "Escola Municipal João Paulo",
    organizer: {
      id: "dir1",
      name: "Carlos Alberto",
      role: "Diretor"
    },
    participants: [
      {
        type: "teachers",
        required: true
      },
      {
        type: "staff",
        required: true
      }
    ],
    color: "#2ecc71"
  }
];

// Helper function for mapping event type to badge color and label
const getEventTypeColor = (type: string) => {
  switch (type) {
    case "holiday":
      return "bg-red-100 text-red-800";
    case "recess":
      return "bg-blue-100 text-blue-800";
    case "pedagogical":
      return "bg-green-100 text-green-800";
    case "cultural":
      return "bg-purple-100 text-purple-800";
    case "sport":
      return "bg-yellow-100 text-yellow-800";
    case "meeting":
      return "bg-indigo-100 text-indigo-800";
    case "exam":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getEventTypeLabel = (type: string) => {
  switch (type) {
    case "holiday":
      return "Feriado";
    case "recess":
      return "Recesso";
    case "pedagogical":
      return "Pedagógico";
    case "cultural":
      return "Cultural";
    case "sport":
      return "Esportivo";
    case "meeting":
      return "Reunião";
    case "exam":
      return "Avaliação";
    default:
      return "Outro";
  }
};

const CalendarioEscolar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [activeTab, setActiveTab] = useState("calendario");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Filter events based on search and filters
  const filteredEvents = mockEvents.filter((event) => {
    const eventMonth = new Date(event.startDate).getMonth().toString();
    
    return (
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (typeFilter === "" || typeFilter === "all" || event.type === typeFilter) &&
      (schoolFilter === "" || schoolFilter === "all" || event.schoolId === schoolFilter) &&
      (monthFilter === "" || monthFilter === "all" || eventMonth === monthFilter)
    );
  });

  return (
    
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Calendário Escolar</h1>
        
        <Tabs defaultValue="calendario" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="eventos">Lista de Eventos</TabsTrigger>
            <TabsTrigger value="novo">Novo Evento</TabsTrigger>
          </TabsList>

          <TabsContent value="calendario">
            <Card>
              <CardHeader>
                <CardTitle>Calendário Escolar 2023</CardTitle>
                <CardDescription>
                  Visualização de eventos, feriados e datas importantes
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-12">
                <div className="md:col-span-4">
                  <h3 className="text-lg font-medium mb-3">Calendário</h3>
                  <div className="border rounded-md p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />

                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium">Legenda</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                          <span className="text-sm">Feriados</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-sm">Recessos</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                          <span className="text-sm">Eventos Culturais</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                          <span className="text-sm">Eventos Esportivos</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-indigo-500 mr-2"></div>
                          <span className="text-sm">Reuniões</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                          <span className="text-sm">Avaliações</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="space-y-2">
                        <Select value={monthFilter} onValueChange={setMonthFilter}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filtrar por mês" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os meses</SelectItem>
                            <SelectItem value="0">Janeiro</SelectItem>
                            <SelectItem value="1">Fevereiro</SelectItem>
                            <SelectItem value="2">Março</SelectItem>
                            <SelectItem value="3">Abril</SelectItem>
                            <SelectItem value="4">Maio</SelectItem>
                            <SelectItem value="5">Junho</SelectItem>
                            <SelectItem value="6">Julho</SelectItem>
                            <SelectItem value="7">Agosto</SelectItem>
                            <SelectItem value="8">Setembro</SelectItem>
                            <SelectItem value="9">Outubro</SelectItem>
                            <SelectItem value="10">Novembro</SelectItem>
                            <SelectItem value="11">Dezembro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-2">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filtrar por tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os tipos</SelectItem>
                            <SelectItem value="holiday">Feriados</SelectItem>
                            <SelectItem value="recess">Recessos</SelectItem>
                            <SelectItem value="pedagogical">Pedagógicos</SelectItem>
                            <SelectItem value="cultural">Culturais</SelectItem>
                            <SelectItem value="sport">Esportivos</SelectItem>
                            <SelectItem value="meeting">Reuniões</SelectItem>
                            <SelectItem value="exam">Avaliações</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-2">
                        <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filtrar por escola" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as escolas</SelectItem>
                            <SelectItem value="sch1">E.M. João Paulo</SelectItem>
                            <SelectItem value="sch2">E.M. Maria José</SelectItem>
                            <SelectItem value="sch3">CMEI Pequeno Príncipe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button variant="outline" className="w-full">
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-8">
                  <h3 className="text-lg font-medium mb-3">Eventos do Mês</h3>
                  <div className="space-y-4">
                    {filteredEvents.length === 0 ? (
                      <div className="p-8 text-center border rounded-md">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                        <h4 className="text-lg font-medium text-gray-500">Nenhum evento encontrado</h4>
                        <p className="text-gray-400 mt-2">
                          Não há eventos registrados com os filtros selecionados
                        </p>
                      </div>
                    ) : (
                      filteredEvents.map((event) => (
                        <Card key={event.id} className="overflow-hidden">
                          <div className="flex">
                            <div className="w-2 h-auto" style={{ backgroundColor: event.color }} />
                            <div className="flex-1">
                              <CardHeader>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-lg">{event.title}</CardTitle>
                                    <CardDescription>
                                      {event.schoolName ? event.schoolName : "Todas as escolas"}
                                    </CardDescription>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={getEventTypeColor(event.type)}
                                  >
                                    {getEventTypeLabel(event.type)}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <p className="text-sm">{event.description}</p>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                    <div className="flex items-center">
                                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="text-sm">
                                        {new Date(event.startDate).toLocaleDateString("pt-BR")}
                                        {!event.allDay && ` - ${new Date(event.startDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                                      </span>
                                    </div>
                                    
                                    {event.location && (
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                        <span className="text-sm">{event.location}</span>
                                      </div>
                                    )}
                                    
                                    {event.organizer && (
                                      <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                                        <span className="text-sm">{event.organizer.name}</span>
                                      </div>
                                    )}
                                    
                                    {event.classes && (
                                      <div className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                                        <span className="text-sm">
                                          {event.classes.length > 2
                                            ? `${event.classes.length} turmas`
                                            : event.classes.join(", ")}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="flex justify-end">
                                <Button variant="ghost" size="sm">Ver Detalhes</Button>
                              </CardFooter>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eventos">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Eventos</CardTitle>
                <CardDescription>
                  Gerenciamento de eventos e datas do calendário escolar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar eventos..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="holiday">Feriado</SelectItem>
                      <SelectItem value="recess">Recesso</SelectItem>
                      <SelectItem value="pedagogical">Pedagógico</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="sport">Esportivo</SelectItem>
                      <SelectItem value="meeting">Reunião</SelectItem>
                      <SelectItem value="exam">Avaliação</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filtrar por escola" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as escolas</SelectItem>
                      <SelectItem value="sch1">E.M. João Paulo</SelectItem>
                      <SelectItem value="sch2">E.M. Maria José</SelectItem>
                      <SelectItem value="sch3">CMEI Pequeno Príncipe</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Evento</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Escola</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Organizador</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Nenhum evento encontrado com os filtros selecionados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getEventTypeColor(event.type)}
                              >
                                {getEventTypeLabel(event.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                <span>
                                  {new Date(event.startDate).toLocaleDateString("pt-BR")}
                                  {!event.allDay && (
                                    <span className="text-gray-500">
                                      {" "}
                                      {new Date(event.startDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{event.schoolName || "Todas"}</TableCell>
                            <TableCell>{event.location || "-"}</TableCell>
                            <TableCell>{event.organizer?.name || "-"}</TableCell>
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
                                  <DropdownMenuItem>Editar</DropdownMenuItem>
                                  <DropdownMenuItem>Duplicar</DropdownMenuItem>
                                  <DropdownMenuItem>Enviar Lembrete</DropdownMenuItem>
                                  <DropdownMenuItem>Cancelar</DropdownMenuItem>
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
                    Exibindo {filteredEvents.length} de {mockEvents.length} eventos
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Exportar</Button>
                  <Button onClick={() => setActiveTab("novo")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Evento
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="novo">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Evento</CardTitle>
                <CardDescription>
                  Preencha o formulário para adicionar um novo evento ao calendário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações do Evento</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Título do Evento</label>
                      <Input placeholder="Digite o título do evento" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de Evento</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="holiday">Feriado</SelectItem>
                          <SelectItem value="recess">Recesso</SelectItem>
                          <SelectItem value="pedagogical">Pedagógico</SelectItem>
                          <SelectItem value="cultural">Cultural</SelectItem>
                          <SelectItem value="sport">Esportivo</SelectItem>
                          <SelectItem value="meeting">Reunião</SelectItem>
                          <SelectItem value="exam">Avaliação</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea placeholder="Descreva os detalhes do evento..." />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Início</label>
                      <Input type="date" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Término</label>
                      <Input type="date" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hora de Início</label>
                      <Input type="time" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hora de Término</label>
                      <Input type="time" />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="allDay" className="rounded" />
                      <label htmlFor="allDay">Evento de dia inteiro</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Local e Participantes</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Escola</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a escola" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as escolas</SelectItem>
                          <SelectItem value="sch1">E.M. João Paulo</SelectItem>
                          <SelectItem value="sch2">E.M. Maria José</SelectItem>
                          <SelectItem value="sch3">CMEI Pequeno Príncipe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Local</label>
                      <Input placeholder="Digite o local do evento" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Séries</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione as séries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as séries</SelectItem>
                          <SelectItem value="pre">Educação Infantil</SelectItem>
                          <SelectItem value="fundamental1">Fundamental I (1º ao 5º)</SelectItem>
                          <SelectItem value="fundamental2">Fundamental II (6º ao 9º)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Turmas</label>
                      <Input placeholder="Digite as turmas ou selecione todas" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Participantes</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="students" className="rounded" />
                        <label htmlFor="students">Alunos</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="teachers" className="rounded" />
                        <label htmlFor="teachers">Professores</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="parents" className="rounded" />
                        <label htmlFor="parents">Pais/Responsáveis</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="staff" className="rounded" />
                        <label htmlFor="staff">Funcionários</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="community" className="rounded" />
                        <label htmlFor="community">Comunidade</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configurações Adicionais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cor do Evento</label>
                      <Input type="color" className="h-10" defaultValue="#3498db" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Organizador</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um organizador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dir1">Carlos Alberto (Diretor)</SelectItem>
                          <SelectItem value="coord1">Regina Souza (Coordenadora)</SelectItem>
                          <SelectItem value="tch1">Carlos Ferreira (Professor)</SelectItem>
                          <SelectItem value="tch2">Maria Souza (Professora)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notificações</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notifyEmail" className="rounded" defaultChecked />
                        <label htmlFor="notifyEmail">Enviar notificação por email</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notifyApp" className="rounded" defaultChecked />
                        <label htmlFor="notifyApp">Notificar no aplicativo</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="reminder" className="rounded" defaultChecked />
                        <label htmlFor="reminder">Enviar lembretes</label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancelar</Button>
                <div className="flex gap-2">
                  <Button variant="outline">Visualizar</Button>
                  <Button>Salvar Evento</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default CalendarioEscolar;
