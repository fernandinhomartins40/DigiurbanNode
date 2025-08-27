

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, MoreVertical, RefreshCw, UserPlus, Edit, Settings, RotateCcw, UserMinus, UserCheck, UserX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, User, Shield, Eye } from "lucide-react";

// Mock data para usuários
const mockUsers = [
  { id: 1, name: "Ana Silva", email: "ana.silva@prefeitura.gov.br", department: "Secretaria de Saúde", role: "Administrador", status: "Ativo", lastLogin: "Hoje, 10:25" },
  { id: 2, name: "Carlos Santos", email: "carlos.santos@prefeitura.gov.br", department: "Secretaria de Educação", role: "Editor", status: "Ativo", lastLogin: "Ontem, 16:42" },
  { id: 3, name: "Mariana Oliveira", email: "mariana.oliveira@prefeitura.gov.br", department: "Secretaria de Finanças", role: "Leitor", status: "Inativo", lastLogin: "15/05/2023, 09:10" },
  { id: 4, name: "Paulo Mendes", email: "paulo.mendes@prefeitura.gov.br", department: "Secretaria de Transportes", role: "Editor", status: "Ativo", lastLogin: "Hoje, 08:30" },
  { id: 5, name: "Juliana Costa", email: "juliana.costa@prefeitura.gov.br", department: "Secretaria de Assistência Social", role: "Administrador", status: "Ativo", lastLogin: "19/05/2023, 11:15" },
  { id: 6, name: "Roberto Alves", email: "roberto.alves@prefeitura.gov.br", department: "Secretaria de Obras", role: "Editor", status: "Bloqueado", lastLogin: "10/05/2023, 14:22" },
  { id: 7, name: "Fernanda Lima", email: "fernanda.lima@prefeitura.gov.br", department: "Secretaria de Meio Ambiente", role: "Leitor", status: "Ativo", lastLogin: "Hoje, 09:05" },
  { id: 8, name: "Ricardo Sousa", email: "ricardo.sousa@prefeitura.gov.br", department: "Secretaria de Cultura", role: "Editor", status: "Ativo", lastLogin: "18/05/2023, 15:40" },
  { id: 9, name: "Patrícia Moreira", email: "patricia.moreira@prefeitura.gov.br", department: "Secretaria de Esportes", role: "Leitor", status: "Inativo", lastLogin: "05/05/2023, 10:20" },
  { id: 10, name: "Eduardo Martins", email: "eduardo.martins@prefeitura.gov.br", department: "Gabinete do Prefeito", role: "Administrador", status: "Ativo", lastLogin: "Hoje, 11:30" },
];

