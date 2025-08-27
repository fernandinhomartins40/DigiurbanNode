import { useModuleCRUD, useModuleItem, useModuleStats } from '../useModuleCRUD';

// Tipos baseados no schema do banco
export interface SaudePaciente {
  id: string;
  tenant_id: string;
  nome_completo: string;
  cpf?: string;
  cns?: string;
  data_nascimento?: string;
  sexo?: 'M' | 'F' | 'O';
  endereco?: any;
  contato?: any;
  convenio_medico?: string;
  alergias?: string[];
  condicoes_medicas?: string[];
  medicamentos_uso_continuo?: string[];
  contato_emergencia?: any;
  status: 'ativo' | 'inativo' | 'bloqueado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface SaudeProfissional {
  id: string;
  tenant_id: string;
  nome_completo: string;
  cpf?: string;
  especialidades?: string[];
  crm?: string;
  crm_uf?: string;
  contato?: any;
  tipo_profissional: 'medico' | 'enfermeiro' | 'tecnico_enfermagem' | 'dentista' | 'farmaceutico' | 'psicologo' | 'nutricionista' | 'fisioterapeuta' | 'outro';
  carga_horaria_semanal?: number;
  turno_trabalho?: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  unidades_trabalho?: string[];
  status: 'ativo' | 'inativo' | 'bloqueado';
  created_at: string;
  updated_at: string;
}

export interface SaudeUnidade {
  id: string;
  tenant_id: string;
  nome: string;
  tipo: 'ubs' | 'upf' | 'hospital' | 'clinica' | 'caps' | 'pronto_socorro' | 'laboratorio' | 'farmacia';
  endereco?: any;
  contato?: any;
  cnpj?: string;
  cnes?: string;
  especialidades_disponiveis?: string[];
  servicos_oferecidos?: string[];
  horario_funcionamento?: any;
  capacidade_atendimento?: any;
  equipamentos_disponiveis?: string[];
  gestor_responsavel_id?: string;
  status: 'ativa' | 'inativa' | 'reforma' | 'desativada';
  created_at: string;
  updated_at: string;
}

export interface SaudeAgendamento {
  id: string;
  tenant_id: string;
  paciente_id: string;
  profissional_id: string;
  unidade_saude_id: string;
  especialidade?: string;
  data_agendamento: string;
  horario_inicio: string;
  horario_fim: string;
  duracao_minutos?: number;
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'remarcado' | 'faltou';
  tipo_consulta: 'consulta' | 'exame' | 'procedimento' | 'retorno' | 'urgencia' | 'emergencia';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente' | 'emergencia';
  observacoes?: string;
  sintomas_relatados?: string;
  prescricoes?: string[];
  procedimentos_realizados?: string[];
  retorno_necessario?: boolean;
  data_retorno_sugerida?: string;
  lembrete_enviado?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaudeCampanha {
  id: string;
  tenant_id: string;
  nome: string;
  descricao?: string;
  tipo: 'vacinacao' | 'preventiva' | 'educativa' | 'exames' | 'nutricao' | 'saude_mental' | 'outro';
  publico_alvo?: any;
  data_inicio: string;
  data_fim: string;
  locais_realizacao?: string[];
  unidades_participantes?: string[];
  meta_atendimentos?: number;
  realizados?: number;
  responsavel_id?: string;
  equipe_ids?: string[];
  orcamento_previsto?: number;
  orcamento_gasto?: number;
  materiais_necessarios?: string[];
  indicadores_sucesso?: any;
  status: 'planejada' | 'ativa' | 'pausada' | 'concluida' | 'cancelada';
  created_at: string;
  updated_at: string;
}

// Hooks específicos do módulo Saúde
export const useSaudePacientes = (filters?: any) => 
  useModuleCRUD<SaudePaciente>('saude', 'pacientes', {
    filters,
    orderBy: { column: 'nome_completo', ascending: true }
  });

export const useSaudePaciente = (id?: string) =>
  useModuleItem<SaudePaciente>('saude', 'pacientes', id);

export const useSaudeProfissionais = (filters?: any) =>
  useModuleCRUD<SaudeProfissional>('saude', 'profissionais', {
    filters,
    orderBy: { column: 'nome_completo', ascending: true }
  });

export const useSaudeProfissional = (id?: string) =>
  useModuleItem<SaudeProfissional>('saude', 'profissionais', id);

export const useSaudeUnidades = (filters?: any) =>
  useModuleCRUD<SaudeUnidade>('saude', 'unidades', {
    filters,
    orderBy: { column: 'nome', ascending: true }
  });

export const useSaudeUnidade = (id?: string) =>
  useModuleItem<SaudeUnidade>('saude', 'unidades', id);

export const useSaudeAgendamentos = (filters?: any) =>
  useModuleCRUD<SaudeAgendamento>('saude', 'agendamentos', {
    filters,
    orderBy: { column: 'data_agendamento', ascending: false }
  });

export const useSaudeAgendamento = (id?: string) =>
  useModuleItem<SaudeAgendamento>('saude', 'agendamentos', id);

export const useSaudeCampanhas = (filters?: any) =>
  useModuleCRUD<SaudeCampanha>('saude', 'campanhas', {
    filters,
    orderBy: { column: 'data_inicio', ascending: false }
  });

export const useSaudeCampanha = (id?: string) =>
  useModuleItem<SaudeCampanha>('saude', 'campanhas', id);

// Hooks para estatísticas
export const useSaudeStats = () => {
  const pacientesStats = useModuleStats('saude', 'pacientes');
  const agendamentosStats = useModuleStats('saude', 'agendamentos');
  const campanhasStats = useModuleStats('saude', 'campanhas');
  const unidadesStats = useModuleStats('saude', 'unidades');

  return {
    totalPacientes: pacientesStats.data?.total || 0,
    totalAgendamentos: agendamentosStats.data?.total || 0,
    totalCampanhas: campanhasStats.data?.total || 0,
    totalUnidades: unidadesStats.data?.total || 0,
    isLoading: pacientesStats.isLoading || agendamentosStats.isLoading || 
               campanhasStats.isLoading || unidadesStats.isLoading,
  };
};