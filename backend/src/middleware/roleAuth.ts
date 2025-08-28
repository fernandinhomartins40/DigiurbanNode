// ====================================================================
// 🛡️ MIDDLEWARE DE AUTORIZAÇÃO POR ROLE - DIGIURBAN
// ====================================================================
// Sistema hierárquico de permissões com verificação granular
// Suporte a multi-tenant e logs de auditoria
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { query, queryOne } from '../database/connection.js';
import { User, UserRole as UserRoleType } from '../models/User.js';

// Tipos para o sistema de autorização
export type UserRole = UserRoleType;

interface AuthenticatedRequest extends Request {
  user?: User & { userId: string };
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

/**
 * Middleware para verificar se usuário tem role específico
 */
export const requireRole = (requiredRole: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const userLevel = ROLE_LEVELS[req.user.role];
      const requiredLevel = ROLE_LEVELS[requiredRole];

      if (userLevel < requiredLevel) {
        console.log(`🚫 [AUTH] Acesso negado: ${req.user.email} (${req.user.role}) tentou acessar recurso que requer ${requiredRole}`);
        return res.status(403).json({
          success: false,
          error: 'Permissão insuficiente para acessar este recurso'
        });
      }

      console.log(`✅ [AUTH] Acesso autorizado: ${req.user.email} (${req.user.role}) para recurso ${requiredRole}`);
      next();
    } catch (error) {
      console.error('❌ [AUTH] Erro na verificação de role:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno na verificação de permissões'
      });
    }
  };
};

/**
 * Middleware para verificar nível mínimo hierárquico
 */
export const requireMinimumLevel = (minimumLevel: number) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const userLevel = ROLE_LEVELS[req.user.role];

      if (userLevel < minimumLevel) {
        return res.status(403).json({
          success: false,
          error: `Acesso negado. Nível mínimo requerido: ${minimumLevel}, seu nível: ${userLevel}`
        });
      }

      next();
    } catch (error) {
      console.error('❌ [AUTH] Erro na verificação de nível:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno na verificação de permissões'
      });
    }
  };
};

/**
 * Middleware para verificar acesso a tenant específico
 */
export const requireTenantAccess = (tenantIdParam: string = 'tenantId') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      // Super admins têm acesso a todos os tenants
      if (req.user.role === 'super_admin') {
        return next();
      }

      const requestedTenantId = req.params[tenantIdParam] || req.body.tenant_id || req.query.tenant_id;

      if (!requestedTenantId) {
        return res.status(400).json({
          success: false,
          error: 'ID do tenant não fornecido'
        });
      }

      // Verificar se usuário pertence ao tenant ou tem permissão
      if (req.user.tenant_id !== requestedTenantId) {
        console.log(`🚫 [AUTH] Acesso negado ao tenant: ${req.user.email} tentou acessar tenant ${requestedTenantId}`);
        return res.status(403).json({
          success: false,
          error: 'Acesso negado ao tenant solicitado'
        });
      }

      next();
    } catch (error) {
      console.error('❌ [AUTH] Erro na verificação de tenant:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno na verificação de tenant'
      });
    }
  };
};

/**
 * Middleware combinado para role OU nível mínimo
 */
export const requireRoleOrLevel = (role: UserRole, minimumLevel?: number) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const userLevel = ROLE_LEVELS[req.user.role];
      const requiredLevel = ROLE_LEVELS[role];

      // Verificar se tem o role específico OU nível suficiente
      const hasRole = req.user.role === role;
      const hasLevel = minimumLevel ? userLevel >= minimumLevel : userLevel >= requiredLevel;

      if (!hasRole && !hasLevel) {
        return res.status(403).json({
          success: false,
          error: `Acesso negado. Requer role '${role}' ou nível mínimo ${minimumLevel || requiredLevel}`
        });
      }

      next();
    } catch (error) {
      console.error('❌ [AUTH] Erro na verificação combinada:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno na verificação de permissões'
      });
    }
  };
};

/**
 * Utilitário para obter informações sobre roles
 */
export const getRoleInfo = async (role: UserRole) => {
  try {
    const roleInfo = await queryOne(
      'SELECT * FROM role_hierarchy WHERE role = ?',
      [role]
    );
    return roleInfo;
  } catch (error) {
    console.error('❌ [AUTH] Erro ao buscar info do role:', error);
    return null;
  }
};

/**
 * Utilitário para listar todos os roles disponíveis
 */
export const getAllRoles = async () => {
  try {
    const roles = await query(
      'SELECT * FROM role_hierarchy ORDER BY level ASC'
    );
    return roles;
  } catch (error) {
    console.error('❌ [AUTH] Erro ao buscar roles:', error);
    return [];
  }
};

export type { AuthenticatedRequest };