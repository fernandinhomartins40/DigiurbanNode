// ====================================================================
// 🛡️ DIGIURBAN 2.0 - PROTEÇÃO DE ROTAS UNIFICADA (FASE 2)
// ====================================================================
// Componente ÚNICO de proteção conforme especificação da Fase 2
// Versão: 2.1.0 | Data: 2025-08-17

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/auth';

// Mapeamento para compatibilidade
type UserType = UserRole;
import { toast } from 'sonner';

// ====================================================================
// HIERARQUIA DE USUÁRIOS CONFORME FASE 2
// ====================================================================

const USER_HIERARCHY: Record<UserType, number> = {
  'super_admin': 5,    // Acesso sistêmico total
  'admin': 4,          // Gestão municipal completa
  'manager': 3,        // Gestão de secretaria
  'coordinator': 2,    // Coordenação de equipes
  'user': 1,           // Operação básica
  'guest': 0,          // Acesso público
};

// ====================================================================
// REDIRECIONAMENTOS INTELIGENTES POR TIPO DE USUÁRIO
// ====================================================================

const getDefaultDashboard = (userType: UserType): string => {
  switch (userType) {
    case 'super_admin':
      return '/super-admin/dashboard';
    case 'admin':
    case 'manager':
    case 'coordinator':
    case 'user':
      return '/admin/dashboard';
    case 'guest':
      return '/cidadao/dashboard';
    default:
      return '/login';
  }
};

const getLoginPath = (userType?: UserType): string => {
  if (!userType) return '/login';
  
  switch (userType) {
    case 'super_admin':
      return '/super-admin/login';
    case 'guest':
      return '/cidadao/login';
    case 'admin':
    case 'manager':
    case 'coordinator':
    case 'user':
    default:
      return '/admin/login';
  }
};

// ====================================================================
// INTERFACE UNIFICADA CONFORME FASE 2
// ====================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  
  // Controles de acesso
  requireAuth?: boolean;
  allowedUserTypes?: UserType[];
  requiredPermissions?: string[];
  anyPermission?: string[]; // OR logic
  allPermissions?: string[]; // AND logic
  
  // Controles hierárquicos
  minimumRole?: UserType;
  allowedDepartments?: string[];
  allowedTenants?: string[];
  
  // Redirecionamentos
  loginRedirect?: string;
  unauthorizedRedirect?: string;
  
  // Feedback
  showUnauthorizedMessage?: boolean;
  customUnauthorizedMessage?: string;
}

