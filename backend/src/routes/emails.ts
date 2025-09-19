// ====================================================================
// 📧 ROTAS DE EMAIL - ULTRANZEND + DIGIURBAN INTEGRATION
// ====================================================================
// APIs para gerenciamento do sistema de email integrado
// Controle de domínios, usuários SMTP, estatísticas e monitoramento
// ====================================================================

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { PermissionService } from '../services/PermissionService.js';
import { generalRateLimit } from '../middleware/rateLimiter.js';
import { EmailDatabaseService } from '../services/EmailDatabaseService.js';
import { getUltraZendSMTPServer } from '../services/UltraZendSMTPServer.js';
import { prisma } from '../database/prisma.js';
import { body, query, param, validationResult } from '../utils/validators.js';
import { logger } from '../config/logger.js';
import crypto from 'crypto';

const router = Router();
const emailDb = new EmailDatabaseService(prisma);

// ====================================================================
// VALIDAÇÕES
// ====================================================================

const domainValidation = [
  body('domainName').isLength({ min: 3, max: 253 }).matches(/^[a-zA-Z0-9.-]+$/).withMessage('Nome de domínio inválido'),
  body('smtpUserId').isInt().withMessage('ID do usuário SMTP deve ser um número'),
  body('tenantId').optional().isUUID().withMessage('Tenant ID deve ser um UUID válido')
];

const smtpUserValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('Senha deve ter pelo menos 8 caracteres'),
  body('name').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('userId').optional().isUUID().withMessage('User ID deve ser um UUID válido')
];

// ====================================================================
// ROTAS DE USUÁRIOS SMTP
// ====================================================================

/**
 * POST /emails/smtp-users
 * Criar usuário SMTP
 */
