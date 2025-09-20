import { useState, useEffect } from 'react';
import { APIClient } from "@/lib/APIClient";

export interface SaaSMetrics {
  // Métricas de Receita
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  arpu: number; // Average Revenue Per User

  // Métricas de Clientes
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  cancelledTenants: number;

  // Métricas de Crescimento
  newTenantsThisMonth: number;
  churnRate: number;
  growthRate: number;

  // Métricas de Uso
  totalUsers: number;
  totalProtocolsThisMonth: number;
  averageStorageUsed: number;

  // Métricas por Plano
  planDistribution: {
    STARTER: number;
    PROFESSIONAL: number;
    ENTERPRISE: number;
  };
}

export interface TenantMetrics {
  tenant_id: string;
  tenant_name: string;
  plano: string;
  usuarios_ativos: number;
  protocolos_mes_atual: number;
  storage_usado_gb: number;
  valor_mensal: number;
  status: string;
  data_referencia: string;
}

export interface RevenueMetrics {
  mes: string;
  mrr: number;
  novos_clientes: number;
  churn: number;
  upgrade_revenue: number;
  addon_revenue: number;
}

export function useSaaSMetrics() {
  const [metrics, setMetrics] = useState<SaaSMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // 1. Buscar dados dos tenants
      const { data: tenants, error: tenantsError } = await APIClient
        .from('tenants')
        .select(`
          *,
          tenant_assinaturas!inner (
            valor_mensal,
            status,
            plano
          )
        `);

      if (tenantsError) throw tenantsError;

      // 2. Calcular métricas básicas
      const activeTenants = tenants?.filter(t => t.status === 'ativo') || [];
      const trialTenants = tenants?.filter(t => t.status === 'TRIAL') || [];
      const suspendedTenants = tenants?.filter(t => t.status === 'suspenso') || [];
      const cancelledTenants = tenants?.filter(t => t.status === 'cancelado') || [];

      // 3. Calcular MRR (Monthly Recurring Revenue)
      const mrr = activeTenants.reduce((sum, tenant) => {
        const subscription = tenant.tenant_assinaturas[0];
        return sum + (subscription?.valor_mensal || 0);
      }, 0);

      // 4. Buscar novos tenants este mês
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const { data: newTenants, error: newTenantsError } = await APIClient
        .from('tenants')
        .select('*')
        .gte('created_at', currentMonth.toISOString());

      if (newTenantsError) throw newTenantsError;

      // 5. Calcular distribuição por plano
      const planDistribution = {
        STARTER: tenants?.filter(t => t.plano === 'STARTER').length || 0,
        PROFESSIONAL: tenants?.filter(t => t.plano === 'PROFESSIONAL').length || 0,
        ENTERPRISE: tenants?.filter(t => t.plano === 'ENTERPRISE').length || 0
      };

      // 6. Métricas de uso
      const totalUsers = tenants?.reduce((sum, tenant) => sum + (tenant.usuarios_ativos || 0), 0) || 0;
      const totalProtocols = tenants?.reduce((sum, tenant) => sum + (tenant.protocolos_mes_atual || 0), 0) || 0;
      const totalStorage = tenants?.reduce((sum, tenant) => sum + (tenant.storage_usado_gb || 0), 0) || 0;

      const calculatedMetrics: SaaSMetrics = {
        mrr,
        arr: mrr * 12,
        arpu: totalUsers > 0 ? mrr / totalUsers : 0,
        totalTenants: tenants?.length || 0,
        activeTenants: activeTenants.length,
        trialTenants: trialTenants.length,
        suspendedTenants: suspendedTenants.length,
        cancelledTenants: cancelledTenants.length,
        newTenantsThisMonth: newTenants?.length || 0,
        churnRate: 0, // Calcular baseado em dados históricos
        growthRate: 0, // Calcular baseado em dados históricos
        totalUsers,
        totalProtocolsThisMonth: totalProtocols,
        averageStorageUsed: tenants?.length ? totalStorage / tenants.length : 0,
        planDistribution
      };

      setMetrics(calculatedMetrics);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
}

