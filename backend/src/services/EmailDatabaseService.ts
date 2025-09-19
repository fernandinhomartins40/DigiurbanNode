// ====================================================================
// 📧 EMAIL DATABASE SERVICE - PRISMA MIGRATION
// ====================================================================
// Substitui as queries Knex do UltraZend por Prisma
// Integração completa com sistema DigiUrban
// ====================================================================

import { PrismaClient } from '../database/generated/client/index.js';
import crypto from 'crypto';

// Constants para substituir enums (compatibilidade SQLite)
export const EmailStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  BOUNCED: 'BOUNCED',
  FAILED: 'FAILED'
} as const;

export const EmailDirection = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND'
} as const;

export const SmtpServerType = {
  MX: 'MX',
  SUBMISSION: 'SUBMISSION'
} as const;

export const ConnectionStatus = {
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED'
} as const;

// Tipos derivados das constantes
export type EmailStatusType = typeof EmailStatus[keyof typeof EmailStatus];
export type EmailDirectionType = typeof EmailDirection[keyof typeof EmailDirection];
export type SmtpServerTypeType = typeof SmtpServerType[keyof typeof SmtpServerType];
export type ConnectionStatusType = typeof ConnectionStatus[keyof typeof ConnectionStatus];

export class EmailDatabaseService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ====================================================================
  // SMTP USERS - Substitui queries Knex do UltraZend
  // ====================================================================

  /**
   * Autenticar usuário SMTP (era Knex, agora Prisma)
   */
  async authenticateSmtpUser(email: string, password: string) {
    const user = await this.prisma.smtpUser.findUnique({
      where: { email },
      include: { user: true } // Link com usuário DigiUrban
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Verificar senha (mesmo hash do UltraZend)
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (isValid) {
      // Atualizar último login
      await this.prisma.smtpUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      return user;
    }

    return null;
  }

  /**
   * Criar usuário SMTP vinculado ao DigiUrban
   */
  async createSmtpUser(userData: {
    email: string;
    password: string;
    name: string;
    userId?: string; // Link opcional com usuário DigiUrban
  }) {
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(userData.password, 12);

    return await this.prisma.smtpUser.create({
      data: {
        email: userData.email,
        passwordHash,
        name: userData.name,
        userId: userData.userId,
        isVerified: false,
        isActive: true,
        isAdmin: false
      }
    });
  }

  // ====================================================================
  // EMAIL DOMAINS - Verificação e configuração
  // ====================================================================

  /**
   * Verificar se domínio está autorizado
   */
  async isDomainAuthorized(domain: string): Promise<boolean> {
    const emailDomain = await this.prisma.emailDomain.findUnique({
      where: { domainName: domain }
    });

    return emailDomain?.isVerified || false;
  }

  /**
   * Obter chave DKIM ativa para domínio
   */
  async getDkimKey(domain: string, selector: string = 'default') {
    const emailDomain = await this.prisma.emailDomain.findUnique({
      where: { domainName: domain },
      include: {
        dkimKeys: {
          where: {
            selector,
            isActive: true
          }
        }
      }
    });

    return emailDomain?.dkimKeys[0] || null;
  }

  /**
   * Criar domínio de email
   */
  async createEmailDomain(domainData: {
    domainName: string;
    smtpUserId: number;
    tenantId?: string;
  }) {
    // Gerar token de verificação
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const domain = await this.prisma.emailDomain.create({
      data: {
        domainName: domainData.domainName,
        smtpUserId: domainData.smtpUserId,
        tenantId: domainData.tenantId,
        verificationToken,
        isVerified: false,
        dkimEnabled: true,
        spfEnabled: true
      }
    });

    // Gerar chave DKIM automaticamente
    await this.generateDkimKey(domain.id);

    return domain;
  }

  /**
   * Gerar chave DKIM para domínio
   */
  async generateDkimKey(domainId: number, selector: string = 'default') {
    const crypto = await import('crypto');

    // Gerar par de chaves RSA 2048
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return await this.prisma.dkimKey.create({
      data: {
        domainId,
        selector,
        privateKey,
        publicKey,
        algorithm: 'rsa-sha256',
        canonicalization: 'relaxed/relaxed',
        keySize: 2048,
        isActive: true
      }
    });
  }

  // ====================================================================
  // EMAIL PROCESSING - Envio e recebimento
  // ====================================================================

  /**
   * Salvar email enviado/recebido
   */
  async saveEmail(emailData: {
    messageId: string;
    fromEmail: string;
    toEmail: string;
    subject: string;
    htmlContent?: string;
    textContent?: string;
    direction: EmailDirectionType;
    domainId?: number;
    mxServer?: string;
  }) {
    return await this.prisma.email.create({
      data: {
        messageId: emailData.messageId,
        fromEmail: emailData.fromEmail,
        toEmail: emailData.toEmail,
        subject: emailData.subject,
        htmlContent: emailData.htmlContent,
        textContent: emailData.textContent,
        status: EmailStatus.PENDING,
        direction: emailData.direction,
        domainId: emailData.domainId,
        mxServer: emailData.mxServer,
        attempts: 0
      }
    });
  }

  /**
   * Atualizar status do email
   */
  async updateEmailStatus(
    messageId: string,
    status: EmailStatusType,
    errorMessage?: string
  ) {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === EmailStatus.SENT) {
      updateData.sentAt = new Date();
    } else if (status === EmailStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    } else if (status === EmailStatus.FAILED || status === EmailStatus.BOUNCED) {
      updateData.errorMessage = errorMessage;
    }

    return await this.prisma.email.update({
      where: { messageId },
      data: updateData
    });
  }

  /**
   * Incrementar tentativas de envio
   */
  async incrementEmailAttempts(messageId: string) {
    return await this.prisma.email.update({
      where: { messageId },
      data: {
        attempts: {
          increment: 1
        }
      }
    });
  }

  /**
   * Obter emails pendentes para reenvio
   */
  async getPendingEmails(limit: number = 100) {
    return await this.prisma.email.findMany({
      where: {
        status: {
          in: [EmailStatus.PENDING, EmailStatus.FAILED]
        },
        attempts: {
          lt: 3 // Máximo 3 tentativas
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: limit
    });
  }

  // ====================================================================
  // SMTP CONNECTIONS - Monitoramento
  // ====================================================================

  /**
   * Registrar conexão SMTP
   */
  async logSmtpConnection(connectionData: {
    remoteAddress: string;
    hostname?: string;
    serverType: SmtpServerTypeType;
    status: ConnectionStatusType;
    rejectReason?: string;
  }) {
    return await this.prisma.smtpConnection.create({
      data: connectionData
    });
  }

  /**
   * Registrar tentativa de autenticação
   */
  async logAuthAttempt(authData: {
    smtpUserId?: number;
    username: string;
    remoteAddress: string;
    success: boolean;
  }) {
    return await this.prisma.authAttempt.create({
      data: authData
    });
  }

  // ====================================================================
  // ANALYTICS E RELATÓRIOS
  // ====================================================================

  /**
   * Estatísticas de emails por período
   */
  async getEmailStats(days: number = 30, tenantId?: string) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const whereClause: any = {
      createdAt: {
        gte: since
      }
    };

    // Filtrar por tenant se especificado
    if (tenantId) {
      whereClause.domain = {
        tenantId
      };
    }

    const [
      totalEmails,
      sentEmails,
      deliveredEmails,
      failedEmails,
      bouncedEmails
    ] = await Promise.all([
      this.prisma.email.count({ where: whereClause }),
      this.prisma.email.count({ where: { ...whereClause, status: EmailStatus.SENT } }),
      this.prisma.email.count({ where: { ...whereClause, status: EmailStatus.DELIVERED } }),
      this.prisma.email.count({ where: { ...whereClause, status: EmailStatus.FAILED } }),
      this.prisma.email.count({ where: { ...whereClause, status: EmailStatus.BOUNCED } })
    ]);

    return {
      period: `${days} dias`,
      total: totalEmails,
      sent: sentEmails,
      delivered: deliveredEmails,
      failed: failedEmails,
      bounced: bouncedEmails,
      deliveryRate: totalEmails > 0 ? ((deliveredEmails / totalEmails) * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * Listar domínios por tenant
   */
  async getTenantDomains(tenantId: string) {
    return await this.prisma.emailDomain.findMany({
      where: { tenantId },
      include: {
        smtpUser: {
          select: {
            email: true,
            name: true,
            isActive: true
          }
        },
        dkimKeys: {
          where: { isActive: true }
        },
        _count: {
          select: {
            emails: true
          }
        }
      }
    });
  }

  // ====================================================================
  // CLEANUP E MANUTENÇÃO
  // ====================================================================

  /**
   * Limpar emails antigos
   */
  async cleanupOldEmails(retentionDays: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.email.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        status: {
          in: [EmailStatus.DELIVERED, EmailStatus.BOUNCED]
        }
      }
    });

    return { deleted: result.count };
  }

  /**
   * Limpar tentativas de autenticação antigas
   */
  async cleanupOldAuthAttempts(retentionDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.authAttempt.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    return { deleted: result.count };
  }
}