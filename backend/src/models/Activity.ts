// ====================================================================
// 📊 ACTIVITY MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo para logs de atividade e auditoria
// Sistema completo de rastreamento de ações dos usuários
// Migrado para Knex.js Query Builder
// ====================================================================

import { prisma } from '../database/prisma.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

// ====================================================================
// INTERFACES
// ====================================================================

export interface Activity {
  id: number;
  userId?: string;
  tenantId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface CreateActivityData {
  user_id?: string;
  tenant_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
}

// ====================================================================
// ACTIVITY MODEL
// ====================================================================

export class ActivityModel {
  /**
   * Criar nova atividade
   */
  static async create(activityData: CreateActivityData): Promise<Activity> {
    try {
      const activity = await prisma.activityLog.create({
        data: {
          userId: activityData.user_id || null,
          tenantId: activityData.tenant_id || null,
          action: activityData.action,
          resource: activityData.resource,
          resourceId: activityData.resource_id || null,
          details: activityData.details || null,
          ipAddress: activityData.ip_address || null,
          userAgent: activityData.user_agent || null
        }
      });

      return {
        id: activity.id,
        userId: activity.userId,
        tenantId: activity.tenantId,
        action: activity.action,
        resource: activity.resource,
        resourceId: activity.resourceId,
        details: activity.details,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        createdAt: activity.createdAt.toISOString()
      };
    } catch (error) {
      StructuredLogger.error('Activity creation failed', error, {
        action: 'activity_create',
        resource: activityData.resource
      });
      throw error;
    }
  }

  /**
   * Buscar atividade por ID
   */
  static async findById(id: number): Promise<Activity | null> {
    try {
      const activity = await prisma.activityLog.findUnique({
        where: { id }
      });

      if (!activity) return null;

      return {
        id: activity.id,
        userId: activity.userId,
        tenantId: activity.tenantId,
        action: activity.action,
        resource: activity.resource,
        resourceId: activity.resourceId,
        details: activity.details,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        createdAt: activity.createdAt.toISOString()
      };
    } catch (error) {
      StructuredLogger.error('Activity find by ID failed', error, {
        action: 'activity_find'
      });
      throw error;
    }
  }

  /**
   * Listar atividades com paginação
   */
  static async list(options: {
    userId?: string;
    tenantId?: string;
    action?: string;
    resource?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<Activity[]> {
    try {
      const page = options.page || 1;
      const limit = Math.min(options.limit || 50, 100);
      const skip = (page - 1) * limit;

      const where: any = {};

      if (options.userId) {
        where.userId = options.userId;
      }

      if (options.tenantId) {
        where.tenantId = options.tenantId;
      }

      if (options.action) {
        where.action = options.action;
      }

      if (options.resource) {
        where.resource = options.resource;
      }

      const activities = await prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      });

      return activities.map(activity => ({
        id: activity.id,
        userId: activity.userId,
        tenantId: activity.tenantId,
        action: activity.action,
        resource: activity.resource,
        resourceId: activity.resourceId,
        details: activity.details,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        createdAt: activity.createdAt.toISOString()
      }));
    } catch (error) {
      StructuredLogger.error('Activity list failed', error, {
        action: 'activity_list',
        tenantId: options.tenantId
      });
      throw error;
    }
  }

  /**
   * Contar total de atividades
   */
  static async count(options: {
    userId?: string;
    tenantId?: string;
    action?: string;
    resource?: string;
  } = {}): Promise<number> {
    try {
      const where: any = {};

      if (options.userId) {
        where.userId = options.userId;
      }

      if (options.tenantId) {
        where.tenantId = options.tenantId;
      }

      if (options.action) {
        where.action = options.action;
      }

      if (options.resource) {
        where.resource = options.resource;
      }

      return await prisma.activityLog.count({ where });
    } catch (error) {
      StructuredLogger.error('Activity count failed', error, {
        action: 'activity_count',
        tenantId: options.tenantId
      });
      throw error;
    }
  }

  /**
   * Buscar atividades recentes de um usuário
   */
  static async getRecentByUser(userId: string, limit: number = 10): Promise<Activity[]> {
    try {
      const activities = await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return activities.map(activity => ({
        id: activity.id,
        userId: activity.userId,
        tenantId: activity.tenantId,
        action: activity.action,
        resource: activity.resource,
        resourceId: activity.resourceId,
        details: activity.details,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        createdAt: activity.createdAt.toISOString()
      }));
    } catch (error) {
      StructuredLogger.error('Recent activities by user failed', error, {
        action: 'activity_recent_user',
        userId
      });
      throw error;
    }
  }

