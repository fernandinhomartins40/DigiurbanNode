import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth';
import { APIClient } from '@/auth';
import { analyticsService } from '@/services/analyticsService';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Building2, 
  FileText,
  AlertTriangle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Zap,
  RefreshCw
} from 'lucide-react';
import { 
  SuperAdminLayout,
  SuperAdminHeader,
  SuperAdminContent,
  SuperAdminKPIGrid,
  SuperAdminKPICard,
  SuperAdminSection,
  SuperAdminActionCard
} from "@/components/super-admin/SuperAdminDesignSystem";

// Interfaces para tipos de dados SaaS
interface SaaSMetrics {
  mrr: number;
  arrProjected: number;
  churnRate: number;
  cac: number;
  ltv: number;
  activeTenants: number;
  totalUsers: number;
  monthlyProtocols: number;
  growth: {
    mrrGrowth: number;
    tenantGrowth: number;
    userGrowth: number;
    protocolGrowth: number;
  };
  alerts: {
    id: string;
    type: 'churn' | 'payment' | 'usage' | 'technical';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
  }[];
}

interface RevenueData {
  month: string;
  mrr: number;
  newCustomers: number;
  churn: number;
}

interface PlanDistribution {
  STARTER: number;
  PROFESSIONAL: number;
  ENTERPRISE: number;
}

// Mock data para demonstração
const mockMetrics: SaaSMetrics = {
  mrr: 89750, // R$ 89.750 MRR
  arrProjected: 1077000, // R$ 1.077.000 ARR
  churnRate: 3.2, // 3.2% churn mensal
  cac: 850, // R$ 850 CAC
  ltv: 28500, // R$ 28.500 LTV
  activeTenants: 47,
  totalUsers: 1847,
  monthlyProtocols: 12749,
  growth: {
    mrrGrowth: 12.5,
    tenantGrowth: 8.9,
    userGrowth: 15.2,
    protocolGrowth: 23.7
  },
  alerts: [
    { id: '1', type: 'churn', message: 'Prefeitura de São José em risco de cancelamento', severity: 'high', count: 1 },
    { id: '2', type: 'payment', message: 'Faturas em atraso há mais de 7 dias', severity: 'medium', count: 3 },
    { id: '3', type: 'usage', message: 'Clientes próximos do limite do plano', severity: 'low', count: 5 },
    { id: '4', type: 'technical', message: 'Performance degradada em 2 tenants', severity: 'medium', count: 2 }
  ]
};

const mockRevenueData: RevenueData[] = [
  { month: 'Jun', mrr: 67250, newCustomers: 3, churn: 1 },
  { month: 'Jul', mrr: 72100, newCustomers: 4, churn: 0 },
  { month: 'Ago', mrr: 78950, newCustomers: 5, churn: 2 },
  { month: 'Set', mrr: 83200, newCustomers: 3, churn: 1 },
  { month: 'Out', mrr: 89750, newCustomers: 4, churn: 1 }
];

