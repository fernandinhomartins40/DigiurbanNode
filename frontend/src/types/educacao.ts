
import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, ResponsavelPadrao, TipoUsuario } from './common';

// Tipos existentes
export interface OcorrenciaEscolar extends BaseEntity {
  aluno_id: string;
  escola_id: string;
  turma_id?: string;
  data_ocorrencia: string;
  horario_ocorrencia?: string;
  tipo: 'disciplinar' | 'acidente' | 'saude' | 'comportamento' | 'pedagogica' | 'bullying' | 'violencia' | 'outro';
  gravidade: 'leve' | 'moderada' | 'grave' | 'critica';
  descricao: string;
  local_ocorrencia?: string;
  testemunhas?: string[];
  funcionario_responsavel_id: string;
  medidas_tomadas?: string[];
  encaminhamentos?: string[];
  responsavel_comunicado: boolean;
  data_comunicacao_responsavel?: string;
  meio_comunicacao?: 'telefone' | 'email' | 'presencial' | 'carta' | 'agenda';
  resposta_responsavel?: string;
  status: 'aberta' | 'em_tratamento' | 'resolvida' | 'encaminhada';
  data_resolucao?: string;
  observacoes?: string;
  anexos?: string[];
  requer_acompanhamento: boolean;
  data_proximo_acompanhamento?: string;
  
  // Relacionamentos
  aluno?: Pick<Aluno, 'id' | 'nome_completo' | 'codigo_aluno'>;
  escola?: Pick<Escola, 'id' | 'nome'>;
  turma?: Pick<Turma, 'id' | 'codigo' | 'serie'>;
  funcionario_responsavel?: {
    id: string;
    nome: string;
    cargo: string;
  };
}

export interface EventoEscolar extends BaseEntity {
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  dia_todo: boolean;
  local_evento?: string;
  tipo_evento: string;
  escola_id?: string;
  series_participantes?: string[];
  turmas_participantes?: string[];
  organizador_id: string;
  participantes_obrigatorios?: {
    tipo_participante: string;
    obrigatorio: boolean;
  }[];
  cor_calendario?: string;
  status: StatusBase;
  
  // Relacionamentos
  escola?: Pick<Escola, 'id' | 'nome'>;
  organizador?: Pick<ProfissionalEducacao, 'id' | 'nome_completo' | 'cargo'>;
}

// Interfaces padronizadas para o módulo de Educação
export interface Escola extends BaseEntity {
  codigo_inep: string;
  codigo_mec?: string;
  nome: string;
  endereco: EnderecoPadrao;
  contato: ContatoPadrao;
  cnpj?: string;
  tipo: 'municipal' | 'estadual' | 'federal' | 'privada' | 'comunitaria';
  modalidades_ensino: ('educacao_infantil' | 'ensino_fundamental_anos_iniciais' | 'ensino_fundamental_anos_finais' | 'ensino_medio' | 'eja' | 'educacao_especial')[];
  turnos_funcionamento: ('matutino' | 'vespertino' | 'noturno' | 'integral')[];
  diretor_id?: string;
  vice_diretor_id?: string;
  coordenador_pedagogico_id?: string;
  secretaria_responsavel_id: string;
  capacidade_total_alunos: number;
  vagas_disponiveis: number;
  infraestrutura: {
    salas_aula: number;
    biblioteca: boolean;
    laboratorio_informatica: boolean;
    laboratorio_ciencias: boolean;
    quadra_esportiva: boolean;
    patio_coberto: boolean;
    cozinha: boolean;
    refeitorio: boolean;
    sala_professores: boolean;
    secretaria: boolean;
    diretoria: boolean;
    almoxarifado: boolean;
    banheiros_alunos: number;
    banheiros_funcionarios: number;
    banheiros_acessiveis: number;
    rampas_acesso: boolean;
    internet: boolean;
    energia_eletrica: boolean;
    agua_potavel: boolean;
    esgoto_sanitario: boolean;
  };
  recursos_tecnologicos: {
    computadores: number;
    tablets: number;
    projetores: number;
    tv_smart: number;
    sistema_som: boolean;
  };
  programas_governo: string[];
  observacoes?: string;
  status: StatusBase;
  
  // Relacionamentos
  diretor?: Pick<ProfissionalEducacao, 'id' | 'nome_completo'>;
  vice_diretor?: Pick<ProfissionalEducacao, 'id' | 'nome_completo'>;
  coordenador_pedagogico?: Pick<ProfissionalEducacao, 'id' | 'nome_completo'>;
}

