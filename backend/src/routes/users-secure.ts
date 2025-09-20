// ====================================================================
// 👥 ROTAS SEGURAS DE USUÁRIOS - SISTEMA DE PERMISSÕES GRANULARES
// ====================================================================
// Exemplo de implementação das rotas com o novo sistema de segurança
// Substitui validações simples por controle de acesso granular
// ====================================================================

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validators, handleValidationErrors, sanitizeAll } from '../middleware/validation.js';
import { generalRateLimit, strictRateLimit } from '../middleware/rateLimiter.js';
import { PermissionService } from '../services/PermissionService.js';
import { UserModel, UserStatus, UserRole } from '../models/User.js';
import { User } from '../types/prisma.js';
import { RegistrationService, RegisterUserResponse } from '../services/RegistrationService.js';
import { ActivityService } from '../services/ActivityService.js';

export const secureUserRoutes = Router();

// ====================================================================
// VALIDAÇÕES (INALTERADAS)
// ====================================================================

const createUserValidation = [
  validators.body('nomeCompleto')
    .isLength({ min: 2 })
    .withMessage('Nome completo é obrigatório'),
  validators.body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter formato válido'),
  validators.body('senha')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres'),
  validators.body('tipoUsuario')
    .isIn(['super_admin', 'admin', 'manager', 'coordinator', 'user', 'guest'])
    .withMessage('Tipo de usuário inválido'),
  validators.body('tenantId')
    .isUUID()
    .withMessage('Tenant ID deve ser um UUID válido')
];

const updateUserValidation = [
  validators.param('userId').isUUID().withMessage('ID do usuário deve ser um UUID válido'),
  validators.body('nomeCompleto').optional().isLength({ min: 2 }),
  validators.body('email').optional().isEmail().normalizeEmail(),
  validators.body('tipoUsuario').optional().isIn(['super_admin', 'admin', 'manager', 'coordinator', 'user', 'guest']),
  validators.body('tenantId').optional().isUUID()
];

// ====================================================================
// ROTAS COM PERMISSÕES GRANULARES
// ====================================================================

/**
 * POST /users/secure
 * Criar novo usuário - PERMISSÃO GRANULAR
 */
