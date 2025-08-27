import { z } from 'zod';

// =====================================================
// ESQUEMAS DE VALIDAÇÃO PARA DADOS DO SISTEMA
// =====================================================

// Schema para CPF
const cpfSchema = z.string()
  .min(11, 'CPF deve ter 11 dígitos')
  .max(14, 'CPF inválido')
  .refine((cpf) => {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se não são todos dígitos iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do algoritmo do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleanCPF.charAt(10));
  }, 'CPF inválido');

// Schema para telefone
const telefoneSchema = z.string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone muito longo')
  .refine((phone) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }, 'Formato de telefone inválido');

// Schema para email
const emailSchema = z.string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(255, 'Email muito longo');

// Schema para CEP
const cepSchema = z.string()
  .length(8, 'CEP deve ter 8 dígitos')
  .regex(/^\d{8}$/, 'CEP deve conter apenas números')
  .or(z.string().regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'));

// =====================================================
// SCHEMAS PARA ENDEREÇOS
// =====================================================

export const enderecoSchema = z.object({
  cep: cepSchema.optional(),
  logradouro: z.string().min(1, 'Logradouro é obrigatório').max(200, 'Logradouro muito longo').optional(),
  numero: z.string().max(20, 'Número muito longo').optional(),
  complemento: z.string().max(100, 'Complemento muito longo').optional(),
  bairro: z.string().max(100, 'Bairro muito longo').optional(),
  cidade: z.string().max(100, 'Cidade muito longa').optional(),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  ponto_referencia: z.string().max(200, 'Ponto de referência muito longo').optional()
});

// =====================================================
// SCHEMAS PARA USUÁRIOS
// =====================================================

export const dadosSolicitanteSchema = z.object({
  nome_completo: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  cpf: cpfSchema,
  email: emailSchema,
  telefone: telefoneSchema,
  endereco: enderecoSchema.optional()
});

export const cadastroUsuarioSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  nome_completo: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  cpf: cpfSchema,
  telefone: telefoneSchema
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória')
});

// =====================================================
// SCHEMAS PARA SERVIÇOS MUNICIPAIS
// =====================================================

export const servicoMunicipalSchema = z.object({
  codigo: z.string()
    .min(3, 'Código deve ter pelo menos 3 caracteres')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9-]+$/, 'Código deve conter apenas letras maiúsculas, números e hífens'),
  nome: z.string()
    .min(5, 'Nome deve ter pelo menos 5 caracteres')
    .max(200, 'Nome muito longo'),
  descricao: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição muito longa'),
  categoria: z.string()
    .min(1, 'Categoria é obrigatória')
    .max(100, 'Categoria muito longa'),
  subcategoria: z.string().max(100, 'Subcategoria muito longa').optional(),
  secretaria_responsavel_id: z.string().uuid('ID da secretaria inválido'),
  setor_responsavel_id: z.string().uuid('ID do setor inválido').optional(),
  requer_documentos: z.boolean().default(false),
  documentos_necessarios: z.array(z.string().max(100)).default([]),
  prazo_resposta_dias: z.number()
    .min(1, 'Prazo de resposta deve ser de pelo menos 1 dia')
    .max(365, 'Prazo de resposta muito longo')
    .default(30),
  prazo_resolucao_dias: z.number()
    .min(1, 'Prazo de resolução deve ser de pelo menos 1 dia')
    .max(365, 'Prazo de resolução muito longo')
    .default(60),
  taxa_servico: z.number()
    .min(0, 'Taxa não pode ser negativa')
    .max(99999.99, 'Taxa muito alta')
    .default(0),
  requer_aprovacao_admin: z.boolean().default(false)
});

// =====================================================
// SCHEMAS PARA PROTOCOLOS
// =====================================================

export const criarProtocoloSchema = z.object({
  servico_id: z.string().uuid('ID do serviço inválido'),
  titulo: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título muito longo'),
  descricao: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição muito longa'),
  dados_especificos: z.record(z.any()).optional(),
  endereco_referencia: enderecoSchema.optional()
});

export const atualizarProtocoloSchema = z.object({
  titulo: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título muito longo')
    .optional(),
  descricao: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição muito longa')
    .optional(),
  dados_especificos: z.record(z.any()).optional(),
  endereco_referencia: enderecoSchema.optional(),
  status: z.enum([
    'aberto',
    'em_andamento',
    'aguardando_documentos',
    'aguardando_aprovacao',
    'aprovado',
    'rejeitado',
    'concluido',
    'cancelado'
  ]).optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).optional(),
  responsavel_atual_id: z.string().uuid().optional(),
  observacoes_aprovacao: z.string().max(1000, 'Observações muito longas').optional()
});

export const avaliacaoProtocoloSchema = z.object({
  nota: z.number()
    .min(1, 'Nota deve ser entre 1 e 5')
    .max(5, 'Nota deve ser entre 1 e 5')
    .int('Nota deve ser um número inteiro'),
  comentario: z.string()
    .max(1000, 'Comentário muito longo')
    .optional()
});

// =====================================================
// SCHEMAS PARA COMENTÁRIOS E ANEXOS
// =====================================================

export const comentarioSchema = z.object({
  comentario: z.string()
    .min(1, 'Comentário é obrigatório')
    .max(2000, 'Comentário muito longo'),
  tipo: z.enum(['observacao', 'resposta_oficial', 'solicitacao_documentos']).default('observacao'),
  visivel_cidadao: z.boolean().default(true)
});

