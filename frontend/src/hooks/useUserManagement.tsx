// =====================================================
// HOOK PARA GERENCIAMENTO DE USUÁRIOS E PERMISSÕES
// =====================================================

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import UserManagementService, { UserProfile, CreateUserData, ApiResponse } from '@/services/userManagementService'
import { Secretaria } from '@/hooks/useSecretarias'

export interface PermissionProfile {
  id: string
  nome: string
  descricao: string
  permissoes: Record<string, boolean>
  created_at: string
}

export interface UserActivity {
  id: string
  user_id: string
  acao: string
  detalhes: string
  created_at: string
  user_profile?: {
    nome: string
  }
}

interface ExtendedUserProfile extends UserProfile {
  secretaria?: Secretaria;
  ativo?: boolean;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [profiles, setProfiles] = useState<PermissionProfile[]>([])
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // CARREGAR DADOS INICIAIS
  // =====================================================
  
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadUsers(),
        loadProfiles(), 
        loadActivities()
      ])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados do sistema')
      toast.error('Erro ao carregar dados do sistema')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // GERENCIAMENTO DE USUÁRIOS
  // =====================================================

  const loadUsers = async () => {
    const result = await UserManagementService.getUsers({
      limit: 1000,
      offset: 0
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao carregar usuários');
    }

    setUsers(result.data || []);
  }

  const createUser = async (userData: {
    email: string
    nome: string
    tipo_usuario: string
    tenant_id: string
    secretaria_id?: string
    password: string
  }) => {
    try {
      const createUserData: CreateUserData = {
        email: userData.email,
        nome_completo: userData.nome,
        tipo_usuario: userData.tipo_usuario,
        tenant_id: userData.tenant_id,
        senha: userData.password,
        departamento: userData.secretaria_id
      };

      const result = await UserManagementService.createUser(createUserData);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar usuário');
      }

      // Registrar atividade
      await logActivity(result.data!.id, 'Criou usuário', `Criou o usuário '${userData.nome}'`);
      
      await loadUsers();
      toast.success('Usuário criado com sucesso!');
      
      return result.data;

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
      throw error;
    }
  }

  const updateUser = async (userId: string, updates: Partial<CreateUserData>) => {
    try {
      const result = await UserManagementService.updateUser(userId, updates);

      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar usuário');
      }

      await logActivity(userId, 'Alterou usuário', `Alterou dados do usuário`);
      await loadUsers();
      toast.success('Usuário atualizado com sucesso!');

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
      throw error;
    }
  }

  const toggleUserStatus = async (userId: string, ativo: boolean) => {
    try {
      const status = ativo ? 'ativo' : 'inativo';
      const result = await UserManagementService.updateUserStatus(userId, status);

      if (!result.success) {
        throw new Error(result.error || 'Erro ao alterar status');
      }

      await logActivity(userId, ativo ? 'Ativou usuário' : 'Desativou usuário', 
        `${ativo ? 'Ativou' : 'Desativou'} o usuário`);
      
      await loadUsers();
      toast.success(`Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso!`);

    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do usuário');
      throw error;
    }
  }

  const resetUserPassword = async (userId: string) => {
    try {
      const result = await UserManagementService.resetUserPassword(userId);

      if (!result.success) {
        throw new Error(result.error || 'Erro ao resetar senha');
      }

      await logActivity(userId, 'Resetou senha', 'Resetou a senha do usuário');
      toast.success('Senha resetada com sucesso!');

    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast.error('Erro ao resetar senha');
      throw error;
    }
  }

  // =====================================================
  // GERENCIAMENTO DE PERFIS DE PERMISSÃO
  // =====================================================

  const loadProfiles = async () => {
    // Como não temos tabela específica para profiles, usamos tipos de usuário
    const tiposUsuario = [
      {
        id: 'super_admin',
        nome: 'Super Admin',
        descricao: 'Acesso total ao sistema',
        permissoes: {
          visualizar: true,
          criar: true,
          editar: true,
          excluir: true,
          aprovar: true,
          gerenciar_usuarios: true
        }
      },
      {
        id: 'admin', 
        nome: 'Admin',
        descricao: 'Acesso administrativo ao sistema',
        permissoes: {
          visualizar: true,
          criar: true,
          editar: true,
          excluir: true,
          aprovar: true,
          gerenciar_usuarios: true
        }
      },
      {
        id: 'secretario',
        nome: 'Secretário',
        descricao: 'Acesso de gestão da secretaria',
        permissoes: {
          visualizar: true,
          criar: true,
          editar: true,
          excluir: false,
          aprovar: true,
          gerenciar_usuarios: false
        }
      },
      {
        id: 'diretor',
        nome: 'Diretor',
        descricao: 'Acesso de direção departamental',
        permissoes: {
          visualizar: true,
          criar: true,
          editar: true,
          excluir: false,
          aprovar: true,
          gerenciar_usuarios: false
        }
      },
      {
        id: 'gestor',
        nome: 'Gestor',
        descricao: 'Acesso de gestão operacional',
        permissoes: {
          visualizar: true,
          criar: true,
          editar: true,
          excluir: false,
          aprovar: false,
          gerenciar_usuarios: false
        }
      },
      {
        id: 'operador',
        nome: 'Operador',
        descricao: 'Acesso operacional básico',
        permissoes: {
          visualizar: true,
          criar: true,
          editar: false,
          excluir: false,
          aprovar: false,
          gerenciar_usuarios: false
        }
      },
      {
        id: 'cidadao',
        nome: 'Cidadão',
        descricao: 'Acesso básico para cidadãos',
        permissoes: {
          visualizar: true,
          criar: false,
          editar: false,
          excluir: false,
          aprovar: false,
          gerenciar_usuarios: false
        }
      }
    ]

    // Contar usuários por tipo usando dados já carregados
    const countsByType = users.reduce((acc, user) => {
      acc[user.tipo_usuario] = (acc[user.tipo_usuario] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const profilesWithCounts = tiposUsuario.map(profile => ({
      ...profile,
      created_at: new Date().toISOString(),
      usuarios: countsByType[profile.id] || 0
    }))

    setProfiles(profilesWithCounts as PermissionProfile[])
  }

  // =====================================================
  // LOGS DE ATIVIDADE
  // =====================================================

  const loadActivities = async () => {
    try {
      // Como não temos endpoint específico para atividades ainda, usar dados mock
      const mockActivities: UserActivity[] = [
        {
          id: '1',
          user_id: 'admin-user',
          acao: 'Sistema iniciado',
          detalhes: 'Sistema de gestão inicializado com sucesso',
          created_at: new Date().toISOString(),
          user_profile: { nome: 'Sistema' }
        }
      ];
      setActivities(mockActivities);
    } catch (error) {
      console.warn('Erro ao carregar atividades:', error);
      setActivities([]);
    }
  }

  const logActivity = async (userId: string, acao: string, detalhes: string) => {
    try {
      // Por enquanto, apenas log no console - API de atividades será implementada depois
      console.log(`[USER ACTIVITY] ${userId}: ${acao} - ${detalhes}`);
      
      // Adicionar à lista local para feedback visual
      const newActivity: UserActivity = {
        id: Date.now().toString(),
        user_id: userId,
        acao,
        detalhes,
        created_at: new Date().toISOString(),
        user_profile: { nome: users.find(u => u.id === userId)?.nome_completo || 'Usuário' }
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 49)]);
    } catch (error) {
      console.warn('Erro ao registrar atividade:', error);
    }
  }

  // =====================================================
  // ESTATÍSTICAS
  // =====================================================

  const getUserStats = () => {
    const total = users.length
    const active = users.filter(u => u.status === 'ativo').length
    const inactive = users.filter(u => u.status !== 'ativo').length

    const byType = users.reduce((acc, user) => {
      acc[user.tipo_usuario] = (acc[user.tipo_usuario] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byDepartment = users.reduce((acc, user) => {
      if (user.departamento) {
        acc[user.departamento] = (acc[user.departamento] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      active,
      inactive,
      byType,
      byDepartment
    }
  }

  // =====================================================
  // FUNÇÕES DE BUSCA E FILTRO
  // =====================================================

  const searchUsers = (query: string) => {
    if (!query.trim()) return users

    return users.filter(user => 
      user.nome_completo.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.departamento?.toLowerCase().includes(query.toLowerCase())
    )
  }

  const filterUsersByType = (type: string) => {
    if (type === 'all') return users
    return users.filter(user => user.tipo_usuario === type)
  }

  const filterUsersByStatus = (status: string) => {
    if (status === 'all') return users
    return users.filter(user => 
      status === 'active' ? user.status === 'ativo' : user.status !== 'ativo'
    )
  }

  return {
    // Estados
    users,
    profiles,
    activities,
    loading,
    error,

    // Funções de usuários
    createUser,
    updateUser,
    toggleUserStatus,
    resetUserPassword,

    // Funções de dados
    loadData,
    loadUsers,
    loadProfiles,
    loadActivities,

    // Estatísticas
    getUserStats,

    // Busca e filtro
    searchUsers,
    filterUsersByType,
    filterUsersByStatus,

    // Logs
    logActivity
  }
}