import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DialogLarge, DialogLargeContent, DialogLargeHeader, DialogLargeTitle, DialogLargeBody, DialogLargeFooter } from "@/components/ui/dialog-large";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  MapPin,
  Clock,
  Phone,
  Globe,
  Star,
  Users,
  Camera,
  Car,
  Accessibility
} from 'lucide-react';
import { PontoTuristico } from "@/types/turismo";

const TurismoPontosTuristicos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PontoTuristico | null>(null);

  // Mock data
  const [pontosTuristicos] = useState<PontoTuristico[]>([
    {
      id: '1',
      nome: 'Mirante do Cristo',
      tipo: 'Histórico',
      endereco: 'Rua do Mirante, 123 - Centro',
      coordenadas: { lat: -23.5505, lng: -46.6333 },
      descricao: 'Vista panorâmica da cidade com estátua do Cristo Redentor local. Ideal para contemplação e fotografias.',
      horarioFuncionamento: 'Diariamente das 6h às 18h',
      telefone: '(11) 3333-4444',
      email: 'mirante@turismo.gov.br',
      website: 'www.mirante.com.br',
      valorEntrada: 0,
      acessibilidade: true,
      estacionamento: true,
      guiaDisponivel: true,
      fotos: ['foto1.jpg', 'foto2.jpg'],
      status: 'Ativo',
      avaliacaoMedia: 4.5,
      visitantesAno: 15000
    },
    {
      id: '2',
      nome: 'Cachoeira dos Sonhos',
      tipo: 'Natural',
      endereco: 'Estrada Rural, Km 15',
      coordenadas: { lat: -23.5505, lng: -46.6333 },
      descricao: 'Cachoeira com queda de 30 metros, piscina natural e trilha ecológica de 2km.',
      horarioFuncionamento: 'Terça a domingo das 8h às 17h',
      telefone: '(11) 3333-5555',
      email: 'cachoeira@turismo.gov.br',
      website: '',
      valorEntrada: 15,
      acessibilidade: false,
      estacionamento: true,
      guiaDisponivel: true,
      fotos: ['cachoeira1.jpg'],
      status: 'Ativo',
      avaliacaoMedia: 4.8,
      visitantesAno: 8500
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Inativo': return 'bg-red-100 text-red-800';
      case 'Em Manutenção': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPontos = pontosTuristicos.filter(ponto => 
    (ponto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
     ponto.endereco.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (tipoFilter === 'all' || ponto.tipo === tipoFilter)
  );

  const PontoTuristicoForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome do Ponto Turístico</Label>
          <Input id="nome" placeholder="Nome do local" />
        </div>
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Histórico">Histórico</SelectItem>
              <SelectItem value="Natural">Natural</SelectItem>
              <SelectItem value="Cultural">Cultural</SelectItem>
              <SelectItem value="Religioso">Religioso</SelectItem>
              <SelectItem value="Gastronômico">Gastronômico</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="endereco">Endereço</Label>
          <Input id="endereco" placeholder="Endereço completo" />
        </div>
        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" placeholder="(00) 0000-0000" />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="email@exemplo.com" />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input id="website" placeholder="www.exemplo.com" />
        </div>
        <div>
          <Label htmlFor="horario">Horário de Funcionamento</Label>
          <Input id="horario" placeholder="Ex: Diariamente das 8h às 17h" />
        </div>
        <div>
          <Label htmlFor="valorEntrada">Valor da Entrada (R$)</Label>
          <Input id="valorEntrada" type="number" placeholder="0.00" />
        </div>
      </div>
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" placeholder="Descrição detalhada do ponto turístico" rows={4} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="acessibilidade" />
          <Label htmlFor="acessibilidade">Acessibilidade</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="estacionamento" />
          <Label htmlFor="estacionamento">Estacionamento</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="guia" />
          <Label htmlFor="guia">Guia Disponível</Label>
        </div>
      </div>
    </div>
  );

  return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pontos Turísticos</h1>
            <p className="text-gray-600 mt-2">Gerencie os pontos turísticos da cidade</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Novo Ponto Turístico
              </Button>
            </DialogTrigger>
            <DialogLargeContent>
              <DialogLargeHeader>
                <DialogLargeTitle>
                  {editingItem ? 'Editar Ponto Turístico' : 'Novo Ponto Turístico'}
                </DialogLargeTitle>
              </DialogLargeHeader>
              <DialogLargeBody className="scrollbar-modal">
                <PontoTuristicoForm />
              </DialogLargeBody>
              <DialogLargeFooter>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    {editingItem ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </div>
              </DialogLargeFooter>
            </DialogLargeContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Lista de Pontos Turísticos</CardTitle>
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
                  <SelectItem value="Histórico">Histórico</SelectItem>
                  <SelectItem value="Natural">Natural</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Religioso">Religioso</SelectItem>
                  <SelectItem value="Gastronômico">Gastronômico</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6">
              {filteredPontos.map((ponto) => (
                <Card key={ponto.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{ponto.nome}</h3>
                              <Badge variant="secondary">{ponto.tipo}</Badge>
                              <Badge className={getStatusColor(ponto.status)}>
                                {ponto.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Star size={16} className="text-yellow-500" />
                              <span className="font-medium">{ponto.avaliacaoMedia}</span>
                              <span className="text-sm">({ponto.visitantesAno.toLocaleString()} visitantes/ano)</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{ponto.descricao}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            <span>{ponto.endereco}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            <span>{ponto.horarioFuncionamento}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <span>{ponto.telefone}</span>
                          </div>
                          {ponto.website && (
                            <div className="flex items-center gap-2">
                              <Globe size={14} className="text-gray-400" />
                              <span>{ponto.website}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-gray-400" />
                            <span>Entrada: {ponto.valorEntrada === 0 ? 'Gratuita' : `R$ ${ponto.valorEntrada}`}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                          {ponto.acessibilidade && (
                            <div className="flex items-center gap-1 text-sm text-green-600">
                              <Accessibility size={14} />
                              <span>Acessível</span>
                            </div>
                          )}
                          {ponto.estacionamento && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <Car size={14} />
                              <span>Estacionamento</span>
                            </div>
                          )}
                          {ponto.guiaDisponivel && (
                            <div className="flex items-center gap-1 text-sm text-purple-600">
                              <Users size={14} />
                              <span>Guia</span>
                            </div>
                          )}
                          {ponto.fotos.length > 0 && (
                            <div className="flex items-center gap-1 text-sm text-orange-600">
                              <Camera size={14} />
                              <span>{ponto.fotos.length} fotos</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2 shrink-0">
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingItem(ponto);
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

            {filteredPontos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Nenhum ponto turístico encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default TurismoPontosTuristicos;
