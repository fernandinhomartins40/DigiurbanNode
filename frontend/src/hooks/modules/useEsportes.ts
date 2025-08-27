
import { useModuleCRUD } from '../useModuleCRUD';

// Tipos para o módulo Esportes
export interface EsportesInfraestrutura {
  id?: string;
  tenant_id?: string;
  nome: string;
  tipo?: string;
  endereco?: any;
  capacidade?: number;
  modalidades?: string[];
  equipamentos_disponiveis?: string[];
  horario_funcionamento?: any;
  valor_locacao_hora?: number;
  responsavel_id?: string;
  condicoes_uso?: string;
  manutencao_necessaria?: string[];
  ultima_reforma?: string;
  acessibilidade?: boolean;
  iluminacao?: boolean;
  vestiarios?: number;
  estacionamento?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EsportesEquipe {
  id?: string;
  tenant_id?: string;
  nome: string;
  modalidade?: string;
  categoria?: string;
  tecnico_nome?: string;
  tecnico_contato?: any;
  local_treino_id?: string;
  horario_treino?: any;
  atletas_cadastrados?: number;
  atletas_ativos?: number;
  equipamentos_fornecidos?: string[];
  historico_competicoes?: any;
  conquistas?: string[];
  patrocinadores?: string[];
  orcamento_anual?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EsportesAtleta {
  id?: string;
  tenant_id?: string;
  nome_completo: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: any;
  contato?: any;
  responsavel_legal?: any;
  modalidades?: string[];
  equipe_id?: string;
  posicao_funcao?: string;
  nivel_experiencia?: string;
  federado?: boolean;
  numero_federacao?: string;
  exame_medico_valido?: boolean;
  data_exame_medico?: string;
  restricoes_medicas?: string[];
  conquistas_individuais?: string[];
  historico_lesoes?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EsportesCompeticao {
  id?: string;
  tenant_id?: string;
  nome: string;
  modalidade?: string;
  tipo?: string;
  categoria?: string;
  data_inicio?: string;
  data_fim?: string;
  local_realizacao_id?: string;
  equipes_participantes?: number;
  equipes_inscritas?: number;
  valor_inscricao?: number;
  premiacao?: any;
  regulamento?: string;
  organizador_id?: string;
  patrocinadores?: string[];
  orcamento_total?: number;
  publico_esperado?: number;
  publico_presente?: number;
  transmissao_online?: boolean;
  cobertura_midia?: string[];
  resultados?: any;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EsportesEscolinha {
  id?: string;
  tenant_id?: string;
  nome: string;
  modalidade?: string;
  faixa_etaria_inicio?: number;
  faixa_etaria_fim?: number;
  professor_id?: string;
  local_atividade_id?: string;
  horario?: any;
  vagas_oferecidas?: number;
  vagas_ocupadas?: number;
  valor_mensalidade?: number;
  material_incluido?: string[];
  objetivos?: string;
  metodologia?: string;
  avaliacoes_periodicas?: boolean;
  apresentacoes_publicas?: boolean;
  uniforme_fornecido?: boolean;
  seguro_incluido?: boolean;
  lista_espera?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Hooks especializados para cada tabela
export const useEsportesInfraestrutura = () => useModuleCRUD<EsportesInfraestrutura>('esportes_infraestrutura');
export const useEsportesEquipes = () => useModuleCRUD<EsportesEquipe>('esportes_equipes');
export const useEsportesAtletas = () => useModuleCRUD<EsportesAtleta>('esportes_atletas');
export const useEsportesCompeticoes = () => useModuleCRUD<EsportesCompeticao>('esportes_competicoes');
export const useEsportesEscolinhas = () => useModuleCRUD<EsportesEscolinha>('esportes_escolinhas');
