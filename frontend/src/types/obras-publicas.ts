import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario, UserProfilePadrao } from './common';

export interface AtendimentoObras extends BaseEntity {
  numero_protocolo: string;
  cidadao_nome: string;
  cidadao_cpf: string;
  cidadao_telefone: string;
  cidadao_email: string;
  tipo_atendimento: 'solicitacao_obra' | 'reclamacao_obra' | 'informacao_obra' | 'vistoria' | 'outros';
  assunto: string;
  descricao: string;
  localizacao_solicitacao?: {
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

export interface ObraPublica extends BaseEntity {
  numero_contrato: string;
  nome_obra: string;
  descricao_obra: string;
  categoria_obra: 'infraestrutura' | 'edificacao' | 'saneamento' | 'pavimentacao' | 'drenagem' | 'iluminacao' | 'paisagismo';
  tipo_obra: 'nova' | 'reforma' | 'ampliacao' | 'manutencao' | 'reconstrucao';
  
  // Localização
  localizacao_obra: {
    endereco_completo: string;
    bairro: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
    area_total_m2: number;
  };
  
  status: 'planejada' | 'licitacao' | 'contratada' | 'em_andamento' | 'paralisada' | 'concluida' | 'cancelada';
  
  // Dados da empresa contratada
  empresa_contratada: {
    nome_empresa: string;
    cnpj: string;
    responsavel_tecnico: string;
    telefone_contato: string;
    email_contato: string;
  };
  
  // Orçamento
  orcamento_obra: {
    valor_contratado: number;
    valor_executado: number;
    fonte_recurso: string;
    numero_empenho?: string;
  };
  
  // Cronograma
  cronograma_obra: {
    data_inicio: string;
    data_previsao_termino: string;
    data_termino_real?: string;
    percentual_concluido: number;
  };
  
  // Fiscalização
  fiscalizacao_obra: {
    responsavel_fiscalizacao_id: string;
    data_ultima_vistoria?: string;
    data_proxima_vistoria?: string;
  };
  
  observacoes_obra?: string;
  
  // Relacionamentos
  responsavel_fiscalizacao?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface DocumentoObra extends BaseEntity {
  obra_id: string;
  tipo_documento: string;
  nome_arquivo: string;
  url_arquivo: string;
  data_upload: string;
  responsavel_upload_id: string;
  
  // Relacionamentos
  obra?: Pick<ObraPublica, 'id' | 'nome_obra'>;
  responsavel_upload?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface FotoObra extends BaseEntity {
  obra_id: string;
  url_foto: string;
  legenda_foto: string;
  data_foto: string;
  fase_obra: 'antes' | 'durante' | 'depois';
  responsavel_foto_id: string;
  
  // Relacionamentos
  obra?: Pick<ObraPublica, 'id' | 'nome_obra'>;
  responsavel_foto?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface PequenaIntervencao extends BaseEntity {
  numero_ordem_servico: string;
  descricao_intervencao: string;
  tipo_intervencao: 'tapa_buraco' | 'limpeza_terreno' | 'poda_arvores' | 'pintura' | 'sinalizacao' | 'reparo_calcada' | 'outros';
  
  // Localização
  localizacao_intervencao: {
    endereco_completo: string;
    bairro: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  
  status: 'solicitada' | 'agendada' | 'em_execucao' | 'concluida' | 'cancelada';
  prioridade: PrioridadePadrao;
  data_solicitacao: string;
  data_agendamento?: string;
  data_execucao?: string;
  data_conclusao?: string;
  
  // Equipe responsável
  equipe_responsavel_id?: string;
  responsavel_execucao_id?: string;
  
  // Recursos
  materiais_utilizados?: string[];
  equipamentos_utilizados?: string[];
  custo_estimado?: number;
  custo_real?: number;
  
  observacoes_execucao?: string;
  fotos_antes: string[];
  fotos_depois: string[];
  
  // Relacionamentos
  equipe_responsavel?: Pick<EquipeObras, 'id' | 'nome_equipe'>;
  responsavel_execucao?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface EquipeObras extends BaseEntity {
  nome_equipe: string;
  descricao_equipe: string;
  especialidade: string[];
  lider_equipe_id: string;
  membros_ids: string[];
  equipamentos_disponiveis: string[];
  status: StatusBase;
  
  // Relacionamentos
  lider_equipe?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
  membros?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>[];
}

export interface VistoriaObra extends BaseEntity {
  obra_id?: string;
  pequena_intervencao_id?: string;
  tipo_vistoria: 'rotina' | 'reclamacao' | 'final' | 'emergencial';
  data_vistoria: string;
  fiscal_responsavel_id: string;
  
  // Avaliação
  situacao_encontrada: 'conforme' | 'nao_conforme' | 'parcialmente_conforme';
  percentual_execucao: number;
  observacoes_vistoria: string;
  
  // Problemas identificados
  problemas_identificados: string[];
  recomendacoes: string[];
  prazo_correcao?: string;
  
  fotos_vistoria: string[];
  relatorio_vistoria?: string;
  
  // Relacionamentos
  obra?: Pick<ObraPublica, 'id' | 'nome_obra'>;
  pequena_intervencao?: Pick<PequenaIntervencao, 'id' | 'descricao_intervencao'>;
  fiscal_responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface MaterialObra extends BaseEntity {
  nome_material: string;
  categoria_material: string;
  unidade_medida: string;
  estoque_atual: number;
  estoque_minimo: number;
  valor_unitario: number;
  fornecedor_preferencial?: string;
  status: StatusBase;
  observacoes?: string;
}

export interface MovimentacaoMaterial extends BaseEntity {
  material_id: string;
  obra_id?: string;
  pequena_intervencao_id?: string;
  tipo_movimentacao: 'entrada' | 'saida' | 'transferencia' | 'ajuste';
  quantidade: number;
  valor_total: number;
  responsavel_movimentacao_id: string;
  observacoes_movimentacao?: string;
  numero_nota_fiscal?: string;
  
  // Relacionamentos
  material?: Pick<MaterialObra, 'id' | 'nome_material'>;
  obra?: Pick<ObraPublica, 'id' | 'nome_obra'>;
  pequena_intervencao?: Pick<PequenaIntervencao, 'id' | 'descricao_intervencao'>;
  responsavel_movimentacao?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ProfissionalObras extends BaseEntity, PessoaFisicaPadrao {
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
  equipes_vinculadas?: string[];
  
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
  tipo_atendimento: 'solicitacao_obra' | 'reclamacao_obra' | 'informacao_obra' | 'vistoria' | 'outros';
  assunto: string;
  descricao: string;
  prioridade: PrioridadePadrao;
  localizacao_solicitacao?: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface SolicitacaoObra {
  nome_obra: string;
  descricao_obra: string;
  categoria_obra: 'infraestrutura' | 'edificacao' | 'saneamento' | 'pavimentacao' | 'drenagem' | 'iluminacao' | 'paisagismo';
  tipo_obra: 'nova' | 'reforma' | 'ampliacao' | 'manutencao' | 'reconstrucao';
  localizacao_obra: {
    endereco_completo: string;
    bairro: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
    area_total_m2: number;
  };
  orcamento_estimado: number;
  fonte_recurso: string;
  data_inicio_prevista: string;
  data_termino_prevista: string;
}

export interface SolicitacaoIntervencao {
  descricao_intervencao: string;
  tipo_intervencao: 'tapa_buraco' | 'limpeza_terreno' | 'poda_arvores' | 'pintura' | 'sinalizacao' | 'reparo_calcada' | 'outros';
  localizacao_intervencao: {
    endereco_completo: string;
    bairro: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  prioridade: PrioridadePadrao;
  materiais_necessarios?: string[];
  equipamentos_necessarios?: string[];
}

// Filtros
export interface FiltrosObras {
  status?: StatusBase | StatusProcesso;
  categoria?: string;
  tipo?: string;
  prioridade?: PrioridadePadrao;
  data_inicio?: string;
  data_fim?: string;
  responsavel_id?: string;
  busca?: string;
}

export interface EstadoObras {
  atendimentos: AtendimentoObras[];
  obras: ObraPublica[];
  pequenas_intervencoes: PequenaIntervencao[];
  equipes: EquipeObras[];
  vistorias: VistoriaObra[];
  materiais: MaterialObra[];
  movimentacoes_material: MovimentacaoMaterial[];
  profissionais: ProfissionalObras[];
  carregando: boolean;
  erro: string | null;
}