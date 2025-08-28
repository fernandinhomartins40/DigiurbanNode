// =====================================================
// ÍNDICE MESTRE DOS HOOKS PADRONIZADOS FASE 3
// Facilitação da migração e importação unificada
// =====================================================

// =====================================================
// HOOKS PADRONIZADOS IMPLEMENTADOS
// =====================================================

// Hooks principais já padronizados
export { useProtocolos } from './useProtocolos'
export { useUsuarios } from './useUsuarios'
export { useTenants } from './useTenants'

// Hooks de secretarias padronizados FASE 3
export { useAgriculturaStandardized } from './useAgriculturaStandardized'
export { useSaudeStandardized } from './useSaudeStandardized'
export { useEducacaoStandardized } from './useEducacaoStandardized'
export { useAssistenciaSocialStandardized } from './useAssistenciaSocialStandardized'
export { useCulturaStandardized } from './useCulturaStandardized'
export { useEsportesStandardized } from './useEsportesStandardized'
export { useHabitacaoStandardized } from './useHabitacaoStandardized'
export { useSegurancaStandardized } from './useSegurancaStandardized'
export { useObrasStandardized } from './useObrasStandardized'
export { useTurismoStandardized } from './useTurismoStandardized'
export { useMeioAmbienteStandardized } from './useMeioAmbienteStandardized'
export { usePlanejamentoStandardized } from './usePlanejamentoStandardized'
export { useGabineteStandardized } from './useGabineteStandardized'
export { useServicosPublicosStandardized } from './useServicosPublicosStandardized'

// =====================================================
// MAPEAMENTO DE HOOKS POR SECRETARIA
// =====================================================

export const HOOKS_BY_SECRETARIA = {
  // Hooks já padronizados
  'protocolos': 'useProtocolos',
  'usuarios': 'useUsuarios',
  'tenants': 'useTenants',
  
  // Hooks padronizados FASE 3 - TODAS AS 14 SECRETARIAS
  'agricultura': 'useAgriculturaStandardized',
  'saude': 'useSaudeStandardized',
  'educacao': 'useEducacaoStandardized',
  'assistencia-social': 'useAssistenciaSocialStandardized',
  'cultura': 'useCulturaStandardized',
  'esportes': 'useEsportesStandardized',
  'habitacao': 'useHabitacaoStandardized',
  'seguranca': 'useSegurancaStandardized',
  'obras': 'useObrasStandardized',
  'turismo': 'useTurismoStandardized',
  'meio-ambiente': 'useMeioAmbienteStandardized',
  'planejamento': 'usePlanejamentoStandardized',
  'gabinete': 'useGabineteStandardized',
  'servicos-publicos': 'useServicosPublicosStandardized'
} as const

// =====================================================
// STATUS DE PADRONIZAÇÃO POR MÓDULO
// =====================================================

export const STANDARDIZATION_STATUS = {
  // ✅ COMPLETO - Fase 3 implementada - TODAS AS 14 SECRETARIAS
  'protocolos': 'COMPLETE',
  'usuarios': 'COMPLETE',
  'tenants': 'COMPLETE',
  'agricultura': 'COMPLETE',
  'saude': 'COMPLETE', 
  'educacao': 'COMPLETE',
  'assistencia-social': 'COMPLETE',
  'cultura': 'COMPLETE',
  'esportes': 'COMPLETE',
  'habitacao': 'COMPLETE',
  'seguranca': 'COMPLETE',
  'obras': 'COMPLETE',
  'turismo': 'COMPLETE',
  'meio-ambiente': 'COMPLETE',
  'planejamento': 'COMPLETE',
  'gabinete': 'COMPLETE',
  'servicos-publicos': 'COMPLETE'
} as const

// =====================================================
// GUIA DE MIGRAÇÃO
// =====================================================

export const MIGRATION_GUIDE = {
  // Mapeamento de nomes antigos para novos
  FUNCTION_MAPPING: {
    // Agricultura
    'fetchProdutores': 'getProdutorList',
    'fetchProdutorById': 'getProdutorById',
    'addProdutor': 'createProdutor',
    'updateProdutor': 'updateProdutor',
    'removeProdutor': 'deleteProdutor',
    
    // Saúde
    'fetchUnidadesSaude': 'getUnidadeSaudeList',
    'fetchUnidadeById': 'getUnidadeSaudeById',
    'addUnidadeSaude': 'createUnidadeSaude',
    'updateUnidadeSaude': 'updateUnidadeSaude',
    'removeUnidadeSaude': 'deleteUnidadeSaude',
    
    // Educação
    'fetchEscolas': 'getEscolaList',
    'fetchEscolaById': 'getEscolaById',
    'addEscola': 'createEscola',
    'updateEscola': 'updateEscola',
    'removeEscola': 'deleteEscola'
  },
  
  // Padrões de parâmetros migrados
  PARAMETER_PATTERNS: {
    // Antigo: { page: 1, limit: 20, search: 'termo' }
    // Novo: { page: 1, limit: 20, filters: { search: 'termo' } }
    list_operations: 'Mover search e filtros para dentro de filters object',
    
    // Antigo: Promise<T[]>
    // Novo: Promise<PaginatedResponse<T>>
    return_types: 'Todas as listas retornam PaginatedResponse com pagination info',
    
    // Antigo: Promise<T>
    // Novo: Promise<EntityResponse<T>>
    entity_operations: 'Todas as operações de entidade retornam EntityResponse'
  }
} as const

