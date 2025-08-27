
import { useState } from "react";
// Layout removido - já está no App.tsx
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
  FolderOpen,
  Eye,
  Users
} from "lucide-react";
import { ProjetoCultural } from "@/types/cultura";

// Mock data para projetos culturais
const mockProjetos: ProjetoCultural[] = [
  {
    id: "1",
    nome: "Projeto Música nas Escolas",
    categoria: "Educação Musical",
    coordenador: "Ana Santos",
    participantes: ["João Silva", "Maria Costa", "Pedro Alves"],
    dataInicio: "2025-03-01",
    dataFim: "2025-12-31",
    orcamento: 50000,
    fonteRecurso: "Secretaria de Cultura",
    objetivos: "Promover o ensino de música nas escolas municipais",
    publicoAlvo: "Alunos de 6 a 14 anos",
    metodologia: "Aulas práticas de instrumentos e teoria musical",
    cronograma: [],
    resultadosEsperados: "Formar 200 alunos em música básica",
    status: "em execucao"
  },
  {
    id: "2", 
    nome: "Festival de Artes Locais",
    categoria: "Evento Cultural",
    coordenador: "Carlos Mendes",
    participantes: ["Lucia Fernandes", "Roberto Silva"],
    dataInicio: "2025-06-01",
    dataFim: "2025-07-31",
    orcamento: 30000,
    objetivos: "Valorizar artistas locais",
    publicoAlvo: "Comunidade em geral",
    metodologia: "Exposições e apresentações",
    cronograma: [],
    resultadosEsperados: "50 artistas participantes",
    status: "aprovado"
  }
];

const ProjetosCulturais = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [projetos, setProjetos] = useState<ProjetoCultural[]>(mockProjetos);
  const [selectedProjeto, setSelectedProjeto] = useState<ProjetoCultural | null>(null);

  const filteredProjetos = projetos.filter((projeto) => {
    const matchesSearch =
      projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.coordenador.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "todos" || 
      (filter === "aprovados" && projeto.status === "aprovado") ||
      (filter === "em_execucao" && projeto.status === "em execucao") ||
      (filter === "concluidos" && projeto.status === "concluido");

    return matchesSearch && matchesFilter;
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    "em elaboracao": { label: "Em Elaboração", color: "bg-gray-100 text-gray-800" },
    aprovado: { label: "Aprovado", color: "bg-blue-100 text-blue-800" },
    "em execucao": { label: "Em Execução", color: "bg-green-100 text-green-800" },
    concluido: { label: "Concluído", color: "bg-purple-100 text-purple-800" },
    suspenso: { label: "Suspenso", color: "bg-amber-100 text-amber-800" },
    cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" }
  };

  const handleViewProjeto = (projeto: ProjetoCultural) => {
    setSelectedProjeto({...projeto});
    setViewMode(true);
    setOpenDialog(true);
  };

  const handleEditProjeto = (projeto: ProjetoCultural) => {
    setSelectedProjeto({...projeto});
    setViewMode(false);
    setOpenDialog(true);
  };

  const handleSaveProjeto = () => {
    if (!selectedProjeto) return;

    if (selectedProjeto.id) {
      setProjetos(projetos.map((p) => p.id === selectedProjeto.id ? selectedProjeto : p));
    } else {
      const newId = (Math.max(...projetos.map(p => Number(p.id))) + 1).toString();
      const newProjeto = { ...selectedProjeto, id: newId };
      setProjetos([...projetos, newProjeto]);
    }

    setOpenDialog(false);
    setSelectedProjeto(null);
  };

  const handleDeleteProjeto = (id: string) => {
    setProjetos(projetos.filter((projeto) => projeto.id !== id));
  };

  const handleNewProjeto = () => {
    setSelectedProjeto({
      id: "",
      nome: "",
      categoria: "",
      coordenador: "",
      participantes: [],
      dataInicio: "",
      dataFim: "",
      objetivos: "",
      publicoAlvo: "",
      metodologia: "",
      cronograma: [],
      resultadosEsperados: "",
      status: "em elaboracao"
    });
    setViewMode(false);
    setOpenDialog(true);
  };

  return (
    <div>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projetos Culturais</h1>
            <p className="text-muted-foreground">
              Gerencie os projetos culturais do município
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewProjeto}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Projetos Cadastrados</CardTitle>
            <CardDescription>
              Total de {filteredProjetos.length} projetos encontrados
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
                    <SelectItem value="aprovados">Aprovados</SelectItem>
                    <SelectItem value="em_execucao">Em Execução</SelectItem>
                    <SelectItem value="concluidos">Concluídos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / Categoria</TableHead>
                    <TableHead>Coordenador</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Orçamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjetos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center h-32 text-muted-foreground"
                      >
                        Nenhum projeto encontrado com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjetos.map((projeto) => (
                      <TableRow key={projeto.id} className="group">
                        <TableCell>
                          <div className="font-medium">{projeto.nome}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <FolderOpen className="h-3 w-3 mr-1" />
                            {projeto.categoria}
                          </div>
                        </TableCell>
                        <TableCell>{projeto.coordenador}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(projeto.dataInicio), "dd/MM/yyyy")}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            até {format(new Date(projeto.dataFim), "dd/MM/yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {projeto.orcamento ? 
                            `R$ ${projeto.orcamento.toLocaleString('pt-BR')}` : 
                            "Não informado"
                          }
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              statusMap[projeto.status]?.color
                            )}
                          >
                            {statusMap[projeto.status]?.label}
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
                                onClick={() => handleViewProjeto(projeto)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditProjeto(projeto)}
                                className="cursor-pointer"
                              >
                                <ClipboardEdit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteProjeto(projeto.id)}
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
              Mostrando {filteredProjetos.length} de {projetos.length} projetos
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

        {/* Dialog básico */}
        {selectedProjeto && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {viewMode 
                    ? "Detalhes do Projeto" 
                    : selectedProjeto.id 
                      ? "Editar Projeto" 
                      : "Novo Projeto"}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Projeto</Label>
                  <Input
                    id="nome"
                    value={selectedProjeto.nome}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedProjeto({
                        ...selectedProjeto,
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
                    value={selectedProjeto.categoria}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedProjeto({
                        ...selectedProjeto,
                        categoria: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="objetivos">Objetivos</Label>
                  <Textarea
                    id="objetivos"
                    value={selectedProjeto.objetivos}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedProjeto({
                        ...selectedProjeto,
                        objetivos: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  {viewMode ? "Fechar" : "Cancelar"}
                </Button>
                {!viewMode && (
                  <Button onClick={handleSaveProjeto}>Salvar</Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ProjetosCulturais;
