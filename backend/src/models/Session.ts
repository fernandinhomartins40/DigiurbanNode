// ====================================================================
// 🔐 SESSION MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo de sessões JWT para controle de autenticação
// Segurança e rastreamento de sessões ativas
// ====================================================================

import { query, queryOne, execute } from '../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateSessionData {
  user_id: string;
  token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
}

export interface SessionWithUser {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  created_at: string;
}

// ====================================================================
// CLASSE DO MODELO SESSION
// ====================================================================

export class SessionModel {
  
  // ================================================================
  // CRIAÇÃO DE SESSÃO
  // ================================================================
  
  static async create(sessionData: CreateSessionData): Promise<Session> {
    const id = uuidv4();
    const tokenHash = this.hashToken(sessionData.token);
    
    const sql = `
      INSERT INTO user_sessions (
        id, user_id, token_hash, ip_address, user_agent, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      sessionData.user_id,
      tokenHash,
      sessionData.ip_address || null,
      sessionData.user_agent || null,
      sessionData.expires_at
    ];
    
    await execute(sql, params);
    
    const session = await this.findById(id);
    if (!session) {
      throw new Error('Erro ao criar sessão');
    }
    
    return session;
  }
  
  // ================================================================
  // BUSCA DE SESSÕES
  // ================================================================
  
  static async findById(id: string): Promise<Session | null> {
    const sql = 'SELECT * FROM user_sessions WHERE id = ?';
    const session = await queryOne(sql, [id]) as Session;
    return session || null;
  }
  
  static async findByToken(token: string): Promise<Session | null> {
    const tokenHash = this.hashToken(token);
    const sql = `
      SELECT * FROM user_sessions 
      WHERE token_hash = ? AND is_active = TRUE AND expires_at > datetime('now')
    `;
    const session = await queryOne(sql, [tokenHash]) as Session;
    return session || null;
  }
  
  static async findByUser(userId: string): Promise<Session[]> {
    const sql = `
      SELECT * FROM user_sessions 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    return await query(sql, [userId]) as Session[];
  }
  
  static async getActiveSessions(userId: string): Promise<Session[]> {
    const sql = `
      SELECT * FROM user_sessions 
      WHERE user_id = ? AND is_active = TRUE AND expires_at > datetime('now')
      ORDER BY created_at DESC
    `;
    return await query(sql, [userId]) as Session[];
  }
  
  // ================================================================
  // VALIDAÇÃO DE SESSÃO
  // ================================================================
  
  static async validateSession(token: string): Promise<{
    valid: boolean;
    session?: Session;
    reason?: string;
  }> {
    const session = await this.findByToken(token);
    
    if (!session) {
      return { valid: false, reason: 'Sessão não encontrada' };
    }
    
    if (!session.is_active) {
      return { valid: false, reason: 'Sessão inativa' };
    }
    
    const now = new Date().toISOString();
    if (session.expires_at <= now) {
      // Marcar como inativa
      await this.invalidate(session.id);
      return { valid: false, reason: 'Sessão expirada' };
    }
    
    return { valid: true, session };
  }
  
  // ================================================================
  // INVALIDAÇÃO DE SESSÕES
  // ================================================================
  
  static async invalidate(sessionId: string): Promise<void> {
    const sql = 'UPDATE user_sessions SET is_active = FALSE WHERE id = ?';
    await execute(sql, [sessionId]);
  }
  
