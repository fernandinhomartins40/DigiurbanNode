// ====================================================================
// 🔐 PERMISSION GUARD - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Componente para proteção granular baseada em permissões
// Sistema RBAC completo com recursos e ações específicas
// ====================================================================

import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertTriangle } from 'lucide-react';

// ====================================================================
// INTERFACES
// ====================================================================

interface PermissionGuardProps {
  /** Permissão específica requerida (código) */
  permission?: string;
  /** Recurso e ação para verificação granular */
  resource?: string;
  action?: string;
  /** Lista de permissões - usuário precisa ter TODAS */
  requiredPermissions?: string[];
  /** Lista de permissões - usuário precisa ter PELO MENOS UMA */
  anyPermissions?: string[];
  /** Conteúdo a ser renderizado se autorizado */
  children: ReactNode;
  /** Componente customizado para acesso negado */
  fallback?: ReactNode;
  /** Mostrar fallback padrão se não tiver acesso */
  showFallback?: boolean;
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  resource,
  action,
  requiredPermissions = [],
  anyPermissions = [],
  children,
  fallback,
  showFallback = true
}) => {
  const { 
    hasPermission, 
    hasAllPermissions, 
    hasAnyPermission,
    canAccess,
    isLoading 
  } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  let hasAccess = false;

  // Verificar permissão específica por código
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Verificar por recurso e ação
  else if (resource && action) {
    hasAccess = canAccess(resource, action);
  }
  // Verificar todas as permissões requeridas
  else if (requiredPermissions.length > 0) {
    hasAccess = hasAllPermissions(requiredPermissions);
  }
  // Verificar se tem pelo menos uma das permissões
  else if (anyPermissions.length > 0) {
    hasAccess = hasAnyPermission(anyPermissions);
  }
  // Se nenhuma verificação foi especificada, permitir acesso
  else {
    hasAccess = true;
  }

  if (!hasAccess) {
    // Componente customizado de fallback
    if (fallback) {
      return <>{fallback}</>;
    }

    // Fallback padrão
    if (showFallback) {
      return <DefaultPermissionFallback />;
    }

    // Não renderizar nada
    return null;
  }

  // Acesso autorizado - renderizar children
  return <>{children}</>;
};

// ====================================================================
// COMPONENTE DE FALLBACK PADRÃO
// ====================================================================

const DefaultPermissionFallback: React.FC = () => {
  return (
    <Alert className="border-destructive/50">
      <Lock className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        Você não tem permissão para visualizar este conteúdo.
      </AlertDescription>
    </Alert>
  );
};

// ====================================================================
// COMPONENTES DE CONVENIÊNCIA
// ====================================================================

/**
 * Guard para operações CRUD
 */
interface CRUDGuardProps {
  operation: 'create' | 'read' | 'update' | 'delete';
  resource: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const CRUDGuard: React.FC<CRUDGuardProps> = ({
  operation,
  resource,
  children,
  fallback
}) => {
  return (
    <PermissionGuard
      resource={resource}
      action={operation}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
};

/**
 * Guard para administradores
 */
interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  includeManagers?: boolean;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  fallback,
  includeManagers = false
}) => {
  const allowedPermissions = includeManagers 
    ? ['admin_access', 'manager_access']
    : ['admin_access'];

  return (
    <PermissionGuard
      anyPermissions={allowedPermissions}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
};

/**
 * Guard para super administradores
 */
interface SuperAdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({
  children,
  fallback
}) => {
  return (
    <PermissionGuard
      permission="system_admin"
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
};

/**
 * Guard para operações de tenant
 */
interface TenantGuardProps {
  tenantId?: string;
  operation?: 'read' | 'write' | 'admin';
  children: ReactNode;
  fallback?: ReactNode;
}

export const TenantGuard: React.FC<TenantGuardProps> = ({
  tenantId,
  operation = 'read',
  children,
  fallback
}) => {
  const { profile, canAccessTenant } = useAuth();

  // Se não especificou tenantId, usar o do usuário atual
  const targetTenantId = tenantId || profile?.tenantId;

  if (!targetTenantId || !canAccessTenant(targetTenantId)) {
    return fallback ? <>{fallback}</> : <DefaultPermissionFallback />;
  }

  const permissionMap = {
    read: 'tenant_read',
    write: 'tenant_write', 
    admin: 'tenant_admin'
  };

  return (
    <PermissionGuard
      permission={permissionMap[operation]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
};

// ====================================================================
// HOOKS AUXILIARES
// ====================================================================

/**
 * Hook para verificar múltiplas condições de permissão
 */
export const usePermissionCheck = () => {
  const auth = useAuth();

  const checkMultiple = (conditions: {
    permissions?: string[];
    anyPermissions?: string[];
    resource?: string;
    action?: string;
  }): boolean => {
    const { permissions = [], anyPermissions = [], resource, action } = conditions;

    // Verificar todas as permissões requeridas
    if (permissions.length > 0 && !auth.hasAllPermissions(permissions)) {
      return false;
    }

    // Verificar se tem pelo menos uma das permissões
    if (anyPermissions.length > 0 && !auth.hasAnyPermission(anyPermissions)) {
      return false;
    }

    // Verificar recurso/ação específica
    if (resource && action && !auth.canAccess(resource, action)) {
      return false;
    }

    return true;
  };

  return {
    ...auth,
    checkMultiple
  };
};

export default PermissionGuard;