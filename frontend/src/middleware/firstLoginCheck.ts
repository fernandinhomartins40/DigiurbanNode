// =====================================================
// MIDDLEWARE DE VERIFICAÇÃO DE PRIMEIRO LOGIN
// =====================================================

import { APIClient } from '@/auth/utils/httpInterceptor';

// =====================================================
// INTERFACES
// =====================================================

export interface FirstLoginCheckResult {
  requiresPasswordChange: boolean;
  isPasswordExpired: boolean;
  isFirstAccess: boolean;
  expirationDate?: string;
  message?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  nome_completo: string;
  tipo_usuario: string;
  primeiro_acesso: boolean;
  senha_provisoria: boolean;
  data_expiracao_senha?: string;
  data_ultimo_login?: string;
}

// =====================================================
// MIDDLEWARE PRINCIPAL
// =====================================================

export class FirstLoginMiddleware {
  
  /**
   * Verificar se usuário precisa alterar senha
   */
  static async checkFirstLogin(user: User): Promise<FirstLoginCheckResult> {
    try {
      console.log('🔐 Verificando primeiro login para:', user.email);

      // Buscar perfil do usuário
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          nome_completo,
          tipo_usuario,
          primeiro_acesso,
          senha_provisoria,
          data_expiracao_senha,
          data_ultimo_login
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        return {
          requiresPasswordChange: false,
          isPasswordExpired: false,
          isFirstAccess: false,
          message: 'Erro ao verificar perfil do usuário'
        };
      }

      if (!profile) {
        console.warn('⚠️ Perfil não encontrado para usuário:', user.id);
        return {
          requiresPasswordChange: false,
          isPasswordExpired: false,
          isFirstAccess: false,
          message: 'Perfil não encontrado'
        };
      }

      // Verificar se é primeiro acesso
      const isFirstAccess = profile.primeiro_acesso === true;
      
      // Verificar se tem senha provisória
      const hasTempPassword = profile.senha_provisoria === true;

      // Verificar se senha está expirada
      let isPasswordExpired = false;
      if (profile.data_expiracao_senha) {
        const expirationDate = new Date(profile.data_expiracao_senha);
        isPasswordExpired = expirationDate < new Date();
      }

      // Determinar se precisa alterar senha
      const requiresPasswordChange = isFirstAccess || hasTempPassword || isPasswordExpired;

      const result: FirstLoginCheckResult = {
        requiresPasswordChange,
        isPasswordExpired,
        isFirstAccess,
        expirationDate: profile.data_expiracao_senha || undefined,
        message: this.getStatusMessage(isFirstAccess, hasTempPassword, isPasswordExpired)
      };

      console.log('✅ Verificação concluída:', result);
      return result;

    } catch (error: Error | unknown) {
      console.error('❌ Erro na verificação de primeiro login:', error);
      return {
        requiresPasswordChange: false,
        isPasswordExpired: false,
        isFirstAccess: false,
        message: `Erro: ${error.message}`
      };
    }
  }

  /**
   * Verificar senha expirada usando RPC
   */
  static async isPasswordExpired(userId?: string): Promise<boolean> {
    try {
      const targetUserId = userId || (await APIClient.get("/auth/me")).data.user?.id;
      
      if (!targetUserId) {
        return false;
      }

      const { data, error } = await APIClient.post("/rpc/'is_password_expired', {
        user_id: targetUserId
      });

      if (error) {
        console.error('❌ Erro ao verificar expiração via RPC:', error);
        return false;
      }

      return data === true;

    } catch (error: Error | unknown) {
      console.error('❌ Erro na verificação RPC:', error);
      return false;
    }
  }

  /**
   * Confirmar alteração de senha
   */
  static async confirmPasswordChange(): Promise<boolean> {
    try {
      const { data: { user } } = await APIClient.get("/auth/me");
      
      if (!user) {
        return false;
      }

      const { data, error } = await APIClient.post("/rpc/'confirm_password_change', {
        user_id: user.id
      });

      if (error) {
        console.error('❌ Erro ao confirmar alteração:', error);
        throw error;
      }

      console.log('✅ Alteração de senha confirmada');
      return data === true;

    } catch (error: Error | unknown) {
      console.error('❌ Erro na confirmação:', error);
      throw error;
    }
  }

  /**
   * Atualizar último login
   */
  static async updateLastLogin(): Promise<void> {
    try {
      const { data: { user } } = await APIClient.get("/auth/me");
      
      if (!user) {
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          data_ultimo_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Erro ao atualizar último login:', error);
      } else {
        console.log('✅ Último login atualizado');
      }

    } catch (error: Error | unknown) {
      console.error('❌ Erro ao atualizar login:', error);
    }
  }

  /**
   * Verificar se usuário pode acessar sistema
   */
  static async canAccessSystem(user: User): Promise<{
    canAccess: boolean;
    reason?: string;
    redirectTo?: string;
  }> {
    try {
      // Verificar se perfil existe e está ativo
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('status, tipo_usuario')
        .eq('id', user.id)
        .single();

      if (!profile) {
        return {
          canAccess: false,
          reason: 'Perfil não encontrado',
          redirectTo: '/auth/login'
        };
      }

      if (profile.status !== 'ativo') {
        return {
          canAccess: false,
          reason: 'Usuário inativo',
          redirectTo: '/auth/login'
        };
      }

      // Verificar primeiro login
      const firstLoginCheck = await this.checkFirstLogin(user);
      
      if (firstLoginCheck.requiresPasswordChange) {
        return {
          canAccess: false,
          reason: 'Requer alteração de senha',
          redirectTo: '/auth/change-password'
        };
      }

      // Atualizar último login
      await this.updateLastLogin();

      return {
        canAccess: true
      };

    } catch (error: Error | unknown) {
      console.error('❌ Erro ao verificar acesso:', error);
      return {
        canAccess: false,
        reason: `Erro: ${error.message}`,
        redirectTo: '/auth/login'
      };
    }
  }

  /**
   * Obter mensagem de status
   */
  private static getStatusMessage(
    isFirstAccess: boolean,
    hasTempPassword: boolean,
    isPasswordExpired: boolean
  ): string {
    if (isFirstAccess) {
      return 'Primeiro acesso detectado - alteração de senha obrigatória';
    }
    
    if (isPasswordExpired) {
      return 'Senha provisória expirada - alteração obrigatória';
    }
    
    if (hasTempPassword) {
      return 'Senha provisória - recomenda-se alteração';
    }
    
    return 'Acesso normal permitido';
  }

  /**
   * Obter dias até expiração
   */
  static getDaysUntilExpiration(expirationDate?: string): number | null {
    if (!expirationDate) {
      return null;
    }

    const expDate = new Date(expirationDate);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Formatar data de expiração
   */
  static formatExpirationDate(expirationDate?: string): string {
    if (!expirationDate) {
      return 'Sem prazo definido';
    }

    const date = new Date(expirationDate);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}