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
  FileText,
  Calendar,
  User,
  Ambulance,
  MapPin,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { TFDReferral } from "@/types/saude";

// Mock data
const mockReferrals: TFDReferral[] = [
  {
    id: "1",
    patientId: "101",
    patientName: "Maria Silva",
    originUnit: "UBS Central",
    destinationUnit: "Hospital Regional de Cardiologia",
    specialtyRequired: "Cardiologia",
    referralDate: "2025-05-10",
    scheduledDate: "2025-05-25",
    status: "aprovado",
    priority: "normal",
    transportation: "terrestre",
    accommodationNeeded: false,
    medicalReport: "Paciente com histórico de hipertensão necessitando de avaliação cardiológica especializada."
  },
  {
    id: "2",
    patientId: "102",
    patientName: "João Oliveira",
    originUnit: "UBS Jardim América",
    destinationUnit: "Centro de Tratamento Oncológico",
    specialtyRequired: "Oncologia",
    referralDate: "2025-05-08",
    status: "solicitado",
    priority: "urgente",
    transportation: "terrestre",
    accommodationNeeded: true,
    medicalReport: "Paciente com suspeita de neoplasia requer avaliação urgente por especialista."
  },
  {
    id: "3",
    patientId: "103",
    patientName: "Antônio Ferreira",
    originUnit: "UBS Vila Nova",
    destinationUnit: "Hospital Universitário",
    specialtyRequired: "Neurologia",
    referralDate: "2025-04-30",
    scheduledDate: "2025-05-20",
    status: "em andamento",
    priority: "emergência",
    transportation: "aéreo",
    accommodationNeeded: true,
    medicalReport: "Paciente com síndrome neurológica grave necessitando de avaliação imediata."
  },
  {
    id: "4",
    patientId: "104",
    patientName: "Luiza Costa",
    originUnit: "UBS Centro",
    destinationUnit: "Hospital Infantil",
    specialtyRequired: "Ortopedia Pediátrica",
    referralDate: "2025-05-05",
    scheduledDate: "2025-05-15",
    status: "concluído",
    priority: "normal",
    transportation: "terrestre",
    accommodationNeeded: false,
    medicalReport: "Criança com suspeita de fratura necessitando de tratamento especializado."
  },
  {
    id: "5",
    patientId: "105",
    patientName: "Roberto Gomes",
    originUnit: "UBS Jardim Esperança",
    destinationUnit: "Centro de Especialidades Médicas",
    specialtyRequired: "Nefrologia",
    referralDate: "2025-05-12",
    status: "negado",
    priority: "urgente",
    transportation: "terrestre",
    accommodationNeeded: false,
    medicalReport: "Paciente com insuficiência renal requer avaliação por nefrologista."
  },
  {
    id: "6",
    patientId: "106",
    patientName: "Fernanda Martins",
    originUnit: "UBS São José",
    destinationUnit: "Instituto do Coração",
    specialtyRequired: "Cirurgia Cardíaca",
    referralDate: "2025-05-03",
    scheduledDate: "2025-05-18",
    status: "em andamento",
    priority: "urgente",
    transportation: "aéreo",
    accommodationNeeded: true,
    medicalReport: "Paciente com indicação de cirurgia cardíaca não disponível no município."
  }
];

const statusColors: Record<string, string> = {
  "solicitado": "bg-blue-500",
  "aprovado": "bg-green-500",
  "em andamento": "bg-amber-500",
  "concluído": "bg-purple-500",
  "negado": "bg-red-500"
};

const priorityColors: Record<string, string> = {
  "normal": "bg-blue-500",
  "urgente": "bg-amber-500",
  "emergência": "bg-red-500"
};

const transportationColors: Record<string, string> = {
  "terrestre": "bg-green-500",
  "aéreo": "bg-blue-500",
  "não necessário": "bg-gray-500"
};