// Função para definir a cor da badge de status
const getStatusColor = (status: string) => {
  switch (status) {
    case "Ativo":
      return "bg-green-500";
    case "Inativo":
      return "bg-yellow-500";
    case "Bloqueado":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const GerenciamentoUsuarios = () => {
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data para edição
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: ''
  });

  // Handlers para as ações
  const handleEditUser = (user: any) => {
    toast({
      title: "Abrindo editor",
      description: `Carregando dados de ${user.name}...`,
      duration: 1000
    });
    
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      // Simular delay da operação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Usuário Atualizado",
        description: `${formData.name} foi atualizado com sucesso!`,
      });
      
      setIsEditModalOpen(false);
      setSelectedUser(null);
      // Aqui atualizaria os dados na lista real
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar usuário",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePermissions = (user: any) => {
    toast({
      title: "Alterar Permissões",
      description: `Modificando permissões de ${user.name}...`,
      duration: 1500
    });
    // Aqui implementaria a lógica de permissões
  };

  const handleResetPassword = async (user: any) => {
    const actionKey = `reset-${user.id}`;
    try {
      setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
      
      // Simular delay da operação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Reset de Senha",
        description: `Email de reset enviado para ${user.email}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar reset de senha",
        variant: "destructive"
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleToggleUserStatus = async (user: any, action: 'activate' | 'deactivate' | 'block') => {
    const actionKey = `status-${user.id}-${action}`;
    try {
      setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
      
      // Simular delay da operação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const actionMessages = {
        activate: `${user.name} foi ativado com sucesso`,
        deactivate: `${user.name} foi desativado`,
        block: `${user.name} foi bloqueado`
      };
      
      toast({
        title: "Status Alterado",
        description: actionMessages[action],
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao alterar status do usuário",
        variant: "destructive"
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  return (
    
      <div className="px-6 py-4">
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Gerenciamento de Usuários</h1>
              <p className="text-gray-600 dark:text-gray-400">Gerencie os usuários do sistema e suas permissões</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
              <Button className="gap-1" variant="outline">
                <RefreshCw size={16} />
                Atualizar
              </Button>
              <Button className="gap-1">
                <UserPlus size={16} />
                Novo Usuário
              </Button>
            </div>
          </div>

          <Tabs defaultValue="todos" className="w-full">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <TabsList className="mb-2 md:mb-0">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="ativos">Ativos</TabsTrigger>
                <TabsTrigger value="inativos">Inativos</TabsTrigger>
                <TabsTrigger value="bloqueados">Bloqueados</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input className="pl-8" placeholder="Buscar usuário..." />
                </div>
                <Button variant="outline">
                  <Filter size={16} />
                </Button>
              </div>
            </div>

            <TabsContent value="todos" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Departamento</TableHead>
                          <TableHead>Perfil</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Último Acesso</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                            </TableCell>
                            <TableCell>{user.lastLogin}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Edit className="h-4 w-4 mr-2 text-blue-600" />
                                    Editar Usuário
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem onClick={() => handleChangePermissions(user)}>
                                    <Settings className="h-4 w-4 mr-2 text-purple-600" />
                                    Alterar Permissões
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem 
                                    onClick={() => handleResetPassword(user)}
                                    disabled={loadingActions[`reset-${user.id}`]}
                                  >
                                    {loadingActions[`reset-${user.id}`] ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                                    ) : (
                                      <RotateCcw className="h-4 w-4 mr-2 text-orange-600" />
                                    )}
                                    {loadingActions[`reset-${user.id}`] ? 'Enviando...' : 'Redefinir Senha'}
                                  </DropdownMenuItem>
                                  
                                  {user.status === "Ativo" ? (
                                    <DropdownMenuItem 
                                      className="text-yellow-600"
                                      onClick={() => handleToggleUserStatus(user, 'deactivate')}
                                      disabled={loadingActions[`status-${user.id}-deactivate`]}
                                    >
                                      {loadingActions[`status-${user.id}-deactivate`] ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                                      ) : (
                                        <UserMinus className="h-4 w-4 mr-2" />
                                      )}
                                      {loadingActions[`status-${user.id}-deactivate`] ? 'Desativando...' : 'Desativar Usuário'}
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem 
                                      className="text-green-600"
                                      onClick={() => handleToggleUserStatus(user, 'activate')}
                                      disabled={loadingActions[`status-${user.id}-activate`]}
                                    >
                                      {loadingActions[`status-${user.id}-activate`] ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                      ) : (
                                        <UserCheck className="h-4 w-4 mr-2" />
                                      )}
                                      {loadingActions[`status-${user.id}-activate`] ? 'Ativando...' : 'Ativar Usuário'}
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleToggleUserStatus(user, 'block')}
                                    disabled={loadingActions[`status-${user.id}-block`]}
                                  >
                                    {loadingActions[`status-${user.id}-block`] ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                    ) : (
                                      <UserX className="h-4 w-4 mr-2" />
                                    )}
                                    {loadingActions[`status-${user.id}-block`] ? 'Bloqueando...' : 'Bloquear Usuário'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando 1-10 de 42 usuários
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm">Próximo</Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="ativos">
              <Card>
                <CardContent className="p-6 text-center">
                  <p>Lista de usuários ativos do sistema.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="inativos">
              <Card>
                <CardContent className="p-6 text-center">
                  <p>Lista de usuários inativos do sistema.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="bloqueados">
              <Card>
                <CardContent className="p-6 text-center">
                  <p>Lista de usuários bloqueados do sistema.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Editar Usuário */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                Editar Usuário
                {selectedUser && (
                  <Badge className="bg-blue-100 text-blue-800 ml-2">
                    {selectedUser.name}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Atualize os dados do usuário. Algumas alterações podem afetar as permissões.
              </DialogDescription>
            </DialogHeader>
            
            {/* Informações do usuário atual */}
            {selectedUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.name}`} />
                    <AvatarFallback>{selectedUser.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{selectedUser.name}</h4>
                      <Badge className={getStatusColor(selectedUser.status)}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Departamento:</span> {selectedUser.department}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Último acesso:</span> {selectedUser.lastLogin}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="edit_name">Nome Completo *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <div className="relative">
                  <Input
                    id="edit_email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-100 pr-10"
                  />
                  <div className="absolute right-3 top-2.5">
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      Bloqueado
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  🔒 Email não pode ser alterado por questões de segurança
                </p>
              </div>
              
              <div>
                <Label htmlFor="edit_department">Departamento *</Label>
                <Input
                  id="edit_department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Secretaria de..."
                />
              </div>
              
              <div>
                <Label htmlFor="edit_role">Perfil de Usuário *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Leitor">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span>Leitor</span>
                        <span className="text-xs text-gray-500">- Apenas visualização</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Editor">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4 text-green-500" />
                        <span>Editor</span>
                        <span className="text-xs text-gray-500">- Edição de conteúdo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Administrador">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-500" />
                        <span>Administrador</span>
                        <span className="text-xs text-gray-500">- Acesso completo</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Alterar o perfil pode afetar as permissões do usuário
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
              <div className="flex-1 text-left">
                {selectedUser && (
                  <p className="text-xs text-gray-500">
                    💡 Alterações serão aplicadas imediatamente após salvar
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveUser} disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando alterações...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    
  );
};

export default GerenciamentoUsuarios;
