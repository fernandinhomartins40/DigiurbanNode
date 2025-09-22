// ====================================================================
// 🔔 NOTIFICATION SERVICE - FRONTEND INTEGRATION
// ====================================================================
// Serviço para comunicação com as APIs de notificações administrativas
// Integração completa com backend para gestão de notificações em massa
// ====================================================================

import { SimpleTokenManager } from '../lib/tokenRotation-simple';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ====================================================================
// INTERFACES PARA NOTIFICAÇÕES
// ====================================================================

export interface NotificationStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  delivered: number;
  opened: number;
  clicked: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  hourly_stats: Array<{
    hour: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
  channel_stats: Array<{
    channel: 'email' | 'sms' | 'push' | 'in_app';
    sent: number;
    delivered: number;
    failed: number;
  }>;
  recent_activity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
  }>;
}

export interface NotificationAnalytics {
  performance_trends: Array<{
    period: string;
    sent: number;
    delivered: number;
    open_rate: number;
    click_rate: number;
  }>;
  user_engagement: {
    most_active_hours: string[];
    preferred_channels: Array<{
      channel: string;
      preference_percentage: number;
    }>;
    avg_response_time: number;
  };
  system_health: {
    email_server_status: 'healthy' | 'warning' | 'error';
    sms_provider_status: 'healthy' | 'warning' | 'error';
    push_service_status: 'healthy' | 'warning' | 'error';
    queue_size: number;
    processing_rate: number;
  };
}

export interface BulkNotification {
  title: string;
  message: string;
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  target_audience: {
    all_users?: boolean;
    specific_tenants?: string[];
    user_roles?: string[];
    user_ids?: string[];
  };
  scheduled_for?: string;
  template_id?: string;
  personalization?: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationConfig {
  default_channels: string[];
  rate_limits: {
    email_per_hour: number;
    sms_per_hour: number;
    push_per_hour: number;
  };
  retry_settings: {
    max_retries: number;
    retry_delay_minutes: number;
  };
  notification_preferences: {
    allow_user_unsubscribe: boolean;
    respect_quiet_hours: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
  };
  security_settings: {
    require_approval_for_bulk: boolean;
    max_recipients_without_approval: number;
  };
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject?: string;
  content: string;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  subject?: string;
  content?: string;
  is_active?: boolean;
}

export interface TestNotificationRequest {
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  test_users: string[];
  message?: string;
}

// ====================================================================
// CLASSE DO SERVIÇO
// ====================================================================

class NotificationService {
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
  // MÉTODOS DE ESTATÍSTICAS
  // ====================================================================

  /**
   * Obter estatísticas de notificações
   */
  async getStats(filters?: {
    period?: '24h' | '7d' | '30d';
    channels?: string[];
  }): Promise<NotificationStats> {
    const params = new URLSearchParams();

    if (filters?.period) {
      params.append('period', filters.period);
    }
    if (filters?.channels && filters.channels.length > 0) {
      params.append('channels', filters.channels.join(','));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/admin/notifications/stats?${queryString}`
      : '/api/admin/notifications/stats';

    return this.makeRequest<NotificationStats>(endpoint);
  }

  /**
   * Obter analytics avançados
   */
  async getAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<NotificationAnalytics> {
    return this.makeRequest<NotificationAnalytics>(`/api/admin/notifications/analytics?period=${period}`);
  }

  // ====================================================================
  // MÉTODOS DE NOTIFICAÇÕES EM MASSA
  // ====================================================================

  /**
   * Criar notificação em massa
   */
  async createBulkNotification(notification: BulkNotification): Promise<{
    id: string;
    estimated_recipients: number;
    scheduled_for: string;
  }> {
    const response = await this.makeRequest<{
      message: string;
      data: {
        id: string;
        estimated_recipients: number;
        scheduled_for: string;
      };
    }>('/api/admin/notifications/bulk', {
      method: 'POST',
      body: JSON.stringify(notification)
    });
    return response.data;
  }

  /**
   * Obter histórico de notificações em massa
   */
  async getBulkNotifications(filters?: {
    status?: 'pending' | 'sent' | 'failed';
    page?: number;
    limit?: number;
  }): Promise<{
    notifications: Array<{
      id: string;
      title: string;
      status: string;
      recipients_count: number;
      sent_at: string;
      channels: string[];
    }>;
    total: number;
    page: number;
    pages: number;
  }> {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/admin/notifications/bulk?${queryString}`
      : '/api/admin/notifications/bulk';

    return this.makeRequest(endpoint);
  }

  // ====================================================================
  // MÉTODOS DE TEMPLATES
  // ====================================================================

  /**
   * Listar templates de notificação
   */
  async getTemplates(filters?: {
    type?: 'email' | 'sms' | 'push' | 'in_app';
    active?: boolean;
  }): Promise<NotificationTemplate[]> {
    const params = new URLSearchParams();

    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.active !== undefined) {
      params.append('active', filters.active.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/admin/notifications/templates?${queryString}`
      : '/api/admin/notifications/templates';

    return this.makeRequest<NotificationTemplate[]>(endpoint);
  }

  /**
   * Criar novo template
   */
  async createTemplate(template: CreateTemplateRequest): Promise<NotificationTemplate> {
    const response = await this.makeRequest<{
      message: string;
      data: NotificationTemplate;
    }>('/api/admin/notifications/templates', {
      method: 'POST',
      body: JSON.stringify(template)
    });
    return response.data;
  }

  /**
   * Atualizar template
   */
  async updateTemplate(id: string, updates: UpdateTemplateRequest): Promise<NotificationTemplate> {
    const response = await this.makeRequest<{
      message: string;
      data: NotificationTemplate;
    }>(`/api/admin/notifications/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  /**
   * Deletar template
   */
  async deleteTemplate(id: string): Promise<void> {
    await this.makeRequest(`/api/admin/notifications/templates/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Duplicar template
   */
  async duplicateTemplate(id: string, newName: string): Promise<NotificationTemplate> {
    const response = await this.makeRequest<{
      message: string;
      data: NotificationTemplate;
    }>(`/api/admin/notifications/templates/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name: newName })
    });
    return response.data;
  }

