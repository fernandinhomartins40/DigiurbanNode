import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Edit2,
  Trash2,
  Shield,
  KeyRound,
  Building2,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  AlertTriangle,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  User,
  Eye
} from 'lucide-react';
import { 
  SuperAdminLayout,
  SuperAdminHeader,
  SuperAdminContent,
  SuperAdminKPIGrid,
  SuperAdminKPICard,
  SuperAdminSection
} from "@/components/super-admin/SuperAdminDesignSystem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin, createUserAdmin, createUserProfileAdmin, logSystemActivity } from "@/lib/supabaseAdmin";
import { toast } from "@/hooks/use-toast";

// Interfaces
interface User {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  tipo_usuario: 'admin' | 'operador' | 'fiscal';
  status: 'ativo' | 'inativo' | 'suspenso';
  tenant_id: string;
  prefeitura_nome?: string;
  created_at: string;
  last_sign_in_at?: string;
  is_active: boolean;
}

interface Prefeitura {
  id: string;
  nome: string;
  status: string;
}

interface UserFormData {
  nome_completo: string;
  email: string;
  telefone: string;
  tipo_usuario: 'admin' | 'operador' | 'fiscal';
  prefeitura_id: string;
  senha?: string;
  confirmar_senha?: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [prefeituras, setPrefeituras] = useState<Prefeitura[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrefeitura, setFilterPrefeitura] = useState('all');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Estados dos modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState<UserFormData>({
    nome_completo: '',
    email: '',
    telefone: '',
    tipo_usuario: 'operador',
    prefeitura_id: '',
    senha: '',
    confirmar_senha: ''
  });
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadPrefeituras()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados iniciais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('👥 Carregando usuários com Admin Client...');
      
