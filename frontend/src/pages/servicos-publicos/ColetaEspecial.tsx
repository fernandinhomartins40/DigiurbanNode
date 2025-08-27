
import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Recycle, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  MapPin, 
  Calendar,
  Truck,
  Package,
  DollarSign
} from "lucide-react";
import { ColetaEspecial as ColetaEspecialType } from "@/types/servicos-publicos";

const ColetaEspecial: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const coletas: ColetaEspecialType[] = [
    {
      id: "1",
      numeroColeta: "CE-2024-001",
      tipoMaterial: "eletronicos",
      solicitante: {
        nome: "João Silva",
        cpf: "123.456.789-00",
        telefone: "(11) 99999-9999",
        email: "joao@email.com"
      },
      localizacao: {
        endereco: "Rua das Flores, 123",
        bairro: "Centro",
        coordenadas: { latitude: -23.5505, longitude: -46.6333 }
      },
      status: "agendado",
      agendamento: {
        dataAgendada: "2024-01-18",
        horaInicio: "08:00",
        horaFim: "12:00"
      },
      equipe: {
        responsavel: "Carlos Lima",
        veiculo: "Caminhão - ABC-1234",
        membros: ["Ana Santos", "Pedro Costa"]
      },
      quantidadeEstimada: 150,
      unidade: "kg",
      destino: "Cooperativa de Reciclagem EcoTech",
      custo: {
        transporte: 80,
        destinacao: 45,
        total: 125
      },
      dataSolicitacao: "2024-01-15",
      fotos: [],
      observacoes: "Coleta de equipamentos eletrônicos antigos"
    },
    {
      id: "2",
      numeroColeta: "CE-2024-002",
      tipoMaterial: "moveis",
      solicitante: {
        nome: "Maria Santos",
        cpf: "987.654.321-00",
        telefone: "(11) 88888-8888",
        email: "maria@email.com"
      },
      localizacao: {
        endereco: "Av. Central, 456",
        bairro: "Vila Nova",
        coordenadas: { latitude: -23.5520, longitude: -46.6350 }
      },
      status: "coletado",
      agendamento: {
        dataAgendada: "2024-01-16",
        horaInicio: "14:00",
        horaFim: "16:00"
      },
      equipe: {
        responsavel: "Roberto Silva",
        veiculo: "Caminhão - XYZ-5678",
        membros: ["José Costa", "Antonio Lima"]
      },
      quantidadeEstimada: 300,
      quantidadeColetada: 280,
      unidade: "kg",
      destino: "Aterro Sanitário Municipal",
      custo: {
        transporte: 120,
        destinacao: 60,
        total: 180
      },
      dataSolicitacao: "2024-01-14",
      dataColeta: "2024-01-16",
      fotos: [],
      observacoes: "Coleta de móveis usados"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "solicitado": return "bg-blue-100 text-blue-800";
      case "agendado": return "bg-yellow-100 text-yellow-800";
      case "coletado": return "bg-green-100 text-green-800";
      case "cancelado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getMaterialIcon = (material: string) => {
    switch (material) {
      case "eletronicos": return <Package className="h-4 w-4 text-blue-600" />;
      case "moveis": return <Package className="h-4 w-4 text-brown-600" />;
      case "entulho": return <Package className="h-4 w-4 text-gray-600" />;
      case "podas": return <Package className="h-4 w-4 text-green-600" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const filteredColetas = coletas.filter(coleta => {
    const matchesSearch = coleta.numeroColeta.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coleta.solicitante.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coleta.localizacao.endereco.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "todos" || coleta.status === selectedStatus;
    const matchesMaterial = selectedMaterial === "todos" || coleta.tipoMaterial === selectedMaterial;
    return matchesSearch && matchesStatus && matchesMaterial;
  });

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Recycle className="mr-3 h-8 w-8" />
              Coleta Especial
            </h1>
            <p className="text-gray-600">Gerencie coletas especiais de materiais recicláveis</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Coleta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Solicitação de Coleta Especial</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="solicitante">Nome do Solicitante</Label>
                    <Input id="solicitante" placeholder="Nome completo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoMaterial">Tipo de Material</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                      <SelectItem value="moveis">Móveis</SelectItem>
                      <SelectItem value="entulho">Entulho</SelectItem>
                      <SelectItem value="podas">Podas</SelectItem>
                      <SelectItem value="oleo">Óleo</SelectItem>
                      <SelectItem value="baterias">Baterias</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço para Coleta</Label>
                  <Input id="endereco" placeholder="Endereço completo" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade Estimada</Label>
                    <Input id="quantidade" type="number" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unidade">Unidade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                        <SelectItem value="ton">Toneladas (ton)</SelectItem>
                        <SelectItem value="m3">Metros cúbicos (m³)</SelectItem>
                        <SelectItem value="unidades">Unidades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" placeholder="Detalhes sobre o material a ser coletado" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Solicitar Coleta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <CardTitle>Filtros e Busca</CardTitle>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por número, solicitante ou endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full md:w-80"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="solicitado">Solicitado</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="coletado">Coletado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Materiais</SelectItem>
                    <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                    <SelectItem value="moveis">Móveis</SelectItem>
                    <SelectItem value="entulho">Entulho</SelectItem>
                    <SelectItem value="podas">Podas</SelectItem>
                    <SelectItem value="oleo">Óleo</SelectItem>
                    <SelectItem value="baterias">Baterias</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="coletas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="coletas">Coletas Especiais</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="rotas">Rotas de Coleta</TabsTrigger>
            <TabsTrigger value="destinacao">Destinação</TabsTrigger>
          </TabsList>

          <TabsContent value="coletas">
            <div className="grid gap-4">
              {filteredColetas.map((coleta) => (
                <Card key={coleta.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getMaterialIcon(coleta.tipoMaterial)}
                          <div>
                            <h3 className="font-semibold">{coleta.numeroColeta}</h3>
                            <p className="text-sm text-gray-600">{coleta.tipoMaterial}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(coleta.status)}>
                          {coleta.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Solicitante</p>
                        <p className="text-sm">{coleta.solicitante.nome}</p>
                        <p className="text-sm text-gray-600">{coleta.solicitante.telefone}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {coleta.localizacao.endereco}
                        </div>
                        <p className="text-sm text-gray-600">{coleta.localizacao.bairro}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Agendamento</p>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(coleta.agendamento.dataAgendada).toLocaleDateString()}
                        </div>
                        <p className="text-sm text-gray-600">
                          {coleta.agendamento.horaInicio} - {coleta.agendamento.horaFim}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Quantidade</p>
                        <p className="text-sm">{coleta.quantidadeEstimada} {coleta.unidade}</p>
                        {coleta.quantidadeColetada && (
                          <p className="text-sm text-green-600">
                            Coletado: {coleta.quantidadeColetada} {coleta.unidade}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Custo</p>
                        <div className="flex items-center text-sm">
                          <DollarSign className="mr-2 h-4 w-4" />
                          R$ {coleta.custo.total}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Truck className="mr-2 h-4 w-4" />
                          {coleta.equipe.responsavel}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm"><strong>Destino:</strong> {coleta.destino}</p>
                      {coleta.observacoes && (
                        <p className="text-sm text-gray-700 mt-1">{coleta.observacoes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Coletas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">186</p>
                  <p className="text-xs text-gray-600">Este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">23</p>
                  <p className="text-xs text-gray-600">Para os próximos 7 dias</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Material Coletado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">12.8 ton</p>
                  <p className="text-xs text-gray-600">+15% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Economia Ambiental</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">89%</p>
                  <p className="text-xs text-gray-600">Material reciclado</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Materiais Mais Coletados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Eletrônicos</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '35%'}}></div>
                        </div>
                        <span className="text-sm font-medium">4.5 ton</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Móveis</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{width: '30%'}}></div>
                        </div>
                        <span className="text-sm font-medium">3.8 ton</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Podas</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                        <span className="text-sm font-medium">3.2 ton</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Destinação dos Materiais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Reciclagem</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                        </div>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Reutilização</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '15%'}}></div>
                        </div>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Descarte Seguro</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '10%'}}></div>
                        </div>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rotas">
            <Card>
              <CardHeader>
                <CardTitle>Rotas de Coleta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Truck className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Otimização de Rotas</h3>
                  <p className="text-gray-600">
                    Visualize e otimize as rotas de coleta especial
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destinacao">
            <Card>
              <CardHeader>
                <CardTitle>Pontos de Destinação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Recycle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Pontos de Destinação</h3>
                  <p className="text-gray-600">
                    Gerencie os pontos de destinação dos materiais coletados
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default ColetaEspecial;
