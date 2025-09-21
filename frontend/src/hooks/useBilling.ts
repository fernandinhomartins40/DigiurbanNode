// ====================================================================
// 🔄 HOOK PERSONALIZADO - BILLING API INTEGRATION
// ====================================================================
// Hook para integração com APIs de billing do backend DigiUrban
// Gerenciamento de estado, cache e operações CRUD
// ====================================================================

import { useState, useEffect, useCallback } from 'react';
import { APIClient } from '@/auth/utils/httpInterceptor';

// ====================================================================
// INTERFACES (seguindo schema exato do backend)
// ====================================================================

export interface Invoice {
  id: string;
  tenantId: string;
  numero: string;
  periodo: string;
  valor: number;
  descricao: string;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  dataCriacao: string;
  dataVencimento: string;
  dataPagamento?: string;
  metodoPagamento?: string;
  desconto: number;
  taxaAdicional: number;
  plano: 'basico' | 'premium' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  tipo: 'subscription' | 'usage' | 'setup' | 'support';
}

export interface BillingMetrics {
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

export interface CreateInvoiceData {
  tenantId: string;
  numero?: string;
  periodo: string;
  valor: number;
  descricao: string;
  dataVencimento: string;
  desconto?: number;
  taxaAdicional?: number;
  plano: 'basico' | 'premium' | 'enterprise';
}

export interface InvoiceFilters {
  status?: string;
  plano?: string;
  tenantId?: string;
  periodo?: string;
  dataVencimentoStart?: string;
  dataVencimentoEnd?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ====================================================================
// HOOK PRINCIPAL - useBilling
// ====================================================================

export const useBilling = () => {
  // Estados principais
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    pages: 0
  });

  // ================================================================
  // OPERAÇÕES DE MÉTRICAS
  // ================================================================

  const fetchMetrics = useCallback(async (periodo?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await APIClient.get('/admin/billing/metrics', {
        params: { periodo }
      });

      if (response.data.success) {
        setMetrics(response.data.data);
      } else {
        throw new Error(response.data.error || 'Erro ao buscar métricas');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar métricas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRevenueEvolution = useCallback(async (months: number = 6) => {
    try {
      const response = await APIClient.get('/admin/billing/revenue-evolution', {
        params: { months }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erro ao buscar evolução de receita');
      }
    } catch (err: any) {
      console.error('Erro ao buscar evolução de receita:', err);
      throw err;
    }
  }, []);

  // ================================================================
  // OPERAÇÕES DE FATURAS
  // ================================================================

  const fetchInvoices = useCallback(async (filters: InvoiceFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await APIClient.get('/admin/billing/invoices', {
        params: {
          limit: filters.limit || 50,
          offset: filters.offset || 0,
          status: filters.status,
          plano: filters.plano,
          tenantId: filters.tenantId,
          periodo: filters.periodo,
          dataVencimentoStart: filters.dataVencimentoStart,
          dataVencimentoEnd: filters.dataVencimentoEnd,
          search: filters.search,
          sortBy: filters.sortBy || 'dataCriacao',
          sortOrder: filters.sortOrder || 'desc'
        }
      });

      if (response.data.success) {
        setInvoices(response.data.data.invoices);
        setPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.error || 'Erro ao buscar faturas');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar faturas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvoice = useCallback(async (invoiceData: CreateInvoiceData): Promise<Invoice> => {
    try {
      setLoading(true);
      setError(null);

      const response = await APIClient.post('/admin/billing/invoices', invoiceData);

      if (response.data.success) {
        const newInvoice = response.data.data;
        setInvoices(prev => [newInvoice, ...prev]);
        return newInvoice;
      } else {
        throw new Error(response.data.error || 'Erro ao criar fatura');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao criar fatura:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markInvoiceAsPaid = useCallback(async (id: string, metodoPagamento: string, dataPagamento?: string): Promise<Invoice> => {
    try {
      setLoading(true);
      setError(null);

      const response = await APIClient.post(`/admin/billing/invoices/${id}/pay`, {
        metodoPagamento,
        dataPagamento
      });

      if (response.data.success) {
        const updatedInvoice = response.data.data;
        setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));

        // Atualizar métricas após pagamento
        await fetchMetrics();

        return updatedInvoice;
      } else {
        throw new Error(response.data.error || 'Erro ao marcar fatura como paga');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao marcar fatura como paga:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);

  const markOverdueInvoices = useCallback(async (): Promise<number> => {
    try {
      setLoading(true);
      setError(null);

      const response = await APIClient.post('/admin/billing/invoices/mark-overdue');

      if (response.data.success) {
        // Recarregar faturas após marcar vencidas
        await fetchInvoices();
        await fetchMetrics();

        return response.data.data.count;
      } else {
        throw new Error(response.data.error || 'Erro ao marcar faturas vencidas');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao marcar faturas vencidas:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchInvoices, fetchMetrics]);

  // ================================================================
  // EFEITO INICIAL
  // ================================================================

  useEffect(() => {
    // Carregar dados iniciais
    Promise.all([
      fetchMetrics(),
      fetchInvoices()
    ]);
  }, [fetchMetrics, fetchInvoices]);

  // ================================================================
  // RETORNO DO HOOK
  // ================================================================

  return {
    // Estados
    metrics,
    invoices,
    loading,
    error,
    pagination,

    // Funções de métricas
    fetchMetrics,
    fetchRevenueEvolution,

    // Funções de faturas
    fetchInvoices,
    createInvoice,
    markInvoiceAsPaid,
    markOverdueInvoices,

    // Utilitários
    refetch: () => Promise.all([fetchMetrics(), fetchInvoices()]),
    clearError: () => setError(null)
  };
};

export default useBilling;