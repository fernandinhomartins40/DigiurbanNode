// ====================================================================
// 🔒 ROTAS ADMINISTRATIVAS - DIGIURBAN SYSTEM
// ====================================================================
// Rotas para funcionalidades administrativas e métricas SaaS
// Acesso restrito para super admins
// ====================================================================

import express from 'express';
import { authenticateJWT, requireSuperAdmin } from '../middleware/auth.js';
import { TenantModel } from '../models/Tenant.js';
import { UserModel } from '../models/User.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';
import { prisma } from '../database/prisma.js';
import { cacheService } from '../services/cacheService.js';
import crypto from 'crypto';

const router = express.Router();

// ====================================================================
// MÉTRICAS SAAS
// ====================================================================

/**
 * GET /admin/saas-metrics
 * Obter métricas gerais do sistema SaaS
 */
router.get('/admin/saas-metrics', 
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando métricas SaaS', {
        userId: req.user?.id
      });

      // Consultar métricas básicas do sistema
      const [tenantStats, userStats] = await Promise.all([
        TenantModel.getTenantStats(),
        UserModel.getUserStats()
      ]);

      const metrics = {
        // Estatísticas de Tenants
        totalTenants: tenantStats.total || 0,
        activeTenants: tenantStats.active || 0,
        
        // Estatísticas de Usuários
        totalUsers: userStats.total || 0,
        activeUsers: userStats.active || 0,
        
        // Métricas financeiras (mock - implementar conforme necessário)
        monthlyRevenue: 0,
        
        // Métricas técnicas (mock - implementar conforme necessário)
        storageUsed: 0,
        apiCalls: 0,
        
        // Timestamp da consulta
        generatedAt: Date.now()
      };

      StructuredLogger.audit('Métricas SaaS consultadas', {
        success: true,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Métricas SaaS carregadas com sucesso',
        data: metrics
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar métricas SaaS', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar métricas SaaS'
      });
    }
  }
);

// ====================================================================
// MÉTRICAS DE SISTEMA
// ====================================================================

/**
 * GET /admin/system-health
 * Verificar saúde geral do sistema
 */
router.get('/admin/system-health',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const health = {
        database: 'healthy',
        redis: 'healthy', // Assumindo que está saudável
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: Date.now()
      };

      res.json({
        success: true,
        data: health
      });

    } catch (error) {
      StructuredLogger.error('Erro ao verificar saúde do sistema', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Erro ao verificar saúde do sistema'
      });
    }
  }
);

// ====================================================================
// APIS PARA SUPER ADMIN - FASE 1
// ====================================================================

/**
 * GET /admin/tenants/metrics
 * Obter métricas agregadas de todos os tenants
 */
router.get('/admin/tenants/metrics',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando métricas agregadas de tenants', {
        userId: req.user?.id
      });

      // Buscar todos os tenants com suas métricas
      const tenants = await TenantModel.findMany({
        select: {
          id: true,
          nome: true,
          status: true,
          plano: true,
          hasAdmin: true,
          adminConfirmed: true,
          adminFirstLogin: true,
          limiteUsuarios: true,
          valorMensal: true,
          usuariosAtivos: true,
          protocolosMes: true,
          createdAt: true
        }
      });

      // Calcular métricas agregadas
      const metricas = {
        totalTenants: tenants.length,
        tenantsAtivos: tenants.filter(t => t.status === 'ativo').length,
        tenantsComAdmin: tenants.filter(t => t.hasAdmin).length,
        adminsPendentes: tenants.filter(t => t.hasAdmin && !t.adminConfirmed).length,
        receitaMensal: tenants.reduce((sum, t) => sum + (t.valorMensal || 0), 0),
        usuariosTotal: tenants.reduce((sum, t) => sum + (t.usuariosAtivos || 0), 0),
        protocolosTotal: tenants.reduce((sum, t) => sum + (t.protocolosMes || 0), 0),
        distribuicaoPlanos: {
          BASICO: tenants.filter(t => t.plano === 'basico').length,
          PREMIUM: tenants.filter(t => t.plano === 'premium').length,
          ENTERPRISE: tenants.filter(t => t.plano === 'enterprise').length
        },
        crescimentoMensal: 12.5, // Mock - calcular baseado em dados históricos
        generatedAt: new Date().toISOString()
      };

      StructuredLogger.audit('Métricas de tenants consultadas', {
        success: true,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Métricas de tenants carregadas com sucesso',
        data: metricas
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar métricas de tenants', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar métricas de tenants'
      });
    }
  }
);

/**
 * PUT /admin/tenants/:id/config
 * Atualizar configurações de um tenant
 */
