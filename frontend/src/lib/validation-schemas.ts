import { z } from 'zod';
import { validationUtils } from './validation';

// =====================================================
// ESQUEMAS BASE PADRONIZADOS
// =====================================================

// Schema para campos de auditoria obrigatórios
export const baseEntitySchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  created_at: z.string().datetime('Data de criação deve ser um datetime ISO válido'),
  updated_at: z.string().datetime('Data de atualização deve ser um datetime ISO válido'),
  deleted_at: z.string().datetime('Data de exclusão deve ser um datetime ISO válido').optional(),
});

// Schema para endereço padronizado
export const enderecoPadraoSchema = z.object({
  logradouro: z.string()
    .min(1, 'Logradouro é obrigatório')
    .max(200, 'Logradouro muito longo'),
  numero: z.string()
    .max(20, 'Número muito longo')
    .optional(),
  complemento: z.string()
    .max(100, 'Complemento muito longo')
    .optional(),
  bairro: z.string()
    .min(1, 'Bairro é obrigatório')
    .max(100, 'Bairro muito longo'),
  cidade: z.string()
    .min(1, 'Cidade é obrigatória')
    .max(100, 'Cidade muito longa'),
  uf: z.string()
    .length(2, 'UF deve ter 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'UF deve conter apenas letras maiúsculas'),
  cep: z.string()
    .refine((cep) => validationUtils.isValidCEP(cep), 'CEP inválido'),
  coordenadas: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  ponto_referencia: z.string()
    .max(200, 'Ponto de referência muito longo')
    .optional(),
});

// Schema para contato padronizado
export const contatoPadraoSchema = z.object({
  telefone_principal: z.string()
    .refine((phone) => validationUtils.isValidPhone(phone), 'Telefone principal inválido'),
  telefone_secundario: z.string()
    .refine((phone) => !phone || validationUtils.isValidPhone(phone), 'Telefone secundário inválido')
    .optional(),
  email_principal: z.string()
    .email('Email principal inválido')
    .optional(),
  email_secundario: z.string()
    .email('Email secundário inválido')
    .optional(),
});

// Schema para pessoa física padronizada
export const pessoaFisicaPadraoSchema = z.object({
  nome_completo: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  cpf: z.string()
    .refine((cpf) => validationUtils.isValidCPF(cpf), 'CPF inválido'),
  rg: z.string()
    .max(20, 'RG muito longo')
    .optional(),
  data_nascimento: z.string()
    .date('Data de nascimento inválida')
    .optional(),
  sexo: z.enum(['M', 'F', 'O'], {
    errorMap: () => ({ message: 'Sexo deve ser M, F ou O' })
  }).optional(),
  estado_civil: z.enum([
    'solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel'
  ]).optional(),
});

// Schema para responsável padronizado
export const responsavelPadraoSchema = pessoaFisicaPadraoSchema.extend({
  parentesco: z.string()
    .min(1, 'Parentesco é obrigatório')
    .max(50, 'Parentesco muito longo')
    .optional(),
  e_responsavel_legal: z.boolean(),
});

// Schema para status base
export const statusBaseSchema = z.enum(['ativo', 'inativo', 'pendente', 'suspenso'], {
  errorMap: () => ({ message: 'Status deve ser ativo, inativo, pendente ou suspenso' })
});

// Schema para status de processo
export const statusProcessoSchema = z.enum([
  'aberto', 'em_andamento', 'aguardando_documentos', 'aguardando_aprovacao',
  'aprovado', 'rejeitado', 'concluido', 'cancelado'
], {
  errorMap: () => ({ message: 'Status de processo inválido' })
});

// Schema para prioridade padrão
export const prioridadePadraoSchema = z.enum(['baixa', 'media', 'alta', 'urgente', 'critica'], {
  errorMap: () => ({ message: 'Prioridade deve ser baixa, media, alta, urgente ou critica' })
});

// Schema para gravidade padrão
export const gravidadePadraoSchema = z.enum(['leve', 'moderada', 'grave', 'critica'], {
  errorMap: () => ({ message: 'Gravidade deve ser leve, moderada, grave ou critica' })
});

// =====================================================
// ESQUEMAS PARA SAÚDE
// =====================================================

export const pacienteSchema = baseEntitySchema.extend({
  cns: z.string()
    .length(15, 'CNS deve ter 15 dígitos')
    .regex(/^\d{15}$/, 'CNS deve conter apenas números'),
  endereco: enderecoPadraoSchema,
  contato: contatoPadraoSchema,
  convenio_medico: z.string().max(100).optional(),
  alergias: z.array(z.string().max(100)).optional(),
  condicoes_medicas: z.array(z.string().max(100)).optional(),
  medicamentos_uso_continuo: z.array(z.string().max(100)).optional(),
  contato_emergencia: z.object({
    nome: z.string().min(1, 'Nome do contato de emergência é obrigatório'),
    telefone: z.string().refine((phone) => validationUtils.isValidPhone(phone), 'Telefone de emergência inválido'),
    parentesco: z.string().min(1, 'Parentesco é obrigatório'),
  }).optional(),
  status: statusBaseSchema,
}).merge(pessoaFisicaPadraoSchema);

export const profissionalSaudeSchema = baseEntitySchema.extend({
  especialidades: z.array(z.string().min(1)).min(1, 'Pelo menos uma especialidade é obrigatória'),
  crm: z.string()
    .min(4, 'CRM deve ter pelo menos 4 caracteres')
    .max(20, 'CRM muito longo'),
  crm_uf: z.string()
    .length(2, 'UF do CRM deve ter 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'UF do CRM deve conter apenas letras maiúsculas'),
  contato: contatoPadraoSchema,
  tipo_profissional: z.enum([
    'medico', 'enfermeiro', 'tecnico_enfermagem', 'dentista', 'farmaceutico',
    'psicologo', 'nutricionista', 'fisioterapeuta', 'outro'
  ]),
  carga_horaria_semanal: z.number()
    .min(1, 'Carga horária deve ser pelo menos 1 hora')
    .max(60, 'Carga horária máxima é 60 horas')
    .optional(),
  turno_trabalho: z.enum(['matutino', 'vespertino', 'noturno', 'integral']).optional(),
  unidades_trabalho: z.array(z.string().uuid()).min(1, 'Pelo menos uma unidade de trabalho é obrigatória'),
  status: statusBaseSchema,
}).merge(pessoaFisicaPadraoSchema);

export const unidadeSaudeSchema = baseEntitySchema.extend({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(200, 'Nome muito longo'),
  tipo: z.enum(['ubs', 'upf', 'hospital', 'clinica', 'caps', 'pronto_socorro', 'laboratorio', 'farmacia']),
  endereco: enderecoPadraoSchema,
  contato: contatoPadraoSchema,
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
    .optional(),
  cnes: z.string()
    .length(7, 'CNES deve ter 7 dígitos')
    .regex(/^\d{7}$/, 'CNES deve conter apenas números'),
  especialidades_disponiveis: z.array(z.string().min(1)).default([]),
  servicos_oferecidos: z.array(z.string().min(1)).default([]),
  horario_funcionamento: z.record(z.object({
    abertura: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM'),
    fechamento: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM'),
    funcionando: z.boolean(),
  })),
  capacidade_atendimento: z.object({
    consultas_dia: z.number().min(0),
    leitos_internacao: z.number().min(0).optional(),
    leitos_observacao: z.number().min(0).optional(),
  }),
  equipamentos_disponivel: z.array(z.string()).optional(),
  gestor_responsavel_id: z.string().uuid().optional(),
  secretaria_id: z.string().uuid('ID da secretaria deve ser um UUID válido'),
  status: statusBaseSchema,
});

export const agendamentoMedicoSchema = baseEntitySchema.extend({
  paciente_id: z.string().uuid('ID do paciente deve ser um UUID válido'),
  profissional_id: z.string().uuid('ID do profissional deve ser um UUID válido'),
  especialidade: z.string().min(1, 'Especialidade é obrigatória'),
  data_agendamento: z.string().date('Data de agendamento inválida'),
  horario_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM'),
  horario_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM'),
  duracao_minutos: z.number().min(5).max(480),
  status: z.enum(['agendado', 'confirmado', 'realizado', 'faltou', 'cancelado', 'reagendado']),
  tipo_consulta: z.enum(['consulta', 'exame', 'procedimento', 'retorno', 'urgencia', 'emergencia']),
  prioridade: prioridadePadraoSchema,
  unidade_saude_id: z.string().uuid('ID da unidade de saúde deve ser um UUID válido'),
  observacoes: z.string().max(1000).optional(),
  sintomas_relatados: z.string().max(2000).optional(),
  prescricoes: z.array(z.string()).optional(),
  procedimentos_realizados: z.array(z.string()).optional(),
  retorno_necessario: z.boolean().default(false),
  data_retorno_sugerida: z.string().date().optional(),
  lembrete_enviado: z.boolean().default(false),
});

// =====================================================
// ESQUEMAS PARA EDUCAÇÃO
// =====================================================

export const escolaSchema = baseEntitySchema.extend({
  codigo_inep: z.string()
    .length(8, 'Código INEP deve ter 8 dígitos')
    .regex(/^\d{8}$/, 'Código INEP deve conter apenas números'),
  codigo_mec: z.string().max(20).optional(),
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(200, 'Nome muito longo'),
  endereco: enderecoPadraoSchema,
  contato: contatoPadraoSchema,
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
    .optional(),
  tipo: z.enum(['municipal', 'estadual', 'federal', 'privada', 'comunitaria']),
  modalidades_ensino: z.array(z.enum([
    'educacao_infantil', 'ensino_fundamental_anos_iniciais',
    'ensino_fundamental_anos_finais', 'ensino_medio', 'eja', 'educacao_especial'
  ])).min(1, 'Pelo menos uma modalidade de ensino é obrigatória'),
  turnos_funcionamento: z.array(z.enum(['matutino', 'vespertino', 'noturno', 'integral']))
    .min(1, 'Pelo menos um turno de funcionamento é obrigatório'),
  diretor_id: z.string().uuid().optional(),
  vice_diretor_id: z.string().uuid().optional(),
  coordenador_pedagogico_id: z.string().uuid().optional(),
  secretaria_responsavel_id: z.string().uuid('ID da secretaria deve ser um UUID válido'),
  capacidade_total_alunos: z.number().min(1, 'Capacidade deve ser pelo menos 1 aluno'),
  vagas_disponiveis: z.number().min(0),
  status: statusBaseSchema,
});

export const alunoSchema = baseEntitySchema.extend({
  codigo_aluno: z.string()
    .min(1, 'Código do aluno é obrigatório')
    .max(50, 'Código do aluno muito longo'),
  nis: z.string()
    .length(11, 'NIS deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'NIS deve conter apenas números')
    .optional(),
  endereco: enderecoPadraoSchema,
  cor_raca: z.enum(['branca', 'preta', 'parda', 'amarela', 'indigena', 'nao_declarada']),
  nacionalidade: z.string().min(1, 'Nacionalidade é obrigatória'),
  naturalidade: z.string().max(100).optional(),
  certidao_nascimento: z.string().min(1, 'Certidão de nascimento é obrigatória'),
  responsaveis: z.array(responsavelPadraoSchema).min(1, 'Pelo menos um responsável é obrigatório'),
  necessidades_especiais: z.object({
    possui: z.boolean(),
    tipos: z.array(z.string()).optional(),
    cid: z.array(z.string()).optional(),
    acompanhamento_especializado: z.boolean(),
    medicacao_continua: z.boolean(),
    restricoes_atividades: z.array(z.string()).optional(),
  }),
  transporte_escolar: z.object({
    utiliza: z.boolean(),
    rota_id: z.string().uuid().optional(),
    ponto_embarque: z.string().optional(),
    observacoes: z.string().max(500).optional(),
  }),
  beneficios_sociais: z.array(z.string()).optional(),
  situacao_vacinal_em_dia: z.boolean(),
  documentos_entregues: z.array(z.string()),
  observacoes: z.string().max(1000).optional(),
  status: statusBaseSchema,
}).merge(pessoaFisicaPadraoSchema);

export const turmaSchema = baseEntitySchema.extend({
  escola_id: z.string().uuid('ID da escola deve ser um UUID válido'),
  codigo: z.string().min(1, 'Código da turma é obrigatório').max(20),
  nome: z.string().max(100).optional(),
  serie: z.string().min(1, 'Série é obrigatória').max(50),
  nivel_ensino: z.enum([
    'educacao_infantil', 'ensino_fundamental_anos_iniciais',
    'ensino_fundamental_anos_finais', 'ensino_medio', 'eja', 'educacao_especial'
  ]),
  turno: z.enum(['matutino', 'vespertino', 'noturno', 'integral']),
  vagas_total: z.number().min(1, 'Deve ter pelo menos 1 vaga'),
  vagas_ocupadas: z.number().min(0),
  vagas_reservadas: z.number().min(0),
  ano_letivo: z.number().min(2020).max(2050),
  professor_regente_id: z.string().uuid().optional(),
  sala_aula: z.string().min(1, 'Sala de aula é obrigatória'),
  disciplinas_oferecidas: z.array(z.string().min(1)),
  observacoes: z.string().max(1000).optional(),
  status: statusBaseSchema,
});

export const matriculaSchema = baseEntitySchema.extend({
  aluno_id: z.string().uuid('ID do aluno deve ser um UUID válido'),
  escola_id: z.string().uuid('ID da escola deve ser um UUID válido'),
  turma_id: z.string().uuid('ID da turma deve ser um UUID válido'),
  ano_letivo: z.number().min(2020).max(2050),
  numero_matricula: z.string().min(1, 'Número da matrícula é obrigatório'),
  data_matricula: z.string().date('Data de matrícula inválida'),
  data_transferencia: z.string().date().optional(),
  data_conclusao: z.string().date().optional(),
  status: z.enum(['ativa', 'transferida', 'cancelada', 'concluida', 'abandono', 'remanejada']),
  motivo_status: z.string().max(200).optional(),
  documentos_entregues: z.array(z.object({
    documento: z.string().min(1),
    data_entrega: z.string().date(),
    conferido: z.boolean(),
  })),
  historico_escolar: z.string().uuid().optional(),
  boletim_anterior: z.string().uuid().optional(),
  laudo_medico: z.string().uuid().optional(),
  observacoes: z.string().max(1000).optional(),
});

// =====================================================
// ESQUEMAS PARA ASSISTÊNCIA SOCIAL
// =====================================================

export const familiaSchema = baseEntitySchema.extend({
  codigo_familia: z.string().min(1, 'Código da família é obrigatório'),
  nome_referencia: z.string().min(1, 'Nome de referência é obrigatório'),
  responsavel_familiar: pessoaFisicaPadraoSchema.extend({
    parentesco: z.enum(['pai', 'mae', 'avo_ava', 'tio_tia', 'irmao_irma', 'outro']),
    escolaridade: z.enum([
      'nao_alfabetizado', 'fundamental_incompleto', 'fundamental_completo',
      'medio_incompleto', 'medio_completo', 'superior_incompleto',
      'superior_completo', 'pos_graduacao'
    ]),
    situacao_trabalho: z.enum([
      'empregado_formal', 'empregado_informal', 'desempregado',
      'aposentado', 'pensionista', 'autonomo', 'outro'
    ]),
    renda_individual: z.number().min(0).optional(),
  }),
  endereco: enderecoPadraoSchema,
  contato: contatoPadraoSchema,
  composicao_familiar: z.object({
    total_membros: z.number().min(1),
    criancas_0_6: z.number().min(0),
    criancas_7_14: z.number().min(0),
    adolescentes_15_17: z.number().min(0),
    adultos_18_59: z.number().min(0),
    idosos_60_mais: z.number().min(0),
    gestantes: z.number().min(0),
    deficientes: z.number().min(0),
  }),
  nis_responsavel: z.string()
    .length(11, 'NIS deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'NIS deve conter apenas números'),
  renda_mensal_total: z.number().min(0),
  renda_per_capita: z.number().min(0),
  vulnerabilidades: z.array(z.object({
    tipo: z.enum([
      'pobreza_extrema', 'trabalho_infantil', 'violencia_domestica',
      'uso_drogas', 'abandono_escolar', 'situacao_rua', 'deficiencia',
      'idoso_vulneravel', 'outro'
    ]),
    descricao: z.string().max(500).optional(),
    gravidade: z.enum(['baixa', 'media', 'alta', 'critica']),
  })),
  prioridade: prioridadePadraoSchema,
  territorio: z.object({
    microarea: z.string().optional(),
    area_cras: z.string().min(1, 'Área do CRAS é obrigatória'),
    referencia_cras: z.string().min(1, 'CRAS de referência é obrigatório'),
  }),
  data_ultimo_atendimento: z.string().date().optional(),
  tecnico_referencia_id: z.string().uuid().optional(),
  observacoes: z.string().max(2000).optional(),
  status: statusBaseSchema,
});

// =====================================================
// ESQUEMAS PARA PROTOCOLOS
// =====================================================

export const protocoloSchema = baseEntitySchema.extend({
  numero_protocolo: z.string().min(1, 'Número do protocolo é obrigatório'),
  cidadao_id: z.string().uuid('ID do cidadão deve ser um UUID válido'),
  servico_id: z.string().uuid('ID do serviço deve ser um UUID válido'),
  secretaria_id: z.string().uuid('ID da secretaria deve ser um UUID válido'),
  funcionario_responsavel_id: z.string().uuid().optional(),
  status: statusProcessoSchema,
  prioridade: prioridadePadraoSchema,
  assunto: z.string()
    .min(1, 'Assunto é obrigatório')
    .max(200, 'Assunto muito longo'),
  descricao: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(5000, 'Descrição muito longa'),
  localizacao_gps: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  endereco: z.string().max(500).optional(),
  prazo_estimado: z.string().date().optional(),
  data_vencimento: z.string().date().optional(),
  data_conclusao: z.string().date().optional(),
  dados_formulario: z.record(z.any()).optional(),
  documentos_anexos: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  avaliacao_nota: z.number().min(1).max(5).optional(),
  avaliacao_comentario: z.string().max(1000).optional(),
  avaliado_em: z.string().date().optional(),
});

export const servicoMunicipalSchema = baseEntitySchema.extend({
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  descricao: z.string().min(1, 'Descrição é obrigatória').max(1000),
  categoria: z.string().min(1, 'Categoria é obrigatória').max(100),
  secretaria_id: z.string().uuid('ID da secretaria deve ser um UUID válido'),
  documentos_necessarios: z.array(z.string()),
  tempo_estimado_dias: z.number().min(1).max(365),
  taxa: z.number().min(0),
  online: z.boolean(),
  presencial: z.boolean(),
  ativo: z.boolean(),
  formulario_personalizado: z.record(z.any()).optional(),
  instrucoes_adiciais: z.string().max(2000).optional(),
});

// =====================================================
// ESQUEMAS PARA USUÁRIOS E PERMISSÕES
// =====================================================

export const userProfileSchema = baseEntitySchema.extend({
  nome_completo: z.string().min(1, 'Nome é obrigatório').max(200),
  email: z.string().email('Email inválido'),
  cpf: z.string().refine((cpf) => validationUtils.isValidCPF(cpf), 'CPF inválido').optional(),
  telefone: z.string().refine((phone) => !phone || validationUtils.isValidPhone(phone), 'Telefone inválido').optional(),
  tipo_usuario: z.enum([
    'super_admin', 'admin', 'secretario', 'diretor', 'coordenador',
    'funcionario', 'atendente', 'cidadao'
  ]),
  secretaria_id: z.string().uuid().optional(),
  tenant_id: z.string().uuid().optional(),
  ativo: z.boolean(),
  data_ultimo_acesso: z.string().date().optional(),
  configuracoes_usuario: z.record(z.any()).optional(),
  foto_perfil: z.string().url().optional(),
});

export const secretariaSchema = baseEntitySchema.extend({
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  sigla: z.string().min(1, 'Sigla é obrigatória').max(10),
  descricao: z.string().max(1000).optional(),
  secretario_id: z.string().uuid().optional(),
  endereco: enderecoPadraoSchema.optional(),
  contato: contatoPadraoSchema.optional(),
  cor_tema: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato #RRGGBB').optional(),
  ordem_exibicao: z.number().min(0),
  ativa: z.boolean(),
  servicos_oferecidos: z.array(z.string()).optional(),
  tenant_id: z.string().uuid('ID do tenant deve ser um UUID válido'),
});

// =====================================================
// ESQUEMAS PARA FILTROS E PAGINAÇÃO
// =====================================================

export const filtrosPadraoSchema = z.object({
  busca_texto: z.string().optional(),
  data_inicio: z.string().date().optional(),
  data_fim: z.string().date().optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  prioridade: z.union([z.string(), z.array(z.string())]).optional(),
  responsavel_id: z.string().uuid().optional(),
  secretaria_id: z.string().uuid().optional(),
  ativo: z.boolean().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  order_by: z.string().optional(),
  order_direction: z.enum(['asc', 'desc']).optional(),
});

export const paginacaoSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number().min(0),
  total_pages: z.number().min(0),
  has_next: z.boolean(),
  has_previous: z.boolean(),
});

// Esquemas para operações CRUD padronizadas
export const createOperationSchema = z.object({
  table: z.string().min(1),
  data: z.record(z.any()),
  validate: z.boolean().default(true),
  return_data: z.boolean().default(true),
});

export const updateOperationSchema = z.object({
  table: z.string().min(1),
  id: z.string().uuid(),
  data: z.record(z.any()),
  validate: z.boolean().default(true),
  return_data: z.boolean().default(true),
});

export const deleteOperationSchema = z.object({
  table: z.string().min(1),
  id: z.string().uuid(),
  soft_delete: z.boolean().default(true),
  reason: z.string().optional(),
});

export const bulkOperationSchema = z.object({
  table: z.string().min(1),
  operation: z.enum(['create', 'update', 'delete']),
  data: z.array(z.record(z.any())),
  validate: z.boolean().default(true),
  batch_size: z.number().min(1).max(1000).default(100),
});

// =====================================================
// ESQUEMAS PARA RESPOSTAS DE API
// =====================================================

export const respostaAPISchema = <T>(dataSchema: z.ZodSchema<T>) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  message: z.string().optional(),
  errors: z.record(z.array(z.string())).optional(),
  meta: z.object({
    pagination: paginacaoSchema.optional(),
    total_records: z.number().optional(),
    execution_time: z.number().optional(),
    cached: z.boolean().optional(),
  }).optional(),
});

// =====================================================
// UTILITÁRIOS DE VALIDAÇÃO
// =====================================================

export const validarSchema = <T>(schema: z.ZodSchema<T>, dados): { 
  valido: boolean; 
  dados?: T; 
  erros?: Record<string, string[]> 
} => {
  try {
    const dadosValidados = schema.parse(dados);
    return { valido: true, dados: dadosValidados };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const erros: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const campo = err.path.join('.');
        if (!erros[campo]) {
          erros[campo] = [];
        }
        erros[campo].push(err.message);
      });
      return { valido: false, erros };
    }
    return { valido: false, erros: { geral: ['Erro de validação desconhecido'] } };
  }
};

export const validarParcial = <T>(schema: z.ZodSchema<T>, dados): {
  valido: boolean;
  dados?: Partial<T>;
  erros?: Record<string, string[]>
} => {
  return validarSchema(schema.partial(), dados);
};