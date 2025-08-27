// ====================================================================
// 📧 DIGIURBAN EMAIL SERVICE - SERVIDOR DE EMAIL PRÓPRIO
// ====================================================================

import nodemailer from 'nodemailer';
import { supabase } from "@/lib/supabase";

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface EmailLogEntry {
  id?: string;
  recipient: string;
  subject: string;
  template_type: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sent_at?: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

// ====================================================================
// CONFIGURAÇÕES DO SERVIDOR SMTP INTERNO
// ====================================================================

const SMTP_CONFIG = {
  // Configuração para servidor SMTP próprio local
  host: 'localhost', // Pode ser alterado para IP do servidor
  port: 587,
  secure: false, // true para 465, false para outros ports
  auth: {
    user: 'noreply@digiurban.local',
    pass: 'DigiUrban2025!@#$' // Senha segura para o servidor
  },
  // Configurações adicionais
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  tls: {
    rejectUnauthorized: false // Para servidor local/desenvolvimento
  }
};

// Configuração alternativa para usar Gmail/Outlook como backup
const BACKUP_SMTP_CONFIG = {
  service: 'gmail', // ou 'outlook'
  auth: {
    user: import.meta.env.VITE_BACKUP_EMAIL_USER || '',
    pass: import.meta.env.VITE_BACKUP_EMAIL_PASS || ''
  }
};

// ====================================================================
// CLASSE DO SERVIÇO DE EMAIL
// ====================================================================

class DigiUrbanEmailService {
  private transporter: nodemailer.Transporter;
  private backupTransporter: nodemailer.Transporter;
  private isMainServerAvailable: boolean = true;

  constructor() {
    this.initializeTransporters();
  }

  private initializeTransporters() {
    try {
      // Transportador principal (servidor próprio)
      this.transporter = nodemailer.createTransporter(SMTP_CONFIG);
      
      // Transportador de backup (Gmail/Outlook)
      this.backupTransporter = nodemailer.createTransporter(BACKUP_SMTP_CONFIG);
      
      console.log('📧 DigiUrban Email Service inicializado');
      this.verifyConnection();
    } catch (error) {
      console.error('❌ Erro ao inicializar Email Service:', error);
    }
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Servidor SMTP principal conectado');
      this.isMainServerAvailable = true;
    } catch (error) {
      console.warn('⚠️ Servidor SMTP principal indisponível, usando backup');
      this.isMainServerAvailable = false;
      
      try {
        await this.backupTransporter.verify();
        console.log('✅ Servidor SMTP de backup conectado');
      } catch (backupError) {
        console.error('❌ Ambos servidores SMTP indisponíveis');
      }
    }
  }

  // ====================================================================
  // MÉTODOS PÚBLICOS DE ENVIO
  // ====================================================================

  public async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log(`📬 Enviando email para: ${emailData.to}`);
      
      // Log do email antes de enviar
      await this.logEmail({
        recipient: emailData.to,
        subject: emailData.subject,
        template_type: 'generic',
        status: 'pending',
        created_at: new Date().toISOString()
      });

      const mailOptions = {
        from: '"DigiUrban Sistema" <noreply@digiurban.local>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || this.stripHtml(emailData.html),
        attachments: emailData.attachments || []
      };

      let result;
      
      // Tentar servidor principal primeiro
      if (this.isMainServerAvailable) {
        try {
          result = await this.transporter.sendMail(mailOptions);
          console.log('✅ Email enviado via servidor principal:', result.messageId);
        } catch (error) {
          console.warn('⚠️ Falha no servidor principal, tentando backup...');
          this.isMainServerAvailable = false;
          throw error;
        }
      }
      
      // Se servidor principal falhou, usar backup
      if (!this.isMainServerAvailable) {
        mailOptions.from = '"DigiUrban Sistema" <noreply@gmail.com>';
        result = await this.backupTransporter.sendMail(mailOptions);
        console.log('✅ Email enviado via servidor backup:', result.messageId);
      }

      // Atualizar log com sucesso
      await this.updateEmailLog(emailData.to, emailData.subject, {
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { messageId: result.messageId }
      });

      return { 
        success: true, 
        messageId: result.messageId 
      };

    } catch (error: Error | unknown) {
      console.error('❌ Erro ao enviar email:', error);
      
      // Atualizar log com erro
      await this.updateEmailLog(emailData.to, emailData.subject, {
        status: 'failed',
        error_message: error.message
      });

      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // ====================================================================
  // MÉTODOS ESPECÍFICOS PARA TIPOS DE EMAIL
  // ====================================================================

  public async sendWelcomeEmail(email: string, password: string, tenantName: string, userName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generateWelcomeEmailTemplate({
      email,
      password,
      tenantName,
      userName,
      loginUrl: `${window.location.origin}/auth/login`
    });

    return await this.sendEmail({
      to: email,
      subject: `Bem-vindo ao DigiUrban - ${tenantName}`,
      html
    });
  }

  public async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generatePasswordResetTemplate({
      email,
      resetToken,
      userName,
      resetUrl: `${window.location.origin}/auth/reset-password?token=${resetToken}`
    });

    return await this.sendEmail({
      to: email,
      subject: 'DigiUrban - Recuperação de Senha',
      html
    });
  }

  public async sendPaymentNotification(email: string, amount: number, dueDate: string, tenantName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generatePaymentNotificationTemplate({
      amount,
      dueDate,
      tenantName,
      paymentUrl: `${window.location.origin}/billing/payment`
    });

    return await this.sendEmail({
      to: email,
      subject: `DigiUrban - Aviso de Cobrança - ${tenantName}`,
      html
    });
  }

  public async sendSystemNotification(email: string, title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generateSystemNotificationTemplate({
      title,
      message,
      priority,
      dashboardUrl: `${window.location.origin}/admin/dashboard`
    });

    return await this.sendEmail({
      to: email,
      subject: `DigiUrban - ${title}`,
      html
    });
  }

  // ====================================================================
  // TEMPLATES DE EMAIL
  // ====================================================================

  private generateWelcomeEmailTemplate(data: {
    email: string;
    password: string;
    tenantName: string;
    userName: string;
    loginUrl: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bem-vindo ao DigiUrban</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏛️ DigiUrban</h1>
          <h2>Bem-vindo ao Sistema!</h2>
        </div>
        
        <div class="content">
          <p>Olá <strong>${data.userName}</strong>,</p>
          
          <p>Sua conta foi criada com sucesso no sistema DigiUrban para <strong>${data.tenantName}</strong>.</p>
          
          <div class="credentials">
            <h3>🔑 Suas Credenciais de Acesso</h3>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Senha Temporária:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 3px; font-weight: bold;">${data.password}</code></p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Esta senha é temporária e deve ser alterada no primeiro acesso</li>
              <li>A senha expira em 24 horas</li>
              <li>Mantenha suas credenciais seguras</li>
            </ul>
          </div>
          
          <p style="text-align: center;">
            <a href="${data.loginUrl}" class="button">🚀 Acessar Sistema</a>
          </p>
          
          <h3>📋 Próximos Passos</h3>
          <ol>
            <li>Clique no botão acima ou acesse: <a href="${data.loginUrl}">${data.loginUrl}</a></li>
            <li>Faça login com suas credenciais</li>
            <li>Altere sua senha temporária</li>
            <li>Complete seu perfil</li>
            <li>Explore as funcionalidades do sistema</li>
          </ol>
        </div>
        
        <div class="footer">
          <p>Este email foi enviado automaticamente pelo sistema DigiUrban.</p>
          <p>Se você não solicitou este cadastro, ignore este email.</p>
          <hr>
          <p><small>DigiUrban - Sistema de Gestão Municipal<br>
          © 2025 Todos os direitos reservados</small></p>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetTemplate(data: {
    email: string;
    resetToken: string;
    userName: string;
    resetUrl: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recuperação de Senha - DigiUrban</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .token-box { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #e74c3c; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 DigiUrban</h1>
          <h2>Recuperação de Senha</h2>
        </div>
        
        <div class="content">
          <p>Olá <strong>${data.userName}</strong>,</p>
          
          <p>Recebemos uma solicitação para redefinir a senha da sua conta (<strong>${data.email}</strong>).</p>
          
          <div class="warning">
            <strong>⚠️ Atenção:</strong> Este link expira em 1 hora por segurança.
          </div>
          
          <p style="text-align: center;">
            <a href="${data.resetUrl}" class="button">🔑 Redefinir Senha</a>
          </p>
          
          <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
          <div class="token-box">
            <code style="word-break: break-all;">${data.resetUrl}</code>
          </div>
          
          <p><strong>Se você não solicitou esta recuperação:</strong></p>
          <ul>
            <li>Ignore este email</li>
            <li>Sua senha atual permanece ativa</li>
            <li>Considere revisar a segurança da sua conta</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Este email foi enviado automaticamente pelo sistema DigiUrban.</p>
          <hr>
          <p><small>DigiUrban - Sistema de Gestão Municipal<br>
          © 2025 Todos os direitos reservados</small></p>
        </div>
      </body>
      </html>
    `;
  }

  private generatePaymentNotificationTemplate(data: {
    amount: number;
    dueDate: string;
    tenantName: string;
    paymentUrl: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Aviso de Cobrança - DigiUrban</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount-box { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #f39c12; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #f39c12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💳 DigiUrban</h1>
          <h2>Aviso de Cobrança</h2>
        </div>
        
        <div class="content">
          <p>Prezada <strong>${data.tenantName}</strong>,</p>
          
          <p>Este é um lembrete sobre o pagamento da sua assinatura do sistema DigiUrban.</p>
          
          <div class="amount-box">
            <h3>💰 Valor a Pagar</h3>
            <p style="font-size: 24px; font-weight: bold; color: #f39c12;">
              ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.amount)}
            </p>
            <p><strong>Vencimento:</strong> ${new Date(data.dueDate).toLocaleDateString('pt-BR')}</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${data.paymentUrl}" class="button">💳 Efetuar Pagamento</a>
          </p>
          
          <h3>📋 Informações Importantes</h3>
          <ul>
            <li>O pagamento pode ser realizado via PIX, cartão ou boleto</li>
            <li>Em caso de atraso, o sistema pode ser suspenso</li>
            <li>Dúvidas? Entre em contato pelo suporte</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Este email foi enviado automaticamente pelo sistema DigiUrban.</p>
          <hr>
          <p><small>DigiUrban - Sistema de Gestão Municipal<br>
          © 2025 Todos os direitos reservados</small></p>
        </div>
      </body>
      </html>
    `;
  }

  private generateSystemNotificationTemplate(data: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    dashboardUrl: string;
  }): string {
    const priorityColors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#dc3545'
    };

    const priorityEmojis = {
      low: '💚',
      medium: '⚠️',
      high: '🚨'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Notificação do Sistema - DigiUrban</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${priorityColors[data.priority]}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid ${priorityColors[data.priority]}; margin: 20px 0; }
          .button { display: inline-block; background: ${priorityColors[data.priority]}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${priorityEmojis[data.priority]} DigiUrban</h1>
          <h2>Notificação do Sistema</h2>
        </div>
        
        <div class="content">
          <h3>${data.title}</h3>
          
          <div class="message-box">
            <p>${data.message}</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${data.dashboardUrl}" class="button">🏛️ Acessar Dashboard</a>
          </p>
        </div>
        
        <div class="footer">
          <p>Este email foi enviado automaticamente pelo sistema DigiUrban.</p>
          <hr>
          <p><small>DigiUrban - Sistema de Gestão Municipal<br>
          © 2025 Todos os direitos reservados</small></p>
        </div>
      </body>
      </html>
    `;
  }

  // ====================================================================
  // MÉTODOS DE LOG E UTILITÁRIOS
  // ====================================================================

  private async logEmail(emailLog: EmailLogEntry): Promise<void> {
    try {
      await supabase
        .from('email_logs')
        .insert([emailLog]);
    } catch (error) {
      console.error('❌ Erro ao salvar log de email:', error);
    }
  }

  private async updateEmailLog(recipient: string, subject: string, updates: Partial<EmailLogEntry>): Promise<void> {
    try {
      await supabase
        .from('email_logs')
        .update(updates)
        .eq('recipient', recipient)
        .eq('subject', subject)
        .order('created_at', { ascending: false })
        .limit(1);
    } catch (error) {
      console.error('❌ Erro ao atualizar log de email:', error);
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  // ====================================================================
  // MÉTODOS ADMINISTRATIVOS
  // ====================================================================

  public async getEmailStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('status')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        sent: data?.filter(log => log.status === 'sent').length || 0,
        failed: data?.filter(log => log.status === 'failed').length || 0,
        pending: data?.filter(log => log.status === 'pending').length || 0
      };

      return stats;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de email:', error);
      return { total: 0, sent: 0, failed: 0, pending: 0 };
    }
  }
}

// ====================================================================
// EXPORTAR INSTÂNCIA SINGLETON
// ====================================================================

export const digiUrbanEmailService = new DigiUrbanEmailService();
export default digiUrbanEmailService;