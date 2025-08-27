import React, { useEffect } from 'react';
import { useServicosPublicos } from "@/hooks/useServicosPublicos";
import { 
  Lightbulb, 
  Truck, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  Zap, 
  DollarSign, 
  Star,
  Wrench,
  Map,
  TrendingUp,
  Activity
} from 'lucide-react';

const DashboardServicosPublicos: React.FC = () => {
  const { dashboardData, loading, fetchDashboardData } = useServicosPublicos();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Pontos de Luz',
      value: `${dashboardData.pontos_luz_funcionando}/${dashboardData.total_pontos_luz}`,
      subtitle: `${Math.round((dashboardData.pontos_luz_funcionando / dashboardData.total_pontos_luz) * 100)}% funcionando`,
      icon: Lightbulb,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Rotas de Limpeza',
      value: `${dashboardData.rotas_executadas_hoje}/${dashboardData.total_rotas_ativas}`,
      subtitle: 'Executadas hoje',
      icon: Truck,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Solicitações Pendentes',
      value: dashboardData.solicitacoes_pendentes,
      subtitle: 'Aguardando atendimento',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Equipes Ativas',
      value: dashboardData.equipes_ativas,
      subtitle: 'Em campo atualmente',
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    }
  ];

  const indicators = [
    {
      title: 'Consumo de Energia',
      value: `${dashboardData.consumo_energia_mes?.toLocaleString('pt-BR')} kWh`,
      subtitle: 'Consumo mensal total',
      icon: Zap,
      trend: 'down',
      trendValue: `${dashboardData.economia_led_percentual}%`
    },
    {
      title: 'Problemas Resolvidos',
      value: dashboardData.problemas_resolvidos_mes,
      subtitle: 'Neste mês',
      icon: CheckCircle2,
      trend: 'up',
      trendValue: '+12%'
    },
    {
      title: 'Índice de Satisfação',
      value: `${dashboardData.indice_satisfacao_cidadao?.toFixed(1)}/5.0`,
      subtitle: 'Avaliação dos cidadãos',
      icon: Star,
      trend: 'up',
      trendValue: '+0.3'
    },
    {
      title: 'Economia com LED',
      value: `${dashboardData.economia_led_percentual}%`,
      subtitle: 'Redução no consumo',
      icon: TrendingUp,
      trend: 'up',
      trendValue: 'Meta atingida'
    }
  ];

  const serviceStatus = [
    {
      service: 'Iluminação Pública',
      status: 'Excelente',
      percentage: Math.round((dashboardData.pontos_luz_funcionando / dashboardData.total_pontos_luz) * 100),
      color: 'bg-green-500'
    },
    {
      service: 'Limpeza Urbana',
      status: 'Bom',
      percentage: Math.round((dashboardData.rotas_executadas_hoje / dashboardData.total_rotas_ativas) * 100),
      color: 'bg-blue-500'
    },
    {
      service: 'Atendimento ao Cidadão',
      status: dashboardData.solicitacoes_pendentes > 10 ? 'Atenção' : 'Bom',
      percentage: Math.max(0, 100 - (dashboardData.solicitacoes_pendentes * 10)),
      color: dashboardData.solicitacoes_pendentes > 10 ? 'bg-yellow-500' : 'bg-green-500'
    },
    {
      service: 'Manutenção Preventiva',
      status: 'Bom',
      percentage: 85, // Simulado
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Serviços Públicos</h1>
          <p className="text-gray-600 mt-1">Monitoramento em tempo real dos serviços urbanos</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
          <Activity className="h-5 w-5 text-green-600" />
          <span className="text-green-600 font-medium">Sistema Operacional</span>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid com indicadores e status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Indicadores de performance */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Indicadores de Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {indicators.map((indicator, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <indicator.icon className="h-5 w-5 text-gray-600" />
                      <p className="text-sm font-medium text-gray-600">{indicator.title}</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-2">{indicator.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{indicator.subtitle}</p>
                  </div>
                  {indicator.trend && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
                      indicator.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <TrendingUp className={`h-3 w-3 ${indicator.trend === 'down' ? 'rotate-180' : ''}`} />
                      <span>{indicator.trendValue}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status dos serviços */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Status dos Serviços</h2>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="space-y-4">
              {serviceStatus.map((service, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{service.service}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      service.status === 'Excelente' ? 'bg-green-100 text-green-600' :
                      service.status === 'Bom' ? 'bg-blue-100 text-blue-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${service.color}`}
                      style={{ width: `${service.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{service.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cards de ação rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Manutenção Programada</h3>
              <p className="text-blue-100 mt-1">Otimizar rotas e equipes</p>
            </div>
            <Wrench className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Mapa Interativo</h3>
              <p className="text-green-100 mt-1">Visualizar ocorrências</p>
            </div>
            <Map className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Relatório Mensal</h3>
              <p className="text-purple-100 mt-1">Análise de performance</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Alertas e notificações */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Alertas e Prioridades</h2>
        <div className="space-y-3">
          {dashboardData.solicitacoes_pendentes > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  {dashboardData.solicitacoes_pendentes} solicitações pendentes
                </p>
                <p className="text-xs text-orange-600">Requerem atenção das equipes de campo</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Sistema de iluminação 95% operacional
              </p>
              <p className="text-xs text-green-600">Economia de energia dentro da meta</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Truck className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Coleta seletiva funcionando normalmente
              </p>
              <p className="text-xs text-blue-600">Todas as rotas dentro do cronograma</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardServicosPublicos;