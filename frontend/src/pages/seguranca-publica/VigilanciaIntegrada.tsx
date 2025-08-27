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
  Eye,
  Camera,
  Plus,
  Search,
  MapPin,
  Signal,
  Settings,
  AlertTriangle,
  CheckCircle,
  PauseCircle,
  Wifi,
  Calendar
} from "lucide-react";
import { SistemaVigilancia } from "@/types/seguranca-publica";

const mockSistemas: SistemaVigilancia[] = [
  {
    id: "1",
    nome: "CAM-001 - Praça Central",
    tipo: "camera_fixa",
    status: "online",
    localizacao: "Praça Central, Centro",
    coordenadas: { lat: -23.5505, lng: -46.6333 },
    especificacoes: {
      resolucao: "1080p",
      visao_noturna: true,
      zoom: "10x",
      angulo_visao: "120°"
    },
    conectividade: "4g",
    qualidadeSinal: 85,
    ultimaManutencao: "2023-12-10",
    proximaManutencao: "2024-03-10",
    alertasConfigurados: ["movimento suspeito", "aglomeração"],
    gravacoes: {
      duracao_retencao: 30,
      qualidade: "alta",
      backup: true
    },
    responsavel: "Depto. Vigilância Eletrônica"
  },
  {
    id: "2",
    nome: "CAM-002 - Terminal Rodoviário",
    tipo: "camera_movel",
    status: "online",
    localizacao: "Terminal Rodoviário Municipal",
    coordenadas: { lat: -23.5515, lng: -46.6343 },
    especificacoes: {
      resolucao: "4K",
      visao_noturna: true,
      zoom: "20x",
      angulo_visao: "360°"
    },
    conectividade: "ethernet",
    qualidadeSinal: 95,
    ultimaManutencao: "2024-01-05",
    proximaManutencao: "2024-04-05",
    alertasConfigurados: ["objeto abandonado", "movimento suspeito", "reconhecimento facial"],
    gravacoes: {
      duracao_retencao: 60,
      qualidade: "ultra HD",
      backup: true
    },
    responsavel: "Depto. Vigilância Eletrônica"
  },
  {
    id: "3",
    nome: "SENS-001 - Parque Municipal",
    tipo: "sensor_movimento",
    status: "manutencao",
    localizacao: "Parque Municipal",
    coordenadas: { lat: -23.5520, lng: -46.6350 },
    especificacoes: {
      alcance: "50m"
    },
    conectividade: "wifi",
    qualidadeSinal: 75,
    ultimaManutencao: "2023-11-15",
    proximaManutencao: "2024-02-15",
    alertasConfigurados: ["movimento noturno", "perímetro"],
    responsavel: "Depto. Vigilância Eletrônica"
  }
];

