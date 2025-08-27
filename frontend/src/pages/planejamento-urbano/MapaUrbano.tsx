
import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Map, Layers, Search, Download, Eye, MapPin, Building, TreeDeciduous, Settings } from "lucide-react";
import { ZonaUrbana, IndicadorUrbano } from "@/types/planejamento-urbano";

const MapaUrbano: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLayer, setSelectedLayer] = useState<string>("zoneamento");
  const [showZoneamento, setShowZoneamento] = useState(true);
  const [showProjetos, setShowProjetos] = useState(false);
  const [showAlvaras, setShowAlvaras] = useState(false);
  const [showTransporte, setShowTransporte] = useState(false);

  // Mock data
  const zonas: ZonaUrbana[] = [
    {
      id: "1",
      nome: "ZR-1 - Residencial Baixa Densidade",
      tipo: "residencial",
      descricao: "Zona destinada predominantemente ao uso residencial de baixa densidade",
      parametros: {
        coeficienteAproveitamento: 1.0,
        taxaOcupacao: 0.5,
        recuoFrontal: 5,
        recuoLateral: 1.5,
        alturaMaxima: 7.5,
        garitoMaximo: 2
      },
      poligono: [
        { latitude: -23.5505, longitude: -46.6333 },
        { latitude: -23.5515, longitude: -46.6343 },
        { latitude: -23.5525, longitude: -46.6353 },
        { latitude: -23.5535, longitude: -46.6363 }
      ],
      restricoes: [
        "Proibido comércio de grande porte",
        "Altura máxima de 2 pavimentos",
        "Recuo frontal mínimo de 5m"
      ],
      usoPermitido: [
        "Residencial unifamiliar",
        "Residencial multifamiliar até 2 pavimentos",
        "Comércio local de pequeno porte"
      ],
      legislacao: "Lei Municipal 123/2020",
      dataVigencia: "2020-01-01"
    },
    {
      id: "2",
      nome: "ZC-1 - Comercial Central",
      tipo: "comercial",
      descricao: "Zona comercial do centro da cidade",
      parametros: {
        coeficienteAproveitamento: 3.0,
        taxaOcupacao: 0.8,
        recuoFrontal: 0,
        recuoLateral: 0,
        alturaMaxima: 45,
        garitoMaximo: 15
      },
      poligono: [
        { latitude: -23.5545, longitude: -46.6373 },
        { latitude: -23.5555, longitude: -46.6383 },
        { latitude: -23.5565, longitude: -46.6393 }
      ],
      restricoes: [
        "Obrigatório térreo comercial",
        "Área mínima para estacionamento"
      ],
      usoPermitido: [
        "Comércio em geral",
        "Serviços",
        "Residencial acima do térreo"
      ],
      legislacao: "Lei Municipal 123/2020",
      dataVigencia: "2020-01-01"
    }
  ];

  const indicadores: IndicadorUrbano[] = [
    {
      id: "1",
      nome: "Densidade Populacional",
      categoria: "densidade",
      unidade: "hab/km²",
      valor: 2500,
      meta: 3000,
      periodo: "2024",
      fonte: "IBGE/Censo Municipal",
      metodologia: "População total dividida pela área urbanizada",
      historico: [
        { periodo: "2022", valor: 2300 },
        { periodo: "2023", valor: 2400 },
        { periodo: "2024", valor: 2500 }
      ]
    },
    {
      id: "2",
      nome: "Cobertura Verde",
      categoria: "qualidade_vida",
      unidade: "%",
      valor: 25,
      meta: 30,
      periodo: "2024",
      fonte: "Secretaria de Meio Ambiente",
      metodologia: "Análise de imagens de satélite",
      historico: [
        { periodo: "2022", valor: 23 },
        { periodo: "2023", valor: 24 },
        { periodo: "2024", valor: 25 }
      ]
    }
  ];

  const getTipoZonaColor = (tipo: string) => {
    switch (tipo) {
      case "residencial": return "bg-green-100 text-green-800";
      case "comercial": return "bg-blue-100 text-blue-800";
      case "industrial": return "bg-purple-100 text-purple-800";
      case "mista": return "bg-orange-100 text-orange-800";
      case "preservacao": return "bg-emerald-100 text-emerald-800";
      case "especial": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoriaIndicadorColor = (categoria: string) => {
    switch (categoria) {
      case "densidade": return "bg-blue-100 text-blue-800";
      case "uso_solo": return "bg-green-100 text-green-800";
      case "mobilidade": return "bg-purple-100 text-purple-800";
      case "infraestrutura": return "bg-orange-100 text-orange-800";
      case "qualidade_vida": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mapa Urbano</h1>
            <p className="text-gray-600">Visualização geográfica e análise territorial</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Mapa
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Painel de Controle */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Layers className="mr-2 h-5 w-5" />
                  Camadas do Mapa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="zoneamento" className="text-sm">Zoneamento</Label>
                    <Switch
                      id="zoneamento"
                      checked={showZoneamento}
                      onCheckedChange={setShowZoneamento}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="projetos" className="text-sm">Projetos em Análise</Label>
                    <Switch
                      id="projetos"
                      checked={showProjetos}
                      onCheckedChange={setShowProjetos}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alvaras" className="text-sm">Alvarás Ativos</Label>
                    <Switch
                      id="alvaras"
                      checked={showAlvaras}
                      onCheckedChange={setShowAlvaras}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="transporte" className="text-sm">Transporte Público</Label>
                    <Switch
                      id="transporte"
                      checked={showTransporte}
                      onCheckedChange={setShowTransporte}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Buscar Endereço</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Digite um endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button className="w-full mt-2" size="sm">
                  <MapPin className="mr-2 h-4 w-4" />
                  Localizar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="tipoZona">Tipo de Zona</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os tipos</SelectItem>
                        <SelectItem value="residencial">Residencial</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="mista">Mista</SelectItem>
                        <SelectItem value="preservacao">Preservação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área do Mapa */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="mapa" className="space-y-4">
              <TabsList>
                <TabsTrigger value="mapa">Mapa Interativo</TabsTrigger>
                <TabsTrigger value="zoneamento">Zoneamento</TabsTrigger>
                <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
              </TabsList>

              <TabsContent value="mapa">
                <Card>
                  <CardContent className="p-0">
                    <div className="h-[600px] bg-gray-100 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <Map className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Mapa Interativo</h3>
                        <p className="mt-2 text-gray-600">
                          Visualização do mapa da cidade com as camadas selecionadas
                        </p>
                        <div className="mt-4 space-y-2 text-sm text-gray-500">
                          {showZoneamento && <div>🟢 Zoneamento ativo</div>}
                          {showProjetos && <div>🔵 Projetos em análise ativo</div>}
                          {showAlvaras && <div>🟠 Alvarás ativos ativo</div>}
                          {showTransporte && <div>🟣 Transporte público ativo</div>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="zoneamento">
                <div className="space-y-4">
                  {zonas.map((zona) => (
                    <Card key={zona.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg">{zona.nome}</CardTitle>
                            <Badge className={getTipoZonaColor(zona.tipo)}>
                              {zona.tipo}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver no Mapa
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{zona.descricao}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Parâmetros Urbanísticos</h4>
                            <div className="space-y-1 text-sm">
                              <div>Coef. Aproveitamento: {zona.parametros.coeficienteAproveitamento}</div>
                              <div>Taxa de Ocupação: {zona.parametros.taxaOcupacao * 100}%</div>
                              <div>Recuo Frontal: {zona.parametros.recuoFrontal}m</div>
                              <div>Altura Máxima: {zona.parametros.alturaMaxima}m</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Usos Permitidos</h4>
                            <div className="space-y-1">
                              {zona.usoPermitido.slice(0, 3).map((uso, index) => (
                                <div key={index} className="text-sm text-gray-600">• {uso}</div>
                              ))}
                              {zona.usoPermitido.length > 3 && (
                                <div className="text-sm text-gray-500">
                                  ... e mais {zona.usoPermitido.length - 3} uso(s)
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {zona.restricoes.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Restrições</h4>
                            <div className="space-y-1">
                              {zona.restricoes.map((restricao, index) => (
                                <div key={index} className="text-sm text-red-600">⚠️ {restricao}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                          <span>Legislação: {zona.legislacao}</span>
                          <span>Vigência: {new Date(zona.dataVigencia).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="indicadores">
                <div className="space-y-6">
                  {indicadores.map((indicador) => (
                    <Card key={indicador.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg">{indicador.nome}</CardTitle>
                            <Badge className={getCategoriaIndicadorColor(indicador.categoria)}>
                              {indicador.categoria.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {indicador.valor} {indicador.unidade}
                            </div>
                            {indicador.meta && (
                              <div className="text-sm text-gray-500">
                                Meta: {indicador.meta} {indicador.unidade}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Informações</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div><strong>Período:</strong> {indicador.periodo}</div>
                              <div><strong>Fonte:</strong> {indicador.fonte}</div>
                              <div><strong>Metodologia:</strong> {indicador.metodologia}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Evolução Histórica</h4>
                            <div className="space-y-2">
                              {indicador.historico.map((hist, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{hist.periodo}</span>
                                  <span className="font-medium">
                                    {hist.valor} {indicador.unidade}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {indicador.meta && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progresso da Meta</span>
                              <span>{Math.round((indicador.valor / indicador.meta) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min((indicador.valor / indicador.meta) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building className="mr-2 h-5 w-5" />
                        Resumo Territorial
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">12</div>
                          <div className="text-sm text-gray-600">Zonas Urbanas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">85%</div>
                          <div className="text-sm text-gray-600">Área Ocupada</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">245</div>
                          <div className="text-sm text-gray-600">Projetos Ativos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">1.2k</div>
                          <div className="text-sm text-gray-600">Alvarás Válidos</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    
  );
};

export default MapaUrbano;
