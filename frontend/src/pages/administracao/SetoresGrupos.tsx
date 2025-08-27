

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, MoreVertical, Network, Users, Building, Plus, FolderTree } from "lucide-react";

// Mock data para setores
const mockDepartments = [
  { id: 1, name: "Secretaria de Saúde", code: "SS-01", head: "Ana Maria Santos", employees: 42, subUnits: 6, active: true },
  { id: 2, name: "Secretaria de Educação", code: "SE-01", head: "Carlos Eduardo Oliveira", employees: 68, subUnits: 12, active: true },
  { id: 3, name: "Secretaria de Finanças", code: "SF-01", head: "Roberto Almeida", employees: 26, subUnits: 4, active: true },
  { id: 4, name: "Secretaria de Transportes", code: "ST-01", head: "Patrícia Silva", employees: 34, subUnits: 5, active: false },
  { id: 5, name: "Gabinete do Prefeito", code: "GP-01", head: "José Carlos Mendes", employees: 8, subUnits: 2, active: true },
  { id: 6, name: "Secretaria de Obras", code: "SO-01", head: "Fernando Lima", employees: 52, subUnits: 7, active: true },
  { id: 7, name: "Secretaria de Meio Ambiente", code: "SMA-01", head: "Mariana Costa", employees: 19, subUnits: 3, active: true },
];

// Mock data para grupos
const mockGroups = [
  { id: 1, name: "Comitê de Gestão de Crises", description: "Grupo responsável por gerenciar situações de emergência", members: 8, departments: ["Saúde", "Obras", "Gabinete"], owner: "José Carlos Mendes" },
  { id: 2, name: "Equipe de Licitações", description: "Equipe que gerencia processos de compras e licitações", members: 6, departments: ["Finanças", "Jurídico"], owner: "Roberto Almeida" },
  { id: 3, name: "Conselho de Educação", description: "Conselho para deliberações sobre políticas educacionais", members: 12, departments: ["Educação", "Cultura", "Esportes"], owner: "Carlos Eduardo Oliveira" },
  { id: 4, name: "Comissão de Festas", description: "Grupo para organização de eventos municipais", members: 7, departments: ["Cultura", "Turismo", "Comunicação"], owner: "Fernanda Rodrigues" },
  { id: 5, name: "Núcleo de Planejamento", description: "Equipe para planejamento estratégico municipal", members: 5, departments: ["Gabinete", "Finanças", "Administração"], owner: "José Carlos Mendes" },
];

// Organograma mock
const mockOrgChart = {
  id: "prefeitura",
  name: "Prefeitura Municipal",
  children: [
    {
      id: "gabinete",
      name: "Gabinete do Prefeito",
      children: [
        { id: "comunicacao", name: "Diretoria de Comunicação" },
        { id: "juridico", name: "Procuradoria Jurídica" },
      ],
    },
    {
      id: "saude",
      name: "Secretaria de Saúde",
      children: [
        { id: "hospitais", name: "Coordenadoria de Hospitais" },
        { id: "ubs", name: "Coordenadoria de UBSs" },
        { id: "vigilancia", name: "Vigilância Sanitária" },
      ],
    },
    {
      id: "educacao",
      name: "Secretaria de Educação",
      children: [
        { id: "fundamental", name: "Diretoria de Ensino Fundamental" },
        { id: "infantil", name: "Diretoria de Ensino Infantil" },
        { id: "merenda", name: "Coordenadoria de Merenda Escolar" },
      ],
    },
  ],
};

const SetoresGrupos = () => {
  return (
    
      <div className="px-6 py-4">
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Setores e Grupos</h1>
              <p className="text-gray-600 dark:text-gray-400">Gerencie a estrutura organizacional e grupos de trabalho</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
              <Button className="gap-1" variant="outline">
                <FolderTree size={16} />
                Visualizar Organograma
              </Button>
              <Button className="gap-1">
                <Building size={16} />
                Novo Setor
              </Button>
            </div>
          </div>

          <Tabs defaultValue="setores" className="w-full">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <TabsList className="mb-2 md:mb-0">
                <TabsTrigger value="setores">Setores</TabsTrigger>
                <TabsTrigger value="grupos">Grupos</TabsTrigger>
                <TabsTrigger value="organograma">Organograma</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input className="pl-8" placeholder="Buscar..." />
                </div>
                <Button variant="outline">
                  <Filter size={16} />
                </Button>
              </div>
            </div>

            <TabsContent value="setores" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Colaboradores</TableHead>
                          <TableHead>Subunidades</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockDepartments.map((dept) => (
                          <TableRow key={dept.id}>
                            <TableCell className="font-medium">{dept.name}</TableCell>
                            <TableCell>{dept.code}</TableCell>
                            <TableCell>{dept.head}</TableCell>
                            <TableCell>{dept.employees}</TableCell>
                            <TableCell>{dept.subUnits}</TableCell>
                            <TableCell>
                              <Badge className={dept.active ? "bg-green-500" : "bg-yellow-500"}>
                                {dept.active ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Editar Setor</DropdownMenuItem>
                                  <DropdownMenuItem>Ver Subunidades</DropdownMenuItem>
                                  <DropdownMenuItem>Ver Colaboradores</DropdownMenuItem>
                                  <DropdownMenuItem>Alterar Responsável</DropdownMenuItem>
                                  {dept.active ? (
                                    <DropdownMenuItem className="text-yellow-600">Desativar Setor</DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem className="text-green-600">Ativar Setor</DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grupos" className="mt-0">
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Grupos de Trabalho</CardTitle>
                    <Button size="sm" className="gap-1">
                      <Plus size={16} />
                      Novo Grupo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Membros</TableHead>
                          <TableHead>Setores</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockGroups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell className="font-medium">{group.name}</TableCell>
                            <TableCell>{group.description}</TableCell>
                            <TableCell>{group.members}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {group.departments.map((dept, index) => (
                                  <Badge key={index} variant="outline">
                                    {dept}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{group.owner}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Editar Grupo</DropdownMenuItem>
                                  <DropdownMenuItem>Gerenciar Membros</DropdownMenuItem>
                                  <DropdownMenuItem>Ver Atividades</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Excluir Grupo</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organograma" className="mt-0">
              <Card className="p-6">
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Network size={64} className="text-blue-500 mb-6" />
                  <h3 className="text-xl font-medium mb-2">Visualização de Organograma</h3>
                  <p className="text-center text-gray-600 max-w-md mb-6">
                    O organograma completo permite visualizar a hierarquia e relações entre os setores da organização.
                  </p>
                  <div className="w-full max-w-2xl border border-dashed border-gray-300 rounded-lg p-8 flex items-center justify-center">
                    <p className="text-gray-500">
                      Visualização interativa do organograma será carregada aqui.
                    </p>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Button>Expandir Todos</Button>
                    <Button variant="outline">Exportar Visualização</Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    
  );
};

export default SetoresGrupos;
