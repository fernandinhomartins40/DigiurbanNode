import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DollarSign,
  Building,
  Camera,
  Award
} from 'lucide-react';
import { EstabelecimentoLocal } from "@/types/turismo";

const TurismoEstabelecimentosLocais = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EstabelecimentoLocal | null>(null);

  // Mock data
  const [estabelecimentos] = useState<EstabelecimentoLocal[]>([
    {
      id: '1',
      nome: 'Hotel Vista Bela',
      tipo: 'Hotel',
      categoria: 'Hospedagem de Luxo',
      endereco: 'Av. Principal, 456 - Centro',
      coordenadas: { lat: -23.5505, lng: -46.6333 },
      telefone: '(11) 3333-7777',
      email: 'contato@hotelvistabela.com.br',
      website: 'www.hotelvistabela.com.br',
      redesSociais: {
        facebook: '@hotelvistabela',
        instagram: '@hotelvistabela',
        whatsapp: '11999999999'
      },
      horarioFuncionamento: '24 horas',
      descricao: 'Hotel boutique com vista panorâmica da cidade. Quartos com ar-condicionado, Wi-Fi gratuito e café da manhã incluso.',
      especialidades: ['Vista panorâmica', 'Café da manhã', 'Wi-Fi gratuito', 'Estacionamento'],
      preco: 'Alto',
      avaliacaoMedia: 4.7,
      fotos: ['hotel1.jpg', 'hotel2.jpg', 'hotel3.jpg'],
      status: 'Ativo',
      certificacoes: ['Certificado de Excelência', 'Selo Verde']
    },
    {
      id: '2',
      nome: 'Restaurante Sabores da Terra',
      tipo: 'Restaurante',
      categoria: 'Culinária Regional',
      endereco: 'Rua das Flores, 123 - Centro Histórico',
      coordenadas: { lat: -23.5505, lng: -46.6333 },
      telefone: '(11) 3333-8888',
      email: 'sabores@terra.com.br',
      website: 'www.saboresdaterra.com.br',
      redesSociais: {
        instagram: '@saboresdaterra',
        facebook: '@restaurantesaboresdaterra'
      },
      horarioFuncionamento: 'Terça a domingo das 11h às 22h',
      descricao: 'Restaurante especializado em culinária regional com ingredientes locais frescos e ambiente aconchegante.',
      especialidades: ['Culinária Regional', 'Ingredientes Locais', 'Ambiente Familiar', 'Música ao Vivo'],
      preco: 'Médio',
      avaliacaoMedia: 4.5,
      fotos: ['rest1.jpg', 'rest2.jpg'],
      status: 'Ativo',
      certificacoes: ['Certificado Sanitário', 'Origem Controlada']
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Inativo': return 'bg-red-100 text-red-800';
      case 'Temporariamente Fechado': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrecoColor = (preco: string) => {
    switch (preco) {
      case 'Econômico': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Alto': return 'bg-orange-100 text-orange-800';
      case 'Premium': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEstabelecimentos = estabelecimentos.filter(estabelecimento => 
    (estabelecimento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
     estabelecimento.endereco.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (tipoFilter === 'all' || estabelecimento.tipo === tipoFilter)
  );

  const EstabelecimentoForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome do Estabelecimento</Label>
          <Input id="nome" placeholder="Nome do estabelecimento" />
        </div>
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hotel">Hotel</SelectItem>
              <SelectItem value="Pousada">Pousada</SelectItem>
              <SelectItem value="Restaurante">Restaurante</SelectItem>
              <SelectItem value="Lanchonete">Lanchonete</SelectItem>
              <SelectItem value="Bar">Bar</SelectItem>
              <SelectItem value="Loja de Souvenirs">Loja de Souvenirs</SelectItem>
              <SelectItem value="Agência de Turismo">Agência de Turismo</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Input id="categoria" placeholder="Ex: Culinária Regional" />
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
          <Input id="horario" placeholder="Ex: Segunda a sexta das 9h às 18h" />
        </div>
        <div>
          <Label htmlFor="preco">Faixa de Preço</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a faixa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Econômico">Econômico</SelectItem>
              <SelectItem value="Médio">Médio</SelectItem>
              <SelectItem value="Alto">Alto</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" placeholder="Descrição detalhada do estabelecimento" rows={4} />
      </div>
      <div>
        <Label htmlFor="especialidades">Especialidades (separadas por vírgula)</Label>
        <Input id="especialidades" placeholder="Ex: Vista panorâmica, Wi-Fi gratuito, Estacionamento" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="facebook">Facebook</Label>
          <Input id="facebook" placeholder="@perfil" />
        </div>
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <Input id="instagram" placeholder="@perfil" />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" placeholder="11999999999" />
        </div>
      </div>
    </div>
  );

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estabelecimentos Locais</h1>
            <p className="text-gray-600 mt-2">Gerencie hotéis, restaurantes e outros estabelecimentos turísticos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Novo Estabelecimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}
                </DialogTitle>
              </DialogHeader>
              <EstabelecimentoForm />
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  {editingItem ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Lista de Estabelecimentos</CardTitle>
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
                  <SelectItem value="Hotel">Hotel</SelectItem>
                  <SelectItem value="Pousada">Pousada</SelectItem>
                  <SelectItem value="Restaurante">Restaurante</SelectItem>
                  <SelectItem value="Lanchonete">Lanchonete</SelectItem>
                  <SelectItem value="Bar">Bar</SelectItem>
                  <SelectItem value="Loja de Souvenirs">Loja de Souvenirs</SelectItem>
                  <SelectItem value="Agência de Turismo">Agência de Turismo</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6">
              {filteredEstabelecimentos.map((estabelecimento) => (
                <Card key={estabelecimento.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{estabelecimento.nome}</h3>
                              <Badge variant="secondary">
                                <Building size={12} className="mr-1" />
                                {estabelecimento.tipo}
                              </Badge>
                              <Badge className={getStatusColor(estabelecimento.status)}>
                                {estabelecimento.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-500" />
                                <span className="font-medium">{estabelecimento.avaliacaoMedia}</span>
                              </div>
                              <Badge className={getPrecoColor(estabelecimento.preco)}>
                                <DollarSign size={12} className="mr-1" />
                                {estabelecimento.preco}
                              </Badge>
                              <span className="text-gray-500">{estabelecimento.categoria}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{estabelecimento.descricao}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            <span>{estabelecimento.endereco}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            <span>{estabelecimento.horarioFuncionamento}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <span>{estabelecimento.telefone}</span>
                          </div>
                          {estabelecimento.website && (
                            <div className="flex items-center gap-2">
                              <Globe size={14} className="text-gray-400" />
                              <span>{estabelecimento.website}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {estabelecimento.especialidades.map((especialidade, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {especialidade}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4">
                          {estabelecimento.fotos.length > 0 && (
                            <div className="flex items-center gap-1 text-sm text-orange-600">
                              <Camera size={14} />
                              <span>{estabelecimento.fotos.length} fotos</span>
                            </div>
                          )}
                          {estabelecimento.certificacoes.length > 0 && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <Award size={14} />
                              <span>{estabelecimento.certificacoes.length} certificações</span>
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
                            setEditingItem(estabelecimento);
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

            {filteredEstabelecimentos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Nenhum estabelecimento encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
};

export default TurismoEstabelecimentosLocais;
