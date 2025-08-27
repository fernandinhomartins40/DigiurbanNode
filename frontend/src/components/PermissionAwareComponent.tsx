// ======================================================
// COMPONENTE ATUALIZADO PARA USAR O NOVO SISTEMA UNIFICADO
// ======================================================

import { ReactNode } from 'react'
import { usePermissions } from "@/contexts/PermissionsContext"
import { useAuth } from '@/auth'

interface PermissionAwareComponentProps {
  children: ReactNode
  requiredPermissions?: string[]
  requireAll?: boolean // Se true, precisa de todas as permissões. Se false, precisa de pelo menos uma
  requiredUserTypes?: string[]
  requiredSecretariat?: string
  requiredSector?: string
  fallback?: ReactNode
  onAccessDenied?: () => void
}

export const PermissionAwareComponent = ({
  children,
  requiredPermissions = [],
  requireAll = false,
  requiredUserTypes = [],
  requiredSecretariat,
  requiredSector,
  fallback = null,
  onAccessDenied
}: PermissionAwareComponentProps) => {
  const { profile: user, profile, isLoading: loading } = useAuth()
  const permissions = usePermissions()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    onAccessDenied?.()
    return <>{fallback}</>
  }

  let hasAccess = true

  // Verificar tipo de usuário
  if (requiredUserTypes.length > 0) {
    hasAccess = hasAccess && requiredUserTypes.includes(profile.tipo_usuario)
  }

  // Verificar secretaria
  if (requiredSecretariat) {
    const canSec = typeof (permissions as any).canAccessSecretariat === 'function'
      ? (permissions as any).canAccessSecretariat(requiredSecretariat)
      : ((profile as any)?.secretaria_id ? (profile as any).secretaria_id === requiredSecretariat : false)
    hasAccess = hasAccess && !!canSec
  }

  // Verificar setor
  if (requiredSector) {
    const userSectorId = (profile as any)?.metadata?.setor_id ?? (profile as any)?.setor_id
    const canSector = typeof (permissions as any).canAccessSector === 'function'
      ? (permissions as any).canAccessSector(requiredSector)
      : (userSectorId ? userSectorId === requiredSector : false)
    hasAccess = hasAccess && !!canSector
  }

  // Verificar permissões específicas
  if (requiredPermissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAccess && permissions.hasAllPermissions(requiredPermissions)
    } else {
      hasAccess = hasAccess && permissions.hasAnyPermission(requiredPermissions)
    }
  }

  if (!hasAccess) {
    onAccessDenied?.()
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Hook legado - redirecionado para o novo sistema
export const usePermissions = () => {
  // Importar o hook do novo sistema  
  return require('../contexts/PermissionsContext').usePermissions()
}

// ======================================================
// COMPONENTES APRIMORADOS USANDO O NOVO SISTEMA
// ======================================================

// Componentes específicos para diferentes níveis de acesso
export const AdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionAwareComponent
    requiredUserTypes={['super_admin', 'admin']}
    fallback={fallback}
  >
    {children}
  </PermissionAwareComponent>
)

export const SuperAdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionAwareComponent
    requiredUserTypes={['super_admin']}
    fallback={fallback}
  >
    {children}
  </PermissionAwareComponent>
)

export const SecretarioOnly = ({ children, secretariatId, fallback }: { 
  children: ReactNode 
  secretariatId?: string
  fallback?: ReactNode
}) => (
  <PermissionAwareComponent
    requiredUserTypes={['super_admin', 'admin', 'secretario']}
    requiredSecretariat={secretariatId}
    fallback={fallback}
  >
    {children}
  </PermissionAwareComponent>
)

export const FuncionarioOnly = ({ children, sectorId, fallback }: { 
  children: ReactNode 
  sectorId?: string
  fallback?: ReactNode
}) => (
  <PermissionAwareComponent
    requiredUserTypes={['super_admin', 'admin', 'secretario', 'funcionario', 'atendente', 'coordenador', 'diretor']}
    requiredSector={sectorId}
    fallback={fallback}
  >
    {children}
  </PermissionAwareComponent>
)

export const CidadaoOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionAwareComponent
    requiredUserTypes={['cidadao']}
    fallback={fallback}
  >
    {children}
  </PermissionAwareComponent>
)

// Componente para exibir componentes baseados em permissões específicas
export const WithPermission = ({ 
  children, 
  permissions, 
  requireAll = false, 
  fallback 
}: { 
  children: ReactNode 
  permissions: string[]
  requireAll?: boolean
  fallback?: ReactNode
}) => (
  <PermissionAwareComponent
    requiredPermissions={permissions}
    requireAll={requireAll}
    fallback={fallback}
  >
    {children}
  </PermissionAwareComponent>
)

// Componentes específicos para módulos do sistema
export const GabineteOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionAwareComponent
    requiredPermissions={['gabinete.access']}
    fallback={fallback}
  >
    {children}
  </PermissionAwareComponent>
)

export const ReportsOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionAwareComponent
    requiredPermissions={['reports.view', 'reports.generate']}
    requireAll={false}
    fallback={fallback}
  >
    {children}
  </PermissionAwareComponent>
)

export const UserManagementOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionAwareComponent
    requiredPermissions={['users.manage', 'users.create']}
    requireAll={false}
    fallback={fallback}
  >
    {children}
  </PermissionAwareComponent>
)