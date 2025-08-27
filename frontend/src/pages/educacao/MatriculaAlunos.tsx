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
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  ChevronDown, 
  Plus, 
  UserPlus, 
  Users, 
  UserCheck, 
  FileText, 
  GraduationCap,
  Calendar,
  ClipboardList,
  School
} from "lucide-react";
import { Student, Enrollment } from "@/types/educacao";

// Mock data for students
const mockStudents: Student[] = [
  {
    id: "std1",
    name: "Ana Silva",
    birthDate: "2013-05-12",
    gender: "female",
    documentNumber: "12345678901",
    motherName: "Maria Silva",
    fatherName: "João Silva",
    guardianPhone: "(11) 99988-7766",
    guardianEmail: "maria.silva@email.com",
    address: "Rua das Flores, 123 - Centro",
    enrollments: [
      {
        id: "enr1",
        studentId: "std1",
        schoolId: "sch1",
        schoolName: "Escola Municipal João Paulo",
        grade: "5º Ano",
        className: "A",
        schoolYear: "2023",
        status: "active",
        enrollmentDate: "2023-02-01"
      }
    ]
  },
  {
    id: "std2",
    name: "Pedro Santos",
    birthDate: "2012-11-25",
    gender: "male",
    documentNumber: "98765432109",
    motherName: "Ana Santos",
    fatherName: "Carlos Santos",
    guardianPhone: "(11) 99876-5432",
    guardianEmail: "ana.santos@email.com",
    address: "Av. Principal, 500 - Jardim América",
    enrollments: [
      {
        id: "enr2",
        studentId: "std2",
        schoolId: "sch1",
        schoolName: "Escola Municipal João Paulo",
        grade: "5º Ano",
        className: "A",
        schoolYear: "2023",
        status: "active",
        enrollmentDate: "2023-02-01"
      }
    ]
  },
  {
    id: "std3",
    name: "Maria Oliveira",
    birthDate: "2010-03-15",
    gender: "female",
    documentNumber: "56789012345",
    motherName: "Fernanda Oliveira",
    guardianName: "Fernanda Oliveira",
    guardianPhone: "(11) 99765-4321",
    guardianEmail: "fernanda.oliveira@email.com",
    address: "Rua São Paulo, 75 - Vila Nova",
    enrollments: [
      {
        id: "enr3",
        studentId: "std3",
        schoolId: "sch2",
        schoolName: "Escola Municipal Maria José",
        grade: "8º Ano",
        className: "B",
        schoolYear: "2023",
        status: "active",
        enrollmentDate: "2023-02-01"
      }
    ],
    specialNeeds: "Dislexia",
    healthIssues: "Asma"
  },
  {
    id: "std4",
    name: "João Pereira",
    birthDate: "2013-08-20",
    gender: "male",
    documentNumber: "45678901234",
    motherName: "Carla Pereira",
    fatherName: "Roberto Pereira",
    guardianPhone: "(11) 99654-3210",
    address: "Rua Boa Vista, 150 - Centro",
    enrollments: [
      {
        id: "enr4",
        studentId: "std4",
        schoolId: "sch2",
        schoolName: "Escola Municipal Maria José",
        grade: "5º Ano",
        className: "C",
        schoolYear: "2023",
        status: "active",
        enrollmentDate: "2023-02-01"
      }
    ]
  },
  {
    id: "std5",
    name: "Mariana Costa",
    birthDate: "2016-01-10",
    gender: "female",
    documentNumber: "34567890123",
    motherName: "Patricia Costa",
    fatherName: "Eduardo Costa",
    guardianPhone: "(11) 99543-2109",
    guardianEmail: "patricia.costa@email.com",
    address: "Rua das Palmeiras, 45 - Jardim Europa",
    enrollments: [
      {
        id: "enr5",
        studentId: "std5",
        schoolId: "sch3",
        schoolName: "CMEI Pequeno Príncipe",
        grade: "Pré II",
        className: "A",
        schoolYear: "2023",
        status: "transferred",
        enrollmentDate: "2023-02-01",
        withdrawalDate: "2023-06-15",
        observations: "Transferido para CMEI Alegria"
      }
    ]
  }
];

