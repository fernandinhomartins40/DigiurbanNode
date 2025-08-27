// ====================================================================
// 🔍 SISTEMA DE VALIDAÇÕES ROBUSTAS - DIGIURBAN2
// ====================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// ====================================================================
// VALIDAÇÃO DE EMAIL
// ====================================================================

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório', severity: 'high' };
  }

  if (typeof email !== 'string') {
    return { isValid: false, error: 'Email deve ser um texto', severity: 'high' };
  }

  // Remover espaços em branco
  email = email.trim().toLowerCase();

  // Verificar comprimento
  if (email.length < 3) {
    return { isValid: false, error: 'Email muito curto', severity: 'medium' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email muito longo (máximo 254 caracteres)', severity: 'medium' };
  }

  // Regex robusta para email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de email inválido', severity: 'high' };
  }

  // Verificações adicionais de segurança
  if (email.includes('..')) {
    return { isValid: false, error: 'Email não pode conter pontos consecutivos', severity: 'medium' };
  }

  if (email.startsWith('.') || email.endsWith('.')) {
    return { isValid: false, error: 'Email não pode começar ou terminar com ponto', severity: 'medium' };
  }

  // Verificar domínios suspeitos (básico)
  const suspiciousDomains = ['tempmail', 'temp-mail', '10minutemail', 'guerrillamail'];
  const domain = email.split('@')[1];
  if (suspiciousDomains.some(suspicious => domain.includes(suspicious))) {
    return { 
      isValid: true, // Aceitar, mas alertar
      error: 'Email temporário detectado',
      severity: 'low'
    };
  }

  return { isValid: true };
};

// ====================================================================
// VALIDAÇÃO DE SENHA
// ====================================================================

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória', severity: 'critical' };
  }

  if (typeof password !== 'string') {
    return { isValid: false, error: 'Senha deve ser um texto', severity: 'critical' };
  }

  // Verificar comprimento mínimo
  if (password.length < 8) {
    return { 
      isValid: false, 
      error: 'Senha deve ter pelo menos 8 caracteres',
      severity: 'high'
    };
  }

  // Verificar comprimento máximo (prevenir DoS)
  if (password.length > 128) {
    return {
      isValid: false,
      error: 'Senha muito longa (máximo 128 caracteres)',
      severity: 'medium'
    };
  }

  // Verificar se tem letra minúscula
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Senha deve ter pelo menos uma letra minúscula',
      severity: 'high'
    };
  }

  // Verificar se tem letra maiúscula
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Senha deve ter pelo menos uma letra maiúscula',
      severity: 'high'
    };
  }

  // Verificar se tem número
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: 'Senha deve ter pelo menos um número',
      severity: 'high'
    };
  }

  // Verificar se tem caractere especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      error: 'Senha deve ter pelo menos um caractere especial',
      severity: 'medium'
    };
  }

  // Verificar senhas comuns
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    '1234567890', 'password1', '123123', '111111', '000000'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return {
      isValid: false,
      error: 'Esta senha é muito comum. Escolha uma senha mais segura.',
      severity: 'high'
    };
  }

  // Verificar padrões sequenciais
  if (/123|abc|qwe/i.test(password)) {
    return {
      isValid: true, // Aceitar, mas alertar
      error: 'Senha contém sequência previsível',
      severity: 'low'
    };
  }

  return { isValid: true };
};

// Função para calcular força da senha
export const getPasswordStrength = (password: string): {
  score: number; // 0-5
  feedback: string;
  color: string;
} => {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  // Bonificações
  if (password.length >= 16) score++;
  if ((password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length >= 2) score++;

  // Penalizações
  if (/(.)\1{2,}/.test(password)) score--; // Caracteres repetidos
  if (/123|abc|qwe/i.test(password)) score--; // Sequências

  score = Math.max(0, Math.min(5, score));

  const levels = [
    { score: 0, feedback: 'Muito fraca', color: '#ef4444' },
    { score: 1, feedback: 'Fraca', color: '#f97316' },
    { score: 2, feedback: 'Regular', color: '#eab308' },
    { score: 3, feedback: 'Boa', color: '#22c55e' },
    { score: 4, feedback: 'Forte', color: '#16a34a' },
    { score: 5, feedback: 'Muito forte', color: '#15803d' }
  ];

  const level = levels[score];
  return {
    score,
    feedback: level.feedback,
    color: level.color
  };
};

// ====================================================================
// VALIDAÇÃO DE CPF
// ====================================================================

export const validateCPF = (cpf: string): ValidationResult => {
  if (!cpf) {
    return { isValid: false, error: 'CPF é obrigatório', severity: 'high' };
  }

  if (typeof cpf !== 'string') {
    return { isValid: false, error: 'CPF deve ser um texto', severity: 'high' };
  }

  // Remover formatação
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verificar comprimento
  if (cleanCPF.length !== 11) {
    return { isValid: false, error: 'CPF deve ter 11 dígitos', severity: 'high' };
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) {
    return { isValid: false, error: 'CPF inválido (dígitos iguais)', severity: 'high' };
  }

  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return { isValid: false, error: 'CPF inválido (primeiro dígito)', severity: 'high' };
  }

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return { isValid: false, error: 'CPF inválido (segundo dígito)', severity: 'high' };
  }

  return { isValid: true };
};

// Função para formatar CPF
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// ====================================================================
// VALIDAÇÃO DE TELEFONE
// ====================================================================

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Telefone é obrigatório', severity: 'medium' };
  }

  if (typeof phone !== 'string') {
    return { isValid: false, error: 'Telefone deve ser um texto', severity: 'medium' };
  }

  // Remover formatação
  const cleanPhone = phone.replace(/\D/g, '');

  // Verificar comprimento (formato brasileiro)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return { 
      isValid: false, 
      error: 'Telefone deve ter 10 ou 11 dígitos',
      severity: 'medium'
    };
  }

  // Verificar se começa com código de área válido
  const areaCode = cleanPhone.substring(0, 2);
  const validAreaCodes = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
    '21', '22', '24', // RJ/ES
    '27', '28', // ES
    '31', '32', '33', '34', '35', '37', '38', // MG
    '41', '42', '43', '44', '45', '46', // PR
    '47', '48', '49', // SC
    '51', '53', '54', '55', // RS
    '61', // DF
    '62', '64', // GO
    '63', // TO
    '65', '66', // MT
    '67', // MS
    '68', // AC
    '69', // RO
    '71', '73', '74', '75', '77', // BA
    '79', // SE
    '81', '87', // PE
    '82', // AL
    '83', // PB
    '84', // RN
    '85', '88', // CE
    '86', '89', // PI
    '91', '93', '94', // PA
    '92', '97', // AM
    '95', // RR
    '96', // AP
    '98', '99' // MA
  ];

  if (!validAreaCodes.includes(areaCode)) {
    return {
      isValid: false,
      error: 'Código de área inválido',
      severity: 'medium'
    };
  }

  // Para celular (11 dígitos), verificar se o terceiro dígito é 9
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') {
    return {
      isValid: false,
      error: 'Número de celular deve ter 9 como terceiro dígito',
      severity: 'medium'
    };
  }

  return { isValid: true };
};

// Função para formatar telefone
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

// ====================================================================
// VALIDAÇÃO DE NOME COMPLETO
// ====================================================================

export const validateFullName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Nome completo é obrigatório', severity: 'high' };
  }

  if (typeof name !== 'string') {
    return { isValid: false, error: 'Nome deve ser um texto', severity: 'high' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Nome muito curto', severity: 'medium' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Nome muito longo (máximo 100 caracteres)', severity: 'medium' };
  }

  // Verificar se tem pelo menos nome e sobrenome
  const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);
  if (nameParts.length < 2) {
    return {
      isValid: false,
      error: 'Digite nome e sobrenome',
      severity: 'medium'
    };
  }

  // Verificar caracteres válidos (letras, espaços, acentos, hífens, apostrofes)
  if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Nome contém caracteres inválidos',
      severity: 'medium'
    };
  }

  // Verificar se não tem números
  if (/\d/.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Nome não pode conter números',
      severity: 'medium'
    };
  }

  return { isValid: true };
};

// ====================================================================
// VALIDAÇÃO DE FORMULÁRIO COMPLETO
// ====================================================================

export interface FormData {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  cpf?: string;
  phone?: string;
}

