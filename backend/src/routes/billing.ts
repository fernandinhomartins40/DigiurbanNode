// ====================================================================
// 💰 ROTAS DE BILLING - DIGIURBAN SAAS SYSTEM
// ====================================================================
// APIs completas para sistema de billing e métricas SaaS
// CRUD de faturas, cálculo automático de MRR/ARR/Churn
// Seguindo exatamente a nomenclatura do schema
// ====================================================================

import express from 'express';
import { authenticateJWT, requireSuperAdmin } from '../middleware/auth.js';
import { InvoiceModel, CreateInvoiceData, UpdateInvoiceData, InvoiceStatus, PlanoTenant } from '../models/Invoice.js';
import { BillingMetricsModel } from '../models/BillingMetrics.js';
import BillingCalculatorService from '../services/BillingCalculatorService.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

const router = express.Router();

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

/**
 * Converte ParsedQs para string de forma segura
 */
function getStringParam(param: any, defaultValue: string = ''): string {
  if (Array.isArray(param)) {
    return param[0] as string || defaultValue;
  }
  return (param as string) || defaultValue;
}

/**
 * Converte ParsedQs para number de forma segura
 */
function getNumberParam(param: any, defaultValue: number = 0): number {
  const str = getStringParam(param, defaultValue.toString());
  const num = parseInt(str, 10);
  return isNaN(num) ? defaultValue : num;
}

// ====================================================================
// GESTÃO DE FATURAS
// ====================================================================

/**
 * GET /admin/billing/invoices
 * Listar faturas com filtros e paginação
 */
router.get('/admin/billing/invoices',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const {
        limit = 50,
        offset = 0,
        status,
        plano,
        tenantId,
        periodo,
        dataVencimentoStart,
        dataVencimentoEnd,
        search,
        sortBy = 'dataCriacao',
        sortOrder = 'desc'
      } = req.query;

      StructuredLogger.info('Listando faturas', {
        userId: req.user?.id,
        filters: { status, plano, tenantId }
      });

      const options = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        status: status as InvoiceStatus,
        plano: plano as PlanoTenant,
        tenantId: tenantId as string,
        periodo: periodo as string,
        dataVencimentoStart: dataVencimentoStart ? new Date(dataVencimentoStart as string) : undefined,
        dataVencimentoEnd: dataVencimentoEnd ? new Date(dataVencimentoEnd as string) : undefined,
        search: search as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any
      };

      const result = await InvoiceModel.list(options);

      res.json({
        success: true,
        message: 'Faturas listadas com sucesso',
        data: {
          invoices: result.invoices,
          pagination: {
            total: result.total,
            limit: options.limit,
            offset: options.offset,
            pages: Math.ceil(result.total / options.limit)
          },
          summary: result.summary
        }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao listar faturas', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao listar faturas'
      });
    }
  }
);

/**
 * GET /admin/billing/invoices/:id
 * Obter fatura específica
 */
router.get('/admin/billing/invoices/:id',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      StructuredLogger.info('Buscando fatura específica', {
        userId: req.user?.id,
        invoiceId: id
      });

      const invoice = await InvoiceModel.findById(id);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Fatura não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Fatura encontrada com sucesso',
        data: invoice
      });

    } catch (error) {
      StructuredLogger.error('Erro ao buscar fatura', error as Error, {
        userId: req.user?.id,
        invoiceId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao buscar fatura'
      });
    }
  }
);

/**
 * POST /admin/billing/invoices
 * Criar nova fatura
 */
router.post('/admin/billing/invoices',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const invoiceData: CreateInvoiceData = req.body;

      StructuredLogger.info('Criando nova fatura', {
        userId: req.user?.id,
        tenantId: invoiceData.tenantId,
        valor: invoiceData.valor
      });

      // Gerar número automático se não fornecido
      if (!invoiceData.numero) {
        invoiceData.numero = await InvoiceModel.generateInvoiceNumber(
          invoiceData.tenantId,
          invoiceData.dataVencimento
        );
      }

      const invoice = await InvoiceModel.create(invoiceData);

      // Trigger automático para recálculo de métricas
      await BillingCalculatorService.triggerInvoiceCreated(invoice.id, invoice.tenantId, req.user?.id);

      res.status(201).json({
        success: true,
        message: 'Fatura criada com sucesso',
        data: invoice
      });

    } catch (error) {
      StructuredLogger.error('Erro ao criar fatura', error as Error, {
        userId: req.user?.id,
        tenantId: req.body.tenantId
      });

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao criar fatura'
      });
    }
  }
);

/**
 * PUT /admin/billing/invoices/:id
 * Atualizar fatura
 */
