
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
  User,
  MapPin,
  Phone,
  Mail,
  Tractor,
  Eye
} from "lucide-react";

interface Produtor {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  endereco: string;
  propriedade: {
    nome: string;
    area: number;
    endereco: string;
  };
  tipoProducao: string[];
  status: "ativo" | "inativo" | "pendente";
  dataUltimoAtendimento?: string;
  observacoes?: string;
}

// Mock data para produtores
const mockProdutores: Produtor[] = [
  {
    id: "1",
    nome: "João Silva",
    cpf: "123.456.789-00",
    telefone: "(11) 99999-9999",
    email: "joao@email.com",
    endereco: "Rua das Flores, 123",
    propriedade: {
      nome: "Fazenda Esperança",
      area: 50.5,
      endereco: "Zona Rural"
    },
    tipoProducao: ["Milho", "Soja", "Feijão"],
    status: "ativo",
    dataUltimoAtendimento: "2025-01-15"
  },
  {
    id: "2",
    nome: "Maria Oliveira",
    cpf: "987.654.321-00",
    telefone: "(11) 88888-8888",
    endereco: "Av. Central, 456",
    propriedade: {
      nome: "Sítio Bela Vista",
      area: 25.0,
      endereco: "Estrada Municipal, km 10"
    },
    tipoProducao: ["Hortaliças", "Frutas"],
    status: "ativo"
  }
];

