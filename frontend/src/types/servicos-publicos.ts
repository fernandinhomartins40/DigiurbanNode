import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario, UserProfilePadrao } from './common';

export interface AtendimentoServicos extends BaseEntity {
  numero_protocolo: string;
  cidadao_nome: string;
  cidadao_cpf: string;
  cidadao_telefone: string;
  cidadao_email: string;
  tipo_servico: 'iluminacao' | 'limpeza' | 'coleta_especial' | 'manutencao' | 'outros';
  assunto: string;
  descricao: string;
  localizacao_servico?: {
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

export interface PontoIluminacao extends BaseEntity {
  codigo_ponto: string;
  tipo_iluminacao: 'led' | 'sodio' | 'mercurio' | 'halogenio';
  potencia_watts: number;
  
  // Localização
  localizacao_ponto: {
    endereco_completo: string;
    bairro: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  
  status: 'funcionando' | 'queimada' | 'manutencao' | 'desligada';
  data_instalacao: string;
  data_ultima_manutencao?: string;
  data_proxima_manutencao?: string;
  responsavel_manutencao_id?: string;
  observacoes_ponto?: string;
  
  // Relacionamentos
  responsavel_manutencao?: Pick<UserProfilePadrao, 'id' | 'nome_completo'>;
}

export interface RotaColeta extends BaseEntity {
  codigo_rota: string;
  nome_rota: string;
  tipo_coleta: 'domestica' | 'seletiva' | 'organica' | 'especial';
  descricao_rota: string;
  
  // Pontos de coleta
  pontos_coleta: Array<{
    endereco: string;
    coordenadas: {
      latitude: number;
      longitude: number;
    };
    horario_coleta: string;
    frequencia: 'diaria' | 'segunda_quarta_sexta' | 'terca_quinta_sabado' | 'semanal';
  }>;
  
  veiculo_coleta_id?: string;
  equipe_responsavel_id?: string;
  status: StatusBase;
  observacoes_rota?: string;
  
  // Relacionamentos
  veiculo_coleta?: Pick<VeiculoServicos, 'id' | 'placa_veiculo'>;
  equipe_responsavel?: Pick<EquipeServicos, 'id' | 'nome_equipe'>;
}

export interface ColetaEspecial extends BaseEntity {
  numero_solicitacao: string;
  tipo_material: 'eletronicos' | 'moveis' | 'entulho' | 'podas' | 'oleo' | 'outros';
  descricao_material: string;
  quantidade_estimada: string;
  
  // Dados do solicitante
  solicitante_nome: string;
  solicitante_cpf: string;
  solicitante_telefone: string;
  
  // Localização da coleta
  endereco_coleta: string;
  coordenadas_coleta: {
    latitude: number;
    longitude: number;
  };
  
  status: 'solicitada' | 'agendada' | 'coletada' | 'cancelada';
  data_solicitacao: string;
  data_agendamento?: string;
  data_coleta?: string;
  equipe_coleta_id?: string;
  observacoes_coleta?: string;
  
  // Relacionamentos
  equipe_coleta?: Pick<EquipeServicos, 'id' | 'nome_equipe'>;
}

export interface VeiculoServicos extends BaseEntity {
  placa_veiculo: string;
  tipo_veiculo: 'caminhao_coleta' | 'caminhao_limpeza' | 'van' | 'utilitario';
  modelo_veiculo: string;
  ano_fabricacao: number;
  capacidade_carga: number;
  
  status: 'disponivel' | 'em_uso' | 'manutencao' | 'avariado';
  quilometragem_atual: number;
  combustivel_nivel: number;
  data_ultima_revisao?: string;
  data_proxima_revisao?: string;
  
  equipamentos_instalados: string[];
  motorista_responsavel_id?: string;
  rota_atual_id?: string;
  
  // Relacionamentos
  motorista_responsavel?: Pick<FuncionarioServicos, 'id' | 'nome_completo'>;
  rota_atual?: Pick<RotaColeta, 'id' | 'nome_rota'>;
}

export interface EquipeServicos extends BaseEntity {
  nome_equipe: string;
  tipo_servico: 'coleta' | 'limpeza' | 'manutencao' | 'iluminacao';
  descricao_equipe: string;
  lider_equipe_id: string;
  membros_ids: string[];
  
  // Equipamentos da equipe
  equipamentos_disponiveis: string[];
  veiculos_disponiveis_ids: string[];
  
  status: StatusBase;
  turno_trabalho: 'manha' | 'tarde' | 'noite' | 'integral';
  
  // Relacionamentos
  lider_equipe?: Pick<FuncionarioServicos, 'id' | 'nome_completo'>;
  membros?: Pick<FuncionarioServicos, 'id' | 'nome_completo'>[];
  veiculos_disponiveis?: Pick<VeiculoServicos, 'id' | 'placa_veiculo'>[];
}

export interface ServicoLimpeza extends BaseEntity {
  tipo_limpeza: 'varracao' | 'capina' | 'limpeza_praças' | 'desobstrucao_bueiros' | 'lavagem_vias';
  descricao_servico: string;
  
  // Localização
  localizacao_servico: {
    endereco_completo: string;
    bairro: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  
  status: 'programado' | 'em_execucao' | 'concluido' | 'cancelado';
  data_programacao: string;
  data_execucao?: string;
  data_conclusao?: string;
  equipe_responsavel_id: string;
  
  // Recursos utilizados
  materiais_utilizados: string[];
  equipamentos_utilizados: string[];
  tempo_execucao_horas?: number;
  
  observacoes_execucao?: string;
  fotos_antes: string[];
  fotos_depois: string[];
  
  // Relacionamentos
  equipe_responsavel?: Pick<EquipeServicos, 'id' | 'nome_equipe'>;
}

export interface ManutencaoUrbana extends BaseEntity {
  tipo_manutencao: 'calcada' | 'praca' | 'mobiliario' | 'sinalizacao' | 'playground' | 'outros';
  descricao_manutencao: string;
  
  // Localização
  localizacao_manutencao: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  
  status: 'solicitada' | 'aprovada' | 'em_execucao' | 'concluida' | 'cancelada';
  prioridade: PrioridadePadrao;
  data_solicitacao: string;
  data_aprovacao?: string;
  data_inicio?: string;
  data_conclusao?: string;
  
  // Execução
  tecnico_responsavel_id?: string;
  materiais_necessarios: string[];
  custo_estimado?: number;
  custo_real?: number;
  
  observacoes_tecnicas?: string;
  fotos_antes: string[];
  fotos_depois: string[];
  
  // Relacionamentos
  tecnico_responsavel?: Pick<FuncionarioServicos, 'id' | 'nome_completo'>;
}

export interface FuncionarioServicos extends BaseEntity, PessoaFisicaPadrao {
  // Identificação profissional
  matricula_funcional: string;
  
  // Contato
  contato: ContatoPadrao;
  endereco?: EnderecoPadrao;
  
  // Qualificação
  formacao_academica: {
    nivel: 'ensino_fundamental' | 'ensino_medio' | 'superior' | 'pos_graduacao';
    curso?: string;
    instituicao?: string;
    ano_conclusao?: number;
  }[];
  
  // Especialização
  areas_especializacao: string[];
  experiencia_anos?: number;
  
  // Trabalho
  cargo: string;
  carga_horaria_semanal: number;
  turno_trabalho: 'manha' | 'tarde' | 'noite' | 'integral';
  equipe_vinculada_id?: string;
  
  // Habilitações
  habilitacao_categoria?: string;
  certificacoes: string[];
  
  // Datas
  data_admissao: string;
  data_demissao?: string;
  
  status: StatusBase;
  observacoes?: string;
  
  // Relacionamentos
  equipe_vinculada?: Pick<EquipeServicos, 'id' | 'nome_equipe'>;
}

// Interfaces para formulários
export interface SolicitacaoAtendimento {
  cidadao_nome: string;
  cidadao_cpf: string;
  cidadao_telefone: string;
  cidadao_email: string;
  tipo_servico: 'iluminacao' | 'limpeza' | 'coleta_especial' | 'manutencao' | 'outros';
  assunto: string;
  descricao: string;
  prioridade: PrioridadePadrao;
  localizacao_servico?: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface SolicitacaoColetaEspecial {
  tipo_material: 'eletronicos' | 'moveis' | 'entulho' | 'podas' | 'oleo' | 'outros';
  descricao_material: string;
  quantidade_estimada: string;
  solicitante_nome: string;
  solicitante_cpf: string;
  solicitante_telefone: string;
  endereco_coleta: string;
  coordenadas_coleta: {
    latitude: number;
    longitude: number;
  };
}

export interface SolicitacaoManutencao {
  tipo_manutencao: 'calcada' | 'praca' | 'mobiliario' | 'sinalizacao' | 'playground' | 'outros';
  descricao_manutencao: string;
  localizacao_manutencao: {
    endereco_completo: string;
    coordenadas_geograficas: {
      latitude: number;
      longitude: number;
    };
  };
  prioridade: PrioridadePadrao;
  materiais_necessarios: string[];
}

// Filtros
export interface FiltrosServicos {
  status?: StatusBase | StatusProcesso;
  tipo?: string;
  equipe_id?: string;
  prioridade?: PrioridadePadrao;
  data_inicio?: string;
  data_fim?: string;
  responsavel_id?: string;
  busca?: string;
}

export interface EstadoServicos {
  atendimentos: AtendimentoServicos[];
  pontos_iluminacao: PontoIluminacao[];
  rotas_coleta: RotaColeta[];
  coletas_especiais: ColetaEspecial[];
  veiculos: VeiculoServicos[];
  equipes: EquipeServicos[];
  servicos_limpeza: ServicoLimpeza[];
  manutencoes_urbanas: ManutencaoUrbana[];
  funcionarios: FuncionarioServicos[];
  carregando: boolean;
  erro: string | null;
}