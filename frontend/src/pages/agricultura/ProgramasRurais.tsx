
import { useState } from "react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Search,
  Filter,
  MoreVertical,
  PlusCircle,
  Download,
  Printer,
  ClipboardEdit,
  Trash2,
  Calendar,
  User,
  Users,
  Eye,
  Target
} from "lucide-react";

interface ProgramaRural {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  dataInicio: string;
  dataFim?: string;
  coordenador: string;
  participantesInscritos: number;
  participantesAtivos: number;
  orcamento?: number;
  status: "planejamento" | "inscricoes_abertas" | "em_execucao" | "concluido" | "suspenso";
  publicoAlvo: string;
}

// Mock data
const mockProgramas: ProgramaRural[] = [
  {
    id: "1",
    nome: "Programa de Agricultura Familiar Sustentável",
    categoria: "Sustentabilidade",
    descricao: "Capacitação em técnicas sustentáveis para pequenos produtores",
    dataInicio: "2025-02-01",
    dataFim: "2025-12-31",
    coordenador: "Eng. Ana Costa",
    participantesInscritos: 45,
    participantesAtivos: 42,
    orcamento: 150000.00,
    status: "inscricoes_abertas",
    publicoAlvo: "Pequenos produtores rurais"
  },
  {
    id: "2",
    nome: "Modernização da Pecuária Leiteira",
    categoria: "Pecuária",
    descricao: "Implementação de tecnologias modernas na produção de leite",
    dataInicio: "2025-03-15",
    coordenador: "Dr. Carlos Santos",
    participantesInscritos: 25,
    participantesAtivos: 20,
    orcamento: 80000.00,
    status: "planejamento",
    publicoAlvo: "Pecuaristas de leite"
  }
];