// =====================================================
// UTILITÁRIOS PARA MIGRAÇÃO
// =====================================================

export class MigrationHelper {
  
  /**
   * Verifica se um hook está padronizado
   */
  static isStandardized(secretaria: string): boolean {
    return STANDARDIZATION_STATUS[secretaria as keyof typeof STANDARDIZATION_STATUS] === 'COMPLETE'
  }
  
  /**
   * Lista hooks não padronizados
   */
  static getPendingHooks(): string[] {
    return Object.entries(STANDARDIZATION_STATUS)
      .filter(([_, status]) => status === 'PENDING')
      .map(([hook]) => hook)
  }
  
  /**
   * Lista hooks padronizados
   */
  static getStandardizedHooks(): string[] {
    return Object.entries(STANDARDIZATION_STATUS)
      .filter(([_, status]) => status === 'COMPLETE')
      .map(([hook]) => hook)
  }
  
  /**
   * Progresso da padronização
   */
  static getProgress(): {
    completed: number
    total: number
    percentage: number
    remaining: string[]
  } {
    const total = Object.keys(STANDARDIZATION_STATUS).length
    const completed = this.getStandardizedHooks().length
    const remaining = this.getPendingHooks()
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
      remaining
    }
  }
  
  /**
   * Gera relatório de migração
   */
  static generateMigrationReport(): string {
    const progress = this.getProgress()
    const standardized = this.getStandardizedHooks()
    const pending = this.getPendingHooks()
    
    return `
# RELATÓRIO DE MIGRAÇÃO FASE 3

## 📊 Progresso Geral
- **Concluído**: ${progress.completed}/${progress.total} (${progress.percentage}%)
- **Pendente**: ${progress.remaining.length} hooks

## ✅ Hooks Padronizados (${standardized.length})
${standardized.map(hook => `- ✅ ${hook}`).join('\n')}

## 🔄 Hooks Pendentes (${pending.length})
${pending.map(hook => `- 🔄 ${hook}`).join('\n')}

## 🔧 Próximos Passos
1. Implementar hooks pendentes
2. Migrar componentes para usar novos hooks
3. Remover hooks legacy após validação
4. Atualizar documentação
    `
  }
}

// =====================================================
// TIPOS PARA MIGRAÇÃO GRADUAL
// =====================================================

export type StandardizedHook = 'protocolos' | 'usuarios' | 'tenants' | 'agricultura' | 'saude' | 'educacao' | 'assistencia-social' | 'cultura' | 'esportes' | 'habitacao' | 'seguranca' | 'obras' | 'turismo' | 'meio-ambiente' | 'planejamento' | 'gabinete' | 'servicos-publicos'
export type PendingHook = never // Todos os hooks foram padronizados!

// =====================================================
// CONFIGURAÇÃO DE FEATURE FLAGS
// =====================================================

export const FEATURE_FLAGS = {
  // Habilitar hooks padronizados por ambiente
  USE_STANDARDIZED_HOOKS: {
    development: true,
    staging: true,
    production: false // Migração gradual em produção
  },
  
  // Habilitar por secretaria específica
  ENABLE_BY_SECRETARIA: {
    'agricultura': true,
    'saude': true,
    'educacao': true,
    'assistencia-social': true,
    'cultura': true,
    'esportes': true,
    'habitacao': true,
    'seguranca': true,
    'obras': true,
    'turismo': true,
    'meio-ambiente': true,
    'planejamento': true,
    'gabinete': true,
    'servicos-publicos': true,
    'protocolos': true,
    'usuarios': true,
    'tenants': true
  }
} as const

/**
 * Utilitário para verificar se deve usar hook padronizado
 */
export function shouldUseStandardizedHook(
  secretaria: string,
  environment: 'development' | 'staging' | 'production' = 'development'
): boolean {
  const globalFlag = FEATURE_FLAGS.USE_STANDARDIZED_HOOKS[environment]
  const secretariaFlag = FEATURE_FLAGS.ENABLE_BY_SECRETARIA[secretaria as keyof typeof FEATURE_FLAGS.ENABLE_BY_SECRETARIA]
  const isStandardized = MigrationHelper.isStandardized(secretaria)
  
  return globalFlag && secretariaFlag && isStandardized
}

// =====================================================
// WRAPPER PARA MIGRAÇÃO GRADUAL
// =====================================================

/**
 * Wrapper que usa hook padronizado se disponível, senão usa legacy
 */
export function useHookWithFallback<T>(
  secretaria: string,
  standardizedHook: () => T,
  legacyHook: () => T
): T {
  const environment = import.meta.env.NODE_ENV as 'development' | 'staging' | 'production'
  
  if (shouldUseStandardizedHook(secretaria, environment)) {
    console.log(`🎯 Usando hook padronizado para ${secretaria}`)
    return standardizedHook()
  } else {
    console.log(`⚠️ Usando hook legacy para ${secretaria}`)
    return legacyHook()
  }
}

// =====================================================
// EXPORTAÇÃO PADRÃO
// =====================================================

export default {
  HOOKS_BY_SECRETARIA,
  STANDARDIZATION_STATUS,
  MIGRATION_GUIDE,
  MigrationHelper,
  FEATURE_FLAGS,
  shouldUseStandardizedHook,
  useHookWithFallback
}