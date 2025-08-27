import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario } from './common';

export interface Produtor extends BaseEntity, PessoaFisicaPadrao {
  // Contato e localização
  endereco: EnderecoPadrao;
  contato: ContatoPadrao;
  
  // Propriedade rural
  propriedade: {
    nome: string;
    area_hectares: number;
    endereco_propriedade: EnderecoPadrao;
    coordenadas?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Produção
  tipos_producao: string[];
  
  // Documentação
  documentos: {
    car?: string; // Cadastro Ambiental Rural
    ccir?: string; // Certificado de Cadastro de Imóvel Rural
    status_itr: 'em_dia' | 'pendente' | 'vencido'; // Imposto Territorial Rural
  };
  
  // Vinculação
  programas_vinculados: string[];
  data_ultimo_atendimento?: string;
  observacoes?: string;
  status: StatusBase;
}

export interface AtendimentoAgricola extends BaseEntity {
  // Identificação
  numero_protocolo: string;
  produtor_id: string;
  
  // Atendimento
  data_atendimento: string;
  tipo_atendimento: string;
  assunto: string;
  descricao: string;
  tecnico_responsavel_id: string;
  
  // Status e prioridade
  status: StatusProcesso;
  prioridade: PrioridadePadrao;
  
  // Documentos e encaminhamentos
  documentos_anexos?: string[];
  encaminhamentos?: string[];
  proximo_contato?: string;
  observacoes?: string;
  
  // Relacionamentos
  produtor?: Pick<Produtor, 'id' | 'nome_completo' | 'cpf'>;
  tecnico_responsavel?: Pick<ProfissionalAgricola, 'id' | 'nome_completo'>;
}

export interface AssistenciaTecnicaRural extends BaseEntity {
  // Identificação
  produtor_id: string;
  propriedade_nome: string;
  
  // Classificação
  tipo_assistencia: string;
  categoria: string;
  
  // Cronograma
  data_inicio: string;
  data_fim?: string;
  
  // Responsável
  tecnico_responsavel_id: string;
  
  // Descrição técnica
  descricao_atividade: string;
  objetivo: string;
  metodologia?: string;
  resultados_esperados: string;
  resultados_obtidos?: string;
  
  // Status e avaliação
  status: StatusProcesso;
  avaliacao_produtor?: number; // 1-5
  
  // Financeiro
  custo_estimado?: number;
  custo_real?: number;
  
  // Recursos
  materiais_necessarios?: string[];
  cronograma?: Array<{
    etapa: string; 
    data_inicio: string; 
    data_fim: string; 
    status: StatusProcesso;
  }>;
  
  observacoes?: string;
  
  // Relacionamentos
  produtor?: Pick<Produtor, 'id' | 'nome_completo'>;
  tecnico_responsavel?: Pick<ProfissionalAgricola, 'id' | 'nome_completo'>;
}

export interface ProgramaRural extends BaseEntity {
  // Identificação
  nome: string;
  categoria: string;
  descricao: string;
  objetivos: string[];
  
  // Público e requisitos
  publico_alvo: string;
  requisitos: string[];
  beneficios: string[];
  
  // Cronograma
  data_inicio: string;
  data_fim?: string;
  
  // Gestão
  coordenador_id: string;
  equipe_ids: string[];
  
  // Financeiro
  orcamento?: number;
  fonte_recurso?: string;
  
  // Participação
  participantes_inscritos: number;
  participantes_ativos: number;
  
  // Metas e resultados
  metas_estabelecidas: Array<{
    meta: string; 
    valor: number; 
    prazo: string; 
    status: StatusProcesso;
  }>;
  resultados_alcancados?: Array<{
    resultado: string; 
    valor: number; 
    data: string; 
    observacoes?: string;
  }>;
  
  // Status e documentação
  status: StatusProcesso;
  documentos_necessarios?: string[];
  observacoes?: string;
  
  // Relacionamentos
  coordenador?: Pick<ProfissionalAgricola, 'id' | 'nome_completo'>;
  equipe?: Pick<ProfissionalAgricola, 'id' | 'nome_completo'>[];
}

export interface CursoCapacitacaoRural extends BaseEntity {
  // Identificação
  nome: string;
  categoria: string;
  modalidade: 'presencial' | 'online' | 'hibrido';
  
  // Instrutor
  instrutor_id: string;
  
  // Cronograma
  data_inicio: string;
  data_fim: string;
  horario_inicio: string;
  horario_fim: string;
  carga_horaria: number;
  
  // Local
  local?: string;
  link_online?: string;
  
  // Vagas e valor
  vagas_total: number;
  vagas_ocupadas: number;
  valor?: number;
  gratuito: boolean;
  
  // Conteúdo
  descricao: string;
  conteudo_programatico: string[];
  materiais_inclusos?: string[];
  requisitos?: string[];
  
  // Certificação
  certificacao: boolean;
  entidade_certificadora?: string;
  
  // Status e avaliação
  status: StatusProcesso;
  participantes_ids?: string[];
  avaliacao_media?: number; // 1-5
  observacoes?: string;
  
  // Relacionamentos
  instrutor?: Pick<ProfissionalAgricola, 'id' | 'nome_completo'>;
  participantes?: Pick<Produtor, 'id' | 'nome_completo'>[];
}

export interface ProfissionalAgricola extends BaseEntity, PessoaFisicaPadrao {
  // Identificação profissional
  matricula_funcional: string;
  crea?: string; // Conselho Regional de Engenharia e Agronomia
  
  // Contato
  contato: ContatoPadrao;
  endereco?: EnderecoPadrao;
  
  // Qualificação
  formacao_academica: {
    nivel: 'tecnico' | 'superior' | 'pos_graduacao' | 'mestrado' | 'doutorado';
    curso: string;
    instituicao: string;
    ano_conclusao: number;
  }[];
  
  especialidades: string[];
  experiencia_anos?: number;
  
  // Trabalho
  cargo: string;
  carga_horaria_semanal: number;
  areas_atuacao: string[];
  
  // Datas
  data_admissao: string;
  data_demissao?: string;
  
  status: StatusBase;
  observacoes?: string;
}