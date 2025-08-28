import { APIClient } from "@/auth/utils/httpInterceptor";
import { supabaseAdmin, createUserProfileAdmin, logSystemActivity } from "@/auth/utils/httpInterceptorAdmin";
import { TenantService } from './tenantService';

// ====================================================================
// INTERFACES - APENAS USUÁRIO
// ====================================================================

export interface CreateUserData {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  tipo_usuario?: 'admin' | 'usuario';
  send_email?: boolean;
}

export interface User {
  id: string;
  email: string;
  nome_completo: string;
  telefone?: string;
  cargo?: string;
  tipo_usuario: string;
  tenant_id: string;
  tenant_code: string;
  ativo: boolean;
  status: string;
  created_at: string;
  updated_at?: string;
  metadata?: any;
}

export interface CreateUserResponse {
  user_id: string;
  email: string;
  temporary_password: string;
  profile_created: boolean;
  email_sent: boolean;
}

// ====================================================================
// UTILITÁRIOS
// ====================================================================

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const specialChars = '!@#$%&*';
  
  let password = '';
  
  // 2 letras maiúsculas
  for (let i = 0; i < 2; i++) {
    password += chars.charAt(Math.floor(Math.random() * 26));
  }
  
  // 2 letras minúsculas
  for (let i = 0; i < 2; i++) {
    password += chars.charAt(Math.floor(Math.random() * 26) + 26);
  }
  
  // 3 números
  for (let i = 0; i < 3; i++) {
    password += chars.charAt(Math.floor(Math.random() * 10) + 52);
  }
  
  // 1 caractere especial
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Embaralhar
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// ====================================================================
// SERVIÇO DE EMAIL
// ====================================================================

const getEmailService = async () => {
  if (import.meta.env.DEV) {
    const { digiUrbanEmailService } = await import('./digiurbanEmailService.dev');
    return digiUrbanEmailService;
  } else {
    const { digiUrbanEmailService } = await import('./digiurbanEmailService');
    return digiUrbanEmailService;
  }
};