const VigilanciaIntegrada: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSistema, setSelectedSistema] = useState<SistemaVigilancia | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-100 text-green-800";
      case "offline": return "bg-red-100 text-red-800";
      case "manutencao": return "bg-yellow-100 text-yellow-800";
      case "erro": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      camera_fixa: "Câmera Fixa",
      camera_movel: "Câmera Móvel",
      sensor_movimento: "Sensor de Movimento",
      alarme: "Alarme",
      cerca_eletronica: "Cerca Eletrônica"
    };
    return labels[tipo] || tipo;
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "camera_fixa":
      case "camera_movel":
        return <Camera className="h-4 w-4" />;
      case "sensor_movimento":
        return <Eye className="h-4 w-4" />;
      case "alarme":
        return <AlertTriangle className="h-4 w-4" />;
      case "cerca_eletronica":
        return <Signal className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const filteredSistemas = mockSistemas.filter(sistema => {
    const matchesSearch = searchTerm === "" || 
      sistema.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sistema.localizacao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = tipoFilter === "all" || sistema.tipo === tipoFilter;
    const matchesStatus = statusFilter === "all" || sistema.status === statusFilter;
    
    return matchesSearch && matchesTipo && matchesStatus;
  });

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Camera className="mr-3 h-8 w-8 text-blue-600" />
              Vigilância Integrada
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestão dos sistemas de monitoramento e vigilância eletrônica
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Sistema
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Adicionar Sistema de Vigilância</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Sistema</Label>
                  <Input id="nome" placeholder="Ex: CAM-001 - Praça Central" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Sistema</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="camera_fixa">Câmera Fixa</SelectItem>
                      <SelectItem value="camera_movel">Câmera Móvel</SelectItem>
                      <SelectItem value="sensor_movimento">Sensor de Movimento</SelectItem>
                      <SelectItem value="alarme">Alarme</SelectItem>
                      <SelectItem value="cerca_eletronica">Cerca Eletrônica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input id="localizacao" placeholder="Endereço ou referência" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conectividade">Tipo de Conectividade</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wifi">WiFi</SelectItem>
                      <SelectItem value="ethernet">Ethernet</SelectItem>
                      <SelectItem value="4g">4G</SelectItem>
                      <SelectItem value="5g">5G</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input id="responsavel" placeholder="Departamento ou pessoa responsável" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancelar</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Adicionar Sistema</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Online</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Offline</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <PauseCircle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Manutenção</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Camera className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">50</p>
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
                  placeholder="Buscar por nome ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Sistema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="camera_fixa">Câmera Fixa</SelectItem>
                  <SelectItem value="camera_movel">Câmera Móvel</SelectItem>
                  <SelectItem value="sensor_movimento">Sensor de Movimento</SelectItem>
                  <SelectItem value="alarme">Alarme</SelectItem>
                  <SelectItem value="cerca_eletronica">Cerca Eletrônica</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="erro">Erro</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full">
                <MapPin className="mr-2 h-4 w-4" />
                Ver no Mapa
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistemas de Vigilância</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Conectividade</TableHead>
                  <TableHead>Última Manutenção</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSistemas.map((sistema) => (
                  <TableRow key={sistema.id}>
                    <TableCell className="font-medium">{sistema.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getTipoIcon(sistema.tipo)}
                        <span className="ml-2">{getTipoLabel(sistema.tipo)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sistema.status)}>
                        {sistema.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {sistema.localizacao}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Wifi className="mr-1 h-3 w-3" />
                        {sistema.conectividade.toUpperCase()}
                        <Badge variant="outline" className="ml-2">
                          {sistema.qualidadeSinal}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(sistema.ultimaManutencao).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSistema(sistema)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedSistema && (
          <Dialog open={!!selectedSistema} onOpenChange={() => setSelectedSistema(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Detalhes do Sistema - {selectedSistema.nome}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Tipo</Label>
                    <p className="text-sm flex items-center">
                      {getTipoIcon(selectedSistema.tipo)}
                      <span className="ml-2">{getTipoLabel(selectedSistema.tipo)}</span>
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedSistema.status)}>
                      {selectedSistema.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Localização</Label>
                    <p className="text-sm flex items-center">
                      <MapPin className="mr-1 h-3 w-3" />
                      {selectedSistema.localizacao}
                    </p>
                    <div className="mt-2 bg-gray-100 h-32 rounded-lg flex items-center justify-center">
                      <p className="text-sm text-gray-500">Mapa de localização</p>
                    </div>
                  </div>
                  <div>
                    <Label>Conectividade</Label>
                    <div className="flex items-center mt-1">
                      <Wifi className="mr-2 h-4 w-4" />
                      <span>{selectedSistema.conectividade.toUpperCase()}</span>
                      <div className="ml-auto flex items-center">
                        <span className="mr-2">Sinal:</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-green-500" 
                            style={{ width: `${selectedSistema.qualidadeSinal}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">{selectedSistema.qualidadeSinal}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedSistema.especificacoes && (
                    <div>
                      <Label>Especificações</Label>
                      <div className="text-sm bg-gray-50 p-3 rounded">
                        {selectedSistema.especificacoes.resolucao && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Resolução:</span>
                            <span className="font-medium">{selectedSistema.especificacoes.resolucao}</span>
                          </div>
                        )}
                        {selectedSistema.especificacoes.visao_noturna !== undefined && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Visão Noturna:</span>
                            <span className="font-medium">{selectedSistema.especificacoes.visao_noturna ? "Sim" : "Não"}</span>
                          </div>
                        )}
                        {selectedSistema.especificacoes.zoom && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Zoom:</span>
                            <span className="font-medium">{selectedSistema.especificacoes.zoom}</span>
                          </div>
                        )}
                        {selectedSistema.especificacoes.angulo_visao && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Ângulo de Visão:</span>
                            <span className="font-medium">{selectedSistema.especificacoes.angulo_visao}</span>
                          </div>
                        )}
                        {selectedSistema.especificacoes.alcance && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Alcance:</span>
                            <span className="font-medium">{selectedSistema.especificacoes.alcance}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label>Manutenção</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Última:</span>
                        <span className="font-medium">{new Date(selectedSistema.ultimaManutencao).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Próxima:</span>
                        <span className="font-medium">{new Date(selectedSistema.proximaManutencao).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Alertas Configurados</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSistema.alertasConfigurados.map((alerta, index) => (
                        <Badge key={index} variant="outline">{alerta}</Badge>
                      ))}
                    </div>
                  </div>
                  {selectedSistema.gravacoes && (
                    <div>
                      <Label>Configurações de Gravação</Label>
                      <div className="text-sm bg-gray-50 p-3 rounded">
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Retenção:</span>
                          <span className="font-medium">{selectedSistema.gravacoes.duracao_retencao} dias</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Qualidade:</span>
                          <span className="font-medium">{selectedSistema.gravacoes.qualidade}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Backup:</span>
                          <span className="font-medium">{selectedSistema.gravacoes.backup ? "Sim" : "Não"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedSistema(null)}>
                  Fechar
                </Button>
                {selectedSistema.status === 'online' && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Visualizar Feed
                  </Button>
                )}
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    
  );
};

export default VigilanciaIntegrada;
