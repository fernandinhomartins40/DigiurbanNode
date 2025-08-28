// ====================================================================
// 📊 ROTAS DE ATIVIDADES - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Rotas para logs de atividade e auditoria
// Controle de acesso e relatórios de segurança
// ====================================================================

import { Router, Request, Response } from 'express';
import { ActivityService } from '../services/ActivityService.js';
import { PermissionService } from '../services/PermissionService.js';
import { authMiddleware } from '../middleware/auth.js';
import { generalRateLimit } from '../middleware/rateLimiter.js';
import { body, param, query, validationResult } from 'express-validator';

const router = Router();

// ====================================================================
// VALIDAÇÕES
// ====================================================================

const activitiesFilterValidation = [
  query('user_id').optional().isUUID().withMessage('User ID deve ser um UUID válido'),
  query('tenant_id').optional().isUUID().withMessage('Tenant ID deve ser um UUID válido'),
  query('action').optional().isString().withMessage('Action deve ser uma string'),
  query('resource').optional().isString().withMessage('Resource deve ser uma string'),
  query('date_from').optional().isISO8601().withMessage('Data inicial deve estar no formato ISO8601'),
  query('date_to').optional().isISO8601().withMessage('Data final deve estar no formato ISO8601'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit deve ser entre 1 e 1000'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset deve ser maior ou igual a 0')
];

const statsValidation = [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days deve ser entre 1 e 365')
];

// ====================================================================
// ROTAS DE CONSULTA DE ATIVIDADES
// ====================================================================

/**
 * GET /activities
 * Buscar atividades com filtros
 */
router.get('/',
  authMiddleware,
  PermissionService.requirePermission('view_activity_logs'),
  generalRateLimit,
  activitiesFilterValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Parâmetros inválidos',
          details: errors.array()
        });
        return;
      }

      // Extrair filtros da query
      const filters: any = {};
      const validFilters = ['user_id', 'tenant_id', 'action', 'resource', 'date_from', 'date_to', 'limit', 'offset'];
      
      for (const filter of validFilters) {
        if (req.query[filter]) {
          filters[filter] = req.query[filter];
        }
      }

      // Aplicar filtro de tenant se não for super_admin
      if (req.user!.role !== 'super_admin' && !filters.tenant_id) {
        filters.tenant_id = req.user!.tenant_id;
      }

      // Definir limite padrão
      if (!filters.limit) {
        filters.limit = 50;
      }

      const activities = await ActivityService.findActivities(filters);

      res.json({
        success: true,
        message: 'Atividades encontradas com sucesso',
        data: {
          activities,
          total: activities.length,
          filters: filters
        }
      });

    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /activities/user/:userId
 * Buscar atividades de um usuário específico
 */
router.get('/user/:userId',
  authMiddleware,
  generalRateLimit,
  param('userId').isUUID().withMessage('User ID deve ser um UUID válido'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Limit deve ser entre 1 e 200'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Parâmetros inválidos',
          details: errors.array()
        });
        return;
      }

      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      // Verificar permissões
      const canViewOthers = await PermissionService.hasPermission(req.user!.id, 'view_activity_logs');
      
      if (userId !== req.user!.id && !canViewOthers) {
        res.status(403).json({
          success: false,
          error: 'Sem permissão para ver atividades de outros usuários'
        });
        return;
      }

      const activities = await ActivityService.getUserActivities(userId, limit);

      res.json({
        success: true,
        message: 'Atividades do usuário encontradas com sucesso',
        data: {
          userId,
          activities,
          total: activities.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /activities/tenant/:tenantId
 * Buscar atividades de um tenant específico
 */
router.get('/tenant/:tenantId',
  authMiddleware,
  PermissionService.requirePermission('view_activity_logs'),
  generalRateLimit,
  param('tenantId').isUUID().withMessage('Tenant ID deve ser um UUID válido'),
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit deve ser entre 1 e 500'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Parâmetros inválidos',
          details: errors.array()
        });
        return;
      }

      const { tenantId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

      // Super admin pode ver qualquer tenant, outros só o próprio
      if (req.user!.role !== 'super_admin' && req.user!.tenant_id !== tenantId) {
        res.status(403).json({
          success: false,
          error: 'Sem permissão para ver atividades de outros tenants'
        });
        return;
      }

      const activities = await ActivityService.getTenantActivities(tenantId, limit);

      res.json({
        success: true,
        message: 'Atividades do tenant encontradas com sucesso',
        data: {
          tenantId,
          activities,
          total: activities.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar atividades do tenant:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /activities/recent
 * Buscar atividades recentes
 */
router.get('/recent',
  authMiddleware,
  PermissionService.requirePermission('view_activity_logs'),
  generalRateLimit,
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit deve ser entre 1 e 100'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Parâmetros inválidos',
          details: errors.array()
        });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const activities = await ActivityService.getRecentActivities(limit);

      // Filtrar por tenant se não for super_admin
      let filteredActivities = activities;
      if (req.user!.role !== 'super_admin') {
        filteredActivities = activities.filter(activity => 
          activity.tenant_id === req.user!.tenant_id || !activity.tenant_id
        );
      }

      res.json({
        success: true,
        message: 'Atividades recentes encontradas com sucesso',
        data: {
          activities: filteredActivities,
          total: filteredActivities.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS DE ESTATÍSTICAS E RELATÓRIOS
// ====================================================================

/**
 * GET /activities/stats
 * Obter estatísticas de atividades
 */
router.get('/stats',
  authMiddleware,
  PermissionService.requirePermission('view_activity_logs'),
  generalRateLimit,
  statsValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Parâmetros inválidos',
          details: errors.array()
        });
        return;
      }

      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const tenantId = req.user!.role === 'super_admin' ? undefined : req.user!.tenant_id;

      const stats = await ActivityService.getActivityStats(tenantId, days);

      res.json({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: {
          period: `${days} dias`,
          tenantId,
          stats
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /activities/suspicious
 * Obter atividades suspeitas
 */
router.get('/suspicious',
  authMiddleware,
  PermissionService.requirePermission('view_activity_logs'),
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user!.role === 'super_admin' ? undefined : req.user!.tenant_id;

      const suspiciousActivities = await ActivityService.getSuspiciousActivities(tenantId);

      res.json({
        success: true,
        message: 'Atividades suspeitas encontradas com sucesso',
        data: {
          activities: suspiciousActivities,
          total: suspiciousActivities.length,
          period: 'Últimas 24 horas',
          tenantId
        }
      });

    } catch (error) {
      console.error('Erro ao buscar atividades suspeitas:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS ADMINISTRATIVAS
// ====================================================================

/**
 * POST /activities/cleanup
 * Limpar logs antigos (apenas super admins)
 */
router.post('/cleanup',
  authMiddleware,
  PermissionService.requireSuperAdmin,
  generalRateLimit,
  query('retentionDays').optional().isInt({ min: 30, max: 365 }).withMessage('RetentionDays deve ser entre 30 e 365'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Parâmetros inválidos',
          details: errors.array()
        });
        return;
      }

      const retentionDays = req.query.retentionDays ? parseInt(req.query.retentionDays as string) : 90;

      const result = await ActivityService.cleanupOldLogs(retentionDays);

      res.json({
        success: true,
        message: `Limpeza concluída. ${result.deleted} registros removidos`,
        data: {
          deleted: result.deleted,
          retentionDays
        }
      });

    } catch (error) {
      console.error('Erro na limpeza de logs:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /activities/archive
 * Arquivar logs antigos (apenas super admins)
 */
router.post('/archive',
  authMiddleware,
  PermissionService.requireSuperAdmin,
  generalRateLimit,
  query('archiveDays').optional().isInt({ min: 365, max: 1825 }).withMessage('ArchiveDays deve ser entre 365 e 1825'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Parâmetros inválidos',
          details: errors.array()
        });
        return;
      }

      const archiveDays = req.query.archiveDays ? parseInt(req.query.archiveDays as string) : 365;

      const result = await ActivityService.archiveOldLogs(archiveDays);

      res.json({
        success: true,
        message: `Arquivamento concluído. ${result.archived} registros arquivados`,
        data: {
          archived: result.archived,
          archiveDays
        }
      });

    } catch (error) {
      console.error('Erro no arquivamento de logs:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

export default router;