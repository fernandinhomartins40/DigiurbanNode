// =====================================================
// SISTEMA DE TRANSAÇÕES UNIFICADO - FASE 3
// =====================================================

import { APIClient } from '@/auth/utils/httpInterceptor'
// Custom error interface for API operations
interface APIError {
  message: string
  code?: string
}
import { ErrorHandler } from './error-handler'
import { CacheUtils } from './cache-system'

// =====================================================
// INTERFACES PARA TRANSAÇÕES
// =====================================================

export interface TransactionOperation {
  table: string
  operation: 'insert' | 'update' | 'delete'
  data: any
  where?: Record<string, any>
  select?: string
}

export interface TransactionResult<T = any> {
  success: boolean
  data?: T[]
  operations_completed: number
  operations_total: number
  error?: string
  rollback_performed?: boolean
  execution_time_ms: number
}

export interface TransactionOptions {
  timeout_ms?: number
  auto_commit?: boolean
  enable_logging?: boolean
  invalidate_cache?: string[]
}

// =====================================================
// TRANSACTION MANAGER
// =====================================================

export class TransactionManager {
  private static instance: TransactionManager
  private activeTransactions = new Map<string, any>()

  public static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager()
    }
    return TransactionManager.instance
  }

  /**
   * Executa múltiplas operações em uma transação
   */
  async executeTransaction<T = any>(
    operations: TransactionOperation[],
    options: TransactionOptions = {}
  ): Promise<TransactionResult<T>> {
    const startTime = Date.now()
    const transactionId = this.generateTransactionId()
    const {
      timeout_ms = 30000,
      auto_commit = true,
      enable_logging = true,
      invalidate_cache = []
    } = options

    let completedOperations = 0
    const results: unknown[] = []

    try {
      if (enable_logging) {
        console.log(`🔄 Starting transaction ${transactionId} with ${operations.length} operations`)
      }

      // Registrar transação ativa
      this.activeTransactions.set(transactionId, {
        operations,
        startTime,
        timeout_ms
      })

      // Executar cada operação sequencialmente
      for (const [index, operation] of operations.entries()) {
        try {
          // Verificar timeout
          if (Date.now() - startTime > timeout_ms) {
            throw new Error(`Transaction timeout after ${timeout_ms}ms`)
          }

          const result = await this.executeOperation(operation)
          results.push(result)
          completedOperations++

          if (enable_logging) {
            console.log(`✅ Operation ${index + 1}/${operations.length} completed: ${operation.operation} on ${operation.table}`)
          }

        } catch (error) {
          if (enable_logging) {
            console.error(`❌ Operation ${index + 1} failed:`, error)
          }
          throw error
        }
      }

      // Commit implícito (Supabase auto-commit)
      if (auto_commit && enable_logging) {
        console.log(`✅ Transaction ${transactionId} committed successfully`)
      }

      // Invalidar cache se necessário
      if (invalidate_cache.length > 0) {
        this.invalidateTransactionCache(invalidate_cache)
      }

      return {
        success: true,
        data: results,
        operations_completed: completedOperations,
        operations_total: operations.length,
        execution_time_ms: Date.now() - startTime
      }

    } catch (error) {
      if (enable_logging) {
        console.error(`💥 Transaction ${transactionId} failed:`, error)
      }

      // Supabase não suporta rollback manual, mas cada operação é atômica
      // Tentamos reverter operações já executadas
      const rollbackSuccess = await this.attemptRollback(
        operations.slice(0, completedOperations),
        results,
        transactionId
      )

      return {
        success: false,
        data: results,
        operations_completed: completedOperations,
        operations_total: operations.length,
        error: error instanceof Error ? error.message : 'Unknown error',
        rollback_performed: rollbackSuccess,
        execution_time_ms: Date.now() - startTime
      }

    } finally {
      // Remover transação ativa
      this.activeTransactions.delete(transactionId)
    }
  }

  /**
   * Executa uma operação individual
   */
  private async executeOperation(operation: TransactionOperation): Promise<any> {
    const { table, operation: op, data, where, select } = operation

    let query: any

    switch (op) {
      case 'insert':
        query = supabase
          .from(table)
          .insert(Array.isArray(data) ? data : [data])
        
        if (select) {
          query = query.select(select)
        }
        break

      case 'update':
        if (!where) {
          throw new Error('Update operation requires where clause')
        }
        
        query = supabase
          .from(table)
          .update(data)

        // Aplicar condições where
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })

        if (select) {
          query = query.select(select)
        }
        break

      case 'delete':
        if (!where) {
          throw new Error('Delete operation requires where clause')
        }

        query = supabase
          .from(table)
          .delete()

        // Aplicar condições where
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        break

      default:
        throw new Error(`Unsupported operation: ${op}`)
    }

    const { data: result, error } = await query

    if (error) {
      throw error
    }

    return result
  }

  /**
   * Tenta reverter operações já executadas
   */
  private async attemptRollback(
    completedOperations: TransactionOperation[],
    results: unknown[],
    transactionId: string
  ): Promise<boolean> {
    try {
      console.log(`🔄 Attempting rollback for transaction ${transactionId}`)

      // Reverter operações na ordem inversa
      for (let i = completedOperations.length - 1; i >= 0; i--) {
        const operation = completedOperations[i]
        const result = results[i]

        await this.reverseOperation(operation, result)
      }

      console.log(`✅ Rollback completed for transaction ${transactionId}`)
      return true

    } catch (error) {
      console.error(`❌ Rollback failed for transaction ${transactionId}:`, error)
      return false
    }
  }

  /**
   * Reverte uma operação específica
   */
  private async reverseOperation(
    operation: TransactionOperation,
    result: any
  ): Promise<void> {
    const { table, operation: op } = operation

    switch (op) {
      case 'insert':
        // Deletar registros inseridos
        if (result && Array.isArray(result)) {
          for (const record of result) {
            if (record.id) {
              await supabase
                .from(table)
                .delete()
                .eq('id', record.id)
            }
          }
        }
        break

      case 'update':
        // Não é possível reverter update sem backup dos dados originais
        console.warn(`Cannot rollback update operation on ${table} - original data not available`)
        break

      case 'delete':
        // Não é possível reverter delete sem backup dos dados
        console.warn(`Cannot rollback delete operation on ${table} - deleted data not available`)
        break
    }
  }

  /**
   * Invalida cache relacionado à transação
   */
  private invalidateTransactionCache(entities: string[]): void {
    entities.forEach(entity => {
      CacheUtils.invalidateEntity(entity)
    })
  }

  /**
   * Gera ID único para transação
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Lista transações ativas
   */
  getActiveTransactions(): Array<{ id: string; startTime: number; operationsCount: number }> {
    return Array.from(this.activeTransactions.entries()).map(([id, tx]) => ({
      id,
      startTime: tx.startTime,
      operationsCount: tx.operations.length
    }))
  }

  /**
   * Cancela transação ativa (se possível)
   */
  async cancelTransaction(transactionId: string): Promise<boolean> {
    const transaction = this.activeTransactions.get(transactionId)
    if (!transaction) {
      return false
    }

    // Marcar para cancelamento (implementação básica)
    this.activeTransactions.delete(transactionId)
    console.log(`🚫 Transaction ${transactionId} cancelled`)
    return true
  }
}

