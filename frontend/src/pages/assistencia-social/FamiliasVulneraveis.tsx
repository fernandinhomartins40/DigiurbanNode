
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Familia } from "@/types/assistencia-social";
import { Search, Plus, Filter, FileDown, Users, Home, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockFamilias: Familia[] = [
  {
    id: "1",
    nome: "Família Silva",
    responsavel: "Maria da Silva",
    numeroMembros: 4,
    endereco: "Rua das Flores, 123 - Centro",
    telefone: "(11) 98765-4321",
    dataCadastro: "2022-03-15",
    vulnerabilidades: ["Habitação precária", "Baixa renda"],
    prioridade: "alta",
    nis: "12345678901",
    rendaMensal: 1200,
    status: "ativo"
  },
  {
    id: "2",
    nome: "Família Santos",
    responsavel: "João Santos",
    numeroMembros: 5,
    endereco: "Rua dos Pinheiros, 456 - Jardim América",
    telefone: "(11) 91234-5678",
    dataCadastro: "2022-04-20",
    vulnerabilidades: ["Desemprego", "Insegurança alimentar"],
    prioridade: "media",
    nis: "23456789012",
    rendaMensal: 1500,
    status: "ativo"
  },
  {
    id: "3",
    nome: "Família Oliveira",
    responsavel: "Ana Oliveira",
    numeroMembros: 3,
    endereco: "Av. Principal, 789 - Vila Nova",
    telefone: "(11) 94567-8912",
    dataCadastro: "2022-05-10",
    vulnerabilidades: ["Doença crônica", "Baixa renda"],
    prioridade: "alta",
    nis: "34567890123",
    rendaMensal: 950,
    status: "ativo"
  },
  {
    id: "4",
    nome: "Família Pereira",
    responsavel: "José Pereira",
    numeroMembros: 6,
    endereco: "Rua dos Ipês, 234 - Jardim Botânico",
    telefone: "(11) 95678-9123",
    dataCadastro: "2022-06-05",
    vulnerabilidades: ["Família numerosa", "Baixa renda", "Violência doméstica"],
    prioridade: "alta",
    nis: "45678901234",
    rendaMensal: 1800,
    status: "ativo"
  },
  {
    id: "5",
    nome: "Família Costa",
    responsavel: "Antônia Costa",
    numeroMembros: 2,
    endereco: "Rua das Palmas, 567 - Centro",
    telefone: "(11) 96789-1234",
    dataCadastro: "2022-07-12",
    vulnerabilidades: ["Idoso sem apoio familiar", "Doença crônica"],
    prioridade: "media",
    nis: "56789012345",
    rendaMensal: 1100,
    status: "ativo"
  }
];

export default function FamiliasVulneraveis() {
  const { toast } = useToast();
  const [familias, setFamilias] = useState<Familia[]>(mockFamilias);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredFamilias, setFilteredFamilias] = useState<Familia[]>(mockFamilias);
  
  const handleSearch = () => {
    const results = familias.filter(
      (familia) =>
        familia.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        familia.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        familia.nis.includes(searchTerm)
    );
    setFilteredFamilias(results);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getPrioridadeClass = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "media":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "baixa":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Famílias em Vulnerabilidade</h1>
          <div className="flex items-center gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Família
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Família</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para cadastrar uma nova família em situação de vulnerabilidade.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-center py-8 text-muted-foreground">
                    Formulário de cadastro será implementado em breve.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    setIsDialogOpen(false);
                    toast({
                      title: "Cadastro em desenvolvimento",
                      description: "O formulário de cadastro está em implementação."
                    });
                  }}>
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Card className="w-full md:w-2/3">
            <CardHeader className="pb-3">
              <CardTitle>Lista de Famílias Cadastradas</CardTitle>
              <CardDescription>
                Visualize e gerencie as famílias em situação de vulnerabilidade
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Buscar por nome, responsável ou NIS..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
                <Select defaultValue="todos">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as prioridades</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Família</TableHead>
                      <TableHead>Membros</TableHead>
                      <TableHead>Renda</TableHead>
                      <TableHead>Vulnerabilidades</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFamilias.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhuma família encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFamilias.map((familia) => (
                        <TableRow key={familia.id}>
                          <TableCell>
                            <div className="font-medium">{familia.nome}</div>
                            <div className="text-sm text-gray-500">
                              {familia.responsavel}
                            </div>
                          </TableCell>
                          <TableCell>{familia.numeroMembros}</TableCell>
                          <TableCell>{formatCurrency(familia.rendaMensal)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {familia.vulnerabilidades.map((vuln, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {vuln}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeClass(
                                familia.prioridade
                              )}`}
                            >
                              {familia.prioridade === "alta" && "Alta"}
                              {familia.prioridade === "media" && "Média"}
                              {familia.prioridade === "baixa" && "Baixa"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="mr-2" onClick={() => {
                              toast({
                                title: "Detalhes da família",
                                description: `Visualizando detalhes da ${familia.nome}`
                              });
                            }}>
                              Ver
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              toast({
                                title: "Edição de cadastro",
                                description: `Edição do cadastro da ${familia.nome} iniciada`
                              });
                            }}>
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Lista
              </Button>
            </CardFooter>
          </Card>

          <div className="w-full md:w-1/3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total de Famílias</p>
                    </div>
                  </div>
                  <p className="font-bold text-xl">{familias.length}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 mr-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Prioridade Alta</p>
                    </div>
                  </div>
                  <p className="font-bold text-xl">
                    {familias.filter(f => f.prioridade === 'alta').length}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 mr-3">
                      <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total de Pessoas</p>
                    </div>
                  </div>
                  <p className="font-bold text-xl">
                    {familias.reduce((acc, curr) => acc + curr.numeroMembros, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Principais Vulnerabilidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Baixa renda</span>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-sm">
                      65%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Habitação precária</span>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-sm">
                      42%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Desemprego</span>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-sm">
                      38%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Insegurança alimentar</span>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-sm">
                      30%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Doença crônica</span>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-sm">
                      25%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="ativos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ativos">Cadastros Ativos</TabsTrigger>
            <TabsTrigger value="inativos">Inativos</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          </TabsList>
          <TabsContent value="ativos" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center py-8 text-gray-500">
                  Visualização por status será implementada em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inativos" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center py-8 text-gray-500">
                  Visualização por status será implementada em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pendentes" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center py-8 text-gray-500">
                  Visualização por status será implementada em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
}
