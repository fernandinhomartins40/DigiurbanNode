import { Router, Request, Response } from 'express';
import { HealthChecker } from '../monitoring/healthCheck.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

const router = Router();

// Health check simples (para load balancers)
router.get('/health', async (req: Request, res: Response) => {
  try {
    const quickCheck = await HealthChecker.runQuickCheck();
    
    if (quickCheck.status === 'healthy') {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: quickCheck.responseTime
      });
    } else {
      res.status(503).json({
        status: 'SERVICE_UNAVAILABLE',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: quickCheck.responseTime
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'SERVICE_UNAVAILABLE',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Health check detalhado
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    const healthResult = await HealthChecker.runChecks();
    
    // Status code baseado no resultado
    let statusCode = 200;
    if (healthResult.status === 'degraded') {
      statusCode = 200; // Ainda funcional, mas com warnings
    } else if (healthResult.status === 'unhealthy') {
      statusCode = 503; // Não funcional
    }

    res.status(statusCode).json(healthResult);
  } catch (error) {
    StructuredLogger.error('Health check detailed failed', error, {
      action: 'health_check_detailed',
      resource: 'monitoring'
    });

    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check system failure',
      checks: {}
    });
  }
});

// Informações do sistema
router.get('/health/system', async (req: Request, res: Response) => {
  try {
    const systemInfo = await HealthChecker.getSystemInfo();
    
    res.json({
      success: true,
      data: systemInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    StructuredLogger.error('System info failed', error, {
      action: 'system_info',
      resource: 'monitoring'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get system information'
    });
  }
});

// Liveness probe (Kubernetes)
router.get('/health/live', (req: Request, res: Response) => {
  // Simples verificação se a aplicação está rodando
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
});

// Readiness probe (Kubernetes)
router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    const quickCheck = await HealthChecker.runQuickCheck();
    
    if (quickCheck.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        responseTime: quickCheck.responseTime
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        responseTime: quickCheck.responseTime
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed'
    });
  }
});

// Status da aplicação
router.get('/health/status', async (req: Request, res: Response) => {
  try {
    const healthResult = await HealthChecker.runChecks();
    const systemInfo = await HealthChecker.getSystemInfo();
    
    const responseData = {
      application: {
        name: 'DigiUrban Backend',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        status: healthResult.status
      },
      system: {
        uptime: systemInfo.uptime,
        memory_usage: `${Math.round(systemInfo.memory.heap_used / 1024 / 1024)}MB`,
        node_version: systemInfo.node_version,
        platform: systemInfo.platform
      },
      health: {
        overall_status: healthResult.status,
        total_checks: Object.keys(healthResult.checks).length,
        passing: Object.values(healthResult.checks).filter((c: any) => c.status === 'pass').length,
        warnings: Object.values(healthResult.checks).filter((c: any) => c.status === 'warn').length,
        failures: Object.values(healthResult.checks).filter((c: any) => c.status === 'fail').length
      },
      timestamp: new Date().toISOString()
    };

    const statusCode = healthResult.status === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json(responseData);
  } catch (error) {
    StructuredLogger.error('Application status failed', error, {
      action: 'app_status',
      resource: 'monitoring'
    });

    res.status(500).json({
      application: {
        name: 'DigiUrban Backend',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        status: 'error'
      },
      error: 'Failed to get application status',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;