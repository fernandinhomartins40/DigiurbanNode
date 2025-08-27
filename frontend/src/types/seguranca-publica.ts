import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario, UserProfilePadrao } from './common';

export interface OcorrenciaSeguranca extends BaseEntity {
  numero_protocolo: string;
  tipo_ocorrencia: 'furto' | 'roubo' | 'vandalismo' | 'perturbacao' | 'acidente' | 'violencia' | 'outros';
  status: StatusProcesso;
  prioridade: PrioridadePadrao;
  descricao_ocorrencia: string;
  
  // Localização
  localizacao_ocorrencia: {
    endereco_completo: string;
    bairro: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  
  data_ocorrencia: string;
  
  // Dados do solicitante
  solicitante_nome: string;
  solicitante_telefone?: string;
  solicitante_email?: string;
  solicitante_documento?: string;
  
  responsavel_id?: string;
  anexos_evidencias: string[];
  observacoes?: string;
  resolucao_final?: string;
  data_resolucao?: string;
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ApoioGuarda extends BaseEntity {
  numero_protocolo: string;
  tipo_apoio: 'escolta' | 'patrulhamento' | 'evento' | 'investigacao' | 'apoio_operacional';
  status: StatusProcesso;
  prioridade: PrioridadePadrao;
  
  // Dados do solicitante
  solicitante_nome: string;
  solicitante_setor: string;
  solicitante_telefone: string;
  solicitante_email: string;
  
  descricao_apoio: string;
  
  // Localização
  localizacao_apoio: {
    endereco_completo: string;
    coordenadas_geograficas?: {
      latitude: number;
      longitude: number;
    };
  };
  
  data_inicio: string;
  data_fim?: string;
  horario_inicio: string;
  horario_fim?: string;
  
  guardas_designados_ids: string[];
  equipamentos_necessarios: string[];
  observacoes_apoio?: string;
  
  // Relacionamentos
  guardas_designados?: Pick<GuardaMunicipal, 'id' | 'nome_completo'>[];
}

export interface GuardaMunicipal extends BaseEntity, PessoaFisicaPadrao {
  // Identificação profissional
  matricula_funcional: string;
  numero_cracha: string;
  
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
  escala_trabalho: string;
  setor_atuacao: string;
  
  // Datas
  data_admissao: string;
  data_demissao?: string;
  
  status: StatusBase;
  observacoes?: string;
}

export interface RondaSeguranca extends BaseEntity {
  numero_ronda: string;
  tipo_ronda: 'preventiva' | 'ostensiva' | 'especial' | 'escolar' | 'comercial';
  guarda_responsavel_id: string;
  
  // Rota da ronda
  pontos_ronda: Array<{
    nome_ponto: string;
    endereco: string;
    coordenadas: {
      latitude: number;
      longitude: number;
    };
    horario_passagem: string;
    observacoes?: string;
  }>;
  
  data_ronda: string;
  horario_inicio: string;
  horario_fim?: string;
  status: 'programada' | 'em_andamento' | 'concluida' | 'cancelada';
  observacoes_ronda?: string;
  
  // Relacionamentos
  guarda_responsavel?: Pick<GuardaMunicipal, 'id' | 'nome_completo'>;
}

export interface CameraSeguranca extends BaseEntity {
  codigo_camera: string;
  localizacao_camera: {
    endereco_completo: string;
    bairro: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  
  tipo_camera: 'fixa' | 'speed_dome' | 'bullet' | 'dome';
  status: 'ativa' | 'inativa' | 'manutencao' | 'avariada';
  qualidade_imagem: 'hd' | 'full_hd' | '4k';
  tem_audio: boolean;
  tem_visao_noturna: boolean;
  angulo_cobertura: number;
  data_instalacao: string;
  responsavel_monitoramento_id?: string;
  
  // Relacionamentos
  responsavel_monitoramento?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface AlertaSeguranca extends BaseEntity {
  tipo_alerta: 'emergencia' | 'urgente' | 'preventivo' | 'informativo';
  titulo_alerta: string;
  descricao_alerta: string;
  
  // Área de abrangência
  area_abrangencia: {
    bairros: string[];
    coordenadas_geograficas?: Array<{
      latitude: number;
      longitude: number;
    }>;
  };
  
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico';
  status: 'ativo' | 'resolvido' | 'cancelado';
  data_inicio: string;
  data_fim?: string;
  responsavel_emissao_id: string;
  medidas_preventivas: string[];
  
  // Relacionamentos
  responsavel_emissao?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface BoletimOcorrencia extends BaseEntity {
  numero_boletim: string;
  ocorrencia_id: string;
  
  // Dados do comunicante
  comunicante_nome: string;
  comunicante_cpf: string;
  comunicante_telefone: string;
  comunicante_endereco: string;
  
  // Dados da ocorrência
  relato_fatos: string;
  testemunhas: Array<{
    nome: string;
    telefone?: string;
    relato?: string;
  }>;
  
  danos_materiais?: string;
  valor_prejuizo?: number;
  providencias_tomadas: string[];
  agente_elaborador_id: string;
  
  status: 'registrado' | 'investigacao' | 'arquivado' | 'resolvido';
  
  // Relacionamentos
  ocorrencia?: Pick<OcorrenciaSeguranca, 'id' | 'numero_protocolo'>;
  agente_elaborador?: Pick<GuardaMunicipal, 'id' | 'nome_completo'>;
}

export interface EventoSeguranca extends BaseEntity {
  nome_evento: string;
  tipo_evento: 'show' | 'festa' | 'esportivo' | 'religioso' | 'politico' | 'outros';
  descricao_evento: string;
  
  // Local e data
  local_evento: {
    endereco_completo: string;
    capacidade_maxima: number;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  
  data_inicio: string;
  data_fim: string;
  horario_inicio: string;
  horario_fim: string;
  
  // Segurança
  numero_guardas_necessarios: number;
  guardas_escalados_ids: string[];
  plano_seguranca: string;
  status: 'planejado' | 'aprovado' | 'em_andamento' | 'concluido' | 'cancelado';
  
  responsavel_evento_id: string;
  responsavel_seguranca_id: string;
  
  // Relacionamentos
  guardas_escalados?: Pick<GuardaMunicipal, 'id' | 'nome_completo'>[];
  responsavel_evento?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
  responsavel_seguranca?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface VeiculoSeguranca extends BaseEntity {
  placa_veiculo: string;
  tipo_veiculo: 'viatura' | 'motocicleta' | 'van' | 'caminhao';
  modelo_veiculo: string;
  ano_fabricacao: number;
  
  status: 'disponivel' | 'em_uso' | 'manutencao' | 'avariado';
  quilometragem_atual: number;
  combustivel_nivel: number;
  data_ultima_revisao?: string;
  data_proxima_revisao?: string;
  
  equipamentos_instalados: string[];
  guarda_responsavel_id?: string;
  
  // Relacionamentos
  guarda_responsavel?: Pick<GuardaMunicipal, 'id' | 'nome_completo'>;
}

export interface EquipamentoSeguranca extends BaseEntity {
  codigo_equipamento: string;
  nome_equipamento: string;
  tipo_equipamento: 'radio' | 'colete' | 'arma_nao_letal' | 'lanterna' | 'algema' | 'outros';
  marca_modelo: string;
  numero_serie?: string;
  
  status: 'disponivel' | 'em_uso' | 'manutencao' | 'avariado';
  data_aquisicao: string;
  data_ultima_manutencao?: string;
  
  guarda_responsavel_id?: string;
  localizacao_atual: string;
  
  // Relacionamentos
  guarda_responsavel?: Pick<GuardaMunicipal, 'id' | 'nome_completo'>;
}

// Interfaces para formulários
export interface SolicitacaoOcorrencia {
  tipo_ocorrencia: 'furto' | 'roubo' | 'vandalismo' | 'perturbacao' | 'acidente' | 'violencia' | 'outros';
  descricao_ocorrencia: string;
  localizacao_ocorrencia: {
    endereco_completo: string;
    bairro: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  data_ocorrencia: string;
  solicitante_nome: string;
  solicitante_telefone?: string;
  solicitante_email?: string;
  prioridade: PrioridadePadrao;
}

export interface SolicitacaoApoio {
  tipo_apoio: 'escolta' | 'patrulhamento' | 'evento' | 'investigacao' | 'apoio_operacional';
  solicitante_nome: string;
  solicitante_setor: string;
  solicitante_telefone: string;
  solicitante_email: string;
  descricao_apoio: string;
  localizacao_apoio: {
    endereco_completo: string;
  };
  data_inicio: string;
  data_fim?: string;
  horario_inicio: string;
  horario_fim?: string;
  prioridade: PrioridadePadrao;
}

// Filtros
export interface FiltrosSeguranca {
  status?: StatusBase | StatusProcesso;
  tipo?: string;
  prioridade?: PrioridadePadrao;
  data_inicio?: string;
  data_fim?: string;
  responsavel_id?: string;
  bairro?: string;
  busca?: string;
}

export interface EstadoSeguranca {
  ocorrencias: OcorrenciaSeguranca[];
  apoios: ApoioGuarda[];
  guardas: GuardaMunicipal[];
  rondas: RondaSeguranca[];
  cameras: CameraSeguranca[];
  alertas: AlertaSeguranca[];
  boletins: BoletimOcorrencia[];
  eventos: EventoSeguranca[];
  veiculos: VeiculoSeguranca[];
  equipamentos: EquipamentoSeguranca[];
  carregando: boolean;
  erro: string | null;
}