// ====================================================================
// 🏛️ ROTAS DE TENANTS - DIGIURBAN JWT SYSTEM
// ====================================================================
// Rotas para gerenciamento de tenants (organizações municipais)
// Substitui as funcionalidades do tenantService
// ====================================================================

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validators, handleValidationErrors, sanitizeAll } from '../middleware/validation.js';
import { generalRateLimit } from '../middleware/rateLimiter.js';
import { TenantModel } from '../models/Tenant.js';
import { UserModel } from '../models/User.js';
import { body, param, query } from 'express-validator';

export const tenantRoutes = Router();

// ====================================================================
// VALIDAÇÕES
// ====================================================================

const createTenantValidation = [
  body('nome')
    .isLength({ min: 2 })
    .withMessage('Nome é obrigatório'),
  body('cidade')
    .isLength({ min: 2 })
    .withMessage('Cidade é obrigatória'),
  body('estado')
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter 2 caracteres'),
  body('populacao')
    .isInt({ min: 1 })
    .withMessage('População deve ser um número válido'),
  body('cnpj')
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/)
    .withMessage('CNPJ deve ter formato válido'),
  body('plano')
    .isIn(['basico', 'intermediario', 'avancado', 'premium'])
    .withMessage('Plano inválido')
];

const updateTenantValidation = [
  param('tenantId').isUUID().withMessage('ID do tenant deve ser um UUID válido'),
  body('nome').optional().isLength({ min: 2 }),
  body('cidade').optional().isLength({ min: 2 }),
  body('estado').optional().isLength({ min: 2, max: 2 }),
  body('populacao').optional().isInt({ min: 1 }),
  body('plano').optional().isIn(['basico', 'intermediario', 'avancado', 'premium'])
];

// ====================================================================
// MIDDLEWARE DE AUTORIZAÇÃO
// ====================================================================

const requireSuperAdmin = (req: Request, res: Response, next: Function) => {
  if (req.user!.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado - apenas super administradores'
    });
  }
  next();
};

const requireAdminOrOwn = (req: Request, res: Response, next: Function) => {
  // Super admin pode acessar qualquer tenant
  // Admin pode acessar apenas seu próprio tenant
  if (req.user!.role === 'super_admin') {
    next();
    return;
  }
  
  const tenantId = req.params.tenantId || req.body.tenant_id;
  if (req.user!.role === 'admin' && req.user!.tenant_id === tenantId) {
    next();
    return;
  }
  
  return res.status(403).json({
    success: false,
    error: 'Acesso negado ao tenant'
  });
};

// ====================================================================
// ROTAS PROTEGIDAS
// ====================================================================

/**
 * POST /tenants
 * Criar novo tenant (apenas super admin)
 */
