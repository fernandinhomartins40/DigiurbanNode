// ====================================================================
// 🎯 HOOK DE ONBOARDING AUTOMATIZADO - 7 DIAS
// Sistema completo de ativação para novas prefeituras
// ====================================================================

import { useState, useEffect } from 'react';
import { APIClient } from "@/auth";

// Types
interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  day: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  required: boolean;
  estimatedTime: number; // minutos
  category: 'SETUP' | 'CONFIGURATION' | 'TRAINING' | 'GO_LIVE';
}

interface OnboardingProgress {
  tenant_id: string;
  current_day: number;
  current_step: string;
  steps_completed: string[];
  total_progress: number; // percentual
  estimated_completion: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  started_at: string;
  completed_at: string | null;
  assigned_specialist: string | null;
}

interface WizardData {
  tenant_info: {
    logo_url?: string;
    cor_primaria?: string;
    cor_secundaria?: string;
    dominio_personalizado?: string;
  };
  admin_user: {
    nome: string;
    email: string;
    telefone?: string;
    cargo: string;
  };
  secretarias_ativas: string[];
  configuracoes_iniciais: any;
}

export const useOnboarding = () => {
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ====================================================================
  // 1. DEFINIÇÃO DOS PASSOS DO ONBOARDING
  // ====================================================================

  const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
    // DIA 1 - SETUP INICIAL
    {
      id: 'tenant_created',
      name: 'Prefeitura Cadastrada',
      description: 'Tenant criado automaticamente no sistema',
      day: 1,
      status: 'PENDING',
      required: true,
      estimatedTime: 0,
      category: 'SETUP'
    },
    {
      id: 'credentials_sent',
      name: 'Credenciais Enviadas',
      description: 'Email com link de acesso e credenciais temporárias',
      day: 1,
      status: 'PENDING',
      required: true,
      estimatedTime: 2,
      category: 'SETUP'
    },
    {
      id: 'first_login',
      name: 'Primeiro Acesso',
      description: 'Administrador realizou primeiro login no sistema',
      day: 1,
      status: 'PENDING',
      required: true,
      estimatedTime: 5,
      category: 'SETUP'
    },
    {
      id: 'password_changed',
      name: 'Senha Alterada',
      description: 'Senha temporária foi alterada por uma permanente',
      day: 1,
      status: 'PENDING',
      required: true,
      estimatedTime: 2,
      category: 'SETUP'
    },
    {
      id: 'tour_completed',
      name: 'Tour Guiado',
      description: 'Tour inicial pelas funcionalidades principais',
      day: 1,
      status: 'PENDING',
      required: false,
      estimatedTime: 15,
      category: 'SETUP'
    },

    // DIAS 2-3 - CONFIGURAÇÃO BÁSICA
    {
      id: 'wizard_started',
      name: 'Wizard de Configuração',
      description: 'Iniciou wizard de configuração personalizada',
      day: 2,
      status: 'PENDING',
      required: true,
      estimatedTime: 10,
      category: 'CONFIGURATION'
    },
    {
      id: 'logo_uploaded',
      name: 'Logo da Prefeitura',
      description: 'Upload e configuração da identidade visual',
      day: 2,
      status: 'PENDING',
      required: false,
      estimatedTime: 5,
      category: 'CONFIGURATION'
    },
    {
      id: 'colors_configured',
      name: 'Cores Personalizadas',
      description: 'Definição das cores institucionais',
      day: 2,
      status: 'PENDING',
      required: false,
      estimatedTime: 5,
      category: 'CONFIGURATION'
    },
    {
      id: 'admin_users_created',
      name: 'Usuários Administradores',
      description: 'Cadastro do prefeito e secretários principais',
      day: 2,
      status: 'PENDING',
      required: true,
      estimatedTime: 20,
      category: 'CONFIGURATION'
    },
    {
      id: 'departments_configured',
      name: 'Secretarias Ativadas',
      description: 'Seleção e ativação das secretarias do município',
      day: 3,
      status: 'PENDING',
      required: true,
      estimatedTime: 15,
      category: 'CONFIGURATION'
    },
    {
      id: 'basic_data_imported',
      name: 'Dados Básicos',
      description: 'Importação de dados iniciais via CSV',
      day: 3,
      status: 'PENDING',
      required: false,
      estimatedTime: 30,
      category: 'CONFIGURATION'
    },

    // DIAS 4-5 - TREINAMENTO
    {
      id: 'tutorial_videos_watched',
      name: 'Vídeos Tutoriais',
      description: 'Assistiu aos vídeos de treinamento essenciais',
      day: 4,
      status: 'PENDING',
      required: false,
      estimatedTime: 45,
      category: 'TRAINING'
    },
    {
      id: 'webinar_attended',
      name: 'Webinar de Onboarding',
      description: 'Participou do webinar semanal de treinamento',
      day: 4,
      status: 'PENDING',
      required: false,
      estimatedTime: 60,
      category: 'TRAINING'
    },
    {
      id: 'knowledge_base_accessed',
      name: 'Base de Conhecimento',
      description: 'Acessou e explorou a documentação',
      day: 4,
      status: 'PENDING',
      required: false,
      estimatedTime: 20,
      category: 'TRAINING'
    },
    {
      id: 'support_chat_used',
      name: 'Suporte Via Chat',
      description: 'Interagiu com suporte para esclarecer dúvidas',
      day: 5,
      status: 'PENDING',
      required: false,
      estimatedTime: 15,
      category: 'TRAINING'
    },
    {
      id: 'admin_certified',
      name: 'Certificação Básica',
      description: 'Completou certificação para administradores',
      day: 5,
      status: 'PENDING',
      required: false,
      estimatedTime: 30,
      category: 'TRAINING'
    },

    // DIAS 6-7 - GO-LIVE
    {
      id: 'go_live_checklist',
      name: 'Checklist Go-Live',
      description: 'Validou todos os itens do checklist',
      day: 6,
      status: 'PENDING',
      required: true,
      estimatedTime: 20,
      category: 'GO_LIVE'
    },
    {
      id: 'functionality_tests',
      name: 'Testes de Funcionalidades',
      description: 'Testou funcionalidades críticas do sistema',
      day: 6,
      status: 'PENDING',
      required: true,
      estimatedTime: 45,
      category: 'GO_LIVE'
    },
    {
      id: 'final_data_migration',
      name: 'Migração Final',
      description: 'Migração completa dos dados existentes',
      day: 6,
      status: 'PENDING',
      required: false,
      estimatedTime: 60,
      category: 'GO_LIVE'
    },
    {
      id: 'internal_communication',
      name: 'Comunicação Interna',
      description: 'Comunicou ativação para equipe da prefeitura',
      day: 7,
      status: 'PENDING',
      required: true,
      estimatedTime: 15,
      category: 'GO_LIVE'
    },
    {
      id: 'go_live_confirmed',
      name: 'Go-Live Confirmado',
      description: 'Sistema oficialmente em produção',
      day: 7,
      status: 'PENDING',
      required: true,
      estimatedTime: 5,
      category: 'GO_LIVE'
    },
    {
      id: 'post_activation_followup',
      name: 'Acompanhamento Pós-Ativação',
      description: 'Agendamento de follow-up de 30 dias',
      day: 7,
      status: 'PENDING',
      required: false,
      estimatedTime: 10,
      category: 'GO_LIVE'
    }
  ];

  // ====================================================================
  // 2. INICIALIZAR ONBOARDING
  // ====================================================================

  const initializeOnboarding = async (tenantId: string): Promise<{ success: boolean; message: string }> => {
    try {
      setError(null);

      // Criar registro de progresso
      const { data: newProgress, error: progressError } = await supabase
        .from('onboarding_progress')
        .insert([{
          tenant_id: tenantId,
          current_day: 1,
          current_step: 'tenant_created',
          steps_completed: [],
          total_progress: 0,
          estimated_completion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE',
          started_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (progressError) throw progressError;

      // Marcar primeiro passo como concluído
      await completeStep(tenantId, 'tenant_created');

      // Enviar credenciais
      await sendCredentials(tenantId);

      setProgress(newProgress);
      await loadOnboardingSteps();

      return {
        success: true,
        message: 'Onboarding iniciado com sucesso!'
      };

    } catch (err: Error | unknown) {
      setError(err.message);
      return {
        success: false,
        message: `Erro ao inicializar onboarding: ${err.message}`
      };
    }
  };

  // ====================================================================
  // 3. COMPLETAR PASSO
  // ====================================================================

  const completeStep = async (tenantId: string, stepId: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Buscar progresso atual
      const { data: currentProgress } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (!currentProgress) {
        throw new Error('Progresso de onboarding não encontrado');
      }

      // Adicionar passo aos concluídos
      const stepsCompleted = [...currentProgress.steps_completed, stepId];
      const totalSteps = DEFAULT_ONBOARDING_STEPS.length;
      const totalProgress = (stepsCompleted.length / totalSteps) * 100;

      // Determinar próximo passo
      const nextStep = getNextStep(stepsCompleted);
      const currentDay = nextStep ? DEFAULT_ONBOARDING_STEPS.find(s => s.id === nextStep)?.day || currentProgress.current_day : currentProgress.current_day;

      // Verificar se completou onboarding
      const isCompleted = totalProgress >= 100;

      const { error: updateError } = await supabase
        .from('onboarding_progress')
        .update({
          steps_completed: stepsCompleted,
          total_progress: totalProgress,
          current_step: nextStep || currentProgress.current_step,
          current_day: currentDay,
          status: isCompleted ? 'COMPLETED' : 'ACTIVE',
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', tenantId);

      if (updateError) throw updateError;

      // Recarregar dados
      await loadProgress(tenantId);

      // Enviar notificações automáticas baseadas no passo
      await sendStepNotification(tenantId, stepId);

      return {
        success: true,
        message: `Passo '${stepId}' concluído com sucesso!`
      };

    } catch (err: Error | unknown) {
      return {
        success: false,
        message: `Erro ao completar passo: ${err.message}`
      };
    }
  };

  // ====================================================================
  // 4. CARREGAR PROGRESSO
  // ====================================================================

  const loadProgress = async (tenantId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      setProgress(data);
      await loadOnboardingSteps();

    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // 5. CARREGAR PASSOS DO ONBOARDING
  // ====================================================================

  const loadOnboardingSteps = async () => {
    const stepsWithStatus = DEFAULT_ONBOARDING_STEPS.map(step => ({
      ...step,
      status: progress?.steps_completed?.includes(step.id) ? 'COMPLETED' as const :
              progress?.current_step === step.id ? 'IN_PROGRESS' as const : 'PENDING' as const
    }));

    setOnboardingSteps(stepsWithStatus);
  };

  // ====================================================================
  // 6. WIZARD DE CONFIGURAÇÃO
  // ====================================================================

  const processWizardData = async (tenantId: string, wizardData: WizardData): Promise<{ success: boolean; message: string }> => {
    try {
      // Atualizar informações do tenant
      if (wizardData.tenant_info) {
        const { error: tenantError } = await supabase
          .from('tenants')
          .update(wizardData.tenant_info)
          .eq('id', tenantId);

        if (tenantError) throw tenantError;
      }

      // Criar usuário administrador
      if (wizardData.admin_user) {
        await createAdminUser(tenantId, wizardData.admin_user);
      }

      // Configurar secretarias ativas
      if (wizardData.secretarias_ativas) {
        await configureActiveDepartments(tenantId, wizardData.secretarias_ativas);
      }

      // Marcar passos como concluídos
      const completedSteps = ['wizard_started'];
      if (wizardData.tenant_info.logo_url) completedSteps.push('logo_uploaded');
      if (wizardData.tenant_info.cor_primaria) completedSteps.push('colors_configured');
      if (wizardData.admin_user) completedSteps.push('admin_users_created');
      if (wizardData.secretarias_ativas) completedSteps.push('departments_configured');

      for (const stepId of completedSteps) {
        await completeStep(tenantId, stepId);
      }

      return {
        success: true,
        message: 'Configuração do wizard concluída com sucesso!'
      };

    } catch (err: Error | unknown) {
      return {
        success: false,
        message: `Erro no wizard: ${err.message}`
      };
    }
  };

  // ====================================================================
  // 7. CHECKLIST DE GO-LIVE
  // ====================================================================

  const validateGoLiveChecklist = async (tenantId: string): Promise<{ success: boolean; checklist: unknown[]; message: string }> => {
    try {
      const checklist = [
        {
          id: 'admin_users',
          name: 'Usuários Administradores',
          description: 'Pelo menos 1 usuário admin cadastrado',
          status: 'PENDING'
        },
        {
          id: 'departments_active',
          name: 'Secretarias Ativas',
          description: 'Pelo menos 3 secretarias ativadas',
          status: 'PENDING'
        },
        {
          id: 'customization',
          name: 'Personalização Visual',
          description: 'Logo e cores configuradas',
          status: 'PENDING'
        },
        {
          id: 'basic_data',
          name: 'Dados Básicos',
          description: 'Dados iniciais importados',
          status: 'PENDING'
        },
        {
          id: 'functionality_test',
          name: 'Teste de Funcionalidades',
          description: 'Principais funcionalidades testadas',
          status: 'PENDING'
        }
      ];

      // Validar cada item do checklist
      for (const item of checklist) {
        const isValid = await validateChecklistItem(tenantId, item.id);
        item.status = isValid ? 'COMPLETED' : 'PENDING';
      }

      const allCompleted = checklist.every(item => item.status === 'COMPLETED');

      if (allCompleted) {
        await completeStep(tenantId, 'go_live_checklist');
      }

      return {
        success: true,
        checklist,
        message: allCompleted ? 'Checklist validado com sucesso!' : 'Alguns itens ainda precisam ser concluídos'
      };

    } catch (err: Error | unknown) {
      return {
        success: false,
        checklist: [],
        message: `Erro na validação: ${err.message}`
      };
    }
  };

  // ====================================================================
  // 8. FUNÇÕES AUXILIARES
  // ====================================================================

  const getNextStep = (stepsCompleted: string[]): string | null => {
    return DEFAULT_ONBOARDING_STEPS
      .find(step => !stepsCompleted.includes(step.id))?.id || null;
  };

  const sendCredentials = async (tenantId: string) => {
    // Simulação de envio de email com credenciais
    console.log(`📧 Enviando credenciais para tenant ${tenantId}`);
    
    // Marcar como enviado
    setTimeout(async () => {
      await completeStep(tenantId, 'credentials_sent');
    }, 1000);
  };

  const sendStepNotification = async (tenantId: string, stepId: string) => {
    // Enviar notificações baseadas no passo concluído
    const notifications: { [key: string]: string } = {
      'first_login': 'Bem-vindo ao DigiUrban! Complete seu perfil.',
      'tour_completed': 'Ótimo! Agora vamos personalizar sua prefeitura.',
      'departments_configured': 'Secretarias configuradas! Hora do treinamento.',
      'go_live_confirmed': 'Parabéns! Sua prefeitura está online!'
    };

    if (notifications[stepId]) {
      console.log(`📱 Notificação: ${notifications[stepId]}`);
    }
  };

  const createAdminUser = async (tenantId: string, userData: any) => {
    // Simulação de criação de usuário admin
    console.log(`👤 Criando usuário admin para tenant ${tenantId}:`, userData);
  };

  const configureActiveDepartments = async (tenantId: string, departments: string[]) => {
    // Atualizar configurações das secretarias
    const { error } = await supabase
      .from('tenant_configuracoes')
      .update({ secretarias_ativas: departments })
      .eq('tenant_id', tenantId);

    if (error) throw error;
  };

  const validateChecklistItem = async (tenantId: string, itemId: string): Promise<boolean> => {
    // Simulação de validação de itens do checklist
    switch (itemId) {
      case 'admin_users':
        const { data: users } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('tenant_id', tenantId)
          .limit(1);
        return (users?.length || 0) > 0;

      case 'departments_active':
        const { data: config } = await supabase
          .from('tenant_configuracoes')
          .select('secretarias_ativas')
          .eq('tenant_id', tenantId)
          .single();
        return (config?.secretarias_ativas?.length || 0) >= 3;

      default:
        return Math.random() > 0.3; // Simulação
    }
  };

  // ====================================================================
  // 9. RELATÓRIOS DE ONBOARDING
  // ====================================================================

  const getOnboardingStats = async () => {
    try {
      const { data: allProgress } = await supabase
        .from('onboarding_progress')
        .select('*');

      const stats = {
        total_onboardings: allProgress?.length || 0,
        active_onboardings: allProgress?.filter(p => p.status === 'ACTIVE').length || 0,
        completed_onboardings: allProgress?.filter(p => p.status === 'COMPLETED').length || 0,
        avg_completion_time: 5.2, // dias (exemplo)
        completion_rate: allProgress?.length ? 
          (allProgress.filter(p => p.status === 'COMPLETED').length / allProgress.length) * 100 : 0,
        common_drop_points: ['admin_users_created', 'tutorial_videos_watched']
      };

      return { success: true, stats };
    } catch (err: Error | unknown) {
      return { success: false, message: err.message };
    }
  };

  // ====================================================================
  // EFEITOS
  // ====================================================================

  useEffect(() => {
    loadOnboardingSteps();
  }, [progress]);

  return {
    // Estados
    onboardingSteps,
    progress,
    loading,
    error,

    // Ações principais
    initializeOnboarding,
    completeStep,
    processWizardData,
    validateGoLiveChecklist,

    // Carregamento de dados
    loadProgress,
    getOnboardingStats,

    // Utilitários
    DEFAULT_ONBOARDING_STEPS
  };
};