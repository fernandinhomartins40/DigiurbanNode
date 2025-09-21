// ====================================================================
// 📊 MIDDLEWARE DE MONITORAMENTO DE PERFORMANCE
// ====================================================================
// Middleware para monitorar performance das APIs de analytics
// Coleta métricas de tempo de resposta, throughput e health
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  tenantId?: string;
  userId?: string;
  errorMessage?: string;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

export interface EndpointStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerMinute: number;
  lastUpdated: Date;
  errorRate: number;
}

// ====================================================================
// CLASSE DE MONITORAMENTO DE PERFORMANCE
// ====================================================================

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private stats: Map<string, EndpointStats> = new Map();
  private readonly MAX_METRICS_PER_ENDPOINT = 1000;

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Registrar métrica de performance
   */
  recordMetric(metric: PerformanceMetrics): void {
    const key = `${metric.method}:${metric.endpoint}`;

    // Armazenar métrica individual
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const endpointMetrics = this.metrics.get(key)!;
    endpointMetrics.push(metric);

    // Manter apenas as últimas N métricas para evitar vazamento de memória
    if (endpointMetrics.length > this.MAX_METRICS_PER_ENDPOINT) {
      endpointMetrics.shift();
    }

    // Atualizar estatísticas agregadas
    this.updateStats(key, metric);

    // Log estruturado da métrica
    this.logMetric(metric);
  }

  /**
   * Atualizar estatísticas agregadas
   */
  private updateStats(key: string, metric: PerformanceMetrics): void {
    const endpointMetrics = this.metrics.get(key)!;
    const isSuccess = metric.statusCode >= 200 && metric.statusCode < 400;

    // Calcular estatísticas
    const responseTimes = endpointMetrics.map(m => m.responseTime).sort((a, b) => a - b);
    const successCount = endpointMetrics.filter(m => m.statusCode >= 200 && m.statusCode < 400).length;
    const totalCount = endpointMetrics.length;

    // Calcular percentis
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    // Calcular requests por minuto (últimos 60 segundos)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentMetrics = endpointMetrics.filter(m => m.timestamp >= oneMinuteAgo);

    const stats: EndpointStats = {
      totalRequests: totalCount,
      successfulRequests: successCount,
      failedRequests: totalCount - successCount,
      avgResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      minResponseTime: responseTimes[0] || 0,
      maxResponseTime: responseTimes[responseTimes.length - 1] || 0,
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      requestsPerMinute: recentMetrics.length,
      lastUpdated: new Date(),
      errorRate: ((totalCount - successCount) / totalCount) * 100
    };

    this.stats.set(key, stats);
  }

  /**
   * Log estruturado da métrica
   */
  private logMetric(metric: PerformanceMetrics): void {
    const logData = {
      endpoint: metric.endpoint,
      method: metric.method,
      statusCode: metric.statusCode,
      responseTime: metric.responseTime,
      memoryUsageMB: Math.round(metric.memoryUsage.heapUsed / 1024 / 1024),
      tenantId: metric.tenantId,
      userId: metric.userId,
      userAgent: metric.userAgent?.substring(0, 100), // Truncar para logs
      ipAddress: metric.ipAddress
    };

    if (metric.statusCode >= 400) {
      StructuredLogger.warn('API request com erro', {
        ...logData,
        errorMessage: metric.errorMessage
      });
    } else if (metric.responseTime > 2000) {
      StructuredLogger.warn('API request lenta', logData);
    } else {
      StructuredLogger.info('API request processada', logData);
    }
  }

  /**
   * Obter estatísticas de um endpoint
   */
  getEndpointStats(method: string, endpoint: string): EndpointStats | null {
    const key = `${method}:${endpoint}`;
    return this.stats.get(key) || null;
  }

  /**
   * Obter estatísticas de todos os endpoints
   */
  getAllStats(): Map<string, EndpointStats> {
    return new Map(this.stats);
  }

  /**
   * Obter métricas de sistema geral
   */
  getSystemMetrics(): {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
    slowestEndpoints: Array<{ endpoint: string; avgResponseTime: number }>;
    healthScore: number;
  } {
    let totalRequests = 0;
    let totalResponseTime = 0;
    let totalErrors = 0;
    let totalRequestsPerMinute = 0;

    const endpointPerformance: Array<{ endpoint: string; avgResponseTime: number }> = [];

    for (const [endpoint, stats] of this.stats.entries()) {
      totalRequests += stats.totalRequests;
      totalResponseTime += stats.avgResponseTime * stats.totalRequests;
      totalErrors += stats.failedRequests;
      totalRequestsPerMinute += stats.requestsPerMinute;

      endpointPerformance.push({
        endpoint,
        avgResponseTime: stats.avgResponseTime
      });
    }

    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    // Calcular health score (0-100)
    let healthScore = 100;
    if (avgResponseTime > 1000) healthScore -= 20;
    if (avgResponseTime > 2000) healthScore -= 30;
    if (errorRate > 5) healthScore -= 25;
    if (errorRate > 10) healthScore -= 25;

    healthScore = Math.max(0, healthScore);

    return {
      totalRequests,
      avgResponseTime,
      errorRate,
      requestsPerMinute: totalRequestsPerMinute,
      slowestEndpoints: endpointPerformance
        .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
        .slice(0, 5),
      healthScore
    };
  }

  /**
   * Limpar métricas antigas
   */
  cleanup(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    for (const [key, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime);

      if (filteredMetrics.length === 0) {
        this.metrics.delete(key);
        this.stats.delete(key);
      } else {
        this.metrics.set(key, filteredMetrics);
        // Recalcular stats para métricas filtradas
        if (filteredMetrics.length > 0) {
          const lastMetric = filteredMetrics[filteredMetrics.length - 1];
          this.updateStats(key, lastMetric);
        }
      }
    }

    StructuredLogger.info('Limpeza de métricas de performance concluída', {
      cutoffTime,
      remainingEndpoints: this.stats.size
    });
  }
}