  // ====================================================================
  // MÉTODOS DE CONFIGURAÇÃO
  // ====================================================================

  /**
   * Obter configurações do sistema de notificações
   */
  async getConfig(): Promise<NotificationConfig> {
    return this.makeRequest<NotificationConfig>('/api/admin/notifications/config');
  }

  /**
   * Atualizar configurações
   */
  async updateConfig(config: Partial<NotificationConfig>): Promise<NotificationConfig> {
    const response = await this.makeRequest<{
      message: string;
      data: NotificationConfig;
    }>('/api/admin/notifications/config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
    return response.data;
  }

  // ====================================================================
  // MÉTODOS DE TESTE
  // ====================================================================

  /**
   * Enviar notificação de teste
   */
  async sendTestNotification(testData: TestNotificationRequest): Promise<{
    results: Array<{
      channel: string;
      user: string;
      status: 'success' | 'failed';
      message?: string;
    }>;
  }> {
    const response = await this.makeRequest<{
      message: string;
      data: {
        results: Array<{
          channel: string;
          user: string;
          status: 'success' | 'failed';
          message?: string;
        }>;
      };
    }>('/api/admin/notifications/test', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
    return response.data;
  }

  // ====================================================================
  // MÉTODOS AUXILIARES
  // ====================================================================

  /**
   * Validar template antes de salvar
   */
  validateTemplate(template: CreateTemplateRequest | UpdateTemplateRequest): string[] {
    const errors: string[] = [];

    if ('name' in template && (!template.name || template.name.trim().length < 3)) {
      errors.push('Nome do template deve ter pelo menos 3 caracteres');
    }

    if ('content' in template && (!template.content || template.content.trim().length < 10)) {
      errors.push('Conteúdo do template deve ter pelo menos 10 caracteres');
    }

    if ('type' in template && template.type === 'email' && 'subject' in template && (!template.subject || template.subject.trim().length < 3)) {
      errors.push('Assunto do email deve ter pelo menos 3 caracteres');
    }

    return errors;
  }

  /**
   * Validar notificação em massa
   */
  validateBulkNotification(notification: BulkNotification): string[] {
    const errors: string[] = [];

    if (!notification.title || notification.title.trim().length < 3) {
      errors.push('Título deve ter pelo menos 3 caracteres');
    }

    if (!notification.message || notification.message.trim().length < 10) {
      errors.push('Mensagem deve ter pelo menos 10 caracteres');
    }

    if (!notification.channels || notification.channels.length === 0) {
      errors.push('Selecione pelo menos um canal de envio');
    }

    if (!notification.target_audience || (
      !notification.target_audience.all_users &&
      (!notification.target_audience.specific_tenants || notification.target_audience.specific_tenants.length === 0) &&
      (!notification.target_audience.user_roles || notification.target_audience.user_roles.length === 0) &&
      (!notification.target_audience.user_ids || notification.target_audience.user_ids.length === 0)
    )) {
      errors.push('Defina o público-alvo da notificação');
    }

    if (notification.scheduled_for) {
      const scheduledDate = new Date(notification.scheduled_for);
      if (scheduledDate <= new Date()) {
        errors.push('Data de agendamento deve ser no futuro');
      }
    }

    return errors;
  }

  /**
   * Extrair variáveis de um template
   */
  extractVariables(content: string): string[] {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Formatar estatísticas para exibição
   */
  formatStats(stats: NotificationStats) {
    return {
      ...stats,
      delivery_rate_formatted: (stats.delivery_rate * 100).toFixed(1) + '%',
      open_rate_formatted: (stats.open_rate * 100).toFixed(1) + '%',
      click_rate_formatted: (stats.click_rate * 100).toFixed(1) + '%'
    };
  }

  /**
   * Calcular estimativa de recipientes
   */
  estimateRecipients(targetAudience: BulkNotification['target_audience']): Promise<number> {
    return this.makeRequest<{ estimated_count: number }>('/api/admin/notifications/estimate-recipients', {
      method: 'POST',
      body: JSON.stringify({ target_audience: targetAudience })
    }).then(response => response.estimated_count);
  }

  /**
   * Obter canais disponíveis e suas configurações
   */
  async getAvailableChannels(): Promise<Array<{
    id: string;
    name: string;
    enabled: boolean;
    rate_limit: number;
    health_status: 'healthy' | 'warning' | 'error';
  }>> {
    return this.makeRequest<Array<{
      id: string;
      name: string;
      enabled: boolean;
      rate_limit: number;
      health_status: 'healthy' | 'warning' | 'error';
    }>>('/api/admin/notifications/channels');
  }
}

// ====================================================================
// INSTÂNCIA SINGLETON DO SERVIÇO
// ====================================================================

export const notificationService = new NotificationService();
export default notificationService;