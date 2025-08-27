
import { useModuleCRUD } from '../useModuleCRUD';

// Tipos para o módulo Habitação
export interface HabitacaoPrograma {
  id?: string;
  tenant_id?: string;
  nome: string;
  tipo?: string;
  descricao?: string;
  publico_alvo?: string;
  renda_maxima?: number;
  renda_minima?: number;
  data_inicio?: string;
  data_fim?: string;
  unidades_previstas?: number;
  unidades_entregues?: number;
  valor_subsidiado?: number;
  valor_financiado?: number;
  entrada_necessaria?: number;
  prestacao_maxima?: number;
  prazo_financiamento?: number;
  documentos_necessarios?: string[];
  criterios_pontuacao?: any;
  fonte_recurso?: string;
  orcamento_total?: number;
  coordenador_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HabitacaoFamilia {
  id?: string;
  tenant_id?: string;
  responsavel_nome: string;
  responsavel_cpf?: string;
  responsavel_rg?: string;
  data_nascimento?: string;
  estado_civil?: string;
  profissao?: string;
  endereco_atual?: any;
  contato?: any;
  renda_familiar?: number;
  composicao_familiar?: any;
  pessoas_deficiencia?: number;
  pessoas_idosas?: number;
  criancas_adolescentes?: number;
  situacao_atual?: string;
  valor_aluguel_atual?: number;
  tempo_municipio?: number;
  situacao_documentos?: string;
  programas_interesse?: string[];
  pontuacao_social?: number;
  vulnerabilidades?: string[];
  observacoes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HabitacaoUnidade {
  id?: string;
  tenant_id?: string;
  programa_id?: string;
  endereco?: any;
  numero_unidade?: string;
  tipo?: string;
  area_construida?: number;
  area_terreno?: number;
  quartos?: number;
  banheiros?: number;
  garagem?: boolean;
  quintal?: boolean;
  acessibilidade?: boolean;
  valor_avaliacao?: number;
  valor_venda?: number;
  situacao?: string;
  familia_beneficiada_id?: string;
  data_entrega?: string;
  escritura_registrada?: boolean;
  financiamento_aprovado?: boolean;
  observacoes?: string;
  fotos?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HabitacaoSelecao {
  id?: string;
  tenant_id?: string;
  programa_id?: string;
  familia_id?: string;
  data_inscricao?: string;
  documentos_entregues?: string[];
  documentos_pendentes?: string[];
  pontuacao_final?: number;
  classificacao?: number;
  aprovado?: boolean;
  motivo_reprovacao?: string;
  recurso_apresentado?: boolean;
  recurso_aprovado?: boolean;
  unidade_indicada_id?: string;
  data_aprovacao?: string;
  observacoes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HabitacaoRegularizacao {
  id?: string;
  tenant_id?: string;
  requerente_nome: string;
  requerente_cpf?: string;
  endereco_imovel?: any;
  area_ocupada?: number;
  tempo_ocupacao?: number;
  tipo_ocupacao?: string;
  documentos_posse?: string[];
  situacao_legal?: string;
  processo_judicial?: string;
  valor_avaliacao?: number;
  taxa_regularizacao?: number;
  parcelamento_aprovado?: boolean;
  numero_parcelas?: number;
  valor_parcela?: number;
  parcelas_pagas?: number;
  documentacao_final?: string[];
  registro_cartorio?: boolean;
  observacoes?: string;
  responsavel_tecnico_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Hooks especializados para cada tabela
export const useHabitacaoProgramas = () => useModuleCRUD<HabitacaoPrograma>('habitacao_programas');
export const useHabitacaoFamilias = () => useModuleCRUD<HabitacaoFamilia>('habitacao_familias');
export const useHabitacaoUnidades = () => useModuleCRUD<HabitacaoUnidade>('habitacao_unidades');
export const useHabitacaoSelecao = () => useModuleCRUD<HabitacaoSelecao>('habitacao_selecao');
export const useHabitacaoRegularizacao = () => useModuleCRUD<HabitacaoRegularizacao>('habitacao_regularizacao');
