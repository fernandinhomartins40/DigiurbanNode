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
  Users,
  DollarSign,
  Route,
  Calendar,
  Star,
  Phone,
  Backpack
} from 'lucide-react';
import { ProgramaTuristico } from "@/types/turismo";

const TurismoProgramasTuristicos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProgramaTuristico | null>(null);

  // Mock data
  const [programas] = useState<ProgramaTuristico[]>([
    {
      id: '1',
      nome: 'Tour Histórico Centro da Cidade',
      tipo: 'City Tour',
      descricao: 'Conheça a rica história da cidade através de seus principais monumentos e edifícios históricos. Tour guiado com explicações detalhadas.',
      duracao: '3 horas',
      preco: 45.00,
      inclusos: ['Guia especializado', 'Transporte', 'Entrada nos museus', 'Lanche'],
      roteiro: [
        { horario: '09:00', local: 'Praça Central', atividade: 'Encontro e apresentação' },
        { horario: '09:30', local: 'Igreja Matriz', atividade: 'Visita guiada' },
        { horario: '10:30', local: 'Museu Histórico', atividade: 'Tour pelo museu' },
        { horario: '11:30', local: 'Casa da Cultura', atividade: 'Exposições e artesanato' }
      ],
      pontoEncontro: 'Praça Central - em frente à fonte',
      horarioSaida: '09:00',
      capacidadeMaxima: 15,
      idadeMinima: 8,
      dificuldade: 'Fácil',
      equipamentosNecessarios: ['Chapéu', 'Protetor solar', 'Água'],
      observacoes: 'Tour suspenso em caso de chuva forte',
      guia: 'Maria Santos - Guia Credenciada',
      telefoneContato: '(11) 99999-1111',
      status: 'Ativo',
      diasFuncionamento: ['Segunda', 'Quarta', 'Sexta', 'Sábado']
    },
    {
      id: '2',
      nome: 'Trilha Ecológica Mata Atlântica',
      tipo: 'Trilha Ecológica',
      descricao: 'Aventura pela mata nativa com observação da fauna e flora local. Inclui cachoeira e banho em águas cristalinas.',
      duracao: '6 horas',
      preco: 80.00,
      inclusos: ['Guia especializado', 'Equipamentos de segurança', 'Almoço', 'Seguro'],
      roteiro: [
        { horario: '07:00', local: 'Base da trilha', atividade: 'Preparação e orientações' },
        { horario: '07:30', local: 'Trilha principal', atividade: 'Caminhada e observação' },
        { horario: '10:00', local: 'Mirante', atividade: 'Pausa e contemplação' },
        { horario: '12:00', local: 'Cachoeira', atividade: 'Almoço e banho' }
      ],
      pontoEncontro: 'Entrada do Parque Ecológico',
      horarioSaida: '07:00',
      capacidadeMaxima: 10,
      idadeMinima: 12,
      dificuldade: 'Moderada',
      equipamentosNecessarios: ['Tênis apropriado', 'Mochila', 'Roupa de banho', 'Repelente'],
      observacoes: 'Necessário bom condicionamento físico',
      guia: 'João Silva - Condutor Ambiental',
      telefoneContato: '(11) 99999-2222',
      status: 'Ativo',
      diasFuncionamento: ['Sábado', 'Domingo']
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Inativo': return 'bg-red-100 text-red-800';
      case 'Sazonal': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Moderada': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProgramas = programas.filter(programa => 
    (programa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
     programa.descricao.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (tipoFilter === 'all' || programa.tipo === tipoFilter)
  );

  const ProgramaForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome do Programa</Label>
          <Input id="nome" placeholder="Nome do programa turístico" />
        </div>
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="City Tour">City Tour</SelectItem>
              <SelectItem value="Trilha Ecológica">Trilha Ecológica</SelectItem>
              <SelectItem value="Tour Cultural">Tour Cultural</SelectItem>
              <SelectItem value="Tour Gastronômico">Tour Gastronômico</SelectItem>
              <SelectItem value="Tour Religioso">Tour Religioso</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="duracao">Duração</Label>
          <Input id="duracao" placeholder="Ex: 3 horas" />
        </div>
        <div>
          <Label htmlFor="preco">Preço (R$)</Label>
          <Input id="preco" type="number" placeholder="0.00" />
        </div>
        <div>
          <Label htmlFor="capacidade">Capacidade Máxima</Label>
          <Input id="capacidade" type="number" placeholder="15" />
        </div>
        <div>
          <Label htmlFor="idadeMinima">Idade Mínima</Label>
          <Input id="idadeMinima" type="number" placeholder="8" />
        </div>
        <div>
          <Label htmlFor="dificuldade">Dificuldade</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fácil">Fácil</SelectItem>
              <SelectItem value="Moderada">Moderada</SelectItem>
              <SelectItem value="Difícil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="telefone">Telefone de Contato</Label>
          <Input id="telefone" placeholder="(00) 00000-0000" />
        </div>
      </div>
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" placeholder="Descrição detalhada do programa" rows={4} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pontoEncontro">Ponto de Encontro</Label>
          <Input id="pontoEncontro" placeholder="Local de encontro" />
        </div>
        <div>
          <Label htmlFor="horarioSaida">Horário de Saída</Label>
          <Input id="horarioSaida" placeholder="09:00" />
        </div>
      </div>
      <div>
        <Label htmlFor="inclusos">Inclusos (separados por vírgula)</Label>
        <Input id="inclusos" placeholder="Ex: Guia, Transporte, Lanche" />
      </div>
      <div>
        <Label htmlFor="equipamentos">Equipamentos Necessários (separados por vírgula)</Label>
        <Input id="equipamentos" placeholder="Ex: Tênis, Chapéu, Protetor solar" />
      </div>
      <div>
        <Label>Dias de Funcionamento</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia) => (
            <div key={dia} className="flex items-center space-x-2">
              <Checkbox id={dia} />
              <Label htmlFor={dia} className="text-sm">{dia}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" placeholder="Observações importantes" rows={3} />
      </div>
    </div>
  );

  return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Programas Turísticos</h1>
            <p className="text-gray-600 mt-2">Gerencie tours, trilhas e programas turísticos oferecidos</p>
          </div>
          <DialogLarge open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Novo Programa
              </Button>
            </DialogTrigger>
            <DialogLargeContent>
              <DialogLargeHeader>
                <DialogLargeTitle>
                  {editingItem ? 'Editar Programa' : 'Novo Programa Turístico'}
                </DialogLargeTitle>
              </DialogLargeHeader>
              <DialogLargeBody className="scrollbar-modal">
                <ProgramaForm />
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
          </DialogLarge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Lista de Programas</CardTitle>
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
                  placeholder="Buscar por nome ou descrição..."
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
                  <SelectItem value="City Tour">City Tour</SelectItem>
                  <SelectItem value="Trilha Ecológica">Trilha Ecológica</SelectItem>
                  <SelectItem value="Tour Cultural">Tour Cultural</SelectItem>
                  <SelectItem value="Tour Gastronômico">Tour Gastronômico</SelectItem>
                  <SelectItem value="Tour Religioso">Tour Religioso</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6">
              {filteredProgramas.map((programa) => (
                <Card key={programa.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{programa.nome}</h3>
                              <Badge variant="secondary">
                                <Route size={12} className="mr-1" />
                                {programa.tipo}
                              </Badge>
                              <Badge className={getStatusColor(programa.status)}>
                                {programa.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <DollarSign size={14} className="text-green-600" />
                                <span className="font-medium">R$ {programa.preco.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} className="text-blue-600" />
                                <span>{programa.duracao}</span>
                              </div>
                              <Badge className={getDificuldadeColor(programa.dificuldade)}>
                                {programa.dificuldade}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{programa.descricao}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            <span>{programa.pontoEncontro}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            <span>Saída: {programa.horarioSaida}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-gray-400" />
                            <span>Máx: {programa.capacidadeMaxima} pessoas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <span>{programa.telefoneContato}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-gray-600 mb-1">Inclusos:</h4>
                            <div className="flex flex-wrap gap-1">
                              {programa.inclusos.map((item, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-sm text-gray-600 mb-1">Equipamentos necessários:</h4>
                            <div className="flex flex-wrap gap-1">
                              {programa.equipamentosNecessarios.map((item, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-yellow-50">
                                  <Backpack size={10} className="mr-1" />
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-sm text-gray-600 mb-1">Funcionamento:</h4>
                            <div className="flex flex-wrap gap-1">
                              {programa.diasFuncionamento.map((dia, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  <Calendar size={10} className="mr-1" />
                                  {dia}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2 shrink-0">
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          Ver Roteiro
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingItem(programa);
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

            {filteredProgramas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Route size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Nenhum programa turístico encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default TurismoProgramasTuristicos;
