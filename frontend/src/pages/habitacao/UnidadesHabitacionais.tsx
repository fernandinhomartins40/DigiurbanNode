
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
import { 
  Plus, 
  Search, 
  Home, 
  Building, 
  MapPin, 
  Eye,
  Edit,
  Users,
  CheckCircle,
  Clock
} from "lucide-react";
import { UnidadeHabitacional } from "@/types/habitacao";

const mockUnidades: UnidadeHabitacional[] = [
  {
    id: "1",
    codigo: "UH-001-2024",
    endereco: {
      rua: "Rua das Flores",
      numero: "123",
      bairro: "Jardim Esperança",
      cep: "12345-678",
      coordenadas: {
        latitude: -23.5505,
        longitude: -46.6333
      }
    },
    tipo: "casa",
    especificacoes: {
      area: 50,
      quartos: 2,
      banheiros: 1,
      garagem: true,
      areaTerreno: 200
    },
    status: "ocupada",
    programa: "Minha Casa Minha Vida",
    valor: {
      venda: 180000
    },
    beneficiario: {
      nome: "Maria Silva Santos",
      cpf: "123.456.789-00",
      dataOcupacao: "2024-01-15"
    },
    infraestrutura: {
      agua: true,
      esgoto: true,
      energia: true,
      internet: true,
      transporte: true,
      escola: true,
      saude: false
    },
    fotos: ["/photos/casa1.jpg", "/photos/casa1_2.jpg"],
    documentos: ["/docs/escritura.pdf", "/docs/habite_se.pdf"],
    dataCadastro: "2024-01-01",
    dataAtualizacao: "2024-03-15"
  },
  {
    id: "2",
    codigo: "UH-002-2024",
    endereco: {
      rua: "Av. Central",
      numero: "456",
      complemento: "Apto 101",
      bairro: "Centro",
      cep: "87654-321",
      coordenadas: {
        latitude: -23.5489,
        longitude: -46.6388
      }
    },
    tipo: "apartamento",
    especificacoes: {
      area: 45,
      quartos: 2,
      banheiros: 1,
      garagem: false
    },
    status: "disponivel",
    programa: "Casa Verde e Amarela",
    valor: {
      venda: 160000
    },
    infraestrutura: {
      agua: true,
      esgoto: true,
      energia: true,
      internet: false,
      transporte: true,
      escola: true,
      saude: true
    },
    fotos: ["/photos/apto1.jpg"],
    documentos: ["/docs/registro.pdf"],
    dataCadastro: "2024-02-01",
    dataAtualizacao: "2024-02-01"
  },
  {
    id: "3",
    codigo: "UH-003-2024",
    endereco: {
      rua: "Rua do Sol",
      numero: "789",
      bairro: "Vila Nova",
      cep: "11111-222",
      coordenadas: {
        latitude: -23.5520,
        longitude: -46.6300
      }
    },
    tipo: "casa",
    especificacoes: {
      area: 60,
      quartos: 3,
      banheiros: 2,
      garagem: true,
      areaTerreno: 250
    },
    status: "em_construcao",
    programa: "Minha Casa Minha Vida",
    valor: {
      venda: 220000
    },
    infraestrutura: {
      agua: true,
      esgoto: true,
      energia: false,
      internet: false,
      transporte: true,
      escola: false,
      saude: false
    },
    fotos: [],
    documentos: ["/docs/projeto.pdf"],
    dataCadastro: "2024-03-01",
    dataAtualizacao: "2024-03-15"
  }
];

const statusColors = {
  disponivel: "bg-green-100 text-green-800",
  ocupada: "bg-blue-100 text-blue-800",
  em_construcao: "bg-yellow-100 text-yellow-800",
  em_reforma: "bg-orange-100 text-orange-800",
  indisponivel: "bg-red-100 text-red-800"
};

const tipoColors = {
  casa: "bg-blue-100 text-blue-800",
  apartamento: "bg-green-100 text-green-800",
  lote: "bg-purple-100 text-purple-800"
};

