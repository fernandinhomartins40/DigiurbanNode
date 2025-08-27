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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Clock,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { ApoioGuarda } from "@/types/seguranca-publica";

const mockApoios: ApoioGuarda[] = [
  {
    id: "1",
    protocolo: "AG2024001",
    tipo: "escolta",
    status: "aprovado",
    prioridade: "alta",
    solicitante: {
      nome: "João Santos",
      setor: "Secretaria de Educação",
      telefone: "(11) 99999-9999",
      email: "joao@prefeitura.gov.br"
    },
    descricao: "Escolta para transporte de valores da arrecadação escolar",
    local: "Escola Municipal Centro - Banco do Brasil",
    dataInicio: "2024-01-20",
    dataFim: "2024-01-20",
    horarioInicio: "14:00",
    horarioFim: "16:00",
    equipeSolicitada: 2,
    motivoSolicitacao: "Transporte de valores acima de R$ 10.000",
    dataCriacao: "2024-01-15T10:00:00"
  },
  {
    id: "2",
    protocolo: "AG2024002",
    tipo: "evento",
    status: "em_execucao",
    prioridade: "media",
    solicitante: {
      nome: "Maria Silva",
      setor: "Secretaria de Cultura",
      telefone: "(11) 88888-8888",
      email: "maria@prefeitura.gov.br"
    },
    descricao: "Segurança para evento cultural na praça",
    local: "Praça Central",
    dataInicio: "2024-01-25",
    dataFim: "2024-01-25",
    horarioInicio: "18:00",
    horarioFim: "22:00",
    equipeSolicitada: 4,
    motivoSolicitacao: "Evento com expectativa de 500 pessoas",
    dataCriacao: "2024-01-10T09:00:00"
  }
];