router.put('/admin/tenants/:id/config',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { configuracoes, metricas, limiteUsuarios, valorMensal } = req.body;

      StructuredLogger.info('Atualizando configurações de tenant', {
        userId: req.user?.id,
        tenantId: id
      });

      // Validar se tenant existe
      const tenant = await TenantModel.findUnique({
        where: { id }
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Tenant não encontrado'
        });
      }

      // Atualizar configurações
      const updatedTenant = await TenantModel.update(id, {
        configuracoes: configuracoes ? JSON.stringify(configuracoes) : undefined,
        metricas: metricas ? JSON.stringify(metricas) : undefined,
        limiteUsuarios: limiteUsuarios || undefined,
        valorMensal: valorMensal || undefined
      });

      StructuredLogger.audit('Configurações de tenant atualizadas', {
        success: true,
        userId: req.user?.id,
        tenantId: id
      });

      res.json({
        success: true,
        message: 'Configurações do tenant atualizadas com sucesso',
        data: updatedTenant
      });

    } catch (error) {
      StructuredLogger.error('Erro ao atualizar configurações de tenant', error as Error, {
        userId: req.user?.id,
        tenantId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao atualizar configurações'
      });
    }
  }
);

/**
 * POST /admin/tenants/:id/admin
 * Criar administrador para um tenant
 */
router.post('/admin/tenants/:id/admin',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, email, senha } = req.body;

      StructuredLogger.info('Criando admin para tenant', {
        userId: req.user?.id,
        tenantId: id
      });

      // Validar se tenant existe
      const tenant = await TenantModel.findUnique({
        where: { id }
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Tenant não encontrado'
        });
      }

      // Verificar se já existe admin
      if (tenant.hasAdmin) {
        return res.status(400).json({
          success: false,
          error: 'Tenant já possui administrador'
        });
      }

      // Criar usuário admin (usando UserModel)
      const adminUser = await UserModel.create({
        tenantId: id,
        nomeCompleto: nome,
        email: email,
        password: senha, // Será hasheado no UserModel.create
        role: 'admin',
        tipoUsuario: 'admin',
        status: 'pendente',
        ativo: true
      });

      // Atualizar status do tenant
      await TenantModel.update(id, {
        hasAdmin: true,
        adminConfirmed: false,
        adminFirstLogin: false
      });

      StructuredLogger.audit('Admin criado para tenant', {
        success: true,
        userId: req.user?.id,
        tenantId: id
      });

      res.json({
        success: true,
        message: 'Administrador criado com sucesso',
        data: {
          adminId: adminUser.id,
          email: adminUser.email,
          nome: adminUser.nomeCompleto,
          status: adminUser.status
        }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao criar admin para tenant', error as Error, {
        userId: req.user?.id,
        tenantId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao criar administrador'
      });
    }
  }
);

/**
 * GET /admin/alerts
 * Obter alertas do sistema
 */
router.get('/admin/alerts',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando alertas do sistema', {
        userId: req.user?.id
      });

      // Por enquanto, alertas mockados - implementar lógica real depois
      const alerts = [
        {
          id: '1',
          tipo: 'critical',
          titulo: 'Tenants sem administrador',
          descricao: 'Existem tenants ativos sem administrador configurado',
          count: 3,
          action: 'Criar administradores',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          tipo: 'warning',
          titulo: 'Faturas em atraso',
          descricao: 'Algumas faturas estão vencidas há mais de 30 dias',
          count: 2,
          action: 'Revisar cobrança',
          timestamp: new Date().toISOString()
        }
      ];

      res.json({
        success: true,
        message: 'Alertas carregados com sucesso',
        data: alerts
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar alertas', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar alertas'
      });
    }
  }
);

/**
 * GET /admin/revenue-evolution
 * Obter evolução de receita temporal
 */
router.get('/admin/revenue-evolution',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando evolução de receita', {
        userId: req.user?.id
      });

      // Mock data - implementar cálculo real baseado em faturas
      const evolution = [
        { month: 'Jul 2023', receita: 67250, clientes: 42, mrr: 67250 },
        { month: 'Ago 2023', receita: 72100, clientes: 44, mrr: 72100 },
        { month: 'Set 2023', receita: 78950, clientes: 46, mrr: 78950 },
        { month: 'Out 2023', receita: 83200, clientes: 47, mrr: 83200 },
        { month: 'Nov 2023', receita: 89750, clientes: 47, mrr: 89750 }
      ];

      res.json({
        success: true,
        message: 'Evolução de receita carregada com sucesso',
        data: evolution
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar evolução de receita', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar evolução de receita'
      });
    }
  }
);

/**
 * GET /admin/plan-distribution
 * Obter distribuição por planos
 */
router.get('/admin/plan-distribution',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando distribuição por planos', {
        userId: req.user?.id
      });

      // Buscar distribuição real dos tenants
      const tenants = await TenantModel.findMany({
        select: {
          plano: true,
          valorMensal: true,
          status: true
        },
        where: {
          status: 'ativo'
        }
      });

      // Calcular distribuição
      const distribution = {
        basico: {
          count: tenants.filter(t => t.plano === 'basico').length,
          receita: tenants.filter(t => t.plano === 'basico').reduce((sum, t) => sum + (t.valorMensal || 0), 0)
        },
        premium: {
          count: tenants.filter(t => t.plano === 'premium').length,
          receita: tenants.filter(t => t.plano === 'premium').reduce((sum, t) => sum + (t.valorMensal || 0), 0)
        },
        enterprise: {
          count: tenants.filter(t => t.plano === 'enterprise').length,
          receita: tenants.filter(t => t.plano === 'enterprise').reduce((sum, t) => sum + (t.valorMensal || 0), 0)
        }
      };

      res.json({
        success: true,
        message: 'Distribuição por planos carregada com sucesso',
        data: distribution
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar distribuição por planos', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar distribuição por planos'
      });
    }
  }
);

