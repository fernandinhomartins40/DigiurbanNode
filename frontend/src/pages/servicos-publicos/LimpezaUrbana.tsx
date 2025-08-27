
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
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  MapPin, 
  Calendar,
  Users,
  Clock,
  Camera,
  CheckCircle
} from "lucide-react";
import { ServicoLimpeza } from "@/types/servicos-publicos";

const LimpezaUrbana: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedType, setSelectedType] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const servicosLimpeza: ServicoLimpeza[] = [
    {
      id: "1",
      numeroOS: "LU-2024-001",
      tipo: "varracao",
      area: {
        endereco: "Rua das Flores - Centro",
        bairro: "Centro",
        coordenadas: { latitude: -23.5505, longitude: -46.6333 },
        tamanho: 500
      },
      status: "em_execucao",
      frequencia: "diaria",
      equipe: {
        responsavel: "João Silva",
        membros: ["Maria Santos", "Pedro Costa"],
        equipamentos: ["Vassouras", "Carrinhos", "Sacos de lixo"]
      },
      agendamento: {
        dataAgendada: "2024-01-16",
        horaInicio: "06:00",
        horaFim: "10:00"
      },
      custo: {
        valorEstimado: 300,
        valorReal: 280,
        materiais: [
          { item: "Sacos de lixo", quantidade: 20, valor: 40 },
          { item: "Combustível", quantidade: 1, valor: 240 }
        ]
      },
      dataAbertura: "2024-01-15",
      fotos: [],
      observacoes: "Serviço de varrição da rua principal"
    },
    {
      id: "2",
      numeroOS: "LU-2024-002",
      tipo: "limpeza_terreno",
      area: {
        endereco: "Terreno baldio - Av. Central",
        bairro: "Vila Nova",
        coordenadas: { latitude: -23.5520, longitude: -46.6350 },
        tamanho: 2000
      },
      status: "agendado",
      frequencia: "eventual",
      equipe: {
        responsavel: "Carlos Lima",
        membros: ["Ana Silva", "Roberto Santos", "José Costa"],
        equipamentos: ["Roçadeiras", "Caminhão", "Ferramentas"]
      },
      agendamento: {
        dataAgendada: "2024-01-18",
        horaInicio: "07:00",
        horaFim: "16:00"
      },
      custo: {
        valorEstimado: 1200,
        materiais: [
          { item: "Combustível", quantidade: 2, valor: 400 },
          { item: "Mão de obra", quantidade: 8, valor: 800 }
        ]
      },
      dataAbertura: "2024-01-14",
      fotos: [],
      observacoes: "Limpeza completa do terreno com remoção de entulho"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado": return "bg-blue-100 text-blue-800";
      case "em_execucao": return "bg-yellow-100 text-yellow-800";
      case "concluido": return "bg-green-100 text-green-800";
      case "cancelado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "varracao": return <Trash2 className="h-4 w-4 text-blue-600" />;
      case "capinacao": return <Trash2 className="h-4 w-4 text-green-600" />;
      case "limpeza_terreno": return <Trash2 className="h-4 w-4 text-orange-600" />;
      case "remocao_entulho": return <Trash2 className="h-4 w-4 text-red-600" />;
      default: return <Trash2 className="h-4 w-4" />;
    }
  };

  const filteredServicos = servicosLimpeza.filter(servico => {
    const matchesSearch = servico.numeroOS.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.area.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.area.bairro.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "todos" || servico.status === selectedStatus;
    const matchesType = selectedType === "todos" || servico.tipo === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Trash2 className="mr-3 h-8 w-8" />
              Limpeza Urbana
            </h1>
            <p className="text-gray-600">Gerencie serviços de limpeza e manutenção urbana</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Ordem de Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Ordem de Serviço - Limpeza</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Serviço</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="varracao">Varrição</SelectItem>
                        <SelectItem value="capinacao">Capinação</SelectItem>
                        <SelectItem value="limpeza_terreno">Limpeza de Terreno</SelectItem>
                        <SelectItem value="remocao_entulho">Remoção de Entulho</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequencia">Frequência</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diaria">Diária</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="eventual">Eventual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço/Local</Label>
                  <Input id="endereco" placeholder="Endereço onde será realizado o serviço" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" placeholder="Bairro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tamanho">Área (m²)</Label>
                    <Input id="tamanho" type="number" placeholder="1000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataAgendada">Data Agendada</Label>
                    <Input id="dataAgendada" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input id="responsavel" placeholder="Nome do responsável" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" placeholder="Observações sobre o serviço" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Criar Ordem de Serviço
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
                    placeholder="Buscar por OS, endereço ou bairro..."
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
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="em_execucao">Em Execução</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="varracao">Varrição</SelectItem>
                    <SelectItem value="capinacao">Capinação</SelectItem>
                    <SelectItem value="limpeza_terreno">Limpeza de Terreno</SelectItem>
                    <SelectItem value="remocao_entulho">Remoção de Entulho</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="servicos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="servicos">Ordens de Serviço</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="equipes">Equipes</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>

          <TabsContent value="servicos">
            <div className="grid gap-4">
              {filteredServicos.map((servico) => (
                <Card key={servico.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(servico.tipo)}
                          <div>
                            <h3 className="font-semibold">{servico.numeroOS}</h3>
                            <p className="text-sm text-gray-600">{servico.tipo.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(servico.status)}>
                          {servico.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {servico.frequencia}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Camera className="mr-2 h-4 w-4" />
                          Fotos
                        </Button>
                        {servico.status === "em_execucao" && (
                          <Button size="sm">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Concluir
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {servico.area.endereco}
                        </div>
                        <p className="text-sm text-gray-600">{servico.area.bairro}</p>
                        <p className="text-sm text-gray-600">{servico.area.tamanho}m²</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Agendamento</p>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(servico.agendamento.dataAgendada).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-2 h-4 w-4" />
                          {servico.agendamento.horaInicio} - {servico.agendamento.horaFim}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Equipe</p>
                        <div className="flex items-center text-sm">
                          <Users className="mr-2 h-4 w-4" />
                          {servico.equipe.responsavel}
                        </div>
                        <p className="text-sm text-gray-600">{servico.equipe.membros.length} membros</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Custo</p>
                        <p className="text-sm">R$ {servico.custo.valorEstimado}</p>
                        {servico.custo.valorReal && (
                          <p className="text-sm text-green-600">Real: R$ {servico.custo.valorReal}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Abertura</p>
                        <p className="text-sm">{new Date(servico.dataAbertura).toLocaleDateString()}</p>
                        {servico.dataConclusao && (
                          <p className="text-sm text-green-600">
                            Concluído: {new Date(servico.dataConclusao).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {servico.observacoes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{servico.observacoes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">342</p>
                  <p className="text-xs text-gray-600">Este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Em Execução</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">28</p>
                  <p className="text-xs text-gray-600">8.2% do total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">298</p>
                  <p className="text-xs text-gray-600">87.1% do total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Custo Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">R$ 89,450</p>
                  <p className="text-xs text-gray-600">-5% vs mês anterior</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Serviços por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Varrição</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                        <span className="text-sm font-medium">154</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Limpeza de Terreno</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{width: '30%'}}></div>
                        </div>
                        <span className="text-sm font-medium">103</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Capinação</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                        <span className="text-sm font-medium">85</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Frequência dos Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Diária</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                        <span className="text-sm font-medium">205</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Eventual</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                        <span className="text-sm font-medium">86</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Semanal</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '15%'}}></div>
                        </div>
                        <span className="text-sm font-medium">51</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipes">
            <Card>
              <CardHeader>
                <CardTitle>Equipes de Limpeza</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Gerenciamento de Equipes</h3>
                  <p className="text-gray-600">
                    Visualize e gerencie as equipes de limpeza urbana
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agenda">
            <Card>
              <CardHeader>
                <CardTitle>Agenda de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Agenda de Serviços</h3>
                  <p className="text-gray-600">
                    Visualize e gerencie a agenda de serviços de limpeza
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default LimpezaUrbana;
