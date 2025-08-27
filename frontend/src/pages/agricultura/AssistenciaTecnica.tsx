
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
  MapPin,
  Eye,
  Wrench
} from "lucide-react";

interface AssistenciaTecnica {
  id: string;
  produtorNome: string;
  propriedade: string;
  tipoAssistencia: string;
  categoria: string;
  dataInicio: string;
  dataFim?: string;
  tecnicoResponsavel: string;
  descricaoAtividade: string;
  status: "planejada" | "em_execucao" | "concluida" | "suspensa" | "cancelada";
  custoEstimado?: number;
  avaliacaoProdutor?: number;
}

// Mock data
const mockAssistencias: AssistenciaTecnica[] = [
  {
    id: "1",
    produtorNome: "João Silva",
    propriedade: "Fazenda Esperança",
    tipoAssistencia: "Manejo de Pragas",
    categoria: "Fitossanidade",
    dataInicio: "2025-01-20",
    dataFim: "2025-02-10",
    tecnicoResponsavel: "Dr. Carlos Santos",
    descricaoAtividade: "Implementação de controle integrado de pragas na cultura do milho",
    status: "em_execucao",
    custoEstimado: 2500.00,
    avaliacaoProdutor: 5
  },
  {
    id: "2",
    produtorNome: "Maria Oliveira",
    propriedade: "Sítio Bela Vista",
    tipoAssistencia: "Irrigação",
    categoria: "Manejo de Água",
    dataInicio: "2025-01-25",
    tecnicoResponsavel: "Eng. Ana Costa",
    descricaoAtividade: "Planejamento e instalação de sistema de irrigação por gotejamento",
    status: "planejada",
    custoEstimado: 5000.00
  }
];

