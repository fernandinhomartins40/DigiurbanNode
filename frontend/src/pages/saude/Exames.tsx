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
import { FileText, Search, User, Calendar as CalendarIcon, FileCheck } from "lucide-react";
import { Exam } from "@/types/saude";

// Mock data
const mockExams: Exam[] = [
  {
    id: "1",
    patientId: "101",
    patientName: "Maria Silva",
    examType: "Hemograma Completo",
    requestDate: "2025-05-10",
    scheduledDate: "2025-05-20",
    status: "agendado",
    requestedBy: "Dr. Carlos Santos",
    priority: "normal",
  },
  {
    id: "2",
    patientId: "102",
    patientName: "João Oliveira",
    examType: "Raio-X de Tórax",
    requestDate: "2025-05-12",
    scheduledDate: "2025-05-15",
    resultDate: "2025-05-15",
    status: "resultados disponíveis",
    requestedBy: "Dra. Ana Pereira",
    priority: "normal",
  },
  {
    id: "3",
    patientId: "103",
    patientName: "Antônio Ferreira",
    examType: "Tomografia Computadorizada",
    requestDate: "2025-05-14",
    status: "solicitado",
    requestedBy: "Dr. Ricardo Martins",
    priority: "urgente",
    notes: "Paciente com dores persistentes",
  },
  {
    id: "4",
    patientId: "104",
    patientName: "Luiza Costa",
    examType: "Ultrassonografia Abdominal",
    requestDate: "2025-05-05",
    scheduledDate: "2025-05-18",
    status: "agendado",
    requestedBy: "Dra. Mariana Alves",
    priority: "normal",
  },
  {
    id: "5",
    patientId: "105",
    patientName: "Roberto Gomes",
    examType: "Ressonância Magnética",
    requestDate: "2025-05-08",
    status: "solicitado",
    requestedBy: "Dr. Felipe Souza",
    priority: "emergência",
    notes: "Suspeita de lesão cerebral",
  },
  {
    id: "6",
    patientId: "106",
    patientName: "Fernanda Martins",
    examType: "Ecocardiograma",
    requestDate: "2025-04-30",
    scheduledDate: "2025-05-10",
    resultDate: "2025-05-10",
    status: "resultados disponíveis",
    requestedBy: "Dr. Carlos Santos",
    priority: "urgente",
  },
  {
    id: "7",
    patientId: "107",
    patientName: "Paulo Rodrigues",
    examType: "Endoscopia Digestiva",
    requestDate: "2025-05-02",
    scheduledDate: "2025-05-12",
    status: "realizado",
    requestedBy: "Dra. Ana Pereira",
    priority: "normal",
  },
  {
    id: "8",
    patientId: "108",
    patientName: "Carla Mendes",
    examType: "Papanicolau",
    requestDate: "2025-05-06",
    status: "cancelado",
    requestedBy: "Dra. Mariana Alves",
    priority: "normal",
    notes: "Paciente desmarcou por motivos pessoais",
  },
  {
    id: "9",
    patientId: "109",
    patientName: "Ricardo Lima",
    examType: "Exame de Sangue - Glicemia",
    requestDate: "2025-05-10",
    scheduledDate: "2025-05-13",
    resultDate: "2025-05-14",
    status: "resultados disponíveis",
    requestedBy: "Dr. Felipe Souza",
    priority: "normal",
  },
  {
    id: "10",
    patientId: "110",
    patientName: "Cláudia Oliveira",
    examType: "Mamografia",
    requestDate: "2025-05-07",
    scheduledDate: "2025-05-25",
    status: "agendado",
    requestedBy: "Dra. Ana Pereira",
    priority: "normal",
  },
];

const statusColors: Record<string, string> = {
  "solicitado": "bg-amber-500",
  "agendado": "bg-blue-500",
  "realizado": "bg-purple-500",
  "resultados disponíveis": "bg-green-500",
  "cancelado": "bg-red-500",
};

const priorityColors: Record<string, string> = {
  "normal": "bg-blue-500",
  "urgente": "bg-amber-500",
  "emergência": "bg-red-500",
};

