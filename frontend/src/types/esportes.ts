import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario } from './common';

export interface AtendimentoEsportivo extends BaseEntity {
  // Cidadão
  cidadao_nome: string;
  cidadao_cpf: string;
  cidadao_telefone: string;
  
  // Modalidade
  modalidade: string;
  categoria: 'infantil' | 'juvenil' | 'adulto' | 'terceira_idade';
  
  // Status e data
  status: StatusProcesso;
  data_atendimento: string;
  observacoes: string;
}

export interface EquipeEsportiva extends BaseEntity {
  nome: string;
  modalidade: string;
  categoria: 'base' | 'juvenil' | 'adulto' | 'master';
  tecnico_id: string;
  numero_atletas: number;
  status: StatusBase;
  competicoes_participando: string[];
  descricao: string;
  
  // Relacionamentos
  tecnico?: Pick<ProfissionalEsporte, 'id' | 'nome_completo'>;
}

export interface CompeticaoEsportiva extends BaseEntity {
  nome: string;
  modalidade: string;
  tipo: 'municipal' | 'regional' | 'estadual' | 'nacional';
  data_inicio: string;
  data_fim: string;
  local: string;
  equipes_participantes: string[];
  premiacao: string;
  status: 'planejada' | 'em_andamento' | 'finalizada' | 'cancelada';
  regulamento: string;
}

export interface AtletaFederadoPadrao extends BaseEntity {
  nome: string;
  cpf: string;
  data_nascimento: string;
  modalidade: string;
  categoria: string;
  federacao: string;
  numero_registro: string;
  vigencia: string;
  status: StatusBase;
  conquistas: string[];
}

export interface EscolinhaSportPadrao extends BaseEntity {
  nome: string;
  modalidade: string;
  idade_minima: number;
  idade_maxima: number;
  professor: string;
  local: string;
  horarios: string;
  dias_semana: string[];
  vagas: number;
  vagas_ocupadas: number;
  valor: number;
  descricao: string;
  status: StatusBase;
}

export interface EventoEsportivo {
  id: string;
  nome: string;
  tipo: 'Torneio' | 'Festival' | 'Clínica' | 'Palestra' | 'Outro';
  modalidade: string;
  data: string;
  horario: string;
  local: string;
  publicoAlvo: string;
  inscricoes: number;
  limiteInscricoes: number;
  valor: number;
  organizador: string;
  descricao: string;
  status: StatusProcesso;
}

export interface InfraestruturaEsportiva extends BaseEntity {
  nome: string;
  tipo: 'quadra' | 'campo' | 'piscina' | 'academia' | 'pista' | 'outro';
  endereco: EnderecoPadrao;
  capacidade: number;
  modalidades: string[];
  equipamentos: string[];
  horario_funcionamento: string;
  responsavel_id: string;
  contato: ContatoPadrao;
  status: StatusBase;
  observacoes: string;
  
  // Relacionamentos
  responsavel?: Pick<ProfissionalEsporte, 'id' | 'nome_completo'>;
}

export interface ProfissionalEsporte extends BaseEntity, PessoaFisicaPadrao {
  // Identificação profissional
  matricula_funcional: string;
  cref?: string; // Conselho Regional de Educação Física
  
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
  modalidades_especializacao: string[];
  categorias_atuacao: string[];
  experiencia_anos?: number;
  
  // Trabalho
  cargo: string;
  carga_horaria_semanal: number;
  locais_trabalho?: string[];
  
  // Datas
  data_admissao: string;
  data_demissao?: string;
  
  status: StatusBase;
  observacoes?: string;
}
