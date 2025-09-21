// ====================================================================
// 🧪 TESTES UNITÁRIOS - ANALYTICS APIS
// ====================================================================
// Testes unitários para as APIs de analytics implementadas na Fase 3/4
// Validação de lógica de negócio e funções críticas do sistema de analytics
// ====================================================================

import { describe, test, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../../app.js';
import { UserModel } from '../../models/User.js';
import { TenantModel } from '../../models/Tenant.js';
import { AuthService } from '../../services/AuthService.js';
import { OptimizedQueries, createOptimizedQueries } from '../../services/optimizedQueries.js';
import { cacheService } from '../../services/cacheService.js';

describe('Analytics APIs Unit Tests', () => {
  let prisma: PrismaClient;
  let optimizedQueries: OptimizedQueries;
  let testTenantId: string;
  let superAdminUserId: string;
  let adminUserId: string;
  let regularUserId: string;
  let superAdminToken: string;
  let adminToken: string;
  let regularUserToken: string;

  // ================================================================
  // CONFIGURAÇÃO DOS TESTES
  // ================================================================

  beforeAll(async () => {
    prisma = new PrismaClient();
    optimizedQueries = createOptimizedQueries(prisma);

    // Criar tenant de teste
    const tenant = await TenantModel.create({
      nome: 'Tenant Analytics Teste',
      email: 'analytics@teste.com',
      plano: 'ENTERPRISE',
      status: 'ATIVO',
      cidade: 'São Paulo',
      estado: 'SP',
      regiao: 'Sudeste'
    });
    testTenantId = tenant.id;

    // Criar usuário super admin
    const superAdmin = await UserModel.create({
      nome_completo: 'Super Admin Analytics',
      email: 'superadmin.analytics@teste.com',
      password: 'SuperAdmin123!',
      tenant_id: testTenantId,
      role: 'super_admin',
      ativo: true
    });
    superAdminUserId = superAdmin.id;

    // Criar usuário admin
    const admin = await UserModel.create({
      nome_completo: 'Admin Analytics',
      email: 'admin.analytics@teste.com',
      password: 'Admin123!',
      tenant_id: testTenantId,
      role: 'admin',
      ativo: true
    });
    adminUserId = admin.id;

    // Criar usuário regular
    const regularUser = await UserModel.create({
      nome_completo: 'User Analytics',
      email: 'user.analytics@teste.com',
      password: 'User123!',
      tenant_id: testTenantId,
      role: 'user',
      ativo: true
    });
    regularUserId = regularUser.id;

    // Obter tokens de autenticação
    const superAdminLogin = await AuthService.login({
      email: 'superadmin.analytics@teste.com',
      password: 'SuperAdmin123!',
      ipAddress: '127.0.0.1'
    });
    superAdminToken = superAdminLogin.tokens.accessToken;

    const adminLogin = await AuthService.login({
      email: 'admin.analytics@teste.com',
      password: 'Admin123!',
      ipAddress: '127.0.0.1'
    });
    adminToken = adminLogin.tokens.accessToken;

    const regularLogin = await AuthService.login({
      email: 'user.analytics@teste.com',
      password: 'User123!',
      ipAddress: '127.0.0.1'
    });
    regularUserToken = regularLogin.tokens.accessToken;

    // Criar dados de teste para analytics
    await seedAnalyticsData();
  });

  beforeEach(async () => {
    // Limpar cache antes de cada teste
    await cacheService.clear();
  });

  afterAll(async () => {
    // Limpeza após testes
    await cleanupAnalyticsData();
    if (regularUserId) await UserModel.delete(regularUserId);
    if (adminUserId) await UserModel.delete(adminUserId);
    if (superAdminUserId) await UserModel.delete(superAdminUserId);
    if (testTenantId) await TenantModel.delete(testTenantId);
    await prisma.$disconnect();
  });

  // ================================================================
  // FUNÇÕES AUXILIARES
  // ================================================================

  async function seedAnalyticsData() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Criar sessões de usuário
    await prisma.analyticsUserSessions.createMany({
      data: [
        {
          id: 'test-session-1',
          userId: regularUserId,
          tenantId: testTenantId,
          startedAt: yesterday,
          endedAt: now,
          durationMinutes: 30,
          pagesVisited: 5,
          ipAddress: '127.0.0.1',
          userAgent: 'test-browser'
        },
        {
          id: 'test-session-2',
          userId: adminUserId,
          tenantId: testTenantId,
          startedAt: lastWeek,
          endedAt: yesterday,
          durationMinutes: 45,
          pagesVisited: 8,
          ipAddress: '127.0.0.1',
          userAgent: 'test-browser'
        }
      ]
    });

    // Criar dados de uso de features
    await prisma.featureUsage.createMany({
      data: [
        {
          featureName: 'dashboard',
          featureCategory: 'analytics',
          userId: regularUserId,
          tenantId: testTenantId,
          usageCount: 15,
          totalTimeMinutes: 120,
          date: yesterday
        },
        {
          featureName: 'reports',
          featureCategory: 'reporting',
          userId: adminUserId,
          tenantId: testTenantId,
          usageCount: 8,
          totalTimeMinutes: 90,
          date: lastWeek
        }
      ]
    });

    // Criar page views
    await prisma.pageViews.createMany({
      data: [
        {
          userId: regularUserId,
          tenantId: testTenantId,
          sessionId: 'test-session-1',
          pagePath: '/dashboard',
          pageTitle: 'Dashboard',
          timeOnPage: 300,
          createdAt: yesterday
        },
        {
          userId: adminUserId,
          tenantId: testTenantId,
          sessionId: 'test-session-2',
          pagePath: '/analytics',
          pageTitle: 'Analytics',
          timeOnPage: 450,
          createdAt: lastWeek
        }
      ]
    });

    // Criar dados geográficos
    await prisma.geographicData.create({
      data: {
        tenantId: testTenantId,
        cidade: 'São Paulo',
        estado: 'SP',
        regiao: 'Sudeste',
        totalUsuarios: 100,
        usuariosAtivos: 85,
        protocolosMes: 250,
        satisfacaoMedia: 4.5,
        populacao: 12000000,
        period: 'current'
      }
    });

    // Criar analytics de módulo
    await prisma.moduleAnalytics.create({
      data: {
        tenantId: testTenantId,
        moduleName: 'dashboard',
        totalUsers: 50,
        activeUsers: 42,
        totalSessions: 120,
        totalPageViews: 500,
        avgSessionTime: 25.5,
        popularFeature: 'charts',
        period: 'current'
      }
    });
  }

  async function cleanupAnalyticsData() {
    await prisma.pageViews.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.featureUsage.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.analyticsUserSessions.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.geographicData.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.moduleAnalytics.deleteMany({ where: { tenantId: testTenantId } });
  }

  // ================================================================
  // TESTES DAS APIS DE ANALYTICS OVERVIEW
  // ================================================================

  describe('GET /api/admin/analytics/overview', () => {
    test('deve retornar overview analytics para super admin', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/overview?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.sessionStats).toBeDefined();
      expect(response.body.data.topFeatures).toBeDefined();
      expect(response.body.data.pageViews).toBeDefined();
      expect(response.body.data.returningUsers).toBeDefined();
      expect(response.body.data.executionTime).toBeDefined();
    });

    test('deve negar acesso para usuário regular', async () => {
      await request(app)
        .get('/api/admin/analytics/overview')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    test('deve usar cache quando disponível', async () => {
      // Primeira chamada para popular o cache
      const response1 = await request(app)
        .get('/api/admin/analytics/overview?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      // Segunda chamada deve usar cache
      const response2 = await request(app)
        .get('/api/admin/analytics/overview?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response2.body.data.cached).toBe(true);
    });

    test('deve validar período corretamente', async () => {
      await request(app)
        .get('/api/admin/analytics/overview?period=invalid')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(400);
    });
  });

  // ================================================================
  // TESTES DAS APIS DE EVOLUÇÃO DE USO
  // ================================================================

  describe('GET /api/admin/analytics/usage', () => {
    test('deve retornar evolução de uso', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/usage?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.dailyUsage).toBeDefined();
      expect(Array.isArray(response.body.data.dailyUsage)).toBe(true);
      expect(response.body.data.featureTrends).toBeDefined();
      expect(Array.isArray(response.body.data.featureTrends)).toBe(true);
    });

    test('deve negar acesso para admin regular', async () => {
      await request(app)
        .get('/api/admin/analytics/usage')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });
  });

  // ================================================================
  // TESTES DAS APIS DE FEATURES POPULARES
  // ================================================================

  describe('GET /api/admin/analytics/features', () => {
    test('deve retornar features populares', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/features?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.topFeatures).toBeDefined();
      expect(Array.isArray(response.body.data.topFeatures)).toBe(true);
      expect(response.body.data.categoryStats).toBeDefined();
      expect(Array.isArray(response.body.data.categoryStats)).toBe(true);
      expect(response.body.data.engagement).toBeDefined();
    });

    test('deve filtrar por categoria quando especificada', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/features?period=30d&category=analytics')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.topFeatures).toBeDefined();
    });
  });

  // ================================================================
  // TESTES DAS APIS DE MÓDULOS
  // ================================================================

  describe('GET /api/admin/analytics/modules', () => {
    test('deve retornar analytics por módulo', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/modules?period=current')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.moduleStats).toBeDefined();
      expect(Array.isArray(response.body.data.moduleStats)).toBe(true);
      expect(response.body.data.globalStats).toBeDefined();
      expect(Array.isArray(response.body.data.globalStats)).toBe(true);
    });
  });

  // ================================================================
  // TESTES DAS APIS GEOGRÁFICAS
  // ================================================================

  describe('GET /api/admin/analytics/geographic', () => {
    test('deve retornar dados geográficos por estado', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/geographic?period=current&groupBy=estado')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.distribution).toBeDefined();
      expect(Array.isArray(response.body.data.distribution)).toBe(true);
      expect(response.body.data.totalStats).toBeDefined();
    });

    test('deve retornar dados geográficos por região', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/geographic?period=current&groupBy=regiao')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.distribution).toBeDefined();
    });
  });

  // ================================================================
  // TESTES DAS APIS DE PERFORMANCE
  // ================================================================

  describe('GET /api/admin/analytics/performance', () => {
    test('deve retornar métricas de performance', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/performance?period=24h')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.system).toBeDefined();
      expect(response.body.data.application).toBeDefined();
      expect(response.body.data.database).toBeDefined();
      expect(response.body.data.healthScore).toBeDefined();
      expect(typeof response.body.data.healthScore).toBe('number');
    });
  });

  // ================================================================
  // TESTES DO SERVIÇO DE QUERIES OTIMIZADAS
  // ================================================================

  describe('OptimizedQueries Service', () => {
    test('deve executar query otimizada de analytics overview', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await optimizedQueries.getAnalyticsOverviewOptimized(startDate);

      expect(result).toBeDefined();
      expect(result.sessionStats).toBeDefined();
      expect(result.topFeatures).toBeDefined();
      expect(result.pageViews).toBeDefined();
      expect(result.returningUsers).toBeDefined();
      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe('number');
    });

    test('deve executar query otimizada de dados geográficos', async () => {
      const result = await optimizedQueries.getGeographicDataOptimized('current', 'estado');

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.executionTime).toBeDefined();
    });

    test('deve executar query otimizada de módulos', async () => {
      const result = await optimizedQueries.getModuleAnalyticsOptimized('current');

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.executionTime).toBeDefined();
    });

    test('deve executar query otimizada de features', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await optimizedQueries.getFeatureUsageOptimized(startDate);

      expect(result).toBeDefined();
      expect(result.features).toBeDefined();
      expect(Array.isArray(result.features)).toBe(true);
      expect(result.categories).toBeDefined();
      expect(Array.isArray(result.categories)).toBe(true);
      expect(result.executionTime).toBeDefined();
    });

    test('deve executar query otimizada de dashboard metrics', async () => {
      const result = await optimizedQueries.getDashboardMetricsOptimized();

      expect(result).toBeDefined();
      expect(result.tenantMetrics).toBeDefined();
      expect(result.activity).toBeDefined();
      expect(result.executionTime).toBeDefined();
    });

    test('deve obter estatísticas de performance das queries', async () => {
      const result = await optimizedQueries.getQueryPerformanceStats();

      expect(result).toBeDefined();
      expect(result.avgQueryTime).toBeDefined();
      expect(result.totalQueries).toBeDefined();
      expect(result.cacheHitRate).toBeDefined();
      expect(result.topSlowQueries).toBeDefined();
      expect(Array.isArray(result.topSlowQueries)).toBe(true);
    });

    test('deve analisar plano de execução de queries', async () => {
      const result = await optimizedQueries.analyzeQueryPlan('analytics_overview');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ================================================================
  // TESTES DO CACHE SERVICE
  // ================================================================

  describe('Cache Service Integration', () => {
    test('deve armazenar e recuperar dados do cache', async () => {
      const testData = { test: 'data', timestamp: Date.now() };

      // Armazenar no cache
      const setResult = await cacheService.set('test-key', testData, 60);
      expect(setResult).toBe(true);

      // Recuperar do cache
      const getValue = await cacheService.get('test-key');
      expect(getValue).toEqual(testData);
    });

    test('deve usar métodos específicos para analytics', async () => {
      const testMetrics = { totalUsers: 100, revenue: 5000 };

      // Armazenar métricas de dashboard
      const setResult = await cacheService.setDashboardMetrics(testMetrics);
      expect(setResult).toBe(true);

      // Recuperar métricas de dashboard
      const getResult = await cacheService.getDashboardMetrics();
      expect(getResult).toEqual(testMetrics);
    });

    test('deve invalidar cache corretamente', async () => {
      // Armazenar dados
      await cacheService.set('test-invalidate', { data: 'test' }, 60);

      // Verificar que existe
      const beforeDelete = await cacheService.get('test-invalidate');
      expect(beforeDelete).toBeDefined();

      // Invalidar
      await cacheService.delete('test-invalidate');

      // Verificar que foi removido
      const afterDelete = await cacheService.get('test-invalidate');
      expect(afterDelete).toBeNull();
    });

    test('deve realizar health check do cache', async () => {
      const healthCheck = await cacheService.healthCheck();

      expect(healthCheck.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthCheck.status);
      expect(healthCheck.details).toBeDefined();
    });

    test('deve obter métricas do cache', async () => {
      const metrics = cacheService.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.hits).toBe('number');
      expect(typeof metrics.misses).toBe('number');
      expect(typeof metrics.hitRate).toBe('number');
      expect(typeof metrics.totalKeys).toBe('number');
    });
  });

  // ================================================================
  // TESTES DE AUTORIZAÇÃO E SEGURANÇA
  // ================================================================

  describe('Authorization and Security', () => {
    test('deve negar acesso sem token', async () => {
      await request(app)
        .get('/api/admin/analytics/overview')
        .expect(401);
    });

    test('deve negar acesso com token inválido', async () => {
      await request(app)
        .get('/api/admin/analytics/overview')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    test('deve negar acesso para roles insuficientes', async () => {
      await request(app)
        .get('/api/admin/analytics/overview')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    test('deve permitir acesso para super admin em todas as rotas', async () => {
      const routes = [
        '/api/admin/analytics/overview',
        '/api/admin/analytics/usage',
        '/api/admin/analytics/features',
        '/api/admin/analytics/modules',
        '/api/admin/analytics/geographic',
        '/api/admin/analytics/performance'
      ];

      for (const route of routes) {
        await request(app)
          .get(route)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .expect(200);
      }
    });
  });

  // ================================================================
  // TESTES DE VALIDAÇÃO DE ENTRADA
  // ================================================================

  describe('Input Validation', () => {
    test('deve validar parâmetros de período', async () => {
      const invalidPeriods = ['invalid', '100d', 'yesterday', ''];

      for (const period of invalidPeriods) {
        await request(app)
          .get(`/api/admin/analytics/overview?period=${period}`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .expect(400);
      }
    });

    test('deve validar parâmetros de groupBy', async () => {
      await request(app)
        .get('/api/admin/analytics/geographic?groupBy=invalid')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(400);
    });

    test('deve aceitar parâmetros válidos', async () => {
      const validPeriods = ['7d', '30d', '90d'];

      for (const period of validPeriods) {
        await request(app)
          .get(`/api/admin/analytics/overview?period=${period}`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .expect(200);
      }
    });
  });
});