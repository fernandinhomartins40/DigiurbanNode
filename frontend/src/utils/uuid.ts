/**
 * Utilitários para validação e manipulação de UUIDs
 */

/**
 * Valida se uma string é um UUID válido (v4)
 */
export const isValidUUID = (uuid: string): boolean => {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
};

/**
 * Valida UUID e lança erro se inválido
 */
export const validateUUID = (uuid: string, fieldName: string = 'UUID'): void => {
  if (!uuid || uuid.trim() === '') {
    throw new Error(`${fieldName} é obrigatório`);
  }
  
  if (!isValidUUID(uuid)) {
    throw new Error(`${fieldName} deve ser um UUID válido`);
  }
};

/**
 * Sanitiza UUID removendo espaços
 */
export const sanitizeUUID = (uuid: string): string => {
  if (!uuid) return '';
  return uuid.trim();
};

/**
 * Verifica se um valor pode ser um UUID
 */
export const canBeUUID = (value): value is string => {
  return typeof value === 'string' && value.length > 0;
};

/**
 * Formatar UUID para exibição em logs (primeiros e últimos 4 caracteres)
 */
export const formatUUIDForLog = (uuid: string): string => {
  if (!isValidUUID(uuid)) {
    return 'UUID_INVÁLIDO';
  }
  return `${uuid.substring(0, 8)}...${uuid.substring(uuid.length - 8)}`;
};