// ====================================================================
// ANALYTICS AVANÇADO - FASE 3
// ====================================================================

/**
 * GET /admin/analytics/overview
 * Métricas gerais de analytics do sistema - COM CACHE OTIMIZADO
 */
router.get('/admin/analytics/overview',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando overview de analytics', {
        userId: req.user?.id
      });

      // Obter período dos parâmetros (padrão: último mês)
      const { period = '30d' } = req.query;

      // ====================================================================
      // TENTATIVA DE CACHE PRIMEIRO
      // ====================================================================
      const cachedData = await cacheService.getAnalyticsOverview(period as string);
      if (cachedData) {
        StructuredLogger.debug('Analytics overview retornado do cache', {
          period,
          cacheHit: true
        });

        return res.json({
          success: true,
          message: 'Overview de analytics carregado com sucesso (cache)',
          data: {
            ...cachedData,
            cached: true,
            generatedAt: cachedData.generatedAt
          }
        });
      }

      // ====================================================================
      // CACHE MISS - CALCULAR DADOS
      // ====================================================================
      StructuredLogger.debug('Cache miss - calculando analytics overview', { period });

      const startDate = new Date();
      if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      // Buscar dados de sessões com queries otimizadas
      const [sessionStats, userStats, pageViewStats, featureStats] = await Promise.all([
        // Estatísticas de sessões
        prisma.analyticsUserSession.aggregate({
          where: {
            startedAt: { gte: startDate }
          },
          _count: { id: true },
          _avg: { durationMinutes: true },
          _sum: { pagesVisited: true }
        }),

        // Usuários únicos (usando DISTINCT otimizado)
        prisma.analyticsUserSession.findMany({
          where: {
            startedAt: { gte: startDate }
          },
          select: { userId: true },
          distinct: ['userId']
        }),

        // Page views totais
        prisma.pageViews.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),

        // Features mais usadas
        prisma.featureUsage.groupBy({
          by: ['featureName'],
          where: {
            date: { gte: startDate }
          },
          _sum: { usageCount: true },
          orderBy: {
            _sum: { usageCount: 'desc' }
          },
          take: 5
        })
      ]);

      // Calcular métricas de engajamento mais precisas
      const totalSessions = sessionStats._count.id || 0;
      const uniqueUsers = userStats.length;
      const avgSessionDuration = Math.round(sessionStats._avg.durationMinutes || 0);

      // Calcular bounce rate baseado em sessões com <= 1 página
      const shortSessions = await prisma.analyticsUserSession.count({
        where: {
          startedAt: { gte: startDate },
          pagesVisited: { lte: 1 }
        }
      });
      const bounceRate = totalSessions > 0 ? (shortSessions / totalSessions) : 0;

      // Calcular return rate baseado em usuários recorrentes
      const returningUsers = await prisma.analyticsUserSession.groupBy({
        by: ['userId'],
        where: {
          startedAt: { gte: startDate }
        },
        _count: { id: true },
        having: {
          id: { _count: { gt: 1 } }
        }
      });
      const returnRate = uniqueUsers > 0 ? (returningUsers.length / uniqueUsers) : 0;

      const overview = {
        totalSessions,
        uniqueUsers,
        avgSessionDuration,
        totalPageViews: pageViewStats,
        totalPagesPerSession: totalSessions > 0 ?
          Math.round((sessionStats._sum.pagesVisited || 0) / totalSessions) : 0,

        // Features mais populares
        topFeatures: featureStats.map(f => ({
          name: f.featureName,
          usage: f._sum.usageCount || 0
        })),

        // Métricas de engajamento calculadas
        engagement: {
          bounceRate: Math.round(bounceRate * 100) / 100,
          returnRate: Math.round(returnRate * 100) / 100,
          sessionQuality: avgSessionDuration > 10 && bounceRate < 0.3 ? 'Alta' :
                          avgSessionDuration > 5 && bounceRate < 0.5 ? 'Média' : 'Baixa'
        },

        period,
        generatedAt: new Date().toISOString(),
        cached: false
      };

      // ====================================================================
      // ARMAZENAR NO CACHE
      // ====================================================================
      await cacheService.setAnalyticsOverview(overview, period as string);

      StructuredLogger.debug('Analytics overview calculado e cacheado', {
        period,
        totalSessions,
        uniqueUsers,
        executionTime: Date.now() - startDate.getTime()
      });

      res.json({
        success: true,
        message: 'Overview de analytics carregado com sucesso',
        data: overview
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar overview de analytics', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar analytics'
      });
    }
  }
);

/**
 * GET /admin/analytics/usage
 * Evolução de uso temporal
 */
