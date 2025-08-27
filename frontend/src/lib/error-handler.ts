// =====================================================
// SISTEMA DE TRATAMENTO DE ERROS UNIFICADO - FASE 3
// =====================================================

import { toast } from 'react-hot-toast'
import { PostgrestError } from '@supabase/supabase-js'
import { CRUD_ERROR_CODES, CrudError, CrudErrorCode } from "@/types/crud-patterns"

// =====================================================
// MAPEAMENTO DE CÓDIGOS DE ERRO DO SUPABASE
// =====================================================

const SUPABASE_ERROR_MAP: Record<string, CrudErrorCode> = {
  // Validation Errors
  '23502': CRUD_ERROR_CODES.REQUIRED_FIELD_MISSING,
  '23514': CRUD_ERROR_CODES.VALIDATION_FAILED,
  
  // Not Found Errors
  'PGRST116': CRUD_ERROR_CODES.ENTITY_NOT_FOUND,
  '42P01': CRUD_ERROR_CODES.ENTITY_NOT_FOUND,
  
  // Permission Errors
  '42501': CRUD_ERROR_CODES.PERMISSION_DENIED,
  'PGRST301': CRUD_ERROR_CODES.PERMISSION_DENIED,
  
  // Constraint Errors
  '23505': CRUD_ERROR_CODES.DUPLICATE_ENTRY,
  '23503': CRUD_ERROR_CODES.FOREIGN_KEY_CONSTRAINT,
  '23514': CRUD_ERROR_CODES.CHECK_CONSTRAINT,
  
  // Database Errors
  '08006': CRUD_ERROR_CODES.CONNECTION_ERROR,
  '08000': CRUD_ERROR_CODES.CONNECTION_ERROR,
  '57014': CRUD_ERROR_CODES.TIMEOUT_ERROR,
  
  // Business Logic Errors
  'P0001': CRUD_ERROR_CODES.BUSINESS_RULE_VIOLATION,
  '40001': CRUD_ERROR_CODES.CONCURRENT_MODIFICATION
}

// =====================================================
// MAPEAMENTO DE MENSAGENS DE ERRO EM PORTUGUÊS
// =====================================================

const ERROR_MESSAGES: Record<CrudErrorCode, string> = {
  // Validation Errors
  [CRUD_ERROR_CODES.VALIDATION_FAILED]: 'Dados inválidos. Verifique os campos preenchidos.',
  [CRUD_ERROR_CODES.REQUIRED_FIELD_MISSING]: 'Campo obrigatório não foi preenchido.',
  [CRUD_ERROR_CODES.INVALID_FORMAT]: 'Formato de dados inválido.',
  
  // Not Found Errors
  [CRUD_ERROR_CODES.ENTITY_NOT_FOUND]: 'Registro não encontrado.',
  [CRUD_ERROR_CODES.PARENT_NOT_FOUND]: 'Registro relacionado não encontrado.',
  
  // Permission Errors
  [CRUD_ERROR_CODES.PERMISSION_DENIED]: 'Você não tem permissão para realizar esta operação.',
  [CRUD_ERROR_CODES.INSUFFICIENT_PRIVILEGES]: 'Privilégios insuficientes.',
  [CRUD_ERROR_CODES.TENANT_ACCESS_DENIED]: 'Acesso negado para este tenant.',
  
  // Constraint Errors
  [CRUD_ERROR_CODES.DUPLICATE_ENTRY]: 'Já existe um registro com estas informações.',
  [CRUD_ERROR_CODES.FOREIGN_KEY_CONSTRAINT]: 'Operação violaria integridade dos dados.',
  [CRUD_ERROR_CODES.UNIQUE_CONSTRAINT]: 'Valor deve ser único.',
  [CRUD_ERROR_CODES.CHECK_CONSTRAINT]: 'Valor não atende às regras de validação.',
  
  // Database Errors
  [CRUD_ERROR_CODES.DATABASE_ERROR]: 'Erro interno do banco de dados.',
  [CRUD_ERROR_CODES.CONNECTION_ERROR]: 'Erro de conexão com o banco de dados.',
  [CRUD_ERROR_CODES.TIMEOUT_ERROR]: 'Operação excedeu o tempo limite.',
  
  // Business Logic Errors
  [CRUD_ERROR_CODES.BUSINESS_RULE_VIOLATION]: 'Operação viola regras de negócio.',
  [CRUD_ERROR_CODES.INVALID_STATE_TRANSITION]: 'Transição de estado inválida.',
  [CRUD_ERROR_CODES.CONCURRENT_MODIFICATION]: 'Registro foi modificado por outro usuário.',
  
  // System Errors
  [CRUD_ERROR_CODES.NETWORK_ERROR]: 'Erro de rede. Verifique sua conexão.',
  [CRUD_ERROR_CODES.SERVICE_UNAVAILABLE]: 'Serviço temporariamente indisponível.',
  [CRUD_ERROR_CODES.UNKNOWN_ERROR]: 'Erro desconhecido. Tente novamente.'
}

