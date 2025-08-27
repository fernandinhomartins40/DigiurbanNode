
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
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Search, 
  FileText, 
  MapPin, 
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Users
} from "lucide-react";
import { ProcessoRegularizacao } from "@/types/habitacao";

const mockProcessos: ProcessoRegularizacao[] = [
  {
    id: "1",
    numeroProcesso: "REG-2024-001",
    interessado: {
      nome: "João da Silva",
      cpf: "123.456.789-00",
      telefone: "(11) 99999-9999",
      email: "joao.silva@email.com"
    },
    imovel: {
      endereco: "Rua das Palmeiras, 456 - Vila São José",
      area: 300,
      coordenadas: {
        latitude: -23.5505,
        longitude: -46.6333
      },
      tipoOcupacao: "posse",
      tempoOcupacao: 15
    },
    tipoRegularizacao: "usucapiao",
    etapa: "vistoria",
    status: "em_andamento",
    documentos: [
      {
        tipo: "CPF",
        nome: "cpf_joao.pdf",
        url: "/docs/cpf_joao.pdf",
        dataUpload: "2024-03-01",
        status: "aprovado"
      },
      {
        tipo: "Comprovante de Residência",
        nome: "comp_residencia.pdf",
        url: "/docs/comp_residencia.pdf",
        dataUpload: "2024-03-01",
        status: "aprovado"
      },
      {
        tipo: "Declaração de Confrontantes",
        nome: "declaracao_confrontantes.pdf",
        url: "/docs/declaracao_confrontantes.pdf",
        dataUpload: "2024-03-05",
        status: "pendente"
      }
    ],
    historico: [
      {
        data: "2024-03-01",
        etapa: "protocolo",
        observacao: "Processo protocolado com documentação inicial",
        responsavel: "Ana Santos"
      },
      {
        data: "2024-03-10",
        etapa: "analise_documental",
        observacao: "Documentação analisada e aprovada",
        responsavel: "Carlos Oliveira"
      },
      {
        data: "2024-03-15",
        etapa: "vistoria",
        observacao: "Vistoria agendada para 20/03/2024",
        responsavel: "Pedro Costa"
      }
    ],
    vistoria: {
      data: "2024-03-20",
      tecnico: "Pedro Costa",
      observacoes: "Imóvel ocupado há mais de 15 anos, área conforme declarado",
      fotos: ["/photos/vistoria1.jpg", "/photos/vistoria2.jpg"]
    },
    dataAbertura: "2024-03-01",
    previsaoConclusao: "2024-09-01"
  },
  {
    id: "2",
    numeroProcesso: "REG-2024-002",
    interessado: {
      nome: "Maria Fernanda Costa",
      cpf: "987.654.321-00",
      telefone: "(11) 88888-8888",
      email: "maria.costa@email.com"
    },
    imovel: {
      endereco: "Av. Central, 123 - Centro",
      area: 450,
      coordenadas: {
        latitude: -23.5489,
        longitude: -46.6388
      },
      tipoOcupacao: "proprio",
      tempoOcupacao: 8
    },
    tipoRegularizacao: "doacao",
    etapa: "analise_documental",
    status: "aguardando_documentos",
    documentos: [
      {
        tipo: "CPF",
        nome: "cpf_maria.pdf",
        url: "/docs/cpf_maria.pdf",
        dataUpload: "2024-03-05",
        status: "aprovado"
      },
      {
        tipo: "RG",
        nome: "rg_maria.pdf",
        url: "/docs/rg_maria.pdf",
        dataUpload: "2024-03-05",
        status: "rejeitado"
      }
    ],
    historico: [
      {
        data: "2024-03-05",
        etapa: "protocolo",
        observacao: "Processo protocolado",
        responsavel: "Ana Santos"
      },
      {
        data: "2024-03-08",
        etapa: "analise_documental",
        observacao: "Documentação incompleta - RG ilegível",
        responsavel: "Carlos Oliveira"
      }
    ],
    dataAbertura: "2024-03-05",
    previsaoConclusao: "2024-10-05"
  }
];

const statusColors = {
  em_andamento: "bg-blue-100 text-blue-800",
  aguardando_documentos: "bg-yellow-100 text-yellow-800",
  aguardando_vistoria: "bg-orange-100 text-orange-800",
  concluido: "bg-green-100 text-green-800",
  indeferido: "bg-red-100 text-red-800"
};

const etapaColors = {
  protocolo: "bg-gray-100 text-gray-800",
  analise_documental: "bg-blue-100 text-blue-800",
  vistoria: "bg-yellow-100 text-yellow-800",
  medicao: "bg-orange-100 text-orange-800",
  aprovacao: "bg-purple-100 text-purple-800",
  titulo: "bg-green-100 text-green-800"
};

const tipoRegularizacaoLabels = {
  usucapiao: "Usucapião",
  doacao: "Doação",
  compra_venda: "Compra e Venda",
  demarcacao: "Demarcação"
};

