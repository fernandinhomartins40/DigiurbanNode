import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario, UserProfilePadrao } from './common';

export interface AtendimentoHabitacao extends BaseEntity {
  numero_protocolo: string;
  cidadao_nome: string;
  cidadao_cpf: string;
  cidadao_telefone: string;
  cidadao_email: string;
  tipo_atendimento: 'inscricao' | 'informacao' | 'reclamacao' | 'recurso';
  assunto: string;
  descricao: string;
  status: StatusProcesso;
  prioridade: PrioridadePadrao;
  responsavel_id?: string;
  observacoes?: string;
  anexos_documentos: string[];
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface InscricaoPrograma extends BaseEntity {
  numero_inscricao: string;
  programa_id: string;
  
  // Dados do cidadão
  cidadao_nome: string;
  cidadao_cpf: string;
  cidadao_rg: string;
  cidadao_data_nascimento: string;
  cidadao_telefone: string;
  cidadao_email: string;
  endereco: EnderecoPadrao;
  
  // Situação familiar
  estado_civil: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  numero_filhos: number;
  renda_familiar: number;
  composicao_familiar: Array<{
    nome: string;
    parentesco: string;
    idade: number;
    renda_individual: number;
  }>;
  
  // Documentos
  documentos_anexos: {
    tipo_documento: string;
    nome_arquivo: string;
    url_arquivo: string;
    data_upload: string;
    status_documento: 'pendente' | 'aprovado' | 'rejeitado';
  }[];
  
  // Status da inscrição
  status: 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada' | 'aguardando_documentos';
  data_analise?: string;
  pontuacao_obtida?: number;
  observacoes_analise?: string;
  analista_id?: string;
  
  // Relacionamentos
  programa?: Pick<ProgramaHabitacional, 'id' | 'nome' | 'tipo_programa'>;
  analista?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ProgramaHabitacional extends BaseEntity {
  nome: string;
  descricao: string;
  tipo_programa: 'casa_propria' | 'aluguel_social' | 'reforma' | 'regularizacao';
  status: StatusBase;
  
  // Critérios de elegibilidade
  criterios_elegibilidade: {
    renda_maxima: number;
    renda_minima: number;
    idade_minima?: number;
    idade_maxima?: number;
    tempo_residencia_minimo: number;
    criterios_adicionais: string[];
  };
  
  beneficios_oferecidos: string[];
  
  // Controle de vagas
  vagas_totais: number;
  vagas_ocupadas: number;
  vagas_disponiveis: number;
  
  // Período de inscrição
  data_inicio_inscricoes: string;
  data_fim_inscricoes: string;
  
  documentos_necessarios: string[];
  responsavel_id: string;
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface UnidadeHabitacional extends BaseEntity {
  codigo_unidade: string;
  endereco: EnderecoPadrao;
  
  // Coordenadas geográficas
  coordenadas_geograficas: {
    latitude: number;
    longitude: number;
  };
  
  // Tipo e especificações
  tipo_unidade: 'casa' | 'apartamento' | 'lote';
  especificacoes_tecnicas: {
    area_construida: number;
    numero_quartos: number;
    numero_banheiros: number;
    possui_garagem: boolean;
    area_terreno?: number;
  };
  
  status: 'disponivel' | 'ocupada' | 'em_construcao' | 'em_reforma' | 'indisponivel';
  programa_id: string;
  
  // Valores
  valor_venda?: number;
  valor_aluguel?: number;
  
  // Beneficiário atual
  beneficiario_nome?: string;
  beneficiario_cpf?: string;
  data_ocupacao?: string;
  
  // Infraestrutura disponível
  infraestrutura_disponivel: {
    agua_potavel: boolean;
    rede_esgoto: boolean;
    energia_eletrica: boolean;
    internet_fibra: boolean;
    transporte_publico: boolean;
    escola_proxima: boolean;
    posto_saude_proximo: boolean;
  };
  
  fotos_unidade: string[];
  documentos_unidade: string[];
  
  // Relacionamentos
  programa?: Pick<ProgramaHabitacional, 'id' | 'nome'>;
}

export interface ProcessoRegularizacao extends BaseEntity {
  numero_processo: string;
  
  // Dados do interessado
  interessado_nome: string;
  interessado_cpf: string;
  interessado_telefone: string;
  interessado_email: string;
  
  // Dados do imóvel
  endereco_imovel: string;
  area_imovel: number;
  coordenadas_imovel: {
    latitude: number;
    longitude: number;
  };
  tipo_ocupacao: 'proprio' | 'posse' | 'cessao' | 'outro';
  tempo_ocupacao_anos: number;
  
  // Processo
  tipo_regularizacao: 'usucapiao' | 'doacao' | 'compra_venda' | 'demarcacao';
  etapa_atual: 'protocolo' | 'analise_documental' | 'vistoria' | 'medicao' | 'aprovacao' | 'titulo';
  status: StatusProcesso;
  
  // Documentos
  documentos_processo: {
    tipo_documento: string;
    nome_arquivo: string;
    url_arquivo: string;
    data_upload: string;
    status_documento: 'pendente' | 'aprovado' | 'rejeitado';
  }[];
  
  // Vistoria técnica
  vistoria_realizada?: {
    data_vistoria: string;
    tecnico_responsavel: string;
    observacoes_tecnicas: string;
    fotos_vistoria: string[];
  };
  
  data_previsao_conclusao?: string;
  responsavel_processo_id?: string;
  
  // Relacionamentos
  responsavel_processo?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface HistoricoProcessoRegularizacao extends BaseEntity {
  processo_id: string;
  etapa_processo: string;
  observacao: string;
  responsavel_id: string;
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface VisitaTecnica extends BaseEntity {
  unidade_habitacional_id?: string;
  processo_regularizacao_id?: string;
  tecnico_responsavel_id: string;
  data_agendada: string;
  data_realizada?: string;
  status: 'agendada' | 'realizada' | 'cancelada' | 'remarcada';
  observacoes_tecnicas?: string;
  fotos_visita: string[];
  relatorio_tecnico?: string;
  
  // Relacionamentos
  tecnico_responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
  unidade?: Pick<UnidadeHabitacional, 'id' | 'codigo_unidade'>;
}

export interface ProfissionalHabitacao extends BaseEntity, PessoaFisicaPadrao {
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
  programas_responsavel?: string[];
  
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
  tipo_atendimento: 'inscricao' | 'informacao' | 'reclamacao' | 'recurso';
  assunto: string;
  descricao: string;
  prioridade: PrioridadePadrao;
}

export interface SolicitacaoInscricao {
  programa_id: string;
  cidadao_nome: string;
  cidadao_cpf: string;
  cidadao_rg: string;
  cidadao_data_nascimento: string;
  cidadao_telefone: string;
  cidadao_email: string;
  endereco: EnderecoPadrao;
  estado_civil: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  numero_filhos: number;
  renda_familiar: number;
  composicao_familiar: Array<{
    nome: string;
    parentesco: string;
    idade: number;
    renda_individual: number;
  }>;
}

export interface SolicitacaoRegularizacao {
  interessado_nome: string;
  interessado_cpf: string;
  interessado_telefone: string;
  interessado_email: string;
  endereco_imovel: string;
  area_imovel: number;
  tipo_ocupacao: 'proprio' | 'posse' | 'cessao' | 'outro';
  tempo_ocupacao_anos: number;
  tipo_regularizacao: 'usucapiao' | 'doacao' | 'compra_venda' | 'demarcacao';
}

// Filtros
export interface FiltrosHabitacao {
  status?: StatusBase | StatusProcesso;
  programa_id?: string;
  tipo_atendimento?: string;
  data_inicio?: string;
  data_fim?: string;
  responsavel_id?: string;
  busca?: string;
}

export interface EstadoHabitacao {
  atendimentos: AtendimentoHabitacao[];
  inscricoes: InscricaoPrograma[];
  programas: ProgramaHabitacional[];
  unidades: UnidadeHabitacional[];
  processos_regularizacao: ProcessoRegularizacao[];
  visitas_tecnicas: VisitaTecnica[];
  profissionais: ProfissionalHabitacao[];
  carregando: boolean;
  erro: string | null;
}