// ====================================================================
// COMPONENTE ÚNICO DE PROTEÇÃO (CONFORME FASE 2)
// ====================================================================

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedUserTypes,
  requiredPermissions = [],
  anyPermission = [],
  allPermissions = [],
  minimumRole,
  allowedDepartments,
  allowedTenants,
  loginRedirect,
  unauthorizedRedirect = '/unauthorized',
  showUnauthorizedMessage = true,
  customUnauthorizedMessage,
}) => {
  const { profile: user, isAuthenticated, hasPermission, isLoading: loading } = useAuth();
  const hasAnyPermission = (permissions: string[]) => permissions.some(p => hasPermission(p));
  const location = useLocation();

  // Timeout de segurança para evitar loops infinitos
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ [ProtectedRoute] Timeout de loading atingido, forçando redirect');
        setLoadingTimeout(true);
      }
    }, 15000); // 15 segundos

    return () => clearTimeout(timer);
  }, [loading]);

  // Loading state com timeout de segurança
  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se houve timeout, redirecionar para login
  if (loadingTimeout && requireAuth) {
    const redirectPath = loginRedirect || getLoginPath(user?.role);
    return <Navigate to={`${redirectPath}?timeout=true&from=${location.pathname}`} replace />;
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    const redirectPath = loginRedirect || getLoginPath(user?.role);
    return <Navigate to={`${redirectPath}?from=${location.pathname}`} replace />;
  }

  // If user is authenticated, perform authorization checks
  if (user) {
    console.log(`🛡️ [ProtectedRoute] Verificando autorização para usuário:`, {
      role: user.role,
      allowedUserTypes,
      minimumRole,
      requiredPermissions,
      anyPermission,
      allPermissions,
      path: location.pathname
    });

    let hasAccess = true;
    let denialReason = '';

    // Bypass hierárquico inteligente baseado em nível
    const userLevel = USER_HIERARCHY[user.role] || 0;
    console.log(`🛡️ [ProtectedRoute] Nível hierárquico do usuário: ${userLevel}`);
    
    // Super Admin tem acesso total ao sistema
    if (user.role === 'super_admin') {
      console.log(`✅ [ProtectedRoute] Acesso liberado: super_admin`);
      return <>{children}</>;
    }

    // Check user type restrictions
    if (allowedUserTypes && allowedUserTypes.length > 0) {
      if (!allowedUserTypes.includes(user.role)) {
        hasAccess = false;
        denialReason = `Acesso restrito. Tipo de usuário '${user.role}' não autorizado.`;
        console.log(`❌ [ProtectedRoute] Falha na verificação de tipo de usuário:`, {
          userRole: user.role,
          allowedTypes: allowedUserTypes
        });
      } else {
        console.log(`✅ [ProtectedRoute] Tipo de usuário autorizado: ${user.role}`);
      }
    }

    // Check minimum role hierarchy
    if (minimumRole && hasAccess) {
      const userLevel = USER_HIERARCHY[user.role] || 0;
      const requiredLevel = USER_HIERARCHY[minimumRole] || 0;
      
      if (userLevel < requiredLevel) {
        hasAccess = false;
        denialReason = `Acesso negado. Nível de permissão insuficiente.`;
      }
    }

    // Check specific permissions (AND logic)
    if (allPermissions.length > 0 && hasAccess) {
      const hasAllPermissions = allPermissions.every(permission => hasPermission(permission));
      if (!hasAllPermissions) {
        hasAccess = false;
        denialReason = `Permissões insuficientes. Requeridas: ${allPermissions.join(', ')}`;
      }
    }

    // Check any permissions (OR logic)
    if (anyPermission.length > 0 && hasAccess) {
      const hasAnyPerm = hasAnyPermission(anyPermission);
      if (!hasAnyPerm) {
        hasAccess = false;
        denialReason = `Permissão necessária. Uma das seguintes: ${anyPermission.join(', ')}`;
      }
    }

    // Check required permissions (legacy support)
    if (requiredPermissions.length > 0 && hasAccess) {
      const hasAllRequired = requiredPermissions.every(permission => hasPermission(permission));
      if (!hasAllRequired) {
        hasAccess = false;
        denialReason = `Permissões obrigatórias ausentes: ${requiredPermissions.join(', ')}`;
      }
    }

    // Check department restrictions
    if (allowedDepartments && allowedDepartments.length > 0 && hasAccess) {
      if (!user.tenant_id || !allowedDepartments.includes(user.tenant_id)) {
        hasAccess = false;
        denialReason = `Acesso restrito ao departamento.`;
      }
    }

    // Check tenant restrictions
    if (allowedTenants && allowedTenants.length > 0 && hasAccess) {
      if (!user.tenant_id || !allowedTenants.includes(user.tenant_id)) {
        hasAccess = false;
        denialReason = `Acesso restrito ao tenant.`;
      }
    }

    // Handle access denial
    if (!hasAccess) {
      console.log(`❌ [ProtectedRoute] ACESSO NEGADO:`, { denialReason, path: location.pathname });
      if (showUnauthorizedMessage) {
        const message = customUnauthorizedMessage || denialReason;
        toast.error(message);
      }
      
      return <Navigate to={unauthorizedRedirect} replace />;
    }

    console.log(`✅ [ProtectedRoute] ACESSO LIBERADO para ${location.pathname}`);
  }

  // All checks passed, render children
  console.log(`✅ [ProtectedRoute] Renderizando children para ${location.pathname}`);
  return <>{children}</>;
};

// ====================================================================
// COMPONENTES DE CONVENIÊNCIA (WRAPPERS DO COMPONENTE PRINCIPAL)
// ====================================================================

// Super Admin Route
export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedUserTypes={['super_admin']} loginRedirect="/super-admin/login">
    {children}
  </ProtectedRoute>
);

// Admin/Staff Route - Qualquer funcionário municipal
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🛡️ [AdminRoute] Componente renderizado');
  return (
    <ProtectedRoute 
      allowedUserTypes={['admin', 'manager', 'coordinator', 'user']} 
      loginRedirect="/admin/login"
    >
      {children}
    </ProtectedRoute>
  );
};

// Citizen Route
export const CitizenRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedUserTypes={['guest']} loginRedirect="/cidadao/login">
    {children}
  </ProtectedRoute>
);

// Management Route - Manager e acima (Gestão de secretarias)
export const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute minimumRole="manager">
    {children}
  </ProtectedRoute>
);

// Admin Only Route - Apenas administração municipal
export const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedUserTypes={['admin', 'super_admin']}>
    {children}
  </ProtectedRoute>
);

// Coordinator Route - Coordenação e acima
export const CoordinatorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute minimumRole="coordinator">
    {children}
  </ProtectedRoute>
);

// Department Manager Route - Gestão de secretaria específica
export const DepartmentManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedUserTypes={['manager', 'admin', 'super_admin']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;