// =====================================================
// SERVIÇO DE USUÁRIOS HIERÁRQUICOS
// =====================================================

import { APIClient } from "@/auth/utils/httpInterceptor";
import { toast } from 'react-hot-toast';

// =====================================================
// INTERFACES
// =====================================================

export interface DadosCriacaoUsuarioPadrao {
  email: string;
  nome_completo: string;
  tipo_usuario: string;
  tenant_id?: string;
  secretaria_id?: string;
  setor_id?: string;
  cpf?: string;
  telefone?: string;
  cargo?: string;
  enviar_email?: boolean;
}

export interface RespostaCriacaoUsuarioPadrao {
  user_id: string;
  email: string;
  senha_temporaria: string;
  sucesso: boolean;
  mensagem: string;
}

export interface TipoUsuarioCriavelPadrao {
  tipo_usuario: string;
  descricao: string;
  limitado_tenant: boolean;
  limitado_secretaria: boolean;
}

// =====================================================
// SERVIÇO PRINCIPAL
// =====================================================

export class HierarchicalUserService {
  
  /**
   * Criar usuário com senha provisória usando a função SQL
   */
  static async createUser(userData: DadosCriacaoUsuarioPadrao): Promise<RespostaCriacaoUsuarioPadrao> {
    try {
      console.log('🔧 Criando usuário hierárquico:', userData);

      const { data, error } = await APIClient.rpc('create_user_with_temp_password', {
        p_email: userData.email,
        p_nome_completo: userData.nome_completo,
        p_tipo_usuario: userData.tipo_usuario,
        p_tenant_id: userData.tenant_id,
        p_secretaria_id: userData.secretaria_id,
        p_setor_id: userData.setor_id,
        p_cpf: userData.cpf,
        p_telefone: userData.telefone,
        p_cargo: userData.cargo,
        p_send_email: userData.enviar_email ?? true
      });

      if (error) {
        console.error('❌ Erro ao criar usuário:', error);
        throw error;
      }

      const result = data[0] as RespostaCriacaoUsuarioPadrao;
      
      if (result.success) {
        console.log('✅ Usuário criado com sucesso:', result);
        toast.success(`Usuário ${userData.nome_completo} criado com sucesso!`);
        
        // Se solicitado, enviar email com credenciais
        if (userData.enviar_email && result.senha_temporaria) {
          await this.sendWelcomeEmail(result, userData);
        }
      } else {
        console.error('❌ Falha na criação:', result.message);
        toast.error(result.message);
      }

      return result;
      
    } catch (error: Error | unknown) {
      console.error('❌ Erro no serviço de criação:', error);
      toast.error(`Erro ao criar usuário: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obter tipos de usuário que o usuário atual pode criar
   */
  static async getCreatableUserTypes(): Promise<CreatableUserType[]> {
    try {
      const { data: { user } } = await APIClient.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await APIClient.rpc('get_creatable_user_types', {
        creator_id: user.id
      });

      if (error) {
        console.error('❌ Erro ao buscar tipos criáveis:', error);
        throw error;
      }

      return data as TipoUsuarioCriavelPadrao[] || [];
      
    } catch (error: Error | unknown) {
      console.error('❌ Erro ao obter tipos criáveis:', error);
      // Retornar array vazio em caso de erro para não quebrar a UI
      return [];
    }
  }

  /**
   * Verificar se pode criar um tipo específico
   */
  static async canCreateUserType(
    targetType: string,
    targetTenantId?: string,
    targetSecretariaId?: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await APIClient.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await APIClient.rpc('can_create_user_type', {
        creator_id: user.id,
        target_type: targetType,
        target_tenant_id: targetTenantId,
        target_secretaria_id: targetSecretariaId
      });

      if (error) {
        console.error('❌ Erro ao verificar permissão:', error);
        return false;
      }

      return data === true;
      
    } catch (error: Error | unknown) {
      console.error('❌ Erro na verificação de permissão:', error);
      return false;
    }
  }

  /**
   * Obter estatísticas de usuários criados
   */
  static async getUserCreationStats() {
    try {
      const { data, error } = await supabase
        .from('user_creation_stats')
        .select('*')
        .order('total_criados', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        throw error;
      }

      return data || [];
      
    } catch (error: Error | unknown) {
      console.error('❌ Erro nas estatísticas:', error);
      return [];
    }
  }

  /**
   * Listar usuários com senhas expiradas
   */
  static async getUsersWithExpiredPasswords() {
    try {
      const { data, error } = await supabase
        .from('users_with_expired_passwords')
        .select('*')
        .order('data_expiracao_senha', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar senhas expiradas:', error);
        throw error;
      }

      return data || [];
      
    } catch (error: Error | unknown) {
      console.error('❌ Erro ao buscar senhas expiradas:', error);
      return [];
    }
  }

  /**
   * Forçar alteração de senha para um usuário
   */
  static async forcePasswordChange(userId: string): Promise<boolean> {
    try {
      const { data, error } = await APIClient.rpc('force_password_change', {
        user_id: userId
      });

      if (error) {
        console.error('❌ Erro ao forçar alteração de senha:', error);
        throw error;
      }

      if (data) {
        toast.success('Alteração de senha forçada com sucesso');
      }

      return data === true;
      
    } catch (error: Error | unknown) {
      console.error('❌ Erro ao forçar alteração:', error);
      toast.error(`Erro: ${error.message}`);
      return false;
    }
  }

  /**
   * Confirmar alteração de senha após primeiro login
   */
  static async confirmPasswordChange(): Promise<boolean> {
    try {
      const { data: { user } } = await APIClient.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await APIClient.rpc('confirm_password_change', {
        user_id: user.id
      });

      if (error) {
        console.error('❌ Erro ao confirmar alteração:', error);
        throw error;
      }

      return data === true;
      
    } catch (error: Error | unknown) {
      console.error('❌ Erro na confirmação:', error);
      return false;
    }
  }

  /**
   * Verificar se senha está expirada
   */
  static async isPasswordExpired(userId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await APIClient.auth.getUser();
      
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        return false;
      }

      const { data, error } = await APIClient.rpc('is_password_expired', {
        user_id: targetUserId
      });

      if (error) {
        console.error('❌ Erro ao verificar expiração:', error);
        return false;
      }

      return data === true;
      
    } catch (error: Error | unknown) {
      console.error('❌ Erro na verificação de expiração:', error);
      return false;
    }
  }

  /**
   * Enviar email de boas-vindas com credenciais
   */
  private static async sendWelcomeEmail(
    result: RespostaCriacaoUsuarioPadrao, 
    userData: DadosCriacaoUsuarioPadrao
  ): Promise<void> {
    try {
      // Por enquanto apenas log - implementar integração com serviço de email
      console.log('📧 Enviando email de boas-vindas para:', result.email);
      console.log('📧 Credenciais:', {
        email: result.email,
        senha: result.senha_temporaria,
        tipo: userData.tipo_usuario
      });

      // TODO: Integrar com serviço de email real
      // await emailService.sendWelcomeEmail({
      //   to: result.email,
      //   nome: userData.nome_completo,
      //   credenciais: {
      //     email: result.email,
      //     senha: result.senha_temporaria
      //   },
      //   tipo_usuario: userData.tipo_usuario
      // });

      toast.info('Email com credenciais será enviado em breve');
      
    } catch (error: Error | unknown) {
      console.warn('⚠️ Erro ao enviar email:', error);
      toast.warning('Usuário criado, mas houve problema no envio do email');
    }
  }

  /**
   * Obter label amigável para tipos de usuário
   */
  static getUserTypeLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'super_admin': 'Super Administrador',
      'admin': 'Administrador',
      'secretario': 'Secretário',
      'diretor': 'Diretor',
      'coordenador': 'Coordenador',
      'funcionario': 'Funcionário',
      'atendente': 'Atendente',
      'cidadao': 'Cidadão'
    };
    
    return labels[tipo] || tipo;
  }

  /**
   * Obter cor do badge para tipos de usuário
   */
  static getUserTypeBadgeColor(tipo: string): string {
    const colors: Record<string, string> = {
      'super_admin': 'bg-red-100 text-red-800',
      'admin': 'bg-purple-100 text-purple-800',
      'secretario': 'bg-blue-100 text-blue-800',
      'diretor': 'bg-indigo-100 text-indigo-800',
      'coordenador': 'bg-green-100 text-green-800',
      'funcionario': 'bg-yellow-100 text-yellow-800',
      'atendente': 'bg-orange-100 text-orange-800',
      'cidadao': 'bg-gray-100 text-gray-800'
    };
    
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  }
}