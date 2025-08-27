import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario, UserProfilePadrao } from './common';

export interface AtendimentoAmbiental extends BaseEntity {
  numero_protocolo: string;
  cidadao_nome: string;
  cidadao_cpf: string;
  cidadao_telefone: string;
  cidadao_email: string;
  tipo_atendimento: 'licenciamento' | 'denuncia' | 'consulta' | 'recurso';
  assunto: string;
  descricao: string;
  localizacao_ocorrencia?: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  status: 'aberto' | 'em_analise' | 'em_vistoria' | 'resolvido' | 'indeferido';
  prioridade: PrioridadePadrao;
  responsavel_id?: string;
  observacoes?: string;
  anexos_documentos: string[];
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface LicencaAmbiental extends BaseEntity {
  numero_licenca: string;
  
  // Dados do requerente
  requerente_nome: string;
  requerente_cpf_cnpj: string;
  requerente_telefone: string;
  requerente_email: string;
  requerente_endereco: string;
  
  // Tipo e atividade
  tipo_licenca: 'previa' | 'instalacao' | 'operacao' | 'corretiva';
  atividade_categoria: string;
  descricao_atividade: string;
  
  // Localização da atividade
  localizacao_atividade: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
    area_total_m2: number;
  };
  
  status: 'protocolada' | 'em_analise' | 'em_vistoria' | 'aprovada' | 'negada' | 'vencida';
  data_protocolo: string;
  data_vencimento?: string;
  condicoes_licenca: string[];
  responsavel_analise_id?: string;
  