export interface ProfissionalEducacao extends BaseEntity, PessoaFisicaPadrao {
  matricula_funcional: string;
  contato: ContatoPadrao;
  endereco?: EnderecoPadrao;
  cargo: 'diretor' | 'vice_diretor' | 'coordenador_pedagogico' | 'professor' | 'auxiliar_ensino' | 'secretario_escola' | 'merendeiro' | 'servicos_gerais' | 'monitor' | 'psicopedagogo' | 'outro';
  especialidade?: string[];
  formacao_academica: {
    nivel: 'ensino_medio' | 'superior' | 'pos_graduacao' | 'mestrado' | 'doutorado';
    curso: string;
    instituicao: string;
    ano_conclusao: number;
  }[];
  experiencia_anos?: number;
  carga_horaria_semanal: number;
  turno_trabalho: ('matutino' | 'vespertino' | 'noturno' | 'integral')[];
  escolas_atuacao: string[];
  disciplinas_lecionadas?: string[];
  turmas_responsavel?: string[];
  data_admissao: string;
  data_demissao?: string;
  observacoes?: string;
  status: StatusBase;
}

export interface Aluno extends BaseEntity, PessoaFisicaPadrao {
  codigo_aluno: string;
  nis?: string;
  endereco: EnderecoPadrao;
  cor_raca: 'branca' | 'preta' | 'parda' | 'amarela' | 'indigena' | 'nao_declarada';
  nacionalidade: string;
  naturalidade?: string;
  certidao_nascimento: string;
  responsaveis: ResponsavelPadrao[];
  necessidades_especiais: {
    possui: boolean;
    tipos?: string[];
    cid?: string[];
    acompanhamento_especializado: boolean;
    medicacao_continua: boolean;
    restricoes_atividades?: string[];
  };
  saude: {
    convenio_medico?: string;
    alergias?: string[];
    medicamentos_uso?: string[];
    restricoes_alimentares?: string[];
    contato_emergencia: ContatoPadrao & { nome: string; parentesco: string };
  };
  transporte_escolar: {
    utiliza: boolean;
    rota_id?: string;
    ponto_embarque?: string;
    observacoes?: string;
  };
  beneficios_sociais?: string[];
  situacao_vacinal_em_dia: boolean;
  documentos_entregues: string[];
  observacoes?: string;
  status: StatusBase;
  
  // Relacionamentos
  matriculas?: Pick<Matricula, 'id' | 'escola_id' | 'turma_id' | 'status' | 'ano_letivo'>[];
}

export interface Matricula extends BaseEntity {
  aluno_id: string;
  escola_id: string;
  turma_id: string;
  ano_letivo: number;
  numero_matricula: string;
  data_matricula: string;
  data_transferencia?: string;
  data_conclusao?: string;
  status: 'ativa' | 'transferida' | 'cancelada' | 'concluida' | 'abandono' | 'remanejada';
  motivo_status?: string;
  documentos_entregues: {
    documento: string;
    data_entrega: string;
    conferido: boolean;
  }[];
  historico_escolar?: string; // ID do arquivo
  boletim_anterior?: string; // ID do arquivo
  laudo_medico?: string; // ID do arquivo se necessário
  observacoes?: string;
  
  // Relacionamentos
  aluno?: Pick<Aluno, 'id' | 'codigo_aluno' | 'nome_completo' | 'data_nascimento'>;
  escola?: Pick<Escola, 'id' | 'nome'>;
  turma?: Pick<Turma, 'id' | 'codigo' | 'serie' | 'turno'>;
}

export interface Turma extends BaseEntity {
  escola_id: string;
  codigo: string;
  nome?: string;
  serie: string;
  nivel_ensino: 'educacao_infantil' | 'ensino_fundamental_anos_iniciais' | 'ensino_fundamental_anos_finais' | 'ensino_medio' | 'eja' | 'educacao_especial';
  turno: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  vagas_total: number;
  vagas_ocupadas: number;
  vagas_reservadas: number;
  ano_letivo: number;
  professor_regente_id?: string;
  sala_aula: string;
  horario_aulas: {
    dia_semana: number;
    horario_inicio: string;
    horario_fim: string;
    disciplina?: string;
    professor_id?: string;
  }[];
  disciplinas_oferecidas: string[];
  observacoes?: string;
  status: StatusBase;
  
  // Relacionamentos
  escola?: Pick<Escola, 'id' | 'nome'>;
  professor_regente?: Pick<ProfissionalEducacao, 'id' | 'nome_completo'>;
  matriculas?: Pick<Matricula, 'id' | 'aluno_id' | 'status'>[];
}

