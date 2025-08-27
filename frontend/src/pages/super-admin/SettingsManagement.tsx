import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Shield,
  Bell,
  Mail,
  Database,
  Key,
  Palette,
  Code,
  Users,
  Building2,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';
import { 
  SuperAdminLayout,
  SuperAdminHeader,
  SuperAdminContent,
  SuperAdminSection
} from "@/components/super-admin/SuperAdminDesignSystem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

interface SystemConfig {
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

interface FeatureFlag {
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

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'revoked';
  created_at: string;
  last_used: string;
  expires_at?: string;
}

// ====================================================================
// DADOS MOCK PARA DEMONSTRAÇÃO
// ====================================================================

const mockSystemConfig: SystemConfig = {
  general: {
    platform_name: 'DigiUrban',
    company_name: 'DigiUrban Soluções Tecnológicas',
    support_email: 'support@digiurban.com',
    maintenance_mode: false,
    debug_mode: false,
    analytics_enabled: true,
    default_timezone: 'America/Sao_Paulo',
    default_language: 'pt-BR'
  },
  security: {
    password_min_length: 8,
    password_require_symbols: true,
    password_require_numbers: true,
    max_login_attempts: 5,
    session_timeout: 1440, // minutos
    two_factor_enabled: true,
    ip_whitelist_enabled: false,
    rate_limiting_enabled: true
  },
  notifications: {
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    system_alerts: true,
    maintenance_notices: true,
    billing_reminders: true
  },
  integrations: {
    smtp_server: 'smtp.digiurban.com',
    smtp_port: 587,
    smtp_username: 'noreply@digiurban.com',
    smtp_password: '••••••••••••',
    sms_provider: 'twilio',
    sms_api_key: '••••••••••••',
    payment_gateway: 'stripe',
    payment_api_key: '••••••••••••'
  },
  appearance: {
    primary_color: '#3b82f6',
    secondary_color: '#8b5cf6',
    logo_url: '/logo-digiurban.png',
    favicon_url: '/favicon.ico',
    custom_css: '/* CSS personalizado */',
    white_label: false
  },
  features: {
    multi_tenancy: true,
    advanced_analytics: true,
    custom_domains: false,
    api_access: true,
    white_labeling: false,
    sso_integration: true
  }
};

const mockFeatureFlags: FeatureFlag[] = [
  {
    id: '1',
    name: 'New Dashboard UI',
    description: 'Interface redesenhada do dashboard principal',
    enabled: true,
    rollout_percentage: 25,
    target_tenants: ['SP-001', 'SP-002'],
    environment: 'production',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-05T12:30:00Z'
  },
  {
    id: '2',
    name: 'Advanced Reports',
    description: 'Relatórios avançados com BI integrado',
    enabled: false,
    rollout_percentage: 0,
    target_tenants: [],
    environment: 'development',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  },
  {
    id: '3',
    name: 'Mobile App Beta',
    description: 'Versão beta do aplicativo mobile',
    enabled: true,
    rollout_percentage: 100,
    target_tenants: [],
    environment: 'staging',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-07T16:45:00Z'
  }
];

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'pk_live_••••••••••••••••••••••••••••••••',
    permissions: ['read', 'write', 'admin'],
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    last_used: '2024-01-08T14:30:00Z'
  },
  {
    id: '2',
    name: 'Analytics Integration',
    key: 'pk_analytics_••••••••••••••••••••••••••••',
    permissions: ['read'],
    status: 'active',
    created_at: '2024-01-05T00:00:00Z',
    last_used: '2024-01-08T10:15:00Z',
    expires_at: '2024-12-31T23:59:59Z'
  },
  {
    id: '3',
    name: 'Legacy Integration',
    key: 'pk_legacy_••••••••••••••••••••••••••••••',
    permissions: ['read'],
    status: 'inactive',
    created_at: '2023-06-01T00:00:00Z',
    last_used: '2023-12-15T09:20:00Z'
  }
];

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const SettingsManagement: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>(mockSystemConfig);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(mockFeatureFlags);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswords, setShowPasswords] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // ====================================================================
  // FUNÇÕES DE MANIPULAÇÃO
  // ====================================================================

  const updateConfig = (section: keyof SystemConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const saveConfiguration = async () => {
    setLoading(true);
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUnsavedChanges(false);
    setLoading(false);
  };

  const toggleFeatureFlag = (flagId: string) => {
    setFeatureFlags(prev => prev.map(flag =>
      flag.id === flagId ? { ...flag, enabled: !flag.enabled, updated_at: new Date().toISOString() } : flag
    ));
  };

  const revokeApiKey = (keyId: string) => {
    if (window.confirm('Tem certeza que deseja revogar esta API key?')) {
      setApiKeys(prev => prev.map(key =>
        key.id === keyId ? { ...key, status: 'revoked' as const } : key
      ));
    }
  };

  // ====================================================================
  // RENDER PRINCIPAL
  // ====================================================================

  return (
    <SuperAdminLayout>
      <SuperAdminHeader 
        title="Centro de Configurações"
        subtitle="Configurações globais e administração da plataforma"
        icon={Settings}
        badges={unsavedChanges ? [
          { text: "Alterações não salvas", variant: "warning" }
        ] : []}
        actions={[
          {
            text: "Salvar Configurações",
            variant: "default",
            icon: loading ? RefreshCw : Save,
            onClick: saveConfiguration,
            disabled: !unsavedChanges || loading,
            loading: loading
          },
          {
            text: "Exportar",
            variant: "outline",
            icon: Download,
            onClick: () => {}
          }
        ]}
      />

      <SuperAdminContent>
        {/* Tabs de Navegação */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {[
          { id: 'general', label: 'Geral', icon: <Settings className="h-4 w-4" /> },
          { id: 'security', label: 'Segurança', icon: <Shield className="h-4 w-4" /> },
          { id: 'notifications', label: 'Notificações', icon: <Bell className="h-4 w-4" /> },
          { id: 'integrations', label: 'Integrações', icon: <Globe className="h-4 w-4" /> },
          { id: 'appearance', label: 'Aparência', icon: <Palette className="h-4 w-4" /> },
          { id: 'features', label: 'Recursos', icon: <Code className="h-4 w-4" /> },
          { id: 'api', label: 'API Keys', icon: <Key className="h-4 w-4" /> }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Configurações básicas da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Plataforma</label>
                <Input
                  value={config.general.platform_name}
                  onChange={(e) => updateConfig('general', 'platform_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Empresa</label>
                <Input
                  value={config.general.company_name}
                  onChange={(e) => updateConfig('general', 'company_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email de Suporte</label>
                <Input
                  type="email"
                  value={config.general.support_email}
                  onChange={(e) => updateConfig('general', 'support_email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone Padrão</label>
                <select 
                  value={config.general.default_timezone}
                  onChange={(e) => updateConfig('general', 'default_timezone', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="America/Sao_Paulo">América/São Paulo</option>
                  <option value="America/New_York">América/Nova York</option>
                  <option value="Europe/London">Europa/Londres</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Opções do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Modo de Manutenção</p>
                    <p className="text-sm text-gray-600">Suspende acesso de usuários</p>
                  </div>
                  <Switch
                    checked={config.general.maintenance_mode}
                    onCheckedChange={(checked) => updateConfig('general', 'maintenance_mode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Modo Debug</p>
                    <p className="text-sm text-gray-600">Ativa logs detalhados</p>
                  </div>
                  <Switch
                    checked={config.general.debug_mode}
                    onCheckedChange={(checked) => updateConfig('general', 'debug_mode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-gray-600">Coleta dados de uso</p>
                  </div>
                  <Switch
                    checked={config.general.analytics_enabled}
                    onCheckedChange={(checked) => updateConfig('general', 'analytics_enabled', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurações de Segurança
            </CardTitle>
            <CardDescription>
              Políticas de segurança e autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Comprimento Mínimo da Senha</label>
                <Input
                  type="number"
                  value={config.security.password_min_length}
                  onChange={(e) => updateConfig('security', 'password_min_length', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Máximo de Tentativas de Login</label>
                <Input
                  type="number"
                  value={config.security.max_login_attempts}
                  onChange={(e) => updateConfig('security', 'max_login_attempts', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeout de Sessão (minutos)</label>
                <Input
                  type="number"
                  value={config.security.session_timeout}
                  onChange={(e) => updateConfig('security', 'session_timeout', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Políticas de Senha</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Exigir Símbolos</p>
                    <p className="text-sm text-gray-600">Força uso de caracteres especiais</p>
                  </div>
                  <Switch
                    checked={config.security.password_require_symbols}
                    onCheckedChange={(checked) => updateConfig('security', 'password_require_symbols', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Exigir Números</p>
                    <p className="text-sm text-gray-600">Força uso de dígitos</p>
                  </div>
                  <Switch
                    checked={config.security.password_require_numbers}
                    onCheckedChange={(checked) => updateConfig('security', 'password_require_numbers', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Autenticação de dois fatores</p>
                  </div>
                  <Switch
                    checked={config.security.two_factor_enabled}
                    onCheckedChange={(checked) => updateConfig('security', 'two_factor_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Rate Limiting</p>
                    <p className="text-sm text-gray-600">Limite de requisições por IP</p>
                  </div>
                  <Switch
                    checked={config.security.rate_limiting_enabled}
                    onCheckedChange={(checked) => updateConfig('security', 'rate_limiting_enabled', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'features' && (
        <div className="space-y-6">
          {/* Feature Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Controle de recursos e funcionalidades por ambiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureFlags.map((flag) => (
                  <Card key={flag.id} className="bg-gradient-to-r from-white to-gray-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{flag.name}</h3>
                              <Badge variant={flag.environment === 'production' ? 'default' : 'secondary'}>
                                {flag.environment}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{flag.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Rollout: {flag.rollout_percentage}%</span>
                              {flag.target_tenants.length > 0 && (
                                <span>Tenants: {flag.target_tenants.join(', ')}</span>
                              )}
                              <span>Atualizado: {new Date(flag.updated_at).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={flag.enabled}
                            onCheckedChange={() => toggleFeatureFlag(flag.id)}
                          />
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recursos da Plataforma */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos da Plataforma</CardTitle>
              <CardDescription>
                Habilitação de funcionalidades principais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Multi-Tenancy</p>
                    <p className="text-sm text-gray-600">Isolamento de dados por cliente</p>
                  </div>
                  <Switch
                    checked={config.features.multi_tenancy}
                    onCheckedChange={(checked) => updateConfig('features', 'multi_tenancy', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Analytics Avançados</p>
                    <p className="text-sm text-gray-600">BI e relatórios complexos</p>
                  </div>
                  <Switch
                    checked={config.features.advanced_analytics}
                    onCheckedChange={(checked) => updateConfig('features', 'advanced_analytics', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Domínios Personalizados</p>
                    <p className="text-sm text-gray-600">URLs customizadas por cliente</p>
                  </div>
                  <Switch
                    checked={config.features.custom_domains}
                    onCheckedChange={(checked) => updateConfig('features', 'custom_domains', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Acesso à API</p>
                    <p className="text-sm text-gray-600">API REST para integrações</p>
                  </div>
                  <Switch
                    checked={config.features.api_access}
                    onCheckedChange={(checked) => updateConfig('features', 'api_access', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'api' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Gerenciamento de API Keys
            </CardTitle>
            <CardDescription>
              Controle de acesso às APIs da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova API Key
              </Button>
              
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id} className="bg-gradient-to-r from-white to-gray-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Key className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{apiKey.name}</h3>
                          <div className="flex items-center gap-2 text-sm font-mono bg-gray-100 rounded px-2 py-1 mt-1">
                            <span>{apiKey.key}</span>
                            <Button size="sm" variant="ghost" className="h-4 w-4 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>Criado: {new Date(apiKey.created_at).toLocaleDateString('pt-BR')}</span>
                            <span>Último uso: {new Date(apiKey.last_used).toLocaleDateString('pt-BR')}</span>
                            {apiKey.expires_at && (
                              <span>Expira: {new Date(apiKey.expires_at).toLocaleDateString('pt-BR')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <Badge className={
                            apiKey.status === 'active' ? 'bg-green-100 text-green-800' :
                            apiKey.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {apiKey.status}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {apiKey.permissions.join(', ')}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {apiKey.status !== 'revoked' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600"
                              onClick={() => revokeApiKey(apiKey.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </SuperAdminContent>
    </SuperAdminLayout>
  );
};

export default SettingsManagement;