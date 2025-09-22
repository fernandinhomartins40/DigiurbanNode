// ====================================================================
// 🔍 VALIDATION MIDDLEWARE - DIGIURBAN SECURITY
// ====================================================================
// Middleware completo de validação de entrada
// Proteção contra XSS, SQL Injection e dados maliciosos
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult, ValidationChain, hasValidationErrors, getValidationErrors } from '../utils/validators.js';
import { VALIDATION_CONFIG, AUTH_CONFIG } from '../config/auth.js';

// ====================================================================
// SANITIZADORES CUSTOMIZADOS
// ====================================================================

/**
 * Remove caracteres potencialmente perigosos
 */
const sanitizeInput = (value: any): any => {
  if (typeof value !== 'string') return value;
  
  return value
    .trim()
    .replace(/[<>\"']/g, '') // Remove caracteres HTML perigosos
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/\0/g, ''); // Remove null bytes
};

/**
 * Sanitiza emails
 */
const sanitizeEmail = (email: any): any => {
  if (typeof email !== 'string') return email;
  return email.toLowerCase().trim();
};

/**
 * Sanitiza nomes (permite acentos e caracteres especiais brasileiros)
 */
const sanitizeName = (name: any): any => {
  if (typeof name !== 'string') return name;
  
  return name
    .trim()
    .replace(/[<>\"'`]/g, '') // Remove apenas caracteres HTML perigosos
    .replace(/^\s+|\s+$/g, '') // Remove espaços extras
    .replace(/\s{2,}/g, ' '); // Remove múltiplos espaços
};

// ====================================================================
// VALIDAÇÕES CUSTOMIZADAS
// ====================================================================

/**
 * Valida força da senha
 */
const isStrongPassword = (password: string): boolean => {
  if (password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) return false;
  
  const checks = [
    AUTH_CONFIG.PASSWORD_REQUIRE_UPPERCASE ? /[A-Z]/.test(password) : true,
    AUTH_CONFIG.PASSWORD_REQUIRE_LOWERCASE ? /[a-z]/.test(password) : true,
    AUTH_CONFIG.PASSWORD_REQUIRE_NUMBERS ? /[0-9]/.test(password) : true,
    AUTH_CONFIG.PASSWORD_REQUIRE_SPECIAL ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true
  ];
  
  return checks.every(check => check);
};

/**
 * Valida CNPJ brasileiro
 */
const isValidCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/[^\d]/g, '');
  
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false; // Todos iguais
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let weight = 2;
  
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit1 !== parseInt(cleaned.charAt(12))) return false;
  
  sum = 0;
  weight = 2;
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return digit2 === parseInt(cleaned.charAt(13));
};

/**
 * Detecta possíveis ataques XSS
 */
const containsXSS = (value: string): boolean => {
  if (typeof value !== 'string') return false;
  
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(value));
};

/**
 * Detecta possíveis SQL injection
 */
const containsSQLInjection = (value: string): boolean => {
  if (typeof value !== 'string') return false;
  
  const sqlPatterns = [
    /(\bunion\b.*\bselect\b)/gi,
    /(\bselect\b.*\bfrom\b)/gi,
    /(\binsert\b.*\binto\b)/gi,
    /(\bdelete\b.*\bfrom\b)/gi,
    /(\bdrop\b.*\btable\b)/gi,
    /(\bupdate\b.*\bset\b)/gi,
    /(\b(or|and)\b.*=.*)/gi,
    /(--|\/\*|\*\/)/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(value));
};

// ====================================================================
// VALIDADORES ESPECÍFICOS
// ====================================================================

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .customSanitizer(sanitizeEmail)
    .custom((value) => {
      if (containsXSS(value) || containsSQLInjection(value)) {
        throw new Error('Email contém caracteres inválidos');
      }
      return true;
    }),
    
  body('password')
    .isLength({ min: 1 })
    .withMessage('Senha é obrigatória')
];

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .isLength({ max: VALIDATION_CONFIG.EMAIL_MAX_LENGTH })
    .withMessage(`Email deve ter no máximo ${VALIDATION_CONFIG.EMAIL_MAX_LENGTH} caracteres`)
    .normalizeEmail()
    .customSanitizer(sanitizeEmail)
    .custom((value) => {
      if (containsXSS(value) || containsSQLInjection(value)) {
        throw new Error('Email contém caracteres inválidos');
      }
      return true;
    }),
    
  body('password')
    .custom((value) => {
      if (!isStrongPassword(value)) {
        throw new Error(`Senha deve ter no mínimo ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} caracteres${
          AUTH_CONFIG.PASSWORD_REQUIRE_UPPERCASE ? ', uma letra maiúscula' : ''
        }${
          AUTH_CONFIG.PASSWORD_REQUIRE_LOWERCASE ? ', uma letra minúscula' : ''
        }${
          AUTH_CONFIG.PASSWORD_REQUIRE_NUMBERS ? ', um número' : ''
        }${
          AUTH_CONFIG.PASSWORD_REQUIRE_SPECIAL ? ', um caractere especial' : ''
        }`);
      }
      if (containsXSS(value) || containsSQLInjection(value)) {
        throw new Error('Senha contém caracteres inválidos');
      }
      return true;
    }),
    
  body('nomeCompleto')
    .isLength({ min: VALIDATION_CONFIG.NAME_MIN_LENGTH, max: VALIDATION_CONFIG.NAME_MAX_LENGTH })
    .withMessage(`Nome deve ter entre ${VALIDATION_CONFIG.NAME_MIN_LENGTH} e ${VALIDATION_CONFIG.NAME_MAX_LENGTH} caracteres`)
    .customSanitizer(sanitizeName)
    .custom((value) => {
      if (containsXSS(value) || containsSQLInjection(value)) {
        throw new Error('Nome contém caracteres inválidos');
      }
      return true;
    })
];

