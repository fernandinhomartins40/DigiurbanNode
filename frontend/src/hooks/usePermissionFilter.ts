// ====================================================================
// 🔐 PERMISSION FILTER HOOK - FILTROS DE INTERFACE
// ====================================================================
// Sistema para filtrar elementos da UI baseado em permissões granulares
// Oculta componentes que o usuário não tem acesso
// ====================================================================

import React from 'react';
import { useAuth } from '@/auth';

// ====================================================================
// INTERFACES
// ====================================================================

export interface MenuItemWithPermissions {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItemWithPermissions[];

  // Controles de permissão
  requiredPermission?: string;
  requiredPermissions?: string[]; // AND logic
  anyPermissions?: string[]; // OR logic
  requiredRole?: string;
  minimumRole?: string;
  requiredSecretaria?: string;
  secretariaLevel?: 'read' | 'write' | 'admin';

  // Controles especiais
  hideForRoles?: string[];
  showForRoles?: string[];
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

export interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[]; // AND logic
  anyPermissions?: string[]; // OR logic
  role?: string;
  minimumRole?: string;
  secretaria?: string;
  secretariaLevel?: 'read' | 'write' | 'admin';
  hideForRoles?: string[];
  showForRoles?: string[];
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  fallback?: React.ReactNode;
  debug?: boolean;
}

// ====================================================================
// HOOK PRINCIPAL
// ====================================================================

export const usePermissionFilter = () => {
  const { profile: user, hasPermission, isAuthenticated } = useAuth();

  // ====================================================================
  // VERIFICADORES DE ACESSO
  // ====================================================================

  const checkRoleAccess = (item: Omit<PermissionGateProps, 'children'>): boolean => {
    if (!user || !isAuthenticated) return false;

    // Super admin bypass
    if (user.role === 'super_admin' && !item.hideForRoles?.includes('super_admin')) {
      return true;
    }

    // Super admin only
    if (item.superAdminOnly) {
      return user.role === 'super_admin';
    }

    // Admin only
    if (item.adminOnly) {
      return ['admin', 'super_admin'].includes(user.role);
    }

    // Hide for specific roles
    if (item.hideForRoles?.includes(user.role)) {
      return false;
    }

    // Show only for specific roles
    if (item.showForRoles && !item.showForRoles.includes(user.role)) {
      return false;
    }

    // Role match
    if (item.role && user.role !== item.role) {
      return false;
    }

    // Minimum role check
    if (item.minimumRole) {
      const roleHierarchy: Record<string, number> = {
        guest: 0,
        user: 1,
        coordinator: 2,
        manager: 3,
        admin: 4,
        super_admin: 5
      };

      const userLevel = roleHierarchy[user.role] || 0;
      const requiredLevel = roleHierarchy[item.minimumRole] || 0;

      if (userLevel < requiredLevel) {
        return false;
      }
    }

    return true;
  };

  const checkPermissionAccess = (item: Omit<PermissionGateProps, 'children'>): boolean => {
    if (!user || !isAuthenticated) return false;

    // Super admin bypass (exceto se explicitamente escondido)
    if (user.role === 'super_admin' && !item.hideForRoles?.includes('super_admin')) {
      return true;
    }

    // Single permission
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }

    // Multiple permissions (AND logic)
    if (item.permissions && !item.permissions.every(p => hasPermission(p))) {
      return false;
    }

    // Any permissions (OR logic)
    if (item.anyPermissions && !item.anyPermissions.some(p => hasPermission(p))) {
      return false;
    }

    // Secretaria access
    if (item.secretaria) {
      const level = item.secretariaLevel || 'read';
      const requiredPermission = `${item.secretaria}.${level}`;
      if (!hasPermission(requiredPermission)) {
        return false;
      }
    }

    return true;
  };

  const hasAccess = (item: Omit<PermissionGateProps, 'children'>): boolean => {
    // Verificar role primeiro
    if (!checkRoleAccess(item)) {
      return false;
    }

    // Depois verificar permissões
    return checkPermissionAccess(item);
  };

  // ====================================================================
  // FILTROS DE MENU
  // ====================================================================

  const filterMenuItems = (items: MenuItemWithPermissions[]): MenuItemWithPermissions[] => {
    return items
      .filter(item => {
        const accessCheck = {
          permission: item.requiredPermission,
          permissions: item.requiredPermissions,
          anyPermissions: item.anyPermissions,
          role: item.requiredRole,
          minimumRole: item.minimumRole,
          secretaria: item.requiredSecretaria,
          secretariaLevel: item.secretariaLevel,
          hideForRoles: item.hideForRoles,
          showForRoles: item.showForRoles,
          adminOnly: item.adminOnly,
          superAdminOnly: item.superAdminOnly
        };

        return hasAccess(accessCheck);
      })
      .map(item => ({
        ...item,
        children: item.children ? filterMenuItems(item.children) : undefined
      }));
  };

  // ====================================================================
  // FILTROS DE AÇÕES
  // ====================================================================

  const filterActions = <T extends { permission?: string; permissions?: string[]; role?: string }>(
    actions: T[]
  ): T[] => {
    return actions.filter(action => {
      const accessCheck = {
        permission: action.permission,
        permissions: action.permissions,
        role: action.role
      };

      return hasAccess(accessCheck);
    });
  };

  // ====================================================================
  // VERIFICADORES DE FUNCIONALIDADE
  // ====================================================================

  const canCreateUser = (): boolean => hasPermission('users.create');
  const canEditUser = (): boolean => hasPermission('users.update');
  const canDeleteUser = (): boolean => hasPermission('users.delete');
  const canResetPassword = (): boolean => hasPermission('users.reset_password');
  const canManageRoles = (): boolean => hasPermission('users.manage_roles');
  const canManagePermissions = (): boolean => hasPermission('users.manage_permissions');

  const canAccessSystem = (): boolean => hasPermission('system.admin');
  const canConfigureSystem = (): boolean => hasPermission('system.config');

  const canViewAudit = (): boolean => hasPermission('audit.read');
  const canExportAudit = (): boolean => hasPermission('audit.export');

  const canManageTenants = (): boolean => hasPermission('tenants.create');

  // ====================================================================
  // VERIFICADORES DO PAINEL DO CIDADÃO
  // ====================================================================

  const canAccessCidadaoDashboard = (): boolean => hasPermission('cidadao.dashboard');
  const canCreateProtocolo = (): boolean => hasPermission('cidadao.protocolos.create');
  const canViewProtocolos = (): boolean => hasPermission('cidadao.protocolos.read');
  const canViewServicos = (): boolean => hasPermission('cidadao.servicos.read');
  const canViewInformacoes = (): boolean => hasPermission('cidadao.informacoes.read');
  const canDownloadDocumentos = (): boolean => hasPermission('cidadao.documentos.download');
  const canContactPrefeitura = (): boolean => hasPermission('cidadao.contato.create');
  const canViewAgenda = (): boolean => hasPermission('cidadao.agenda.read');
  const canViewNoticias = (): boolean => hasPermission('cidadao.noticias.read');
  const canUpdatePerfil = (): boolean => hasPermission('cidadao.perfil.update');

  const isCidadao = (): boolean => user?.role === 'cidadao';
  const canAccessCidadaoPanel = (): boolean => isCidadao() || user?.role === 'super_admin';

  // ====================================================================
  // VERIFICADORES POR SECRETARIA
  // ====================================================================

  const canAccessSecretaria = (secretaria: string, level: 'read' | 'write' | 'admin' = 'read'): boolean => {
    const permission = `${secretaria}.${level}`;
    return hasPermission(permission);
  };

  const getSecretariasWithAccess = (level: 'read' | 'write' | 'admin' = 'read'): string[] => {
    const secretarias = [
      'gabinete', 'saude', 'educacao', 'assistencia_social', 'obras',
      'meio_ambiente', 'cultura', 'esportes', 'turismo', 'agricultura',
      'planejamento_urbano', 'seguranca_publica', 'servicos_publicos', 'habitacao'
    ];

    return secretarias.filter(secretaria => canAccessSecretaria(secretaria, level));
  };

  // ====================================================================
  // RETORNO DO HOOK
  // ====================================================================

  return {
    // Verificadores principais
    hasAccess,
    checkRoleAccess,
    checkPermissionAccess,

    // Filtros
    filterMenuItems,
    filterActions,

    // Verificadores de funcionalidade
    canCreateUser,
    canEditUser,
    canDeleteUser,
    canResetPassword,
    canManageRoles,
    canManagePermissions,
    canAccessSystem,
    canConfigureSystem,
    canViewAudit,
    canExportAudit,
    canManageTenants,

    // Verificadores do painel do cidadão
    canAccessCidadaoDashboard,
    canCreateProtocolo,
    canViewProtocolos,
    canViewServicos,
    canViewInformacoes,
    canDownloadDocumentos,
    canContactPrefeitura,
    canViewAgenda,
    canViewNoticias,
    canUpdatePerfil,
    isCidadao,
    canAccessCidadaoPanel,

    // Verificadores por secretaria
    canAccessSecretaria,
    getSecretariasWithAccess,

    // Estado do usuário
    user,
    isAuthenticated
  };
};

