
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
  Users,
  Calendar,
  Clock,
  MapPin,
  Eye,
  DollarSign,
  GraduationCap
} from "lucide-react";
import { Oficina } from "@/types/cultura";

// Mock data para oficinas
const mockOficinas: Oficina[] = [
  {
    id: "1",
    nome: "Oficina de Cerâmica",
    categoria: "Artesanato",
    instrutor: "Ana Silva",
    dataInicio: "2025-06-01",
    dataFim: "2025-07-30",
    diasSemana: ["Segunda", "Quarta"],
    horarioInicio: "14:00",
    horarioFim: "16:00",
    local: "Centro Cultural",
    vagas: 15,
    vagasOcupadas: 12,
    idadeMinima: 16,
    material: ["Argila", "Tintas", "Pincéis"],
    gratuita: true,
    descricao: "Aprenda técnicas básicas de modelagem em argila",
    status: "aberta",
    inscritos: []
  },
  {
    id: "2",
    nome: "Curso de Violão Básico",
    categoria: "Música",
    instrutor: "Carlos Santos",
    dataInicio: "2025-05-15",
    dataFim: "2025-08-15",
    diasSemana: ["Terça", "Quinta"],
    horarioInicio: "19:00",
    horarioFim: "20:30",
    local: "Escola de Música",
    vagas: 10,
    vagasOcupadas: 8,
    idadeMinima: 12,
    material: ["Violão"],
    valor: 120.00,
    gratuita: false,
    descricao: "Curso básico de violão para iniciantes",
    status: "em andamento"
  }
];

