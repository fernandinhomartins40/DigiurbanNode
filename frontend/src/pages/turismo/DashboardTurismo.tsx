import React, { useEffect } from 'react';
import { useTurismo } from "@/hooks/useTurismo";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Building, 
  Camera,
  DollarSign,
  Briefcase,
  Star,
  TrendingUp,
  Route,
  Globe,
  Award
} from 'lucide-react';

const DashboardTurismo: React.FC = () => {
  const { dashboardData, loading, fetchDashboardData } = useTurismo();

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
      title: 'Pontos Turísticos',
      value: dashboardData.pontos_turisticos_mapeados,
      subtitle: 'Mapeados e catalogados',
      icon: MapPin,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Visitantes/Mês',
      value: dashboardData.visitantes_estimados_mes?.toLocaleString('pt-BR'),
      subtitle: 'Estimativa atual',
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Eventos Agendados',
      value: dashboardData.eventos_agendados,
      subtitle: 'No calendário oficial',
      icon: Calendar,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Estabelecimentos',
      value: dashboardData.estabelecimentos_cadastrados,
      subtitle: 'Cadastrados ativos',
      icon: Building,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  const indicators = [
    {
      title: 'Campanhas Ativas',
      value: dashboardData.campanhas_ativas,
      subtitle: 'Promoção turística',
      icon: Camera,
      trend: 'up',
      trendValue: '+2'
    },
    {
      title: 'Receita Turística',
      value: `R$ ${dashboardData.receita_turistica_estimada?.toLocaleString('pt-BR')}`,
      subtitle: 'Estimada mensal',
      icon: DollarSign,
      trend: 'up',
      trendValue: '+18%'
    },
    {
      title: 'Empregos Gerados',
      value: dashboardData.empregos_gerados,
      subtitle: 'Diretos no setor',
      icon: Briefcase,
      trend: 'up',
      trendValue: '+25'
    },
    {
      title: 'Avaliação Turistas',
      value: `${dashboardData.indice_avaliacao_turistas}/5.0`,
      subtitle: 'Índice de satisfação',
      icon: Star,
      trend: 'up',
      trendValue: '+0.4'
    }
  ];

  const tiposPontosTuristicos = [
    { tipo: 'Naturais', quantidade: 8, percentual: 40, cor: 'bg-green-500' },
    { tipo: 'Históricos', quantidade: 6, percentual: 30, cor: 'bg-yellow-500' },
    { tipo: 'Culturais', quantidade: 4, percentual: 20, cor: 'bg-purple-500' },
    { tipo: 'Religiosos', quantidade: 2, percentual: 10, cor: 'bg-blue-500' }
  ];

  const estabelecimentosPorTipo = [
    { tipo: 'Restaurantes', quantidade: 8, status: 'Crescimento', cor: 'bg-red-500' },
    { tipo: 'Hotéis/Pousadas', quantidade: 6, status: 'Estável', cor: 'bg-blue-500' },
    { tipo: 'Agências', quantidade: 3, status: 'Crescimento', cor: 'bg-green-500' },
    { tipo: 'Transporte', quantidade: 4, status: 'Bom', cor: 'bg-purple-500' }
  ];

  const proximosEventos = [
    {
      evento: 'Festival de Inverno 2024',
      data: '2024-07-15',
      publico: '15.000',
      tipo: 'Cultural'
    },
    {
      evento: 'Feira do Produtor Rural',
      data: '2024-05-18',
      publico: '3.000',
      tipo: 'Gastronômico'
    },
    {
      evento: 'Encontro de Trilheiros',
      data: '2024-09-28',
      publico: '500',
      tipo: 'Aventura'
    }
  ];

  const roteirosPopulares = [
    { nome: 'Roteiro Histórico Centro', avaliacoes: 48, media: 4.2 },
    { nome: 'Aventura na Natureza', avaliacoes: 73, media: 4.7 },
    { nome: 'Turismo Rural Completo', avaliacoes: 34, media: 4.3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Turismo</h1>
          <p className="text-gray-600 mt-1">Promovendo o desenvolvimento turístico sustentável do município</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
          <Globe className="h-5 w-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Temporada 2024</span>
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

      {/* Grid com indicadores e pontos turísticos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Indicadores de desenvolvimento */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Indicadores de Desenvolvimento Turístico</h2>
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
                    <div className="flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>{indicator.trendValue}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de pontos turísticos */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Pontos Turísticos por Tipo</h2>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="space-y-4">
              {tiposPontosTuristicos.map((ponto, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{ponto.tipo}</span>
                    <span className="text-xs text-gray-500">{ponto.quantidade} pontos</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${ponto.cor}`}
                      style={{ width: `${ponto.percentual}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{ponto.percentual}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Estabelecimentos turísticos */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Estabelecimentos Turísticos Cadastrados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {estabelecimentosPorTipo.map((estabelecimento, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">{estabelecimento.tipo}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  estabelecimento.status === 'Crescimento' ? 'bg-green-100 text-green-600' :
                  estabelecimento.status === 'Estável' ? 'bg-blue-100 text-blue-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {estabelecimento.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantidade</span>
                  <span className="font-medium">{estabelecimento.quantidade}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className={`h-2 rounded-full ${estabelecimento.cor}`}
                    style={{ width: `${(estabelecimento.quantidade / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Eventos e roteiros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Próximos eventos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Eventos Turísticos</h2>
          <div className="space-y-4">
            {proximosEventos.map((evento, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{evento.evento}</h3>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>{new Date(evento.data).toLocaleDateString('pt-BR')}</span>
                    <span>{evento.publico} visitantes</span>
                    <span className="bg-gray-200 px-2 py-1 rounded">{evento.tipo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roteiros populares */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Roteiros Mais Populares</h2>
          <div className="space-y-4">
            {roteirosPopulares.map((roteiro, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Route className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{roteiro.nome}</h3>
                    <p className="text-xs text-gray-500">{roteiro.avaliacoes} avaliações</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{roteiro.media}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards de ação rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Portal Turístico</h3>
              <p className="text-green-100 mt-1">Guia digital da cidade</p>
            </div>
            <Globe className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Campanhas Ativas</h3>
              <p className="text-blue-100 mt-1">Marketing turístico</p>
            </div>
            <Camera className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Análise de Demanda</h3>
              <p className="text-purple-100 mt-1">Estudos de mercado</p>
            </div>
            <Award className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Resumo de impacto */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Impacto Econômico do Turismo</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                R$ {dashboardData.receita_turistica_estimada?.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-gray-600">Receita Mensal</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-lg">
              <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{dashboardData.empregos_gerados}</p>
              <p className="text-sm text-gray-600">Empregos Diretos</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                {dashboardData.visitantes_estimados_mes?.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-gray-600">Visitantes/Mês</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 p-4 rounded-lg">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{dashboardData.indice_avaliacao_turistas}/5.0</p>
              <p className="text-sm text-gray-600">Satisfação Geral</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTurismo;