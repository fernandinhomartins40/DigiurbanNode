
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
import { Search, ChevronDown, AlertTriangle, Calendar, User, File, Bell, Filter, FileText, Plus } from "lucide-react";
import { Occurrence } from "@/types/educacao";

// Mock data for occurrences
const mockOccurrences: Occurrence[] = [
  {
    id: "occ1",
    studentId: "std1",
    studentName: "Ana Silva",
    schoolId: "sch1",
    schoolName: "Escola Municipal João Paulo",
    date: "2023-04-05",
    type: "disciplinary",
    severity: "medium",
    description: "Aluna se envolveu em discussão verbal com um colega durante o intervalo. Ambos foram orientados sobre o respeito mútuo.",
    reportedById: "tch1",
    reportedByName: "Carlos Ferreira",
    reportedByRole: "teacher",
    parentNotified: true,
    resolved: true,
    resolutionDate: "2023-04-06"
  },
  {
    id: "occ2",
    studentId: "std2",
    studentName: "Pedro Santos",
    schoolId: "sch1",
    schoolName: "Escola Municipal João Paulo",
    date: "2023-04-10",
    type: "disciplinary",
    severity: "high",
    description: "Aluno foi flagrado danificando material escolar de outro estudante. Foi solicitada reunião com os responsáveis.",
    reportedById: "dir1",
    reportedByName: "Carlos Alberto",
    reportedByRole: "director",
    measures: "Convocação dos pais para reunião e reposição do material danificado",
    parentNotified: true,
    resolved: false
  },
  {
    id: "occ3",
    studentId: "std3",
    studentName: "Maria Oliveira",
    schoolId: "sch2",
    schoolName: "Escola Municipal Maria José",
    date: "2023-04-03",
    type: "health",
    severity: "critical",
    description: "Aluna apresentou mal-estar e tontura durante a aula de Educação Física. Foi atendida na sala da coordenação e os pais foram chamados para buscá-la.",
    reportedById: "tch2",
    reportedByName: "Maria Souza",
    reportedByRole: "teacher",
    parentNotified: true,
    parentResponse: "Mãe informou que a aluna está em tratamento médico e trará atestado amanhã.",
    resolved: true,
    resolutionDate: "2023-04-04"
  },
  {
    id: "occ4",
    studentId: "std4",
    studentName: "João Pereira",
    schoolId: "sch2",
    schoolName: "Escola Municipal Maria José",
    date: "2023-04-12",
    type: "performance",
    severity: "low",
    description: "Aluno está apresentando dificuldades significativas nas atividades de Matemática. Recomenda-se acompanhamento pedagógico.",
    reportedById: "tch3",
    reportedByName: "Roberto Alves",
    reportedByRole: "teacher",
    measures: "Encaminhamento para reforço escolar nas quartas-feiras",
    parentNotified: false,
    resolved: false
  },
  {
    id: "occ5",
    studentId: "std2",
    studentName: "Pedro Santos",
    schoolId: "sch1",
    schoolName: "Escola Municipal João Paulo",
    date: "2023-03-25",
    type: "accident",
    severity: "medium",
    description: "Aluno caiu durante o recreio e sofreu escoriações leves no joelho. Foi atendido pela coordenação e higienizado o ferimento.",
    reportedById: "coord1",
    reportedByName: "Regina Souza",
    reportedByRole: "coordinator",
    parentNotified: true,
    resolved: true,
    resolutionDate: "2023-03-25"
  }
];

// Helper functions for mapping types to colors and labels
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "low":
      return "bg-yellow-100 text-yellow-800";
    case "medium":
      return "bg-orange-100 text-orange-800";
    case "high":
      return "bg-red-100 text-red-800";
    case "critical":
      return "bg-purple-100 text-purple-800";
    default:
      return "";
  }
};

const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case "low":
      return "Baixa";
    case "medium":
      return "Média";
    case "high":
      return "Alta";
    case "critical":
      return "Crítica";
    default:
      return "";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "disciplinary":
      return "Disciplinar";
    case "accident":
      return "Acidente";
    case "health":
      return "Saúde";
    case "performance":
      return "Desempenho";
    case "other":
      return "Outro";
    default:
      return "";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "disciplinary":
      return "bg-red-100 text-red-800";
    case "accident":
      return "bg-orange-100 text-orange-800";
    case "health":
      return "bg-blue-100 text-blue-800";
    case "performance":
      return "bg-green-100 text-green-800";
    case "other":
      return "bg-gray-100 text-gray-800";
    default:
      return "";
  }
};