// =====================================================
// CLASSE PRINCIPAL PARA TRATAMENTO DE ERROS
// =====================================================

export class ErrorHandler {
  
  /**
   * Trata erros do Supabase e retorna erro padronizado
   */
  static handleSupabaseError(
    error: PostgrestError | Error,
    operation: 'create' | 'read' | 'update' | 'delete' | 'bulk_create' | 'bulk_update' | 'bulk_delete',
    entity: string
  ): CrudError {
    let code: CrudErrorCode = CRUD_ERROR_CODES.UNKNOWN_ERROR
    let message = error.message
    let details = {}

    // Mapear código do Supabase para código padronizado
    if ('code' in error && error.code) {
      code = SUPABASE_ERROR_MAP[error.code] || CRUD_ERROR_CODES.DATABASE_ERROR
      message = ERROR_MESSAGES[code] || error.message
      details = { 
        supabase_code: error.code,
        original_message: error.message
      }
    } else if (error.message.includes('fetch')) {
      code = CRUD_ERROR_CODES.NETWORK_ERROR
      message = ERROR_MESSAGES[code]
    } else if (error.message.includes('timeout')) {
      code = CRUD_ERROR_CODES.TIMEOUT_ERROR
      message = ERROR_MESSAGES[code]
    }

    // Tratamento específico por tipo de erro
    if (error.message.includes('duplicate key value')) {
      code = CRUD_ERROR_CODES.DUPLICATE_ENTRY
      message = ERROR_MESSAGES[code]
    } else if (error.message.includes('violates foreign key constraint')) {
      code = CRUD_ERROR_CODES.FOREIGN_KEY_CONSTRAINT
      message = ERROR_MESSAGES[code]
    } else if (error.message.includes('violates not-null constraint')) {
      code = CRUD_ERROR_CODES.REQUIRED_FIELD_MISSING
      message = ERROR_MESSAGES[code]
    }

    return {
      code,
      message,
      details,
      operation,
      entity,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Trata erros de validação Zod
   */
  static handleValidationError(
    errors: string[],
    operation: 'create' | 'read' | 'update' | 'delete' | 'bulk_create' | 'bulk_update' | 'bulk_delete',
    entity: string
  ): CrudError {
    return {
      code: CRUD_ERROR_CODES.VALIDATION_FAILED,
      message: `Erro de validação: ${errors.join(', ')}`,
      details: { validation_errors: errors },
      operation,
      entity,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Trata erros de permissão
   */
  static handlePermissionError(
    userId: string,
    operation: 'create' | 'read' | 'update' | 'delete' | 'bulk_create' | 'bulk_update' | 'bulk_delete',
    entity: string,
    resourceId?: string
  ): CrudError {
    return {
      code: CRUD_ERROR_CODES.PERMISSION_DENIED,
      message: ERROR_MESSAGES[CRUD_ERROR_CODES.PERMISSION_DENIED],
      details: { 
        user_id: userId,
        resource_id: resourceId,
        attempted_operation: operation
      },
      operation,
      entity,
      timestamp: new Date().toISOString(),
      user_id: userId
    }
  }

  /**
   * Trata erros de negócio
   */
  static handleBusinessError(
    message: string,
    operation: 'create' | 'read' | 'update' | 'delete' | 'bulk_create' | 'bulk_update' | 'bulk_delete',
    entity: string,
    details?: any
  ): CrudError {
    return {
      code: CRUD_ERROR_CODES.BUSINESS_RULE_VIOLATION,
      message,
      details,
      operation,
      entity,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Exibe toast de erro baseado no tipo
   */
  static showErrorToast(error: CrudError, showDetails: boolean = false) {
    let toastMessage = error.message

    if (showDetails && error.details) {
      toastMessage += ` (${JSON.stringify(error.details)})`
    }

    // Usar diferentes tipos de toast baseado na criticidade
    switch (error.code) {
      case CRUD_ERROR_CODES.PERMISSION_DENIED:
      case CRUD_ERROR_CODES.INSUFFICIENT_PRIVILEGES:
      case CRUD_ERROR_CODES.TENANT_ACCESS_DENIED:
        toast.error(toastMessage, { duration: 5000 })
        break
        
      case CRUD_ERROR_CODES.VALIDATION_FAILED:
      case CRUD_ERROR_CODES.REQUIRED_FIELD_MISSING:
      case CRUD_ERROR_CODES.INVALID_FORMAT:
        toast.error(toastMessage, { duration: 4000 })
        break
        
      case CRUD_ERROR_CODES.NETWORK_ERROR:
      case CRUD_ERROR_CODES.CONNECTION_ERROR:
      case CRUD_ERROR_CODES.SERVICE_UNAVAILABLE:
        toast.error(toastMessage, { 
          duration: 6000,
          icon: '🌐'
        })
        break
        
      default:
        toast.error(toastMessage)
    }
  }

  /**
   * Log de erro para monitoramento
   */
  static logError(error: CrudError, context?: any) {
    const logEntry = {
      ...error,
      context,
      stack: new Error().stack,
      user_agent: navigator.userAgent,
      url: window.location.href
    }

    // Em desenvolvimento, mostrar no console
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 CRUD Error: ${error.operation} ${error.entity}`)
      console.error('Error Details:', logEntry)
      console.groupEnd()
    }

    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrar com serviço de logging (Sentry, LogRocket, etc.)
      this.sendToMonitoringService(logEntry)
    }
  }

  /**
   * Enviar erro para serviço de monitoramento
   */
  private static async sendToMonitoringService(errorLog: any) {
    try {
      // Implementar integração com serviço de monitoramento
      // Exemplo: Sentry, LogRocket, custom endpoint
      
      // Por enquanto, apenas log no console em produção
      console.error('Production Error:', errorLog)
      
      // Exemplo de implementação:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog)
      // })
    } catch (err) {
      console.error('Failed to send error to monitoring service:', err)
    }
  }

  /**
   * Retry automático para operações que falharam
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    retryableErrors: CrudErrorCode[] = [
      CRUD_ERROR_CODES.NETWORK_ERROR,
      CRUD_ERROR_CODES.CONNECTION_ERROR,
      CRUD_ERROR_CODES.TIMEOUT_ERROR,
      CRUD_ERROR_CODES.SERVICE_UNAVAILABLE
    ]
  ): Promise<T> {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        // Verificar se o erro é retryable
        if (error instanceof Error) {
          const crudError = this.handleSupabaseError(error, 'read', 'unknown')
          
          if (!retryableErrors.includes(crudError.code) || attempt === maxRetries) {
            throw error
          }
          
          // Aguardar antes do próximo retry (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
        } else {
          throw error
        }
      }
    }

    throw lastError
  }

  /**
   * Wrapper para operações CRUD com tratamento de erro automático
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    operationType: 'create' | 'read' | 'update' | 'delete' | 'bulk_create' | 'bulk_update' | 'bulk_delete',
    entityName: string,
    options: {
      showToast?: boolean
      logError?: boolean
      retryable?: boolean
      context?: any
    } = {}
  ): Promise<T> {
    const {
      showToast = true,
      logError = true,
      retryable = false,
      context
    } = options

    try {
      if (retryable) {
        return await this.retryOperation(operation)
      } else {
        return await operation()
      }
    } catch (error) {
      const crudError = error instanceof Error 
        ? this.handleSupabaseError(error, operationType, entityName)
        : {
            code: CRUD_ERROR_CODES.UNKNOWN_ERROR,
            message: 'Erro desconhecido',
            operation: operationType,
            entity: entityName,
            timestamp: new Date().toISOString()
          }

      if (logError) {
        this.logError(crudError, context)
      }

      if (showToast) {
        this.showErrorToast(crudError)
      }

      throw crudError
    }
  }
}

// =====================================================
// UTILITÁRIOS DE ERRO
// =====================================================

export class ErrorUtils {
  
  /**
   * Verifica se um erro é recuperável
   */
  static isRecoverableError(error: CrudError): boolean {
    const recoverableErrors = [
      CRUD_ERROR_CODES.NETWORK_ERROR,
      CRUD_ERROR_CODES.CONNECTION_ERROR,
      CRUD_ERROR_CODES.TIMEOUT_ERROR,
      CRUD_ERROR_CODES.SERVICE_UNAVAILABLE
    ]
    
    return recoverableErrors.includes(error.code)
  }

  /**
   * Verifica se um erro é de validação
   */
  static isValidationError(error: CrudError): boolean {
    const validationErrors = [
      CRUD_ERROR_CODES.VALIDATION_FAILED,
      CRUD_ERROR_CODES.REQUIRED_FIELD_MISSING,
      CRUD_ERROR_CODES.INVALID_FORMAT
    ]
    
    return validationErrors.includes(error.code)
  }

  /**
   * Verifica se um erro é de permissão
   */
  static isPermissionError(error: CrudError): boolean {
    const permissionErrors = [
      CRUD_ERROR_CODES.PERMISSION_DENIED,
      CRUD_ERROR_CODES.INSUFFICIENT_PRIVILEGES,
      CRUD_ERROR_CODES.TENANT_ACCESS_DENIED
    ]
    
    return permissionErrors.includes(error.code)
  }

  /**
   * Gera sugestão de ação para o usuário baseada no erro
   */
  static getActionSuggestion(error: CrudError): string {
    switch (error.code) {
      case CRUD_ERROR_CODES.NETWORK_ERROR:
        return 'Verifique sua conexão com a internet e tente novamente.'
        
      case CRUD_ERROR_CODES.VALIDATION_FAILED:
        return 'Corrija os campos destacados e tente novamente.'
        
      case CRUD_ERROR_CODES.PERMISSION_DENIED:
        return 'Entre em contato com o administrador para obter as permissões necessárias.'
        
      case CRUD_ERROR_CODES.DUPLICATE_ENTRY:
        return 'Use valores únicos para os campos destacados.'
        
      case CRUD_ERROR_CODES.ENTITY_NOT_FOUND:
        return 'Atualize a página ou verifique se o registro ainda existe.'
        
      case CRUD_ERROR_CODES.SERVICE_UNAVAILABLE:
        return 'O serviço está temporariamente indisponível. Tente novamente em alguns minutos.'
        
      default:
        return 'Tente novamente ou entre em contato com o suporte se o problema persistir.'
    }
  }

  /**
   * Formata erro para exibição ao usuário
   */
  static formatErrorForUser(error: CrudError): {
    title: string
    message: string
    suggestion: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  } {
    const suggestion = this.getActionSuggestion(error)
    
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    
    if (this.isPermissionError(error)) {
      severity = 'high'
    } else if (this.isValidationError(error)) {
      severity = 'low'
    } else if (error.code === CRUD_ERROR_CODES.SERVICE_UNAVAILABLE) {
      severity = 'critical'
    }

    return {
      title: `Erro na operação: ${error.operation}`,
      message: error.message,
      suggestion,
      severity
    }
  }
}

// =====================================================
// HOOK PARA USO EM COMPONENTES
// =====================================================

export function useErrorHandler() {
  const handleError = (
    error: any,
    operation: 'create' | 'read' | 'update' | 'delete' | 'bulk_create' | 'bulk_update' | 'bulk_delete',
    entity: string,
    options?: {
      showToast?: boolean
      logError?: boolean
      context?: any
    }
  ) => {
    return ErrorHandler.withErrorHandling(
      () => Promise.reject(error),
      operation,
      entity,
      options
    ).catch(crudError => {
      return crudError as CrudError
    })
  }

  const isRecoverable = (error: CrudError) => ErrorUtils.isRecoverableError(error)
  const isValidation = (error: CrudError) => ErrorUtils.isValidationError(error)
  const isPermission = (error: CrudError) => ErrorUtils.isPermissionError(error)
  const formatForUser = (error: CrudError) => ErrorUtils.formatErrorForUser(error)

  return {
    handleError,
    isRecoverable,
    isValidation,
    isPermission,
    formatForUser
  }
}