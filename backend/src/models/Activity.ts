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
  id: string;
  user_id?: string;
  tenant_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
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
      // Usando prisma client diretamente;
      const id = crypto.randomUUID();
      
      await db('activity_logs').insert({
        id,
        user_id: activityData.user_id || null,
        tenant_id: activityData.tenant_id || null,
        action: activityData.action,
        resource: activityData.resource,
        resource_id: activityData.resource_id || null,
        details: activityData.details || null,
        ip_address: activityData.ip_address || null,
        user_agent: activityData.user_agent || null,
        created_at: db.fn.now()
      });

      return await this.findById(id) as Activity;
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
  static async findById(id: string): Promise<Activity | null> {
    try {
      // Usando prisma client diretamente;
      const activity = await db('activity_logs')
        .where('id', id)
        .first() as Activity | undefined;
      
      return activity || null;
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
      // Usando prisma client diretamente;
      const page = options.page || 1;
      const limit = Math.min(options.limit || 50, 100);
      const offset = (page - 1) * limit;

      let query = db('activity_logs').select('*');

      if (options.userId) {
        query = query.where('user_id', options.userId);
      }

      if (options.tenantId) {
        query = query.where('tenant_id', options.tenantId);
      }

      if (options.action) {
        query = query.where('action', options.action);
      }

      if (options.resource) {
        query = query.where('resource', options.resource);
      }

      const activities = await query
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset) as Activity[];

      return activities;
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
      // Usando prisma client diretamente;
      
      let query = db('activity_logs');

      if (options.userId) {
        query = query.where('user_id', options.userId);
      }

      if (options.tenantId) {
        query = query.where('tenant_id', options.tenantId);
      }

      if (options.action) {
        query = query.where('action', options.action);
      }

      if (options.resource) {
        query = query.where('resource', options.resource);
      }

      const result = await query.count('* as total').first() as { total: number };
      return result.total;
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
      // Usando prisma client diretamente;
      
      const activities = await db('activity_logs')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit) as Activity[];
      
      return activities;
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
      // Usando prisma client diretamente;
      
      // Calcular timestamp Unix em milissegundos para X dias atrás
      const cutoffTimestamp = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      
      const result = await db('activity_logs')
        .where('created_at', '<', new Date(cutoffTimestamp))
        .del();
      
      StructuredLogger.info(`Activity cleanup completed`, {
        action: 'activity_cleanup',
        metadata: { deletedRecords: result }
      });

      return result;
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
      // Usando prisma client diretamente;
      const limit = Math.min(options.limit || 100, 1000);

      let query = db('activity_logs')
        .whereBetween('created_at', [startDate, endDate]);

      if (options.userId) {
        query = query.where('user_id', options.userId);
      }

      if (options.tenantId) {
        query = query.where('tenant_id', options.tenantId);
      }

      if (options.action) {
        query = query.where('action', options.action);
      }

      if (options.resource) {
        query = query.where('resource', options.resource);
      }

      const activities = await query
        .orderBy('created_at', 'desc')
        .limit(limit) as Activity[];

      return activities;
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
      // Usando prisma client diretamente;
      const days = options.days || 30;
      
      // Calcular timestamps
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      let baseQuery = db('activity_logs');
      if (options.tenantId) {
        baseQuery = baseQuery.where('tenant_id', options.tenantId);
      }

      // Total
      const totalResult = await baseQuery.clone().count('* as total').first() as { total: number };
      
      // Hoje
      const todayResult = await baseQuery.clone()
        .where('created_at', '>=', todayStart)
        .count('* as total').first() as { total: number };
      
      // Esta semana
      const weekResult = await baseQuery.clone()
        .where('created_at', '>=', weekStart)
        .count('* as total').first() as { total: number };
      
      // Este mês
      const monthResult = await baseQuery.clone()
        .where('created_at', '>=', monthStart)
        .count('* as total').first() as { total: number };

      // Top actions
      const topActions = await baseQuery.clone()
        .where('created_at', '>=', monthStart)
        .select('action')
        .count('* as count')
        .groupBy('action')
        .orderBy('count', 'desc')
        .limit(10) as Array<{ action: string; count: number }>;

      // Top resources
      const topResources = await baseQuery.clone()
        .where('created_at', '>=', monthStart)
        .select('resource')
        .count('* as count')
        .groupBy('resource')
        .orderBy('count', 'desc')
        .limit(10) as Array<{ resource: string; count: number }>;

      return {
        total: totalResult.total,
        today: todayResult.total,
        thisWeek: weekResult.total,
        thisMonth: monthResult.total,
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