      // Usar supabaseAdmin para garantir acesso completo
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar user_profiles:', error);
        throw error;
      }

      console.log(`📊 ${data?.length || 0} usuários carregados do banco`);

      // Buscar informações dos tenants separadamente
      const { data: tenantsData, error: tenantsError } = await supabaseAdmin
        .from('tenants')
        .select('id, nome');

      if (tenantsError) {
        console.warn('⚠️ Erro ao buscar tenants para usuarios:', tenantsError);
      }

      // Mapear usuários com informações dos tenants
      const formattedUsers = data?.map(user => {
        const tenant = tenantsData?.find(t => t.id === user.tenant_id);
        
        return {
          id: user.id,
          nome_completo: user.nome_completo || 'Nome não informado',
          email: user.email,
          telefone: user.telefone,
          tipo_usuario: user.tipo_usuario || 'operador',
          status: user.status || 'ativo',
          tenant_id: user.tenant_id,
          prefeitura_nome: tenant?.nome || 'Tenant não encontrado',
          created_at: user.created_at,
          last_sign_in_at: user.ultima_atividade,
          is_active: user.ativo !== false
        };
      }) || [];

      console.log('✅ Usuários formatados:', formattedUsers.length);
      setUsers(formattedUsers);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      throw error;
    }
  };

  const loadPrefeituras = async () => {
    try {
      console.log('🏢 [DEBUG] Carregando tenants com Admin Client...');
      
      // 1. QUERY DE DIAGNÓSTICO PRIMEIRO
      const { data: allData, error: debugError } = await supabaseAdmin
        .from('tenants')
        .select('id, nome, status, ativo, created_at')
        .order('nome');
      
      console.log('🔍 [DEBUG] Todos os tenants na base:', allData?.length || 0);
      console.log('📊 [DEBUG] Status encontrados:', 
        [...new Set(allData?.map(t => t.status) || [])]);
      console.log('✅ [DEBUG] Tenants ativos:', 
        allData?.filter(t => t.ativo !== false).length || 0);
      
      // 2. QUERY CORRIGIDA - Primeiro tenta com filtros rigorosos
      let { data, error } = await supabaseAdmin
        .from('tenants')
        .select('id, nome, status, ativo')
        .in('status', ['ativo', 'trial']) // ✅ CORRETO: apenas valores do enum
        .neq('ativo', false) // ✅ Incluir apenas ativos
        .not('nome', 'is', null) // ✅ Excluir nomes nulos
        .order('nome');

      // 3. FALLBACK: Se não encontrar nenhum, relaxa os filtros
      if (!error && (!data || data.length === 0)) {
        console.log('🔄 [FALLBACK] Nenhum tenant encontrado, tentando query mais flexível...');
        
        const { data: fallbackData, error: fallbackError } = await supabaseAdmin
          .from('tenants')
          .select('id, nome, status, ativo')
          .not('nome', 'is', null) // Apenas garantir que tem nome
          .order('nome');
        
        data = fallbackData;
        error = fallbackError;
        
        console.log('🔄 [FALLBACK] Resultado da query flexível:', { count: data?.length, error });
      }

      console.log('📊 Tenants após filtro correto:', { count: data?.length, error });

      if (error) {
        console.error('❌ Erro na consulta de tenants:', error);
        throw error;
      }

      console.log('🎯 [DEBUG] Tenants filtrados:', data?.length || 0);
      
      const formattedTenants = data?.map(tenant => ({
        id: tenant.id,
        nome: tenant.nome,
        status: tenant.status
      })) || [];

      console.log('✅ Tenants carregados para seleção:', formattedTenants.length);
      setPrefeituras(formattedTenants);
      
      // 3. ALERTA MELHORADO SE VAZIO
      if (formattedTenants.length === 0) {
        console.warn('⚠️ Nenhum tenant encontrado após filtros');
        toast({
          title: "Aviso",
          description: `Encontrados ${allData?.length || 0} tenants na base, mas nenhum com status ativo/trial. Verifique status dos tenants.`,
          variant: "destructive"
        });
      } else {
        console.log('🎉 Tenants disponíveis para vinculação:', formattedTenants.map(t => t.nome));
      }
    } catch (error) {
      console.error('💥 Erro ao carregar prefeituras:', error);
      throw error;
    }
  };

  // Funções CRUD
  const handleCreateUser = async () => {
    console.log('👤 Criando usuário para tenant existente (MODO SIMPLIFICADO)...', formData);
    console.log('⚠️ Usando criação direta no banco devido aos problemas do Supabase Auth');
    
    if (!validateForm()) {
      console.log('❌ Validação do formulário falhou');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Gerar ID único para o usuário
      const userId = crypto.randomUUID();
      console.log('🆔 ID gerado para usuário:', userId);

      // 2. Buscar informações do tenant selecionado
      const selectedTenant = prefeituras.find(t => t.id === formData.prefeitura_id);
      if (!selectedTenant) {
        throw new Error('Tenant não encontrado');
      }

      console.log('🏢 Criando usuário para tenant:', selectedTenant.nome);

      // 3. Criar perfil diretamente na tabela user_profiles (usando Admin Client)
      const userData = {
        id: userId,
        nome_completo: formData.nome_completo,
        email: formData.email,
        telefone: formData.telefone || null,
        tipo_usuario: formData.tipo_usuario,
        tenant_id: formData.prefeitura_id,
        status: 'pendente_ativacao', // Status especial
        ativo: true,
        metadata: {
          created_by: 'super_admin_user_management',
          tenant_name: selectedTenant.nome,
          temporary_password: formData.senha, // Salvar temporariamente
          auth_creation_pending: true, // Flag para indicar que auth ainda não foi criado
          created_at: new Date().toISOString(),
          creation_mode: 'simplified'
        },
        created_at: new Date().toISOString()
      };

      console.log('📋 Dados do usuário:', userData);

      const { data: profileData, error: profileError } = await createUserProfileAdmin(userData);

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        throw new Error(`Erro ao criar usuário: ${profileError.message}`);
      }

      console.log('✅ Usuário criado no banco:', profileData);

      // 4. Registrar atividade
      await logSystemActivity({
        user_id: userId,
        tenant_id: formData.prefeitura_id,
        acao: 'Usuário criado via Gestão de Usuários',
        detalhes: `Usuário ${formData.nome_completo} (${formData.email}) criado para ${selectedTenant.nome}. Modo simplificado - Auth pendente.`,
        categoria: 'usuarios',
        metadata: {
          tenant_id: formData.prefeitura_id,
          tenant_name: selectedTenant.nome,
          user_email: formData.email,
          user_type: formData.tipo_usuario,
          created_by: 'super_admin',
          creation_mode: 'simplified'
        }
      });

      console.log('🎉 Usuário criado com sucesso no modo simplificado!');
      
      toast({
        title: "Sucesso!",
        description: `Usuário ${formData.nome_completo} criado para ${selectedTenant.nome}. Auth será configurado posteriormente.`
      });

      setIsCreateModalOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('💥 Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: `Falha ao criar usuário: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !validateForm(true)) return;

    setIsSubmitting(true);
    try {
      console.log('✏️ Atualizando usuário:', selectedUser.id);

      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          nome_completo: formData.nome_completo,
          telefone: formData.telefone,
          tipo_usuario: formData.tipo_usuario,
          tenant_id: formData.prefeitura_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Registrar atividade
      await logSystemActivity({
        user_id: selectedUser.id,
        tenant_id: formData.prefeitura_id,
        acao: 'Usuário editado via Gestão de Usuários',
        detalhes: `Dados do usuário ${formData.nome_completo} foram atualizados.`,
        categoria: 'usuarios',
        metadata: {
          previous_tenant: selectedUser.tenant_id,
          new_tenant: formData.prefeitura_id,
          updated_by: 'super_admin'
        }
      });

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!"
      });

      setIsEditModalOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar usuário",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      console.log('🗑️ Excluindo usuário:', selectedUser.id);

      // Registrar atividade antes de excluir
      await logSystemActivity({
        user_id: selectedUser.id,
        tenant_id: selectedUser.tenant_id,
        acao: 'Usuário excluído via Gestão de Usuários',
        detalhes: `Usuário ${selectedUser.nome_completo} (${selectedUser.email}) foi excluído do sistema.`,
        categoria: 'usuarios',
        metadata: {
          previous_status: selectedUser.status,
          deleted_by: 'super_admin',
          user_data: {
            nome: selectedUser.nome_completo,
            email: selectedUser.email,
            tipo: selectedUser.tipo_usuario
          }
        }
      });

      // Excluir usuário permanentemente
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!"
      });

      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir usuário",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(selectedUser.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Email de reset de senha enviado!"
      });

      setIsResetPasswordModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar reset de senha",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funções auxiliares
  const validateForm = (isEdit = false) => {
    if (!formData.nome_completo || !formData.email || !formData.prefeitura_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return false;
    }

    if (!isEdit && (!formData.senha || formData.senha !== formData.confirmar_senha)) {
      toast({
        title: "Erro",
        description: "Senhas não conferem",
        variant: "destructive"
      });
      return false;
    }

    if (!isEdit && formData.senha && formData.senha.length < 6) {
      toast({
        title: "Erro",
        description: "Senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      email: '',
      telefone: '',
      tipo_usuario: 'operador',
      prefeitura_id: '',
      senha: '',
      confirmar_senha: ''
    });
    setSelectedUser(null);
  };

  const openEditModal = (user: User) => {
    // Feedback visual imediato
    toast({
      title: "Abrindo editor",
      description: `Carregando dados de ${user.nome_completo}...`,
      duration: 1000
    });
    
    setSelectedUser(user);
    setFormData({
      nome_completo: user.nome_completo,
      email: user.email,
      telefone: user.telefone || '',
      tipo_usuario: user.tipo_usuario,
      prefeitura_id: user.tenant_id,
      senha: '',
      confirmar_senha: ''
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    // Feedback visual imediato
    toast({
      title: "Confirmação necessária",
      description: `Preparando exclusão de ${user.nome_completo}...`,
      duration: 1000,
      variant: "destructive"
    });
    
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const openResetPasswordModal = (user: User) => {
    // Feedback visual imediato
    toast({
      title: "Reset de senha",
      description: `Preparando reset para ${user.email}...`,
      duration: 1000
    });
    
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };

  const handleToggleUserStatus = async (user: User, newStatus: 'ativo' | 'suspenso') => {
    const actionKey = `toggle-${user.id}`;
    
    try {
      setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
      console.log(`🔄 Alterando status do usuário ${user.nome_completo} para: ${newStatus}`);
      
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Registrar atividade
      await logSystemActivity({
        user_id: user.id,
        tenant_id: user.tenant_id,
        acao: `Status de usuário alterado para ${newStatus}`,
        detalhes: `Usuário ${user.nome_completo} teve status alterado de ${user.status} para ${newStatus}`,
        categoria: 'usuarios',
        metadata: {
          previous_status: user.status,
          new_status: newStatus,
          updated_by: 'super_admin'
        }
      });

      toast({
        title: "Sucesso",
        description: `Status do usuário alterado para ${newStatus === 'ativo' ? 'ativo' : 'suspenso'}`
      });

      loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status do usuário",
        variant: "destructive"
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrefeitura = filterPrefeitura === 'all' || user.tenant_id === filterPrefeitura;
    const matchesTipo = filterTipo === 'all' || user.tipo_usuario === filterTipo;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesPrefeitura && matchesTipo && matchesStatus;
  });

  const getUserStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive || status === 'inativo') {
      return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Inativo
      </Badge>;
    }
    if (status === 'suspenso') {
      return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Suspenso
      </Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Ativo
    </Badge>;
  };

  const getTipoUsuarioBadge = (tipo: string) => {
    const variants = {
      admin: { color: 'bg-purple-100 text-purple-800', label: 'Administrador', icon: <Shield className="h-3 w-3" /> },
      operador: { color: 'bg-blue-100 text-blue-800', label: 'Operador', icon: <User className="h-3 w-3" /> },
      fiscal: { color: 'bg-orange-100 text-orange-800', label: 'Fiscal', icon: <Eye className="h-3 w-3" /> }
    };
    
    const config = variants[tipo as keyof typeof variants] || variants.operador;
    return <Badge className={`${config.color} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminLayout>
      <SuperAdminHeader 
        title="Gestão de Usuários"
        subtitle="Gerenciar usuários vinculados às prefeituras ativas"
        icon={Users}
        actions={[
          {
            text: "Novo Usuário",
            variant: "default",
            icon: Plus,
            onClick: () => setIsCreateModalOpen(true)
          }
        ]}
      />

      <SuperAdminContent>

      {/* Filtros e Busca */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Prefeitura</Label>
                <Select value={filterPrefeitura} onValueChange={setFilterPrefeitura}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {prefeituras.map(pref => (
                      <SelectItem key={pref.id} value={pref.id}>{pref.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo</Label>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="operador">Operador</SelectItem>
                    <SelectItem value="fiscal">Fiscal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Usuários ({filteredUsers.length})
            </CardTitle>
            <CardDescription>
              Lista completa de usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-200/50 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.nome_completo.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{user.nome_completo}</h3>
                        {getTipoUsuarioBadge(user.tipo_usuario)}
                        {getUserStatusBadge(user.status, user.is_active)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-500" />
                          {user.email}
                        </div>
                        {user.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-500" />
                            {user.telefone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-gray-500" />
                          {user.prefeitura_nome}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        {user.last_sign_in_at && (
                          <>
                            • Último acesso: {new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(user)}>
                        <Edit2 className="h-4 w-4 mr-2 text-blue-600" />
                        Editar
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => openResetPasswordModal(user)}>
                        <KeyRound className="h-4 w-4 mr-2 text-orange-600" />
                        Reset Senha
                      </DropdownMenuItem>
                      
                      {/* Toggle Status - Suspender/Ativar */}
                      {user.status === 'ativo' ? (
                        <DropdownMenuItem 
                          onClick={() => handleToggleUserStatus(user, 'suspenso')}
                          className="text-yellow-600"
                          disabled={loadingActions[`toggle-${user.id}`]}
                        >
                          {loadingActions[`toggle-${user.id}`] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                          ) : (
                            <UserX className="h-4 w-4 mr-2" />
                          )}
                          {loadingActions[`toggle-${user.id}`] ? 'Suspendendo...' : 'Suspender'}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleToggleUserStatus(user, 'ativo')}
                          className="text-green-600"
                          disabled={loadingActions[`toggle-${user.id}`]}
                        >
                          {loadingActions[`toggle-${user.id}`] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                          ) : (
                            <UserCheck className="h-4 w-4 mr-2" />
                          )}
                          {loadingActions[`toggle-${user.id}`] ? 'Ativando...' : 'Ativar'}
                        </DropdownMenuItem>
                      )}
                      
                      {/* Excluir Usuário */}
                      <DropdownMenuItem 
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal Criar Usuário */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo usuário. Um email de confirmação será enviado.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="tipo_usuario">Tipo de Usuário *</Label>
                <Select value={formData.tipo_usuario} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo_usuario: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operador">Operador</SelectItem>
                    <SelectItem value="fiscal">Fiscal</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="prefeitura_id">Prefeitura * ({prefeituras.length} disponível{prefeituras.length !== 1 ? 'eis' : ''})</Label>
                <Select value={formData.prefeitura_id} onValueChange={(value) => {
                  const selectedTenant = prefeituras.find(p => p.id === value);
                  console.log('🏢 Prefeitura selecionada:', { id: value, nome: selectedTenant?.nome });
                  setFormData(prev => ({ ...prev, prefeitura_id: value }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      prefeituras.length === 0 
                        ? "⏳ Carregando prefeituras..." 
                        : "Selecione uma prefeitura"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {prefeituras.length === 0 ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                          Carregando...
                        </div>
                      </SelectItem>
                    ) : (
                      prefeituras.map(pref => (
                        <SelectItem key={pref.id} value={pref.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">🏢</span>
                            <span>{pref.nome}</span>
                            <span className="text-xs text-gray-500">({pref.status})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {loading && (
                  <p className="text-sm text-blue-600 mt-1">🔄 Carregando prefeituras...</p>
                )}
                {!loading && prefeituras.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">❌ Nenhuma prefeitura encontrada - verifique logs do console</p>
                )}
                {!loading && prefeituras.length > 0 && (
                  <p className="text-sm text-green-600 mt-1">✅ {prefeituras.length} prefeitura{prefeituras.length !== 1 ? 's' : ''} carregada{prefeituras.length !== 1 ? 's' : ''} com sucesso</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmar_senha">Confirmar Senha *</Label>
                <Input
                  id="confirmar_senha"
                  type="password"
                  value={formData.confirmar_senha}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmar_senha: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2 text-white" />
                    Criar Usuário
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Usuário */}
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
                Atualize os dados do usuário. O email não pode ser alterado por questões de segurança.
              </DialogDescription>
            </DialogHeader>
            
            {/* Informações do usuário atual */}
            {selectedUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedUser.nome_completo.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{selectedUser.nome_completo}</h4>
                      <Badge className={`${
                        selectedUser.status === 'ativo' ? 'bg-green-100 text-green-800' : 
                        selectedUser.status === 'suspenso' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Prefeitura:</span> {selectedUser.prefeitura_nome}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Criado em:</span> {new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="edit_nome_completo">Nome Completo *</Label>
                <Input
                  id="edit_nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
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
                <Label htmlFor="edit_telefone">Telefone</Label>
                <Input
                  id="edit_telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
                <p className="text-xs text-gray-500 mt-1">
                  📱 Opcional - usado para notificações importantes
                </p>
              </div>
              
              <div>
                <Label htmlFor="edit_tipo_usuario">Tipo de Usuário *</Label>
                <Select value={formData.tipo_usuario} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo_usuario: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operador">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span>Operador</span>
                        <span className="text-xs text-gray-500">- Acesso básico</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fiscal">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-orange-500" />
                        <span>Fiscal</span>
                        <span className="text-xs text-gray-500">- Fiscalização e auditoria</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-500" />
                        <span>Administrador</span>
                        <span className="text-xs text-gray-500">- Acesso completo</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Alterar o tipo pode afetar as permissões do usuário
                </p>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="edit_prefeitura_id">Prefeitura * ({prefeituras.length} disponível{prefeituras.length !== 1 ? 'eis' : ''})</Label>
                <Select value={formData.prefeitura_id} onValueChange={(value) => {
                  const selectedTenant = prefeituras.find(p => p.id === value);
                  console.log('🏢 [EDIT] Prefeitura selecionada:', { id: value, nome: selectedTenant?.nome });
                  setFormData(prev => ({ ...prev, prefeitura_id: value }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      prefeituras.length === 0 
                        ? "Nenhuma prefeitura disponível" 
                        : "Selecione uma prefeitura"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {prefeituras.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        <div className="flex items-center gap-2 text-gray-500">
                          <span>⚠️</span>
                          <span>Nenhuma prefeitura disponível</span>
                        </div>
                      </SelectItem>
                    ) : (
                      prefeituras.map(pref => (
                        <SelectItem key={pref.id} value={pref.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">🏢</span>
                            <span>{pref.nome}</span>
                            <span className="text-xs text-gray-500">({pref.status})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {prefeituras.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">❌ Nenhuma prefeitura encontrada - verifique logs do console</p>
                )}
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
                <Button onClick={handleEditUser} disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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

        {/* Modal Confirmar Desativação */}
        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Excluir Usuário
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja <strong>excluir permanentemente</strong> o usuário <strong>{selectedUser?.nome_completo}</strong>? 
                <br /><br />
                <span className="text-red-600 font-medium">⚠️ Esta ação não pode ser desfeita!</span>
                <br />
                Todos os dados do usuário serão removidos do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser} 
                className="bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  'Excluir Permanentemente'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal Reset Senha */}
        <AlertDialog open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-500" />
                Reset de Senha
              </AlertDialogTitle>
              <AlertDialogDescription>
                Será enviado um email para <strong>{selectedUser?.email}</strong> com instruções 
                para redefinir a senha. O usuário precisará acessar o email para criar uma nova senha.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleResetPassword}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar Reset'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </SuperAdminContent>
    </SuperAdminLayout>
  );
};

export default UsersManagement;