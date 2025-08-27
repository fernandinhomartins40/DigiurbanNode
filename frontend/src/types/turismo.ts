import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario, UserProfilePadrao } from './common';

export interface AtendimentoTuristico extends BaseEntity {
  cidadao_nome: string;
  cidadao_cpf: string;
  cidadao_telefone: string;
  cidadao_email: string;
  tipo_atendimento: 'informacoes' | 'reclamacao' | 'sugestao' | 'agendamento' | 'outro';
  assunto: string;
  descricao: string;
  status: StatusProcesso;
  prioridade: PrioridadePadrao;
  data_resolucao?: string;
  responsavel_id: string;
  observacoes?: string;
  
  // Relacionamentos
  responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface PontoTuristico extends BaseEntity {
  nome_ponto: string;
  tipo_ponto: 'historico' | 'natural' | 'cultural' | 'religioso' | 'gastronomico' | 'outro';
  endereco: EnderecoPadrao;
  coordenadas_geograficas: {
    latitude: number;
    longitude: number;
  };
  descricao_ponto: string;
  horario_funcionamento: string;
  contato: ContatoPadrao;
  valor_entrada?: number;
  gratuito: boolean;
  acessibilidade: string[];
  
  // Recursos disponíveis
  recursos_disponiveis: {
    estacionamento: boolean;
    banheiros: boolean;
    guia_turistico: boolean;
    lanchonete: boolean;
    loja_souvenirs: boolean;
    wifi_gratuito: boolean;
  };
  
  // Informações adicionais
  melhor_epoca_visitacao: string;
  tempo_visita_estimado: string;
  nivel_dificuldade?: 'facil' | 'moderado' | 'dificil';
  fotos_ponto: string[];
  video_promocional?: string;
  
  status: StatusBase;
  responsavel_manutencao_id?: string;
  
  // Relacionamentos
  responsavel_manutencao?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface EventoTuristico extends BaseEntity {
  nome_evento: string;
  tipo_evento: 'festival' | 'feira' | 'show' | 'exposicao' | 'esportivo' | 'religioso' | 'gastronomico' | 'cultural';
  descricao_evento: string;
  
  // Cronograma
  data_inicio: string;
  data_fim: string;
  horario_inicio: string;
  horario_fim: string;
  
  // Local
  local_evento: {
    nome_local: string;
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
    capacidade_maxima: number;
  };
  
  // Organizacao
  organizador_id: string;
  publico_esperado: number;
  valor_entrada?: number;
  gratuito: boolean;
  
  // Programação
  programacao_detalhada: Array<{
    horario: string;
    atividade: string;
    local: string;
    responsavel?: string;
  }>;
  
  // Marketing
  material_promocional: string[];
  redes_sociais: string[];
  patrocinadores: string[];
  
  status: 'planejado' | 'divulgacao' | 'vendas_abertas' | 'em_andamento' | 'finalizado' | 'cancelado';
  
  // Relacionamentos
  organizador?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface GuiaTuristico extends BaseEntity, PessoaFisicaPadrao {
  // Identificação profissional
  numero_cadastur?: string;
  numero_registro_municipal: string;
  
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
  especialidades_turismo: string[];
  idiomas_fluentes: string[];
  experiencia_anos?: number;
  
  // Trabalho
  disponibilidade_horarios: string[];
  areas_atuacao: string[];
  preco_hora: number;
  
  // Certificações
  certificacoes_turismo: string[];
  data_ultima_atualizacao_cadastro: string;
  
  status: StatusBase;
  observacoes?: string;
}

export interface RotaTuristica extends BaseEntity {
  nome_rota: string;
  tipo_rota: 'historica' | 'cultural' | 'gastronomica' | 'religiosa' | 'natural' | 'aventura';
  descricao_rota: string;
  duracao_estimada: string;
  dificuldade: 'facil' | 'moderado' | 'dificil';
  
  // Pontos da rota
  pontos_visita: Array<{
    ordem: number;
    ponto_turistico_id: string;
    tempo_permanencia: string;
    observacoes?: string;
  }>;
  
  // Logística
  transporte_recomendado: 'pe' | 'bicicleta' | 'carro' | 'onibus' | 'misto';
  melhor_periodo: string;
  valor_estimado: number;
  inclui_alimentacao: boolean;
  inclui_transporte: boolean;
  
  // Recursos
  fotos_rota: string[];
  mapa_rota?: string;
  guia_impresso?: string;
  
  status: StatusBase;
  criador_id: string;
  
  // Relacionamentos
  pontos_turisticos?: Pick<PontoTuristico, 'id' | 'nome_ponto'>[];
  criador?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface EstabelecimentoTuristico extends BaseEntity {
  nome_estabelecimento: string;
  tipo_estabelecimento: 'hotel' | 'pousada' | 'restaurante' | 'lanchonete' | 'loja_souvenirs' | 'agencia_turismo' | 'outro';
  
  // Dados comerciais
  cnpj: string;
  razao_social: string;
  endereco: EnderecoPadrao;
  contato: ContatoPadrao;
  
  // Proprietário/Responsável
  proprietario_nome: string;
  proprietario_cpf: string;
  proprietario_telefone: string;
  proprietario_email: string;
  
  // Características
  capacidade_atendimento: number;
  horario_funcionamento: string;
  aceita_cartao: boolean;
  possui_wifi: boolean;
  possui_estacionamento: boolean;
  possui_acessibilidade: boolean;
  
  // Classificação
  classificacao_estrelas?: number;
  categoria_servico: string;
  preco_medio?: number;
  
  // Documentação
  alvara_funcionamento: boolean;
  licenca_sanitaria: boolean;
  licenca_ambiental?: boolean;
  seguro_responsabilidade: boolean;
  
  // Marketing
  site_oficial?: string;
  redes_sociais: string[];
  fotos_estabelecimento: string[];
  descricao_servicos: string;
  
  status: StatusBase;
  data_ultima_fiscalizacao?: string;
  fiscal_responsavel_id?: string;
  
  // Relacionamentos
  fiscal_responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface FiscalizacaoTurismo extends BaseEntity {
  estabelecimento_id: string;
  tipo_fiscalizacao: 'rotina' | 'denuncia' | 'renovacao_licenca' | 'especial';
  data_fiscalizacao: string;
  fiscal_responsavel_id: string;
  
  // Resultado da fiscalizacao
  situacao_encontrada: 'conforme' | 'nao_conforme' | 'parcialmente_conforme';
  irregularidades_encontradas: string[];
  pontuacao_obtida?: number;
  
  // Medidas adotadas
  notificacoes_emitidas: string[];
  multas_aplicadas: Array<{
    descricao: string;
    valor: number;
    prazo_pagamento: string;
  }>;
  
  prazo_adequacao?: string;
  observacoes_fiscalizacao: string;
  fotos_fiscalizacao: string[];
  relatorio_fiscalizacao?: string;
  
  // Relacionamentos
  estabelecimento?: Pick<EstabelecimentoTuristico, 'id' | 'nome_estabelecimento'>;
  fiscal_responsavel?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface CampanhaTurismo extends BaseEntity {
  nome_campanha: string;
  tipo_campanha: 'promocional' | 'educativa' | 'sazonal' | 'evento';
  objetivo_campanha: string;
  publico_alvo: string;
  
  // Período
  data_inicio: string;
  data_fim: string;
  
  // Orçamento
  orcamento_total: number;
  orcamento_utilizado: number;
  
  // Canais de divulgação
  canais_utilizados: string[];
  materiais_produzidos: Array<{
    tipo: 'folder' | 'banner' | 'video' | 'site' | 'post_social';
    descricao: string;
    url?: string;
  }>;
  
  // Métricas
  alcance_estimado: number;
  engajamento_obtido: number;
  conversoes_obtidas: number;
  
  status: 'planejada' | 'em_execucao' | 'finalizada' | 'cancelada';
  responsavel_campanha_id: string;
  
  // Relacionamentos
  responsavel_campanha?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface ProfissionalTurismo extends BaseEntity, PessoaFisicaPadrao {
  // Identificação profissional
  matricula_funcional: string;
  numero_mtur?: string; // Ministério do Turismo
  
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
  idiomas_fluentes: string[];
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
  tipo_atendimento: 'informacoes' | 'reclamacao' | 'sugestao' | 'agendamento' | 'outro';
  assunto: string;
  descricao: string;
  prioridade: PrioridadePadrao;
}

export interface SolicitacaoEvento {
  nome_evento: string;
  tipo_evento: 'festival' | 'feira' | 'show' | 'exposicao' | 'esportivo' | 'religioso' | 'gastronomico' | 'cultural';
  descricao_evento: string;
  data_inicio: string;
  data_fim: string;
  local_evento: {
    nome_local: string;
    endereco_completo: string;
    capacidade_maxima: number;
  };
  publico_esperado: number;
  valor_entrada?: number;
  gratuito: boolean;
}

export interface SolicitacaoCadastroEstabelecimento {
  nome_estabelecimento: string;
  tipo_estabelecimento: 'hotel' | 'pousada' | 'restaurante' | 'lanchonete' | 'loja_souvenirs' | 'agencia_turismo' | 'outro';
  cnpj: string;
  razao_social: string;
  endereco: EnderecoPadrao;
  contato: ContatoPadrao;
  proprietario_nome: string;
  proprietario_cpf: string;
  proprietario_telefone: string;
  proprietario_email: string;
}

// Filtros
export interface FiltrosTurismo {
  status?: StatusBase | StatusProcesso;
  tipo?: string;
  data_inicio?: string;
  data_fim?: string;
  responsavel_id?: string;
  busca?: string;
}

export interface EstadoTurismo {
  atendimentos: AtendimentoTuristico[];
  pontos_turisticos: PontoTuristico[];
  eventos: EventoTuristico[];
  guias: GuiaTuristico[];
  rotas: RotaTuristica[];
  estabelecimentos: EstabelecimentoTuristico[];
  fiscalizacoes: FiscalizacaoTurismo[];
  campanhas: CampanhaTurismo[];
  profissionais: ProfissionalTurismo[];
  carregando: boolean;
  erro: string | null;
}