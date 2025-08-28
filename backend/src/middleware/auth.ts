// ====================================================================
// 🛡️ AUTH MIDDLEWARE - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Middleware de autenticação e autorização com JWT
// Proteção de rotas e verificação de permissões
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { JWTUtils, JWTPayload } from '../utils/jwt.js';
import { UserModel, User, UserRole } from '../models/User.js';
import { SessionModel } from '../models/Session.js';
import { PermissionModel } from '../models/Permission.js';
import { CookieManager } from '../utils/cookieManager.js';
import { ERROR_MESSAGES } from '../config/auth.js';

// ====================================================================
// EXTENSÃO DOS TIPOS EXPRESS
// ====================================================================

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userRole?: UserRole;
      tenantId?: string;
      sessionId?: string;
      tokenPayload?: JWTPayload;
    }
  }
}

// ====================================================================
// MIDDLEWARE DE AUTENTICAÇÃO JWT
// ====================================================================

/**
 * Middleware principal de autenticação JWT
 */
export const authenticateJWT = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extrair token dos cookies (prioridade) ou header Authorization
    const token = CookieManager.extractToken(req);
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        error: ERROR_MESSAGES.TOKEN_MISSING 
      });
      return;
    }
    
    // 2. Verificar token
    const tokenVerification = JWTUtils.verifyAccessToken(token);
    
    if (!tokenVerification.valid) {
      const statusCode = tokenVerification.expired ? 401 : 401;
      const errorMessage = tokenVerification.expired 
        ? ERROR_MESSAGES.TOKEN_EXPIRED 
        : ERROR_MESSAGES.TOKEN_INVALID;
        
      res.status(statusCode).json({ 
        success: false,
        error: errorMessage,
        expired: tokenVerification.expired
      });
      return;
    }
    
    const payload = tokenVerification.payload;
    
    // 3. Buscar usuário no banco
    const user = await UserModel.findById(payload.userId);
    
    if (!user) {
      res.status(401).json({ 
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND 
      });
      return;
    }
    
    // 4. Verificar se usuário está ativo
    if (user.status !== 'ativo') {
      res.status(401).json({ 
        success: false,
        error: ERROR_MESSAGES.USER_INACTIVE 
      });
      return;
    }
    
    // 5. Verificar sessão se sessionId estiver presente
    if (payload.sessionId) {
      const sessionValid = await SessionModel.validateSession(token);
      
      if (!sessionValid.valid) {
        res.status(401).json({ 
          success: false,
          error: 'Sessão inválida ou expirada'
        });
        return;
      }
    }
    
    // 6. Anexar informações ao request
    req.user = user;
    req.userRole = user.role;
    req.tenantId = user.tenant_id || undefined;
    req.sessionId = payload.sessionId;
    req.tokenPayload = payload;
    
    next();
    
  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    res.status(500).json({ 
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR 
    });
  }
};

// ====================================================================
// MIDDLEWARE DE AUTENTICAÇÃO OPCIONAL
// ====================================================================

/**
 * Middleware que permite tanto usuários autenticados quanto anônimos
 */
export const optionalAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    // Continuar sem autenticação
    next();
    return;
  }
  
  // Tentar autenticar, mas não falhar se der erro
  try {
    await authenticateJWT(req, res, () => {});
  } catch (error) {
    // Ignorar erros de autenticação e continuar
    console.warn('⚠️ Autenticação opcional falhou:', error);
  }
  
  next();
};

// ====================================================================
// MIDDLEWARE DE AUTORIZAÇÃO POR ROLE
// ====================================================================

/**
 * Verificar se usuário tem role mínima necessária
 */
export const requireRole = (minimumRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        error: ERROR_MESSAGES.TOKEN_MISSING 
      });
      return;
    }
    
    const userLevel = UserModel.USER_HIERARCHY[req.user.role] || 0;
    const requiredLevel = UserModel.USER_HIERARCHY[minimumRole] || 0;
    
    if (userLevel < requiredLevel) {
      res.status(403).json({ 
        success: false,
        error: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
        required: minimumRole,
        current: req.user.role
      });
      return;
    }
    
    next();
  };
};

/**
 * Verificar se usuário tem uma das roles especificadas
 */
