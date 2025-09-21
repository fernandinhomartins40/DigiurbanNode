// ====================================================================
// 🌱 SEED DE DADOS - SISTEMA DE ANALYTICS
// ====================================================================
// Script para popular o banco com dados de demonstração
// Para validação do sistema de analytics
// ====================================================================

import { PrismaClient } from '@prisma/client';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

const prisma = new PrismaClient();

async function seedAnalyticsData() {
  try {
    StructuredLogger.info('🌱 Iniciando seed de dados de analytics');

    // Criar tenant de demonstração
    const tenant = await prisma.tenant.upsert({
      where: { email: 'demo@digiurban.com' },
      update: {},
      create: {
        id: 'demo-tenant-id',
        nome: 'Prefeitura Demo',
        email: 'demo@digiurban.com',
        tenantCode: 'DEMO001',
        cnpj: '12345678000123',
        plano: 'ENTERPRISE',
        status: 'ATIVO',
        cidade: 'São Paulo',
        estado: 'SP',
        populacao: 12000000,
        valorMensal: 2500.00,
        usuariosAtivos: 150,
        responsavelEmail: 'demo@digiurban.com',
        createdAt: new Date()
      }
    });

    // Criar usuário de demonstração
    const user = await prisma.user.upsert({
      where: { email: 'admin@demo.com' },
      update: {},
      create: {
        id: 'demo-user-id',
        nomeCompleto: 'Admin Demo',
        email: 'admin@demo.com',
        passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        tenantId: tenant.id,
        role: 'admin',
        ativo: true,
        createdAt: new Date()
      }
    });

    const now = new Date();
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date;
    });

    // Criar sessões de usuário
    const sessions = [];
    for (let i = 0; i < 50; i++) {
      const date = dates[Math.floor(Math.random() * dates.length)];
      const sessionStart = new Date(date);
      sessionStart.setHours(8 + Math.floor(Math.random() * 12));

      const sessionEnd = new Date(sessionStart);
      const duration = Math.floor(Math.random() * 120) + 10;
      sessionEnd.setMinutes(sessionEnd.getMinutes() + duration);

      sessions.push({
        id: `session-${i}`,
        userId: user.id,
        tenantId: tenant.id,
        startedAt: sessionStart,
        endedAt: sessionEnd,
        durationMinutes: duration,
        pagesVisited: Math.floor(Math.random() * 15) + 1,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: 'Demo Browser'
      });
    }

    await prisma.analyticsUserSession.deleteMany({});
    await prisma.analyticsUserSession.createMany({ data: sessions });

    // Criar dados de uso de features
    const features = [
      { name: 'dashboard', category: 'analytics' },
      { name: 'reports', category: 'reporting' },
      { name: 'user_management', category: 'admin' },
      { name: 'protocols', category: 'core' },
      { name: 'notifications', category: 'communication' }
    ];

    const featureUsageData = [];
    for (const date of dates.slice(0, 15)) {
      for (const feature of features) {
        const usageCount = Math.floor(Math.random() * 50) + 10;
        const timeSpent = usageCount * (Math.random() * 5 + 2);

        featureUsageData.push({
          featureName: feature.name,
          featureCategory: feature.category,
          userId: user.id,
          tenantId: tenant.id,
          usageCount: usageCount,
          totalTimeMinutes: Math.round(timeSpent),
          date
        });
      }
    }

    await prisma.featureUsage.deleteMany({});
    await prisma.featureUsage.createMany({ data: featureUsageData });

    // Criar page views
    const pages = ['/dashboard', '/analytics', '/users', '/protocols', '/reports'];
    const pageViewsData = [];

    for (const session of sessions.slice(0, 30)) {
      const pagesVisited = Math.min(session.pagesVisited, pages.length);

      for (let i = 0; i < pagesVisited; i++) {
        const viewTime = new Date(session.startedAt);
        viewTime.setMinutes(viewTime.getMinutes() + i * 5);

        pageViewsData.push({
          userId: session.userId,
          tenantId: session.tenantId,
          sessionId: session.id,
          pagePath: pages[i],
          pageTitle: pages[i].replace('/', '').toUpperCase(),
          timeOnPage: Math.floor(Math.random() * 300) + 30,
          referrer: i === 0 ? null : pages[i - 1],
          createdAt: viewTime
        });
      }
    }

    await prisma.pageViews.deleteMany({});
    await prisma.pageViews.createMany({ data: pageViewsData });

    // Criar dados geográficos
    const geographicData = [
      {
        tenantId: tenant.id,
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
        tenantId: null,
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        regiao: 'Sudeste',
        totalUsuarios: 85,
        usuariosAtivos: 72,
        protocolosMes: 280,
        satisfacaoMedia: 4.5,
        populacao: 6000000,
        period: 'current'
      }
    ];

    await prisma.geographicData.deleteMany({});
    await prisma.geographicData.createMany({ data: geographicData });

    // Criar analytics de módulos
    const moduleData = [
      {
        tenantId: tenant.id,
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
        tenantId: tenant.id,
        moduleName: 'reports',
        totalUsers: 85,
        activeUsers: 68,
        totalSessions: 340,
        totalPageViews: 1120,
        avgSessionTime: 45.2,
        popularFeature: 'export',
        period: 'current'
      }
    ];

    await prisma.moduleAnalytics.deleteMany({});
    await prisma.moduleAnalytics.createMany({ data: moduleData });

    // Criar métricas de sistema
    const systemMetrics = [];
    for (const date of dates.slice(0, 7)) {
      systemMetrics.push(
        {
          metricName: 'cpu_usage',
          metricValue: Math.random() * 80 + 10,
          metricUnit: 'percentage',
          recordedAt: date
        },
        {
          metricName: 'memory_usage',
          metricValue: Math.random() * 70 + 20,
          metricUnit: 'percentage',
          recordedAt: date
        },
        {
          metricName: 'response_time',
          metricValue: Math.random() * 500 + 100,
          metricUnit: 'milliseconds',
          recordedAt: date
        }
      );
    }

    await prisma.systemMetrics.deleteMany({});
    await prisma.systemMetrics.createMany({ data: systemMetrics });

    StructuredLogger.info('✅ Seed de dados de analytics concluído', {
      sessions: sessions.length,
      features: featureUsageData.length,
      pageViews: pageViewsData.length,
      geographic: geographicData.length,
      modules: moduleData.length,
      metrics: systemMetrics.length
    });

    console.log('✅ Dados de analytics criados com sucesso!');
    console.log(`  📊 ${sessions.length} sessões de usuário`);
    console.log(`  🔧 ${featureUsageData.length} registros de uso de features`);
    console.log(`  📄 ${pageViewsData.length} page views`);
    console.log(`  🌍 ${geographicData.length} registros geográficos`);
    console.log(`  📦 ${moduleData.length} analytics de módulos`);
    console.log(`  📈 ${systemMetrics.length} métricas de sistema`);

  } catch (error) {
    StructuredLogger.error('Erro no seed de dados de analytics', error as Error);
    console.error('❌ Erro no seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed
seedAnalyticsData();