export default function HabitacaoRegularizacaoFundiaria() {
  const [processos] = useState<ProcessoRegularizacao[]>(mockProcessos);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [etapaFilter, setEtapaFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProcessos = processos.filter((processo) => {
    const matchesSearch = 
      processo.numeroProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.interessado.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.interessado.cpf.includes(searchTerm) ||
      processo.imovel.endereco.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || processo.status === statusFilter;
    const matchesEtapa = etapaFilter === "all" || processo.etapa === etapaFilter;
    const matchesTipo = tipoFilter === "all" || processo.tipoRegularizacao === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesEtapa && matchesTipo;
  });

  return (
    
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Regularização Fundiária</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Processo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Processo de Regularização</DialogTitle>
                <DialogDescription>
                  Cadastre um novo processo de regularização fundiária
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados do Interessado</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input id="nome" placeholder="Nome completo do interessado" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
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
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados do Imóvel</h3>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço Completo</Label>
                    <Input id="endereco" placeholder="Rua, número, bairro" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Área (m²)</Label>
                      <Input id="area" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo_ocupacao">Tipo de Ocupação</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="proprio">Próprio</SelectItem>
                          <SelectItem value="posse">Posse</SelectItem>
                          <SelectItem value="cessao">Cessão</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempo_ocupacao">Tempo de Ocupação (anos)</Label>
                      <Input id="tempo_ocupacao" type="number" placeholder="0" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tipo de Regularização</h3>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_regularizacao">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de regularização" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usucapiao">Usucapião</SelectItem>
                        <SelectItem value="doacao">Doação</SelectItem>
                        <SelectItem value="compra_venda">Compra e Venda</SelectItem>
                        <SelectItem value="demarcacao">Demarcação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea 
                      id="observacoes" 
                      placeholder="Observações sobre o processo"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Salvar Processo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">486</div>
              <p className="text-xs text-muted-foreground">
                +23 novos este mês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                26% do total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">298</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao ano anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aguardando Docs</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">61</div>
              <p className="text-xs text-muted-foreground">
                -8% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Processos de Regularização Fundiária</CardTitle>
            <CardDescription>
              Gerencie todos os processos de regularização fundiária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por processo, nome, CPF ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="aguardando_documentos">Aguardando Docs</SelectItem>
                  <SelectItem value="aguardando_vistoria">Aguardando Vistoria</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="indeferido">Indeferido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={etapaFilter} onValueChange={setEtapaFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as etapas</SelectItem>
                  <SelectItem value="protocolo">Protocolo</SelectItem>
                  <SelectItem value="analise_documental">Análise Documental</SelectItem>
                  <SelectItem value="vistoria">Vistoria</SelectItem>
                  <SelectItem value="medicao">Medição</SelectItem>
                  <SelectItem value="aprovacao">Aprovação</SelectItem>
                  <SelectItem value="titulo">Título</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="usucapiao">Usucapião</SelectItem>
                  <SelectItem value="doacao">Doação</SelectItem>
                  <SelectItem value="compra_venda">Compra e Venda</SelectItem>
                  <SelectItem value="demarcacao">Demarcação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Processo</TableHead>
                    <TableHead>Interessado</TableHead>
                    <TableHead>Imóvel</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcessos.map((processo) => {
                    const etapas = ["protocolo", "analise_documental", "vistoria", "medicao", "aprovacao", "titulo"];
                    const etapaAtual = etapas.indexOf(processo.etapa);
                    const progresso = ((etapaAtual + 1) / etapas.length) * 100;

                    return (
                      <TableRow key={processo.id}>
                        <TableCell className="font-medium">
                          {processo.numeroProcesso}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{processo.interessado.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {processo.interessado.cpf}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="truncate">{processo.imovel.endereco}</div>
                            <div className="text-sm text-muted-foreground">
                              {processo.imovel.area}m² - {processo.imovel.tempoOcupacao} anos
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {tipoRegularizacaoLabels[processo.tipoRegularizacao]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={etapaColors[processo.etapa]}>
                            {processo.etapa === "protocolo" ? "Protocolo" :
                             processo.etapa === "analise_documental" ? "Análise Doc" :
                             processo.etapa === "vistoria" ? "Vistoria" :
                             processo.etapa === "medicao" ? "Medição" :
                             processo.etapa === "aprovacao" ? "Aprovação" : "Título"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[processo.status]}>
                            {processo.status === "em_andamento" ? "Em Andamento" :
                             processo.status === "aguardando_documentos" ? "Aguardando Docs" :
                             processo.status === "aguardando_vistoria" ? "Aguardando Vistoria" :
                             processo.status === "concluido" ? "Concluído" : "Indeferido"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={progresso} className="h-2 w-20" />
                            <div className="text-xs text-muted-foreground">
                              {Math.round(progresso)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(processo.dataAbertura).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MapPin className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}
