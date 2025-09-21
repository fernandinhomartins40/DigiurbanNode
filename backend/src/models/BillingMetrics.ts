// ====================================================================
// 📊 BILLING METRICS MODEL - DIGIURBAN SAAS ANALYTICS
// ====================================================================
// Modelo para cálculos automáticos de métricas SaaS
// MRR, ARR, Churn Rate, LTV, ARPU e muito mais
// Seguindo exatamente a nomenclatura do schema
// ====================================================================

import { prisma } from '../database/prisma.js';
import { BillingMetrics, Prisma } from '@prisma/client';
import { StructuredLogger } from '../monitoring/structuredLogger.js';
import { InvoiceModel } from './Invoice.js';
import { TenantModel } from './Tenant.js';

// ====================================================================
// INTERFACES E TIPOS (seguindo schema exato)
// ====================================================================

export interface CreateBillingMetricsData {
  periodo: string; // formato "2024-01"
  mrr: number;
  arr: number;
  churnRate?: number;
  arpu?: number;
  ltv?: number;
  cac?: number;
  receitaMensal: number;
  faturasPendentes: number;
  valorPendente: number;
  faturasVencidas: number;
  valorVencido: number;
  taxaCobranca?: number;
}

export interface UpdateBillingMetricsData {
  mrr?: number;
  arr?: number;
  churnRate?: number;
  arpu?: number;
  ltv?: number;
  cac?: number;
  receitaMensal?: number;
  faturasPendentes?: number;
  valorPendente?: number;
  faturasVencidas?: number;
  valorVencido?: number;
  taxaCobranca?: number;
}

export interface SaasMetrics {
  periodo: string;

  // Métricas de receita
  mrr: number;
  arr: number;
  receitaMensal: number;
  crescimentoMRR: number;

  // Métricas de cliente
  totalClientes: number;
  clientesAtivos: number;
  novosClientes: number;
  clientesCancelados: number;
  churnRate: number;
  arpu: number;
  ltv: number;
  cac: number;

  // Métricas de cobrança
  faturasPendentes: number;
  valorPendente: number;
  faturasVencidas: number;
  valorVencido: number;
  taxaCobranca: number;

  // Distribuição por planos
  distribuicaoPlanos: {
    basico: { clientes: number; receita: number; };
    premium: { clientes: number; receita: number; };
    enterprise: { clientes: number; receita: number; };
  };
}

// ====================================================================
// CLASSE DO MODELO BILLING METRICS (seguindo schema exato)
// ====================================================================

export class BillingMetricsModel {

  // ================================================================
  // CRIAÇÃO E ATUALIZAÇÃO DE MÉTRICAS
  // ================================================================

