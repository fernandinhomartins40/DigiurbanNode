

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Filter, Edit, Trash2, ShieldPlus, ShieldCheck } from "lucide-react";

// Mock data para perfis
const mockProfiles = [
  { id: 1, name: "Administrador", description: "Acesso total ao sistema", usersCount: 8, modules: 12, permissions: "Completo" },
  { id: 2, name: "Gerente", description: "Acesso de gerenciamento", usersCount: 15, modules: 10, permissions: "Parcial" },
  { id: 3, name: "Operador", description: "Acesso operacional", usersCount: 34, modules: 8, permissions: "Limitado" },
  { id: 4, name: "Consultor", description: "Acesso de visualização apenas", usersCount: 22, modules: 6, permissions: "Leitura" },
  { id: 5, name: "Secretário", description: "Acesso à gestão documental", usersCount: 12, modules: 4, permissions: "Específico" },
];

// Mock data para módulos e suas permissões
const mockModules = [
  { id: 1, name: "Dashboard", read: true, create: true, update: true, delete: true, special: true },
  { id: 2, name: "Usuários", read: true, create: true, update: true, delete: true, special: true },
  { id: 3, name: "Documentos", read: true, create: true, update: true, delete: false, special: true },
  { id: 4, name: "Processos", read: true, create: true, update: true, delete: false, special: false },
  { id: 5, name: "Relatórios", read: true, create: false, update: false, delete: false, special: true },
  { id: 6, name: "Configurações", read: true, create: true, update: true, delete: true, special: true },
  { id: 7, name: "Auditoria", read: true, create: false, update: false, delete: false, special: true },
];

const PerfisPermissoes = () => {
  return (
    
      <div className="px-6 py-4">
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Perfis e Permissões</h1>
              <p className="text-gray-600 dark:text-gray-400">Configure os perfis de acesso e permissões do sistema</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
              <Button className="gap-1">
                <ShieldPlus size={16} />
                Novo Perfil
              </Button>
            </div>
          </div>

          <Tabs defaultValue="perfis" className="w-full">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <TabsList className="mb-2 md:mb-0">
                <TabsTrigger value="perfis">Perfis de Acesso</TabsTrigger>
                <TabsTrigger value="permissoes">Matriz de Permissões</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input className="pl-8" placeholder="Buscar perfil..." />
                </div>
                <Button variant="outline">
                  <Filter size={16} />
                </Button>
              </div>
            </div>

            <TabsContent value="perfis" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Usuários</TableHead>
                        <TableHead>Módulos</TableHead>
                        <TableHead>Nível de Acesso</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockProfiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.name}</TableCell>
                          <TableCell>{profile.description}</TableCell>
                          <TableCell>{profile.usersCount}</TableCell>
                          <TableCell>{profile.modules}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-500">
                              {profile.permissions}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="permissoes" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Matriz de Permissões - Perfil: Administrador</CardTitle>
                    <Button variant="outline" size="sm">Salvar Alterações</Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Módulo</TableHead>
                          <TableHead className="text-center">Visualizar</TableHead>
                          <TableHead className="text-center">Criar</TableHead>
                          <TableHead className="text-center">Editar</TableHead>
                          <TableHead className="text-center">Excluir</TableHead>
                          <TableHead className="text-center">Funções Especiais</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockModules.map((module) => (
                          <TableRow key={module.id}>
                            <TableCell className="font-medium">{module.name}</TableCell>
                            <TableCell className="text-center">
                              <Checkbox checked={module.read} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox checked={module.create} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox checked={module.update} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox checked={module.delete} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox checked={module.special} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    
  );
};

export default PerfisPermissoes;
