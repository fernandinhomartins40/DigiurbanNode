/**
 * ARQUIVO PRINCIPAL SUPABASE - DIGIURBAN2
 * 
 * Este arquivo agora usa a configuração unificada.
 * É mantido para compatibilidade com imports existentes.
 */

// Re-export do cliente unificado
export { supabase } from './supabase-unified'

// Manter compatibilidade com imports diretos
import { supabase as supabaseClient } from './supabase-unified'

console.log('📌 Supabase principal carregado via configuração unificada')

// Export default único
export default supabaseClient