import { APIClient } from "@/auth/utils/httpInterceptor";
import { supabaseAdmin, createUserAdmin, createUserProfileAdmin, logSystemActivity, logEmail } from "@/auth/utils/httpInterceptorAdmin";
import { toast } from 'react-hot-toast';

// ====================================================================
// INTERFACES - APENAS OPERAÇÕES DE USUÁRIO (SEM TENANT)
// ====================================================================

export interface CreateUserForTenantData {
  tenant_id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  tipo_usuario: 'admin' | 'usuario';
  send_email?: boolean;
}

export interface CreateUserResponse {
  user_id: string;
  email: string;
  temporary_password: string;
  profile_created: boolean;
  email_sent: boolean;
}

// ====================================================================
// GERAÇÃO DE UUID E SENHA TEMPORÁRIA
// ====================================================================

// Geração de UUID compatível com todos os browsers
const generateUUID = (): string => {
  // Verificar se crypto.randomUUID está disponível (browsers modernos)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback para browsers mais antigos
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
// ENVIO DE EMAIL - DigiUrban Email Service
// ====================================================================

// Importar serviço de email baseado no ambiente
const getEmailService = async () => {
  if (import.meta.env.DEV) {
    const { digiUrbanEmailService } = await import('./digiurbanEmailService.dev');
    return digiUrbanEmailService;
  } else {
    const { digiUrbanEmailService } = await import('./digiurbanEmailService');
    return digiUrbanEmailService;
  }
};

const sendWelcomeEmail = async (userData: {
  nome: string;
  email: string;
  tenant_name: string;
  temporary_password: string;
  login_url: string;
}): Promise<boolean> => {
  try {
    console.log('📧 Enviando email de boas-vindas via DigiUrban Email Service...');
    
    const emailService = await getEmailService();
    const result = await emailService.sendWelcomeEmail(
      userData.email,
      userData.temporary_password,
      userData.tenant_name,
      userData.nome
    );
    
    if (result.success) {
      console.log('✅ Email enviado com sucesso:', result.messageId);
      return true;
    } else {
      console.error('❌ Falha no envio do email:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
};

// ====================================================================
// SERVIÇO PRINCIPAL
// ====================================================================

export class SuperAdminUserService {
  
  /**
   * Criar usuário para tenant existente (RESPONSABILIDADE ÚNICA)
   * Esta função agora é APENAS para usuários, tenant deve existir previamente
   */
  static async createUserForTenant(userData: CreateUserForTenantData): Promise<CreateUserResponse> {
    try {
      console.log('👤 Criando usuário para tenant existente:', userData.tenant_id);
      console.log('⚠️ TENANT DEVE JÁ EXISTIR - esta função não cria tenants');
      
      // 1. Verificar se tenant existe (validação obrigatória)
      const { data: tenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .select('id, nome, tenant_code')
        .eq('id', userData.tenant_id)
        .eq('ativo', true)
        .single();
      
      if (tenantError || !tenant) {
        throw new Error('Tenant não encontrado ou inativo. Crie o tenant primeiro.');
      }
      
      console.log('✅ Tenant validado:', tenant.nome);
      
      // 2. Verificar se email já existe
      const emailExists = await SuperAdminUserService.checkEmailExists(userData.email);
      if (emailExists) {
        throw new Error('Email já está sendo usado por outro usuário');
      }
      
      // 3. Gerar credenciais
      const temporaryPassword = generateTemporaryPassword();
      const userId = generateUUID();
      
      console.log('🔐 Credenciais geradas para:', userData.email);

      // 4. Criar perfil de usuário
      const { data: profileData, error: profileError } = await createUserProfileAdmin({
        id: userId,
        email: userData.email,
        nome_completo: userData.nome,
        tipo_usuario: userData.tipo_usuario,
        telefone: userData.telefone,
        cargo: userData.cargo,
        tenant_id: userData.tenant_id,
        tenant_code: tenant.tenant_code,
        ativo: true,
        status: 'pendente_ativacao',
        metadata: {
          tenant_name: tenant.nome,
          created_by: 'super_admin',
          is_tenant_admin: userData.tipo_usuario === 'admin',
          temporary_password: temporaryPassword,
          auth_creation_pending: true,
          created_at: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      });

      const profileCreated = !profileError;
      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }
      
      console.log('✅ Perfil de usuário criado');

      // 5. Marcar tenant como tendo admin (se aplicável)
      if (userData.tipo_usuario === 'admin') {
        await supabaseAdmin
          .from('tenants')
          .update({ 
            has_admin: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.tenant_id);
        
        console.log('✅ Tenant marcado como tendo admin');
      }

      // 6. Registrar atividade
      await logSystemActivity({
        user_id: userId,
        tenant_id: userData.tenant_id,
        acao: `${userData.tipo_usuario === 'admin' ? 'Admin' : 'Usuário'} criado para tenant`,
        detalhes: `${userData.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário'} ${userData.nome} criado para o tenant ${tenant.nome}`,
        categoria: 'usuarios',
        metadata: {
          tenant_id: userData.tenant_id,
          tenant_code: tenant.tenant_code,
          created_by: 'super_admin',
          user_email: userData.email,
          user_type: userData.tipo_usuario
        }
      });

      // 7. Enviar email de boas-vindas
      let emailSent = false;
      if (userData.send_email !== false) {
        try {
          console.log('📧 Enviando email de boas-vindas...');
          
          const emailHtml = `
            <h2>🏛️ DigiUrban - Bem-vindo(a)!</h2>
            <p>Olá <strong>${userData.nome}</strong>,</p>
            <p>Sua conta foi criada para a organização <strong>${tenant.nome}</strong>.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
              <h3>📋 Dados de Acesso</h3>
              <p><strong>Email:</strong> ${userData.email}</p>
              <p><strong>Senha Temporária:</strong> <code style="background: #e9ecef; padding: 4px 8px;">${temporaryPassword}</code></p>
              <p><strong>Perfil:</strong> ${userData.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário'}</p>
              <p><strong>Organização:</strong> ${tenant.nome}</p>
            </div>
            
            <p><strong>⚠️ Importante:</strong> Por favor, altere sua senha no primeiro acesso.</p>
            
            <p>Atenciosamente,<br>Equipe DigiUrban</p>
          `;
          
          const emailService = await getEmailService();
          const result = await emailService.sendEmail({
            to: userData.email,
            subject: `🏛️ DigiUrban - Conta Criada - ${tenant.nome}`,
            html: emailHtml
          });
          
          emailSent = result.success;
        } catch (emailError) {
          console.warn('⚠️ Erro ao enviar email:', emailError);
        }
      }

      const response: CreateUserResponse = {
        user_id: userId,
        email: userData.email,
        temporary_password: temporaryPassword,
        profile_created: profileCreated,
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
   * Resetar senha de um usuário (usando reset por email)
   */
  static async resetUserPassword(email: string): Promise<boolean> {
    try {
      const { error } = await APIClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      // Registrar atividade (buscar user_id pelo email)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profile) {
        await supabase
          .from('user_activities')
          .insert([{
            user_id: profile.id,
            acao: 'Reset de senha solicitado pelo Super Admin',
            detalhes: 'Email de reset de senha foi enviado'
          }]);
      }

      return true;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      throw error;
    }
  }

  /**
   * Verificar se email já existe
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .single();

      return !!data && !error;
    } catch {
      return false;
    }
  }

  /**
   * Listar usuários de um tenant específico
   */
  static async getTenantUsers(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('nome');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários do tenant:', error);
      throw error;
    }
  }

  /**
   * Desativar usuário
   */
  static async deactivateUser(userId: string): Promise<void> {
    try {
      // Desativar no perfil
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Marcar como desativado no perfil (sem usar admin API)

      // Registrar atividade
      await supabase
        .from('user_activities')
        .insert([{
          user_id: userId,
          acao: 'Usuário desativado pelo Super Admin',
          detalhes: 'Usuário foi desativado pelo administrador do sistema'
        }]);

    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    }
  }
}

// ====================================================================
// HOOK PARA USO EM COMPONENTES REACT
// ====================================================================

export const useSuperAdminUserService = () => {
  const createUserForTenant = async (userData: CreateUserForTenantData) => {
    try {
      const result = await SuperAdminUserService.createUserForTenant(userData);
      
      toast.success(
        `Usuário criado com sucesso!\n` +
        `Email: ${result.email}\n` +
        `Senha temporária: ${result.temporary_password}`,
        { duration: 8000 }
      );
      
      return result;
    } catch (error: Error | unknown) {
      toast.error(`Erro ao criar usuário: ${error.message}`);
      throw error;
    }
  };

  const checkEmailExists = async (email: string) => {
    try {
      return await SuperAdminUserService.checkEmailExists(email);
    } catch (error: Error | unknown) {
      toast.error(`Erro ao verificar email: ${error.message}`);
      return false;
    }
  };

  const resetUserPassword = async (email: string) => {
    try {
      await SuperAdminUserService.resetUserPassword(email);
      toast.success(`Email de reset enviado para: ${email}`);
      return true;
    } catch (error: Error | unknown) {
      toast.error(`Erro ao enviar reset: ${error.message}`);
      throw error;
    }
  };

  return {
    createUserForTenant,
    checkEmailExists,
    resetUserPassword,
    getTenantUsers: SuperAdminUserService.getTenantUsers,
    deactivateUser: SuperAdminUserService.deactivateUser
  };
};

export default SuperAdminUserService;