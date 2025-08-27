
import { useModuleCRUD } from '../useModuleCRUD';

// Tipos para o módulo Cultura
export interface CulturaEspaco {
  id?: string;
  tenant_id?: string;
  nome: string;
  tipo?: string;
  endereco?: any;
  contato?: any;
  capacidade?: number;
  recursos_disponiveis?: string[];
  horario_funcionamento?: any;
  valor_locacao?: number;
  responsavel_id?: string;
  fotos?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CulturaGrupo {
  id?: string;
  tenant_id?: string;
  nome: string;
  tipo?: string;
  categoria?: string;
  coordenador_nome?: string;
  coordenador_contato?: any;
  participantes_cadastrados?: number;
  participantes_ativos?: number;
  local_ensaio?: string;
  horario_ensaio?: any;
  repertorio?: string[];
  apresentacoes_realizadas?: number;
  premios_recebidos?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CulturaEvento {
  id?: string;
  tenant_id?: string;
  nome: string;
  descricao?: string;
  tipo?: string;
  categoria?: string;
  data_inicio?: string;
  data_fim?: string;
  horario_inicio?: string;
  horario_fim?: string;
  local_realizacao?: string;
  espaco_id?: string;
  publico_esperado?: number;
  publico_presente?: number;
  faixa_etaria?: string;
  entrada_gratuita?: boolean;
  valor_ingresso?: number;
  organizador_id?: string;
  apoiadores?: string[];
  orcamento_previsto?: number;
  orcamento_realizado?: number;
  material_promocional?: string[];
  avaliacoes?: any;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CulturaProjeto {
  id?: string;
  tenant_id?: string;
  nome: string;
  descricao?: string;
  objetivo?: string;
  publico_alvo?: string;
  coordenador_id?: string;
  data_inicio?: string;
  data_fim?: string;
  orcamento_total?: number;
  fonte_recurso?: string;
  beneficiarios_diretos?: number;
  beneficiarios_indiretos?: number;
  atividades_previstas?: any;
  atividades_realizadas?: any;
  indicadores_sucesso?: any;
  relatorios?: string[];
  prestacao_contas?: any;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CulturaOficina {
  id?: string;
  tenant_id?: string;
  nome: string;
  descricao?: string;
  modalidade?: string;
  categoria?: string;
  nivel?: string;
  instrutor_nome?: string;
  instrutor_curriculo?: string;
  carga_horaria?: number;
  vagas_oferecidas?: number;
  vagas_ocupadas?: number;
  idade_minima?: number;
  idade_maxima?: number;
  pre_requisitos?: string;
  material_necessario?: string[];
  local_realizacao?: string;
  data_inicio?: string;
  data_fim?: string;
  horario?: any;
  valor_inscricao?: number;
  certificado?: boolean;
  avaliacoes?: any;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Hooks especializados para cada tabela
export const useCulturaEspacos = () => useModuleCRUD<CulturaEspaco>('cultura_espacos');
export const useCulturaGrupos = () => useModuleCRUD<CulturaGrupo>('cultura_grupos');
export const useCulturaEventos = () => useModuleCRUD<CulturaEvento>('cultura_eventos');
export const useCulturaProjetos = () => useModuleCRUD<CulturaProjeto>('cultura_projetos');
export const useCulturaOficinas = () => useModuleCRUD<CulturaOficina>('cultura_oficinas');
