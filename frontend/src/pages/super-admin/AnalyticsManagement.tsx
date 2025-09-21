import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  LineChart,
  Users,
  Building2,
  FileText,
  Download,
  Filter,
  Calendar,
  Target,
  Activity,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Share2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { analyticsService, type AnalyticsOverview, type PopularFeatures, type ModuleAnalytics, type GeographicData, type UsageEvolution, type AutomatedReport } from "@/services/analyticsService";

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

interface AnalyticsData {
  periodo: string;
  metricas_gerais: {
    total_usuarios: number;
    usuarios_ativos_mes: number;
    sessoes_totais: number;
    tempo_medio_sessao: number;
    taxa_bounce: number;
    paginas_por_sessao: number;
  };
  metricas_negocio: {
    novos_clientes: number;
    receita_mes: number;
    ticket_medio: number;
    churn_rate: number;
    nps_score: number;
    csat_score: number;
  };
  metricas_produto: {
    funcionalidades_mais_usadas: FuncionalidadeUso[];
    modulos_populares: ModuloUso[];
    tempo_resposta_medio: number;
    uptime_percentage: number;
    bugs_reportados: number;
    features_requisitadas: number;
  };
  demograficos: {
    distribuicao_regioes: RegiaoUso[];
    distribuicao_planos: PlanoUso[];
    tamanho_prefeituras: TamanhoPrefeitura[];
  };
}

interface FuncionalidadeUso {
  nome: string;
  categoria: string;
  usuarios_ativos: number;
  total_uso: number;
  tempo_medio: number;
  crescimento: number;
}

interface ModuloUso {
  nome: string;
  usuarios: number;
  sessoes: number;
  tempo_total: number;
  satisfacao: number;
}

interface RegiaoUso {
  estado: string;
  prefeituras: number;
  usuarios: number;
  receita: number;
  crescimento: number;
}

interface PlanoUso {
  plano: string;
  quantidade: number;
  receita: number;
  churn: number;
  upgrade_rate: number;
}

interface TamanhoPrefeitura {
  categoria: string;
  quantidade: number;
  populacao_media: number;
  receita_media: number;
}

interface Report {
  id: string;
  nome: string;
  tipo: 'executivo' | 'operacional' | 'financeiro' | 'tecnico';
  descricao: string;
  frequencia: 'diario' | 'semanal' | 'mensal' | 'trimestral';
  ultimo_gerado: string;
  status: 'ativo' | 'pausado';
  destinatarios: string[];
}

// ====================================================================
// DADOS MOCK PARA DEMONSTRAÇÃO
// ====================================================================

