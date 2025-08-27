import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, MapPin, Filter, Eye, Building, Construction, Layers } from "lucide-react";
import { ObraPublica } from "@/types/obras-publicas";

const MapaObras: FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("todos");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  // Mock data for obras
  const obras: ObraPublica[] = [
    {
      id: "1",
      numeroContrato: "CT-2024-001",
      nome: "Pavimentação Av. Principal",
      descricao: "Pavimentação asfáltica da Avenida Principal",
      categoria: "pavimentacao",
      tipo: "nova",
      localizacao: {
        endereco: "Avenida Principal, Centro",
        bairro: "Centro",
        coordenadas: { latitude: -23.5505, longitude: -46.6333 },
        area: 2500
      },
      status: "em_andamento",
      contratada: {
        empresa: "Construtora ABC Ltda",
        cnpj: "12.345.678/0001-90",
        responsavelTecnico: "Eng. João Silva",
        telefone: "(11) 3333-3333",
        email: "joao@construtorabc.com"
      },
      orcamento: {
        valorContratado: 850000,
        valorExecutado: 425000,
        fonte: "Recursos Próprios"
      },
      cronograma: {
        dataInicio: "2024-01-15",
        dataPrevisaoTermino: "2024-04-15",
        percentualConcluido: 65
      },
      fiscalizacao: {
        responsavelFiscalizacao: "Eng. Maria Santos"
      },
      documentos: [],
      fotos: [],
      observacoes: "Obra em andamento normal"
    },
    {
      id: "2",
      numeroContrato: "CT-2024-002",
      nome: "Construção Centro de Saúde",
      descricao: "Construção de novo centro de saúde",
      categoria: "edificacao",
      tipo: "nova",
      localizacao: {
        endereco: "Rua da Saúde, 100",
        bairro: "Vila Nova",
        coordenadas: { latitude: -23.5520, longitude: -46.6350 },
        area: 800
      },
      status: "em_andamento",
      contratada: {
        empresa: "Construtora XYZ S.A.",
        cnpj: "98.765.432/0001-10",
        responsavelTecnico: "Eng. Carlos Lima",
        telefone: "(11) 4444-4444",
        email: "carlos@construtorayz.com"
      },
      orcamento: {
        valorContratado: 1200000,
        valorExecutado: 480000,
        fonte: "Convênio Federal"
      },
      cronograma: {
        dataInicio: "2024-02-01",
        dataPrevisaoTermino: "2024-08-01",
        percentualConcluido: 40
      },
      fiscalizacao: {
        responsavelFiscalizacao: "Eng. Pedro Santos"
      },
      documentos: [],
      fotos: [],
      observacoes: "Obra dentro do cronograma"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planejada": return "bg-gray-100 text-gray-800";
      case "licitacao": return "bg-blue-100 text-blue-800";
      case "contratada": return "bg-purple-100 text-purple-800";
      case "em_andamento": return "bg-yellow-100 text-yellow-800";
      case "paralisada": return "bg-red-100 text-red-800";
      case "concluida": return "bg-green-100 text-green-800";
      case "cancelada": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case "edificacao": return <Building className="h-4 w-4" />;
      case "pavimentacao": return <Construction className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const filteredObras = obras.filter(obra => {
    const matchesStatus = selectedFilter === "todos" || obra.status === selectedFilter;
    const matchesCategory = selectedCategory === "todas" || obra.categoria === selectedCategory;
    return matchesStatus && matchesCategory;
  });

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Map className="mr-3 h-8 w-8" />
              Mapa de Obras
            </h1>
            <p className="text-gray-600">Visualize a localização e status das obras públicas</p>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="planejada">Planejada</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="paralisada">Paralisada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Layers className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Categorias</SelectItem>
                <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="edificacao">Edificação</SelectItem>
                <SelectItem value="saneamento">Saneamento</SelectItem>
                <SelectItem value="pavimentacao">Pavimentação</SelectItem>
                <SelectItem value="drenagem">Drenagem</SelectItem>
                <SelectItem value="iluminacao">Iluminação</SelectItem>
                <SelectItem value="paisagismo">Paisagismo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="mapa" className="space-y-4">
          <TabsList>
            <TabsTrigger value="mapa">Visualização em Mapa</TabsTrigger>
            <TabsTrigger value="lista">Lista de Obras</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas por Região</TabsTrigger>
          </TabsList>

          <TabsContent value="mapa">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Mapa (simulado) */}
              <div className="lg:col-span-3">
                <Card className="h-[600px]">
                  <CardContent className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <Map className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Mapa Interativo</h3>
                      <p className="text-gray-600 mb-4">
                        Visualização das obras públicas no mapa da cidade
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>Em Andamento</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Concluída</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            <span>Planejada</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista lateral */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Obras Filtradas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {filteredObras.map((obra) => (
                      <div key={obra.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(obra.categoria)}
                            <h4 className="font-medium text-sm">{obra.nome}</h4>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Badge className={getStatusColor(obra.status)}>
                            {obra.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-gray-600">{obra.localizacao.endereco}</p>
                          <p className="text-xs text-gray-600">
                            Progresso: {obra.cronograma.percentualConcluido}%
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <Eye className="mr-2 h-3 w-3" />
                          Ver no Mapa
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lista">
            <div className="grid gap-4">
              {filteredObras.map((obra) => (
                <Card key={obra.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{obra.nome}</CardTitle>
                        <Badge className={getStatusColor(obra.status)}>
                          {obra.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{obra.categoria}</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <MapPin className="mr-2 h-4 w-4" />
                        Ver no Mapa
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {obra.localizacao.endereco}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="mr-2 h-4 w-4" />
                          {obra.localizacao.bairro}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Contratada</p>
                        <p className="text-sm">{obra.contratada.empresa}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Valor</p>
                        <p className="text-sm">R$ {obra.orcamento.valorContratado.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Progresso</p>
                        <p className="text-sm font-bold">{obra.cronograma.percentualConcluido}%</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-700">{obra.descricao}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="estatisticas">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Obras por Bairro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Centro</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '50%'}}></div>
                        </div>
                        <span className="text-sm font-medium">1</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Vila Nova</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '50%'}}></div>
                        </div>
                        <span className="text-sm font-medium">1</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investimento por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pavimentação</span>
                      <span className="text-sm font-medium">R$ 850.000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Edificação</span>
                      <span className="text-sm font-medium">R$ 1.200.000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progresso Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">52%</p>
                      <p className="text-sm text-gray-600">Progresso Médio</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>2 obras em andamento</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>R$ 2.050.000 investidos</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default MapaObras;