const sendUserWelcomeEmail = async (userData: {
  nome: string;
  email: string;
  tenant_name: string;
  temporary_password: string;
  tipo_usuario: string;
}): Promise<boolean> => {
  try {
    console.log('📧 Enviando email de boas-vindas para usuário...');
    
    const emailHtml = `
      <h2>🏛️ DigiUrban - Bem-vindo(a)!</h2>
      <p>Olá <strong>${userData.nome}</strong>,</p>
      <p>Sua conta foi criada para o tenant <strong>${userData.tenant_name}</strong>.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
        <h3>📋 Dados de Acesso</h3>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Senha Temporária:</strong> <code style="background: #e9ecef; padding: 4px 8px;">${userData.temporary_password}</code></p>
        <p><strong>Perfil:</strong> ${userData.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário'}</p>
        <p><strong>Organização:</strong> ${userData.tenant_name}</p>
      </div>
      
      <p><strong>⚠️ Importante:</strong> Por favor, altere sua senha no primeiro acesso.</p>
      
      <p>Em caso de dúvidas, entre em contato com o suporte.</p>
      
      <p>Atenciosamente,<br>Equipe DigiUrban</p>
    `;
    
    const emailService = await getEmailService();
    const result = await emailService.sendEmail({
      to: userData.email,
      subject: `🏛️ DigiUrban - Conta Criada - ${userData.tenant_name}`,
      html: emailHtml
    });
    
    return result.success;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
};

// ====================================================================
// SERVIÇO DE USUÁRIO DE TENANT - APENAS OPERAÇÕES DE USUÁRIO
// ====================================================================

export class TenantUserService {
  
  /**
   * Criar usuário admin para tenant existente
   */
  static async createAdminForTenant(tenantId: string, userData: CreateUserData): Promise<CreateUserResponse> {
    try {
      console.log('👤 Criando admin para tenant:', tenantId);
      
      // 1. Verificar se tenant existe
      const tenant = await TenantService.getTenantById(tenantId);
      if (!tenant) {
        throw new Error('Tenant não encontrado');
      }
      
      // 2. Verificar se email já existe
      const emailExists = await TenantUserService.checkEmailExists(userData.email);
      if (emailExists) {
        throw new Error('Email já está sendo usado por outro usuário');
      }
      
      // 3. Gerar credenciais
      const temporaryPassword = generateTemporaryPassword();
      const userId = generateUUID();
      
      console.log('🔐 Credenciais geradas para:', userData.email);
      
      // 4. Criar perfil de usuário (usando mesmo formato do Gerenciamento de Usuários)
      const profileData = {
        id: userId,
        nome_completo: userData.nome,
        email: userData.email,
        telefone: userData.telefone || null,
        tipo_usuario: userData.tipo_usuario || 'admin',
        tenant_id: tenantId,
        status: 'pendente_ativacao',
        metadata: {
          created_by: 'super_admin_tenant_management',
          tenant_name: tenant.nome,
          tenant_code: tenant.tenant_code,
          is_tenant_admin: userData.tipo_usuario === 'admin',
          temporary_password: temporaryPassword,
          auth_creation_pending: true,
          created_at: new Date().toISOString(),
          creation_mode: 'tenant_admin'
        },
        created_at: new Date().toISOString()
      };

      const { data: profile, error: profileError } = await createUserProfileAdmin(profileData);
      
      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }
      
      console.log('✅ Perfil de usuário criado:', userId);
      
      // 5. Marcar tenant como tendo admin (se for admin)
      if (userData.tipo_usuario === 'admin') {
        await TenantService.markTenantAsHavingAdmin(tenantId);
      }
      
      // 6. Registrar atividade
      await logSystemActivity({
        user_id: userId,
        tenant_id: tenantId,
        acao: `${userData.tipo_usuario === 'admin' ? 'Admin' : 'Usuário'} criado para tenant`,
        detalhes: `${userData.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário'} ${userData.nome} criado para o tenant ${tenant.nome}`,
        categoria: 'usuarios',
        metadata: {
          tenant_id: tenantId,
          tenant_code: tenant.tenant_code,
          user_email: userData.email,
          user_type: userData.tipo_usuario,
          created_by: 'super_admin'
        }
      });
      
      // 7. Enviar email de boas-vindas
      let emailSent = false;
      if (userData.send_email !== false) {
        emailSent = await sendUserWelcomeEmail({
          nome: userData.nome,
          email: userData.email,
          tenant_name: tenant.nome,
          temporary_password: temporaryPassword,
          tipo_usuario: userData.tipo_usuario || 'admin'
        });
      }
      
      const response: CreateUserResponse = {
        user_id: userId,
        email: userData.email,
        temporary_password: temporaryPassword,
        profile_created: true,
        email_sent: emailSent
      };
      
      console.log('🎉 Usuário criado com sucesso:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  }
  
  /**
   * Criar usuário comum para tenant existente
   */
  static async createUserForTenant(tenantId: string, userData: CreateUserData): Promise<CreateUserResponse> {
    return await TenantUserService.createAdminForTenant(tenantId, {
      ...userData,
      tipo_usuario: 'usuario'
    });
  }
  
  /**
   * Listar usuários de um tenant
   */
  static async getTenantUsers(tenantId: string): Promise<User[]> {
    try {
      console.log('👥 Buscando usuários do tenant:', tenantId);
      
      const { data: users, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        throw new Error(`Erro ao buscar usuários: ${error.message}`);
      }
      
      return users || [];
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      throw error;
    }
  }
  
  /**
   * Verificar se email já existe
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .limit(1);
      
      return !!data && data.length > 0 && !error;
    } catch {
      return false;
    }
  }
  
  /**
   * Desativar usuário
   */
  static async deactivateUser(userId: string): Promise<void> {
    try {
      console.log('🔒 Desativando usuário:', userId);
      
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          ativo: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        throw new Error(`Erro ao desativar usuário: ${error.message}`);
      }
      
      // Registrar atividade
      await logSystemActivity({
        user_id: userId,
        tenant_id: null,
        acao: 'Usuário desativado',
        detalhes: 'Usuário foi desativado pelo super admin',
        categoria: 'usuarios',
        metadata: {
          deactivated_by: 'super_admin'
        }
      });
      
      console.log('✅ Usuário desativado com sucesso:', userId);
    } catch (error) {
      console.error('❌ Erro ao desativar usuário:', error);
      throw error;
    }
  }
  
  /**
   * Reativar usuário
   */
  static async reactivateUser(userId: string): Promise<void> {
    try {
      console.log('🔓 Reativando usuário:', userId);
      
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          ativo: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        throw new Error(`Erro ao reativar usuário: ${error.message}`);
      }
      
      // Registrar atividade
      await logSystemActivity({
        user_id: userId,
        tenant_id: null,
        acao: 'Usuário reativado',
        detalhes: 'Usuário foi reativado pelo super admin',
        categoria: 'usuarios',
        metadata: {
          reactivated_by: 'super_admin'
        }
      });
      
      console.log('✅ Usuário reativado com sucesso:', userId);
    } catch (error) {
      console.error('❌ Erro ao reativar usuário:', error);
      throw error;
    }
  }
  
  /**
   * Reset de senha de usuário
   */
  static async resetUserPassword(email: string): Promise<boolean> {
    try {
      const { error } = await APIClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) throw error;
      
      // Registrar atividade (buscar user_id pelo email)
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('id, tenant_id')
        .eq('email', email)
        .single();
      
      if (profile) {
        await logSystemActivity({
          user_id: profile.id,
          tenant_id: profile.tenant_id,
          acao: 'Reset de senha solicitado',
          detalhes: 'Email de reset de senha foi enviado pelo super admin',
          categoria: 'usuarios',
          metadata: {
            requested_by: 'super_admin',
            email: email
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao resetar senha:', error);
      throw error;
    }
  }
}

// ====================================================================
// HOOK PARA USO EM COMPONENTES REACT
// ====================================================================

export const useTenantUserService = () => {
  const createAdminForTenant = async (tenantId: string, userData: CreateUserData) => {
    return await TenantUserService.createAdminForTenant(tenantId, userData);
  };
  
  const createUserForTenant = async (tenantId: string, userData: CreateUserData) => {
    return await TenantUserService.createUserForTenant(tenantId, userData);
  };
  
  const getTenantUsers = async (tenantId: string) => {
    return await TenantUserService.getTenantUsers(tenantId);
  };
  
  const deactivateUser = async (userId: string) => {
    return await TenantUserService.deactivateUser(userId);
  };
  
  const reactivateUser = async (userId: string) => {
    return await TenantUserService.reactivateUser(userId);
  };
  
  const resetUserPassword = async (email: string) => {
    return await TenantUserService.resetUserPassword(email);
  };
  
  return {
    createAdminForTenant,
    createUserForTenant,
    getTenantUsers,
    deactivateUser,
    reactivateUser,
    resetUserPassword,
    checkEmailExists: TenantUserService.checkEmailExists
  };
};

export default TenantUserService;