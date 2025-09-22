// ====================================================================
// 📧 ADMIN EMAIL SERVICE - FASE 2 IMPLEMENTATION
// ====================================================================
// Serviço para comunicação com as APIs administrativas de email
// Conecta com as APIs complementares implementadas na Fase 2
// ====================================================================

import { SimpleTokenManager } from '../lib/tokenRotation-simple';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ====================================================================
// INTERFACES PARA EMAIL ADMIN
// ====================================================================

export interface EmailServerStats {
  server: {
    isRunning: boolean;
    ports: {
      mx: number;
      submission: number;
    };
    version: string;
    startedAt: Date;
    uptime: number;
  };
  statistics: {
    domains: {
      total: number;
      active: number;
      inactive: number;
    };
    users: {
      total: number;
      active: number;
      inactive: number;
    };
    emails: {
      sentToday: number;
      failedToday: number;
      successRate: string;
    };
  };
  hourlyStats: Array<{
    hour: string;
    sent: number;
    failed: number;
    total: number;
  }>;
  performance: {
    systemLoad: number;
    memoryUsage: number;
    systemUptime: number;
    processUptime: number;
  };
  generatedAt: string;
}

export interface DomainVerification {
  domain: {
    id: number;
    name: string;
    isActive: boolean;
    verificationScore: number;
    lastVerified: string;
  };
  verification: {
    dns: {
      status: string;
      records: Array<{
        type: string;
        value: string;
        priority?: number;
      }>;
    };
    mx: {
      status: string;
      records: string[];
      message: string;
    };
    spf: {
      status: string;
      record: string | null;
      message: string;
    };
    dkim: {
      status: string;
      keys: Array<{
        selector: string;
        publicKey: string;
        status: string;
      }>;
      message: string;
    };
    dmarc: {
      status: string;
      policy: string | null;
      message: string;
    };
  };
  recommendations: string[];
  verifiedAt: string;
}

export interface DkimKeyGeneration {
  dkimKey: {
    id: number;
    selector: string;
    keySize: number;
    createdAt: Date;
  };
  dnsRecord: {
    name: string;
    type: string;
    value: string;
    fullRecord: string;
  };
  instructions: string[];
  generatedAt: string;
}

export interface EmailLog {
  id: number;
  fromEmail: string;
  toEmail: string;
  subject: string;
  status: string;
  domain: string;
  messageId: string | null;
  errorMessage: string | null;
  sentAt: Date | null;
  createdAt: Date;
  metadata: any;
}

export interface EmailLogsResponse {
  logs: EmailLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  statistics: {
    sent: number;
    failed: number;
    pending: number;
    bounced: number;
    total: number;
  };
  generatedAt: string;
}

export interface SmtpConnection {
  id: string;
  clientIP: string;
  userEmail: string;
  connectedAt: Date;
  status: string;
  protocol: string;
  port: number;
  encryption: string;
  messagesSent: number;
  lastActivity: Date;
}

export interface SmtpConnectionsResponse {
  server: {
    isRunning: boolean;
    version: string;
    uptime: number;
  };
  connections: {
    active: SmtpConnection[];
    statistics: {
      current: {
        total: number;
        authenticated: number;
        idle: number;
        maxConcurrent: number;
      };
      today: {
        totalConnections: number;
        successfulAuth: number;
        failedAuth: number;
        averageSessionTime: number;
        totalMessagesSent: number;
      };
      security: {
        blockedIPs: string[];
        suspiciousActivity: number;
        rateLimitHits: number;
        authFailures: number;
      };
    };
    performance: {
      avgResponseTime: number;
      throughput: number;
      serverLoad: number;
      memoryUsage: number;
    };
  };
  generatedAt: string;
}

// ====================================================================
// CLASSE DO SERVIÇO
// ====================================================================