router.put('/admin/billing/invoices/:id',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates: UpdateInvoiceData = req.body;

      StructuredLogger.info('Atualizando fatura', {
        userId: req.user?.id,
        invoiceId: id
      });

      const invoice = await InvoiceModel.update(id, updates);

      res.json({
        success: true,
        message: 'Fatura atualizada com sucesso',
        data: invoice
      });

    } catch (error) {
      StructuredLogger.error('Erro ao atualizar fatura', error as Error, {
        userId: req.user?.id,
        invoiceId: req.params.id
      });

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao atualizar fatura'
      });
    }
  }
);

/**
 * POST /admin/billing/invoices/:id/pay
 * Marcar fatura como paga
 */
router.post('/admin/billing/invoices/:id/pay',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { metodoPagamento, dataPagamento } = req.body;

      StructuredLogger.info('Marcando fatura como paga', {
        userId: req.user?.id,
        invoiceId: id,
        metodoPagamento
      });

      const invoice = await InvoiceModel.markAsPaid(
        id,
        metodoPagamento,
        dataPagamento ? new Date(dataPagamento) : undefined
      );

      // Trigger automático para recálculo de métricas após pagamento
      await BillingCalculatorService.triggerInvoicePaid(invoice.id, invoice.tenantId, req.user?.id);

      res.json({
        success: true,
        message: 'Fatura marcada como paga com sucesso',
        data: invoice
      });

    } catch (error) {
      StructuredLogger.error('Erro ao marcar fatura como paga', error as Error, {
        userId: req.user?.id,
        invoiceId: req.params.id
      });

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao processar pagamento'
      });
    }
  }
);

/**
 * DELETE /admin/billing/invoices/:id
 * Cancelar fatura (soft delete)
 */
router.delete('/admin/billing/invoices/:id',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      StructuredLogger.info('Cancelando fatura', {
        userId: req.user?.id,
        invoiceId: id
      });

      await InvoiceModel.softDelete(id);

      res.json({
        success: true,
        message: 'Fatura cancelada com sucesso'
      });

    } catch (error) {
      StructuredLogger.error('Erro ao cancelar fatura', error as Error, {
        userId: req.user?.id,
        invoiceId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao cancelar fatura'
      });
    }
  }
);

// ====================================================================
// MÉTRICAS DE BILLING
// ====================================================================

/**
 * GET /admin/billing/metrics
 * Obter métricas SaaS completas (MRR, ARR, Churn, etc.)
 */
router.get('/admin/billing/metrics',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const periodoString = getStringParam(req.query.periodo, '');

      StructuredLogger.info('Carregando métricas de billing', {
        userId: req.user?.id,
        periodo: periodoString
      });

      const metrics = await BillingMetricsModel.getSaasMetrics(periodoString);

      res.json({
        success: true,
        message: 'Métricas de billing carregadas com sucesso',
        data: metrics
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar métricas de billing', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar métricas'
      });
    }
  }
);

/**
 * GET /admin/billing/revenue-evolution
 * Obter evolução de receita temporal
 */
router.get('/admin/billing/revenue-evolution',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const monthsNumber = getNumberParam(req.query.months, 6);

      StructuredLogger.info('Carregando evolução de receita', {
        userId: req.user?.id,
        months: monthsNumber
      });

      const evolution = await BillingMetricsModel.getMetricsEvolution(monthsNumber);

      res.json({
        success: true,
        message: 'Evolução de receita carregada com sucesso',
        data: evolution
      });

    } catch (error) {
      StructuredLogger.error('Erro ao carregar evolução de receita', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar evolução de receita'
      });
    }
  }
);

/**
 * POST /admin/billing/metrics/calculate
 * Forçar recálculo das métricas para um período
 */
router.post('/admin/billing/metrics/calculate',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { year, month } = req.body;

      StructuredLogger.info('Forçando recálculo de métricas', {
        userId: req.user?.id,
        year,
        month
      });

      const currentYear = year || new Date().getFullYear();
      const currentMonth = month || new Date().getMonth() + 1;

      const metrics = await BillingMetricsModel.calculateAndSaveMetrics(currentYear, currentMonth);

      res.json({
        success: true,
        message: 'Métricas recalculadas com sucesso',
        data: metrics
      });

    } catch (error) {
      StructuredLogger.error('Erro ao recalcular métricas', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao recalcular métricas'
      });
    }
  }
);

// ====================================================================
// RELATÓRIOS FINANCEIROS
// ====================================================================

/**
 * GET /admin/billing/reports/financial
 * Gerar relatório financeiro
 */