const mockAnalytics: AnalyticsData = {
  periodo: 'Janeiro 2024',
  metricas_gerais: {
    total_usuarios: 1847,
    usuarios_ativos_mes: 1623,
    sessoes_totais: 8942,
    tempo_medio_sessao: 18.5, // minutos
    taxa_bounce: 12.8, // %
    paginas_por_sessao: 7.3
  },
  metricas_negocio: {
    novos_clientes: 4,
    receita_mes: 89750,
    ticket_medio: 1908,
    churn_rate: 3.2,
    nps_score: 67,
    csat_score: 4.3
  },
  metricas_produto: {
    funcionalidades_mais_usadas: [
      { nome: 'Atendimento ao Cidadão', categoria: 'Core', usuarios_ativos: 1547, total_uso: 12749, tempo_medio: 8.2, crescimento: 15.3 },
      { nome: 'Gestão de Protocolos', categoria: 'Core', usuarios_ativos: 1423, total_uso: 9876, tempo_medio: 6.5, crescimento: 12.7 },
      { nome: 'Relatórios Gerenciais', categoria: 'Analytics', usuarios_ativos: 892, total_uso: 3421, tempo_medio: 12.8, crescimento: 8.9 },
      { nome: 'Portal do Cidadão', categoria: 'Frontend', usuarios_ativos: 15420, total_uso: 45230, tempo_medio: 4.3, crescimento: 23.1 }
    ],
    modulos_populares: [
      { nome: 'Saúde', usuarios: 645, sessoes: 2847, tempo_total: 1890, satisfacao: 4.5 },
      { nome: 'Educação', usuarios: 432, sessoes: 1923, tempo_total: 1456, satisfacao: 4.2 },
      { nome: 'Assistência Social', usuarios: 378, sessoes: 1654, tempo_total: 1234, satisfacao: 4.4 },
      { nome: 'Planejamento Urbano', usuarios: 298, sessoes: 1342, tempo_total: 987, satisfacao: 4.1 }
    ],
    tempo_resposta_medio: 1.2, // segundos
    uptime_percentage: 99.7,
    bugs_reportados: 12,
    features_requisitadas: 28
  },
  demograficos: {
    distribuicao_regioes: [
      { estado: 'SP', prefeituras: 28, usuarios: 1247, receita: 54320, crescimento: 12.5 },
      { estado: 'MG', prefeituras: 12, usuarios: 387, receita: 18950, crescimento: 8.7 },
      { estado: 'RJ', prefeituras: 5, usuarios: 156, receita: 12480, crescimento: 15.2 },
      { estado: 'PR', prefeituras: 2, usuarios: 57, receita: 4000, crescimento: 6.1 }
    ],
    distribuicao_planos: [
      { plano: 'STARTER', quantidade: 28, receita: 33600, churn: 4.1, upgrade_rate: 18.5 },
      { plano: 'PROFESSIONAL', quantidade: 15, receita: 67500, churn: 2.8, upgrade_rate: 12.3 },
      { plano: 'ENTERPRISE', quantidade: 4, receita: 50000, churn: 1.2, upgrade_rate: 0 }
    ],
    tamanho_prefeituras: [
      { categoria: 'Pequenas (até 20k)', quantidade: 32, populacao_media: 12500, receita_media: 1200 },
      { categoria: 'Médias (20k-100k)', quantidade: 12, populacao_media: 65000, receita_media: 4500 },
      { categoria: 'Grandes (100k+)', quantidade: 3, populacao_media: 850000, receita_media: 12500 }
    ]
  }
};

const mockReports: Report[] = [
  {
    id: '1',
    nome: 'Relatório Executivo Mensal',
    tipo: 'executivo',
    descricao: 'Visão geral das métricas de negócio e performance',
    frequencia: 'mensal',
    ultimo_gerado: '2024-01-01',
    status: 'ativo',
    destinatarios: ['ceo@digiurban.com', 'cto@digiurban.com']
  },
  {
    id: '2',
    nome: 'Performance Técnica Semanal',
    tipo: 'tecnico',
    descricao: 'Métricas de uptime, performance e bugs',
    frequencia: 'semanal',
    ultimo_gerado: '2024-01-08',
    status: 'ativo',
    destinatarios: ['dev@digiurban.com', 'ops@digiurban.com']
  },
  {
    id: '3',
    nome: 'Análise Financeira Trimestral',
    tipo: 'financeiro',
    descricao: 'Receitas, custos e projeções financeiras',
    frequencia: 'trimestral',
    ultimo_gerado: '2024-01-01',
    status: 'ativo',
    destinatarios: ['cfo@digiurban.com', 'finance@digiurban.com']
  }
];

