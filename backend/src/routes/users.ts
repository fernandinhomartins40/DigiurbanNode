import { body, query, param, validationResult, ValidationChain } from '../utils/validators.js';
// ====================================================================
// 👥 ROTAS DE USUÁRIOS - DIGIURBAN JWT SYSTEM
// ====================================================================
// Rotas para gerenciamento de usuários (CRUD completo)
// Substitui as funcionalidades do userManagementService
// ====================================================================

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validators, handleValidationErrors, sanitizeAll } from '../middleware/validation.js';
import { generalRateLimit } from '../middleware/rateLimiter.js';
import { UserModel } from '../models/User.js';
import { RegistrationService } from '../services/RegistrationService.js';

export const userRoutes = Router();

// ====================================================================
// VALIDAÇÕES
// ====================================================================

const createUserValidation = [
  body('nomeCompleto')
    .isLength({ min: 2 })
    .withMessage('Nome completo é obrigatório'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter formato válido'),
  body('senha')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres'),
  body('tipoUsuario')
    .isIn(['super_admin', 'admin', 'manager', 'coordinator', 'user', 'guest'])
    .withMessage('Tipo de usuário inválido'),
  body('tenantId')
    .isUUID()
    .withMessage('Tenant ID deve ser um UUID válido')
];

const updateUserValidation = [
  param('userId').isUUID().withMessage('ID do usuário deve ser um UUID válido'),
  body('nomeCompleto').optional().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('tipoUsuario').optional().isIn(['super_admin', 'admin', 'manager', 'coordinator', 'user', 'guest']),
  body('tenantId').optional().isUUID()
];

// ====================================================================
// MIDDLEWARE DE AUTORIZAÇÃO
// ====================================================================

const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (!['admin', 'super_admin'].includes(req.user!.role)) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado - apenas administradores'
    });
  }
  next();
};

const requireSuperAdmin = (req: Request, res: Response, next: Function) => {
  if (req.user!.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado - apenas super administradores'
    });
  }
  next();
};

// ====================================================================
// ROTAS PROTEGIDAS
// ====================================================================

/**
 * POST /users
 * Criar novo usuário
 */
userRoutes.post('/',
  authMiddleware,
  requireAdmin,
  sanitizeAll,
  generalRateLimit,
  createUserValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userData = {
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        created_by: req.user!.id
      };

      // Verificar se usuário pode criar neste tenant
      if (req.user!.role !== 'super_admin' && userData.tenantId !== req.user!.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Não é possível criar usuário em outro tenant'
        });
        return;
      }

      const result = await RegistrationService.registerUser(userData);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: result.user
      });

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /users
 * Listar usuários com filtros
 */
userRoutes.get('/',
  authMiddleware,
  requireAdmin,
  [
    query('tenantId').optional().isUUID(),
    query('tipoUsuario').optional().isString(),
    query('status').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenantId, tipoUsuario, status, limit = 50, offset = 0 } = req.query;

      // Super admin pode ver todos, admin só do seu tenant
      const effectiveTenantId = req.user!.role === 'super_admin' 
        ? (tenantId as string) 
        : req.user!.tenantId;

      const users = await UserModel.getUsers({
        tenantId: effectiveTenantId,
        role: tipoUsuario as any,
        status: status as any,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      res.json({
        success: true,
        message: 'Usuários listados com sucesso',
        data: users
      });

    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /users/:userId
 * Obter usuário específico
 */
userRoutes.get('/:userId',
  authMiddleware,
  requireAdmin,
  param('userId').isUUID(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      
      const user = await UserModel.getProfile(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      // Verificar se pode acessar este usuário
      if (req.user!.role !== 'super_admin' && user.tenantId !== req.user!.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado ao usuário'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Usuário obtido com sucesso',
        data: user
      });

    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * PUT /users/:userId
 * Atualizar usuário
 */
userRoutes.put('/:userId',
  authMiddleware,
  requireAdmin,
  sanitizeAll,
  updateUserValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Verificar se usuário existe e pertence ao tenant correto
      const existingUser = await UserModel.getProfile(userId);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      // Verificar permissões
      if (req.user!.role !== 'super_admin' && existingUser.tenantId !== req.user!.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado ao usuário'
        });
        return;
      }

      const updatedUser = await UserModel.updateUser(userId, {
        ...updates,
        updated_at: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: updatedUser
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * PUT /users/:userId/status
 * Alterar status do usuário
 */
userRoutes.put('/:userId/status',
  authMiddleware,
  requireAdmin,
  sanitizeAll,
  [
    param('userId').isUUID(),
    body('status').isIn(['ativo', 'suspenso', 'inativo', 'sem_vinculo'])
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      // Verificar se usuário existe e pertence ao tenant correto
      const existingUser = await UserModel.getProfile(userId);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      if (req.user!.role !== 'super_admin' && existingUser.tenantId !== req.user!.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado ao usuário'
        });
        return;
      }

      const updatedUser = await UserModel.updateUserStatus(userId, status);

      res.json({
        success: true,
        message: 'Status atualizado com sucesso',
        data: updatedUser
      });

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * DELETE /users/:userId
 * Excluir usuário
 */
userRoutes.delete('/:userId',
  authMiddleware,
  requireAdmin,
  param('userId').isUUID(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      // Verificar se usuário existe e pertence ao tenant correto
      const existingUser = await UserModel.getProfile(userId);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      if (req.user!.role !== 'super_admin' && existingUser.tenantId !== req.user!.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado ao usuário'
        });
        return;
      }

      // Não permitir auto-exclusão
      if (userId === req.user!.id) {
        res.status(400).json({
          success: false,
          error: 'Não é possível excluir sua própria conta'
        });
        return;
      }

      await UserModel.deleteUser(userId);

      res.json({
        success: true,
        message: 'Usuário excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /users/:userId/reset-password
 * Reset de senha do usuário
 */
userRoutes.post('/:userId/reset-password',
  authMiddleware,
  requireAdmin,
  sanitizeAll,
  param('userId').isUUID(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      // Verificar se usuário existe e pertence ao tenant correto
      const existingUser = await UserModel.getProfile(userId);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      if (req.user!.role !== 'super_admin' && existingUser.tenantId !== req.user!.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado ao usuário'
        });
        return;
      }

      await UserModel.resetPassword(userId, 'newPassword123');

      res.json({
        success: true,
        message: 'Reset de senha realizado com sucesso'
      });

    } catch (error) {
      console.error('Erro no reset de senha:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /users/profile
 * Criar perfil de usuário (usado internamente pelo userManagementService)
 */
userRoutes.post('/profile',
  authMiddleware,
  requireAdmin,
  sanitizeAll,
  [
    body('id').isUUID(),
    body('nomeCompleto').isString(),
    body('email').isEmail(),
    body('tipoUsuario').isString(),
    body('tenantId').isUUID()
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const profile = await UserModel.createProfile(req.body);

      res.json({
        success: true,
        message: 'Perfil criado com sucesso',
        data: profile
      });

    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);