  static async create(metricsData: CreateBillingMetricsData): Promise<BillingMetrics> {
    try {
      // Validar período
      this.validatePeriod(metricsData.periodo);

      const metrics = await prisma.billingMetrics.create({
        data: {
          periodo: metricsData.periodo,
          mrr: metricsData.mrr,
          arr: metricsData.arr,
          churnRate: metricsData.churnRate,
          arpu: metricsData.arpu,
          ltv: metricsData.ltv,
          cac: metricsData.cac,
          receitaMensal: metricsData.receitaMensal,
          faturasPendentes: metricsData.faturasPendentes,
          valorPendente: metricsData.valorPendente,
          faturasVencidas: metricsData.faturasVencidas,
          valorVencido: metricsData.valorVencido,
          taxaCobranca: metricsData.taxaCobranca,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      StructuredLogger.business('Métricas de billing criadas', {
        action: 'billing_metrics_create',
        periodo: metricsData.periodo,
        mrr: metricsData.mrr,
        arr: metricsData.arr
      });

      return metrics;
    } catch (error) {
      StructuredLogger.error('Erro ao criar métricas de billing', error, {
        action: 'billing_metrics_create',
        periodo: metricsData.periodo
      });
      throw error;
    }
  }

  static async update(periodo: string, updates: UpdateBillingMetricsData): Promise<BillingMetrics> {
    const existing = await this.findByPeriod(periodo);
    if (!existing) {
      throw new Error('Métricas não encontradas para o período');
    }

    const updateData: any = { updatedAt: new Date() };

    if (updates.mrr !== undefined) updateData.mrr = updates.mrr;
    if (updates.arr !== undefined) updateData.arr = updates.arr;
    if (updates.churnRate !== undefined) updateData.churnRate = updates.churnRate;
    if (updates.arpu !== undefined) updateData.arpu = updates.arpu;
    if (updates.ltv !== undefined) updateData.ltv = updates.ltv;
    if (updates.cac !== undefined) updateData.cac = updates.cac;
    if (updates.receitaMensal !== undefined) updateData.receitaMensal = updates.receitaMensal;
    if (updates.faturasPendentes !== undefined) updateData.faturasPendentes = updates.faturasPendentes;
    if (updates.valorPendente !== undefined) updateData.valorPendente = updates.valorPendente;
    if (updates.faturasVencidas !== undefined) updateData.faturasVencidas = updates.faturasVencidas;
    if (updates.valorVencido !== undefined) updateData.valorVencido = updates.valorVencido;
    if (updates.taxaCobranca !== undefined) updateData.taxaCobranca = updates.taxaCobranca;

    const updatedMetrics = await prisma.billingMetrics.update({
      where: { periodo },
      data: updateData
    });

    return updatedMetrics;
  }

  static async upsert(metricsData: CreateBillingMetricsData): Promise<BillingMetrics> {
    return await prisma.billingMetrics.upsert({
      where: { periodo: metricsData.periodo },
      update: {
        mrr: metricsData.mrr,
        arr: metricsData.arr,
        churnRate: metricsData.churnRate,
        arpu: metricsData.arpu,
        ltv: metricsData.ltv,
        cac: metricsData.cac,
        receitaMensal: metricsData.receitaMensal,
        faturasPendentes: metricsData.faturasPendentes,
        valorPendente: metricsData.valorPendente,
        faturasVencidas: metricsData.faturasVencidas,
        valorVencido: metricsData.valorVencido,
        taxaCobranca: metricsData.taxaCobranca,
        updatedAt: new Date()
      },
      create: {
        periodo: metricsData.periodo,
        mrr: metricsData.mrr,
        arr: metricsData.arr,
        churnRate: metricsData.churnRate,
        arpu: metricsData.arpu,
        ltv: metricsData.ltv,
        cac: metricsData.cac,
        receitaMensal: metricsData.receitaMensal,
        faturasPendentes: metricsData.faturasPendentes,
        valorPendente: metricsData.valorPendente,
        faturasVencidas: metricsData.faturasVencidas,
        valorVencido: metricsData.valorVencido,
        taxaCobranca: metricsData.taxaCobranca,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  // ================================================================
  // BUSCA DE MÉTRICAS
  // ================================================================

  static async findByPeriod(periodo: string): Promise<BillingMetrics | null> {
    return await prisma.billingMetrics.findUnique({
      where: { periodo }
    });
  }

  static async findLatest(): Promise<BillingMetrics | null> {
    return await prisma.billingMetrics.findFirst({
      orderBy: { periodo: 'desc' }
    });
  }

  static async findRange(startPeriod: string, endPeriod: string): Promise<BillingMetrics[]> {
    return await prisma.billingMetrics.findMany({
      where: {
        periodo: {
          gte: startPeriod,
          lte: endPeriod
        }
      },
      orderBy: { periodo: 'asc' }
    });
  }

  static async findLastNMonths(months: number): Promise<BillingMetrics[]> {
    return await prisma.billingMetrics.findMany({
      orderBy: { periodo: 'desc' },
      take: months
    });
  }

  // ================================================================
  // CÁLCULOS AUTOMÁTICOS DE MÉTRICAS SAAS
  // ================================================================

  /**
   * Calcular e salvar métricas para um período específico
   */
  static async calculateAndSaveMetrics(year: number, month: number): Promise<BillingMetrics> {
    const periodo = `${year}-${month.toString().padStart(2, '0')}`;

    try {
      StructuredLogger.info('Iniciando cálculo de métricas SaaS', {
        action: 'calculate_saas_metrics',
        periodo
      });

      // Calcular todas as métricas
      const [
        mrr,
        receitaMensal,
        faturasPendentes,
        valorPendente,
        faturasVencidas,
        valorVencido,
        churnRate,
        arpu,
        ltv,
        taxaCobranca
      ] = await Promise.all([
        this.calculateMRR(year, month),
        this.calculateMonthlyRevenue(year, month),
        this.calculatePendingInvoices(),
        this.calculatePendingValue(),
        this.calculateOverdueInvoices(),
        this.calculateOverdueValue(),
        this.calculateChurnRate(year, month),
        this.calculateARPU(year, month),
        this.calculateLTV(),
        this.calculateCollectionRate(year, month)
      ]);

      // ARR = MRR * 12
      const arr = mrr * 12;

      // CAC (mock por enquanto - depende de dados de marketing)
      const cac = 150.0;

      const metricsData: CreateBillingMetricsData = {
        periodo,
        mrr,
        arr,
        churnRate,
        arpu,
        ltv,
        cac,
        receitaMensal,
        faturasPendentes,
        valorPendente,
        faturasVencidas,
        valorVencido,
        taxaCobranca
      };

      const savedMetrics = await this.upsert(metricsData);

      StructuredLogger.business('Métricas SaaS calculadas e salvas', {
        action: 'calculate_saas_metrics',
        periodo,
        mrr,
        arr,
        churnRate,
        arpu
      });

      return savedMetrics;
    } catch (error) {
      StructuredLogger.error('Erro ao calcular métricas SaaS', error, {
        action: 'calculate_saas_metrics',
        periodo
      });
      throw error;
    }
  }

  /**
   * Calcular MRR (Monthly Recurring Revenue)
   */
  static async calculateMRR(year: number, month: number): Promise<number> {
    // MRR = soma de todas as assinaturas ativas no mês
    const activeTenantsWithSubscriptions = await prisma.tenant.findMany({
      where: {
        status: 'ativo',
        valorMensal: { not: null }
      },
      select: {
        valorMensal: true
      }
    });

    const mrr = activeTenantsWithSubscriptions.reduce((sum, tenant) => {
      return sum + (tenant.valorMensal || 0);
    }, 0);

    return mrr;
  }

  /**
   * Calcular receita mensal (faturas pagas no mês)
   */
  static async calculateMonthlyRevenue(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await prisma.invoice.aggregate({
      where: {
        status: 'pago',
        dataPagamento: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: { valor: true }
    });

    return result._sum.valor || 0;
  }

  /**
   * Calcular Churn Rate
   */
  static async calculateChurnRate(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Clientes no início do mês
    const clientesInicioMes = await prisma.tenant.count({
      where: {
        status: 'ativo',
        createdAt: { lt: startDate }
      }
    });

    // Clientes que cancelaram no mês
    const clientesCancelados = await prisma.tenant.count({
      where: {
        status: { not: 'ativo' },
        updatedAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    if (clientesInicioMes === 0) return 0;

    return (clientesCancelados / clientesInicioMes) * 100;
  }

  /**
   * Calcular ARPU (Average Revenue Per User)
   */
  static async calculateARPU(year: number, month: number): Promise<number> {
    const [receita, totalClientes] = await Promise.all([
      this.calculateMonthlyRevenue(year, month),
      prisma.tenant.count({ where: { status: 'ativo' } })
    ]);

    if (totalClientes === 0) return 0;

    return receita / totalClientes;
  }

  /**
   * Calcular LTV (Lifetime Value)
   */
  static async calculateLTV(): Promise<number> {
    // LTV simplificado = ARPU / Churn Rate
    const latestMetrics = await this.findLatest();

    if (!latestMetrics || !latestMetrics.churnRate || latestMetrics.churnRate === 0) {
      return 0;
    }

    const monthlyChurnRate = latestMetrics.churnRate / 100;
    return latestMetrics.arpu ? (latestMetrics.arpu / monthlyChurnRate) : 0;
  }

  /**
   * Calcular taxa de cobrança
   */
  static async calculateCollectionRate(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [faturasCriadas, faturasPagas] = await Promise.all([
      prisma.invoice.count({
        where: {
          dataCriacao: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.invoice.count({
        where: {
          dataCriacao: {
            gte: startDate,
            lte: endDate
          },
          status: 'pago'
        }
      })
    ]);

    if (faturasCriadas === 0) return 0;

    return (faturasPagas / faturasCriadas) * 100;
  }

  /**
   * Calcular faturas pendentes
   */
  static async calculatePendingInvoices(): Promise<number> {
    return await prisma.invoice.count({
      where: { status: 'pendente' }
    });
  }

  /**
   * Calcular valor pendente
   */
  static async calculatePendingValue(): Promise<number> {
    const result = await prisma.invoice.aggregate({
      where: { status: 'pendente' },
      _sum: { valor: true }
    });

    return result._sum.valor || 0;
  }

  /**
   * Calcular faturas vencidas
   */
  static async calculateOverdueInvoices(): Promise<number> {
    return await prisma.invoice.count({
      where: { status: 'vencido' }
    });
  }

  /**
   * Calcular valor vencido
   */
  static async calculateOverdueValue(): Promise<number> {
    const result = await prisma.invoice.aggregate({
      where: { status: 'vencido' },
      _sum: { valor: true }
    });

    return result._sum.valor || 0;
  }

  // ================================================================
  // MÉTRICAS AGREGADAS PARA DASHBOARD
  // ================================================================

  /**
   * Obter métricas completas para dashboard
   */
  static async getSaasMetrics(periodo?: string): Promise<SaasMetrics> {
    let metrics: BillingMetrics | null;

    if (periodo) {
      metrics = await this.findByPeriod(periodo);
    } else {
      metrics = await this.findLatest();
    }

    if (!metrics) {
      // Se não houver métricas, calcular para o mês atual
      const now = new Date();
      metrics = await this.calculateAndSaveMetrics(now.getFullYear(), now.getMonth() + 1);
    }

    // Calcular crescimento do MRR
    const periodoAnterior = this.getPreviousPeriod(metrics.periodo);
    const metricsAnterior = await this.findByPeriod(periodoAnterior);
    const crescimentoMRR = metricsAnterior
      ? ((metrics.mrr - metricsAnterior.mrr) / metricsAnterior.mrr) * 100
      : 0;

    // Obter distribuição por planos
    const distribuicaoPlanos = await this.getDistribuicaoPlanos();

    // Calcular métricas de clientes
    const [totalClientes, clientesAtivos, novosClientes] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ativo' } }),
      this.getNewCustomersInPeriod(metrics.periodo)
    ]);

    const clientesCancelados = totalClientes - clientesAtivos;

    return {
      periodo: metrics.periodo,

      // Métricas de receita
      mrr: metrics.mrr,
      arr: metrics.arr,
      receitaMensal: metrics.receitaMensal,
      crescimentoMRR,

      // Métricas de cliente
      totalClientes,
      clientesAtivos,
      novosClientes,
      clientesCancelados,
      churnRate: metrics.churnRate || 0,
      arpu: metrics.arpu || 0,
      ltv: metrics.ltv || 0,
      cac: metrics.cac || 0,

      // Métricas de cobrança
      faturasPendentes: metrics.faturasPendentes,
      valorPendente: metrics.valorPendente,
      faturasVencidas: metrics.faturasVencidas,
      valorVencido: metrics.valorVencido,
      taxaCobranca: metrics.taxaCobranca || 0,

      // Distribuição por planos
      distribuicaoPlanos
    };
  }

  /**
   * Obter evolução das métricas
   */
  static async getMetricsEvolution(months: number = 6): Promise<{
    periodo: string;
    mrr: number;
    arr: number;
    churnRate: number;
    clientesAtivos: number;
  }[]> {
    const metrics = await this.findLastNMonths(months);

    return metrics.reverse().map(m => ({
      periodo: m.periodo,
      mrr: m.mrr,
      arr: m.arr,
      churnRate: m.churnRate || 0,
      clientesAtivos: 0 // Calcular dinamicamente se necessário
    }));
  }

  // ================================================================
  // MÉTODOS AUXILIARES
  // ================================================================

  private static validatePeriod(periodo: string): void {
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(periodo)) {
      throw new Error('Período deve estar no formato YYYY-MM');
    }
  }

  private static getPreviousPeriod(periodo: string): string {
    const [year, month] = periodo.split('-').map(Number);
    const date = new Date(year, month - 2); // -2 porque month é 1-indexed
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  private static async getDistribuicaoPlanos(): Promise<{
    basico: { clientes: number; receita: number; };
    premium: { clientes: number; receita: number; };
    enterprise: { clientes: number; receita: number; };
  }> {
    const [basico, premium, enterprise] = await Promise.all([
      this.getPlanoStats('basico'),
      this.getPlanoStats('premium'),
      this.getPlanoStats('enterprise')
    ]);

    return { basico, premium, enterprise };
  }

  private static async getPlanoStats(plano: string): Promise<{ clientes: number; receita: number; }> {
    const [count, revenue] = await Promise.all([
      prisma.tenant.count({ where: { plano, status: 'ativo' } }),
      prisma.tenant.aggregate({
        where: { plano, status: 'ativo' },
        _sum: { valorMensal: true }
      })
    ]);

    return {
      clientes: count,
      receita: revenue._sum.valorMensal || 0
    };
  }

  private static async getNewCustomersInPeriod(periodo: string): Promise<number> {
    const [year, month] = periodo.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return await prisma.tenant.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }
}

export default BillingMetricsModel;