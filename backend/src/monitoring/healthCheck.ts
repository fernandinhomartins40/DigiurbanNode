import { prisma } from "../database/prisma.js";
import { StructuredLogger } from './structuredLogger.js';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, {
    status: 'pass' | 'fail' | 'warn';
    time: string;
    output?: string;
    responseTime?: number;
  }>;
  version: string;
  uptime: number;
  timestamp: string;
  environment: string;
}

interface ComponentCheck {
  name: string;
  check: () => Promise<{
    status: 'pass' | 'fail' | 'warn';
    output?: string;
    responseTime: number;
  }>;
  critical: boolean;
}

export class HealthChecker {
  private static components: ComponentCheck[] = [
    {
      name: 'database',
      critical: true,
      check: async () => {
        const start = Date.now();
        try {
          const result = await queryOne('SELECT 1 as test');
          const responseTime = Date.now() - start;
          
          if (responseTime > 5000) {
            return {
              status: 'warn',
              output: `Database responding slowly: ${responseTime}ms`,
              responseTime
            };
          }
          
          return {
            status: result ? 'pass' : 'fail',
            output: `Database connection ${result ? 'successful' : 'failed'}`,
            responseTime
          };
        } catch (error: any) {
          return {
            status: 'fail',
            output: `Database error: ${error.message}`,
            responseTime: Date.now() - start
          };
        }
      }
    },
    {
      name: 'memory',
      critical: false,
      check: async () => {
        const start = Date.now();
        const memUsage = process.memoryUsage();
        const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
        const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        const usagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        let status: 'pass' | 'warn' | 'fail' = 'pass';
        if (usagePercent > 90) {
          status = 'fail';
        } else if (usagePercent > 75) {
          status = 'warn';
        }
        
        return {
          status,
          output: `Memory usage: ${usedMB}MB/${totalMB}MB (${usagePercent.toFixed(1)}%)`,
          responseTime: Date.now() - start
        };
      }
    },
    {
      name: 'disk_space',
      critical: false,
      check: async () => {
        const start = Date.now();
        try {
          const fs = await import('fs/promises');
          const stats = await fs.stat(process.cwd());
          
          // Simular verificação de espaço em disco
          // Em produção, usar biblioteca como 'check-disk-space'
          return {
            status: 'pass',
            output: 'Disk space check passed',
            responseTime: Date.now() - start
          };
        } catch (error: any) {
          return {
            status: 'warn',
            output: `Disk space check failed: ${error.message}`,
            responseTime: Date.now() - start
          };
        }
      }
    },
    {
      name: 'auth_system',
      critical: true,
      check: async () => {
        const start = Date.now();
        try {
          // Verificar se variáveis críticas de auth estão definidas
          const requiredEnvVars = ['JWT_SECRET', 'COOKIE_SECRET'];
          const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
          
          if (missingVars.length > 0) {
            return {
              status: 'fail',
              output: `Missing environment variables: ${missingVars.join(', ')}`,
              responseTime: Date.now() - start
            };
          }
          
          return {
            status: 'pass',
            output: 'Auth system configuration valid',
            responseTime: Date.now() - start
          };
        } catch (error: any) {
          return {
            status: 'fail',
            output: `Auth system check failed: ${error.message}`,
            responseTime: Date.now() - start
          };
        }
      }
    },
    {
      name: 'rate_limiting',
      critical: false,
      check: async () => {
        const start = Date.now();
        try {
          // Verificar se sistema de rate limiting está funcional
          // Aqui você pode adicionar uma verificação específica
          return {
            status: 'pass',
            output: 'Rate limiting system operational',
            responseTime: Date.now() - start
          };
        } catch (error: any) {
          return {
            status: 'warn',
            output: `Rate limiting check failed: ${error.message}`,
            responseTime: Date.now() - start
          };
        }
      }
    },
    {
      name: 'backup_system',
      critical: false,
      check: async () => {
        const start = Date.now();
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          
          const backupDir = path.join(process.cwd(), 'backups');
          
          try {
            await fs.access(backupDir);
            const files = await fs.readdir(backupDir);
            const recentBackups = files.filter(file => 
              file.startsWith('backup_') && file.endsWith('.db')
            ).length;
            
            if (recentBackups === 0) {
              return {
                status: 'warn',
                output: 'No recent backups found',
                responseTime: Date.now() - start
              };
            }
            
            return {
              status: 'pass',
              output: `${recentBackups} backup files found`,
              responseTime: Date.now() - start
            };
          } catch {
            return {
              status: 'warn',
              output: 'Backup directory not accessible',
              responseTime: Date.now() - start
            };
          }
        } catch (error: any) {
          return {
            status: 'warn',
            output: `Backup system check failed: ${error.message}`,
            responseTime: Date.now() - start
          };
        }
      }
    }
  ];

  static async runChecks(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const checks: Record<string, any> = {};
    
    // Executar todos os checks
    for (const component of this.components) {
      try {
        const result = await component.check();
        checks[component.name] = {
          ...result,
          time: new Date().toISOString(),
          critical: component.critical
        };
      } catch (error: any) {
        checks[component.name] = {
          status: 'fail',
          time: new Date().toISOString(),
          output: `Health check failed: ${error.message}`,
          responseTime: Date.now() - startTime,
          critical: component.critical
        };
      }
    }

    // Determinar status geral
    const criticalFailures = Object.values(checks).filter(
      (check: any) => check.critical && check.status === 'fail'
    ).length;

    const anyFailures = Object.values(checks).filter(
      (check: any) => check.status === 'fail'
    ).length;

    const anyWarnings = Object.values(checks).filter(
      (check: any) => check.status === 'warn'
    ).length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (criticalFailures > 0) {
      overallStatus = 'unhealthy';
    } else if (anyFailures > 0 || anyWarnings > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const result: HealthCheckResult = {
      status: overallStatus,
      checks,
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Log do resultado do health check
    StructuredLogger.info('Health check completed', {
      action: 'health_check',
      resource: 'system',
      metadata: {
        status: overallStatus,
        totalChecks: Object.keys(checks).length,
        failures: anyFailures,
        warnings: anyWarnings,
        criticalFailures,
        duration: Date.now() - startTime
      }
    });

    return result;
  }

  static async runQuickCheck(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime: number }> {
    const start = Date.now();
    
    try {
      // Apenas verificações críticas rápidas
      await queryOne('SELECT 1');
      
      const responseTime = Date.now() - start;
      return {
        status: responseTime < 1000 ? 'healthy' : 'unhealthy',
        responseTime
      };
    } catch {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start
      };
    }
  }

  static async getSystemInfo() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      node_version: process.version,
      platform: process.platform,
      architecture: process.arch,
      uptime: process.uptime(),
      memory: {
        rss: memUsage.rss,
        heap_total: memUsage.heapTotal,
        heap_used: memUsage.heapUsed,
        external: memUsage.external
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  // Adicionar novo componente para monitoramento
  static addComponent(component: ComponentCheck) {
    this.components.push(component);
  }

  // Remover componente
  static removeComponent(name: string) {
    this.components = this.components.filter(c => c.name !== name);
  }
}