const EncaminhamentosTFD = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Filter referrals based on search term, status, and priority
  const filteredReferrals = mockReferrals.filter((referral) => {
    const matchesSearch = 
      referral.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.specialtyRequired.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.destinationUnit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? referral.status === statusFilter : true;
    const matchesPriority = priorityFilter ? referral.priority === priorityFilter : true;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Count referrals by status
  const pending = mockReferrals.filter(r => r.status === "solicitado").length;
  const approved = mockReferrals.filter(r => r.status === "aprovado").length;
  const inProgress = mockReferrals.filter(r => r.status === "em andamento").length;
  const completed = mockReferrals.filter(r => r.status === "concluído").length;
  const denied = mockReferrals.filter(r => r.status === "negado").length;

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Encaminhamentos TFD</h1>
          <Button>
            <FileText className="mr-2 h-4 w-4" /> Nova Solicitação TFD
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <Card className={pending > 0 ? "border-blue-500" : ""}>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle>Solicitados</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{pending}</div>
              <p className="text-sm text-muted-foreground mt-2">Aguardando análise</p>
            </CardContent>
          </Card>
          
          <Card className={approved > 0 ? "border-green-500" : ""}>
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle>Aprovados</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{approved}</div>
              <p className="text-sm text-muted-foreground mt-2">Aguardando agendamento</p>
            </CardContent>
          </Card>
          
          <Card className={inProgress > 0 ? "border-amber-500" : ""}>
            <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
              <CardTitle>Em Andamento</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{inProgress}</div>
              <p className="text-sm text-muted-foreground mt-2">Agendados/em execução</p>
            </CardContent>
          </Card>
          
          <Card className={completed > 0 ? "border-purple-500" : ""}>
            <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
              <CardTitle>Concluídos</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{completed}</div>
              <p className="text-sm text-muted-foreground mt-2">Encaminhamentos realizados</p>
            </CardContent>
          </Card>
          
          <Card className={denied > 0 ? "border-red-500" : ""}>
            <CardHeader className="bg-red-50 dark:bg-red-900/20">
              <CardTitle>Negados</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{denied}</div>
              <p className="text-sm text-muted-foreground mt-2">Solicitações não aprovadas</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="todos">
          <TabsList className="grid grid-cols-3 mb-4 w-[400px]">
            <TabsTrigger value="todos">Todos os Encaminhamentos</TabsTrigger>
            <TabsTrigger value="emergencia">Casos de Emergência</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todos">
            <Card>
              <CardHeader>
                <CardTitle>Encaminhamentos TFD</CardTitle>
                <CardDescription>
                  Gerenciamento de Tratamentos Fora do Domicílio
                </CardDescription>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por paciente, especialidade ou destino..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="solicitado">Solicitado</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="em andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluído">Concluído</SelectItem>
                      <SelectItem value="negado">Negado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as prioridades</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="emergência">Emergência</SelectItem>
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
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Data de Solicitação</TableHead>
                        <TableHead>Data Agendada</TableHead>
                        <TableHead>Transporte</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReferrals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4">
                            Nenhum encaminhamento encontrado com os filtros aplicados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReferrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                {referral.patientName}
                              </div>
                            </TableCell>
                            <TableCell>{referral.specialtyRequired}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4" />
                                {referral.destinationUnit}
                              </div>
                            </TableCell>
                            <TableCell>{new Date(referral.referralDate).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>
                              {referral.scheduledDate 
                                ? new Date(referral.scheduledDate).toLocaleDateString('pt-BR')
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`${transportationColors[referral.transportation]} text-white`}>
                                {referral.transportation.charAt(0).toUpperCase() + referral.transportation.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`${priorityColors[referral.priority]} text-white`}>
                                {referral.priority.charAt(0).toUpperCase() + referral.priority.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`${statusColors[referral.status]} text-white`}>
                                {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Calendar className="h-4 w-4" />
                                </Button>
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
                  Exibindo {filteredReferrals.length} de {mockReferrals.length} encaminhamentos
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Anterior</Button>
                  <Button variant="outline" size="sm">Próximo</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="emergencia">
            <Card>
              <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/50">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="text-red-500 mr-2 h-5 w-5" />
                  Encaminhamentos de Emergência
                </CardTitle>
                <CardDescription>
                  Visualização prioritária de casos urgentes e emergenciais
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {mockReferrals
                    .filter(r => r.priority === "emergência" || r.priority === "urgente")
                    .map((referral) => (
                      <Card key={referral.id} className="border-l-4 border-l-red-500">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{referral.patientName}</CardTitle>
                              <CardDescription>
                                {referral.specialtyRequired} - {referral.destinationUnit}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary" className={`${priorityColors[referral.priority]} text-white`}>
                              {referral.priority.charAt(0).toUpperCase() + referral.priority.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm mb-1">Detalhes do Encaminhamento</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="text-muted-foreground">Data da Solicitação:</span>
                                  <span className="ml-2">{new Date(referral.referralDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="text-muted-foreground">Origem:</span>
                                  <span className="ml-2">{referral.originUnit}</span>
                                </div>
                                <div className="flex items-center">
                                  <Ambulance className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="text-muted-foreground">Transporte:</span>
                                  <span className="ml-2">{referral.transportation.charAt(0).toUpperCase() + referral.transportation.slice(1)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                              <h4 className="font-medium text-sm mb-1">Situação Atual</h4>
                              <div className="flex items-center mb-2">
                                <FileCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant="secondary" className={`${statusColors[referral.status]} text-white ml-2`}>
                                  {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="text-sm">{referral.medicalReport.substring(0, 100)}...</div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <div className="flex space-x-2 w-full justify-end">
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              Ver Laudo Médico
                            </Button>
                            <Button size="sm">
                              {referral.status === "solicitado" ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Aprovar Solicitação
                                </>
                              ) : referral.status === "aprovado" ? (
                                <>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Agendar Atendimento
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Atualizar Status
                                </>
                              )}
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                    
                  {mockReferrals.filter(r => r.priority === "emergência" || r.priority === "urgente").length === 0 && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium">Nenhum caso de emergência ou urgência</h3>
                      <p className="text-muted-foreground mt-2">
                        Não há casos prioritários no momento.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Estatísticas TFD</CardTitle>
                <CardDescription>
                  Análise dos encaminhamentos e tratamentos fora do domicílio
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center space-y-4">
                <div className="text-center">
                  <div className="flex justify-center gap-4 mb-4">
                    <Ambulance size={48} className="text-blue-500" />
                    <MapPin size={48} className="text-red-500" />
                  </div>
                  <p className="text-muted-foreground">
                    Aqui serão exibidos gráficos e relatórios estatísticos sobre os encaminhamentos TFD.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default EncaminhamentosTFD;