secureUserRoutes.post('/',
  authMiddleware,
  PermissionService.requireUserCreate, // 🔐 NOVA VALIDAÇÃO GRANULAR
  sanitizeAll,
  strictRateLimit, // Rate limit mais rigoroso para operações sensíveis
  createUserValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar se pode gerenciar o usuário alvo
      const canManageTarget = await PermissionService.canManageUserPermissions(
        req.user!.id,
        req.body.tenantId
      );

      if (!canManageTarget) {
        await ActivityService.log({
          userId: req.user!.id,
          action: 'user_creation_denied',
          resource: 'users',
          details: JSON.stringify({
            reason: 'Cannot manage target tenant',
            targetTenant: req.body.tenantId,
            userRole: req.user!.role
          }),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        res.status(403).json({
          success: false,
          error: 'Não é possível criar usuário neste tenant'
        });
        return;
      }

      const userData = {
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        created_by: req.user!.id
      };

      const result: RegisterUserResponse = await RegistrationService.registerUser(userData);

      // Log da criação bem-sucedida
      await ActivityService.log({
        userId: req.user!.id,
        action: 'user_created',
        resource: 'users',
        resourceId: result.user.id,
        details: JSON.stringify({
          targetUserEmail: result.user.email,
          targetUserRole: result.user.role,
          createdByRole: req.user!.role
        }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: result.user
      });

    } catch (error) {
      console.error('❌ [USERS-SECURE] Erro ao criar usuário:', error);

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /users/secure
 * Listar usuários - PERMISSÃO GRANULAR
 */
secureUserRoutes.get('/',
  authMiddleware,
  PermissionService.requireUserRead, // 🔐 NOVA VALIDAÇÃO GRANULAR
  [
    validators.query('tenantId').optional().isUUID(),
    validators.query('tipoUsuario').optional().isString(),
    validators.query('status').optional().isString(),
    validators.query('limit').optional().isInt({ min: 1, max: 100 }),
    validators.query('offset').optional().isInt({ min: 0 })
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenantId, tipoUsuario, status, limit = 50, offset = 0 } = req.query;

      // Verificar permissões específicas para o tenant solicitado
      const canAccessTenant = tenantId
        ? await PermissionService.userHasPermission(req.user!.id, 'tenants.read')
        : true;

      if (!canAccessTenant) {
        res.status(403).json({
          success: false,
          error: 'Sem permissão para acessar dados deste tenant'
        });
        return;
      }

      // Determinar tenant efetivo baseado em permissões
      let effectiveTenantId: string | undefined;

      if (await PermissionService.userHasPermission(req.user!.id, 'system.admin')) {
        // System admin pode ver todos os tenants
        effectiveTenantId = tenantId as string;
      } else {
        // Outros usuários só podem ver seu próprio tenant
        effectiveTenantId = req.user!.tenantId;
      }

      const users = await UserModel.getUsers({
        tenantId: effectiveTenantId,
        role: tipoUsuario as UserRole,
        status: status as UserStatus,
        limit: Number(limit),
        offset: Number(offset)
      });

      // Log da consulta
      await ActivityService.log({
        userId: req.user!.id,
        action: 'users_listed',
        resource: 'users',
        details: JSON.stringify({
          filters: { tenantId: effectiveTenantId, role: tipoUsuario, status },
          resultCount: users.users.length,
          userRole: req.user!.role
        }),
        ipAddress: req.ip
      });

      res.json({
        success: true,
        data: users.users,
        total: users.total
      });

    } catch (error) {
      console.error('❌ [USERS-SECURE] Erro ao listar usuários:', error);

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * PUT /users/secure/:userId
 * Atualizar usuário - PERMISSÃO GRANULAR
 */
secureUserRoutes.put('/:userId',
  authMiddleware,
  PermissionService.requireUserUpdate, // 🔐 NOVA VALIDAÇÃO GRANULAR
  sanitizeAll,
  strictRateLimit,
  updateUserValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      // Verificar se pode gerenciar este usuário específico
      const canManageUser = await PermissionService.canManageUserPermissions(
        req.user!.id,
        userId
      );

      if (!canManageUser) {
        await ActivityService.log({
          userId: req.user!.id,
          action: 'user_update_denied',
          resource: 'users',
          resourceId: userId,
          details: JSON.stringify({
            reason: 'Cannot manage target user',
            userRole: req.user!.role
          }),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        res.status(403).json({
          success: false,
          error: 'Sem permissão para editar este usuário'
        });
        return;
      }

      // Buscar usuário atual para comparação
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      // Verificar se está tentando alterar role
      if (req.body.tipoUsuario && req.body.tipoUsuario !== existingUser.role) {
        const canManageRoles = await PermissionService.userHasPermission(
          req.user!.id,
          'users.manage_roles'
        );

        if (!canManageRoles) {
          res.status(403).json({
            success: false,
            error: 'Sem permissão para alterar roles de usuários'
          });
          return;
        }
      }

      const updatedUser = await UserModel.updateUser(userId, req.body);

      // Log da atualização
      await ActivityService.log({
        userId: req.user!.id,
        action: 'user_updated',
        resource: 'users',
        resourceId: userId,
        details: JSON.stringify({
          targetUserEmail: existingUser.email,
          changes: req.body,
          updatedByRole: req.user!.role
        }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: updatedUser
      });

    } catch (error) {
      console.error('❌ [USERS-SECURE] Erro ao atualizar usuário:', error);

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * DELETE /users/secure/:userId
 * Excluir usuário - PERMISSÃO GRANULAR
 */
secureUserRoutes.delete('/:userId',
  authMiddleware,
  PermissionService.requireUserDelete, // 🔐 NOVA VALIDAÇÃO GRANULAR
  strictRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      // Verificar se pode gerenciar este usuário específico
      const canManageUser = await PermissionService.canManageUserPermissions(
        req.user!.id,
        userId
      );

      if (!canManageUser) {
        await ActivityService.log({
          userId: req.user!.id,
          action: 'user_deletion_denied',
          resource: 'users',
          resourceId: userId,
          details: JSON.stringify({
            reason: 'Cannot manage target user',
            userRole: req.user!.role
          }),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        res.status(403).json({
          success: false,
          error: 'Sem permissão para excluir este usuário'
        });
        return;
      }

      // Buscar usuário antes da exclusão para log
      const userToDelete = await UserModel.findById(userId);
      if (!userToDelete) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      // Impedir autoexclusão
      if (userId === req.user!.id) {
        res.status(400).json({
          success: false,
          error: 'Não é possível excluir seu próprio usuário'
        });
        return;
      }

      await UserModel.deleteUser(userId);

      // Log da exclusão
      await ActivityService.log({
        userId: req.user!.id,
        action: 'user_deleted',
        resource: 'users',
        resourceId: userId,
        details: JSON.stringify({
          deletedUserEmail: userToDelete.email,
          deletedUserRole: userToDelete.role,
          deletedByRole: req.user!.role
        }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Usuário excluído com sucesso'
      });

    } catch (error) {
      console.error('❌ [USERS-SECURE] Erro ao excluir usuário:', error);

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /users/secure/:userId/reset-password
 * Resetar senha - PERMISSÃO GRANULAR
 */
secureUserRoutes.post('/:userId/reset-password',
  authMiddleware,
  PermissionService.requireUserResetPassword, // 🔐 NOVA VALIDAÇÃO GRANULAR
  strictRateLimit,
  [
    validators.param('userId').isUUID(),
    validators.body('new_password').isLength({ min: 8 }).withMessage('Nova senha deve ter pelo menos 8 caracteres')
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { new_password } = req.body;

      // Verificar se pode gerenciar este usuário específico
      const canManageUser = await PermissionService.canManageUserPermissions(
        req.user!.id,
        userId
      );

      if (!canManageUser) {
        await ActivityService.log({
          userId: req.user!.id,
          action: 'password_reset_denied',
          resource: 'users',
          resourceId: userId,
          details: JSON.stringify({
            reason: 'Cannot manage target user',
            userRole: req.user!.role
          }),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        res.status(403).json({
          success: false,
          error: 'Sem permissão para resetar senha deste usuário'
        });
        return;
      }

      const userToReset = await UserModel.findById(userId);
      if (!userToReset) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      await UserModel.updatePassword(userId, new_password);

      // Log do reset de senha
      await ActivityService.log({
        userId: req.user!.id,
        action: 'password_reset',
        resource: 'users',
        resourceId: userId,
        details: JSON.stringify({
          targetUserEmail: userToReset.email,
          resetByRole: req.user!.role
        }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Senha resetada com sucesso'
      });

    } catch (error) {
      console.error('❌ [USERS-SECURE] Erro ao resetar senha:', error);

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /users/secure/:userId/permissions
 * Gerenciar permissões específicas - PERMISSÃO GRANULAR
 */
secureUserRoutes.post('/:userId/permissions',
  authMiddleware,
  PermissionService.requireUserManagePermissions, // 🔐 NOVA VALIDAÇÃO GRANULAR
  strictRateLimit,
  [
    validators.param('userId').isUUID(),
    validators.body('action').isIn(['grant', 'revoke']),
    validators.body('permission').isString().isLength({ min: 1 })
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { action, permission } = req.body;

      // Verificar se pode gerenciar este usuário específico
      const canManageUser = await PermissionService.canManageUserPermissions(
        req.user!.id,
        userId
      );

      if (!canManageUser) {
        res.status(403).json({
          success: false,
          error: 'Sem permissão para gerenciar permissões deste usuário'
        });
        return;
      }

      let result: boolean;

      if (action === 'grant') {
        result = await PermissionService.grantPermissionToUser(
          userId,
          permission,
          req.user!.id
        );
      } else {
        result = await PermissionService.revokePermissionFromUser(
          userId,
          permission,
          req.user!.id
        );
      }

      if (!result) {
        res.status(400).json({
          success: false,
          error: `Falha ao ${action === 'grant' ? 'conceder' : 'revogar'} permissão`
        });
        return;
      }

      res.json({
        success: true,
        message: `Permissão ${action === 'grant' ? 'concedida' : 'revogada'} com sucesso`
      });

    } catch (error) {
      console.error('❌ [USERS-SECURE] Erro ao gerenciar permissões:', error);

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

export default secureUserRoutes;