router.post('/smtp-users',
  authMiddleware,
  PermissionService.requirePermission('manage_email_system'),
  generalRateLimit,
  smtpUserValidation,
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

      const { email, password, name, userId } = req.body;

      // Verificar se email já existe
      const existingUser = await prisma.smtpUser.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'Email já cadastrado como usuário SMTP'
        });
        return;
      }

      // Criar usuário SMTP
      const smtpUser = await emailDb.createSmtpUser({
        email,
        password,
        name,
        userId
      });

      res.json({
        success: true,
        message: 'Usuário SMTP criado com sucesso',
        data: {
          id: smtpUser.id,
          email: smtpUser.email,
          name: smtpUser.name,
          isActive: smtpUser.isActive
        }
      });

    } catch (error) {
      logger.error('Erro ao criar usuário SMTP:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /emails/smtp-users
 * Listar usuários SMTP
 */
router.get('/smtp-users',
  authMiddleware,
  PermissionService.requirePermission('view_email_system'),
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await prisma.smtpUser.findMany({
        include: {
          user: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true
            }
          },
          _count: {
            select: {
              domains: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        message: 'Usuários SMTP encontrados',
        data: {
          users: users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            isActive: user.isActive,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
            linkedUser: user.user,
            domainsCount: user._count.domains,
            createdAt: user.createdAt
          })),
          total: users.length
        }
      });

    } catch (error) {
      logger.error('Erro ao listar usuários SMTP:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS DE DOMÍNIOS DE EMAIL
// ====================================================================

/**
 * POST /emails/domains
 * Adicionar domínio de email
 */
router.post('/domains',
  authMiddleware,
  PermissionService.requirePermission('manage_email_system'),
  generalRateLimit,
  domainValidation,
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

      const { domainName, smtpUserId, tenantId } = req.body;

      // Verificar se domínio já existe
      const existingDomain = await prisma.emailDomain.findUnique({
        where: { domainName }
      });

      if (existingDomain) {
        res.status(400).json({
          success: false,
          error: 'Domínio já cadastrado'
        });
        return;
      }

      // Criar domínio
      const domain = await emailDb.createEmailDomain({
        domainName,
        smtpUserId,
        tenantId
      });

      res.json({
        success: true,
        message: 'Domínio de email criado com sucesso',
        data: {
          id: domain.id,
          domainName: domain.domainName,
          verificationToken: domain.verificationToken,
          isVerified: domain.isVerified,
          dkimEnabled: domain.dkimEnabled,
          spfEnabled: domain.spfEnabled
        }
      });

    } catch (error) {
      logger.error('Erro ao criar domínio:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /emails/domains
 * Listar domínios de email
 */
router.get('/domains',
  authMiddleware,
  PermissionService.requirePermission('view_email_system'),
  generalRateLimit,
  query('tenant_id').optional().isUUID(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenant_id } = req.query;

      const whereClause: any = {};

      // Filtrar por tenant se especificado
      if (tenant_id) {
        whereClause.tenantId = tenant_id as string;
      }

      // Se não for super_admin, filtrar pelo tenant do usuário
      if (req.user!.role !== 'super_admin' && !tenant_id) {
        whereClause.tenantId = req.user!.tenant_id;
      }

      const domains = await prisma.emailDomain.findMany({
        where: whereClause,
        include: {
          smtpUser: {
            select: {
              email: true,
              name: true
            }
          },
          tenant: {
            select: {
              nome: true,
              tenantCode: true
            }
          },
          dkimKeys: {
            where: { isActive: true }
          },
          _count: {
            select: {
              emails: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        message: 'Domínios encontrados',
        data: {
          domains: domains.map(domain => ({
            id: domain.id,
            domainName: domain.domainName,
            isVerified: domain.isVerified,
            verifiedAt: domain.verifiedAt,
            dkimEnabled: domain.dkimEnabled,
            spfEnabled: domain.spfEnabled,
            smtpUser: domain.smtpUser,
            tenant: domain.tenant,
            emailsCount: domain._count.emails,
            hasActiveDkim: domain.dkimKeys.length > 0,
            createdAt: domain.createdAt
          })),
          total: domains.length
        }
      });

    } catch (error) {
      logger.error('Erro ao listar domínios:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS DE ESTATÍSTICAS
// ====================================================================

/**
 * GET /emails/stats
 * Obter estatísticas de email
 */
router.get('/stats',
  authMiddleware,
  PermissionService.requirePermission('view_email_system'),
  generalRateLimit,
  query('days').optional().isInt({ min: 1, max: 365 }),
  query('tenant_id').optional().isUUID(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const tenantId = req.query.tenant_id as string ||
        (req.user!.role !== 'super_admin' ? req.user!.tenant_id : undefined);

      const stats = await emailDb.getEmailStats(days, tenantId);

      res.json({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: stats
      });

    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /emails/server-stats
 * Obter estatísticas do servidor SMTP
 */
router.get('/server-stats',
  authMiddleware,
  PermissionService.requirePermission('view_email_system'),
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const smtpServer = getUltraZendSMTPServer(prisma);
      const stats = await smtpServer.getServerStats();

      res.json({
        success: true,
        message: 'Estatísticas do servidor obtidas',
        data: stats
      });

    } catch (error) {
      logger.error('Erro ao obter estatísticas do servidor:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS DE MONITORAMENTO
// ====================================================================

/**
 * GET /emails/health
 * Health check do sistema de email
 */
router.get('/health',
  authMiddleware,
  PermissionService.requirePermission('view_email_system'),
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const smtpServer = getUltraZendSMTPServer(prisma);

      const health = {
        smtpServer: {
          running: smtpServer.isServerRunning(),
          stats: await smtpServer.getServerStats()
        },
        database: {
          connected: true // Se chegou até aqui, está conectado
        },
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Health check concluído',
        data: health
      });

    } catch (error) {
      logger.error('Erro no health check:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /emails/connections
 * Listar conexões SMTP recentes
 */
router.get('/connections',
  authMiddleware,
  PermissionService.requirePermission('view_email_system'),
  generalRateLimit,
  query('limit').optional().isInt({ min: 1, max: 100 }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const connections = await prisma.smtpConnection.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      res.json({
        success: true,
        message: 'Conexões encontradas',
        data: {
          connections: connections.map(conn => ({
            id: conn.id,
            remoteAddress: conn.remoteAddress,
            hostname: conn.hostname,
            serverType: conn.serverType,
            status: conn.status,
            rejectReason: conn.rejectReason,
            createdAt: conn.createdAt
          })),
          total: connections.length
        }
      });

    } catch (error) {
      logger.error('Erro ao listar conexões:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

export default router;