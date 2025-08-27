
import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusAgendamento, PrioridadePadrao, StatusProcesso, TipoUsuario } from './common';

export interface Paciente extends BaseEntity, PessoaFisicaPadrao {
  cns: string; // Cartão Nacional de Saúde
  endereco: EnderecoPadrao;
  contato: ContatoPadrao;
  convenio_medico?: string;
  alergias?: string[];
  condicoes_medicas?: string[];
  medicamentos_uso_continuo?: string[];
  contato_emergencia?: {
    nome: string;
    telefone: string;
    parentesco: string;
  };
  status: StatusBase;
}

export interface ProfissionalSaude extends BaseEntity, PessoaFisicaPadrao {
  especialidades: string[];
  crm: string;
  crm_uf: string;
  contato: ContatoPadrao;
  tipo_profissional: 'medico' | 'enfermeiro' | 'tecnico_enfermagem' | 'dentista' | 'farmaceutico' | 'psicologo' | 'nutricionista' | 'fisioterapeuta' | 'outro';
  carga_horaria_semanal?: number;
  turno_trabalho?: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  unidades_trabalho: string[]; // IDs das unidades onde trabalha
  status: StatusBase;
}

export interface UnidadeSaude extends BaseEntity {
  nome: string;
  tipo: 'ubs' | 'upf' | 'hospital' | 'clinica' | 'caps' | 'pronto_socorro' | 'laboratorio' | 'farmacia';
  endereco: EnderecoPadrao;
  contato: ContatoPadrao;
  cnpj?: string;
  cnes: string; // Código Nacional de Estabelecimentos de Saúde
  especialidades_disponiveis: string[];
  servicos_oferecidos: string[];
  horario_funcionamento: {
    [dia: string]: {
      abertura: string;
      fechamento: string;
      funcionando: boolean;
    };
  };
  capacidade_atendimento: {
    consultas_dia: number;
    leitos_internacao?: number;
    leitos_observacao?: number;
  };
  equipamentos_disponivel?: string[];
  gestor_responsavel_id?: string;
  secretaria_id: string;
  status: StatusBase;
}


export interface AgendamentoMedico extends BaseEntity {
  paciente_id: string;
  profissional_id: string;
  especialidade: string;
  data_agendamento: string;
  horario_inicio: string;
  horario_fim: string;
  duracao_minutos: number;
  status: StatusAgendamento;
  tipo_consulta: 'consulta' | 'exame' | 'procedimento' | 'retorno' | 'urgencia' | 'emergencia';
  prioridade: PrioridadePadrao;
  unidade_saude_id: string;
  observacoes?: string;
  sintomas_relatados?: string;
  prescricoes?: string[];
  procedimentos_realizados?: string[];
  retorno_necessario: boolean;
  data_retorno_sugerida?: string;
  lembrete_enviado: boolean;
  
  // Relacionamentos (preenchidos quando necessário)
  paciente?: Pick<Paciente, 'id' | 'nome_completo' | 'cpf' | 'contato'>;
  profissional?: Pick<ProfissionalSaude, 'id' | 'nome_completo' | 'especialidades' | 'crm'>;
  unidade_saude?: Pick<UnidadeSaude, 'id' | 'nome' | 'endereco'>;
}

export interface Medicamento extends BaseEntity {
  nome: string;
  principio_ativo: string;
  concentracao: string;
  forma_farmaceutica: 'comprimido' | 'capsula' | 'xarope' | 'solucao' | 'pomada' | 'injecao' | 'outro';
  categoria: 'antibiotico' | 'analgesico' | 'anti_inflamatorio' | 'cardiovascular' | 'diabetes' | 'psicotropico' | 'outro';
  controlado: boolean;
  requer_receita: boolean;
  codigo_ean?: string;
  fabricante?: string;
  registro_anvisa?: string;
  status: StatusBase;
}

export interface EstoqueMedicamento extends BaseEntity {
  medicamento_id: string;
  unidade_saude_id: string;
  lote: string;
  quantidade: number;
  quantidade_minima: number;
  quantidade_maxima: number;
  data_validade: string;
  data_fabricacao: string;
  preco_unitario: number;
  valor_total: number;
  fornecedor: string;
  nota_fiscal?: string;
  local_armazenamento?: string;
  temperatura_armazenamento?: string;
  status: 'disponivel' | 'vencido' | 'bloqueado' | 'em_falta';
  
  // Relacionamentos
  medicamento?: Pick<Medicamento, 'id' | 'nome' | 'principio_ativo' | 'controlado'>;
  unidade_saude?: Pick<UnidadeSaude, 'id' | 'nome'>;
}

export interface DispensacaoMedicamento extends BaseEntity {
  paciente_id: string;
  medicamento_id: string;
  estoque_id: string;
  quantidade_dispensada: number;
  prescrito_por_id: string;
  dispensado_por_id: string;
  numero_receita?: string;
  data_prescricao: string;
  data_dispensacao: string;
  observacoes?: string;
  
  // Relacionamentos
  paciente?: Pick<Paciente, 'id' | 'nome_completo' | 'cns'>;
  medicamento?: Pick<Medicamento, 'id' | 'nome' | 'principio_ativo'>;
  prescrito_por?: Pick<ProfissionalSaude, 'id' | 'nome_completo' | 'crm'>;
  dispensado_por?: Pick<ProfissionalSaude, 'id' | 'nome_completo'>;
}

export interface CampanhaSaude extends BaseEntity {
  nome: string;
  descricao?: string;
  tipo: 'vacinacao' | 'preventiva' | 'educativa' | 'exames' | 'nutricao' | 'saude_mental' | 'outro';
  publico_alvo: {
    faixa_etaria_inicio?: number;
    faixa_etaria_fim?: number;
    sexo?: 'M' | 'F' | 'todos';
    condicoes_especificas?: string[];
    territorio?: string[];
  };
  data_inicio: string;
  data_fim: string;
  locais_realizacao: string[];
  unidades_participantes: string[];
  meta_atendimentos: number;
  realizados: number;
  responsavel_id: string;
  equipe_ids: string[];
  orcamento_previsto?: number;
  orcamento_gasto?: number;
  materiais_necessarios?: string[];
  indicadores_sucesso: {
    meta: number;
    atual: number;
    unidade: string;
    descricao: string;
  }[];
  status: StatusProcesso;
  
  // Relacionamentos
  responsavel?: Pick<ProfissionalSaude, 'id' | 'nome_completo'>;
  unidades?: Pick<UnidadeSaude, 'id' | 'nome'>[];
}

export interface ProgramaSaude extends BaseEntity {
  nome: string;
  descricao?: string;
  objetivo: string;
  tipo: 'prevencao' | 'tratamento' | 'reabilitacao' | 'promocao' | 'vigilancia';
  publico_alvo: {
    criterios: string[];
    estimativa_beneficiarios: number;
  };
  data_inicio: string;
  data_fim?: string;
  coordenador_id: string;
  equipe_ids: string[];
  unidades_executoras: string[];
  orcamento_total?: number;
  fonte_recurso?: string;
  pacientes_inscritos: number;
  pacientes_ativos: number;
  metas: {
    indicador: string;
    valor_meta: number;
    valor_atual: number;
    prazo: string;
    status: 'nao_iniciado' | 'em_andamento' | 'atingido' | 'nao_atingido';
  }[];
  protocolos_atendimento?: string[];
  status: StatusBase;
  
  // Relacionamentos
  coordenador?: Pick<ProfissionalSaude, 'id' | 'nome_completo'>;
  unidades?: Pick<UnidadeSaude, 'id' | 'nome'>[];
}

export interface ExameMedico extends BaseEntity {
  paciente_id: string;
  tipo_exame_id: string;
  profissional_solicitante_id: string;
  unidade_realizacao_id: string;
  data_solicitacao: string;
  data_agendamento?: string;
  data_realizacao?: string;
  data_resultado?: string;
  status: 'solicitado' | 'agendado' | 'coletado' | 'em_analise' | 'resultado_disponivel' | 'entregue' | 'cancelado';
  prioridade: PrioridadePadrao;
  jejum_necessario: boolean;
  preparo_especial?: string;
  observacoes_solicitacao?: string;
  observacoes_realizacao?: string;
  resultado_arquivo_id?: string;
  resultado_texto?: string;
  valores_referencia?: any;
  resultado_alterado: boolean;
  requer_retorno: boolean;
  data_retorno_sugerida?: string;
  
  // Relacionamentos
  paciente?: Pick<Paciente, 'id' | 'nome_completo' | 'cns'>;
  tipo_exame?: {
    id: string;
    nome: string;
    categoria: string;
    metodo: string;
    preparo?: string;
  };
  profissional_solicitante?: Pick<ProfissionalSaude, 'id' | 'nome_completo' | 'crm'>;
  unidade_realizacao?: Pick<UnidadeSaude, 'id' | 'nome'>;
}

