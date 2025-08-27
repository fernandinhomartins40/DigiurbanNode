
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
  Users,
  Calendar,
  MapPin,
  Eye,
  Phone,
  Mail
} from "lucide-react";

interface GrupoArtistico {
  id: string;
  nome: string;
  categoria: string;
  lider: string;
  telefone?: string;
  email?: string;
  membros: number;
  dataFundacao: string;
  descricao: string;
  local: string;
  status: "ativo" | "inativo" | "suspenso";
  proximaApresentacao?: string;
  localApresentacao?: string;
  historico: string[];
}

// Mock data para grupos artísticos
const mockGrupos: GrupoArtistico[] = [
  {
    id: "1",
    nome: "Coral Municipal",
    categoria: "Música",
    lider: "Maria Silva",
    telefone: "(11) 99999-9999",
    email: "coral@municipio.gov.br",
    membros: 25,
    dataFundacao: "2020-03-15",
    descricao: "Coral formado por moradores da cidade que se apresenta em eventos municipais",
    local: "Centro Cultural",
    status: "ativo",
    proximaApresentacao: "2025-07-20",
    localApresentacao: "Teatro Municipal",
    historico: [
      "2024-12-15 - Apresentação de Natal",
      "2024-10-12 - Festival de Música",
      "2024-08-30 - Festa da Cidade"
    ]
  },
  {
    id: "2",
    nome: "Grupo de Dança Folclórica",
    categoria: "Dança",
    lider: "João Santos",
    telefone: "(11) 88888-8888",
    membros: 15,
    dataFundacao: "2019-06-10",
    descricao: "Grupo dedicado à preservação das danças folclóricas regionais",
    local: "Escola de Dança Municipal",
    status: "ativo",
    historico: [
      "2024-11-20 - Festa Junina Municipal",
      "2024-09-07 - Independência do Brasil"
    ]
  }
];

