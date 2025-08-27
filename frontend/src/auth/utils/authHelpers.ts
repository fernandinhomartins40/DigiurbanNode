// ====================================================================
// 🔧 AUTH HELPERS - DIGIURBAN JWT SYSTEM
// ====================================================================
// Utilitários e helpers para sistema de autenticação
// Validadores, formatadores e funções auxiliares
// ====================================================================

import type { UserRole, UserProfile, TenantInfo } from '../types/auth.types';

// ====================================================================
// VALIDADORES
// ====================================================================

/**
 * Validador de email
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email é obrigatório' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email deve ter formato válido' };
  }

  return { isValid: true };
};

/**
 * Validador de senha
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string; strength?: string } => {
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória' };
  }

  const minLength = 6;
  if (password.length < minLength) {
    return { isValid: false, error: `Senha deve ter pelo menos ${minLength} caracteres` };
  }

  // Calcular força da senha
  let strength = 'Fraca';
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score >= 4) strength = 'Forte';
  else if (score >= 3) strength = 'Média';

  return { isValid: true, strength };
};

/**
 * Validador de senha forte para administradores
 */
export const validateStrongPassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória' };
  }

  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('pelo menos 8 caracteres');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('uma letra minúscula');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('uma letra maiúscula');
  }
  if (!/\d/.test(password)) {
    errors.push('um número');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('um símbolo (@$!%*?&)');
  }
  
  if (errors.length > 0) {
    return { isValid: false, error: `Senha deve ter ${errors.join(', ')}` };
  }

  return { isValid: true };
};

/**
 * Validador de nome completo
 */
export const validateFullName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Nome completo é obrigatório' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
  }

  if (name.trim().split(' ').length < 2) {
    return { isValid: false, error: 'Digite o nome completo' };
  }

  return { isValid: true };
};

/**
 * Validador de CPF
 */
export const validateCPF = (cpf: string): { isValid: boolean; error?: string } => {
  if (!cpf.trim()) {
    return { isValid: false, error: 'CPF é obrigatório' };
  }

  // Remove formatação
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) {
    return { isValid: false, error: 'CPF deve ter 11 dígitos' };
  }

  // Verifica se não são todos os mesmos dígitos
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return { isValid: false, error: 'CPF inválido' };
  }

  // Validação do algoritmo do CPF
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return { isValid: false, error: 'CPF inválido' };
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return { isValid: false, error: 'CPF inválido' };
  }

  return { isValid: true };
};

/**
 * Validador de telefone
 */
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone.trim()) {
    return { isValid: true }; // Telefone é opcional
  }

  // Remove formatação
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return { isValid: false, error: 'Telefone deve ter 10 ou 11 dígitos' };
  }

  return { isValid: true };
};

// ====================================================================
// FORMATADORES
// ====================================================================

/**
 * Formatador de CPF
 */
export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return value;
};

/**
 * Formatador de telefone
 */
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    // Celular: (xx) xxxxx-xxxx
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    // Fixo: (xx) xxxx-xxxx
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    // Formatação parcial
    if (numbers.length > 6) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
    }
    if (numbers.length > 2) {
      return numbers.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
  }
  return value;
};

/**
 * Formatador de CNPJ
 */
export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 14) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
};

// ====================================================================
// HIERARQUIA E PERMISSÕES
// ====================================================================

/**
 * Níveis hierárquicos dos usuários
 */
export const USER_HIERARCHY: Record<UserRole, number> = {
  'guest': 0,
  'user': 1,
  'coordinator': 2,
  'manager': 3,
  'admin': 4,
  'super_admin': 5
};

/**
 * Obter nível hierárquico
 */
export const getUserLevel = (role: UserRole): number => {
  return USER_HIERARCHY[role] || 0;
};

/**
 * Verificar se usuário tem nível mínimo
 */
export const hasMinimumLevel = (userRole: UserRole, minimumRole: UserRole): boolean => {
  return getUserLevel(userRole) >= getUserLevel(minimumRole);
};

/**
 * Verificar se pode gerenciar outro usuário
 */
