import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario } from './common';

export interface EspacoCultural extends BaseEntity {
  // Identificação
  nome: string;
  tipo: string;
  
  // Localização
  endereco: EnderecoPadrao;
  contato: ContatoPadrao;
  
  // Capacidade e estrutura
  capacidade: number;
  horario_funcionamento: string;
  equipamentos: string[];
  acessibilidade: string[];
  
  // Valor e disponibilidade
  valor?: number;
  tipo_acesso: 'gratuito' | 'pago' | 'misto';
  
  // Responsável
  responsavel_id: string;
  
  // Status
  status: StatusBase;
  
  // Relacionamentos
  responsavel?: Pick<ProfissionalCultura, 'id' | 'nome_completo' | 'contato'>;
}

export interface ProjetoCultural extends BaseEntity {
  // Identificação
  nome: string;
  categoria: string;
  
  // Gestão
  coordenador_id: string;
  participantes_ids: string[];
  
  // Cronograma
  data_inicio: string;
  data_fim: string;
  
  // Financeiro
  orcamento?: number;
  fonte_recurso?: string;
  
  // Descrição
  objetivos: string;
  publico_alvo: string;
  metodologia: string;
  
  // Cronograma detalhado
  cronograma: Array<{
    atividade: string; 
    data_inicio: string; 
    data_fim: string; 
    responsavel_id: string;
  }>;
  
  // Resultados
  resultados_esperados: string;
  
  // Status
  status: StatusProcesso;
  
  // Relacionamentos
  coordenador?: Pick<ProfissionalCultura, 'id' | 'nome_completo'>;
  participantes?: Pick<ArtistaCultural, 'id' | 'nome_completo'>[];
}

export interface ManifestacaoCultural extends BaseEntity {
  // Identificação
  nome: string;
  tipo: string;
  origem: string;
  
  // Descrição
  descricao: string;
  historia?: string;
  caracteristicas: string[];
  
  // Praticantes e locais
  praticantes_ids: string[];
  locais_pratica: string[];
  periodicidade?: string;
  
  // Recursos
  materiais_necessarios?: string[];
  
  // Status de preservação
  status: StatusBase;
  
  // Relacionamentos
  praticantes?: Pick<ArtistaCultural, 'id' | 'nome_completo'>[];
}

export interface OficinaCultural extends BaseEntity {
  // Identificação
  nome: string;
  categoria: string;
  
  // Instrutor
  instrutor_id: string;
  
  // Cronograma
  data_inicio: string;
  data_fim: string;
  dias_semana: string[];
  horario_inicio: string;
  horario_fim: string;
  
  // Local
  local: string;
  
  // Vagas e público
  vagas_total: number;
  vagas_ocupadas: number;
  idade_minima?: number;
  
  // Material e valor
  materiais_necessarios: string[];
  valor?: number;
  gratuita: boolean;
  
  // Descrição
  descricao: string;
  
  // Status
  status: StatusProcesso;
  
  // Relacionamentos
  instrutor?: Pick<ProfissionalCultura, 'id' | 'nome_completo'>;
  inscritos?: Pick<ArtistaCultural, 'id' | 'nome_completo'>[];
}

export interface EventoCultural extends BaseEntity {
  // Identificação
  nome: string;
  categoria: string;
  
  // Cronograma
  data_inicio: string;
  data_fim: string;
  horario_inicio: string;
  horario_fim: string;
  
  // Local
  local: string;
  
  // Capacidade
  capacidade: number;
  inscricoes_realizadas: number;
  
  // Organização
  organizador_id: string;
  
  // Descrição
  descricao: string;
  publico_alvo: string;
  requisitos?: string;
  
  // Valor
  valor?: number;
  gratuito: boolean;
  
  // Status
  status: StatusProcesso;
  
  // Relacionamentos
  organizador?: Pick<ProfissionalCultura, 'id' | 'nome_completo'>;
  participantes?: Pick<ArtistaCultural, 'id' | 'nome_completo'>[];
}

export interface GrupoArtistico extends BaseEntity {
  // Identificação
  nome: string;
  categoria: string;
  
  // Liderança
  lider_id: string;
  
  // Contato
  contato?: ContatoPadrao;
  
  // Composição
  numero_membros: number;
  data_fundacao: string;
  
  // Descrição
  descricao: string;
  local_ensaio: string;
  
  // Status
  status: StatusBase;
  
  // Próximas atividades
  proxima_apresentacao?: string;
  local_apresentacao?: string;
  
  // Histórico
  historico_apresentacoes: string[];
  
  // Relacionamentos
  lider?: Pick<ArtistaCultural, 'id' | 'nome_completo'>;
  membros?: Pick<ArtistaCultural, 'id' | 'nome_completo'>[];
}

export interface ArtistaCultural extends BaseEntity, PessoaFisicaPadrao {
  // Contato
  contato: ContatoPadrao;
  endereco?: EnderecoPadrao;
  
  // Especialização artística
  areas_atuacao: string[];
  especialidades: string[];
  experiencia_anos?: number;
  
  // Formação
  formacao_artistica?: {
    tipo: 'tecnico' | 'superior' | 'livre' | 'autodidata';
    curso?: string;
    instituicao?: string;
    ano_conclusao?: number;
  }[];
  
  // Portfolio
  portfolio_url?: string;
  obras_principais?: string[];
  premios_reconhecimentos?: string[];
  
  // Status
  status: StatusBase;
  
  // Vinculação
  grupos_vinculados?: string[];
  projetos_participando?: string[];
  observacoes?: string;
}

export interface ProfissionalCultura extends BaseEntity, PessoaFisicaPadrao {
  // Identificação profissional
  matricula_funcional: string;
  
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
  espacos_responsavel?: string[];
  
  // Datas
  data_admissao: string;
  data_demissao?: string;
  
  status: StatusBase;
  observacoes?: string;
}