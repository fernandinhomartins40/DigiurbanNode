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
  School, 
  Users, 
  BookOpen, 
  FileText, 
  Map,
  BarChart3, 
  Building,
  Phone,
  Mail,
  User
} from "lucide-react";
import { School as SchoolType } from "@/types/educacao";

// Mock data for schools
const mockSchools: SchoolType[] = [
  {
    id: "sch1",
    name: "Escola Municipal João Paulo",
    address: "Rua das Flores, 123 - Centro",
    type: "municipal",
    principal: "Carlos Alberto",
    phone: "(11) 3456-7890",
    email: "em.joaopaulo@email.com",
    totalStudents: 450,
    totalTeachers: 28,
    totalStaff: 15,
    active: true
  },
  {
    id: "sch2",
    name: "Escola Municipal Maria José",
    address: "Av. Principal, 500 - Jardim América",
    type: "municipal",
    principal: "Ana Paula Silva",
    phone: "(11) 3456-7891",
    email: "em.mariajose@email.com",
    totalStudents: 380,
    totalTeachers: 25,
    totalStaff: 12,
    active: true
  },
  {
    id: "sch3",
    name: "CMEI Pequeno Príncipe",
    address: "Rua das Crianças, 45 - Vila Nova",
    type: "municipal",
    principal: "Roberta Santos",
    phone: "(11) 3456-7892",
    email: "cmei.pequenoprincipe@email.com",
    totalStudents: 120,
    totalTeachers: 10,
    totalStaff: 8,
    active: true
  },
  {
    id: "sch4",
    name: "Escola Municipal Paulo Freire",
    address: "Av. da Educação, 200 - Centro",
    type: "municipal",
    principal: "Ricardo Oliveira",
    phone: "(11) 3456-7893",
    email: "em.paulofreire@email.com",
    totalStudents: 520,
    totalTeachers: 35,
    totalStaff: 18,
    active: true
  },
  {
    id: "sch5",
    name: "Escola Municipal Monteiro Lobato",
    address: "Rua dos Escritores, 78 - Jardim das Letras",
    type: "municipal",
    principal: "Fernanda Lima",
    phone: "(11) 3456-7894",
    email: "em.monteirolobato@email.com",
    totalStudents: 410,
    totalTeachers: 27,
    totalStaff: 14,
    active: false
  }
];

const getSchoolTypeLabel = (type: string) => {
  switch (type) {
    case "municipal":
      return "Municipal";
    case "state":
      return "Estadual";
    case "federal":
      return "Federal";
    case "private":
      return "Privada";
    default:
      return type;
  }
};

