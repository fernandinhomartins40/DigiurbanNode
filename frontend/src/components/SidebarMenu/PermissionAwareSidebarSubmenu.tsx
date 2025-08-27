import React from 'react'
import { SidebarSubmenu } from './SidebarSubmenu'
import { useAuth, UserRole as UserType } from '@/auth'

interface PermissionAwareSidebarSubmenuProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  basePath: string
  
  // Controle de acesso
  requiredPermissions?: string[]
  allowedUserTypes?: UserType[]
  requireAuth?: boolean
}

export function PermissionAwareSidebarSubmenu({
  title,
  icon,
  children,
  basePath,
  requiredPermissions = [],
  allowedUserTypes = [],
  requireAuth = true
}: PermissionAwareSidebarSubmenuProps) {
  const { profile: user, hasPermission } = useAuth()

  // Se requer autenticação mas não está logado, não mostrar
  if (requireAuth && !user) {
    return null
  }


  // Verificar tipos de usuário permitidos
  if (allowedUserTypes.length > 0 && user && !allowedUserTypes.includes(user.userType)) {
    return null
  }

  // Verificar permissões específicas
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    )
    
    if (!hasAllPermissions) {
      return null
    }
  }

  // Se passou por todas as verificações, renderizar submenu
  return (
    <SidebarSubmenu
      title={title}
      icon={icon}
      basePath={basePath}
    >
      {children}
    </SidebarSubmenu>
  )
}