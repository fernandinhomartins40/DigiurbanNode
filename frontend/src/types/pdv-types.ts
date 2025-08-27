// Tipos unificados para o Sistema de PDV (Ponto de Atendimento Virtual)

export interface PDVAtendimento {
  id: string;
  protocolo: string;
  solicitante: {
    nome: string;
    cpf?: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    tipo: 'cidadao' | 'servidor' | 'prefeito' | 'externo';
  };
  tipoSolicitacao: string; // Específico de cada módulo
  categoria: string; // Específico de cada módulo
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'novo' | 'triagem' | 'em_andamento' | 'aguardando' | 'concluido' | 'cancelado';
  responsavel?: {
    nome: string;
    cargo: string;
    setor: string;
  };
  dataAbertura: string;
  dataPrevista?: string;
  dataConclusao?: string;
  descricao: string;
  observacoes?: string;
  anexos?: Array<{
    nome: string;
    url: string;
    tipo: string;
  }>;
  historico: Array<{
    data: string;
    usuario: string;
    acao: string;
    observacao?: string;
  }>;
  localizacao?: {
    endereco: string;
    bairro: string;
    cep?: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
  };
  dadosEspecificos?: Record<string, any>; // Dados específicos do módulo
}

export interface PDVFiltros {
  busca?: string;
  status?: string[];
  prioridade?: string[];
  categoria?: string[];
  tipoSolicitacao?: string[];
  dataInicio?: string;
  dataFim?: string;
  responsavel?: string;
  solicitante?: string;
}

export interface PDVEstatisticas {
  total: number;
  novos: number;
  emAndamento: number;
  concluidos: number;
  tempoMedioAtendimento: number; // em dias
  satisfacaoMedia: number; // 0-5
  porStatus: Record<string, number>;
  porPrioridade: Record<string, number>;
  porCategoria: Record<string, number>;
}

export interface PDVConfiguracao {
  modulo: string;
  nome: string;
  icone: string;
  cor: string;
  tiposAtendimento: Array<{
    id: string;
    nome: string;
    categoria: string;
    tempoEstimado: number; // em dias
    requereLocalizacao: boolean;
    requereAnexos: boolean;
    camposEspecificos?: Array<{
      nome: string;
      tipo: 'text' | 'select' | 'date' | 'number' | 'textarea';
      obrigatorio: boolean;
      opcoes?: string[];
    }>;
  }>;
  categorias: Array<{
    id: string;
    nome: string;
    cor: string;
  }>;
  prioridades: Array<{
    id: string;
    nome: string;
    cor: string;
    sla: number; // em horas
  }>;
  formularioPersonalizado?: {
    campos: Array<{
      nome: string;
      label: string;
      tipo: string;
      obrigatorio: boolean;
      opcoes?: string[];
    }>;
  };
}

