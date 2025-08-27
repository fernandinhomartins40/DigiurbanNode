// =====================================================
// SISTEMA DE OPERAÇÕES BULK E BATCH - FASE 3
// =====================================================

import { supabase } from './supabase'
import { ErrorHandler } from './error-handler'
import { CacheUtils } from './cache-system'
import { transactionManager } from './transaction-system'
import { CRUD_CONSTANTS, BulkResponse, BulkError } from "@/types/crud-patterns"

// =====================================================
// INTERFACES PARA OPERAÇÕES BULK
// =====================================================

export interface BulkCreateParams<T> {
  items: T[]
  table: string
  batch_size?: number
  validate?: boolean
  return_data?: boolean
  ignore_duplicates?: boolean
}

export interface BulkUpdateParams<T> {
  updates: Array<{
    id: string
    data: Partial<T>
  }>
  table: string
  batch_size?: number
  validate?: boolean
  return_data?: boolean
}

export interface BulkDeleteParams {
  ids: string[]
  table: string
  batch_size?: number
  soft_delete?: boolean
  reason?: string
}

export interface BulkProcessingOptions {
  progress_callback?: (completed: number, total: number) => void
  stop_on_error?: boolean
  parallel?: boolean
  max_concurrent?: number
}

// =====================================================
// BULK OPERATIONS MANAGER
// =====================================================

export class BulkOperationsManager {
  private static instance: BulkOperationsManager

  public static getInstance(): BulkOperationsManager {
    if (!BulkOperationsManager.instance) {
      BulkOperationsManager.instance = new BulkOperationsManager()
    }
    return BulkOperationsManager.instance
  }

  // =====================================================
  // BULK CREATE
  // =====================================================

  async bulkCreate<T>(
    params: BulkCreateParams<T>,
    options: BulkProcessingOptions = {}
  ): Promise<BulkResponse<T>> {
    const startTime = Date.now()
    const {
      items,
      table,
      batch_size = CRUD_CONSTANTS.MAX_BULK_OPERATIONS,
      validate = true,
      return_data = true,
      ignore_duplicates = false
    } = params

    const {
      progress_callback,
      stop_on_error = false,
      parallel = false,
      max_concurrent = 5
    } = options

    if (items.length === 0) {
      return {
        success: [],
        errors: [],
        total_processed: 0,
        success_count: 0,
        error_count: 0,
        message: 'Nenhum item para processar',
        processing_time_ms: 0
      }
    }

    if (items.length > CRUD_CONSTANTS.MAX_BULK_OPERATIONS) {
      throw new Error(`Máximo de ${CRUD_CONSTANTS.MAX_BULK_OPERATIONS} itens por operação bulk`)
    }

    const successResults: T[] = []
    const errors: BulkError[] = []
    let processedCount = 0

    try {
      // Dividir em batches
      const batches = this.createBatches(items, batch_size)

      if (parallel) {
        // Processamento paralelo
        await this.processBatchesParallel(
          batches,
          table,
          'create',
          successResults,
          errors,
          processedCount,
          progress_callback,
          stop_on_error,
          max_concurrent
        )
      } else {
        // Processamento sequencial
        for (const [batchIndex, batch] of batches.entries()) {
          try {
            const batchResult = await this.processBatchCreate(
              batch,
              table,
              return_data,
              ignore_duplicates
            )

            successResults.push(...batchResult)
            processedCount += batch.length

            progress_callback?.(processedCount, items.length)

          } catch (error) {
            // Adicionar erros do batch
            batch.forEach((item, itemIndex) => {
              errors.push({
                item,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                code: 'BATCH_ERROR',
                field: `batch_${batchIndex}_item_${itemIndex}`
              })
            })

            processedCount += batch.length

            if (stop_on_error) {
              break
            }
          }
        }
      }

      // Invalidar cache
      CacheUtils.invalidateAfterWrite(table, 'create')

      const message = `Processados ${items.length} itens. ${successResults.length} sucessos, ${errors.length} erros.`

      return {
        success: successResults,
        errors,
        total_processed: items.length,
        success_count: successResults.length,
        error_count: errors.length,
        message,
        processing_time_ms: Date.now() - startTime
      }

    } catch (error) {
      return {
        success: [],
        errors: items.map(item => ({
          item,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'BULK_CREATE_ERROR'
        })),
        total_processed: items.length,
        success_count: 0,
        error_count: items.length,
        message: `Erro na operação bulk create: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        processing_time_ms: Date.now() - startTime
      }
    }
  }

  // =====================================================
  // BULK UPDATE
  // =====================================================

  async bulkUpdate<T>(
    params: BulkUpdateParams<T>,
    options: BulkProcessingOptions = {}
  ): Promise<BulkResponse<T>> {
    const startTime = Date.now()
    const {
      updates,
      table,
      batch_size = 50, // Menor para updates
      validate = true,
      return_data = true
    } = params

    const {
      progress_callback,
      stop_on_error = false,
      parallel = false,
      max_concurrent = 3
    } = options

    if (updates.length === 0) {
      return {
        success: [],
        errors: [],
        total_processed: 0,
        success_count: 0,
        error_count: 0,
        message: 'Nenhuma atualização para processar',
        processing_time_ms: 0
      }
    }

    const successResults: T[] = []
    const errors: BulkError[] = []
    let processedCount = 0

    try {
      // Dividir em batches
      const batches = this.createBatches(updates, batch_size)

      for (const [batchIndex, batch] of batches.entries()) {
        if (parallel) {
          // Processamento paralelo dos itens do batch
          const promises = batch.map(async (update, itemIndex) => {
            try {
              const result = await this.processSingleUpdate(update, table, return_data)
              successResults.push(result)
            } catch (error) {
              errors.push({
                item: update,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                code: 'UPDATE_ERROR',
                field: `batch_${batchIndex}_item_${itemIndex}`
              })
            }
          })

          await Promise.all(promises)
        } else {
          // Processamento sequencial
          for (const [itemIndex, update] of batch.entries()) {
            try {
              const result = await this.processSingleUpdate(update, table, return_data)
              successResults.push(result)
            } catch (error) {
              errors.push({
                item: update,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                code: 'UPDATE_ERROR',
                field: `batch_${batchIndex}_item_${itemIndex}`
              })

              if (stop_on_error) {
                break
              }
            }
          }
        }

        processedCount += batch.length
        progress_callback?.(processedCount, updates.length)

        if (stop_on_error && errors.length > 0) {
          break
        }
      }

      // Invalidar cache
      CacheUtils.invalidateAfterWrite(table, 'update')

      const message = `Processadas ${updates.length} atualizações. ${successResults.length} sucessos, ${errors.length} erros.`

      return {
        success: successResults,
        errors,
        total_processed: updates.length,
        success_count: successResults.length,
        error_count: errors.length,
        message,
        processing_time_ms: Date.now() - startTime
      }

    } catch (error) {
      return {
        success: [],
        errors: updates.map(update => ({
          item: update,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'BULK_UPDATE_ERROR'
        })),
        total_processed: updates.length,
        success_count: 0,
        error_count: updates.length,
        message: `Erro na operação bulk update: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        processing_time_ms: Date.now() - startTime
      }
    }
  }

