// =====================================================
// HOOK PARA GERENCIAMENTO DE USUÁRIOS E PERMISSÕES
// =====================================================

import { useState, useEffect } from 'react'
import { APIClient } from "@/auth"
import { toast } from 'react-hot-toast'
import { UserProfile, UserRole as UserType } from '@/auth'

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
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        secretaria:secretarias(id, nome)
      `)
      .order('nome')

    if (error) throw error
    setUsers(data || [])
  }

  const createUser = async (userData: {
    email: string
    nome: string
    tipo_usuario: UserProfile['tipo_usuario']
    secretaria_id?: string
    password: string
  }) => {
    try {
      // Criar usuário na auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      })

      if (authError) throw authError

      // Criar perfil
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          email: userData.email,
          nome: userData.nome,
          tipo_usuario: userData.tipo_usuario,
          secretaria_id: userData.secretaria_id || null,
          ativo: true
        }])

      if (profileError) throw profileError

      // Registrar atividade
      await logActivity(authData.user.id, 'Criou usuário', `Criou o usuário '${userData.nome}'`)
      
      await loadUsers()
      toast.success('Usuário criado com sucesso!')
      
      return authData.user

    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast.error('Erro ao criar usuário')
      throw error
    }
  }

  const updateUser = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)

      if (error) throw error

      await logActivity(userId, 'Alterou usuário', `Alterou dados do usuário`)
      await loadUsers()
      toast.success('Usuário atualizado com sucesso!')

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      toast.error('Erro ao atualizar usuário')
      throw error
    }
  }

  const toggleUserStatus = async (userId: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ativo })
        .eq('id', userId)

      if (error) throw error

      await logActivity(userId, ativo ? 'Ativou usuário' : 'Desativou usuário', 
        `${ativo ? 'Ativou' : 'Desativou'} o usuário`)
      
      await loadUsers()
      toast.success(`Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso!`)

    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status do usuário')
      throw error
    }
  }

  const resetUserPassword = async (userId: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      })

      if (error) throw error

      await logActivity(userId, 'Resetou senha', 'Resetou a senha do usuário')
      toast.success('Senha resetada com sucesso!')

    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      toast.error('Erro ao resetar senha')
      throw error
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

    // Contar usuários por tipo
    const { data: userCounts } = await supabase
      .from('user_profiles')
      .select('tipo_usuario')

    const countsByType = userCounts?.reduce((acc, user) => {
      acc[user.tipo_usuario] = (acc[user.tipo_usuario] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

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
    const { data, error } = await supabase
      .from('user_activities')
      .select(`
        *,
        user_profile:user_profiles(nome)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      // Se a tabela não existir, criar dados mock
      const mockActivities: UserActivity[] = [
        {
          id: '1',
          user_id: 'admin-user',
          acao: 'Criou usuário',
          detalhes: 'Criou novo usuário no sistema',
          created_at: new Date().toISOString(),
          user_profile: { nome: 'Administrador' }
        }
      ]
      setActivities(mockActivities)
      return
    }

    setActivities(data || [])
  }

  const logActivity = async (userId: string, acao: string, detalhes: string) => {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert([{
          user_id: userId,
          acao,
          detalhes
        }])

      if (error) {
        console.warn('Tabela de atividades não encontrada:', error)
        return
      }

    } catch (error) {
      console.warn('Erro ao registrar atividade:', error)
    }
  }

  // =====================================================
  // ESTATÍSTICAS
  // =====================================================

  const getUserStats = () => {
    const total = users.length
    const active = users.filter(u => u.ativo).length
    const inactive = users.filter(u => !u.ativo).length

    const byType = users.reduce((acc, user) => {
      acc[user.tipo_usuario] = (acc[user.tipo_usuario] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const bySecretaria = users.reduce((acc, user) => {
      if (user.secretaria?.nome) {
        acc[user.secretaria.nome] = (acc[user.secretaria.nome] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      active,
      inactive,
      byType,
      bySecretaria
    }
  }

  // =====================================================
  // FUNÇÕES DE BUSCA E FILTRO
  // =====================================================

  const searchUsers = (query: string) => {
    if (!query.trim()) return users

    return users.filter(user => 
      user.nome.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.secretaria?.nome.toLowerCase().includes(query.toLowerCase())
    )
  }

  const filterUsersByType = (type: string) => {
    if (type === 'all') return users
    return users.filter(user => user.tipo_usuario === type)
  }

  const filterUsersByStatus = (status: string) => {
    if (status === 'all') return users
    return users.filter(user => 
      status === 'active' ? user.ativo : !user.ativo
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