// Configurações específicas por módulo
export const PDV_CONFIGURACOES: Record<string, PDVConfiguracao> = {
  gabinete: {
    modulo: 'gabinete',
    nome: 'Gabinete do Prefeito',
    icone: 'Briefcase',
    cor: '#1E40AF',
    tiposAtendimento: [
      { id: 'audiencia', nome: 'Solicitação de Audiência', categoria: 'audiencia', tempoEstimado: 7, requereLocalizacao: false, requereAnexos: false },
      { id: 'reclamacao', nome: 'Reclamação', categoria: 'reclamacao', tempoEstimado: 5, requereLocalizacao: true, requereAnexos: true },
      { id: 'sugestao', nome: 'Sugestão', categoria: 'sugestao', tempoEstimado: 3, requereLocalizacao: false, requereAnexos: false },
      { id: 'denuncia', nome: 'Denúncia', categoria: 'denuncia', tempoEstimado: 10, requereLocalizacao: true, requereAnexos: true },
      { id: 'informacao', nome: 'Solicitação de Informação', categoria: 'informacao', tempoEstimado: 2, requereLocalizacao: false, requereAnexos: false }
    ],
    categorias: [
      { id: 'audiencia', nome: 'Audiências', cor: '#3B82F6' },
      { id: 'reclamacao', nome: 'Reclamações', cor: '#EF4444' },
      { id: 'sugestao', nome: 'Sugestões', cor: '#10B981' },
      { id: 'denuncia', nome: 'Denúncias', cor: '#F59E0B' },
      { id: 'informacao', nome: 'Informações', cor: '#8B5CF6' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 168 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 72 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 24 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 4 }
    ]
  },
  educacao: {
    modulo: 'educacao',
    nome: 'Secretaria de Educação',
    icone: 'GraduationCap',
    cor: '#059669',
    tiposAtendimento: [
      { id: 'matricula', nome: 'Matrícula Escolar', categoria: 'matricula', tempoEstimado: 5, requereLocalizacao: false, requereAnexos: true },
      { id: 'transferencia', nome: 'Transferência Escolar', categoria: 'matricula', tempoEstimado: 3, requereLocalizacao: false, requereAnexos: true },
      { id: 'transporte', nome: 'Transporte Escolar', categoria: 'transporte', tempoEstimado: 7, requereLocalizacao: true, requereAnexos: false },
      { id: 'merenda', nome: 'Questões da Merenda', categoria: 'merenda', tempoEstimado: 2, requereLocalizacao: true, requereAnexos: true },
      { id: 'infraestrutura', nome: 'Infraestrutura Escolar', categoria: 'infraestrutura', tempoEstimado: 10, requereLocalizacao: true, requereAnexos: true },
      { id: 'ocorrencia', nome: 'Registrar Ocorrência', categoria: 'ocorrencia', tempoEstimado: 1, requereLocalizacao: false, requereAnexos: false }
    ],
    categorias: [
      { id: 'matricula', nome: 'Matrículas', cor: '#3B82F6' },
      { id: 'transporte', nome: 'Transporte', cor: '#F59E0B' },
      { id: 'merenda', nome: 'Merenda', cor: '#10B981' },
      { id: 'infraestrutura', nome: 'Infraestrutura', cor: '#8B5CF6' },
      { id: 'ocorrencia', nome: 'Ocorrências', cor: '#EF4444' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 120 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 48 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 24 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 4 }
    ]
  },
  cultura: {
    modulo: 'cultura',
    nome: 'Secretaria de Cultura',
    icone: 'Palette',
    cor: '#7C3AED',
    tiposAtendimento: [
      { id: 'evento', nome: 'Autorização de Evento', categoria: 'evento', tempoEstimado: 10, requereLocalizacao: true, requereAnexos: true },
      { id: 'espaco', nome: 'Reserva de Espaço Cultural', categoria: 'espaco', tempoEstimado: 5, requereLocalizacao: false, requereAnexos: false },
      { id: 'projeto', nome: 'Submissão de Projeto Cultural', categoria: 'projeto', tempoEstimado: 20, requereLocalizacao: false, requereAnexos: true },
      { id: 'grupo', nome: 'Cadastro de Grupo Artístico', categoria: 'grupo', tempoEstimado: 7, requereLocalizacao: false, requereAnexos: true },
      { id: 'oficina', nome: 'Inscrição em Oficina', categoria: 'oficina', tempoEstimado: 3, requereLocalizacao: false, requereAnexos: false },
      { id: 'patrimonio', nome: 'Patrimônio Cultural', categoria: 'patrimonio', tempoEstimado: 15, requereLocalizacao: true, requereAnexos: true }
    ],
    categorias: [
      { id: 'evento', nome: 'Eventos', cor: '#3B82F6' },
      { id: 'espaco', nome: 'Espaços', cor: '#10B981' },
      { id: 'projeto', nome: 'Projetos', cor: '#F59E0B' },
      { id: 'grupo', nome: 'Grupos Artísticos', cor: '#8B5CF6' },
      { id: 'oficina', nome: 'Oficinas', cor: '#06B6D4' },
      { id: 'patrimonio', nome: 'Patrimônio', cor: '#EF4444' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 240 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 120 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 48 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 24 }
    ]
  },
  habitacao: {
    modulo: 'habitacao',
    nome: 'Secretaria de Habitação',
    icone: 'Home',
    cor: '#DC2626',
    tiposAtendimento: [
      { id: 'inscricao', nome: 'Inscrição em Programa', categoria: 'inscricao', tempoEstimado: 7, requereLocalizacao: false, requereAnexos: true },
      { id: 'informacao', nome: 'Solicitação de Informação', categoria: 'informacao', tempoEstimado: 2, requereLocalizacao: false, requereAnexos: false },
      { id: 'recurso', nome: 'Recurso Administrativo', categoria: 'recurso', tempoEstimado: 15, requereLocalizacao: false, requereAnexos: true },
      { id: 'regularizacao', nome: 'Regularização Fundiária', categoria: 'regularizacao', tempoEstimado: 30, requereLocalizacao: true, requereAnexos: true },
      { id: 'vistoria', nome: 'Solicitação de Vistoria', categoria: 'vistoria', tempoEstimado: 10, requereLocalizacao: true, requereAnexos: false },
      { id: 'reclamacao', nome: 'Reclamação', categoria: 'reclamacao', tempoEstimado: 5, requereLocalizacao: true, requereAnexos: true }
    ],
    categorias: [
      { id: 'inscricao', nome: 'Inscrições', cor: '#3B82F6' },
      { id: 'informacao', nome: 'Informações', cor: '#8B5CF6' },
      { id: 'recurso', nome: 'Recursos', cor: '#F59E0B' },
      { id: 'regularizacao', nome: 'Regularização', cor: '#10B981' },
      { id: 'vistoria', nome: 'Vistorias', cor: '#06B6D4' },
      { id: 'reclamacao', nome: 'Reclamações', cor: '#EF4444' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 168 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 72 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 24 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 8 }
    ]
  },
  esportes: {
    modulo: 'esportes',
    nome: 'Secretaria de Esportes',
    icone: 'Trophy',
    cor: '#F59E0B',
    tiposAtendimento: [
      { id: 'inscricao_equipe', nome: 'Inscrição de Equipe', categoria: 'equipes', tempoEstimado: 5, requereLocalizacao: false, requereAnexos: true },
      { id: 'inscricao_atleta', nome: 'Inscrição de Atleta', categoria: 'atletas', tempoEstimado: 3, requereLocalizacao: false, requereAnexos: true },
      { id: 'inscricao_competicao', nome: 'Inscrição em Competição', categoria: 'competicoes', tempoEstimado: 7, requereLocalizacao: false, requereAnexos: false },
      { id: 'inscricao_escolinha', nome: 'Inscrição em Escolinha', categoria: 'escolinhas', tempoEstimado: 2, requereLocalizacao: false, requereAnexos: true },
      { id: 'reserva_espaco', nome: 'Reserva de Espaço Esportivo', categoria: 'espacos', tempoEstimado: 1, requereLocalizacao: true, requereAnexos: false },
      { id: 'evento_esportivo', nome: 'Organização de Evento', categoria: 'eventos', tempoEstimado: 15, requereLocalizacao: true, requereAnexos: true }
    ],
    categorias: [
      { id: 'equipes', nome: 'Equipes', cor: '#3B82F6' },
      { id: 'atletas', nome: 'Atletas', cor: '#10B981' },
      { id: 'competicoes', nome: 'Competições', cor: '#F59E0B' },
      { id: 'escolinhas', nome: 'Escolinhas', cor: '#8B5CF6' },
      { id: 'espacos', nome: 'Espaços', cor: '#06B6D4' },
      { id: 'eventos', nome: 'Eventos', cor: '#EF4444' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 120 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 48 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 24 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 8 }
    ]
  },
  "meio-ambiente": {
    modulo: 'meio-ambiente',
    nome: 'Secretaria de Meio Ambiente',
    icone: 'TreePine',
    cor: '#16A34A',
    tiposAtendimento: [
      { id: 'licenca_ambiental', nome: 'Solicitação de Licença', categoria: 'licencas', tempoEstimado: 30, requereLocalizacao: true, requereAnexos: true },
      { id: 'denuncia_ambiental', nome: 'Denúncia Ambiental', categoria: 'denuncias', tempoEstimado: 5, requereLocalizacao: true, requereAnexos: true },
      { id: 'autorizacao_poda', nome: 'Autorização para Poda', categoria: 'autorizacoes', tempoEstimado: 7, requereLocalizacao: true, requereAnexos: false },
      { id: 'coleta_especial', nome: 'Coleta Especial', categoria: 'coleta', tempoEstimado: 3, requereLocalizacao: true, requereAnexos: false },
      { id: 'programa_ambiental', nome: 'Inscrição em Programa', categoria: 'programas', tempoEstimado: 10, requereLocalizacao: false, requereAnexos: true },
      { id: 'vistoria_ambiental', nome: 'Solicitação de Vistoria', categoria: 'vistorias', tempoEstimado: 15, requereLocalizacao: true, requereAnexos: false }
    ],
    categorias: [
      { id: 'licencas', nome: 'Licenças', cor: '#3B82F6' },
      { id: 'denuncias', nome: 'Denúncias', cor: '#EF4444' },
      { id: 'autorizacoes', nome: 'Autorizações', cor: '#F59E0B' },
      { id: 'coleta', nome: 'Coleta', cor: '#10B981' },
      { id: 'programas', nome: 'Programas', cor: '#8B5CF6' },
      { id: 'vistorias', nome: 'Vistorias', cor: '#06B6D4' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 240 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 120 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 48 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 24 }
    ]
  },
  turismo: {
    modulo: 'turismo',
    nome: 'Secretaria de Turismo',
    icone: 'Camera',
    cor: '#0EA5E9',
    tiposAtendimento: [
      { id: 'cadastro_guia', nome: 'Cadastro de Guia', categoria: 'cadastros', tempoEstimado: 10, requereLocalizacao: false, requereAnexos: true },
      { id: 'cadastro_estabelecimento', nome: 'Cadastro de Estabelecimento', categoria: 'cadastros', tempoEstimado: 15, requereLocalizacao: true, requereAnexos: true },
      { id: 'informacao_turistica', nome: 'Informação Turística', categoria: 'informacoes', tempoEstimado: 1, requereLocalizacao: false, requereAnexos: false },
      { id: 'evento_turistico', nome: 'Evento Turístico', categoria: 'eventos', tempoEstimado: 20, requereLocalizacao: true, requereAnexos: true },
      { id: 'promocao_destino', nome: 'Promoção de Destino', categoria: 'promocoes', tempoEstimado: 30, requereLocalizacao: true, requereAnexos: true },
      { id: 'suporte_turista', nome: 'Suporte ao Turista', categoria: 'suporte', tempoEstimado: 2, requereLocalizacao: false, requereAnexos: false }
    ],
    categorias: [
      { id: 'cadastros', nome: 'Cadastros', cor: '#3B82F6' },
      { id: 'informacoes', nome: 'Informações', cor: '#8B5CF6' },
      { id: 'eventos', nome: 'Eventos', cor: '#F59E0B' },
      { id: 'promocoes', nome: 'Promoções', cor: '#10B981' },
      { id: 'suporte', nome: 'Suporte', cor: '#06B6D4' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 168 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 72 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 24 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 8 }
    ]
  },
  "assistencia-social": {
    modulo: 'assistencia-social',
    nome: 'Secretaria de Assistência Social',
    icone: 'Users',
    cor: '#7C3AED',
    tiposAtendimento: [
      { id: 'auxilio_emergencial', nome: 'Auxílio Emergencial', categoria: 'auxilios', tempoEstimado: 5, requereLocalizacao: false, requereAnexos: true },
      { id: 'inscricao_programa', nome: 'Inscrição em Programa', categoria: 'programas', tempoEstimado: 7, requereLocalizacao: false, requereAnexos: true },
      { id: 'atendimento_cras', nome: 'Atendimento CRAS', categoria: 'atendimentos', tempoEstimado: 3, requereLocalizacao: false, requereAnexos: false },
      { id: 'atendimento_creas', nome: 'Atendimento CREAS', categoria: 'atendimentos', tempoEstimado: 5, requereLocalizacao: false, requereAnexos: false },
      { id: 'beneficio_social', nome: 'Benefício Social', categoria: 'beneficios', tempoEstimado: 10, requereLocalizacao: false, requereAnexos: true },
      { id: 'entrega_emergencial', nome: 'Entrega Emergencial', categoria: 'entregas', tempoEstimado: 2, requereLocalizacao: true, requereAnexos: false }
    ],
    categorias: [
      { id: 'auxilios', nome: 'Auxílios', cor: '#3B82F6' },
      { id: 'programas', nome: 'Programas', cor: '#10B981' },
      { id: 'atendimentos', nome: 'Atendimentos', cor: '#F59E0B' },
      { id: 'beneficios', nome: 'Benefícios', cor: '#8B5CF6' },
      { id: 'entregas', nome: 'Entregas', cor: '#EF4444' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 72 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 24 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 8 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 4 }
    ]
  },
  "seguranca-publica": {
    modulo: 'seguranca-publica',
    nome: 'Secretaria de Segurança Pública',
    icone: 'Shield',
    cor: '#DC2626',
    tiposAtendimento: [
      { id: 'registro_ocorrencia', nome: 'Registro de Ocorrência', categoria: 'ocorrencias', tempoEstimado: 2, requereLocalizacao: true, requereAnexos: true },
      { id: 'solicitacao_apoio', nome: 'Solicitação de Apoio', categoria: 'apoio', tempoEstimado: 1, requereLocalizacao: true, requereAnexos: false },
      { id: 'denuncia_seguranca', nome: 'Denúncia de Segurança', categoria: 'denuncias', tempoEstimado: 3, requereLocalizacao: true, requereAnexos: true },
      { id: 'vigilancia_integrada', nome: 'Vigilância Integrada', categoria: 'vigilancia', tempoEstimado: 5, requereLocalizacao: true, requereAnexos: false },
      { id: 'alerta_seguranca', nome: 'Alerta de Segurança', categoria: 'alertas', tempoEstimado: 1, requereLocalizacao: true, requereAnexos: false },
      { id: 'patrulhamento', nome: 'Solicitação de Patrulhamento', categoria: 'patrulhamento', tempoEstimado: 2, requereLocalizacao: true, requereAnexos: false }
    ],
    categorias: [
      { id: 'ocorrencias', nome: 'Ocorrências', cor: '#EF4444' },
      { id: 'apoio', nome: 'Apoio', cor: '#3B82F6' },
      { id: 'denuncias', nome: 'Denúncias', cor: '#F59E0B' },
      { id: 'vigilancia', nome: 'Vigilância', cor: '#8B5CF6' },
      { id: 'alertas', nome: 'Alertas', cor: '#DC2626' },
      { id: 'patrulhamento', nome: 'Patrulhamento', cor: '#10B981' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 24 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 8 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 2 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 1 }
    ]
  },
  "servicos-publicos": {
    modulo: 'servicos-publicos',
    nome: 'Secretaria de Serviços Públicos',
    icone: 'Lightbulb',
    cor: '#FBBF24',
    tiposAtendimento: [
      { id: 'iluminacao_publica', nome: 'Iluminação Pública', categoria: 'iluminacao', tempoEstimado: 5, requereLocalizacao: true, requereAnexos: true },
      { id: 'limpeza_urbana', nome: 'Limpeza Urbana', categoria: 'limpeza', tempoEstimado: 3, requereLocalizacao: true, requereAnexos: true },
      { id: 'coleta_especial', nome: 'Coleta Especial', categoria: 'coleta', tempoEstimado: 7, requereLocalizacao: true, requereAnexos: false },
      { id: 'manutencao_via', nome: 'Manutenção de Via', categoria: 'manutencao', tempoEstimado: 10, requereLocalizacao: true, requereAnexos: true },
      { id: 'poda_arvore', nome: 'Poda de Árvore', categoria: 'poda', tempoEstimado: 5, requereLocalizacao: true, requereAnexos: false },
      { id: 'problema_foto', nome: 'Problema com Foto', categoria: 'problemas', tempoEstimado: 2, requereLocalizacao: true, requereAnexos: true }
    ],
    categorias: [
      { id: 'iluminacao', nome: 'Iluminação', cor: '#F59E0B' },
      { id: 'limpeza', nome: 'Limpeza', cor: '#10B981' },
      { id: 'coleta', nome: 'Coleta', cor: '#3B82F6' },
      { id: 'manutencao', nome: 'Manutenção', cor: '#8B5CF6' },
      { id: 'poda', nome: 'Poda', cor: '#16A34A' },
      { id: 'problemas', nome: 'Problemas', cor: '#EF4444' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 168 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 72 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 24 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 8 }
    ]
  },
  "planejamento-urbano": {
    modulo: 'planejamento-urbano',
    nome: 'Secretaria de Planejamento Urbano',
    icone: 'MapPin',
    cor: '#EA580C',
    tiposAtendimento: [
      { id: 'aprovacao_projeto', nome: 'Aprovação de Projeto', categoria: 'projetos', tempoEstimado: 30, requereLocalizacao: true, requereAnexos: true },
      { id: 'emissao_alvara', nome: 'Emissão de Alvará', categoria: 'alvaras', tempoEstimado: 15, requereLocalizacao: true, requereAnexos: true },
      { id: 'consulta_publica', nome: 'Consulta Pública', categoria: 'consultas', tempoEstimado: 45, requereLocalizacao: true, requereAnexos: true },
      { id: 'reclamacao_urbanistica', nome: 'Reclamação Urbanística', categoria: 'reclamacoes', tempoEstimado: 7, requereLocalizacao: true, requereAnexos: true },
      { id: 'certidao_urbanistica', nome: 'Certidão Urbanística', categoria: 'certidoes', tempoEstimado: 10, requereLocalizacao: true, requereAnexos: false },
      { id: 'vistoria_obra', nome: 'Vistoria de Obra', categoria: 'vistorias', tempoEstimado: 5, requereLocalizacao: true, requereAnexos: false }
    ],
    categorias: [
      { id: 'projetos', nome: 'Projetos', cor: '#3B82F6' },
      { id: 'alvaras', nome: 'Alvarás', cor: '#10B981' },
      { id: 'consultas', nome: 'Consultas', cor: '#8B5CF6' },
      { id: 'reclamacoes', nome: 'Reclamações', cor: '#EF4444' },
      { id: 'certidoes', nome: 'Certidões', cor: '#F59E0B' },
      { id: 'vistorias', nome: 'Vistorias', cor: '#06B6D4' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 720 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 360 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 120 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 48 }
    ]
  },
  agricultura: {
    modulo: 'agricultura',
    nome: 'Secretaria de Agricultura',
    icone: 'Tractor',
    cor: '#65A30D',
    tiposAtendimento: [
      { id: 'cadastro_produtor', nome: 'Cadastro de Produtor', categoria: 'cadastros', tempoEstimado: 5, requereLocalizacao: true, requereAnexos: true },
      { id: 'assistencia_tecnica', nome: 'Assistência Técnica', categoria: 'assistencia', tempoEstimado: 10, requereLocalizacao: true, requereAnexos: false },
      { id: 'programa_rural', nome: 'Inscrição em Programa', categoria: 'programas', tempoEstimado: 15, requereLocalizacao: false, requereAnexos: true },
      { id: 'curso_capacitacao', nome: 'Curso/Capacitação', categoria: 'cursos', tempoEstimado: 7, requereLocalizacao: false, requereAnexos: false },
      { id: 'credito_rural', nome: 'Crédito Rural', categoria: 'credito', tempoEstimado: 20, requereLocalizacao: false, requereAnexos: true },
      { id: 'extensao_rural', nome: 'Extensão Rural', categoria: 'extensao', tempoEstimado: 5, requereLocalizacao: true, requereAnexos: false }
    ],
    categorias: [
      { id: 'cadastros', nome: 'Cadastros', cor: '#3B82F6' },
      { id: 'assistencia', nome: 'Assistência', cor: '#10B981' },
      { id: 'programas', nome: 'Programas', cor: '#F59E0B' },
      { id: 'cursos', nome: 'Cursos', cor: '#8B5CF6' },
      { id: 'credito', nome: 'Crédito', cor: '#06B6D4' },
      { id: 'extensao', nome: 'Extensão', cor: '#16A34A' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 240 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 120 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 48 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 24 }
    ]
  },
  saude: {
    modulo: 'saude',
    nome: 'Secretaria de Saúde',
    icone: 'Heart',
    cor: '#DC2626',
    tiposAtendimento: [
      { id: 'agendamento_consulta', nome: 'Agendamento de Consulta', categoria: 'agendamentos', tempoEstimado: 1, requereLocalizacao: false, requereAnexos: false },
      { id: 'solicitacao_exame', nome: 'Solicitação de Exame', categoria: 'exames', tempoEstimado: 7, requereLocalizacao: false, requereAnexos: true },
      { id: 'solicitacao_medicamento', nome: 'Solicitação de Medicamento', categoria: 'medicamentos', tempoEstimado: 3, requereLocalizacao: false, requereAnexos: true },
      { id: 'cartao_sus', nome: 'Cartão SUS', categoria: 'documentacao', tempoEstimado: 5, requereLocalizacao: false, requereAnexos: true },
      { id: 'tfd', nome: 'Tratamento Fora Domicílio', categoria: 'tfd', tempoEstimado: 15, requereLocalizacao: false, requereAnexos: true },
      { id: 'vacinacao', nome: 'Vacinação', categoria: 'prevencao', tempoEstimado: 1, requereLocalizacao: false, requereAnexos: false }
    ],
    categorias: [
      { id: 'agendamentos', nome: 'Agendamentos', cor: '#3B82F6' },
      { id: 'exames', nome: 'Exames', cor: '#8B5CF6' },
      { id: 'medicamentos', nome: 'Medicamentos', cor: '#10B981' },
      { id: 'documentacao', nome: 'Documentação', cor: '#F59E0B' },
      { id: 'tfd', nome: 'TFD', cor: '#06B6D4' },
      { id: 'prevencao', nome: 'Prevenção', cor: '#16A34A' }
    ],
    prioridades: [
      { id: 'baixa', nome: 'Baixa', cor: '#10B981', sla: 72 },
      { id: 'media', nome: 'Média', cor: '#F59E0B', sla: 24 },
      { id: 'alta', nome: 'Alta', cor: '#EF4444', sla: 8 },
      { id: 'urgente', nome: 'Urgente', cor: '#DC2626', sla: 2 }
    ]
  }
  // Outras configurações serão definidas conforme implementamos cada módulo
};

export type ModuloPDV = keyof typeof PDV_CONFIGURACOES;