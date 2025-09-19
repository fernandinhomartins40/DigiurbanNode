// ====================================================================
// 🔒 TENANT EMAIL MIDDLEWARE - ISOLAMENTO DE DADOS POR TENANT
// ====================================================================
// Middleware para garantir que cada tenant só acesse seus próprios
// dados de email, domínios e configurações SMTP
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

declare global {
  namespace Express {
    interface Request {
      tenantFilter?: {
        tenantId?: string;
      };
      isSuperAdmin?: boolean;
    }
  }
}

/**
 * Middleware para isolamento de dados de email por tenant
 *
 * Funcionalidade:
 * - Super admins podem acessar todos os dados (sem filtro)
 * - Admins de tenant só acessam dados do seu tenant
 * - Usuários comuns só acessam dados do seu tenant
 * - Adiciona filtro automático nas queries
 */
export const tenantEmailMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = req.user;

    if (!user) {
      logger.warn('🚫 TenantEmailMiddleware: Usuário não autenticado');
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
      return;
    }

    // Super admins podem acessar tudo
    if (user.role === 'super_admin') {
      req.isSuperAdmin = true;
      req.tenantFilter = undefined; // Sem filtro - acesso global
      logger.debug('🔓 TenantEmailMiddleware: Super admin - acesso global concedido');
      next();
      return;
    }

    // Verificar se o usuário tem tenant_id
    if (!user.tenant_id) {
      logger.error('❌ TenantEmailMiddleware: Usuário sem tenant_id', { userId: user.id });
      res.status(403).json({
        success: false,
        error: 'Usuário não possui tenant associado'
      });
      return;
    }

    // Definir filtro para o tenant do usuário
    req.isSuperAdmin = false;
    req.tenantFilter = {
      tenantId: user.tenant_id
    };

    logger.debug('🔒 TenantEmailMiddleware: Filtro aplicado', {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role
    });

    next();

  } catch (error) {
    logger.error('❌ Erro no TenantEmailMiddleware:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware específico para operações que requerem permissão de admin do tenant
 */
export const requireTenantAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Usuário não autenticado'
    });
    return;
  }

  // Super admins sempre podem
  if (user.role === 'super_admin') {
    next();
    return;
  }

  // Admin do tenant pode
  if (user.role === 'admin' || user.role === 'tenant_admin') {
    next();
    return;
  }

  logger.warn('🚫 RequireTenantAdmin: Acesso negado', {
    userId: user.id,
    role: user.role,
    tenantId: user.tenant_id
  });

  res.status(403).json({
    success: false,
    error: 'Apenas administradores do tenant podem realizar esta operação'
  });
};

/**
 * Middleware para validar que o tenant_id no body/params pertence ao usuário
 */
export const validateTenantAccess = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Usuário não autenticado'
    });
    return;
  }

  // Super admins podem acessar qualquer tenant
  if (user.role === 'super_admin') {
    next();
    return;
  }

  // Verificar tenant_id no body ou params
  const requestedTenantId = req.body.tenantId || req.params.tenantId || req.query.tenant_id;

  if (requestedTenantId && requestedTenantId !== user.tenant_id) {
    logger.warn('🚫 ValidateTenantAccess: Tentativa de acesso a tenant não autorizado', {
      userId: user.id,
      userTenantId: user.tenant_id,
      requestedTenantId: requestedTenantId
    });

    res.status(403).json({
      success: false,
      error: 'Acesso negado ao tenant solicitado'
    });
    return;
  }

  next();
};

/**
 * Helper para aplicar filtro de tenant em queries do Prisma
 */
export const applyTenantFilter = (req: Request, baseWhere: any = {}) => {
  if (req.isSuperAdmin) {
    // Super admin - sem filtro
    return baseWhere;
  }

  if (req.tenantFilter?.tenantId) {
    // Filtro por tenant
    return {
      ...baseWhere,
      tenantId: req.tenantFilter.tenantId
    };
  }

  // Fallback - sem resultados se não houver filtro definido
  return {
    ...baseWhere,
    tenantId: 'no-access'
  };
};

/**
 * Middleware para rate limiting específico por tenant
 */
export const tenantRateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
      return;
    }

    // Super admins têm rate limit mais alto
    if (user.role === 'super_admin') {
      next();
      return;
    }

    const tenantKey = `tenant:${user.tenant_id}`;
    const now = Date.now();
    const current = requestCounts.get(tenantKey);

    if (!current || now > current.resetTime) {
      // Primeira requisição ou janela expirou
      requestCounts.set(tenantKey, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }

    if (current.count >= maxRequests) {
      logger.warn('🚫 TenantRateLimit: Limite excedido', {
        tenantId: user.tenant_id,
        currentCount: current.count,
        maxRequests: maxRequests
      });

      res.status(429).json({
        success: false,
        error: 'Limite de requisições excedido para este tenant',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      });
      return;
    }

    // Incrementar contador
    current.count++;
    next();
  };
};

export default {
  tenantEmailMiddleware,
  requireTenantAdmin,
  validateTenantAccess,
  applyTenantFilter,
  tenantRateLimit
};