// ====================================================================
// COMPONENTE PERMISSION GATE
// ====================================================================

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  fallback = null,
  debug = false,
  ...accessCheck
}) => {
  const { hasAccess, user } = usePermissionFilter();

  const hasAccessToRender = hasAccess(accessCheck);

  if (debug) {
    console.log(`🔐 [PermissionGate] Debug:`, {
      hasAccess: hasAccessToRender,
      user: user?.email,
      role: user?.role,
      accessCheck
    });
  }

  if (!hasAccessToRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ====================================================================
// COMPONENTES DE CONVENIÊNCIA
// ====================================================================

// Admin Gate
export const AdminGate: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGate adminOnly fallback={fallback}>
    {children}
  </PermissionGate>
);

// Super Admin Gate
export const SuperAdminGate: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGate superAdminOnly fallback={fallback}>
    {children}
  </PermissionGate>
);

// User Management Gate
export const UserManagementGate: React.FC<{
  children: React.ReactNode;
  action: 'create' | 'edit' | 'delete' | 'reset_password' | 'manage_roles' | 'manage_permissions';
  fallback?: React.ReactNode;
}> = ({ children, action, fallback = null }) => {
  const permission = `users.${action === 'edit' ? 'update' : action}`;

  return (
    <PermissionGate permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

// Secretaria Gate
export const SecretariaPermissionGate: React.FC<{
  children: React.ReactNode;
  secretaria: string;
  level?: 'read' | 'write' | 'admin';
  fallback?: React.ReactNode;
}> = ({ children, secretaria, level = 'read', fallback = null }) => (
  <PermissionGate secretaria={secretaria} secretariaLevel={level} fallback={fallback}>
    {children}
  </PermissionGate>
);

export default usePermissionFilter;