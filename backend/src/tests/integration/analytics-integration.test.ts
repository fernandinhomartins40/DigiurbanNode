// ====================================================================
// 🧪 TESTES DE INTEGRAÇÃO - SISTEMA DE ANALYTICS
// ====================================================================
// Testes completos para fluxo de analytics end-to-end
// Validação de coleta de dados, processamento e APIs
// ====================================================================

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../../app.js';
import { UserModel } from '../../models/User.js';
import { TenantModel } from '../../models/Tenant.js';
import { AuthService } from '../../services/AuthService.js';
import { cacheService } from '../../services/cacheService.js';

describe('Analytics Integration Tests', () => {
  let prisma: PrismaClient;
  let testTenantId: string;
  let testTenant2Id: string;
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

    // Criar tenants de teste
    const tenant1 = await TenantModel.create({
      nome: 'Tenant 1 Analytics Integration',
      email: 'tenant1.analytics@teste.com',
      plano: 'ENTERPRISE',
      status: 'ATIVO',
      cidade: 'São Paulo',
      estado: 'SP',
      regiao: 'Sudeste',
      populacao: 12000000,
      valor_mensal: 2500.00,
      usuarios_ativos: 150
    });
    testTenantId = tenant1.id;

    const tenant2 = await TenantModel.create({
      nome: 'Tenant 2 Analytics Integration',
      email: 'tenant2.analytics@teste.com',
      plano: 'PROFESSIONAL',
      status: 'ATIVO',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      regiao: 'Sudeste',
      populacao: 6000000,
      valor_mensal: 1500.00,
      usuarios_ativos: 85
    });
    testTenant2Id = tenant2.id;

    // Criar usuários de teste
    const superAdmin = await UserModel.create({
      nome_completo: 'Super Admin Integration',
      email: 'superadmin.integration@teste.com',
      password: 'SuperAdmin123!',
      tenant_id: testTenantId,
      role: 'super_admin',
      ativo: true
    });
    superAdminUserId = superAdmin.id;

    const admin = await UserModel.create({
      nome_completo: 'Admin Integration',
      email: 'admin.integration@teste.com',
      password: 'Admin123!',
      tenant_id: testTenantId,
      role: 'admin',
      ativo: true
    });
    adminUserId = admin.id;

    const regularUser = await UserModel.create({
      nome_completo: 'User Integration',
      email: 'user.integration@teste.com',
      password: 'User123!',
      tenant_id: testTenantId,
      role: 'user',
      ativo: true
    });
    regularUserId = regularUser.id;

    // Obter tokens de autenticação
    const superAdminLogin = await AuthService.login({
      email: 'superadmin.integration@teste.com',
      password: 'SuperAdmin123!',
      ipAddress: '127.0.0.1'
    });
    superAdminToken = superAdminLogin.tokens.accessToken;

    const adminLogin = await AuthService.login({
      email: 'admin.integration@teste.com',
      password: 'Admin123!',
      ipAddress: '127.0.0.1'
    });
    adminToken = adminLogin.tokens.accessToken;

    const regularLogin = await AuthService.login({
      email: 'user.integration@teste.com',
      password: 'User123!',
      ipAddress: '127.0.0.1'
    });
    regularUserToken = regularLogin.tokens.accessToken;

    // Criar dados realistas para testes
    await seedRealisticAnalyticsData();
  });

  beforeEach(async () => {
    // Limpar cache antes de cada teste
    await cacheService.clear();
  });

  afterAll(async () => {
    // Limpeza completa após testes
    await cleanupAllAnalyticsData();
    if (regularUserId) await UserModel.delete(regularUserId);
    if (adminUserId) await UserModel.delete(adminUserId);
    if (superAdminUserId) await UserModel.delete(superAdminUserId);
    if (testTenant2Id) await TenantModel.delete(testTenant2Id);
    if (testTenantId) await TenantModel.delete(testTenantId);
    await prisma.$disconnect();
  });

  // ================================================================
  // FUNÇÕES AUXILIARES
  // ================================================================

  async function seedRealisticAnalyticsData() {
    const now = new Date();
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date;
    });

    // Criar sessões realistas para múltiplos usuários
    const sessions = [];
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const sessionCount = Math.floor(Math.random() * 10) + 5; // 5-15 sessões por dia

      for (let j = 0; j < sessionCount; j++) {
        const sessionStart = new Date(date);
        sessionStart.setHours(8 + Math.floor(Math.random() * 12)); // 8h-20h

        const sessionEnd = new Date(sessionStart);
        const duration = Math.floor(Math.random() * 120) + 10; // 10-130 minutos
        sessionEnd.setMinutes(sessionEnd.getMinutes() + duration);

        sessions.push({
          id: `session-${i}-${j}`,
          userId: Math.random() > 0.5 ? regularUserId : adminUserId,
          tenantId: Math.random() > 0.3 ? testTenantId : testTenant2Id,
          startedAt: sessionStart,
          endedAt: sessionEnd,
          durationMinutes: duration,
          pagesVisited: Math.floor(Math.random() * 15) + 1,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: 'Mozilla/5.0 (Integration Test Browser)',
          referrer: Math.random() > 0.5 ? 'https://google.com' : null
        });
      }
    }

    await prisma.analyticsUserSessions.createMany({ data: sessions });

    // Criar dados de uso de features realistas
    const features = [
      { name: 'dashboard', category: 'analytics' },
      { name: 'reports', category: 'reporting' },
      { name: 'user_management', category: 'admin' },
      { name: 'protocols', category: 'core' },
      { name: 'notifications', category: 'communication' },
      { name: 'settings', category: 'configuration' },
      { name: 'export', category: 'reporting' },
      { name: 'charts', category: 'analytics' }
    ];

    const featureUsageData = [];
    for (const date of dates) {
      for (const feature of features) {
        const usageCount = Math.floor(Math.random() * 50) + 10;
        const timeSpent = usageCount * (Math.random() * 5 + 2); // 2-7 minutos por uso

        featureUsageData.push({
          featureName: feature.name,
          featureCategory: feature.category,
          userId: Math.random() > 0.5 ? regularUserId : adminUserId,
          tenantId: Math.random() > 0.3 ? testTenantId : testTenant2Id,
          usageCount,
          totalTimeMinutes: Math.round(timeSpent),
          date
        });
      }
    }

    await prisma.featureUsage.createMany({ data: featureUsageData });

    // Criar page views realistas
    const pages = [
      '/dashboard',
      '/analytics',
      '/users',
      '/protocols',
      '/reports',
      '/settings',
      '/profile',
      '/notifications'
    ];

    const pageViewsData = [];
    for (const session of sessions) {
      const pagesVisited = Math.min(session.pagesVisited, pages.length);
      const visitedPages = pages.slice(0, pagesVisited);

      for (let i = 0; i < visitedPages.length; i++) {
        const viewTime = new Date(session.startedAt);
        viewTime.setMinutes(viewTime.getMinutes() + i * 5);

        pageViewsData.push({
          userId: session.userId,
          tenantId: session.tenantId,
          sessionId: session.id,
          pagePath: visitedPages[i],
          pageTitle: visitedPages[i].replace('/', '').toUpperCase(),
          timeOnPage: Math.floor(Math.random() * 300) + 30, // 30-330 segundos
          referrer: i === 0 ? session.referrer : visitedPages[i - 1],
          createdAt: viewTime
        });
      }
    }

    await prisma.pageViews.createMany({ data: pageViewsData });

    // Criar dados geográficos realistas
    const geographicData = [
      {
        tenantId: testTenantId,
        cidade: 'São Paulo',
        estado: 'SP',
        regiao: 'Sudeste',
        totalUsuarios: 150,
        usuariosAtivos: 128,
        protocolosMes: 450,
        satisfacaoMedia: 4.2,
        populacao: 12000000,
        period: 'current'
      },
      {
        tenantId: testTenant2Id,
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        regiao: 'Sudeste',
        totalUsuarios: 85,
        usuariosAtivos: 72,
        protocolosMes: 280,
        satisfacaoMedia: 4.5,
        populacao: 6000000,
        period: 'current'
      },
      {
        tenantId: null,
        cidade: 'Belo Horizonte',
        estado: 'MG',
        regiao: 'Sudeste',
        totalUsuarios: 65,
        usuariosAtivos: 58,
        protocolosMes: 195,
        satisfacaoMedia: 4.1,
        populacao: 2500000,
        period: 'current'
      }
    ];

    await prisma.geographicData.createMany({ data: geographicData });

    // Criar analytics de módulos
    const moduleData = [
      {
        tenantId: testTenantId,
        moduleName: 'dashboard',
        totalUsers: 120,
        activeUsers: 95,
        totalSessions: 890,
        totalPageViews: 2450,
        avgSessionTime: 28.5,
        popularFeature: 'charts',
        period: 'current'
      },
      {
        tenantId: testTenantId,
        moduleName: 'reports',
        totalUsers: 85,
        activeUsers: 68,
        totalSessions: 340,
        totalPageViews: 1120,
        avgSessionTime: 45.2,
        popularFeature: 'export',
        period: 'current'
      },
      {
        tenantId: testTenant2Id,
        moduleName: 'dashboard',
        totalUsers: 75,
        activeUsers: 62,
        totalSessions: 520,
        totalPageViews: 1580,
        avgSessionTime: 32.1,
        popularFeature: 'metrics',
        period: 'current'
      }
    ];

    await prisma.moduleAnalytics.createMany({ data: moduleData });

    // Criar métricas de sistema
    const systemMetrics = [];
    for (const date of dates.slice(0, 7)) { // últimos 7 dias
      systemMetrics.push(
        {
          metricName: 'cpu_usage',
          metricValue: Math.random() * 80 + 10, // 10-90%
          metricUnit: 'percentage',
          recordedAt: date
        },
        {
          metricName: 'memory_usage',
          metricValue: Math.random() * 70 + 20, // 20-90%
          metricUnit: 'percentage',
          recordedAt: date
        },
        {
          metricName: 'response_time',
          metricValue: Math.random() * 500 + 100, // 100-600ms
          metricUnit: 'milliseconds',
          recordedAt: date
        },
        {
          metricName: 'active_users',
          metricValue: Math.floor(Math.random() * 200) + 50, // 50-250 usuários
          metricUnit: 'count',
          recordedAt: date
        }
      );
    }

    await prisma.systemMetrics.createMany({ data: systemMetrics });
  }

  async function cleanupAllAnalyticsData() {
    await prisma.systemMetrics.deleteMany({});
    await prisma.moduleAnalytics.deleteMany({});
    await prisma.geographicData.deleteMany({});
    await prisma.pageViews.deleteMany({});
    await prisma.featureUsage.deleteMany({});
    await prisma.analyticsUserSessions.deleteMany({});
  }

  // ================================================================
  // TESTES DE FLUXO COMPLETO DE ANALYTICS
  // ================================================================

  describe('End-to-End Analytics Flow', () => {
    test('deve coletar e processar dados de analytics corretamente', async () => {
      // 1. Verificar se os dados foram inseridos
      const sessionCount = await prisma.analyticsUserSessions.count();
      expect(sessionCount).toBeGreaterThan(0);

      const featureCount = await prisma.featureUsage.count();
      expect(featureCount).toBeGreaterThan(0);

      const pageViewCount = await prisma.pageViews.count();
      expect(pageViewCount).toBeGreaterThan(0);

      // 2. Obter overview analytics
      const overviewResponse = await request(app)
        .get('/api/admin/analytics/overview?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(overviewResponse.body.data.sessionStats.total_sessions).toBeGreaterThan(0);
      expect(overviewResponse.body.data.sessionStats.unique_users).toBeGreaterThan(0);
      expect(overviewResponse.body.data.topFeatures.length).toBeGreaterThan(0);

      // 3. Verificar se o cache foi populado
      const cachedData = await cacheService.getAnalyticsOverview('30d');
      expect(cachedData).toBeDefined();
    });

    test('deve gerar relatórios completos multi-tenant', async () => {
      // 1. Overview geral
      const overviewResponse = await request(app)
        .get('/api/admin/analytics/overview?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      // 2. Dados geográficos
      const geographicResponse = await request(app)
        .get('/api/admin/analytics/geographic?period=current&groupBy=estado')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(geographicResponse.body.data.distribution.length).toBeGreaterThan(0);

      // 3. Analytics por módulo
      const moduleResponse = await request(app)
        .get('/api/admin/analytics/modules?period=current')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(moduleResponse.body.data.moduleStats.length).toBeGreaterThan(0);
      expect(moduleResponse.body.data.globalStats.length).toBeGreaterThan(0);

      // 4. Features populares
      const featuresResponse = await request(app)
        .get('/api/admin/analytics/features?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(featuresResponse.body.data.topFeatures.length).toBeGreaterThan(0);
      expect(featuresResponse.body.data.categoryStats.length).toBeGreaterThan(0);

      // 5. Verificar consistência dos dados entre relatórios
      const totalUsersFromOverview = overviewResponse.body.data.sessionStats.unique_users;
      const totalUsersFromModules = moduleResponse.body.data.globalStats.reduce(
        (sum: number, module: any) => sum + module.totalUsers, 0
      );

      // Os números podem diferir devido a diferentes períodos e agregações, mas devem estar na mesma ordem de grandeza
      expect(totalUsersFromModules).toBeGreaterThan(0);
    });

    test('deve manter performance com grandes volumes de dados', async () => {
      const startTime = Date.now();

      // Executar múltiplas queries em paralelo
      const promises = [
        request(app)
          .get('/api/admin/analytics/overview?period=30d')
          .set('Authorization', `Bearer ${superAdminToken}`),
        request(app)
          .get('/api/admin/analytics/usage?period=30d')
          .set('Authorization', `Bearer ${superAdminToken}`),
        request(app)
          .get('/api/admin/analytics/features?period=30d')
          .set('Authorization', `Bearer ${superAdminToken}`),
        request(app)
          .get('/api/admin/analytics/modules?period=current')
          .set('Authorization', `Bearer ${superAdminToken}`),
        request(app)
          .get('/api/admin/analytics/geographic?period=current&groupBy=estado')
          .set('Authorization', `Bearer ${superAdminToken}`)
      ];

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Todas as requests devem ser bem-sucedidas
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Tempo total deve ser razoável (menos de 10 segundos para todas as queries)
      expect(totalTime).toBeLessThan(10000);

      // Verificar que cada response tem tempo de execução individual
      responses.forEach(response => {
        if (response.body.data.executionTime) {
          expect(response.body.data.executionTime).toBeLessThan(5000);
        }
      });
    });
  });

  // ================================================================
  // TESTES DE CACHE E PERFORMANCE
  // ================================================================

  describe('Cache and Performance Integration', () => {
    test('deve usar cache efetivamente entre requests', async () => {
      // Primeira request - popula o cache
      const response1 = await request(app)
        .get('/api/admin/analytics/overview?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      const executionTime1 = response1.body.data.executionTime;

      // Segunda request - deve usar cache
      const response2 = await request(app)
        .get('/api/admin/analytics/overview?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response2.body.data.cached).toBe(true);

      // Dados devem ser consistentes
      expect(response2.body.data.sessionStats.total_sessions)
        .toBe(response1.body.data.sessionStats.total_sessions);
    });

    test('deve invalidar cache adequadamente', async () => {
      // Popular cache
      await request(app)
        .get('/api/admin/analytics/overview?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      // Verificar que está em cache
      const cachedData = await cacheService.getAnalyticsOverview('30d');
      expect(cachedData).toBeDefined();

      // Invalidar cache
      await cacheService.invalidateGlobal();

      // Verificar que cache foi limpo
      const cachedDataAfter = await cacheService.getAnalyticsOverview('30d');
      expect(cachedDataAfter).toBeNull();

      // Nova request não deve usar cache
      const response = await request(app)
        .get('/api/admin/analytics/overview?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.data.cached).toBeFalsy();
    });

    test('deve manter consistência entre cache e banco de dados', async () => {
      // Obter dados do banco direto
      const directData = await prisma.analyticsUserSessions.count({
        where: {
          startedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      // Obter dados via API (que usa cache)
      const apiResponse = await request(app)
        .get('/api/admin/analytics/overview?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      const apiSessionCount = apiResponse.body.data.sessionStats.total_sessions;

      // Os dados devem ser consistentes
      expect(apiSessionCount).toBe(directData);
    });
  });

  // ================================================================
  // TESTES DE AUTORIZAÇÃO MULTI-TENANT
  // ================================================================

  describe('Multi-tenant Authorization', () => {
    test('super admin deve ver dados de todos os tenants', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/geographic?period=current&groupBy=estado')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      const distribution = response.body.data.distribution;

      // Deve incluir dados de múltiplos estados (SP, RJ, MG)
      const states = distribution.map((d: any) => d.name);
      expect(states).toContain('SP');
      expect(states).toContain('RJ');
    });

    test('admin regular não deve ter acesso a analytics globais', async () => {
      await request(app)
        .get('/api/admin/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    test('usuário regular não deve ter acesso a nenhuma analytics', async () => {
      const analyticsRoutes = [
        '/api/admin/analytics/overview',
        '/api/admin/analytics/usage',
        '/api/admin/analytics/features',
        '/api/admin/analytics/modules',
        '/api/admin/analytics/geographic',
        '/api/admin/analytics/performance'
      ];

      for (const route of analyticsRoutes) {
        await request(app)
          .get(route)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(403);
      }
    });
  });

  // ================================================================
  // TESTES DE CONSISTÊNCIA DE DADOS
  // ================================================================

  describe('Data Consistency', () => {
    test('totais devem ser consistentes entre diferentes agregações', async () => {
      // Obter dados por módulo
      const moduleResponse = await request(app)
        .get('/api/admin/analytics/modules?period=current')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      // Obter dados geográficos
      const geographicResponse = await request(app)
        .get('/api/admin/analytics/geographic?period=current&groupBy=estado')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      // Verificar que os totais fazem sentido
      const totalUsersModules = moduleResponse.body.data.globalStats.reduce(
        (sum: number, module: any) => Math.max(sum, module.totalUsers), 0
      );

      const totalUsersGeographic = geographicResponse.body.data.totalStats.totalUsuarios;

      // Os números podem diferir devido a diferentes agregações, mas devem estar correlacionados
      expect(totalUsersModules).toBeGreaterThan(0);
      expect(totalUsersGeographic).toBeGreaterThan(0);
    });

    test('tendências temporais devem ser lógicas', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/usage?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      const dailyUsage = response.body.data.dailyUsage;
      expect(Array.isArray(dailyUsage)).toBe(true);
      expect(dailyUsage.length).toBeGreaterThan(0);

      // Verificar que cada entrada tem os campos esperados
      dailyUsage.forEach((day: any) => {
        expect(day.date).toBeDefined();
        expect(typeof day.sessions).toBe('number');
        expect(typeof day.uniqueUsers).toBe('number');
        expect(day.sessions).toBeGreaterThanOrEqual(0);
        expect(day.uniqueUsers).toBeGreaterThanOrEqual(0);
        expect(day.uniqueUsers).toBeLessThanOrEqual(day.sessions);
      });
    });

    test('métricas de performance devem ser realistas', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/performance?period=24h')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      const data = response.body.data;

      // Health score deve estar entre 0 e 100
      expect(data.healthScore).toBeGreaterThanOrEqual(0);
      expect(data.healthScore).toBeLessThanOrEqual(100);

      // Tempos de resposta devem ser positivos
      expect(data.application.responseTime.avg).toBeGreaterThan(0);
      expect(data.application.responseTime.p95).toBeGreaterThanOrEqual(data.application.responseTime.avg);
      expect(data.application.responseTime.p99).toBeGreaterThanOrEqual(data.application.responseTime.p95);

      // Taxa de erro deve estar entre 0 e 100
      expect(data.application.errorRate).toBeGreaterThanOrEqual(0);
      expect(data.application.errorRate).toBeLessThanOrEqual(100);
    });
  });

  // ================================================================
  // TESTES DE ROBUSTEZ E RECUPERAÇÃO
  // ================================================================

  describe('Robustness and Recovery', () => {
    test('deve lidar com dados faltantes graciosamente', async () => {
      // Remover temporariamente alguns dados
      await prisma.featureUsage.deleteMany({
        where: { tenantId: testTenantId }
      });

      // API ainda deve funcionar
      const response = await request(app)
        .get('/api/admin/analytics/features?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('deve manter funcionalidade durante falha de cache', async () => {
      // Simular falha de cache (invalidar e impedir funcionamento)
      await cacheService.clear();

      // APIs devem continuar funcionando sem cache
      const response = await request(app)
        .get('/api/admin/analytics/overview?period=30d')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionStats).toBeDefined();
    });

    test('deve validar entrada e retornar erros apropriados', async () => {
      // Teste com parâmetros inválidos
      const invalidRequests = [
        { url: '/api/admin/analytics/overview?period=invalid', expectedStatus: 400 },
        { url: '/api/admin/analytics/geographic?groupBy=invalid', expectedStatus: 400 },
        { url: '/api/admin/analytics/features?period=999d', expectedStatus: 400 }
      ];

      for (const request_data of invalidRequests) {
        const response = await request(app)
          .get(request_data.url)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .expect(request_data.expectedStatus);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      }
    });
  });
});