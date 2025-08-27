// ====================================================================
// 🔒 CLIENTE SUPABASE ADMIN - ARQUITETURA SEGURA
// ====================================================================
// Versão definitiva que usa RPC Functions no servidor em vez de
// Service Role Key no cliente. Mantém toda a funcionalidade mas
// com segurança adequada.
// ====================================================================

import { supabase } from './supabase';

console.log('🔒 Supabase Admin (RPC-based) inicializado');

// ====================================================================
// FUNÇÕES ADMIN VIA RPC (SERVIDOR)
// ====================================================================

/**
 * Criar usuário usando RPC function (segura)
 * A RPC function valida permissões no servidor
 */
export const createUserAdmin = async (userData: {
  email: string;
  password: string;
  metadata?: Record<string, any>;
  emailConfirm?: boolean;
}) => {
  try {
    console.log('🔐 Criando usuário via RPC function segura');
    
    const { data, error } = await supabase.rpc('create_user_admin', {
      p_email: userData.email,
      p_password: userData.password,
      p_email_confirm: userData.emailConfirm ?? true,
      p_metadata: userData.metadata || {}
    });

    if (error) {
      console.error('❌ Erro ao criar usuário (RPC):', error);
      throw error;
    }

    console.log('✅ Usuário solicitado via RPC:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erro geral na criação de usuário:', error);
    return { data: null, error };
  }
};

/**
 * Atualizar usuário usando RPC function
 */
