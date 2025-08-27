import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock
} from "lucide-react";
import { PontoCritico } from "@/types/seguranca-publica";

const mockPontosCriticos: PontoCritico[] = [
  {
    id: "1",
    nome: "Praça Central",
    tipo: "alto_risco",
    coordenadas: { lat: -23.5505, lng: -46.6333 },
    endereco: "Praça Central, Centro",
    descricao: "Local com alta incidência de furtos e perturbação da ordem",
    tiposOcorrencia: ["furto", "perturbacao", "vandalismo"],
    frequencia: "diaria",
    horariosCriticos: ["18:00-22:00", "02:00-06:00"],
    medidasPreventivas: [
      "Patrulhamento reforçado no período noturno",
      "Instalação de câmeras de segurança",
      "Iluminação melhorada"
    ],
    statusMonitoramento: "ativo",
    ultimaAtualizacao: "2024-01-15T10:00:00",
    historico: [
      {
        data: "2024-01-10",
        evento: "Furto de celular",
        observacao: "Vítima abordada por dois indivíduos"
      },
      {
        data: "2024-01-08",
        evento: "Perturbação da ordem",
        observacao: "Grupo causando distúrbios na praça"
      }
    ]
  },
  {
    id: "2",
    nome: "Terminal Rodoviário",
    tipo: "medio_risco",
    coordenadas: { lat: -23.5515, lng: -46.6343 },
    endereco: "Av. Principal, 500",
    descricao: "Movimentação intensa, casos esporádicos de furto",
    tiposOcorrencia: ["furto", "roubo"],
    frequencia: "semanal",
    horariosCriticos: ["06:00-09:00", "17:00-20:00"],
    medidasPreventivas: [
      "Presença da Guarda Municipal",
      "Câmeras de monitoramento",
      "Comunicação via rádio"
    ],
    statusMonitoramento: "ativo",
    ultimaAtualizacao: "2024-01-12T14:30:00",
    historico: [
      {
        data: "2024-01-05",
        evento: "Tentativa de furto",
        observacao: "Suspeito detido pela segurança"
      }
    ]
  }
];

const MapaPontosCriticos: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPonto, setSelectedPonto] = useState<PontoCritico | null>(null);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "alto_risco": return "bg-red-500 text-white";
      case "medio_risco": return "bg-yellow-500 text-white";
      case "baixo_risco": return "bg-green-500 text-white";
      case "atencao_especial": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      alto_risco: "Alto Risco",
      medio_risco: "Médio Risco",
      baixo_risco: "Baixo Risco",
      atencao_especial: "Atenção Especial"
    };
    return labels[tipo] || tipo;
  };

  const getFrequenciaLabel = (frequencia: string) => {
    const labels: { [key: string]: string } = {
      diaria: "Diária",
      semanal: "Semanal",
      mensal: "Mensal",
      esporadica: "Esporádica"
    };
    return labels[frequencia] || frequencia;
  };

  const filteredPontos = mockPontosCriticos.filter(ponto => {
    const matchesSearch = searchTerm === "" || 
      ponto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ponto.endereco.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = tipoFilter === "all" || ponto.tipo === tipoFilter;
    const matchesStatus = statusFilter === "all" || ponto.statusMonitoramento === statusFilter;
    
    return matchesSearch && matchesTipo && matchesStatus;
  });

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <MapPin className="mr-3 h-8 w-8 text-red-600" />
              Mapa de Pontos Críticos
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitore e gerencie pontos críticos de segurança
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Ponto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Ponto Crítico</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Local</Label>
                  <Input id="nome" placeholder="Nome identificativo do local" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Risco</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alto_risco">Alto Risco</SelectItem>
                      <SelectItem value="medio_risco">Médio Risco</SelectItem>
                      <SelectItem value="baixo_risco">Baixo Risco</SelectItem>
                      <SelectItem value="atencao_especial">Atenção Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input id="endereco" placeholder="Endereço completo" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <textarea
                    id="descricao"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Descreva as características do ponto crítico..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequencia">Frequência de Ocorrências</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diaria">Diária</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="esporadica">Esporádica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horarios">Horários Críticos</Label>
                  <Input id="horarios" placeholder="Ex: 18:00-22:00" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancelar</Button>
                <Button className="bg-red-600 hover:bg-red-700">Adicionar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Alto Risco</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Médio Risco</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Baixo Risco</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Monitorados</p>
                  <p className="text-2xl font-bold">25</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="alto_risco">Alto Risco</SelectItem>
                  <SelectItem value="medio_risco">Médio Risco</SelectItem>
                  <SelectItem value="baixo_risco">Baixo Risco</SelectItem>
                  <SelectItem value="atencao_especial">Atenção Especial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filtros Avançados
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mapa Interativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 font-medium">Mapa Interativo</p>
                  <p className="text-sm text-gray-400">
                    Visualização dos pontos críticos no mapa da cidade
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Pontos Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredPontos.map((ponto) => (
                  <div
                    key={ponto.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedPonto(ponto)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{ponto.nome}</h3>
                          <Badge className={getTipoColor(ponto.tipo)}>
                            {getTipoLabel(ponto.tipo)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {ponto.endereco}
                        </p>
                        <p className="text-sm">{ponto.descricao}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Frequência: {getFrequenciaLabel(ponto.frequencia)}</span>
                          <span>
                            Última atualização: {new Date(ponto.ultimaAtualizacao).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedPonto && (
          <Dialog open={!!selectedPonto} onOpenChange={() => setSelectedPonto(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Detalhes do Ponto Crítico - {selectedPonto.nome}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Localização</Label>
                    <p className="text-sm flex items-center">
                      <MapPin className="mr-1 h-3 w-3" />
                      {selectedPonto.endereco}
                    </p>
                  </div>
                  <div>
                    <Label>Tipo de Risco</Label>
                    <Badge className={getTipoColor(selectedPonto.tipo)}>
                      {getTipoLabel(selectedPonto.tipo)}
                    </Badge>
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedPonto.descricao}</p>
                  </div>
                  <div>
                    <Label>Tipos de Ocorrência</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPonto.tiposOcorrencia.map((tipo, index) => (
                        <Badge key={index} variant="outline">{tipo}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Frequência</Label>
                    <p className="text-sm">{getFrequenciaLabel(selectedPonto.frequencia)}</p>
                  </div>
                  {selectedPonto.horariosCriticos && (
                    <div>
                      <Label>Horários Críticos</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPonto.horariosCriticos.map((horario, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {horario}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Medidas Preventivas</Label>
                    <ul className="text-sm bg-gray-50 p-3 rounded space-y-1">
                      {selectedPonto.medidasPreventivas.map((medida, index) => (
                        <li key={index}>• {medida}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Label>Status de Monitoramento</Label>
                    <Badge 
                      className={selectedPonto.statusMonitoramento === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {selectedPonto.statusMonitoramento}
                    </Badge>
                  </div>
                  <div>
                    <Label>Histórico Recente</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                      {selectedPonto.historico.map((evento, index) => (
                        <div key={index} className="border-b pb-2 mb-2 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{evento.evento}</span>
                            <span className="text-xs text-muted-foreground">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {new Date(evento.data).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{evento.observacao}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedPonto(null)}>
                  Fechar
                </Button>
                <Button className="bg-red-600 hover:bg-red-700">
                  Editar Ponto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    
  );
};

export default MapaPontosCriticos;
