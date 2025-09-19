// ====================================================================
// 📧 EMAIL SERVICE - DIGIURBAN + ULTRANZEND INTEGRATION
// ====================================================================
// Serviço integrado: UltraZend SMTP Server + DigiUrban Auth System
// Substitui Resend por servidor SMTP próprio com Prisma
// ====================================================================

import { EMAIL_CONFIG, EMAIL_MESSAGES } from '../config/email.js';
import { prisma } from '../database/prisma.js';
import { EmailDatabaseService, EmailDirection, EmailStatus, EmailDirectionType, EmailStatusType } from './EmailDatabaseService.js';
import { createTransport, Transporter } from 'nodemailer';
import crypto from 'crypto';

// ====================================================================
// INTERFACES
// ====================================================================

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  template?: string;
  templateData?: Record<string, any>;
  from?: string;
  replyTo?: string;
  priority?: 'high' | 'normal' | 'low';
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ====================================================================
// CLASSE EMAIL SERVICE
// ====================================================================

export class EmailService {
  private static transporter: Transporter | null = null;
  private static dbService: EmailDatabaseService | null = null;
  private static emailQueue: EmailOptions[] = [];
  private static isProcessing = false;

  // Configurações SMTP do UltraZend
  private static smtpConfig = {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    },
    tls: { rejectUnauthorized: false }
  };

  // ================================================================
  // INICIALIZAÇÃO
  // ================================================================

  /**
   * Inicializar o serviço de e-mail integrado
   */
  static initialize(): void {
    try {
      // Inicializar EmailDatabaseService
      this.dbService = new EmailDatabaseService(prisma);

      // Verificar configuração SMTP
      if (!this.smtpConfig.auth.user || !this.smtpConfig.auth.pass) {
        console.log('ℹ️  EmailService: Configuração SMTP não encontrada - usando fallback');
        console.log('   Configure SMTP_USER, SMTP_PASS para habilitar envio de emails');
        return;
      }

      // Configurar transporter Nodemailer
      this.transporter = createTransport(this.smtpConfig);

      // Verificar conexão SMTP
      this.transporter.verify()
        .then(() => {
          console.log('✅ EmailService (UltraZend SMTP) inicializado com sucesso');
        })
        .catch((error) => {
          console.error('❌ Erro na verificação SMTP:', error);
          this.transporter = null;
        });

    } catch (error) {
      console.error('❌ Erro ao inicializar EmailService:', error);
    }
  }

  /**
   * Verificar se o serviço está configurado
   */
  static isConfigured(): boolean {
    return this.transporter !== null && this.dbService !== null;
  }

  // ================================================================
  // ENVIO DE E-MAILS
  // ================================================================

  /**
   * Enviar e-mail diretamente usando UltraZend SMTP
   */
  static async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // Verificar configuração
      if (!this.isConfigured()) {
        // Simular envio se não configurado (desenvolvimento)
        console.log(`📧 [SIMULADO] Email para ${options.to}: ${options.subject}`);
        return { success: true, messageId: `simulated-${crypto.randomUUID()}` };
      }

      // Validar e-mail
      if (!this.validateEmail(options.to)) {
        throw new Error(EMAIL_MESSAGES.ERROR.INVALID_EMAIL);
      }

      // Verificar rate limit
      const canSend = await this.checkRateLimit(options.to);
      if (!canSend) {
        throw new Error(EMAIL_MESSAGES.ERROR.RATE_LIMIT_EXCEEDED);
      }

      // Gerar messageId único
      const messageId = `${crypto.randomUUID()}@${process.env.SMTP_DOMAIN || 'digiurban.local'}`;

      // Salvar no banco antes de enviar
      if (this.dbService) {
        await this.dbService.saveEmail({
          messageId,
          fromEmail: options.from || EMAIL_CONFIG.FROM_EMAIL || 'noreply@digiurban.local',
          toEmail: options.to,
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text,
          direction: EmailDirection.OUTBOUND
        });
      }

      // Preparar dados do e-mail
      const emailData = {
        messageId,
        from: `${EMAIL_CONFIG.FROM_NAME} <${options.from || EMAIL_CONFIG.FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        headers: {
          'X-DigiUrban-Template': options.template || 'generic',
          'X-DigiUrban-Priority': options.priority || 'normal'
        }
      };

      // Enviar e-mail via SMTP
      const result = await this.transporter!.sendMail(emailData);

      // Atualizar status no banco
      if (this.dbService) {
        await this.dbService.updateEmailStatus(messageId, EmailStatus.SENT);
      }

      // Registrar no log de atividades
      await this.logEmailActivity({
        to: options.to,
        subject: options.subject,
        template: options.template,
        status: 'sent',
        message_id: messageId,
        details: JSON.stringify({ template: options.template, smtpMessageId: result.messageId })
      });

      console.log(`📧 Email enviado com sucesso: ${options.to} - ${options.subject}`);

      return {
        success: true,
        messageId
      };

    } catch (error) {
      console.error('❌ Erro no envio de e-mail:', error);

      // Atualizar status de erro no banco
      if (this.dbService && error instanceof Error) {
        try {
          const errorMessageId = `error-${crypto.randomUUID()}`;
          await this.dbService.saveEmail({
            messageId: errorMessageId,
            fromEmail: options.from || EMAIL_CONFIG.FROM_EMAIL || 'noreply@digiurban.local',
            toEmail: options.to,
            subject: options.subject,
            htmlContent: options.html,
            textContent: options.text,
            direction: EmailDirection.OUTBOUND
          });
          await this.dbService.updateEmailStatus(errorMessageId, EmailStatus.FAILED, error.message);
        } catch (dbError) {
          console.error('Erro ao salvar email falho no banco:', dbError);
        }
      }

      // Registrar erro no log de atividades
      await this.logEmailActivity({
        to: options.to,
        subject: options.subject,
        template: options.template,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : EMAIL_MESSAGES.ERROR.SEND_FAILED
      };
    }
  }

  /**
   * Adicionar e-mail à fila para envio assíncrono
   */
  static async queueEmail(options: EmailOptions): Promise<void> {
    this.emailQueue.push(options);
    
    // Iniciar processamento da fila se não estiver processando
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // ================================================================
  // TEMPLATES DE E-MAIL
  // ================================================================

  /**
   * Enviar e-mail de boas-vindas
   */
  static async sendWelcomeEmail(to: string, userData: {
    nome_completo: string;
    tenant_nome?: string;
  }): Promise<EmailResult> {
    const template = this.generateWelcomeTemplate(userData);
    
    return this.sendEmail({
      to,
      subject: `Bem-vindo ao DigiUrban, ${userData.nome_completo}!`,
      html: template.html,
      text: template.text,
      template: EMAIL_CONFIG.TEMPLATES.WELCOME
    });
  }

  /**
   * Enviar e-mail de recuperação de senha
   */
  static async sendPasswordResetEmail(to: string, userData: {
    nome_completo: string;
    resetToken: string;
    expiresAt: Date;
  }): Promise<EmailResult> {
    const template = this.generatePasswordResetTemplate(userData);
    
    return this.sendEmail({
      to,
      subject: 'Recuperação de Senha - DigiUrban',
      html: template.html,
      text: template.text,
      template: EMAIL_CONFIG.TEMPLATES.PASSWORD_RESET,
      priority: 'high'
    });
  }

  /**
   * Enviar e-mail de verificação de conta
   */
  static async sendEmailVerificationEmail(to: string, userData: {
    nome_completo: string;
    verificationToken: string;
  }): Promise<EmailResult> {
    const template = this.generateEmailVerificationTemplate(userData);
    
    return this.sendEmail({
      to,
      subject: 'Verificação de E-mail - DigiUrban',
      html: template.html,
      text: template.text,
      template: EMAIL_CONFIG.TEMPLATES.EMAIL_VERIFICATION,
      priority: 'high'
    });
  }

  /**
   * Enviar e-mail de conta bloqueada
   */
  static async sendAccountLockedEmail(to: string, userData: {
    nome_completo: string;
    lockReason: string;
    unlockDate?: Date;
  }): Promise<EmailResult> {
    const template = this.generateAccountLockedTemplate(userData);
    
    return this.sendEmail({
      to,
      subject: 'Conta Temporariamente Bloqueada - DigiUrban',
      html: template.html,
      text: template.text,
      template: EMAIL_CONFIG.TEMPLATES.ACCOUNT_LOCKED,
      priority: 'high'
    });
  }

  /**
   * Enviar e-mail de novo login detectado
   */
  static async sendNewLoginEmail(to: string, userData: {
    nome_completo: string;
    loginInfo: {
      ipAddress: string;
      userAgent: string;
      location?: string;
      timestamp: Date;
    };
  }): Promise<EmailResult> {
    const template = this.generateNewLoginTemplate(userData);
    
    return this.sendEmail({
      to,
      subject: 'Novo Acesso Detectado - DigiUrban',
      html: template.html,
      text: template.text,
      template: EMAIL_CONFIG.TEMPLATES.NEW_LOGIN
    });
  }

  // ================================================================
  // GERADORES DE TEMPLATE
  // ================================================================

  /**
   * Template de boas-vindas
   */
  private static generateWelcomeTemplate(userData: {
    nome_completo: string;
    tenant_nome?: string;
  }): EmailTemplate {
    const tenantInfo = userData.tenant_nome ? ` da ${userData.tenant_nome}` : '';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bem-vindo ao DigiUrban</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">DigiUrban</h1>
            </div>
            
            <h2>Bem-vindo, ${userData.nome_completo}!</h2>
            
            <p>É com grande prazer que damos as boas-vindas ao sistema DigiUrban${tenantInfo}.</p>
            
            <p>Sua conta foi criada com sucesso e você já pode acessar todas as funcionalidades da plataforma.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${EMAIL_CONFIG.FRONTEND_URL}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Acessar Sistema
              </a>
            </div>
            
            <p>Se você tiver alguma dúvida ou precisar de suporte, nossa equipe está sempre pronta para ajudar.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #666;">
              Este é um e-mail automático, por favor não responda. <br>
              DigiUrban - Sistema de Gestão Municipal
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Bem-vindo ao DigiUrban, ${userData.nome_completo}!
      
      É com grande prazer que damos as boas-vindas ao sistema DigiUrban${tenantInfo}.
      
      Sua conta foi criada com sucesso e você já pode acessar todas as funcionalidades da plataforma.
      
      Acesse: ${EMAIL_CONFIG.FRONTEND_URL}
      
      Se você tiver alguma dúvida ou precisar de suporte, nossa equipe está sempre pronta para ajudar.
    `;

    return {
      subject: `Bem-vindo ao DigiUrban, ${userData.nome_completo}!`,
      html,
      text
    };
  }

  /**
   * Template de recuperação de senha
   */
  private static generatePasswordResetTemplate(userData: {
    nome_completo: string;
    resetToken: string;
    expiresAt: Date;
  }): EmailTemplate {
    const resetUrl = `${EMAIL_CONFIG.FRONTEND_URL}/reset-password?token=${userData.resetToken}`;
    const expirationTime = userData.expiresAt.toLocaleString('pt-BR');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Recuperação de Senha - DigiUrban</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">DigiUrban</h1>
            </div>
            
            <h2>Recuperação de Senha</h2>
            
            <p>Olá, ${userData.nome_completo}!</p>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no DigiUrban.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Redefinir Senha
              </a>
            </div>
            
            <p><strong>Importante:</strong> Este link expira em ${expirationTime}.</p>
            
            <p>Se você não solicitou esta recuperação de senha, pode ignorar este e-mail com segurança. Sua senha não será alterada.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #666;">
              Este é um e-mail automático, por favor não responda. <br>
              DigiUrban - Sistema de Gestão Municipal
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Recuperação de Senha - DigiUrban
      
      Olá, ${userData.nome_completo}!
      
      Recebemos uma solicitação para redefinir a senha da sua conta no DigiUrban.
      
      Clique no link para redefinir sua senha: ${resetUrl}
      
      IMPORTANTE: Este link expira em ${expirationTime}.
      
      Se você não solicitou esta recuperação de senha, pode ignorar este e-mail com segurança.
    `;

    return {
      subject: 'Recuperação de Senha - DigiUrban',
      html,
      text
    };
  }

  /**
   * Template de verificação de e-mail
   */
  private static generateEmailVerificationTemplate(userData: {
    nome_completo: string;
    verificationToken: string;
  }): EmailTemplate {
    const verificationUrl = `${EMAIL_CONFIG.FRONTEND_URL}/verify-email?token=${userData.verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verificação de E-mail - DigiUrban</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">DigiUrban</h1>
            </div>
            
            <h2>Verificação de E-mail</h2>
            
            <p>Olá, ${userData.nome_completo}!</p>
            
            <p>Para ativar sua conta no DigiUrban, precisamos verificar seu endereço de e-mail.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verificar E-mail
              </a>
            </div>
            
            <p>Após a verificação, você poderá acessar todas as funcionalidades do sistema.</p>
            
            <p>Se você não criou esta conta, pode ignorar este e-mail com segurança.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #666;">
              Este é um e-mail automático, por favor não responda. <br>
              DigiUrban - Sistema de Gestão Municipal
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Verificação de E-mail - DigiUrban
      
      Olá, ${userData.nome_completo}!
      
      Para ativar sua conta no DigiUrban, precisamos verificar seu endereço de e-mail.
      
      Clique no link para verificar: ${verificationUrl}
      
      Após a verificação, você poderá acessar todas as funcionalidades do sistema.
      
      Se você não criou esta conta, pode ignorar este e-mail com segurança.
    `;

    return {
      subject: 'Verificação de E-mail - DigiUrban',
      html,
      text
    };
  }

  /**
   * Template de conta bloqueada
   */
  private static generateAccountLockedTemplate(userData: {
    nome_completo: string;
    lockReason: string;
    unlockDate?: Date;
  }): EmailTemplate {
    const unlockInfo = userData.unlockDate ? 
      `O bloqueio será removido automaticamente em ${userData.unlockDate.toLocaleString('pt-BR')}.` : 
      'Entre em contato com o administrador para desbloquear sua conta.';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Conta Bloqueada - DigiUrban</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">DigiUrban</h1>
            </div>
            
            <h2 style="color: #dc2626;">Conta Temporariamente Bloqueada</h2>
            
            <p>Olá, ${userData.nome_completo}!</p>
            
            <p>Sua conta no DigiUrban foi temporariamente bloqueada.</p>
            
            <p><strong>Motivo:</strong> ${userData.lockReason}</p>
            
            <p>${unlockInfo}</p>
            
            <p>Se você acredita que isso é um erro ou precisa de ajuda, entre em contato com o suporte técnico.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #666;">
              Este é um e-mail automático, por favor não responda. <br>
              DigiUrban - Sistema de Gestão Municipal
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Conta Temporariamente Bloqueada - DigiUrban
      
      Olá, ${userData.nome_completo}!
      
      Sua conta no DigiUrban foi temporariamente bloqueada.
      
      Motivo: ${userData.lockReason}
      
      ${unlockInfo}
      
      Se você acredita que isso é um erro ou precisa de ajuda, entre em contato com o suporte técnico.
    `;

    return {
      subject: 'Conta Temporariamente Bloqueada - DigiUrban',
      html,
      text
    };
  }

  /**
   * Template de novo login
   */
  private static generateNewLoginTemplate(userData: {
    nome_completo: string;
    loginInfo: {
      ipAddress: string;
      userAgent: string;
      location?: string;
      timestamp: Date;
    };
  }): EmailTemplate {
    const { loginInfo } = userData;
    const loginTime = loginInfo.timestamp.toLocaleString('pt-BR');
    const locationInfo = loginInfo.location || 'Localização não identificada';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Novo Acesso Detectado - DigiUrban</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">DigiUrban</h1>
            </div>
            
            <h2>Novo Acesso Detectado</h2>
            
            <p>Olá, ${userData.nome_completo}!</p>
            
            <p>Detectamos um novo acesso à sua conta no DigiUrban:</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Data/Hora:</strong> ${loginTime}</p>
              <p><strong>IP:</strong> ${loginInfo.ipAddress}</p>
              <p><strong>Localização:</strong> ${locationInfo}</p>
              <p><strong>Dispositivo:</strong> ${loginInfo.userAgent}</p>
            </div>
            
            <p>Se este acesso foi realizado por você, pode ignorar este e-mail.</p>
            
            <p><strong>Se você não reconhece este acesso:</strong></p>
            <ul>
              <li>Altere sua senha imediatamente</li>
              <li>Verifique se não há atividades suspeitas em sua conta</li>
              <li>Entre em contato com o suporte se necessário</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${EMAIL_CONFIG.FRONTEND_URL}/profile/security" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Revisar Segurança
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #666;">
              Este é um e-mail automático, por favor não responda. <br>
              DigiUrban - Sistema de Gestão Municipal
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Novo Acesso Detectado - DigiUrban
      
      Olá, ${userData.nome_completo}!
      
      Detectamos um novo acesso à sua conta no DigiUrban:
      
      Data/Hora: ${loginTime}
      IP: ${loginInfo.ipAddress}
      Localização: ${locationInfo}
      Dispositivo: ${loginInfo.userAgent}
      
      Se este acesso foi realizado por você, pode ignorar este e-mail.
      
      Se você não reconhece este acesso:
      - Altere sua senha imediatamente
      - Verifique se não há atividades suspeitas em sua conta
      - Entre em contato com o suporte se necessário
      
      Revisar Segurança: ${EMAIL_CONFIG.FRONTEND_URL}/profile/security
    `;

    return {
      subject: 'Novo Acesso Detectado - DigiUrban',
      html,
      text
    };
  }

  // ================================================================
  // MÉTODOS AUXILIARES
  // ================================================================

  /**
   * Validar formato de e-mail
   */
  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Verificar rate limit para e-mails
   */
  private static async checkRateLimit(email: string): Promise<boolean> {
    try {
      // Verificar envios na última hora usando activity_logs
      const hourCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM activity_logs
        WHERE resource = 'email' AND details LIKE ${`%${email}%`} AND created_at > datetime('now', '-1 hour')
      ` as any;

      if (hourCount.count >= EMAIL_CONFIG.RATE_LIMIT.MAX_EMAILS_PER_HOUR) {
        return false;
      }

      // Verificar envios no último dia usando activity_logs
      const dayCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM activity_logs
        WHERE resource = 'email' AND details LIKE ${`%${email}%`} AND created_at > datetime('now', '-24 hours')
      ` as any;

      return dayCount.count < EMAIL_CONFIG.RATE_LIMIT.MAX_EMAILS_PER_DAY;

    } catch (error) {
      console.error('Erro ao verificar rate limit:', error);
      return true; // Em caso de erro, permitir envio
    }
  }

  /**
   * Registrar atividade de e-mail
   */
  private static async logEmailActivity(activity: {
    to: string;
    subject: string;
    template?: string;
    status: 'sent' | 'failed' | 'queued';
    message_id?: string;
    error?: string;
    details?: string;
  }): Promise<void> {
    try {
      // Usar activity_logs para registrar email
      await prisma.activityLog.create({
        data: {
          action: `email_${activity.status}`,
          resource: 'email',
          details: JSON.stringify({
            to: activity.to,
            subject: activity.subject,
            template: activity.template,
            messageId: activity.message_id,
            error: activity.error,
            additionalDetails: activity.details
          }),
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao registrar log de e-mail:', error);
    }
  }

  /**
   * Processar fila de e-mails
   */
  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.emailQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.emailQueue.length > 0) {
      const emailOptions = this.emailQueue.shift();
      if (emailOptions) {
        await this.sendEmail(emailOptions);
        // Delay entre envios para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.isProcessing = false;
  }
}

export default EmailService;