  // Relacionamentos
  responsavel_analise?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface DocumentoLicenca extends BaseEntity {
  licenca_id: string;
  tipo_documento: string;
  nome_arquivo: string;
  url_arquivo: string;
  data_upload: string;
  status_documento: 'pendente' | 'aprovado' | 'rejeitado';
}

export interface HistoricoLicenca extends BaseEntity {
  licenca_id: string;
  acao_realizada: string;
  observacao: string;
  responsavel_id: string;
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface DenunciaAmbiental extends BaseEntity {
  numero_protocolo: string;
  
  // Dados do denunciante (opcional para denúncia anônima)
  denunciante_nome?: string;
  denunciante_cpf?: string;
  denunciante_telefone?: string;
  denunciante_email?: string;
  denuncia_anonima: boolean;
  
  // Tipo e descrição da violação
  tipo_violacao: 'desmatamento' | 'poluicao_agua' | 'poluicao_ar' | 'descarte_irregular' | 'ruido' | 'outros';
  descricao_violacao: string;
  
  // Localização
  localizacao_ocorrencia: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  
  gravidade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'registrada' | 'em_investigacao' | 'em_vistoria' | 'comprovada' | 'improcedente' | 'resolvida';
  data_vistoria?: string;
  fotos_evidencias: string[];
  observacoes_investigacao?: string;
  responsavel_investigacao_id?: string;
  
  // Relacionamentos
  responsavel_investigacao?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface AreaProtegida extends BaseEntity {
  nome_area: string;
  tipo_protecao: 'reserva_legal' | 'app' | 'parque' | 'reserva_biologica' | 'arie' | 'rppn';
  descricao: string;
  
  // Localização e delimitação
  localizacao_central: {
    coordenadas_centrais: {
      latitude: number;
      longitude: number;
    };
    poligono_delimitacao: Array<{
      latitude: number;
      longitude: number;
    }>;
  };
  
  area_total_hectares: number;
  status: StatusBase;
  legislacao_base: string;
  restricoes_uso: string[];
  responsavel_id: string;
  
  // Características ambientais
  caracteristicas_ambientais: {
    tipos_vegetacao: string[];
    especies_fauna: string[];
    recursos_hidricos: string[];
  };
  
  fotos_area: string[];
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ProgramaAmbiental extends BaseEntity {
  nome_programa: string;
  tipo_programa: 'educacao' | 'conservacao' | 'recuperacao' | 'monitoramento';
  descricao: string;
  objetivos_programa: string[];
  publico_alvo: string;
  status: 'planejamento' | 'em_andamento' | 'concluido' | 'suspenso';
  data_inicio: string;
  data_fim_prevista?: string;
  responsavel_id: string;
  parceiros_institucionais: string[];
  orcamento_previsto: number;
  orcamento_utilizado: number;
  
  // Indicadores de performance
  indicadores_programa: {
    nome_indicador: string;
    meta_estabelecida: number;
    valor_realizado: number;
    unidade_medida: string;
  }[];
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface AtividadePrograma extends BaseEntity {
  programa_id: string;
  nome_atividade: string;
  descricao: string;
  data_inicio: string;
  data_fim_prevista?: string;
  status: StatusProcesso;
  responsavel_atividade_id?: string;
  
  // Relacionamentos
  programa?: Pick<ProgramaAmbiental, 'id' | 'nome_programa'>;
  responsavel_atividade?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface CampanhaAmbiental extends BaseEntity {
  nome_campanha: string;
  tema_campanha: 'agua' | 'energia' | 'residuos' | 'biodiversidade' | 'mudancas_climaticas';
  descricao: string;
  objetivos_campanha: string[];
  publico_alvo: string;
  data_inicio: string;
  data_fim: string;
  status: 'planejada' | 'ativa' | 'concluida' | 'cancelada';
  canais_divulgacao: string[];
  responsavel_id: string;
  
  // Métricas de impacto
  metricas_impacto: {
    alcance_estimado: number;
    numero_participantes: number;
    taxa_engajamento: number;
  };
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface MaterialCampanha extends BaseEntity {
  campanha_id: string;
  tipo_material: string;
  nome_material: string;
  url_arquivo: string;
  
  // Relacionamentos
  campanha?: Pick<CampanhaAmbiental, 'id' | 'nome_campanha'>;
}

export interface IndicadorAmbiental extends BaseEntity {
  nome_indicador: string;
  categoria_indicador: 'qualidade_ar' | 'qualidade_agua' | 'biodiversidade' | 'residuos' | 'energia' | 'carbono';
  unidade_medida: string;
  frequencia_medicao: 'diaria' | 'semanal' | 'mensal' | 'trimestral' | 'anual';
  meta_anual: number;
  
  // Ponto de monitoramento
  ponto_monitoramento: {
    nome_ponto: string;
    coordenadas_ponto: {
      latitude: number;
      longitude: number;
    };
  };
  
  responsavel_medicao_id: string;
  data_ultima_atualizacao: string;
  
  // Relacionamentos
  responsavel_medicao?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface MedicaoIndicador extends BaseEntity {
  indicador_id: string;
  data_medicao: string;
  valor_medido: number;
  observacoes_medicao?: string;
  responsavel_medicao_id: string;
  
  // Relacionamentos
  indicador?: Pick<IndicadorAmbiental, 'id' | 'nome_indicador'>;
  responsavel_medicao?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface OcorrenciaAmbiental extends BaseEntity {
  tipo_ocorrencia: 'acidente' | 'vazamento' | 'incendio' | 'erosao' | 'contaminacao';
  descricao_ocorrencia: string;
  
  // Localização
  localizacao_ocorrencia: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  
  gravidade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'ativa' | 'controlada' | 'resolvida';
  data_ocorrencia: string;
  data_resolucao?: string;
  responsavel_atendimento_id: string;
  medidas_adotadas: string[];
  fotos_ocorrencia: string[];
  impactos_identificados: string[];
  
  // Relacionamentos
  responsavel_atendimento?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ProfissionalMeioAmbiente extends BaseEntity, PessoaFisicaPadrao {
  // Identificação profissional
  matricula_funcional: string;
  crea?: string; // Conselho Regional de Engenharia e Agronomia
  
  // Contato
  contato: ContatoPadrao;
  endereco?: EnderecoPadrao;
  
  // Qualificação
  formacao_academica: {
    nivel: 'ensino_medio' | 'superior' | 'pos_graduacao' | 'mestrado' | 'doutorado';
    curso: string;
    instituicao: string;
    ano_conclusao: number;
  }[];
  
  // Especialização
  areas_especializacao: string[];
  experiencia_anos?: number;
  
  // Trabalho
  cargo: string;
  carga_horaria_semanal: number;
  areas_responsabilidade?: string[];
  
  // Datas
  data_admissao: string;
  data_demissao?: string;
  
  status: StatusBase;
  observacoes?: string;
}

// Interfaces para formulários
export interface SolicitacaoAtendimento {
  cidadao_nome: string;
  cidadao_cpf: string;
  cidadao_telefone: string;
  cidadao_email: string;
  tipo_atendimento: 'licenciamento' | 'denuncia' | 'consulta' | 'recurso';
  assunto: string;
  descricao: string;
  prioridade: PrioridadePadrao;
  localizacao_ocorrencia?: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface SolicitacaoLicenca {
  requerente_nome: string;
  requerente_cpf_cnpj: string;
  requerente_telefone: string;
  requerente_email: string;
  requerente_endereco: string;
  tipo_licenca: 'previa' | 'instalacao' | 'operacao' | 'corretiva';
  atividade_categoria: string;
  descricao_atividade: string;
  localizacao_atividade: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
    area_total_m2: number;
  };
}

export interface SolicitacaoDenuncia {
  denunciante_nome?: string;
  denunciante_cpf?: string;
  denunciante_telefone?: string;
  denunciante_email?: string;
  denuncia_anonima: boolean;
  tipo_violacao: 'desmatamento' | 'poluicao_agua' | 'poluicao_ar' | 'descarte_irregular' | 'ruido' | 'outros';
  descricao_violacao: string;
  localizacao_ocorrencia: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  gravidade: 'baixa' | 'media' | 'alta' | 'critica';
}

// Filtros
export interface FiltrosMeioAmbiente {
  status?: StatusBase | StatusProcesso;
  tipo?: string;
  categoria?: string;
  gravidade?: string;
  data_inicio?: string;
  data_fim?: string;
  responsavel_id?: string;
  busca?: string;
}

export interface EstadoMeioAmbiente {
  atendimentos: AtendimentoAmbiental[];
  licencas: LicencaAmbiental[];
  denuncias: DenunciaAmbiental[];
  areas_protegidas: AreaProtegida[];
  programas: ProgramaAmbiental[];
  campanhas: CampanhaAmbiental[];
  indicadores: IndicadorAmbiental[];
  ocorrencias: OcorrenciaAmbiental[];
  profissionais: ProfissionalMeioAmbiente[];
  carregando: boolean;
  erro: string | null;
}