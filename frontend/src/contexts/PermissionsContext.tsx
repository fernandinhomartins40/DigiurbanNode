import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/auth'

// ======================================================
// INTERFACE DO CONTEXTO DE PERMISSÕES
// ======================================================

interface PermissionsContextType {
  // Verificações básicas
  hasPermission: (permissionCode: string) => boolean
  hasAnyPermission: (permissionCodes: string[]) => boolean
  hasAllPermissions: (permissionCodes: string[]) => boolean
  
  // Verificações por módulo
  canAccessModule: (moduleId: string) => boolean
  canAccessSecretariat: (secretariatId?: string) => boolean
  canAccessSector: (sectorId?: string) => boolean
  
  // Verificações específicas por recurso/ação
  canCreate: (resource: string) => boolean
  canRead: (resource: string) => boolean
  canUpdate: (resource: string) => boolean
  canDelete: (resource: string) => boolean
  
  // Verificações do Gabinete
  canAccessGabinete: () => boolean
  canManageUsers: () => boolean
  canManagePermissions: () => boolean
  canViewReports: () => boolean
  canManageAlerts: () => boolean
  canAccessAuditoria: () => boolean
  
  // Verificações por secretaria
  canAccessSaude: () => boolean
  canAccessEducacao: () => boolean
  canAccessAssistenciaSocial: () => boolean
  canAccessObrasPublicas: () => boolean
  canAccessMeioAmbiente: () => boolean
  canAccessPlanejamentoUrbano: () => boolean
  canAccessServicosPublicos: () => boolean
  canAccessSegurancaPublica: () => boolean
  canAccessAgricultura: () => boolean
  canAccessTurismo: () => boolean
  canAccessEsportes: () => boolean
  canAccessCultura: () => boolean
  canAccessHabitacao: () => boolean
  
  // Verificações de nível hierárquico (nova hierarquia de 5 níveis)
  isSuperAdmin: () => boolean
  isAdmin: () => boolean
  isManager: () => boolean        // Nova função para gestor de secretaria
  isCoordinator: () => boolean    // Nova função para coordenador
  isUser: () => boolean           // Nova função para funcionário
  isGuest: () => boolean          // Nova função para cidadão
  
  // Verificações de compatibilidade (mapeamento de termos antigos)
  isSecretario: () => boolean     // Compatibilidade: secretario = manager
  isDiretor: () => boolean        // Compatibilidade: diretor = manager
  isCoordenador: () => boolean    // Compatibilidade: coordenador = coordinator
  isFuncionario: () => boolean    // Compatibilidade: funcionario = user
  isAtendente: () => boolean      // Compatibilidade: atendente = user
  isCidadao: () => boolean        // Compatibilidade: cidadao = guest
  
  // Verificações compostas
  canManageSecretariat: (secretariatId: string) => boolean
  canManageSector: (sectorId: string) => boolean
  canViewKPIs: () => boolean
  canExportData: () => boolean
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

// ======================================================
// HOOK PARA USAR PERMISSÕES
// ======================================================

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions deve ser usado dentro de um PermissionsProvider')
  }
  return context
}

// ======================================================
// PROVIDER DE PERMISSÕES
// ======================================================

interface PermissionsProviderProps {
  children: ReactNode
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const auth = useAuth()

  // ======================================================
  // VERIFICAÇÕES BÁSICAS
  // ======================================================

