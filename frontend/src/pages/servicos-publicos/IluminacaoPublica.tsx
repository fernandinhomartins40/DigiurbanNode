
import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Lightbulb, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  MapPin, 
  Zap,
  Calendar,
  DollarSign,
  Settings,
  AlertTriangle
} from "lucide-react";
import { PontoIluminacao } from "@/types/servicos-publicos";

const IluminacaoPublica: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedType, setSelectedType] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const pontosIluminacao: PontoIluminacao[] = [
    {
      id: "1",
      numeroPoste: "P-001",
      tipo: "led",
      potencia: 150,
      localizacao: {
        endereco: "Rua das Flores, 123",
        bairro: "Centro",
        coordenadas: { latitude: -23.5505, longitude: -46.6333 }
      },
      status: "funcionando",
      ultimaManutencao: "2024-01-10",
      proximaManutencao: "2024-04-10",
      consumoMensal: 45,
      custo: {
        instalacao: 2500,
        manutencaoMensal: 120
      },
      problemas: [],
      observacoes: "Poste em bom estado"
    },
    {
      id: "2",
      numeroPoste: "P-002",
      tipo: "sodio",
      potencia: 250,
      localizacao: {
        endereco: "Av. Central, 456",
        bairro: "Vila Nova",
        coordenadas: { latitude: -23.5520, longitude: -46.6350 }
      },
      status: "defeito",
      ultimaManutencao: "2023-12-15",
      proximaManutencao: "2024-02-15",
      consumoMensal: 75,
      custo: {
        instalacao: 1800,
        manutencaoMensal: 150
      },
      problemas: [
        {
          descricao: "Lâmpada queimada",
          data: "2024-01-16",
          resolvido: false
        }
      ],
      observacoes: "Necessita substituição da lâmpada"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "funcionando": return "bg-green-100 text-green-800";
      case "defeito": return "bg-red-100 text-red-800";
      case "manutencao": return "bg-yellow-100 text-yellow-800";
      case "desligado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "led": return <Zap className="h-4 w-4 text-blue-600" />;
      case "sodio": return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case "mercurio": return <Lightbulb className="h-4 w-4 text-purple-600" />;
      case "halogenio": return <Lightbulb className="h-4 w-4 text-orange-600" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const filteredPontos = pontosIluminacao.filter(ponto => {
    const matchesSearch = ponto.numeroPoste.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ponto.localizacao.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ponto.localizacao.bairro.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "todos" || ponto.status === selectedStatus;
    const matchesType = selectedType === "todos" || ponto.tipo === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Lightbulb className="mr-3 h-8 w-8" />
              Iluminação Pública
            </h1>
            <p className="text-gray-600">Gerencie pontos de iluminação da cidade</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Ponto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Ponto de Iluminação</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroPoste">Número do Poste</Label>
                    <Input id="numeroPoste" placeholder="P-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Lâmpada</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="led">LED</SelectItem>
                        <SelectItem value="sodio">Sódio</SelectItem>
                        <SelectItem value="mercurio">Mercúrio</SelectItem>
                        <SelectItem value="halogenio">Halogênio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="potencia">Potência (W)</Label>
                    <Input id="potencia" type="number" placeholder="150" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" placeholder="Centro" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input id="endereco" placeholder="Rua das Flores, 123" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Cadastrar Ponto
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
                    placeholder="Buscar por número, endereço ou bairro..."
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
                    <SelectItem value="funcionando">Funcionando</SelectItem>
                    <SelectItem value="defeito">Com Defeito</SelectItem>
                    <SelectItem value="manutencao">Em Manutenção</SelectItem>
                    <SelectItem value="desligado">Desligado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="led">LED</SelectItem>
                    <SelectItem value="sodio">Sódio</SelectItem>
                    <SelectItem value="mercurio">Mercúrio</SelectItem>
                    <SelectItem value="halogenio">Halogênio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="pontos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pontos">Pontos de Iluminação</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
            <TabsTrigger value="consumo">Consumo</TabsTrigger>
          </TabsList>

          <TabsContent value="pontos">
            <div className="grid gap-4">
              {filteredPontos.map((ponto) => (
                <Card key={ponto.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(ponto.tipo)}
                          <div>
                            <h3 className="font-semibold">{ponto.numeroPoste}</h3>
                            <p className="text-sm text-gray-600">{ponto.tipo.toUpperCase()} - {ponto.potencia}W</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(ponto.status)}>
                          {ponto.status}
                        </Badge>
                        {ponto.problemas.length > 0 && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {ponto.problemas.length} problema(s)
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          Manutenção
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {ponto.localizacao.endereco}
                        </div>
                        <p className="text-sm text-gray-600">{ponto.localizacao.bairro}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Última Manutenção</p>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          {ponto.ultimaManutencao ? new Date(ponto.ultimaManutencao).toLocaleDateString() : "Não registrada"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Próxima Manutenção</p>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          {ponto.proximaManutencao ? new Date(ponto.proximaManutencao).toLocaleDateString() : "Não agendada"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Consumo Mensal</p>
                        <div className="flex items-center text-sm">
                          <Zap className="mr-2 h-4 w-4" />
                          {ponto.consumoMensal} kWh
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Custo Mensal</p>
                        <div className="flex items-center text-sm">
                          <DollarSign className="mr-2 h-4 w-4" />
                          R$ {ponto.custo.manutencaoMensal}
                        </div>
                      </div>
                    </div>
                    {ponto.problemas.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 rounded-md">
                        <p className="text-sm font-medium text-red-800">Problemas Reportados:</p>
                        {ponto.problemas.map((problema, index) => (
                          <p key={index} className="text-sm text-red-700">
                            • {problema.descricao} ({new Date(problema.data).toLocaleDateString()})
                          </p>
                        ))}
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
                  <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-gray-600">+23 novos este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Funcionando</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">1,189</p>
                  <p className="text-xs text-gray-600">95.3% do total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Com Defeito</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">58</p>
                  <p className="text-xs text-gray-600">4.7% do total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Consumo Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">89,450 kWh</p>
                  <p className="text-xs text-gray-600">R$ 35,780 em custos</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <Zap className="mr-2 h-4 w-4 text-blue-600" />
                        LED
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                        <span className="text-sm font-medium">812</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <Lightbulb className="mr-2 h-4 w-4 text-yellow-600" />
                        Sódio
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                        <span className="text-sm font-medium">312</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <Lightbulb className="mr-2 h-4 w-4 text-purple-600" />
                        Mercúrio
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '10%'}}></div>
                        </div>
                        <span className="text-sm font-medium">123</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status dos Pontos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Funcionando</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                        </div>
                        <span className="text-sm font-medium">95.3%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Com Defeito</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{width: '5%'}}></div>
                        </div>
                        <span className="text-sm font-medium">4.7%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manutencao">
            <Card>
              <CardHeader>
                <CardTitle>Agenda de Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Agenda de Manutenção</h3>
                  <p className="text-gray-600">
                    Visualize e gerencie a agenda de manutenção dos pontos de iluminação
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consumo">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Consumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Zap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Análise de Consumo</h3>
                  <p className="text-gray-600">
                    Gráficos e relatórios de consumo energético dos pontos de iluminação
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default IluminacaoPublica;
