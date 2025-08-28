/**
 * HOOK SIMPLIFICADO PARA GESTÃO DE USUÁRIOS
 * 
 * Usa apenas a arquitetura JWT limpa e funcional.
 * Remove toda dependência do Supabase.
 */

import { useState, useEffect } from 'react';
import UserManagementService, { UserProfile, CreateUserData } from '@/services/userManagementService';
import TenantService, { TenantPadrao } from '@/services/tenantService';
import { toast } from '@/hooks/use-toast';

export interface UsersManagementState {
  users: UserProfile[];
  tenants: TenantPadrao[];
  loading: boolean;
  error: string | null;
}

export const useUsersManagementSimple = () => {
  const [state, setState] = useState<UsersManagementState>({
    users: [],
    tenants: [],
    loading: false,
    error: null
  });

  // =====================================================
  // CARREGAMENTO INICIAL
  // =====================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [usersResult, tenantsResult] = await Promise.all([
        UserManagementService.getUsers(),
        TenantService.getAllTenants()
      ]);

      if (!usersResult.success) {
        throw new Error(usersResult.error || 'Erro ao carregar usuários');
      }

      setState(prev => ({
        ...prev,
        users: usersResult.data || [],
        tenants: tenantsResult || [],
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      toast({
        title: "Erro ao carregar dados",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // =====================================================
  // OPERAÇÕES DE USUÁRIOS
  // =====================================================

  const createUser = async (userData: CreateUserData) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const result = await UserManagementService.createUser(userData);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar usuário');
      }

      // Recarregar lista
      await loadUsers();

      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso."
      });

      return result.data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário';
      setState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: "Erro ao criar usuário",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const updateUser = async (userId: string, updates: Partial<CreateUserData>) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const result = await UserManagementService.updateUser(userId, updates);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar usuário');
      }

      // Recarregar lista
      await loadUsers();

      toast({
        title: "Usuário atualizado",
        description: "O usuário foi atualizado com sucesso."
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      setState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: "Erro ao atualizar usuário",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const result = await UserManagementService.deleteUser(userId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao deletar usuário');
      }

      // Recarregar lista
      await loadUsers();

      toast({
        title: "Usuário deletado",
        description: "O usuário foi deletado com sucesso."
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar usuário';
      setState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: "Erro ao deletar usuário",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const updateUserStatus = async (userId: string, status: 'ativo' | 'inativo' | 'suspenso' | 'sem_vinculo') => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const result = await UserManagementService.updateUserStatus(userId, status);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar status');
      }

      // Recarregar lista
      await loadUsers();

      toast({
        title: "Status atualizado",
        description: `Status do usuário alterado para ${status}.`
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar status';
      setState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: "Erro ao atualizar status",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const resetPassword = async (userId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const result = await UserManagementService.resetUserPassword(userId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao resetar senha');
      }

      setState(prev => ({ ...prev, loading: false }));

      toast({
        title: "Senha resetada",
        description: "A senha do usuário foi resetada com sucesso."
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao resetar senha';
      setState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: "Erro ao resetar senha",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  // =====================================================
  // FUNÇÕES DE RECARREGAMENTO
  // =====================================================

  const loadUsers = async () => {
    try {
      const result = await UserManagementService.getUsers();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao carregar usuários');
      }

      setState(prev => ({
        ...prev,
        users: result.data || [],
        loading: false
      }));

    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadTenants = async () => {
    try {
      const tenants = await TenantService.getAllTenants();
      
      setState(prev => ({
        ...prev,
        tenants,
        loading: false
      }));

    } catch (error) {
      console.error('Erro ao carregar tenants:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // =====================================================
  // FUNÇÕES DE ESTATÍSTICAS
  // =====================================================

  const getUserStats = () => {
    const { users } = state;
    const total = users.length;
    const active = users.filter(u => u.status === 'ativo').length;
    const inactive = users.filter(u => u.status !== 'ativo').length;

    const byType = users.reduce((acc, user) => {
      acc[user.tipo_usuario] = (acc[user.tipo_usuario] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byTenant = users.reduce((acc, user) => {
      const tenant = state.tenants.find(t => t.id === user.tenant_id);
      if (tenant) {
        acc[tenant.nome] = (acc[tenant.nome] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      byType,
      byTenant
    };
  };

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    // Estado
    ...state,

    // Operações
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    resetPassword,

    // Recarregamento
    loadInitialData,
    loadUsers,
    loadTenants,

    // Estatísticas
    getUserStats,

    // Funções de busca (implementação simples)
    searchUsers: (query: string) => {
      if (!query.trim()) return state.users;
      return state.users.filter(user => 
        user.nome_completo.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
    },

    filterUsersByType: (type: string) => {
      if (type === 'all') return state.users;
      return state.users.filter(user => user.tipo_usuario === type);
    },

    filterUsersByStatus: (status: string) => {
      if (status === 'all') return state.users;
      return state.users.filter(user => user.status === status);
    }
  };
};

export default useUsersManagementSimple;