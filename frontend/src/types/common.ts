// =====================================================
// TIPOS COMUNS PADRONIZADOS PARA TODO O SISTEMA
// =====================================================

// =====================================================
// CAMPOS DE AUDITORIA OBRIGATÓRIOS
// =====================================================
export interface BaseEntity {
  id: string; // UUID sempre obrigatório
  created_at: string; // ISO string obrigatório
  updated_at: string; // ISO string obrigatório
  deleted_at?: string; // ISO string opcional para soft delete
}

// =====================================================
// STATUS PADRONIZADOS PARA TODO SISTEMA
// =====================================================
// =====================================================
// ENUMS UNIFICADOS OBRIGATÓRIOS - PADRÃO ÚNICO
// =====================================================

// Status base para qualquer entidade
export type StatusBase = 'ativo' | 'inativo' | 'pendente' | 'suspenso';

// Status específico para tenants
export type StatusTenant = 'ativo' | 'suspenso' | 'cancelado' | 'trial';

// Planos de tenant padronizados
export type PlanoTenant = 'starter' | 'professional' | 'enterprise';

// Hierarquia única de tipos de usuário
export type TipoUsuario = 
  | 'super_admin'      // Controle total do sistema
  | 'admin'            // Administrador do tenant
  | 'secretario'       // Secretário de pasta
  | 'diretor'          // Diretor de unidade
  | 'coordenador'      // Coordenador de área
  | 'supervisor'       // Supervisor de equipe
  | 'operador'         // Operador comum
  | 'cidadao';         // Cidadão/munícipe

// Níveis de permissão padronizados
export type NivelPermissao = 'read' | 'write' | 'delete' | 'approve' | 'admin';

export type StatusProcesso = 
  | 'aberto' 
  | 'em_andamento' 
  | 'aguardando_documentos' 
  | 'aguardando_aprovacao'
  | 'aprovado' 
  | 'rejeitado' 
  | 'concluido' 
  | 'cancelado';

export type StatusAgendamento = 
  | 'agendado' 
  | 'confirmado' 
  | 'realizado' 
  | 'faltou' 
  | 'cancelado' 
  | 'reagendado';

// Prioridade unificada (NUNCA usar 'normal' ou 'moderada')
export type PrioridadePadrao = 'baixa' | 'media' | 'alta' | 'urgente' | 'critica';

export type GravidadePadrao = 'leve' | 'moderada' | 'grave' | 'critica';

// =====================================================
// CAMPOS DE ENDEREÇO PADRONIZADOS
// =====================================================
export interface EnderecoPadrao {
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
  ponto_referencia?: string;
}

// =====================================================
// CAMPOS DE CONTATO PADRONIZADOS
// =====================================================
export interface ContatoPadrao {
  telefone_principal: string;
  telefone_secundario?: string;
  email_principal?: string;
  email_secundario?: string;
}

// =====================================================
// CAMPOS DE PESSOA FÍSICA PADRONIZADOS
// =====================================================
export interface PessoaFisicaPadrao {
  nome_completo: string;
  cpf: string;
  rg?: string;
  data_nascimento?: string;
  sexo?: 'M' | 'F' | 'O'; // Masculino, Feminino, Outro
  estado_civil?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
}

// =====================================================
// CAMPOS DE RESPONSÁVEL PADRONIZADOS
// =====================================================
export interface ResponsavelPadrao extends PessoaFisicaPadrao {
  parentesco?: string;
  e_responsavel_legal: boolean;
}

// =====================================================
// ESTRUTURA DE METADADOS PADRONIZADA
// =====================================================
export interface MetadadosPadrao {
  versao_registro: number;
  criado_por_id: string;
  modificado_por_id?: string;
  ip_origem?: string;
  user_agent?: string;
  observacoes_sistema?: string;
}

// =====================================================
// ESTRUTURA DE DOCUMENTOS PADRONIZADA
// =====================================================
export interface DocumentoPadrao {
  id: string;
  nome_arquivo: string;
  tipo_arquivo: string;
  tamanho_bytes: number;
  hash_arquivo: string;
  url_storage?: string;
  categoria: 'documento' | 'comprovante' | 'foto' | 'certificado' | 'outro';
  obrigatorio: boolean;
  validado: boolean;
  data_upload: string;
  uploaded_by_id: string;
}

