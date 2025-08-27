import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Shield, X, Edit2, KeyRound, UserX, UserCheck, Trash2 } from 'lucide-react';
import { 
  SuperAdminLayout,
  SuperAdminHeader,
  SuperAdminContent
} from "@/components/super-admin/SuperAdminDesignSystem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import UserManagementService, { CreateUserData } from "@/services/userManagementService";

const UsersManagementPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [tenants, setTenants] = useState<Array<{id: string, nome: string}>>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, ativos: 0, suspensos: 0, online: 0 });
  const [formData, setFormData] = useState<CreateUserData>({
    nome_completo: '',
    email: '',
    tipo_usuario: '',
    tenant_id: '',
    cargo: '',
    departamento: '',
    telefone: '',
    senha: ''
  });

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([
      loadTenants(),
      loadUsers()
    ]);
    setLoading(false);
  };

  const loadTenants = async () => {
    const result = await UserManagementService.getTenants();
    
    if (result.success && result.data) {
      setTenants(result.data);
      console.log(`${result.data.length} prefeituras carregadas`);
    } else {
      console.error('Erro ao carregar tenants:', result.error);
      toast.error(`Erro ao carregar prefeituras: ${result.error}`);
    }
  };

  const loadUsers = async () => {
    const result = await UserManagementService.getUsers();
    
    if (result.success && result.data) {
      setUsers(result.data);
      
      // Calcular estatísticas
      const total = result.data.length;
      const ativos = result.data.filter(u => u.status === 'ativo').length;
      const suspensos = result.data.filter(u => u.status === 'suspenso').length;
      const online = Math.floor(ativos * 0.2); // Simulação de usuários online
      
      setStats({ total, ativos, suspensos, online });
      console.log(`${total} usuários carregados`);
    } else {
      console.error('Erro ao carregar usuários:', result.error);
      toast.error(`Erro ao carregar usuários: ${result.error}`);
    }
  };

  // Handlers para ações dos usuários
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    toast.info(`Editando usuário: ${user.nome_completo}`);
  };

  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
    toast.info(`Reset de senha para: ${user.nome_completo}`);
  };

  const confirmResetPassword = async () => {
    if (selectedUser) {
      const result = await UserManagementService.resetUserPassword(selectedUser.id);
      
      if (result.success) {
        toast.success(`Email de reset enviado para ${selectedUser.email}`);
      } else {
        toast.error(`Erro no reset de senha: ${result.error}`);
      }
      
      setIsResetPasswordModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleToggleUserStatus = (user: any) => {
    setSelectedUser(user);
    setIsToggleStatusModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (selectedUser) {
      const newStatus = selectedUser.status === 'ativo' ? 'suspenso' : 'ativo';
      const action = newStatus === 'ativo' ? 'ativado' : 'suspenso';
      
      const result = await UserManagementService.updateUserStatus(selectedUser.id, newStatus);
      
      if (result.success) {
        toast.success(`Usuário ${selectedUser.nome_completo} foi ${action}!`);
        await loadUsers(); // Recarregar lista
      } else {
        toast.error(`Erro ao ${action.toLowerCase()} usuário: ${result.error}`);
      }
      
      setIsToggleStatusModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (selectedUser) {
      const result = await UserManagementService.deleteUser(selectedUser.id);
      
      if (result.success) {
        toast.success(`Usuário ${selectedUser.nome_completo} foi excluído!`);
        await loadUsers(); // Recarregar lista
      } else {
        toast.error(`Erro ao excluir usuário: ${result.error}`);
      }
      
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-700 border-green-200';
      case 'suspenso': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'inativo': return 'bg-red-100 text-red-700 border-red-200';
      case 'sem_vinculo': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'ATIVO';
      case 'suspenso': return 'SUSPENSO';
      case 'inativo': return 'INATIVO';
      case 'sem_vinculo': return 'SEM VÍNCULO';
      default: return status?.toUpperCase() || 'INDEFINIDO';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'administrador': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'coordenador': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'operador': return 'bg-green-100 text-green-700 border-green-200';
      case 'cidadao': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await UserManagementService.createUser(formData);
    
    if (result.success) {
      toast.success('Usuário criado com sucesso!');
      setIsModalOpen(false);
      resetForm();
      await loadUsers(); // Recarregar lista
    } else {
      toast.error(result.error || 'Erro ao criar usuário');
    }
    
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      email: '',
      tipo_usuario: '',
      tenant_id: '',
      cargo: '',
      departamento: '',
      telefone: '',
      senha: ''
    });
  };

  return (
    <SuperAdminLayout>
      <SuperAdminHeader 
        title="Gestão de Usuários"
        subtitle="Administre usuários de todas as prefeituras"
        icon={Users}
        actions={[
          {
            text: "Novo Usuário",
            variant: "default",
            icon: Plus,
            onClick: () => setIsModalOpen(true)
          }
        ]}
      />

      <SuperAdminContent>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para criar um novo usuário no sistema.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_completo">Nome Completo</Label>
                    <Input
                      id="nome_completo"
                      value={formData.nome_completo}
                      onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Ex: joao.silva@prefeitura.gov.br"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_usuario">Tipo de Usuário</Label>
                    <Select value={formData.tipo_usuario} onValueChange={(value) => handleInputChange('tipo_usuario', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Administrador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="secretario">Secretário</SelectItem>
                        <SelectItem value="diretor">Diretor</SelectItem>
                        <SelectItem value="coordenador">Coordenador</SelectItem>
                        <SelectItem value="funcionario">Funcionário</SelectItem>
                        <SelectItem value="atendente">Atendente</SelectItem>
                        <SelectItem value="cidadao">Cidadão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant_id">Prefeitura</Label>
                    <Select value={formData.tenant_id} onValueChange={(value) => handleInputChange('tenant_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prefeitura" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => handleInputChange('cargo', e.target.value)}
                      placeholder="Ex: Coordenador"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input
                      id="departamento"
                      value={formData.departamento}
                      onChange={(e) => handleInputChange('departamento', e.target.value)}
                      placeholder="Ex: Secretaria de Saúde"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha Temporária</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    placeholder="Senha inicial do usuário (mínimo 6 caracteres)"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                    {isSubmitting ? 'Criando...' : 'Criar Usuário'}
                  </Button>
                </div>
              </form>
            </DialogContent>
        </Dialog>

        {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{loading ? '...' : stats.total.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{loading ? '...' : stats.ativos.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{loading ? '...' : stats.suspensos}</p>
                <p className="text-sm text-gray-600">Suspensos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{loading ? '...' : stats.online}</p>
                <p className="text-sm text-gray-600">Online Agora</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou departamento..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="">Todos os Tipos</option>
              <option value="administrador">Administrador</option>
              <option value="coordenador">Coordenador</option>
              <option value="operador">Operador</option>
              <option value="cidadao">Cidadão</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="suspenso">Suspenso</option>
              <option value="inativo">Inativo</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Mais Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Gerencie usuários de todas as prefeituras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Carregando usuários...</div>
              </div>
            ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Usuário</th>
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium">Prefeitura</th>
                  <th className="text-left py-3 px-4 font-medium">Departamento</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Último Acesso</th>
                  <th className="text-left py-3 px-4 font-medium">Criado em</th>
                  <th className="text-left py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {user.nome_completo?.split(' ').map((n: string) => n[0]).join('') || '??'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.nome_completo}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getTipoColor(user.tipo_usuario)}>
                          {user.tipo_usuario?.toUpperCase() || 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">
                          {user.tenants?.nome || (user.status === 'sem_vinculo' ? 'Sem Vínculo' : 'N/A')}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{user.departamento || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(user.status)}>
                          {getStatusText(user.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">
                          {user.ultimo_login ? 
                            new Date(user.ultimo_login).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Nunca'
                          }
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* Editar */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() => handleEditUser(user)}
                            title="Editar usuário"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          
                          {/* Reset Senha */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-orange-600 hover:bg-orange-50"
                            onClick={() => handleResetPassword(user)}
                            title="Reset senha"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          
                          {/* Suspender/Ativar */}
                          {user.status === 'ativo' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-yellow-600 hover:bg-yellow-50"
                              onClick={() => handleToggleUserStatus(user)}
                              title="Suspender usuário"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => handleToggleUserStatus(user)}
                              title="Ativar usuário"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Excluir */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteUser(user)}
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            )}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Mostrando {users.length} de {stats.total} usuários
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">
                Próximo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição de Usuário */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-blue-600" />
              Editar Usuário
              {selectedUser && (
                <Badge className="bg-blue-100 text-blue-800 ml-2">
                  {selectedUser.nome_completo}
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
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-600">
                    {selectedUser.nome_completo?.split(' ').map((n: string) => n[0]).join('') || '??'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{selectedUser.nome_completo}</h4>
                    <Badge className={getStatusColor(selectedUser.status)}>
                      {getStatusText(selectedUser.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Prefeitura:</span> {selectedUser.tenants?.nome || 'Sem Vínculo'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Departamento:</span> {selectedUser.departamento}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Último acesso:</span> {selectedUser.ultimoLogin}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="edit_nome">Nome Completo *</Label>
              <Input
                id="edit_nome"
                defaultValue={selectedUser?.nome_completo}
                placeholder="Nome do usuário"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <div className="relative">
                <Input
                  id="edit_email"
                  type="email"
                  defaultValue={selectedUser?.email}
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
              <Label htmlFor="edit_departamento">Departamento *</Label>
              <Input
                id="edit_departamento"
                defaultValue={selectedUser?.departamento}
                placeholder="Secretaria de..."
              />
            </div>
            
            <div>
              <Label htmlFor="edit_tipo">Tipo de Usuário *</Label>
              <Select defaultValue={selectedUser?.tipo_usuario}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      <span>Administrador</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="coordenador">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Coordenador</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="operador">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span>Operador</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            <div className="flex-1 text-left">
              <p className="text-xs text-gray-500">
                💡 Alterações serão aplicadas imediatamente após salvar
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Edit2 className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Reset de Senha */}
      <AlertDialog open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <KeyRound className="h-5 w-5" />
              Reset de Senha
            </AlertDialogTitle>
            <AlertDialogDescription>
              Será enviado um email para <strong>{selectedUser?.email}</strong> com instruções 
              para redefinir a senha. O usuário precisará acessar o email para criar uma nova senha.
              <br /><br />
              <span className="text-orange-600 font-medium">📧 Verifique se o email está correto!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmResetPassword}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Enviar Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmação de Mudança de Status */}
      <AlertDialog open={isToggleStatusModalOpen} onOpenChange={setIsToggleStatusModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={`flex items-center gap-2 ${
              selectedUser?.status === 'ativo' 
                ? 'text-yellow-600' 
                : 'text-green-600'
            }`}>
              {selectedUser?.status === 'ativo' ? (
                <UserX className="h-5 w-5" />
              ) : (
                <UserCheck className="h-5 w-5" />
              )}
              {selectedUser?.status === 'ativo' ? 'Suspender' : 'Ativar'} Usuário
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja <strong>{selectedUser?.status === 'ativo' ? 'suspender' : 'ativar'}</strong> o usuário <strong>{selectedUser?.nome}</strong>?
              <br /><br />
              {selectedUser?.status === 'ativo' ? (
                <span className="text-yellow-600 font-medium">⚠️ O usuário não poderá mais acessar o sistema até ser reativado.</span>
              ) : (
                <span className="text-green-600 font-medium">✅ O usuário poderá acessar o sistema normalmente.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmToggleStatus}
              className={
                selectedUser?.status === 'ativo' 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              {selectedUser?.status === 'ativo' ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Suspender Usuário
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Ativar Usuário
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Excluir Usuário
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja <strong>excluir permanentemente</strong> o usuário <strong>{selectedUser?.nome}</strong>?
              <br /><br />
              <span className="text-red-600 font-medium">⚠️ Esta ação não pode ser desfeita!</span>
              <br />
              Todos os dados do usuário serão removidos do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </SuperAdminContent>
    </SuperAdminLayout>
  );
};

export default UsersManagementPage;