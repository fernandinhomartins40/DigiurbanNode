import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  Pause,
  TrendingUp,
  Calendar,
  BookOpen,
  PlayCircle,
  AlertCircle,
  Video,
  FileText,
  Globe
} from 'lucide-react';
import { useOnboardingMetrics, useOnboarding } from "@/hooks/useOnboarding";
import { useTenants } from "@/hooks/useTenants";

const OnboardingDashboard: React.FC = () => {
  const { metrics, loading: metricsLoading } = useOnboardingMetrics();
  const { tenants } = useTenants();
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const { 
    progress, 
    currentSteps, 
    resources, 
    appointments,
    loading: onboardingLoading 
  } = useOnboarding(selectedTenant);

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Onboarding</h1>
              <p className="text-gray-600 mt-1">Acompanhamento do processo de ativação de clientes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Onboardings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.totalOnboardings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.completedOnboardings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.activeOnboardings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.completionRate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.averageCompletionDays?.toFixed(1) || 0} dias
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progresso Individual */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seletor de Prefeitura */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acompanhamento Individual
              </h3>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma prefeitura</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.nome} - {tenant.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Progresso Detalhado */}
            {selectedTenant && progress && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Progresso do Onboarding
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    progress.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    progress.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                    progress.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {progress.status}
                  </span>
                </div>

                {/* Barra de Progresso */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progresso Geral</span>
                    <span>{progress.total_progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress.total_progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Timeline de Dias */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Dia {progress.current_day} de 7
                  </h4>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <div
                        key={day}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          day < progress.current_day 
                            ? 'bg-green-100 text-green-800'
                            : day === progress.current_day
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {day < progress.current_day ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          day
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Passos do Dia Atual */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Passos do Dia Atual
                  </h4>
                  <div className="space-y-3">
                    {currentSteps.map(step => (
                      <div
                        key={step.id}
                        className={`p-4 rounded-lg border ${
                          step.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {step.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-400 mr-3" />
                            )}
                            <div>
                              <h5 className="font-medium text-gray-900">{step.title}</h5>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              ~{step.estimatedMinutes} min
                            </div>
                            {step.required && (
                              <div className="text-xs text-red-600">Obrigatório</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Iniciado em:</span>
                    <p className="text-gray-600">
                      {new Date(progress.started_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Conclusão Estimada:</span>
                    <p className="text-gray-600">
                      {progress.estimated_completion 
                        ? new Date(progress.estimated_completion).toLocaleDateString('pt-BR')
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Próximos Agendamentos */}
            {selectedTenant && appointments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Próximos Agendamentos
                </h3>
                <div className="space-y-3">
                  {appointments.slice(0, 3).map(appointment => (
                    <div
                      key={appointment.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg mr-4">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.scheduled_at).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Recursos e Estatísticas */}
          <div className="space-y-6">
            {/* Recursos de Onboarding */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recursos Disponíveis
              </h3>
              <div className="space-y-3">
                {resources.slice(0, 5).map(resource => (
                  <div key={resource.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      {resource.type === 'VIDEO' && <Video className="h-4 w-4 text-blue-600" />}
                      {resource.type === 'DOCUMENT' && <FileText className="h-4 w-4 text-blue-600" />}
                      {resource.type === 'WEBINAR' && <Globe className="h-4 w-4 text-blue-600" />}
                      {resource.type === 'TUTORIAL' && <PlayCircle className="h-4 w-4 text-blue-600" />}
                      {resource.type === 'CHECKLIST' && <CheckCircle className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{resource.title}</h4>
                      <p className="text-sm text-gray-600">
                        {resource.type} • {resource.duration_minutes ? `${resource.duration_minutes} min` : 'Variável'}
                      </p>
                    </div>
                    {resource.is_required && (
                      <div className="ml-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estatísticas do Período
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Onboardings este mês</span>
                  <span className="font-semibold text-gray-900">
                    {metrics?.progressData?.filter((p: any) => {
                      const startDate = new Date(p.started_at);
                      const currentMonth = new Date().getMonth();
                      return startDate.getMonth() === currentMonth;
                    }).length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taxa de abandono</span>
                  <span className="font-semibold text-red-600">
                    {((metrics?.pausedOnboardings || 0) / (metrics?.totalOnboardings || 1) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recursos mais acessados</span>
                  <span className="font-semibold text-gray-900">Vídeos</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Satisfação média</span>
                  <span className="font-semibold text-green-600">4.2/5</span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Enviar Lembretes
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  Gerar Relatório
                </button>
                <button className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors">
                  Agendar Webinar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingDashboard;