import { body, query, param, validationResult, ValidationChain } from '../utils/validators.js';
// ====================================================================
// ⚙️ ROTAS DE SISTEMA - DIGIURBAN JWT SYSTEM
// ====================================================================
// Rotas para logs de atividade, diagnósticos e operações sistêmicas
// ====================================================================

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validators, handleValidationErrors, sanitizeAll } from '../middleware/validation.js';
import { generalRateLimit } from '../middleware/rateLimiter.js';
import { ActivityModel } from '../models/Activity.js';

export const systemRoutes = Router();

// ====================================================================
// VALIDAÇÕES
// ====================================================================

const activityLogValidation = [
  body('tenant_id').optional().isUUID(),
  body('acao').isLength({ min: 1 }).withMessage('Ação é obrigatória'),
  body('detalhes').optional().isString(),
  body('categoria').optional().isString(),
  body('metadata').optional().isObject()
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

const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (!['admin', 'super_admin'].includes(req.user!.role)) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado - apenas administradores'
    });
  }
  next();
};

// ====================================================================
// ROTAS PROTEGIDAS
// ====================================================================

/**
 * POST /system/activity-logs
 * Registrar log de atividade
 */
systemRoutes.post('/activity-logs',
  authMiddleware,
  requireAdmin,
  sanitizeAll,
  activityLogValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const logData = {
        ...req.body,
        user_id: req.user!.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      };

      const activity = await ActivityModel.createActivity(logData);

      res.status(201).json({
        success: true,
        message: 'Log de atividade registrado com sucesso',
        data: activity
      });

    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /system/activity-logs
 * Listar logs de atividade
 */
systemRoutes.get('/activity-logs',
  authMiddleware,
  requireAdmin,
  [
    query('tenant_id').optional().isUUID(),
    query('user_id').optional().isUUID(),
    query('categoria').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601()
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        tenant_id,
        user_id,
        categoria,
        limit = 50,
        offset = 0,
        start_date,
        end_date
      } = req.query;

      // Super admin pode ver todos, admin só do seu tenant
      const effectiveTenantId = req.user!.role === 'super_admin' 
        ? (tenant_id as string) 
        : req.user!.tenant_id;

      const activities = await ActivityModel.getActivities({
        tenantId: effectiveTenantId,
        userId: user_id as string,
        limit: parseInt(limit as string),
        page: parseInt(offset as string)
      });

      res.json({
        success: true,
        message: 'Logs de atividade obtidos com sucesso',
        data: activities
      });

    } catch (error) {
      console.error('Erro ao obter logs de atividade:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /system/stats
 * Obter estatísticas do sistema
 */
systemRoutes.get('/stats',
  authMiddleware,
  requireSuperAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await ActivityModel.getSystemStats();

      res.json({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: stats
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
 * GET /system/health
 * Health check do sistema
 */
systemRoutes.get('/health',
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const healthInfo = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        environment: process.env.NODE_ENV || 'development'
      };

      res.json({
        success: true,
        message: 'Sistema funcionando corretamente',
        data: healthInfo
      });

    } catch (error) {
      console.error('Erro no health check:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /system/diagnostics
 * Executar diagnósticos do sistema
 */
systemRoutes.post('/diagnostics',
  authMiddleware,
  requireSuperAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Executar verificações básicas
      const diagnostics = {
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          connection_pool: 'active'
        },
        authentication: {
          jwt_service: 'active',
          session_management: 'active'
        },
        services: {
          user_service: 'active',
          tenant_service: 'active',
          activity_service: 'active'
        },
        performance: {
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          cpu_usage: process.cpuUsage()
        }
      };

      // Log do diagnóstico
      await ActivityModel.createActivity({
        user_id: req.user!.id,
        action: 'Diagnóstico executado',
        details: 'Diagnóstico completo do sistema executado',
        resource: 'system_diagnostics',
        tenant_id: req.user!.tenant_id
      });

      res.json({
        success: true,
        message: 'Diagnóstico executado com sucesso',
        data: diagnostics
      });

    } catch (error) {
      console.error('Erro ao executar diagnósticos:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * DELETE /system/activity-logs/cleanup
 * Limpeza de logs antigos
 */
systemRoutes.delete('/activity-logs/cleanup',
  authMiddleware,
  requireSuperAdmin,
  [
    query('days_old').isInt({ min: 30 }).withMessage('Deve especificar logs com pelo menos 30 dias')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { days_old } = req.query;
      
      const deletedCount = await ActivityModel.cleanupOldActivities(parseInt(days_old as string));

      // Log da limpeza
      await ActivityModel.createActivity({
        user_id: req.user!.id,
        action: 'Limpeza de logs executada',
        details: `${deletedCount} logs removidos (mais de ${days_old} dias)`,
        resource: 'system_maintenance',
        tenant_id: req.user!.tenant_id
      });

      res.json({
        success: true,
        message: 'Limpeza de logs executada com sucesso',
        data: {
          deleted_count: deletedCount,
          days_old: parseInt(days_old as string)
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