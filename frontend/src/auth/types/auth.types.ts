// ====================================================================
// 🎯 TIPOS CENTRALIZADOS - SISTEMA AUTH2
// ====================================================================
// Tipos simples e centralizados para o novo sistema de autenticação
// Redução de 70% de complexidade vs sistema atual
// ====================================================================

import { User as SupabaseUser } from '@supabase/supabase-js';

// ====================================================================
// TIPOS BÁSICOS
// ====================================================================

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'coordinator' | 'user' | 'guest';

export interface AuthUser extends SupabaseUser {
  // Campos essenciais apenas
  role: UserRole;
  tenant_id: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenant_id: string | null;
  tenant_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  plan_type: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Permission {
  code: string;
  resource: string;
  action: string;
}

// ====================================================================
// ESTADO DE AUTENTICAÇÃO
// ====================================================================

export interface AuthState {
  // Estado básico
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Dados do usuário
  profile: UserProfile | null;
  permissions: Permission[];
  tenant: TenantInfo | null;
  
  // Error handling
  error: string | null;
}

// ====================================================================
// CREDENCIAIS E FORMULÁRIOS
// ====================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  tenant_id?: string;
}

// ====================================================================
// CONTEXTO E HOOKS
// ====================================================================

export interface AuthContextType extends AuthState {
  // Métodos principais
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Verificações de permissão
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  
  // Verificações de tenant
  canAccessTenant: (tenantId: string) => boolean;
  
  // Verificações hierárquicas
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isCoordinator: () => boolean;
  isUser: () => boolean;
  hasMinimumLevel: (minimumLevel: number) => boolean;
}

// ====================================================================
// CACHE E PERFORMANCE
// ====================================================================

export interface CacheEntry<T> {
  data: T;
  expires: number;
}

export interface AuthLogger {
  login: (userId: string, duration: number) => void;
  logout: (userId: string) => void;
  error: (error: string, context: object) => void;
  performance: (action: string, duration: number) => void;
}

// ====================================================================
// CONFIGURAÇÃO
// ====================================================================

export interface AuthConfig {
  // Performance
  cacheTimeout: number;
  maxRetries: number;
  
  // Segurança
  passwordMinLength: number;
  sessionTimeout: number;
  
  // Comportamento
  autoRefresh: boolean;
  persistSession: boolean;
}

// ====================================================================
// RESPONSES E ERRORS
// ====================================================================

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

// ====================================================================
// UTILITÁRIOS
// ====================================================================

export const USER_ROLES: Record<UserRole, { name: string; level: number; description: string }> = {
  guest: { 
    name: 'Visitante', 
    level: 0, 
    description: 'Cidadão com acesso público aos serviços municipais' 
  },
  user: { 
    name: 'Funcionário', 
    level: 1, 
    description: 'Atendente/Funcionário com operações básicas' 
  },
  coordinator: { 
    name: 'Coordenador', 
    level: 2, 
    description: 'Coordenador de equipes e supervisor de operações' 
  },
  manager: { 
    name: 'Gestor de Secretaria', 
    level: 3, 
    description: 'Secretário/Diretor com gestão completa da secretaria' 
  },
  admin: { 
    name: 'Administrador Municipal', 
    level: 4, 
    description: 'Prefeito/Vice-Prefeito com gestão municipal completa' 
  },
  super_admin: { 
    name: 'Super Administrador', 
    level: 5, 
    description: 'Desenvolvedor/Suporte com acesso sistêmico total' 
  }
};

export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: [
    { code: 'read_public', resource: 'public', action: 'read' },
    { code: 'create_protocol', resource: 'protocols', action: 'create' },
    { code: 'read_own_protocols', resource: 'protocols', action: 'read' }
  ],
  user: [
    { code: 'read_own', resource: 'user_data', action: 'read' },
    { code: 'update_own', resource: 'user_data', action: 'update' },
    { code: 'create_protocol', resource: 'protocols', action: 'create' },
    { code: 'manage_protocols', resource: 'protocols', action: 'manage' },
    { code: 'read_department_data', resource: 'department', action: 'read' }
  ],
  coordinator: [
    { code: 'read_own', resource: 'user_data', action: 'read' },
    { code: 'update_own', resource: 'user_data', action: 'update' },
    { code: 'manage_protocols', resource: 'protocols', action: 'manage' },
    { code: 'read_department_data', resource: 'department', action: 'read' },
    { code: 'manage_team', resource: 'team', action: 'manage' },
    { code: 'view_reports', resource: 'reports', action: 'read' }
  ],
  manager: [
    { code: 'read_own', resource: 'user_data', action: 'read' },
    { code: 'update_own', resource: 'user_data', action: 'update' },
    { code: 'manage_protocols', resource: 'protocols', action: 'manage' },
    { code: 'manage_department', resource: 'department', action: 'manage' },
    { code: 'manage_team', resource: 'team', action: 'manage' },
    { code: 'manage_reports', resource: 'reports', action: 'manage' },
    { code: 'manage_department_users', resource: 'department_users', action: 'manage' }
  ],
  admin: [
    { code: 'manage_tenant', resource: 'tenant', action: 'manage' },
    { code: 'manage_users', resource: 'users', action: 'manage' },
    { code: 'manage_all_departments', resource: 'departments', action: 'manage' },
    { code: 'manage_municipal_config', resource: 'municipal_config', action: 'manage' },
    { code: 'view_all_reports', resource: 'reports', action: 'read' },
    { code: 'manage_system_config', resource: 'system_config', action: 'manage' }
  ],
  super_admin: [
    { code: 'all', resource: 'system', action: 'all' },
    { code: 'manage_tenants', resource: 'tenants', action: 'manage' },
    { code: 'system_diagnostics', resource: 'diagnostics', action: 'manage' },
    { code: 'database_access', resource: 'database', action: 'manage' }
  ]
};