const ApoioGuardaMunicipal: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [selectedApoio, setSelectedApoio] = useState<ApoioGuarda | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "solicitado": return "bg-blue-100 text-blue-800";
      case "aprovado": return "bg-green-100 text-green-800";
      case "em_execucao": return "bg-yellow-100 text-yellow-800";
      case "concluido": return "bg-gray-100 text-gray-800";
      case "cancelado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "urgente": return "bg-red-500 text-white";
      case "alta": return "bg-orange-500 text-white";
      case "media": return "bg-yellow-500 text-white";
      case "baixa": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      escolta: "Escolta",
      patrulhamento: "Patrulhamento",
      evento: "Evento",
      investigacao: "Investigação",
      apoio_operacional: "Apoio Operacional"
    };
    return labels[tipo] || tipo;
  };

  const filteredApoios = mockApoios.filter(apoio => {
    const matchesSearch = searchTerm === "" || 
      apoio.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apoio.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apoio.solicitante.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || apoio.status === statusFilter;
    const matchesTipo = tipoFilter === "all" || apoio.tipo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Shield className="mr-3 h-8 w-8 text-blue-600" />
              Apoio da Guarda Municipal
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie solicitações de apoio da Guarda Municipal
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nova Solicitação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Nova Solicitação de Apoio</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Apoio</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="escolta">Escolta</SelectItem>
                        <SelectItem value="patrulhamento">Patrulhamento</SelectItem>
                        <SelectItem value="evento">Evento</SelectItem>
                        <SelectItem value="investigacao">Investigação</SelectItem>
                        <SelectItem value="apoio_operacional">Apoio Operacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Input id="local" placeholder="Endereço ou referência" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="dataInicio">Data Início</Label>
                      <Input id="dataInicio" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataFim">Data Fim</Label>
                      <Input id="dataFim" type="date" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="horarioInicio">Hora Início</Label>
                      <Input id="horarioInicio" type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horarioFim">Hora Fim</Label>
                      <Input id="horarioFim" type="time" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="equipe">Equipe Solicitada</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Número de guardas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Guarda</SelectItem>
                        <SelectItem value="2">2 Guardas</SelectItem>
                        <SelectItem value="3">3 Guardas</SelectItem>
                        <SelectItem value="4">4 Guardas</SelectItem>
                        <SelectItem value="5">5+ Guardas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="solicitanteNome">Nome do Solicitante</Label>
                    <Input id="solicitanteNome" placeholder="Nome completo" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setor">Setor/Secretaria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="educacao">Secretaria de Educação</SelectItem>
                        <SelectItem value="saude">Secretaria de Saúde</SelectItem>
                        <SelectItem value="cultura">Secretaria de Cultura</SelectItem>
                        <SelectItem value="obras">Secretaria de Obras</SelectItem>
                        <SelectItem value="assistencia">Assistência Social</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(11) 99999-9999" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@prefeitura.gov.br" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição da Solicitação</Label>
                    <textarea
                      id="descricao"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder="Descreva a necessidade de apoio..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivo">Motivo da Solicitação</Label>
                    <textarea
                      id="motivo"
                      className="w-full p-2 border rounded-md"
                      rows={2}
                      placeholder="Justifique a necessidade..."
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancelar</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Solicitar Apoio</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Solicitados</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Aprovados</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Em Execução</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-gray-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                  <p className="text-2xl font-bold">45</p>
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
                  placeholder="Buscar por protocolo, solicitante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="solicitado">Solicitado</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="em_execucao">Em Execução</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="escolta">Escolta</SelectItem>
                  <SelectItem value="patrulhamento">Patrulhamento</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="investigacao">Investigação</SelectItem>
                  <SelectItem value="apoio_operacional">Apoio Operacional</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Filtrar por Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Apoio</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApoios.map((apoio) => (
                  <TableRow key={apoio.id}>
                    <TableCell className="font-medium">{apoio.protocolo}</TableCell>
                    <TableCell>{getTipoLabel(apoio.tipo)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(apoio.status)}>
                        {apoio.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPrioridadeColor(apoio.prioridade)}>
                        {apoio.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{apoio.solicitante.nome}</p>
                        <p className="text-sm text-muted-foreground">{apoio.solicitante.setor}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(apoio.dataInicio).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">{apoio.horarioInicio} - {apoio.horarioFim}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {apoio.equipeSolicitada}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApoio(apoio)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedApoio && (
          <Dialog open={!!selectedApoio} onOpenChange={() => setSelectedApoio(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Detalhes da Solicitação - {selectedApoio.protocolo}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Apoio</Label>
                    <p className="text-sm">{getTipoLabel(selectedApoio.tipo)}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedApoio.status)}>
                      {selectedApoio.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <Badge className={getPrioridadeColor(selectedApoio.prioridade)}>
                      {selectedApoio.prioridade}
                    </Badge>
                  </div>
                  <div>
                    <Label>Local</Label>
                    <p className="text-sm flex items-center">
                      <MapPin className="mr-1 h-3 w-3" />
                      {selectedApoio.local}
                    </p>
                  </div>
                  <div>
                    <Label>Período</Label>
                    <p className="text-sm">
                      {new Date(selectedApoio.dataInicio).toLocaleDateString()} - {new Date(selectedApoio.dataFim).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedApoio.horarioInicio} às {selectedApoio.horarioFim}
                    </p>
                  </div>
                  <div>
                    <Label>Equipe Solicitada</Label>
                    <p className="text-sm flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {selectedApoio.equipeSolicitada} guardas
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Solicitante</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded">
                      <p><strong>Nome:</strong> {selectedApoio.solicitante.nome}</p>
                      <p><strong>Setor:</strong> {selectedApoio.solicitante.setor}</p>
                      <p><strong>Telefone:</strong> {selectedApoio.solicitante.telefone}</p>
                      <p><strong>Email:</strong> {selectedApoio.solicitante.email}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedApoio.descricao}</p>
                  </div>
                  <div>
                    <Label>Motivo da Solicitação</Label>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedApoio.motivoSolicitacao}</p>
                  </div>
                  {selectedApoio.observacoes && (
                    <div>
                      <Label>Observações</Label>
                      <p className="text-sm bg-gray-50 p-3 rounded">{selectedApoio.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedApoio(null)}>
                  Fechar
                </Button>
                {selectedApoio.status === 'solicitado' && (
                  <>
                    <Button variant="outline" className="text-red-600 border-red-600">
                      Rejeitar
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Aprovar
                    </Button>
                  </>
                )}
                {selectedApoio.status === 'aprovado' && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Iniciar Execução
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    
  );
};

export default ApoioGuardaMunicipal;
