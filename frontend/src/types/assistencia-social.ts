
import { BaseEntity, PessoaFisicaPadrao, EnderecoPadrao, ContatoPadrao, StatusBase, StatusProcesso, PrioridadePadrao, TipoUsuario } from './common';

export interface Familia extends BaseEntity {
  codigo_familia: string;
  nome_referencia: string;
  responsavel_familiar: PessoaFisicaPadrao & {
    parentesco: 'pai' | 'mae' | 'avo_ava' | 'tio_tia' | 'irmao_irma' | 'outro';
    escolaridade: 'nao_alfabetizado' | 'fundamental_incompleto' | 'fundamental_completo' | 'medio_incompleto' | 'medio_completo' | 'superior_incompleto' | 'superior_completo' | 'pos_graduacao';
    situacao_trabalho: 'empregado_formal' | 'empregado_informal' | 'desempregado' | 'aposentado' | 'pensionista' | 'autonomo' | 'outro';
    renda_individual?: number;
  };
  endereco: EnderecoPadrao;
  contato: ContatoPadrao;
  composicao_familiar: {
    total_membros: number;
    criancas_0_6: number;
    criancas_7_14: number;
    adolescentes_15_17: number;
    adultos_18_59: number;
    idosos_60_mais: number;
    gestantes: number;
    deficientes: number;
  };
  nis_responsavel: string;
  renda_mensal_total: number;
  renda_per_capita: number;
  beneficios_recebidos: {
    tipo: 'bolsa_familia' | 'auxilio_emergencial' | 'bpc' | 'seguro_desemprego' | 'aposentadoria' | 'pensao' | 'outro';
    valor: number;
    inicio_recebimento: string;
    fim_recebimento?: string;
  }[];
  vulnerabilidades: {
    tipo: 'pobreza_extrema' | 'trabalho_infantil' | 'violencia_domestica' | 'uso_drogas' | 'abandono_escolar' | 'situacao_rua' | 'deficiencia' | 'idoso_vulneravel' | 'outro';
    descricao?: string;
    gravidade: 'baixa' | 'media' | 'alta' | 'critica';
  }[];
  prioridade: PrioridadePadrao;
  territorio: {
    microarea?: string;
    area_cras: string;
    referencia_cras: string;
  };
  situacao_habitacional: {
    tipo_moradia: 'casa' | 'apartamento' | 'comodo' | 'barraco' | 'outro';
    situacao_posse: 'propria' | 'alugada' | 'cedida' | 'ocupacao' | 'outro';
    condicoes: 'adequada' | 'inadequada' | 'precaria';
    servicos_basicos: {
      agua_encanada: boolean;
      energia_eletrica: boolean;
      esgoto_sanitario: boolean;
      coleta_lixo: boolean;
    };
  };
  data_ultimo_atendimento?: string;
  tecnico_referencia_id?: string;
  observacoes?: string;
  status: StatusBase;
  
  // Relacionamentos
  tecnico_referencia?: {
    id: string;
    nome: string;
    cargo: string;
  };
}

export interface AtendimentoPadrao extends BaseEntity {
  cidadao: string;
  cpf: string;
  data_atendimento: string;
  tipo: string;
  descricao: string;
  status: StatusProcesso;
  responsavel: string;
  local: string;
  encaminhamentos?: string[];
}

export interface UnidadeCRASPadrao extends BaseEntity {
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  coordenador: string;
  horario_funcionamento: string;
  servicos_oferecidos: string[];
  area_abrangencia: string[];
  equipe: FuncionarioPadrao[];
}

export interface ProgramaSocialPadrao extends BaseEntity {
  nome: string;
  descricao: string;
  publico: string;
  requisitos: string[];
  beneficios: string[];
  periodo_inscricao: string;
  status: StatusBase;
  responsavel: string;
  orcamento: number;
  atendidos: number;
  meta: number;
}

export interface BeneficioPadrao extends BaseEntity {
  nome: string;
  tipo: 'financeiro' | 'material' | 'servico';
  descricao: string;
  valor?: number;
  periodicidade?: string;
  familias_beneficiadas: number;
  data_inicio: string;
  data_fim?: string;
  status: StatusBase;
  condicionalidades?: string[];
}

export interface EntregaEmergencialPadrao extends BaseEntity {
  familia: string;
  endereco_entrega: string;
  itens: ItemPadrao[];
  data_entrega: string;
  status: StatusProcesso;
  responsavel_entrega?: string;
  observacoes?: string;
  motivo_solicitacao: string;
}

export interface ItemPadrao extends BaseEntity {
  nome: string;
  quantidade: number;
  tipo: 'alimento' | 'higiene' | 'limpeza' | 'medicamento' | 'vestuario' | 'outro';
}

export interface VisitaPadrao extends BaseEntity {
  familia: string;
  endereco: string;
  data_visita: string;
  tecnico: string;
  motivo: string;
  relatorio: string;
  situacao_encontrada: string;
  encaminhamentos?: string[];
  status: StatusProcesso;
  anexos?: string[];
}

export interface FuncionarioPadrao extends BaseEntity {
  nome: string;
  cargo: string;
  registro: string;
  contato: string;
}
