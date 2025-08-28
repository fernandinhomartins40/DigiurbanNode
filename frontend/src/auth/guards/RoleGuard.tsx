// ====================================================================
// 🛡️ ROLE GUARD - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Componente para proteção de rotas baseada em roles
// Sistema hierárquico com fallbacks inteligentes
// ====================================================================

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserRole } from '../types/auth.types';

// ====================================================================
// INTERFACES
// ====================================================================

interface RoleGuardProps {
  /** Role específico requerido */
  requiredRole?: UserRole;
  /** Nível mínimo hierárquico requerido (0-5) */
  requiredLevel?: number;
  /** Lista de roles que têm acesso */
  allowedRoles?: UserRole[];
  /** Conteúdo a ser renderizado se autorizado */
  children: ReactNode;
  /** Componente customizado para acesso negado */
  fallback?: ReactNode;
  /** Redirecionar automaticamente se não autorizado */
  redirectTo?: string;
  /** Mostrar loading enquanto verifica permissões */
  showLoading?: boolean;
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

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  requiredRole, 
  requiredLevel, 
  allowedRoles,
  children, 
  fallback,
  redirectTo,
  showLoading = true
}) => {
  const { profile, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Loading state
  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !profile) {
    const loginPath = `/auth/login?from=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={loginPath} replace />;
  }

  // Check access permissions
  const hasAccess = checkAccess(profile.role, {
    requiredRole,
    requiredLevel,
    allowedRoles
  });

  if (!hasAccess) {
    // Custom redirect
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Custom fallback component
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default access denied component
    return <AccessDeniedFallback userRole={profile.role} requiredAccess={{
      requiredRole,
      requiredLevel,
      allowedRoles
    }} />;
  }

  // Access granted - render children
  return <>{children}</>;
};

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

interface AccessRequirements {
  requiredRole?: UserRole;
  requiredLevel?: number;
  allowedRoles?: UserRole[];
}

/**
 * Verificar se o role tem acesso baseado nos requisitos
 */
const checkAccess = (userRole: UserRole, requirements: AccessRequirements): boolean => {
  const { requiredRole, requiredLevel, allowedRoles } = requirements;
  
  const userLevel = ROLE_LEVELS[userRole];

  // Verificar lista específica de roles permitidos
  if (allowedRoles && allowedRoles.length > 0) {
    return allowedRoles.includes(userRole);
  }

  // Verificar role específico
  if (requiredRole) {
    const requiredRoleLevel = ROLE_LEVELS[requiredRole];
    return userLevel >= requiredRoleLevel;
  }

  // Verificar nível mínimo
  if (requiredLevel !== undefined) {
    return userLevel >= requiredLevel;
  }

  // Se nenhum requisito foi especificado, permitir acesso
  return true;
};

// ====================================================================
// COMPONENTE DE ACESSO NEGADO
// ====================================================================

interface AccessDeniedFallbackProps {
  userRole: UserRole;
  requiredAccess: AccessRequirements;
}

const AccessDeniedFallback: React.FC<AccessDeniedFallbackProps> = ({ 
  userRole, 
  requiredAccess 
}) => {
  const handleGoBack = () => {
    window.history.back();
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

  const getRequiredAccessText = (): string => {
    const { requiredRole, requiredLevel, allowedRoles } = requiredAccess;
    
    if (allowedRoles && allowedRoles.length > 0) {
      const roleNames = allowedRoles.map(getRoleDisplayName).join(', ');
      return `Roles permitidos: ${roleNames}`;
    }
    
    if (requiredRole) {
      return `Role mínimo: ${getRoleDisplayName(requiredRole)}`;
    }
    
    if (requiredLevel !== undefined) {
      return `Nível mínimo: ${requiredLevel}`;
    }
    
    return 'Permissões específicas';
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissão para acessar este recurso.
            </AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Seu role atual:</span>
              <span className="font-medium">{getRoleDisplayName(userRole)}</span>
            </div>
            <div className="flex justify-between">
              <span>Acesso requerido:</span>
              <span className="font-medium">{getRequiredAccessText()}</span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ====================================================================
// HOOKS AUXILIARES
// ====================================================================

/**
 * Hook para verificar permissões sem renderizar componente
 */
export const useRoleCheck = () => {
  const { profile } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    if (!profile) return false;
    return checkAccess(profile.role, { requiredRole: role });
  };

  const hasMinimumLevel = (level: number): boolean => {
    if (!profile) return false;
    return checkAccess(profile.role, { requiredLevel: level });
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!profile) return false;
    return checkAccess(profile.role, { allowedRoles: roles });
  };

  const canAccess = (requirements: AccessRequirements): boolean => {
    if (!profile) return false;
    return checkAccess(profile.role, requirements);
  };

  return {
    hasRole,
    hasMinimumLevel,
    hasAnyRole,
    canAccess,
    userRole: profile?.role,
    userLevel: profile ? ROLE_LEVELS[profile.role] : 0
  };
};

export default RoleGuard;