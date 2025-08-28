// ====================================================================
// 📊 ACTIVITY MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo para logs de atividade e auditoria
// Sistema completo de rastreamento de ações dos usuários
// ====================================================================

import { getDatabase } from '../database/connection.js';
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
      const db = await getDatabase();
      const id = crypto.randomUUID();
      
      const sql = `
        INSERT INTO activities (
          id, user_id, tenant_id, action, resource, resource_id, 
          details, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      
      db.prepare(sql).run(
        id,
        activityData.user_id || null,
        activityData.tenant_id || null,
        activityData.action,
        activityData.resource,
        activityData.resource_id || null,
        activityData.details || null,
        activityData.ip_address || null,
        activityData.user_agent || null
      );

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
      const db = await getDatabase();
      const sql = 'SELECT * FROM activities WHERE id = ?';
      const activity = db.prepare(sql).get(id) as unknown as Activity | undefined;
      
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
      const db = await getDatabase();
      const page = options.page || 1;
      const limit = Math.min(options.limit || 50, 100);
      const offset = (page - 1) * limit;

      let sql = 'SELECT * FROM activities WHERE 1=1';
      const params: any[] = [];

      if (options.userId) {
        sql += ' AND user_id = ?';
        params.push(options.userId);
      }

      if (options.tenantId) {
        sql += ' AND tenant_id = ?';
        params.push(options.tenantId);
      }

      if (options.action) {
        sql += ' AND action = ?';
        params.push(options.action);
      }

      if (options.resource) {
        sql += ' AND resource = ?';
        params.push(options.resource);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const activities = db.prepare(sql).all(...params) as unknown as Activity[];
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
      const db = await getDatabase();
      
      let sql = 'SELECT COUNT(*) as total FROM activities WHERE 1=1';
      const params: any[] = [];

      if (options.userId) {
        sql += ' AND user_id = ?';
        params.push(options.userId);
      }

      if (options.tenantId) {
        sql += ' AND tenant_id = ?';
        params.push(options.tenantId);
      }

      if (options.action) {
        sql += ' AND action = ?';
        params.push(options.action);
      }

      if (options.resource) {
        sql += ' AND resource = ?';
        params.push(options.resource);
      }

      const result = db.prepare(sql).get(...params) as unknown as { total: number };
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
      const db = await getDatabase();
      const sql = `
        SELECT * FROM activities 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      
      const activities = db.prepare(sql).all(userId, limit) as unknown as Activity[];
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
      const db = await getDatabase();
      const sql = `
        DELETE FROM activities 
        WHERE created_at < datetime('now', '-${daysOld} days')
      `;
      
      const result = db.prepare(sql).run();
      const changes = (result as any).changes || 0;
      
      StructuredLogger.info(`Activity cleanup completed`, {
        action: 'activity_cleanup'
      });

      return changes;
    } catch (error) {
      StructuredLogger.error('Activity cleanup failed', error, {
        action: 'activity_cleanup'
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
      const db = await getDatabase();
      
      const totalActivities = await this.count();
      const todayActivities = await this.count(); // Simplificado
      
      return {
        totalActivities,
        todayActivities,
        topActions: [],
        topUsers: []
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