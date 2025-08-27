import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Calendar,
  ArrowUp,
  ArrowDown,
  Target,
  Zap,
  Award,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { useSaaSMetrics, useRevenueMetrics, useChurnRate } from "@/hooks/useSaaSMetrics";

const SaaSMetricsDashboard: React.FC = () => {
  const { metrics, loading: metricsLoading } = useSaaSMetrics();
  const { revenueMetrics, loading: revenueLoading } = useRevenueMetrics(12);
  const { churnRate, loading: churnLoading } = useChurnRate();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const loading = metricsLoading || revenueLoading || churnLoading;

  // Calcular métricas derivadas
  const calculateGrowthMetrics = () => {
    if (!revenueMetrics || revenueMetrics.length < 2) return null;

    const currentMonth = revenueMetrics[revenueMetrics.length - 1];
    const previousMonth = revenueMetrics[revenueMetrics.length - 2];

    const mrrGrowth = currentMonth.mrr && previousMonth.mrr 
      ? ((currentMonth.mrr - previousMonth.mrr) / previousMonth.mrr) * 100
      : 0;

    const customerGrowth = currentMonth.novos_clientes && previousMonth.novos_clientes
      ? ((currentMonth.novos_clientes - previousMonth.novos_clientes) / previousMonth.novos_clientes) * 100
      : 0;

    return {
      mrrGrowth,
      customerGrowth,
      currentMrr: currentMonth.mrr,
      previousMrr: previousMonth.mrr
    };
  };

  const growthMetrics = calculateGrowthMetrics();

  // Calcular LTV (Customer Lifetime Value) estimado
  const calculateLTV = () => {
    if (!metrics || churnRate === 0) return 0;
    const monthlyChurnRate = churnRate / 100;
    const avgLifetimeMonths = monthlyChurnRate > 0 ? 1 / monthlyChurnRate : 36; // Max 36 meses
    return metrics.arpu * avgLifetimeMonths;
  };

  // Calcular saúde da empresa
  const calculateCompanyHealth = () => {
    if (!metrics || !growthMetrics) return 'N/A';

    let score = 0;
    
    // MRR Growth (0-30 pontos)
    if (growthMetrics.mrrGrowth > 20) score += 30;
    else if (growthMetrics.mrrGrowth > 10) score += 20;
    else if (growthMetrics.mrrGrowth > 0) score += 10;

    // Churn Rate (0-25 pontos)
    if (churnRate < 2) score += 25;
    else if (churnRate < 5) score += 20;
    else if (churnRate < 10) score += 10;

    // Customer Growth (0-25 pontos)
    if (metrics.newTenantsThisMonth > 5) score += 25;
    else if (metrics.newTenantsThisMonth > 2) score += 15;
    else if (metrics.newTenantsThisMonth > 0) score += 10;

    // Revenue Size (0-20 pontos)
    if (metrics.mrr > 100000) score += 20;
    else if (metrics.mrr > 50000) score += 15;
    else if (metrics.mrr > 10000) score += 10;

    if (score >= 80) return { status: 'Excelente', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { status: 'Boa', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { status: 'Regular', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'Precisa Atenção', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const companyHealth = calculateCompanyHealth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Métricas SaaS</h1>
              <p className="text-gray-600 mt-1">Dashboard executivo da plataforma DigiUrban</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="12m">Últimos 12 meses</option>
              </select>
              
              {/* Health Score Badge */}
              {companyHealth !== 'N/A' && (
                <div className={`inline-flex items-center px-3 py-2 rounded-lg ${companyHealth.bg}`}>
                  <Activity className={`h-4 w-4 mr-2 ${companyHealth.color}`} />
                  <span className={`text-sm font-medium ${companyHealth.color}`}>
                    Saúde: {companyHealth.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* MRR */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MRR</p>
                <p className="text-3xl font-bold text-gray-900">
                  R$ {metrics?.mrr?.toLocaleString('pt-BR') || '0'}
                </p>
                {growthMetrics && (
                  <div className={`flex items-center mt-2 ${
                    growthMetrics.mrrGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {growthMetrics.mrrGrowth >= 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(growthMetrics.mrrGrowth).toFixed(1)}% vs mês anterior
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* ARR */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ARR</p>
                <p className="text-3xl font-bold text-gray-900">
                  R$ {metrics?.arr?.toLocaleString('pt-BR') || '0'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Receita Recorrente Anual
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total de Clientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.activeTenants || 0}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-blue-600 font-medium">
                    +{metrics?.newTenantsThisMonth || 0} este mês
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Churn Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Churn</p>
                <p className="text-3xl font-bold text-gray-900">{churnRate.toFixed(1)}%</p>
                <div className={`flex items-center mt-2 ${
                  churnRate <= 5 ? 'text-green-600' : churnRate <= 10 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {churnRate <= 5 ? (
                    <Target className="h-4 w-4 mr-1" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">
                    {churnRate <= 5 ? 'Excelente' : churnRate <= 10 ? 'Aceitável' : 'Alto'}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                churnRate <= 5 ? 'bg-green-100' : churnRate <= 10 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Users className={`h-8 w-8 ${
                  churnRate <= 5 ? 'text-green-600' : churnRate <= 10 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Métricas Detalhadas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas Detalhadas</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">ARPU</p>
                    <p className="text-sm text-gray-600">Receita Média por Cliente</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  R$ {metrics?.arpu?.toLocaleString('pt-BR') || '0'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">LTV</p>
                    <p className="text-sm text-gray-600">Customer Lifetime Value</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  R$ {calculateLTV().toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Total de Usuários</p>
                    <p className="text-sm text-gray-600">Usuários em todas as prefeituras</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {metrics?.totalUsers?.toLocaleString('pt-BR') || '0'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                    <BarChart3 className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Protocolos/Mês</p>
                    <p className="text-sm text-gray-600">Volume mensal de protocolos</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {metrics?.totalProtocolsThisMonth?.toLocaleString('pt-BR') || '0'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Storage Médio</p>
                    <p className="text-sm text-gray-600">GB por prefeitura</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {metrics?.averageStorageUsed?.toFixed(1) || '0'} GB
                </span>
              </div>
            </div>
          </div>

          {/* Distribuição por Plano */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição por Plano</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Starter</p>
                    <p className="text-sm text-gray-600">Até 10k habitantes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics?.planDistribution.STARTER || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    R$ {((metrics?.planDistribution.STARTER || 0) * 1997).toLocaleString('pt-BR')}/mês
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Professional</p>
                    <p className="text-sm text-gray-600">Até 50k habitantes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics?.planDistribution.PROFESSIONAL || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    R$ {((metrics?.planDistribution.PROFESSIONAL || 0) * 3997).toLocaleString('pt-BR')}/mês
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Enterprise</p>
                    <p className="text-sm text-gray-600">50k+ habitantes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {metrics?.planDistribution.ENTERPRISE || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    R$ {((metrics?.planDistribution.ENTERPRISE || 0) * 7997).toLocaleString('pt-BR')}/mês
                  </p>
                </div>
              </div>
            </div>

            {/* Total MRR por Plano */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">MRR Total por Planos:</span>
                <span className="text-xl font-bold text-gray-900">
                  R$ {(
                    ((metrics?.planDistribution.STARTER || 0) * 1997) +
                    ((metrics?.planDistribution.PROFESSIONAL || 0) * 3997) +
                    ((metrics?.planDistribution.ENTERPRISE || 0) * 7997)
                  ).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Crescimento de Receita */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Crescimento de Receita (Últimos 12 meses)</h3>
          
          {revenueMetrics && revenueMetrics.length > 0 ? (
            <div className="space-y-4">
              {/* Gráfico Simples com Barras */}
              <div className="h-64 flex items-end space-x-2">
                {revenueMetrics.slice(-12).map((data, index) => {
                  const maxMrr = Math.max(...revenueMetrics.map(d => d.mrr));
                  const height = (data.mrr / maxMrr) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%`, minHeight: '8px' }}
                        title={`${data.mes}: R$ ${data.mrr.toLocaleString('pt-BR')}`}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                        {new Date(data.mes + '-01').toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Estatísticas do Gráfico */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Maior MRR</p>
                  <p className="text-lg font-bold text-green-600">
                    R$ {Math.max(...revenueMetrics.map(d => d.mrr)).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Menor MRR</p>
                  <p className="text-lg font-bold text-red-600">
                    R$ {Math.min(...revenueMetrics.map(d => d.mrr)).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Média 12M</p>
                  <p className="text-lg font-bold text-blue-600">
                    R$ {(revenueMetrics.reduce((sum, d) => sum + d.mrr, 0) / revenueMetrics.length).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Crescimento</p>
                  <p className={`text-lg font-bold ${
                    growthMetrics && growthMetrics.mrrGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {growthMetrics ? `${growthMetrics.mrrGrowth >= 0 ? '+' : ''}${growthMetrics.mrrGrowth.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Dados de receita não disponíveis</p>
            </div>
          )}
        </div>

        {/* Status dos Clientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status dos Clientes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-lg mb-3">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-green-600">{metrics?.activeTenants || 0}</p>
              <p className="text-sm text-gray-600">Ativos</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-lg mb-3">
                <Clock className="h-8 w-8 text-blue-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{metrics?.trialTenants || 0}</p>
              <p className="text-sm text-gray-600">Em Trial</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-yellow-100 rounded-lg mb-3">
                <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{metrics?.suspendedTenants || 0}</p>
              <p className="text-sm text-gray-600">Suspensos</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-red-100 rounded-lg mb-3">
                <X className="h-8 w-8 text-red-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-red-600">{metrics?.cancelledTenants || 0}</p>
              <p className="text-sm text-gray-600">Cancelados</p>
            </div>
          </div>

          {/* Taxa de Conversão */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Taxa de Conversão Trial → Pago:</span>
              <span className="text-lg font-bold text-green-600">
                {metrics && metrics.trialTenants > 0 
                  ? ((metrics.activeTenants / (metrics.activeTenants + metrics.trialTenants)) * 100).toFixed(1)
                  : '0'
                }%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaaSMetricsDashboard;