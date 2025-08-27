
/**
 * INTEGRAÇÃO SUPABASE COM TYPES - DIGIURBAN2
 * 
 * Este arquivo agora usa a configuração unificada com types.
 * Mantido para compatibilidade com imports existentes.
 */

import type { Database } from './types'
import { supabaseTyped as supabase } from "@/lib/supabase-unified"

console.log('📌 Supabase integrations client carregado via configuração unificada')

// Re-export para compatibilidade
export { supabase }
export type { Database }

// Export default
export default supabase