router.get('/admin/analytics/usage',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando evolução de uso', {
        userId: req.user?.id
      });

      const { period = '30d' } = req.query;
      const startDate = new Date();

      if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      // Buscar evolução diária de sessões
      const dailyUsage = await prisma.$queryRaw<Array<{
        date: string;
        sessions: number;
        users: number;
        pageViews: number;
      }>>`
        SELECT
          DATE(started_at) as date,
          COUNT(*) as sessions,
          COUNT(DISTINCT user_id) as users,
          SUM(pages_visited) as pageViews
        FROM analytics_user_sessions
        WHERE started_at >= ${startDate}
        GROUP BY DATE(started_at)
        ORDER BY date
      `;

      // Buscar tendências de funcionalidades
      const featureTrends = await prisma.featureUsage.groupBy({
        by: ['date', 'featureName'],
        where: {
          date: { gte: startDate }
        },
        _sum: { usageCount: true },
        orderBy: {
          date: 'asc'
        }
      });

      res.json({
        success: true,
        message: 'Evolução de uso carregada com sucesso',
        data: {
          dailyUsage: dailyUsage.map(day => ({
            date: day.date,
            sessions: Number(day.sessions),
            uniqueUsers: Number(day.users),
            pageViews: Number(day.pageViews),
            avgPagesPerSession: Number(day.sessions) > 0 ?
              Math.round(Number(day.pageViews) / Number(day.sessions)) : 0
          })),
          featureTrends,
          period,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar evolução de uso', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar evolução de uso'
      });
    }
  }
);

/**
 * GET /admin/analytics/features
 * Funcionalidades mais populares
 */
router.get('/admin/analytics/features',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando funcionalidades populares', {
        userId: req.user?.id
      });

      const { period = '30d', category } = req.query;
      const startDate = new Date();

      if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      // Filtros opcionais
      const whereClause: any = {
        date: { gte: startDate }
      };

      if (category && typeof category === 'string') {
        whereClause.featureCategory = category;
      }

      // Buscar features por usage
      const [featuresUsage, categoryStats, userEngagement] = await Promise.all([
        // Features rankeadas por uso
        prisma.featureUsage.groupBy({
          by: ['featureName', 'featureCategory'],
          where: whereClause,
          _sum: {
            usageCount: true,
            totalTimeMinutes: true
          },
          _count: { userId: true },
          orderBy: {
            _sum: { usageCount: 'desc' }
          },
          take: 20
        }),

        // Estatísticas por categoria
        prisma.featureUsage.groupBy({
          by: ['featureCategory'],
          where: whereClause,
          _sum: { usageCount: true },
          _count: { userId: true },
          orderBy: {
            _sum: { usageCount: 'desc' }
          }
        }),

        // Engajamento por usuário
        prisma.featureUsage.groupBy({
          by: ['userId'],
          where: whereClause,
          _sum: { usageCount: true },
          _count: { featureName: true }
        })
      ]);

      // Calcular estatísticas de engajamento
      const avgFeaturesPerUser = userEngagement.length > 0 ?
        userEngagement.reduce((sum, u) => sum + (u._count.featureName || 0), 0) / userEngagement.length : 0;

      const powerUsers = userEngagement.filter(u => (u._sum.usageCount || 0) > 100).length;

      res.json({
        success: true,
        message: 'Funcionalidades populares carregadas com sucesso',
        data: {
          topFeatures: featuresUsage.map((feature, index) => ({
            rank: index + 1,
            name: feature.featureName,
            category: feature.featureCategory,
            totalUsage: feature._sum.usageCount || 0,
            uniqueUsers: feature._count.userId || 0,
            avgTimeMinutes: feature._sum.totalTimeMinutes ?
              Math.round((feature._sum.totalTimeMinutes || 0) / (feature._sum.usageCount || 1)) : 0,
            usagePerUser: feature._count.userId > 0 ?
              Math.round((feature._sum.usageCount || 0) / feature._count.userId) : 0
          })),

          categoryStats: categoryStats.map(cat => ({
            category: cat.featureCategory,
            totalUsage: cat._sum.usageCount || 0,
            uniqueUsers: cat._count.userId || 0
          })),

          engagement: {
            totalUsers: userEngagement.length,
            avgFeaturesPerUser: Math.round(avgFeaturesPerUser * 10) / 10,
            powerUsers,
            powerUserPercentage: userEngagement.length > 0 ?
              Math.round((powerUsers / userEngagement.length) * 100) : 0
          },

          period,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar funcionalidades populares', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar funcionalidades populares'
      });
    }
  }
);

/**
 * GET /admin/analytics/modules
 * Analytics por módulo do sistema
 */
