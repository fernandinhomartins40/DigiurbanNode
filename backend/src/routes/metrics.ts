import { Router } from 'express';
import { register } from '../monitoring/metrics.js';

const router = Router();

// Endpoint para Prometheus coletar métricas
router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate metrics'
    });
  }
});

// Endpoint para visualizar métricas em formato JSON (desenvolvimento)
router.get('/metrics/json', async (req, res) => {
  try {
    const metricsArray = await register.getMetricsAsArray();
    const formattedMetrics = metricsArray.map(metric => ({
      name: metric.name,
      help: metric.help,
      type: metric.type,
      values: (metric as any).values || []
    }));
    
    res.json({
      success: true,
      data: {
        metrics: formattedMetrics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating JSON metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate metrics'
    });
  }
});

export default router;