const GruposArtisticos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [grupos, setGrupos] = useState<GrupoArtistico[]>(mockGrupos);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoArtistico | null>(null);

  const filteredGrupos = grupos.filter((grupo) => {
    const matchesSearch =
      grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grupo.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grupo.lider.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "todos" || 
      (filter === "ativos" && grupo.status === "ativo") ||
      (filter === "inativos" && grupo.status === "inativo");

    return matchesSearch && matchesFilter;
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    ativo: { label: "Ativo", color: "bg-green-100 text-green-800" },
    inativo: { label: "Inativo", color: "bg-gray-100 text-gray-800" },
    suspenso: { label: "Suspenso", color: "bg-red-100 text-red-800" }
  };

  const handleViewGrupo = (grupo: GrupoArtistico) => {
    setSelectedGrupo({...grupo});
    setViewMode(true);
    setOpenDialog(true);
  };

  const handleEditGrupo = (grupo: GrupoArtistico) => {
    setSelectedGrupo({...grupo});
    setViewMode(false);
    setOpenDialog(true);
  };

  const handleSaveGrupo = () => {
    if (!selectedGrupo) return;

    if (selectedGrupo.id) {
      setGrupos(grupos.map((g) => g.id === selectedGrupo.id ? selectedGrupo : g));
    } else {
      const newId = (Math.max(...grupos.map(g => Number(g.id))) + 1).toString();
      const newGrupo = { ...selectedGrupo, id: newId, historico: [] };
      setGrupos([...grupos, newGrupo]);
    }

    setOpenDialog(false);
    setSelectedGrupo(null);
  };

  const handleDeleteGrupo = (id: string) => {
    setGrupos(grupos.filter((grupo) => grupo.id !== id));
  };

  const handleNewGrupo = () => {
    setSelectedGrupo({
      id: "",
      nome: "",
      categoria: "",
      lider: "",
      membros: 0,
      dataFundacao: "",
      descricao: "",
      local: "",
      status: "ativo",
      historico: []
    });
    setViewMode(false);
    setOpenDialog(true);
  };

  return (
    
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              Grupos Artísticos
            </h1>
            <p className="text-muted-foreground">
              Gerencie os grupos artísticos do município
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewGrupo}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Grupos Cadastrados</CardTitle>
            <CardDescription>
              Total de {filteredGrupos.length} grupos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, categoria ou líder..."
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
                    <SelectItem value="ativos">Ativos</SelectItem>
                    <SelectItem value="inativos">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / Categoria</TableHead>
                    <TableHead>Líder</TableHead>
                    <TableHead>Membros</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Próxima Apresentação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrupos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center h-32 text-muted-foreground"
                      >
                        Nenhum grupo encontrado com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGrupos.map((grupo) => (
                      <TableRow key={grupo.id} className="group">
                        <TableCell>
                          <div className="font-medium">{grupo.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {grupo.categoria}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{grupo.lider}</div>
                          {grupo.telefone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {grupo.telefone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {grupo.membros}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {grupo.local}
                          </div>
                        </TableCell>
                        <TableCell>
                          {grupo.proximaApresentacao ? (
                            <div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(grupo.proximaApresentacao), "dd/MM/yyyy")}
                              </div>
                              {grupo.localApresentacao && (
                                <div className="text-xs text-muted-foreground">
                                  {grupo.localApresentacao}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Não agendada</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              statusMap[grupo.status]?.color
                            )}
                          >
                            {statusMap[grupo.status]?.label}
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
                                onClick={() => handleViewGrupo(grupo)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditGrupo(grupo)}
                                className="cursor-pointer"
                              >
                                <ClipboardEdit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteGrupo(grupo.id)}
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
              Mostrando {filteredGrupos.length} de {grupos.length} grupos
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
        {selectedGrupo && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {viewMode 
                    ? "Detalhes do Grupo" 
                    : selectedGrupo.id 
                      ? "Editar Grupo" 
                      : "Novo Grupo"}
                </DialogTitle>
                <DialogDescription>
                  {viewMode
                    ? "Visualize as informações do grupo artístico"
                    : "Preencha os dados do grupo artístico"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Grupo</Label>
                  <Input
                    id="nome"
                    value={selectedGrupo.nome}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
                        nome: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={selectedGrupo.categoria}
                    onValueChange={(value) =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
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
                      <SelectItem value="Artesanato">Artesanato</SelectItem>
                      <SelectItem value="Folclore">Folclore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lider">Líder do Grupo</Label>
                  <Input
                    id="lider"
                    value={selectedGrupo.lider}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
                        lider: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={selectedGrupo.telefone || ""}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
                        telefone: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={selectedGrupo.email || ""}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
                        email: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membros">Número de Membros</Label>
                  <Input
                    id="membros"
                    type="number"
                    min="1"
                    value={selectedGrupo.membros}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
                        membros: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFundacao">Data de Fundação</Label>
                  <Input
                    id="dataFundacao"
                    type="date"
                    value={selectedGrupo.dataFundacao}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
                        dataFundacao: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="local">Local de Ensaio</Label>
                  <Input
                    id="local"
                    value={selectedGrupo.local}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
                        local: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedGrupo.status}
                    onValueChange={(value: 'ativo' | 'inativo' | 'suspenso') =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
                        status: value,
                      })
                    }
                    disabled={viewMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proximaApresentacao">Próxima Apresentação</Label>
                  <Input
                    id="proximaApresentacao"
                    type="date"
                    value={selectedGrupo.proximaApresentacao || ""}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
                        proximaApresentacao: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localApresentacao">Local da Apresentação</Label>
                  <Input
                    id="localApresentacao"
                    value={selectedGrupo.localApresentacao || ""}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
                        localApresentacao: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={selectedGrupo.descricao}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedGrupo({
                        ...selectedGrupo,
                        descricao: e.target.value,
                      })
                    }
                    disabled={viewMode}
                    rows={3}
                  />
                </div>
                {viewMode && selectedGrupo.historico.length > 0 && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Histórico de Apresentações</Label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      {selectedGrupo.historico.map((item, index) => (
                        <div key={index} className="text-sm py-1">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                {!viewMode ? (
                  <>
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveGrupo}>Salvar</Button>
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

export default GruposArtisticos;
