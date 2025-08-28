// ====================================================================
// 🎯 SISTEMA DE REDIRECIONAMENTO POR ROLE - DIGIURBAN AUTH2
// ====================================================================
// Redirecionamento inteligente baseado no role do usuário
// Suporte a fallbacks e parâmetros de URL
// ====================================================================

import type { UserRole } from '@/auth/types/auth.types';

// Mapa de redirecionamentos por role
const ROLE_REDIRECTS: Record<UserRole, string> = {
  super_admin: '/super-admin/dashboard',
  admin: '/admin/dashboard', 
  manager: '/manager/dashboard',
  coordinator: '/coordinator/dashboard',
  user: '/dashboard',
  guest: '/cidadao/servicos'
};

// Portais de login por role
const LOGIN_PORTALS: Record<UserRole, string> = {
  super_admin: '/auth/super-admin/login',
  admin: '/auth/admin/login',
  manager: '/auth/admin/login',
  coordinator: '/auth/admin/login', 
  user: '/auth/admin/login',
  guest: '/auth/cidadao/login'
};

/**
 * Obter caminho de redirecionamento baseado no role
 */
export const getRedirectPath = (userRole: UserRole, fallback: string = '/'): string => {
  const redirectPath = ROLE_REDIRECTS[userRole];
  
  if (!redirectPath) {
    console.warn(`⚠️ [AUTH] Role desconhecido para redirecionamento: ${userRole}`);
    return fallback;
  }

  console.log(`🎯 [AUTH] Redirecionando ${userRole} para: ${redirectPath}`);
  return redirectPath;
};

/**
 * Obter portal de login apropriado para o role
 */
export const getLoginPortal = (userRole: UserRole): string => {
  return LOGIN_PORTALS[userRole] || '/auth/login';
};

/**
 * Verificar se usuário tem permissão para acessar rota
 */
export const canAccessRoute = (userRole: UserRole, routePath: string): boolean => {
  // Rotas públicas sempre acessíveis
  const publicRoutes = ['/auth/', '/cidadao/', '/sobre', '/contato', '/'];
  if (publicRoutes.some(route => routePath.startsWith(route))) {
    return true;
  }

  // Mapa de permissões por prefixo de rota
  const routePermissions: Record<string, UserRole[]> = {
    '/super-admin/': ['super_admin'],
    '/admin/': ['admin', 'super_admin'],
    '/manager/': ['manager', 'admin', 'super_admin'],
    '/coordinator/': ['coordinator', 'manager', 'admin', 'super_admin'],
    '/dashboard': ['user', 'coordinator', 'manager', 'admin', 'super_admin'],
    '/cidadao/': ['guest', 'user', 'coordinator', 'manager', 'admin', 'super_admin']
  };

  // Verificar se o role tem permissão para a rota
  for (const [routePrefix, allowedRoles] of Object.entries(routePermissions)) {
    if (routePath.startsWith(routePrefix)) {
      return allowedRoles.includes(userRole);
    }
  }

  // Por padrão, negar acesso se não encontrar regra específica
  return false;
};

/**
 * Obter lista de rotas acessíveis para o role
 */
export const getAccessibleRoutes = (userRole: UserRole): string[] => {
  const routes: string[] = [];
  
  // Rotas sempre acessíveis
  routes.push('/');
  
  // Rotas específicas por role
  switch (userRole) {
    case 'super_admin':
      routes.push('/super-admin/dashboard', '/super-admin/tenants', '/super-admin/system');
      // fallthrough para incluir rotas de níveis inferiores
    case 'admin':
      routes.push('/admin/dashboard', '/admin/users', '/admin/reports');
      // fallthrough
    case 'manager':
      routes.push('/manager/dashboard', '/manager/department');
      // fallthrough  
    case 'coordinator':
      routes.push('/coordinator/dashboard', '/coordinator/team');
      // fallthrough
    case 'user':
      routes.push('/dashboard', '/protocols');
      // fallthrough
    case 'guest':
      routes.push('/cidadao/servicos', '/cidadao/protocolos');
      break;
  }

  return routes;
};

/**
 * Construir URL com parâmetros de redirecionamento
 */
export const buildRedirectURL = (
  basePath: string, 
  params: Record<string, string> = {}
): string => {
  const url = new URL(basePath, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return url.pathname + url.search;
};

/**
 * Redirecionamento inteligente com preservação de parâmetros
 */
export const smartRedirect = (
  userRole: UserRole, 
  currentPath?: string,
  preserveParams: boolean = true
): string => {
  const targetPath = getRedirectPath(userRole);
  
  // Preservar parâmetros da URL atual se solicitado
  if (preserveParams && currentPath) {
    const currentUrl = new URL(currentPath, window.location.origin);
    const params: Record<string, string> = {};
    
    currentUrl.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    if (Object.keys(params).length > 0) {
      return buildRedirectURL(targetPath, params);
    }
  }
  
  return targetPath;
};

/**
 * Validar se redirecionamento é necessário
 */
export const shouldRedirect = (
  userRole: UserRole, 
  currentPath: string
): boolean => {
  // Não redirecionar se já estiver na rota correta
  const expectedPath = getRedirectPath(userRole);
  if (currentPath.startsWith(expectedPath)) {
    return false;
  }

  // Não redirecionar de rotas de auth
  if (currentPath.startsWith('/auth/')) {
    return false;
  }

  // Redirecionar se não tem permissão para a rota atual
  return !canAccessRoute(userRole, currentPath);
};

export default {
  getRedirectPath,
  getLoginPortal,
  canAccessRoute,
  getAccessibleRoutes,
  buildRedirectURL,
  smartRedirect,
  shouldRedirect
};