const OficinasCursos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todas");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [oficinas, setOficinas] = useState<Oficina[]>(mockOficinas);
  const [selectedOficina, setSelectedOficina] = useState<Oficina | null>(null);

  const filteredOficinas = oficinas.filter((oficina) => {
    const matchesSearch =
      oficina.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      oficina.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      oficina.instrutor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "todas" || 
      (filter === "abertas" && oficina.status === "aberta") ||
      (filter === "em_andamento" && oficina.status === "em andamento") ||
      (filter === "finalizadas" && oficina.status === "finalizada");

    return matchesSearch && matchesFilter;
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    planejada: { label: "Planejada", color: "bg-gray-100 text-gray-800" },
    aberta: { label: "Inscrições Abertas", color: "bg-blue-100 text-blue-800" },
    "em andamento": { label: "Em Andamento", color: "bg-green-100 text-green-800" },
    finalizada: { label: "Finalizada", color: "bg-purple-100 text-purple-800" },
    cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" }
  };

  const handleViewOficina = (oficina: Oficina) => {
    setSelectedOficina({...oficina});
    setViewMode(true);
    setOpenDialog(true);
  };

  const handleEditOficina = (oficina: Oficina) => {
    setSelectedOficina({...oficina});
    setViewMode(false);
    setOpenDialog(true);
  };

  const handleSaveOficina = () => {
    if (!selectedOficina) return;

    if (selectedOficina.id) {
      setOficinas(oficinas.map((o) => o.id === selectedOficina.id ? selectedOficina : o));
    } else {
      const newId = (Math.max(...oficinas.map(o => Number(o.id))) + 1).toString();
      const newOficina = { ...selectedOficina, id: newId, vagasOcupadas: 0 };
      setOficinas([...oficinas, newOficina]);
    }

    setOpenDialog(false);
    setSelectedOficina(null);
  };

  const handleDeleteOficina = (id: string) => {
    setOficinas(oficinas.filter((oficina) => oficina.id !== id));
  };

  const handleNewOficina = () => {
    setSelectedOficina({
      id: "",
      nome: "",
      categoria: "",
      instrutor: "",
      dataInicio: "",
      dataFim: "",
      diasSemana: [],
      horarioInicio: "",
      horarioFim: "",
      local: "",
      vagas: 0,
      vagasOcupadas: 0,
      material: [],
      gratuita: true,
      descricao: "",
      status: "planejada"
    });
    setViewMode(false);
    setOpenDialog(true);
  };

  return (
    
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Oficinas e Cursos</h1>
            <p className="text-muted-foreground">
              Gerencie as oficinas e cursos culturais do município
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewOficina}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Oficina
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Oficinas Cadastradas</CardTitle>
            <CardDescription>
              Total de {filteredOficinas.length} oficinas encontradas
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
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="abertas">Inscrições Abertas</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="finalizadas">Finalizadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / Categoria</TableHead>
                    <TableHead>Instrutor</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Vagas</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOficinas.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center h-32 text-muted-foreground"
                      >
                        Nenhuma oficina encontrada com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOficinas.map((oficina) => (
                      <TableRow key={oficina.id} className="group">
                        <TableCell>
                          <div className="font-medium">{oficina.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {oficina.categoria}
                          </div>
                        </TableCell>
                        <TableCell>{oficina.instrutor}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(oficina.dataInicio), "dd/MM/yyyy")}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            até {format(new Date(oficina.dataFim), "dd/MM/yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {oficina.vagasOcupadas}/{oficina.vagas}
                          </div>
                        </TableCell>
                        <TableCell>
                          {oficina.gratuita ? (
                            <Badge className="bg-green-100 text-green-800">
                              Gratuita
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              R$ {oficina.valor?.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              statusMap[oficina.status]?.color
                            )}
                          >
                            {statusMap[oficina.status]?.label}
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
                                onClick={() => handleViewOficina(oficina)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditOficina(oficina)}
                                className="cursor-pointer"
                              >
                                <ClipboardEdit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteOficina(oficina.id)}
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
              Mostrando {filteredOficinas.length} de {oficinas.length} oficinas
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

        {/* Dialog simplificado */}
        {selectedOficina && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {viewMode 
                    ? "Detalhes da Oficina" 
                    : selectedOficina.id 
                      ? "Editar Oficina" 
                      : "Nova Oficina"}
                </DialogTitle>
                <DialogDescription>
                  {viewMode
                    ? "Visualize as informações da oficina"
                    : "Preencha os dados da oficina"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Oficina</Label>
                  <Input
                    id="nome"
                    value={selectedOficina.nome}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedOficina({
                        ...selectedOficina,
                        nome: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={selectedOficina.categoria}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedOficina({
                        ...selectedOficina,
                        categoria: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instrutor">Instrutor</Label>
                  <Input
                    id="instrutor"
                    value={selectedOficina.instrutor}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedOficina({
                        ...selectedOficina,
                        instrutor: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    value={selectedOficina.local}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedOficina({
                        ...selectedOficina,
                        local: e.target.value,
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
                    value={selectedOficina.dataInicio}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedOficina({
                        ...selectedOficina,
                        dataInicio: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data de Término</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={selectedOficina.dataFim}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedOficina({
                        ...selectedOficina,
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
                    min="1"
                    value={selectedOficina.vagas}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedOficina({
                        ...selectedOficina,
                        vagas: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedOficina.status}
                    onValueChange={(value: 'planejada' | 'aberta' | 'em andamento' | 'finalizada' | 'cancelada') =>
                      !viewMode &&
                      setSelectedOficina({
                        ...selectedOficina,
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
                      <SelectItem value="aberta">Inscrições Abertas</SelectItem>
                      <SelectItem value="em andamento">Em Andamento</SelectItem>
                      <SelectItem value="finalizada">Finalizada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gratuita"
                        checked={selectedOficina.gratuita}
                        onCheckedChange={(checked) =>
                          !viewMode &&
                          setSelectedOficina({
                            ...selectedOficina,
                            gratuita: checked as boolean,
                            valor: checked ? undefined : selectedOficina.valor
                          })
                        }
                        disabled={viewMode}
                      />
                      <Label htmlFor="gratuita">Oficina Gratuita</Label>
                    </div>
                    {!selectedOficina.gratuita && (
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="valor">Valor:</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          min="0"
                          value={selectedOficina.valor || ""}
                          onChange={(e) =>
                            !viewMode &&
                            setSelectedOficina({
                              ...selectedOficina,
                              valor: parseFloat(e.target.value) || undefined,
                            })
                          }
                          disabled={viewMode}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={selectedOficina.descricao}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedOficina({
                        ...selectedOficina,
                        descricao: e.target.value,
                      })
                    }
                    disabled={viewMode}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                {!viewMode ? (
                  <>
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveOficina}>Salvar</Button>
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

export default OficinasCursos;
