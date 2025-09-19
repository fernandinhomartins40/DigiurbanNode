// ====================================================================
// 📧 ROTAS DE EMAIL PARA TENANTS - SISTEMA ISOLADO POR TENANT
// ====================================================================
// APIs para que cada tenant gerencie seus próprios domínios,
// usuários SMTP, templates e campanhas de email
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
import {
  tenantEmailMiddleware,
  requireTenantAdmin,
  validateTenantAccess,
  applyTenantFilter,
  tenantRateLimit
} from '../middleware/tenantEmailMiddleware.js';

const router = Router();
const emailDb = new EmailDatabaseService(prisma);

// Aplicar middlewares globais para todas as rotas
router.use(authMiddleware);
router.use(tenantEmailMiddleware);

// ====================================================================
// VALIDAÇÕES
// ====================================================================

const tenantDomainValidation = [
  body('domainName').isLength({ min: 3, max: 253 }).matches(/^[a-zA-Z0-9.-]+$/).withMessage('Nome de domínio inválido'),
  body('smtpUserId').isInt().withMessage('ID do usuário SMTP deve ser um número')
];

const tenantSmtpUserValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('Senha deve ter pelo menos 8 caracteres'),
  body('name').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres')
];

const bulkEmailValidation = [
  body('templateId').isString().withMessage('Template ID é obrigatório'),
  body('recipients').isArray({ min: 1 }).withMessage('Lista de destinatários é obrigatória'),
  body('subject').isLength({ min: 1, max: 200 }).withMessage('Assunto deve ter entre 1 e 200 caracteres'),
  body('scheduledFor').optional().isISO8601().withMessage('Data de agendamento deve estar no formato ISO8601')
];

// ====================================================================
// ROTAS DE DASHBOARD
// ====================================================================

/**
 * GET /tenant/emails/dashboard
 * Dashboard principal de email do tenant
 */
