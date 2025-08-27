
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Eye, MapPin, Trees } from "lucide-react";
import { AreaProtegida } from "@/types/meio-ambiente";

const mockAreas: AreaProtegida[] = [
  {
    id: "1",
    nome: "Reserva do Córrego Verde",
    tipo: "app",
    descricao: "Área de Preservação Permanente ao longo do Córrego Verde",
    localizacao: {
      coordenadas: {
        latitude: -23.5505,
        longitude: -46.6333
      },
      poligono: [
        { latitude: -23.5505, longitude: -46.6333 },
        { latitude: -23.5515, longitude: -46.6343 },
        { latitude: -23.5525, longitude: -46.6323 },
        { latitude: -23.5505, longitude: -46.6333 }
      ]
    },
    area: 15.5,
    status: "ativa",
    legislacao: "Lei Municipal 1234/2020",
    restricoes: ["Proibido construir", "Proibido desmatar", "Apenas atividades de preservação"],
    responsavel: "Secretaria do Meio Ambiente",
    dataCriacao: "2020-05-15",
    caracteristicas: {
      vegetacao: ["Mata ciliar", "Bambu nativo"],
      fauna: ["Capivaras", "Garças", "Sabiás"],
      recursosHidricos: ["Córrego Verde"]
    },
    fotos: ["area1.jpg", "area2.jpg"]
  },
  {
    id: "2",
    nome: "Parque Municipal da Serra",
    tipo: "parque",
    descricao: "Parque municipal com trilhas ecológicas e área de lazer",
    localizacao: {
      coordenadas: {
        latitude: -23.5605,
        longitude: -46.6433
      },
      poligono: [
        { latitude: -23.5605, longitude: -46.6433 },
        { latitude: -23.5655, longitude: -46.6483 },
        { latitude: -23.5685, longitude: -46.6453 },
        { latitude: -23.5605, longitude: -46.6433 }
      ]
    },
    area: 85.2,
    status: "ativa",
    legislacao: "Decreto Municipal 5678/2019",
    restricoes: ["Uso público controlado", "Horário de funcionamento limitado"],
    responsavel: "Secretaria do Meio Ambiente",
    dataCriacao: "2019-08-10",
    caracteristicas: {
      vegetacao: ["Cerrado", "Mata atlântica"],
      fauna: ["Quatis", "Tucanos", "Bugios"],
      recursosHidricos: ["Nascente da Serra", "Lago artificial"]
    },
    fotos: ["parque1.jpg", "parque2.jpg", "parque3.jpg"]
  }
];

const statusColors = {
  ativa: "bg-green-100 text-green-800",
  em_processo: "bg-yellow-100 text-yellow-800",
  suspensa: "bg-red-100 text-red-800"
};

export default function AreasProtegidas() {
  const [areas] = useState<AreaProtegida[]>(mockAreas);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredAreas = areas.filter((area) => {
    const matchesSearch = 
      area.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || area.status === statusFilter;
    const matchesTipo = tipoFilter === "all" || area.tipo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  return (
    
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Áreas Protegidas</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Área
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Nova Área Protegida</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova área de proteção ambiental
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Área</Label>
                    <Input id="nome" placeholder="Nome da área protegida" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Área</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reserva_legal">Reserva Legal</SelectItem>
                        <SelectItem value="app">APP</SelectItem>
                        <SelectItem value="parque">Parque</SelectItem>
                        <SelectItem value="reserva_biologica">Reserva Biológica</SelectItem>
                        <SelectItem value="arie">ARIE</SelectItem>
                        <SelectItem value="rppn">RPPN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Área (hectares)</Label>
                    <Input id="area" type="number" step="0.1" placeholder="0.0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legislacao">Legislação</Label>
                    <Input id="legislacao" placeholder="Lei ou decreto de criação" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea 
                    id="descricao" 
                    placeholder="Descrição da área protegida"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restricoes">Restrições</Label>
                  <Textarea 
                    id="restricoes" 
                    placeholder="Principais restrições de uso (uma por linha)"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vegetacao">Vegetação</Label>
                    <Textarea 
                      id="vegetacao" 
                      placeholder="Tipos de vegetação"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fauna">Fauna</Label>
                    <Textarea 
                      id="fauna" 
                      placeholder="Espécies da fauna"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recursos">Recursos Hídricos</Label>
                    <Textarea 
                      id="recursos" 
                      placeholder="Córregos, rios, nascentes"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Salvar Área
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Áreas</CardTitle>
              <Trees className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">
                +2 novas áreas este mês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Área Total</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.245 ha</div>
              <p className="text-xs text-muted-foreground">
                5.2% do território municipal
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">APPs</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">
                Áreas de Preservação Permanente
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parques</CardTitle>
              <Trees className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Parques municipais ativos
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Áreas Protegidas</CardTitle>
            <CardDescription>
              Gerencie todas as áreas de proteção ambiental do município
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="em_processo">Em Processo</SelectItem>
                  <SelectItem value="suspensa">Suspensa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="reserva_legal">Reserva Legal</SelectItem>
                  <SelectItem value="app">APP</SelectItem>
                  <SelectItem value="parque">Parque</SelectItem>
                  <SelectItem value="reserva_biologica">Reserva Biológica</SelectItem>
                  <SelectItem value="arie">ARIE</SelectItem>
                  <SelectItem value="rppn">RPPN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Área (ha)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Legislação</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAreas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell className="font-medium">
                        {area.nome}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {area.tipo === "reserva_legal" ? "Reserva Legal" :
                           area.tipo === "app" ? "APP" :
                           area.tipo === "parque" ? "Parque" :
                           area.tipo === "reserva_biologica" ? "Reserva Biológica" :
                           area.tipo === "arie" ? "ARIE" : "RPPN"}
                        </Badge>
                      </TableCell>
                      <TableCell>{area.area} ha</TableCell>
                      <TableCell>
                        <Badge className={statusColors[area.status]}>
                          {area.status === "ativa" ? "Ativa" :
                           area.status === "em_processo" ? "Em Processo" : "Suspensa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {area.legislacao}
                      </TableCell>
                      <TableCell>
                        {new Date(area.dataCriacao).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}