export const updateUserAdmin = async (userId: string, updates: {
  password?: string;
  email?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    const { data, error } = await supabase.rpc('update_user_admin', {
      p_user_id: userId,
      p_updates: updates
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    return { data: null, error };
  }
};

/**
 * Deletar usuário usando RPC function
 */
export const deleteUserAdmin = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('delete_user_admin', {
      p_user_id: userId
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    return { data: null, error };
  }
};

/**
 * Listar usuários usando RPC function com paginação
 */
export const listUsersAdmin = async (tenantId?: string, page = 1, perPage = 50) => {
  try {
    const offset = (page - 1) * perPage;
    
    const { data, error } = await supabase.rpc('list_tenant_users', {
      p_tenant_id: tenantId || null,
      p_limit: perPage,
      p_offset: offset
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    return { data: null, error };
  }
};

// ====================================================================
// FUNÇÕES DE TENANT VIA RPC
// ====================================================================

/**
 * Criar tenant completo usando RPC function
 */
export const createTenantOnly = async (tenantData: {
  nome: string;
  cidade: string;
  estado: string;
  populacao: number;
  cnpj: string;
  endereco?: string;
  cep?: string;
  plano: string;
  responsavel_nome?: string;
  responsavel_email?: string;
  responsavel_telefone?: string;
}) => {
  try {
    console.log('🏛️ Criando tenant via RPC function:', tenantData.nome);
    
    const { data, error } = await supabase.rpc('create_tenant_complete', {
      p_nome: tenantData.nome,
      p_cidade: tenantData.cidade,
      p_estado: tenantData.estado,
      p_populacao: tenantData.populacao,
      p_cnpj: tenantData.cnpj,
      p_plano: tenantData.plano,
      p_endereco: tenantData.endereco || null,
      p_cep: tenantData.cep || null,
      p_responsavel_nome: tenantData.responsavel_nome || null,
      p_responsavel_email: tenantData.responsavel_email || null,
      p_responsavel_telefone: tenantData.responsavel_telefone || null
    });

    if (error) {
      console.error('❌ Erro ao criar tenant:', error);
      throw error;
    }
    
    console.log('✅ Tenant criado via RPC:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erro ao criar tenant:', error);
    return { data: null, error };
  }
};

/**
 * Atualizar tenant usando RPC function
 */
export const updateTenantAdmin = async (tenantId: string, updates: Record<string, any>) => {
  try {
    const { data, error } = await supabase.rpc('update_tenant_admin', {
      p_tenant_id: tenantId,
      p_updates: updates
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erro ao atualizar tenant:', error);
    return { data: null, error };
  }
};

/**
 * Deletar tenant usando RPC function
 */
export const deleteTenantAdmin = async (tenantId: string, permanent = false) => {
  try {
    const { data, error } = await supabase.rpc('delete_tenant_admin', {
      p_tenant_id: tenantId,
      p_permanent: permanent
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erro ao deletar tenant:', error);
    return { data: null, error };
  }
};

// ====================================================================
// FUNÇÕES DE USUÁRIO/PERFIL (USANDO CLIENTE NORMAL)
// ====================================================================

/**
 * Criar usuário para tenant existente
 * Usa cliente normal com RLS policies
 */
export const createUserForExistingTenant = async (userData: {
  id: string;
  email: string;
  nome_completo: string;
  tipo_usuario: string;
  telefone?: string;
  cargo?: string;
  tenant_id: string;
  tenant_code: string;
  ativo?: boolean;
  status?: string;
  metadata?: any;
}, tenantId: string) => {
  try {
    console.log('👤 Criando usuário para tenant existente:', tenantId);
    
    // 1. Verificar se tenant existe
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, nome, tenant_code')
      .eq('id', tenantId)
      .eq('ativo', true)
      .single();
    
    if (tenantError || !tenant) {
      throw new Error('Tenant não encontrado ou inativo');
    }
    
    // 2. Criar perfil de usuário
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        ...userData,
        tenant_id: tenantId,
        tenant_code: tenant.tenant_code,
        ativo: userData.ativo ?? true,
        status: userData.status ?? 'pendente_ativacao',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }

    console.log('✅ Usuário criado para tenant existente:', data.id);

    // 3. Se for admin, marcar tenant como tendo admin
    if (userData.tipo_usuario === 'admin') {
      await supabase
        .from('tenants')
        .update({ 
          has_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId);
      
      console.log('✅ Tenant marcado como tendo admin');
    }

    // 4. Log da atividade
    await logSystemActivity({
      user_id: data.id,
      tenant_id: tenantId,
      acao: `${userData.tipo_usuario === 'admin' ? 'Admin' : 'Usuário'} criado para tenant existente`,
      detalhes: `${userData.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário'} ${userData.nome_completo} criado para tenant ${tenant.nome}`,
      categoria: 'usuarios',
      metadata: {
        tenant_id: tenantId,
        tenant_code: tenant.tenant_code,
        user_type: userData.tipo_usuario,
        mode: 'user_only'
      }
    });

    return { data, error: null };
  } catch (error) {
    console.error('❌ Erro ao criar usuário para tenant:', error);
    return { data: null, error };
  }
};

/**
 * Criar perfil de usuário
 */
export const createUserProfileAdmin = async (profileData: any) => {
  try {
    // Inserir sem select para evitar problemas de schema cache
    const { error } = await supabase
      .from('user_profiles')
      .insert([profileData]);

    if (error) throw error;

    console.log('✅ Perfil de usuário inserido:', profileData.id);

    // Log da atividade temporariamente desabilitado para debug
    try {
      await logSystemActivity({
        user_id: profileData.id,
        tenant_id: profileData.tenant_id,
        acao: 'Perfil de usuário criado',
        detalhes: `Perfil criado para: ${profileData.email}`,
        categoria: 'usuarios'
      });
    } catch (logError) {
      console.warn('⚠️ Erro no log, mas perfil criado:', logError);
    }

    // Retornar os dados fornecidos como confirmação
    return { data: profileData, error: null };
  } catch (error) {
    console.error('❌ Erro ao criar perfil:', error);
    return { data: null, error };
  }
};

// ====================================================================
// FUNÇÕES DE LOG (USANDO CLIENTE NORMAL COM RLS)
// ====================================================================

/**
 * Log de atividades do sistema
 */
export const logSystemActivity = async (activity: {
  user_id?: string;
  tenant_id?: string;
  acao: string;
  detalhes?: string;
  categoria?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    // Combinar detalhes e metadata em um objeto JSON
    const detalhesJson = {
      detalhes: activity.detalhes,
      categoria: activity.categoria,
      ...activity.metadata
    };

    // Validar UUIDs antes de inserir
    const insertData: any = {
      acao: activity.acao,
      detalhes: detalhesJson,
      created_at: new Date().toISOString()
    };

    // Só adicionar user_id se for um UUID válido
    if (activity.user_id && activity.user_id.trim() !== '' && activity.user_id !== 'undefined') {
      insertData.user_id = activity.user_id;
    }

    // Só adicionar tenant_id se for um UUID válido
    if (activity.tenant_id && activity.tenant_id.trim() !== '' && activity.tenant_id !== 'undefined') {
      insertData.tenant_id = activity.tenant_id;
    }

    const { error } = await supabase
      .from('user_activities')
      .insert([insertData]);

    if (error) {
      console.warn('⚠️ Erro ao registrar atividade:', error);
    } else {
      console.log('📝 Atividade registrada:', activity.acao);
    }
  } catch (err) {
    console.warn('⚠️ Falha no log de atividade:', err);
  }
};

/**
 * Log de emails
 */
export const logEmail = async (emailLog: {
  recipient: string;
  subject: string;
  template_type: string;
  status?: 'pending' | 'sent' | 'failed' | 'bounced';
  message_id?: string;
  html_content?: string;
  metadata?: Record<string, any>;
  error_message?: string;
}) => {
  try {
    const { error } = await supabase
      .from('email_logs')
      .insert([{
        ...emailLog,
        status: emailLog.status || 'pending',
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.warn('⚠️ Erro ao registrar log de email:', error);
    } else {
      console.log('📧 Email logado:', emailLog.recipient);
    }
  } catch (err) {
    console.warn('⚠️ Falha no log de email:', err);
  }
};

/**
 * Atualizar log de email
 */
export const updateEmailLog = async (
  recipient: string, 
  subject: string, 
  updates: {
    status?: 'pending' | 'sent' | 'failed' | 'bounced';
    message_id?: string;
    sent_at?: string;
    error_message?: string;
    metadata?: Record<string, any>;
  }
) => {
  try {
    const { error } = await supabase
      .from('email_logs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('recipient', recipient)
      .eq('subject', subject)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn('⚠️ Erro ao atualizar log de email:', error);
    }
  } catch (err) {
    console.warn('⚠️ Falha na atualização do log:', err);
  }
};

// ====================================================================
// FUNÇÕES AUXILIARES PARA COMPATIBILIDADE
// ====================================================================

/**
 * Função de bypass RLS - agora usa RPC functions que já fazem isso
 */
export const bypassRLS = <T = any>(operation: () => Promise<T>): Promise<T> => {
  // As RPC functions já fazem bypass de RLS quando necessário
  return operation();
};

// Exportar o cliente normal como default (não mais o admin)
export const supabaseAdmin = supabase;
export default supabase;