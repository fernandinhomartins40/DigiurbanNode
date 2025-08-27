
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
  Film
} from "lucide-react";

interface EventoCultural {
  id: string;
  nome: string;
  categoria: string;
  dataInicio: string;
  dataFim: string;
  horarioInicio: string;
  horarioFim: string;
  local: string;
  capacidade: number;
  inscricoes: number;
  organizador: string;
  descricao: string;
  valor?: number;
  gratuito: boolean;
  status: "planejado" | "aberto" | "em_andamento" | "finalizado" | "cancelado";
  publicoAlvo: string;
  requisitos?: string;
  participantes?: string[];
}

// Mock data para eventos
const mockEventos: EventoCultural[] = [
  {
    id: "1",
    nome: "Festival de Música Tradicional",
    categoria: "Música",
    dataInicio: "2025-07-15",
    dataFim: "2025-07-17",
    horarioInicio: "19:00",
    horarioFim: "23:00",
    local: "Praça Central",
    capacidade: 500,
    inscricoes: 347,
    organizador: "Secretaria de Cultura",
    descricao: "Festival com apresentações de grupos musicais locais e regionais",
    gratuito: true,
    status: "aberto",
    publicoAlvo: "Toda família",
    participantes: []
  },
  {
    id: "2",
    nome: "Oficina de Teatro",
    categoria: "Teatro",
    dataInicio: "2025-06-10",
    dataFim: "2025-06-10",
    horarioInicio: "14:00",
    horarioFim: "17:00",
    local: "Centro Cultural",
    capacidade: 30,
    inscricoes: 25,
    organizador: "Grupo Teatral Municipal",
    descricao: "Oficina prática de teatro para iniciantes",
    valor: 50.00,
    gratuito: false,
    status: "em_andamento",
    publicoAlvo: "Jovens e adultos",
    requisitos: "Idade mínima 16 anos"
  }
];

