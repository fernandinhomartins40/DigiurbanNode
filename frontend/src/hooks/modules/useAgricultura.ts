
import { useModuleCRUD } from '../useModuleCRUD';

// Tipos para o módulo Agricultura
export interface AgriculturaProdutor {
  id?: string;
  tenant_id?: string;
  nome_completo: string;
  cpf?: string;
  ctr?: string;
  endereco_residencial?: any;
  contato?: any;
  propriedades?: unknown[];
  area_total_hectares?: number;
  principais_cultivos?: string[];
  criacao_animais?: string[];
  renda_familiar_estimada?: number;
  dap?: boolean;
  ccir?: string;
  car?: string;
  sindicato_associacao?: string;
  cooperativa?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgriculturaAter {
  id?: string;
  tenant_id?: string;
  produtor_id?: string;
  tecnico_responsavel_id?: string;
  data_visita?: string;
  tipo_atendimento?: string;
  cultivos_orientados?: string[];
  problemas_identificados?: string[];
  solucoes_propostas?: string[];
  insumos_recomendados?: any;
  tecnologias_apresentadas?: string[];
  proxima_visita_agendada?: string;
  observacoes?: string;
  anexos?: string[];
  avaliacao_produtor?: number;
  resultados_obtidos?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgriculturaPrograma {
  id?: string;
  tenant_id?: string;
  nome: string;
  descricao?: string;
  tipo?: string;
  publico_alvo?: string;
  requisitos_participacao?: string[];
  data_inicio?: string;
  data_fim?: string;
  orcamento_total?: number;
  fonte_recurso?: string;
  coordenador_id?: string;
  produtores_beneficiados?: number;
  meta_beneficiados?: number;
  recursos_distribuidos?: any;
  criterios_selecao?: string[];
  processo_inscricao?: string;
  documentos_necessarios?: string[];
  relatorios_progresso?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgriculturaInsumo {
  id?: string;
  tenant_id?: string;
  nome: string;
  categoria?: string;
  tipo_cultivo?: string[];
  unidade_medida?: string;
  estoque_atual?: number;
  estoque_minimo?: number;
  valor_unitario?: number;
  fornecedor?: string;
  validade?: string;
  local_armazenamento?: string;
  especificacoes_tecnicas?: string;
  modo_uso?: string;
  restricoes_uso?: string[];
  registro_ministerio?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgriculturaDistribuicao {
  id?: string;
  tenant_id?: string;
  produtor_id?: string;
  programa_id?: string;
  insumo_id?: string;
  quantidade?: number;
  data_distribuicao?: string;
  responsavel_entrega_id?: string;
  finalidade?: string;
  area_aplicacao_hectares?: number;
  observacoes?: string;
  comprovante_entrega?: string;
  feedback_produtor?: string;
  resultados_obtidos?: string;
  created_at?: string;
  updated_at?: string;
}

// Hooks especializados para cada tabela
export const useAgricultoraProdutores = () => useModuleCRUD<AgriculturaProdutor>('agricultura_produtores');
export const useAgriculturaAter = () => useModuleCRUD<AgriculturaAter>('agricultura_ater');
export const useAgriculturaProgramas = () => useModuleCRUD<AgriculturaPrograma>('agricultura_programas');
export const useAgriculturaInsumos = () => useModuleCRUD<AgriculturaInsumo>('agricultura_insumos');
export const useAgriculturaDistribuicao = () => useModuleCRUD<AgriculturaDistribuicao>('agricultura_distribuicao');