  // =====================================================
  // BULK DELETE
  // =====================================================

  async bulkDelete(
    params: BulkDeleteParams,
    options: BulkProcessingOptions = {}
  ): Promise<BulkResponse<string>> {
    const startTime = Date.now()
    const {
      ids,
      table,
      batch_size = 100,
      soft_delete = true,
      reason
    } = params

    const {
      progress_callback,
      stop_on_error = false
    } = options

    if (ids.length === 0) {
      return {
        success: [],
        errors: [],
        total_processed: 0,
        success_count: 0,
        error_count: 0,
        message: 'Nenhum ID para processar',
        processing_time_ms: 0
      }
    }

    const successResults: string[] = []
    const errors: BulkError[] = []
    let processedCount = 0

    try {
      // Dividir em batches
      const batches = this.createBatches(ids, batch_size)

      for (const [batchIndex, batch] of batches.entries()) {
        try {
          if (soft_delete) {
            // Soft delete usando update
            const { data, error } = await supabase
              .from(table)
              .update({
                deleted_at: new Date().toISOString(),
                active: false,
                delete_reason: reason
              })
              .in('id', batch)
              .select('id')

            if (error) throw error

            const deletedIds = data?.map(item => item.id) || []
            successResults.push(...deletedIds)

          } else {
            // Hard delete
            const { data, error } = await supabase
              .from(table)
              .delete()
              .in('id', batch)
              .select('id')

            if (error) throw error

            successResults.push(...batch) // IDs que foram deletados
          }

          processedCount += batch.length
          progress_callback?.(processedCount, ids.length)

        } catch (error) {
          // Adicionar erros do batch
          batch.forEach((id, itemIndex) => {
            errors.push({
              item: id,
              error: error instanceof Error ? error.message : 'Erro desconhecido',
              code: 'DELETE_ERROR',
              field: `batch_${batchIndex}_item_${itemIndex}`
            })
          })

          processedCount += batch.length

          if (stop_on_error) {
            break
          }
        }
      }

      // Invalidar cache
      CacheUtils.invalidateAfterWrite(table, 'delete')

      const message = `Processados ${ids.length} IDs. ${successResults.length} sucessos, ${errors.length} erros.`

      return {
        success: successResults,
        errors,
        total_processed: ids.length,
        success_count: successResults.length,
        error_count: errors.length,
        message,
        processing_time_ms: Date.now() - startTime
      }

    } catch (error) {
      return {
        success: [],
        errors: ids.map(id => ({
          item: id,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'BULK_DELETE_ERROR'
        })),
        total_processed: ids.length,
        success_count: 0,
        error_count: ids.length,
        message: `Erro na operação bulk delete: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        processing_time_ms: Date.now() - startTime
      }
    }
  }

  // =====================================================
  // MÉTODOS AUXILIARES
  // =====================================================

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  private async processBatchCreate<T>(
    batch: T[],
    table: string,
    returnData: boolean,
    ignoreDuplicates: boolean
  ): Promise<T[]> {
    let query = supabase
      .from(table)
      .insert(batch)

    if (returnData) {
      query = query.select('*')
    }

    if (ignoreDuplicates) {
      // Supabase não suporta IGNORE, então tratamos erros de duplicata
      try {
        const { data, error } = await query
        if (error) throw error
        return data || []
      } catch (error) {
        // Se erro for de duplicata, tentar inserir um por vez
        if (error instanceof Error && error.message.includes('duplicate')) {
          const results: T[] = []
          for (const item of batch) {
            try {
              const { data } = await supabase
                .from(table)
                .insert([item])
                .select('*')
              if (data) results.push(...data)
            } catch (itemError) {
              // Ignorar erros de duplicata individuais
              if (!(itemError instanceof Error && itemError.message.includes('duplicate'))) {
                throw itemError
              }
            }
          }
          return results
        }
        throw error
      }
    } else {
      const { data, error } = await query
      if (error) throw error
      return data || []
    }
  }

  private async processSingleUpdate<T>(
    update: { id: string; data: Partial<T> },
    table: string,
    returnData: boolean
  ): Promise<T> {
    let query = supabase
      .from(table)
      .update({
        ...update.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', update.id)

    if (returnData) {
      query = query.select('*')
    }

    const { data, error } = await query.single()
    if (error) throw error
    return data
  }

  private async processBatchesParallel<T>(
    batches: T[][],
    table: string,
    operation: 'create' | 'update' | 'delete',
    successResults: T[],
    errors: BulkError[],
    processedCount: number,
    progressCallback?: (completed: number, total: number) => void,
    stopOnError?: boolean,
    maxConcurrent?: number
  ): Promise<void> {
    // Implementação básica de processamento paralelo
    const semaphore = new Array(maxConcurrent || 5).fill(null)
    let currentBatch = 0

    const processBatch = async (): Promise<void> => {
      const batchIndex = currentBatch++
      if (batchIndex >= batches.length) return

      const batch = batches[batchIndex]
      
      try {
        // Processar batch específico baseado na operação
        // (implementação simplificada)
      } catch (error) {
        // Tratar erros
      }

      // Chamar recursivamente para próximo batch
      return processBatch()
    }

    await Promise.all(semaphore.map(() => processBatch()))
  }
}

// =====================================================
// INSTÂNCIA GLOBAL
// =====================================================

export const bulkManager = BulkOperationsManager.getInstance()

// =====================================================
// HOOK PARA USO EM COMPONENTES
// =====================================================

export function useBulkOperations() {
  const bulkCreate = async <T>(
    params: BulkCreateParams<T>,
    options?: BulkProcessingOptions
  ): Promise<BulkResponse<T>> => {
    return bulkManager.bulkCreate(params, options)
  }

  const bulkUpdate = async <T>(
    params: BulkUpdateParams<T>,
    options?: BulkProcessingOptions
  ): Promise<BulkResponse<T>> => {
    return bulkManager.bulkUpdate(params, options)
  }

  const bulkDelete = async (
    params: BulkDeleteParams,
    options?: BulkProcessingOptions
  ): Promise<BulkResponse<string>> => {
    return bulkManager.bulkDelete(params, options)
  }

  return {
    bulkCreate,
    bulkUpdate,
    bulkDelete
  }
}

// =====================================================
// UTILITÁRIOS PARA OPERAÇÕES BULK ESPECÍFICAS
// =====================================================

export class BulkUtils {
  
  /**
   * Importa usuários em lote
   */
  static async importUsers(userData: unknown[]): Promise<BulkResponse<any>> {
    return bulkManager.bulkCreate({
      items: userData.map(user => ({
        ...user,
        created_at: new Date().toISOString(),
        ativo: true
      })),
      table: 'user_profiles',
      validate: true,
      ignore_duplicates: true
    })
  }

  /**
   * Atualiza status de múltiplos protocolos
   */
  static async updateProtocolsStatus(
    protocolIds: string[],
    newStatus: string,
    reason?: string
  ): Promise<BulkResponse<any>> {
    const updates = protocolIds.map(id => ({
      id,
      data: {
        status: newStatus,
        observacoes: reason,
        updated_at: new Date().toISOString()
      }
    }))

    return bulkManager.bulkUpdate({
      updates,
      table: 'protocolos_completos',
      validate: true
    })
  }

  /**
   * Arquiva múltiplos eventos
   */
  static async archiveEvents(eventIds: string[]): Promise<BulkResponse<string>> {
    return bulkManager.bulkDelete({
      ids: eventIds,
      table: 'eventos_culturais',
      soft_delete: true,
      reason: 'Arquivamento em lote'
    })
  }
}