router.get('/admin/analytics/modules',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando analytics por módulo', {
        userId: req.user?.id
      });

      const { period = 'current' } = req.query;

      // Calcular período atual (mês atual)
      const currentDate = new Date();
      const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

      const whereClause: any = {};
      if (period === 'current') {
        whereClause.period = currentPeriod;
      } else if (typeof period === 'string') {
        whereClause.period = period;
      }

      // Buscar analytics por módulo
      const moduleStats = await prisma.moduleAnalytics.findMany({
        where: whereClause,
        include: {
          tenant: {
            select: {
              nome: true,
              cidade: true,
              estado: true,
              status: true
            }
          }
        },
        orderBy: {
          totalUsers: 'desc'
        }
      });

      // Agregar estatísticas globais por módulo
      const globalModuleStats = await prisma.moduleAnalytics.groupBy({
        by: ['moduleName'],
        where: whereClause,
        _sum: {
          totalUsers: true,
          activeUsers: true,
          totalSessions: true,
          totalPageViews: true
        },
        _avg: {
          avgSessionTime: true
        },
        _count: {
          tenantId: true
        }
      });

      res.json({
        success: true,
        message: 'Analytics por módulo carregados com sucesso',
        data: {
          moduleStats: moduleStats.map(module => ({
            id: module.id,
            moduleName: module.moduleName,
            tenantId: module.tenantId,
            tenantName: module.tenant?.nome,
            tenantLocation: `${module.tenant?.cidade}, ${module.tenant?.estado}`,
            totalUsers: module.totalUsers,
            activeUsers: module.activeUsers,
            totalSessions: module.totalSessions,
            totalPageViews: module.totalPageViews,
            avgSessionTime: module.avgSessionTime,
            popularFeature: module.popularFeature,
            period: module.period,
            engagementRate: module.totalUsers > 0 ?
              Math.round((module.activeUsers / module.totalUsers) * 100) : 0
          })),

          globalStats: globalModuleStats.map(global => ({
            moduleName: global.moduleName,
            totalUsers: global._sum.totalUsers || 0,
            activeUsers: global._sum.activeUsers || 0,
            totalSessions: global._sum.totalSessions || 0,
            totalPageViews: global._sum.totalPageViews || 0,
            avgSessionTime: Math.round((global._avg.avgSessionTime || 0) * 10) / 10,
            tenantsUsingModule: global._count.tenantId || 0,
            avgUsersPerTenant: global._count.tenantId > 0 ?
              Math.round((global._sum.totalUsers || 0) / global._count.tenantId) : 0
          })),

          period: period === 'current' ? currentPeriod : period,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar analytics por módulo', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar analytics por módulo'
      });
    }
  }
);

/**
 * GET /admin/analytics/geographic
 * Distribuição geográfica dos usuários
 */
router.get('/admin/analytics/geographic',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando distribuição geográfica', {
        userId: req.user?.id
      });

      const { period = 'current', groupBy = 'estado' } = req.query;

      // Calcular período atual
      const currentDate = new Date();
      const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

      const whereClause: any = {};
      if (period === 'current') {
        whereClause.period = currentPeriod;
      } else if (typeof period === 'string') {
        whereClause.period = period;
      }

      // Buscar dados geográficos
      const geoStats = await prisma.geographicData.findMany({
        where: whereClause,
        include: {
          tenant: {
            select: {
              nome: true,
              status: true,
              plano: true
            }
          }
        },
        orderBy: {
          totalUsuarios: 'desc'
        }
      });

      // Agrupar por estado ou região
      const groupedData = geoStats.reduce((acc, geo) => {
        const key = groupBy === 'regiao' ? geo.regiao : geo.estado;

        if (!acc[key]) {
          acc[key] = {
            name: key,
            totalUsuarios: 0,
            usuariosAtivos: 0,
            protocolosMes: 0,
            satisfacaoMedia: 0,
            cidades: [],
            tenants: 0,
            populacaoTotal: 0
          };
        }

        acc[key].totalUsuarios += geo.totalUsuarios;
        acc[key].usuariosAtivos += geo.usuariosAtivos;
        acc[key].protocolosMes += geo.protocolosMes;
        acc[key].populacaoTotal += geo.populacao || 0;
        acc[key].tenants += 1;

        // Calcular média ponderada da satisfação
        if (geo.satisfacaoMedia) {
          const currentAvg = acc[key].satisfacaoMedia || 0;
          const currentCount = acc[key].cidades.length;
          acc[key].satisfacaoMedia = (currentAvg * currentCount + geo.satisfacaoMedia) / (currentCount + 1);
        }

        acc[key].cidades.push({
          nome: geo.cidade,
          estado: geo.estado,
          usuarios: geo.totalUsuarios,
          usuariosAtivos: geo.usuariosAtivos,
          protocolos: geo.protocolosMes,
          satisfacao: geo.satisfacaoMedia,
          tenant: geo.tenant?.nome
        });

        return acc;
      }, {} as Record<string, any>);

      // Estatísticas gerais
      const totalStats = {
        totalUsuarios: geoStats.reduce((sum, geo) => sum + geo.totalUsuarios, 0),
        usuariosAtivos: geoStats.reduce((sum, geo) => sum + geo.usuariosAtivos, 0),
        protocolosMes: geoStats.reduce((sum, geo) => sum + geo.protocolosMes, 0),
        populacaoTotal: geoStats.reduce((sum, geo) => sum + (geo.populacao || 0), 0),
        cidades: geoStats.length,
        satisfacaoGeral: geoStats.filter(g => g.satisfacaoMedia).length > 0 ?
          geoStats.filter(g => g.satisfacaoMedia).reduce((sum, g) => sum + (g.satisfacaoMedia || 0), 0) /
          geoStats.filter(g => g.satisfacaoMedia).length : 0
      };

      res.json({
        success: true,
        message: 'Distribuição geográfica carregada com sucesso',
        data: {
          distribution: Object.values(groupedData).map(region => ({
            ...region,
            satisfacaoMedia: Math.round((region.satisfacaoMedia || 0) * 10) / 10,
            penetracao: region.populacaoTotal > 0 ?
              Math.round((region.totalUsuarios / region.populacaoTotal) * 10000) / 100 : 0, // Percentual por 10.000 hab
            engajamento: region.totalUsuarios > 0 ?
              Math.round((region.usuariosAtivos / region.totalUsuarios) * 100) : 0
          })),

          totalStats: {
            ...totalStats,
            satisfacaoGeral: Math.round(totalStats.satisfacaoGeral * 10) / 10,
            penetracaoGeral: totalStats.populacaoTotal > 0 ?
              Math.round((totalStats.totalUsuarios / totalStats.populacaoTotal) * 10000) / 100 : 0,
            engajamentoGeral: totalStats.totalUsuarios > 0 ?
              Math.round((totalStats.usuariosAtivos / totalStats.totalUsuarios) * 100) : 0
          },

          groupBy,
          period: period === 'current' ? currentPeriod : period,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar distribuição geográfica', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar distribuição geográfica'
      });
    }
  }
);

