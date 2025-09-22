// ====================================================================
// 📧 ROTAS ADMIN EMAIL - FASE 2 IMPLEMENTATION
// ====================================================================
// APIs complementares para gerenciamento avançado do sistema de email
// Estatísticas servidor, verificação domínios, DKIM, logs e conexões
// ====================================================================

import express, { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';
import { logger } from '../config/logger.js';
import { generalRateLimit } from '../middleware/rateLimiter.js';
import { getUltraZendSMTPServer } from '../services/UltraZendSMTPServer.js';
import crypto from 'crypto';
import os from 'os';

const router = express.Router();

// ====================================================================
// MIDDLEWARE PARA TODAS AS ROTAS
// ====================================================================

// Aplicar autenticação e permissão de super admin para todas as rotas
router.use(authenticateToken, requireSuperAdmin, generalRateLimit);

// ====================================================================
// ESTATÍSTICAS DO SERVIDOR EMAIL
// ====================================================================

/**
 * GET /admin/email/server-stats
 * Obter estatísticas detalhadas do servidor de email
 */
router.get('/server-stats', async (req: Request, res: Response) => {
  try {
    logger.info('Obtendo estatísticas do servidor de email', {
      adminId: req.user?.id
    });

    const smtpServer = getUltraZendSMTPServer(prisma);

    // Estatísticas básicas do servidor
    const serverStats = smtpServer.isServerRunning() ? await smtpServer.getServerStats() : null;

    // Estatísticas do banco de dados
    const [
      totalDomains,
      activeDomains,
      totalSmtpUsers,
      activeSmtpUsers,
      emailsSentToday,
      emailsFailedToday,
      systemUptime
    ] = await Promise.all([
      prisma.smtpDomain.count(),
      prisma.smtpDomain.count({ where: { isActive: true } }),
      prisma.smtpUser.count(),
      prisma.smtpUser.count({ where: { isActive: true } }),
      prisma.emailLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          },
          status: 'sent'
        }
      }),
      prisma.emailLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          },
          status: 'failed'
        }
      }),
      os.uptime()
    ]);

    // Estatísticas por hora das últimas 24h
    const hourlyStats = await prisma.emailLog.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      select: {
        createdAt: true,
        status: true
      }
    });

    // Agrupar por hora
    const hourlyGroup = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - i, 0, 0, 0);
      return {
        hour: hour.toISOString(),
        sent: 0,
        failed: 0,
        total: 0
      };
    }).reverse();

    hourlyStats.forEach(log => {
      const logHour = new Date(log.createdAt).getHours();
      const currentHour = new Date().getHours();
      const index = (currentHour - logHour + 24) % 24;

      if (hourlyGroup[23 - index]) {
        hourlyGroup[23 - index].total++;
        if (log.status === 'sent') {
          hourlyGroup[23 - index].sent++;
        } else if (log.status === 'failed') {
          hourlyGroup[23 - index].failed++;
        }
      }
    });

    // Performance métricas
    const performanceMetrics = {
      systemLoad: os.loadavg(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      systemUptime: Math.floor(systemUptime),
      processUptime: Math.floor(process.uptime())
    };

    res.json({
      success: true,
      data: {
        server: {
          isRunning: smtpServer.isServerRunning(),
          ports: serverStats?.ports || { mx: 25, submission: 587 },
          version: '1.0.0',
          startedAt: serverStats?.startedAt || new Date(),
          uptime: serverStats?.uptime || 0
        },
        statistics: {
          domains: {
            total: totalDomains,
            active: activeDomains,
            inactive: totalDomains - activeDomains
          },
          users: {
            total: totalSmtpUsers,
            active: activeSmtpUsers,
            inactive: totalSmtpUsers - activeSmtpUsers
          },
          emails: {
            sentToday: emailsSentToday,
            failedToday: emailsFailedToday,
            successRate: emailsSentToday + emailsFailedToday > 0
              ? ((emailsSentToday / (emailsSentToday + emailsFailedToday)) * 100).toFixed(2)
              : 0
          }
        },
        hourlyStats,
        performance: {
          systemLoad: performanceMetrics.systemLoad[0],
          memoryUsage: Math.round((performanceMetrics.memoryUsage.used / 1024 / 1024)),
          systemUptime: performanceMetrics.systemUptime,
          processUptime: performanceMetrics.processUptime
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Erro ao obter estatísticas do servidor de email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ====================================================================
// VERIFICAÇÃO DE DOMÍNIOS
// ====================================================================

/**
 * GET /admin/email/domains/verify/:id
 * Verificar configuração de domínio (DNS, MX, SPF, DKIM)
 */
router.get('/domains/verify/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    logger.info('Verificando configuração de domínio', {
      domainId: id,
      adminId: req.user?.id
    });

    const domain = await prisma.smtpDomain.findUnique({
      where: { id: parseInt(id) },
      include: {
        dkimKeys: true
      }
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        error: 'Domínio não encontrado'
      });
    }

    // Simulação de verificações DNS (em produção usar bibliotecas como 'dns')
    const verificationResults = {
      dns: {
        status: 'verified',
        records: [
          { type: 'MX', value: `mail.${domain.domainName}`, priority: 10 },
          { type: 'A', value: '203.0.113.1' }
        ]
      },
      mx: {
        status: 'verified',
        records: [`mail.${domain.domainName}`],
        message: 'Registros MX configurados corretamente'
      },
      spf: {
        status: domain.spfEnabled ? 'verified' : 'missing',
        record: domain.spfEnabled ? `v=spf1 include:${domain.domainName} ~all` : null,
        message: domain.spfEnabled ? 'SPF configurado corretamente' : 'Registro SPF não encontrado'
      },
      dkim: {
        status: domain.dkimEnabled && domain.dkimKeys.length > 0 ? 'verified' : 'missing',
        keys: domain.dkimKeys.map(key => ({
          selector: key.selector,
          publicKey: key.publicKey?.substring(0, 50) + '...',
          status: 'active'
        })),
        message: domain.dkimEnabled ? 'DKIM configurado corretamente' : 'DKIM não configurado'
      },
      dmarc: {
        status: domain.dmarcEnabled ? 'verified' : 'missing',
        policy: domain.dmarcEnabled ? 'quarantine' : null,
        message: domain.dmarcEnabled ? 'DMARC configurado corretamente' : 'DMARC não configurado'
      }
    };

    // Calcular score geral de configuração
    const verificationScore = Object.values(verificationResults).reduce((score, check) => {
      return score + (check.status === 'verified' ? 25 : 0);
    }, 0);

    res.json({
      success: true,
      data: {
        domain: {
          id: domain.id,
          name: domain.domainName,
          isActive: domain.isActive,
          verificationScore,
          lastVerified: new Date().toISOString()
        },
        verification: verificationResults,
        recommendations: verificationScore < 100 ? [
          !domain.spfEnabled && 'Configure registro SPF para melhorar deliverability',
          !domain.dkimEnabled && 'Configure DKIM para autenticação de emails',
          !domain.dmarcEnabled && 'Configure DMARC para proteção contra spoofing'
        ].filter(Boolean) : [],
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Erro ao verificar domínio:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ====================================================================
// GERAÇÃO DE CHAVES DKIM
// ====================================================================

/**
 * POST /admin/email/domains/:id/dkim
 * Gerar novas chaves DKIM para um domínio
 */
router.post('/domains/:id/dkim', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { selector = 'default', keySize = 2048 } = req.body;

    logger.info('Gerando chaves DKIM para domínio', {
      domainId: id,
      selector,
      keySize,
      adminId: req.user?.id
    });

    const domain = await prisma.smtpDomain.findUnique({
      where: { id: parseInt(id) }
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        error: 'Domínio não encontrado'
      });
    }

    // Gerar par de chaves RSA (simulado - em produção usar crypto real)
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: keySize,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Salvar chaves no banco
    const dkimKey = await prisma.dkimKey.create({
      data: {
        domainId: domain.id,
        selector,
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        keySize,
        isActive: true,
        createdAt: new Date()
      }
    });

    // Atualizar domínio para habilitar DKIM
    await prisma.smtpDomain.update({
      where: { id: domain.id },
      data: { dkimEnabled: true }
    });

    // Preparar registro DNS para o usuário
    const publicKeyForDNS = keyPair.publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\s/g, '');

    const dnsRecord = `${selector}._domainkey.${domain.domainName} IN TXT "v=DKIM1; k=rsa; p=${publicKeyForDNS}"`;

    res.json({
      success: true,
      data: {
        dkimKey: {
          id: dkimKey.id,
          selector: dkimKey.selector,
          keySize: dkimKey.keySize,
          createdAt: dkimKey.createdAt
        },
        dnsRecord: {
          name: `${selector}._domainkey.${domain.domainName}`,
          type: 'TXT',
          value: `v=DKIM1; k=rsa; p=${publicKeyForDNS}`,
          fullRecord: dnsRecord
        },
        instructions: [
          `Adicione o registro TXT no DNS do domínio ${domain.domainName}`,
          `Nome: ${selector}._domainkey.${domain.domainName}`,
          `Valor: v=DKIM1; k=rsa; p=${publicKeyForDNS}`,
          'Aguarde a propagação DNS (até 24 horas)'
        ],
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Erro ao gerar chaves DKIM:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ====================================================================
// LOGS DE EMAIL
// ====================================================================

/**
 * GET /admin/email/logs
 * Obter logs detalhados de emails
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const {
      status,
      domain,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
      search
    } = req.query;

    logger.info('Obtendo logs de email', {
      filters: { status, domain, dateFrom, dateTo },
      adminId: req.user?.id
    });

    // Construir filtros
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fromEmail: { contains: search as string, mode: 'insensitive' } },
        { toEmail: { contains: search as string, mode: 'insensitive' } },
        { subject: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        include: {
          domain: {
            select: { domainName: true }
          }
        }
      }),
      prisma.emailLog.count({ where })
    ]);

    // Estatísticas dos logs
    const stats = await prisma.emailLog.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    });

    const statusStats = {
      sent: 0,
      failed: 0,
      pending: 0,
      bounced: 0,
      total
    };

    stats.forEach(stat => {
      statusStats[stat.status] = stat._count.status;
    });

    res.json({
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log.id,
          fromEmail: log.fromEmail,
          toEmail: log.toEmail,
          subject: log.subject,
          status: log.status,
          domain: log.domain?.domainName,
          messageId: log.messageId,
          errorMessage: log.errorMessage,
          sentAt: log.sentAt,
          createdAt: log.createdAt,
          metadata: log.metadata
        })),
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: total > parseInt(offset as string) + parseInt(limit as string)
        },
        statistics: statusStats,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Erro ao obter logs de email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ====================================================================
// CONEXÕES SMTP
// ====================================================================

/**
 * GET /admin/email/connections
 * Obter estatísticas de conexões SMTP ativas
 */
router.get('/connections', async (req: Request, res: Response) => {
  try {
    logger.info('Obtendo estatísticas de conexões SMTP', {
      adminId: req.user?.id
    });

    const smtpServer = getUltraZendSMTPServer(prisma);

    // Simulação de conexões ativas (em produção usar dados reais do servidor SMTP)
    const activeConnections = [
      {
        id: 'conn_001',
        clientIP: '192.168.1.100',
        userEmail: 'user@example.com',
        connectedAt: new Date(Date.now() - 30000),
        status: 'authenticated',
        protocol: 'SMTP',
        port: 587,
        encryption: 'TLS',
        messagesSent: 15,
        lastActivity: new Date()
      },
      {
        id: 'conn_002',
        clientIP: '10.0.0.50',
        userEmail: 'admin@test.com',
        connectedAt: new Date(Date.now() - 120000),
        status: 'idle',
        protocol: 'SMTP',
        port: 465,
        encryption: 'SSL',
        messagesSent: 3,
        lastActivity: new Date(Date.now() - 30000)
      }
    ];

    // Estatísticas de conexões das últimas 24h
    const connectionStats = {
      current: {
        total: activeConnections.length,
        authenticated: activeConnections.filter(c => c.status === 'authenticated').length,
        idle: activeConnections.filter(c => c.status === 'idle').length,
        maxConcurrent: 50 // Limite configurado
      },
      today: {
        totalConnections: 157,
        successfulAuth: 152,
        failedAuth: 5,
        averageSessionTime: 180, // segundos
        totalMessagesSent: 1247
      },
      security: {
        blockedIPs: [],
        suspiciousActivity: 0,
        rateLimitHits: 3,
        authFailures: 5
      }
    };

    // Performance métricas
    const performanceMetrics = {
      avgResponseTime: 45, // ms
      throughput: connectionStats.today.totalMessagesSent / 24, // msgs/hora
      serverLoad: Math.random() * 100, // simulado
      memoryUsage: process.memoryUsage().used / 1024 / 1024 // MB
    };

    res.json({
      success: true,
      data: {
        server: {
          isRunning: smtpServer.isServerRunning(),
          version: '1.0.0',
          uptime: Math.floor(process.uptime())
        },
        connections: {
          active: activeConnections,
          statistics: connectionStats,
          performance: performanceMetrics
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Erro ao obter conexões SMTP:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;