router.get('/dashboard',
  PermissionService.requirePermission('view_email_system'),
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.user!.tenant_id;

      // Carregar estatísticas do tenant
      const [
        domainCount,
        verifiedDomains,
        smtpUserCount,
        todayEmails,
        monthlyEmails,
        recentEmails
      ] = await Promise.all([
        prisma.emailDomain.count(applyTenantFilter(req)),
        prisma.emailDomain.count(applyTenantFilter(req, { isVerified: true })),
        prisma.smtpUser.count(applyTenantFilter(req, { isActive: true })),
        prisma.email.count(applyTenantFilter(req, {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        })),
        prisma.email.count(applyTenantFilter(req, {
          createdAt: {
            gte: new Date(new Date().setDate(1)) // Primeiro dia do mês
          }
        })),
        prisma.email.findMany({
          ...applyTenantFilter(req),
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            domain: {
              select: { domainName: true }
            }
          }
        })
      ]);

      // Calcular taxa de bounce dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [totalEmails, bouncedEmails] = await Promise.all([
        prisma.email.count(applyTenantFilter(req, {
          createdAt: { gte: thirtyDaysAgo }
        })),
        prisma.email.count(applyTenantFilter(req, {
          createdAt: { gte: thirtyDaysAgo },
          status: 'BOUNCED'
        }))
      ]);

      const bounceRate = totalEmails > 0 ? (bouncedEmails / totalEmails) * 100 : 0;

      const dashboardStats = {
        domains: {
          total: domainCount,
          verified: verifiedDomains,
          pending: domainCount - verifiedDomains
        },
        users: {
          active: smtpUserCount
        },
        emails: {
          today: todayEmails,
          monthly: monthlyEmails,
          bounceRate: Math.round(bounceRate * 10) / 10
        },
        recent: recentEmails.map(email => ({
          id: email.id,
          subject: email.subject,
          toEmail: email.toEmail,
          status: email.status,
          domain: email.domain?.domainName,
          createdAt: email.createdAt
        }))
      };

      res.json({
        success: true,
        message: 'Dashboard carregado com sucesso',
        data: dashboardStats
      });

    } catch (error) {
      logger.error('Erro ao carregar dashboard do tenant:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS DE DOMÍNIOS
// ====================================================================

/**
 * GET /tenant/emails/domains
 * Listar domínios do tenant
 */
router.get('/domains',
  PermissionService.requirePermission('view_email_system'),
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const domains = await prisma.emailDomain.findMany({
        where: applyTenantFilter(req),
        include: {
          smtpUser: {
            select: { email: true, name: true }
          },
          dkimKeys: {
            where: { isActive: true }
          },
          _count: {
            select: { emails: true }
          }
        },
        orderBy: { createdAt: 'desc' }
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
            emailsCount: domain._count.emails,
            hasActiveDkim: domain.dkimKeys.length > 0,
            createdAt: domain.createdAt
          })),
          total: domains.length
        }
      });

    } catch (error) {
      logger.error('Erro ao listar domínios do tenant:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /tenant/emails/domains
 * Criar novo domínio para o tenant
 */
router.post('/domains',
  requireTenantAdmin,
  PermissionService.requirePermission('manage_email_system'),
  tenantRateLimit(50), // 50 criações por 15 min
  tenantDomainValidation,
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

      const { domainName, smtpUserId } = req.body;
      const tenantId = req.user!.tenant_id;

      // Verificar se domínio já existe
      const existingDomain = await prisma.emailDomain.findUnique({
        where: { domainName }
      });

      if (existingDomain) {
        res.status(400).json({
          success: false,
          error: 'Domínio já cadastrado no sistema'
        });
        return;
      }

      // Verificar se o SMTP user pertence ao tenant
      const smtpUser = await prisma.smtpUser.findFirst({
        where: {
          id: parseInt(smtpUserId),
          // Para tenant: verificar se pertence ao tenant ou não tem tenant (global)
          OR: [
            { tenant: { id: tenantId } },
            { tenantId: null }
          ]
        }
      });

      if (!smtpUser) {
        res.status(400).json({
          success: false,
          error: 'Usuário SMTP não encontrado ou não autorizado'
        });
        return;
      }

      // Criar domínio
      const domain = await emailDb.createEmailDomain({
        domainName,
        smtpUserId: parseInt(smtpUserId),
        tenantId
      });

      logger.info(`Domínio criado para tenant: ${domainName}`, {
        tenantId,
        domainId: domain.id,
        userId: req.user!.id
      });

      res.json({
        success: true,
        message: 'Domínio criado com sucesso',
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
      logger.error('Erro ao criar domínio para tenant:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS DE USUÁRIOS SMTP
// ====================================================================

/**
 * GET /tenant/emails/smtp-users
 * Listar usuários SMTP do tenant
 */
router.get('/smtp-users',
  PermissionService.requirePermission('view_email_system'),
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await prisma.smtpUser.findMany({
        where: applyTenantFilter(req),
        include: {
          user: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true
            }
          },
          _count: {
            select: { domains: true }
          }
        },
        orderBy: { createdAt: 'desc' }
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
      logger.error('Erro ao listar usuários SMTP do tenant:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /tenant/emails/smtp-users
 * Criar usuário SMTP para o tenant
 */
router.post('/smtp-users',
  requireTenantAdmin,
  PermissionService.requirePermission('manage_email_system'),
  tenantRateLimit(20), // 20 criações por 15 min
  tenantSmtpUserValidation,
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
      const tenantId = req.user!.tenant_id;

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

      // Criar usuário SMTP vinculado ao tenant
      const smtpUser = await emailDb.createSmtpUser({
        email,
        password,
        name,
        userId,
        tenantId // Vincular ao tenant
      });

      logger.info(`Usuário SMTP criado para tenant: ${email}`, {
        tenantId,
        smtpUserId: smtpUser.id,
        userId: req.user!.id
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
      logger.error('Erro ao criar usuário SMTP para tenant:', error);
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
 * GET /tenant/emails/stats
 * Estatísticas detalhadas do tenant
 */
router.get('/stats',
  PermissionService.requirePermission('view_email_system'),
  generalRateLimit,
  query('days').optional().isInt({ min: 1, max: 365 }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const tenantId = req.user!.tenant_id;

      const stats = await emailDb.getEmailStats(days, tenantId);

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
      logger.error('Erro ao obter estatísticas do tenant:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS DE ENVIO EM MASSA (FUTURO)
// ====================================================================

/**
 * POST /tenant/emails/send-bulk
 * Enviar emails em massa (implementação futura)
 */
router.post('/send-bulk',
  requireTenantAdmin,
  PermissionService.requirePermission('manage_email_system'),
  tenantRateLimit(10), // 10 campanhas por 15 min
  bulkEmailValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Implementar sistema de envio em massa
      res.status(501).json({
        success: false,
        error: 'Funcionalidade de envio em massa em desenvolvimento',
        message: 'Esta funcionalidade será implementada na próxima fase'
      });

    } catch (error) {
      logger.error('Erro no envio em massa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /tenant/emails/templates
 * Listar templates do tenant (implementação futura)
 */
router.get('/templates',
  PermissionService.requirePermission('view_email_system'),
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Implementar sistema de templates
      res.json({
        success: true,
        message: 'Templates em desenvolvimento',
        data: {
          templates: [],
          total: 0,
          note: 'Sistema de templates será implementado na próxima fase'
        }
      });

    } catch (error) {
      logger.error('Erro ao listar templates:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS DE VERIFICAÇÃO DE DOMÍNIO
// ====================================================================

/**
 * POST /tenant/emails/domains/:id/verify
 * Verificar configuração DNS de um domínio
 */
router.post('/domains/:id/verify',
  requireTenantAdmin,
  PermissionService.requirePermission('manage_email_system'),
  param('id').isString().withMessage('ID do domínio é obrigatório'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Buscar domínio do tenant
      const domain = await prisma.emailDomain.findFirst({
        where: applyTenantFilter(req, { id })
      });

      if (!domain) {
        res.status(404).json({
          success: false,
          error: 'Domínio não encontrado'
        });
        return;
      }

      // TODO: Implementar verificação DNS real
      // Por enquanto, simular verificação
      const verified = Math.random() > 0.5; // 50% de chance de sucesso

      if (verified) {
        await prisma.emailDomain.update({
          where: { id },
          data: {
            isVerified: true,
            verifiedAt: new Date()
          }
        });

        logger.info(`Domínio verificado: ${domain.domainName}`, {
          tenantId: req.user!.tenant_id,
          domainId: id
        });
      }

      res.json({
        success: true,
        message: verified ? 'Domínio verificado com sucesso' : 'Verificação falhou',
        data: {
          verified,
          domain: domain.domainName,
          note: 'Verificação DNS simulada - implementação real em desenvolvimento'
        }
      });

    } catch (error) {
      logger.error('Erro ao verificar domínio:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

export default router;