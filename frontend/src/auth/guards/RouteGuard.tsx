// ====================================================================
// 🛣️ ROUTE GUARD - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Sistema completo de proteção de rotas com redirecionamento inteligente
// Integração com React Router e sistema de permissões
// ====================================================================

import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRedirectPath, canAccessRoute, getLoginPortal } from '../utils/roleRedirects';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserRole } from '../types/auth.types';

// ====================================================================
// INTERFACES
// ====================================================================

interface RouteGuardProps {
  /** Conteúdo protegido */
  children: ReactNode;
  /** Roles que podem acessar esta rota */
  allowedRoles?: UserRole[];
  /** Role mínimo requerido */
  minimumRole?: UserRole;
  /** Nível hierárquico mínimo */
  minimumLevel?: number;
  /** Redirecionar para esta rota se não autorizado */
  redirectTo?: string;
  /** Permitir acesso apenas a usuários autenticados */
  requireAuth?: boolean;
  /** Permitir acesso apenas a usuários não autenticados (ex: login) */
  requireGuest?: boolean;
  /** Mostrar loading durante verificação */
  showLoading?: boolean;
  /** Componente customizado para loading */
  loadingComponent?: ReactNode;
  /** Página de erro customizada */
  unauthorizedComponent?: ReactNode;
}

// Mapa de níveis hierárquicos
const ROLE_LEVELS: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  coordinator: 2,
  manager: 3,
  admin: 4,
  super_admin: 5
};

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  allowedRoles,
  minimumRole,
  minimumLevel,
  redirectTo,
  requireAuth = true,
  requireGuest = false,
  showLoading = true,
  loadingComponent,
  unauthorizedComponent
}) => {
  const { profile, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Loading state
  if (isLoading && showLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return <DefaultLoadingComponent />;
  }

  // ====================================================================
  // VERIFICAÇÕES DE ACESSO
  // ====================================================================

  // Rota requer usuário não autenticado (ex: páginas de login)
  if (requireGuest && isAuthenticated) {
    const redirectPath = profile ? getRedirectPath(profile.role) : '/';
    console.log(`🔄 [ROUTE-GUARD] Usuário autenticado tentando acessar rota guest, redirecionando para: ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // Rota requer autenticação
  if (requireAuth && !isAuthenticated) {
    const loginPath = getLoginPortal(profile?.role || 'guest');
    const redirectUrl = `${loginPath}?from=${encodeURIComponent(location.pathname + location.search)}`;
    console.log(`🔄 [ROUTE-GUARD] Usuário não autenticado, redirecionando para: ${redirectUrl}`);
    return <Navigate to={redirectUrl} replace />;
  }

  // Se autenticado, verificar permissões
  if (isAuthenticated && profile) {
    const hasAccess = checkRouteAccess(profile.role, {
      allowedRoles,
      minimumRole,
      minimumLevel,
      currentPath: location.pathname
    });

    if (!hasAccess) {
      // Redirecionamento customizado
      if (redirectTo) {
        console.log(`🚫 [ROUTE-GUARD] Acesso negado, redirecionando para: ${redirectTo}`);
        return <Navigate to={redirectTo} replace />;
      }

      // Componente de erro customizado
      if (unauthorizedComponent) {
        return <>{unauthorizedComponent}</>;
      }

      // Componente padrão de acesso negado
      return (
        <UnauthorizedComponent 
          userRole={profile.role}
          requiredAccess={{ allowedRoles, minimumRole, minimumLevel }}
        />
      );
    }
  }

  // Acesso autorizado - renderizar children
  return <>{children}</>;
};

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

interface RouteAccessRequirements {
  allowedRoles?: UserRole[];
  minimumRole?: UserRole;
  minimumLevel?: number;
  currentPath: string;
}

/**
 * Verificar se o role pode acessar a rota
 */
const checkRouteAccess = (
  userRole: UserRole, 
  requirements: RouteAccessRequirements
): boolean => {
  const { allowedRoles, minimumRole, minimumLevel, currentPath } = requirements;
  
  // Verificar usando sistema de redirects (rotas públicas, etc)
  if (!canAccessRoute(userRole, currentPath)) {
    return false;
  }

  const userLevel = ROLE_LEVELS[userRole];

  // Verificar lista específica de roles
  if (allowedRoles && allowedRoles.length > 0) {
    return allowedRoles.includes(userRole);
  }

  // Verificar role mínimo
  if (minimumRole) {
    const requiredLevel = ROLE_LEVELS[minimumRole];
    return userLevel >= requiredLevel;
  }

  // Verificar nível mínimo
  if (minimumLevel !== undefined) {
    return userLevel >= minimumLevel;
  }

  // Se nenhuma restrição específica, permitir acesso
  return true;
};

// ====================================================================
// COMPONENTES DE FALLBACK
// ====================================================================

const DefaultLoadingComponent: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
};

interface UnauthorizedComponentProps {
  userRole: UserRole;
  requiredAccess: {
    allowedRoles?: UserRole[];
    minimumRole?: UserRole;
    minimumLevel?: number;
  };
}

const UnauthorizedComponent: React.FC<UnauthorizedComponentProps> = ({
  userRole,
  requiredAccess
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    const homePath = getRedirectPath(userRole);
    navigate(homePath, { replace: true });
  };

  const getRoleDisplayName = (role: UserRole): string => {
    const roleNames = {
      guest: 'Visitante',
      user: 'Funcionário',
      coordinator: 'Coordenador',
      manager: 'Gestor',
      admin: 'Administrador',
      super_admin: 'Super Administrador'
    };
    return roleNames[role];
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <Shield className="h-12 w-12 text-destructive" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar esta página.
          </p>

          <div className="bg-muted p-4 rounded-lg mb-6 text-sm">
            <div className="flex justify-between mb-2">
              <span>Seu nível atual:</span>
              <span className="font-medium">{getRoleDisplayName(userRole)}</span>
            </div>
            {requiredAccess.minimumRole && (
              <div className="flex justify-between">
                <span>Nível requerido:</span>
                <span className="font-medium">{getRoleDisplayName(requiredAccess.minimumRole)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1"
            >
              Voltar
            </Button>
            <Button 
              onClick={handleGoHome}
              className="flex-1 flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ====================================================================
// COMPONENTES DE CONVENIÊNCIA
// ====================================================================

/**
 * Guard para rotas administrativas
 */
interface AdminRouteProps {
  children: ReactNode;
  includeManagers?: boolean;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  includeManagers = false 
}) => {
  const allowedRoles: UserRole[] = ['admin', 'super_admin'];
  if (includeManagers) {
    allowedRoles.push('manager');
  }

  return (
    <RouteGuard allowedRoles={allowedRoles}>
      {children}
    </RouteGuard>
  );
};

/**
 * Guard para rotas de super admin
 */
export const SuperAdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <RouteGuard allowedRoles={['super_admin']}>
      {children}
    </RouteGuard>
  );
};

/**
 * Guard para rotas públicas (guests e usuários autenticados)
 */
export const PublicRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <RouteGuard requireAuth={false}>
      {children}
    </RouteGuard>
  );
};

/**
 * Guard para rotas que requerem autenticação básica
 */
export const AuthenticatedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <RouteGuard requireAuth={true}>
      {children}
    </RouteGuard>
  );
};

/**
 * Guard para rotas de login (apenas usuários não autenticados)
 */
export const GuestRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <RouteGuard requireAuth={false} requireGuest={true}>
      {children}
    </RouteGuard>
  );
};

export default RouteGuard;