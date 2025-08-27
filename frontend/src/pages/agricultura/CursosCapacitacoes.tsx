
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
import { Checkbox } from "@/components/ui/checkbox";
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
  GraduationCap,
  Clock
} from "lucide-react";

interface CursoCapacitacao {
  id: string;
  nome: string;
  categoria: string;
  modalidade: "presencial" | "online" | "hibrido";
  instrutor: string;
  dataInicio: string;
  dataFim: string;
  cargaHoraria: number;
  vagas: number;
  vagasOcupadas: number;
  valor?: number;
  gratuito: boolean;
  status: "planejado" | "inscricoes_abertas" | "em_andamento" | "finalizado" | "cancelado";
  certificacao: boolean;
}

// Mock data
const mockCursos: CursoCapacitacao[] = [
  {
    id: "1",
    nome: "Agricultura Orgânica e Sustentável",
    categoria: "Sustentabilidade",
    modalidade: "presencial",
    instrutor: "Eng. Ana Costa",
    dataInicio: "2025-02-15",
    dataFim: "2025-02-19",
    cargaHoraria: 40,
    vagas: 30,
    vagasOcupadas: 28,
    gratuito: true,
    status: "inscricoes_abertas",
    certificacao: true
  },
  {
    id: "2",
    nome: "Tecnologias em Irrigação",
    categoria: "Tecnologia",
    modalidade: "hibrido",
    instrutor: "Dr. Carlos Santos",
    dataInicio: "2025-03-10",
    dataFim: "2025-03-12",
    cargaHoraria: 24,
    vagas: 25,
    vagasOcupadas: 15,
    valor: 350.00,
    gratuito: false,
    status: "planejado",
    certificacao: true
  }
];

