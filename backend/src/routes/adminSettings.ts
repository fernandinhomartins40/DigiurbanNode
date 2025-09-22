// ====================================================================
// 🔧 ADMIN SETTINGS ROUTES - FASE 2 IMPLEMENTATION
// ====================================================================
// Rotas para gerenciamento de configurações do sistema
// APIs completas para SystemConfig, FeatureFlags e API Keys
// ====================================================================

import { Router, Request, Response } from 'express';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';
import { logger } from '../config/logger.js';
import { randomBytes } from 'crypto';

const router = Router();

// Aplicar middleware de autenticação e validação
router.use(authenticateToken);
router.use(requireSuperAdmin);

// ====================================================================
// INTERFACES
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
// DADOS PADRÃO E SIMULAÇÃO DE PERSISTÊNCIA
// ====================================================================

// Configuração padrão do sistema
const defaultSystemConfig: SystemConfig = {
  general: {
    platform_name: 'DigiUrban',
    company_name: 'DigiUrban Soluções Tecnológicas',
    support_email: 'support@digiurban.com',
    maintenance_mode: false,
    debug_mode: process.env.NODE_ENV === 'development',
    analytics_enabled: true,
    default_timezone: 'America/Sao_Paulo',
    default_language: 'pt-BR'
  },
  security: {
    password_min_length: 8,
    password_require_symbols: true,
    password_require_numbers: true,
    max_login_attempts: 5,
    session_timeout: 1440,
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
    smtp_server: process.env.SMTP_HOST || '',
    smtp_port: parseInt(process.env.SMTP_PORT || '587'),
    smtp_username: process.env.SMTP_USER || '',
    smtp_password: process.env.SMTP_PASS || '',
    sms_provider: 'twilio',
    sms_api_key: process.env.SMS_API_KEY || '',
    payment_gateway: 'stripe',
    payment_api_key: process.env.PAYMENT_API_KEY || ''
  },
  appearance: {
    primary_color: '#3b82f6',
    secondary_color: '#8b5cf6',
    logo_url: '/logo-digiurban.png',
    favicon_url: '/favicon.ico',
    custom_css: '',
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

// Simulação de armazenamento em memória (em produção seria banco de dados)
let systemConfig: SystemConfig = { ...defaultSystemConfig };

let featureFlags: FeatureFlag[] = [
  {
    id: 'dashboard-v2',
    name: 'Dashboard V2',
    description: 'Nova interface do dashboard com widgets avançados',
    enabled: true,
    rollout_percentage: 50,
    target_tenants: [],
    environment: 'production',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'advanced-reports',
    name: 'Relatórios Avançados',
    description: 'Sistema de relatórios com BI integrado',
    enabled: false,
    rollout_percentage: 0,
    target_tenants: [],
    environment: 'development',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let apiKeys: ApiKey[] = [
  {
    id: 'api-key-1',
    name: 'Sistema Principal',
    key: 'pk_live_' + randomBytes(16).toString('hex'),
    permissions: ['read', 'write', 'admin'],
    status: 'active',
    created_at: new Date().toISOString(),
    last_used: new Date().toISOString()
  }
];

// ====================================================================
// UTILITÁRIOS
// ====================================================================

const maskSensitiveData = (config: SystemConfig): SystemConfig => {
  return {
    ...config,
    integrations: {
      ...config.integrations,
      smtp_password: config.integrations.smtp_password ? '••••••••••••' : '',
      sms_api_key: config.integrations.sms_api_key ? '••••••••••••' : '',
      payment_api_key: config.integrations.payment_api_key ? '••••••••••••' : ''
    }
  };
};

const maskApiKey = (key: string): string => {
  if (key.length <= 8) return key;
  return key.substring(0, 8) + '••••••••••••••••••••••••••••';
};

// ====================================================================
// ROTAS DE CONFIGURAÇÃO DO SISTEMA
// ====================================================================

/**
 * GET /api/admin/settings/system-config
 * Obter configuração atual do sistema
 */
router.get('/system-config', async (req: Request, res: Response) => {
  try {
    logger.info('Super admin obtendo configuração do sistema', {
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    // Mascarar dados sensíveis
    const maskedConfig = maskSensitiveData(systemConfig);

    res.json({
      success: true,
      data: maskedConfig,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao obter configuração do sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/admin/settings/system-config
 * Atualizar configuração do sistema
 */
router.put('/system-config', async (req: Request, res: Response) => {
  try {
    const updatedConfig = req.body as SystemConfig;

    logger.info('Super admin atualizando configuração do sistema', {
      userId: req.user?.id,
      sections: Object.keys(updatedConfig),
      timestamp: new Date().toISOString()
    });

    // Validações específicas
    if (updatedConfig.security?.password_min_length && updatedConfig.security.password_min_length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Tamanho mínimo da senha deve ser pelo menos 6 caracteres'
      });
    }

    if (updatedConfig.security?.max_login_attempts && updatedConfig.security.max_login_attempts < 3) {
      return res.status(400).json({
        success: false,
        error: 'Máximo de tentativas de login deve ser pelo menos 3'
      });
    }

    // Preservar senhas existentes se não foram fornecidas
    if (updatedConfig.integrations) {
      if (!updatedConfig.integrations.smtp_password || updatedConfig.integrations.smtp_password === '••••••••••••') {
        updatedConfig.integrations.smtp_password = systemConfig.integrations.smtp_password;
      }
      if (!updatedConfig.integrations.sms_api_key || updatedConfig.integrations.sms_api_key === '••••••••••••') {
        updatedConfig.integrations.sms_api_key = systemConfig.integrations.sms_api_key;
      }
      if (!updatedConfig.integrations.payment_api_key || updatedConfig.integrations.payment_api_key === '••••••••••••') {
        updatedConfig.integrations.payment_api_key = systemConfig.integrations.payment_api_key;
      }
    }

    // Atualizar configuração
    systemConfig = { ...systemConfig, ...updatedConfig };

    // Log de auditoria
    logger.info('Configuração do sistema atualizada com sucesso', {
      userId: req.user?.id,
      changes: Object.keys(updatedConfig),
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Configuração atualizada com sucesso',
      data: maskSensitiveData(systemConfig),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao atualizar configuração do sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ====================================================================
// ROTAS DE FEATURE FLAGS
// ====================================================================

/**
 * GET /api/admin/settings/feature-flags
 * Listar todos os feature flags
 */
router.get('/feature-flags', async (req: Request, res: Response) => {
  try {
    const { environment, enabled } = req.query;

    let filteredFlags = [...featureFlags];

    if (environment) {
      filteredFlags = filteredFlags.filter(flag => flag.environment === environment);
    }

    if (enabled !== undefined) {
      const isEnabled = enabled === 'true';
      filteredFlags = filteredFlags.filter(flag => flag.enabled === isEnabled);
    }

    res.json({
      success: true,
      data: filteredFlags,
      total: filteredFlags.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao obter feature flags:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/admin/settings/feature-flags
 * Criar novo feature flag
 */
router.post('/feature-flags', async (req: Request, res: Response) => {
  try {
    const { name, description, environment, target_tenants = [] } = req.body;

    if (!name || !description || !environment) {
      return res.status(400).json({
        success: false,
        error: 'Nome, descrição e ambiente são obrigatórios'
      });
    }

    const newFlag: FeatureFlag = {
      id: `flag-${Date.now()}`,
      name,
      description,
      enabled: false,
      rollout_percentage: 0,
      target_tenants,
      environment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    featureFlags.push(newFlag);

    logger.info('Novo feature flag criado', {
      userId: req.user?.id,
      flagId: newFlag.id,
      name: newFlag.name,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Feature flag criado com sucesso',
      data: newFlag,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao criar feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/admin/settings/feature-flags/:id
 * Atualizar feature flag
 */
router.put('/feature-flags/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const flagIndex = featureFlags.findIndex(flag => flag.id === id);
    if (flagIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Feature flag não encontrado'
      });
    }

    featureFlags[flagIndex] = {
      ...featureFlags[flagIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    logger.info('Feature flag atualizado', {
      userId: req.user?.id,
      flagId: id,
      updates: Object.keys(updates),
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Feature flag atualizado com sucesso',
      data: featureFlags[flagIndex],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao atualizar feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/admin/settings/feature-flags/:id
 * Deletar feature flag
 */
router.delete('/feature-flags/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const flagIndex = featureFlags.findIndex(flag => flag.id === id);
    if (flagIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Feature flag não encontrado'
      });
    }

    const deletedFlag = featureFlags.splice(flagIndex, 1)[0];

    logger.info('Feature flag deletado', {
      userId: req.user?.id,
      flagId: id,
      name: deletedFlag.name,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Feature flag deletado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao deletar feature flag:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ====================================================================
// ROTAS DE API KEYS
// ====================================================================

/**
 * GET /api/admin/settings/api-keys
 * Listar todas as API keys
 */
router.get('/api-keys', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let filteredKeys = [...apiKeys];

    if (status) {
      filteredKeys = filteredKeys.filter(key => key.status === status);
    }

    // Mascarar chaves
    const maskedKeys = filteredKeys.map(key => ({
      ...key,
      key: maskApiKey(key.key)
    }));

    res.json({
      success: true,
      data: maskedKeys,
      total: maskedKeys.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao obter API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/admin/settings/api-keys
 * Criar nova API key
 */
router.post('/api-keys', async (req: Request, res: Response) => {
  try {
    const { name, permissions = ['read'], expires_at } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nome é obrigatório'
      });
    }

    const newApiKey: ApiKey = {
      id: `key-${Date.now()}`,
      name,
      key: `pk_${Date.now()}_${randomBytes(16).toString('hex')}`,
      permissions,
      status: 'active',
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
      ...(expires_at && { expires_at })
    };

    apiKeys.push(newApiKey);

    logger.info('Nova API key criada', {
      userId: req.user?.id,
      keyId: newApiKey.id,
      name: newApiKey.name,
      permissions: newApiKey.permissions,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'API key criada com sucesso',
      data: {
        ...newApiKey,
        key: maskApiKey(newApiKey.key)
      },
      full_key: newApiKey.key, // Mostrar chave completa apenas na criação
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao criar API key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/admin/settings/api-keys/:id/revoke
 * Revogar API key
 */
router.put('/api-keys/:id/revoke', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const keyIndex = apiKeys.findIndex(key => key.id === id);
    if (keyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'API key não encontrada'
      });
    }

    apiKeys[keyIndex].status = 'revoked';

    logger.info('API key revogada', {
      userId: req.user?.id,
      keyId: id,
      name: apiKeys[keyIndex].name,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'API key revogada com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao revogar API key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/admin/settings/api-keys/:id
 * Deletar API key
 */
router.delete('/api-keys/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const keyIndex = apiKeys.findIndex(key => key.id === id);
    if (keyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'API key não encontrada'
      });
    }

    const deletedKey = apiKeys.splice(keyIndex, 1)[0];

    logger.info('API key deletada', {
      userId: req.user?.id,
      keyId: id,
      name: deletedKey.name,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'API key deletada com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao deletar API key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ====================================================================
// ROTAS DE RESET E BACKUP
// ====================================================================

/**
 * POST /api/admin/settings/reset-to-defaults
 * Resetar configurações para os padrões
 */
router.post('/reset-to-defaults', async (req: Request, res: Response) => {
  try {
    const { confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({
        success: false,
        error: 'Confirmação é obrigatória para resetar configurações'
      });
    }

    systemConfig = { ...defaultSystemConfig };

    logger.warn('Sistema resetado para configurações padrão', {
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Configurações resetadas para os padrões',
      data: maskSensitiveData(systemConfig),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao resetar configurações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/admin/settings/export
 * Exportar configurações atuais
 */
router.get('/export', async (req: Request, res: Response) => {
  try {
    const exportData = {
      systemConfig: maskSensitiveData(systemConfig),
      featureFlags,
      apiKeys: apiKeys.map(key => ({
        ...key,
        key: maskApiKey(key.key)
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    logger.info('Configurações exportadas', {
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: exportData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao exportar configurações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export { router as adminSettingsRoutes };