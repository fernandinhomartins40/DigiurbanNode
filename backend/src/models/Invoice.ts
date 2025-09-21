// ====================================================================
// 🧾 INVOICE MODEL - DIGIURBAN BILLING SYSTEM
// ====================================================================
// Modelo de faturas seguindo exatamente a nomenclatura do schema
// Sistema completo de billing com MRR, ARR e métricas SaaS
// ====================================================================

import { prisma } from '../database/prisma.js';
import { Invoice, InvoiceItem, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

// ====================================================================
// INTERFACES E TIPOS (seguindo schema exato)
// ====================================================================

export type InvoiceStatus = 'pendente' | 'pago' | 'vencido' | 'cancelado';
export type InvoiceItemType = 'subscription' | 'usage' | 'setup' | 'support';
export type PlanoTenant = 'basico' | 'premium' | 'enterprise';

export interface CreateInvoiceData {
  tenantId: string;
  numero: string;
  periodo: string;
  valor: number;
  descricao?: string;
  status?: InvoiceStatus;
  dataVencimento: Date;
  dataPagamento?: Date;
  metodoPagamento?: string;
  desconto?: number;
  taxaAdicional?: number;
  plano: PlanoTenant;
  itens?: CreateInvoiceItemData[];
}

export interface CreateInvoiceItemData {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  tipo: InvoiceItemType;
}

export interface UpdateInvoiceData {
  numero?: string;
  periodo?: string;
  valor?: number;
  descricao?: string;
  status?: InvoiceStatus;
  dataVencimento?: Date;
  dataPagamento?: Date;
  metodoPagamento?: string;
  desconto?: number;
  taxaAdicional?: number;
  plano?: PlanoTenant;
}

export interface InvoiceWithItems extends Invoice {
  itens: InvoiceItem[];
  tenant?: {
    nome: string;
    cidade: string;
    estado: string;
  };
}

export interface InvoiceListOptions {
  limit?: number;
  offset?: number;
  status?: InvoiceStatus;
  plano?: PlanoTenant;
  tenantId?: string;
  periodo?: string;
  dataVencimentoStart?: Date;
  dataVencimentoEnd?: Date;
  search?: string;
  sortBy?: 'dataCriacao' | 'dataVencimento' | 'valor' | 'numero';
  sortOrder?: 'asc' | 'desc';
}

// ====================================================================
// CLASSE DO MODELO INVOICE (seguindo schema exato)
// ====================================================================

export class InvoiceModel {

  // ================================================================
  // CRIAÇÃO DE FATURA
  // ================================================================

  static async create(invoiceData: CreateInvoiceData): Promise<InvoiceWithItems> {
    const startTime = Date.now();
    const id = uuidv4();

    try {
      // Validar dados
      this.validateInvoiceData(invoiceData);

      // Verificar se número já existe
      const existingInvoice = await this.findByNumero(invoiceData.numero);
      if (existingInvoice) {
        throw new Error('Número da fatura já existe');
      }

      // Calcular valor total com descontos e taxas
      const valorFinal = invoiceData.valor - (invoiceData.desconto || 0) + (invoiceData.taxaAdicional || 0);

      const invoice = await prisma.invoice.create({
        data: {
          id,
          tenantId: invoiceData.tenantId,
          numero: invoiceData.numero,
          periodo: invoiceData.periodo,
          valor: invoiceData.valor,
          descricao: invoiceData.descricao,
          status: invoiceData.status || 'pendente',
          dataCriacao: new Date(),
          dataVencimento: invoiceData.dataVencimento,
          dataPagamento: invoiceData.dataPagamento,
          metodoPagamento: invoiceData.metodoPagamento,
          desconto: invoiceData.desconto || 0,
          taxaAdicional: invoiceData.taxaAdicional || 0,
          plano: invoiceData.plano,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          itens: true,
          tenant: {
            select: { nome: true, cidade: true, estado: true }
          }
        }
      });

      // Criar itens da fatura se fornecidos
      if (invoiceData.itens && invoiceData.itens.length > 0) {
        await Promise.all(
          invoiceData.itens.map(item =>
            prisma.invoiceItem.create({
              data: {
                invoiceId: id,
                descricao: item.descricao,
                quantidade: item.quantidade,
                valorUnitario: item.valorUnitario,
                valorTotal: item.valorTotal,
                tipo: item.tipo,
                createdAt: new Date()
              }
            })
          )
        );
      }

      // Buscar fatura completa com itens
      const fullInvoice = await this.findById(id);
      if (!fullInvoice) {
        throw new Error('Erro ao criar fatura');
      }

      // Log de sucesso
      const duration = Date.now() - startTime;
      StructuredLogger.business('Fatura criada com sucesso', {
        action: 'invoice_create',
        tenantId: invoiceData.tenantId,
        invoiceId: id,
        valor: valorFinal,
        plano: invoiceData.plano
      });

      StructuredLogger.performance('Criação de fatura', {
        action: 'invoice_create',
        duration,
        threshold: 1000
      });

      return fullInvoice;
    } catch (error) {
      StructuredLogger.error('Falha ao criar fatura', error, {
        action: 'invoice_create',
        tenantId: invoiceData.tenantId,
        errorType: 'database_error'
      });
      throw error;
    }
  }

  // ================================================================
  // BUSCA DE FATURAS
  // ================================================================

  static async findById(id: string): Promise<InvoiceWithItems | null> {
    try {
      return await prisma.invoice.findUnique({
        where: { id },
        include: {
          itens: true,
          tenant: {
            select: { nome: true, cidade: true, estado: true }
          }
        }
      }) as InvoiceWithItems | null;
    } catch (error) {
      StructuredLogger.error('Erro ao buscar fatura por ID', error, {
        action: 'invoice_find_by_id',
        invoiceId: id
      });
      throw error;
    }
  }

  static async findByNumero(numero: string): Promise<InvoiceWithItems | null> {
    try {
      return await prisma.invoice.findUnique({
        where: { numero },
        include: {
          itens: true,
          tenant: {
            select: { nome: true, cidade: true, estado: true }
          }
        }
      }) as InvoiceWithItems | null;
    } catch (error) {
      StructuredLogger.error('Erro ao buscar fatura por número', error, {
        action: 'invoice_find_by_numero',
        numero: numero.substring(0, 10) + '...'
      });
      throw error;
    }
  }

  static async findByTenant(tenantId: string): Promise<InvoiceWithItems[]> {
    return await prisma.invoice.findMany({
      where: { tenantId },
      include: {
        itens: true,
        tenant: {
          select: { nome: true, cidade: true, estado: true }
        }
      },
      orderBy: { dataCriacao: 'desc' }
    }) as InvoiceWithItems[];
  }

  static async findByStatus(status: InvoiceStatus): Promise<InvoiceWithItems[]> {
    return await prisma.invoice.findMany({
      where: { status },
      include: {
        itens: true,
        tenant: {
          select: { nome: true, cidade: true, estado: true }
        }
      },
      orderBy: { dataCriacao: 'desc' }
    }) as InvoiceWithItems[];
  }

  // ================================================================
  // ATUALIZAÇÃO DE FATURA
  // ================================================================

  static async update(id: string, updates: UpdateInvoiceData): Promise<InvoiceWithItems> {
    const invoice = await this.findById(id);
    if (!invoice) {
      throw new Error('Fatura não encontrada');
    }

    // Verificar se novo número já existe
    if (updates.numero && updates.numero !== invoice.numero) {
      const existingInvoice = await this.findByNumero(updates.numero);
      if (existingInvoice && existingInvoice.id !== id) {
        throw new Error('Número da fatura já existe');
      }
    }

    const updateData: any = {};

    if (updates.numero) updateData.numero = updates.numero;
    if (updates.periodo) updateData.periodo = updates.periodo;
    if (updates.valor !== undefined) updateData.valor = updates.valor;
    if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
    if (updates.status) updateData.status = updates.status;
    if (updates.dataVencimento) updateData.dataVencimento = updates.dataVencimento;
    if (updates.dataPagamento !== undefined) updateData.dataPagamento = updates.dataPagamento;
    if (updates.metodoPagamento !== undefined) updateData.metodoPagamento = updates.metodoPagamento;
    if (updates.desconto !== undefined) updateData.desconto = updates.desconto;
    if (updates.taxaAdicional !== undefined) updateData.taxaAdicional = updates.taxaAdicional;
    if (updates.plano) updateData.plano = updates.plano;

    updateData.updatedAt = new Date();

    await prisma.invoice.update({
      where: { id },
      data: updateData
    });

    const updatedInvoice = await this.findById(id);
    if (!updatedInvoice) {
      throw new Error('Erro ao atualizar fatura');
    }

    return updatedInvoice;
  }

  // ================================================================
  // MARCAR COMO PAGO
  // ================================================================

  static async markAsPaid(id: string, metodoPagamento: string, dataPagamento?: Date): Promise<InvoiceWithItems> {
    const invoice = await this.findById(id);
    if (!invoice) {
      throw new Error('Fatura não encontrada');
    }

    if (invoice.status === 'pago') {
      throw new Error('Fatura já foi paga');
    }

    await prisma.invoice.update({
      where: { id },
      data: {
        status: 'pago',
        dataPagamento: dataPagamento || new Date(),
        metodoPagamento,
        updatedAt: new Date()
      }
    });

    const updatedInvoice = await this.findById(id);
    if (!updatedInvoice) {
      throw new Error('Erro ao marcar fatura como paga');
    }

    StructuredLogger.business('Fatura marcada como paga', {
      action: 'invoice_paid',
      tenantId: updatedInvoice.tenantId,
      invoiceId: id,
      valor: updatedInvoice.valor,
      metodoPagamento
    });

    return updatedInvoice;
  }

  // ================================================================
  // MARCAR COMO VENCIDA
  // ================================================================

  static async markAsOverdue(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.invoice.updateMany({
      where: {
        status: 'pendente',
        dataVencimento: {
          lt: today
        }
      },
      data: {
        status: 'vencido',
        updatedAt: new Date()
      }
    });

    StructuredLogger.business('Faturas marcadas como vencidas', {
      action: 'invoices_mark_overdue',
      count: result.count
    });

    return result.count;
  }

  // ================================================================
  // LISTAGEM E PAGINAÇÃO
  // ================================================================

  static async list(options: InvoiceListOptions = {}): Promise<{
    invoices: InvoiceWithItems[];
    total: number;
    summary: {
      totalPendente: number;
      totalPago: number;
      totalVencido: number;
      valorTotal: number;
    };
  }> {
    const where: Prisma.InvoiceWhereInput = {};

    if (options.status) where.status = options.status;
    if (options.plano) where.plano = options.plano;
    if (options.tenantId) where.tenantId = options.tenantId;
    if (options.periodo) where.periodo = { contains: options.periodo };

    if (options.dataVencimentoStart || options.dataVencimentoEnd) {
      where.dataVencimento = {};
      if (options.dataVencimentoStart) where.dataVencimento.gte = options.dataVencimentoStart;
      if (options.dataVencimentoEnd) where.dataVencimento.lte = options.dataVencimentoEnd;
    }

    if (options.search) {
      where.OR = [
        { numero: { contains: options.search } },
        { descricao: { contains: options.search } },
        { tenant: { nome: { contains: options.search } } }
      ];
    }

    const [invoices, total, summary] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          itens: true,
          tenant: {
            select: { nome: true, cidade: true, estado: true }
          }
        },
        orderBy: {
          [options.sortBy || 'dataCriacao']: options.sortOrder || 'desc'
        },
        take: options.limit,
        skip: options.offset
      }),
      prisma.invoice.count({ where }),
      this.getSummary(where)
    ]);

    return {
      invoices: invoices as InvoiceWithItems[],
      total,
      summary
    };
  }

  // ================================================================
  // RESUMO FINANCEIRO
  // ================================================================

  static async getSummary(where: Prisma.InvoiceWhereInput = {}): Promise<{
    totalPendente: number;
    totalPago: number;
    totalVencido: number;
    valorTotal: number;
  }> {
    const [pendente, pago, vencido, valorTotal] = await Promise.all([
      prisma.invoice.count({ where: { ...where, status: 'pendente' } }),
      prisma.invoice.count({ where: { ...where, status: 'pago' } }),
      prisma.invoice.count({ where: { ...where, status: 'vencido' } }),
      prisma.invoice.aggregate({
        where,
        _sum: { valor: true }
      })
    ]);

    return {
      totalPendente: pendente,
      totalPago: pago,
      totalVencido: vencido,
      valorTotal: valorTotal._sum.valor || 0
    };
  }

  // ================================================================
  // GERAÇÃO DE NÚMERO AUTOMÁTICO
  // ================================================================

  static async generateInvoiceNumber(tenantId: string, date: Date = new Date()): Promise<string> {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Contar faturas do mês para o tenant
    const startOfMonth = new Date(year, date.getMonth(), 1);
    const endOfMonth = new Date(year, date.getMonth() + 1, 0);

    const count = await prisma.invoice.count({
      where: {
        tenantId,
        dataCriacao: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const sequence = (count + 1).toString().padStart(3, '0');
    return `FAT-${year}${month}-${sequence}`;
  }

  // ================================================================
  // SOFT DELETE
  // ================================================================

  static async softDelete(id: string): Promise<void> {
    await prisma.invoice.update({
      where: { id },
      data: {
        status: 'cancelado',
        updatedAt: new Date()
      }
    });
  }

  static async hardDelete(id: string): Promise<void> {
    await prisma.invoice.delete({
      where: { id }
    });
  }

  // ================================================================
  // VALIDAÇÕES
  // ================================================================

  private static validateInvoiceData(invoiceData: CreateInvoiceData): void {
    if (!invoiceData.tenantId) {
      throw new Error('Tenant ID é obrigatório');
    }

    if (!invoiceData.numero || invoiceData.numero.trim().length < 3) {
      throw new Error('Número da fatura é obrigatório (mínimo 3 caracteres)');
    }

    if (!invoiceData.periodo || invoiceData.periodo.trim().length < 2) {
      throw new Error('Período é obrigatório (mínimo 2 caracteres)');
    }

    if (!invoiceData.valor || invoiceData.valor <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    if (!invoiceData.dataVencimento) {
      throw new Error('Data de vencimento é obrigatória');
    }

    if (!invoiceData.plano || !['basico', 'premium', 'enterprise'].includes(invoiceData.plano)) {
      throw new Error('Plano inválido');
    }
  }

  // ================================================================
  // MÉTODOS DE CONVENIÊNCIA
  // ================================================================

  static async count(filters: {
    status?: InvoiceStatus;
    plano?: PlanoTenant;
    tenantId?: string;
  } = {}): Promise<number> {
    const where: Prisma.InvoiceWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.plano) where.plano = filters.plano;
    if (filters.tenantId) where.tenantId = filters.tenantId;

    return await prisma.invoice.count({ where });
  }

  static async getMonthlyRevenue(year: number, month: number): Promise<number> {
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
      _sum: {
        valor: true
      }
    });

    return result._sum.valor || 0;
  }

  static async getRevenueByPlan(plano: PlanoTenant): Promise<number> {
    const result = await prisma.invoice.aggregate({
      where: {
        plano,
        status: 'pago'
      },
      _sum: {
        valor: true
      }
    });

    return result._sum.valor || 0;
  }
}

export default InvoiceModel;