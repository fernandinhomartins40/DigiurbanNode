// ====================================================================
// 🔍 ANALYTICS SERVICE - DIGIURBAN FRONTEND
// ====================================================================
// Serviço para comunicação com as APIs de analytics do backend
// Implementação completa da Fase 3 do plano de Analytics
// ====================================================================

import { SimpleTokenManager } from '../lib/tokenRotation-simple';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ====================================================================
// INTERFACES PARA ANALYTICS
// ====================================================================

export interface AnalyticsOverview {
  totalSessions: number;
  uniqueUsers: number;
  avgSessionDuration: number;
  totalPageViews: number;
  totalPagesPerSession: number;
  topFeatures: Array<{
    name: string;
    usage: number;
  }>;
  engagement: {
    bounceRate: number;
    returnRate: number;
    sessionQuality: string;
  };
  period: string;
  generatedAt: string;
}

export interface UsageEvolution {
  dailyUsage: Array<{
    date: string;
    sessions: number;
    uniqueUsers: number;
    pageViews: number;
    avgPagesPerSession: number;
  }>;
  featureTrends: Array<{
    date: Date;
    featureName: string;
    _sum: {
      usageCount: number | null;
    };
  }>;
  period: string;
  generatedAt: string;
}

export interface PopularFeatures {
  topFeatures: Array<{
    rank: number;
    name: string;
    category: string;
    totalUsage: number;
    uniqueUsers: number;
    avgTimeMinutes: number;
    usagePerUser: number;
  }>;
  categoryStats: Array<{
    category: string;
    totalUsage: number;
    uniqueUsers: number;
  }>;
  engagement: {
    totalUsers: number;
    avgFeaturesPerUser: number;
    powerUsers: number;
    powerUserPercentage: number;
  };
  period: string;
  generatedAt: string;
}

export interface ModuleAnalytics {
  moduleStats: Array<{
    id: number;
    moduleName: string;
    tenantId: string | null;
    tenantName?: string;
    tenantLocation?: string;
    totalUsers: number;
    activeUsers: number;
    totalSessions: number;
    totalPageViews: number;
    avgSessionTime: number | null;
    popularFeature: string | null;
    period: string;
    engagementRate: number;
  }>;
  globalStats: Array<{
    moduleName: string;
    totalUsers: number;
    activeUsers: number;
    totalSessions: number;
    totalPageViews: number;
    avgSessionTime: number;
    tenantsUsingModule: number;
    avgUsersPerTenant: number;
  }>;
  period: string;
  generatedAt: string;
}

export interface GeographicData {
  distribution: Array<{
    name: string;
    totalUsuarios: number;
    usuariosAtivos: number;
    protocolosMes: number;
    satisfacaoMedia: number;
    cidades: Array<{
      nome: string;
      estado: string;
      usuarios: number;
      usuariosAtivos: number;
      protocolos: number;
      satisfacao: number | null;
      tenant?: string;
    }>;
    tenants: number;
    populacaoTotal: number;
    penetracao: number;
    engajamento: number;
  }>;
  totalStats: {
    totalUsuarios: number;
    usuariosAtivos: number;
    protocolosMes: number;
    populacaoTotal: number;
    cidades: number;
    satisfacaoGeral: number;
    penetracaoGeral: number;
    engajamentoGeral: number;
  };
  groupBy: string;
  period: string;
  generatedAt: string;
}

export interface PerformanceMetrics {
  system: {
    uptime: {
      seconds: number;
      formatted: string;
    };
    memory: {
      used: number;
      total: number;
      usage: number;
    };
    cpu: {
      usage: number;
    };
  };
  application: {
    totalSessions: number;
    avgSessionDuration: number;
    errorRate: number;
    responseTime: {
      avg: number;
      p95: number;
      p99: number;
    };
  };
  database: {
    connections: number;
    queryTime: {
      avg: number;
      slow: number;
    };
    size: number;
  };
  custom: Record<string, Array<{
    value: number;
    unit: string | null;
    timestamp: Date;
  }>>;
  healthScore: number;
  status: string;
  period: string;
  generatedAt: string;
}