// =====================================================
// ESTRUTURA DE COMENTÁRIOS/OBSERVAÇÕES PADRONIZADA
// =====================================================
export interface ComentarioPadrao extends BaseEntity {
  conteudo: string;
  tipo: 'observacao' | 'resposta_oficial' | 'solicitacao_documentos' | 'encaminhamento';
  visivel_cidadao: boolean;
  autor_id: string;
  autor_nome: string;
  autor_cargo?: string;
}

// =====================================================
// ESTRUTURA DE AVALIAÇÃO PADRONIZADA
// =====================================================
export interface AvaliacaoPadrao extends BaseEntity {
  nota: number; // 1-5
  comentario?: string;
  categoria: string;
  avaliado_por_id: string;
  pode_ser_publica: boolean;
}

// =====================================================
// ESTRUTURA DE AUDITORIA PADRONIZADA
// =====================================================
export interface LogAuditoriaPadrao extends BaseEntity {
  tabela_origem: string;
  registro_id: string;
  acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  dados_anteriores?: any;
  dados_novos?: any;
  usuario_id: string;
  usuario_nome: string;
  ip_origem: string;
  user_agent?: string;
  observacoes?: string;
}

// =====================================================
// ESTRUTURA DE NOTIFICAÇÃO PADRONIZADA
// =====================================================
export interface NotificacaoPadrao extends BaseEntity {
  destinatario_id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro' | 'protocolo' | 'sistema';
  prioridade: PrioridadePadrao;
  lida: boolean;
  data_leitura?: string;
  referencia_tipo?: string;
  referencia_id?: string;
  canal: 'sistema' | 'email' | 'sms' | 'push';
  tentativas_envio: number;
  enviada_com_sucesso: boolean;
}

// =====================================================
// ESTRUTURA DE ARQUIVO/ANEXO PADRONIZADA
// =====================================================
export interface ArquivoPadrao extends BaseEntity {
  nome_original: string;
  nome_sistema: string;
  extensao: string;
  tipo_mime: string;
  tamanho_bytes: number;
  hash_md5: string;
  caminho_storage: string;
  url_temporaria?: string;
  categoria: 'documento' | 'imagem' | 'video' | 'audio' | 'outro';
  publico: boolean;
  virus_scan_status: 'pendente' | 'limpo' | 'infectado' | 'erro';
  uploaded_by_id: string;
}

// =====================================================
// ESTRUTURA DE FILTROS PADRONIZADA
// =====================================================
export interface FiltrosPadrao {
  busca_texto?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: string | string[];
  prioridade?: string | string[];
  responsavel_id?: string;
  secretaria_id?: string;
  ativo?: boolean;
  page?: number;
  limit?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

// =====================================================
// ESTRUTURA DE PAGINAÇÃO PADRONIZADA
// =====================================================
export interface PaginacaoPadrao {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// =====================================================
// ESTRUTURA DE RESPOSTA API PADRONIZADA
// =====================================================
export interface RespostaAPIPadrao<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    pagination?: PaginacaoPadrao;
    total_records?: number;
    execution_time?: number;
    cached?: boolean;
  };
}

// =====================================================
// ESTRUTURA DE ERRO PADRONIZADA
// =====================================================
export interface ErroPadrao {
  code: string;
  message: string;
  field?: string;
  details?: any;
  timestamp: string;
  request_id?: string;
}

// =====================================================
// ESTRUTURA DE CONFIGURAÇÃO DE MÓDULO PADRONIZADA
// =====================================================
export interface ConfiguracaoModuloPadrao extends BaseEntity {
  modulo: string;
  chave: string;
  valor: any;
  tipo: 'string' | 'number' | 'boolean' | 'object' | 'array';
  descricao?: string;
  publico: boolean;
  editavel: boolean;
  validacao_schema?: any;
}

