// ====================================================================
// 📊 QUERY PERFORMANCE MONITOR - DIGIURBAN SYSTEM
// ====================================================================
// Middleware para monitorar performance de queries e requisições
// Detecta queries lentas e monitora uso de recursos
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { SafeLogger } from '../config/logger.js';

// ====================================================================
// CONFIGURAÇÕES DE PERFORMANCE
// ====================================================================

export const PERFORMANCE_CONFIG = {
  // Thresholds para alertas
  SLOW_QUERY_THRESHOLD: 100, // ms
  VERY_SLOW_QUERY_THRESHOLD: 1000, // ms
  MEMORY_WARNING_THRESHOLD: 0.8, // 80% da heap
  
  // Sampling para logs (evitar spam)
  SAMPLE_RATE: 0.1, // 10% das requests
  
  // Headers de response time
  INCLUDE_RESPONSE_TIME_HEADER: true,
  
  // Performance metrics collection
  COLLECT_METRICS: process.env.NODE_ENV === 'production'
} as const;

// ====================================================================
// INTERFACES
// ====================================================================

interface PerformanceMetrics {
  requestCount: number;
  totalResponseTime: number;
  slowQueries: number;
  averageResponseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
}

interface QueryPerformanceData {
  method: string;
  path: string;
  responseTime: number;
  statusCode: number;
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
  timestamp: number;
}

// ====================================================================
// PERFORMANCE COLLECTOR
// ====================================================================

class PerformanceCollector {
  private static instance: PerformanceCollector;
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    totalResponseTime: 0,
    slowQueries: 0,
    averageResponseTime: 0,
    memoryUsage: process.memoryUsage()
  };

  static getInstance(): PerformanceCollector {
    if (!this.instance) {
      this.instance = new PerformanceCollector();
    }
    return this.instance;
  }

  recordRequest(data: QueryPerformanceData): void {
    this.metrics.requestCount++;
    this.metrics.totalResponseTime += data.responseTime;
    this.metrics.averageResponseTime = 
      this.metrics.totalResponseTime / this.metrics.requestCount;

    if (data.responseTime > PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD) {
      this.metrics.slowQueries++;
    }

    // Atualizar uso de memória periodicamente
    if (this.metrics.requestCount % 100 === 0) {
      this.metrics.memoryUsage = process.memoryUsage();
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      totalResponseTime: 0,
      slowQueries: 0,
      averageResponseTime: 0,
      memoryUsage: process.memoryUsage()
    };
  }
}

// ====================================================================
// PERFORMANCE MONITORING MIDDLEWARE
// ====================================================================

