
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EntregaEmergencial, Item } from "@/types/assistencia-social";
import { Search, Plus, TruckIcon, MapPin, Calendar, Clock, Package, AlertCircle, User, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockEntregasEmergenciais: EntregaEmergencial[] = [
  {
    id: "1",
    familia: "Família Silva",
    enderecoEntrega: "Rua das Flores, 123 - Centro",
    itens: [
      { id: "101", nome: "Arroz 5kg", quantidade: 2, tipo: "alimento" },
      { id: "102", nome: "Feijão 1kg", quantidade: 4, tipo: "alimento" },
      { id: "103", nome: "Óleo de soja", quantidade: 2, tipo: "alimento" },
      { id: "104", nome: "Sabão em pó", quantidade: 1, tipo: "limpeza" },
      { id: "105", nome: "Sabonete", quantidade: 5, tipo: "higiene" }
    ],
    dataEntrega: "2023-05-15T10:30:00",
    status: "entregue",
    responsavelEntrega: "Carlos Santos",
    observacoes: "Entrega realizada sem intercorrências",
    motivoSolicitacao: "Situação de vulnerabilidade temporária por perda de emprego"
  },
  {
    id: "2",
    familia: "Família Oliveira",
    enderecoEntrega: "Av. Principal, 456 - Vila Nova",
    itens: [
      { id: "201", nome: "Arroz 5kg", quantidade: 2, tipo: "alimento" },
      { id: "202", nome: "Feijão 1kg", quantidade: 4, tipo: "alimento" },
      { id: "203", nome: "Leite em pó", quantidade: 2, tipo: "alimento" },
      { id: "204", nome: "Fraldas infantis", quantidade: 2, tipo: "higiene" }
    ],
    dataEntrega: "2023-05-18T14:00:00",
    status: "em rota",
    responsavelEntrega: "Marcos Rodrigues",
    motivoSolicitacao: "Situação de vulnerabilidade por nascimento de filho"
  },
  {
    id: "3",
    familia: "Família Santos",
    enderecoEntrega: "Rua dos Pinheiros, 789 - Jardim América",
    itens: [
      { id: "301", nome: "Arroz 5kg", quantidade: 1, tipo: "alimento" },
      { id: "302", nome: "Feijão 1kg", quantidade: 2, tipo: "alimento" },
      { id: "303", nome: "Macarrão", quantidade: 2, tipo: "alimento" },
      { id: "304", nome: "Óleo de soja", quantidade: 1, tipo: "alimento" },
      { id: "305", nome: "Açúcar", quantidade: 1, tipo: "alimento" },
      { id: "306", nome: "Material escolar", quantidade: 1, tipo: "outro" }
    ],
    dataEntrega: "2023-05-20T09:00:00",
    status: "aprovada",
    motivoSolicitacao: "Família em situação de extrema pobreza com crianças em idade escolar"
  },
  {
    id: "4",
    familia: "Família Pereira",
    enderecoEntrega: "Rua dos Ipês, 101 - Jardim das Flores",
    itens: [
      { id: "401", nome: "Cobertor", quantidade: 3, tipo: "outro" },
      { id: "402", nome: "Agasalhos", quantidade: 5, tipo: "vestuario" },
      { id: "403", nome: "Alimentos não perecíveis", quantidade: 1, tipo: "alimento" }
    ],
    dataEntrega: "2023-05-10T16:00:00",
    status: "entregue",
    responsavelEntrega: "Ana Lima",
    observacoes: "Família agradeceu muito pelo apoio",
    motivoSolicitacao: "Família afetada por alagamento na região"
  },
  {
    id: "5",
    familia: "Família Costa",
    enderecoEntrega: "Rua das Margaridas, 234 - Centro",
    itens: [
      { id: "501", nome: "Cesta básica completa", quantidade: 1, tipo: "alimento" },
      { id: "502", nome: "Kit higiene", quantidade: 1, tipo: "higiene" },
      { id: "503", nome: "Kit limpeza", quantidade: 1, tipo: "limpeza" }
    ],
    dataEntrega: "2023-05-22T13:30:00",
    status: "separada",
    motivoSolicitacao: "Idoso sem apoio familiar em situação de insegurança alimentar"
  },
  {
    id: "6",
    familia: "Família Rodrigues",
    enderecoEntrega: "Av. das Palmeiras, 567 - Vila São João",
    itens: [
      { id: "601", nome: "Medicamentos", quantidade: 3, tipo: "medicamento" },
      { id: "602", nome: "Alimentos não perecíveis", quantidade: 1, tipo: "alimento" },
      { id: "603", nome: "Material de curativo", quantidade: 1, tipo: "medicamento" }
    ],
    dataEntrega: "2023-05-22T15:00:00",
    status: "solicitada",
    motivoSolicitacao: "Pessoa com deficiência necessitando de cuidados especiais"
  }
];

export default function EntregasEmergenciais() {
  const { toast } = useToast();
  const [entregas, setEntregas] = useState<EntregaEmergencial[]>(mockEntregasEmergenciais);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [entregaSelecionada, setEntregaSelecionada] = useState<EntregaEmergencial | null>(null);
  
  const handleSearch = () => {
    let results = [...mockEntregasEmergenciais];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (entrega) =>
          entrega.familia.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entrega.enderecoEntrega.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entrega.motivoSolicitacao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "todos") {
      results = results.filter(entrega => entrega.status === statusFilter);
    }
    
    setEntregas(results);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "solicitada":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Solicitada</Badge>;
      case "aprovada":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Aprovada</Badge>;
      case "separada":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Separada</Badge>;
      case "em rota":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Em Rota</Badge>;
      case "entregue":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Entregue</Badge>;
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const countItens = (itens: Item[]) => {
    return itens.reduce((total, item) => total + item.quantidade, 0);
  };

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Entregas Emergenciais</h1>
          <div className="flex items-center gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Entrega
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Nova Entrega Emergencial</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para registrar uma nova entrega emergencial.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-center py-8 text-muted-foreground">
                    Formulário de registro será implementado em breve.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    setIsDialogOpen(false);
                    toast({
                      title: "Cadastro em desenvolvimento",
                      description: "O formulário de registro está em implementação."
                    });
                  }}>
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros de Busca</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por família, endereço ou motivo..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select defaultValue="todos" onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status da entrega" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="solicitada">Solicitada</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="separada">Separada</SelectItem>
                  <SelectItem value="em rota">Em Rota</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="andamento" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="andamento">Em Andamento</TabsTrigger>
            <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="andamento" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Família</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entregas.filter(e => e.status !== 'entregue' && e.status !== 'cancelada').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhuma entrega em andamento encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      entregas
                        .filter(e => e.status !== 'entregue' && e.status !== 'cancelada')
                        .map((entrega) => (
                          <TableRow key={entrega.id}>
                            <TableCell>
                              <div className="font-medium">{entrega.familia}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                <span className="text-sm truncate max-w-xs">
                                  {entrega.enderecoEntrega}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatDate(entrega.dataEntrega)}</div>
                              <div className="text-xs text-gray-500">{formatTime(entrega.dataEntrega)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Package className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                <span className="text-sm">{countItens(entrega.itens)} itens</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(entrega.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="mr-2" onClick={() => setEntregaSelecionada(entrega)}>
                                Ver
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {
                                toast({
                                  title: "Atualização de status",
                                  description: `Atualizando status da entrega para ${entrega.familia}`
                                });
                              }}>
                                Atualizar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="concluidas" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Família</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entregas.filter(e => e.status === 'entregue' || e.status === 'cancelada').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhuma entrega concluída encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      entregas
                        .filter(e => e.status === 'entregue' || e.status === 'cancelada')
                        .map((entrega) => (
                          <TableRow key={entrega.id}>
                            <TableCell>
                              <div className="font-medium">{entrega.familia}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                <span className="text-sm truncate max-w-xs">
                                  {entrega.enderecoEntrega}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatDate(entrega.dataEntrega)}</div>
                              <div className="text-xs text-gray-500">{formatTime(entrega.dataEntrega)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Package className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                <span className="text-sm">{countItens(entrega.itens)} itens</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(entrega.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => setEntregaSelecionada(entrega)}>
                                Ver Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="todas" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Família</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entregas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhuma entrega encontrada com os critérios de busca.
                        </TableCell>
                      </TableRow>
                    ) : (
                      entregas.map((entrega) => (
                        <TableRow key={entrega.id}>
                          <TableCell>
                            <div className="font-medium">{entrega.familia}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                              <span className="text-sm truncate max-w-xs">
                                {entrega.enderecoEntrega}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(entrega.dataEntrega)}</div>
                            <div className="text-xs text-gray-500">{formatTime(entrega.dataEntrega)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Package className="h-3.5 w-3.5 mr-1 text-gray-500" />
                              <span className="text-sm">{countItens(entrega.itens)} itens</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(entrega.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="mr-2" onClick={() => setEntregaSelecionada(entrega)}>
                              Ver
                            </Button>
                            {(entrega.status !== 'entregue' && entrega.status !== 'cancelada') && (
                              <Button variant="outline" size="sm" onClick={() => {
                                toast({
                                  title: "Atualização de status",
                                  description: `Atualizando status da entrega para ${entrega.familia}`
                                });
                              }}>
                                Atualizar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {entregaSelecionada && (
          <Dialog open={!!entregaSelecionada} onOpenChange={() => setEntregaSelecionada(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Detalhes da Entrega</DialogTitle>
                  {getStatusBadge(entregaSelecionada.status)}
                </div>
                <DialogDescription>
                  Informações completas da entrega emergencial
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">FAMÍLIA</h3>
                    <p className="text-base font-medium mt-1">{entregaSelecionada.familia}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">DATA DA ENTREGA</h3>
                    <p className="text-base font-medium mt-1">
                      {formatDate(entregaSelecionada.dataEntrega)}, {formatTime(entregaSelecionada.dataEntrega)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">ENDEREÇO</h3>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <p className="text-sm">{entregaSelecionada.enderecoEntrega}</p>
                  </div>
                </div>
                
                {entregaSelecionada.responsavelEntrega && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">RESPONSÁVEL PELA ENTREGA</h3>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <p className="text-sm">{entregaSelecionada.responsavelEntrega}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">MOTIVO DA SOLICITAÇÃO</h3>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    {entregaSelecionada.motivoSolicitacao}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">ITENS DA ENTREGA</h3>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entregaSelecionada.itens.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.nome}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {item.tipo}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{item.quantidade}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2} className="font-medium text-right">
                            Total de itens:
                          </TableCell>
                          <TableCell className="font-medium text-right">
                            {countItens(entregaSelecionada.itens)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {entregaSelecionada.observacoes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">OBSERVAÇÕES</h3>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {entregaSelecionada.observacoes}
                    </p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setEntregaSelecionada(null)}>
                  Fechar
                </Button>
                {(entregaSelecionada.status !== 'entregue' && entregaSelecionada.status !== 'cancelada') && (
                  <Button onClick={() => {
                    toast({
                      title: "Atualização de status",
                      description: `Atualizando status da entrega para ${entregaSelecionada.familia}`
                    });
                    setEntregaSelecionada(null);
                  }}>
                    Atualizar Status
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                Solicitadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {entregas.filter(e => e.status === 'solicitada').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Package className="mr-2 h-5 w-5 text-yellow-500" />
                Separação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {entregas.filter(e => e.status === 'aprovada' || e.status === 'separada').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <TruckIcon className="mr-2 h-5 w-5 text-blue-500" />
                Em Rota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {entregas.filter(e => e.status === 'em rota').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <FileText className="mr-2 h-5 w-5 text-green-500" />
                Entregas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {entregas.filter(e => {
                  const today = new Date().toISOString().split('T')[0];
                  const entregaDate = new Date(e.dataEntrega).toISOString().split('T')[0];
                  return entregaDate === today;
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Entregas</CardTitle>
            <CardDescription>
              Entregas programadas para os próximos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entregas
                .filter(e => e.status !== 'entregue' && e.status !== 'cancelada')
                .slice(0, 3)
                .map((entrega) => (
                  <div key={entrega.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{entrega.familia}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(entrega.dataEntrega)}
                        <Clock className="h-3.5 w-3.5 mx-1" />
                        {formatTime(entrega.dataEntrega)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span className="truncate max-w-xs">
                          {entrega.enderecoEntrega}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(entrega.status)}
                      <Button variant="ghost" size="sm" onClick={() => setEntregaSelecionada(entrega)}>
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}
