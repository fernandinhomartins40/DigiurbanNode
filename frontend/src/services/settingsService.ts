// ====================================================================
// ⚙️ SETTINGS SERVICE - FRONTEND INTEGRATION
// ====================================================================
// Serviço para comunicação com as APIs de configurações do sistema
// Integração completa com backend para SystemConfig, FeatureFlags e API Keys
// ====================================================================

import { SimpleTokenManager } from '../lib/tokenRotation-simple';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ====================================================================
// INTERFACES PARA CONFIGURAÇÕES
// ====================================================================

export interface SystemConfig {
  general: {
    platform_name: string;
    company_name: string;
    support_email: string;
    maintenance_mode: boolean;
    debug_mode: boolean;
    analytics_enabled: boolean;
    default_timezone: string;
    default_language: string;
  };
  security: {
    password_min_length: number;
    password_require_symbols: boolean;
    password_require_numbers: boolean;
    max_login_attempts: number;
    session_timeout: number;
    two_factor_enabled: boolean;
    ip_whitelist_enabled: boolean;
    rate_limiting_enabled: boolean;
  };
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    system_alerts: boolean;
    maintenance_notices: boolean;
    billing_reminders: boolean;
  };
  integrations: {
    smtp_server: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    sms_provider: string;
    sms_api_key: string;
    payment_gateway: string;
    payment_api_key: string;
  };
  appearance: {
    primary_color: string;
    secondary_color: string;
    logo_url: string;
    favicon_url: string;
    custom_css: string;
    white_label: boolean;
  };
  features: {
    multi_tenancy: boolean;
    advanced_analytics: boolean;
    custom_domains: boolean;
    api_access: boolean;
    white_labeling: boolean;
    sso_integration: boolean;
  };
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  target_tenants: string[];
  environment: 'development' | 'staging' | 'production';
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'revoked';
  created_at: string;
  last_used: string;
  expires_at?: string;
}

export interface CreateFeatureFlagRequest {
  name: string;
  description: string;
  environment: 'development' | 'staging' | 'production';
  target_tenants?: string[];
}

export interface UpdateFeatureFlagRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
  rollout_percentage?: number;
  target_tenants?: string[];
  environment?: 'development' | 'staging' | 'production';
}

export interface CreateApiKeyRequest {
  name: string;
  permissions?: string[];
  expires_at?: string;
}

export interface ExportData {
  systemConfig: SystemConfig;
  featureFlags: FeatureFlag[];
  apiKeys: ApiKey[];
  exportedAt: string;
  version: string;
}

// ====================================================================
// CLASSE DO SERVIÇO
// ====================================================================

class SettingsService {
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
  // MÉTODOS DE CONFIGURAÇÃO DO SISTEMA
  // ====================================================================

  /**
   * Obter configuração atual do sistema
   */
  async getSystemConfig(): Promise<SystemConfig> {
    return this.makeRequest<SystemConfig>('/api/admin/settings/system-config');
  }