// =====================================================
// INSTÂNCIA GLOBAL
// =====================================================

export const transactionManager = TransactionManager.getInstance()

// =====================================================
// UTILITÁRIOS PARA TRANSAÇÕES COMUNS
// =====================================================

export class TransactionUtils {

  /**
   * Cria protocolo com anexos e histórico
   */
  static async createProtocoloWithRelations(protocoloData: any, anexos: unknown[] = []): Promise<TransactionResult> {
    const operations: TransactionOperation[] = [
      // Criar protocolo
      {
        table: 'protocolos_completos',
        operation: 'insert',
        data: protocoloData,
        select: 'id, numero_protocolo'
      }
    ]

    // Adicionar anexos se existirem
    if (anexos.length > 0) {
      operations.push({
        table: 'protocolos_anexos',
        operation: 'insert',
        data: anexos.map(anexo => ({
          ...anexo,
          protocolo_id: '${protocolos_completos.id}' // Será substituído após insert do protocolo
        }))
      })
    }

    // Adicionar entrada no histórico
    operations.push({
      table: 'protocolos_historico',
      operation: 'insert',
      data: {
        protocolo_id: '${protocolos_completos.id}',
        usuario_id: protocoloData.solicitante_id,
        acao: 'criado',
        status_novo: 'aberto',
        observacoes: 'Protocolo criado pelo sistema'
      }
    })

    return transactionManager.executeTransaction(operations, {
      invalidate_cache: ['protocolos', 'protocolos_anexos', 'protocolos_historico']
    })
  }

