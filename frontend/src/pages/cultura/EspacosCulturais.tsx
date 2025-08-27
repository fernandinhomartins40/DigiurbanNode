
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
  MapPin,
  Users,
  Building,
  Eye
} from "lucide-react";
import { EspacoCultural } from "@/types/cultura";

// Mock data para espaços culturais
const mockEspacos: EspacoCultural[] = [
  {
    id: "1",
    nome: "Centro Cultural Municipal",
    tipo: "Centro Cultural",
    endereco: "Rua das Artes, 123, Centro",
    capacidade: 300,
    horarioFuncionamento: "Segunda a Sexta: 8h às 17h",
    equipamentos: ["Projetor", "Som", "Iluminação"],
    acessibilidade: ["Rampa de acesso", "Banheiro adaptado"],
    gratuito: true,
    responsavel: "Maria Santos",
    telefone: "(11) 98765-4321",
    email: "centro.cultural@cidade.gov.br",
    status: "disponivel"
  },
  {
    id: "2",
    nome: "Teatro Municipal",
    tipo: "Teatro",
    endereco: "Av. Cultural, 456, Centro",
    capacidade: 500,
    horarioFuncionamento: "Terça a Domingo: 14h às 22h",
    equipamentos: ["Palco", "Camarim", "Som profissional", "Iluminação cênica"],
    acessibilidade: ["Elevador", "Lugares reservados"],
    valor: 500.00,
    gratuito: false,
    responsavel: "João Silva",
    telefone: "(11) 91234-5678",
    status: "disponivel"
  }
];

const EspacosCulturais = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [espacos, setEspacos] = useState<EspacoCultural[]>(mockEspacos);
  const [selectedEspaco, setSelectedEspaco] = useState<EspacoCultural | null>(null);

  const filteredEspacos = espacos.filter((espaco) => {
    const matchesSearch =
      espaco.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      espaco.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      espaco.endereco.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "todos" || 
      (filter === "disponiveis" && espaco.status === "disponivel") ||
      (filter === "ocupados" && espaco.status === "ocupado") ||
      (filter === "manutencao" && espaco.status === "manutencao");

    return matchesSearch && matchesFilter;
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    disponivel: { label: "Disponível", color: "bg-green-100 text-green-800" },
    ocupado: { label: "Ocupado", color: "bg-blue-100 text-blue-800" },
    manutencao: { label: "Em Manutenção", color: "bg-amber-100 text-amber-800" },
    interditado: { label: "Interditado", color: "bg-red-100 text-red-800" }
  };

  const handleViewEspaco = (espaco: EspacoCultural) => {
    setSelectedEspaco({...espaco});
    setViewMode(true);
    setOpenDialog(true);
  };

  const handleEditEspaco = (espaco: EspacoCultural) => {
    setSelectedEspaco({...espaco});
    setViewMode(false);
    setOpenDialog(true);
  };

  const handleSaveEspaco = () => {
    if (!selectedEspaco) return;

    if (selectedEspaco.id) {
      setEspacos(espacos.map((e) => e.id === selectedEspaco.id ? selectedEspaco : e));
    } else {
      const newId = (Math.max(...espacos.map(e => Number(e.id))) + 1).toString();
      const newEspaco = { ...selectedEspaco, id: newId };
      setEspacos([...espacos, newEspaco]);
    }

    setOpenDialog(false);
    setSelectedEspaco(null);
  };

  const handleDeleteEspaco = (id: string) => {
    setEspacos(espacos.filter((espaco) => espaco.id !== id));
  };

  const handleNewEspaco = () => {
    setSelectedEspaco({
      id: "",
      nome: "",
      tipo: "",
      endereco: "",
      capacidade: 0,
      horarioFuncionamento: "",
      equipamentos: [],
      acessibilidade: [],
      gratuito: true,
      responsavel: "",
      telefone: "",
      status: "disponivel"
    });
    setViewMode(false);
    setOpenDialog(true);
  };

  return (
    
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Espaços Culturais</h1>
            <p className="text-muted-foreground">
              Gerencie os espaços culturais do município
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewEspaco}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Espaço
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Espaços Cadastrados</CardTitle>
            <CardDescription>
              Total de {filteredEspacos.length} espaços encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, tipo ou endereço..."
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
                    <SelectItem value="disponiveis">Disponíveis</SelectItem>
                    <SelectItem value="ocupados">Ocupados</SelectItem>
                    <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / Tipo</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEspacos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center h-32 text-muted-foreground"
                      >
                        Nenhum espaço encontrado com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEspacos.map((espaco) => (
                      <TableRow key={espaco.id} className="group">
                        <TableCell>
                          <div className="font-medium">{espaco.nome}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {espaco.tipo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {espaco.endereco}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {espaco.capacidade} pessoas
                          </div>
                        </TableCell>
                        <TableCell>{espaco.responsavel}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              statusMap[espaco.status]?.color
                            )}
                          >
                            {statusMap[espaco.status]?.label}
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
                                onClick={() => handleViewEspaco(espaco)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditEspaco(espaco)}
                                className="cursor-pointer"
                              >
                                <ClipboardEdit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteEspaco(espaco.id)}
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
              Mostrando {filteredEspacos.length} de {espacos.length} espaços
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
        {selectedEspaco && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {viewMode 
                    ? "Detalhes do Espaço" 
                    : selectedEspaco.id 
                      ? "Editar Espaço" 
                      : "Novo Espaço"}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={selectedEspaco.nome}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEspaco({
                        ...selectedEspaco,
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
                    value={selectedEspaco.tipo}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEspaco({
                        ...selectedEspaco,
                        tipo: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={selectedEspaco.endereco}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedEspaco({
                        ...selectedEspaco,
                        endereco: e.target.value,
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
                  <Button onClick={handleSaveEspaco}>Salvar</Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    
  );
};

export default EspacosCulturais;