  const hasPermission = (permissionCode: string): boolean => {
    return auth.hasPermission(permissionCode)
  }

  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    // Fallback para quando o método não estiver disponível
    if (typeof auth.hasAnyPermission === 'function') {
      return auth.hasAnyPermission(permissionCodes)
    }
    // Implementação local como fallback
    return permissionCodes.some(code => auth.hasPermission(code))
  }

  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    // Fallback para quando o método não estiver disponível
    if (typeof auth.hasAllPermissions === 'function') {
      return auth.hasAllPermissions(permissionCodes)
    }
    // Implementação local como fallback
    return permissionCodes.every(code => auth.hasPermission(code))
  }

  // ======================================================
  // VERIFICAÇÕES POR MÓDULO E ESTRUTURA ORGANIZACIONAL
  // ======================================================

  const canAccessModule = (moduleId: string): boolean => {
    // Super admin e admin podem acessar tudo
    if (auth.isSuperAdmin() || auth.isAdmin()) {
      return true
    }

    // Verificar se tem permissão específica para o módulo
    return auth.hasPermission(`${moduleId}.access`) || auth.hasPermission(`${moduleId}.view`)
  }

  const canAccessSecretariat = (secretariatId?: string): boolean => {
    // Super admin e admin podem acessar todas as secretarias
    if (auth.isSuperAdmin() || auth.isAdmin()) {
      return true
    }

    // Se não especificou secretaria, verificar se tem acesso a qualquer uma
    if (!secretariatId) {
      return auth.profile?.secretaria_id !== null && auth.profile?.secretaria_id !== undefined
    }

    // Verificar se o usuário pertence à secretaria específica
    return auth.profile?.secretaria_id === secretariatId
  }

  const canAccessSector = (sectorId?: string): boolean => {
    // Super admin e admin podem acessar todos os setores
    if (auth.isSuperAdmin() || auth.isAdmin()) {
      return true
    }

    // Se não especificou setor, verificar se tem acesso a qualquer um
    if (!sectorId) {
      return auth.profile?.metadata?.setor_id !== null && auth.profile?.metadata?.setor_id !== undefined
    }

    // Verificar se o usuário pertence ao setor específico
    return auth.profile?.metadata?.setor_id === sectorId
  }

  // ======================================================
  // VERIFICAÇÕES CRUD GENÉRICAS
  // ======================================================

  const canCreate = (resource: string): boolean => {
    // Super admin e admin podem criar qualquer recurso
    if (auth.isSuperAdmin() || auth.isAdmin()) {
      return true
    }
    
    return hasAnyPermission([
      `${resource}.create`,
      `${resource}.manage`,
      'admin.all'
    ])
  }

  const canRead = (resource: string): boolean => {
    // Super admin e admin podem ler qualquer recurso
    if (auth.isSuperAdmin() || auth.isAdmin()) {
      return true
    }
    
    return hasAnyPermission([
      `${resource}.read`,
      `${resource}.view`,
      `${resource}.manage`,
      'admin.all'
    ])
  }

  const canUpdate = (resource: string): boolean => {
    // Super admin e admin podem editar qualquer recurso
    if (auth.isSuperAdmin() || auth.isAdmin()) {
      return true
    }
    
    return hasAnyPermission([
      `${resource}.update`,
      `${resource}.edit`,
      `${resource}.manage`,
      'admin.all'
    ])
  }

  const canDelete = (resource: string): boolean => {
    // Super admin e admin podem deletar qualquer recurso
    if (auth.isSuperAdmin() || auth.isAdmin()) {
      return true
    }
    
    return hasAnyPermission([
      `${resource}.delete`,
      `${resource}.remove`,
      `${resource}.manage`,
      'admin.all'
    ])
  }

  // ======================================================
  // VERIFICAÇÕES ESPECÍFICAS DO GABINETE
  // ======================================================

  const canAccessGabinete = (): boolean => {
    return hasAnyPermission([
      'gabinete.access',
      'gabinete.view',
      'gabinete.manage',
      'admin.all'
    ]) || auth.isSuperAdmin() || auth.isAdmin()
  }

  const canManageUsers = (): boolean => {
    return hasAnyPermission([
      'users.manage',
      'users.create',
      'users.update',
      'users.delete',
      'admin.all'
    ]) || auth.isSuperAdmin() || auth.isAdmin()
  }

  const canManagePermissions = (): boolean => {
    return hasAnyPermission([
      'permissions.manage',
      'profiles.manage',
      'admin.all'
    ]) || auth.isSuperAdmin() || auth.isAdmin()
  }

  const canViewReports = (): boolean => {
    return hasAnyPermission([
      'reports.view',
      'reports.generate',
      'reports.export',
      'gabinete.reports',
      'admin.all'
    ]) || auth.isSuperAdmin() || auth.isAdmin()
  }

  const canManageAlerts = (): boolean => {
    return hasAnyPermission([
      'alerts.manage',
      'alerts.create',
      'alerts.update',
      'gabinete.alerts',
      'admin.all'
    ]) || auth.isSuperAdmin() || auth.isAdmin()
  }

  const canAccessAuditoria = (): boolean => {
    return hasAnyPermission([
      'auditoria.access',
      'auditoria.view',
      'gabinete.auditoria',
      'admin.all'
    ]) || auth.isSuperAdmin() || auth.isAdmin()
  }

  // ======================================================
  // VERIFICAÇÕES POR SECRETARIA
  // ======================================================

  const canAccessSaude = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('saude') || hasAnyPermission(['saude.access', 'admin.all'])
  }

  const canAccessEducacao = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('educacao') || hasAnyPermission(['educacao.access', 'admin.all'])
  }

  const canAccessAssistenciaSocial = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('assistencia-social') || hasAnyPermission(['assistencia-social.access', 'admin.all'])
  }

  const canAccessObrasPublicas = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('obras-publicas') || hasAnyPermission(['obras-publicas.access', 'admin.all'])
  }

  const canAccessMeioAmbiente = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('meio-ambiente') || hasAnyPermission(['meio-ambiente.access', 'admin.all'])
  }

  const canAccessPlanejamentoUrbano = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('planejamento-urbano') || hasAnyPermission(['planejamento-urbano.access', 'admin.all'])
  }

  const canAccessServicosPublicos = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('servicos-publicos') || hasAnyPermission(['servicos-publicos.access', 'admin.all'])
  }

  const canAccessSegurancaPublica = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('seguranca-publica') || hasAnyPermission(['seguranca-publica.access', 'admin.all'])
  }

  const canAccessAgricultura = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('agricultura') || hasAnyPermission(['agricultura.access', 'admin.all'])
  }

  const canAccessTurismo = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('turismo') || hasAnyPermission(['turismo.access', 'admin.all'])
  }

  const canAccessEsportes = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('esportes') || hasAnyPermission(['esportes.access', 'admin.all'])
  }

  const canAccessCultura = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('cultura') || hasAnyPermission(['cultura.access', 'admin.all'])
  }

  const canAccessHabitacao = (): boolean => {
    return auth.isSuperAdmin() || auth.isAdmin() || canAccessSecretariat('habitacao') || hasAnyPermission(['habitacao.access', 'admin.all'])
  }

  // ======================================================
  // VERIFICAÇÕES DE NÍVEL HIERÁRQUICO
  // ======================================================

  const isSuperAdmin = (): boolean => {
    return auth.isSuperAdmin()
  }

  const isAdmin = (): boolean => {
    return auth.isAdmin()
  }

  // ====================================================================
  // VERIFICAÇÕES HIERÁRQUICAS ATUALIZADAS - NOVA HIERARQUIA DE 5 NÍVEIS
  // ====================================================================

  const isManager = (): boolean => {
    return auth.isManager ? auth.isManager() : auth.profile?.role === 'manager'
  }

  const isCoordinator = (): boolean => {
    return auth.isCoordinator ? auth.isCoordinator() : auth.profile?.role === 'coordinator'
  }

  const isUser = (): boolean => {
    return auth.isUser ? auth.isUser() : auth.profile?.role === 'user'
  }

  const isGuest = (): boolean => {
    return auth.profile?.role === 'guest'
  }

  // ====================================================================
  // VERIFICAÇÕES DE COMPATIBILIDADE (MAPEAMENTO DE TERMOS ANTIGOS)
  // ====================================================================

  const isSecretario = (): boolean => {
    // Secretário = Manager na nova hierarquia
    return isManager()
  }

  const isDiretor = (): boolean => {
    // Diretor = Manager na nova hierarquia
    return isManager()
  }

  const isCoordenador = (): boolean => {
    // Coordenador = Coordinator na nova hierarquia
    return isCoordinator()
  }

  const isFuncionario = (): boolean => {
    // Funcionário = User na nova hierarquia
    return isUser()
  }

  const isAtendente = (): boolean => {
    // Atendente = User na nova hierarquia
    return isUser()
  }

  const isCidadao = (): boolean => {
    // Cidadão = Guest na nova hierarquia
    return isGuest()
  }

  // ======================================================
  // VERIFICAÇÕES COMPOSTAS
  // ======================================================

  const canManageSecretariat = (secretariatId: string): boolean => {
    // Super admin pode gerenciar tudo
    if (auth.isSuperAdmin()) return true
    
    // Admin pode gerenciar todas as secretarias
    if (auth.isAdmin()) return true
    
    // Secretário só pode gerenciar sua própria secretaria
    if (auth.profile?.tipo_usuario === 'secretario') {
      return auth.profile?.secretaria_id === secretariatId
    }
    
    return false
  }

  const canManageSector = (sectorId: string): boolean => {
    // Super admin e admin podem gerenciar tudo
    if (auth.isSuperAdmin() || auth.isAdmin()) return true
    
    // Secretário pode gerenciar setores da sua secretaria
    if (auth.profile?.tipo_usuario === 'secretario') {
      // Aqui seria necessário verificar se o setor pertence à secretaria do usuário
      return true // Simplificado por enquanto
    }
    
    // Diretor pode gerenciar apenas seu próprio setor
    if (auth.profile?.tipo_usuario === 'diretor') {
      return auth.profile?.setor_id === sectorId
    }
    
    return false
  }

  const canViewKPIs = (): boolean => {
    return hasAnyPermission([
      'kpis.view',
      'dashboard.view',
      'gabinete.kpis',
      'reports.view',
      'admin.all'
    ]) || auth.isSuperAdmin() || auth.isAdmin()
  }

  const canExportData = (): boolean => {
    return hasAnyPermission([
      'data.export',
      'reports.export',
      'admin.export',
      'admin.all'
    ]) || auth.isSuperAdmin() || auth.isAdmin()
  }

  // ======================================================
  // VALOR DO CONTEXTO
  // ======================================================

  const value: PermissionsContextType = {
    // Verificações básicas
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Verificações por módulo
    canAccessModule,
    canAccessSecretariat,
    canAccessSector,
    
    // Verificações CRUD
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    
    // Verificações do Gabinete
    canAccessGabinete,
    canManageUsers,
    canManagePermissions,
    canViewReports,
    canManageAlerts,
    canAccessAuditoria,
    
    // Verificações por secretaria
    canAccessSaude,
    canAccessEducacao,
    canAccessAssistenciaSocial,
    canAccessObrasPublicas,
    canAccessMeioAmbiente,
    canAccessPlanejamentoUrbano,
    canAccessServicosPublicos,
    canAccessSegurancaPublica,
    canAccessAgricultura,
    canAccessTurismo,
    canAccessEsportes,
    canAccessCultura,
    canAccessHabitacao,
    
    // Verificações de nível hierárquico (nova hierarquia de 5 níveis)
    isSuperAdmin,
    isAdmin,
    isManager,
    isCoordinator,
    isUser,
    isGuest,
    
    // Verificações de compatibilidade (mapeamento de termos antigos)
    isSecretario,
    isDiretor,
    isCoordenador,
    isFuncionario,
    isAtendente,
    isCidadao,
    
    // Verificações compostas
    canManageSecretariat,
    canManageSector,
    canViewKPIs,
    canExportData
  }

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

// ======================================================
// COMPONENTE PARA RENDERIZAÇÃO CONDICIONAL
// ======================================================

interface PermissionAwareProps {
  children: ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  fallback?: ReactNode
  userTypes?: string[]
  moduleId?: string
}

export function PermissionAware({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  userTypes = [],
  moduleId
}: PermissionAwareProps) {
  const perms = usePermissions()
  const auth = useAuth()

  // Verificar tipos de usuário (atualizado para nova hierarquia)
  if (userTypes.length > 0) {
    const hasValidUserType = userTypes.includes(auth.profile?.role || '')
    if (!hasValidUserType) return <>{fallback}</>
  }

  // Verificar módulo
  if (moduleId && !perms.canAccessModule(moduleId)) {
    return <>{fallback}</>
  }

  // Verificar permissão única
  if (permission && !perms.hasPermission(permission)) {
    return <>{fallback}</>
  }

  // Verificar múltiplas permissões
  if (permissions.length > 0) {
    const hasPermissions = requireAll 
      ? perms.hasAllPermissions(permissions)
      : perms.hasAnyPermission(permissions)
    
    if (!hasPermissions) return <>{fallback}</>
  }

  return <>{children}</>
}