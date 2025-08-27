
import { useModuleCRUD } from '../useModuleCRUD';

// Tipos para o módulo Meio Ambiente
export interface MeioAmbienteLicenciamento {
  id?: string;
  tenant_id?: string;
  requerente_nome: string;
  requerente_cpf_cnpj?: string;
  atividade_licenciada?: string;
  tipo_licenca?: string;
  endereco_atividade?: any;
  area_impacto?: number;
  descricao_atividade?: string;
  estudos_ambientais?: string[];
  impactos_identificados?: string[];
  medidas_mitigadoras?: string[];
  condicoes_impostas?: string[];
  data_protocolo?: string;
  data_vistoria?: string;
  data_emissao?: string;
  data_validade?: string;
  numero_licenca?: string;
  valor_taxa?: number;
  responsavel_tecnico?: string;
  observacoes?: string;
  documentos_anexos?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MeioAmbienteDenuncia {
  id?: string;
  tenant_id?: string;
  denunciante_nome?: string;
  denunciante_contato?: any;
  anonimo?: boolean;
  local_ocorrencia?: any;
  coordenadas_gps?: any;
  tipo_denuncia?: string;
  descricao_fatos?: string;
  data_ocorrencia?: string;
  horario_ocorrencia?: string;
  frequencia_ocorrencia?: string;
  evidencias?: string[];
  responsavel_presumido?: string;
  urgencia?: string;
  riscos_identificados?: string[];
  data_vistoria?: string;
  responsavel_vistoria_id?: string;
  relatorio_vistoria?: string;
  medidas_adotadas?: string[];
  multa_aplicada?: boolean;
  valor_multa?: number;
  processo_judicial?: boolean;
  feedback_denunciante?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MeioAmbienteAreaProtegida {
  id?: string;
  tenant_id?: string;
  nome: string;
  tipo?: string;
  categoria?: string;
  area_hectares?: number;
  perimetro_km?: number;
  coordenadas_poligono?: any;
  bioma?: string;
  vegetacao_predominante?: string;
  fauna_presente?: string[];
  recursos_hidricos?: string[];
  uso_permitido?: string[];
  restricoes?: string[];
  plano_manejo?: string;
  gestor_responsavel?: string;
  atividades_monitoramento?: string[];
  ameacas_identificadas?: string[];
  acoes_conservacao?: string[];
  visitacao_permitida?: boolean;
  infraestrutura?: string[];
  estudos_realizados?: string[];
  legislacao_aplicavel?: string[];
  observacoes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MeioAmbienteEducacao {
  id?: string;
  tenant_id?: string;
  programa_nome: string;
  descricao?: string;
  publico_alvo?: string;
  faixa_etaria?: string;
  temas_abordados?: string[];
  metodologia?: string;
  local_realizacao?: string;
  carga_horaria?: number;
  numero_participantes?: number;
  educador_responsavel?: string;
  material_didatico?: string[];
  atividades_praticas?: string[];
  recursos_necessarios?: string[];
  parcerias?: string[];
  data_inicio?: string;
  data_fim?: string;
  cronograma?: any;
  orcamento?: number;
  resultados_alcancados?: string;
  avaliacoes?: any;
  certificacao?: boolean;
  multiplicadores_formados?: number;
  impacto_medido?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MeioAmbienteMonitoramento {
  id?: string;
  tenant_id?: string;
  tipo_monitoramento?: string;
  ponto_coleta?: string;
  coordenadas_gps?: any;
  parametros_monitorados?: any;
  frequencia_coleta?: string;
  equipamentos_utilizados?: string[];
  responsavel_coleta?: string;
  data_coleta?: string;
  horario_coleta?: string;
  resultados?: any;
  valores_referencia?: any;
  conformidade?: boolean;
  desvios_identificados?: string[];
  acoes_corretivas?: string[];
  relatorio_tecnico?: string;
  laudos_laboratoriais?: string[];
  tendencias_observadas?: string;
  recomendacoes?: string[];
  proxima_coleta?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Hooks especializados para cada tabela
export const useMeioAmbienteLicenciamento = () => useModuleCRUD<MeioAmbienteLicenciamento>('meio_ambiente_licenciamento');
export const useMeioAmbienteDenuncias = () => useModuleCRUD<MeioAmbienteDenuncia>('meio_ambiente_denuncias');
export const useMeioAmbienteAreasProtegidas = () => useModuleCRUD<MeioAmbienteAreaProtegida>('meio_ambiente_areas_protegidas');
export const useMeioAmbienteEducacao = () => useModuleCRUD<MeioAmbienteEducacao>('meio_ambiente_educacao');
export const useMeioAmbienteMonitoramento = () => useModuleCRUD<MeioAmbienteMonitoramento>('meio_ambiente_monitoramento');