const ProgramasRurais = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [programas, setProgramas] = useState<ProgramaRural[]>(mockProgramas);
  const [selectedPrograma, setSelectedPrograma] = useState<ProgramaRural | null>(null);

  const filteredProgramas = programas.filter((programa) => {
    const matchesSearch =
      programa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.coordenador.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "todos" || programa.status === filter;

    return matchesSearch && matchesFilter;
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    planejamento: { label: "Planejamento", color: "bg-blue-100 text-blue-800" },
    inscricoes_abertas: { label: "Inscrições Abertas", color: "bg-green-100 text-green-800" },
    em_execucao: { label: "Em Execução", color: "bg-yellow-100 text-yellow-800" },
    concluido: { label: "Concluído", color: "bg-gray-100 text-gray-800" },
    suspenso: { label: "Suspenso", color: "bg-red-100 text-red-800" }
  };

  const handleViewPrograma = (programa: ProgramaRural) => {
    setSelectedPrograma({...programa});
    setViewMode(true);
    setOpenDialog(true);
  };

  const handleEditPrograma = (programa: ProgramaRural) => {
    setSelectedPrograma({...programa});
    setViewMode(false);
    setOpenDialog(true);
  };

  const handleSavePrograma = () => {
    if (!selectedPrograma) return;

    if (selectedPrograma.id) {
      setProgramas(programas.map((p) => p.id === selectedPrograma.id ? selectedPrograma : p));
    } else {
      const newId = (Math.max(...programas.map(p => Number(p.id))) + 1).toString();
      const newPrograma = { ...selectedPrograma, id: newId };
      setProgramas([...programas, newPrograma]);
    }

    setOpenDialog(false);
    setSelectedPrograma(null);
  };

  const handleDeletePrograma = (id: string) => {
    setProgramas(programas.filter((programa) => programa.id !== id));
  };

  const handleNewPrograma = () => {
    setSelectedPrograma({
      id: "",
      nome: "",
      categoria: "",
      descricao: "",
      dataInicio: "",
      coordenador: "",
      participantesInscritos: 0,
      participantesAtivos: 0,
      status: "planejamento",
      publicoAlvo: ""
    });
    setViewMode(false);
    setOpenDialog(true);
  };

  return (
    
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-8 w-8 text-purple-600" />
              Programas Rurais
            </h1>
            <p className="text-muted-foreground">
              Gerencie os programas de desenvolvimento rural
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewPrograma}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Programa
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Programas Cadastrados</CardTitle>
            <CardDescription>
              Total de {filteredProgramas.length} programas encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, categoria ou coordenador..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filtrar por status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="planejamento">Planejamento</SelectItem>
                    <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                    <SelectItem value="em_execucao">Em Execução</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Programa / Categoria</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Coordenador</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Orçamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProgramas.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center h-32 text-muted-foreground"
                      >
                        Nenhum programa encontrado com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProgramas.map((programa) => (
                      <TableRow key={programa.id} className="group">
                        <TableCell>
                          <div className="font-medium">{programa.nome}</div>
                          <div className="text-xs text-muted-foreground">{programa.categoria}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(programa.dataInicio), "dd/MM/yyyy")}
                          </div>
                          {programa.dataFim && (
                            <div className="text-xs text-muted-foreground">
                              até {format(new Date(programa.dataFim), "dd/MM/yyyy")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {programa.coordenador}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {programa.participantesAtivos} / {programa.participantesInscritos}
                          </div>
                          <div className="text-xs text-muted-foreground">ativos / inscritos</div>
                        </TableCell>
                        <TableCell>
                          {programa.orcamento ? (
                            <div className="font-medium">
                              R$ {programa.orcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Não informado</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              statusMap[programa.status]?.color
                            )}
                          >
                            {statusMap[programa.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 group-hover:opacity-100 data-[state=open]:opacity-100 opacity-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewPrograma(programa)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditPrograma(programa)}
                                className="cursor-pointer"
                              >
                                <ClipboardEdit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePrograma(programa.id)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </DropdownMenuItem>
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
          <CardFooter className="flex justify-between">
            <div className="text-xs text-muted-foreground">
              Mostrando {filteredProgramas.length} de {programas.length} programas
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" /> Imprimir
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Dialog for create/edit/view */}
        {selectedPrograma && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {viewMode 
                    ? "Detalhes do Programa Rural" 
                    : selectedPrograma.id 
                      ? "Editar Programa Rural" 
                      : "Novo Programa Rural"}
                </DialogTitle>
                <DialogDescription>
                  {viewMode
                    ? "Visualize as informações do programa rural"
                    : "Preencha os dados do programa rural"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome">Nome do Programa</Label>
                  <Input
                    id="nome"
                    value={selectedPrograma.nome}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedPrograma({
                        ...selectedPrograma,
                        nome: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={selectedPrograma.categoria}
                    onValueChange={(value) =>
                      !viewMode &&
                      setSelectedPrograma({
                        ...selectedPrograma,
                        categoria: value,
                      })
                    }
                    disabled={viewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sustentabilidade">Sustentabilidade</SelectItem>
                      <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="Capacitação">Capacitação</SelectItem>
                      <SelectItem value="Crédito">Crédito</SelectItem>
                      <SelectItem value="Pecuária">Pecuária</SelectItem>
                      <SelectItem value="Agricultura Familiar">Agricultura Familiar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordenador">Coordenador</Label>
                  <Input
                    id="coordenador"
                    value={selectedPrograma.coordenador}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedPrograma({
                        ...selectedPrograma,
                        coordenador: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={selectedPrograma.dataInicio}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedPrograma({
                        ...selectedPrograma,
                        dataInicio: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data de Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={selectedPrograma.dataFim || ""}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedPrograma({
                        ...selectedPrograma,
                        dataFim: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participantesInscritos">Participantes Inscritos</Label>
                  <Input
                    id="participantesInscritos"
                    type="number"
                    value={selectedPrograma.participantesInscritos}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedPrograma({
                        ...selectedPrograma,
                        participantesInscritos: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participantesAtivos">Participantes Ativos</Label>
                  <Input
                    id="participantesAtivos"
                    type="number"
                    value={selectedPrograma.participantesAtivos}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedPrograma({
                        ...selectedPrograma,
                        participantesAtivos: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orcamento">Orçamento (R$)</Label>
                  <Input
                    id="orcamento"
                    type="number"
                    step="0.01"
                    value={selectedPrograma.orcamento || ""}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedPrograma({
                        ...selectedPrograma,
                        orcamento: parseFloat(e.target.value) || undefined,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedPrograma.status}
                    onValueChange={(value: 'planejamento' | 'inscricoes_abertas' | 'em_execucao' | 'concluido' | 'suspenso') =>
                      !viewMode &&
                      setSelectedPrograma({
                        ...selectedPrograma,
                        status: value,
                      })
                    }
                    disabled={viewMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejamento">Planejamento</SelectItem>
                      <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                      <SelectItem value="em_execucao">Em Execução</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="publicoAlvo">Público Alvo</Label>
                  <Input
                    id="publicoAlvo"
                    value={selectedPrograma.publicoAlvo}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedPrograma({
                        ...selectedPrograma,
                        publicoAlvo: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={selectedPrograma.descricao}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedPrograma({
                        ...selectedPrograma,
                        descricao: e.target.value,
                      })
                    }
                    disabled={viewMode}
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                {!viewMode ? (
                  <>
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSavePrograma}>Salvar</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>
                      Fechar
                    </Button>
                    <Button
                      onClick={() => {
                        setViewMode(false);
                      }}
                    >
                      <ClipboardEdit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    
  );
};

export default ProgramasRurais;
