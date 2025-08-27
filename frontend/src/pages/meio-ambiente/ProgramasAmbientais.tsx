
import { useState } from "react";
// Layout removido - já está no App.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Eye, Calendar, TreePine } from "lucide-react";
import { ProgramaAmbiental } from "@/types/meio-ambiente";

const mockProgramas: ProgramaAmbiental[] = [
  {
    id: "1",
    nome: "Plantio de Árvores Nativas",
    tipo: "conservacao",
    descricao: "Programa de plantio de espécies nativas para recuperação de áreas degradadas",
    objetivos: [
      "Recuperar 50 hectares de área degradada",
      "Plantar 10.000 mudas nativas",
      "Envolver 500 voluntários"
    ],
    publicoAlvo: "Estudantes, voluntários e comunidade em geral",
    status: "em_andamento",
    dataInicio: "2024-01-15",
    dataFim: "2024-12-15",
    responsavel: "João Silva - Secretaria do Meio Ambiente",
    parceiros: ["Escola Municipal Verde", "ONG Plantadores", "Viveiro Municipal"],
    orcamento: 75000,
    indicadores: [
      {
        nome: "Mudas Plantadas",
        meta: 10000,
        realizado: 3500,
        unidade: "unidades"
      },
      {
        nome: "Área Recuperada",
        meta: 50,
        realizado: 18,
        unidade: "hectares"
      }
    ],
    atividades: [
      {
        id: "1",
        nome: "Preparação do Solo",
        descricao: "Preparação das áreas para plantio",
        dataInicio: "2024-01-15",
        dataFim: "2024-02-15",
        status: "concluida"
      },
      {
        id: "2",
        nome: "Plantio Primavera",
        descricao: "Plantio das mudas na época da primavera",
        dataInicio: "2024-03-01",
        dataFim: "2024-05-30",
        status: "em_andamento"
      }
    ]
  },
  {
    id: "2",
    nome: "Educação Ambiental nas Escolas",
    tipo: "educacao",
    descricao: "Programa de conscientização ambiental para estudantes do ensino fundamental",
    objetivos: [
      "Atingir 2000 estudantes",
      "Capacitar 50 professores",
      "Criar 10 hortas escolares"
    ],
    publicoAlvo: "Estudantes do ensino fundamental e professores",
    status: "em_andamento",
    dataInicio: "2024-02-01",
    dataFim: "2024-11-30",
    responsavel: "Maria Santos - Secretaria de Educação",
    parceiros: ["Secretaria do Meio Ambiente", "Universidade Verde"],
    orcamento: 45000,
    indicadores: [
      {
        nome: "Estudantes Atendidos",
        meta: 2000,
        realizado: 850,
        unidade: "estudantes"
      },
      {
        nome: "Professores Capacitados",
        meta: 50,
        realizado: 28,
        unidade: "professores"
      }
    ],
    atividades: [
      {
        id: "1",
        nome: "Capacitação de Professores",
        descricao: "Treinamento dos professores em educação ambiental",
        dataInicio: "2024-02-01",
        dataFim: "2024-03-15",
        status: "concluida"
      },
      {
        id: "2",
        nome: "Palestras nas Escolas",
        descricao: "Palestras educativas para os estudantes",
        dataInicio: "2024-03-15",
        dataFim: "2024-11-30",
        status: "em_andamento"
      }
    ]
  }
];

const statusColors = {
  planejamento: "bg-gray-100 text-gray-800",
  em_andamento: "bg-blue-100 text-blue-800",
  concluido: "bg-green-100 text-green-800",
  suspenso: "bg-red-100 text-red-800"
};

export default function ProgramasAmbientais() {
  const [programas] = useState<ProgramaAmbiental[]>(mockProgramas);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProgramas = programas.filter((programa) => {
    const matchesSearch = 
      programa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || programa.status === statusFilter;
    const matchesTipo = tipoFilter === "all" || programa.tipo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  return (
    <div>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Programas Ambientais</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Programa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Novo Programa Ambiental</DialogTitle>
                <DialogDescription>
                  Crie um novo programa de educação ou conservação ambiental
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Programa</Label>
                    <Input id="nome" placeholder="Nome do programa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="educacao">Educação Ambiental</SelectItem>
                        <SelectItem value="conservacao">Conservação</SelectItem>
                        <SelectItem value="recuperacao">Recuperação</SelectItem>
                        <SelectItem value="monitoramento">Monitoramento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea 
                    id="descricao" 
                    placeholder="Descrição do programa"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <Input id="dataInicio" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de Fim</Label>
                    <Input id="dataFim" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input id="responsavel" placeholder="Nome do responsável" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orcamento">Orçamento (R$)</Label>
                    <Input id="orcamento" type="number" placeholder="0,00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publicoAlvo">Público Alvo</Label>
                  <Input id="publicoAlvo" placeholder="Descrição do público alvo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="objetivos">Objetivos</Label>
                  <Textarea 
                    id="objetivos" 
                    placeholder="Liste os objetivos do programa (um por linha)"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Criar Programa
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Programas</CardTitle>
              <TreePine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">
                +3 novos programas este ano
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                66% dos programas ativos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 450K</div>
              <p className="text-xs text-muted-foreground">
                Investimento em 2024
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beneficiários</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5.2K</div>
              <p className="text-xs text-muted-foreground">
                Pessoas atendidas
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Programas</CardTitle>
            <CardDescription>
              Gerencie todos os programas ambientais do município
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="planejamento">Planejamento</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="educacao">Educação</SelectItem>
                  <SelectItem value="conservacao">Conservação</SelectItem>
                  <SelectItem value="recuperacao">Recuperação</SelectItem>
                  <SelectItem value="monitoramento">Monitoramento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Orçamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProgramas.map((programa) => (
                    <TableRow key={programa.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{programa.nome}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {programa.descricao}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {programa.tipo === "educacao" ? "Educação" :
                           programa.tipo === "conservacao" ? "Conservação" :
                           programa.tipo === "recuperacao" ? "Recuperação" : "Monitoramento"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {programa.indicadores.length > 0 && (
                          <div className="space-y-1">
                            {programa.indicadores.slice(0, 1).map((indicador, index) => {
                              const progresso = (indicador.realizado / indicador.meta) * 100;
                              return (
                                <div key={index}>
                                  <div className="flex justify-between text-xs">
                                    <span>{indicador.nome}</span>
                                    <span>{Math.round(progresso)}%</span>
                                  </div>
                                  <Progress value={progresso} className="h-2" />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[programa.status]}>
                          {programa.status === "planejamento" ? "Planejamento" :
                           programa.status === "em_andamento" ? "Em Andamento" :
                           programa.status === "concluido" ? "Concluído" : "Suspenso"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(programa.dataInicio).toLocaleDateString('pt-BR')}</div>
                          <div className="text-muted-foreground">
                            até {programa.dataFim ? new Date(programa.dataFim).toLocaleDateString('pt-BR') : '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        R$ {programa.orcamento.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4" />
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
      </div>
    </div>
  );
}
