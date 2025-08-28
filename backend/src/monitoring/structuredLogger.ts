import { logger } from '../config/logger.js';
import { LogSanitizer } from '../utils/logSanitizer.js';

export interface LogContext {
  requestId?: string;
  userId?: string;
  tenantId?: string;
  action?: string;
  resource?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  metadata?: Record<string, any>;
}

export interface ErrorLogContext extends LogContext {
  errorCode?: string;
  errorType?: string;
  stackTrace?: string;
}

export class StructuredLogger {
  private static createBaseEntry(level: string, message: string, context: LogContext = {}) {
    return {
      level,
      timestamp: new Date().toISOString(),
      message: LogSanitizer.sanitizeString(message),
      service: 'digiurban-backend',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      ...LogSanitizer.sanitize(context)
    };
  }

  static info(message: string, context: LogContext = {}) {
    const logEntry = this.createBaseEntry('info', message, context);
    logger.info(logEntry);
  }

  static warn(message: string, context: LogContext = {}) {
    const logEntry = this.createBaseEntry('warn', message, context);
    logger.warn(logEntry);
  }

  static error(message: string, error?: Error | any, context: ErrorLogContext = {}) {
    const errorInfo = error ? {
      errorName: error.name,
      errorMessage: LogSanitizer.sanitizeString(error.message || ''),
      errorCode: context.errorCode || error.code,
      errorType: context.errorType || 'application_error',
      stackTrace: error.stack ? LogSanitizer.sanitizeString(error.stack) : undefined
    } : undefined;

    const logEntry = {
      ...this.createBaseEntry('error', message, context),
      error: errorInfo
    };

    logger.error(logEntry);
  }

  static debug(message: string, context: LogContext = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = this.createBaseEntry('debug', message, context);
      logger.debug(logEntry);
    }
  }

  static audit(action: string, context: LogContext & {
    success: boolean;
    details?: string;
  }) {
    const auditEntry = {
      ...this.createBaseEntry('info', `AUDIT: ${action}`, context),
      type: 'audit',
      severity: 'high',
      category: 'security',
      success: context.success
    };

    logger.info(auditEntry);
  }

  static security(event: string, context: LogContext & {
    severity: 'low' | 'medium' | 'high' | 'critical';
    threat?: string;
    source?: string;
  }) {
    const securityEntry = {
      ...this.createBaseEntry('warn', `SECURITY: ${event}`, context),
      type: 'security',
      category: 'threat_detection'
    };

    // Para eventos críticos, usar nível error
    if (context.severity === 'critical') {
      securityEntry.level = 'error';
      logger.error(securityEntry);
    } else {
      logger.warn(securityEntry);
    }
  }

  static performance(operation: string, context: LogContext & {
    duration: number;
    threshold?: number;
  }) {
    const performanceEntry = {
      ...this.createBaseEntry('info', `PERFORMANCE: ${operation}`, context),
      type: 'performance',
      category: 'metrics'
    };

    // Se duração exceder threshold, logar como warning
    if (context.threshold && context.duration > context.threshold) {
      performanceEntry.level = 'warn';
      performanceEntry.message = `SLOW OPERATION: ${operation}`;
      logger.warn(performanceEntry);
    } else {
      logger.info(performanceEntry);
    }
  }

  static database(operation: string, context: LogContext & {
    query?: string;
    duration?: number;
    affectedRows?: number;
    error?: boolean;
  }) {
    const dbEntry = {
      ...this.createBaseEntry('info', `DATABASE: ${operation}`, context),
      type: 'database',
      category: 'persistence'
    };

    if (context.error) {
      dbEntry.level = 'error';
      logger.error(dbEntry);
    } else if (context.duration && context.duration > 1000) { // > 1 segundo
      dbEntry.level = 'warn';
      dbEntry.message = `SLOW DATABASE: ${operation}`;
      logger.warn(dbEntry);
    } else {
      logger.info(dbEntry);
    }
  }

  static business(event: string, context: LogContext & {
    entityType?: string;
    entityId?: string;
    operation?: 'create' | 'read' | 'update' | 'delete';
    oldValue?: any;
    newValue?: any;
  }) {
    const businessEntry = {
      ...this.createBaseEntry('info', `BUSINESS: ${event}`, context),
      type: 'business',
      category: 'workflow'
    };

    logger.info(businessEntry);
  }

  static request(method: string, url: string, context: LogContext & {
    responseTime: number;
    statusCode: number;
    requestSize?: number;
    responseSize?: number;
  }) {
    const requestEntry = {
      ...this.createBaseEntry('info', `REQUEST: ${method} ${url}`, context),
      type: 'request',
      category: 'http'
    };

    // Diferentes níveis baseados no status code
    if (context.statusCode >= 500) {
      requestEntry.level = 'error';
      logger.error(requestEntry);
    } else if (context.statusCode >= 400) {
      requestEntry.level = 'warn';
      logger.warn(requestEntry);
    } else if (context.responseTime > 5000) { // > 5 segundos
      requestEntry.level = 'warn';
      requestEntry.message = `SLOW REQUEST: ${method} ${url}`;
      logger.warn(requestEntry);
    } else {
      logger.info(requestEntry);
    }
  }

  // Método para criar middleware que injeta contexto automaticamente
  static createRequestLogger() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const requestId = req.headers['x-request-id'] || 
                       req.get('X-Request-ID') || 
                       `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Injetar contexto na request
      req.logContext = {
        requestId,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl || req.url,
        tenantId: req.tenant?.id,
        userId: req.user?.id
      };

      // Log da request inicial
      this.request(req.method, req.originalUrl || req.url, {
        ...req.logContext,
        responseTime: 0,
        statusCode: 0,
        requestSize: req.get('Content-Length') ? parseInt(req.get('Content-Length')) : undefined
      });

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        
        this.request(req.method, req.originalUrl || req.url, {
          ...req.logContext,
          responseTime,
          statusCode: res.statusCode,
          responseSize: res.get('Content-Length') ? parseInt(res.get('Content-Length')) : undefined
        });
      });

      next();
    };
  }
}

// Função helper para contexto de request
export const withRequestContext = (req: any, additionalContext: LogContext = {}): LogContext => {
  return {
    ...req.logContext,
    ...additionalContext
  };
};