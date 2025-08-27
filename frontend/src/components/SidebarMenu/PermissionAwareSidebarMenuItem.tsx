import React from 'react'
import { SidebarMenuItem } from './SidebarMenuItem'
import { useAuth, UserRole as UserType } from '@/auth'

interface PermissionAwareSidebarMenuItemProps {
  href: string
  icon?: React.ReactNode
  children: React.ReactNode
  exactMatch?: boolean
  onSetRef?: (href: string, element: HTMLElement | null) => void
  
  // Controle de acesso
  requiredPermissions?: string[]
  allowedUserTypes?: UserType[]
  requireAuth?: boolean
}

export function PermissionAwareSidebarMenuItem({
  href,
  icon,
  children,
  exactMatch = false,
  onSetRef,
  requiredPermissions = [],
  allowedUserTypes = [],
  requireAuth = true
}: PermissionAwareSidebarMenuItemProps) {
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

  // Se passou por todas as verificações, renderizar item
  return (
    <SidebarMenuItem
      href={href}
      icon={icon}
      exactMatch={exactMatch}
      onSetRef={onSetRef}
    >
      {children}
    </SidebarMenuItem>
  )
}