// =====================================================
// INTERFACES CRÍTICAS DO SISTEMA (ANTES FALTANTES)
// =====================================================

// Interface unificada para protocolos
export interface ProtocoloPadrao extends BaseEntity {
  // Identificação
  numero_protocolo: string;      // Número único (ex: "2025000001")
  tenant_id: string;             // FK → tenants.id
  
  // Solicitante (cidadão)
  solicitante: {
    nome_completo: string;
    cpf: string;
    email?: string;
    telefone: string;
    endereco: EnderecoPadrao;
  };
  
  // Conteúdo
  assunto: string;               // Título/assunto
  descricao: string;             // Descrição detalhada
  categoria: string;             // Categoria principal
  subcategoria?: string;         // Subcategoria específica
  secretaria_destino: string;    // FK → secretarias.codigo
  urgente: boolean;              // Se é urgente
  
  // Status e tramitação
  status: StatusProcesso;        // aberto | em_andamento | concluido | ...
  prioridade: PrioridadePadrao;  // baixa | media | alta | urgente | critica
  
  // Responsáveis
  atribuido_para_id?: string;    // FK → user_profiles.id
  criado_por_id: string;         // FK → user_profiles.id (quem criou)
  
  // Prazos
  prazo_legal?: number;          // Prazo em dias
  data_limite?: string;          // Data limite calculada
  data_resolucao?: string;       // Quando foi resolvido
  
  // Documentos e anexos
  documentos_anexos: string[];   // URLs dos arquivos
  documentos_obrigatorios: {
    nome: string;
    fornecido: boolean;
    arquivo_url?: string;
  }[];
  
  // Comunicação
  observacoes_publicas?: string;  // Visível para o cidadão
  observacoes_internas?: string;  // Apenas para servidores
  
  // Avaliação
  avaliacao_cidadao?: {
    nota: number;                // 1-5
    comentario?: string;
    data_avaliacao: string;
  };
}

// Interface unificada para secretarias
export interface SecretariaPadrao extends BaseEntity {
  // Identificação
  tenant_id: string;             // FK → tenants.id
  codigo: string;                // "SAUDE", "EDUCACAO" (único por tenant)
  nome: string;                  // "Secretaria Municipal de Saúde"
  sigla: string;                 // "SMS", "SME"
  
  // Responsáveis
  secretario_id?: string;        // FK → user_profiles.id
  secretario_adjunto_id?: string;// FK → user_profiles.id
  
  // Configuração visual
  cor_tema: string;              // "#DC2626" (vermelho saúde)
  icone: string;                 // "heart", "graduation-cap"
  descricao?: string;            // Descrição das atividades
  
  // Localização e contato
  endereco?: EnderecoPadrao;
  contato?: ContatoPadrao;
  horario_funcionamento?: {
    [dia: string]: {
      abertura: string;
      fechamento: string;
      funcionando: boolean;
    };
  };
  
  // Serviços oferecidos
  categorias_servicos: string[]; // ["Consultas", "Exames", "Vacinas"]
  servicos_oferecidos: {
    nome: string;
    descricao: string;
    prazo_dias: number;
    documentos_necessarios: string[];
    taxa?: number;
  }[];
  
  // Status
  status: StatusBase;            // ativo | inativo
  visivel_portal: boolean;       // Se aparece no portal do cidadão
}

// Interface unificada para user profiles
export interface UserProfilePadrao extends BaseEntity {
  // Vínculos
  tenant_id: string;             // FK → tenants.id
  supervisor_id?: string;        // FK → user_profiles.id (hierarquia)
  
  // Identificação
  email: string;                 // UNIQUE globalmente
  nome_completo: string;
  cpf: string;                   // UNIQUE por tenant
  
  // Hierarquia e acesso
  tipo_usuario: TipoUsuario;     // super_admin | admin | operador...
  cargo?: string;                // "Diretor de UBS Central"
  departamento?: string;         // "Secretaria de Saúde"
  