export const tenantValidation = [
  body('nome')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome da prefeitura deve ter entre 2 e 100 caracteres')
    .customSanitizer(sanitizeName)
    .custom((value) => {
      if (containsXSS(value) || containsSQLInjection(value)) {
        throw new Error('Nome contém caracteres inválidos');
      }
      return true;
    }),
    
  body('cnpj')
    .custom((value) => {
      if (!isValidCNPJ(value)) {
        throw new Error('CNPJ inválido');
      }
      return true;
    }),
    
  body('cidade')
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade deve ter entre 2 e 100 caracteres')
    .customSanitizer(sanitizeName),
    
  body('estado')
    .isIn(VALIDATION_CONFIG.VALID_STATES)
    .withMessage('Estado inválido')
];

export const userUpdateValidation = [
  body('nomeCompleto')
    .optional()
    .isLength({ min: VALIDATION_CONFIG.NAME_MIN_LENGTH, max: VALIDATION_CONFIG.NAME_MAX_LENGTH })
    .withMessage(`Nome deve ter entre ${VALIDATION_CONFIG.NAME_MIN_LENGTH} e ${VALIDATION_CONFIG.NAME_MAX_LENGTH} caracteres`)
    .customSanitizer(sanitizeName)
    .custom((value) => {
      if (value && (containsXSS(value) || containsSQLInjection(value))) {
        throw new Error('Nome contém caracteres inválidos');
      }
      return true;
    }),
    
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .customSanitizer(sanitizeEmail),
    
  body('role')
    .optional()
    .isIn(['guest', 'user', 'coordinator', 'manager', 'admin', 'super_admin'])
    .withMessage('Role inválida')
];

export const idValidation = [
  param('id')
    .isUUID()
    .withMessage('ID inválido')
    .customSanitizer(sanitizeInput)
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Página deve ser um número entre 1 e 1000'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
    
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Busca deve ter no máximo 100 caracteres')
    .customSanitizer(sanitizeInput)
    .custom((value) => {
      if (value && (containsXSS(value) || containsSQLInjection(value))) {
        throw new Error('Termo de busca contém caracteres inválidos');
      }
      return true;
    })
];

// ====================================================================
// MIDDLEWARE DE PROCESSAMENTO DE ERROS
// ====================================================================

export const handleValidationErrors = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: any) => ({
      field: error.type === 'field' ? error.path : 'general',
      message: error.msg
    }));
    
    res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errorMessages
    });
    return;
  }
  
  next();
};

// ====================================================================
// MIDDLEWARE DE SANITIZAÇÃO GERAL
// ====================================================================

export const sanitizeAll = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Campos que NÃO devem ser sanitizados (senhas, tokens, etc.)
  const protectedFields = ['password', 'newPassword', 'currentPassword', 'confirmPassword', 'token', 'refreshToken'];

  // Sanitizar body (exceto campos protegidos)
  if (req.body && typeof req.body === 'object') {
    sanitizeObjectSelectively(req.body, protectedFields);
  }

  // Sanitizar query
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }

  // Sanitizar params
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }

  next();
};

/**
 * Sanitiza recursivamente um objeto excluindo campos protegidos
 */
function sanitizeObjectSelectively(obj: any, protectedFields: string[]): void {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Não sanitizar campos protegidos (senhas, tokens, etc.)
      if (protectedFields.includes(key)) {
        continue;
      }

      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObjectSelectively(obj[key], protectedFields);
      }
    }
  }
}

/**
 * Sanitiza recursivamente um objeto (versão original para query/params)
 */
function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
}

// ====================================================================
// MIDDLEWARE DE VALIDAÇÃO DE SISTEMA
// ====================================================================

export const systemValidation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Validação geral para operações de sistema
  const { body } = req;

  // Verificar se há dados sensíveis no payload
  if (body && typeof body === 'object') {
    for (const key in body) {
      if (typeof body[key] === 'string') {
        if (containsXSS(body[key]) || containsSQLInjection(body[key])) {
          res.status(400).json({
            success: false,
            error: `Campo ${key} contém caracteres inválidos`,
            code: 'INVALID_INPUT'
          });
          return;
        }
      }
    }
  }

  next();
};

// ====================================================================
// EXPORTAÇÕES
// ====================================================================

export const validators = {
  login: loginValidation,
  register: registerValidation,
  tenant: tenantValidation,
  userUpdate: userUpdateValidation,
  id: idValidation,
  pagination: paginationValidation,
  body,
  query,
  param
};

export default {
  validators,
  handleValidationErrors,
  sanitizeAll,
  systemValidation
};