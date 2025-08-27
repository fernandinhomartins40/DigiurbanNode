// ====================================================================
// 📊 DASHBOARD DE TENANTS - SUPER ADMIN
// Dashboard completo para gestão de prefeituras no SaaS
// ====================================================================

import React, { useState, useEffect } from 'react';
import { useTenantManagement } from "@/hooks/useTenantManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Crown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  BarChart3,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

export const TenantDashboard: React.FC = () => {
  const {
    tenants,
    loading,
    error,
    getDashboardData,
    updateTenantStatus,
    upgradeTenantPlan,
    formatCurrency
  } = useTenantManagement();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNewTenantModal, setShowNewTenantModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [tenants]);

  const loadDashboardData = async () => {
    const result = await getDashboardData();
    if (result.success) {
      setDashboardData(result.data);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'ATIVO': 'bg-green-100 text-green-800',
      'TRIAL': 'bg-blue-100 text-blue-800',
      'SUSPENSO': 'bg-yellow-100 text-yellow-800',
      'CANCELADO': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPlanColor = (plano: string) => {
    const colors = {
      'STARTER': 'bg-blue-500',
      'PROFESSIONAL': 'bg-purple-500',
      'ENTERPRISE': 'bg-gold-500'
    };
    return colors[plano as keyof typeof colors] || 'bg-gray-500';
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesFilter = filter === 'ALL' || tenant.status === filter;
    const matchesSearch = tenant.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.cnpj.includes(searchTerm) ||
                         tenant.uf.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Tenants</h1>
          <p className="text-gray-600">Gestão completa das prefeituras no DigiUrban SaaS</p>
        </div>
        <Button 
          onClick={() => setShowNewTenantModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Prefeitura
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Prefeituras</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.total_tenants || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData?.growth_metrics?.new_this_month || 0} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData?.growth_metrics?.active_paying || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.status_stats?.TRIAL || 0} em trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(dashboardData?.monthly_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(dashboardData?.annual_revenue_projection || 0)} projeção anual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+24%</div>
            <p className="text-xs text-muted-foreground">
              Crescimento mensal médio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Starter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboardData?.plan_stats?.STARTER || 0}
            </div>
            <p className="text-sm text-gray-600">
              Até 10k habitantes • R$ 1.997/mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              Professional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboardData?.plan_stats?.PROFESSIONAL || 0}
            </div>
            <p className="text-sm text-gray-600">
              Até 50k habitantes • R$ 3.997/mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gold-500 rounded-full"></div>
              Enterprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboardData?.plan_stats?.ENTERPRISE || 0}
            </div>
            <p className="text-sm text-gray-600">
              50k+ habitantes • R$ 7.997+/mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Prefeituras Cadastradas</CardTitle>
            <div className="flex gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar prefeitura..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filtro por Status */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Todos os Status</option>
                <option value="ATIVO">Ativos</option>
                <option value="TRIAL">Em Trial</option>
                <option value="SUSPENSO">Suspensos</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTenants.map((tenant) => (
              <div key={tenant.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Logo da Prefeitura */}
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      {tenant.logo_url ? (
                        <img src={tenant.logo_url} alt={tenant.nome} className="w-8 h-8 rounded" />
                      ) : (
                        <Building2 className="w-6 h-6 text-blue-600" />
                      )}
                    </div>

                    {/* Informações Principais */}
                    <div>
                      <h3 className="font-semibold text-lg">{tenant.nome}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{tenant.uf} • {tenant.regiao}</span>
                        <span>•</span>
                        <Users className="w-4 h-4" />
                        <span>{tenant.populacao.toLocaleString()} hab.</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges e Ações */}
                  <div className="flex items-center space-x-3">
                    {/* Plano */}
                    <div className="flex items-center gap-1">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <Badge 
                        variant="outline" 
                        className={`${getPlanColor(tenant.plano)} text-white border-0`}
                      >
                        {tenant.plano}
                      </Badge>
                    </div>

                    {/* Status */}
                    <Badge className={getStatusColor(tenant.status)}>
                      {tenant.status === 'ATIVO' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {tenant.status === 'TRIAL' && <Clock className="w-3 h-3 mr-1" />}
                      {tenant.status === 'SUSPENSO' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {tenant.status === 'CANCELADO' && <XCircle className="w-3 h-3 mr-1" />}
                      {tenant.status}
                    </Badge>

                    {/* Menu de Ações */}
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Informações Detalhadas */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600">CNPJ</p>
                    <p className="font-mono text-sm">{tenant.cnpj}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prefeito</p>
                    <p className="text-sm">{tenant.prefeito_nome || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Usuários Ativos</p>
                    <p className="text-sm font-semibold">{tenant.usuarios_ativos}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última Atividade</p>
                    <p className="text-sm">
                      {new Date(tenant.ultima_atividade).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Métricas de Uso */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{tenant.protocolos_mes_atual}</p>
                      <p className="text-xs text-gray-600">Protocolos este mês</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {tenant.storage_usado_gb.toFixed(1)} GB
                      </p>
                      <p className="text-xs text-gray-600">Storage utilizado</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">98.9%</p>
                      <p className="text-xs text-gray-600">Uptime este mês</p>
                    </div>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-1" />
                      Contatar
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Métricas
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-1" />
                      Configurar
                    </Button>
                  </div>

                  {tenant.status === 'TRIAL' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateTenantStatus(tenant.id, 'ATIVO')}
                      >
                        Ativar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateTenantStatus(tenant.id, 'CANCELADO')}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}

                  {tenant.status === 'SUSPENSO' && (
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => updateTenantStatus(tenant.id, 'ATIVO')}
                    >
                      Reativar
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {filteredTenants.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma prefeitura encontrada</h3>
                <p className="text-gray-600">
                  {searchTerm || filter !== 'ALL' 
                    ? 'Tente ajustar seus filtros de busca'
                    : 'Comece criando sua primeira prefeitura'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas por Região */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição Regional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {['SUDESTE', 'SUL', 'NORDESTE', 'CENTRO-OESTE', 'NORTE'].map(regiao => {
              const count = tenants.filter(t => t.regiao === regiao).length;
              return (
                <div key={regiao} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600">{regiao}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Nova Prefeitura */}
      {showNewTenantModal && (
        <NewTenantModal 
          isOpen={showNewTenantModal}
          onClose={() => setShowNewTenantModal(false)}
        />
      )}
    </div>
  );
};

// Modal para criar nova prefeitura (componente simplificado)
const NewTenantModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h2 className="text-xl font-bold mb-4">Nova Prefeitura</h2>
        <p className="text-gray-600 mb-4">
          Formulário para criar nova prefeitura será implementado aqui.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button>
            Criar Prefeitura
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;