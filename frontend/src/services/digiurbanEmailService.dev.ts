// ====================================================================
// 📧 DIGIURBAN EMAIL SERVICE - VERSÃO DESENVOLVIMENTO (SEM SMTP REAL)
// ====================================================================

// Esta versão simula envio de emails para desenvolvimento/testes
// Os emails são logados no console e salvos em localStorage

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailLogEntry {
  id: string;
  recipient: string;
  subject: string;
  template_type: string;
  status: 'sent' | 'failed';
  sent_at: string;
  html_content: string;
  metadata?: any;
}

// ====================================================================
// CLASSE DO SERVIÇO DE EMAIL PARA DESENVOLVIMENTO
// ====================================================================

class DigiUrbanEmailServiceDev {
  private emailsLog: EmailLogEntry[] = [];
  private storageKey = 'digiurban_email_logs_dev';

  constructor() {
    this.loadExistingLogs();
    console.log('📧 DigiUrban Email Service (DEV MODE) inicializado');
  }

  private loadExistingLogs() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.emailsLog = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar logs existentes:', error);
      this.emailsLog = [];
    }
  }

  private saveLog(emailLog: EmailLogEntry) {
    this.emailsLog.push(emailLog);
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.emailsLog, null, 2));
    } catch (error) {
      console.error('❌ Erro ao salvar log:', error);
    }
  }

  // ====================================================================
  // MÉTODOS PÚBLICOS DE ENVIO (SIMULADO)
  // ====================================================================

  public async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const messageId = `dev-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('\n📧 ============================================');
      console.log('🚀 EMAIL SIMULADO ENVIADO - DigiUrban Dev Mode');
      console.log('============================================');
      console.log(`📬 Para: ${emailData.to}`);
      console.log(`📋 Assunto: ${emailData.subject}`);
      console.log(`🆔 Message ID: ${messageId}`);
      console.log(`⏰ Timestamp: ${new Date().toLocaleString('pt-BR')}`);
      console.log('--------------------------------------------');
      console.log('📝 Conteúdo HTML:');
      console.log(emailData.html);
      console.log('============================================\n');

      // Salvar log local
      const emailLog: EmailLogEntry = {
        id: messageId,
        recipient: emailData.to,
        subject: emailData.subject,
        template_type: 'generic',
        status: 'sent',
        sent_at: new Date().toISOString(),
        html_content: emailData.html,
        metadata: {
          dev_mode: true,
          timestamp: Date.now()
        }
      };

      this.saveLog(emailLog);

      return {
        success: true,
        messageId
      };

    } catch (error: Error | unknown) {
      console.error('❌ Erro ao simular envio de email:', error);
      
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
      loginUrl: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/auth/login`
    });

    return await this.sendEmail({
      to: email,
      subject: `🎉 Bem-vindo ao DigiUrban - ${tenantName}`,
      html
    });
  }

  public async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generatePasswordResetTemplate({
      email,
      resetToken,
      userName,
      resetUrl: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/auth/reset-password?token=${resetToken}`
    });

    return await this.sendEmail({
      to: email,
      subject: '🔐 DigiUrban - Recuperação de Senha',
      html
    });
  }

  public async sendPaymentNotification(email: string, amount: number, dueDate: string, tenantName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generatePaymentNotificationTemplate({
      amount,
      dueDate,
      tenantName,
      paymentUrl: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/billing/payment`
    });

    return await this.sendEmail({
      to: email,
      subject: `💳 DigiUrban - Aviso de Cobrança - ${tenantName}`,
      html
    });
  }

  public async sendSystemNotification(email: string, title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generateSystemNotificationTemplate({
      title,
      message,
      priority,
      dashboardUrl: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/admin/dashboard`
    });

    return await this.sendEmail({
      to: email,
      subject: `📢 DigiUrban - ${title}`,
      html
    });
  }

  // ====================================================================
  // TEMPLATES DE EMAIL (IGUAIS AO SERVIÇO DE PRODUÇÃO)
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
          .dev-badge { background: #e74c3c; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20px;">
          <span class="dev-badge">🧪 MODO DESENVOLVIMENTO - EMAIL SIMULADO</span>
        </div>
        
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
          <p><strong>🧪 Modo Desenvolvimento:</strong> Este email não foi enviado realmente, apenas simulado.</p>
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
          .dev-badge { background: #e74c3c; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20px;">
          <span class="dev-badge">🧪 MODO DESENVOLVIMENTO - EMAIL SIMULADO</span>
        </div>
        
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
        </div>
        
        <div class="footer">
          <p><strong>🧪 Modo Desenvolvimento:</strong> Este email não foi enviado realmente, apenas simulado.</p>
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
          .dev-badge { background: #e74c3c; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20px;">
          <span class="dev-badge">🧪 MODO DESENVOLVIMENTO - EMAIL SIMULADO</span>
        </div>
        
        <div class="header">
          <h1>💳 DigiUrban</h1>
          <h2>Aviso de Cobrança</h2>
        </div>
        
        <div class="content">
          <p>Prezada <strong>${data.tenantName}</strong>,</p>
          
          <div class="amount-box">
            <h3>💰 Valor a Pagar</h3>
            <p style="font-size: 24px; font-weight: bold; color: #f39c12;">
              ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.amount)}
            </p>
            <p><strong>Vencimento:</strong> ${new Date(data.dueDate).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>🧪 Modo Desenvolvimento:</strong> Este email não foi enviado realmente, apenas simulado.</p>
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
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .dev-badge { background: #e74c3c; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20px;">
          <span class="dev-badge">🧪 MODO DESENVOLVIMENTO - EMAIL SIMULADO</span>
        </div>
        
        <div class="header">
          <h1>${priorityEmojis[data.priority]} DigiUrban</h1>
          <h2>Notificação do Sistema</h2>
        </div>
        
        <div class="content">
          <h3>${data.title}</h3>
          <div class="message-box">
            <p>${data.message}</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>🧪 Modo Desenvolvimento:</strong> Este email não foi enviado realmente, apenas simulado.</p>
        </div>
      </body>
      </html>
    `;
  }

  // ====================================================================
  // MÉTODOS ADMINISTRATIVOS
  // ====================================================================

  public async getEmailStats(): Promise<any> {
    const stats = {
      total: this.emailsLog.length,
      sent: this.emailsLog.filter(log => log.status === 'sent').length,
      failed: this.emailsLog.filter(log => log.status === 'failed').length,
      pending: 0,
      dev_mode: true
    };

    return stats;
  }

  public getEmailLogs(): EmailLogEntry[] {
    return this.emailsLog;
  }

  public clearLogs(): void {
    this.emailsLog = [];
    try {
      localStorage.setItem(this.storageKey, JSON.stringify([], null, 2));
      console.log('🧹 Logs de email limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar logs:', error);
    }
  }
}

// ====================================================================
// EXPORTAR INSTÂNCIA SINGLETON
// ====================================================================

export const digiUrbanEmailService = new DigiUrbanEmailServiceDev();
export default digiUrbanEmailService;