export default function HabitacaoUnidadesHabitacionais() {
  const [unidades] = useState<UnidadeHabitacional[]>(mockUnidades);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [programaFilter, setProgramaFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredUnidades = unidades.filter((unidade) => {
    const matchesSearch = 
      unidade.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.endereco.rua.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.endereco.bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unidade.beneficiario?.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || unidade.status === statusFilter;
    const matchesTipo = tipoFilter === "all" || unidade.tipo === tipoFilter;
    const matchesPrograma = programaFilter === "all" || unidade.programa === programaFilter;
    
    return matchesSearch && matchesStatus && matchesTipo && matchesPrograma;
  });

  return (
    
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Unidades Habitacionais</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Unidade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Unidade Habitacional</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova unidade habitacional
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações Básicas</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="codigo">Código da Unidade</Label>
                      <Input id="codigo" placeholder="UH-XXX-2024" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casa">Casa</SelectItem>
                          <SelectItem value="apartamento">Apartamento</SelectItem>
                          <SelectItem value="lote">Lote</SelectItem>
                        </SelectContent>
                      </Select>
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
                        </SelectContent>
                      </Select>
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
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input id="complemento" placeholder="Apto, bloco, etc." />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Especificações</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Área (m²)</Label>
                      <Input id="area" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quartos">Quartos</Label>
                      <Input id="quartos" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="banheiros">Banheiros</Label>
                      <Input id="banheiros" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor (R$)</Label>
                      <Input id="valor" type="number" placeholder="0,00" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Salvar Unidade
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Unidades</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,245</div>
              <p className="text-xs text-muted-foreground">
                +15 novas este mês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-muted-foreground">
                18.8% do total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocupadas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">856</div>
              <p className="text-xs text-muted-foreground">
                68.7% do total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Construção</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">155</div>
              <p className="text-xs text-muted-foreground">
                Previsão: 6 meses
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Unidades Habitacionais</CardTitle>
            <CardDescription>
              Gerencie todas as unidades habitacionais do município
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, endereço ou beneficiário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="ocupada">Ocupada</SelectItem>
                  <SelectItem value="em_construcao">Em Construção</SelectItem>
                  <SelectItem value="em_reforma">Em Reforma</SelectItem>
                  <SelectItem value="indisponivel">Indisponível</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full md:w-[130px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="lote">Lote</SelectItem>
                </SelectContent>
              </Select>
              <Select value={programaFilter} onValueChange={setProgramaFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Programa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Minha Casa Minha Vida">Minha Casa</SelectItem>
                  <SelectItem value="Casa Verde e Amarela">Casa Verde</SelectItem>
                  <SelectItem value="Aluguel Social">Aluguel Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Especificações</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Beneficiário</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnidades.map((unidade) => (
                    <TableRow key={unidade.id}>
                      <TableCell className="font-medium">
                        {unidade.codigo}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {unidade.endereco.rua}, {unidade.endereco.numero}
                            {unidade.endereco.complemento && `, ${unidade.endereco.complemento}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {unidade.endereco.bairro} - {unidade.endereco.cep}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={tipoColors[unidade.tipo]} variant="outline">
                          {unidade.tipo === "casa" ? "Casa" :
                           unidade.tipo === "apartamento" ? "Apartamento" : "Lote"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{unidade.especificacoes.area}m²</div>
                          <div className="text-muted-foreground">
                            {unidade.especificacoes.quartos}Q {unidade.especificacoes.banheiros}B
                            {unidade.especificacoes.garagem && " +G"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[unidade.status]}>
                          {unidade.status === "disponivel" ? "Disponível" :
                           unidade.status === "ocupada" ? "Ocupada" :
                           unidade.status === "em_construcao" ? "Em Construção" :
                           unidade.status === "em_reforma" ? "Em Reforma" : "Indisponível"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        {unidade.programa}
                      </TableCell>
                      <TableCell>
                        {unidade.beneficiario ? (
                          <div>
                            <div className="font-medium">{unidade.beneficiario.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(unidade.beneficiario.dataOcupacao).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {unidade.valor.venda ? (
                          <div className="font-medium">
                            R$ {unidade.valor.venda.toLocaleString('pt-BR')}
                          </div>
                        ) : unidade.valor.aluguel ? (
                          <div className="font-medium">
                            R$ {unidade.valor.aluguel.toLocaleString('pt-BR')}/mês
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
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
                            <Edit className="h-4 w-4" />
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
