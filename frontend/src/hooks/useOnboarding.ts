import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";

export interface OnboardingProgress {
  id: string;
  tenant_id: string;
  current_day: number;
  current_step: string;
  steps_completed: string[];
  total_progress: number;
  started_at: string;
  estimated_completion?: string;
  completed_at?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  assigned_specialist?: string;
  specialist_notes?: string;
  satisfaction_score?: number;
}

export interface OnboardingStep {
  id: string;
  day: number;
  stepId: string;
  title: string;
  description: string;
  type: 'CONFIGURATION' | 'TRAINING' | 'VALIDATION' | 'SETUP';
  required: boolean;
  estimatedMinutes: number;
  completed: boolean;
  resources?: OnboardingResource[];
}

export interface OnboardingResource {
  id: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'DOCUMENT' | 'WEBINAR' | 'TUTORIAL' | 'CHECKLIST';
  category: 'SETUP' | 'CONFIGURATION' | 'TRAINING' | 'SUPPORT' | 'REFERENCE';
  content_url: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  is_required: boolean;
  difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface OnboardingAppointment {
  id: string;
  tenant_id: string;
  type: 'KICKOFF' | 'TRAINING' | 'REVIEW' | 'GO_LIVE' | 'FOLLOW_UP';
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  specialist_id?: string;
  client_email: string;
  client_name: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  meeting_link?: string;
}

export function useOnboarding(tenantId?: string) {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [currentSteps, setCurrentSteps] = useState<OnboardingStep[]>([]);
  const [resources, setResources] = useState<OnboardingResource[]>([]);
  const [appointments, setAppointments] = useState<OnboardingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar progresso do onboarding
  const fetchProgress = async () => {
    if (!tenantId) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore not found
      setProgress(data);
    } catch (err: Error | unknown) {
      setError(err.message);
    }
  };

