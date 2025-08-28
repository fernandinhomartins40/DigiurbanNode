// ====================================================================
// 🛡️ ROTAS DE PERMISSÕES - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Rotas para gerenciamento de permissões RBAC
// Controle hierárquico e gestão granular de acesso
// ====================================================================

import { Router, Request, Response } from 'express';
import { PermissionService } from '../services/PermissionService.js';
// import { ActivityService } from '../services/ActivityService.js';
import { authMiddleware } from '../middleware/auth.js';
import { generalRateLimit } from '../middleware/rateLimiter.js';
import { body, param, validationResult } from 'express-validator';

const router = Router();

// ====================================================================
// VALIDAÇÕES
// ====================================================================

const grantPermissionValidation = [
  body('userId')
    .isUUID()
    .withMessage('User ID deve ser um UUID válido'),
  body('permissionCode')
    .isLength({ min: 1 })
    .withMessage('Código da permissão é obrigatório')
];

const checkPermissionValidation = [
  body('userId')
    .isUUID()
    .withMessage('User ID deve ser um UUID válido'),
  body('permissionCode')
    .isLength({ min: 1 })
    .withMessage('Código da permissão é obrigatório')
];

// ====================================================================
// ROTAS DE VERIFICAÇÃO DE PERMISSÕES
// ====================================================================

/**
 * POST /permissions/check
 * Verificar se usuário tem permissão específica
 */
router.post('/check',
  authMiddleware,
  generalRateLimit,
  checkPermissionValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
        return;
      }

      const { userId, permissionCode } = req.body;

      // Verificar se o usuário solicitante pode consultar permissões de outros
      const canCheckOthers = await PermissionService.hasPermission(req.user!.id, 'view_permissions');
      
      if (userId !== req.user!.id && !canCheckOthers) {
        res.status(403).json({
          success: false,
          error: 'Sem permissão para verificar permissões de outros usuários'
        });
        return;
      }

      const hasPermission = await PermissionService.hasPermission(userId, permissionCode);

      res.json({
        success: true,
        data: {
          userId,
          permissionCode,
          hasPermission
        }
      });

    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /permissions/check-multiple
 * Verificar múltiplas permissões de uma vez
 */
