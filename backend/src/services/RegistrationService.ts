// ====================================================================
// 👥 REGISTRATION SERVICE - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Serviço completo para registro de usuários e tenants
// Sistema de ativação, validações e criação automatizada
// ====================================================================

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserModel, User, CreateUserData } from '../models/User.js';
import { TenantModel, Tenant, CreateTenantData } from '../models/Tenant.js';
import { ActivityService } from './ActivityService.js';
import { JWTUtils } from '../utils/jwt.js';
import { transaction } from '../database/connection.js';
import { AUTH_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION_CONFIG } from '../config/auth.js';

// ====================================================================
// INTERFACES
// ====================================================================

export interface RegisterUserRequest {
  nome_completo: string;
  email: string;
  password: string;
  tenant_id?: string;
}

export interface RegisterUserResponse {
  success: boolean;
  user: Omit<User, 'password_hash'>;
  activationToken?: string;
  message: string;
}

export interface RegisterTenantRequest {
  tenantData: CreateTenantData;
  adminData: {
    nome_completo: string;
    email: string;
    password: string;
  };
}

export interface RegisterTenantResponse {
  success: boolean;
  tenant: Tenant;
  admin: Omit<User, 'password_hash'>;
  message: string;
}

export interface ActivateAccountRequest {
  token: string;
}

export interface ActivateAccountResponse {
  success: boolean;
  user: Omit<User, 'password_hash'>;
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// ====================================================================
// CLASSE REGISTRATION SERVICE
// ====================================================================

export class RegistrationService {

  // ================================================================
  // REGISTRO DE USUÁRIO COMUM
  // ================================================================

