import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario, UserProfilePadrao } from './common';

export interface AtendimentoGabinete extends BaseEntity {
  solicitante_nome: string;
  solicitante_cpf?: string;
  solicitante_telefone?: string;
  tipo_atendimento: 'audiencia' | 'reclamacao' | 'solicitacao' | 'denuncia';
  assunto: string;
  detalhes: string;
  status: StatusProcesso;
  responsavel_id: string;
  data_atendimento: string;
  urgente: boolean;
  anexos?: string[];
  observacoes?: string;
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo' | 'email'>;
}

export interface OrdemServico extends BaseEntity {
  setor_destino: string;
  assunto: string;
  descricao: string;
  data_envio: string;
  prazo_conclusao?: string;
  status: StatusProcesso;
  prioridade: PrioridadePadrao;
  responsavel_envio_id: string;
  responsavel_execucao_id?: string;
  responsavel_execucao_email?: string;
  documentos_anexos?: {
    nome: string;
    tamanho_bytes: number;
    data_upload: string;
    url: string;
  }[];
  
  // Relacionamentos
  responsavel_envio?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
  responsavel_execucao?: Pick<UserProfilePadrao, 'id' | 'nome_completo' | 'email'>;
}

export interface HistoricoOrdemServico extends BaseEntity {
  ordem_servico_id: string;
  acao: string;
  observacoes?: string;
  autor_id: string;
  
  // Relacionamentos
  autor?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ComentarioOrdemServico extends BaseEntity {
  ordem_servico_id: string;
  texto: string;
  autor_id: string;
  
  // Relacionamentos
  autor?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface DemandaPopular extends BaseEntity {
  descricao: string;
  bairro: string;
  regiao: string;
  categoria_demanda: string;
  status: StatusProcesso;
  prioridade: PrioridadePadrao;
  prazo_atendimento?: string;
  solicitante_nome?: string;
  solicitante_documento?: string;
  endereco_completo?: string;
  coordenadas_geograficas?: {
    latitude: number;
    longitude: number;
  };
  fotos_anexas?: string[];
  responsavel_id?: string;
  resolucao_final?: string;
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ProjetoEstrategico extends BaseEntity {
  nome: string;
  descricao: string;
  status: 'planejamento' | 'em_andamento' | 'execucao' | 'concluido' | 'pausado' | 'cancelado';
  prioridade: PrioridadePadrao;
  progresso_percentual: number;
  data_inicio: string;
  data_fim_prevista: string;
  data_fim_real?: string;
  orcamento_previsto: number;
  orcamento_utilizado: number;
  responsavel_id: string;
  equipe_ids: string[];
  metas: {
    descricao: string;
    concluida: boolean;
    data_conclusao?: string;
  }[];
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
  equipe?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>[];
}

export interface CompromissoAgenda extends BaseEntity {
  titulo: string;
  tipo_compromisso: 'reuniao' | 'audiencia' | 'evento' | 'videoconferencia';
  data_compromisso: string;
  horario_inicio: string;
  horario_fim: string;
  local_evento: string;
  participantes_ids: string[];
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado';
  prioridade: PrioridadePadrao;
  descricao: string;
  observacoes?: string;
  organizador_id: string;
  
  // Relacionamentos
  organizador?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
  participantes?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>[];
}

export interface IndicadorPerformance extends BaseEntity {
  nome_indicador: string;
  categoria: 'atendimento' | 'financeiro' | 'infraestrutura' | 'transparencia';
  valor_atual: number;
  meta_estabelecida: number;
  unidade_medida: string;
  status: 'sucesso' | 'atencao' | 'critico';
  tendencia: 'crescimento' | 'decrescimento' | 'estavel';
  descricao: string;
  responsavel_id: string;
  data_ultima_atualizacao: string;
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ComunicacaoOficial extends BaseEntity {
  titulo: string;
  tipo_documento: 'decreto' | 'portaria' | 'nota' | 'comunicado' | 'edital';
  status: 'rascunho' | 'revisao' | 'aprovado' | 'agendado' | 'publicado' | 'arquivado';
  autor_id: string;
  data_publicacao_agendada?: string;
  canal_publicacao: string;
  conteudo_texto: string;
  anexos_documentos: string[];
  numero_visualizacoes: number;
  
  // Relacionamentos
  autor?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ProcessoAuditoria extends BaseEntity {
  titulo: string;
  categoria_auditoria: string;
  status: 'planejada' | 'em_andamento' | 'concluida' | 'suspensa';
  data_inicio: string;
  data_fim_prevista: string;
  data_fim_real?: string;
  responsavel_id: string;
  valor_auditado: number;
  numero_achados: number;
  numero_recomendacoes: number;
  recomendacoes_implementadas: number;
  relatorio_final_url?: string;
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

// Interfaces para formulários
export interface SolicitacaoAtendimento {
  solicitante_nome: string;
  solicitante_cpf?: string;
  solicitante_telefone?: string;
  tipo_atendimento: 'audiencia' | 'reclamacao' | 'solicitacao' | 'denuncia';
  assunto: string;
  detalhes: string;
  urgente: boolean;
  data_atendimento: string;
}

export interface SolicitacaoOrdemServico {
  setor_destino: string;
  assunto: string;
  descricao: string;
  prazo_conclusao?: string;
  prioridade: PrioridadePadrao;
  responsavel_execucao_email?: string;
}

export interface SolicitacaoDemanda {
  descricao: string;
  bairro: string;
  regiao: string;
  categoria_demanda: string;
  prioridade: PrioridadePadrao;
  solicitante_nome?: string;
  solicitante_documento?: string;
  endereco_completo?: string;
  coordenadas_geograficas?: {
    latitude: number;
    longitude: number;
  };
}

// Filtros
export interface FiltrosGabinete {
  status?: StatusProcesso;
  prioridade?: PrioridadePadrao;
  tipo?: string;
  data_inicio?: string;
  data_fim?: string;
  responsavel_id?: string;
  busca?: string;
}

export interface EstadoGabinete {
  atendimentos: AtendimentoGabinete[];
  ordens_servico: OrdemServico[];
  demandas: DemandaPopular[];
  projetos: ProjetoEstrategico[];
  compromissos: CompromissoAgenda[];
  indicadores: IndicadorPerformance[];
  comunicacoes: ComunicacaoOficial[];
  auditorias: ProcessoAuditoria[];
  carregando: boolean;
  erro: string | null;
}