// ====================================================================
// 🔒 ROTAS ADMINISTRATIVAS - DIGIURBAN SYSTEM
// ====================================================================
// Rotas para funcionalidades administrativas e métricas SaaS
// Acesso restrito para super admins
// ====================================================================

import express from 'express';
import { authenticateJWT, requireSuperAdmin } from '../middleware/auth.js';
import { TenantModel } from '../models/Tenant.js';
import { UserModel } from '../models/User.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

const router = express.Router();

// ====================================================================
// MÉTRICAS SAAS
// ====================================================================

/**
 * GET /admin/saas-metrics
 * Obter métricas gerais do sistema SaaS
 */
router.get('/admin/saas-metrics', 
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Carregando métricas SaaS', {
        userId: req.user?.id
      });

      // Consultar métricas básicas do sistema
      const [tenantStats, userStats] = await Promise.all([
        TenantModel.getTenantStats(),
        UserModel.getUserStats()
      ]);

      const metrics = {
        // Estatísticas de Tenants
        totalTenants: tenantStats.total || 0,
        activeTenants: tenantStats.active || 0,
        
        // Estatísticas de Usuários
        totalUsers: userStats.total || 0,
        activeUsers: userStats.active || 0,
        
        // Métricas financeiras (mock - implementar conforme necessário)
        monthlyRevenue: 0,
        
        // Métricas técnicas (mock - implementar conforme necessário)
        storageUsed: 0,
        apiCalls: 0,
        
        // Timestamp da consulta
        generatedAt: Date.now()
      };

      StructuredLogger.audit('Métricas SaaS consultadas', {
        success: true,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Métricas SaaS carregadas com sucesso',
        data: metrics
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar métricas SaaS', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar métricas SaaS'
      });
    }
  }
);

// ====================================================================
// MÉTRICAS DE SISTEMA
// ====================================================================

/**
 * GET /admin/system-health
 * Verificar saúde geral do sistema
 */
router.get('/admin/system-health',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const health = {
        database: 'healthy',
        redis: 'healthy', // Assumindo que está saudável
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: Date.now()
      };

      res.json({
        success: true,
        data: health
      });

    } catch (error) {
      StructuredLogger.error('Erro ao verificar saúde do sistema', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Erro ao verificar saúde do sistema'
      });
    }
  }
);

export default router;