  static async invalidateByToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    const sql = 'UPDATE user_sessions SET is_active = FALSE WHERE token_hash = ?';
    await execute(sql, [tokenHash]);
  }
  
  static async invalidateAllUserSessions(userId: string): Promise<void> {
    const sql = 'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?';
    await execute(sql, [userId]);
  }
  
  static async invalidateOtherUserSessions(userId: string, currentSessionId: string): Promise<void> {
    const sql = `
      UPDATE user_sessions 
      SET is_active = FALSE 
      WHERE user_id = ? AND id != ?
    `;
    await execute(sql, [userId, currentSessionId]);
  }
  
  // ================================================================
  // LIMPEZA DE SESSÕES EXPIRADAS
  // ================================================================
  
  static async cleanupExpiredSessions(): Promise<number> {
    const sql = `
      UPDATE user_sessions 
      SET is_active = FALSE 
      WHERE expires_at <= datetime('now') AND is_active = TRUE
    `;
    const result = await execute(sql);
    
    console.log(`🧹 ${result.changes} sessões expiradas limpas`);
    return result.changes;
  }
  
  static async deleteOldSessions(daysOld: number = 30): Promise<number> {
    const sql = `
      DELETE FROM user_sessions 
      WHERE created_at <= datetime('now', '-${daysOld} days')
    `;
    const result = await execute(sql);
    
    console.log(`🗑️ ${result.changes} sessões antigas removidas`);
    return result.changes;
  }
  
  // ================================================================
  // ESTATÍSTICAS DE SESSÕES
  // ================================================================
  
  static async getSessionStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byUser: { user_id: string; count: number }[];
  }> {
    // Total de sessões
    const totalResult = await queryOne('SELECT COUNT(*) as count FROM user_sessions') as { count: number };
    const total = totalResult.count;
    
    // Sessões ativas
    const activeResult = await queryOne(`
      SELECT COUNT(*) as count FROM user_sessions 
      WHERE is_active = TRUE AND expires_at > datetime('now')
    `) as { count: number };
    const active = activeResult.count;
    
    // Sessões expiradas
    const expiredResult = await queryOne(`
      SELECT COUNT(*) as count FROM user_sessions 
      WHERE expires_at <= datetime('now') OR is_active = FALSE
    `) as { count: number };
    const expired = expiredResult.count;
    
    // Por usuário (top 10)
    const byUser = await query(`
      SELECT user_id, COUNT(*) as count
      FROM user_sessions 
      WHERE is_active = TRUE AND expires_at > datetime('now')
      GROUP BY user_id 
      ORDER BY count DESC 
      LIMIT 10
    `) as { user_id: string; count: number }[];
    
    return { total, active, expired, byUser };
  }
  
  // ================================================================
  // SESSÕES COM DETALHES DO USUÁRIO
  // ================================================================
  
  static async getSessionsWithUser(limit: number = 50): Promise<SessionWithUser[]> {
    const sql = `
      SELECT 
        s.*,
        u.nome_completo as user_name,
        u.email as user_email,
        u.role as user_role
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.is_active = TRUE AND s.expires_at > datetime('now')
      ORDER BY s.created_at DESC
      LIMIT ?
    `;
    
    return await query(sql, [limit]) as SessionWithUser[];
  }
  
  static async getUserSessionsWithDetails(userId: string): Promise<SessionWithUser[]> {
    const sql = `
      SELECT 
        s.*,
        u.nome_completo as user_name,
        u.email as user_email,
        u.role as user_role
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `;
    
    return await query(sql, [userId]) as SessionWithUser[];
  }
  
  // ================================================================
  // DETECÇÃO DE MÚLTIPLAS SESSÕES
  // ================================================================
  
  static async getMultipleSessionUsers(): Promise<{
    user_id: string;
    session_count: number;
    user_name: string;
    user_email: string;
  }[]> {
    const sql = `
      SELECT 
        s.user_id,
        COUNT(*) as session_count,
        u.nome_completo as user_name,
        u.email as user_email
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.is_active = TRUE AND s.expires_at > datetime('now')
      GROUP BY s.user_id, u.nome_completo, u.email
      HAVING COUNT(*) > 1
      ORDER BY session_count DESC
    `;
    
    return await query(sql) as {
      user_id: string;
      session_count: number;
      user_name: string;
      user_email: string;
    }[];
  }
  
  // ================================================================
  // ATUALIZAÇÃO DE SESSÃO
  // ================================================================
  
  static async updateLastActivity(sessionId: string): Promise<void> {
    const sql = `
      UPDATE user_sessions 
      SET created_at = datetime('now')
      WHERE id = ?
    `;
    await execute(sql, [sessionId]);
  }
  
  static async extendSession(sessionId: string, newExpiresAt: string): Promise<void> {
    const sql = `
      UPDATE user_sessions 
      SET expires_at = ?
      WHERE id = ?
    `;
    execute(sql, [newExpiresAt, sessionId]);
  }
  
  // ================================================================
  // UTILITÁRIOS PRIVADOS
  // ================================================================
  
  private static hashToken(token: string): string {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }
  
  // ================================================================
  // JOBS DE LIMPEZA AUTOMÁTICA
  // ================================================================
  
  static startCleanupJob(intervalMinutes: number = 60): NodeJS.Timeout {
    console.log(`🕒 Iniciando job de limpeza de sessões (${intervalMinutes} min)`);
    
    const interval = setInterval(async () => {
      try {
        await this.cleanupExpiredSessions();
      } catch (error) {
        console.error('❌ Erro na limpeza de sessões:', error);
      }
    }, intervalMinutes * 60 * 1000);
    
    // Executar uma vez imediatamente
    setTimeout(() => {
      this.cleanupExpiredSessions().catch(console.error);
    }, 1000);
    
    return interval;
  }
  
  static startOldSessionsCleanupJob(intervalHours: number = 24, daysOld: number = 30): NodeJS.Timeout {
    console.log(`🕒 Iniciando job de remoção de sessões antigas (${intervalHours}h)`);
    
    const interval = setInterval(async () => {
      try {
        await this.deleteOldSessions(daysOld);
      } catch (error) {
        console.error('❌ Erro na remoção de sessões antigas:', error);
      }
    }, intervalHours * 60 * 60 * 1000);
    
    return interval;
  }
}

export default SessionModel;