import { useModuleCRUD, useModuleItem, useModuleStats } from '../useModuleCRUD';

// Tipos baseados no schema do banco
export interface AssistenciaFamilia {
  id: string;
  tenant_id: string;
  codigo_familia: string;
  responsavel_nome: string;
  responsavel_cpf?: string;
  responsavel_nis?: string;
  endereco?: any;
  contato?: any;
  renda_familiar?: number;
  numero_membros?: number;
  situacao_vulnerabilidade?: string[];
  programas_inscritos?: string[];
  cras_referencia?: string;
  data_cadastro?: string;
  status: 'ativa' | 'inativa' | 'bloqueada' | 'transferida';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssistenciaAtendimento {
  id: string;
  tenant_id: string;
  familia_id: string;
  atendente_id: string;
  unidade_atendimento_id?: string;
  data_atendimento: string;
  horario_inicio: string;
  horario_fim?: string;
  tipo_atendimento: 'cadastro' | 'acompanhamento' | 'orientacao' | 'encaminhamento' | 'entrega_beneficio' | 'visita_domiciliar' | 'outro';
  demanda_principal: string;
  descricao_caso?: string;
  acoes_realizadas?: string[];
  encaminhamentos?: unknown[];
  proxima_acao?: any;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssistenciaUnidade {
  id: string;
  tenant_id: string;
  nome: string;
  tipo: 'cras' | 'creas' | 'centro_pop' | 'abrigo' | 'casa_passagem' | 'outro';
  endereco?: any;
  contato?: any;
  coordenador_id?: string;
  equipe_tecnica?: string[];
  territorio_abrangencia?: string[];
  capacidade_atendimento?: number;
  servicos_oferecidos?: string[];
  horario_funcionamento?: any;
  familias_referenciadas?: number;
  status: 'ativa' | 'inativa' | 'reforma';
  created_at: string;
  updated_at: string;
}

// Hooks específicos do módulo Assistência Social
export const useAssistenciaFamilias = (filters?: any) =>
  useModuleCRUD<AssistenciaFamilia>('assistencia', 'familias', {
    filters,
    orderBy: { column: 'responsavel_nome', ascending: true }
  });

export const useAssistenciaFamilia = (id?: string) =>
  useModuleItem<AssistenciaFamilia>('assistencia', 'familias', id);

export const useAssistenciaAtendimentos = (filters?: any) =>
  useModuleCRUD<AssistenciaAtendimento>('assistencia', 'atendimentos', {
    filters,
    orderBy: { column: 'data_atendimento', ascending: false }
  });

export const useAssistenciaAtendimento = (id?: string) =>
  useModuleItem<AssistenciaAtendimento>('assistencia', 'atendimentos', id);

export const useAssistenciaUnidades = (filters?: any) =>
  useModuleCRUD<AssistenciaUnidade>('assistencia', 'unidades', {
    filters,
    orderBy: { column: 'nome', ascending: true }
  });

export const useAssistenciaUnidade = (id?: string) =>
  useModuleItem<AssistenciaUnidade>('assistencia', 'unidades', id);

// Hooks para estatísticas
export const useAssistenciaStats = () => {
  const familiasStats = useModuleStats('assistencia', 'familias');
  const atendimentosStats = useModuleStats('assistencia', 'atendimentos');
  const unidadesStats = useModuleStats('assistencia', 'unidades');

  return {
    totalFamilias: familiasStats.data?.total || 0,
    totalAtendimentos: atendimentosStats.data?.total || 0,
    totalUnidades: unidadesStats.data?.total || 0,
    isLoading: familiasStats.isLoading || atendimentosStats.isLoading || unidadesStats.isLoading,
  };
};