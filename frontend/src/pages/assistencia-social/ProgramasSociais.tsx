
import { useState } from "react";
// Layout removido - já está no App.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ProgramaSocial } from "@/types/assistencia-social";
import { Search, Plus, File, Edit, Target, Users, Calendar, CheckCircle, AlertTriangle, Clock, BarChart3, Heart, Home, Baby, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";

// Dados mockados para equipamentos CRAS
const equipamentosCRAS = [
  {
    id: "cras-001",
    nome: "CRAS Centro",
    endereco: "Rua Principal, 123 - Centro",
    telefone: "(11) 3456-7890",
    responsavel: "Fernanda Oliveira",
    familias_atendidas: 456,
    capacidade: 500,
    servicos: ["PAIF", "SCFV", "Cadastro Único", "BPC"],
    status: "funcionando",
    horario: "7h às 17h"
  },
  {
    id: "cras-002",
    nome: "CRAS Vila Nova",
    endereco: "Av. das Flores, 567 - Vila Nova",
    telefone: "(11) 3456-7891",
    responsavel: "Roberto Santos",
    familias_atendidas: 389,
    capacidade: 450,
    servicos: ["PAIF", "SCFV", "Cadastro Único"],
    status: "funcionando",
    horario: "8h às 18h"
  }
];

// Dados mockados para equipamentos CREAS
const equipamentosCREAS = [
  {
    id: "creas-001",
    nome: "CREAS Municipal",
    endereco: "Rua dos Direitos, 45 - Centro",
    telefone: "(11) 3456-7893",
    responsavel: "Dr. Paulo Ferreira",
    casos_ativos: 89,
    capacidade: 120,
    servicos: ["PAEFI", "MSE", "Abordagem Social", "Plantão Social"],
    status: "funcionando",
    especialidades: ["Psicólogo", "Assistente Social", "Advogado"]
  }
];

// Dados para analytics
const atendimentosData = [
  { mes: "Jan", total: 2145, novos: 423, renovacoes: 1722 },
  { mes: "Fev", total: 2289, novos: 456, renovacoes: 1833 },
  { mes: "Mar", total: 2134, novos: 398, renovacoes: 1736 },
  { mes: "Abr", total: 2387, novos: 512, renovacoes: 1875 },
  { mes: "Mai", total: 2456, novos: 534, renovacoes: 1922 }
];

const beneficiosPorCategoria = [
  { categoria: "Transferência Renda", quantidade: 1247, percentual: 42 },
  { categoria: "Segurança Alimentar", quantidade: 892, percentual: 30 },
  { categoria: "Habitação", quantidade: 156, percentual: 5 },
  { categoria: "Primeira Infância", quantidade: 423, percentual: 14 },
  { categoria: "Idosos", quantidade: 267, percentual: 9 }
];

// Mock data
const mockProgramasSociais: ProgramaSocial[] = [
  {
    id: "1",
    nome: "Auxílio Alimentação Municipal",
    descricao: "Programa de suplementação alimentar para famílias em situação de extrema pobreza",
    publico: "Famílias com renda per capita inferior a R$ 89,00",
    requisitos: [
      "Estar inscrito no Cadastro Único",
      "Possuir renda per capita inferior a R$ 89,00",
      "Residir no município há pelo menos 6 meses"
    ],
    beneficios: [
      "Cartão alimentação mensal no valor de R$ 120,00",
      "Acesso prioritário a outros programas sociais"
    ],
    periodoInscricao: "Contínuo",
    status: "ativo",
    responsavel: "Secretaria Municipal de Assistência Social",
    orcamento: 500000,
    atendidos: 350,
    meta: 400
  },
  {
    id: "2",
    nome: "Auxílio Moradia Emergencial",
    descricao: "Apoio financeiro para famílias desabrigadas ou em áreas de risco",
    publico: "Famílias desabrigadas ou residentes em áreas de risco",
    requisitos: [
      "Laudo da Defesa Civil confirmando situação de risco",
      "Estar inscrito no Cadastro Único",
      "Não possuir outro imóvel"
    ],
    beneficios: [
      "Aluguel social no valor de até R$ 500,00 por até 6 meses",
      "Acompanhamento social para reinserção habitacional"
    ],
    periodoInscricao: "Contínuo - mediante avaliação técnica",
    status: "ativo",
    responsavel: "Coordenadoria de Habitação Social",
    orcamento: 300000,
    atendidos: 42,
    meta: 60
  },
  {
    id: "3",
    nome: "Primeiro Emprego Jovem",
    descricao: "Programa de qualificação profissional e inserção no mercado de trabalho",
    publico: "Jovens de 16 a 24 anos em situação de vulnerabilidade social",
    requisitos: [
      "Idade entre 16 e 24 anos",
      "Estar cursando ou ter concluído o ensino médio",
      "Renda familiar per capita de até meio salário mínimo"
    ],
    beneficios: [
      "Curso de qualificação profissional de 160h",
      "Auxílio transporte durante o curso",
      "Encaminhamento prioritário para vagas de estágio e aprendiz"
    ],
    periodoInscricao: "01/03/2023 a 15/04/2023",
    status: "ativo",
    responsavel: "Secretaria de Desenvolvimento Social e Trabalho",
    orcamento: 250000,
    atendidos: 120,
    meta: 150
  },
  {
    id: "4",
    nome: "Cuidar - Atenção ao Idoso",
    descricao: "Programa de suporte a idosos em situação de vulnerabilidade e seus cuidadores",
    publico: "Idosos acima de 60 anos em situação de vulnerabilidade social",
    requisitos: [
      "Idade igual ou superior a 60 anos",
      "Situação de vulnerabilidade social comprovada",
      "Avaliação de equipe técnica"
    ],
    beneficios: [
      "Visitas domiciliares periódicas",
      "Fornecimento de kit higiene e alimentação",
      "Capacitação para cuidadores familiares",
      "Cuidador profissional por até 6h semanais"
    ],
    periodoInscricao: "Contínuo",
    status: "ativo",
    responsavel: "Coordenadoria Municipal do Idoso",
    orcamento: 420000,
    atendidos: 85,
    meta: 100
  },
  {
    id: "5",
    nome: "Reconstruir - Empreendedorismo Social",
    descricao: "Apoio a iniciativas de geração de renda para população vulnerável",
    publico: "Adultos em situação de vulnerabilidade social",
    requisitos: [
      "Estar inscrito no Cadastro Único",
      "Participar das oficinas de capacitação",
      "Apresentar proposta de negócio viável"
    ],
    beneficios: [
      "Capacitação em empreendedorismo (80h)",
      "Microcrédito de até R$ 2.500,00 para investimento inicial",
      "Consultoria técnica por 6 meses"
    ],
    periodoInscricao: "05/06/2023 a 20/07/2023",
    status: "em planejamento",
    responsavel: "Secretaria de Desenvolvimento Econômico",
    orcamento: 180000,
    atendidos: 0,
    meta: 50
  }
];

export default function ProgramasSociais() {
  const { toast } = useToast();
  const [programas, setProgramas] = useState<ProgramaSocial[]>(mockProgramasSociais);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [programaSelecionado, setProgramaSelecionado] = useState<ProgramaSocial | null>(null);
  
  const handleSearch = () => {
    let results = [...mockProgramasSociais];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (programa) =>
          programa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          programa.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
          programa.publico.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "todos") {
      results = results.filter(programa => programa.status === statusFilter);
    }
    
    setProgramas(results);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Ativo</Badge>;
      case "inativo":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Inativo</Badge>;
      case "em planejamento":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Em Planejamento</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const totalBeneficiarios = mockProgramasSociais.reduce((acc, prog) => acc + prog.atendidos, 0);
  const totalFamiliasCRAS = equipamentosCRAS.reduce((acc, cras) => acc + cras.familias_atendidas, 0);

  return (
    <div>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Secretaria de Assistência Social</h1>
            <p className="text-sm text-muted-foreground">
              Gestão integral dos programas sociais e equipamentos SUAS
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Programa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Programa Social</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para cadastrar um novo programa social.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-center py-8 text-muted-foreground">
                    Formulário de cadastro será implementado em breve.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    setIsDialogOpen(false);
                    toast({
                      title: "Cadastro em desenvolvimento",
                      description: "O formulário de cadastro está em implementação."
                    });
                  }}>
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{totalBeneficiarios.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Beneficiários</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Home className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{totalFamiliasCRAS.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Famílias CRAS</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{equipamentosCREAS[0].casos_ativos}</div>
              <div className="text-xs text-muted-foreground">Casos CREAS</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">R$ 1.2M</div>
              <div className="text-xs text-muted-foreground">Orçamento Total</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros de Busca</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, descrição ou público-alvo..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select defaultValue="todos" onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status do programa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="em planejamento">Em Planejamento</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="programas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="programas">Programas Sociais</TabsTrigger>
            <TabsTrigger value="cras">CRAS</TabsTrigger>
            <TabsTrigger value="creas">CREAS</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="programas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programas.length === 0 ? (
            <div className="col-span-full text-center py-8">
              Nenhum programa social encontrado com os critérios de busca.
            </div>
          ) : (
            programas.map((programa) => (
              <Card key={programa.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl pr-2">{programa.nome}</CardTitle>
                    {getStatusBadge(programa.status)}
                  </div>
                  <CardDescription>{programa.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 space-y-3">
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Público-alvo:</span>
                    <span className="ml-2">{programa.publico}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Inscrições:</span>
                    <span className="ml-2">{programa.periodoInscricao}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium">Progresso:</div>
                      <div className="text-sm">
                        {programa.atendidos} de {programa.meta} ({Math.round((programa.atendidos / programa.meta) * 100)}%)
                      </div>
                    </div>
                    <Progress value={(programa.atendidos / programa.meta) * 100} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => setProgramaSelecionado(programa)}>
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    toast({
                      title: "Edição de programa",
                      description: `Edição do programa ${programa.nome} iniciada`
                    });
                  }}>
                    Editar
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {programaSelecionado && (
          <Dialog open={!!programaSelecionado} onOpenChange={() => setProgramaSelecionado(null)}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{programaSelecionado.nome}</DialogTitle>
                  {getStatusBadge(programaSelecionado.status)}
                </div>
                <DialogDescription>
                  {programaSelecionado.descricao}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">INFORMAÇÕES GERAIS</h3>
                    
                    <div className="mt-2 space-y-3">
                      <div>
                        <div className="text-sm font-medium">Público-alvo</div>
                        <div className="text-sm">{programaSelecionado.publico}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Período de Inscrição</div>
                        <div className="text-sm">{programaSelecionado.periodoInscricao}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Responsável</div>
                        <div className="text-sm">{programaSelecionado.responsavel}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Orçamento</div>
                        <div className="text-sm">{formatCurrency(programaSelecionado.orcamento)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">REQUISITOS</h3>
                    <div className="mt-2 space-y-1">
                      {programaSelecionado.requisitos.map((requisito, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          {requisito}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">BENEFÍCIOS</h3>
                    <div className="mt-2 space-y-1">
                      {programaSelecionado.beneficios.map((beneficio, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></div>
                          {beneficio}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">PROGRESSO</h3>
                    <div className="mt-2 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Meta de atendimentos:</span>
                        <span className="font-medium">{programaSelecionado.meta}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Atendimentos realizados:</span>
                        <span className="font-medium">{programaSelecionado.atendidos}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span>Percentual de execução:</span>
                        <span className="font-medium">
                          {Math.round((programaSelecionado.atendidos / programaSelecionado.meta) * 100)}%
                        </span>
                      </div>
                      
                      <Progress 
                        value={(programaSelecionado.atendidos / programaSelecionado.meta) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setProgramaSelecionado(null)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Edição de programa",
                    description: `Edição do programa ${programaSelecionado.nome} iniciada`
                  });
                  setProgramaSelecionado(null);
                }}>
                  Editar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Programas em Destaque
            </CardTitle>
            <CardDescription>
              Programas sociais com alta prioridade e impacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Programa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programas.slice(0, 3).map((programa) => (
                  <TableRow key={programa.id}>
                    <TableCell className="font-medium">{programa.nome}</TableCell>
                    <TableCell>{getStatusBadge(programa.status)}</TableCell>
                    <TableCell>{formatCurrency(programa.orcamento)}</TableCell>
                    <TableCell>{programa.meta} pessoas</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={(programa.atendidos / programa.meta) * 100} className="h-2 w-[60px]" />
                        <span className="text-sm">
                          {Math.round((programa.atendidos / programa.meta) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Exibindo {Math.min(3, programas.length)} de {programas.length} programas
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              toast({
                title: "Relatório detalhado",
                description: "Gerando relatório detalhado de todos os programas sociais"
              });
            }}>
              <File className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
          </CardFooter>
        </Card>
          </TabsContent>

          {/* Aba CRAS */}
          <TabsContent value="cras" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Centros de Referência de Assistência Social</CardTitle>
                <CardDescription>Equipamentos de proteção social básica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipamentosCRAS.map((cras) => (
                    <Card key={cras.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{cras.nome}</CardTitle>
                            <Badge variant={cras.status === "funcionando" ? "default" : "destructive"}>
                              {cras.status}
                            </Badge>
                          </div>
                          <Home className="h-6 w-6 text-blue-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{cras.endereco}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{cras.telefone}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Famílias atendidas:</span>
                              <p className="font-medium">{cras.familias_atendidas}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Capacidade:</span>
                              <p className="font-medium">{cras.capacidade}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Taxa de ocupação:</span>
                              <span className="font-medium">{Math.round((cras.familias_atendidas / cras.capacidade) * 100)}%</span>
                            </div>
                            <Progress value={(cras.familias_atendidas / cras.capacidade) * 100} className="h-2" />
                          </div>
                          
                          <div className="text-sm">
                            <span className="text-muted-foreground">Serviços:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {cras.servicos.map((servico, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {servico}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba CREAS */}
          <TabsContent value="creas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Centro de Referência Especializado de Assistência Social</CardTitle>
                <CardDescription>Equipamento de proteção social especial</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipamentosCREAS.map((creas) => (
                    <Card key={creas.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{creas.nome}</CardTitle>
                            <Badge variant={creas.status === "funcionando" ? "default" : "destructive"}>
                              {creas.status}
                            </Badge>
                          </div>
                          <Heart className="h-6 w-6 text-red-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{creas.endereco}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Casos ativos:</span>
                              <p className="font-medium">{creas.casos_ativos}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Capacidade:</span>
                              <p className="font-medium">{creas.capacidade}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Taxa de ocupação:</span>
                              <span className="font-medium">{Math.round((creas.casos_ativos / creas.capacidade) * 100)}%</span>
                            </div>
                            <Progress value={(creas.casos_ativos / creas.capacidade) * 100} className="h-2" />
                          </div>
                          
                          <div className="text-sm">
                            <span className="text-muted-foreground">Serviços:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {creas.servicos.map((servico, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {servico}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução dos Atendimentos</CardTitle>
                  <CardDescription>Total de atendimentos por mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveLine
                      data={[
                        {
                          id: "Total",
                          color: "hsl(210, 70%, 50%)",
                          data: atendimentosData.map(d => ({ x: d.mes, y: d.total })),
                        },
                        {
                          id: "Novos",
                          color: "hsl(142, 70%, 45%)",
                          data: atendimentosData.map(d => ({ x: d.mes, y: d.novos })),
                        }
                      ]}
                      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                      xScale={{ type: "point" }}
                      yScale={{ type: "linear", min: "auto", max: "auto" }}
                      curve="cardinal"
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Mês",
                        legendOffset: 36,
                        legendPosition: "middle",
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Atendimentos",
                        legendOffset: -40,
                        legendPosition: "middle",
                      }}
                      pointSize={10}
                      pointColor={{ theme: "background" }}
                      pointBorderWidth={2}
                      pointBorderColor={{ from: "serieColor" }}
                      useMesh={true}
                      legends={[
                        {
                          anchor: "bottom-right",
                          direction: "column",
                          justify: false,
                          translateX: 100,
                          translateY: 0,
                          itemsSpacing: 0,
                          itemDirection: "left-to-right",
                          itemWidth: 80,
                          itemHeight: 20,
                          itemOpacity: 0.75,
                          symbolSize: 12,
                          symbolShape: "circle",
                        },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>Tipos de benefícios mais demandados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveBar
                      data={beneficiosPorCategoria}
                      keys={["quantidade"]}
                      indexBy="categoria"
                      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                      padding={0.3}
                      colors={["hsl(210, 70%, 50%)"]}
                      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: "Categoria",
                        legendPosition: "middle",
                        legendOffset: 32,
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Quantidade",
                        legendPosition: "middle",
                        legendOffset: -40,
                      }}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">94.2%</div>
                  <div className="text-sm text-muted-foreground">Taxa de Satisfação</div>
                  <Progress value={94.2} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">1.8 dias</div>
                  <div className="text-sm text-muted-foreground">Tempo Médio Resposta</div>
                  <Progress value={85} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">87.5%</div>
                  <div className="text-sm text-muted-foreground">Taxa Ocupação CRAS</div>
                  <Progress value={87.5} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">74.2%</div>
                  <div className="text-sm text-muted-foreground">Taxa Ocupação CREAS</div>
                  <Progress value={74.2} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