  /**
   * Registrar novo usuário (cidadão ou funcionário)
   */
  static async registerUser(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    const { nome_completo, email, password, tenant_id } = request;

    try {
      // 1. Validar dados de entrada
      await this.validateUserData({ nome_completo, email, password });

      // 2. Verificar se email já existe
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }

      // 3. Validar tenant se fornecido
      if (tenant_id) {
        const tenant = await TenantModel.findById(tenant_id);
        if (!tenant) {
          throw new Error(ERROR_MESSAGES.TENANT_NOT_FOUND);
        }

        // Verificar se tenant pode adicionar mais usuários
        const canAddUser = await TenantModel.canAddUser(tenant_id);
        if (!canAddUser) {
          throw new Error('Limite de usuários atingido para este plano');
        }
      }

      // 4. Hash da senha
      const passwordHash = await bcrypt.hash(password, AUTH_CONFIG.BCRYPT_ROUNDS);

      // 5. Criar dados do usuário
      const userData: CreateUserData = {
        tenant_id: tenant_id || undefined,
        nome_completo: nome_completo.trim(),
        email: email.toLowerCase().trim(),
        password: password, // Será hasheada no UserModel
        role: tenant_id ? 'user' : 'guest', // Cidadão sem tenant = guest
        status: 'pendente' // Requer ativação por email
      };

      // 6. Criar usuário
      const user = await UserModel.create(userData);

      // 7. Gerar token de ativação
      const activationToken = JWTUtils.generateActivationToken(user.id);

      // 8. Registrar atividade
      await ActivityService.log({
        user_id: user.id,
        tenant_id: user.tenant_id,
        action: 'user_registered',
        resource: 'users',
        resource_id: user.id,
        details: JSON.stringify({
          registration_type: tenant_id ? 'staff' : 'citizen',
          email: user.email,
          role: user.role
        })
      });

      // 9. Enviar email de ativação (implementar integração de email depois)
      // await EmailService.sendActivationEmail(user.email, activationToken);

      return {
        success: true,
        user: UserModel.sanitizeUser(user),
        activationToken: process.env.NODE_ENV === 'development' ? activationToken : undefined,
        message: SUCCESS_MESSAGES.REGISTER_SUCCESS
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  // ================================================================
  // REGISTRO DE TENANT + ADMINISTRADOR
  // ================================================================

  /**
   * Registrar nova prefeitura com administrador
   */
  static async registerTenant(request: RegisterTenantRequest): Promise<RegisterTenantResponse> {
    const { tenantData, adminData } = request;

    try {
      // 1. Validar dados do tenant
      await this.validateTenantData(tenantData);

      // 2. Validar dados do administrador
      await this.validateUserData(adminData);

      // 3. Verificar se CNPJ já existe
      const existingTenant = await TenantModel.findByCNPJ(tenantData.cnpj);
      if (existingTenant) {
        throw new Error(ERROR_MESSAGES.CNPJ_ALREADY_EXISTS);
      }

      // 4. Verificar se email do admin já existe
      const existingAdmin = await UserModel.findByEmail(adminData.email);
      if (existingAdmin) {
        throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }

      // 5. Executar em transação
      const result = await transaction(async () => {
        // Criar tenant
        const tenant = await TenantModel.create({
          ...tenantData,
          tenant_code: await TenantModel.generateUniqueCode(tenantData.nome)
        });

        // Criar administrador do tenant
        const adminUserData: CreateUserData = {
          tenant_id: tenant.id,
          nome_completo: adminData.nome_completo.trim(),
          email: adminData.email.toLowerCase().trim(),
          password: adminData.password,
          role: 'admin',
          status: 'ativo' // Admin é criado já ativo
        };

        const admin = await UserModel.create(adminUserData);

        return { tenant, admin };
      });

      // 6. Registrar atividade
      await ActivityService.log({
        user_id: result.admin.id,
        tenant_id: result.tenant.id,
        action: 'tenant_registered',
        resource: 'tenants',
        resource_id: result.tenant.id,
        details: JSON.stringify({
          tenant_name: result.tenant.nome,
          tenant_code: result.tenant.tenant_code,
          admin_email: result.admin.email,
          plano: result.tenant.plano
        })
      });

      return {
        success: true,
        tenant: result.tenant,
        admin: UserModel.sanitizeUser(result.admin),
        message: SUCCESS_MESSAGES.TENANT_CREATED
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  // ================================================================
  // ATIVAÇÃO DE CONTA
  // ================================================================

  /**
   * Ativar conta de usuário usando token
   */
  static async activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse> {
    const { token } = request;

    try {
      // 1. Verificar token de ativação
      const tokenVerification = JWTUtils.verifyActivationToken(token);

      if (!tokenVerification.valid || !tokenVerification.userId) {
        throw new Error('Token de ativação inválido ou expirado');
      }

      // 2. Buscar usuário
      const user = await UserModel.findById(tokenVerification.userId);

      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // 3. Verificar se já está ativo
      if (user.status === 'ativo') {
        return {
          success: true,
          user: UserModel.sanitizeUser(user),
          message: 'Conta já está ativada'
        };
      }

      // 4. Ativar conta
      const updatedUser = await UserModel.update(user.id, {
        status: 'ativo'
      });

      // 5. Marcar email como verificado
      await UserModel.markEmailAsVerified(user.id);

      // 6. Registrar atividade
      await ActivityService.log({
        user_id: user.id,
        tenant_id: user.tenant_id,
        action: 'account_activated',
        resource: 'users',
        resource_id: user.id,
        details: JSON.stringify({
          email: user.email,
          activation_method: 'email_token'
        })
      });

      return {
        success: true,
        user: UserModel.sanitizeUser(updatedUser),
        message: SUCCESS_MESSAGES.EMAIL_VERIFIED
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  // ================================================================
  // RESET DE SENHA
  // ================================================================

  /**
   * Solicitar reset de senha
   */
  static async requestPasswordReset(request: PasswordResetRequest): Promise<PasswordResetResponse> {
    const { email } = request;

    try {
      // 1. Buscar usuário pelo email
      const user = await UserModel.findByEmail(email);

      // Sempre retornar sucesso para não vazar informações sobre usuários existentes
      if (!user) {
        return {
          success: true,
          message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT
        };
      }

      // 2. Gerar token de reset
      const resetToken = JWTUtils.generatePasswordResetToken(user.id);

      // 3. Registrar atividade
      await ActivityService.log({
        user_id: user.id,
        tenant_id: user.tenant_id,
        action: 'password_reset_requested',
        resource: 'users',
        resource_id: user.id,
        details: JSON.stringify({
          email: user.email,
          request_method: 'email'
        })
      });

      // 4. Enviar email com token (implementar integração de email depois)
      // await EmailService.sendPasswordResetEmail(user.email, resetToken);

      console.log(`🔑 Token de reset para ${email}:`, resetToken);

      return {
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT
      };

    } catch (error) {
      // Sempre retornar sucesso para não vazar informações
      console.error('Erro no reset de senha:', error);
      return {
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT
      };
    }
  }

  /**
   * Resetar senha usando token
   */
  static async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const { token, newPassword } = request;

    try {
      // 1. Verificar token de reset
      const tokenVerification = JWTUtils.verifyPasswordResetToken(token);

      if (!tokenVerification.valid || !tokenVerification.userId) {
        throw new Error('Token de reset inválido ou expirado');
      }

      // 2. Buscar usuário
      const user = await UserModel.findById(tokenVerification.userId);

      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // 3. Validar nova senha
      this.validatePassword(newPassword);

      // 4. Atualizar senha
      await UserModel.updatePassword(user.id, newPassword);

      // 5. Resetar tentativas falhadas
      await UserModel.resetFailedAttempts(user.id);

      // 6. Registrar atividade
      await ActivityService.log({
        user_id: user.id,
        tenant_id: user.tenant_id,
        action: 'password_reset_completed',
        resource: 'users',
        resource_id: user.id,
        details: JSON.stringify({
          reset_method: 'token',
          email: user.email
        })
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_UPDATED
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  // ================================================================
  // VALIDAÇÕES PRIVADAS
  // ================================================================

  /**
   * Validar dados de usuário
   */
  private static async validateUserData(userData: {
    nome_completo: string;
    email: string;
    password: string;
  }): Promise<void> {
    // Nome completo
    if (!userData.nome_completo || userData.nome_completo.trim().length < VALIDATION_CONFIG.NAME_MIN_LENGTH) {
      throw new Error(`Nome completo deve ter pelo menos ${VALIDATION_CONFIG.NAME_MIN_LENGTH} caracteres`);
    }

    if (userData.nome_completo.length > VALIDATION_CONFIG.NAME_MAX_LENGTH) {
      throw new Error(`Nome completo deve ter no máximo ${VALIDATION_CONFIG.NAME_MAX_LENGTH} caracteres`);
    }

    // Email
    if (!userData.email || !VALIDATION_CONFIG.EMAIL_REGEX.test(userData.email)) {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
    }

    if (userData.email.length > VALIDATION_CONFIG.EMAIL_MAX_LENGTH) {
      throw new Error(`Email deve ter no máximo ${VALIDATION_CONFIG.EMAIL_MAX_LENGTH} caracteres`);
    }

    // Senha
    this.validatePassword(userData.password);
  }

  /**
   * Validar dados de tenant
   */
  private static async validateTenantData(tenantData: CreateTenantData): Promise<void> {
    // Nome
    if (!tenantData.nome || tenantData.nome.trim().length < 2) {
      throw new Error('Nome da prefeitura deve ter pelo menos 2 caracteres');
    }

    // Cidade
    if (!tenantData.cidade || tenantData.cidade.trim().length < 2) {
      throw new Error('Cidade deve ter pelo menos 2 caracteres');
    }

    // Estado
    if (!tenantData.estado || !VALIDATION_CONFIG.VALID_STATES.includes(tenantData.estado.toUpperCase())) {
      throw new Error('Estado deve ser uma sigla válida (ex: SP, RJ, MG)');
    }

    // CNPJ
    if (!tenantData.cnpj || !this.isValidCNPJ(tenantData.cnpj)) {
      throw new Error(ERROR_MESSAGES.INVALID_CNPJ);
    }

    // Email responsável (se fornecido)
    if (tenantData.responsavel_email && !VALIDATION_CONFIG.EMAIL_REGEX.test(tenantData.responsavel_email)) {
      throw new Error('Email do responsável é inválido');
    }

    // Telefone (se fornecido)
    if (tenantData.responsavel_telefone && !VALIDATION_CONFIG.PHONE_REGEX.test(tenantData.responsavel_telefone)) {
      throw new Error('Telefone do responsável é inválido');
    }
  }

  /**
   * Validar senha
   */
  private static validatePassword(password: string): void {
    if (!password || password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
      throw new Error(`Senha deve ter pelo menos ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} caracteres`);
    }

    if (AUTH_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      throw new Error('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (AUTH_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      throw new Error('Senha deve conter pelo menos uma letra minúscula');
    }

    if (AUTH_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
      throw new Error('Senha deve conter pelo menos um número');
    }

    if (AUTH_CONFIG.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error('Senha deve conter pelo menos um caractere especial');
    }
  }

  /**
   * Validar CNPJ
   */
  private static isValidCNPJ(cnpj: string): boolean {
    // Remover formatação
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    
    // Verificar se tem 14 dígitos
    if (cleanCNPJ.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    // Calcular dígitos verificadores
    let sum = 0;
    let weight = 2;
    
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleanCNPJ[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    sum = 0;
    weight = 2;
    
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleanCNPJ[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return digit1 === parseInt(cleanCNPJ[12]) && digit2 === parseInt(cleanCNPJ[13]);
  }

  // ================================================================
  // MÉTODOS DE CONVENIÊNCIA
  // ================================================================

  /**
   * Verificar disponibilidade de email
   */
  static async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    try {
      const user = await UserModel.findByEmail(email);
      return { available: !user };
    } catch (error) {
      throw new Error(`Erro ao verificar email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Verificar disponibilidade de CNPJ
   */
  static async checkCNPJAvailability(cnpj: string): Promise<{ available: boolean }> {
    try {
      if (!this.isValidCNPJ(cnpj)) {
        throw new Error(ERROR_MESSAGES.INVALID_CNPJ);
      }

      const tenant = await TenantModel.findByCNPJ(cnpj);
      return { available: !tenant };
    } catch (error) {
      throw new Error(`Erro ao verificar CNPJ: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Reenviar email de ativação
   */
  static async resendActivationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await UserModel.findByEmail(email);
      
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (user.status === 'ativo') {
        throw new Error('Conta já está ativada');
      }

      // Gerar novo token
      const activationToken = JWTUtils.generateActivationToken(user.id);

      // Registrar atividade
      await ActivityService.log({
        user_id: user.id,
        tenant_id: user.tenant_id,
        action: 'activation_email_resent',
        resource: 'users',
        resource_id: user.id,
        details: JSON.stringify({
          email: user.email
        })
      });

      // Enviar email (implementar depois)
      // await EmailService.sendActivationEmail(user.email, activationToken);

      console.log(`📧 Token de ativação reenviado para ${email}:`, activationToken);

      return {
        success: true,
        message: 'Email de ativação reenviado com sucesso'
      };

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }
}

export default RegistrationService;