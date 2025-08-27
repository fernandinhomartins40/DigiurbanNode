// =====================================================
// SISTEMA DE MONITORAMENTO DE PERFORMANCE
// =====================================================

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
  type: 'database' | 'api' | 'render' | 'user_action' | 'cache' | 'upload';
  success: boolean;
  error?: string;
}

interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  errorCount: number;
  recentOperations: PerformanceMetric[];
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private activeMetrics = new Map<string, PerformanceMetric>();
  private maxStoredMetrics = 1000;
  private perfObserver?: PerformanceObserver;

  constructor() {
    this.initializeWebVitals();
    this.setupNavigationTiming();
  }

  // Iniciar medição de performance
  start(name: string, type: PerformanceMetric['type'], metadata?: Record<string, any>): string {
    const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      type,
      metadata,
      success: false
    };

    this.activeMetrics.set(id, metric);
    console.log(`[PERF] Start: ${name} (${type})`);
    
    return id;
  }

  // Finalizar medição de performance
  end(id: string, success: boolean = true, error?: string): PerformanceMetric | null {
    const metric = this.activeMetrics.get(id);
    
    if (!metric) {
      console.warn(`[PERF] Metric not found: ${id}`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;
    metric.error = error;

    this.activeMetrics.delete(id);
    this.storeMetric(metric);

    const status = success ? 'SUCCESS' : 'ERROR';
    const duration = metric.duration.toFixed(2);
    console.log(`[PERF] End: ${metric.name} - ${status} (${duration}ms)`);

    // Alertas para operações lentas
    if (metric.duration > this.getSlowThreshold(metric.type)) {
      console.warn(`[PERF] SLOW OPERATION: ${metric.name} took ${duration}ms`);
      this.reportSlowOperation(metric);
    }

    return metric;
  }

  // Medir operação completa
  async measure<T>(
    name: string,
    type: PerformanceMetric['type'],
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const id = this.start(name, type, metadata);
    
    try {
      const result = await operation();
      this.end(id, true);
      return result;
    } catch (error) {
      this.end(id, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // Armazenar métrica
  private storeMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Limitar tamanho do array
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-this.maxStoredMetrics);
    }
  }

  // Obter threshold para operação lenta baseado no tipo
  private getSlowThreshold(type: PerformanceMetric['type']): number {
    const thresholds = {
      database: 1000,    // 1 segundo
      api: 2000,         // 2 segundos
      render: 100,       // 100ms
      user_action: 300,  // 300ms
      cache: 50,         // 50ms
      upload: 5000       // 5 segundos
    };
    
    return thresholds[type] || 1000;
  }

  // Reportar operação lenta
  private reportSlowOperation(metric: PerformanceMetric): void {
    // Aqui você pode integrar com serviços como Sentry, DataDog, etc.
    if (import.meta.env.PROD) {
      // Exemplo de integração com Sentry
      // Sentry.addBreadcrumb({
      //   message: `Slow operation: ${metric.name}`,
      //   level: 'warning',
      //   data: metric
      // });
    }
  }

  // Obter estatísticas de performance
  getStats(type?: PerformanceMetric['type'], timeWindow?: number): PerformanceStats {
    let filteredMetrics = this.metrics;

    // Filtrar por tipo
    if (type) {
      filteredMetrics = filteredMetrics.filter(m => m.type === type);
    }

    // Filtrar por janela de tempo (em minutos)
    if (timeWindow) {
      const cutoff = Date.now() - (timeWindow * 60 * 1000);
      filteredMetrics = filteredMetrics.filter(m => 
        (m.endTime || m.startTime) > cutoff
      );
    }

    if (filteredMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        errorCount: 0,
        recentOperations: []
      };
    }

    const durations = filteredMetrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!);
    
    const successCount = filteredMetrics.filter(m => m.success).length;
    const errorCount = filteredMetrics.length - successCount;

    return {
      totalOperations: filteredMetrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successCount / filteredMetrics.length) * 100,
      errorCount,
      recentOperations: filteredMetrics.slice(-10)
    };
  }

  // Obter métricas mais lentas
  getSlowestOperations(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .filter(m => m.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, limit);
  }

  // Inicializar Web Vitals
  private initializeWebVitals(): void {
    // Verificar se estamos no browser
    if (typeof window === 'undefined') return;

    // FCP (First Contentful Paint)
    this.observePerformanceEntry('first-contentful-paint', (entry) => {
      this.storeMetric({
        name: 'First Contentful Paint',
        type: 'render',
        startTime: 0,
        endTime: entry.startTime,
        duration: entry.startTime,
        success: entry.startTime < 1800, // Good: < 1.8s
        metadata: { type: 'web-vital' }
      });
    });

    // LCP (Largest Contentful Paint)
    this.observePerformanceEntry('largest-contentful-paint', (entry) => {
      this.storeMetric({
        name: 'Largest Contentful Paint',
        type: 'render',
        startTime: 0,
        endTime: entry.startTime,
        duration: entry.startTime,
        success: entry.startTime < 2500, // Good: < 2.5s
        metadata: { type: 'web-vital' }
      });
    });

    // FID será capturado via event listeners
    this.setupFIDMeasurement();
  }

  // Configurar medição de timing de navegação
  private setupNavigationTiming(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // DNS Lookup
          this.storeMetric({
            name: 'DNS Lookup',
            type: 'api',
            startTime: navigation.domainLookupStart,
            endTime: navigation.domainLookupEnd,
            duration: navigation.domainLookupEnd - navigation.domainLookupStart,
            success: true,
            metadata: { type: 'navigation' }
          });

          // TCP Connection
          this.storeMetric({
            name: 'TCP Connection',
            type: 'api',
            startTime: navigation.connectStart,
            endTime: navigation.connectEnd,
            duration: navigation.connectEnd - navigation.connectStart,
            success: true,
            metadata: { type: 'navigation' }
          });

          // Page Load
          this.storeMetric({
            name: 'Page Load',
            type: 'render',
            startTime: navigation.fetchStart,
            endTime: navigation.loadEventEnd,
            duration: navigation.loadEventEnd - navigation.fetchStart,
            success: navigation.loadEventEnd - navigation.fetchStart < 3000,
            metadata: { type: 'navigation' }
          });
        }
      }, 0);
    });
  }

  // Observar entradas de performance específicas
  private observePerformanceEntry(entryType: string, callback: (entry: PerformanceEntry) => void): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      
      observer.observe({ entryTypes: [entryType] });
    } catch (error) {
      console.warn(`[PERF] Could not observe ${entryType}:`, error);
    }
  }

  // Configurar medição de FID (First Input Delay)
  private setupFIDMeasurement(): void {
    if (typeof window === 'undefined') return;

    let isFirstInput = true;
    
    const measureFID = (event: Event) => {
      if (!isFirstInput) return;
      isFirstInput = false;

      const eventTime = event.timeStamp;
      const processingStart = performance.now();
      
      requestIdleCallback(() => {
        const fid = processingStart - eventTime;
        
        this.storeMetric({
          name: 'First Input Delay',
          type: 'user_action',
          startTime: eventTime,
          endTime: processingStart,
          duration: fid,
          success: fid < 100, // Good: < 100ms
          metadata: { 
            type: 'web-vital',
            eventType: event.type 
          }
        });
      });
    };

    ['click', 'keydown', 'touchstart'].forEach(eventType => {
      window.addEventListener(eventType, measureFID, { once: true, passive: true });
    });
  }

  // Limpar métricas antigas
  clearOldMetrics(olderThanMinutes: number = 60): number {
    const cutoff = Date.now() - (olderThanMinutes * 60 * 1000);
    const initialLength = this.metrics.length;
    
    this.metrics = this.metrics.filter(m => 
      (m.endTime || m.startTime) > cutoff
    );
    
    const removed = initialLength - this.metrics.length;
    console.log(`[PERF] Cleared ${removed} old metrics`);
    
    return removed;
  }

  // Gerar relatório de performance
  generateReport(): string {
    const stats = this.getStats();
    const slowest = this.getSlowestOperations(5);
    
    return `
=== PERFORMANCE REPORT ===
Total Operations: ${stats.totalOperations}
Average Duration: ${stats.averageDuration.toFixed(2)}ms
Success Rate: ${stats.successRate.toFixed(1)}%
Error Count: ${stats.errorCount}

=== SLOWEST OPERATIONS ===
${slowest.map(m => `${m.name}: ${m.duration?.toFixed(2)}ms`).join('\n')}

=== BY TYPE ===
Database: ${this.getStats('database').averageDuration.toFixed(2)}ms avg
API: ${this.getStats('api').averageDuration.toFixed(2)}ms avg
Render: ${this.getStats('render').averageDuration.toFixed(2)}ms avg
User Actions: ${this.getStats('user_action').averageDuration.toFixed(2)}ms avg
Cache: ${this.getStats('cache').averageDuration.toFixed(2)}ms avg
Upload: ${this.getStats('upload').averageDuration.toFixed(2)}ms avg
    `.trim();
  }
}

// =====================================================
// INSTÂNCIA GLOBAL E HELPERS
// =====================================================

export const performanceMonitor = new PerformanceMonitor();

// Helper para medir operações do Supabase
export async function measureSupabaseOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.measure(operationName, 'database', operation, metadata);
}

// Helper para medir uploads
export async function measureUpload<T>(
  filename: string,
  operation: () => Promise<T>
): Promise<T> {
  return performanceMonitor.measure(`Upload: ${filename}`, 'upload', operation, { filename });
}

// Helper para medir ações do usuário
export async function measureUserAction<T>(
  actionName: string,
  operation: () => Promise<T>
): Promise<T> {
  return performanceMonitor.measure(actionName, 'user_action', operation);
}

// Hook para React
import { useEffect, useState } from 'react';

export const usePerformanceStats = (type?: PerformanceMetric['type'], timeWindow?: number) => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);

  useEffect(() => {
    const updateStats = () => {
      setStats(performanceMonitor.getStats(type, timeWindow));
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [type, timeWindow]);

  return stats;
};