  /**
   * Atualizar configuração do sistema
   */
  async updateSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
    const response = await this.makeRequest<{ message: string; data: SystemConfig }>(
      '/api/admin/settings/system-config',
      {
        method: 'PUT',
        body: JSON.stringify(config)
      }
    );
    return response.data;
  }

  /**
   * Resetar configurações para os padrões
   */
  async resetToDefaults(): Promise<SystemConfig> {
    const response = await this.makeRequest<{ message: string; data: SystemConfig }>(
      '/api/admin/settings/reset-to-defaults',
      {
        method: 'POST',
        body: JSON.stringify({ confirm: true })
      }
    );
    return response.data;
  }

  // ====================================================================
  // MÉTODOS DE FEATURE FLAGS
  // ====================================================================

  /**
   * Listar todos os feature flags
   */
  async getFeatureFlags(filters?: {
    environment?: string;
    enabled?: boolean;
  }): Promise<FeatureFlag[]> {
    const params = new URLSearchParams();

    if (filters?.environment) {
      params.append('environment', filters.environment);
    }
    if (filters?.enabled !== undefined) {
      params.append('enabled', filters.enabled.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/admin/settings/feature-flags?${queryString}`
      : '/api/admin/settings/feature-flags';

    return this.makeRequest<FeatureFlag[]>(endpoint);
  }

  /**
   * Criar novo feature flag
   */
  async createFeatureFlag(data: CreateFeatureFlagRequest): Promise<FeatureFlag> {
    const response = await this.makeRequest<{ message: string; data: FeatureFlag }>(
      '/api/admin/settings/feature-flags',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    return response.data;
  }

  /**
   * Atualizar feature flag
   */
  async updateFeatureFlag(id: string, updates: UpdateFeatureFlagRequest): Promise<FeatureFlag> {
    const response = await this.makeRequest<{ message: string; data: FeatureFlag }>(
      `/api/admin/settings/feature-flags/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates)
      }
    );
    return response.data;
  }

  /**
   * Deletar feature flag
   */
  async deleteFeatureFlag(id: string): Promise<void> {
    await this.makeRequest(`/api/admin/settings/feature-flags/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Toggle feature flag (ativar/desativar)
   */
  async toggleFeatureFlag(id: string, enabled: boolean): Promise<FeatureFlag> {
    return this.updateFeatureFlag(id, { enabled });
  }

  // ====================================================================
  // MÉTODOS DE API KEYS
  // ====================================================================

  /**
   * Listar todas as API keys
   */
  async getApiKeys(filters?: {
    status?: 'active' | 'inactive' | 'revoked';
  }): Promise<ApiKey[]> {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append('status', filters.status);
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/admin/settings/api-keys?${queryString}`
      : '/api/admin/settings/api-keys';

    return this.makeRequest<ApiKey[]>(endpoint);
  }

  /**
   * Criar nova API key
   */
  async createApiKey(data: CreateApiKeyRequest): Promise<{
    apiKey: ApiKey;
    fullKey: string;
  }> {
    const response = await this.makeRequest<{
      message: string;
      data: ApiKey;
      full_key: string;
    }>('/api/admin/settings/api-keys', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    return {
      apiKey: response.data,
      fullKey: response.full_key
    };
  }

  /**
   * Revogar API key
   */
  async revokeApiKey(id: string): Promise<void> {
    await this.makeRequest(`/api/admin/settings/api-keys/${id}/revoke`, {
      method: 'PUT'
    });
  }

  /**
   * Deletar API key
   */
  async deleteApiKey(id: string): Promise<void> {
    await this.makeRequest(`/api/admin/settings/api-keys/${id}`, {
      method: 'DELETE'
    });
  }

  // ====================================================================
  // MÉTODOS DE EXPORTAÇÃO E BACKUP
  // ====================================================================

  /**
   * Exportar todas as configurações
   */
  async exportSettings(): Promise<ExportData> {
    return this.makeRequest<ExportData>('/api/admin/settings/export');
  }

  // ====================================================================
  // MÉTODOS AUXILIARES
  // ====================================================================

  /**
   * Validar configurações antes de salvar
   */
  validateSystemConfig(config: Partial<SystemConfig>): string[] {
    const errors: string[] = [];

    if (config.general?.support_email && !this.isValidEmail(config.general.support_email)) {
      errors.push('Email de suporte inválido');
    }

    if (config.security?.password_min_length && config.security.password_min_length < 6) {
      errors.push('Tamanho mínimo da senha deve ser pelo menos 6 caracteres');
    }

    if (config.security?.max_login_attempts && config.security.max_login_attempts < 3) {
      errors.push('Máximo de tentativas de login deve ser pelo menos 3');
    }

    if (config.security?.session_timeout && config.security.session_timeout < 15) {
      errors.push('Timeout da sessão deve ser pelo menos 15 minutos');
    }

    if (config.integrations?.smtp_port && (config.integrations.smtp_port < 1 || config.integrations.smtp_port > 65535)) {
      errors.push('Porta SMTP deve estar entre 1 e 65535');
    }

    return errors;
  }

  /**
   * Validar email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar cor hexadecimal
   */
  validateColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  /**
   * Gerar configuração de exemplo para testes
   */
  generateSampleConfig(): Partial<SystemConfig> {
    return {
      general: {
        platform_name: 'DigiUrban Test',
        company_name: 'DigiUrban Testes',
        support_email: 'test@digiurban.com',
        maintenance_mode: false,
        debug_mode: true,
        analytics_enabled: true,
        default_timezone: 'America/Sao_Paulo',
        default_language: 'pt-BR'
      },
      appearance: {
        primary_color: '#3b82f6',
        secondary_color: '#8b5cf6',
        logo_url: '/logo-test.png',
        favicon_url: '/favicon-test.ico',
        custom_css: '/* CSS de teste */',
        white_label: false
      }
    };
  }

  /**
   * Processar dados para exibição no componente
   */
  processConfigForDisplay(config: SystemConfig) {
    return {
      ...config,
      integrations: {
        ...config.integrations,
        // Garantir que senhas mascaradas sejam preservadas
        smtp_password: config.integrations.smtp_password === '••••••••••••'
          ? '••••••••••••'
          : config.integrations.smtp_password,
        sms_api_key: config.integrations.sms_api_key === '••••••••••••'
          ? '••••••••••••'
          : config.integrations.sms_api_key,
        payment_api_key: config.integrations.payment_api_key === '••••••••••••'
          ? '••••••••••••'
          : config.integrations.payment_api_key
      }
    };
  }

  /**
   * Formatar permissões de API key para exibição
   */
  formatPermissions(permissions: string[]): string {
    const permissionMap: Record<string, string> = {
      'read': 'Leitura',
      'write': 'Escrita',
      'admin': 'Administração',
      'delete': 'Exclusão'
    };

    return permissions
      .map(perm => permissionMap[perm] || perm)
      .join(', ');
  }

  /**
   * Calcular nível de segurança da configuração
   */
  calculateSecurityLevel(config: SystemConfig): {
    level: 'low' | 'medium' | 'high';
    score: number;
    recommendations: string[];
  } {
    let score = 0;
    const recommendations: string[] = [];

    // Verificar configurações de segurança
    if (config.security.password_min_length >= 12) {
      score += 20;
    } else if (config.security.password_min_length >= 8) {
      score += 10;
    } else {
      recommendations.push('Aumentar tamanho mínimo da senha para pelo menos 12 caracteres');
    }

    if (config.security.password_require_symbols && config.security.password_require_numbers) {
      score += 20;
    } else {
      recommendations.push('Exigir símbolos e números nas senhas');
    }

    if (config.security.two_factor_enabled) {
      score += 25;
    } else {
      recommendations.push('Ativar autenticação de dois fatores');
    }

    if (config.security.rate_limiting_enabled) {
      score += 15;
    } else {
      recommendations.push('Ativar limitação de taxa de requisições');
    }

    if (config.security.max_login_attempts <= 5) {
      score += 10;
    } else {
      recommendations.push('Reduzir máximo de tentativas de login para 5 ou menos');
    }

    if (config.security.session_timeout <= 480) { // 8 horas
      score += 10;
    } else {
      recommendations.push('Reduzir timeout da sessão para no máximo 8 horas');
    }

    // Determinar nível
    let level: 'low' | 'medium' | 'high';
    if (score >= 80) {
      level = 'high';
    } else if (score >= 50) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return { level, score, recommendations };
  }
}

// ====================================================================
// INSTÂNCIA SINGLETON DO SERVIÇO
// ====================================================================

export const settingsService = new SettingsService();
export default settingsService;