const usageEvolutionData = [
  { month: 'Jul', usuarios: 1342, sessoes: 7234, tempo_sessao: 16.8 },
  { month: 'Ago', usuarios: 1456, sessoes: 7856, tempo_sessao: 17.2 },
  { month: 'Set', usuarios: 1534, sessoes: 8234, tempo_sessao: 17.9 },
  { month: 'Out', usuarios: 1612, sessoes: 8567, tempo_sessao: 18.1 },
  { month: 'Nov', usuarios: 1623, sessoes: 8942, tempo_sessao: 18.5 }
];

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const AnalyticsManagement: React.FC = () => {
  // Estados para dados reais das APIs
  const [analyticsOverview, setAnalyticsOverview] = useState<AnalyticsOverview | null>(null);
  const [popularFeatures, setPopularFeatures] = useState<PopularFeatures | null>(null);
  const [moduleAnalytics, setModuleAnalytics] = useState<ModuleAnalytics | null>(null);
  const [geographicData, setGeographicData] = useState<GeographicData | null>(null);
  const [usageEvolution, setUsageEvolution] = useState<UsageEvolution | null>(null);
  const [automatedReports, setAutomatedReports] = useState<AutomatedReport[]>([]);

  // Estados de controle
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  // ====================================================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS
  // ====================================================================

  const loadAllAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar todos os dados em paralelo
      const [overview, features, modules, geographic, usage, reports] = await Promise.all([
        analyticsService.getAnalyticsOverview(selectedPeriod),
        analyticsService.getPopularFeatures(selectedPeriod),
        analyticsService.getModuleAnalytics('current'),
        analyticsService.getGeographicData('current', 'estado'),
        analyticsService.getUsageEvolution(selectedPeriod),
        analyticsService.getAutomatedReports()
      ]);

      setAnalyticsOverview(overview);
      setPopularFeatures(features);
      setModuleAnalytics(modules);
      setGeographicData(geographic);
      setUsageEvolution(usage);
      setAutomatedReports(reports);

    } catch (err) {
      console.error('Erro ao carregar dados de analytics:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAllAnalyticsData();
    setRefreshing(false);
  };

  // Carregar dados na inicialização e quando o período mudar
  useEffect(() => {
    loadAllAnalyticsData();
  }, [selectedPeriod]);

  // ====================================================================
  // FUNÇÕES UTILITÁRIAS
  // ====================================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getReportTypeBadge = (tipo: string) => {
    const typeConfig = {
      executivo: { label: 'Executivo', color: 'bg-purple-100 text-purple-800' },
      operacional: { label: 'Operacional', color: 'bg-blue-100 text-blue-800' },
      financeiro: { label: 'Financeiro', color: 'bg-green-100 text-green-800' },
      tecnico: { label: 'Técnico', color: 'bg-orange-100 text-orange-800' }
    };
    
    const config = typeConfig[tipo as keyof typeof typeConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getFrequencyBadge = (frequencia: string) => {
    const frequencyConfig = {
      diario: { label: 'Diário', color: 'bg-red-100 text-red-800' },
      semanal: { label: 'Semanal', color: 'bg-yellow-100 text-yellow-800' },
      mensal: { label: 'Mensal', color: 'bg-blue-100 text-blue-800' },
      trimestral: { label: 'Trimestral', color: 'bg-green-100 text-green-800' }
    };

    const config = frequencyConfig[frequencia as keyof typeof frequencyConfig];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  // Funções auxiliares para relatórios automatizados
  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      executive: 'Executivo',
      technical: 'Técnico',
      financial: 'Financeiro',
      usage: 'Uso'
    };
    return labels[type] || type;
  };

  const getReportTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      executive: 'bg-purple-100 text-purple-800',
      technical: 'bg-orange-100 text-orange-800',
      financial: 'bg-green-100 text-green-800',
      usage: 'bg-blue-100 text-blue-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      quarterly: 'Trimestral'
    };
    return labels[frequency] || frequency;
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-red-100 text-red-800',
      weekly: 'bg-yellow-100 text-yellow-800',
      monthly: 'bg-blue-100 text-blue-800',
      quarterly: 'bg-green-100 text-green-800'
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'text-gray-500';
    const colors: Record<string, string> = {
      success: 'text-green-600',
      failed: 'text-red-600',
      partial: 'text-yellow-600'
    };
    return colors[status] || 'text-gray-500';
  };

  // Handlers para ações dos relatórios
  const handleViewReport = (reportId: number) => {
    console.log('Visualizar relatório:', reportId);
    // TODO: Implementar navegação para visualização do relatório
  };

  const handleGenerateReport = async (reportId: number) => {
    try {
      setRefreshing(true);
      await analyticsService.generateReport(reportId);
      await loadAllAnalyticsData(); // Recarregar dados para atualizar status
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setError(error instanceof Error ? error.message : 'Erro ao gerar relatório');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadReport = (reportId: number) => {
    console.log('Download relatório:', reportId);
    // TODO: Implementar download do relatório
  };

  const handleCreateReport = () => {
    console.log('Criar novo relatório');
    // TODO: Implementar modal/página de criação de relatório
  };

  // ====================================================================
  // RENDER PRINCIPAL
  // ====================================================================

  // Se estiver carregando pela primeira vez
  if (loading && !analyticsOverview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 mt-2">Carregando dados de analytics...</p>
        </div>
      </div>
    );
  }

  // Se houver erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-lg mx-auto mt-20">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Erro ao carregar analytics</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button
                onClick={loadAllAnalyticsData}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Analytics & Relatórios
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Business Intelligence e análises empresariais avançadas
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              disabled={refreshing}
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
            <Button
              onClick={refreshData}
              disabled={refreshing}
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Atualizar
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Usuários Únicos */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Usuários Únicos</p>
                <p className="text-3xl font-bold text-blue-900">
                  {formatNumber(analyticsOverview?.uniqueUsers || 0)}
                </p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {formatNumber(analyticsOverview?.totalSessions || 0)} sessões totais
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tempo Médio de Sessão */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Tempo Sessão</p>
                <p className="text-3xl font-bold text-green-900">
                  {analyticsOverview?.avgSessionDuration || 0}m
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <Activity className="h-3 w-3" />
                  {analyticsOverview?.totalPagesPerSession || 0} páginas por sessão
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Engajamento */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Engajamento</p>
                <p className="text-3xl font-bold text-purple-900">
                  {analyticsOverview?.engagement.sessionQuality || 'Alta'}
                </p>
                <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3" />
                  {((analyticsOverview?.engagement.returnRate || 0) * 100).toFixed(1)}% retorno
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page Views */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Page Views</p>
                <p className="text-3xl font-bold text-orange-900">
                  {formatNumber(analyticsOverview?.totalPageViews || 0)}
                </p>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <Eye className="h-3 w-3" />
                  {((analyticsOverview?.engagement.bounceRate || 0) * 100).toFixed(1)}% bounce rate
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Evolução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Evolução de Uso */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Evolução de Uso da Plataforma
            </CardTitle>
            <CardDescription>
              Usuários únicos, sessões e page views - {selectedPeriod === '7d' ? 'últimos 7 dias' : selectedPeriod === '30d' ? 'últimos 30 dias' : 'últimos 90 dias'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageEvolution?.dailyUsage.slice(-7).map((data, index) => {
                const maxUsers = Math.max(...(usageEvolution?.dailyUsage.map(d => d.uniqueUsers) || [1]));
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-sm w-16">
                        {new Date(data.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="w-64 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${(data.uniqueUsers / maxUsers) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-blue-600">{formatNumber(data.uniqueUsers)} usuários</span>
                      <Badge variant="outline" className="text-xs">
                        {formatNumber(data.sessions)} sessões
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatNumber(data.pageViews)} views
                      </Badge>
                    </div>
                  </div>
                );
              }) || []}
            </div>
            {(!usageEvolution?.dailyUsage || usageEvolution.dailyUsage.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum dado de evolução disponível para o período selecionado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Funcionalidades Mais Usadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Funcionalidades Mais Utilizadas
            </CardTitle>
            <CardDescription>
              Top funcionalidades por usuários únicos e uso total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularFeatures?.topFeatures.slice(0, 5).map((feature, index) => {
                const maxUsers = Math.max(...(popularFeatures?.topFeatures.map(f => f.uniqueUsers) || [1]));
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{feature.name}</p>
                        <p className="text-xs text-gray-500">{feature.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatNumber(feature.uniqueUsers)}</p>
                        <p className="text-xs text-blue-600">{formatNumber(feature.totalUsage)} usos</p>
                      </div>
                    </div>
                    <Progress value={(feature.uniqueUsers / maxUsers) * 100} className="h-2" />
                  </div>
                );
              }) || []}
            </div>
            {(!popularFeatures?.topFeatures || popularFeatures.topFeatures.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum dado de funcionalidades disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Módulos por Popularidade
            </CardTitle>
            <CardDescription>
              Módulos do sistema mais utilizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moduleAnalytics?.globalStats.slice(0, 5).map((module, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: `hsl(${210 + index * 30}, 70%, 50%)`
                      }}
                    ></div>
                    <div>
                      <p className="font-medium text-sm">{module.moduleName}</p>
                      <p className="text-xs text-gray-500">{formatNumber(module.totalUsers)} usuários</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatNumber(module.totalSessions)}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">
                        {module.avgSessionTime.toFixed(1)}m médio
                      </span>
                    </div>
                  </div>
                </div>
              )) || []}
            </div>
            {(!moduleAnalytics?.globalStats || moduleAnalytics.globalStats.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum dado de módulos disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribuição Geográfica */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Distribuição Geográfica
          </CardTitle>
          <CardDescription>
            Análise regional de usuários e engajamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Por Estados */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-4">Por Estado</h4>
              {geographicData?.distribution.slice(0, 6).map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">{region.name}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{region.tenants} tenants</p>
                      <p className="text-xs text-gray-500">{formatNumber(region.totalUsuarios)} usuários</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-green-600">{region.engajamento}% engajamento</p>
                    <p className="text-xs text-gray-500">{formatNumber(region.protocolosMes)} protocolos/mês</p>
                  </div>
                </div>
              )) || []}
              {(!geographicData?.distribution || geographicData.distribution.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum dado geográfico disponível</p>
                </div>
              )}
            </div>

            {/* Estatísticas Gerais */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-4">Estatísticas Gerais</h4>
              {geographicData && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Total de Usuários</span>
                      <span className="text-lg font-bold text-blue-900">
                        {formatNumber(geographicData.totalStats.totalUsuarios)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-700">Usuários Ativos</span>
                      <span className="text-lg font-bold text-green-900">
                        {formatNumber(geographicData.totalStats.usuariosAtivos)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-700">Cidades Atendidas</span>
                      <span className="text-lg font-bold text-purple-900">
                        {formatNumber(geographicData.totalStats.cidades)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-700">Engajamento Geral</span>
                      <span className="text-lg font-bold text-orange-900">
                        {geographicData.totalStats.engajamentoGeral}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Satisfação Média</span>
                      <span className="text-lg font-bold text-gray-900">
                        {geographicData.totalStats.satisfacaoGeral.toFixed(1)}/5.0
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {!geographicData && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Carregando estatísticas...</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Automatizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios Automatizados
          </CardTitle>
          <CardDescription>
            Configuração e gestão de relatórios automáticos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automatedReports.map((report) => (
              <Card key={report.id} className="bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{report.name}</h3>
                        <p className="text-sm text-gray-600">{report.description || 'Sem descrição'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getReportTypeColor(report.reportType)}>
                            {getReportTypeLabel(report.reportType)}
                          </Badge>
                          <Badge variant="outline" className={getFrequencyColor(report.frequency)}>
                            {getFrequencyLabel(report.frequency)}
                          </Badge>
                          {!report.isActive && (
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-gray-600">
                        <p>Último gerado:</p>
                        <p className="font-medium">
                          {report.lastGenerated
                            ? new Date(report.lastGenerated).toLocaleDateString('pt-BR')
                            : 'Nunca'}
                        </p>
                        <p className="text-xs">{report.recipientsCount} destinatários</p>
                        <p className="text-xs">
                          Status: <span className={getStatusColor(report.lastStatus)}>{report.lastStatus || 'N/A'}</span>
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={() => handleViewReport(report.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={!report.isActive}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-600 hover:bg-gray-50"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {automatedReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum relatório automatizado configurado</p>
              <Button className="mt-4" onClick={() => handleCreateReport()}>
                Criar Primeiro Relatório
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default AnalyticsManagement;