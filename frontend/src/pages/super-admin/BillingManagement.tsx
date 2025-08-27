import React, { useState, useEffect } from 'react';
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
// INTERFACES E TIPOS
// ====================================================================

interface Invoice {
  id: string;
  tenant_id: string;
  tenant_name: string;
  numero: string;
  periodo: string;
  valor: number;
  descricao: string;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  data_criacao: string;
  data_vencimento: string;
  data_pagamento?: string;
  metodo_pagamento?: string;
  desconto: number;
  taxa_adicional: number;
  plano: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  itens: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  tipo: 'subscription' | 'usage' | 'setup' | 'support';
}

interface BillingMetrics {
  mrr: number;
  arr: number;
  churn_rate: number;
  arpu: number; // Average Revenue Per User
  ltv: number;
  cac: number;
  receita_mensal: number;
  receita_acumulada: number;
  faturas_pendentes: number;
  valor_pendente: number;
  faturas_vencidas: number;
  valor_vencido: number;
  taxa_cobranca: number; // Collection rate
  crescimento: {
    mrr_growth: number;
    receita_growth: number;
    clientes_growth: number;
  };
}

interface PaymentMethod {
  id: string;
  tenant_id: string;
  tipo: 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix';
  dados: Record<string, unknown>;
  ativo: boolean;
  padrao: boolean;
}

// ====================================================================
// DADOS MOCK PARA DEMONSTRAÇÃO
// ====================================================================

const mockBillingMetrics: BillingMetrics = {
  mrr: 89750,
  arr: 1077000,
  churn_rate: 3.2,
  arpu: 1908, // R$ 1.908 por tenant
  ltv: 28500,
  cac: 850,
  receita_mensal: 89750,
  receita_acumulada: 634250,
  faturas_pendentes: 8,
  valor_pendente: 42500,
  faturas_vencidas: 3,
  valor_vencido: 15750,
  taxa_cobranca: 94.2, // 94.2% das faturas são pagas
  crescimento: {
    mrr_growth: 12.5,
    receita_growth: 18.7,
    clientes_growth: 8.9
  }
};

const mockInvoices: Invoice[] = [
  {
    id: '1',
    tenant_id: 'SP-001',
    tenant_name: 'Prefeitura de São Paulo',
    numero: 'FAT-2024-001',
    periodo: 'Janeiro 2024',
    valor: 12500,
    descricao: 'Plano Enterprise + Usuários extras',
    status: 'pago',
    data_criacao: '2024-01-01',
    data_vencimento: '2024-01-10',
    data_pagamento: '2024-01-08',
    metodo_pagamento: 'Transferência Bancária',
    desconto: 0,
    taxa_adicional: 0,
    plano: 'ENTERPRISE',
    itens: [
      {
        id: '1-1',
        descricao: 'Plano Enterprise Base',
        quantidade: 1,
        valor_unitario: 10000,
        valor_total: 10000,
        tipo: 'subscription'
      },
      {
        id: '1-2',
        descricao: 'Usuários Extras (50 usuários)',
        quantidade: 50,
        valor_unitario: 50,
        valor_total: 2500,
        tipo: 'usage'
      }
    ]
  },
  {
    id: '2',
    tenant_id: 'SP-002',
    tenant_name: 'Prefeitura de Campinas',
    numero: 'FAT-2024-002',
    periodo: 'Janeiro 2024',
    valor: 4500,
    descricao: 'Plano Professional',
    status: 'pendente',
    data_criacao: '2024-01-01',
    data_vencimento: '2024-01-15',
    desconto: 0,
    taxa_adicional: 0,
    plano: 'PROFESSIONAL',
    itens: [
      {
        id: '2-1',
        descricao: 'Plano Professional Base',
        quantidade: 1,
        valor_unitario: 4500,
        valor_total: 4500,
        tipo: 'subscription'
      }
    ]
  },
  {
    id: '3',
    tenant_id: 'SP-003',
    tenant_name: 'Prefeitura de Ribeirão Preto',
    numero: 'FAT-2024-003',
    periodo: 'Janeiro 2024',
    valor: 1200,
    descricao: 'Plano Starter',
    status: 'vencido',
    data_criacao: '2024-01-01',
    data_vencimento: '2024-01-08',
    desconto: 0,
    taxa_adicional: 50, // Taxa de juros por atraso
    plano: 'STARTER',
    itens: [
      {
        id: '3-1',
        descricao: 'Plano Starter Base',
        quantidade: 1,
        valor_unitario: 1200,
        valor_total: 1200,
        tipo: 'subscription'
      }
    ]
  }
];

const revenueEvolutionData = [
  { month: 'Jul', receita: 67250, faturas: 42, taxa_cobranca: 92.1 },
  { month: 'Ago', receita: 72100, faturas: 44, taxa_cobranca: 94.8 },
  { month: 'Set', receita: 78950, faturas: 46, taxa_cobranca: 91.3 },
  { month: 'Out', receita: 83200, faturas: 47, taxa_cobranca: 95.7 },
  { month: 'Nov', receita: 89750, faturas: 47, taxa_cobranca: 94.2 }
];

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const BillingManagement: React.FC = () => {
  const [metrics, setMetrics] = useState<BillingMetrics>(mockBillingMetrics);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(mockInvoices);
  const [loading, setLoading] = useState(false);
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
    tenant_name: '',
    plano: 'STARTER',
    valor: 1200,
    descricao: '',
    data_vencimento: ''
  });

  // Funções de ação para faturas
  const handleCreateInvoice = () => {
    setShowCreateModal(true);
  };

  const handleSubmitNewInvoice = () => {
    if (newInvoiceData.tenant_name.trim()) {
      const newInvoice: Invoice = {
        id: (invoices.length + 1).toString(),
        tenant_id: `NEW-${invoices.length + 1}`,
        tenant_name: newInvoiceData.tenant_name.trim(),
        numero: `FAT-2024-${String(invoices.length + 1).padStart(3, '0')}`,
        periodo: 'Janeiro 2024',
        valor: newInvoiceData.valor,
        descricao: newInvoiceData.descricao || `Plano ${newInvoiceData.plano}`,
        status: 'pendente',
        data_criacao: new Date().toISOString().split('T')[0],
        data_vencimento: newInvoiceData.data_vencimento || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        desconto: 0,
        taxa_adicional: 0,
        plano: newInvoiceData.plano as any,
        itens: [{
          id: '1',
          descricao: `Plano ${newInvoiceData.plano} Base`,
          quantidade: 1,
          valor_unitario: newInvoiceData.valor,
          valor_total: newInvoiceData.valor,
          tipo: 'subscription'
        }]
      };
      setInvoices(prev => [...prev, newInvoice]);
      setShowCreateModal(false);
      setNewInvoiceData({
        tenant_name: '',
        plano: 'STARTER',
        valor: 1200,
        descricao: '',
        data_vencimento: ''
      });
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
        invoice.tenant_name.toLowerCase().includes(busca) ||
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
      STARTER: { label: 'Starter', color: 'bg-purple-100 text-purple-800' },
      PROFESSIONAL: { label: 'Professional', color: 'bg-blue-100 text-blue-800' },
      ENTERPRISE: { label: 'Enterprise', color: 'bg-green-100 text-green-800' }
    };
    
    const config = planoConfig[plano as keyof typeof planoConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
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

      {/* Métricas Financeiras Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* MRR */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">MRR</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(metrics.mrr)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {formatPercentage(metrics.crescimento.mrr_growth)} vs mês anterior
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
                <p className="text-3xl font-bold text-blue-900">{formatCurrency(metrics.arpu)}</p>
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
                <p className="text-3xl font-bold text-purple-900">{metrics.taxa_cobranca.toFixed(1)}%</p>
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
                <p className="text-3xl font-bold text-orange-900">{formatCurrency(metrics.valor_pendente)}</p>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {metrics.faturas_pendentes} faturas
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
              <span className="font-bold text-lg">{formatCurrency(metrics.arr)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">LTV Médio</span>
              <span className="font-bold text-lg">{formatCurrency(metrics.ltv)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">LTV/CAC Ratio</span>
              <span className="font-bold text-lg text-green-600">{(metrics.ltv / metrics.cac).toFixed(1)}x</span>
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
              {revenueEvolutionData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-sm w-12">{data.month}</div>
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${(data.receita / Math.max(...revenueEvolutionData.map(d => d.receita))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-green-600">{formatCurrency(data.receita)}</span>
                    <Badge variant="outline" className="text-xs">
                      {data.taxa_cobranca}% cobrança
                    </Badge>
                  </div>
                </div>
              ))}
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
              <option value="STARTER">Starter</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ENTERPRISE">Enterprise</option>
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
                            {new Date(invoice.data_vencimento).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {invoice.data_pagamento && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Pagamento:</span>
                            <span className="font-medium text-green-600">
                              {new Date(invoice.data_pagamento).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        {invoice.metodo_pagamento && (
                          <div className="text-xs text-gray-500">
                            Via: {invoice.metodo_pagamento}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Valores */}
                    <div className="lg:col-span-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(invoice.valor + invoice.taxa_adicional)}
                        </p>
                        {invoice.taxa_adicional > 0 && (
                          <p className="text-xs text-red-500">
                            + {formatCurrency(invoice.taxa_adicional)} juros
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
              <Label htmlFor="tenant_name">Nome da Prefeitura *</Label>
              <Input
                id="tenant_name"
                value={newInvoiceData.tenant_name}
                onChange={(e) => setNewInvoiceData(prev => ({ ...prev, tenant_name: e.target.value }))}
                placeholder="Ex: Prefeitura de São Paulo"
              />
            </div>
            
            <div>
              <Label htmlFor="plano">Plano *</Label>
              <Select 
                value={newInvoiceData.plano} 
                onValueChange={(value) => {
                  const valores = { STARTER: 1200, PROFESSIONAL: 4500, ENTERPRISE: 12500 };
                  setNewInvoiceData(prev => ({ 
                    ...prev, 
                    plano: value,
                    valor: valores[value as keyof typeof valores] 
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STARTER">Starter - R$ 1.200</SelectItem>
                  <SelectItem value="PROFESSIONAL">Professional - R$ 4.500</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise - R$ 12.500</SelectItem>
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
              <Label htmlFor="data_vencimento">Data de Vencimento</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={newInvoiceData.data_vencimento}
                onChange={(e) => setNewInvoiceData(prev => ({ ...prev, data_vencimento: e.target.value }))}
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
              disabled={!newInvoiceData.tenant_name.trim()}
            >
              Criar Fatura
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
                      {invoice.data_pagamento && (
                        <div>
                          <span className="text-gray-600">Pagamento:</span>
                          <p className="font-medium text-green-600">{new Date(invoice.data_pagamento).toLocaleDateString('pt-BR')}</p>
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
                        <span className="text-green-600">{formatCurrency(invoice.valor + invoice.taxa_adicional - invoice.desconto)}</span>
                      </div>
                      {(invoice.desconto > 0 || invoice.taxa_adicional > 0) && (
                        <div className="text-sm text-gray-600 mt-2">
                          <p>Subtotal: {formatCurrency(invoice.valor)}</p>
                          {invoice.desconto > 0 && <p className="text-green-600">Desconto: -{formatCurrency(invoice.desconto)}</p>}
                          {invoice.taxa_adicional > 0 && <p className="text-red-600">Taxa adicional: +{formatCurrency(invoice.taxa_adicional)}</p>}
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