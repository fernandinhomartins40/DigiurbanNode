
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
import { Plus, Search, Eye, MapPin, AlertTriangle } from "lucide-react";
import { DenunciaAmbiental } from "@/types/meio-ambiente";

const mockDenuncias: DenunciaAmbiental[] = [
  {
    id: "1",
    protocolo: "DEN-2024-001",
    denunciante: {
      nome: "João Silva",
      cpf: "123.456.789-00",
      telefone: "(11) 99999-9999",
      email: "joao.silva@email.com"
    },
    tipoViolacao: "desmatamento",
    descricao: "Desmatamento irregular em área de preservação permanente próximo ao córrego",
    localizacao: {
      endereco: "Estrada Rural, Km 15 - Zona Rural",
      coordenadas: {
        latitude: -23.5505,
        longitude: -46.6333
      }
    },
    gravidade: "alta",
    status: "em_investigacao",
    dataRegistro: "2024-03-15",
    dataVistoria: "2024-03-20",
    fotos: ["foto1.jpg", "foto2.jpg"],
    observacoes: "Área de aproximadamente 2 hectares",
    responsavel: "Ana Costa"
  },
  {
    id: "2",
    protocolo: "DEN-2024-002",
    denunciante: {
      nome: "Maria Santos",
      cpf: "987.654.321-00",
      telefone: "(11) 88888-8888",
      email: "maria.santos@email.com"
    },
    tipoViolacao: "poluicao_agua",
    descricao: "Despejo de efluentes industriais sem tratamento no rio",
    localizacao: {
      endereco: "Av. Industrial, 500 - Distrito Industrial",
      coordenadas: {
        latitude: -23.5605,
        longitude: -46.6433
      }
    },
    gravidade: "critica",
    status: "comprovada",
    dataRegistro: "2024-03-10",
    dataVistoria: "2024-03-12",
    fotos: ["efluente1.jpg"],
    observacoes: "Empresa autuada e obrigada a cessar despejo",
    responsavel: "Carlos Santos"
  }
];

const statusColors = {
  registrada: "bg-blue-100 text-blue-800",
  em_investigacao: "bg-yellow-100 text-yellow-800",
  em_vistoria: "bg-orange-100 text-orange-800",
  comprovada: "bg-red-100 text-red-800",
  improcedente: "bg-gray-100 text-gray-800",
  resolvida: "bg-green-100 text-green-800"
};

const gravidadeColors = {
  baixa: "bg-green-100 text-green-800",
  media: "bg-yellow-100 text-yellow-800",
  alta: "bg-orange-100 text-orange-800",
  critica: "bg-red-100 text-red-800"
};

export default function RegistroDenuncias() {
  const [denuncias] = useState<DenunciaAmbiental[]>(mockDenuncias);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gravidadeFilter, setGravidadeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredDenuncias = denuncias.filter((denuncia) => {
    const matchesSearch = 
      denuncia.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      denuncia.denunciante?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      denuncia.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || denuncia.status === statusFilter;
    const matchesGravidade = gravidadeFilter === "all" || denuncia.gravidade === gravidadeFilter;
    
    return matchesSearch && matchesStatus && matchesGravidade;
  });

  return (
    
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Registro de Denúncias Ambientais</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Denúncia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Nova Denúncia Ambiental</DialogTitle>
                <DialogDescription>
                  Registre uma nova denúncia de violação ambiental
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Denunciante (opcional)</Label>
                    <Input id="nome" placeholder="Nome completo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF (opcional)</Label>
                    <Input id="cpf" placeholder="000.000.000-00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="email@exemplo.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoViolacao">Tipo de Violação</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desmatamento">Desmatamento</SelectItem>
                        <SelectItem value="poluicao_agua">Poluição da Água</SelectItem>
                        <SelectItem value="poluicao_ar">Poluição do Ar</SelectItem>
                        <SelectItem value="descarte_irregular">Descarte Irregular</SelectItem>
                        <SelectItem value="ruido">Poluição Sonora</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gravidade">Gravidade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a gravidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Localização da Ocorrência</Label>
                  <Input id="endereco" placeholder="Endereço ou ponto de referência" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição da Denúncia</Label>
                  <Textarea 
                    id="descricao" 
                    placeholder="Descreva detalhadamente a violação ambiental observada"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações Adicionais</Label>
                  <Textarea 
                    id="observacoes" 
                    placeholder="Informações complementares (opcional)"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Registrar Denúncia
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Denúncias</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">567</div>
              <p className="text-xs text-muted-foreground">
                +23% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Investigação</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +5% em relação à semana anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comprovadas</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-muted-foreground">
                +18% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Requer ação imediata
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Denúncias</CardTitle>
            <CardDescription>
              Gerencie todas as denúncias ambientais registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por protocolo, denunciante ou descrição..."
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
                  <SelectItem value="registrada">Registrada</SelectItem>
                  <SelectItem value="em_investigacao">Em Investigação</SelectItem>
                  <SelectItem value="em_vistoria">Em Vistoria</SelectItem>
                  <SelectItem value="comprovada">Comprovada</SelectItem>
                  <SelectItem value="improcedente">Improcedente</SelectItem>
                  <SelectItem value="resolvida">Resolvida</SelectItem>
                </SelectContent>
              </Select>
              <Select value={gravidadeFilter} onValueChange={setGravidadeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Gravidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as gravidades</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Denunciante</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Gravidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDenuncias.map((denuncia) => (
                    <TableRow key={denuncia.id}>
                      <TableCell className="font-medium">
                        {denuncia.protocolo}
                      </TableCell>
                      <TableCell>
                        {denuncia.denunciante ? (
                          <div>
                            <div className="font-medium">{denuncia.denunciante.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {denuncia.denunciante.cpf}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Anônima</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {denuncia.tipoViolacao === "desmatamento" ? "Desmatamento" :
                           denuncia.tipoViolacao === "poluicao_agua" ? "Poluição da Água" :
                           denuncia.tipoViolacao === "poluicao_ar" ? "Poluição do Ar" :
                           denuncia.tipoViolacao === "descarte_irregular" ? "Descarte Irregular" :
                           denuncia.tipoViolacao === "ruido" ? "Poluição Sonora" : "Outros"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {denuncia.localizacao.endereco}
                      </TableCell>
                      <TableCell>
                        <Badge className={gravidadeColors[denuncia.gravidade]}>
                          {denuncia.gravidade === "baixa" ? "Baixa" :
                           denuncia.gravidade === "media" ? "Média" :
                           denuncia.gravidade === "alta" ? "Alta" : "Crítica"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[denuncia.status]}>
                          {denuncia.status === "registrada" ? "Registrada" :
                           denuncia.status === "em_investigacao" ? "Em Investigação" :
                           denuncia.status === "em_vistoria" ? "Em Vistoria" :
                           denuncia.status === "comprovada" ? "Comprovada" :
                           denuncia.status === "improcedente" ? "Improcedente" : "Resolvida"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(denuncia.dataRegistro).toLocaleDateString('pt-BR')}
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
