// ====================================================================
// 🔄 SERVIÇO DE CÁLCULOS AUTOMÁTICOS - BILLING DIGIURBAN
// ====================================================================
// Serviço responsável por executar cálculos automáticos de métricas
// Triggers automáticos para MRR, ARR, Churn e outras métricas SaaS
// Executado em eventos de negócio (pagamentos, mudanças de status, etc.)
// ====================================================================

import { BillingMetricsModel } from '../models/BillingMetrics.js';
import { InvoiceModel } from '../models/Invoice.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';
import { prisma } from '../database/prisma.js';

// ====================================================================
// INTERFACE DE EVENTOS DE BILLING
// ====================================================================

export interface BillingEvent {
  type: 'invoice_paid' | 'invoice_created' | 'tenant_activated' | 'tenant_cancelled' | 'plan_changed' | 'manual_trigger';
  tenantId?: string;
  invoiceId?: string;
  oldValue?: any;
  newValue?: any;
  triggeredBy?: string;
  timestamp: Date;
}

// ====================================================================
// CLASSE DO SERVIÇO DE CÁLCULOS AUTOMÁTICOS
// ====================================================================

export class BillingCalculatorService {

  // ================================================================
  // EXECUÇÃO AUTOMÁTICA DE CÁLCULOS
  // ================================================================

  /**
   * Executar cálculos automáticos baseado em evento
   */
  static async processEvent(event: BillingEvent): Promise<void> {
    try {
      StructuredLogger.business('Processando evento de billing', {
        action: 'billing_event_process',
        eventType: event.type,
        tenantId: event.tenantId,
        invoiceId: event.invoiceId
      });

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      switch (event.type) {
        case 'invoice_paid':
          await this.onInvoicePaid(event, currentYear, currentMonth);
          break;

        case 'invoice_created':
          await this.onInvoiceCreated(event, currentYear, currentMonth);
          break;

        case 'tenant_activated':
          await this.onTenantActivated(event, currentYear, currentMonth);
          break;

        case 'tenant_cancelled':
          await this.onTenantCancelled(event, currentYear, currentMonth);
          break;

        case 'plan_changed':
          await this.onPlanChanged(event, currentYear, currentMonth);
          break;

        case 'manual_trigger':
          await this.onManualTrigger(currentYear, currentMonth);
          break;

        default:
          StructuredLogger.warn('Tipo de evento não reconhecido', {
            eventType: event.type
          });
      }

    } catch (error) {
      StructuredLogger.error('Erro ao processar evento de billing', error as Error, {
        eventType: event.type,
        tenantId: event.tenantId
      });
      throw error;
    }
  }

  // ================================================================
  // HANDLERS DE EVENTOS ESPECÍFICOS
  // ================================================================

  /**
   * Quando uma fatura é paga
   */
  private static async onInvoicePaid(event: BillingEvent, year: number, month: number): Promise<void> {
    StructuredLogger.info('Recalculando métricas após pagamento de fatura', {
      invoiceId: event.invoiceId,
      tenantId: event.tenantId
    });

    // Recalcular métricas do mês atual
    await BillingMetricsModel.calculateAndSaveMetrics(year, month);

    // Se a fatura for de mês anterior, recalcular também
    if (event.invoiceId) {
      const invoice = await InvoiceModel.findById(event.invoiceId);
      if (invoice && invoice.dataPagamento) {
        const paymentDate = new Date(invoice.dataPagamento);
        const paymentYear = paymentDate.getFullYear();
        const paymentMonth = paymentDate.getMonth() + 1;

        if (paymentYear !== year || paymentMonth !== month) {
          await BillingMetricsModel.calculateAndSaveMetrics(paymentYear, paymentMonth);
        }
      }
    }
  }

  /**
   * Quando uma nova fatura é criada
   */
  private static async onInvoiceCreated(event: BillingEvent, year: number, month: number): Promise<void> {
    StructuredLogger.info('Recalculando métricas após criação de fatura', {
      invoiceId: event.invoiceId,
      tenantId: event.tenantId
    });

    // Recalcular faturas pendentes e valor pendente
    await BillingMetricsModel.calculateAndSaveMetrics(year, month);
  }

  /**
   * Quando um tenant é ativado
   */
  private static async onTenantActivated(event: BillingEvent, year: number, month: number): Promise<void> {
    StructuredLogger.info('Recalculando métricas após ativação de tenant', {
      tenantId: event.tenantId
    });

    // Recalcular MRR, ARR e ARPU
    await BillingMetricsModel.calculateAndSaveMetrics(year, month);

    // Também recalcular o mês anterior para churn rate
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    await BillingMetricsModel.calculateAndSaveMetrics(prevYear, prevMonth);
  }

  /**
   * Quando um tenant é cancelado
   */
  private static async onTenantCancelled(event: BillingEvent, year: number, month: number): Promise<void> {
    StructuredLogger.info('Recalculando métricas após cancelamento de tenant', {
      tenantId: event.tenantId
    });

    // Recalcular todas as métricas incluindo churn rate
    await BillingMetricsModel.calculateAndSaveMetrics(year, month);
  }

  /**
   * Quando um plano é alterado
   */
  private static async onPlanChanged(event: BillingEvent, year: number, month: number): Promise<void> {
    StructuredLogger.info('Recalculando métricas após mudança de plano', {
      tenantId: event.tenantId,
      oldPlan: event.oldValue,
      newPlan: event.newValue
    });

    // Recalcular MRR, ARR e ARPU
    await BillingMetricsModel.calculateAndSaveMetrics(year, month);
  }

  /**
   * Trigger manual (cron jobs, admin requests)
   */
  private static async onManualTrigger(year: number, month: number): Promise<void> {
    StructuredLogger.info('Executando cálculo manual de métricas', {
      year,
      month
    });

    await BillingMetricsModel.calculateAndSaveMetrics(year, month);
  }

  // ================================================================
  // MÉTODOS PÚBLICOS PARA INTEGRAÇÃO
  // ================================================================

  /**
   * Trigger para quando uma fatura é paga
   */
  static async triggerInvoicePaid(invoiceId: string, tenantId: string, triggeredBy?: string): Promise<void> {
    const event: BillingEvent = {
      type: 'invoice_paid',
      invoiceId,
      tenantId,
      triggeredBy,
      timestamp: new Date()
    };

    await this.processEvent(event);
  }

  /**
   * Trigger para quando uma fatura é criada
   */
  static async triggerInvoiceCreated(invoiceId: string, tenantId: string, triggeredBy?: string): Promise<void> {
    const event: BillingEvent = {
      type: 'invoice_created',
      invoiceId,
      tenantId,
      triggeredBy,
      timestamp: new Date()
    };

    await this.processEvent(event);
  }

  /**
   * Trigger para quando um tenant é ativado
   */
  static async triggerTenantActivated(tenantId: string, triggeredBy?: string): Promise<void> {
    const event: BillingEvent = {
      type: 'tenant_activated',
      tenantId,
      triggeredBy,
      timestamp: new Date()
    };

    await this.processEvent(event);
  }

  /**
   * Trigger para quando um tenant é cancelado
   */
  static async triggerTenantCancelled(tenantId: string, triggeredBy?: string): Promise<void> {
    const event: BillingEvent = {
      type: 'tenant_cancelled',
      tenantId,
      triggeredBy,
      timestamp: new Date()
    };

    await this.processEvent(event);
  }

  /**
   * Trigger para quando um plano é alterado
   */
  static async triggerPlanChanged(tenantId: string, oldPlan: string, newPlan: string, triggeredBy?: string): Promise<void> {
    const event: BillingEvent = {
      type: 'plan_changed',
      tenantId,
      oldValue: oldPlan,
      newValue: newPlan,
      triggeredBy,
      timestamp: new Date()
    };

    await this.processEvent(event);
  }

  /**
   * Trigger manual para recálculo
   */
  static async triggerManualCalculation(triggeredBy?: string): Promise<void> {
    const event: BillingEvent = {
      type: 'manual_trigger',
      triggeredBy,
      timestamp: new Date()
    };

    await this.processEvent(event);
  }

  // ================================================================
  // CÁLCULOS AGENDADOS E BATCH
  // ================================================================

