// ====================================================================
// 🔍 SCRIPT DE VALIDAÇÃO - SISTEMA DE ANALYTICS
// ====================================================================
// Script para validar o sistema de analytics com dados reais
// Testa performance, cache, queries otimizadas e métricas
// ====================================================================

import { PrismaClient } from '@prisma/client';
import { StructuredLogger } from '../monitoring/structuredLogger.js';
import { createOptimizedQueries } from '../services/optimizedQueries.js';
import { cacheService } from '../services/cacheService.js';
import { performance } from 'perf_hooks';

interface ValidationResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  executionTime: number;
  details: any;
  error?: string;
}

interface SystemValidationReport {
  timestamp: Date;
  overall_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  warning_tests: number;
  total_execution_time: number;
  results: ValidationResult[];
  recommendations: string[];
}

class AnalyticsSystemValidator {
  private prisma: PrismaClient;
  private optimizedQueries: any;
  private results: ValidationResult[] = [];

  constructor() {
    this.prisma = new PrismaClient();
    this.optimizedQueries = createOptimizedQueries(this.prisma);
  }

  async runFullValidation(): Promise<SystemValidationReport> {
    const startTime = performance.now();

    StructuredLogger.info('🚀 Iniciando validação completa do sistema de analytics');

    // Limpar resultados anteriores
    this.results = [];

    // Executar testes de validação
    await this.validateDatabaseStructure();
    await this.validateDataIntegrity();
    await this.validateOptimizedQueries();
    await this.validateCacheSystem();
    await this.validatePerformanceMetrics();
    await this.validateIndexUsage();
    await this.validateSystemHealth();

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Gerar relatório final
    const report = this.generateReport(totalTime);
    await this.logReport(report);

    return report;
  }

  // ================================================================
  // VALIDAÇÃO DA ESTRUTURA DO BANCO
  // ================================================================

