
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
import { Plus, Search, FileText, Eye, MapPin, Calendar } from "lucide-react";
import { LicencaAmbiental } from "@/types/meio-ambiente";

const mockLicencas: LicencaAmbiental[] = [
  {
    id: "1",
    numeroLicenca: "LP-2024-001",
    requerente: {
      nome: "Empresa ABC Ltda",
      cpfCnpj: "12.345.678/0001-90",
      telefone: "(11) 3333-3333",
      email: "contato@empresaabc.com",
      endereco: "Av. Industrial, 1000 - Distrito Industrial"
    },
    tipoLicenca: "previa",
    atividade: "Indústria Química",
    descricaoAtividade: "Fabricação de produtos químicos básicos",
    localizacao: {
      endereco: "Av. Industrial, 1000 - Distrito Industrial",
      coordenadas: {
        latitude: -23.5505,
        longitude: -46.6333
      },
      area: 5000
    },
    status: "em_analise",
    dataProtocolo: "2024-03-01",
    dataVencimento: "2026-03-01",
    condicoes: ["Monitoramento da qualidade do ar", "Tratamento de efluentes"],
    documentos: [
      {
        tipo: "EIA/RIMA",
        nome: "estudo_impacto_ambiental.pdf",
        url: "/docs/eia_rima.pdf",
        dataUpload: "2024-03-01"
      }
    ],
    historico: [
      {
        data: "2024-03-01",
        acao: "Protocolo",
        observacao: "Documentação protocolada",
        responsavel: "João Silva"
      }
    ]
  },
  {
    id: "2",
    numeroLicenca: "LO-2024-002",
    requerente: {
      nome: "Indústria XYZ S.A.",
      cpfCnpj: "98.765.432/0001-10",
      telefone: "(11) 4444-4444",
      email: "licencas@industriaxyz.com",
      endereco: "Rua da Fábrica, 500 - Industrial"
    },
    tipoLicenca: "operacao",
    atividade: "Indústria Alimentícia",
    descricaoAtividade: "Processamento de alimentos",
    localizacao: {
      endereco: "Rua da Fábrica, 500 - Industrial",
      coordenadas: {
        latitude: -23.5605,
        longitude: -46.6433
      },
      area: 3000
    },
    status: "aprovada",
    dataProtocolo: "2024-01-15",
    dataVencimento: "2029-01-15",
    condicoes: ["Gestão de resíduos orgânicos", "Controle de emissões"],
    documentos: [],
    historico: [
      {
        data: "2024-01-15",
        acao: "Protocolo",
        observacao: "Documentação protocolada",
        responsavel: "Maria Santos"
      },
      {
        data: "2024-02-20",
        acao: "Aprovação",
        observacao: "Licença aprovada com condicionantes",
        responsavel: "Ana Costa"
      }
    ]
  }
];

const statusColors = {
  protocolada: "bg-blue-100 text-blue-800",
  em_analise: "bg-yellow-100 text-yellow-800",
  em_vistoria: "bg-orange-100 text-orange-800",
  aprovada: "bg-green-100 text-green-800",
  negada: "bg-red-100 text-red-800",
  vencida: "bg-gray-100 text-gray-800"
};

export default function LicencasAmbientais() {
  const [licencas] = useState<LicencaAmbiental[]>(mockLicencas);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredLicencas = licencas.filter((licenca) => {
    const matchesSearch = 
      licenca.numeroLicenca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      licenca.requerente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      licenca.atividade.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || licenca.status === statusFilter;
    const matchesTipo = tipoFilter === "all" || licenca.tipoLicenca === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  return (
    
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Licenças Ambientais</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Licença
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Nova Licença Ambiental</DialogTitle>
                <DialogDescription>
                  Registre uma nova solicitação de licença ambiental
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requerente">Nome/Razão Social</Label>
                    <Input id="requerente" placeholder="Nome do requerente" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                    <Input id="cpfCnpj" placeholder="000.000.000-00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoLicenca">Tipo de Licença</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="previa">Licença Prévia (LP)</SelectItem>
                        <SelectItem value="instalacao">Licença de Instalação (LI)</SelectItem>
                        <SelectItem value="operacao">Licença de Operação (LO)</SelectItem>
                        <SelectItem value="corretiva">Licença Corretiva (LC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="atividade">Atividade</Label>
                    <Input id="atividade" placeholder="Tipo de atividade" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço do Empreendimento</Label>
                  <Input id="endereco" placeholder="Endereço completo" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Área (m²)</Label>
                    <Input id="area" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(00) 0000-0000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricaoAtividade">Descrição da Atividade</Label>
                  <Textarea 
                    id="descricaoAtividade" 
                    placeholder="Descreva detalhadamente a atividade"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Salvar Licença
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Licenças</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">
                +8% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação à semana anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">287</div>
              <p className="text-xs text-muted-foreground">
                +5% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                Próximos 90 dias
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Licenças</CardTitle>
            <CardDescription>
              Gerencie todas as licenças ambientais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, requerente ou atividade..."
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
                  <SelectItem value="protocolada">Protocolada</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="em_vistoria">Em Vistoria</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="negada">Negada</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="previa">Licença Prévia</SelectItem>
                  <SelectItem value="instalacao">Licença de Instalação</SelectItem>
                  <SelectItem value="operacao">Licença de Operação</SelectItem>
                  <SelectItem value="corretiva">Licença Corretiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Requerente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLicencas.map((licenca) => (
                    <TableRow key={licenca.id}>
                      <TableCell className="font-medium">
                        {licenca.numeroLicenca}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{licenca.requerente.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {licenca.requerente.cpfCnpj}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {licenca.tipoLicenca === "previa" ? "LP" :
                           licenca.tipoLicenca === "instalacao" ? "LI" :
                           licenca.tipoLicenca === "operacao" ? "LO" : "LC"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {licenca.atividade}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[licenca.status]}>
                          {licenca.status === "protocolada" ? "Protocolada" :
                           licenca.status === "em_analise" ? "Em Análise" :
                           licenca.status === "em_vistoria" ? "Em Vistoria" :
                           licenca.status === "aprovada" ? "Aprovada" :
                           licenca.status === "negada" ? "Negada" : "Vencida"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {licenca.dataVencimento ? 
                          new Date(licenca.dataVencimento).toLocaleDateString('pt-BR') : 
                          "-"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
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