  // Status e configuração
  status: StatusBase;            // ativo | inativo | suspenso
  primeiro_login: boolean;       // Se já fez primeiro login
  ultimo_login?: string;         // Timestamp do último login
  senha_temporaria: boolean;     // Se está usando senha temporária
  
  // Dados pessoais
  endereco?: EnderecoPadrao;
  contato?: ContatoPadrao;
  data_nascimento?: string;
  foto_perfil?: string;          // URL da foto
  
  // Configurações de acesso
  permissoes: string[];          // Lista de permissões específicas
  secretarias_acesso: string[];  // Secretarias que tem acesso
  horario_trabalho?: {
    inicio: string;              // ex: "08:00"
    fim: string;                 // ex: "17:00"
    dias_semana: number[];       // [1,2,3,4,5] = seg-sex
  };
}

// =====================================================
// TIPOS PARA GESTÃO DE PERMISSÕES PADRONIZADA
// =====================================================
export type TipoPermissao = 'read' | 'write' | 'delete' | 'approve' | 'admin';

export interface PermissaoPadrao {
  modulo: string;
  acao: TipoPermissao;
  recurso?: string;
  condicoes?: Record<string, any>;
}

// =====================================================
// TIPOS PARA TENANT/MULTI-TENANCY PADRONIZADO
// =====================================================
export interface TenantPadrao extends BaseEntity {
  // Identificação única
  tenant_code: string;           // Código único (ex: "SAO001")
  nome: string;
  slug: string;                  // URL friendly
  cnpj: string;                  // CNPJ obrigatório
  
  // Localização
  cidade: string;
  estado: string;                // UF (ex: "SP") 
  regiao: string;                // Região (ex: "Sudeste")
  populacao: number;             // População estimada
  
  // Endereço e contato
  endereco?: EnderecoPadrao;
  contato?: ContatoPadrao;
  
  // Plano e status usando enums unificados
  plano: PlanoTenant;            // starter | professional | enterprise
  status: StatusTenant;          // ativo | suspenso | cancelado | trial
  data_expiracao?: string;
  
  // Responsável
  responsavel: {
    nome: string;
    email: string;
    telefone?: string;
    cargo: string;               // ex: "Prefeito", "Secretário de Tecnologia"
  };
  
  // Configurações visuais
  configuracoes: {
    logo_url?: string;
    cor_primaria: string;        // Hex color
    cor_secundaria: string;      // Hex color
    dominio_personalizado?: string;
    timezone: string;            // ex: "America/Sao_Paulo"
  };
  
  // Limites e uso
  limites: {
    usuarios_max: number;
    protocolos_mes_max: number;
    storage_mb_max: number;
    secretarias_ativas: string[];
  };
  
  uso_atual: {
    usuarios_ativos: number;
    protocolos_mes_atual: number;
    storage_usado_gb: number;
  };
}

// =====================================================
// TIPOS PARA LOGS DE SISTEMA PADRONIZADOS
// =====================================================
export interface LogSistemaPadrao extends BaseEntity {
  nivel: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  categoria: string;
  mensagem: string;
  contexto?: any;
  usuario_id?: string;
  tenant_id?: string;
  ip_origem?: string;
  request_id?: string;
  stack_trace?: string;
}

// =====================================================
// ESTRUTURA DE BUSCA/PESQUISA PADRONIZADA
// =====================================================
export interface ParametrosBuscaPadrao {
  termo: string;
  filtros?: Record<string, any>;
  facetas?: string[];
  destacar?: boolean;
  campos?: string[];
  operador?: 'AND' | 'OR';
  peso_campos?: Record<string, number>;
}

export interface ResultadoBuscaPadrao<T = any> {
  items: T[];
  total: number;
  tempo_busca: number;
  facetas?: Record<string, Array<{ valor: string; count: number }>>;
  sugestoes?: string[];
}

// =====================================================
// UTILITÁRIOS DE TIPOS
// =====================================================

// Torna todos os campos opcionais exceto os especificados
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Torna todos os campos obrigatórios exceto os especificados
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

// Remove campos específicos de um tipo
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Pega apenas campos específicos de um tipo
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};