export const requireAnyRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        error: ERROR_MESSAGES.TOKEN_MISSING 
      });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false,
        error: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
        required: allowedRoles,
        current: req.user.role
      });
      return;
    }
    
    next();
  };
};

// ====================================================================
// MIDDLEWARE DE PERMISSÕES ESPECÍFICAS
// ====================================================================

/**
 * Verificar se usuário tem permissão específica
 */
export const requirePermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        error: ERROR_MESSAGES.TOKEN_MISSING 
      });
      return;
    }
    
    try {
      const hasPermission = await PermissionModel.hasPermission(req.user.id, permissionCode);
      
      if (!hasPermission) {
        res.status(403).json({ 
          success: false,
          error: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
          required: permissionCode
        });
        return;
      }
      
      next();
      
    } catch (error) {
      console.error('❌ Erro ao verificar permissão:', error);
      res.status(500).json({ 
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR 
      });
    }
  };
};

/**
 * Verificar se usuário tem qualquer uma das permissões
 */
export const requireAnyPermission = (permissionCodes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        error: ERROR_MESSAGES.TOKEN_MISSING 
      });
      return;
    }
    
    try {
      let hasAnyPermission = false;
      
      for (const permissionCode of permissionCodes) {
        if (await PermissionModel.hasPermission(req.user.id, permissionCode)) {
          hasAnyPermission = true;
          break;
        }
      }
      
      if (!hasAnyPermission) {
        res.status(403).json({ 
          success: false,
          error: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
          required: permissionCodes
        });
        return;
      }
      
      next();
      
    } catch (error) {
      console.error('❌ Erro ao verificar permissões:', error);
      res.status(500).json({ 
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR 
      });
    }
  };
};

// ====================================================================
// MIDDLEWARE DE TENANT
// ====================================================================

/**
 * Verificar se usuário pertence ao tenant da requisição
 */
export const requireTenantAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false,
      error: ERROR_MESSAGES.TOKEN_MISSING 
    });
    return;
  }
  
  // Super admin tem acesso a todos os tenants
  if (req.user.role === 'super_admin') {
    next();
    return;
  }
  
  const requestedTenantId = req.params.tenantId || req.body.tenant_id || req.query.tenant_id;
  
  if (requestedTenantId && req.user.tenant_id !== requestedTenantId) {
    res.status(403).json({ 
      success: false,
      error: ERROR_MESSAGES.ACCESS_DENIED,
      message: 'Acesso negado a este tenant'
    });
    return;
  }
  
  next();
};

/**
 * Verificar se usuário pode acessar próprios dados apenas
 */
export const requireSelfAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false,
      error: ERROR_MESSAGES.TOKEN_MISSING 
    });
    return;
  }
  
  // Admins podem acessar dados de outros usuários do mesmo tenant
  if (['admin', 'super_admin'].includes(req.user.role)) {
    next();
    return;
  }
  
  const requestedUserId = req.params.userId || req.params.id;
  
  if (requestedUserId && req.user.id !== requestedUserId) {
    res.status(403).json({ 
      success: false,
      error: ERROR_MESSAGES.ACCESS_DENIED,
      message: 'Você só pode acessar seus próprios dados'
    });
    return;
  }
  
  next();
};

// ====================================================================
// EXPORTAÇÕES DE CONVENIÊNCIA
// ====================================================================

export const requireAdmin = requireRole('admin');
export const requireManager = requireRole('manager');
export const requireCoordinator = requireRole('coordinator');
export const requireSuperAdmin = requireRole('super_admin');

export const requireStaff = requireAnyRole(['user', 'coordinator', 'manager', 'admin', 'super_admin']);
export const requireManagement = requireAnyRole(['manager', 'admin', 'super_admin']);

// ====================================================================
// COMPATIBILIDADE COM SISTEMA ANTERIOR
// ====================================================================

/**
 * @deprecated Use authenticateJWT instead
 */
export const authenticateToken = authenticateJWT;
export const authMiddleware = authenticateJWT;

export default {
  authenticateJWT,
  optionalAuth,
  requireRole,
  requireAnyRole,
  requirePermission,
  requireAnyPermission,
  requireTenantAccess,
  requireSelfAccess,
  // Conveniência
  requireAdmin,
  requireManager,
  requireCoordinator,
  requireSuperAdmin,
  requireStaff,
  requireManagement,
  // Compatibilidade
  authenticateToken
};