router.post('/check-multiple',
  authMiddleware,
  generalRateLimit,
  body('userId').isUUID().withMessage('User ID deve ser um UUID válido'),
  body('permissionCodes').isArray().withMessage('Códigos de permissão devem ser um array'),
  body('permissionCodes.*').isString().withMessage('Cada código deve ser uma string'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
        return;
      }

      const { userId, permissionCodes } = req.body;

      // Verificar se pode consultar permissões de outros
      const canCheckOthers = await PermissionService.hasPermission(req.user!.id, 'view_permissions');
      
      if (userId !== req.user!.id && !canCheckOthers) {
        res.status(403).json({
          success: false,
          error: 'Sem permissão para verificar permissões de outros usuários'
        });
        return;
      }

      const results: Record<string, boolean> = {};
      
      for (const permissionCode of permissionCodes) {
        results[permissionCode] = await PermissionService.hasPermission(userId, permissionCode);
      }

      res.json({
        success: true,
        data: {
          userId,
          permissions: results
        }
      });

    } catch (error) {
      console.error('Erro ao verificar múltiplas permissões:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /permissions/check-resource
 * Verificar permissão para recurso e ação específicos
 */
router.post('/check-resource',
  authMiddleware,
  generalRateLimit,
  body('userId').isUUID().withMessage('User ID deve ser um UUID válido'),
  body('resource').isString().withMessage('Resource é obrigatório'),
  body('action').isString().withMessage('Action é obrigatório'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
        return;
      }

      const { userId, resource, action, tenantId } = req.body;

      // Verificar se pode consultar permissões de outros
      const canCheckOthers = await PermissionService.hasPermission(req.user!.id, 'view_permissions');
      
      if (userId !== req.user!.id && !canCheckOthers) {
        res.status(403).json({
          success: false,
          error: 'Sem permissão para verificar permissões de outros usuários'
        });
        return;
      }

      const canAccess = await PermissionService.canAccessResource(userId, resource, action, tenantId);

      res.json({
        success: true,
        data: {
          userId,
          resource,
          action,
          canAccess
        }
      });

    } catch (error) {
      console.error('Erro ao verificar permissão de recurso:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS DE GESTÃO DE PERMISSÕES (ADMIN ONLY)
// ====================================================================

/**
 * POST /permissions/grant
 * Conceder permissão a usuário
 */
router.post('/grant',
  authMiddleware,
  generalRateLimit,
  grantPermissionValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
        return;
      }

      const { userId, permissionCode } = req.body;
      const granterId = req.user!.id;

      const result = await PermissionService.grantPermission(userId, permissionCode, granterId);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erro ao conceder permissão:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /permissions/revoke
 * Revogar permissão de usuário
 */
router.post('/revoke',
  authMiddleware,
  generalRateLimit,
  grantPermissionValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
        return;
      }

      const { userId, permissionCode } = req.body;
      const revokerId = req.user!.id;

      const result = await PermissionService.revokePermission(userId, permissionCode, revokerId);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erro ao revogar permissão:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS DE CONSULTA
// ====================================================================

/**
 * GET /permissions/user/:userId/summary
 * Obter resumo completo de permissões do usuário
 */
router.get('/user/:userId/summary',
  authMiddleware,
  generalRateLimit,
  param('userId').isUUID().withMessage('User ID deve ser um UUID válido'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'User ID inválido',
          details: errors.array()
        });
        return;
      }

      const { userId } = req.params;

      // Verificar se pode consultar permissões de outros
      const canViewOthers = await PermissionService.hasPermission(req.user!.id, 'view_permissions');
      
      if (userId !== req.user!.id && !canViewOthers) {
        res.status(403).json({
          success: false,
          error: 'Sem permissão para ver permissões de outros usuários'
        });
        return;
      }

      const summary = await PermissionService.getUserPermissionSummary(userId);

      res.json({
        success: true,
        message: 'Resumo de permissões obtido com sucesso',
        data: summary
      });

    } catch (error) {
      console.error('Erro ao obter resumo de permissões:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /permissions/users-with/:permissionCode
 * Listar usuários que possuem uma permissão específica
 */
router.get('/users-with/:permissionCode',
  authMiddleware,
  PermissionService.requirePermission('view_permissions'),
  generalRateLimit,
  param('permissionCode').notEmpty().withMessage('Código da permissão é obrigatório'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Código de permissão inválido',
          details: errors.array()
        });
        return;
      }

      const { permissionCode } = req.params;
      const tenantId = req.user!.role === 'super_admin' ? undefined : req.user!.tenant_id;

      const users = await PermissionService.getUsersWithPermission(permissionCode, tenantId);

      res.json({
        success: true,
        message: 'Usuários encontrados com sucesso',
        data: {
          permissionCode,
          users,
          total: users.length
        }
      });

    } catch (error) {
      console.error('Erro ao listar usuários com permissão:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS DE HIERARQUIA E ROLES
// ====================================================================

/**
 * POST /permissions/can-manage
 * Verificar se um usuário pode gerenciar outro
 */
router.post('/can-manage',
  authMiddleware,
  generalRateLimit,
  body('managerId').isUUID().withMessage('Manager ID deve ser um UUID válido'),
  body('targetUserId').isUUID().withMessage('Target User ID deve ser um UUID válido'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
        return;
      }

      const { managerId, targetUserId } = req.body;

      // Verificar se pode consultar relações de gerenciamento
      const canView = await PermissionService.hasPermission(req.user!.id, 'view_permissions') ||
                     req.user!.id === managerId;
      
      if (!canView) {
        res.status(403).json({
          success: false,
          error: 'Sem permissão para verificar relações de gerenciamento'
        });
        return;
      }

      const canManage = await PermissionService.canManageUser(managerId, targetUserId);

      res.json({
        success: true,
        data: {
          managerId,
          targetUserId,
          canManage
        }
      });

    } catch (error) {
      console.error('Erro ao verificar permissão de gerenciamento:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

export default router;