const Eventos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [eventos, setEventos] = useState<EventoCultural[]>(mockEventos);
  const [selectedEvento, setSelectedEvento] = useState<EventoCultural | null>(null);

  const filteredEventos = eventos.filter((evento) => {
    const matchesSearch =
      evento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.local.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "todos" || 
      (filter === "abertos" && evento.status === "aberto") ||
      (filter === "em_andamento" && evento.status === "em_andamento") ||
      (filter === "finalizados" && evento.status === "finalizado");

    return matchesSearch && matchesFilter;
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    planejado: { label: "Planejado", color: "bg-gray-100 text-gray-800" },
    aberto: { label: "Inscrições Abertas", color: "bg-blue-100 text-blue-800" },
    em_andamento: { label: "Em Andamento", color: "bg-green-100 text-green-800" },
    finalizado: { label: "Finalizado", color: "bg-purple-100 text-purple-800" },
    cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" }
  };

  const handleViewEvento = (evento: EventoCultural) => {
    setSelectedEvento({...evento});
    setViewMode(true);
    setOpenDialog(true);
  };

  const handleEditEvento = (evento: EventoCultural) => {
    setSelectedEvento({...evento});
    setViewMode(false);
    setOpenDialog(true);
  };

  const handleSaveEvento = () => {
    if (!selectedEvento) return;

    if (selectedEvento.id) {
      setEventos(eventos.map((e) => e.id === selectedEvento.id ? selectedEvento : e));
    } else {
      const newId = (Math.max(...eventos.map(e => Number(e.id))) + 1).toString();
      const newEvento = { ...selectedEvento, id: newId, inscricoes: 0 };
      setEventos([...eventos, newEvento]);
    }

    setOpenDialog(false);
    setSelectedEvento(null);
  };

  const handleDeleteEvento = (id: string) => {
    setEventos(eventos.filter((evento) => evento.id !== id));
  };

  const handleNewEvento = () => {
    setSelectedEvento({
      id: "",
      nome: "",
      categoria: "",
      dataInicio: "",
      dataFim: "",
      horarioInicio: "",
      horarioFim: "",
      local: "",
      capacidade: 0,
      inscricoes: 0,
      organizador: "",
      descricao: "",
      gratuito: true,
      status: "planejado",
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
              <Film className="h-8 w-8 text-blue-600" />
              Eventos Culturais
            </h1>
            <p className="text-muted-foreground">
              Gerencie os eventos culturais do município
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewEvento}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Eventos Cadastrados</CardTitle>
            <CardDescription>
              Total de {filteredEventos.length} eventos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, categoria ou local..."
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
                    <SelectItem value="abertos">Inscrições Abertas</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="finalizados">Finalizados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / Categoria</TableHead>
                    <TableHead>Data / Horário</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEventos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center h-32 text-muted-foreground"
                      >
                        Nenhum evento encontrado com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEventos.map((evento) => (
                      <TableRow key={evento.id} className="group">
                        <TableCell>
                          <div className="font-medium">{evento.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {evento.categoria}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(evento.dataInicio), "dd/MM/yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {evento.horarioInicio} - {evento.horarioFim}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {evento.local}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {evento.inscricoes}/{evento.capacidade}
                          </div>
                        </TableCell>
                        <TableCell>
                          {evento.gratuito ? (
                            <Badge className="bg-green-100 text-green-800">
                              Gratuito
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              R$ {evento.valor?.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              statusMap[evento.status]?.color
                            )}
                          >
                            {statusMap[evento.status]?.label}
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
                                onClick={() => handleViewEvento(evento)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditEvento(evento)}
                                className="cursor-pointer"
                              >
                                <ClipboardEdit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteEvento(evento.id)}
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
              Mostrando {filteredEventos.length} de {eventos.length} eventos
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
        {selectedEvento && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {viewMode 
                    ? "Detalhes do Evento" 
                    : selectedEvento.id 
                      ? "Editar Evento" 
                      : "Novo Evento"}
                </DialogTitle>
                <DialogDescription>
                  {viewMode
                    ? "Visualize as informações do evento"
                    : "Preencha os dados do evento cultural"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Evento</Label>
                  <Input
                    id="nome"
                    value={selectedEvento.nome}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
                        nome: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={selectedEvento.categoria}
                    onValueChange={(value) =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
                        categoria: value,
                      })
                    }
                    disabled={viewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Música">Música</SelectItem>
                      <SelectItem value="Teatro">Teatro</SelectItem>
                      <SelectItem value="Dança">Dança</SelectItem>
                      <SelectItem value="Literatura">Literatura</SelectItem>
                      <SelectItem value="Artes Visuais">Artes Visuais</SelectItem>
                      <SelectItem value="Cinema">Cinema</SelectItem>
                      <SelectItem value="Festival">Festival</SelectItem>
                      <SelectItem value="Exposição">Exposição</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={selectedEvento.dataInicio}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
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
                    value={selectedEvento.dataFim}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
                        dataFim: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horarioInicio">Horário de Início</Label>
                  <Input
                    id="horarioInicio"
                    type="time"
                    value={selectedEvento.horarioInicio}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
                        horarioInicio: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horarioFim">Horário de Término</Label>
                  <Input
                    id="horarioFim"
                    type="time"
                    value={selectedEvento.horarioFim}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
                        horarioFim: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    value={selectedEvento.local}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
                        local: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidade">Capacidade</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    min="1"
                    value={selectedEvento.capacidade}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
                        capacidade: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizador">Organizador</Label>
                  <Input
                    id="organizador"
                    value={selectedEvento.organizador}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
                        organizador: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedEvento.status}
                    onValueChange={(value: 'planejado' | 'aberto' | 'em_andamento' | 'finalizado' | 'cancelado') =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
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
                      <SelectItem value="aberto">Inscrições Abertas</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gratuito"
                        checked={selectedEvento.gratuito}
                        onCheckedChange={(checked) =>
                          !viewMode &&
                          setSelectedEvento({
                            ...selectedEvento,
                            gratuito: checked as boolean,
                            valor: checked ? undefined : selectedEvento.valor
                          })
                        }
                        disabled={viewMode}
                      />
                      <Label htmlFor="gratuito">Evento Gratuito</Label>
                    </div>
                    {!selectedEvento.gratuito && (
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="valor">Valor:</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          min="0"
                          value={selectedEvento.valor || ""}
                          onChange={(e) =>
                            !viewMode &&
                            setSelectedEvento({
                              ...selectedEvento,
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
                  <Label htmlFor="publicoAlvo">Público Alvo</Label>
                  <Input
                    id="publicoAlvo"
                    value={selectedEvento.publicoAlvo}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
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
                    value={selectedEvento.descricao}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEvento({
                        ...selectedEvento,
                        descricao: e.target.value,
                      })
                    }
                    disabled={viewMode}
                    rows={3}
                  />
                </div>
                {!viewMode && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="requisitos">Requisitos (Opcional)</Label>
                    <Textarea
                      id="requisitos"
                      value={selectedEvento.requisitos || ""}
                      onChange={(e) =>
                        setSelectedEvento({
                          ...selectedEvento,
                          requisitos: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                {!viewMode ? (
                  <>
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveEvento}>Salvar</Button>
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

export default Eventos;