export const canManageUser = (managerRole: UserRole, targetRole: UserRole): boolean => {
  // Super admin pode gerenciar qualquer um
  if (managerRole === 'super_admin') return true;
  
  // Admin pode gerenciar qualquer um do mesmo tenant (exceto super_admin)
  if (managerRole === 'admin' && targetRole !== 'super_admin') return true;
  
  // Manager pode gerenciar coordinator, user, guest
  if (managerRole === 'manager' && getUserLevel(targetRole) <= getUserLevel('coordinator')) return true;
  
  // Coordinator pode gerenciar user, guest
  if (managerRole === 'coordinator' && getUserLevel(targetRole) <= getUserLevel('user')) return true;
  
  return false;
};

// ====================================================================
// UTILITÁRIOS DE PERFIL
// ====================================================================

/**
 * Obter iniciais do nome
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(part => part.length > 0)
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Obter nome de exibição
 */
export const getDisplayName = (profile: UserProfile): string => {
  if (!profile.name) return 'Usuário';
  
  const parts = profile.name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[parts.length - 1]}`;
  }
  
  return parts[0];
};

/**
 * Obter descrição do role
 */
export const getRoleDescription = (role: UserRole): string => {
  const descriptions = {
    'guest': 'Cidadão',
    'user': 'Funcionário',
    'coordinator': 'Coordenador',
    'manager': 'Gestor de Secretaria',
    'admin': 'Administrador Municipal',
    'super_admin': 'Super Administrador'
  };
  
  return descriptions[role] || 'Usuário';
};

/**
 * Obter cor do role
 */
export const getRoleColor = (role: UserRole): string => {
  const colors = {
    'guest': 'bg-gray-100 text-gray-800',
    'user': 'bg-blue-100 text-blue-800',
    'coordinator': 'bg-green-100 text-green-800',
    'manager': 'bg-yellow-100 text-yellow-800',
    'admin': 'bg-purple-100 text-purple-800',
    'super_admin': 'bg-red-100 text-red-800'
  };
  
  return colors[role] || 'bg-gray-100 text-gray-800';
};

// ====================================================================
// UTILITÁRIOS DE SESSÃO
// ====================================================================

/**
 * Obter informações da sessão
 */
export const getSessionInfo = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    isLoggedIn: !!(accessToken && refreshToken)
  };
};

/**
 * Limpar dados de sessão
 */
export const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('auth-cache');
};

/**
 * Verificar se token está próximo do vencimento
 */
export const isTokenNearExpiry = (token: string): boolean => {
  try {
    // Decodificar JWT (parte do payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Converter para milliseconds
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    return (exp - now) <= fiveMinutes;
  } catch {
    return true; // Se não conseguir decodificar, considerar expirado
  }
};

// ====================================================================
// UTILITÁRIOS DE ERRO
// ====================================================================

/**
 * Tratar erros de autenticação
 */
export const handleAuthError = (error: any): string => {
  if (typeof error === 'string') return error;
  
  const message = error?.error?.toLowerCase() || error?.message?.toLowerCase() || '';
  
  if (message.includes('credenciais inválidas') || message.includes('invalid credentials')) {
    return 'Email ou senha incorretos';
  }
  if (message.includes('email já está em uso') || message.includes('email already exists')) {
    return 'Este email já está cadastrado';
  }
  if (message.includes('usuário não encontrado') || message.includes('user not found')) {
    return 'Usuário não encontrado';
  }
  if (message.includes('conta bloqueada') || message.includes('account locked')) {
    return 'Conta temporariamente bloqueada. Tente novamente mais tarde';
  }
  if (message.includes('muitas tentativas') || message.includes('too many attempts')) {
    return 'Muitas tentativas. Tente novamente em alguns minutos';
  }
  if (message.includes('token inválido') || message.includes('invalid token')) {
    return 'Token de ativação inválido ou expirado';
  }
  if (message.includes('sessão expirada') || message.includes('session expired')) {
    return 'Sessão expirada. Faça login novamente';
  }
  
  return error?.error || error?.message || 'Erro desconhecido';
};

// ====================================================================
// EXPORT DEFAULT
// ====================================================================

export default {
  // Validadores
  validateEmail,
  validatePassword,
  validateStrongPassword,
  validateFullName,
  validateCPF,
  validatePhone,
  
  // Formatadores
  formatCPF,
  formatPhone,
  formatCNPJ,
  
  // Hierarquia
  getUserLevel,
  hasMinimumLevel,
  canManageUser,
  
  // Perfil
  getInitials,
  getDisplayName,
  getRoleDescription,
  getRoleColor,
  
  // Sessão
  getSessionInfo,
  clearSession,
  isTokenNearExpiry,
  
  // Erros
  handleAuthError
};