
import { useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import { Beneficio } from "@/types/assistencia-social";
import { Search, Plus, Filter, FileDown, Calendar, CheckCircle, Clock, Wallet, FileText, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockBeneficios: Beneficio[] = [
  {
    id: "1",
    nome: "Auxílio Aluguel",
    tipo: "financeiro",
    descricao: "Benefício financeiro para pagamento de aluguel de famílias desabrigadas ou em áreas de risco",
    valor: 500,
    periodicidade: "Mensal",
    familiasBeneficiadas: 42,
    dataInicio: "2022-01-15",
    dataFim: "2023-12-31",
    status: "ativo",
    condicionalidades: [
      "Laudo da Defesa Civil confirmando situação de risco",
      "Não possuir imóvel próprio",
      "Renda familiar per capita inferior a meio salário mínimo"
    ]
  },
  {
    id: "2",
    nome: "Cartão Alimentação",
    tipo: "financeiro",
    descricao: "Benefício financeiro para compra de alimentos para famílias em situação de insegurança alimentar",
    valor: 120,
    periodicidade: "Mensal",
    familiasBeneficiadas: 350,
    dataInicio: "2022-03-01",
    status: "ativo",
    condicionalidades: [
      "Renda familiar per capita inferior a R$ 89,00",
      "Estar inscrito no Cadastro Único",
      "Participar de atividades socioeducativas mensais"
    ]
  },
  {
    id: "3",
    nome: "Kit Natalidade",
    tipo: "material",
    descricao: "Kit com itens essenciais para recém-nascidos de famílias em vulnerabilidade social",
    familiasBeneficiadas: 68,
    dataInicio: "2022-01-01",
    status: "ativo",
    condicionalidades: [
      "Renda familiar per capita inferior a meio salário mínimo",
      "Gestante realizando pré-natal regular",
      "Residir no município há pelo menos 3 meses"
    ]
  },
  {
    id: "4",
    nome: "Auxílio Funeral",
    tipo: "financeiro",
    descricao: "Benefício eventual para custeio de despesas funerárias para famílias sem condições financeiras",
    valor: 1200,
    periodicidade: "Eventual",
    familiasBeneficiadas: 24,
    dataInicio: "2022-01-01",
    status: "ativo",
    condicionalidades: [
      "Renda familiar per capita inferior a meio salário mínimo",
      "Avaliação técnica da equipe de assistência social"
    ]
  },
  {
    id: "5",
    nome: "Cesta Básica Emergencial",
    tipo: "material",
    descricao: "Cesta básica para atendimento a famílias em situação de extrema vulnerabilidade",
    familiasBeneficiadas: 126,
    dataInicio: "2022-01-01",
    status: "ativo",
    condicionalidades: [
      "Avaliação técnica da equipe de assistência social",
      "Família em situação de extrema vulnerabilidade"
    ]
  },
  {
    id: "6",
    nome: "Auxílio Energia",
    tipo: "financeiro",
    descricao: "Benefício financeiro para pagamento de conta de energia elétrica",
    valor: 80,
    periodicidade: "Mensal",
    familiasBeneficiadas: 75,
    dataInicio: "2022-06-01",
    dataFim: "2022-11-30",
    status: "encerrado",
    condicionalidades: [
      "Renda familiar per capita inferior a meio salário mínimo",
      "Possuir pessoa idosa ou com deficiência na composição familiar"
    ]
  },
  {
    id: "7",
    nome: "Programa Voltar à Escola",
    tipo: "material",
    descricao: "Kit escolar para estudantes de famílias de baixa renda",
    familiasBeneficiadas: 210,
    dataInicio: "2023-01-10",
    dataFim: "2023-02-28",
    status: "encerrado",
    condicionalidades: [
      "Estudantes regularmente matriculados na rede pública",
      "Família inscrita no Cadastro Único",
      "Renda familiar per capita inferior a meio salário mínimo"
    ]
  },
  {
    id: "8",
    nome: "Apoio ao Transporte",
    tipo: "servico",
    descricao: "Transporte gratuito para tratamentos de saúde em outras localidades",
    familiasBeneficiadas: 32,
    dataInicio: "2022-01-01",
    status: "ativo",
    condicionalidades: [
      "Encaminhamento médico para tratamento em outra localidade",
      "Avaliação socioeconômica"
    ]
  }
];

export default function GerenciamentoBeneficios() {
  const { toast } = useToast();
  const [beneficios, setBeneficios] = useState<Beneficio[]>(mockBeneficios);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [beneficioSelecionado, setBeneficioSelecionado] = useState<Beneficio | null>(null);
  
  const handleSearch = () => {
    let results = [...mockBeneficios];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (beneficio) =>
          beneficio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          beneficio.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply tipo filter
    if (tipoFilter !== "todos") {
      results = results.filter(beneficio => beneficio.tipo === tipoFilter);
    }
    
    // Apply status filter
    if (statusFilter !== "todos") {
      results = results.filter(beneficio => beneficio.status === statusFilter);
    }
    
    setBeneficios(results);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Ativo</Badge>;
      case "suspenso":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Suspenso</Badge>;
      case "encerrado":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Encerrado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "financeiro":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Financeiro</Badge>;
      case "material":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Material</Badge>;
      case "servico":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Serviço</Badge>;
      default:
        return <Badge variant="outline">Outro</Badge>;
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Benefícios</h1>
          <div className="flex items-center gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Benefício
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Benefício</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para cadastrar um novo benefício social.
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

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros de Busca</CardTitle>
            <div className="flex flex-col lg:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por nome ou descrição..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select defaultValue="todos" onValueChange={(value) => setTipoFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de benefício" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="servico">Serviço</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="todos" onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status do benefício" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                  <SelectItem value="encerrado">Encerrado</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="tabela" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tabela">Visualização em Tabela</TabsTrigger>
            <TabsTrigger value="cards">Visualização em Cards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tabela" className="pt-4">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle>Lista de Benefícios</CardTitle>
                <CardDescription>
                  Gerenciamento dos benefícios sociais disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Famílias</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {beneficios.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Nenhum benefício encontrado com os critérios de busca.
                          </TableCell>
                        </TableRow>
                      ) : (
                        beneficios.map((beneficio) => (
                          <TableRow key={beneficio.id}>
                            <TableCell>
                              <div className="font-medium">{beneficio.nome}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {beneficio.descricao}
                              </div>
                            </TableCell>
                            <TableCell>{getTipoBadge(beneficio.tipo)}</TableCell>
                            <TableCell>
                              {beneficio.tipo === "financeiro" ? (
                                <>
                                  {formatCurrency(beneficio.valor)}
                                  {beneficio.periodicidade && (
                                    <div className="text-xs text-gray-500">
                                      {beneficio.periodicidade}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm text-gray-500">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>{beneficio.familiasBeneficiadas}</TableCell>
                            <TableCell>{formatDate(beneficio.dataInicio)}</TableCell>
                            <TableCell>{getStatusBadge(beneficio.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="mr-2" onClick={() => setBeneficioSelecionado(beneficio)}>
                                Ver
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {
                                toast({
                                  title: "Edição de benefício",
                                  description: `Edição do benefício ${beneficio.nome} iniciada`
                                });
                              }}>
                                Editar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  Exibindo {beneficios.length} de {mockBeneficios.length} benefícios
                </div>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="cards" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beneficios.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  Nenhum benefício encontrado com os critérios de busca.
                </div>
              ) : (
                beneficios.map((beneficio) => (
                  <Card key={beneficio.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{beneficio.nome}</CardTitle>
                        {getStatusBadge(beneficio.status)}
                      </div>
                      <CardDescription>{beneficio.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Wallet className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">Tipo:</span>
                        </div>
                        {getTipoBadge(beneficio.tipo)}
                      </div>
                      
                      {beneficio.valor && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">Valor:</span>
                          </div>
                          <div className="text-sm font-medium">
                            {formatCurrency(beneficio.valor)}
                            {beneficio.periodicidade && ` (${beneficio.periodicidade})`}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">Famílias atendidas:</span>
                        </div>
                        <div className="text-sm font-medium">{beneficio.familiasBeneficiadas}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">Data de início:</span>
                        </div>
                        <div className="text-sm">{formatDate(beneficio.dataInicio)}</div>
                      </div>
                      
                      {beneficio.dataFim && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">Data de término:</span>
                          </div>
                          <div className="text-sm">{formatDate(beneficio.dataFim)}</div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => setBeneficioSelecionado(beneficio)}>
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({
                          title: "Edição de benefício",
                          description: `Edição do benefício ${beneficio.nome} iniciada`
                        });
                      }}>
                        Editar
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {beneficioSelecionado && (
          <Dialog open={!!beneficioSelecionado} onOpenChange={() => setBeneficioSelecionado(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{beneficioSelecionado.nome}</DialogTitle>
                  <div className="flex items-center gap-2">
                    {getTipoBadge(beneficioSelecionado.tipo)}
                    {getStatusBadge(beneficioSelecionado.status)}
                  </div>
                </div>
                <DialogDescription>
                  {beneficioSelecionado.descricao}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">INFORMAÇÕES GERAIS</h3>
                    
                    {beneficioSelecionado.valor && (
                      <div>
                        <div className="text-sm font-medium">Valor</div>
                        <div className="text-sm">{formatCurrency(beneficioSelecionado.valor)}</div>
                      </div>
                    )}
                    
                    {beneficioSelecionado.periodicidade && (
                      <div>
                        <div className="text-sm font-medium">Periodicidade</div>
                        <div className="text-sm">{beneficioSelecionado.periodicidade}</div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm font-medium">Famílias Beneficiadas</div>
                      <div className="text-sm">{beneficioSelecionado.familiasBeneficiadas}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">PERÍODO DE VIGÊNCIA</h3>
                    
                    <div>
                      <div className="text-sm font-medium">Data de Início</div>
                      <div className="text-sm">{formatDate(beneficioSelecionado.dataInicio)}</div>
                    </div>
                    
                    {beneficioSelecionado.dataFim ? (
                      <div>
                        <div className="text-sm font-medium">Data de Término</div>
                        <div className="text-sm">{formatDate(beneficioSelecionado.dataFim)}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium">Data de Término</div>
                        <div className="text-sm">Não definida</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">CONDICIONALIDADES</h3>
                  <div className="space-y-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    {beneficioSelecionado.condicionalidades && 
                      beneficioSelecionado.condicionalidades.map((condicionalidade, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          {condicionalidade}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setBeneficioSelecionado(null)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Edição de benefício",
                    description: `Edição do benefício ${beneficioSelecionado.nome} iniciada`
                  });
                  setBeneficioSelecionado(null);
                }}>
                  Editar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-blue-500" />
                Benefícios por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Financeiro</span>
                  </div>
                  <span className="font-medium">{mockBeneficios.filter(b => b.tipo === 'financeiro').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Material</span>
                  </div>
                  <span className="font-medium">{mockBeneficios.filter(b => b.tipo === 'material').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Serviço</span>
                  </div>
                  <span className="font-medium">{mockBeneficios.filter(b => b.tipo === 'servico').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Por Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Ativos</span>
                  </div>
                  <span className="font-medium">{mockBeneficios.filter(b => b.status === 'ativo').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Suspensos</span>
                  </div>
                  <span className="font-medium">{mockBeneficios.filter(b => b.status === 'suspenso').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Encerrados</span>
                  </div>
                  <span className="font-medium">{mockBeneficios.filter(b => b.status === 'encerrado').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-indigo-500" />
                Famílias Atendidas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold">
                {mockBeneficios.reduce((sum, b) => sum + b.familiasBeneficiadas, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total de famílias atendidas
              </div>
              
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Benefícios Financeiros</span>
                  <span className="font-medium">
                    {mockBeneficios
                      .filter(b => b.tipo === 'financeiro')
                      .reduce((sum, b) => sum + b.familiasBeneficiadas, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Benefícios Materiais</span>
                  <span className="font-medium">
                    {mockBeneficios
                      .filter(b => b.tipo === 'material')
                      .reduce((sum, b) => sum + b.familiasBeneficiadas, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Benefícios de Serviço</span>
                  <span className="font-medium">
                    {mockBeneficios
                      .filter(b => b.tipo === 'servico')
                      .reduce((sum, b) => sum + b.familiasBeneficiadas, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    
  );
}
