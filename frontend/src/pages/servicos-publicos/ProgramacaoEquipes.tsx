import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogMedium, DialogMediumContent, DialogMediumHeader, DialogMediumTitle, DialogMediumBody, DialogMediumFooter } from "@/components/ui/dialog-medium";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  UsersRound, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  Clock,
  Truck,
  MapPin,
  Wrench,
  User
} from "lucide-react";
import { EquipeServicos } from "@/types/servicos-publicos";

const ProgramacaoEquipes: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedType, setSelectedType] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("equipes");

  // Mock data
  const equipes: EquipeServicos[] = [
    {
      id: "1",
      nome: "Equipe Iluminação A",
      tipo: "iluminacao",
      membros: [
        { nome: "Carlos Silva", funcao: "Eletricista", telefone: "(11) 99999-9999" },
        { nome: "João Santos", funcao: "Auxiliar", telefone: "(11) 88888-8888" },
        { nome: "Pedro Lima", funcao: "Motorista", telefone: "(11) 77777-7777" }
      ],
      responsavel: "Carlos Silva",
      veiculo: {
        placa: "ABC-1234",
        modelo: "Fiorino",
        capacidade: 500
      },
      equipamentos: [
        { item: "Escada", quantidade: 1, estado: "bom" },
        { item: "Kit ferramentas", quantidade: 2, estado: "bom" },
        { item: "EPIs", quantidade: 3, estado: "regular" }
      ],
      agenda: [
        {
          data: "2024-01-17",
          servico: "Manutenção de poste - Rua das Flores",
          status: "agendado",
          localizacao: "Centro"
        },
        {
          data: "2024-01-18",
          servico: "Substituição de lâmpadas - Av. Central",
          status: "agendado",
          localizacao: "Vila Nova"
        }
      ],
      status: "ativa",
      observacoes: "Equipe especializada em manutenção de iluminação pública"
    },
    {
      id: "2",
      nome: "Equipe Limpeza B",
      tipo: "limpeza",
      membros: [
        { nome: "Maria Costa", funcao: "Supervisora", telefone: "(11) 66666-6666" },
        { nome: "Roberto Santos", funcao: "Operador", telefone: "(11) 55555-5555" },
        { nome: "Ana Lima", funcao: "Auxiliar", telefone: "(11) 44444-4444" },
        { nome: "José Pereira", funcao: "Motorista", telefone: "(11) 33333-3333" }
      ],
      responsavel: "Maria Costa",
      veiculo: {
        placa: "XYZ-5678",
        modelo: "Caminhão",
        capacidade: 3000
      },
      equipamentos: [
        { item: "Vassouras", quantidade: 5, estado: "bom" },
        { item: "Carrinhos", quantidade: 2, estado: "regular" },
        { item: "EPIs", quantidade: 5, estado: "bom" }
      ],
      agenda: [
        {
          data: "2024-01-17",
          servico: "Limpeza de praça - Praça Central",
          status: "em_execucao",
          localizacao: "Centro"
        },
        {
          data: "2024-01-19",
          servico: "Varrição - Rua Comercial",
          status: "agendado",
          localizacao: "Centro"
        }
      ],
      status: "ativa",
      observacoes: "Equipe de limpeza urbana e varrição"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa": return "bg-green-100 text-green-800";
      case "inativa": return "bg-red-100 text-red-800";
      case "manutencao": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case "iluminacao": return "bg-yellow-100 text-yellow-800";
      case "limpeza": return "bg-blue-100 text-blue-800";
      case "coleta": return "bg-green-100 text-green-800";
      case "geral": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAgendaStatusColor = (status: string) => {
    switch (status) {
      case "agendado": return "bg-blue-100 text-blue-800";
      case "em_execucao": return "bg-yellow-100 text-yellow-800";
      case "concluido": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredEquipes = equipes.filter(equipe => {
    const matchesSearch = equipe.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipe.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "todos" || equipe.status === selectedStatus;
    const matchesType = selectedType === "todos" || equipe.tipo === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <UsersRound className="mr-3 h-8 w-8" />
              Programação de Equipes
            </h1>
            <p className="text-gray-600">Gerencie equipes e agende serviços</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {activeTab === "equipes" ? "Nova Equipe" : "Novo Agendamento"}
              </Button>
            </DialogTrigger>
            <DialogMediumContent>
              <DialogMediumHeader>
                <DialogMediumTitle>
                  {activeTab === "equipes" ? "Cadastrar Nova Equipe" : "Agendar Novo Serviço"}
                </DialogMediumTitle>
              </DialogMediumHeader>
              <DialogMediumBody className="scrollbar-modal">
                {activeTab === "equipes" ? (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeEquipe">Nome da Equipe</Label>
                      <Input id="nomeEquipe" placeholder="Ex: Equipe Iluminação A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipoEquipe">Tipo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iluminacao">Iluminação</SelectItem>
                          <SelectItem value="limpeza">Limpeza</SelectItem>
                          <SelectItem value="coleta">Coleta</SelectItem>
                          <SelectItem value="geral">Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input id="responsavel" placeholder="Nome do responsável" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="veiculoPlaca">Placa do Veículo</Label>
                      <Input id="veiculoPlaca" placeholder="ABC-1234" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="veiculoModelo">Modelo</Label>
                      <Input id="veiculoModelo" placeholder="Modelo do veículo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="veiculoCapacidade">Capacidade (kg)</Label>
                      <Input id="veiculoCapacidade" type="number" placeholder="1000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipamentos">Equipamentos</Label>
                    <Textarea id="equipamentos" placeholder="Liste os principais equipamentos da equipe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea id="observacoes" placeholder="Observações sobre a equipe" />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="equipe">Equipe</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a equipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equipe1">Equipe Iluminação A</SelectItem>
                          <SelectItem value="equipe2">Equipe Limpeza B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataServico">Data</Label>
                      <Input id="dataServico" type="date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="horaInicio">Hora Início</Label>
                      <Input id="horaInicio" type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horaFim">Hora Fim</Label>
                      <Input id="horaFim" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricaoServico">Descrição do Serviço</Label>
                    <Textarea id="descricaoServico" placeholder="Descreva o serviço a ser realizado" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Localização</Label>
                    <Input id="endereco" placeholder="Endereço onde será realizado o serviço" />
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  {activeTab === "equipes" ? "Cadastrar Equipe" : "Agendar Serviço"}
                </Button>
              </div>
              </DialogMediumBody>
            </DialogMediumContent>
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
                    placeholder="Buscar por nome ou responsável..."
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
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
                    <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="iluminacao">Iluminação</SelectItem>
                    <SelectItem value="limpeza">Limpeza</SelectItem>
                    <SelectItem value="coleta">Coleta</SelectItem>
                    <SelectItem value="geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="equipes" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="equipes">Equipes</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="equipes">
            <div className="grid gap-4">
              {filteredEquipes.map((equipe) => (
                <Card key={equipe.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold">{equipe.nome}</h3>
                          <p className="text-sm text-gray-600">
                            Responsável: {equipe.responsavel}
                          </p>
                        </div>
                        <Badge className={getStatusColor(equipe.status)}>
                          {equipe.status}
                        </Badge>
                        <Badge className={getTypeColor(equipe.tipo)}>
                          {equipe.tipo}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          Agenda
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center">
                          <User className="mr-2 h-4 w-4" /> Membros ({equipe.membros.length})
                        </h4>
                        <div className="space-y-1">
                          {equipe.membros.slice(0, 3).map((membro, index) => (
                            <p key={index} className="text-sm">
                              {membro.nome} - {membro.funcao}
                            </p>
                          ))}
                          {equipe.membros.length > 3 && (
                            <p className="text-sm text-blue-600">
                              +{equipe.membros.length - 3} outros membros
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center">
                          <Wrench className="mr-2 h-4 w-4" /> Equipamentos
                        </h4>
                        <div className="space-y-1">
                          {equipe.equipamentos.map((equip, index) => (
                            <p key={index} className="text-sm">
                              {equip.quantidade}x {equip.item} - Estado: {equip.estado}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center">
                          <Truck className="mr-2 h-4 w-4" /> Veículo
                        </h4>
                        {equipe.veiculo ? (
                          <div className="space-y-1">
                            <p className="text-sm">Placa: {equipe.veiculo.placa}</p>
                            <p className="text-sm">Modelo: {equipe.veiculo.modelo}</p>
                            <p className="text-sm">Capacidade: {equipe.veiculo.capacidade}kg</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">Nenhum veículo atribuído</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center">
                        <Calendar className="mr-2 h-4 w-4" /> Próximos Serviços
                      </h4>
                      {equipe.agenda.length > 0 ? (
                        <div className="space-y-2">
                          {equipe.agenda.map((agendamento, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <div>
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4 text-gray-600" />
                                  <span className="text-sm font-medium">
                                    {new Date(agendamento.data).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm ml-6">{agendamento.servico}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getAgendaStatusColor(agendamento.status)}>
                                  {agendamento.status.replace('_', ' ')}
                                </Badge>
                                <div className="flex items-center text-xs text-gray-600">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {agendamento.localizacao}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Nenhum serviço agendado</p>
                      )}
                    </div>
                    
                    {equipe.observacoes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{equipe.observacoes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="agenda">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Agenda de Serviços</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Hoje
                    </Button>
                    <Button variant="outline" size="sm">
                      Semana
                    </Button>
                    <Button variant="outline" size="sm">
                      Mês
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">17 de Janeiro de 2024</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        &lt; Anterior
                      </Button>
                      <Button variant="outline" size="sm">
                        Próximo &gt;
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 border rounded-md bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-12 bg-yellow-500 rounded mr-3"></div>
                          <div>
                            <p className="font-medium">06:00 - 10:00</p>
                            <p className="text-sm">Limpeza de praça - Praça Central</p>
                            <div className="flex items-center mt-1">
                              <Badge className="bg-blue-100 text-blue-800 mr-2">Limpeza</Badge>
                              <span className="text-xs">Equipe Limpeza B</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Badge className="bg-yellow-100 text-yellow-800">Em Execução</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-12 bg-blue-500 rounded mr-3"></div>
                          <div>
                            <p className="font-medium">08:00 - 12:00</p>
                            <p className="text-sm">Manutenção de poste - Rua das Flores</p>
                            <div className="flex items-center mt-1">
                              <Badge className="bg-yellow-100 text-yellow-800 mr-2">Iluminação</Badge>
                              <span className="text-xs">Equipe Iluminação A</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-12 bg-green-500 rounded mr-3"></div>
                          <div>
                            <p className="font-medium">14:00 - 17:00</p>
                            <p className="text-sm">Coleta de eletrônicos - Centro Comunitário</p>
                            <div className="flex items-center mt-1">
                              <Badge className="bg-green-100 text-green-800 mr-2">Coleta</Badge>
                              <span className="text-xs">Equipe Coleta C</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendario">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Calendário de Serviços</CardTitle>
              </CardHeader>
              <CardContent className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Calendário de Serviços</h3>
                  <p className="text-gray-600">
                    Visualize e gerencie a programação de serviços no calendário
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estatisticas">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Equipes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-gray-600">8 ativas, 4 em manutenção</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Serviços Programados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">36</p>
                  <p className="text-xs text-gray-600">Para os próximos 7 dias</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">48</p>
                  <p className="text-xs text-gray-600">Distribuídos em equipes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">78%</p>
                  <p className="text-xs text-gray-600">Das equipes ativas</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo de Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Iluminação</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '30%'}}></div>
                        </div>
                        <span className="text-sm font-medium">3</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Limpeza</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '40%'}}></div>
                        </div>
                        <span className="text-sm font-medium">4</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Coleta</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '30%'}}></div>
                        </div>
                        <span className="text-sm font-medium">3</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Geral</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '20%'}}></div>
                        </div>
                        <span className="text-sm font-medium">2</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Desempenho das Equipes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Equipe Iluminação A</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                        </div>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Equipe Limpeza B</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '88%'}}></div>
                        </div>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Equipe Coleta C</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '76%'}}></div>
                        </div>
                        <span className="text-sm font-medium">76%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Equipe Geral D</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                        <span className="text-sm font-medium">65%</span>
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

export default ProgramacaoEquipes;
