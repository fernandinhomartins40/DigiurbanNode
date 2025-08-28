// ====================================================================
// 🏢 HOOK DE GESTÃO DE TENANTS - SISTEMA SAAS
// Gerenciamento completo de prefeituras no sistema multi-tenant
// ====================================================================

import { useState, useEffect } from 'react';
import { APIClient } from "@/auth";

// Types
interface Tenant {
  id: string;
  nome: string;
  cnpj: string;
  codigo_municipio: string;
  uf: string;
  regiao: string;
  populacao: number;
  plano: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'ATIVO' | 'SUSPENSO' | 'CANCELADO' | 'TRIAL';
  data_criacao: string;
  data_expiracao: string | null;
  trial_ate: string | null;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  dominio_personalizado: string | null;
  prefeito_nome: string | null;
  prefeito_email: string | null;
  prefeito_telefone: string | null;
  usuarios_ativos: number;
  protocolos_mes_atual: number;
  storage_usado_gb: number;
  ultima_atividade: string;
}

interface TenantConfig {
  id: string;
  tenant_id: string;
  secretarias_ativas: string[];
  modulos_extras: string[];
  limite_usuarios: number;
  limite_protocolos_mes: number;
  limite_storage_gb: number;
  portal_transparencia: boolean;
  app_mobile_cidadao: boolean;
  bi_avancado: boolean;
  integracoes_federais: boolean;
  backup_automatico: boolean;
  notificacoes_email: boolean;
  auditoria_completa: boolean;
}

interface TenantSubscription {
  id: string;
  tenant_id: string;
  plano: string;
  valor_mensal: number;
  valor_anual: number | null;
  tipo_cobranca: 'MENSAL' | 'ANUAL';
  data_inicio: string;
  proxima_cobranca: string;
  status: 'ATIVA' | 'CANCELADA' | 'SUSPENSA' | 'VENCIDA';
  portal_transparencia: number;
  app_mobile: number;
  bi_avancado: number;
  integracoes_federais: number;
}

interface NewTenantData {
  nome: string;
  cnpj: string;
  codigo_municipio: string;
  uf: string;
  populacao: number;
  plano: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  prefeito_nome: string;
  prefeito_email: string;
  prefeito_telefone?: string;
  secretario_ti_email?: string;
}