export const validateForm = (data: FormData): {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // Validar email
  if (data.email !== undefined) {
    const emailResult = validateEmail(data.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error!;
    } else if (emailResult.error && emailResult.severity === 'low') {
      warnings.email = emailResult.error;
    }
  }

  // Validar senha
  if (data.password !== undefined) {
    const passwordResult = validatePassword(data.password);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error!;
    } else if (passwordResult.error && passwordResult.severity === 'low') {
      warnings.password = passwordResult.error;
    }
  }

  // Validar confirmação de senha
  if (data.confirmPassword !== undefined && data.password !== undefined) {
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }
  }

  // Validar nome completo
  if (data.fullName !== undefined) {
    const nameResult = validateFullName(data.fullName);
    if (!nameResult.isValid) {
      errors.fullName = nameResult.error!;
    }
  }

  // Validar CPF
  if (data.cpf !== undefined && data.cpf.trim()) {
    const cpfResult = validateCPF(data.cpf);
    if (!cpfResult.isValid) {
      errors.cpf = cpfResult.error!;
    }
  }

  // Validar telefone
  if (data.phone !== undefined && data.phone.trim()) {
    const phoneResult = validatePhone(data.phone);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

// ====================================================================
// UTILITÁRIOS DE SANITIZAÇÃO
// ====================================================================

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres perigosos básicos
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/vbscript:/gi, '') // Remove vbscript: URLs
    .replace(/data:/gi, '') // Remove data: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick, onload, etc)
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove caracteres de controle
    .substring(0, 1000); // Limita comprimento
};

// Sanitização específica para SQL (prevenção de SQL injection)
export const sanitizeSQL = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[';\\-]/g, '') // Remove caracteres perigosos SQL
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE)\b/gi, '') // Remove comandos SQL
    .trim()
    .substring(0, 255);
};

// Sanitização específica para nomes de arquivos
export const sanitizeFilename = (filename: string): string => {
  if (typeof filename !== 'string') return '';
  
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove caracteres inválidos para arquivos
    .replace(/^\.+/, '') // Remove pontos no início
    .trim()
    .substring(0, 255);
};

// Validação de XSS mais robusta
export const containsXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<[^>]*\s+on\w+\s*=/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

/**
 * Remove todos os caracteres não numéricos
 */
export const cleanNumeric = (value: string): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/[^\d]/g, '');
};

// ====================================================================
// VALIDAÇÃO DE CNPJ
// ====================================================================

export const validateCNPJ = (cnpj: string): ValidationResult => {
  if (!cnpj) {
    return { isValid: false, error: 'CNPJ é obrigatório', severity: 'high' };
  }

  if (typeof cnpj !== 'string') {
    return { isValid: false, error: 'CNPJ deve ser um texto', severity: 'high' };
  }

  // Remover formatação
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Verificar comprimento
  if (cleanCNPJ.length !== 14) {
    return { isValid: false, error: 'CNPJ deve ter 14 dígitos', severity: 'high' };
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) {
    return { isValid: false, error: 'CNPJ inválido (dígitos iguais)', severity: 'high' };
  }

  // Calcular primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleanCNPJ[12]) !== digit1) {
    return { isValid: false, error: 'CNPJ inválido (primeiro dígito verificador)', severity: 'high' };
  }

  // Calcular segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleanCNPJ[13]) !== digit2) {
    return { isValid: false, error: 'CNPJ inválido (segundo dígito verificador)', severity: 'high' };
  }

  return { isValid: true };
};

// Função para formatar CNPJ
export const formatCNPJ = (cnpj: string): string => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// ====================================================================
// VALIDAÇÃO DE CEP
// ====================================================================

export const validateCEP = (cep: string): ValidationResult => {
  if (!cep) {
    return { isValid: false, error: 'CEP é obrigatório', severity: 'medium' };
  }

  const cleanCEP = cep.replace(/\D/g, '');
  
  if (cleanCEP.length !== 8) {
    return { isValid: false, error: 'CEP deve ter 8 dígitos', severity: 'medium' };
  }

  if (/^0+$/.test(cleanCEP)) {
    return { isValid: false, error: 'CEP inválido', severity: 'medium' };
  }

  return { isValid: true };
};

// Função para formatar CEP
export const formatCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// ====================================================================
// VALIDAÇÕES ESPECÍFICAS PARA PREFEITURAS
// ====================================================================