export const queryPerformanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = process.hrtime.bigint();
  const memoryBefore = process.memoryUsage().heapUsed;
  const collector = PerformanceCollector.getInstance();

  // Interceptar o final da response
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;

  const finishRequest = () => {
    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - startTime) / 1000000; // Convert to ms
    const memoryAfter = process.memoryUsage().heapUsed;
    const memoryDelta = memoryAfter - memoryBefore;

    const performanceData: QueryPerformanceData = {
      method: req.method,
      path: req.route?.path || req.path,
      responseTime: Math.round(responseTime * 100) / 100, // 2 decimal places
      statusCode: res.statusCode,
      memoryBefore,
      memoryAfter,
      memoryDelta,
      timestamp: Date.now()
    };

    // Coletar métricas
    if (PERFORMANCE_CONFIG.COLLECT_METRICS) {
      collector.recordRequest(performanceData);
    }

    // Adicionar header de response time
    if (PERFORMANCE_CONFIG.INCLUDE_RESPONSE_TIME_HEADER) {
      res.setHeader('X-Response-Time', `${performanceData.responseTime}ms`);
    }

    // Log de queries lentas
    if (responseTime > PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD) {
      const logLevel = responseTime > PERFORMANCE_CONFIG.VERY_SLOW_QUERY_THRESHOLD ? 'warn' : 'debug';
      
      SafeLogger[logLevel]('Query lenta detectada', {
        method: req.method,
        path: req.path,
        responseTime: `${performanceData.responseTime}ms`,
        statusCode: res.statusCode,
        memoryDelta: `${Math.round(memoryDelta / 1024)}KB`,
        userAgent: req.get('User-Agent')?.substring(0, 100),
        ip: req.ip
      });
    }

    // Log de uso de memória alto
    const currentMemory = process.memoryUsage();
    const memoryPercentage = currentMemory.heapUsed / currentMemory.heapTotal;

    if (memoryPercentage > PERFORMANCE_CONFIG.MEMORY_WARNING_THRESHOLD) {
      SafeLogger.warn('Alto uso de memória detectado', {
        heapUsed: `${Math.round(currentMemory.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(currentMemory.heapTotal / 1024 / 1024)}MB`,
        percentage: `${Math.round(memoryPercentage * 100)}%`,
        path: req.path
      });
    }

    // Sample logging para análise
    if (Math.random() < PERFORMANCE_CONFIG.SAMPLE_RATE) {
      SafeLogger.performance('Request sampled', performanceData.responseTime, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        memoryDelta: Math.round(memoryDelta / 1024)
      });
    }
  };

  // Override dos métodos de response
  res.send = function(body: any) {
    finishRequest();
    return originalSend.call(this, body);
  };

  res.json = function(body: any) {
    finishRequest();
    return originalJson.call(this, body);
  };

  res.end = function(chunk?: any, encoding?: any) {
    if (!res.headersSent) {
      finishRequest();
    }
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// ====================================================================
// QUERY PERFORMANCE ANALYZER
// ====================================================================

export class QueryPerformanceAnalyzer {
  private static queries: Map<string, {
    count: number;
    totalTime: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    lastSeen: Date;
  }> = new Map();

  static recordQuery(queryKey: string, executionTime: number): void {
    const existing = this.queries.get(queryKey);

    if (existing) {
      existing.count++;
      existing.totalTime += executionTime;
      existing.averageTime = existing.totalTime / existing.count;
      existing.minTime = Math.min(existing.minTime, executionTime);
      existing.maxTime = Math.max(existing.maxTime, executionTime);
      existing.lastSeen = new Date();
    } else {
      this.queries.set(queryKey, {
        count: 1,
        totalTime: executionTime,
        averageTime: executionTime,
        minTime: executionTime,
        maxTime: executionTime,
        lastSeen: new Date()
      });
    }

    // Log queries que ficaram mais lentas
    const stats = this.queries.get(queryKey)!;
    if (stats.count > 5 && executionTime > stats.averageTime * 2) {
      SafeLogger.warn('Query performance degradada', {
        queryKey: queryKey.substring(0, 100),
        currentTime: executionTime,
        averageTime: stats.averageTime,
        count: stats.count
      });
    }
  }

  static getSlowQueries(limit = 10): Array<{
    query: string;
    averageTime: number;
    count: number;
    maxTime: number;
  }> {
    return Array.from(this.queries.entries())
      .filter(([_, stats]) => stats.averageTime > PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD)
      .sort(([_, a], [__, b]) => b.averageTime - a.averageTime)
      .slice(0, limit)
      .map(([query, stats]) => ({
        query: query.substring(0, 200),
        averageTime: Math.round(stats.averageTime),
        count: stats.count,
        maxTime: Math.round(stats.maxTime)
      }));
  }

  static getQueryStats(): {
    totalQueries: number;
    uniqueQueries: number;
    slowQueries: number;
    averageTime: number;
  } {
    const queries = Array.from(this.queries.values());
    const totalQueries = queries.reduce((sum, q) => sum + q.count, 0);
    const totalTime = queries.reduce((sum, q) => sum + q.totalTime, 0);
    const slowQueries = queries.filter(q => q.averageTime > PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD).length;

    return {
      totalQueries,
      uniqueQueries: this.queries.size,
      slowQueries,
      averageTime: totalQueries > 0 ? Math.round(totalTime / totalQueries) : 0
    };
  }

  static clearStats(): void {
    this.queries.clear();
  }
}

// ====================================================================
// DATABASE PERFORMANCE WRAPPER
// ====================================================================

export const wrapDatabaseMethod = <T extends any[], R>(
  originalMethod: (...args: T) => Promise<R>,
  methodName: string
) => {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await originalMethod(...args);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Gerar chave da query (sanitizada)
      const queryKey = `${methodName}:${JSON.stringify(args).substring(0, 100)}`;
      
      QueryPerformanceAnalyzer.recordQuery(queryKey, executionTime);

      return result;
    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      SafeLogger.error(`Database ${methodName} failed`, error, {
        executionTime: Math.round(executionTime),
        args: JSON.stringify(args).substring(0, 200)
      });

      throw error;
    }
  };
};

// ====================================================================
// PERFORMANCE REPORT GENERATOR
// ====================================================================

export const generatePerformanceReport = (): {
  system: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    platform: string;
    nodeVersion: string;
  };
  http: PerformanceMetrics;
  database: {
    totalQueries: number;
    uniqueQueries: number;
    slowQueries: number;
    averageTime: number;
  };
  slowQueries: Array<{
    query: string;
    averageTime: number;
    count: number;
    maxTime: number;
  }>;
} => {
  const collector = PerformanceCollector.getInstance();

  return {
    system: {
      uptime: Math.round(process.uptime()),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    },
    http: collector.getMetrics(),
    database: QueryPerformanceAnalyzer.getQueryStats(),
    slowQueries: QueryPerformanceAnalyzer.getSlowQueries()
  };
};

// ====================================================================
// PERFORMANCE MIDDLEWARE PARA ROUTES ESPECÍFICAS
// ====================================================================

export const routePerformanceMonitor = (routeName: string, threshold = 500) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = performance.now();

    const originalSend = res.send;
    res.send = function(body: any) {
      const responseTime = performance.now() - startTime;

      if (responseTime > threshold) {
        SafeLogger.warn(`Rota lenta: ${routeName}`, {
          responseTime: Math.round(responseTime),
          threshold,
          method: req.method,
          statusCode: res.statusCode
        });
      }

      return originalSend.call(this, body);
    };

    next();
  };
};

// ====================================================================
// EXPORTAÇÕES
// ====================================================================

export default {
  queryPerformanceMonitor,
  routePerformanceMonitor,
  QueryPerformanceAnalyzer,
  generatePerformanceReport,
  wrapDatabaseMethod,
  PERFORMANCE_CONFIG
};