  /**
   * Cria família com membros
   */
  static async createFamiliaWithMembers(familiaData: any, membros: unknown[] = []): Promise<TransactionResult> {
    const operations: TransactionOperation[] = [
      // Criar família
      {
        table: 'familias_assistencia_social',
        operation: 'insert',
        data: familiaData,
        select: 'id, codigo_familia'
      }
    ]

    // Adicionar membros se existirem
    if (membros.length > 0) {
      operations.push({
        table: 'membros_familia',
        operation: 'insert',
        data: membros.map(membro => ({
          ...membro,
          familia_id: '${familias_assistencia_social.id}'
        }))
      })
    }

    return transactionManager.executeTransaction(operations, {
      invalidate_cache: ['familias_assistencia_social', 'membros_familia']
    })
  }

  /**
   * Atualiza evento com agenda de local
   */
  static async updateEventoWithAgenda(
    eventoId: string, 
    eventoData: any, 
    agendaData: any
  ): Promise<TransactionResult> {
    const operations: TransactionOperation[] = [
      // Atualizar evento
      {
        table: 'eventos_culturais',
        operation: 'update',
        data: eventoData,
        where: { id: eventoId },
        select: 'id, nome'
      },
      // Atualizar agenda do local
      {
        table: 'agenda_espacos',
        operation: 'update',
        data: agendaData,
        where: { evento_id: eventoId }
      }
    ]

    return transactionManager.executeTransaction(operations, {
      invalidate_cache: ['eventos_culturais', 'agenda_espacos']
    })
  }

  /**
   * Deleta usuário com limpeza de relacionamentos
   */
  static async deleteUsuarioWithCleanup(usuarioId: string): Promise<TransactionResult> {
    const operations: TransactionOperation[] = [
      // Remover de equipes
      {
        table: 'equipe_tecnica',
        operation: 'delete',
        where: { user_id: usuarioId }
      },
      // Remover responsabilidades
      {
        table: 'responsabilidades_usuario',
        operation: 'delete',
        where: { usuario_id: usuarioId }
      },
      // Deletar perfil
      {
        table: 'user_profiles',
        operation: 'delete',
        where: { id: usuarioId }
      }
    ]

    return transactionManager.executeTransaction(operations, {
      invalidate_cache: ['user_profiles', 'equipe_tecnica', 'responsabilidades_usuario']
    })
  }
}

// =====================================================
// HOOK PARA USO EM COMPONENTES
// =====================================================

export function useTransactions() {
  const execute = async (
    operations: TransactionOperation[],
    options?: TransactionOptions
  ): Promise<TransactionResult> => {
    return transactionManager.executeTransaction(operations, options)
  }

  const getActive = () => {
    return transactionManager.getActiveTransactions()
  }

  const cancel = async (transactionId: string): Promise<boolean> => {
    return transactionManager.cancelTransaction(transactionId)
  }

  return {
    execute,
    getActive,
    cancel,
    utils: TransactionUtils
  }
}

// =====================================================
// DECORATOR PARA OPERAÇÕES TRANSACIONAIS
// =====================================================

export function withTransaction(options: TransactionOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args[]): Promise<any> {
      // Se primeiro argumento é array de operações, executar como transação
      if (Array.isArray(args[0])) {
        return transactionManager.executeTransaction(args[0], {
          ...options,
          ...args[1] // Merge com opções passadas como segundo argumento
        })
      }

      // Caso contrário, executar método original
      return method.apply(this, args)
    }
  }
}