const RegistroOcorrencias = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("lista");
  
  // Filter occurrences based on search and filters
  const filteredOccurrences = mockOccurrences.filter((occurrence) => {
    return (
      (occurrence.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       occurrence.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (typeFilter === "all" || occurrence.type === typeFilter) &&
      (severityFilter === "all" || occurrence.severity === severityFilter) &&
      (statusFilter === "all" || 
       (statusFilter === "resolved" && occurrence.resolved) ||
       (statusFilter === "unresolved" && !occurrence.resolved)) &&
      (schoolFilter === "all" || occurrence.schoolId === schoolFilter)
    );
  });

  return (
    
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Registro de Ocorrências</h1>
        
        <Tabs defaultValue="lista" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="lista">Ocorrências</TabsTrigger>
            <TabsTrigger value="nova">Nova Ocorrência</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="lista">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Ocorrências</CardTitle>
                <CardDescription>
                  Consulta e gerenciamento de ocorrências disciplinares e outros registros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar por aluno ou descrição..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de ocorrência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="disciplinary">Disciplinar</SelectItem>
                      <SelectItem value="accident">Acidente</SelectItem>
                      <SelectItem value="health">Saúde</SelectItem>
                      <SelectItem value="performance">Desempenho</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Gravidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as gravidades</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="resolved">Resolvida</SelectItem>
                      <SelectItem value="unresolved">Pendente</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Escola" />
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
                        <TableHead>Aluno</TableHead>
                        <TableHead>Escola</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Gravidade</TableHead>
                        <TableHead>Reportado por</TableHead>
                        <TableHead>Notificação aos Pais</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOccurrences.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4">
                            Nenhuma ocorrência encontrada com os filtros selecionados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOccurrences.map((occurrence) => (
                          <TableRow key={occurrence.id}>
                            <TableCell className="font-medium">{occurrence.studentName}</TableCell>
                            <TableCell>{occurrence.schoolName}</TableCell>
                            <TableCell>{new Date(occurrence.date).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getTypeColor(occurrence.type)}
                              >
                                {getTypeLabel(occurrence.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getSeverityColor(occurrence.severity)}
                              >
                                {getSeverityLabel(occurrence.severity)}
                              </Badge>
                            </TableCell>
                            <TableCell>{occurrence.reportedByName}</TableCell>
                            <TableCell>
                              {occurrence.parentNotified ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  Notificado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {occurrence.resolved ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  Resolvida
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                  Em andamento
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
                                  <DropdownMenuItem>Editar</DropdownMenuItem>
                                  <DropdownMenuItem>Notificar Pais</DropdownMenuItem>
                                  <DropdownMenuItem>Marcar como Resolvida</DropdownMenuItem>
                                  <DropdownMenuItem>Histórico do Aluno</DropdownMenuItem>
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
                    Exibindo {filteredOccurrences.length} de {mockOccurrences.length} ocorrências
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Exportar</Button>
                  <Button onClick={() => setActiveTab("nova")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Ocorrência
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="nova">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nova Ocorrência</CardTitle>
                <CardDescription>
                  Preencha o formulário para registrar uma nova ocorrência
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dados da Ocorrência</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Aluno</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um aluno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="std1">Ana Silva - 5º ano A</SelectItem>
                          <SelectItem value="std2">Pedro Santos - 5º ano A</SelectItem>
                          <SelectItem value="std3">Maria Oliveira - 8º ano B</SelectItem>
                          <SelectItem value="std4">João Pereira - 5º ano C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Escola</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma escola" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sch1">E.M. João Paulo</SelectItem>
                          <SelectItem value="sch2">E.M. Maria José</SelectItem>
                          <SelectItem value="sch3">CMEI Pequeno Príncipe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data da Ocorrência</label>
                      <Input type="date" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hora da Ocorrência</label>
                      <Input type="time" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de Ocorrência</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disciplinary">Disciplinar</SelectItem>
                          <SelectItem value="accident">Acidente</SelectItem>
                          <SelectItem value="health">Saúde</SelectItem>
                          <SelectItem value="performance">Desempenho</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gravidade</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a gravidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Descrição da Ocorrência</h3>
                  <Textarea
                    placeholder="Descreva detalhadamente o ocorrido..."
                    className="min-h-[150px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Medidas Adotadas</h3>
                    <Textarea
                      placeholder="Descreva as medidas tomadas, caso aplicável..."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Encaminhamentos</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notifyParents" className="rounded" />
                        <label htmlFor="notifyParents">Notificar responsáveis</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="scheduleMeeting" className="rounded" />
                        <label htmlFor="scheduleMeeting">Agendar reunião com responsáveis</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="pedagogicalSupport" className="rounded" />
                        <label htmlFor="pedagogicalSupport">Encaminhar para apoio pedagógico</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="psychologicalSupport" className="rounded" />
                        <label htmlFor="psychologicalSupport">Encaminhar para apoio psicológico</label>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Input type="text" placeholder="Outros encaminhamentos..." />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Anexos</h3>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileText className="w-10 h-10 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clique para anexar documento</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG ou PNG</p>
                      </div>
                      <input id="dropzone-file" type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancelar</Button>
                <div className="flex gap-2">
                  <Button variant="outline">Salvar Rascunho</Button>
                  <Button>Registrar Ocorrência</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Ocorrências</CardTitle>
                <CardDescription>
                  Análise e estatísticas de ocorrências registradas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total de Ocorrências</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <FileText className="h-10 w-10 text-blue-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">{mockOccurrences.length}</p>
                          <p className="text-sm text-gray-500">Registradas em 2023</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Disciplinares</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <AlertTriangle className="h-10 w-10 text-red-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">
                            {mockOccurrences.filter(o => o.type === 'disciplinary').length}
                          </p>
                          <p className="text-sm text-gray-500">Ocorrências disciplinares</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Resolvidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Bell className="h-10 w-10 text-green-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">
                            {mockOccurrences.filter(o => o.resolved).length}
                          </p>
                          <p className="text-sm text-gray-500">Ocorrências resolvidas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Calendar className="h-10 w-10 text-yellow-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">
                            {mockOccurrences.filter(o => !o.resolved).length}
                          </p>
                          <p className="text-sm text-gray-500">Ocorrências em andamento</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Ocorrências por Tipo</h3>
                  <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-500">Gráfico de ocorrências por tipo será exibido aqui</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Ocorrências por Escola</h3>
                  <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-500">Gráfico de ocorrências por escola será exibido aqui</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Alunos com Múltiplas Ocorrências</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Aluno</TableHead>
                          <TableHead>Escola</TableHead>
                          <TableHead>Total de Ocorrências</TableHead>
                          <TableHead>Disciplinares</TableHead>
                          <TableHead>Desempenho</TableHead>
                          <TableHead>Outras</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Pedro Santos</TableCell>
                          <TableCell>E.M. João Paulo</TableCell>
                          <TableCell>2</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>0</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Ver Histórico</Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório Completo
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default RegistroOcorrencias;