const Exames = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterExamType, setFilterExamType] = useState<string>("");
  
  // Filter exams based on the search, status, and exam type
  const filteredExams = mockExams.filter((exam) => {
    const matchesSearch = 
      exam.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.examType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? exam.status === filterStatus : true;
    const matchesType = filterExamType ? exam.examType === filterExamType : true;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Extract unique exam types for the filter
  const examTypes = Array.from(new Set(mockExams.map((exam) => exam.examType)));
  
  // Extract unique statuses for the filter
  const statuses = Array.from(new Set(mockExams.map((exam) => exam.status)));

  // Count exams by status
  const pendingCount = mockExams.filter(e => e.status === "solicitado").length;
  const scheduledCount = mockExams.filter(e => e.status === "agendado").length;
  const completedCount = mockExams.filter(e => e.status === "realizado").length;
  const resultAvailableCount = mockExams.filter(e => e.status === "resultados disponíveis").length;

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Exames</h1>
          <Button>
            <FileText className="mr-2 h-4 w-4" /> Solicitar Exame
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className={pendingCount > 0 ? "border-amber-500" : ""}>
            <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
              <CardTitle>Solicitados</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{pendingCount}</div>
              <p className="text-sm text-muted-foreground mt-2">Aguardando agendamento</p>
            </CardContent>
          </Card>
          
          <Card className={scheduledCount > 0 ? "border-blue-500" : ""}>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle>Agendados</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{scheduledCount}</div>
              <p className="text-sm text-muted-foreground mt-2">Com data marcada</p>
            </CardContent>
          </Card>
          
          <Card className={completedCount > 0 ? "border-purple-500" : ""}>
            <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
              <CardTitle>Realizados</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{completedCount}</div>
              <p className="text-sm text-muted-foreground mt-2">Aguardando resultados</p>
            </CardContent>
          </Card>
          
          <Card className={resultAvailableCount > 0 ? "border-green-500" : ""}>
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle>Resultados Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{resultAvailableCount}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Prontos para visualização</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="todos">
          <TabsList className="grid grid-cols-3 mb-4 w-[400px]">
            <TabsTrigger value="todos">Todos os Exames</TabsTrigger>
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todos">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Exames</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os exames solicitados e agendados
                </CardDescription>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por paciente ou exame..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterExamType} onValueChange={setFilterExamType}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                      <SelectValue placeholder="Tipo de Exame" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos de exame</SelectItem>
                      {examTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
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
                        <TableHead>Exame</TableHead>
                        <TableHead>Data da Solicitação</TableHead>
                        <TableHead>Data Agendada</TableHead>
                        <TableHead>Solicitado por</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExams.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            Nenhum exame encontrado com os filtros aplicados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredExams.map((exam) => (
                          <TableRow key={exam.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                {exam.patientName}
                              </div>
                            </TableCell>
                            <TableCell>{exam.examType}</TableCell>
                            <TableCell>
                              {new Date(exam.requestDate).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              {exam.scheduledDate 
                                ? new Date(exam.scheduledDate).toLocaleDateString('pt-BR')
                                : "-"}
                            </TableCell>
                            <TableCell>{exam.requestedBy}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`${statusColors[exam.status]} text-white`}>
                                {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`${priorityColors[exam.priority]} text-white`}>
                                {exam.priority.charAt(0).toUpperCase() + exam.priority.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {exam.status === "resultados disponíveis" && (
                                  <Button variant="default" size="sm">
                                    <FileCheck className="mr-2 h-4 w-4" /> Ver
                                  </Button>
                                )}
                                {exam.status !== "resultados disponíveis" && (
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                )}
                                {exam.status === "solicitado" && (
                                  <Button variant="outline" size="sm">
                                    <CalendarIcon className="h-4 w-4" />
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
                  Exibindo {filteredExams.length} de {mockExams.length} exames
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Anterior</Button>
                  <Button variant="outline" size="sm">Próximo</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="resultados">
            <Card>
              <CardHeader>
                <CardTitle>Resultados Disponíveis</CardTitle>
                <CardDescription>
                  Exames com resultados prontos para consulta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockExams
                    .filter(exam => exam.status === "resultados disponíveis")
                    .map(exam => (
                      <Card key={exam.id}>
                        <CardHeader className="bg-green-50 dark:bg-green-900/20">
                          <div className="flex justify-between">
                            <div>
                              <CardTitle>{exam.examType}</CardTitle>
                              <CardDescription>
                                {exam.patientName} - {new Date(exam.resultDate!).toLocaleDateString('pt-BR')}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-green-500 text-white">
                              Resultados Disponíveis
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm">Informações do Exame</h4>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Paciente:</span>
                                  <span className="text-sm">{exam.patientName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Solicitado por:</span>
                                  <span className="text-sm">{exam.requestedBy}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Data da Solicitação:</span>
                                  <span className="text-sm">{new Date(exam.requestDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Data da Realização:</span>
                                  <span className="text-sm">{new Date(exam.scheduledDate!).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm">Resultado</h4>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Data do Resultado:</span>
                                  <span className="text-sm">{new Date(exam.resultDate!).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Laboratório/Unidade:</span>
                                  <span className="text-sm">Laboratório Central</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Responsável Técnico:</span>
                                  <span className="text-sm">Dra. Juliana Campos</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline">Imprimir</Button>
                          <Button>
                            <FileCheck className="mr-2 h-4 w-4" />
                            Visualizar Resultado Completo
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                    
                  {mockExams.filter(exam => exam.status === "resultados disponíveis").length === 0 && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium">Nenhum resultado disponível</h3>
                      <p className="text-muted-foreground mt-2">
                        Não há resultados de exames disponíveis para visualização no momento.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Exames por Paciente</CardTitle>
                <CardDescription>
                  Visualize o histórico completo de exames de cada paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar paciente..."
                        className="pl-8"
                      />
                    </div>
                    <Button>Buscar</Button>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-md text-center">
                    <h3 className="text-lg font-medium">Selecione um paciente</h3>
                    <p className="text-muted-foreground mt-2">
                      Busque um paciente para visualizar seu histórico completo de exames.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default Exames;