export const anexoSchema = z.object({
  nome_arquivo: z.string()
    .min(1, 'Nome do arquivo é obrigatório')
    .max(255, 'Nome do arquivo muito longo'),
  tipo_arquivo: z.string().max(100).optional(),
  tamanho_bytes: z.number().min(1).optional(),
  tipo_anexo: z.enum(['documento', 'comprovante', 'foto', 'outro']).default('documento'),
  obrigatorio: z.boolean().default(false)
});

// =====================================================
// SCHEMAS PARA NOTIFICAÇÕES
// =====================================================

export const notificacaoSchema = z.object({
  usuario_id: z.string().uuid('ID do usuário inválido'),
  titulo: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título muito longo'),
  mensagem: z.string()
    .min(1, 'Mensagem é obrigatória')
    .max(1000, 'Mensagem muito longa'),
  tipo: z.enum(['info', 'sucesso', 'aviso', 'erro', 'protocolo']).default('info'),
  referencia_tipo: z.string().max(50).optional(),
  referencia_id: z.string().uuid().optional()
});

// =====================================================
// SCHEMAS PARA SECRETARIAS E SETORES
// =====================================================

export const secretariaSchema = z.object({
  codigo: z.string()
    .min(3, 'Código deve ter pelo menos 3 caracteres')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9-]+$/, 'Código deve conter apenas letras maiúsculas, números e hífens'),
  nome: z.string()
    .min(5, 'Nome deve ter pelo menos 5 caracteres')
    .max(200, 'Nome muito longo'),
  sigla: z.string()
    .min(2, 'Sigla deve ter pelo menos 2 caracteres')
    .max(10, 'Sigla muito longa')
    .regex(/^[A-Z]+$/, 'Sigla deve conter apenas letras maiúsculas'),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
  email_oficial: emailSchema.optional(),
  telefone: telefoneSchema.optional(),
  endereco: z.record(z.any()).optional()
});

export const setorSchema = z.object({
  secretaria_id: z.string().uuid('ID da secretaria inválido'),
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(200, 'Nome muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa').optional()
});

// =====================================================
// UTILITÁRIOS DE VALIDAÇÃO
// =====================================================

export const validationUtils = {
  // Validar CPF
  isValidCPF(cpf: string): boolean {
    try {
      cpfSchema.parse(cpf);
      return true;
    } catch {
      return false;
    }
  },

  // Validar email
  isValidEmail(email: string): boolean {
    try {
      emailSchema.parse(email);
      return true;
    } catch {
      return false;
    }
  },

  // Validar telefone
  isValidPhone(phone: string): boolean {
    try {
      telefoneSchema.parse(phone);
      return true;
    } catch {
      return false;
    }
  },

  // Validar CEP
  isValidCEP(cep: string): boolean {
    try {
      cepSchema.parse(cep);
      return true;
    } catch {
      return false;
    }
  },

  // Limpar CPF (remover formatação)
  cleanCPF(cpf: string): string {
    return cpf.replace(/[^\d]/g, '');
  },

  // Limpar telefone (remover formatação)
  cleanPhone(phone: string): string {
    return phone.replace(/[^\d]/g, '');
  },

  // Limpar CEP (remover formatação)
  cleanCEP(cep: string): string {
    return cep.replace(/[^\d]/g, '');
  },

  // Formatar CPF
  formatCPF(cpf: string): string {
    const clean = this.cleanCPF(cpf);
    if (clean.length !== 11) return cpf;
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  // Formatar telefone
  formatPhone(phone: string): string {
    const clean = this.cleanPhone(phone);
    if (clean.length === 10) {
      return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (clean.length === 11) {
      return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  },

  // Formatar CEP
  formatCEP(cep: string): string {
    const clean = this.cleanCEP(cep);
    if (clean.length !== 8) return cep;
    return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
  },

  // Validar arquivo
  isValidFile(file: File, maxSize: number = 10 * 1024 * 1024, allowedTypes: string[] = []): { valid: boolean; error?: string } {
    // Verificar tamanho
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    // Verificar tipo se especificado
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  },

  // Sanitizar string para uso em URLs ou IDs
  sanitizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-') // Substitui caracteres especiais por hífen
      .replace(/-+/g, '-') // Remove hífens duplos
      .replace(/^-|-$/g, ''); // Remove hífens do início e fim
  },

  // Verificar se é UUID válido
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
};

// =====================================================
// HOOK PARA VALIDAÇÃO EM TEMPO REAL
// =====================================================

import { useState, useCallback } from 'react';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  hasErrors: boolean;
}

export const useValidation = <T>(schema: z.ZodSchema<T>) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: any): ValidationResult => {
    try {
      schema.parse(data);
      setErrors({});
      return {
        isValid: true,
        errors: {},
        hasErrors: false
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        return {
          isValid: false,
          errors: fieldErrors,
          hasErrors: true
        };
      }
      return {
        isValid: false,
        errors: { general: 'Erro de validação desconhecido' },
        hasErrors: true
      };
    }
  }, [schema]);

  const validateField = useCallback((fieldName: string, value: any) => {
    try {
      // Criar um schema parcial apenas para o campo específico
      const fieldSchema = schema.pick({ [fieldName]: true } as any);
      fieldSchema.parse({ [fieldName]: value });
      
      // Remover erro do campo se válido
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0];
        setErrors(prev => ({
          ...prev,
          [fieldName]: fieldError.message
        }));
      }
      return false;
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    errors,
    hasErrors: Object.keys(errors).length > 0,
    getFieldError: (fieldName: string) => errors[fieldName]
  };
};