class AdminEmailService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Headers com autenticação
  private getHeaders(): HeadersInit {
    const tokenManager = SimpleTokenManager.getInstance();
    const token = tokenManager.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Função auxiliar para fazer requests
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro de rede' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ====================================================================
  // MÉTODOS DE EMAIL ADMIN
  // ====================================================================

  /**
   * Obter estatísticas do servidor de email
   */
  async getServerStats(): Promise<EmailServerStats> {
    return this.makeRequest<EmailServerStats>('/api/admin/email/server-stats');
  }

  /**
   * Verificar configuração de domínio
   */
  async verifyDomain(domainId: number): Promise<DomainVerification> {
    return this.makeRequest<DomainVerification>(`/api/admin/email/domains/verify/${domainId}`);
  }

  /**
   * Gerar chaves DKIM para domínio
   */
  async generateDkimKeys(domainId: number, selector: string = 'default', keySize: number = 2048): Promise<DkimKeyGeneration> {
    return this.makeRequest<DkimKeyGeneration>(`/api/admin/email/domains/${domainId}/dkim`, {
      method: 'POST',
      body: JSON.stringify({ selector, keySize })
    });
  }

  /**
   * Obter logs de email
   */
  async getEmailLogs(options: {
    status?: string;
    domain?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<EmailLogsResponse> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return this.makeRequest<EmailLogsResponse>(`/api/admin/email/logs?${params.toString()}`);
  }

  /**
   * Obter conexões SMTP ativas
   */
  async getSmtpConnections(): Promise<SmtpConnectionsResponse> {
    return this.makeRequest<SmtpConnectionsResponse>('/api/admin/email/connections');
  }

  // ====================================================================
  // MÉTODOS AUXILIARES
  // ====================================================================

  /**
   * Processar estatísticas para formato do componente
   */
  processServerStatsForComponent(stats: EmailServerStats) {
    return {
      serverStatus: {
        isRunning: stats.server.isRunning,
        version: stats.server.version,
        uptime: this.formatUptime(stats.server.uptime)
      },
      kpis: [
        {
          title: 'Emails Enviados Hoje',
          value: stats.statistics.emails.sentToday,
          trend: '+12%'
        },
        {
          title: 'Taxa de Sucesso',
          value: `${stats.statistics.emails.successRate}%`,
          trend: '+2.3%'
        },
        {
          title: 'Domínios Ativos',
          value: stats.statistics.domains.active,
          trend: `${stats.statistics.domains.total} total`
        },
        {
          title: 'Usuários SMTP',
          value: stats.statistics.users.active,
          trend: `${stats.statistics.users.total} total`
        }
      ],
      chartData: stats.hourlyStats.map(hour => ({
        time: new Date(hour.hour).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        sent: hour.sent,
        failed: hour.failed,
        total: hour.total
      }))
    };
  }

  /**
   * Processar logs para formato do componente
   */
  processLogsForComponent(logsResponse: EmailLogsResponse) {
    return {
      logs: logsResponse.logs.map(log => ({
        id: log.id,
        from: log.fromEmail,
        to: log.toEmail,
        subject: log.subject,
        status: log.status,
        domain: log.domain,
        timestamp: new Date(log.createdAt).toLocaleString('pt-BR'),
        error: log.errorMessage
      })),
      stats: logsResponse.statistics,
      pagination: logsResponse.pagination
    };
  }

  /**
   * Processar conexões para formato do componente
   */
  processConnectionsForComponent(connectionsResponse: SmtpConnectionsResponse) {
    return {
      activeConnections: connectionsResponse.connections.active.map(conn => ({
        id: conn.id,
        client: conn.clientIP,
        user: conn.userEmail,
        protocol: `${conn.protocol}:${conn.port}`,
        encryption: conn.encryption,
        status: conn.status,
        duration: this.formatDuration(new Date().getTime() - new Date(conn.connectedAt).getTime()),
        messagesSent: conn.messagesSent
      })),
      statistics: connectionsResponse.connections.statistics,
      performance: connectionsResponse.connections.performance
    };
  }

  /**
   * Formatar tempo de uptime
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Formatar duração de conexão
   */
  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Formatar bytes para formato legível
   */
  formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// ====================================================================
// INSTÂNCIA SINGLETON DO SERVIÇO
// ====================================================================

export const adminEmailService = new AdminEmailService();
export default adminEmailService;