export const validatePrefeituraData = (data: {
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  populacao: number;
  cep?: string;
  responsavel_email?: string;
  responsavel_telefone?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validar nome da prefeitura
  if (!data.nome || data.nome.trim().length < 3) {
    errors.nome = 'Nome da prefeitura deve ter pelo menos 3 caracteres';
  } else if (data.nome.trim().length > 100) {
    errors.nome = 'Nome muito longo (máximo 100 caracteres)';
  } else if (!/^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(data.nome.trim())) {
    errors.nome = 'Nome contém caracteres inválidos';
  }

  // Validar CNPJ
  const cnpjResult = validateCNPJ(data.cnpj);
  if (!cnpjResult.isValid) {
    errors.cnpj = cnpjResult.error!;
  }

  // Validar cidade
  if (!data.cidade || data.cidade.trim().length < 2) {
    errors.cidade = 'Nome da cidade é obrigatório';
  } else if (data.cidade.trim().length > 100) {
    errors.cidade = 'Nome da cidade muito longo';
  } else if (!/^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(data.cidade.trim())) {
    errors.cidade = 'Nome da cidade contém caracteres inválidos';
  }

  // Validar UF
  const validUFs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  if (!data.estado || !validUFs.includes(data.estado.toUpperCase())) {
    errors.estado = 'UF inválida (use a sigla do estado, ex: SP, RJ)';
  }

  // Validar população
  if (!data.populacao || data.populacao < 1000) {
    errors.populacao = 'População deve ser pelo menos 1.000 habitantes';
  } else if (data.populacao > 50000000) {
    errors.populacao = 'População muito alta (máximo 50 milhões)';
  }

  // Validar CEP (opcional)
  if (data.cep) {
    const cepResult = validateCEP(data.cep);
    if (!cepResult.isValid) {
      errors.cep = cepResult.error!;
    }
  }

  // Validar email do responsável (opcional)
  if (data.responsavel_email) {
    const emailResult = validateEmail(data.responsavel_email);
    if (!emailResult.isValid) {
      errors.responsavel_email = emailResult.error!;
    }
  }

  // Validar telefone do responsável (opcional)
  if (data.responsavel_telefone) {
    const phoneResult = validatePhone(data.responsavel_telefone);
    if (!phoneResult.isValid) {
      errors.responsavel_telefone = phoneResult.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ====================================================================
// GERADORES DE SLUG E CÓDIGOS
// ====================================================================

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
};

export const generateTenantCode = (name: string): string => {
  // Pega as 3 primeiras letras do nome (removendo acentos)
  const cleanName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 3)
    .padEnd(3, 'A');
  
  // Adiciona número sequencial baseado no timestamp
  const timestamp = Date.now().toString().slice(-3);
  
  return `${cleanName}${timestamp}`;
};

// ====================================================================
// MÁSCARAS DE INPUT
// ====================================================================

export const applyMask = (value: string, mask: string): string => {
  let maskedValue = '';
  let valueIndex = 0;
  
  for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
    if (mask[i] === '9') {
      if (/\d/.test(value[valueIndex])) {
        maskedValue += value[valueIndex];
        valueIndex++;
      } else {
        break;
      }
    } else if (mask[i] === 'A') {
      if (/[a-zA-Z]/.test(value[valueIndex])) {
        maskedValue += value[valueIndex];
        valueIndex++;
      } else {
        break;
      }
    } else {
      maskedValue += mask[i];
    }
  }
  
  return maskedValue;
};

// Máscaras específicas
export const maskCNPJ = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  return applyMask(cleanValue, '99.999.999/9999-99');
};

export const maskCPF = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  return applyMask(cleanValue, '999.999.999-99');
};

export const maskCEP = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  return applyMask(cleanValue, '99999-999');
};

export const maskPhone = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 10) {
    return applyMask(cleanValue, '(99) 9999-9999');
  }
  return applyMask(cleanValue, '(99) 99999-9999');
};

export default {
  validateEmail,
  validatePassword,
  validateCPF,
  validateCNPJ,
  validateCEP,
  validatePhone,
  validateFullName,
  validateForm,
  validatePrefeituraData,
  getPasswordStrength,
  formatCPF,
  formatCNPJ,
  formatCEP,
  formatPhone,
  generateSlug,
  generateTenantCode,
  maskCNPJ,
  maskCPF,
  maskCEP,
  maskPhone,
  cleanNumeric,
  sanitizeInput,
  sanitizeEmail
};