  /**
   * Limpar atividades antigas (mais de X dias)
   */
  static async cleanup(daysOld: number = 90): Promise<number> {
    try {
      // Calcular timestamp para X dias atrás
      const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));

      const { count } = await prisma.activityLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      StructuredLogger.info(`Activity cleanup completed`, {
        action: 'activity_cleanup',
        metadata: { deletedRecords: count }
      });

      return count;
    } catch (error) {
      StructuredLogger.error('Activity cleanup failed', error, {
        action: 'activity_cleanup'
      });
      throw error;
    }
  }

  /**
   * Obter atividades por período
   */
  static async getByDateRange(startDate: Date, endDate: Date, options: {
    userId?: string;
    tenantId?: string;
    action?: string;
    resource?: string;
    limit?: number;
  } = {}): Promise<Activity[]> {
    try {
      const limit = Math.min(options.limit || 100, 1000);

      const where: any = {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      };

      if (options.userId) {
        where.userId = options.userId;
      }

      if (options.tenantId) {
        where.tenantId = options.tenantId;
      }

      if (options.action) {
        where.action = options.action;
      }

      if (options.resource) {
        where.resource = options.resource;
      }

      const activities = await prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return activities.map(activity => ({
        id: activity.id,
        userId: activity.userId,
        tenantId: activity.tenantId,
        action: activity.action,
        resource: activity.resource,
        resourceId: activity.resourceId,
        details: activity.details,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        createdAt: activity.createdAt.toISOString()
      }));
    } catch (error) {
      StructuredLogger.error('Activities by date range failed', error, {
        action: 'activity_date_range'
      });
      throw error;
    }
  }

  /**
   * Obter estatísticas de atividades
   */
  static async getStats(options: {
    tenantId?: string;
    days?: number;
  } = {}): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    topActions: Array<{ action: string; count: number }>;
    topResources: Array<{ resource: string; count: number }>;
  }> {
    try {
      const days = options.days || 30;

      // Calcular timestamps
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const baseWhere: any = {};
      if (options.tenantId) {
        baseWhere.tenantId = options.tenantId;
      }

      // Total
      const total = await prisma.activityLog.count({ where: baseWhere });

      // Hoje
      const today = await prisma.activityLog.count({
        where: {
          ...baseWhere,
          createdAt: { gte: todayStart }
        }
      });

      // Esta semana
      const thisWeek = await prisma.activityLog.count({
        where: {
          ...baseWhere,
          createdAt: { gte: weekStart }
        }
      });

      // Este mês
      const thisMonth = await prisma.activityLog.count({
        where: {
          ...baseWhere,
          createdAt: { gte: monthStart }
        }
      });

      // Top actions - usando consulta agregada
      const topActionsRaw = await prisma.activityLog.groupBy({
        by: ['action'],
        where: {
          ...baseWhere,
          createdAt: { gte: monthStart }
        },
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10
      });

      const topActions = topActionsRaw.map(item => ({
        action: item.action,
        count: item._count.action
      }));

      // Top resources - usando consulta agregada
      const topResourcesRaw = await prisma.activityLog.groupBy({
        by: ['resource'],
        where: {
          ...baseWhere,
          createdAt: { gte: monthStart }
        },
        _count: { resource: true },
        orderBy: { _count: { resource: 'desc' } },
        take: 10
      });

      const topResources = topResourcesRaw.map(item => ({
        resource: item.resource,
        count: item._count.resource
      }));

      return {
        total,
        today,
        thisWeek,
        thisMonth,
        topActions,
        topResources
      };
    } catch (error) {
      StructuredLogger.error('Activity stats failed', error, {
        action: 'activity_stats'
      });
      throw error;
    }
  }

  /**
   * Criar atividade (alias para create)
   */
  static async createActivity(activityData: CreateActivityData): Promise<Activity> {
    return this.create(activityData);
  }

  /**
   * Obter atividades (alias para list)
   */
  static async getActivities(options: {
    userId?: string;
    tenantId?: string;
    action?: string;
    resource?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<Activity[]> {
    return this.list(options);
  }

  /**
   * Obter estatísticas do sistema
   */
  static async getSystemStats(): Promise<any> {
    try {
      const stats = await this.getStats();
      
      return {
        totalActivities: stats.total,
        todayActivities: stats.today,
        topActions: stats.topActions,
        topResources: stats.topResources
      };
    } catch (error) {
      StructuredLogger.error('Get system stats failed', error, {
        action: 'system_stats'
      });
      throw error;
    }
  }

  /**
   * Limpeza de atividades antigas (alias para cleanup)
   */
  static async cleanupOldActivities(daysOld: number = 90): Promise<number> {
    return this.cleanup(daysOld);
  }
}

export default ActivityModel;