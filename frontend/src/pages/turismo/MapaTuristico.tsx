
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  MapPin,
  Map,
  Layers,
  Settings,
  Navigation,
  Phone,
  Clock,
  Globe,
  AlertCircle
} from 'lucide-react';
import { LocalMapaTuristico } from "@/types/turismo";

const TurismoMapaTuristico = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LocalMapaTuristico | null>(null);

  // Mock data
  const [locaisMapa] = useState<LocalMapaTuristico[]>([
    {
      id: '1',
      nome: 'Mirante do Cristo',
      tipo: 'Ponto Turístico',
      categoria: 'Vista Panorâmica',
      coordenadas: { lat: -23.5505, lng: -46.6333 },
      endereco: 'Rua do Mirante, 123 - Centro',
      descricao: 'Principal ponto turístico da cidade com vista panorâmica',
      icone: 'mountain',
      cor: '#22c55e',
      visibilidade: true,
      informacoesAdicionais: {
        telefone: '(11) 3333-4444',
        horario: 'Diariamente das 6h às 18h',
        website: 'www.mirante.com.br'
      }
    },
    {
      id: '2',
      nome: 'Hotel Vista Bela',
      tipo: 'Estabelecimento',
      categoria: 'Hospedagem',
      coordenadas: { lat: -23.5515, lng: -46.6343 },
      endereco: 'Av. Principal, 456 - Centro',
      descricao: 'Hotel boutique com vista panorâmica',
      icone: 'bed',
      cor: '#3b82f6',
      visibilidade: true,
      informacoesAdicionais: {
        telefone: '(11) 3333-7777',
        horario: '24 horas',
        website: 'www.hotelvistabela.com.br'
      }
    },
    {
      id: '3',
      nome: 'Centro de Informações Turísticas',
      tipo: 'Serviço Público',
      categoria: 'Informações',
      coordenadas: { lat: -23.5500, lng: -46.6320 },
      endereco: 'Praça Central, s/n - Centro',
      descricao: 'Centro oficial de informações turísticas',
      icone: 'info',
      cor: '#8b5cf6',
      visibilidade: true,
      informacoesAdicionais: {
        telefone: '(11) 3333-1100',
        horario: 'Segunda a sábado das 8h às 17h'
      }
    },
    {
      id: '4',
      nome: 'Rodoviária Municipal',
      tipo: 'Transporte',
      categoria: 'Terminal',
      coordenadas: { lat: -23.5520, lng: -46.6310 },
      endereco: 'Av. dos Transportes, 100',
      descricao: 'Terminal rodoviário municipal',
      icone: 'bus',
      cor: '#f59e0b',
      visibilidade: true,
      informacoesAdicionais: {
        telefone: '(11) 3333-2200',
        horario: '24 horas'
      }
    }
  ]);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Ponto Turístico': return 'bg-green-100 text-green-800';
      case 'Estabelecimento': return 'bg-blue-100 text-blue-800';
      case 'Serviço Público': return 'bg-purple-100 text-purple-800';
      case 'Transporte': return 'bg-yellow-100 text-yellow-800';
      case 'Emergência': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLocais = locaisMapa.filter(local => 
    (local.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
     local.endereco.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (tipoFilter === '' || local.tipo === tipoFilter)
  );

  const LocalMapaForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome do Local</Label>
          <Input id="nome" placeholder="Nome do local" />
        </div>
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ponto Turístico">Ponto Turístico</SelectItem>
              <SelectItem value="Estabelecimento">Estabelecimento</SelectItem>
              <SelectItem value="Serviço Público">Serviço Público</SelectItem>
              <SelectItem value="Transporte">Transporte</SelectItem>
              <SelectItem value="Emergência">Emergência</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Input id="categoria" placeholder="Ex: Vista Panorâmica" />
        </div>
        <div>
          <Label htmlFor="endereco">Endereço</Label>
          <Input id="endereco" placeholder="Endereço completo" />
        </div>
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" type="number" step="any" placeholder="-23.5505" />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" type="number" step="any" placeholder="-46.6333" />
        </div>
        <div>
          <Label htmlFor="icone">Ícone</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ícone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mountain">Montanha</SelectItem>
              <SelectItem value="bed">Hotel</SelectItem>
              <SelectItem value="utensils">Restaurante</SelectItem>
              <SelectItem value="info">Informações</SelectItem>
              <SelectItem value="bus">Transporte</SelectItem>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="shopping-bag">Loja</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="cor">Cor do Marcador</Label>
          <Input id="cor" type="color" defaultValue="#22c55e" />
        </div>
      </div>
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" placeholder="Descrição do local" rows={3} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" placeholder="(00) 0000-0000" />
        </div>
        <div>
          <Label htmlFor="horario">Horário</Label>
          <Input id="horario" placeholder="Ex: 8h às 17h" />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input id="website" placeholder="www.exemplo.com" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="visibilidade" defaultChecked />
        <Label htmlFor="visibilidade">Visível no mapa</Label>
      </div>
    </div>
  );

  const MapaView = () => (
    <div className="h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center">
        <Map size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Visualização do Mapa Interativo</p>
        <p className="text-sm text-gray-400">
          Aqui seria exibido o mapa com todos os pontos marcados
        </p>
      </div>
    </div>
  );

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mapa Turístico</h1>
            <p className="text-gray-600 mt-2">Gerencie pontos de interesse no mapa turístico interativo</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Novo Ponto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Editar Ponto no Mapa' : 'Novo Ponto no Mapa'}
                </DialogTitle>
              </DialogHeader>
              <LocalMapaForm />
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  {editingItem ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="mapa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mapa" className="flex items-center gap-2">
              <Map size={16} />
              Visualizar Mapa
            </TabsTrigger>
            <TabsTrigger value="pontos" className="flex items-center gap-2">
              <MapPin size={16} />
              Gerenciar Pontos
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2">
              <Settings size={16} />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mapa">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle>Mapa Turístico Interativo</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Layers size={16} className="mr-2" />
                      Camadas
                    </Button>
                    <Button variant="outline" size="sm">
                      <Navigation size={16} className="mr-2" />
                      Centralizar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MapaView />
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['Ponto Turístico', 'Estabelecimento', 'Serviço Público', 'Transporte', 'Emergência'].map((tipo) => (
                    <div key={tipo} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getTipoColor(tipo).split(' ')[0].replace('bg-', 'bg-')}`}></div>
                      <span className="text-sm">{tipo}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pontos">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle>Pontos no Mapa</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter size={16} className="mr-2" />
                      Filtros
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      placeholder="Buscar por nome ou endereço..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="Ponto Turístico">Ponto Turístico</SelectItem>
                      <SelectItem value="Estabelecimento">Estabelecimento</SelectItem>
                      <SelectItem value="Serviço Público">Serviço Público</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Emergência">Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  {filteredLocais.map((local) => (
                    <Card key={local.id} className="border-l-4" style={{ borderLeftColor: local.cor }}>
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                                style={{ backgroundColor: local.cor }}
                              >
                                <MapPin size={16} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">{local.nome}</h3>
                                  <Badge className={getTipoColor(local.tipo)}>
                                    {local.tipo}
                                  </Badge>
                                  <Badge variant="outline">{local.categoria}</Badge>
                                  {local.visibilidade && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      Visível
                                    </Badge>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <MapPin size={14} />
                                    <span>{local.endereco}</span>
                                  </div>
                                  {local.informacoesAdicionais.telefone && (
                                    <div className="flex items-center gap-2">
                                      <Phone size={14} />
                                      <span>{local.informacoesAdicionais.telefone}</span>
                                    </div>
                                  )}
                                  {local.informacoesAdicionais.horario && (
                                    <div className="flex items-center gap-2">
                                      <Clock size={14} />
                                      <span>{local.informacoesAdicionais.horario}</span>
                                    </div>
                                  )}
                                  {local.informacoesAdicionais.website && (
                                    <div className="flex items-center gap-2">
                                      <Globe size={14} />
                                      <span>{local.informacoesAdicionais.website}</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-gray-700 mt-2">{local.descricao}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm">
                              <Eye size={14} className="mr-1" />
                              Ver no Mapa
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingItem(local);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit size={14} className="mr-1" />
                              Editar
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredLocais.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Nenhum ponto encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Mapa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="centerLat">Latitude Central</Label>
                    <Input id="centerLat" defaultValue="-23.5505" type="number" step="any" />
                  </div>
                  <div>
                    <Label htmlFor="centerLng">Longitude Central</Label>
                    <Input id="centerLng" defaultValue="-46.6333" type="number" step="any" />
                  </div>
                  <div>
                    <Label htmlFor="zoom">Zoom Padrão</Label>
                    <Input id="zoom" defaultValue="14" type="number" min="1" max="20" />
                  </div>
                  <div>
                    <Label htmlFor="estilo">Estilo do Mapa</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Padrão</SelectItem>
                        <SelectItem value="satellite">Satélite</SelectItem>
                        <SelectItem value="terrain">Terreno</SelectItem>
                        <SelectItem value="hybrid">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mostrarControles" defaultChecked />
                    <Label htmlFor="mostrarControles">Mostrar controles de navegação</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="permitirZoom" defaultChecked />
                    <Label htmlFor="permitirZoom">Permitir zoom com scroll</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mostrarLegenda" defaultChecked />
                    <Label htmlFor="mostrarLegenda">Mostrar legenda</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Restaurar Padrões</Button>
                  <Button>Salvar Configurações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default TurismoMapaTuristico;
