// ====================================================================
// 🔧 TIPOS DE BANCO DE DADOS - DIGIURBAN SYSTEM
// ====================================================================
// Definições de tipos para better-sqlite3 e interfaces do sistema
// ====================================================================

import { Database } from 'better-sqlite3';

// Tipos base do better-sqlite3
export interface DatabaseRunResult {
  changes: number;
  lastInsertRowid: number;
}

// Compatibility shim para sqlite3 -> better-sqlite3
export interface RunResult extends DatabaseRunResult {
  lastID: number; // Alias para lastInsertRowid para compatibilidade
}

// Tipos para User
export type UserStatus = 'ativo' | 'inativo' | 'pendente' | 'suspenso' | 'sem_vinculo';
export type UserRole = 'admin' | 'super_admin' | 'user' | 'gestor' | 'analista' | 'auditor';

// Tipos para Tenant
export type TenantStatus = 'ativo' | 'inativo' | 'suspenso';

// Tipos para Activity
export interface CreateActivityData {
  user_id: string;
  action: string;
  resource: string;
  details?: string;
  tenant_id?: string;
}

// Tipos para User operations
export interface UserListOptions {
  tenant_id?: string;
  role?: UserRole | string;
  status?: UserStatus | string;
  limit?: number;
  offset?: number;
  page?: number;
}

export interface CreateUserData {
  nome: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  tenant_id: string;
}

export interface UpdateUserData {
  nome?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  tenant_id?: string;
}

// Tipos para Tenant operations
export interface CreateTenantData {
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  status: TenantStatus;
}

export interface UpdateTenantData {
  nome?: string;
  cnpj?: string;
  cidade?: string;
  estado?: string;
  status?: TenantStatus;
}

// Tipos para Registration
export interface ActivateAccountRequest {
  token: string;
}

export interface ActivateAccountResponse {
  success: boolean;
  message: string;
  user?: any;
}

// Helper type para resultados com RunResult compatível
export const createRunResult = (result: DatabaseRunResult): RunResult => ({
  ...result,
  lastID: result.lastInsertRowid
});

// Database instance type
export type DatabaseInstance = Database;