export interface AutomatedReport {
  id: number;
  name: string;
  description: string | null;
  reportType: string;
  frequency: string;
  isActive: boolean;
  config: Record<string, any>;
  creator: {
    id: string;
    nomeCompleto: string;
    email: string;
  };
  schedulesCount: number;
  recipientsCount: number;
  lastGenerated: Date | null;
  lastStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportData {
  name: string;
  description?: string;
  reportType: 'executive' | 'technical' | 'financial' | 'usage';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  config?: Record<string, any>;
  template?: string;
  schedules?: Array<{
    cronExpression?: string;
    timezone?: string;
    recipients?: Array<{
      email: string;
      name?: string;
    }>;
  }>;
}

export interface ReportHistory {
  history: Array<{
    id: number;
    reportId: number;
    generatedAt: Date;
    status: string;
    filePath: string | null;
    fileSize: number | null;
    executionTime: number | null;
    errorMessage: string | null;
    sentTo: string | null;
    period: string | null;
  }>;
  stats: {
    byStatus: Record<string, number>;
    avgExecutionTime: number;
    totalGenerations: number;
  };
}

// ====================================================================
// CLASSE DO SERVIÇO
// ====================================================================

class AnalyticsService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Headers com autenticação
  private getHeaders(): HeadersInit {
    const tokenManager = SimpleTokenManager.getInstance();
    const token = tokenManager.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Função auxiliar para fazer requests
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro de rede' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ====================================================================
  // MÉTODOS DE ANALYTICS
  // ====================================================================

  /**
   * Obter overview geral de analytics
   */
  async getAnalyticsOverview(period: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsOverview> {
    return this.makeRequest<AnalyticsOverview>(`/admin/analytics/overview?period=${period}`);
  }

  /**
   * Obter evolução de uso temporal
   */
  async getUsageEvolution(period: '7d' | '30d' | '90d' = '30d'): Promise<UsageEvolution> {
    return this.makeRequest<UsageEvolution>(`/admin/analytics/usage?period=${period}`);
  }

  /**
   * Obter funcionalidades mais populares
   */
  async getPopularFeatures(period: '7d' | '30d' | '90d' = '30d', category?: string): Promise<PopularFeatures> {
    const params = new URLSearchParams({ period });
    if (category) params.append('category', category);

    return this.makeRequest<PopularFeatures>(`/admin/analytics/features?${params.toString()}`);
  }

  /**
   * Obter analytics por módulo
   */
  async getModuleAnalytics(period: string = 'current'): Promise<ModuleAnalytics> {
    return this.makeRequest<ModuleAnalytics>(`/admin/analytics/modules?period=${period}`);
  }

  /**
   * Obter distribuição geográfica
   */
  async getGeographicData(period: string = 'current', groupBy: 'estado' | 'regiao' = 'estado'): Promise<GeographicData> {
    return this.makeRequest<GeographicData>(`/admin/analytics/geographic?period=${period}&groupBy=${groupBy}`);
  }

  /**
   * Obter métricas de performance
   */
  async getPerformanceMetrics(period: '24h' | '7d' | '30d' = '24h'): Promise<PerformanceMetrics> {
    return this.makeRequest<PerformanceMetrics>(`/admin/analytics/performance?period=${period}`);
  }

  // ====================================================================
  // MÉTODOS DE RELATÓRIOS
  // ====================================================================

  /**
   * Listar relatórios automatizados
   */
  async getAutomatedReports(type?: string, isActive?: boolean): Promise<AutomatedReport[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (isActive !== undefined) params.append('isActive', isActive.toString());

    return this.makeRequest<AutomatedReport[]>(`/admin/reports?${params.toString()}`);
  }

  /**
   * Criar novo relatório automatizado
   */
  async createReport(data: CreateReportData): Promise<{ id: number; name: string }> {
    return this.makeRequest<{ id: number; name: string }>('/admin/reports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Atualizar relatório automatizado
   */
  async updateReport(id: number, data: Partial<CreateReportData>): Promise<AutomatedReport> {
    return this.makeRequest<AutomatedReport>(`/admin/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Gerar relatório manualmente
   */
  async generateReport(id: number, period?: string): Promise<{
    historyId: number;
    executionTime: number;
    generatedAt: Date;
  }> {
    return this.makeRequest<{
      historyId: number;
      executionTime: number;
      generatedAt: Date;
    }>(`/admin/reports/${id}/generate`, {
      method: 'POST',
      body: JSON.stringify({ period })
    });
  }

  /**
   * Obter histórico de geração de relatório
   */
  async getReportHistory(id: number, limit: number = 50, status?: string): Promise<ReportHistory> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (status) params.append('status', status);

    return this.makeRequest<ReportHistory>(`/admin/reports/${id}/history?${params.toString()}`);
  }

  // ====================================================================
  // MÉTODOS AUXILIARES
  // ====================================================================

  /**
   * Processar dados de funcionalidades para formato do componente
   */
  processPopularFeatures(data: PopularFeatures) {
    return data.topFeatures.map(feature => ({
      nome: feature.name,
      categoria: feature.category,
      usuarios_ativos: feature.uniqueUsers,
      total_uso: feature.totalUsage,
      tempo_medio: feature.avgTimeMinutes,
      crescimento: ((feature.totalUsage / (feature.totalUsage - 100)) - 1) * 100 // Mock de crescimento
    }));
  }

  /**
   * Processar dados de módulos para formato do componente
   */
  processModuleAnalytics(data: ModuleAnalytics) {
    return data.globalStats.map(module => ({
      nome: module.moduleName,
      usuarios: module.totalUsers,
      sessoes: module.totalSessions,
      tempo_total: module.avgSessionTime * 60, // converter para horas
      satisfacao: 4.5 // Mock - implementar NPS real por módulo
    }));
  }

  /**
   * Processar dados geográficos para formato do componente
   */
  processGeographicData(data: GeographicData) {
    return data.distribution.map(region => ({
      estado: region.name,
      prefeituras: region.tenants,
      usuarios: region.totalUsuarios,
      receita: region.totalUsuarios * 1200, // Mock baseado em valor médio
      crescimento: (region.engajamento / 100) * 15 // Mock de crescimento baseado no engajamento
    }));
  }

  /**
   * Converter dados de evolução de uso para formato do gráfico
   */
  processUsageEvolution(data: UsageEvolution) {
    return data.dailyUsage.map(day => ({
      month: new Date(day.date).toLocaleDateString('pt-BR', { month: 'short' }),
      usuarios: day.uniqueUsers,
      sessoes: day.sessions,
      tempo_sessao: day.avgPagesPerSession
    }));
  }
}

// ====================================================================
// INSTÂNCIA SINGLETON DO SERVIÇO
// ====================================================================

export const analyticsService = new AnalyticsService();
export default analyticsService;