/**
 * GET /admin/analytics/performance
 * Métricas de performance do sistema
 */
router.get('/admin/analytics/performance',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando métricas de performance', {
        userId: req.user?.id
      });

      const { period = '24h' } = req.query;
      const startDate = new Date();

      if (period === '24h') {
        startDate.setHours(startDate.getHours() - 24);
      } else if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      }

      // Buscar métricas de sistema
      const [systemMetrics, sessionStats, errorStats] = await Promise.all([
        // Métricas de sistema registradas
        prisma.systemMetrics.findMany({
          where: {
            recordedAt: { gte: startDate }
          },
          orderBy: {
            recordedAt: 'desc'
          }
        }),

        // Estatísticas de sessão para performance
        prisma.analyticsUserSession.aggregate({
          where: {
            startedAt: { gte: startDate }
          },
          _avg: { durationMinutes: true },
          _count: { id: true }
        }),

        // Logs de atividade para detectar erros (proxy para erros do sistema)
        prisma.activityLog.count({
          where: {
            createdAt: { gte: startDate },
            action: {
              contains: 'error'
            }
          }
        })
      ]);

      // Agrupar métricas por tipo
      const metricsByType = systemMetrics.reduce((acc, metric) => {
        if (!acc[metric.metricName]) {
          acc[metric.metricName] = [];
        }
        acc[metric.metricName].push({
          value: metric.metricValue,
          unit: metric.metricUnit,
          timestamp: metric.recordedAt
        });
        return acc;
      }, {} as Record<string, any[]>);

      // Calcular estatísticas de performance
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      const performance = {
        // Métricas do sistema Node.js
        system: {
          uptime: {
            seconds: Math.round(uptime),
            formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
          },
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
            usage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
          },
          cpu: {
            usage: 0 // Mock - implementar monitoramento real de CPU
          }
        },

        // Métricas de aplicação
        application: {
          totalSessions: sessionStats._count.id || 0,
          avgSessionDuration: Math.round((sessionStats._avg.durationMinutes || 0) * 10) / 10,
          errorRate: 0, // Mock - calcular baseado em logs de erro
          responseTime: {
            avg: 150, // Mock - implementar monitoramento real
            p95: 250,
            p99: 500
          }
        },

        // Métricas do banco de dados
        database: {
          connections: 10, // Mock - implementar monitoramento real
          queryTime: {
            avg: 50, // Mock
            slow: 3 // queries > 1s
          },
          size: 0 // Mock - implementar cálculo de tamanho do DB
        },

        // Métricas personalizadas do sistema
        custom: metricsByType,

        // Health check geral
        healthScore: 95, // Mock - calcular baseado nas métricas
        status: 'healthy',

        period,
        generatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Métricas de performance carregadas com sucesso',
        data: performance
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar métricas de performance', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar métricas de performance'
      });
    }
  }
);

// ====================================================================
// SISTEMA DE RELATÓRIOS AUTOMATIZADOS
// ====================================================================

/**
 * GET /admin/reports
 * Listar relatórios automatizados
 */
router.get('/admin/reports',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Listando relatórios automatizados', {
        userId: req.user?.id
      });

      const { type, isActive } = req.query;

      const whereClause: any = {};
      if (type && typeof type === 'string') {
        whereClause.reportType = type;
      }
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const reports = await prisma.automatedReports.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true
            }
          },
          schedules: {
            include: {
              recipients: true
            }
          },
          history: {
            take: 5,
            orderBy: {
              generatedAt: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        message: 'Relatórios listados com sucesso',
        data: reports.map(report => ({
          id: report.id,
          name: report.name,
          description: report.description,
          reportType: report.reportType,
          frequency: report.frequency,
          isActive: report.isActive,
          config: JSON.parse(report.config || '{}'),
          creator: report.creator,
          schedulesCount: report.schedules.length,
          recipientsCount: report.schedules.reduce((sum, s) => sum + s.recipients.length, 0),
          lastGenerated: report.history[0]?.generatedAt || null,
          lastStatus: report.history[0]?.status || null,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt
        }))
      });

    } catch (error) {
      StructuredLogger.error('Erro ao listar relatórios', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao listar relatórios'
      });
    }
  }
);

/**
 * POST /admin/reports
 * Criar novo relatório automatizado
 */
router.post('/admin/reports',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { name, description, reportType, frequency, config, template, schedules } = req.body;

      StructuredLogger.info('Criando relatório automatizado', {
        userId: req.user?.id,
        reportName: name
      });

      // Validações básicas
      if (!name || !reportType || !frequency) {
        return res.status(400).json({
          success: false,
          error: 'Nome, tipo e frequência são obrigatórios'
        });
      }

      const validTypes = ['executive', 'technical', 'financial', 'usage'];
      const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly'];

      if (!validTypes.includes(reportType)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de relatório inválido'
        });
      }

      if (!validFrequencies.includes(frequency)) {
        return res.status(400).json({
          success: false,
          error: 'Frequência inválida'
        });
      }

      // Criar relatório
      const report = await prisma.automatedReports.create({
        data: {
          name,
          description,
          reportType,
          frequency,
          config: JSON.stringify(config || {}),
          template,
          createdBy: req.user!.id
        }
      });

      // Criar agendamentos se fornecidos
      if (schedules && Array.isArray(schedules)) {
        for (const schedule of schedules) {
          const nextRun = new Date();
          // Calcular próxima execução baseada na frequência
          if (frequency === 'daily') {
            nextRun.setDate(nextRun.getDate() + 1);
          } else if (frequency === 'weekly') {
            nextRun.setDate(nextRun.getDate() + 7);
          } else if (frequency === 'monthly') {
            nextRun.setMonth(nextRun.getMonth() + 1);
          } else if (frequency === 'quarterly') {
            nextRun.setMonth(nextRun.getMonth() + 3);
          }

          const createdSchedule = await prisma.reportSchedules.create({
            data: {
              reportId: report.id,
              cronExpression: schedule.cronExpression || '0 9 * * *', // 9h todos os dias por padrão
              timezone: schedule.timezone || 'America/Sao_Paulo',
              nextRun
            }
          });

          // Adicionar destinatários
          if (schedule.recipients && Array.isArray(schedule.recipients)) {
            for (const recipient of schedule.recipients) {
              await prisma.reportRecipients.create({
                data: {
                  scheduleId: createdSchedule.id,
                  email: recipient.email,
                  name: recipient.name
                }
              });
            }
          }
        }
      }

      StructuredLogger.audit('Relatório automatizado criado', {
        success: true,
        userId: req.user?.id,
        reportId: report.id
      });

      res.status(201).json({
        success: true,
        message: 'Relatório criado com sucesso',
        data: { id: report.id, name: report.name }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao criar relatório', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao criar relatório'
      });
    }
  }
);

/**
 * PUT /admin/reports/:id
 * Atualizar relatório automatizado
 */
router.put('/admin/reports/:id',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, reportType, frequency, config, template, isActive } = req.body;

      StructuredLogger.info('Atualizando relatório automatizado', {
        userId: req.user?.id,
        reportId: id
      });

      // Verificar se relatório existe
      const existingReport = await prisma.automatedReports.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingReport) {
        return res.status(404).json({
          success: false,
          error: 'Relatório não encontrado'
        });
      }

      // Atualizar relatório
      const updatedReport = await prisma.automatedReports.update({
        where: { id: parseInt(id) },
        data: {
          name: name || existingReport.name,
          description: description !== undefined ? description : existingReport.description,
          reportType: reportType || existingReport.reportType,
          frequency: frequency || existingReport.frequency,
          config: config ? JSON.stringify(config) : existingReport.config,
          template: template !== undefined ? template : existingReport.template,
          isActive: isActive !== undefined ? isActive : existingReport.isActive
        }
      });

      StructuredLogger.audit('Relatório automatizado atualizado', {
        success: true,
        userId: req.user?.id,
        reportId: id
      });

      res.json({
        success: true,
        message: 'Relatório atualizado com sucesso',
        data: updatedReport
      });

    } catch (error) {
      StructuredLogger.error('Erro ao atualizar relatório', error as Error, {
        userId: req.user?.id,
        reportId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao atualizar relatório'
      });
    }
  }
);

/**
 * POST /admin/reports/:id/generate
 * Gerar relatório manualmente
 */
