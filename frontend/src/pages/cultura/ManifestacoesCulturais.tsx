
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
import {
  Search,
  Filter,
  MoreVertical,
  PlusCircle,
  Download,
  Printer,
  ClipboardEdit,
  Trash2,
  Building2,
  Eye,
  FileText
} from "lucide-react";
import { ManifestacaoCultural } from "@/types/cultura";

// Mock data para manifestações culturais
const mockManifestacoes: ManifestacaoCultural[] = [
  {
    id: "1",
    nome: "Festa Junina Tradicional",
    tipo: "Festa Popular",
    origem: "Tradição européia adaptada",
    descricao: "Festa popular realizada anualmente no mês de junho",
    historia: "Trazida pelos colonizadores europeus e adaptada à cultura local",
    caracteristicas: ["Quadrilha", "Comidas típicas", "Fogueira"],
    praticantes: ["Comunidade local", "Escolas"],
    locaisPratica: ["Praça Central", "Escolas municipais"],
    periodicidade: "Anual - mês de junho",
    materiaisNecessarios: ["Bandeirolas", "Palha", "Instrumentos musicais"],
    status: "ativo"
  },
  {
    id: "2",
    nome: "Artesanato em Cerâmica",
    tipo: "Artesanato",
    origem: "Tradição indígena",
    descricao: "Técnica tradicional de produção de cerâmica",
    caracteristicas: ["Modelagem manual", "Queima em forno a lenha"],
    praticantes: ["Artesãos locais"],
    locaisPratica: ["Ateliês familiares"],
    status: "em risco"
  }
];

const ManifestacoesCulturais = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todas");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [manifestacoes, setManifestacoes] = useState<ManifestacaoCultural[]>(mockManifestacoes);
  const [selectedManifestacao, setSelectedManifestacao] = useState<ManifestacaoCultural | null>(null);

  const filteredManifestacoes = manifestacoes.filter((manifestacao) => {
    const matchesSearch =
      manifestacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manifestacao.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manifestacao.origem.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "todas" || 
      (filter === "ativo" && manifestacao.status === "ativo") ||
      (filter === "em_risco" && manifestacao.status === "em risco") ||
      (filter === "perdido" && manifestacao.status === "perdido");

    return matchesSearch && matchesFilter;
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    ativo: { label: "Ativo", color: "bg-green-100 text-green-800" },
    "em risco": { label: "Em Risco", color: "bg-amber-100 text-amber-800" },
    perdido: { label: "Perdido", color: "bg-red-100 text-red-800" },
    documentado: { label: "Documentado", color: "bg-blue-100 text-blue-800" }
  };

  const handleViewManifestacao = (manifestacao: ManifestacaoCultural) => {
    setSelectedManifestacao({...manifestacao});
    setViewMode(true);
    setOpenDialog(true);
  };

  const handleEditManifestacao = (manifestacao: ManifestacaoCultural) => {
    setSelectedManifestacao({...manifestacao});
    setViewMode(false);
    setOpenDialog(true);
  };

  const handleSaveManifestacao = () => {
    if (!selectedManifestacao) return;

    if (selectedManifestacao.id) {
      setManifestacoes(manifestacoes.map((m) => m.id === selectedManifestacao.id ? selectedManifestacao : m));
    } else {
      const newId = (Math.max(...manifestacoes.map(m => Number(m.id))) + 1).toString();
      const newManifestacao = { ...selectedManifestacao, id: newId };
      setManifestacoes([...manifestacoes, newManifestacao]);
    }

    setOpenDialog(false);
    setSelectedManifestacao(null);
  };

  const handleDeleteManifestacao = (id: string) => {
    setManifestacoes(manifestacoes.filter((manifestacao) => manifestacao.id !== id));
  };

  const handleNewManifestacao = () => {
    setSelectedManifestacao({
      id: "",
      nome: "",
      tipo: "",
      origem: "",
      descricao: "",
      caracteristicas: [],
      praticantes: [],
      locaisPratica: [],
      status: "ativo"
    });
    setViewMode(false);
    setOpenDialog(true);
  };

  return (
    
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manifestações Culturais</h1>
            <p className="text-muted-foreground">
              Patrimônio cultural imaterial do município
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewManifestacao}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Manifestação
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manifestações Cadastradas</CardTitle>
            <CardDescription>
              Total de {filteredManifestacoes.length} manifestações encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, tipo ou origem..."
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
                    <SelectItem value="ativo">Ativas</SelectItem>
                    <SelectItem value="em_risco">Em Risco</SelectItem>
                    <SelectItem value="perdido">Perdidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / Tipo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Características</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredManifestacoes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-32 text-muted-foreground"
                      >
                        Nenhuma manifestação encontrada com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredManifestacoes.map((manifestacao) => (
                      <TableRow key={manifestacao.id} className="group">
                        <TableCell>
                          <div className="font-medium">{manifestacao.nome}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {manifestacao.tipo}
                          </div>
                        </TableCell>
                        <TableCell>{manifestacao.origem}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {manifestacao.caracteristicas.slice(0, 2).map((caracteristica, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {caracteristica}
                              </Badge>
                            ))}
                            {manifestacao.caracteristicas.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{manifestacao.caracteristicas.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              statusMap[manifestacao.status]?.color
                            )}
                          >
                            {statusMap[manifestacao.status]?.label}
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
                                onClick={() => handleViewManifestacao(manifestacao)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditManifestacao(manifestacao)}
                                className="cursor-pointer"
                              >
                                <ClipboardEdit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteManifestacao(manifestacao.id)}
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
              Mostrando {filteredManifestacoes.length} de {manifestacoes.length} manifestações
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
        {selectedManifestacao && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {viewMode 
                    ? "Detalhes da Manifestação" 
                    : selectedManifestacao.id 
                      ? "Editar Manifestação" 
                      : "Nova Manifestação"}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={selectedManifestacao.nome}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedManifestacao({
                        ...selectedManifestacao,
                        nome: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Input
                    id="tipo"
                    value={selectedManifestacao.tipo}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedManifestacao({
                        ...selectedManifestacao,
                        tipo: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="origem">Origem</Label>
                  <Input
                    id="origem"
                    value={selectedManifestacao.origem}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedManifestacao({
                        ...selectedManifestacao,
                        origem: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={selectedManifestacao.descricao}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedManifestacao({
                        ...selectedManifestacao,
                        descricao: e.target.value,
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
                  <Button onClick={handleSaveManifestacao}>Salvar</Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    
  );
};

export default ManifestacoesCulturais;
