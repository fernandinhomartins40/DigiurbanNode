
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Home, 
  Users, 
  Calendar, 
  Settings,
  TrendingUp,
  Building
} from "lucide-react";
import { ProgramaHabitacional } from "@/types/habitacao";

const mockProgramas: ProgramaHabitacional[] = [
  {
    id: "1",
    nome: "Minha Casa Minha Vida",
    descricao: "Programa habitacional para famílias de baixa renda com financiamento facilitado",
    tipo: "casa_propria",
    status: "ativo",
    criterios: {
      rendaMaxima: 2640,
      rendaMinima: 0,
      idadeMinima: 18,
      tempoResidencia: 24,
      outros: ["Primeira casa própria", "Família com crianças tem prioridade"]
    },
    beneficios: ["Subsídio de até R$ 47.500", "Taxa de juros reduzida", "FGTS como entrada"],
    vagas: {
      total: 1000,
      ocupadas: 750,
      disponiveis: 250
    },
    prazoInscricao: {
      inicio: "2024-01-01",
      fim: "2024-12-31"
    },
    documentosNecessarios: [
      "CPF e RG",
      "Comprovante de renda",
      "Comprovante de residência",
      "Certidão de nascimento dos filhos"
    ],
    responsavel: "Maria Santos",
    dataCriacao: "2024-01-01",
    dataAtualizacao: "2024-03-15"
  },
  {
    id: "2",
    nome: "Casa Verde e Amarela",
    descricao: "Novo programa habitacional com foco em sustentabilidade",
    tipo: "casa_propria",
    status: "ativo",
    criterios: {
      rendaMaxima: 7000,
      rendaMinima: 1800,
      tempoResidencia: 12,
      outros: ["Preferência para profissionais da área da saúde e educação"]
    },
    beneficios: ["Desconto no valor do imóvel", "Condições especiais de financiamento"],
    vagas: {
      total: 500,
      ocupadas: 200,
      disponiveis: 300
    },
    prazoInscricao: {
      inicio: "2024-02-01",
      fim: "2024-11-30"
    },
    documentosNecessarios: [
      "Documentos pessoais",
      "Comprovante de renda dos últimos 3 meses",
      "Declaração de Imposto de Renda"
    ],
    responsavel: "João Silva",
    dataCriacao: "2024-02-01",
    dataAtualizacao: "2024-03-10"
  },
  {
    id: "3",
    nome: "Aluguel Social",
    descricao: "Auxílio para pagamento de aluguel para famílias em situação de vulnerabilidade",
    tipo: "aluguel_social",
    status: "ativo",
    criterios: {
      rendaMaxima: 1412,
      rendaMinima: 0,
      tempoResidencia: 6,
      outros: ["Situação de vulnerabilidade social", "Não possuir imóvel próprio"]
    },
    beneficios: ["Auxílio de até R$ 600/mês", "Prazo de 24 meses"],
    vagas: {
      total: 200,
      ocupadas: 180,
      disponiveis: 20
    },
    prazoInscricao: {
      inicio: "2024-01-15",
      fim: "2024-06-15"
    },
    documentosNecessarios: [
      "Cadastro Social",
      "Comprovante de renda familiar",
      "Contrato de aluguel"
    ],
    responsavel: "Ana Costa",
    dataCriacao: "2024-01-15",
    dataAtualizacao: "2024-03-12"
  }
];

const statusColors = {
  ativo: "bg-green-100 text-green-800",
  inativo: "bg-red-100 text-red-800",
  em_planejamento: "bg-yellow-100 text-yellow-800",
  concluido: "bg-blue-100 text-blue-800"
};

const tipoColors = {
  casa_propria: "bg-blue-100 text-blue-800",
  aluguel_social: "bg-green-100 text-green-800",
  reforma: "bg-orange-100 text-orange-800",
  regularizacao: "bg-purple-100 text-purple-800"
};

export default function HabitacaoProgramasHabitacionais() {
  const [programas] = useState<ProgramaHabitacional[]>(mockProgramas);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProgramas = programas.filter((programa) => {
    const matchesSearch = 
      programa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || programa.status === statusFilter;
    const matchesTipo = tipoFilter === "all" || programa.tipo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  return (
    
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Programas Habitacionais</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Programa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Programa Habitacional</DialogTitle>
                <DialogDescription>
                  Cadastre um novo programa habitacional
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações Básicas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Programa</Label>
                      <Input id="nome" placeholder="Nome do programa" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Programa</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casa_propria">Casa Própria</SelectItem>
                          <SelectItem value="aluguel_social">Aluguel Social</SelectItem>
                          <SelectItem value="reforma">Reforma</SelectItem>
                          <SelectItem value="regularizacao">Regularização</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea 
                      id="descricao" 
                      placeholder="Descrição detalhada do programa"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Critérios de Elegibilidade</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="renda_min">Renda Mínima (R$)</Label>
                      <Input id="renda_min" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="renda_max">Renda Máxima (R$)</Label>
                      <Input id="renda_max" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempo_residencia">Tempo de Residência (meses)</Label>
                      <Input id="tempo_residencia" type="number" placeholder="0" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Vagas e Prazo</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total_vagas">Total de Vagas</Label>
                      <Input id="total_vagas" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inicio_inscricao">Início das Inscrições</Label>
                      <Input id="inicio_inscricao" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fim_inscricao">Fim das Inscrições</Label>
                      <Input id="fim_inscricao" type="date" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Salvar Programa
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programas Ativos</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                +2 novos este mês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,700</div>
              <p className="text-xs text-muted-foreground">
                1,130 ocupadas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">66%</div>
              <p className="text-xs text-muted-foreground">
                +5% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Planejamento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Previsão para próximo semestre
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar programas..."
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
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="em_planejamento">Em Planejamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="casa_propria">Casa Própria</SelectItem>
              <SelectItem value="aluguel_social">Aluguel Social</SelectItem>
              <SelectItem value="reforma">Reforma</SelectItem>
              <SelectItem value="regularizacao">Regularização</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProgramas.map((programa) => (
            <Card key={programa.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{programa.nome}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge className={statusColors[programa.status]}>
                      {programa.status === "ativo" ? "Ativo" :
                       programa.status === "inativo" ? "Inativo" :
                       programa.status === "em_planejamento" ? "Em Planejamento" : "Concluído"}
                    </Badge>
                    <Badge className={tipoColors[programa.tipo]} variant="outline">
                      {programa.tipo === "casa_propria" ? "Casa Própria" :
                       programa.tipo === "aluguel_social" ? "Aluguel Social" :
                       programa.tipo === "reforma" ? "Reforma" : "Regularização"}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {programa.descricao}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vagas Ocupadas</span>
                    <span>{programa.vagas.ocupadas}/{programa.vagas.total}</span>
                  </div>
                  <Progress 
                    value={(programa.vagas.ocupadas / programa.vagas.total) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Renda Máxima:</span>
                    <span>R$ {programa.criterios.rendaMaxima.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prazo:</span>
                    <span>
                      {new Date(programa.prazoInscricao.inicio).toLocaleDateString('pt-BR')} - {' '}
                      {new Date(programa.prazoInscricao.fim).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Responsável:</span>
                    <span>{programa.responsavel}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Building className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    
  );
}
