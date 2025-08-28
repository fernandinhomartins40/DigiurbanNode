// ====================================================================
// 📝 ROTAS DE REGISTRO - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Rotas para registro de usuários e tenants
// Sistema multi-tenant com validação e ativação
// ====================================================================

import { Router, Request, Response } from 'express';
import { RegistrationService } from '../services/RegistrationService.js';
import { PermissionService } from '../services/PermissionService.js';
import { authMiddleware } from '../middleware/auth.js';
import { registerRateLimit, generalRateLimit, strictRateLimit } from '../middleware/rateLimiter.js';
import { body, param, validationResult } from 'express-validator';

const router = Router();

// ====================================================================
// VALIDAÇÕES
// ====================================================================

const registerTenantValidation = [
  body('nome')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter formato válido'),
  body('telefone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve ter formato brasileiro válido'),
  body('endereco')
    .optional()
    .isString()
    .withMessage('Endereço deve ser uma string'),
  body('plano')
    .isIn(['basico', 'profissional', 'empresarial'])
    .withMessage('Plano deve ser: basico, profissional ou empresarial'),
  body('admin_nome_completo')
    .isLength({ min: 2, max: 150 })
    .withMessage('Nome do admin deve ter entre 2 e 150 caracteres'),
  body('admin_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email do admin deve ter formato válido'),
  body('admin_password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha do admin deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo')
];

const registerUserValidation = [
  body('nome_completo')
    .isLength({ min: 2, max: 150 })
    .withMessage('Nome completo deve ter entre 2 e 150 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter formato válido'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo'),
  body('tenant_id')
    .optional()
    .isUUID()
    .withMessage('Tenant ID deve ser um UUID válido'),
  body('role')
    .optional()
    .isIn(['guest', 'user', 'coordinator', 'manager', 'admin'])
    .withMessage('Role deve ser: guest, user, coordinator, manager ou admin'),
  body('telefone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve ter formato brasileiro válido'),
  body('departamento')
    .optional()
    .isString()
    .withMessage('Departamento deve ser uma string'),
  body('cargo')
    .optional()
    .isString()
    .withMessage('Cargo deve ser uma string')
];

const activateAccountValidation = [
  body('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('Token de ativação inválido')
];

// ====================================================================
// ROTAS PÚBLICAS DE REGISTRO
// ====================================================================

/**
 * POST /registration/tenant
 * Registrar novo tenant com admin
 */
router.post('/tenant',
  registerRateLimit,
  registerTenantValidation,
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

      const registrationData = {
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await RegistrationService.registerTenant(registrationData);

      res.status(201).json({
        success: true,
        message: 'Tenant registrado com sucesso',
        data: result
      });

    } catch (error) {
      console.error('Erro no registro de tenant:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /registration/user
 * Registrar novo usuário (público ou por admin)
 */
router.post('/user',
  registerRateLimit,
  registerUserValidation,
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

      const registrationData = {
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await RegistrationService.registerUser(registrationData);

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result
      });

    } catch (error) {
      console.error('Erro no registro de usuário:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /registration/activate
 * Ativar conta de usuário com token
 */
router.post('/activate',
  generalRateLimit,
  activateAccountValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Token de ativação inválido',
          details: errors.array()
        });
        return;
      }

      const { token } = req.body;

      const result = await RegistrationService.activateAccount(token, {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: result.message,
        data: {
          user: result.user
        }
      });

    } catch (error) {
      console.error('Erro na ativação da conta:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /registration/resend-activation
 * Reenviar email de ativação
 */
router.post('/resend-activation',
  strictRateLimit,
  body('email').isEmail().normalizeEmail().withMessage('Email deve ter formato válido'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Email inválido',
          details: errors.array()
        });
        return;
      }

      const { email } = req.body;

      const result = await RegistrationService.resendActivationEmail(email);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erro ao reenviar ativação:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS PROTEGIDAS (REQUEREM AUTENTICAÇÃO)
// ====================================================================

/**
 * POST /registration/user-by-admin
 * Registrar usuário por administrador
 */
router.post('/user-by-admin',
  authMiddleware,
  PermissionService.requirePermission('create_users'),
  registerRateLimit,
  registerUserValidation,
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

      // Definir tenant_id se não informado (usar o do admin)
      const registrationData = {
        ...req.body,
        tenant_id: req.body.tenant_id || req.user!.tenant_id,
        created_by: req.user!.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      // Verificar se admin pode criar usuário no tenant especificado
      if (req.user!.role !== 'super_admin' && registrationData.tenant_id !== req.user!.tenant_id) {
        res.status(403).json({
          success: false,
          error: 'Sem permissão para criar usuário em outro tenant'
        });
        return;
      }

      const result = await RegistrationService.registerUser(registrationData);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso pelo administrador',
        data: result
      });

    } catch (error) {
      console.error('Erro no registro por admin:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /registration/activate-user/:userId
 * Ativar usuário manualmente (apenas admins)
 */
router.post('/activate-user/:userId',
  authMiddleware,
  PermissionService.requirePermission('manage_users'),
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

      const result = await RegistrationService.activateUserByAdmin(userId, {
        activatedBy: req.user!.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: result.message,
        data: {
          user: result.user
        }
      });

    } catch (error) {
      console.error('Erro na ativação por admin:', error);
      
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
 * GET /registration/pending
 * Listar usuários pendentes de ativação (apenas admins)
 */
router.get('/pending',
  authMiddleware,
  PermissionService.requirePermission('view_users'),
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user!.role === 'super_admin' ? undefined : req.user!.tenant_id;

      const pendingUsers = await RegistrationService.getPendingUsers(tenantId);

      res.json({
        success: true,
        message: 'Usuários pendentes encontrados com sucesso',
        data: {
          users: pendingUsers,
          total: pendingUsers.length,
          tenantId
        }
      });

    } catch (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /registration/stats
 * Estatísticas de registro (apenas admins)
 */
router.get('/stats',
  authMiddleware,
  PermissionService.requirePermission('view_system_stats'),
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user!.role === 'super_admin' ? undefined : req.user!.tenant_id;

      const stats = await RegistrationService.getRegistrationStats(tenantId);

      res.json({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: {
          stats,
          tenantId
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

export default router;