// ====================================================================
// 🔧 VALIDATION HELPERS - CENTRALIZED
// ====================================================================
// Helper centralizado para express-validator para evitar conflitos de import
// ====================================================================

// Import centralizado do express-validator
import expressValidator from 'express-validator';

// Export das funções mais usadas com tipos seguros
export const { 
  body, 
  query, 
  param, 
  validationResult,
  checkSchema,
  oneOf,
  check
} = expressValidator as any;

// Tipos úteis
export type ValidationChain = any;
export type Result = any;

// Helper para verificar erros de validação
export const hasValidationErrors = (req: any): boolean => {
  const errors = validationResult(req);
  return !errors.isEmpty();
};

// Helper para extrair erros de validação
export const getValidationErrors = (req: any) => {
  const errors = validationResult(req);
  return errors.array();
};