router.get('/admin/billing/reports/financial',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const startDateString = getStringParam(req.query.startDate, '');
      const endDateString = getStringParam(req.query.endDate, '');
      const groupByString = getStringParam(req.query.groupBy, 'month');
      const includePlansParam = req.query.includePlans !== 'false';

      StructuredLogger.info('Gerando relatório financeiro', {
        userId: req.user?.id,
        startDate: startDateString,
        endDate: endDateString,
        groupBy: groupByString
      });

      // Buscar faturas do período
      const options = {
        dataVencimentoStart: startDateString ? new Date(startDateString) : undefined,
        dataVencimentoEnd: endDateString ? new Date(endDateString) : undefined,
        limit: 1000 // Limite alto para relatório
      };

      const { invoices, summary } = await InvoiceModel.list(options);

      // Agrupar por plano se solicitado
      let distribuicaoPorPlano = null;
      if (includePlansParam) {
        distribuicaoPorPlano = {
          basico: {
            count: invoices.filter(i => i.plano === 'basico').length,
            total: invoices.filter(i => i.plano === 'basico').reduce((sum, i) => sum + i.valor, 0)
          },
          premium: {
            count: invoices.filter(i => i.plano === 'premium').length,
            total: invoices.filter(i => i.plano === 'premium').reduce((sum, i) => sum + i.valor, 0)
          },
          enterprise: {
            count: invoices.filter(i => i.plano === 'enterprise').length,
            total: invoices.filter(i => i.plano === 'enterprise').reduce((sum, i) => sum + i.valor, 0)
          }
        };
      }

      const report = {
        periodo: {
          inicio: startDateString,
          fim: endDateString
        },
        resumo: summary,
        faturas: invoices.slice(0, 100), // Limitar para response
        totalFaturas: invoices.length,
        distribuicaoPorPlano,
        geradoEm: new Date().toISOString(),
        geradoPor: req.user?.id
      };

      res.json({
        success: true,
        message: 'Relatório financeiro gerado com sucesso',
        data: report
      });

    } catch (error) {
      StructuredLogger.error('Erro ao gerar relatório financeiro', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao gerar relatório'
      });
    }
  }
);

/**
 * GET /admin/billing/health
 * Obter relatório de saúde do sistema de billing
 */
router.get('/admin/billing/health',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Gerando relatório de saúde do billing', {
        userId: req.user?.id
      });

      const healthReport = await BillingCalculatorService.getBillingHealthReport();

      res.json({
        success: true,
        message: 'Relatório de saúde gerado com sucesso',
        data: healthReport
      });

    } catch (error) {
      StructuredLogger.error('Erro ao gerar relatório de saúde', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao gerar relatório de saúde'
      });
    }
  }
);

/**
 * POST /admin/billing/maintenance/daily
 * Executar manutenção diária manual
 */
router.post('/admin/billing/maintenance/daily',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Executando manutenção diária manual', {
        userId: req.user?.id
      });

      await BillingCalculatorService.runDailyMaintenance();

      res.json({
        success: true,
        message: 'Manutenção diária executada com sucesso'
      });

    } catch (error) {
      StructuredLogger.error('Erro na manutenção diária', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno na manutenção diária'
      });
    }
  }
);

/**
 * POST /admin/billing/maintenance/historical
 * Calcular métricas históricas
 */
router.post('/admin/billing/maintenance/historical',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { startYear, startMonth, endYear, endMonth } = req.body;

      StructuredLogger.info('Calculando métricas históricas', {
        userId: req.user?.id,
        startPeriod: `${startYear}-${startMonth}`,
        endPeriod: `${endYear}-${endMonth}`
      });

      await BillingCalculatorService.calculateHistoricalMetrics(
        startYear || 2024,
        startMonth || 1,
        endYear || new Date().getFullYear(),
        endMonth || new Date().getMonth() + 1
      );

      res.json({
        success: true,
        message: 'Métricas históricas calculadas com sucesso'
      });

    } catch (error) {
      StructuredLogger.error('Erro ao calcular métricas históricas', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao calcular métricas históricas'
      });
    }
  }
);

/**
 * POST /admin/billing/invoices/mark-overdue
 * Marcar faturas vencidas automaticamente
 */
router.post('/admin/billing/invoices/mark-overdue',
  authenticateJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      StructuredLogger.info('Marcando faturas vencidas', {
        userId: req.user?.id
      });

      const count = await InvoiceModel.markAsOverdue();

      // Trigger automático para recálculo de métricas após marcar vencidas
      if (count > 0) {
        await BillingCalculatorService.triggerManualCalculation(req.user?.id);
      }

      res.json({
        success: true,
        message: `${count} faturas marcadas como vencidas`,
        data: { count }
      });

    } catch (error) {
      StructuredLogger.error('Erro ao marcar faturas vencidas', error as Error, {
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno ao marcar faturas vencidas'
      });
    }
  }
);

export default router;