const getSchoolTypeColor = (type: string) => {
  switch (type) {
    case "municipal":
      return "bg-blue-100 text-blue-800";
    case "state":
      return "bg-green-100 text-green-800";
    case "federal":
      return "bg-purple-100 text-purple-800";
    case "private":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const GestaoEscolar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [activeTab, setActiveTab] = useState("escolas");
  
  // Filter schools based on search and filters
  const filteredSchools = mockSchools.filter((school) => {
    return (
      (school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
       school.principal.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (typeFilter === "todos" || school.type === typeFilter) &&
      (statusFilter === "todos" || 
       (statusFilter === "active" && school.active) ||
       (statusFilter === "inactive" && !school.active))
    );
  });

  return (
    
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Gestão Escolar</h1>
        
        <Tabs defaultValue="escolas" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="escolas">Escolas</TabsTrigger>
            <TabsTrigger value="professores">Professores e Funcionários</TabsTrigger>
            <TabsTrigger value="turmas">Turmas e Disciplinas</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="escolas">
            <Card>
              <CardHeader>
                <CardTitle>Cadastro de Escolas</CardTitle>
                <CardDescription>
                  Gerenciamento das escolas da rede municipal de ensino
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar por nome, endereço ou diretor..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de escola" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="municipal">Municipal</SelectItem>
                      <SelectItem value="state">Estadual</SelectItem>
                      <SelectItem value="federal">Federal</SelectItem>
                      <SelectItem value="private">Privada</SelectItem>
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

                  <Button onClick={() => setActiveTab("nova-escola")} className="whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Escola
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Diretor</TableHead>
                        <TableHead>Alunos</TableHead>
                        <TableHead>Professores</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchools.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Nenhuma escola encontrada com os filtros selecionados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSchools.map((school) => (
                          <TableRow key={school.id}>
                            <TableCell className="font-medium">
                              <div>
                                {school.name}
                                <div className="text-xs text-gray-500 mt-1">{school.address}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getSchoolTypeColor(school.type)}
                              >
                                {getSchoolTypeLabel(school.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>{school.principal}</TableCell>
                            <TableCell>{school.totalStudents}</TableCell>
                            <TableCell>{school.totalTeachers}</TableCell>
                            <TableCell>
                              {school.active ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  Ativa
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-100 text-red-800">
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
                                  <DropdownMenuItem>Editar</DropdownMenuItem>
                                  <DropdownMenuItem>Gerenciar Turmas</DropdownMenuItem>
                                  <DropdownMenuItem>Gerenciar Professores</DropdownMenuItem>
                                  <DropdownMenuItem>{school.active ? 'Desativar' : 'Ativar'}</DropdownMenuItem>
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
                    Exibindo {filteredSchools.length} de {mockSchools.length} escolas
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Exportar Lista</Button>
                  <Button variant="outline">Gerar Relatório</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="professores">
            <Card>
              <CardHeader>
                <CardTitle>Professores e Funcionários</CardTitle>
                <CardDescription>
                  Gerenciamento do corpo docente e funcionários da rede de ensino
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar por nome, cargo ou escola..."
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="teacher">Professor</SelectItem>
                      <SelectItem value="administrator">Administrador</SelectItem>
                      <SelectItem value="support">Apoio</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Escola" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as escolas</SelectItem>
                      {mockSchools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
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

          <TabsContent value="turmas">
            <Card>
              <CardHeader>
                <CardTitle>Turmas e Disciplinas</CardTitle>
                <CardDescription>
                  Gerenciamento de turmas, disciplinas e cargas horárias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar por turma ou disciplina..."
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Escola" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as escolas</SelectItem>
                      {mockSchools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ano/Série" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os anos</SelectItem>
                      <SelectItem value="1">1º Ano</SelectItem>
                      <SelectItem value="2">2º Ano</SelectItem>
                      <SelectItem value="3">3º Ano</SelectItem>
                      <SelectItem value="4">4º Ano</SelectItem>
                      <SelectItem value="5">5º Ano</SelectItem>
                      <SelectItem value="6">6º Ano</SelectItem>
                      <SelectItem value="7">7º Ano</SelectItem>
                      <SelectItem value="8">8º Ano</SelectItem>
                      <SelectItem value="9">9º Ano</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button className="whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Turma
                  </Button>
                </div>

                <div className="p-8 text-center border rounded-md">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <h4 className="text-lg font-medium text-gray-500">Nenhuma turma cadastrada</h4>
                  <p className="text-gray-400 mt-2">
                    Clique no botão "Nova Turma" para adicionar o primeiro registro
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
                  Indicadores e métricas sobre as escolas e alunos da rede
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total de Escolas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <School className="h-10 w-10 text-blue-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">{mockSchools.length}</p>
                          <p className="text-sm text-gray-500">Escolas ativas: {mockSchools.filter(s => s.active).length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Alunos Matriculados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Users className="h-10 w-10 text-green-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">
                            {mockSchools.reduce((sum, school) => sum + school.totalStudents, 0)}
                          </p>
                          <p className="text-sm text-gray-500">Nas escolas ativas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Professores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <User className="h-10 w-10 text-purple-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">
                            {mockSchools.reduce((sum, school) => sum + school.totalTeachers, 0)}
                          </p>
                          <p className="text-sm text-gray-500">Na rede municipal</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Funcionários</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Building className="h-10 w-10 text-amber-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">
                            {mockSchools.reduce((sum, school) => sum + school.totalStaff, 0)}
                          </p>
                          <p className="text-sm text-gray-500">Apoio administrativo</p>
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
                          <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                          Desempenho por Escola
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Relatório comparativo de desempenho acadêmico entre escolas da rede.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Users className="h-5 w-5 mr-2 text-green-500" />
                          Censo Escolar
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Dados estatísticos sobre alunos, turmas, professores e infraestrutura.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <FileText className="h-5 w-5 mr-2 text-purple-500" />
                          Evasão e Transferências
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Análise dos índices de evasão, transferência e retenção de alunos.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Map className="h-5 w-5 mr-2 text-amber-500" />
                          Distribuição Geográfica
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Mapa de distribuição de alunos e escolas por região do município.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Novo Relatório
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="nova-escola">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Nova Escola</CardTitle>
                <CardDescription>
                  Preencha os dados para adicionar uma nova instituição à rede
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome da Escola</label>
                    <Input placeholder="Nome completo da instituição" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Escola</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="municipal">Municipal</SelectItem>
                        <SelectItem value="state">Estadual</SelectItem>
                        <SelectItem value="federal">Federal</SelectItem>
                        <SelectItem value="private">Privada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endereço</label>
                    <Input placeholder="Endereço completo com número" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bairro</label>
                    <Input placeholder="Bairro" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cidade</label>
                    <Input placeholder="Cidade" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CEP</label>
                    <Input placeholder="00000-000" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefone</label>
                    <Input placeholder="(00) 0000-0000" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">E-mail</label>
                    <Input type="email" placeholder="email@exemplo.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Diretor(a)</label>
                    <Input placeholder="Nome do(a) diretor(a)" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">INEP</label>
                    <Input placeholder="Código INEP da escola" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Adicionais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Capacidade de Alunos</label>
                      <Input type="number" placeholder="0" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantidade de Salas</label>
                      <Input type="number" placeholder="0" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Turnos de Funcionamento</label>
                      <div className="flex items-center space-x-4 pt-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="morning" className="rounded" />
                          <label htmlFor="morning">Manhã</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="afternoon" className="rounded" />
                          <label htmlFor="afternoon">Tarde</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="evening" className="rounded" />
                          <label htmlFor="evening">Noite</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Infraestrutura</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="library" className="rounded" />
                        <label htmlFor="library">Biblioteca</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="lab" className="rounded" />
                        <label htmlFor="lab">Laboratório de Informática</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="sports" className="rounded" />
                        <label htmlFor="sports">Quadra Esportiva</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="playground" className="rounded" />
                        <label htmlFor="playground">Parque Infantil</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="cafeteria" className="rounded" />
                        <label htmlFor="cafeteria">Refeitório</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="auditorium" className="rounded" />
                        <label htmlFor="auditorium">Auditório</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="accessibility" className="rounded" />
                        <label htmlFor="accessibility">Acessibilidade</label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("escolas")}>
                  Cancelar
                </Button>
                <Button onClick={() => setActiveTab("escolas")}>
                  Salvar
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default GestaoEscolar;