tenantRoutes.post('/',
  authMiddleware,
  requireSuperAdmin,
  sanitizeAll,
  generalRateLimit,
  createTenantValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar se CNPJ já existe
      const cnpjExists = await TenantModel.checkCnpjExists(req.body.cnpj);
      if (cnpjExists) {
        res.status(400).json({
          success: false,
          error: 'CNPJ já está sendo usado por outro tenant'
        });
        return;
      }

      // Gerar código único do tenant
      const tenantCode = await TenantModel.generateUniqueTenantCode(req.body.nome);

      const tenantData = {
        ...req.body,
        tenant_code: tenantCode,
        status: 'ativo',
        created_by: req.user!.id
      };

      const tenant = await TenantModel.createTenant(tenantData);

      res.status(201).json({
        success: true,
        message: 'Tenant criado com sucesso',
        data: tenant
      });

    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /tenants
 * Listar tenants
 */
tenantRoutes.get('/',
  authMiddleware,
  requireSuperAdmin, // Apenas super admin pode listar todos os tenants
  [
    query('status').optional().isString(),
    query('plano').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, plano, limit = 50, offset = 0 } = req.query;

      const tenants = await TenantModel.getTenants({
        status: status as string,
        plano: plano as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      res.json({
        success: true,
        message: 'Tenants listados com sucesso',
        data: tenants
      });

    } catch (error) {
      console.error('Erro ao listar tenants:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /tenants/:tenantId
 * Obter tenant específico
 */
tenantRoutes.get('/:tenantId',
  authMiddleware,
  requireAdminOrOwn,
  param('tenantId').isUUID(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenantId } = req.params;
      
      const tenant = await TenantModel.getTenantById(tenantId);
      
      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Tenant obtido com sucesso',
        data: tenant
      });

    } catch (error) {
      console.error('Erro ao obter tenant:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * PUT /tenants/:tenantId
 * Atualizar tenant
 */
tenantRoutes.put('/:tenantId',
  authMiddleware,
  requireAdminOrOwn,
  sanitizeAll,
  updateTenantValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenantId } = req.params;
      const updates = req.body;

      // Verificar se tenant existe
      const existingTenant = await TenantModel.getTenantById(tenantId);
      if (!existingTenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant não encontrado'
        });
        return;
      }

      // Se está alterando CNPJ, verificar se novo CNPJ está disponível
      if (updates.cnpj && updates.cnpj !== existingTenant.cnpj) {
        const cnpjExists = await TenantModel.checkCnpjExists(updates.cnpj);
        if (cnpjExists) {
          res.status(400).json({
            success: false,
            error: 'CNPJ já está sendo usado por outro tenant'
          });
          return;
        }
      }

      const updatedTenant = await TenantModel.updateTenant(tenantId, {
        ...updates,
        updated_at: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Tenant atualizado com sucesso',
        data: updatedTenant
      });

    } catch (error) {
      console.error('Erro ao atualizar tenant:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * DELETE /tenants/:tenantId
 * Excluir tenant (soft delete)
 */
tenantRoutes.delete('/:tenantId',
  authMiddleware,
  requireSuperAdmin, // Apenas super admin pode excluir tenants
  param('tenantId').isUUID(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenantId } = req.params;

      // Verificar se tenant existe
      const existingTenant = await TenantModel.getTenantById(tenantId);
      if (!existingTenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant não encontrado'
        });
        return;
      }

      // Marcar tenant como suspenso
      await TenantModel.updateTenant(tenantId, {
        status: 'suspenso',
        updated_at: new Date().toISOString()
      });

      // Marcar usuários órfãos como 'sem_vinculo'
      const orphanCount = await UserModel.markOrphanUsers(tenantId);

      res.json({
        success: true,
        message: 'Tenant excluído com sucesso',
        data: {
          orphan_users_updated: orphanCount
        }
      });

    } catch (error) {
      console.error('Erro ao excluir tenant:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /tenants/check-cnpj
 * Verificar disponibilidade de CNPJ
 */
tenantRoutes.get('/check-cnpj',
  authMiddleware,
  requireSuperAdmin,
  query('cnpj').notEmpty(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { cnpj } = req.query;
      
      const exists = await TenantModel.checkCnpjExists(cnpj as string);
      
      res.json({
        success: true,
        message: 'Verificação de CNPJ realizada',
        data: {
          available: !exists,
          exists
        }
      });

    } catch (error) {
      console.error('Erro ao verificar CNPJ:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /tenants/check-code
 * Verificar disponibilidade de código de tenant
 */
tenantRoutes.get('/check-code',
  authMiddleware,
  requireSuperAdmin,
  query('code').notEmpty(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.query;
      
      const exists = await TenantModel.checkCodeExists(code as string);
      
      res.json({
        success: true,
        message: 'Verificação de código realizada',
        data: {
          exists
        }
      });

    } catch (error) {
      console.error('Erro ao verificar código:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * PUT /tenants/:tenantId/admin-status
 * Marcar tenant como tendo admin
 */
tenantRoutes.put('/:tenantId/admin-status',
  authMiddleware,
  requireSuperAdmin,
  sanitizeAll,
  [
    param('tenantId').isUUID(),
    body('has_admin').isBoolean()
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenantId } = req.params;
      const { has_admin } = req.body;

      // Verificar se tenant existe
      const existingTenant = await TenantModel.getTenantById(tenantId);
      if (!existingTenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant não encontrado'
        });
        return;
      }

      const updatedTenant = await TenantModel.updateTenant(tenantId, {
        has_admin,
        updated_at: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Status de admin atualizado com sucesso',
        data: updatedTenant
      });

    } catch (error) {
      console.error('Erro ao atualizar status de admin:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /tenants/:tenantId/orphan-users
 * Processar usuários órfãos quando tenant é excluído
 */
tenantRoutes.post('/:tenantId/orphan-users',
  authMiddleware,
  requireSuperAdmin,
  sanitizeAll,
  [
    param('tenantId').isUUID(),
    body('status').isIn(['sem_vinculo', 'suspenso', 'inativo'])
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenantId } = req.params;
      const { status } = req.body;

      const updatedCount = await UserModel.markOrphanUsers(tenantId, status);

      res.json({
        success: true,
        message: 'Usuários órfãos processados com sucesso',
        data: {
          updated_count: updatedCount
        }
      });

    } catch (error) {
      console.error('Erro ao processar usuários órfãos:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);