export const useTenantManagement = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ====================================================================
  // 1. CARREGAR TENANTS
  // ====================================================================

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTenants(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
      console.error('Erro ao carregar tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // 2. CRIAR NOVO TENANT
  // ====================================================================

  const createTenant = async (tenantData: NewTenantData): Promise<{ success: boolean; tenant?: Tenant; message: string }> => {
    try {
      setError(null);

      // Determinar região baseada no UF
      const regiao = getRegiaoByUF(tenantData.uf);

      // Criar tenant
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert([{
          nome: tenantData.nome,
          cnpj: tenantData.cnpj,
          codigo_municipio: tenantData.codigo_municipio,
          uf: tenantData.uf,
          regiao,
          populacao: tenantData.populacao,
          plano: tenantData.plano,
          status: 'TRIAL',
          trial_ate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          prefeito_nome: tenantData.prefeito_nome,
          prefeito_email: tenantData.prefeito_email,
          prefeito_telefone: tenantData.prefeito_telefone,
          secretario_ti_email: tenantData.secretario_ti_email,
          dominio_personalizado: `${tenantData.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.digiurban.com.br`
        }])
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Configurar tenant automaticamente
      await setupTenantConfiguration(newTenant.id, tenantData.plano);
      
      // Criar assinatura
      await createTenantSubscription(newTenant.id, tenantData.plano);

      // Recarregar lista
      await loadTenants();

      return {
        success: true,
        tenant: newTenant,
        message: 'Prefeitura criada com sucesso! Trial de 30 dias ativado.'
      };

    } catch (err: Error | unknown) {
      setError(err.message);
      return {
        success: false,
        message: `Erro ao criar prefeitura: ${err.message}`
      };
    }
  };

  // ====================================================================
  // 3. CONFIGURAR TENANT AUTOMATICAMENTE
  // ====================================================================

  const setupTenantConfiguration = async (tenantId: string, plano: string) => {
    const secretariasConfig = {
      'STARTER': ['gabinete', 'saude', 'educacao'],
      'PROFESSIONAL': [
        'gabinete', 'saude', 'educacao', 'assistencia-social', 'meio-ambiente', 
        'planejamento-urbano', 'servicos-publicos', 'seguranca-publica', 
        'agricultura', 'turismo', 'esportes', 'cultura', 'habitacao'
      ],
      'ENTERPRISE': [
        'gabinete', 'saude', 'educacao', 'assistencia-social', 'meio-ambiente', 
        'planejamento-urbano', 'servicos-publicos', 'seguranca-publica', 
        'agricultura', 'turismo', 'esportes', 'cultura', 'habitacao'
      ]
    };

    const limites = {
      'STARTER': { usuarios: 10, protocolos: 1000, storage: 5 },
      'PROFESSIONAL': { usuarios: 999999, protocolos: 999999, storage: 50 },
      'ENTERPRISE': { usuarios: 999999, protocolos: 999999, storage: 999999 }
    };

    const { error } = await supabase
      .from('tenant_configuracoes')
      .insert([{
        tenant_id: tenantId,
        secretarias_ativas: secretariasConfig[plano as keyof typeof secretariasConfig],
        limite_usuarios: limites[plano as keyof typeof limites].usuarios,
        limite_protocolos_mes: limites[plano as keyof typeof limites].protocolos,
        limite_storage_gb: limites[plano as keyof typeof limites].storage,
        portal_transparencia: plano !== 'STARTER',
        app_mobile_cidadao: plano === 'ENTERPRISE',
        bi_avancado: plano === 'ENTERPRISE',
        integracoes_federais: plano === 'ENTERPRISE'
      }]);

    if (error) throw error;
  };

  // ====================================================================
  // 4. CRIAR ASSINATURA DO TENANT
  // ====================================================================

  const createTenantSubscription = async (tenantId: string, plano: string) => {
    const precos = {
      'STARTER': { mensal: 1997.00, anual: 19970.00 * 0.85 },
      'PROFESSIONAL': { mensal: 3997.00, anual: 39970.00 * 0.85 },
      'ENTERPRISE': { mensal: 7997.00, anual: 79970.00 * 0.85 }
    };

    const { error } = await supabase
      .from('tenant_assinaturas')
      .insert([{
        tenant_id: tenantId,
        plano,
        valor_mensal: precos[plano as keyof typeof precos].mensal,
        valor_anual: precos[plano as keyof typeof precos].anual,
        tipo_cobranca: 'MENSAL',
        proxima_cobranca: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        status: 'ATIVA'
      }]);

    if (error) throw error;
  };

  // ====================================================================
  // 5. ATUALIZAR STATUS DO TENANT
  // ====================================================================

  const updateTenantStatus = async (tenantId: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', tenantId);

      if (error) throw error;

      await loadTenants();
      return true;
    } catch (err: Error | unknown) {
      setError(err.message);
      return false;
    }
  };

  // ====================================================================
  // 6. ATUALIZAR PLANO DO TENANT
  // ====================================================================

  const upgradeTenantPlan = async (tenantId: string, newPlan: string): Promise<boolean> => {
    try {
      // Atualizar tenant
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({ plano: newPlan })
        .eq('id', tenantId);

      if (tenantError) throw tenantError;

      // Reconfigurar tenant
      await setupTenantConfiguration(tenantId, newPlan);

      // Atualizar assinatura
      const precos = {
        'STARTER': { mensal: 1997.00, anual: 19970.00 * 0.85 },
        'PROFESSIONAL': { mensal: 3997.00, anual: 39970.00 * 0.85 },
        'ENTERPRISE': { mensal: 7997.00, anual: 79970.00 * 0.85 }
      };

      const { error: subscriptionError } = await supabase
        .from('tenant_assinaturas')
        .update({
          plano: newPlan,
          valor_mensal: precos[newPlan as keyof typeof precos].mensal,
          valor_anual: precos[newPlan as keyof typeof precos].anual
        })
        .eq('tenant_id', tenantId)
        .eq('status', 'ATIVA');

      if (subscriptionError) throw subscriptionError;

      await loadTenants();
      return true;
    } catch (err: Error | unknown) {
      setError(err.message);
      return false;
    }
  };

  // ====================================================================
  // 7. CUSTOMIZAÇÃO DE TENANT
  // ====================================================================

  const updateTenantCustomization = async (
    tenantId: string, 
    customization: {
      logo_url?: string;
      cor_primaria?: string;
      cor_secundaria?: string;
      dominio_personalizado?: string;
    }
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update(customization)
        .eq('id', tenantId);

      if (error) throw error;

      await loadTenants();
      return true;
    } catch (err: Error | unknown) {
      setError(err.message);
      return false;
    }
  };

  // ====================================================================
  // 8. MÉTRICAS DO TENANT
  // ====================================================================

  const getTenantMetrics = async (tenantId: string, period: 'week' | 'month' | 'year' = 'month') => {
    try {
      const { data, error } = await supabase
        .from('tenant_metricas_uso')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('data_referencia', { ascending: false })
        .limit(period === 'week' ? 7 : period === 'month' ? 30 : 365);

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (err: Error | unknown) {
      return {
        success: false,
        message: err.message
      };
    }
  };

  // ====================================================================
  // 9. DASHBOARD DE TENANTS
  // ====================================================================

  const getDashboardData = async () => {
    try {
      // Contar tenants por status
      const { data: statusCount } = await supabase
        .from('tenants')
        .select('status')
        .order('status');

      // Contar tenants por plano
      const { data: planCount } = await supabase
        .from('tenants')
        .select('plano')
        .order('plano');

      // Receita total
      const { data: revenueData } = await supabase
        .from('tenant_assinaturas')
        .select('valor_mensal, status')
        .eq('status', 'ATIVA');

      // Processar dados
      const statusStats = statusCount?.reduce((acc: Record<string, unknown>, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const planStats = planCount?.reduce((acc: Record<string, unknown>, item) => {
        acc[item.plano] = (acc[item.plano] || 0) + 1;
        return acc;
      }, {}) || {};

      const monthlyRevenue = revenueData?.reduce((sum, item) => sum + item.valor_mensal, 0) || 0;

      return {
        success: true,
        data: {
          total_tenants: tenants.length,
          status_stats: statusStats,
          plan_stats: planStats,
          monthly_revenue: monthlyRevenue,
          annual_revenue_projection: monthlyRevenue * 12,
          growth_metrics: {
            new_this_month: statusStats['TRIAL'] || 0,
            active_paying: statusStats['ATIVO'] || 0,
            churned: statusStats['CANCELADO'] || 0
          }
        }
      };
    } catch (err: Error | unknown) {
      return {
        success: false,
        message: err.message
      };
    }
  };

  // ====================================================================
  // 10. FUNÇÕES AUXILIARES
  // ====================================================================

  const getRegiaoByUF = (uf: string): string => {
    const regioes: { [key: string]: string } = {
      'AC': 'NORTE', 'AP': 'NORTE', 'AM': 'NORTE', 'PA': 'NORTE', 'RO': 'NORTE', 'RR': 'NORTE', 'TO': 'NORTE',
      'AL': 'NORDESTE', 'BA': 'NORDESTE', 'CE': 'NORDESTE', 'MA': 'NORDESTE', 'PB': 'NORDESTE', 'PE': 'NORDESTE', 'PI': 'NORDESTE', 'RN': 'NORDESTE', 'SE': 'NORDESTE',
      'GO': 'CENTRO-OESTE', 'MT': 'CENTRO-OESTE', 'MS': 'CENTRO-OESTE', 'DF': 'CENTRO-OESTE',
      'ES': 'SUDESTE', 'MG': 'SUDESTE', 'RJ': 'SUDESTE', 'SP': 'SUDESTE',
      'PR': 'SUL', 'RS': 'SUL', 'SC': 'SUL'
    };
    return regioes[uf] || 'SUDESTE';
  };

  const validateCNPJ = (cnpj: string): boolean => {
    // Validação básica de CNPJ
    return /^\d{14}$/.test(cnpj.replace(/[^\d]/g, ''));
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // ====================================================================
  // EFEITOS E INICIALIZAÇÃO
  // ====================================================================

  useEffect(() => {
    loadTenants();
  }, []);

  return {
    // Estados
    tenants,
    currentTenant,
    tenantConfig,
    loading,
    error,

    // Ações principais
    createTenant,
    updateTenantStatus,
    upgradeTenantPlan,
    updateTenantCustomization,

    // Dados e métricas
    getTenantMetrics,
    getDashboardData,

    // Recarregar dados
    loadTenants,

    // Utilitários
    validateCNPJ,
    formatCurrency
  };
};