  // Buscar recursos de onboarding
  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('onboarding_resources')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      setResources(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    }
  };

  // Buscar agendamentos
  const fetchAppointments = async () => {
    if (!tenantId) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_appointments')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('scheduled_at');

      if (error) throw error;
      setAppointments(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    }
  };

  // Iniciar onboarding
  const startOnboarding = async () => {
    if (!tenantId) return;

    try {
      const estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + 7);

      const { data, error } = await supabase
        .from('onboarding_progress')
        .insert([{
          tenant_id: tenantId,
          current_day: 1,
          current_step: 'welcome',
          steps_completed: [],
          total_progress: 0,
          estimated_completion: estimatedCompletion.toISOString(),
          status: 'ACTIVE'
        }])
        .select()
        .single();

      if (error) throw error;
      setProgress(data);

      // Log início do onboarding
      await supabase
        .from('onboarding_logs')
        .insert([{
          tenant_id: tenantId,
          onboarding_progress_id: data.id,
          action: 'ONBOARDING_STARTED',
          day_number: 1,
          details: { started_by: 'system' }
        }]);

      return data;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao iniciar onboarding: ${err.message}`);
    }
  };

  // Completar passo
  const completeStep = async (stepId: string) => {
    if (!progress) return;

    try {
      const updatedSteps = [...(progress.steps_completed || []), stepId];
      const totalSteps = 20; // Total de passos padrão
      const newProgress = (updatedSteps.length / totalSteps) * 100;

      const { data, error } = await supabase
        .from('onboarding_progress')
        .update({
          steps_completed: updatedSteps,
          total_progress: newProgress,
          current_step: stepId
        })
        .eq('id', progress.id)
        .select()
        .single();

      if (error) throw error;
      setProgress(data);

      // Log conclusão do passo
      await supabase
        .from('onboarding_logs')
        .insert([{
          tenant_id: progress.tenant_id,
          onboarding_progress_id: progress.id,
          action: 'STEP_COMPLETED',
          step_id: stepId,
          day_number: progress.current_day,
          details: { 
            new_progress: newProgress,
            total_steps_completed: updatedSteps.length 
          }
        }]);

      // Se completou todos os passos, finalizar onboarding
      if (newProgress >= 100) {
        await completeOnboarding();
      }

      return data;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao completar passo: ${err.message}`);
    }
  };

  // Completar onboarding
  const completeOnboarding = async () => {
    if (!progress) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          total_progress: 100
        })
        .eq('id', progress.id)
        .select()
        .single();

      if (error) throw error;
      setProgress(data);

      // Log conclusão do onboarding
      await supabase
        .from('onboarding_logs')
        .insert([{
          tenant_id: progress.tenant_id,
          onboarding_progress_id: progress.id,
          action: 'ONBOARDING_COMPLETED',
          day_number: progress.current_day,
          details: { 
            total_duration: Math.floor(
              (Date.now() - new Date(progress.started_at).getTime()) / (1000 * 60 * 60 * 24)
            )
          }
        }]);

      return data;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao completar onboarding: ${err.message}`);
    }
  };

  // Pular passo
  const skipStep = async (stepId: string, reason?: string) => {
    if (!progress) return;

    try {
      const updatedSteps = [...(progress.steps_completed || []), `${stepId}_SKIPPED`];

      const { data, error } = await supabase
        .from('onboarding_progress')
        .update({
          steps_completed: updatedSteps
        })
        .eq('id', progress.id)
        .select()
        .single();

      if (error) throw error;
      setProgress(data);

      // Log passo pulado
      await supabase
        .from('onboarding_logs')
        .insert([{
          tenant_id: progress.tenant_id,
          onboarding_progress_id: progress.id,
          action: 'STEP_SKIPPED',
          step_id: stepId,
          day_number: progress.current_day,
          details: { reason: reason || 'Not specified' }
        }]);

      return data;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao pular passo: ${err.message}`);
    }
  };

  // Agendar sessão
  const scheduleAppointment = async (appointmentData: {
    type: 'KICKOFF' | 'TRAINING' | 'REVIEW' | 'GO_LIVE' | 'FOLLOW_UP';
    title: string;
    description: string;
    scheduled_at: string;
    duration_minutes: number;
    client_email: string;
    client_name: string;
  }) => {
    if (!tenantId) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_appointments')
        .insert([{
          ...appointmentData,
          tenant_id: tenantId,
          onboarding_progress_id: progress?.id,
          status: 'SCHEDULED'
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchAppointments();
      return data;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao agendar sessão: ${err.message}`);
    }
  };

  // Registrar interação com recurso
  const recordResourceInteraction = async (resourceId: string, interactionType: 'VIEWED' | 'COMPLETED' | 'DOWNLOADED', progressPercentage: number = 100, timeSpent: number = 0) => {
    if (!tenantId) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_resource_interactions')
        .insert([{
          tenant_id: tenantId,
          resource_id: resourceId,
          interaction_type: interactionType,
          progress_percentage: progressPercentage,
          time_spent_minutes: timeSpent,
          step_context: progress?.current_step
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao registrar interação: ${err.message}`);
    }
  };

  // Pausar onboarding
  const pauseOnboarding = async (reason?: string) => {
    if (!progress) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .update({
          status: 'PAUSED',
          paused_at: new Date().toISOString(),
          specialist_notes: reason
        })
        .eq('id', progress.id)
        .select()
        .single();

      if (error) throw error;
      setProgress(data);
      return data;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao pausar onboarding: ${err.message}`);
    }
  };

  // Retomar onboarding
  const resumeOnboarding = async () => {
    if (!progress) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .update({
          status: 'ACTIVE',
          paused_at: null
        })
        .eq('id', progress.id)
        .select()
        .single();

      if (error) throw error;
      setProgress(data);
      return data;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao retomar onboarding: ${err.message}`);
    }
  };

  // Gerar passos do dia atual baseado no template
  const generateCurrentDaySteps = () => {
    if (!progress) return [];

    const daySteps = getDaySteps(progress.current_day);
    return daySteps.map(step => ({
      ...step,
      completed: progress.steps_completed.includes(step.stepId)
    }));
  };

  // Definir passos por dia (seria idealmente vindo do template)
  const getDaySteps = (day: number): Omit<OnboardingStep, 'completed'>[] => {
    const stepsByDay = {
      1: [
        {
          id: '1-welcome',
          day: 1,
          stepId: 'welcome',
          title: 'Boas-vindas ao DigiUrban',
          description: 'Assista ao vídeo de boas-vindas e conheça a plataforma',
          type: 'SETUP' as const,
          required: true,
          estimatedMinutes: 5
        },
        {
          id: '1-first-login',
          day: 1,
          stepId: 'first_login',
          title: 'Primeiro Acesso',
          description: 'Faça seu primeiro login e altere sua senha',
          type: 'SETUP' as const,
          required: true,
          estimatedMinutes: 10
        },
        {
          id: '1-guided-tour',
          day: 1,
          stepId: 'guided_tour',
          title: 'Tour Guiado',
          description: 'Conheça as principais funcionalidades do sistema',
          type: 'TRAINING' as const,
          required: true,
          estimatedMinutes: 15
        }
      ],
      2: [
        {
          id: '2-logo-upload',
          day: 2,
          stepId: 'logo_upload',
          title: 'Upload do Logo',
          description: 'Personalize o sistema com o logo da sua prefeitura',
          type: 'CONFIGURATION' as const,
          required: false,
          estimatedMinutes: 5
        },
        {
          id: '2-colors-config',
          day: 2,
          stepId: 'colors_config',
          title: 'Configurar Cores',
          description: 'Defina as cores da identidade visual',
          type: 'CONFIGURATION' as const,
          required: false,
          estimatedMinutes: 10
        }
      ],
      // ... outros dias seriam definidos aqui
    };

    return stepsByDay[day as keyof typeof stepsByDay] || [];
  };

  useEffect(() => {
    if (tenantId) {
      Promise.all([
        fetchProgress(),
        fetchResources(),
        fetchAppointments()
      ]).finally(() => setLoading(false));
    }
  }, [tenantId]);

  useEffect(() => {
    if (progress) {
      setCurrentSteps(generateCurrentDaySteps());
    }
  }, [progress]);

  return {
    progress,
    currentSteps,
    resources,
    appointments,
    loading,
    error,
    startOnboarding,
    completeStep,
    completeOnboarding,
    skipStep,
    scheduleAppointment,
    recordResourceInteraction,
    pauseOnboarding,
    resumeOnboarding,
    refetch: () => Promise.all([fetchProgress(), fetchResources(), fetchAppointments()])
  };
}

export function useOnboardingMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      // Buscar métricas agregadas
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('status, total_progress, started_at, completed_at');

      if (progressError) throw progressError;

      // Calcular métricas
      const total = progressData?.length || 0;
      const completed = progressData?.filter(p => p.status === 'COMPLETED').length || 0;
      const active = progressData?.filter(p => p.status === 'ACTIVE').length || 0;
      const paused = progressData?.filter(p => p.status === 'PAUSED').length || 0;

      // Tempo médio de conclusão
      const completedWithDuration = progressData?.filter(p => 
        p.status === 'COMPLETED' && p.started_at && p.completed_at
      ) || [];

      let averageCompletionTime = 0;
      if (completedWithDuration.length > 0) {
        const totalDuration = completedWithDuration.reduce((sum, p) => {
          const start = new Date(p.started_at);
          const end = new Date(p.completed_at);
          return sum + Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        averageCompletionTime = totalDuration / completedWithDuration.length;
      }

      setMetrics({
        totalOnboardings: total,
        completedOnboardings: completed,
        activeOnboardings: active,
        pausedOnboardings: paused,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        averageCompletionDays: averageCompletionTime,
        progressData
      });
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
}