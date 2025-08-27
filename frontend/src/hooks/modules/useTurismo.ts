
import { useModuleCRUD } from '../useModuleCRUD';

// Tipos para o módulo Turismo
export interface TurismoPonto {
  id?: string;
  tenant_id?: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  endereco?: any;
  coordenadas_gps?: any;
  horario_funcionamento?: any;
  valor_entrada?: number;
  acessibilidade?: boolean;
  infraestrutura?: string[];
  capacidade_visitantes?: number;
  melhor_epoca_visita?: string;
  tempo_visita_sugerido?: number;
  nivel_dificuldade?: string;
  restricoes_idade?: string[];
  fotos?: string[];
  videos?: string[];
  avaliacoes?: any;
  responsavel_manutencao?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TurismoEstabelecimento {
  id?: string;
  tenant_id?: string;
  nome: string;
  tipo?: string;
  categoria?: string;
  proprietario_nome?: string;
  cnpj?: string;
  endereco?: any;
  contato?: any;
  capacidade?: number;
  servicos_oferecidos?: string[];
  comodidades?: string[];
  preco_medio?: number;
  horario_funcionamento?: any;
  aceita_cartao?: boolean;
  aceita_pix?: boolean;
  wifi_gratuito?: boolean;
  estacionamento?: boolean;
  acessibilidade?: boolean;
  certificacoes?: string[];
  avaliacoes?: any;
  fotos?: string[];
  website?: string;
  redes_sociais?: any;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TurismoRoteiro {
  id?: string;
  tenant_id?: string;
  nome: string;
  descricao?: string;
  tipo?: string;
  duracao_horas?: number;
  dificuldade?: string;
  publico_alvo?: string;
  pontos_turisticos?: string[];
  estabelecimentos?: string[];
  ordem_visitacao?: any;
  custo_estimado?: number;
  melhor_epoca?: string;
  restricoes?: string[];
  equipamentos_necessarios?: string[];
  guia_necessario?: boolean;
  transporte_incluido?: boolean;
  alimentacao_incluida?: boolean;
  mapa_roteiro?: string;
  fotos?: string[];
  avaliacoes?: any;
  criado_por_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TurismoEvento {
  id?: string;
  tenant_id?: string;
  nome: string;
  descricao?: string;
  tipo?: string;
  categoria?: string;
  data_inicio?: string;
  data_fim?: string;
  local_realizacao?: string;
  ponto_turistico_id?: string;
  publico_esperado?: number;
  publico_presente?: number;
  valor_entrada?: number;
  organizador?: string;
  patrocinadores?: string[];
  atracoes?: string[];
  programacao?: any;
  infraestrutura_montada?: string[];
  seguranca_contratada?: boolean;
  ambulancia_standby?: boolean;
  cobertura_midia?: string[];
  impacto_economico_estimado?: number;
  hospedagens_reservadas?: number;
  restaurantes_participantes?: number;
  avaliacoes?: any;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TurismoVisitante {
  id?: string;
  tenant_id?: string;
  data_visita?: string;
  ponto_turistico_id?: string;
  estabelecimento_id?: string;
  evento_id?: string;
  origem_visitante?: string;
  cidade_origem?: string;
  estado_origem?: string;
  pais_origem?: string;
  faixa_etaria?: string;
  sexo?: string;
  motivo_visita?: string;
  meio_transporte?: string;
  forma_conhecimento?: string;
  gasto_estimado?: number;
  avaliacao_geral?: number;
  sugestoes?: string;
  permanencia_dias?: number;
  created_at?: string;
  updated_at?: string;
}

// Hooks especializados para cada tabela
export const useTurismoPontos = () => useModuleCRUD<TurismoPonto>('turismo_pontos');
export const useTurismoEstabelecimentos = () => useModuleCRUD<TurismoEstabelecimento>('turismo_estabelecimentos');
export const useTurismoRoteiros = () => useModuleCRUD<TurismoRoteiro>('turismo_roteiros');
export const useTurismoEventos = () => useModuleCRUD<TurismoEvento>('turismo_eventos');
export const useTurismoVisitantes = () => useModuleCRUD<TurismoVisitante>('turismo_visitantes');