  /**
   * Executar cálculos para múltiplos meses (útil para histórico)
   */
  static async calculateHistoricalMetrics(startYear: number, startMonth: number, endYear: number, endMonth: number): Promise<void> {
    StructuredLogger.info('Iniciando cálculo de métricas históricas', {
      startPeriod: `${startYear}-${startMonth}`,
      endPeriod: `${endYear}-${endMonth}`
    });

    let currentYear = startYear;
    let currentMonth = startMonth;

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      try {
        await BillingMetricsModel.calculateAndSaveMetrics(currentYear, currentMonth);

        StructuredLogger.info('Métricas históricas calculadas', {
          periodo: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
        });

        // Próximo mês
        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }

      } catch (error) {
        StructuredLogger.error('Erro ao calcular métricas históricas', error as Error, {
          periodo: `${currentYear}-${currentMonth}`
        });
        // Continuar com próximo mês mesmo se houver erro
        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      }
    }

    StructuredLogger.info('Cálculo de métricas históricas concluído');
  }

  /**
   * Executar task diária de manutenção
   */
  static async runDailyMaintenance(): Promise<void> {
    try {
      StructuredLogger.info('Iniciando manutenção diária de billing');

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // 1. Marcar faturas vencidas automaticamente
      const overdueCount = await InvoiceModel.markAsOverdue();
      if (overdueCount > 0) {
        StructuredLogger.info(`${overdueCount} faturas marcadas como vencidas`);
      }

      // 2. Recalcular métricas do mês atual
      await BillingMetricsModel.calculateAndSaveMetrics(currentYear, currentMonth);

      // 3. Verificar se há inconsistências nos dados
      await this.validateDataConsistency();

      StructuredLogger.info('Manutenção diária de billing concluída');

    } catch (error) {
      StructuredLogger.error('Erro na manutenção diária de billing', error as Error);
      throw error;
    }
  }

  // ================================================================
  // VALIDAÇÃO E DIAGNÓSTICO
  // ================================================================

  /**
   * Validar consistência dos dados de billing
   */
  private static async validateDataConsistency(): Promise<void> {
    try {
      // Verificar se há tenants ativos sem valorMensal
      const tenantsAtivosWithoutValue = await prisma.tenant.count({
        where: {
          status: 'ativo',
          valorMensal: null
        }
      });

      if (tenantsAtivosWithoutValue > 0) {
        StructuredLogger.warn(`${tenantsAtivosWithoutValue} tenants ativos sem valorMensal definido`, {
          action: 'data_consistency_check'
        });
      }

      // Verificar faturas pagas sem dataPagamento
      const faturasPagasSemData = await prisma.invoice.count({
        where: {
          status: 'pago',
          dataPagamento: null
        }
      });

      if (faturasPagasSemData > 0) {
        StructuredLogger.warn(`${faturasPagasSemData} faturas pagas sem dataPagamento`, {
          action: 'data_consistency_check'
        });
      }

      // Verificar faturas com valor zero
      const faturasComValorZero = await prisma.invoice.count({
        where: {
          valor: 0
        }
      });

      if (faturasComValorZero > 0) {
        StructuredLogger.warn(`${faturasComValorZero} faturas com valor zero`, {
          action: 'data_consistency_check'
        });
      }

    } catch (error) {
      StructuredLogger.error('Erro na validação de consistência', error as Error);
    }
  }

  /**
   * Obter relatório de status do sistema de billing
   */
  static async getBillingHealthReport(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    metrics: any;
    issues: string[];
    lastCalculation: Date | null;
  }> {
    try {
      const issues: string[] = [];

      // Verificar quando foi a última atualização de métricas
      const latestMetrics = await BillingMetricsModel.findLatest();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      if (!latestMetrics) {
        issues.push('Nenhuma métrica de billing encontrada');
      } else if (latestMetrics.updatedAt < oneDayAgo) {
        issues.push('Métricas não atualizadas nas últimas 24 horas');
      }

      // Verificar inconsistências
      const tenantsAtivosWithoutValue = await prisma.tenant.count({
        where: { status: 'ativo', valorMensal: null }
      });

      if (tenantsAtivosWithoutValue > 0) {
        issues.push(`${tenantsAtivosWithoutValue} tenants ativos sem valorMensal`);
      }

      // Determinar status geral
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (issues.length > 0) {
        status = issues.length > 3 ? 'error' : 'warning';
      }

      return {
        status,
        metrics: latestMetrics,
        issues,
        lastCalculation: latestMetrics?.updatedAt || null
      };

    } catch (error) {
      return {
        status: 'error',
        metrics: null,
        issues: ['Erro ao gerar relatório de saúde'],
        lastCalculation: null
      };
    }
  }
}

export default BillingCalculatorService;