export interface SolicitacaoTFD extends BaseEntity {
  paciente_id: string;
  profissional_solicitante_id: string;
  unidade_origem_id: string;
  cidade_destino: string;
  unidade_destino?: string;
  especialidade_requerida: string;
  procedimento_solicitado: string;
  cid_principal: string;
  cid_secundarios?: string[];
  justificativa_medica: string;
  relatorio_medico: string;
  exames_anexos: string[];
  data_solicitacao: string;
  data_prevista_realizacao?: string;
  data_autorizacao?: string;
  data_realizacao?: string;
  status: 'solicitado' | 'em_analise' | 'aprovado' | 'reprovado' | 'agendado' | 'em_andamento' | 'realizado' | 'cancelado';
  prioridade: PrioridadePadrao;
  tipo_transporte: 'terrestre' | 'aereo' | 'nao_necessario' | 'ambulancia';
  acompanhante_necessario: boolean;
  hospedagem_necessaria: boolean;
  numero_autorizacao?: string;
  valor_estimado?: number;
  valor_aprovado?: number;
  observacoes_analise?: string;
  data_limite_realizacao?: string;
  
  // Relacionamentos
  paciente?: Pick<Paciente, 'id' | 'nome_completo' | 'cns' | 'cpf'>;
  profissional_solicitante?: Pick<ProfissionalSaude, 'id' | 'nome_completo' | 'crm'>;
  unidade_origem?: Pick<UnidadeSaude, 'id' | 'nome'>;
}

export interface VisitaACS extends BaseEntity {
  acs_id: string;
  familia_id: string;
  endereco_visita: EnderecoPadrao;
  area_microarea: string;
  data_visita: string;
  horario_inicio: string;
  horario_fim?: string;
  tipo_visita: 'rotina' | 'acompanhamento' | 'busca_ativa' | 'primeira_visita' | 'urgencia' | 'investigacao_epidemiologica';
  objetivo_visita: string;
  situacoes_encontradas: string[];
  pessoas_presentes: {
    nome: string;
    idade?: number;
    situacao_saude?: string;
  }[];
  acoes_realizadas: string[];
  orientacoes_fornecidas: string[];
  encaminhamentos_realizados: {
    tipo: string;
    unidade_destino?: string;
    profissional_responsavel?: string;
    observacoes?: string;
  }[];
  materiais_entregues?: string[];
  proxima_visita_necessaria: boolean;
  data_proxima_visita?: string;
  motivo_proxima_visita?: string;
  visita_realizada: boolean;
  motivo_nao_realizacao?: string;
  observacoes?: string;
  
  // Relacionamentos
  acs?: Pick<ProfissionalSaude, 'id' | 'nome_completo'>;
  familia?: {
    id: string;
    codigo_familia: string;
    responsavel_nome: string;
    numero_membros: number;
  };
}

export interface TransportePaciente extends BaseEntity {
  paciente_id: string;
  veiculo_id: string;
  motorista_id: string;
  enfermeiro_acompanhante_id?: string;
  medico_acompanhante_id?: string;
  origem: {
    endereco: string;
    tipo: 'residencia' | 'unidade_saude' | 'hospital' | 'outro';
    unidade_id?: string;
    observacoes?: string;
  };
  destino: {
    endereco: string;
    tipo: 'residencia' | 'unidade_saude' | 'hospital' | 'outro';
    unidade_id?: string;
    observacoes?: string;
  };
  data_transporte: string;
  horario_saida: string;
  horario_chegada_previsto: string;
  horario_chegada_real?: string;
  motivo_transporte: 'consulta' | 'exame' | 'cirurgia' | 'internacao' | 'alta' | 'urgencia' | 'emergencia' | 'tfd' | 'outro';
  tipo_transporte: 'eletivo' | 'urgencia' | 'emergencia';
  retorno_programado: boolean;
  data_retorno?: string;
  horario_retorno?: string;
  necessidades_especiais?: string;
  equipamentos_necessarios?: string[];
  medicamentos_transporte?: string[];
  acompanhante_familiar: boolean;
  acompanhante_nome?: string;
  acompanhante_documento?: string;
  observacoes_medicas?: string;
  km_percorridos?: number;
  combustivel_gasto?: number;
  pedagios?: number;
  outras_despesas?: number;
  status: 'agendado' | 'confirmado' | 'em_rota_origem' | 'paciente_embarcado' | 'em_transito' | 'chegou_destino' | 'paciente_entregue' | 'retornando' | 'concluido' | 'cancelado';
  
  // Relacionamentos
  paciente?: Pick<Paciente, 'id' | 'nome_completo' | 'cns'>;
  veiculo?: {
    id: string;
    placa: string;
    modelo: string;
    tipo: 'ambulancia_utm' | 'ambulancia_usa' | 'ambulancia_ub' | 'van' | 'carro' | 'outro';
  };
  motorista?: Pick<ProfissionalSaude, 'id' | 'nome_completo'>;
  enfermeiro_acompanhante?: Pick<ProfissionalSaude, 'id' | 'nome_completo'>;
  medico_acompanhante?: Pick<ProfissionalSaude, 'id' | 'nome_completo'>;
}