const mockPlanDistribution: PlanDistribution = {
  STARTER: 28,
  PROFESSIONAL: 15,
  ENTERPRISE: 4
};

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile: user, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<SaaSMetrics>(mockMetrics);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution>({ STARTER: 0, PROFESSIONAL: 0, ENTERPRISE: 0 });
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  // Função para resolver alertas
  const resolveAlert = (alertId: string) => {
    setMetrics(prev => ({
      ...prev,
      alerts: prev.alerts.filter(alert => alert.id !== alertId)
    }));
  };

  // Função para atualizar métricas
  const refreshMetrics = async () => {
    setLoading(true);
    try {
      console.log('🔄 Atualizando métricas do dashboard...');

      // Carregar métricas atualizadas
      const [
        analyticsOverview,
        tenantsMetrics
      ] = await Promise.all([
        analyticsService.getAnalyticsOverview('30d'),
        APIClient.get('/admin/tenants/metrics')
      ]);

      // Atualizar métricas com dados mais recentes
      setMetrics(prev => ({
        ...prev,
        mrr: tenantsMetrics?.receitaMensal || prev.mrr,
        arrProjected: (tenantsMetrics?.receitaMensal || prev.mrr) * 12,
        activeTenants: tenantsMetrics?.tenantsAtivos || prev.activeTenants,
        totalUsers: analyticsOverview?.uniqueUsers || tenantsMetrics?.usuariosTotal || prev.totalUsers,
        monthlyProtocols: tenantsMetrics?.protocolosTotal || prev.monthlyProtocols,
        growth: {
          ...prev.growth,
          mrrGrowth: tenantsMetrics?.crescimentoMensal || prev.growth.mrrGrowth
        }
      }));

      console.log('✅ Métricas atualizadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Proteção contra re-renderização múltipla
    if (isInitialized.current || authLoading || !user) {
      console.log('⏭️ Dashboard: Aguardando autenticação ou já inicializado');
      return;
    }

    // Verificar se é super admin
    if (user?.role !== 'super_admin') {
      console.warn('🚫 Dashboard SuperAdmin: Usuário não é super admin');
      navigate('/unauthorized');
      return;
    }

    // Carregar dados reais do banco
    const loadMetrics = async () => {
      setLoading(true);
      isInitialized.current = true;

      try {
        console.log('📊 Carregando métricas do dashboard super admin...');

        // Carregar métricas do dashboard e analytics via APIs
        const [
          saasMetricsData,
          alertsData,
          revenueEvolutionData,
          plansDistributionData,
          analyticsOverview,
          tenantsMetrics
        ] = await Promise.all([
          APIClient.get('/admin/saas-metrics'),
          APIClient.get('/admin/alerts'),
          APIClient.get('/admin/revenue-evolution'),
          APIClient.get('/admin/plan-distribution'),
          analyticsService.getAnalyticsOverview('30d'),
          APIClient.get('/admin/tenants/metrics')
        ]);

        // Combinar dados reais do backend com analytics
        const realMetrics: SaaSMetrics = {
          // Dados SaaS básicos do backend
          mrr: tenantsMetrics?.receitaMensal || 0,
          arrProjected: (tenantsMetrics?.receitaMensal || 0) * 12,
          churnRate: 3.2, // Mock - implementar cálculo real baseado em cancelamentos
          cac: 850, // Mock - implementar cálculo real
          ltv: 28500, // Mock - implementar cálculo real baseado em LTV médio
          activeTenants: tenantsMetrics?.tenantsAtivos || 0,
          totalUsers: analyticsOverview?.uniqueUsers || tenantsMetrics?.usuariosTotal || 0,
          monthlyProtocols: tenantsMetrics?.protocolosTotal || 0,
          growth: {
            mrrGrowth: tenantsMetrics?.crescimentoMensal || 0,
            tenantGrowth: 8.9, // Mock - implementar cálculo baseado em histórico
            userGrowth: 15.2, // Mock - implementar baseado em analytics
            protocolGrowth: 23.7 // Mock - implementar baseado em atividade
          },
          alerts: Array.isArray(alertsData) ? alertsData : []
        };

        // Processar dados de evolução de receita
        const processedRevenueData = Array.isArray(revenueEvolutionData)
          ? revenueEvolutionData.map((item: any, index: number) => ({
              month: item.month,
              mrr: item.receita || item.mrr || 0,
              newCustomers: Math.floor(Math.random() * 5) + 1, // Mock - implementar baseado em novos tenants
              churn: index > 0 ? Math.floor(Math.random() * 2) : 0 // Mock - implementar baseado em cancelamentos
            }))
          : [];

        // Processar distribuição de planos baseado nos dados reais
        const processedPlanDistribution = plansDistributionData || {
          STARTER: tenantsMetrics?.distribuicaoPlanos?.BASICO || 0,
          PROFESSIONAL: tenantsMetrics?.distribuicaoPlanos?.PREMIUM || 0,
          ENTERPRISE: tenantsMetrics?.distribuicaoPlanos?.ENTERPRISE || 0
        };

        // Atualizar states com dados reais
        setMetrics(realMetrics);
        setRevenueData(processedRevenueData);
        setPlanDistribution(processedPlanDistribution);

        console.log('✅ Métricas carregadas com sucesso:', {
          metrics: realMetrics,
          revenue: processedRevenueData,
          plans: processedPlanDistribution,
          analytics: analyticsOverview,
          tenants: tenantsMetrics
        });
      } catch (error) {
        console.error('❌ Erro ao carregar métricas:', error);

        // Fallback para dados mock em caso de erro, mas ainda tenta buscar dados básicos
        try {
          const fallbackTenantsData = await APIClient.get('/admin/tenants/metrics');
          const fallbackMetrics: SaaSMetrics = {
            mrr: fallbackTenantsData?.receitaMensal || 0,
            arrProjected: (fallbackTenantsData?.receitaMensal || 0) * 12,
            churnRate: 0,
            cac: 0,
            ltv: 0,
            activeTenants: fallbackTenantsData?.tenantsAtivos || 0,
            totalUsers: fallbackTenantsData?.usuariosTotal || 0,
            monthlyProtocols: fallbackTenantsData?.protocolosTotal || 0,
            growth: {
              mrrGrowth: fallbackTenantsData?.crescimentoMensal || 0,
              tenantGrowth: 0,
              userGrowth: 0,
              protocolGrowth: 0
            },
            alerts: []
          };
          setMetrics(fallbackMetrics);
        } catch (fallbackError) {
          console.error('❌ Erro no fallback:', fallbackError);
          // Usar dados completamente vazios como último recurso
          const emptyMetrics: SaaSMetrics = {
            mrr: 0,
            arrProjected: 0,
            churnRate: 0,
            cac: 0,
            ltv: 0,
            activeTenants: 0,
            totalUsers: 0,
            monthlyProtocols: 0,
            growth: {
              mrrGrowth: 0,
              tenantGrowth: 0,
              userGrowth: 0,
              protocolGrowth: 0
            },
            alerts: []
          };
          setMetrics(emptyMetrics);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [user, authLoading, navigate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'churn': return <TrendingDown className="h-4 w-4 text-current" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-current" />;
      case 'usage': return <BarChart3 className="h-4 w-4 text-current" />;
      case 'technical': return <Shield className="h-4 w-4 text-current" />;
      default: return <AlertTriangle className="h-4 w-4 text-current" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  // Aguardar carregamento da autenticação
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Verificação de tipo de usuário
  if (user.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Apenas Super Administradores podem acessar este painel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Carregando métricas SaaS...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminLayout>
      <SuperAdminHeader 
        title="Centro de Comando"
        subtitle="Gestão executiva da plataforma DigiUrban • Dashboard em tempo real"
        icon={BarChart3}
        statusInfo={[
          { label: "Sistema Online", status: "online", icon: "pulse" },
          { label: "Atualizado há 2 min", icon: Calendar }
        ]}
        badges={[
          { text: "Produção", variant: "success", icon: Zap }
        ]}
        actions={[
          { 
            text: "Atualizar Dados", 
            variant: "outline", 
            icon: RefreshCw, 
            onClick: refreshMetrics,
            loading: loading
          }
        ]}
      />

      <SuperAdminContent>
        
        {/* KPIs Principais */}
        <SuperAdminKPIGrid>
          
          {/* 1. MRR - Monthly Recurring Revenue */}
          <SuperAdminKPICard
            title="MRR"
            value={formatCurrency(metrics.mrr)}
            description="Monthly Recurring Revenue"
            trend={{
              value: formatPercentage(metrics.growth.mrrGrowth),
              direction: "up",
              label: "vs mês anterior"
            }}
            icon={DollarSign}
            variant="success"
          />

          {/* 2. ARR - Annual Recurring Revenue */}
          <SuperAdminKPICard
            title="ARR Projetado"
            value={formatCurrency(metrics.arrProjected)}
            description="Annual Recurring Revenue"
            trend={{
              value: "Projeção baseada no MRR atual",
              direction: "up"
            }}
            icon={Target}
            variant="primary"
          />

          {/* 3. Churn Rate */}
          <SuperAdminKPICard
            title="Churn Rate"
            value={`${metrics.churnRate.toFixed(1)}%`}
            description="Taxa de Cancelamento Mensal"
            trend={{
              value: "Abaixo da média SaaS (5%)",
              direction: "down",
              label: ""
            }}
            icon={TrendingDown}
            variant="warning"
          />

          {/* 4. CAC - Customer Acquisition Cost */}
          <SuperAdminKPICard
            title="CAC"
            value={formatCurrency(metrics.cac)}
            description="Customer Acquisition Cost"
            trend={{
              value: `LTV/CAC: ${(metrics.ltv / metrics.cac).toFixed(1)}x`,
              direction: "neutral"
            }}
            icon={Users}
            variant="purple"
          />

          {/* 5. LTV - Lifetime Value */}
          <SuperAdminKPICard
            title="LTV"
            value={formatCurrency(metrics.ltv)}
            description="Customer Lifetime Value"
            trend={{
              value: `Payback em ${Math.round(metrics.cac / (metrics.mrr / metrics.activeTenants))} meses`,
              direction: "up"
            }}
            icon={TrendingUp}
            variant="indigo"
          />

          {/* 6. Total de Tenants Ativos */}
          <SuperAdminKPICard
            title="Prefeituras Ativas"
            value={metrics.activeTenants.toString()}
            description="Clientes Ativos"
            trend={{
              value: formatPercentage(metrics.growth.tenantGrowth),
              direction: "up",
              label: "crescimento"
            }}
            icon={Building2}
            variant="teal"
          />

          {/* 7. Usuários Totais */}
          <SuperAdminKPICard
            title="Total de Usuários"
            value={metrics.totalUsers.toLocaleString()}
            description="Usuários Únicos"
            trend={{
              value: formatPercentage(metrics.growth.userGrowth),
              direction: "up",
              label: "este mês"
            }}
            icon={Users}
            variant="pink"
          />

          {/* 8. Protocolos Processados */}
          <SuperAdminKPICard
            title="Protocolos Mensais"
            value={metrics.monthlyProtocols.toLocaleString()}
            description="Volume Total Mensal"
            trend={{
              value: formatPercentage(metrics.growth.protocolGrowth),
              direction: "up",
              label: "volume"
            }}
            icon={FileText}
            variant="slate"
          />
        </SuperAdminKPIGrid>

        {/* Gráficos e Análises */}
        <SuperAdminSection title="Análise de Performance" description="Métricas detalhadas e tendências">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Evolução de Receita */}
            <SuperAdminSection 
              title="Evolução de Receita (MRR)" 
              description="Monthly Recurring Revenue - últimos 5 meses"
              variant="full-width"
            >
              <div className="space-y-4">
                {revenueData.map((data, index) => {
                  const maxMrr = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.mrr)) : 1;
                  const widthPercentage = revenueData.length > 0 ? (data.mrr * 100) / maxMrr : 0;
                  return (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-sm w-12">{data.month}</div>
                      <div className="w-64 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${widthPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-emerald-600">{formatCurrency(data.mrr)}</span>
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        +{data.newCustomers} novos
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </SuperAdminSection>

            {/* Distribuição por Plano */}
            <SuperAdminSection 
              title="Distribuição por Plano" 
              description="Prefeituras por categoria de assinatura"
              icon={PieChart}
            >
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Starter</span>
                    </div>
                    <div className="text-sm font-semibold text-purple-700">{planDistribution.STARTER}</div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${metrics.activeTenants > 0 ? (planDistribution.STARTER / metrics.activeTenants) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Professional</span>
                    </div>
                    <div className="text-sm font-semibold text-blue-700">{planDistribution.PROFESSIONAL}</div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${metrics.activeTenants > 0 ? (planDistribution.PROFESSIONAL / metrics.activeTenants) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-medium">Enterprise</span>
                    </div>
                    <div className="text-sm font-semibold text-emerald-700">{planDistribution.ENTERPRISE}</div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${metrics.activeTenants > 0 ? (planDistribution.ENTERPRISE / metrics.activeTenants) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </SuperAdminSection>
          </div>
        </SuperAdminSection>

        {/* Alertas Críticos */}
        <SuperAdminSection 
          title={`Alertas Críticos (${metrics.alerts.length})`}
          description="Situações que requerem atenção imediata"
          icon={AlertTriangle}
          variant="warning"
        >
          <div className="space-y-3">
            {metrics.alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200/50' :
                  alert.severity === 'high' ? 'bg-orange-50 border-orange-200/50' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200/50' :
                  'bg-slate-50 border-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{alert.message}</p>
                    <p className="text-xs text-slate-600 capitalize mt-1">{alert.type} • {alert.severity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {alert.count} {alert.count === 1 ? 'item' : 'itens'}
                  </div>
                  <button 
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1 text-xs text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded font-medium transition-all"
                  >
                    Resolver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SuperAdminSection>

        {/* Ações Rápidas */}
        <SuperAdminSection 
          title="Ações Rápidas"
          description="Acesso direto às principais funcionalidades administrativas"
          icon={Zap}
          variant="primary"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SuperAdminActionCard
              title="Gerenciar Tenants"
              description="Administrar prefeituras"
              icon={Building2}
              variant="primary"
              onClick={() => navigate('/super-admin/tenants')}
            />
            
            <SuperAdminActionCard
              title="Gestão Financeira"
              description="Billing e receitas"
              icon={DollarSign}
              variant="purple"
              onClick={() => navigate('/super-admin/billing')}
            />
            
            <SuperAdminActionCard
              title="Analytics"
              description="Relatórios empresariais"
              icon={BarChart3}
              variant="success"
              onClick={() => navigate('/super-admin/analytics')}
            />
          </div>
        </SuperAdminSection>

      </SuperAdminContent>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;