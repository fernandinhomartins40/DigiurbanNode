import winston from 'winston';
import { LogSanitizer } from '../utils/logSanitizer.js';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'digiurban-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export class SafeLogger {
  /**
   * Log info com sanitização automática
   */
  static info(message: string, meta?: any): void {
    const sanitizedMeta = meta ? LogSanitizer.sanitize(meta) : undefined;
    const sanitizedMessage = LogSanitizer.sanitizeString(message);
    
    logger.info(sanitizedMessage, sanitizedMeta);
  }

  /**
   * Log error com sanitização automática
   */
  static error(message: string, error?: any, meta?: any): void {
    const sanitizedMeta = meta ? LogSanitizer.sanitize(meta) : undefined;
    const sanitizedMessage = LogSanitizer.sanitizeString(message);
    const sanitizedError = error ? LogSanitizer.sanitizeError(error) : undefined;
    
    logger.error(sanitizedMessage, { 
      error: sanitizedError, 
      ...sanitizedMeta 
    });
  }

  /**
   * Log warning com sanitização automática
   */
  static warn(message: string, meta?: any): void {
    const sanitizedMeta = meta ? LogSanitizer.sanitize(meta) : undefined;
    const sanitizedMessage = LogSanitizer.sanitizeString(message);
    
    logger.warn(sanitizedMessage, sanitizedMeta);
  }

  /**
   * Log debug com sanitização automática
   */
  static debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'production') {
      return; // Não logar debug em produção
    }
    
    const sanitizedMeta = meta ? LogSanitizer.sanitize(meta) : undefined;
    const sanitizedMessage = LogSanitizer.sanitizeString(message);
    
    logger.debug(sanitizedMessage, sanitizedMeta);
  }

  /**
   * Log de auditoria com nível de segurança alto
   */
  static audit(action: string, meta?: any): void {
    const sanitizedMeta = meta ? LogSanitizer.sanitize(meta) : undefined;
    const sanitizedAction = LogSanitizer.sanitizeString(action);
    
    logger.info(`AUDIT: ${sanitizedAction}`, {
      ...sanitizedMeta,
      type: 'audit',
      severity: 'high',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log de segurança para eventos críticos
   */
  static security(event: string, details?: any): void {
    const sanitizedDetails = details ? LogSanitizer.sanitize(details) : undefined;
    const sanitizedEvent = LogSanitizer.sanitizeString(event);
    
    logger.warn(`SECURITY: ${sanitizedEvent}`, {
      ...sanitizedDetails,
      type: 'security',
      severity: 'critical',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log de request HTTP sanitizado
   */
  static request(req: any, res?: any, meta?: any): void {
    const sanitizedReq = LogSanitizer.sanitizeRequest(req);
    const sanitizedMeta = meta ? LogSanitizer.sanitize(meta) : undefined;
    
    const logData = {
      request: sanitizedReq,
      response: res ? {
        statusCode: res.statusCode,
        headers: LogSanitizer.sanitizeHeaders(res.getHeaders?.() || {})
      } : undefined,
      ...sanitizedMeta
    };
    
    logger.info('HTTP Request', logData);
  }

  /**
   * Log de performance com métricas
   */
  static performance(operation: string, duration: number, meta?: any): void {
    const sanitizedMeta = meta ? LogSanitizer.sanitize(meta) : undefined;
    const sanitizedOperation = LogSanitizer.sanitizeString(operation);
    
    const level = duration > 1000 ? 'warn' : 'info'; // Warn se > 1s
    
    logger[level](`PERFORMANCE: ${sanitizedOperation}`, {
      duration,
      operation: sanitizedOperation,
      ...sanitizedMeta,
      type: 'performance'
    });
  }
}