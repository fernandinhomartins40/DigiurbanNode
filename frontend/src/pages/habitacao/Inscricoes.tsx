
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
import { Plus, Search, FileText, Eye, Users, TrendingUp } from "lucide-react";
import { Inscricao } from "@/types/habitacao";

const mockInscricoes: Inscricao[] = [
  {
    id: "1",
    numeroInscricao: "INS-2024-0001",
    cidadao: {
      nome: "Ana Paula Costa",
      cpf: "123.456.789-00",
      rg: "12.345.678-9",
      dataNascimento: "1985-03-15",
      telefone: "(11) 99999-9999",
      email: "ana.costa@email.com",
      endereco: {
        rua: "Rua das Flores",
        numero: "123",
        bairro: "Centro",
        cep: "12345-678",
        cidade: "São Paulo",
        estado: "SP"
      }
    },
    programa: "Minha Casa Minha Vida",
    situacaoFamiliar: {
      estadoCivil: "casada",
      numeroFilhos: 2,
      rendaFamiliar: 2500,
      composicaoFamiliar: [
        { nome: "João Costa", parentesco: "cônjuge", idade: 35, renda: 1500 },
        { nome: "Pedro Costa", parentesco: "filho", idade: 8, renda: 0 }
      ]
    },
    documentos: [
      { tipo: "CPF", nome: "cpf.pdf", url: "/docs/cpf.pdf", dataUpload: "2024-03-15" },
      { tipo: "Comprovante de Renda", nome: "renda.pdf", url: "/docs/renda.pdf", dataUpload: "2024-03-15" }
    ],
    status: "em_analise",
    dataInscricao: "2024-03-15",
    pontuacao: 85,
    observacoes: "Documentação completa"
  },
  {
    id: "2",
    numeroInscricao: "INS-2024-0002",
    cidadao: {
      nome: "Carlos Silva",
      cpf: "987.654.321-00",
      rg: "98.765.432-1",
      dataNascimento: "1980-07-22",
      telefone: "(11) 88888-8888",
      email: "carlos.silva@email.com",
      endereco: {
        rua: "Av. Principal",
        numero: "456",
        bairro: "Vila Nova",
        cep: "87654-321",
        cidade: "São Paulo",
        estado: "SP"
      }
    },
    programa: "Casa Verde e Amarela",
    situacaoFamiliar: {
      estadoCivil: "solteiro",
      numeroFilhos: 1,
      rendaFamiliar: 1800,
      composicaoFamiliar: [
        { nome: "Maria Silva", parentesco: "filha", idade: 12, renda: 0 }
      ]
    },
    documentos: [
      { tipo: "CPF", nome: "cpf.pdf", url: "/docs/cpf.pdf", dataUpload: "2024-03-10" }
    ],
    status: "aguardando_documentos",
    dataInscricao: "2024-03-10",
    observacoes: "Faltam documentos de comprovação de renda"
  }
];

const statusColors = {
  pendente: "bg-gray-100 text-gray-800",
  em_analise: "bg-blue-100 text-blue-800",
  aprovada: "bg-green-100 text-green-800",
  rejeitada: "bg-red-100 text-red-800",
  aguardando_documentos: "bg-yellow-100 text-yellow-800"
};

export default function HabitacaoInscricoes() {
  const [inscricoes] = useState<Inscricao[]>(mockInscricoes);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programaFilter, setProgramaFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredInscricoes = inscricoes.filter((inscricao) => {
    const matchesSearch = 
      inscricao.numeroInscricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inscricao.cidadao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inscricao.cidadao.cpf.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || inscricao.status === statusFilter;
    const matchesPrograma = programaFilter === "all" || inscricao.programa === programaFilter;
    
    return matchesSearch && matchesStatus && matchesPrograma;
  });

  return (
    
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Inscrições - Habitação</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Inscrição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Inscrição</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova inscrição nos programas habitacionais
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input id="nome" placeholder="Nome completo do inscrito" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input id="cpf" placeholder="000.000.000-00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rg">RG</Label>
                      <Input id="rg" placeholder="00.000.000-0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nascimento">Data de Nascimento</Label>
                      <Input id="nascimento" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Endereço</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="rua">Rua</Label>
                      <Input id="rua" placeholder="Nome da rua" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input id="numero" placeholder="123" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input id="bairro" placeholder="Nome do bairro" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input id="cep" placeholder="00000-000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="programa">Programa</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o programa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minha_casa">Minha Casa Minha Vida</SelectItem>
                          <SelectItem value="casa_verde">Casa Verde e Amarela</SelectItem>
                          <SelectItem value="aluguel_social">Aluguel Social</SelectItem>
                          <SelectItem value="reforma">Programa de Reforma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Situação Familiar</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estado_civil">Estado Civil</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                          <SelectItem value="casado">Casado(a)</SelectItem>
                          <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                          <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filhos">Número de Filhos</Label>
                      <Input id="filhos" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="renda">Renda Familiar</Label>
                      <Input id="renda" type="number" placeholder="0,00" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Salvar Inscrição
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Inscrições</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-xs text-muted-foreground">
                +18% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aguardando Docs</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">67</div>
              <p className="text-xs text-muted-foreground">
                -3% em relação à semana anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Inscrições</CardTitle>
            <CardDescription>
              Gerencie todas as inscrições nos programas habitacionais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, nome ou CPF..."
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
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="aguardando_documentos">Aguardando Docs</SelectItem>
                </SelectContent>
              </Select>
              <Select value={programaFilter} onValueChange={setProgramaFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Programa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os programas</SelectItem>
                  <SelectItem value="Minha Casa Minha Vida">Minha Casa Minha Vida</SelectItem>
                  <SelectItem value="Casa Verde e Amarela">Casa Verde e Amarela</SelectItem>
                  <SelectItem value="Aluguel Social">Aluguel Social</SelectItem>
                  <SelectItem value="Programa de Reforma">Programa de Reforma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Inscrito</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Renda Familiar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInscricoes.map((inscricao) => (
                    <TableRow key={inscricao.id}>
                      <TableCell className="font-medium">
                        {inscricao.numeroInscricao}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inscricao.cidadao.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {inscricao.cidadao.cpf}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{inscricao.programa}</TableCell>
                      <TableCell>
                        R$ {inscricao.situacaoFamiliar.rendaFamiliar.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[inscricao.status]}>
                          {inscricao.status === "pendente" ? "Pendente" :
                           inscricao.status === "em_analise" ? "Em Análise" :
                           inscricao.status === "aprovada" ? "Aprovada" :
                           inscricao.status === "rejeitada" ? "Rejeitada" : "Aguardando Docs"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {inscricao.pontuacao ? (
                          <Badge variant="outline">{inscricao.pontuacao} pts</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(inscricao.dataInscricao).toLocaleDateString('pt-BR')}
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
