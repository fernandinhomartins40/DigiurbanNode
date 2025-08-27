import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario, UserProfilePadrao } from './common';

export interface AtendimentoUrbano extends BaseEntity {
  numero_protocolo: string;
  cidadao_nome: string;
  cidadao_cpf: string;
  cidadao_telefone: string;
  cidadao_email: string;
  tipo_atendimento: 'consulta' | 'solicitacao' | 'recurso' | 'informacao';
  assunto: string;
  descricao: string;
  localizacao_referencia?: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  status: StatusProcesso;
  prioridade: PrioridadePadrao;
  responsavel_id?: string;
  observacoes?: string;
  anexos_documentos: string[];
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ProjetoUrbano extends BaseEntity {
  numero_protocolo: string;
  
  // Dados do requerente
  requerente_nome: string;
  requerente_cpf_cnpj: string;
  requerente_telefone: string;
  requerente_email: string;
  requerente_endereco: string;
  
  // Tipo e categoria do projeto
  tipo_projeto: 'residencial' | 'comercial' | 'industrial' | 'misto' | 'publico';
  categoria_projeto: 'construcao_nova' | 'reforma' | 'ampliacao' | 'demolicao' | 'regularizacao';
  descricao_projeto: string;
  
  // Localização do projeto
  localizacao_projeto: {
    endereco_completo: string;
    numero_lote: string;
    numero_quadra: string;
    bairro: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
    area_terreno_m2: number;
    area_construida_m2: number;
  };
  
  status: 'protocolado' | 'em_analise' | 'aprovado' | 'aprovado_condicional' | 'negado' | 'suspenso';
  responsavel_tecnico_id?: string;
  data_protocolo: string;
  data_prazo_analise?: string;
  
  // Características técnicas
  caracteristicas_tecnicas: {
    numero_pavimentos: number;
    numero_unidades: number;
    uso_principal: string;
    coeficiente_aproveitamento: number;
    taxa_ocupacao: number;
    taxa_permeabilidade: number;
  };
  
  observacoes_tecnicas?: string;
  
  // Relacionamentos
  responsavel_tecnico?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface DocumentoProjeto extends BaseEntity {
  projeto_id: string;
  tipo_documento: string;
  nome_arquivo: string;
  url_arquivo: string;
  data_upload: string;
  status_documento: 'pendente' | 'aprovado' | 'rejeitado';
  observacoes_documento?: string;
}

export interface AnaliseProjetoUrbano extends BaseEntity {
  projeto_id: string;
  analista_id: string;
  tipo_analise: 'tecnica' | 'juridica' | 'urbanistica' | 'ambiental';
  status_analise: 'em_andamento' | 'aprovada' | 'rejeitada' | 'condicional';
  observacoes_analise: string;
  data_analise: string;
  exigencias: string[];
  prazo_atendimento_exigencias?: string;
  
  // Relacionamentos
  projeto?: Pick<ProjetoUrbano, 'id' | 'numero_protocolo'>;
  analista?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface PlanoUrbano extends BaseEntity {
  nome_plano: string;
  tipo_plano: 'diretor' | 'zoneamento' | 'uso_ocupacao' | 'mobiliario' | 'habitacao' | 'transporte';
  descricao_plano: string;
  status: 'elaboracao' | 'consulta_publica' | 'aprovado' | 'vigente' | 'revogado';
  data_inicio_elaboracao: string;
  data_aprovacao?: string;
  data_vigencia?: string;
  responsavel_elaboracao_id: string;
  objetivos_plano: string[];
  diretrizes_principais: string[];
  
  // Relacionamentos
  responsavel_elaboracao?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ZoneamentoUrbano extends BaseEntity {
  nome_zona: string;
  codigo_zona: string;
  tipo_zona: 'residencial' | 'comercial' | 'industrial' | 'mista' | 'especial' | 'rural';
  descricao_zona: string;
  
  // Delimitação geográfica
  delimitacao_geografica: Array<{
    latitude: number;
    longitude: number;
  }>;
  
  // Parâmetros urbanísticos
  parametros_urbanisticos: {
    coeficiente_aproveitamento_basico: number;
    coeficiente_aproveitamento_maximo: number;
    taxa_ocupacao_maxima: number;
    taxa_permeabilidade_minima: number;
    gabarito_maximo: number;
    recuos_obrigatorios: {
      frontal: number;
      lateral: number;
      fundos: number;
    };
  };
  
  usos_permitidos: string[];
  restricoes_especiais: string[];
  status: StatusBase;
  
  // Relacionamentos ao plano
  plano_origem_id?: string;
  plano_origem?: Pick<PlanoUrbano, 'id' | 'nome_plano'>;
}

export interface LicencaUrbanistica extends BaseEntity {
  numero_licenca: string;
  projeto_id: string;
  tipo_licenca: 'construir' | 'demolir' | 'reformar' | 'ampliar' | 'ocupar';
  status: 'emitida' | 'suspensa' | 'vencida' | 'cancelada';
  data_emissao: string;
  data_validade: string;
  data_vencimento?: string;
  
  // Condições da licença
  condicoes_licenca: string[];
  restricoes_especiais: string[];
  
  responsavel_emissao_id: string;
  
  // Relacionamentos
  projeto?: Pick<ProjetoUrbano, 'id' | 'numero_protocolo'>;
  responsavel_emissao?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface VistoriaUrbanistica extends BaseEntity {
  projeto_id?: string;
  licenca_id?: string;
  tipo_vistoria: 'inicial' | 'seguimento' | 'final' | 'fiscalizacao';
  motivo_vistoria: string;
  data_vistoria: string;
  fiscal_responsavel_id: string;
  
  // Resultado da vistoria
  situacao_encontrada: 'conforme' | 'nao_conforme' | 'parcialmente_conforme';
  irregularidades_encontradas: string[];
  observacoes_vistoria: string;
  fotos_vistoria: string[];
  
  // Medidas adotadas
  medidas_corretivas: string[];
  prazo_regularizacao?: string;
  
  // Relacionamentos
  projeto?: Pick<ProjetoUrbano, 'id' | 'numero_protocolo'>;
  licenca?: Pick<LicencaUrbanistica, 'id' | 'numero_licenca'>;
  fiscal_responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ConsultaPrevia extends BaseEntity {
  numero_consulta: string;
  consulente_nome: string;
  consulente_cpf_cnpj: string;
  consulente_telefone: string;
  consulente_email: string;
  
  // Objeto da consulta
  assunto_consulta: string;
  descricao_consulta: string;
  localizacao_consulta?: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  
  status: 'protocolada' | 'em_analise' | 'respondida' | 'arquivada';
  data_protocolo: string;
  data_resposta?: string;
  resposta_tecnica?: string;
  responsavel_resposta_id?: string;
  
  // Relacionamentos
  responsavel_resposta?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ProfissionalPlanejamento extends BaseEntity, PessoaFisicaPadrao {
  // Identificação profissional
  matricula_funcional: string;
  cau?: string; // Conselho de Arquitetura e Urbanismo
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
  setores_responsabilidade?: string[];
  
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
  tipo_atendimento: 'consulta' | 'solicitacao' | 'recurso' | 'informacao';
  assunto: string;
  descricao: string;
  prioridade: PrioridadePadrao;
  localizacao_referencia?: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface SolicitacaoProjeto {
  requerente_nome: string;
  requerente_cpf_cnpj: string;
  requerente_telefone: string;
  requerente_email: string;
  requerente_endereco: string;
  tipo_projeto: 'residencial' | 'comercial' | 'industrial' | 'misto' | 'publico';
  categoria_projeto: 'construcao_nova' | 'reforma' | 'ampliacao' | 'demolicao' | 'regularizacao';
  descricao_projeto: string;
  localizacao_projeto: {
    endereco_completo: string;
    numero_lote: string;
    numero_quadra: string;
    bairro: string;
    area_terreno_m2: number;
    area_construida_m2: number;
  };
}

export interface SolicitacaoConsulta {
  consulente_nome: string;
  consulente_cpf_cnpj: string;
  consulente_telefone: string;
  consulente_email: string;
  assunto_consulta: string;
  descricao_consulta: string;
  localizacao_consulta?: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
}

// Filtros
export interface FiltrosPlanejamento {
  status?: StatusBase | StatusProcesso;
  tipo?: string;
  categoria?: string;
  data_inicio?: string;
  data_fim?: string;
  responsavel_id?: string;
  busca?: string;
}

export interface EstadoPlanejamento {
  atendimentos: AtendimentoUrbano[];
  projetos: ProjetoUrbano[];
  planos: PlanoUrbano[];
  zoneamentos: ZoneamentoUrbano[];
  licencas: LicencaUrbanistica[];
  vistorias: VistoriaUrbanistica[];
  consultas_previas: ConsultaPrevia[];
  profissionais: ProfissionalPlanejamento[];
  carregando: boolean;
  erro: string | null;
}