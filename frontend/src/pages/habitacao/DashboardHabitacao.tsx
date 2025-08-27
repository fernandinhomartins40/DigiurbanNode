import React, { useEffect } from 'react';
import { useHabitacao } from "@/hooks/useHabitacao";
import { 
  Home, 
  Users, 
  FileText, 
  Wrench, 
  TrendingDown,
  DollarSign,
  Award,
  BarChart3,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const DashboardHabitacao: React.FC = () => {
  const { dashboardData, loading, fetchDashboardData } = useHabitacao();

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
      title: 'Famílias em Programas',
      value: dashboardData.familias_programas_habitacionais,
      subtitle: 'Beneficiárias ativas',
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Unidades Entregues',
      value: dashboardData.unidades_entregues_periodo,
      subtitle: 'No período atual',
      icon: Home,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Regularizações',
      value: dashboardData.processos_regularizacao_andamento,
      subtitle: 'Em andamento',
      icon: FileText,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Melhorias/Mês',
      value: dashboardData.melhorias_realizadas_mes,
      subtitle: 'Obras concluídas',
      icon: Wrench,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  const indicators = [
    {
      title: 'Déficit Habitacional',
      value: `${dashboardData.deficit_habitacional_percentual}%`,
      subtitle: 'Da demanda cadastrada',
      icon: TrendingDown,
      trend: 'down',
      trendValue: '-3.2%',
      isGood: true
    },
    {
      title: 'Investimento Total',
      value: `R$ ${(dashboardData.investimento_habitacao / 1000000)?.toFixed(1)}M`,
      subtitle: 'Em programas ativos',
      icon: DollarSign,
      trend: 'up',
      trendValue: '+15%'
    },
    {
      title: 'Famílias Beneficiadas',
      value: dashboardData.familias_beneficiadas_total,
      subtitle: 'Total atendidas',
      icon: Award,
      trend: 'up',
      trendValue: '+22'
    },
    {
      title: 'Índice de Qualidade',
      value: `${dashboardData.indice_qualidade_habitacional?.toFixed(1)}%`,
      subtitle: 'Habitacional municipal',
      icon: BarChart3,
      trend: 'up',
      trendValue: '+5.8%'
    }
  ];

  const programasStatus = [
    {
      programa: 'Minha Casa Minha Vida',
      familias: Math.round(dashboardData.familias_programas_habitacionais * 0.6),
      meta: 100,
      progresso: 60,
      status: 'Em andamento',
      color: 'bg-blue-500'
    },
    {
      programa: 'Aluguel Social',
      familias: Math.round(dashboardData.familias_programas_habitacionais * 0.25),
      meta: 50,
      progresso: 80,
      status: 'Dentro da meta',
      color: 'bg-green-500'
    },
    {
      programa: 'Melhorias Habitacionais',
      familias: Math.round(dashboardData.familias_programas_habitacionais * 0.15),
      meta: 200,
      progresso: 45,
      status: 'Em execução',
      color: 'bg-orange-500'
    }
  ];

  const situacaoMoradia = [
    { tipo: 'Própria', familias: 120, percentual: 45, cor: 'bg-green-500' },
    { tipo: 'Alugada', familias: 80, percentual: 30, cor: 'bg-blue-500' },
    { tipo: 'Cedida', familias: 45, percentual: 17, cor: 'bg-yellow-500' },
    { tipo: 'Irregular', familias: 21, percentual: 8, cor: 'bg-red-500' }
  ];

  const regularizacaoFases = [
    {
      fase: 'Mapeamento',
      areas: 5,
      familias: 45,
      status: 'Concluído',
      statusColor: 'bg-green-100 text-green-600'
    },
    {
      fase: 'Documentação',
      areas: 3,
      familias: 28,
      status: 'Em andamento',
      statusColor: 'bg-blue-100 text-blue-600'
    },
    {
      fase: 'Titulação',
      areas: 2,
      familias: 18,
      status: 'Aguardando',
      statusColor: 'bg-yellow-100 text-yellow-600'
    }
  ];

  const alertas = [
    {
      tipo: 'atenção',
      titulo: 'Meta de entregas do trimestre',
      descricao: 'Necessário acelerar cronograma de construção',
      icone: AlertTriangle,
      cor: 'orange'
    },
    {
      tipo: 'sucesso',
      titulo: 'Programa aluguel social',
      descricao: 'Meta mensal atingida com sucesso',
      icone: CheckCircle2,
      cor: 'green'
    },
    {
      tipo: 'info',
      titulo: 'Regularização fundiária',
      descricao: '3 processos aguardando documentação',
      icone: FileText,
      cor: 'blue'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Habitação</h1>
          <p className="text-gray-600 mt-1">Garantindo o direito à moradia digna para todos</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
          <Home className="h-5 w-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Programas 2024</span>
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

      {/* Grid com indicadores e situação de moradia */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Indicadores de impacto social */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Indicadores de Política Habitacional</h2>
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
                      indicator.isGood || indicator.trend === 'up' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <TrendingDown className={`h-3 w-3 ${indicator.trend === 'up' ? 'rotate-180' : ''}`} />
                      <span>{indicator.trendValue}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Situação de moradia */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Situação de Moradia</h2>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="space-y-4">
              {situacaoMoradia.map((situacao, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{situacao.tipo}</span>
                    <span className="text-xs text-gray-500">{situacao.familias} famílias</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${situacao.cor}`}
                      style={{ width: `${situacao.percentual}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{situacao.percentual}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Programas habitacionais */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance dos Programas Habitacionais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programasStatus.map((programa, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">{programa.programa}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  programa.status === 'Dentro da meta' ? 'bg-green-100 text-green-600' :
                  programa.status === 'Em andamento' ? 'bg-blue-100 text-blue-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {programa.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Atendidas</span>
                  <span className="font-medium">{programa.familias}/{programa.meta}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${programa.color}`}
                    style={{ width: `${programa.progresso}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">{programa.progresso}% da meta</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regularização fundiária e alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Regularização fundiária */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Regularização Fundiária</h2>
          <div className="space-y-4">
            {regularizacaoFases.map((fase, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{fase.fase}</h3>
                    <p className="text-xs text-gray-500">{fase.areas} áreas • {fase.familias} famílias</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${fase.statusColor}`}>
                  {fase.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas e prioridades */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Alertas e Prioridades</h2>
          <div className="space-y-3">
            {alertas.map((alerta, index) => (
              <div 
                key={index} 
                className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  alerta.cor === 'orange' ? 'bg-orange-50 border-orange-200' :
                  alerta.cor === 'green' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <alerta.icone className={`h-5 w-5 flex-shrink-0 ${
                  alerta.cor === 'orange' ? 'text-orange-600' :
                  alerta.cor === 'green' ? 'text-green-600' :
                  'text-blue-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    alerta.cor === 'orange' ? 'text-orange-800' :
                    alerta.cor === 'green' ? 'text-green-800' :
                    'text-blue-800'
                  }`}>
                    {alerta.titulo}
                  </p>
                  <p className={`text-xs ${
                    alerta.cor === 'orange' ? 'text-orange-600' :
                    alerta.cor === 'green' ? 'text-green-600' :
                    'text-blue-600'
                  }`}>
                    {alerta.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards de ação rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Cadastro Único</h3>
              <p className="text-blue-100 mt-1">Gestão de famílias</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Sorteio Público</h3>
              <p className="text-green-100 mt-1">Transparência total</p>
            </div>
            <Award className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Análise de Déficit</h3>
              <p className="text-purple-100 mt-1">Planejamento estratégico</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Resumo executivo */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo Executivo - Política Habitacional</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{dashboardData.familias_programas_habitacionais}</p>
              <p className="text-sm text-gray-600">Famílias em Programas</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-lg">
              <Home className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{dashboardData.unidades_entregues_periodo}</p>
              <p className="text-sm text-gray-600">Unidades Entregues</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-lg">
              <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                R$ {(dashboardData.investimento_habitacao / 1000000)?.toFixed(1)}M
              </p>
              <p className="text-sm text-gray-600">Investimento Total</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 p-4 rounded-lg">
              <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{dashboardData.indice_qualidade_habitacional?.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Índice de Qualidade</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHabitacao;