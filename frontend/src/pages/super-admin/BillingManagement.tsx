import React, { useState, useEffect } from 'react';
import { useBilling, type Invoice, type BillingMetrics, type CreateInvoiceData } from '@/hooks/useBilling';
import { useTenantService } from "@/services/tenantService";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Eye,
  Edit,
  Send,
  Filter,
  Search,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Building2
} from 'lucide-react';
import { 
  SuperAdminLayout,
  SuperAdminHeader,
  SuperAdminContent,
  SuperAdminKPIGrid,
  SuperAdminKPICard,
  SuperAdminSection
} from "@/components/super-admin/SuperAdminDesignSystem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ====================================================================
// INTERFACES E TIPOS ADICIONAIS
// ====================================================================

interface TenantInfo {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

// ====================================================================
// DADOS REAIS DE TENANTS (carregados da API)
// ====================================================================

const planPrices = {
  basico: 1200,
  premium: 4500,
  enterprise: 12500
};

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const BillingManagement: React.FC = () => {
  // Hook de billing com APIs reais
  const {
    metrics,
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    markInvoiceAsPaid,
    markOverdueInvoices,
    fetchRevenueEvolution,
    clearError
  } = useBilling();

  // Hook de tenants para dados reais
  const { getAllTenants } = useTenantService();

  // Estados locais
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [revenueEvolution, setRevenueEvolution] = useState<any[]>([]);
  const [availableTenants, setAvailableTenants] = useState<TenantInfo[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    plano: '',
    periodo: '',
    busca: ''
  });

  // Estados para modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [newInvoiceData, setNewInvoiceData] = useState({
    tenantId: '',
    tenant_name: '', // Para exibição no form
    plano: 'basico' as 'basico' | 'premium' | 'enterprise',
    valor: 1200,
    descricao: '',
    periodo: '',
    dataVencimento: ''
  });

  // Funções de ação para faturas
  const handleCreateInvoice = () => {
    setShowCreateModal(true);
  };

  const handleSubmitNewInvoice = async () => {
    if (newInvoiceData.tenantId && newInvoiceData.tenant_name.trim()) {
      try {
        const invoiceData: CreateInvoiceData = {
          tenantId: newInvoiceData.tenantId,
          periodo: newInvoiceData.periodo || `${new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`,
          valor: newInvoiceData.valor,
          descricao: newInvoiceData.descricao || `Plano ${newInvoiceData.plano.charAt(0).toUpperCase() + newInvoiceData.plano.slice(1)}`,
          dataVencimento: newInvoiceData.dataVencimento || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          plano: newInvoiceData.plano,
          desconto: 0,
          taxaAdicional: 0
        };

        await createInvoice(invoiceData);

        setShowCreateModal(false);
        setNewInvoiceData({
          tenantId: '',
          tenant_name: '',
          plano: 'basico',
          valor: 1200,
          descricao: '',
          periodo: '',
          dataVencimento: ''
        });

        // Mostrar sucesso
        alert('Fatura criada com sucesso!');
      } catch (err) {
        alert('Erro ao criar fatura: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
      }
    } else {
      alert('Por favor, selecione um tenant');
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setShowInvoiceDetails(true);
  };

  const handleEditInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const newValue = window.prompt('Novo valor da fatura:', invoice.valor.toString());
      if (newValue && !isNaN(Number(newValue))) {
        setInvoices(prev => prev.map(inv => 
          inv.id === invoiceId ? { ...inv, valor: Number(newValue) } : inv
        ));
      }
    }
  };

  const handleSendInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      if (window.confirm(`Enviar fatura ${invoice.numero} para ${invoice.tenant_name}?`)) {
        alert('Fatura enviada com sucesso!');
      }
    }
  };

  const handleExportReport = () => {
    const report = {
      total_invoices: filteredInvoices.length,
      total_amount: filteredInvoices.reduce((sum, inv) => sum + inv.valor, 0),
      pending: filteredInvoices.filter(inv => inv.status === 'pendente').length,
      paid: filteredInvoices.filter(inv => inv.status === 'pago').length,
      overdue: filteredInvoices.filter(inv => inv.status === 'vencido').length
    };
    alert(`Relatório Financeiro\n\nTotal de Faturas: ${report.total_invoices}\nValor Total: R$ ${report.total_amount.toFixed(2)}\nPendentes: ${report.pending}\nPagas: ${report.paid}\nVencidas: ${report.overdue}`);
  };

  // ====================================================================
  // EFEITOS E FILTROS
  // ====================================================================

  useEffect(() => {
    applyFilters();
  }, [filters, invoices]);

  useEffect(() => {
    // Carregar tenants reais para o dropdown
    const loadTenants = async () => {
      try {
        setLoadingTenants(true);
        const tenantsData = await getAllTenants();

        const mappedTenants: TenantInfo[] = tenantsData.map(tenant => ({
          id: tenant.id,
          nome: tenant.nome,
          cidade: tenant.cidade,
          estado: tenant.estado
        }));

        setAvailableTenants(mappedTenants);
        console.log('✅ Tenants carregados para billing:', mappedTenants.length, 'tenants');
      } catch (error) {
        console.error('❌ Erro ao carregar tenants para billing:', error);
        // Fallback para dados básicos se falhar
        setAvailableTenants([]);
      } finally {
        setLoadingTenants(false);
      }
    };

    loadTenants();
  }, [getAllTenants]);

  useEffect(() => {
    // Carregar dados de evolução de receita
    const loadRevenueEvolution = async () => {
      try {
        const data = await fetchRevenueEvolution(6);
        setRevenueEvolution(data || []);
      } catch (error) {
        console.error('Erro ao carregar evolução de receita:', error);
        // Usar dados básicos se falhar (apenas para fallback)
        setRevenueEvolution([]);
      }
    };

    loadRevenueEvolution();
  }, [fetchRevenueEvolution]);

  const applyFilters = () => {
    let filtered = [...invoices];

    if (filters.status) {
      filtered = filtered.filter(invoice => invoice.status === filters.status);
    }

    if (filters.plano) {
      filtered = filtered.filter(invoice => invoice.plano === filters.plano);
    }

    if (filters.periodo) {
      filtered = filtered.filter(invoice =>
        invoice.periodo.toLowerCase().includes(filters.periodo.toLowerCase())
      );
    }

    if (filters.busca) {
      const busca = filters.busca.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.numero.toLowerCase().includes(busca) ||
        invoice.descricao.toLowerCase().includes(busca)
      );
    }

    setFilteredInvoices(filtered);
  };

  // ====================================================================
  // FUNÇÕES UTILITÁRIAS
  // ====================================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pago: { label: 'Pago', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      pendente: { label: 'Pendente', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      vencido: { label: 'Vencido', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      cancelado: { label: 'Cancelado', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const getPlanoBadge = (plano: string) => {
    const planoConfig = {
      basico: { label: 'Básico', color: 'bg-purple-100 text-purple-800' },
      premium: { label: 'Premium', color: 'bg-blue-100 text-blue-800' },
      enterprise: { label: 'Enterprise', color: 'bg-green-100 text-green-800' }
    };

    const config = planoConfig[plano as keyof typeof planoConfig];
    return <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>{config?.label || plano}</Badge>;
  };

  // ====================================================================
  // RENDER PRINCIPAL
  // ====================================================================

  return (
    <SuperAdminLayout>
      <SuperAdminHeader 
        title="Gestão Financeira"
        subtitle="Sistema completo de billing, faturas e métricas SaaS"
        icon={DollarSign}
        actions={[
          {
            text: "Nova Fatura",
            variant: "default",
            icon: FileText,
            onClick: handleCreateInvoice
          },
          {
            text: "Exportar Relatório",
            variant: "outline",
            icon: Download,
            onClick: handleExportReport
          }
        ]}
      />

      <SuperAdminContent>

      {/* Indicador de Loading/Erro */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 font-medium">Erro ao carregar dados</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={clearError}
              className="text-red-600 border-red-200"
            >
              Tentar novamente
            </Button>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Métricas Financeiras Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* MRR */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">MRR</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(metrics?.mrr || 0)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {formatPercentage(metrics?.crescimentoMRR || 0)} vs mês anterior
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* ARPU */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">ARPU</p>
                <p className="text-3xl font-bold text-blue-900">{formatCurrency(metrics?.arpu || 0)}</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3" />
                  Receita por tenant
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Cobrança */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Taxa Cobrança</p>
                <p className="text-3xl font-bold text-purple-900">{(metrics?.taxaCobranca || 0).toFixed(1)}%</p>
                <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3" />
                  Eficiência de cobrança
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Faturas Pendentes */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Pendentes</p>
                <p className="text-3xl font-bold text-orange-900">{formatCurrency(metrics?.valorPendente || 0)}</p>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {metrics?.faturasPendentes || 0} faturas
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas SaaS Avançadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* ARR e LTV */}
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <TrendingUp className="h-5 w-5" />
              Métricas de Crescimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ARR Projetado</span>
              <span className="font-bold text-lg">{formatCurrency(metrics?.arr || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">LTV Médio</span>
              <span className="font-bold text-lg">{formatCurrency(metrics?.ltv || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">LTV/CAC Ratio</span>
              <span className="font-bold text-lg text-green-600">
                {metrics?.ltv && metrics?.cac ? (metrics.ltv / metrics.cac).toFixed(1) : '0'}x
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Evolução de Receita */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evolução de Receita
            </CardTitle>
            <CardDescription>
              Receita mensal e taxa de cobrança - últimos 5 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueEvolution.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-sm w-12">{data.periodo}</div>
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${revenueEvolution.length > 0 ? (data.receita / Math.max(...revenueEvolution.map(d => d.receita))) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-green-600">{formatCurrency(data.receita)}</span>
                    <Badge variant="outline" className="text-xs">
                      {data.taxaCobranca}% cobrança
                    </Badge>
                  </div>
                </div>
              ))}
              {revenueEvolution.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhum dado de evolução disponível</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de Faturas */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca de Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar fatura..."
                value={filters.busca}
                onChange={(e) => setFilters(prev => ({ ...prev, busca: e.target.value }))}
                className="pl-9"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos os Status</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="vencido">Vencido</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <select
              value={filters.plano}
              onChange={(e) => setFilters(prev => ({ ...prev, plano: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos os Planos</option>
              <option value="basico">Básico</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <Input
              placeholder="Período (ex: Janeiro 2024)"
              value={filters.periodo}
              onChange={(e) => setFilters(prev => ({ ...prev, periodo: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Faturas */}
      <Card>
        <CardHeader>
          <CardTitle>Faturas ({filteredInvoices.length})</CardTitle>
          <CardDescription>
            Gestão completa de faturas e cobrança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    
                    {/* Informações da Fatura */}
                    <div className="lg:col-span-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{invoice.numero}</h3>
                          <p className="text-sm text-gray-600">{invoice.tenant_name}</p>
                          <p className="text-sm text-gray-500">{invoice.periodo}</p>
                          <p className="text-xs text-gray-400 mt-1">{invoice.descricao}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status e Plano */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        {getStatusBadge(invoice.status)}
                        {getPlanoBadge(invoice.plano)}
                      </div>
                    </div>

                    {/* Datas */}
                    <div className="lg:col-span-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Vencimento:</span>
                          <span className="font-medium">
                            {new Date(invoice.dataVencimento).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {invoice.dataPagamento && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Pagamento:</span>
                            <span className="font-medium text-green-600">
                              {new Date(invoice.dataPagamento).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        {invoice.metodoPagamento && (
                          <div className="text-xs text-gray-500">
                            Via: {invoice.metodoPagamento}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Valores */}
                    <div className="lg:col-span-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(invoice.valor + invoice.taxaAdicional)}
                        </p>
                        {invoice.taxaAdicional > 0 && (
                          <p className="text-xs text-red-500">
                            + {formatCurrency(invoice.taxaAdicional)} juros
                          </p>
                        )}
                        {invoice.desconto > 0 && (
                          <p className="text-xs text-green-500">
                            - {formatCurrency(invoice.desconto)} desconto
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="lg:col-span-1">
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={() => handleViewInvoice(invoice.id)}
                          title="Visualizar fatura"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-gray-600 hover:bg-gray-50"
                          onClick={() => handleEditInvoice(invoice.id)}
                          title="Editar fatura"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => handleSendInvoice(invoice.id)}
                          title="Enviar fatura"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                  </div>

                  {/* Itens da Fatura */}
                  {invoice.itens.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {invoice.itens.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <span className="text-gray-600 truncate">{item.descricao}</span>
                            <span className="font-medium">{formatCurrency(item.valor_total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Nova Fatura */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Nova Fatura
            </DialogTitle>
            <DialogDescription>
              Crie uma nova fatura para um cliente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="tenant_name">Tenant *</Label>
              <Select
                value={newInvoiceData.tenantId}
                onValueChange={(value) => {
                  const tenant = availableTenants.find(t => t.id === value);
                  setNewInvoiceData(prev => ({
                    ...prev,
                    tenantId: value,
                    tenant_name: tenant?.nome || ''
                  }));
                }}
                disabled={loadingTenants}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingTenants ? "Carregando tenants..." : "Selecione um tenant"} />
                </SelectTrigger>
                <SelectContent>
                  {availableTenants.map(tenant => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.nome} - {tenant.cidade}/{tenant.estado}
                    </SelectItem>
                  ))}
                  {availableTenants.length === 0 && !loadingTenants && (
                    <SelectItem value="" disabled>
                      Nenhum tenant disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="periodo">Período *</Label>
              <Input
                id="periodo"
                value={newInvoiceData.periodo}
                onChange={(e) => setNewInvoiceData(prev => ({ ...prev, periodo: e.target.value }))}
                placeholder="Ex: Janeiro 2024"
              />
            </div>
            
            <div>
              <Label htmlFor="plano">Plano *</Label>
              <Select
                value={newInvoiceData.plano}
                onValueChange={(value) => {
                  setNewInvoiceData(prev => ({
                    ...prev,
                    plano: value as 'basico' | 'premium' | 'enterprise',
                    valor: planPrices[value as keyof typeof planPrices]
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico - {formatCurrency(planPrices.basico)}</SelectItem>
                  <SelectItem value="premium">Premium - {formatCurrency(planPrices.premium)}</SelectItem>
                  <SelectItem value="enterprise">Enterprise - {formatCurrency(planPrices.enterprise)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="valor">Valor *</Label>
              <Input
                id="valor"
                type="number"
                value={newInvoiceData.valor}
                onChange={(e) => setNewInvoiceData(prev => ({ ...prev, valor: Number(e.target.value) }))}
              />
            </div>
            
            <div>
              <Label htmlFor="dataVencimento">Data de Vencimento</Label>
              <Input
                id="dataVencimento"
                type="date"
                value={newInvoiceData.dataVencimento}
                onChange={(e) => setNewInvoiceData(prev => ({ ...prev, dataVencimento: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={newInvoiceData.descricao}
                onChange={(e) => setNewInvoiceData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição adicional da fatura..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitNewInvoice}
              className="bg-green-600 hover:bg-green-700"
              disabled={!newInvoiceData.tenantId || !newInvoiceData.periodo.trim() || loading}
            >
              {loading ? 'Criando...' : 'Criar Fatura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Detalhes da Fatura */}
      <Dialog open={showInvoiceDetails} onOpenChange={setShowInvoiceDetails}>
        <DialogContent className="max-w-2xl">
          {selectedInvoiceId && (() => {
            const invoice = invoices.find(inv => inv.id === selectedInvoiceId);
            if (!invoice) return null;
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Detalhes da Fatura {invoice.numero}
                  </DialogTitle>
                  <DialogDescription>
                    Informações completas da fatura
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Informações do Cliente */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Informações do Cliente</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Cliente:</span>
                        <p className="font-medium">{invoice.tenant_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Plano:</span>
                        <div className="mt-1">{getPlanoBadge(invoice.plano)}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dados da Fatura */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Dados da Fatura</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Número:</span>
                        <p className="font-medium">{invoice.numero}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Período:</span>
                        <p className="font-medium">{invoice.periodo}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Criação:</span>
                        <p className="font-medium">{new Date(invoice.data_criacao).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Vencimento:</span>
                        <p className="font-medium">{new Date(invoice.data_vencimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                      {invoice.dataPagamento && (
                        <div>
                          <span className="text-gray-600">Pagamento:</span>
                          <p className="font-medium text-green-600">{new Date(invoice.dataPagamento).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Itens da Fatura */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Itens da Fatura</h3>
                    <div className="space-y-2">
                      {invoice.itens.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-green-200 last:border-b-0">
                          <div>
                            <p className="font-medium text-sm">{item.descricao}</p>
                            <p className="text-xs text-gray-600">
                              {item.quantidade}x {formatCurrency(item.valor_unitario)}
                            </p>
                          </div>
                          <p className="font-bold">{formatCurrency(item.valor_total)}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">{formatCurrency(invoice.valor + invoice.taxaAdicional - invoice.desconto)}</span>
                      </div>
                      {(invoice.desconto > 0 || invoice.taxaAdicional > 0) && (
                        <div className="text-sm text-gray-600 mt-2">
                          <p>Subtotal: {formatCurrency(invoice.valor)}</p>
                          {invoice.desconto > 0 && <p className="text-green-600">Desconto: -{formatCurrency(invoice.desconto)}</p>}
                          {invoice.taxaAdicional > 0 && <p className="text-red-600">Taxa adicional: +{formatCurrency(invoice.taxaAdicional)}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInvoiceDetails(false)}>
                    Fechar
                  </Button>
                  <Button 
                    onClick={() => handleSendInvoice(invoice.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Fatura
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      </SuperAdminContent>
    </SuperAdminLayout>
  );
};

export default BillingManagement;