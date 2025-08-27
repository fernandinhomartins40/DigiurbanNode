
import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calendar, Search, Plus, Eye, MapPin, DollarSign, Users, Building, Wrench } from "lucide-react";
import { ObraPublica, PequenaIntervencao } from "@/types/obras-publicas";

const ObrasIntervencoes: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("obras");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");

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
        fonte: "Recursos Próprios",
        numeroEmpenho: "EMP-2024-0015"
      },
      cronograma: {
        dataInicio: "2024-01-15",
        dataPrevisaoTermino: "2024-04-15",
        percentualConcluido: 50
      },
      fiscalizacao: {
        responsavelFiscalizacao: "Eng. Maria Santos",
        ultimaVistoria: "2024-01-20",
        proximaVistoria: "2024-01-27"
      },
      documentos: [],
      fotos: [],
      observacoes: "Obra em andamento normal"
    }
  ];

  // Mock data for pequenas intervenções
  const intervencoes: PequenaIntervencao[] = [
    {
      id: "1",
      numeroOS: "OS-2024-001",
      descricao: "Tapa buraco na Rua das Flores",
      tipo: "tapa_buraco",
      localizacao: {
        endereco: "Rua das Flores, 123",
        bairro: "Jardim América",
        coordenadas: { latitude: -23.5505, longitude: -46.6333 }
      },
      status: "agendada",
      prioridade: "alta",
      equipe: {
        responsavel: "José Santos",
        membros: ["Carlos Silva", "Pedro Oliveira"],
        equipamentos: ["Caminhão", "Compactador"]
      },
      agendamento: {
        dataAgendada: "2024-01-22",
        horaInicio: "08:00",
        horaFim: "16:00"
      },
      custo: {
        valorEstimado: 800,
        materiais: [
          { item: "Asfalto", quantidade: 2, valor: 300 },
          { item: "Brita", quantidade: 1, valor: 100 }
        ]
      },
      dataAbertura: "2024-01-20",
      fotos: [],
      observacoes: "Buraco de grande porte"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      planejada: "bg-gray-100 text-gray-800",
      licitacao: "bg-blue-100 text-blue-800",
      contratada: "bg-purple-100 text-purple-800",
      em_andamento: "bg-yellow-100 text-yellow-800",
      paralisada: "bg-red-100 text-red-800",
      concluida: "bg-green-100 text-green-800",
      cancelada: "bg-gray-100 text-gray-800",
      solicitada: "bg-blue-100 text-blue-800",
      agendada: "bg-yellow-100 text-yellow-800",
      em_execucao: "bg-orange-100 text-orange-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Building className="mr-3 h-8 w-8" />
              Obras e Pequenas Intervenções
            </h1>
            <p className="text-gray-600">Gerencie obras públicas e pequenas intervenções</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova {selectedTab === "obras" ? "Obra" : "Intervenção"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  Nova {selectedTab === "obras" ? "Obra" : "Intervenção"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {selectedTab === "obras" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome">Nome da Obra</Label>
                        <Input id="nome" placeholder="Nome da obra" />
                      </div>
                      <div>
                        <Label htmlFor="categoria">Categoria</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
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
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea id="descricao" placeholder="Descrição da obra" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="endereco">Endereço</Label>
                        <Input id="endereco" placeholder="Endereço da obra" />
                      </div>
                      <div>
                        <Label htmlFor="valor">Valor Contratado</Label>
                        <Input id="valor" placeholder="R$ 0,00" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Input id="descricao" placeholder="Descrição da intervenção" />
                      </div>
                      <div>
                        <Label htmlFor="tipo">Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tapa_buraco">Tapa Buraco</SelectItem>
                            <SelectItem value="limpeza_terreno">Limpeza de Terreno</SelectItem>
                            <SelectItem value="poda_arvores">Poda de Árvores</SelectItem>
                            <SelectItem value="pintura">Pintura</SelectItem>
                            <SelectItem value="sinalizacao">Sinalização</SelectItem>
                            <SelectItem value="reparo_calcada">Reparo de Calçada</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input id="endereco" placeholder="Endereço da intervenção" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="responsavel">Responsável</Label>
                        <Input id="responsavel" placeholder="Nome do responsável" />
                      </div>
                      <div>
                        <Label htmlFor="dataAgendada">Data Agendada</Label>
                        <Input id="dataAgendada" type="date" />
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, contrato ou endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="planejada">Planejada</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="paralisada">Paralisada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="obras">Obras Públicas</TabsTrigger>
            <TabsTrigger value="intervencoes">Pequenas Intervenções</TabsTrigger>
          </TabsList>

          <TabsContent value="obras">
            <div className="grid gap-4">
              {obras.map((obra) => (
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
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="mr-2 h-4 w-4" />
                            {obra.localizacao.endereco}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Building className="mr-2 h-4 w-4" />
                            {obra.contratada.empresa}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="mr-2 h-4 w-4" />
                            R$ {obra.orcamento.valorContratado.toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="mr-2 h-4 w-4" />
                            Previsão: {new Date(obra.cronograma.dataPrevisaoTermino).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="mr-2 h-4 w-4" />
                            Fiscal: {obra.fiscalizacao.responsavelFiscalizacao}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso da Obra</span>
                          <span>{obra.cronograma.percentualConcluido}%</span>
                        </div>
                        <Progress value={obra.cronograma.percentualConcluido} className="h-2" />
                      </div>
                      <p className="text-sm text-gray-700">{obra.descricao}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="intervencoes">
            <div className="grid gap-4">
              {intervencoes.map((intervencao) => (
                <Card key={intervencao.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{intervencao.numeroOS}</CardTitle>
                        <Badge className={getStatusColor(intervencao.status)}>
                          {intervencao.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{intervencao.tipo.replace('_', ' ')}</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {intervencao.localizacao.endereco}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Wrench className="mr-2 h-4 w-4" />
                          {intervencao.descricao}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="mr-2 h-4 w-4" />
                          {intervencao.equipe.responsavel}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(intervencao.agendamento.dataAgendada).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="mr-2 h-4 w-4" />
                          R$ {intervencao.custo.valorEstimado.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default ObrasIntervencoes;
