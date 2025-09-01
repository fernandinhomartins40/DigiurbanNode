// ====================================================================
// 📧 EMAIL SERVICE CONFIGURATION - DIGIURBAN EMAIL SYSTEM
// ====================================================================
// Configuração para envio de e-mails transacionais usando Resend
// ====================================================================

export const EMAIL_CONFIG = {
  // Configurações do Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  
  // Configurações de remetente
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@digiurban.com.br',
  FROM_NAME: process.env.FROM_NAME || 'DigiUrban',
  
  // URLs da aplicação
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:5000',
  
  // Configurações de templates
  TEMPLATES: {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password_reset',
    EMAIL_VERIFICATION: 'email_verification',
    ACCOUNT_LOCKED: 'account_locked',
    NEW_LOGIN: 'new_login'
  },
  
  // Configurações de retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  
  // Rate limiting para emails
  RATE_LIMIT: {
    MAX_EMAILS_PER_HOUR: 100,
    MAX_EMAILS_PER_DAY: 1000
  }
} as const;

export const EMAIL_MESSAGES = {
  SUCCESS: {
    EMAIL_SENT: 'E-mail enviado com sucesso',
    EMAIL_QUEUED: 'E-mail adicionado à fila de envio'
  },
  ERROR: {
    INVALID_EMAIL: 'Endereço de e-mail inválido',
    SEND_FAILED: 'Falha no envio do e-mail',
    TEMPLATE_NOT_FOUND: 'Template de e-mail não encontrado',
    MISSING_CONFIGURATION: 'Configuração de e-mail incompleta',
    RATE_LIMIT_EXCEEDED: 'Limite de envio de e-mails excedido'
  }
} as const;