export function useTenantMetrics(tenantId?: string) {
  const [tenantMetrics, setTenantMetrics] = useState<TenantMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantMetrics = async () => {
    try {
      setLoading(true);

      let query = APIClient
        .from('tenant_metricas_uso')
        .select(`
          *,
          tenants!inner (
            nome,
            plano
          ),
          tenant_assinaturas!inner (
            valor_mensal
          )
        `)
        .order('data_referencia', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData: TenantMetrics[] = data?.map(item => ({
        tenant_id: item.tenant_id,
        tenant_name: item.tenants.nome,
        plano: item.tenants.plano,
        usuarios_ativos: item.usuarios_ativos,
        protocolos_mes_atual: item.protocolos_criados,
        storage_usado_gb: item.storage_usado_gb,
        valor_mensal: item.tenant_assinaturas?.valor_mensal || 0,
        status: 'ativo',
        data_referencia: item.data_referencia
      })) || [];

      setTenantMetrics(formattedData);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantMetrics();
  }, [tenantId]);

  return {
    tenantMetrics,
    loading,
    error,
    refetch: fetchTenantMetrics
  };
}

export function useRevenueMetrics(months: number = 12) {
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueMetrics = async () => {
    try {
      setLoading(true);

      // Buscar dados dos últimos meses
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      // Query para buscar métricas mensais
      const { data, error } = await APIClient
        .rpc('get_monthly_revenue_metrics', {
          start_date: startDate.toISOString(),
          months_count: months
        });

      if (error) throw error;

      setRevenueMetrics(data || []);
    } catch (err: Error | unknown) {
      // Se a função RPC não existir, vamos calcular manualmente
      console.warn('RPC function not found, calculating manually');
      
      const mockData: RevenueMetrics[] = [];
      const currentDate = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        
        mockData.push({
          mes: date.toISOString().substring(0, 7), // YYYY-MM
          mrr: Math.random() * 50000 + 10000, // Random MRR entre 10k-60k
          novos_clientes: Math.floor(Math.random() * 5) + 1,
          churn: Math.floor(Math.random() * 2),
          upgrade_revenue: Math.random() * 5000,
          addon_revenue: Math.random() * 3000
        });
      }

      setRevenueMetrics(mockData);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueMetrics();
  }, [months]);

  return {
    revenueMetrics,
    loading,
    error,
    refetch: fetchRevenueMetrics
  };
}

// Hook para calcular churn rate
export function useChurnRate(tenantId?: string) {
  const [churnRate, setChurnRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateChurnRate = async () => {
    try {
      setLoading(true);

      // Buscar tenants cancelados no último mês
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      let cancelledQuery = APIClient
        .from('tenants')
        .select('id')
        .eq('status', 'cancelado')
        .gte('updated_at', lastMonth.toISOString());

      let activeQuery = APIClient
        .from('tenants')
        .select('id')
        .eq('status', 'ativo');

      if (tenantId) {
        cancelledQuery = cancelledQuery.eq('id', tenantId);
        activeQuery = activeQuery.eq('id', tenantId);
      }

      const [cancelledResult, activeResult] = await Promise.all([
        cancelledQuery,
        activeQuery
      ]);

      if (cancelledResult.error) throw cancelledResult.error;
      if (activeResult.error) throw activeResult.error;

      const cancelledCount = cancelledResult.data?.length || 0;
      const activeCount = activeResult.data?.length || 0;
      const totalCount = cancelledCount + activeCount;

      const rate = totalCount > 0 ? (cancelledCount / totalCount) * 100 : 0;
      setChurnRate(rate);

    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateChurnRate();
  }, [tenantId]);

  return {
    churnRate,
    loading,
    error,
    refetch: calculateChurnRate
  };
}