const CadastroProdutores = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [produtores, setProdutores] = useState<Produtor[]>(mockProdutores);
  const [selectedProdutor, setSelectedProdutor] = useState<Produtor | null>(null);

  const filteredProdutores = produtores.filter((produtor) => {
    const matchesSearch =
      produtor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produtor.cpf.includes(searchTerm) ||
      produtor.propriedade.nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "todos" || produtor.status === filter;

    return matchesSearch && matchesFilter;
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    ativo: { label: "Ativo", color: "bg-green-100 text-green-800" },
    inativo: { label: "Inativo", color: "bg-gray-100 text-gray-800" },
    pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" }
  };

  const handleViewProdutor = (produtor: Produtor) => {
    setSelectedProdutor({...produtor});
    setViewMode(true);
    setOpenDialog(true);
  };

  const handleEditProdutor = (produtor: Produtor) => {
    setSelectedProdutor({...produtor});
    setViewMode(false);
    setOpenDialog(true);
  };

  const handleSaveProdutor = () => {
    if (!selectedProdutor) return;

    if (selectedProdutor.id) {
      setProdutores(produtores.map((p) => p.id === selectedProdutor.id ? selectedProdutor : p));
    } else {
      const newId = (Math.max(...produtores.map(p => Number(p.id))) + 1).toString();
      const newProdutor = { ...selectedProdutor, id: newId };
      setProdutores([...produtores, newProdutor]);
    }

    setOpenDialog(false);
    setSelectedProdutor(null);
  };

  const handleDeleteProdutor = (id: string) => {
    setProdutores(produtores.filter((produtor) => produtor.id !== id));
  };

  const handleNewProdutor = () => {
    setSelectedProdutor({
      id: "",
      nome: "",
      cpf: "",
      telefone: "",
      endereco: "",
      propriedade: {
        nome: "",
        area: 0,
        endereco: ""
      },
      tipoProducao: [],
      status: "ativo"
    });
    setViewMode(false);
    setOpenDialog(true);
  };

  const tiposProducaoOptions = [
    "Milho", "Soja", "Feijão", "Arroz", "Trigo", "Café", "Cana-de-açúcar",
    "Hortaliças", "Frutas", "Pecuária", "Avicultura", "Suinocultura"
  ];

  return (
    
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Tractor className="h-8 w-8 text-green-600" />
              Cadastro de Produtores
            </h1>
            <p className="text-muted-foreground">
              Gerencie o cadastro dos produtores rurais
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewProdutor}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produtor
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Produtores Cadastrados</CardTitle>
            <CardDescription>
              Total de {filteredProdutores.length} produtores encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, CPF ou propriedade..."
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
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produtor</TableHead>
                    <TableHead>Propriedade / Área</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Tipos de Produção</TableHead>
                    <TableHead>Último Atendimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProdutores.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center h-32 text-muted-foreground"
                      >
                        Nenhum produtor encontrado com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProdutores.map((produtor) => (
                      <TableRow key={produtor.id} className="group">
                        <TableCell>
                          <div className="font-medium">{produtor.nome}</div>
                          <div className="text-xs text-muted-foreground">{produtor.cpf}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{produtor.propriedade.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {produtor.propriedade.area} hectares
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                            <Phone className="h-3 w-3" />
                            {produtor.telefone}
                          </div>
                          {produtor.email && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {produtor.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {produtor.tipoProducao.slice(0, 2).map((tipo, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tipo}
                              </Badge>
                            ))}
                            {produtor.tipoProducao.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{produtor.tipoProducao.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {produtor.dataUltimoAtendimento ? (
                            format(new Date(produtor.dataUltimoAtendimento), "dd/MM/yyyy")
                          ) : (
                            <span className="text-muted-foreground">Não registrado</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              statusMap[produtor.status]?.color
                            )}
                          >
                            {statusMap[produtor.status]?.label}
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
                                onClick={() => handleViewProdutor(produtor)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditProdutor(produtor)}
                                className="cursor-pointer"
                              >
                                <ClipboardEdit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteProdutor(produtor.id)}
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
              Mostrando {filteredProdutores.length} de {produtores.length} produtores
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
        {selectedProdutor && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {viewMode 
                    ? "Detalhes do Produtor" 
                    : selectedProdutor.id 
                      ? "Editar Produtor" 
                      : "Novo Produtor"}
                </DialogTitle>
                <DialogDescription>
                  {viewMode
                    ? "Visualize as informações do produtor"
                    : "Preencha os dados do produtor rural"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={selectedProdutor.nome}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedProdutor({
                        ...selectedProdutor,
                        nome: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={selectedProdutor.cpf}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedProdutor({
                        ...selectedProdutor,
                        cpf: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={selectedProdutor.telefone}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedProdutor({
                        ...selectedProdutor,
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
                    value={selectedProdutor.email || ""}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedProdutor({
                        ...selectedProdutor,
                        email: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">Endereço Residencial</Label>
                  <Input
                    id="endereco"
                    value={selectedProdutor.endereco}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedProdutor({
                        ...selectedProdutor,
                        endereco: e.target.value,
                      })
                    }
                    disabled={viewMode}
                  />
                </div>
                
                <div className="md:col-span-2 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Dados da Propriedade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propriedadeNome">Nome da Propriedade</Label>
                      <Input
                        id="propriedadeNome"
                        value={selectedProdutor.propriedade.nome}
                        onChange={(e) =>
                          !viewMode &&
                          setSelectedProdutor({
                            ...selectedProdutor,
                            propriedade: {
                              ...selectedProdutor.propriedade,
                              nome: e.target.value,
                            }
                          })
                        }
                        disabled={viewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propriedadeArea">Área (hectares)</Label>
                      <Input
                        id="propriedadeArea"
                        type="number"
                        step="0.1"
                        value={selectedProdutor.propriedade.area}
                        onChange={(e) =>
                          !viewMode &&
                          setSelectedProdutor({
                            ...selectedProdutor,
                            propriedade: {
                              ...selectedProdutor.propriedade,
                              area: parseFloat(e.target.value) || 0,
                            }
                          })
                        }
                        disabled={viewMode}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="propriedadeEndereco">Endereço da Propriedade</Label>
                      <Input
                        id="propriedadeEndereco"
                        value={selectedProdutor.propriedade.endereco}
                        onChange={(e) =>
                          !viewMode &&
                          setSelectedProdutor({
                            ...selectedProdutor,
                            propriedade: {
                              ...selectedProdutor.propriedade,
                              endereco: e.target.value,
                            }
                          })
                        }
                        disabled={viewMode}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Tipos de Produção</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {tiposProducaoOptions.map((tipo) => (
                      <div key={tipo} className="flex items-center space-x-2">
                        <Checkbox
                          id={tipo}
                          checked={selectedProdutor.tipoProducao.includes(tipo)}
                          onCheckedChange={(checked) => {
                            if (!viewMode) {
                              if (checked) {
                                setSelectedProdutor({
                                  ...selectedProdutor,
                                  tipoProducao: [...selectedProdutor.tipoProducao, tipo]
                                });
                              } else {
                                setSelectedProdutor({
                                  ...selectedProdutor,
                                  tipoProducao: selectedProdutor.tipoProducao.filter(t => t !== tipo)
                                });
                              }
                            }
                          }}
                          disabled={viewMode}
                        />
                        <Label htmlFor={tipo} className="text-sm">{tipo}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedProdutor.status}
                    onValueChange={(value: 'ativo' | 'inativo' | 'pendente') =>
                      !viewMode &&
                      setSelectedProdutor({
                        ...selectedProdutor,
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
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={selectedProdutor.observacoes || ""}
                    onChange={(e) =>
                      !viewMode &&
                      setSelectedProdutor({
                        ...selectedProdutor,
                        observacoes: e.target.value,
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
                    <Button onClick={handleSaveProdutor}>Salvar</Button>
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

export default CadastroProdutores;