export interface CardapioEscolar extends BaseEntity {
  semana_inicio: string;
  semana_fim: string;
  escola_id?: string; // Se for específico para uma escola
  faixa_etaria: 'berçario' | 'maternal' | 'pre_escola' | 'fundamental_1' | 'fundamental_2' | 'medio' | 'todas';
  nutricionista_responsavel_id: string;
  aprovado_nutricionista: boolean;
  data_aprovacao?: string;
  observacoes?: string;
  
  // Relacionamentos
  escola?: Pick<Escola, 'id' | 'nome'>;
  nutricionista?: Pick<ProfissionalEducacao, 'id' | 'nome_completo'>;
  refeicoes?: CardapioRefeicao[];
}

export interface CardapioRefeicao extends BaseEntity {
  cardapio_id: string;
  dia_semana: number; // 1-7 (segunda a domingo)
  tipo_refeicao: 'cafe_manha' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia';
  descricao: string;
  ingredientes: {
    nome: string;
    quantidade: string;
    unidade: string;
  }[];
  modo_preparo?: string;
  informacoes_nutricionais?: {
    calorias?: number;
    proteinas?: number;
    carboidratos?: number;
    gorduras?: number;
    fibras?: number;
    sodio?: number;
  };
  alergenos: string[];
  dietas_especiais: {
    tipo: 'vegetariana' | 'vegana' | 'sem_gluten' | 'sem_lactose' | 'diabetica' | 'outro';
    adaptacao?: string;
  }[];
  custo_estimado?: number;
}

export interface RotaTransporteEscolar extends BaseEntity {
  codigo: string;
  nome: string;
  descricao?: string;
  veiculo_id: string;
  motorista_id: string;
  monitor_id?: string;
  turno: 'matutino' | 'vespertino' | 'integral' | 'noturno';
  tipo_rota: 'urbana' | 'rural' | 'mista';
  escolas_atendidas: {
    escola_id: string;
    horario_chegada: string;
    horario_saida: string;
    ordem_parada: number;
  }[];
  pontos_parada: {
    id: string;
    nome: string;
    endereco: string;
    coordenadas?: {
      latitude: number;
      longitude: number;
    };
    horario_passa: string;
    ordem_parada: number;
    referencia?: string;
    alunos_embarcam: number;
  }[];
  distancia_total_km: number;
  tempo_estimado_minutos: number;
  capacidade_alunos: number;
  alunos_atendidos: number;
  combustivel_estimado_litros?: number;
  custo_mensal_estimado?: number;
  observacoes?: string;
  status: StatusBase;
  
  // Relacionamentos
  veiculo?: {
    id: string;
    placa: string;
    modelo: string;
    tipo: 'onibus' | 'van' | 'micro_onibus';
    capacidade: number;
    ano: number;
  };
  motorista?: Pick<ProfissionalEducacao, 'id' | 'nome_completo'>;
  monitor?: Pick<ProfissionalEducacao, 'id' | 'nome_completo'>;
  escolas?: Pick<Escola, 'id' | 'nome'>[];
}

// Interfaces para formulários
export interface SolicitacaoMatricula {
  aluno_id: string;
  escola_id: string;
  serie_desejada: string;
  turno_preferencia: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  necessita_transporte: boolean;
  observacoes?: string;
}

export interface SolicitacaoTransferencia {
  matricula_id: string;
  escola_origem_id: string;
  escola_destino_id: string;
  motivo_transferencia: string;
  data_solicitacao: string;
  observacoes?: string;
}

export interface SolicitacaoOcorrencia {
  aluno_id: string;
  escola_id: string;
  turma_id?: string;
  tipo: 'disciplinar' | 'acidente' | 'saude' | 'comportamento' | 'pedagogica' | 'bullying' | 'violencia' | 'outro';
  gravidade: 'leve' | 'moderada' | 'grave' | 'critica';
  descricao: string;
  local_ocorrencia?: string;
  testemunhas?: string[];
  medidas_tomadas?: string[];
}

// Filtros
export interface FiltrosEducacao {
  status?: StatusBase | StatusProcesso;
  escola_id?: string;
  turma_id?: string;
  ano_letivo?: number;
  nivel_ensino?: string;
  data_inicio?: string;
  data_fim?: string;
  responsavel_id?: string;
  busca?: string;
}

export interface EstadoEducacao {
  escolas: Escola[];
  profissionais: ProfissionalEducacao[];
  alunos: Aluno[];
  matriculas: Matricula[];
  turmas: Turma[];
  ocorrencias: OcorrenciaEscolar[];
  eventos: EventoEscolar[];
  cardapios: CardapioEscolar[];
  rotas_transporte: RotaTransporteEscolar[];
  carregando: boolean;
  erro: string | null;
}