  async validateDatabaseStructure(): Promise<void> {
    const startTime = performance.now();

    try {
      StructuredLogger.info('📋 Validando estrutura do banco de dados');

      // Verificar existência das tabelas principais
      const tables = [
        'analytics_user_sessions',
        'feature_usage',
        'page_views',
        'module_analytics',
        'geographic_data',
        'system_metrics'
      ];

      const missingTables = [];
      for (const table of tables) {
        try {
          const count = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${table} LIMIT 1`);
          StructuredLogger.debug(`✅ Tabela ${table} existe`);
        } catch (error) {
          missingTables.push(table);
          StructuredLogger.error(`❌ Tabela ${table} não encontrada`, error as Error);
        }
      }

      // Verificar índices críticos
      const criticalIndexes = [
        'idx_analytics_sessions_started_at',
        'idx_feature_usage_date_desc',
        'idx_page_views_created_at',
        'idx_geographic_data_period'
      ];

      const indexInfo = await this.prisma.$queryRaw`
        SELECT name FROM sqlite_master
        WHERE type = 'index'
        AND name IN (${criticalIndexes.join("', '")})
      `;

      const executionTime = performance.now() - startTime;

      this.results.push({
        testName: 'Database Structure Validation',
        status: missingTables.length === 0 ? 'PASS' : 'FAIL',
        executionTime,
        details: {
          total_tables: tables.length,
          missing_tables: missingTables,
          available_indexes: indexInfo,
          critical_indexes: criticalIndexes.length
        },
        error: missingTables.length > 0 ? `Tabelas faltando: ${missingTables.join(', ')}` : undefined
      });

    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.results.push({
        testName: 'Database Structure Validation',
        status: 'FAIL',
        executionTime,
        details: {},
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // ================================================================
  // VALIDAÇÃO DA INTEGRIDADE DOS DADOS
  // ================================================================

  async validateDataIntegrity(): Promise<void> {
    const startTime = performance.now();

    try {
      StructuredLogger.info('🔍 Validando integridade dos dados');

      // Contar registros por tabela
      const sessionCount = await this.prisma.analyticsUserSession.count();
      const featureCount = await this.prisma.featureUsage.count();
      const pageViewCount = await this.prisma.pageViews.count();
      const geographicCount = await this.prisma.geographicData.count();

      // Verificar relacionamentos
      const sessionsWithInvalidUsers = await this.prisma.analyticsUserSession.count({
        where: {
          user: null
        }
      });

      const featuresWithInvalidUsers = await this.prisma.featureUsage.count({
        where: {
          user: null
        }
      });

      // Verificar consistência temporal
      const futureData = await this.prisma.analyticsUserSession.count({
        where: {
          startedAt: {
            gt: new Date()
          }
        }
      });

      // Verificar dados órfãos
      const orphanedPageViews = await this.prisma.pageViews.count({
        where: {
          sessionId: null
        }
      });

      const executionTime = performance.now() - startTime;
      const hasIntegrityIssues = sessionsWithInvalidUsers > 0 ||
                                featuresWithInvalidUsers > 0 ||
                                futureData > 0 ||
                                orphanedPageViews > 0;

      this.results.push({
        testName: 'Data Integrity Validation',
        status: hasIntegrityIssues ? 'WARNING' : 'PASS',
        executionTime,
        details: {
          record_counts: {
            sessions: sessionCount,
            features: featureCount,
            page_views: pageViewCount,
            geographic: geographicCount
          },
          integrity_issues: {
            sessions_with_invalid_users: sessionsWithInvalidUsers,
            features_with_invalid_users: featuresWithInvalidUsers,
            future_data_entries: futureData,
            orphaned_page_views: orphanedPageViews
          }
        },
        error: hasIntegrityIssues ? 'Problemas de integridade encontrados' : undefined
      });

    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.results.push({
        testName: 'Data Integrity Validation',
        status: 'FAIL',
        executionTime,
        details: {},
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // ================================================================
  // VALIDAÇÃO DAS QUERIES OTIMIZADAS
  // ================================================================

  async validateOptimizedQueries(): Promise<void> {
    const startTime = performance.now();

    try {
      StructuredLogger.info('⚡ Validando queries otimizadas');

      const queryTests = [];

      // Teste 1: Analytics Overview
      const overviewStart = performance.now();
      const overview = await this.optimizedQueries.getAnalyticsOverviewOptimized(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      const overviewTime = performance.now() - overviewStart;
      queryTests.push({
        name: 'Analytics Overview',
        time: overviewTime,
        success: !!overview.sessionStats
      });

      // Teste 2: Geographic Data
      const geoStart = performance.now();
      const geographic = await this.optimizedQueries.getGeographicDataOptimized('current', 'estado');
      const geoTime = performance.now() - geoStart;
      queryTests.push({
        name: 'Geographic Data',
        time: geoTime,
        success: Array.isArray(geographic.data)
      });

      // Teste 3: Module Analytics
      const moduleStart = performance.now();
      const modules = await this.optimizedQueries.getModuleAnalyticsOptimized('current');
      const moduleTime = performance.now() - moduleStart;
      queryTests.push({
        name: 'Module Analytics',
        time: moduleTime,
        success: Array.isArray(modules.data)
      });

      // Teste 4: Feature Usage
      const featureStart = performance.now();
      const features = await this.optimizedQueries.getFeatureUsageOptimized(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      const featureTime = performance.now() - featureStart;
      queryTests.push({
        name: 'Feature Usage',
        time: featureTime,
        success: Array.isArray(features.features)
      });

      // Teste 5: Dashboard Metrics
      const dashboardStart = performance.now();
      const dashboard = await this.optimizedQueries.getDashboardMetricsOptimized();
      const dashboardTime = performance.now() - dashboardStart;
      queryTests.push({
        name: 'Dashboard Metrics',
        time: dashboardTime,
        success: !!dashboard.tenantMetrics
      });

      const executionTime = performance.now() - startTime;
      const failedQueries = queryTests.filter(q => !q.success);
      const avgQueryTime = queryTests.reduce((sum, q) => sum + q.time, 0) / queryTests.length;
      const slowQueries = queryTests.filter(q => q.time > 1000); // > 1 segundo

      this.results.push({
        testName: 'Optimized Queries Validation',
        status: failedQueries.length === 0 ? (slowQueries.length === 0 ? 'PASS' : 'WARNING') : 'FAIL',
        executionTime,
        details: {
          total_queries: queryTests.length,
          failed_queries: failedQueries.length,
          slow_queries: slowQueries.length,
          average_query_time: Math.round(avgQueryTime),
          query_results: queryTests.map(q => ({
            name: q.name,
            time_ms: Math.round(q.time),
            success: q.success
          }))
        },
        error: failedQueries.length > 0 ? `${failedQueries.length} queries falharam` :
               slowQueries.length > 0 ? `${slowQueries.length} queries lentas` : undefined
      });

    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.results.push({
        testName: 'Optimized Queries Validation',
        status: 'FAIL',
        executionTime,
        details: {},
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // ================================================================
  // VALIDAÇÃO DO SISTEMA DE CACHE
  // ================================================================

  async validateCacheSystem(): Promise<void> {
    const startTime = performance.now();

    try {
      StructuredLogger.info('💾 Validando sistema de cache');

      // Teste de health check do cache
      const healthCheck = await cacheService.healthCheck();

      // Teste de operações básicas
      const testKey = 'validation-test';
      const testData = { timestamp: Date.now(), test: true };

      // Teste de escrita
      const setResult = await cacheService.set(testKey, testData, 60);

      // Teste de leitura
      const getValue = await cacheService.get(testKey);

      // Teste de remoção
      const deleteResult = await cacheService.delete(testKey);

      // Teste de métodos específicos de analytics
      const dashboardData = { users: 100, revenue: 5000 };
      const setDashboard = await cacheService.setDashboardMetrics(dashboardData);
      const getDashboard = await cacheService.getDashboardMetrics();

      // Obter métricas do cache
      const metrics = cacheService.getMetrics();

      const executionTime = performance.now() - startTime;
      const cacheWorking = setResult && getValue && getValue.test === true && deleteResult;

      this.results.push({
        testName: 'Cache System Validation',
        status: healthCheck.status === 'healthy' && cacheWorking ? 'PASS' :
                healthCheck.status === 'degraded' ? 'WARNING' : 'FAIL',
        executionTime,
        details: {
          health_status: healthCheck.status,
          basic_operations: {
            set: setResult,
            get: getValue !== null,
            delete: deleteResult
          },
          analytics_methods: {
            dashboard_set: setDashboard,
            dashboard_get: getDashboard !== null
          },
          metrics: {
            hit_rate: metrics.hitRate,
            total_keys: metrics.totalKeys,
            memory_usage: metrics.memoryUsage
          },
          provider: healthCheck.details?.provider || 'unknown'
        },
        error: healthCheck.status === 'unhealthy' ? 'Cache system unhealthy' : undefined
      });

    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.results.push({
        testName: 'Cache System Validation',
        status: 'FAIL',
        executionTime,
        details: {},
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // ================================================================
  // VALIDAÇÃO DAS MÉTRICAS DE PERFORMANCE
  // ================================================================

  async validatePerformanceMetrics(): Promise<void> {
    const startTime = performance.now();

    try {
      StructuredLogger.info('📊 Validando métricas de performance');

      // Obter estatísticas de performance das queries
      const queryStats = await this.optimizedQueries.getQueryPerformanceStats();

      // Teste de carga - executar múltiplas queries em paralelo
      const loadTestStart = performance.now();
      const concurrentQueries = 5;
      const promises = Array(concurrentQueries).fill(null).map(() =>
        this.optimizedQueries.getAnalyticsOverviewOptimized(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )
      );

      await Promise.all(promises);
      const loadTestTime = performance.now() - loadTestStart;

      // Verificar uso de memória atual
      const memoryUsage = process.memoryUsage();

      // Calcular métricas
      const avgLoadTime = loadTestTime / concurrentQueries;
      const memoryMB = memoryUsage.heapUsed / 1024 / 1024;

      const executionTime = performance.now() - startTime;
      const performanceGood = queryStats.avgQueryTime < 2000 && avgLoadTime < 5000 && memoryMB < 500;

      this.results.push({
        testName: 'Performance Metrics Validation',
        status: performanceGood ? 'PASS' : 'WARNING',
        executionTime,
        details: {
          query_performance: {
            avg_query_time: queryStats.avgQueryTime,
            slow_queries: queryStats.slowQueries,
            total_queries: queryStats.totalQueries,
            cache_hit_rate: queryStats.cacheHitRate
          },
          load_test: {
            concurrent_queries: concurrentQueries,
            total_time: Math.round(loadTestTime),
            avg_time_per_query: Math.round(avgLoadTime)
          },
          memory_usage: {
            heap_used_mb: Math.round(memoryMB),
            heap_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external_mb: Math.round(memoryUsage.external / 1024 / 1024)
          }
        },
        error: !performanceGood ? 'Performance abaixo do esperado' : undefined
      });

    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.results.push({
        testName: 'Performance Metrics Validation',
        status: 'FAIL',
        executionTime,
        details: {},
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // ================================================================
  // VALIDAÇÃO DO USO DE ÍNDICES
  // ================================================================

  async validateIndexUsage(): Promise<void> {
    const startTime = performance.now();

    try {
      StructuredLogger.info('🔍 Validando uso de índices');

      // Analisar planos de execução das queries principais
      const queryPlans = [];

      try {
        const analyticsOverviewPlan = await this.optimizedQueries.analyzeQueryPlan('analytics_overview');
        queryPlans.push({
          name: 'analytics_overview',
          plan: analyticsOverviewPlan,
          uses_index: this.checkIndexUsage(analyticsOverviewPlan)
        });
      } catch (error) {
        StructuredLogger.warn('Não foi possível analisar plano da query analytics_overview', { error });
      }

      try {
        const featureUsagePlan = await this.optimizedQueries.analyzeQueryPlan('feature_usage');
        queryPlans.push({
          name: 'feature_usage',
          plan: featureUsagePlan,
          uses_index: this.checkIndexUsage(featureUsagePlan)
        });
      } catch (error) {
        StructuredLogger.warn('Não foi possível analisar plano da query feature_usage', { error });
      }

      // Verificar estatísticas do SQLite
      const sqliteStats = await this.prisma.$queryRaw`ANALYZE`;

      const executionTime = performance.now() - startTime;
      const allQueriesUseIndex = queryPlans.every(q => q.uses_index);

      this.results.push({
        testName: 'Index Usage Validation',
        status: allQueriesUseIndex ? 'PASS' : 'WARNING',
        executionTime,
        details: {
          analyzed_queries: queryPlans.length,
          queries_using_indexes: queryPlans.filter(q => q.uses_index).length,
          query_plans: queryPlans.map(q => ({
            name: q.name,
            uses_index: q.uses_index
          })),
          sqlite_analyzed: !!sqliteStats
        },
        error: !allQueriesUseIndex ? 'Algumas queries não estão usando índices eficientemente' : undefined
      });

    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.results.push({
        testName: 'Index Usage Validation',
        status: 'FAIL',
        executionTime,
        details: {},
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  private checkIndexUsage(plan: any[]): boolean {
    if (!Array.isArray(plan)) return false;

    // Procurar por uso de índices no plano de execução
    return plan.some(step =>
      typeof step === 'object' &&
      step &&
      'detail' in step &&
      typeof step.detail === 'string' &&
      (step.detail.includes('USING INDEX') || step.detail.includes('SEARCH'))
    );
  }

  // ================================================================
  // VALIDAÇÃO DA SAÚDE GERAL DO SISTEMA
  // ================================================================

  async validateSystemHealth(): Promise<void> {
    const startTime = performance.now();

    try {
      StructuredLogger.info('🏥 Validando saúde geral do sistema');

      // Verificar conectividade com o banco
      const dbConnection = await this.prisma.$queryRaw`SELECT 1 as test`;

      // Verificar espaço em disco (simulado)
      const diskSpace = {
        total: 100 * 1024 * 1024 * 1024, // 100GB
        used: 30 * 1024 * 1024 * 1024,   // 30GB
        available: 70 * 1024 * 1024 * 1024 // 70GB
      };

      // Verificar contadores básicos
      const totalSessions = await this.prisma.analyticsUserSession.count();
      const totalUsers = await this.prisma.user.count({ where: { ativo: true } });
      const totalTenants = await this.prisma.tenant.count({ where: { status: 'ATIVO' } });

      // Verificar dados recentes
      const recentSessions = await this.prisma.analyticsUserSession.count({
        where: {
          startedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24h
          }
        }
      });

      const executionTime = performance.now() - startTime;
      const systemHealthy = Array.isArray(dbConnection) &&
                          totalSessions > 0 &&
                          totalUsers > 0 &&
                          totalTenants > 0;

      this.results.push({
        testName: 'System Health Validation',
        status: systemHealthy ? 'PASS' : 'WARNING',
        executionTime,
        details: {
          database_connection: Array.isArray(dbConnection),
          disk_space: {
            total_gb: Math.round(diskSpace.total / (1024 * 1024 * 1024)),
            available_gb: Math.round(diskSpace.available / (1024 * 1024 * 1024)),
            usage_percent: Math.round((diskSpace.used / diskSpace.total) * 100)
          },
          data_counts: {
            total_sessions: totalSessions,
            total_users: totalUsers,
            total_tenants: totalTenants,
            recent_sessions_24h: recentSessions
          },
          data_freshness: {
            has_recent_data: recentSessions > 0,
            last_24h_sessions: recentSessions
          }
        },
        error: !systemHealthy ? 'Sistema com problemas de saúde detectados' : undefined
      });

    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.results.push({
        testName: 'System Health Validation',
        status: 'FAIL',
        executionTime,
        details: {},
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // ================================================================
  // GERAÇÃO DO RELATÓRIO
  // ================================================================

  private generateReport(totalExecutionTime: number): SystemValidationReport {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    if (failed > 0) {
      overallStatus = 'CRITICAL';
    } else if (warnings > 0) {
      overallStatus = 'DEGRADED';
    } else {
      overallStatus = 'HEALTHY';
    }

    const recommendations = this.generateRecommendations();

    return {
      timestamp: new Date(),
      overall_status: overallStatus,
      total_tests: this.results.length,
      passed_tests: passed,
      failed_tests: failed,
      warning_tests: warnings,
      total_execution_time: Math.round(totalExecutionTime),
      results: this.results,
      recommendations
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Analisar resultados e gerar recomendações
    const performanceResult = this.results.find(r => r.testName === 'Performance Metrics Validation');
    if (performanceResult && performanceResult.status === 'WARNING') {
      recommendations.push('Considere otimizar queries que estão executando lentamente');
      recommendations.push('Monitore o uso de memória do sistema');
    }

    const cacheResult = this.results.find(r => r.testName === 'Cache System Validation');
    if (cacheResult && cacheResult.status !== 'PASS') {
      recommendations.push('Configure Redis para melhorar performance do cache');
    }

    const indexResult = this.results.find(r => r.testName === 'Index Usage Validation');
    if (indexResult && indexResult.status === 'WARNING') {
      recommendations.push('Revise os índices do banco de dados para melhorar performance');
    }

    const integrityResult = this.results.find(r => r.testName === 'Data Integrity Validation');
    if (integrityResult && integrityResult.status === 'WARNING') {
      recommendations.push('Execute limpeza de dados órfãos no banco');
    }

    if (recommendations.length === 0) {
      recommendations.push('Sistema funcionando dentro dos parâmetros esperados');
    }

    return recommendations;
  }

  private async logReport(report: SystemValidationReport): Promise<void> {
    StructuredLogger.info('📋 Relatório de Validação do Sistema de Analytics', {
      overall_status: report.overall_status,
      total_tests: report.total_tests,
      passed: report.passed_tests,
      failed: report.failed_tests,
      warnings: report.warning_tests,
      execution_time: report.total_execution_time
    });

    // Log detalhado de cada teste
    report.results.forEach(result => {
      const logLevel = result.status === 'FAIL' ? 'error' :
                      result.status === 'WARNING' ? 'warn' : 'info';

      StructuredLogger[logLevel](`${result.status} - ${result.testName}`, {
        execution_time: result.executionTime,
        details: result.details,
        error: result.error
      });
    });

    // Log recomendações
    if (report.recommendations.length > 0) {
      StructuredLogger.info('💡 Recomendações:', {
        recommendations: report.recommendations
      });
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// ================================================================
// EXECUÇÃO DO SCRIPT
// ================================================================

async function main() {
  const validator = new AnalyticsSystemValidator();

  try {
    const report = await validator.runFullValidation();

    console.log('\n=================================================');
    console.log('🔍 RELATÓRIO DE VALIDAÇÃO - SISTEMA DE ANALYTICS');
    console.log('=================================================');
    console.log(`Status Geral: ${report.overall_status}`);
    console.log(`Testes Executados: ${report.total_tests}`);
    console.log(`✅ Passou: ${report.passed_tests}`);
    console.log(`⚠️  Avisos: ${report.warning_tests}`);
    console.log(`❌ Falhou: ${report.failed_tests}`);
    console.log(`⏱️  Tempo Total: ${report.total_execution_time}ms`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recomendações:');
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log('\n=================================================');

    // Retornar código de saída apropriado
    process.exit(report.overall_status === 'CRITICAL' ? 1 : 0);

  } catch (error) {
    StructuredLogger.error('Erro na validação do sistema', error as Error);
    console.error('❌ Erro na validação do sistema:', error);
    process.exit(1);
  } finally {
    await validator.disconnect();
  }
}

// Executar script automaticamente
main();

export { AnalyticsSystemValidator };
export type { SystemValidationReport, ValidationResult };