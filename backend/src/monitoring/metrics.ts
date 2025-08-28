import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Configurar coletor padrão
client.collectDefaultMetrics({
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // Buckets para GC duration
  prefix: 'digiurban_',
});

// Métricas customizadas
export const metrics = {
  httpRequests: new client.Counter({
    name: 'digiurban_http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'tenant_id']
  }),

  httpDuration: new client.Histogram({
    name: 'digiurban_http_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
  }),

  activeUsers: new client.Gauge({
    name: 'digiurban_active_users',
    help: 'Currently active users',
    labelNames: ['tenant_id']
  }),

  dbConnections: new client.Gauge({
    name: 'digiurban_db_connections_active',
    help: 'Active database connections'
  }),

  dbQueryDuration: new client.Histogram({
    name: 'digiurban_db_query_duration_seconds',
    help: 'Database query duration in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5]
  }),

  authAttempts: new client.Counter({
    name: 'digiurban_auth_attempts_total',
    help: 'Authentication attempts',
    labelNames: ['result', 'tenant_id', 'method']
  }),

  rateLimitHits: new client.Counter({
    name: 'digiurban_rate_limit_hits_total',
    help: 'Rate limit hits',
    labelNames: ['endpoint', 'ip']
  }),

  errorCount: new client.Counter({
    name: 'digiurban_errors_total',
    help: 'Total errors by type',
    labelNames: ['error_type', 'endpoint', 'tenant_id']
  }),

  memoryUsage: new client.Gauge({
    name: 'digiurban_memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'] // heap_used, heap_total, external, etc.
  }),

  backupStatus: new client.Gauge({
    name: 'digiurban_backup_status',
    help: 'Backup status (1 = success, 0 = failed)',
    labelNames: ['type', 'timestamp']
  }),

  userSessions: new client.Gauge({
    name: 'digiurban_user_sessions_active',
    help: 'Active user sessions',
    labelNames: ['tenant_id']
  })
};

// Middleware para coleta automática
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const route = req.route?.path || req.path || 'unknown';
  
  // Extrair tenant_id se disponível
  const tenantId = (req as any).tenant?.id || req.headers['x-tenant-id'] || 'unknown';

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode.toString();
    
    // Incrementar contador de requests
    metrics.httpRequests.labels(req.method, route, statusCode, tenantId).inc();
    
    // Observar duração da request
    metrics.httpDuration.labels(req.method, route).observe(duration);
    
    // Contar erros
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      metrics.errorCount.labels(errorType, route, tenantId).inc();
    }
  });

  next();
};

// Função para atualizar métricas de sistema
export const updateSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  
  metrics.memoryUsage.labels('heap_used').set(memUsage.heapUsed);
  metrics.memoryUsage.labels('heap_total').set(memUsage.heapTotal);
  metrics.memoryUsage.labels('external').set(memUsage.external);
  metrics.memoryUsage.labels('rss').set(memUsage.rss);
};

// Inicializar coleta periódica de métricas de sistema
setInterval(updateSystemMetrics, 30000); // A cada 30 segundos

// Função para registrar tentativas de autenticação
export const recordAuthAttempt = (result: 'success' | 'failure', tenantId: string, method: 'password' | 'token' | 'refresh') => {
  metrics.authAttempts.labels(result, tenantId, method).inc();
};

// Função para registrar hits de rate limit
export const recordRateLimitHit = (endpoint: string, ip: string) => {
  metrics.rateLimitHits.labels(endpoint, ip).inc();
};

// Função para atualizar usuários ativos
export const updateActiveUsers = (tenantId: string, count: number) => {
  metrics.activeUsers.labels(tenantId).set(count);
};

// Função para registrar status de backup
export const recordBackupStatus = (type: 'auto' | 'manual', success: boolean) => {
  const timestamp = new Date().toISOString();
  metrics.backupStatus.labels(type, timestamp).set(success ? 1 : 0);
};

// Registry para export
export const register = client.register;

// Função para limpar métricas (útil para testes)
export const clearMetrics = () => {
  client.register.clear();
};