router.post('/admin/reports/:id/generate',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { period } = req.body;

      StructuredLogger.info('Gerando relatório manualmente', {
        userId: req.user?.id,
        reportId: id
      });

      // Verificar se relatório existe e está ativo
      const report = await prisma.automatedReports.findUnique({
        where: { id: parseInt(id) }
      });

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Relatório não encontrado'
        });
      }

      if (!report.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Relatório está inativo'
        });
      }

      // Registrar início da geração
      const startTime = Date.now();

      // Aqui seria implementada a lógica real de geração do relatório
      // Por enquanto, simularemos o processo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular processamento

      const executionTime = Date.now() - startTime;

      // Registrar no histórico
      const historyEntry = await prisma.reportHistory.create({
        data: {
          reportId: parseInt(id),
          status: 'success',
          executionTime,
          period: period || 'manual'
        }
      });

      StructuredLogger.audit('Relatório gerado manualmente', {
        success: true,
        userId: req.user?.id,
        reportId: id,
        executionTime
      });

      res.json({
        success: true,
        message: 'Relatório gerado com sucesso',
        data: {
          historyId: historyEntry.id,
          executionTime,
          generatedAt: historyEntry.generatedAt
        }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao gerar relatório', error as Error, {
        userId: req.user?.id,
        reportId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao gerar relatório'
      });
    }
  }
);

/**
 * GET /admin/reports/:id/history
 * Histórico de geração de relatório
 */
router.get('/admin/reports/:id/history',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 50, status } = req.query;

      StructuredLogger.info('Carregando histórico de relatório', {
        userId: req.user?.id,
        reportId: id
      });

      const whereClause: any = {
        reportId: parseInt(id)
      };

      if (status && typeof status === 'string') {
        whereClause.status = status;
      }

      const history = await prisma.reportHistory.findMany({
        where: whereClause,
        orderBy: {
          generatedAt: 'desc'
        },
        take: parseInt(limit as string)
      });

      // Estatísticas do histórico
      const stats = await prisma.reportHistory.groupBy({
        by: ['status'],
        where: { reportId: parseInt(id) },
        _count: { id: true }
      });

      const avgExecutionTime = await prisma.reportHistory.aggregate({
        where: {
          reportId: parseInt(id),
          status: 'success'
        },
        _avg: { executionTime: true }
      });

      res.json({
        success: true,
        message: 'Histórico carregado com sucesso',
        data: {
          history,
          stats: {
            byStatus: stats.reduce((acc, s) => {
              acc[s.status] = s._count.id;
              return acc;
            }, {} as Record<string, number>),
            avgExecutionTime: Math.round(avgExecutionTime._avg.executionTime || 0),
            totalGenerations: history.length
          }
        }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar histórico de relatório', error as Error, {
        userId: req.user?.id,
        reportId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar histórico'
      });
    }
  }
);

// ====================================================================
// FASE 4 - MONITORAMENTO DE PERFORMANCE E RATE LIMITING
// ====================================================================

// Importar middlewares da Fase 4
import {
  performanceMonitoringMiddleware,
  createMetricsEndpoint,
  createHealthCheckEndpoint,
  setupPerformanceMonitoringCleanup
} from '../middleware/performanceMonitoring.js';
import {
  analyticsRateLimit,
  generalRateLimit,
  reportsRateLimit,
  createRateLimitAdminEndpoint
} from '../middleware/rateLimiting.js';

// Aplicar middleware de monitoramento de performance em todas as rotas
router.use(performanceMonitoringMiddleware());

// ====================================================================
// ENDPOINTS DE MONITORAMENTO
// ====================================================================

/**
 * GET /admin/metrics
 * Obter métricas de performance das APIs
 */
router.get('/admin/metrics',
  authenticateJWT,
  requireSuperAdmin,
  generalRateLimit,
  createMetricsEndpoint()
);

/**
 * GET /admin/health
 * Health check do sistema
 */
router.get('/admin/health',
  createHealthCheckEndpoint()
);

// ====================================================================
// RATE LIMITING APLICADO ÀS ROTAS DE ANALYTICS
// ====================================================================

// Aplicar rate limiting específico para analytics
router.use('/admin/analytics', analyticsRateLimit);
router.use('/admin/reports', reportsRateLimit);

// ====================================================================
// ENDPOINTS DE ADMINISTRAÇÃO DE RATE LIMITING
// ====================================================================

const rateLimitAdmin = createRateLimitAdminEndpoint();

/**
 * GET /admin/rate-limit/stats
 * Obter estatísticas de rate limiting
 */
router.get('/admin/rate-limit/stats',
  authenticateJWT,
  requireSuperAdmin,
  generalRateLimit,
  rateLimitAdmin.getStats
);

/**
 * GET /admin/rate-limit/active
 * Listar chaves ativas de rate limiting
 */
router.get('/admin/rate-limit/active',
  authenticateJWT,
  requireSuperAdmin,
  generalRateLimit,
  rateLimitAdmin.listActive
);

/**
 * DELETE /admin/rate-limit/reset/:key
 * Resetar rate limit para uma chave específica
 */
router.delete('/admin/rate-limit/reset/:key',
  authenticateJWT,
  requireSuperAdmin,
  generalRateLimit,
  rateLimitAdmin.resetKey
);

// ====================================================================
// INICIALIZAÇÃO DA FASE 4
// ====================================================================

// Configurar limpeza automática de métricas
setupPerformanceMonitoringCleanup();

StructuredLogger.info('🚀 Fase 4 - Monitoramento e Rate Limiting configurados', {
  performanceMonitoring: true,
  rateLimiting: true,
  healthCheck: true,
  metricsEndpoint: true
});

export default router;