const AssistenciaTecnica = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [assistencias, setAssistencias] = useState<AssistenciaTecnica[]>(mockAssistencias);
  const [selectedAssistencia, setSelectedAssistencia] = useState<AssistenciaTecnica | null>(null);

  const filteredAssistencias = assistencias.filter((assistencia) => {
    const matchesSearch =
      assistencia.produtorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistencia.tipoAssistencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistencia.propriedade.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "todos" || assistencia.status === filter;

    return matchesSearch && matchesFilter;
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    planejada: { label: "Planejada", color: "bg-blue-100 text-blue-800" },
    em_execucao: { label: "Em Execução", color: "bg-yellow-100 text-yellow-800" },
    concluida: { label: "Concluída", color: "bg-green-100 text-green-800" },
    suspensa: { label: "Suspensa", color: "bg-orange-100 text-orange-800" },
    cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" }
  };

  const handleViewAssistencia = (assistencia: AssistenciaTecnica) => {
    setSelectedAssistencia({...assistencia});
    setViewMode(true);
    setOpenDialog(true);
  };

  const handleEditAssistencia = (assistencia: AssistenciaTecnica) => {
    setSelectedAssistencia({...assistencia});
    setViewMode(false);
    setOpenDialog(true);
  };

  const handleSaveAssistencia = () => {
    if (!selectedAssistencia) return;

    if (selectedAssistencia.id) {
      setAssistencias(assistencias.map((a) => a.id === selectedAssistencia.id ? selectedAssistencia : a));
    } else {
      const newId = (Math.max(...assistencias.map(a => Number(a.id))) + 1).toString();
      const newAssistencia = { ...selectedAssistencia, id: newId };
      setAssistencias([...assistencias, newAssistencia]);
    }

    setOpenDialog(false);
    setSelectedAssistencia(null);
  };

  const handleDeleteAssistencia = (id: string) => {
    setAssistencias(assistencias.filter((assistencia) => assistencia.id !== id));
  };

  const handleNewAssistencia = () => {
    setSelectedAssistencia({
      id: "",
      produtorNome: "",
      propriedade: "",
      tipoAssistencia: "",
      categoria: "",
      dataInicio: "",
      tecnicoResponsavel: "",
      descricaoAtividade: "",
      status: "planejada"
    });
    setViewMode(false);
    setOpenDialog(true);
  };

  return (
    
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              Assistência Técnica
            </h1>
            <p className="text-muted-foreground">
              Gerencie as atividades de assistência técnica aos produtores
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewAssistencia}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Assistência
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Assistências Registradas</CardTitle>
            <CardDescription>
              Total de {filteredAssistencias.length} assistências encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por produtor, tipo ou propriedade..."
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
                    <SelectItem value="planejada">Planejada</SelectItem>
                    <SelectItem value="em_execucao">Em Execução</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="suspensa">Suspensa</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produtor / Propriedade</TableHead>
                    <TableHead>Tipo / Categoria</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssistencias.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center h-32 text-muted-foreground"
                      >
                        Nenhuma assistência encontrada com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssistencias.map((assistencia) => (
                      <TableRow key={assistencia.id} className="group">
                        <TableCell>
                          <div className="font-medium">{assistencia.produtorNome}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {assistencia.propriedade}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{assistencia.tipoAssistencia}</div>
                          <div className="text-xs text-muted-foreground">{assistencia.categoria}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(assistencia.dataInicio), "dd/MM/yyyy")}
                          </div>
                          {assistencia.dataFim && (
                            <div className="text-xs text-muted-foreground">
                              até {format(new Date(assistencia.dataFim), "dd/MM/yyyy")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {assistencia.tecnicoResponsavel}
                          </div>
                        </TableCell>
                        <TableCell>
                          {assistencia.custoEstimado ? (
                            <div className="font-medium">
                              R$ {assistencia.custoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Não informado</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              statusMap[assistencia.status]?.color
                            )}
                          >
                            {statusMap[assistencia.status]?.label}
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
                                onClick={() => handleViewAssistencia(assistencia)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditAssistencia(assistencia)}
                                className="cursor-pointer"
                              >
                                <ClipboardEdit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteAssistencia(assistencia.id)}
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
              Mostrando {filteredAssistencias.length} de {assistencias.length} assistências
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
        {selectedAssistencia && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {viewMode 
                    ? "Detalhes da Assistência Técnica" 
                    : selectedAssistencia.id 
                      ? "Editar Assistência Técnica" 
                      : "Nova Assistência Técnica"}
                </DialogTitle>
                <DialogDescription>
                  {viewMode
                    ? "Visualize as informações da assistência técnica"
                    : "Preencha os dados da assistência técnica"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="produtorNome">Nome do Produtor</Label>
                  <Input
                    id="produtorNome"
                    value={selectedAssistencia.produtorNome}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedAssistencia({
                        ...selectedAssistencia,
                        produtorNome: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propriedade">Propriedade</Label>
                  <Input
                    id="propriedade"
                    value={selectedAssistencia.propriedade}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedAssistencia({
                        ...selectedAssistencia,
                        propriedade: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoAssistencia">Tipo de Assistência</Label>
                  <Input
                    id="tipoAssistencia"
                    value={selectedAssistencia.tipoAssistencia}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedAssistencia({
                        ...selectedAssistencia,
                        tipoAssistencia: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={selectedAssistencia.categoria}
                    onValueChange={(value) =>
                      !viewMode &&
                      setSelectedAssistencia({
                        ...selectedAssistencia,
                        categoria: value,
                      })
                    }
                    disabled={viewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fitossanidade">Fitossanidade</SelectItem>
                      <SelectItem value="Manejo de Solo">Manejo de Solo</SelectItem>
                      <SelectItem value="Manejo de Água">Manejo de Água</SelectItem>
                      <SelectItem value="Melhoramento Genético">Melhoramento Genético</SelectItem>
                      <SelectItem value="Mecanização">Mecanização</SelectItem>
                      <SelectItem value="Pós-Colheita">Pós-Colheita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={selectedAssistencia.dataInicio}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedAssistencia({
                        ...selectedAssistencia,
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
                    value={selectedAssistencia.dataFim || ""}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedAssistencia({
                        ...selectedAssistencia,
                        dataFim: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tecnicoResponsavel">Técnico Responsável</Label>
                  <Input
                    id="tecnicoResponsavel"
                    value={selectedAssistencia.tecnicoResponsavel}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedAssistencia({
                        ...selectedAssistencia,
                        tecnicoResponsavel: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custoEstimado">Custo Estimado (R$)</Label>
                  <Input
                    id="custoEstimado"
                    type="number"
                    step="0.01"
                    value={selectedAssistencia.custoEstimado || ""}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedAssistencia({
                        ...selectedAssistencia,
                        custoEstimado: parseFloat(e.target.value) || undefined,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedAssistencia.status}
                    onValueChange={(value: 'planejada' | 'em_execucao' | 'concluida' | 'suspensa' | 'cancelada') =>
                      !viewMode &&
                      setSelectedAssistencia({
                        ...selectedAssistencia,
                        status: value,
                      })
                    }
                    disabled={viewMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejada">Planejada</SelectItem>
                      <SelectItem value="em_execucao">Em Execução</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="suspensa">Suspensa</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricaoAtividade">Descrição da Atividade</Label>
                  <Textarea
                    id="descricaoAtividade"
                    value={selectedAssistencia.descricaoAtividade}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedAssistencia({
                        ...selectedAssistencia,
                        descricaoAtividade: e.target.value,
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
                    <Button onClick={handleSaveAssistencia}>Salvar</Button>
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

export default AssistenciaTecnica;
