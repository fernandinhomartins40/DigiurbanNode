
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
  Camera, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  MapPin, 
  Calendar,
  User,
  Phone,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { ProblemaFoto } from "@/types/servicos-publicos";

const ProblemasComFoto: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const problemas: ProblemaFoto[] = [
    {
      id: "1",
      protocolo: "PF-2024-001",
      categoria: "iluminacao",
      descricao: "Poste de iluminação danificado após temporal",
      localizacao: {
        endereco: "Rua das Flores, 123",
        bairro: "Centro",
        coordenadas: { latitude: -23.5505, longitude: -46.6333 }
      },
      status: "em_analise",
      prioridade: "alta",
      cidadao: {
        nome: "João Silva",
        telefone: "(11) 99999-9999",
        email: "joao@email.com"
      },
      fotos: [
        {
          url: "https://example.com/foto1.jpg",
          legenda: "Poste danificado",
          data: "2024-01-15"
        }
      ],
      dataReporte: "2024-01-15",
      responsavel: "Equipe Iluminação A",
      custoEstimado: 850,
      observacoes: "Necessário substituição completa do poste"
    },
    {
      id: "2",
      protocolo: "PF-2024-002",
      categoria: "calcada",
      descricao: "Buraco grande na calçada causando risco aos pedestres",
      localizacao: {
        endereco: "Av. Central, 456",
        bairro: "Vila Nova",
        coordenadas: { latitude: -23.5520, longitude: -46.6350 }
      },
      status: "resolvido",
      prioridade: "urgente",
      cidadao: {
        nome: "Maria Santos",
        telefone: "(11) 88888-8888",
        email: "maria@email.com"
      },
      fotos: [
        {
          url: "https://example.com/foto2.jpg",
          legenda: "Buraco na calçada",
          data: "2024-01-14"
        },
        {
          url: "https://example.com/foto3.jpg",
          legenda: "Calçada reparada",
          data: "2024-01-16"
        }
      ],
      dataReporte: "2024-01-14",
      dataResolucao: "2024-01-16",
      responsavel: "Equipe Obras B",
      custoEstimado: 450,
      solucao: "Reparo da calçada com massa asfáltica",
      observacoes: "Problema resolvido em 2 dias"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reportado": return "bg-blue-100 text-blue-800";
      case "em_analise": return "bg-yellow-100 text-yellow-800";
      case "agendado": return "bg-purple-100 text-purple-800";
      case "resolvido": return "bg-green-100 text-green-800";
      case "nao_procede": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case "baixa": return "bg-green-100 text-green-800";
      case "media": return "bg-yellow-100 text-yellow-800";
      case "alta": return "bg-orange-100 text-orange-800";
      case "urgente": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case "iluminacao": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "limpeza": return <AlertTriangle className="h-4 w-4 text-green-600" />;
      case "calcada": return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      case "sinalizacao": return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case "esgoto": return <AlertTriangle className="h-4 w-4 text-brown-600" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredProblemas = problemas.filter(problema => {
    const matchesSearch = problema.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problema.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problema.cidadao.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "todos" || problema.status === selectedStatus;
    const matchesCategory = selectedCategory === "todos" || problema.categoria === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Camera className="mr-3 h-8 w-8" />
              Problemas com Foto
            </h1>
            <p className="text-gray-600">Reporte e acompanhe problemas urbanos com evidências fotográficas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Reportar Problema
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Reportar Novo Problema</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iluminacao">Iluminação</SelectItem>
                        <SelectItem value="limpeza">Limpeza</SelectItem>
                        <SelectItem value="calcada">Calçada</SelectItem>
                        <SelectItem value="sinalizacao">Sinalização</SelectItem>
                        <SelectItem value="esgoto">Esgoto</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição do Problema</Label>
                  <Textarea id="descricao" placeholder="Descreva detalhadamente o problema encontrado" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Localização</Label>
                  <Input id="endereco" placeholder="Endereço onde está localizado o problema" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Seu Nome</Label>
                    <Input id="nome" placeholder="Nome completo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fotos">Fotos do Problema</Label>
                  <Input id="fotos" type="file" multiple accept="image/*" />
                  <p className="text-xs text-gray-600">Selecione até 5 fotos do problema</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Enviar Reporte
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
                    placeholder="Buscar por protocolo, descrição ou nome..."
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
                    <SelectItem value="reportado">Reportado</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="resolvido">Resolvido</SelectItem>
                    <SelectItem value="nao_procede">Não Procede</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Categorias</SelectItem>
                    <SelectItem value="iluminacao">Iluminação</SelectItem>
                    <SelectItem value="limpeza">Limpeza</SelectItem>
                    <SelectItem value="calcada">Calçada</SelectItem>
                    <SelectItem value="sinalizacao">Sinalização</SelectItem>
                    <SelectItem value="esgoto">Esgoto</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="problemas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="problemas">Problemas Reportados</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="mapa">Mapa de Problemas</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="problemas">
            <div className="grid gap-4">
              {filteredProblemas.map((problema) => (
                <Card key={problema.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(problema.categoria)}
                          <div>
                            <h3 className="font-semibold">{problema.protocolo}</h3>
                            <p className="text-sm text-gray-600">{problema.categoria}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(problema.status)}>
                          {problema.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(problema.prioridade)}>
                          {problema.prioridade}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          <Camera className="mr-1 h-3 w-3" />
                          {problema.fotos.length} foto(s)
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Button>
                        {problema.status === "resolvido" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Resolvido
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="mr-2 h-4 w-4" />
                          {problema.cidadao.nome}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="mr-2 h-4 w-4" />
                          {problema.cidadao.telefone}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {problema.localizacao.endereco}
                        </div>
                        <p className="text-sm text-gray-600">{problema.localizacao.bairro}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Data do Reporte</p>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(problema.dataReporte).toLocaleDateString()}
                        </div>
                        {problema.dataResolucao && (
                          <p className="text-sm text-green-600">
                            Resolvido: {new Date(problema.dataResolucao).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Responsável</p>
                        <p className="text-sm">{problema.responsavel || "Não atribuído"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Custo Estimado</p>
                        <p className="text-sm">
                          {problema.custoEstimado ? `R$ ${problema.custoEstimado}` : "Não informado"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-600 mb-1">Descrição:</p>
                      <p className="text-sm text-gray-700">{problema.descricao}</p>
                    </div>

                    {problema.solucao && (
                      <div className="mb-3 p-3 bg-green-50 rounded-md">
                        <p className="text-sm font-medium text-green-800 mb-1">Solução:</p>
                        <p className="text-sm text-green-700">{problema.solucao}</p>
                      </div>
                    )}

                    {problema.observacoes && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-600 mb-1">Observações:</p>
                        <p className="text-sm text-gray-700">{problema.observacoes}</p>
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
                  <CardTitle className="text-sm font-medium">Total de Reportes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">234</p>
                  <p className="text-xs text-gray-600">Este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">45</p>
                  <p className="text-xs text-gray-600">19.2% do total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">178</p>
                  <p className="text-xs text-gray-600">76.1% do total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">2.8 dias</p>
                  <p className="text-xs text-gray-600">Para resolução</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Problemas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Iluminação</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '35%'}}></div>
                        </div>
                        <span className="text-sm font-medium">82</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Calçada</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-500 h-2 rounded-full" style={{width: '30%'}}></div>
                        </div>
                        <span className="text-sm font-medium">70</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Limpeza</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                        <span className="text-sm font-medium">58</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolução por Prioridade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Urgente</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{width: '95%'}}></div>
                        </div>
                        <span className="text-sm font-medium">95%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Alta</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{width: '87%'}}></div>
                        </div>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Média/Baixa</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
                        </div>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mapa">
            <Card className="h-[600px]">
              <CardContent className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Mapa de Problemas</h3>
                  <p className="text-gray-600">
                    Visualização geográfica dos problemas reportados pela população
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estatisticas">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Estatísticas de Atendimento</h3>
                  <p className="text-gray-600">
                    Análise detalhada dos problemas reportados e índices de resolução
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default ProblemasComFoto;