const CursosCapacitacoes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [cursos, setCursos] = useState<CursoCapacitacao[]>(mockCursos);
  const [selectedCurso, setSelectedCurso] = useState<CursoCapacitacao | null>(null);

  const filteredCursos = cursos.filter((curso) => {
    const matchesSearch =
      curso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.instrutor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "todos" || curso.status === filter;

    return matchesSearch && matchesFilter;
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    planejado: { label: "Planejado", color: "bg-blue-100 text-blue-800" },
    inscricoes_abertas: { label: "Inscrições Abertas", color: "bg-green-100 text-green-800" },
    em_andamento: { label: "Em Andamento", color: "bg-yellow-100 text-yellow-800" },
    finalizado: { label: "Finalizado", color: "bg-gray-100 text-gray-800" },
    cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" }
  };

  const modalidadeMap: Record<string, { label: string; color: string }> = {
    presencial: { label: "Presencial", color: "bg-blue-100 text-blue-800" },
    online: { label: "Online", color: "bg-purple-100 text-purple-800" },
    hibrido: { label: "Híbrido", color: "bg-orange-100 text-orange-800" }
  };

  const handleViewCurso = (curso: CursoCapacitacao) => {
    setSelectedCurso({...curso});
    setViewMode(true);
    setOpenDialog(true);
  };

  const handleEditCurso = (curso: CursoCapacitacao) => {
    setSelectedCurso({...curso});
    setViewMode(false);
    setOpenDialog(true);
  };

  const handleSaveCurso = () => {
    if (!selectedCurso) return;

    if (selectedCurso.id) {
      setCursos(cursos.map((c) => c.id === selectedCurso.id ? selectedCurso : c));
    } else {
      const newId = (Math.max(...cursos.map(c => Number(c.id))) + 1).toString();
      const newCurso = { ...selectedCurso, id: newId };
      setCursos([...cursos, newCurso]);
    }

    setOpenDialog(false);
    setSelectedCurso(null);
  };

  const handleDeleteCurso = (id: string) => {
    setCursos(cursos.filter((curso) => curso.id !== id));
  };

  const handleNewCurso = () => {
    setSelectedCurso({
      id: "",
      nome: "",
      categoria: "",
      modalidade: "presencial",
      instrutor: "",
      dataInicio: "",
      dataFim: "",
      cargaHoraria: 0,
      vagas: 0,
      vagasOcupadas: 0,
      gratuito: true,
      status: "planejado",
      certificacao: false
    });
    setViewMode(false);
    setOpenDialog(true);
  };

  return (
    
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              Cursos e Capacitações
            </h1>
            <p className="text-muted-foreground">
              Gerencie os cursos de capacitação para produtores rurais
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewCurso}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Curso
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Cursos Cadastrados</CardTitle>
            <CardDescription>
              Total de {filteredCursos.length} cursos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, categoria ou instrutor..."
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
                    <SelectItem value="planejado">Planejado</SelectItem>
                    <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso / Categoria</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Instrutor</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Vagas</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCursos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center h-32 text-muted-foreground"
                      >
                        Nenhum curso encontrado com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCursos.map((curso) => (
                      <TableRow key={curso.id} className="group">
                        <TableCell>
                          <div className="font-medium">{curso.nome}</div>
                          <div className="text-xs text-muted-foreground">{curso.categoria}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(curso.dataInicio), "dd/MM/yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            até {format(new Date(curso.dataFim), "dd/MM/yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {curso.cargaHoraria}h
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {curso.instrutor}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              modalidadeMap[curso.modalidade]?.color
                            )}
                          >
                            {modalidadeMap[curso.modalidade]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {curso.vagasOcupadas} / {curso.vagas}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((curso.vagasOcupadas / curso.vagas) * 100)}% ocupação
                          </div>
                        </TableCell>
                        <TableCell>
                          {curso.gratuito ? (
                            <Badge variant="outline" className="text-green-600">Gratuito</Badge>
                          ) : (
                            <div className="font-medium">
                              R$ {curso.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              statusMap[curso.status]?.color
                            )}
                          >
                            {statusMap[curso.status]?.label}
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
                                onClick={() => handleViewCurso(curso)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditCurso(curso)}
                                className="cursor-pointer"
                              >
                                <ClipboardEdit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCurso(curso.id)}
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
              Mostrando {filteredCursos.length} de {cursos.length} cursos
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
        {selectedCurso && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {viewMode 
                    ? "Detalhes do Curso" 
                    : selectedCurso.id 
                      ? "Editar Curso" 
                      : "Novo Curso"}
                </DialogTitle>
                <DialogDescription>
                  {viewMode
                    ? "Visualize as informações do curso"
                    : "Preencha os dados do curso de capacitação"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome">Nome do Curso</Label>
                  <Input
                    id="nome"
                    value={selectedCurso.nome}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedCurso({
                        ...selectedCurso,
                        nome: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={selectedCurso.categoria}
                    onValueChange={(value) =>
                      !viewMode &&
                      setSelectedCurso({
                        ...selectedCurso,
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
                      <SelectItem value="Gestão">Gestão</SelectItem>
                      <SelectItem value="Produção">Produção</SelectItem>
                      <SelectItem value="Qualidade">Qualidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modalidade">Modalidade</Label>
                  <Select
                    value={selectedCurso.modalidade}
                    onValueChange={(value: 'presencial' | 'online' | 'hibrido') =>
                      !viewMode &&
                      setSelectedCurso({
                        ...selectedCurso,
                        modalidade: value,
                      })
                    }
                    disabled={viewMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instrutor">Instrutor</Label>
                  <Input
                    id="instrutor"
                    value={selectedCurso.instrutor}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedCurso({
                        ...selectedCurso,
                        instrutor: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargaHoraria">Carga Horária (horas)</Label>
                  <Input
                    id="cargaHoraria"
                    type="number"
                    value={selectedCurso.cargaHoraria}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedCurso({
                        ...selectedCurso,
                        cargaHoraria: parseInt(e.target.value) || 0,
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
                    value={selectedCurso.dataInicio}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedCurso({
                        ...selectedCurso,
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
                    value={selectedCurso.dataFim}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedCurso({
                        ...selectedCurso,
                        dataFim: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vagas">Número de Vagas</Label>
                  <Input
                    id="vagas"
                    type="number"
                    value={selectedCurso.vagas}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedCurso({
                        ...selectedCurso,
                        vagas: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vagasOcupadas">Vagas Ocupadas</Label>
                  <Input
                    id="vagasOcupadas"
                    type="number"
                    value={selectedCurso.vagasOcupadas}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedCurso({
                        ...selectedCurso,
                        vagasOcupadas: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gratuito"
                      checked={selectedCurso.gratuito}
                      onCheckedChange={(checked) => {
                        if (!viewMode) {
                          setSelectedCurso({
                            ...selectedCurso,
                            gratuito: !!checked,
                            valor: checked ? undefined : selectedCurso.valor
                          });
                        }
                      }}
                      disabled={viewMode}
                    />
                    <Label htmlFor="gratuito">Curso Gratuito</Label>
                  </div>
                </div>
                {!selectedCurso.gratuito && (
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={selectedCurso.valor || ""}
                      onChange={(e) =>
                        !viewMode &&
                        setSelectedCurso({
                          ...selectedCurso,
                          valor: parseFloat(e.target.value) || undefined,
                        })
                      }
                      disabled={viewMode}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="certificacao"
                      checked={selectedCurso.certificacao}
                      onCheckedChange={(checked) => {
                        if (!viewMode) {
                          setSelectedCurso({
                            ...selectedCurso,
                            certificacao: !!checked
                          });
                        }
                      }}
                      disabled={viewMode}
                    />
                    <Label htmlFor="certificacao">Emite Certificação</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedCurso.status}
                    onValueChange={(value: 'planejado' | 'inscricoes_abertas' | 'em_andamento' | 'finalizado' | 'cancelado') =>
                      !viewMode &&
                      setSelectedCurso({
                        ...selectedCurso,
                        status: value,
                      })
                    }
                    disabled={viewMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejado">Planejado</SelectItem>
                      <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                {!viewMode ? (
                  <>
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveCurso}>Salvar</Button>
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

export default CursosCapacitacoes;
