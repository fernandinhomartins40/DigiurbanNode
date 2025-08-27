// ====================================================================
// 💰 DASHBOARD DE BILLING - MÉTRICAS FINANCEIRAS SAAS
// Dashboard executivo com todas as métricas de receita e crescimento
// ====================================================================

import React, { useState, useEffect } from 'react';
import { useBilling } from "@/hooks/useBilling";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  FileText,
  Download,
  Eye,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3
} from 'lucide-react';

export const BillingDashboard: React.FC = () => {
  const {
    subscriptions,
    invoices,
    billingStats,
    loading,
    formatCurrency,
    PLAN_PRICING,
    loadBillingStats,
    generateFinancialReport,
    processPayment
  } = useBilling();

  const [selectedPeriod, setSelectedPeriod] = useState('30'); // dias
  const [financialReport, setFinancialReport] = useState<any>(null);

  useEffect(() => {
    if (selectedPeriod) {
      generateReport();
    }
  }, [selectedPeriod, invoices]);

  const generateReport = async () => {
    const endDate = new Date().toISOString();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(selectedPeriod));
    
    const result = await generateFinancialReport(startDate.toISOString(), endDate);
    if (result.success) {
      setFinancialReport(result.data);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PAGA': 'bg-green-100 text-green-800',
      'PENDENTE': 'bg-yellow-100 text-yellow-800',
      'VENCIDA': 'bg-red-100 text-red-800',
      'CANCELADA': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAGA':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDENTE':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'VENCIDA':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'CANCELADA':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPlanColor = (plano: string) => {
    const colors = {
      'STARTER': 'bg-blue-500 text-white',
      'PROFESSIONAL': 'bg-purple-500 text-white',
      'ENTERPRISE': 'bg-gold-500 text-white'
    };
    return colors[plano as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  if (loading && !billingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <p className="text-gray-600">Métricas de receita e crescimento do DigiUrban SaaS</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Análise Completa
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* MRR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(billingStats?.mrr || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600">+15.2%</span>
              <span className="ml-1">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* ARR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(billingStats?.arr || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita anual recorrente
            </p>
          </CardContent>
        </Card>

        {/* ARPU */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(billingStats?.avg_revenue_per_user || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita média por cliente
            </p>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {billingStats?.churn_rate?.toFixed(1) || '0.0'}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600">-0.8%</span>
              <span className="ml-1">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receita por Período */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Receita por Período</CardTitle>
              <CardDescription>Análise detalhada de receitas</CardDescription>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(financialReport?.total_revenue || 0)}
              </div>
              <p className="text-sm text-gray-600">Receita Confirmada</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(financialReport?.pending_revenue || 0)}
              </div>
              <p className="text-sm text-gray-600">Receita Pendente</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {formatCurrency(financialReport?.overdue_revenue || 0)}
              </div>
              <p className="text-sm text-gray-600">Receita Vencida</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Planos e Faturas Recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Distribuição de Planos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Distribuição de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].map(plano => {
                const count = subscriptions.filter(s => s.plano === plano && s.status === 'ATIVA').length;
                const revenue = subscriptions
                  .filter(s => s.plano === plano && s.status === 'ATIVA')
                  .reduce((sum, s) => sum + s.valor_mensal, 0);
                
                return (
                  <div key={plano} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getPlanColor(plano)}>
                        {plano}
                      </Badge>
                      <div>
                        <p className="font-medium">{count} clientes</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(PLAN_PRICING[plano as keyof typeof PLAN_PRICING].mensal)}/mês
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(revenue)}
                      </p>
                      <p className="text-sm text-gray-600">MRR</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Faturas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Faturas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <p className="font-medium">{invoice.numero_fatura}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(invoice.data_emissao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(invoice.valor_liquido)}
                    </p>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Assinaturas Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Assinaturas Ativas ({subscriptions.filter(s => s.status === 'ATIVA').length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.filter(s => s.status === 'ATIVA').slice(0, 10).map((subscription) => (
              <div key={subscription.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge className={getPlanColor(subscription.plano)}>
                      {subscription.plano}
                    </Badge>
                    <div>
                      <p className="font-medium">Tenant ID: {subscription.tenant_id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        Iniciado em {new Date(subscription.data_inicio).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(
                        subscription.tipo_cobranca === 'ANUAL' 
                          ? subscription.valor_anual || 0
                          : subscription.valor_mensal
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {subscription.tipo_cobranca}
                    </p>
                  </div>
                </div>

                {/* Add-ons */}
                {(subscription.portal_transparencia > 0 || subscription.app_mobile > 0 || 
                  subscription.bi_avancado > 0 || subscription.integracoes_federais > 0) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-2">Add-ons:</p>
                    <div className="flex gap-2 flex-wrap">
                      {subscription.portal_transparencia > 0 && (
                        <Badge variant="outline">Portal Transparência (+{formatCurrency(subscription.portal_transparencia)})</Badge>
                      )}
                      {subscription.app_mobile > 0 && (
                        <Badge variant="outline">App Mobile (+{formatCurrency(subscription.app_mobile)})</Badge>
                      )}
                      {subscription.bi_avancado > 0 && (
                        <Badge variant="outline">BI Avançado (+{formatCurrency(subscription.bi_avancado)})</Badge>
                      )}
                      {subscription.integracoes_federais > 0 && (
                        <Badge variant="outline">Integrações Federais (+{formatCurrency(subscription.integracoes_federais)})</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Próxima cobrança */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Próxima cobrança: {new Date(subscription.proxima_cobranca).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Detalhes
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="w-4 h-4 mr-1" />
                      Histórico
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Alertas Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {billingStats && billingStats.overdue_invoices > 0 && (
              <div className="flex items-center gap-3 p-3 border border-red-200 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">
                    {billingStats.overdue_invoices} faturas vencidas
                  </p>
                  <p className="text-sm text-red-600">
                    Requer ação imediata para recuperação
                  </p>
                </div>
              </div>
            )}

            {billingStats && billingStats.pending_invoices > 5 && (
              <div className="flex items-center gap-3 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-yellow-800">
                    {billingStats.pending_invoices} faturas pendentes
                  </p>
                  <p className="text-sm text-yellow-600">
                    Acompanhar prazos de vencimento
                  </p>
                </div>
              </div>
            )}

            {billingStats && billingStats.churn_rate > 10 && (
              <div className="flex items-center gap-3 p-3 border border-red-200 bg-red-50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">
                    Taxa de churn elevada ({billingStats.churn_rate.toFixed(1)}%)
                  </p>
                  <p className="text-sm text-red-600">
                    Implementar estratégias de retenção
                  </p>
                </div>
              </div>
            )}

            {/* Mensagem positiva se não há alertas */}
            {(!billingStats || (billingStats.overdue_invoices === 0 && billingStats.pending_invoices <= 5 && billingStats.churn_rate <= 10)) && (
              <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">
                    Situação financeira saudável
                  </p>
                  <p className="text-sm text-green-600">
                    Todos os indicadores dentro do esperado
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingDashboard;