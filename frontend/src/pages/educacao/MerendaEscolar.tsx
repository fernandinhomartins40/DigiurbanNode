
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  ChevronDown, 
  Plus, 
  CalendarDays, 
  Apple, 
  ShoppingCart, 
  FileText, 
  UtensilsCrossed,
  Beef,
  Fish,
  Wheat,
  BarChart3
} from "lucide-react";
import { MealPlan } from "@/types/educacao";

// Mock data for meal plans
const mockMealPlans: MealPlan[] = [
  {
    id: "meal1",
    name: "Cardápio Padrão - Segunda-feira",
    schoolId: "sch1",
    schoolName: "Escola Municipal João Paulo",
    date: "2023-05-01",
    weekDay: "monday",
    breakfast: "Leite com achocolatado e pão com manteiga",
    morningSnack: "Maçã",
    lunch: "Arroz, feijão, carne moída com legumes e salada de alface e tomate",
    afternoonSnack: "Suco de laranja e biscoitos",
    nutritionalInfo: {
      calories: 650,
      protein: 25,
      carbs: 85,
      fat: 18
    },
    allergens: ["leite", "glúten"]
  },
  {
    id: "meal2",
    name: "Cardápio Padrão - Terça-feira",
    schoolId: "sch1",
    schoolName: "Escola Municipal João Paulo",
    date: "2023-05-02",
    weekDay: "tuesday",
    breakfast: "Café com leite e pão com queijo",
    morningSnack: "Banana",
    lunch: "Arroz, feijão, frango assado e purê de batatas",
    afternoonSnack: "Vitamina de frutas e bolo de cenoura",
    nutritionalInfo: {
      calories: 720,
      protein: 30,
      carbs: 95,
      fat: 20
    },
    allergens: ["leite", "glúten", "ovos"]
  },
  {
    id: "meal3",
    name: "Cardápio Padrão - Segunda-feira",
    schoolId: "sch2",
    schoolName: "Escola Municipal Maria José",
    date: "2023-05-01",
    weekDay: "monday",
    breakfast: "Leite com achocolatado e pão com manteiga",
    morningSnack: "Maçã",
    lunch: "Arroz, feijão, carne moída com legumes e salada de alface e tomate",
    afternoonSnack: "Suco de laranja e biscoitos",
    nutritionalInfo: {
      calories: 650,
      protein: 25,
      carbs: 85,
      fat: 18
    },
    allergens: ["leite", "glúten"]
  },
  {
    id: "meal4",
    name: "Cardápio Especial - Dia das Mães",
    schoolId: "sch1",
    schoolName: "Escola Municipal João Paulo",
    date: "2023-05-12",
    weekDay: "friday",
    breakfast: "Chocolate quente e pão de queijo",
    morningSnack: "Salada de frutas",
    lunch: "Arroz, feijão, lasanha e salada de verduras",
    afternoonSnack: "Bolo de chocolate e suco natural",
    nutritionalInfo: {
      calories: 850,
      protein: 28,
      carbs: 110,
      fat: 30
    },
    allergens: ["leite", "glúten", "ovos"],
    specialDiets: ["vegetariano"]
  },
  {
    id: "meal5",
    name: "Cardápio Especial - Sem Glúten",
    schoolId: "sch3",
    schoolName: "CMEI Pequeno Príncipe",
    date: "2023-05-03",
    weekDay: "wednesday",
    breakfast: "Iogurte e tapioca",
    lunch: "Arroz, feijão, omelete e salada de legumes",
    afternoonSnack: "Bolo de arroz e suco de frutas",
    nutritionalInfo: {
      calories: 580,
      protein: 22,
      carbs: 75,
      fat: 15
    },
    specialDiets: ["sem glúten"]
  }
];

// Helper function for weekday
const getWeekDayLabel = (weekDay: string) => {
  switch (weekDay) {
    case "monday":
      return "Segunda-feira";
    case "tuesday":
      return "Terça-feira";
    case "wednesday":
      return "Quarta-feira";
    case "thursday":
      return "Quinta-feira";
    case "friday":
      return "Sexta-feira";
    case "saturday":
      return "Sábado";
    case "sunday":
      return "Domingo";
    default:
      return weekDay;
  }
};

const MerendaEscolar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("todos");
  const [weekDayFilter, setWeekDayFilter] = useState("todos");
  const [activeTab, setActiveTab] = useState("cardapios");

  // Filter meal plans based on search and filters
  const filteredMealPlans = mockMealPlans.filter((mealPlan) => {
    return (
      (mealPlan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       mealPlan.lunch.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (schoolFilter === "todos" || mealPlan.schoolId === schoolFilter) &&
      (weekDayFilter === "todos" || mealPlan.weekDay === weekDayFilter)
    );
  });

  return (
    
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Merenda Escolar</h1>
        
        <Tabs defaultValue="cardapios" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="cardapios">Cardápios</TabsTrigger>
            <TabsTrigger value="novo-cardapio">Novo Cardápio</TabsTrigger>
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
            <TabsTrigger value="nutricao">Nutrição</TabsTrigger>
          </TabsList>

          <TabsContent value="cardapios">
            <Card>
              <CardHeader>
                <CardTitle>Cardápios da Merenda Escolar</CardTitle>
                <CardDescription>
                  Gerenciamento dos cardápios de refeições para as escolas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar por nome ou pratos..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Escola" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as escolas</SelectItem>
                      <SelectItem value="sch1">E.M. João Paulo</SelectItem>
                      <SelectItem value="sch2">E.M. Maria José</SelectItem>
                      <SelectItem value="sch3">CMEI Pequeno Príncipe</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={weekDayFilter} onValueChange={setWeekDayFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Dia da semana" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os dias</SelectItem>
                      <SelectItem value="monday">Segunda-feira</SelectItem>
                      <SelectItem value="tuesday">Terça-feira</SelectItem>
                      <SelectItem value="wednesday">Quarta-feira</SelectItem>
                      <SelectItem value="thursday">Quinta-feira</SelectItem>
                      <SelectItem value="friday">Sexta-feira</SelectItem>
                      <SelectItem value="saturday">Sábado</SelectItem>
                      <SelectItem value="sunday">Domingo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={() => setActiveTab("novo-cardapio")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cardápio
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Escola</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Dia da Semana</TableHead>
                        <TableHead>Almoço</TableHead>
                        <TableHead>Dietas Especiais</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMealPlans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Nenhum cardápio encontrado com os filtros selecionados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMealPlans.map((mealPlan) => (
                          <TableRow key={mealPlan.id}>
                            <TableCell className="font-medium">{mealPlan.name}</TableCell>
                            <TableCell>{mealPlan.schoolName}</TableCell>
                            <TableCell>{new Date(mealPlan.date).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell>{getWeekDayLabel(mealPlan.weekDay)}</TableCell>
                            <TableCell>
                              <div className="truncate max-w-[200px]" title={mealPlan.lunch}>
                                {mealPlan.lunch}
                              </div>
                            </TableCell>
                            <TableCell>
                              {mealPlan.specialDiets ? (
                                mealPlan.specialDiets.map((diet, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-purple-100 text-purple-800 mr-1"
                                  >
                                    {diet}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">Nenhuma</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                  <DropdownMenuItem>Editar</DropdownMenuItem>
                                  <DropdownMenuItem>Duplicar</DropdownMenuItem>
                                  <DropdownMenuItem>Imprimir</DropdownMenuItem>
                                  <DropdownMenuItem>Excluir</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Exibindo {filteredMealPlans.length} de {mockMealPlans.length} cardápios
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Exportar Cardápio Semanal</Button>
                  <Button variant="outline">Imprimir</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="novo-cardapio">
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Cardápio</CardTitle>
                <CardDescription>
                  Cadastre um novo cardápio para a merenda escolar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Básicas</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome do Cardápio</label>
                      <Input placeholder="Ex: Cardápio Padrão - Segunda-feira" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Escola</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma escola" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sch1">Escola Municipal João Paulo</SelectItem>
                          <SelectItem value="sch2">Escola Municipal Maria José</SelectItem>
                          <SelectItem value="sch3">CMEI Pequeno Príncipe</SelectItem>
                          <SelectItem value="all">Todas as Escolas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data</label>
                      <Input type="date" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dia da Semana</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Segunda-feira</SelectItem>
                          <SelectItem value="tuesday">Terça-feira</SelectItem>
                          <SelectItem value="wednesday">Quarta-feira</SelectItem>
                          <SelectItem value="thursday">Quinta-feira</SelectItem>
                          <SelectItem value="friday">Sexta-feira</SelectItem>
                          <SelectItem value="saturday">Sábado</SelectItem>
                          <SelectItem value="sunday">Domingo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Refeições</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Café da Manhã</label>
                      <Textarea placeholder="Descreva o que será servido no café da manhã" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lanche da Manhã</label>
                      <Textarea placeholder="Descreva o que será servido no lanche da manhã" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Almoço</label>
                      <Textarea placeholder="Descreva o que será servido no almoço" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lanche da Tarde</label>
                      <Textarea placeholder="Descreva o que será servido no lanche da tarde" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jantar</label>
                      <Textarea placeholder="Descreva o que será servido no jantar (se aplicável)" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Nutricionais</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Calorias (kcal)</label>
                      <Input type="number" placeholder="0" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Proteínas (g)</label>
                      <Input type="number" placeholder="0" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Carboidratos (g)</label>
                      <Input type="number" placeholder="0" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gorduras (g)</label>
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Adicionais</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alérgenos</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="gluten" className="rounded" />
                        <label htmlFor="gluten">Glúten</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="milk" className="rounded" />
                        <label htmlFor="milk">Leite</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="eggs" className="rounded" />
                        <label htmlFor="eggs">Ovos</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="nuts" className="rounded" />
                        <label htmlFor="nuts">Nozes/Castanhas</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="soy" className="rounded" />
                        <label htmlFor="soy">Soja</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="fish" className="rounded" />
                        <label htmlFor="fish">Peixe</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dietas Especiais Disponíveis</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="vegetarian" className="rounded" />
                        <label htmlFor="vegetarian">Vegetariano</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="vegan" className="rounded" />
                        <label htmlFor="vegan">Vegano</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="gluten_free" className="rounded" />
                        <label htmlFor="gluten_free">Sem Glúten</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="lactose_free" className="rounded" />
                        <label htmlFor="lactose_free">Sem Lactose</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Observações</label>
                    <Textarea placeholder="Observações adicionais sobre este cardápio" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("cardapios")}>
                  Cancelar
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">Visualizar</Button>
                  <Button onClick={() => setActiveTab("cardapios")}>
                    Salvar Cardápio
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="estoque">
            <Card>
              <CardHeader>
                <CardTitle>Controle de Estoque</CardTitle>
                <CardDescription>
                  Gerenciamento de estoque de alimentos e insumos para a merenda escolar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar produtos..."
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <Select>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      <SelectItem value="grains">Grãos e Cereais</SelectItem>
                      <SelectItem value="proteins">Proteínas</SelectItem>
                      <SelectItem value="dairy">Laticínios</SelectItem>
                      <SelectItem value="fruits">Frutas e Verduras</SelectItem>
                      <SelectItem value="others">Outros</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Escola" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as escolas</SelectItem>
                      <SelectItem value="sch1">E.M. João Paulo</SelectItem>
                      <SelectItem value="sch2">E.M. Maria José</SelectItem>
                      <SelectItem value="sch3">CMEI Pequeno Príncipe</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Novo Pedido
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Produtos em Estoque</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <ShoppingCart className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                          <p className="text-2xl font-bold">147</p>
                          <p className="text-xs text-gray-500">itens cadastrados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100 text-green-800 mr-3">
                          R$
                        </div>
                        <div>
                          <p className="text-2xl font-bold">54.236,85</p>
                          <p className="text-xs text-gray-500">em produtos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Alertas de Estoque</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-amber-100 text-amber-800 mr-3">
                          !
                        </div>
                        <div>
                          <p className="text-2xl font-bold">12</p>
                          <p className="text-xs text-gray-500">produtos com estoque baixo</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Próxima Entrega</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <CalendarDays className="h-8 w-8 text-purple-500 mr-3" />
                        <div>
                          <p className="text-2xl font-bold">10/05</p>
                          <p className="text-xs text-gray-500">frutas e verduras</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead>Escola</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Arroz Branco</TableCell>
                        <TableCell>Grãos e Cereais</TableCell>
                        <TableCell>120</TableCell>
                        <TableCell>Kg</TableCell>
                        <TableCell>30/07/2023</TableCell>
                        <TableCell>Todas</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Adequado
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Feijão Carioca</TableCell>
                        <TableCell>Grãos e Cereais</TableCell>
                        <TableCell>58</TableCell>
                        <TableCell>Kg</TableCell>
                        <TableCell>15/06/2023</TableCell>
                        <TableCell>Todas</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Adequado
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Leite</TableCell>
                        <TableCell>Laticínios</TableCell>
                        <TableCell>45</TableCell>
                        <TableCell>L</TableCell>
                        <TableCell>20/05/2023</TableCell>
                        <TableCell>E.M. João Paulo</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800">
                            Baixo
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Frango</TableCell>
                        <TableCell>Proteínas</TableCell>
                        <TableCell>25</TableCell>
                        <TableCell>Kg</TableCell>
                        <TableCell>15/05/2023</TableCell>
                        <TableCell>Todas</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            Crítico
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Exibindo 4 de 147 produtos
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Relatório de Estoque</Button>
                  <Button variant="outline">Ajustar Estoque</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="nutricao">
            <Card>
              <CardHeader>
                <CardTitle>Informações Nutricionais</CardTitle>
                <CardDescription>
                  Análise nutricional e supervisão das refeições oferecidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-lg">
                        <Apple className="h-5 w-5 mr-2 text-green-500" />
                        Calorias Médias
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div>
                          <p className="text-3xl font-bold">
                            {Math.round(mockMealPlans.reduce((sum, mp) => sum + (mp.nutritionalInfo?.calories || 0), 0) / mockMealPlans.length)} kcal
                          </p>
                          <p className="text-sm text-gray-500">por refeição</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-lg">
                        <Beef className="h-5 w-5 mr-2 text-red-500" />
                        Proteínas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div>
                          <p className="text-3xl font-bold">
                            {Math.round(mockMealPlans.reduce((sum, mp) => sum + (mp.nutritionalInfo?.protein || 0), 0) / mockMealPlans.length)} g
                          </p>
                          <p className="text-sm text-gray-500">por refeição</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-lg">
                        <Wheat className="h-5 w-5 mr-2 text-amber-500" />
                        Carboidratos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div>
                          <p className="text-3xl font-bold">
                            {Math.round(mockMealPlans.reduce((sum, mp) => sum + (mp.nutritionalInfo?.carbs || 0), 0) / mockMealPlans.length)} g
                          </p>
                          <p className="text-sm text-gray-500">por refeição</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-lg">
                        <UtensilsCrossed className="h-5 w-5 mr-2 text-blue-500" />
                        Alunos Atendidos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div>
                          <p className="text-3xl font-bold">1.850</p>
                          <p className="text-sm text-gray-500">diariamente</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Distribuição de Nutrientes</h3>
                    <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-gray-300" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Restrições Alimentares</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Restrição</TableHead>
                            <TableHead>Alunos</TableHead>
                            <TableHead>Cardápios Adaptados</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Intolerância à Lactose</TableCell>
                            <TableCell>32</TableCell>
                            <TableCell>Sim</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Alergia à Glúten</TableCell>
                            <TableCell>18</TableCell>
                            <TableCell>Sim</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Diabetes</TableCell>
                            <TableCell>7</TableCell>
                            <TableCell>Sim</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Vegetarianismo</TableCell>
                            <TableCell>12</TableCell>
                            <TableCell>Sim</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Relatórios Nutricionais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Apple className="h-5 w-5 mr-2 text-green-500" />
                          Adequação Nutricional
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Análise da adequação nutricional dos cardápios às diretrizes do PNAE.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <UtensilsCrossed className="h-5 w-5 mr-2 text-blue-500" />
                          Relatório de Consumo
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Análise de aceitação e consumo dos alimentos oferecidos nas refeições.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <FileText className="h-5 w-5 mr-2 text-purple-500" />
                          Laudos Técnicos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          Laudos técnicos e pareceres nutricionais para atendimentos especiais.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório Nutricional
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default MerendaEscolar;
