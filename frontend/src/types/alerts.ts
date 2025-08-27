import { BaseEntity, StatusBase, PrioridadePadrao, TipoUsuario, UserProfilePadrao } from './common';

export interface CategoriaAlerta extends BaseEntity {
  nome: string;
  descricao?: string;
  cor: string;
  icone: string;
  status: StatusBase;
}

export interface AlertaCidadao extends BaseEntity {
  titulo: string;
  mensagem: string;
  tipo_alerta: 'info' | 'aviso' | 'urgente' | 'emergencia';
  categoria_id?: string;
  prioridade: PrioridadePadrao;
  tipo_destinatario: 'todos' | 'departamento' | 'regiao' | 'customizado';
  criterios_destinatario?: Record<string, string | number | boolean>;
  remetente_id: string;
  status: StatusBase;
  agendado_para?: string;
  expira_em?: string;
  
  // Relacionamentos
  categoria?: Pick<CategoriaAlerta, 'id' | 'nome' | 'cor'>;
  remetente?: Pick<UserProfilePadrao, 'id' | 'nome_completo' | 'email'>;
  estatisticas_entrega?: EstatisticasEntregaAlerta;
}

export interface DestinatarioAlerta extends BaseEntity {
  alerta_id: string;
  usuario_id: string;
  lido: boolean;
  data_leitura?: string;
  
  // Relacionamentos
  usuario?: Pick<UserProfilePadrao, 'id' | 'nome_completo' | 'email'>;
}

export interface EstatisticasEntregaAlerta extends BaseEntity {
  alerta_id: string;
  total_destinatarios: number;
  entregues: number;
  lidos: number;
  cliques: number;
}

export interface SolicitacaoCriarAlerta {
  titulo: string;
  mensagem: string;
  tipo_alerta: 'info' | 'aviso' | 'urgente' | 'emergencia';
  categoria_id?: string;
  prioridade: PrioridadePadrao;
  tipo_destinatario: 'todos' | 'departamento' | 'regiao' | 'customizado';
  criterios_destinatario?: Record<string, string | number | boolean>;
  agendado_para?: string;
  expira_em?: string;
}

export interface FiltrosAlerta {
  tipo_alerta?: string;
  categoria_id?: string;
  prioridade?: PrioridadePadrao;
  status?: StatusBase;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
}

export interface EstadoAlertas {
  alertas: AlertaCidadao[];
  categorias: CategoriaAlerta[];
  destinatarios: DestinatarioAlerta[];
  carregando: boolean;
  erro: string | null;
}