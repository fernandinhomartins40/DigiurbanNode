// ====================================================================
// 📊 ACTIVITY SERVICE - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Serviço para gerenciamento de logs de atividade e auditoria
// Rastreamento completo de ações dos usuários
// ====================================================================

import { prisma } from "../database/prisma.js";
import { ActivityLog } from '../types/prisma.js';
import { UserModel } from '../models/User.js';
import { ActivityModel } from '../models/Activity.js';
import { LOG_CONFIG } from '../config/auth.js';

// ====================================================================
// INTERFACES
// ====================================================================

export interface CreateActivityData {
  userId?: string;
  tenantId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityFilters {
  userId?: string;
  tenantId?: string;
  action?: string;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityStats {
  totalActivities: number;
  actionBreakdown: Record<string, number>;
  userBreakdown: Record<string, number>;
  resourceBreakdown: Record<string, number>;
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
}

// ====================================================================
// CLASSE ACTIVITY SERVICE
// ====================================================================

export class ActivityService {

  // ================================================================
  // CRIAÇÃO DE LOG
  // ================================================================

  /**
   * Registrar nova atividade no log
   */
  static async log(activityData: CreateActivityData): Promise<ActivityLog> {
    try {
      // Verificar se a ação deve ser logada
      if (!this.shouldLogAction(activityData.action)) {
        console.log(`Ação ${activityData.action} não será logada (configuração)`);
        return {} as ActivityLog;
      }

      // Limpar dados sensíveis
      const cleanedDetails = this.sanitizeDetails(activityData.details);

      // Inserir no banco usando Prisma diretamente
      const activity = await prisma.activityLog.create({
        data: {
          userId: activityData.userId,
          tenantId: activityData.tenantId,
          action: activityData.action,
          resource: activityData.resource,
          resourceId: activityData.resourceId,
          details: cleanedDetails,
          ipAddress: activityData.ipAddress,
          userAgent: activityData.userAgent,
          createdAt: new Date()
        }
      });

      // Retornar a atividade criada
      return activity;

    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
      throw new Error(`Falha ao registrar atividade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // ================================================================
  // CONSULTAS DE LOGS
  // ================================================================

  /**
   * Buscar logs com filtros
   */
  static async findActivities(filters: ActivityFilters = {}): Promise<ActivityLog[]> {
    try {
      let sql = `
        SELECT al.*, u.nome_completo as user_name, t.nome as tenant_name
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN tenants t ON al.tenant_id = t.id
        WHERE 1=1
      `;
      const params: any[] = [];

      // Aplicar filtros
      if (filters.userId) {
        sql += ` AND al.userId = ?`;
        params.push(filters.userId);
      }

      if (filters.tenantId) {
        sql += ` AND al.tenantId = ?`;
        params.push(filters.tenantId);
      }

      if (filters.action) {
        sql += ` AND al.action = ?`;
        params.push(filters.action);
      }

      if (filters.resource) {
        sql += ` AND al.resource = ?`;
        params.push(filters.resource);
      }

      if (filters.dateFrom) {
        sql += ` AND al.createdAt >= ?`;
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        sql += ` AND al.createdAt <= ?`;
        params.push(filters.dateTo);
      }

      // Ordenação
      sql += ` ORDER BY al.createdAt DESC`;

      // Paginação
      if (filters.limit) {
        sql += ` LIMIT ?`;
        params.push(filters.limit);

        if (filters.offset) {
          sql += ` OFFSET ?`;
          params.push(filters.offset);
        }
      }

      return await prisma.$queryRawUnsafe(sql, ...params) as ActivityLog[];

    } catch (error) {
      throw new Error(`Erro ao buscar atividades: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Buscar atividades de um usuário específico
   */
  static async getUserActivities(userId: string, limit: number = 50): Promise<ActivityLog[]> {
    return this.findActivities({ userId, limit });
  }

  /**
   * Buscar atividades de um tenant específico
   */
  static async getTenantActivities(tenantId: string, limit: number = 100): Promise<ActivityLog[]> {
    return this.findActivities({ tenantId, limit });
  }

  /**
   * Buscar atividades recentes
   */
  static async getRecentActivities(limit: number = 50): Promise<ActivityLog[]> {
    return this.findActivities({ limit });
  }

  // ================================================================
  // ESTATÍSTICAS E RELATÓRIOS
  // ================================================================

  /**
   * Gerar estatísticas de atividade
   */
  static async getActivityStats(tenantId?: string, days: number = 30): Promise<ActivityStats> {
    try {
      const baseWhere = tenantId ? 'WHERE tenant_id = ?' : 'WHERE 1=1';
      const params = tenantId ? [tenantId] : [];
      const dateFilter = `AND created_at >= datetime('now', '-${days} days')`;

      // Total de atividades
      const totalResult = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as total FROM activity_logs
        ${baseWhere} ${dateFilter}
      `, ...params) as [{ total: number }];
      const totalCount = Array.isArray(totalResult) ? totalResult[0] : totalResult;

      // Breakdown por ação
      const actionResults = await prisma.$queryRawUnsafe(`
        SELECT action, COUNT(*) as count
        FROM activity_logs
        ${baseWhere} ${dateFilter}
        GROUP BY action
        ORDER BY count DESC
      `, ...params) as Array<{ action: string; count: number }>;

      const actionBreakdown: Record<string, number> = {};
      actionResults.forEach(result => {
        actionBreakdown[result.action] = result.count;
      });

      // Breakdown por usuário (top 10)
      const userResults = await prisma.$queryRawUnsafe(`
        SELECT u.nome_completo as user_name, COUNT(*) as count
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ${baseWhere} ${dateFilter}
        GROUP BY al.user_id, u.nome_completo
        ORDER BY count DESC
        LIMIT 10
      `, ...params) as Array<{ user_name: string; count: number }>;

      const userBreakdown: Record<string, number> = {};
      userResults.forEach(result => {
        userBreakdown[result.user_name || 'Sistema'] = result.count;
      });

      // Breakdown por resource
      const resourceResults = await prisma.$queryRawUnsafe(`
        SELECT resource, COUNT(*) as count
        FROM activity_logs
        ${baseWhere} ${dateFilter}
        GROUP BY resource
        ORDER BY count DESC
      `, ...params) as Array<{ resource: string; count: number }>;

      const resourceBreakdown: Record<string, number> = {};
      resourceResults.forEach(result => {
        resourceBreakdown[result.resource] = result.count;
      });

      // Atividade diária
      const dailyResults = await prisma.$queryRawUnsafe(`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM activity_logs
        ${baseWhere} ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, ...params) as Array<{ date: string; count: number }>;

      return {
        totalActivities: totalCount.total,
        actionBreakdown,
        userBreakdown,
        resourceBreakdown,
        dailyActivity: dailyResults
      };

    } catch (error) {
      throw new Error(`Erro ao gerar estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Obter atividades suspeitas
   */
  static async getSuspiciousActivities(tenantId?: string): Promise<ActivityLog[]> {
    try {
      const suspiciousActions = [
        'login_failed', 
        'multiple_login_attempts', 
        'permission_denied',
        'unauthorized_access',
        'account_locked'
      ];

      let sql = `
        SELECT al.*, u.nome_completo as user_name
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.action IN (${suspiciousActions.map(() => '?').join(', ')})
          AND al.created_at >= datetime('now', '-24 hours')
      `;
      
      const params = [...suspiciousActions];

      if (tenantId) {
        sql += ` AND al.tenant_id = ?`;
        params.push(tenantId);
      }

      sql += ` ORDER BY al.created_at DESC LIMIT 100`;

      return await prisma.$queryRawUnsafe(sql, ...params) as ActivityLog[];

    } catch (error) {
      throw new Error(`Erro ao buscar atividades suspeitas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // ================================================================
  // LIMPEZA E MANUTENÇÃO
  // ================================================================

  /**
   * Limpar logs antigos
   */
  static async cleanupOldLogs(retentionDays: number = 90): Promise<{ deleted: number }> {
    try {
      const result = await prisma.$executeRawUnsafe(`
        DELETE FROM activity_logs
        WHERE created_at < datetime('now', '-${retentionDays} days')
      `);

      console.log(`🧹 Limpeza de logs: ${result} registros removidos (>${retentionDays} dias)`);

      return { deleted: result || 0 };

    } catch (error) {
      throw new Error(`Erro na limpeza de logs: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Arquivar logs antigos (mover para tabela de arquivo)
   */
  static async archiveOldLogs(archiveDays: number = 365): Promise<{ archived: number }> {
    try {
      // Criar tabela de arquivo se não existir
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS activity_logs_archive (
          id INTEGER PRIMARY KEY,
          user_id TEXT,
          tenant_id TEXT,
          action TEXT NOT NULL,
          resource TEXT,
          resource_id TEXT,
          details TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at DATETIME,
          archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Mover logs antigos para arquivo
      const result = await prisma.$executeRawUnsafe(`
        INSERT INTO activity_logs_archive
        SELECT *, CURRENT_TIMESTAMP as archived_at
        FROM activity_logs
        WHERE created_at < datetime('now', '-${archiveDays} days')
      `);

      // Remover da tabela principal
      await prisma.$executeRawUnsafe(`
        DELETE FROM activity_logs
        WHERE created_at < datetime('now', '-${archiveDays} days')
      `);

      console.log(`📦 Arquivamento de logs: ${result} registros arquivados (>${archiveDays} dias)`);

      return { archived: result || 0 };

    } catch (error) {
      throw new Error(`Erro no arquivamento de logs: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // ================================================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ================================================================

  /**
   * Verificar se uma ação deve ser logada
   */
  private static shouldLogAction(action: string): boolean {
    return (LOG_CONFIG.ACTIONS_TO_LOG as unknown as string[]).includes(action) || action.includes('_failed') || action.includes('_error');
  }

  /**
   * Limpar dados sensíveis dos detalhes
   */
  private static sanitizeDetails(details?: string): string | undefined {
    if (!details) return undefined;

    try {
      const parsed = JSON.parse(details);
      
      // Remover campos sensíveis
      LOG_CONFIG.SENSITIVE_FIELDS.forEach(field => {
        if (parsed[field]) {
          parsed[field] = '[REDACTED]';
        }
      });

      return JSON.stringify(parsed);
    } catch {
      // Se não for JSON válido, retornar como está (mas verificar se não contém dados sensíveis)
      let sanitized = details;
      LOG_CONFIG.SENSITIVE_FIELDS.forEach(field => {
        const regex = new RegExp(`"${field}"\\s*:\\s*"[^"]*"`, 'gi');
        sanitized = sanitized.replace(regex, `"${field}": "[REDACTED]"`);
      });
      return sanitized;
    }
  }

  // ================================================================
  // MÉTODOS DE CONVENIÊNCIA
  // ================================================================

  /**
   * Log rápido para login
   */
  static async logLogin(userId: string, tenantId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      tenantId,
      action: 'login',
      resource: 'auth',
      details: JSON.stringify({ method: 'email_password' }),
      ipAddress,
      userAgent
    });
  }

  /**
   * Log rápido para logout
   */
  static async logLogout(userId: string, tenantId?: string): Promise<void> {
    await this.log({
      userId,
      tenantId,
      action: 'logout',
      resource: 'auth'
    });
  }

  /**
   * Log rápido para operações CRUD
   */
  static async logCRUD(
    action: 'create' | 'read' | 'update' | 'delete',
    resource: string,
    resourceId: string,
    userId?: string,
    tenantId?: string,
    details?: any
  ): Promise<void> {
    await this.log({
      userId,
      tenantId,
      action,
      resource,
      resourceId,
      details: details ? JSON.stringify(details) : undefined
    });
  }
}

export default ActivityService;