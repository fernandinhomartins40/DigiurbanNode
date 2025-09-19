// ====================================================================
// 📧 ULTRAZEN SMTP SERVER - INTEGRADO COM DIGIURBAN
// ====================================================================
// Servidor SMTP completo integrado ao sistema DigiUrban
// Migrado de Knex para Prisma - Suporte a MX e Submission
// ====================================================================

import { SMTPServer } from 'smtp-server';
import { createTransport } from 'nodemailer';
import { PrismaClient } from '../database/generated/client/index.js';
import { EmailDatabaseService, EmailDirection, EmailStatus, SmtpServerType, ConnectionStatus } from './EmailDatabaseService.js';
import { logger } from '../config/logger.js';
import crypto from 'crypto';
import dns from 'dns';

export class UltraZendSMTPServer {
  private prisma: PrismaClient;
  private dbService: EmailDatabaseService;
  private mxServer?: SMTPServer;
  private submissionServer?: SMTPServer;
  private isRunning = false;

  // Configurações do servidor
  private config = {
    mx: {
      port: parseInt(process.env.SMTP_MX_PORT || '25'),
      host: process.env.SMTP_HOST || '0.0.0.0'
    },
    submission: {
      port: parseInt(process.env.SMTP_SUBMISSION_PORT || '587'),
      host: process.env.SMTP_HOST || '0.0.0.0'
    },
    auth: {
      required: process.env.SMTP_AUTH_REQUIRED === 'true'
    },
    tls: {
      cert: process.env.SMTP_TLS_CERT,
      key: process.env.SMTP_TLS_KEY
    }
  };

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.dbService = new EmailDatabaseService(prisma);
  }

  /**
   * Inicializar servidores SMTP
   */
  async start(): Promise<void> {
    try {
      logger.info('🚀 Iniciando UltraZend SMTP Server...');

      // Criar servidor MX (recebimento de emails externos)
      this.mxServer = new SMTPServer({
        name: process.env.SMTP_HOSTNAME || 'mail.digiurban.local',
        banner: 'UltraZend SMTP Server - DigiUrban Integration',

        // Autenticação não obrigatória para MX
        authOptional: true,

        // Callback de autenticação
        onAuth: this.handleAuth.bind(this),

        // Callback de conexão
        onConnect: this.handleConnect.bind(this),

        // Callback de validação de destinatário
        onRcptTo: this.handleRcptTo.bind(this),

        // Callback de processamento de email
        onData: this.handleData.bind(this),

        // Configurações TLS
        secure: false,
        ...(this.config.tls.cert && this.config.tls.key && {
          secureConnection: true,
          key: this.config.tls.key,
          cert: this.config.tls.cert
        })
      });

      // Criar servidor Submission (envio autenticado)
      this.submissionServer = new SMTPServer({
        name: process.env.SMTP_HOSTNAME || 'mail.digiurban.local',
        banner: 'UltraZend SMTP Submission - DigiUrban',

        // Autenticação obrigatória para submission
        authRequired: true,

        // Callbacks
        onAuth: this.handleAuth.bind(this),
        onConnect: this.handleConnect.bind(this),
        onRcptTo: this.handleRcptTo.bind(this),
        onData: this.handleData.bind(this),

        // TLS configurações
        secure: false,
        ...(this.config.tls.cert && this.config.tls.key && {
          secureConnection: true,
          key: this.config.tls.key,
          cert: this.config.tls.cert
        })
      });

      // Iniciar servidores
      await this.startMXServer();
      await this.startSubmissionServer();

      this.isRunning = true;
      logger.info('✅ UltraZend SMTP Server iniciado com sucesso');

    } catch (error) {
      logger.error('❌ Erro ao iniciar UltraZend SMTP Server:', error);
      throw error;
    }
  }

  /**
   * Parar servidores SMTP
   */
  async stop(): Promise<void> {
    try {
      logger.info('🛑 Parando UltraZend SMTP Server...');

      if (this.mxServer) {
        this.mxServer.close();
      }

      if (this.submissionServer) {
        this.submissionServer.close();
      }

      this.isRunning = false;
      logger.info('✅ UltraZend SMTP Server parado');

    } catch (error) {
      logger.error('❌ Erro ao parar UltraZend SMTP Server:', error);
    }
  }

  /**
   * Iniciar servidor MX
   */
  private async startMXServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mxServer!.listen(this.config.mx.port, this.config.mx.host, (err) => {
        if (err) {
          reject(err);
        } else {
          logger.info(`📨 Servidor MX rodando na porta ${this.config.mx.port}`);
          resolve();
        }
      });
    });
  }

  /**
   * Iniciar servidor Submission
   */
  private async startSubmissionServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.submissionServer!.listen(this.config.submission.port, this.config.submission.host, (err) => {
        if (err) {
          reject(err);
        } else {
          logger.info(`📤 Servidor Submission rodando na porta ${this.config.submission.port}`);
          resolve();
        }
      });
    });
  }

  // ====================================================================
  // HANDLERS SMTP
  // ====================================================================

  /**
   * Handler de conexão
   */
  private async handleConnect(session: any, callback: Function): Promise<void> {
    try {
      const serverType = session.localPort === this.config.mx.port ?
        SmtpServerType.MX : SmtpServerType.SUBMISSION;

      // Log da conexão
      await this.dbService.logSmtpConnection({
        remoteAddress: session.remoteAddress,
        hostname: session.hostNameAppearsAs,
        serverType,
        status: ConnectionStatus.ACCEPTED
      });

      logger.info(`🔌 Nova conexão SMTP: ${session.remoteAddress} (${serverType})`);
      callback();

    } catch (error) {
      logger.error('❌ Erro no handler de conexão:', error);

      await this.dbService.logSmtpConnection({
        remoteAddress: session.remoteAddress,
        hostname: session.hostNameAppearsAs,
        serverType: session.localPort === this.config.mx.port ?
          SmtpServerType.MX : SmtpServerType.SUBMISSION,
        status: ConnectionStatus.FAILED,
        rejectReason: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      callback(new Error('Erro interno do servidor'));
    }
  }

  /**
   * Handler de autenticação
   */
  private async handleAuth(auth: any, session: any, callback: Function): Promise<void> {
    try {
      const { username, password } = auth;

      // Autenticar usuário SMTP
      const smtpUser = await this.dbService.authenticateSmtpUser(username, password);

      if (smtpUser) {
        // Log de sucesso
        await this.dbService.logAuthAttempt({
          smtpUserId: smtpUser.id,
          username,
          remoteAddress: session.remoteAddress,
          success: true
        });

        logger.info(`✅ Autenticação SMTP bem-sucedida: ${username}`);
        callback(null, { user: smtpUser });
      } else {
        // Log de falha
        await this.dbService.logAuthAttempt({
          username,
          remoteAddress: session.remoteAddress,
          success: false
        });

        logger.warn(`❌ Falha na autenticação SMTP: ${username}`);
        callback(new Error('Credenciais inválidas'));
      }

    } catch (error) {
      logger.error('❌ Erro no handler de autenticação:', error);
      callback(new Error('Erro interno do servidor'));
    }
  }

  /**
   * Handler de validação de destinatário
   */
  private async handleRcptTo(address: any, session: any, callback: Function): Promise<void> {
    try {
      const email = address.address.toLowerCase();
      const domain = email.split('@')[1];

      // Verificar se o domínio está autorizado
      const isDomainAuthorized = await this.dbService.isDomainAuthorized(domain);

      if (isDomainAuthorized) {
        logger.info(`✅ Destinatário aceito: ${email}`);
        callback();
      } else {
        logger.warn(`❌ Domínio não autorizado: ${domain}`);
        callback(new Error('Domínio não autorizado'));
      }

    } catch (error) {
      logger.error('❌ Erro na validação de destinatário:', error);
      callback(new Error('Erro interno do servidor'));
    }
  }

  /**
   * Handler de processamento de email
   */
  private async handleData(stream: any, session: any, callback: Function): Promise<void> {
    try {
      let emailData = '';

      // Coletar dados do email
      stream.on('data', (chunk: Buffer) => {
        emailData += chunk.toString();
      });

      stream.on('end', async () => {
        try {
          // Processar email
          await this.processIncomingEmail(emailData, session);
          logger.info(`📧 Email processado com sucesso de ${session.envelope.mailFrom.address}`);
          callback();

        } catch (error) {
          logger.error('❌ Erro ao processar email:', error);
          callback(error);
        }
      });

      stream.on('error', (error: Error) => {
        logger.error('❌ Erro no stream de dados:', error);
        callback(error);
      });

    } catch (error) {
      logger.error('❌ Erro no handler de dados:', error);
      callback(error);
    }
  }

  // ====================================================================
  // PROCESSAMENTO DE EMAIL
  // ====================================================================

  /**
   * Processar email recebido
   */
  private async processIncomingEmail(emailData: string, session: any): Promise<void> {
    try {
      const messageId = this.extractMessageId(emailData) || crypto.randomUUID();
      const subject = this.extractSubject(emailData) || 'Sem assunto';
      const fromEmail = session.envelope.mailFrom.address;
      const toEmails = session.envelope.rcptTo.map((addr: any) => addr.address);

      // Salvar email para cada destinatário
      for (const toEmail of toEmails) {
        const domain = toEmail.split('@')[1];

        // Obter domínio da base de dados
        const emailDomain = await this.prisma.emailDomain.findUnique({
          where: { domainName: domain }
        });

        await this.dbService.saveEmail({
          messageId: `${messageId}-${toEmail}`,
          fromEmail,
          toEmail,
          subject,
          htmlContent: this.extractHtmlContent(emailData),
          textContent: this.extractTextContent(emailData),
          direction: EmailDirection.INBOUND,
          domainId: emailDomain?.id
        });

        // Marcar como entregue
        await this.dbService.updateEmailStatus(
          `${messageId}-${toEmail}`,
          EmailStatus.DELIVERED
        );
      }

    } catch (error) {
      logger.error('❌ Erro ao processar email recebido:', error);
      throw error;
    }
  }

  // ====================================================================
  // UTILITÁRIOS DE PARSING
  // ====================================================================

  private extractMessageId(emailData: string): string | null {
    const match = emailData.match(/Message-ID:\s*<([^>]+)>/i);
    return match ? match[1] : null;
  }

  private extractSubject(emailData: string): string | null {
    const match = emailData.match(/Subject:\s*(.+)/i);
    return match ? match[1].trim() : null;
  }

  private extractHtmlContent(emailData: string): string | null {
    const htmlMatch = emailData.match(/Content-Type:\s*text\/html[\s\S]*?\r?\n\r?\n([\s\S]*?)(?=\r?\n--|\r?\n\.\r?\n|$)/i);
    return htmlMatch ? htmlMatch[1].trim() : null;
  }

  private extractTextContent(emailData: string): string | null {
    const textMatch = emailData.match(/Content-Type:\s*text\/plain[\s\S]*?\r?\n\r?\n([\s\S]*?)(?=\r?\n--|\r?\n\.\r?\n|$)/i);
    return textMatch ? textMatch[1].trim() : null;
  }

  // ====================================================================
  // STATUS E MONITORAMENTO
  // ====================================================================

  /**
   * Verificar se o servidor está rodando
   */
  isServerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Obter estatísticas do servidor
   */
  async getServerStats() {
    const [totalConnections, todayEmails, activeSmtpUsers] = await Promise.all([
      this.prisma.smtpConnection.count(),
      this.prisma.email.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      this.prisma.smtpUser.count({
        where: { isActive: true }
      })
    ]);

    return {
      isRunning: this.isRunning,
      ports: {
        mx: this.config.mx.port,
        submission: this.config.submission.port
      },
      stats: {
        totalConnections,
        todayEmails,
        activeSmtpUsers
      }
    };
  }
}

// ====================================================================
// SINGLETON INSTANCE
// ====================================================================

let smtpServerInstance: UltraZendSMTPServer | null = null;

export function getUltraZendSMTPServer(prisma: PrismaClient): UltraZendSMTPServer {
  if (!smtpServerInstance) {
    smtpServerInstance = new UltraZendSMTPServer(prisma);
  }
  return smtpServerInstance;
}

export default UltraZendSMTPServer;