// ====================================================================
// MIDDLEWARE DE PERFORMANCE
// ====================================================================

export function performanceMonitoringMiddleware() {
  const monitor = PerformanceMonitor.getInstance();

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    // Capturar informações da requisição
    const originalUrl = req.originalUrl;
    const method = req.method;
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Capturar tenant e user se disponíveis
    const tenantId = (req as any).user?.tenant_id || (req as any).tenant?.id;
    const userId = (req as any).user?.id;

    // Interceptar o final da resposta
    const originalSend = res.send;
    let responseSent = false;

    res.send = function(data) {
      if (!responseSent) {
        responseSent = true;

        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        const endMemory = process.memoryUsage();

        // Criar métrica de performance
        const metric: PerformanceMetrics = {
          endpoint: originalUrl,
          method,
          statusCode: res.statusCode,
          responseTime,
          timestamp: new Date(),
          userAgent,
          ipAddress,
          tenantId,
          userId,
          memoryUsage: {
            heapUsed: endMemory.heapUsed,
            heapTotal: endMemory.heapTotal,
            external: endMemory.external
          }
        };

        // Adicionar mensagem de erro se houver
        if (res.statusCode >= 400) {
          try {
            const errorData = typeof data === 'string' ? JSON.parse(data) : data;
            metric.errorMessage = errorData?.error || errorData?.message || 'Unknown error';
          } catch (e) {
            metric.errorMessage = 'Parse error in response data';
          }
        }

        // Registrar métrica
        monitor.recordMetric(metric);
      }

      return originalSend.call(this, data);
    };

    next();
  };
}

// ====================================================================
// ENDPOINT DE MÉTRICAS
// ====================================================================

export function createMetricsEndpoint() {
  const monitor = PerformanceMonitor.getInstance();

  return (req: Request, res: Response) => {
    try {
      const systemMetrics = monitor.getSystemMetrics();
      const allStats = monitor.getAllStats();

      // Converter Map para Object para JSON
      const endpointStats: Record<string, EndpointStats> = {};
      for (const [key, stats] of allStats.entries()) {
        endpointStats[key] = stats;
      }

      const response = {
        system: systemMetrics,
        endpoints: endpointStats,
        generatedAt: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      };

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      StructuredLogger.error('Erro ao obter métricas de performance', error as Error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao obter métricas'
      });
    }
  };
}

// ====================================================================
// HEALTH CHECK ENDPOINT
// ====================================================================

export function createHealthCheckEndpoint() {
  const monitor = PerformanceMonitor.getInstance();

  return (req: Request, res: Response) => {
    try {
      const systemMetrics = monitor.getSystemMetrics();
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      // Determinar status de saúde
      let status = 'healthy';
      let details: string[] = [];

      if (systemMetrics.avgResponseTime > 2000) {
        status = 'degraded';
        details.push('Tempo de resposta elevado');
      }

      if (systemMetrics.errorRate > 10) {
        status = 'unhealthy';
        details.push('Taxa de erro elevada');
      }

      if (memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9) {
        status = 'degraded';
        details.push('Uso de memória elevado');
      }

      const response = {
        status,
        timestamp: new Date(),
        uptime: {
          seconds: uptime,
          formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
        },
        system: {
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            usage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
          },
          performance: {
            avgResponseTime: systemMetrics.avgResponseTime,
            errorRate: systemMetrics.errorRate,
            healthScore: systemMetrics.healthScore
          }
        },
        details: details.length > 0 ? details : ['Sistema funcionando normalmente']
      };

      const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
      res.status(statusCode).json(response);
    } catch (error) {
      StructuredLogger.error('Erro no health check', error as Error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date(),
        details: ['Erro interno no health check']
      });
    }
  };
}

// ====================================================================
// SETUP DE LIMPEZA AUTOMÁTICA
// ====================================================================

export function setupPerformanceMonitoringCleanup(): void {
  const monitor = PerformanceMonitor.getInstance();

  // Limpeza a cada 6 horas
  setInterval(() => {
    monitor.cleanup(24); // Manter métricas das últimas 24 horas
  }, 6 * 60 * 60 * 1000);

  StructuredLogger.info('Limpeza automática de métricas configurada');
}

// ====================================================================
// EXPORTS
// ====================================================================

export { PerformanceMonitor };
export default performanceMonitoringMiddleware;