// Helper function for enrollment status colors
const getEnrollmentStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "transferred":
      return "bg-blue-100 text-blue-800";
    case "withdrawn":
      return "bg-amber-100 text-amber-800";
    case "graduated":
      return "bg-purple-100 text-purple-800";
    case "pending":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getEnrollmentStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Ativo";
    case "transferred":
      return "Transferido";
    case "withdrawn":
      return "Evadido";
    case "graduated":
      return "Concluído";
    case "pending":
      return "Pendente";
    default:
      return status;
  }
};

const MatriculaAlunos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("todos");
  const [schoolFilter, setSchoolFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [activeTab, setActiveTab] = useState("alunos");

  // Filter students based on search and filters
  const filteredStudents = mockStudents.filter((student) => {
    // Search in student name, document, or guardian
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.documentNumber.includes(searchTerm) ||
                         student.motherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.fatherName && student.fatherName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Get current enrollment
    const currentEnrollment = student.enrollments[0];
    
    // Filter by school
    const matchesSchool = schoolFilter === "todos" || currentEnrollment.schoolId === schoolFilter;
    
    // Filter by grade
    const matchesGrade = gradeFilter === "todos" || currentEnrollment.grade === gradeFilter;
    
    // Filter by status
    const matchesStatus = statusFilter === "todos" || currentEnrollment.status === statusFilter;
    
    return matchesSearch && matchesSchool && matchesGrade && matchesStatus;
  });

  return (
    
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Matrícula de Alunos</h1>
        
        <Tabs defaultValue="alunos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="alunos">Alunos</TabsTrigger>
            <TabsTrigger value="nova-matricula">Nova Matrícula</TabsTrigger>
            <TabsTrigger value="transferencias">Transferências</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="alunos">
            <Card>
              <CardHeader>
                <CardTitle>Alunos Matriculados</CardTitle>
                <CardDescription>
                  Gerenciamento de matrículas e cadastro de alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar por nome, documento ou responsável..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Escola" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as escolas</SelectItem>
                      <SelectItem value="sch1">E.M. João Paulo</SelectItem>
                      <SelectItem value="sch2">E.M. Maria José</SelectItem>
                      <SelectItem value="sch3">CMEI Pequeno Príncipe</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Série/Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as séries</SelectItem>
                      <SelectItem value="Pré I">Pré I</SelectItem>
                      <SelectItem value="Pré II">Pré II</SelectItem>
                      <SelectItem value="1º Ano">1º Ano</SelectItem>
                      <SelectItem value="2º Ano">2º Ano</SelectItem>
                      <SelectItem value="3º Ano">3º Ano</SelectItem>
                      <SelectItem value="4º Ano">4º Ano</SelectItem>
                      <SelectItem value="5º Ano">5º Ano</SelectItem>
                      <SelectItem value="6º Ano">6º Ano</SelectItem>
                      <SelectItem value="7º Ano">7º Ano</SelectItem>
                      <SelectItem value="8º Ano">8º Ano</SelectItem>
                      <SelectItem value="9º Ano">9º Ano</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="transferred">Transferido</SelectItem>
                      <SelectItem value="withdrawn">Evadido</SelectItem>
                      <SelectItem value="graduated">Concluído</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={() => setActiveTab("nova-matricula")}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nova Matrícula
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Data de Nascimento</TableHead>
                        <TableHead>Escola</TableHead>
                        <TableHead>Turma</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Nenhum aluno encontrado com os filtros selecionados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudents.map((student) => {
                          const currentEnrollment = student.enrollments[0];
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">
                                <div>
                                  {student.name}
                                  <div className="text-xs text-gray-500 mt-1">
                                    Documento: {student.documentNumber}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(student.birthDate).toLocaleDateString("pt-BR")}
                              </TableCell>
                              <TableCell>{currentEnrollment.schoolName}</TableCell>
                              <TableCell>
                                {currentEnrollment.grade} {currentEnrollment.className}
                              </TableCell>
                              <TableCell>
                                <div>
                                  {student.motherName}
                                  <div className="text-xs text-gray-500 mt-1">
                                    Tel: {student.guardianPhone}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={getEnrollmentStatusColor(currentEnrollment.status)}
                                >
                                  {getEnrollmentStatusLabel(currentEnrollment.status)}
                                </Badge>
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
                                    <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                                    <DropdownMenuItem>Editar Cadastro</DropdownMenuItem>
                                    <DropdownMenuItem>Histórico Escolar</DropdownMenuItem>
                                    <DropdownMenuItem>Documentação</DropdownMenuItem>
                                    <DropdownMenuItem>Transferir</DropdownMenuItem>
                                    <DropdownMenuItem>Cancelar Matrícula</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Exibindo {filteredStudents.length} de {mockStudents.length} alunos
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Exportar Lista</Button>
                  <Button variant="outline">Imprimir</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="nova-matricula">
            <Card>
              <CardHeader>
                <CardTitle>Nova Matrícula</CardTitle>
                <CardDescription>
                  Cadastro de novo aluno ou matrícula de aluno existente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border p-4 rounded-md bg-blue-50">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UserPlus className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-blue-700">Novo cadastro ou matrícula existente?</h4>
                      <p className="text-sm text-blue-600 mt-1">
                        Se o aluno já possui cadastro no sistema, você pode realizar uma nova matrícula sem precisar cadastrar novamente os dados pessoais.
                      </p>
                      <div className="mt-4 flex space-x-4">
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Novo Aluno
                        </Button>
                        <Button variant="outline">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Aluno Existente
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dados Pessoais do Aluno</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome Completo</label>
                      <Input placeholder="Nome completo do aluno" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Nascimento</label>
                      <Input type="date" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CPF</label>
                      <Input placeholder="000.000.000-00" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">RG (se houver)</label>
                      <Input placeholder="00.000.000-0" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sexo</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nacionalidade</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brasileira">Brasileira</SelectItem>
                          <SelectItem value="estrangeira">Estrangeira</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endereço Completo</label>
                    <Input placeholder="Rua, número, complemento" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Filiação e Responsáveis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome da Mãe</label>
                      <Input placeholder="Nome completo da mãe" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CPF da Mãe</label>
                      <Input placeholder="000.000.000-00" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome do Pai</label>
                      <Input placeholder="Nome completo do pai" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CPF do Pai</label>
                      <Input placeholder="000.000.000-00" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Responsável Legal (se diferente da filiação)</label>
                      <Input placeholder="Nome completo do responsável" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CPF do Responsável</label>
                      <Input placeholder="000.000.000-00" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefone de Contato</label>
                      <Input placeholder="(00) 00000-0000" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">E-mail</label>
                      <Input type="email" placeholder="email@exemplo.com" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dados da Matrícula</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Escola</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma escola" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sch1">Escola Municipal João Paulo</SelectItem>
                          <SelectItem value="sch2">Escola Municipal Maria José</SelectItem>
                          <SelectItem value="sch3">CMEI Pequeno Príncipe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ano Letivo</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ano letivo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Série/Ano</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a série" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pré I">Pré I</SelectItem>
                          <SelectItem value="Pré II">Pré II</SelectItem>
                          <SelectItem value="1º Ano">1º Ano</SelectItem>
                          <SelectItem value="2º Ano">2º Ano</SelectItem>
                          <SelectItem value="3º Ano">3º Ano</SelectItem>
                          <SelectItem value="4º Ano">4º Ano</SelectItem>
                          <SelectItem value="5º Ano">5º Ano</SelectItem>
                          <SelectItem value="6º Ano">6º Ano</SelectItem>
                          <SelectItem value="7º Ano">7º Ano</SelectItem>
                          <SelectItem value="8º Ano">8º Ano</SelectItem>
                          <SelectItem value="9º Ano">9º Ano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Turma</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a turma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Turma A</SelectItem>
                          <SelectItem value="B">Turma B</SelectItem>
                          <SelectItem value="C">Turma C</SelectItem>
                          <SelectItem value="D">Turma D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Turno</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o turno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Manhã</SelectItem>
                          <SelectItem value="afternoon">Tarde</SelectItem>
                          <SelectItem value="evening">Noite</SelectItem>
                          <SelectItem value="fulltime">Integral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data da Matrícula</label>
                      <Input type="date" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Adicionais</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Necessidades Especiais</label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="special_needs" className="rounded" />
                        <label htmlFor="special_needs">Possui necessidades especiais</label>
                      </div>
                    </div>
                    <Textarea placeholder="Descreva as necessidades especiais, se houver" className="mt-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Condições de Saúde</label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="health_issues" className="rounded" />
                        <label htmlFor="health_issues">Possui condições de saúde relevantes</label>
                      </div>
                    </div>
                    <Textarea placeholder="Descreva condições de saúde relevantes, alergias, medicamentos, etc." className="mt-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Observações</label>
                    <Textarea placeholder="Observações adicionais sobre o aluno ou a matrícula" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("alunos")}>
                  Cancelar
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">Salvar como Rascunho</Button>
                  <Button onClick={() => setActiveTab("alunos")}>
                    Confirmar Matrícula
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="transferencias">
            <Card>
              <CardHeader>
                <CardTitle>Transferências</CardTitle>
                <CardDescription>
                  Gerenciamento de transferências entre escolas ou redes de ensino
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        Solicitações de Transferência
                      </CardTitle>
                      <CardDescription>Solicitações de saída para outras escolas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-8 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">Nenhuma solicitação pendente</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Nova Transferência
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <UserCheck className="h-5 w-5 mr-2 text-green-500" />
                        Recebimento de Transferência
                      </CardTitle>
                      <CardDescription>Alunos recebidos por transferência de outras escolas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-8 text-center">
                        <UserCheck className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">Nenhuma transferência para receber</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Receber Aluno por Transferência
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <h3 className="text-lg font-medium">Histórico de Transferências</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Escola de Origem</TableHead>
                        <TableHead>Escola de Destino</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          Mariana Costa
                        </TableCell>
                        <TableCell>15/06/2023</TableCell>
                        <TableCell>CMEI Pequeno Príncipe</TableCell>
                        <TableCell>CMEI Alegria</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Concluída
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Ver Detalhes</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Matrícula</CardTitle>
                <CardDescription>
                  Relatórios e estatísticas de matrículas e alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Alunos Matriculados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Users className="h-10 w-10 text-blue-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">{mockStudents.length}</p>
                          <p className="text-sm text-gray-500">Total de matrículas ativas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Transferências</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <UserCheck className="h-10 w-10 text-green-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">
                            {mockStudents.filter(s => s.enrollments.some(e => e.status === "transferred")).length}
                          </p>
                          <p className="text-sm text-gray-500">Transferências no ano</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Novas Matrículas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <UserPlus className="h-10 w-10 text-purple-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">0</p>
                          <p className="text-sm text-gray-500">Nos últimos 30 dias</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Escolas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <School className="h-10 w-10 text-amber-500 mr-4" />
                        <div>
                          <p className="text-3xl font-bold">3</p>
                          <p className="text-sm text-gray-500">Com matrículas ativas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Relatórios Disponíveis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Users className="h-5 w-5 mr-2 text-blue-500" />
                          Alunos por Série
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Relatório quantitativo de alunos matriculados por série e turma.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Calendar className="h-5 w-5 mr-2 text-green-500" />
                          Matrículas por Período
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Análise de matrículas realizadas por período do ano letivo.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <ClipboardList className="h-5 w-5 mr-2 text-purple-500" />
                          Listas de Chamada
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Geração de listas de chamada para todas as turmas.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <GraduationCap className="h-5 w-5 mr-2 text-amber-500" />
                          Declarações e Atestados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Emissão de documentos oficiais para alunos matriculados.
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
        </Tabs>
      </div>
    
  );
};

export default MatriculaAlunos;
