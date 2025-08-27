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
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  User,
  FileText,
  Star,
  Tag,
  Image,
  AlertCircle,
  TrendingUp,
  Globe,
  Users
} from 'lucide-react';
import { InformacaoTuristica } from "@/types/turismo";

const TurismoInformacoesTuristicas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InformacaoTuristica | null>(null);

  // Mock data
  const [informacoes] = useState<InformacaoTuristica[]>([
    {
      id: '1',
      titulo: 'Festival de Inverno 2024',
      tipo: 'Evento',
      categoria: 'Cultural',
      conteudo: 'O maior festival de inverno da região acontece de 15 a 30 de julho. Programação inclui shows musicais, apresentações teatrais, feira gastronômica e atividades para toda a família. Entrada gratuita para todos os eventos.',
      resumo: 'Festival de inverno com programação cultural diversificada e entrada gratuita.',
      autor: 'Secretaria de Turismo',
      dataPublicacao: '2024-01-10',
      dataVencimento: '2024-07-30',
      tags: ['festival', 'inverno', 'cultura', 'música', 'teatro'],
      imagem: 'festival-inverno.jpg',
      anexos: ['programacao-completa.pdf', 'mapa-evento.pdf'],
      status: 'Publicado',
      destaque: true,
      visualizacoes: 2500,
      publicoAlvo: 'Todos'
    },
    {
      id: '2',
      titulo: 'Nova Trilha Ecológica Aberta',
      tipo: 'Notícia',
      categoria: 'Natureza',
      conteudo: 'Foi inaugurada uma nova trilha ecológica na Reserva Municipal. A trilha tem 3km de extensão, nível moderado de dificuldade e oferece vista panorâmica da cidade. Funcionamento de terça a domingo das 7h às 17h.',
      resumo: 'Nova trilha de 3km inaugurada na Reserva Municipal com vista panorâmica.',
      autor: 'João Silva',
      dataPublicacao: '2024-01-08',
      tags: ['trilha', 'ecologia', 'natureza', 'aventura'],
      imagem: 'trilha-nova.jpg',
      anexos: ['mapa-trilha.pdf'],
      status: 'Publicado',
      destaque: false,
      visualizacoes: 850,
      publicoAlvo: 'Turistas'
    },
    {
      id: '3',
      titulo: 'Dicas de Segurança para Trilhas',
      tipo: 'Dica',
      categoria: 'Segurança',
      conteudo: 'Equipamentos essenciais: tênis apropriado, mochila, água, protetor solar, repelente, lanterna. Sempre informe alguém sobre seu roteiro e horário previsto de retorno. Não saia das trilhas marcadas.',
      resumo: 'Orientações importantes para garantir segurança durante trilhas.',
      autor: 'Maria Santos - Guia Especializada',
      dataPublicacao: '2024-01-05',
      tags: ['segurança', 'trilha', 'equipamentos', 'orientações'],
      imagem: 'seguranca-trilhas.jpg',
      anexos: ['checklist-equipamentos.pdf'],
      status: 'Publicado',
      destaque: true,
      visualizacoes: 1200,
      publicoAlvo: 'Turistas'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Publicado': return 'bg-green-100 text-green-800';
      case 'Rascunho': return 'bg-yellow-100 text-yellow-800';
      case 'Arquivado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Evento': return 'bg-purple-100 text-purple-800';
      case 'Notícia': return 'bg-blue-100 text-blue-800';
      case 'Dica': return 'bg-green-100 text-green-800';
      case 'Alerta': return 'bg-red-100 text-red-800';
      case 'Promoção': return 'bg-orange-100 text-orange-800';
      case 'Guia': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPublicoColor = (publico: string) => {
    switch (publico) {
      case 'Turistas': return 'bg-cyan-100 text-cyan-800';
      case 'Moradores': return 'bg-emerald-100 text-emerald-800';
      case 'Empresários': return 'bg-amber-100 text-amber-800';
      case 'Todos': return 'bg-violet-100 text-violet-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInformacoes = informacoes.filter(info => 
    (info.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
     info.conteudo.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (tipoFilter === 'all' || info.tipo === tipoFilter) &&
    (statusFilter === 'all' || info.status === statusFilter)
  );

  const InformacaoForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" placeholder="Título da informação" />
        </div>
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Evento">Evento</SelectItem>
              <SelectItem value="Notícia">Notícia</SelectItem>
              <SelectItem value="Dica">Dica</SelectItem>
              <SelectItem value="Alerta">Alerta</SelectItem>
              <SelectItem value="Promoção">Promoção</SelectItem>
              <SelectItem value="Guia">Guia</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Input id="categoria" placeholder="Ex: Cultural, Natureza" />
        </div>
        <div>
          <Label htmlFor="autor">Autor</Label>
          <Input id="autor" placeholder="Nome do autor" />
        </div>
        <div>
          <Label htmlFor="publicoAlvo">Público Alvo</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o público" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Turistas">Turistas</SelectItem>
              <SelectItem value="Moradores">Moradores</SelectItem>
              <SelectItem value="Empresários">Empresários</SelectItem>
              <SelectItem value="Todos">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dataVencimento">Data de Vencimento (opcional)</Label>
          <Input id="dataVencimento" type="date" />
        </div>
      </div>
      <div>
        <Label htmlFor="resumo">Resumo</Label>
        <Textarea id="resumo" placeholder="Resumo da informação" rows={2} />
      </div>
      <div>
        <Label htmlFor="conteudo">Conteúdo</Label>
        <Textarea id="conteudo" placeholder="Conteúdo completo da informação" rows={6} />
      </div>
      <div>
        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
        <Input id="tags" placeholder="Ex: festival, música, cultura" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="imagem">Imagem Principal</Label>
          <Input id="imagem" type="file" accept="image/*" />
        </div>
        <div>
          <Label htmlFor="anexos">Anexos</Label>
          <Input id="anexos" type="file" multiple />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="destaque" />
        <Label htmlFor="destaque">Destacar esta informação</Label>
      </div>
    </div>
  );

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Informações Turísticas</h1>
            <p className="text-gray-600 mt-2">Gerencie notícias, eventos, dicas e informações para turistas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Nova Informação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Editar Informação' : 'Nova Informação Turística'}
                </DialogTitle>
              </DialogHeader>
              <InformacaoForm />
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Salvar como Rascunho
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  {editingItem ? 'Atualizar' : 'Publicar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Informações</p>
                  <p className="text-2xl font-bold">{informacoes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Publicadas</p>
                  <p className="text-2xl font-bold">{informacoes.filter(i => i.status === 'Publicado').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Em Destaque</p>
                  <p className="text-2xl font-bold">{informacoes.filter(i => i.destaque).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Visualizações</p>
                  <p className="text-2xl font-bold">{informacoes.reduce((sum, i) => sum + i.visualizacoes, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Lista de Informações</CardTitle>
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
                  placeholder="Buscar por título ou conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                  <SelectItem value="Notícia">Notícia</SelectItem>
                  <SelectItem value="Dica">Dica</SelectItem>
                  <SelectItem value="Alerta">Alerta</SelectItem>
                  <SelectItem value="Promoção">Promoção</SelectItem>
                  <SelectItem value="Guia">Guia</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Publicado">Publicado</SelectItem>
                  <SelectItem value="Rascunho">Rascunho</SelectItem>
                  <SelectItem value="Arquivado">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6">
              {filteredInformacoes.map((informacao) => (
                <Card key={informacao.id} className={`border-l-4 ${informacao.destaque ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-blue-500'}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{informacao.titulo}</h3>
                              {informacao.destaque && (
                                <Star size={16} className="text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getTipoColor(informacao.tipo)}>
                                {informacao.tipo}
                              </Badge>
                              <Badge className={getStatusColor(informacao.status)}>
                                {informacao.status}
                              </Badge>
                              <Badge className={getPublicoColor(informacao.publicoAlvo)}>
                                <Users size={12} className="mr-1" />
                                {informacao.publicoAlvo}
                              </Badge>
                              <Badge variant="outline">{informacao.categoria}</Badge>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{informacao.resumo}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <User size={14} />
                            <span>{informacao.autor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{new Date(informacao.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp size={14} />
                            <span>{informacao.visualizacoes.toLocaleString()} visualizações</span>
                          </div>
                          {informacao.dataVencimento && (
                            <div className="flex items-center gap-2">
                              <AlertCircle size={14} />
                              <span>Expira em {new Date(informacao.dataVencimento).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {informacao.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag size={10} className="mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {informacao.imagem && (
                            <div className="flex items-center gap-1">
                              <Image size={14} />
                              <span>Imagem</span>
                            </div>
                          )}
                          {informacao.anexos.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText size={14} />
                              <span>{informacao.anexos.length} anexo(s)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2 shrink-0">
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          Visualizar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingItem(informacao);
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

            {filteredInformacoes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Nenhuma informação encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
};

export default TurismoInformacoesTuristicas;
