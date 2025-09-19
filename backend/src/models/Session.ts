// ====================================================================
// 🔐 SESSION MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo de sessões JWT para controle de autenticação
// Segurança e rastreamento de sessões ativas
// Migrado para Prisma ORM
// ====================================================================

import { prisma } from '../database/prisma.js';
import { Session as PrismaSession } from '../database/generated/client/index.js';
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
    
    // Usando prisma client diretamente;
    
    await db('user_sessions').insert({
      id,
      user_id: sessionData.user_id,
      token_hash: tokenHash,
      ip_address: sessionData.ip_address || null,
      user_agent: sessionData.user_agent || null,
      expires_at: sessionData.expires_at
    });
    
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
    // Usando prisma client diretamente;
    const session = await db('user_sessions')
      .where('id', id)
      .first() as Session | undefined;
    return session || null;
  }
  
  static async findByToken(token: string): Promise<Session | null> {
    const tokenHash = this.hashToken(token);
    // Usando prisma client diretamente;
    const session = await db('user_sessions')
      .where('token_hash', tokenHash)
      .where('is_active', true)
      .where('expires_at', '>', db.fn.now())
      .first() as Session | undefined;
    return session || null;
  }
  
  static async findByUser(userId: string): Promise<Session[]> {
    // Usando prisma client diretamente;
    return await db('user_sessions')
      .where('user_id', userId)
      .orderBy('created_at', 'desc') as Session[];
  }
  
  static async getActiveSessions(userId: string): Promise<Session[]> {
    // Usando prisma client diretamente;
    return await db('user_sessions')
      .where('user_id', userId)
      .where('is_active', true)
      .where('expires_at', '>', db.fn.now())
      .orderBy('created_at', 'desc') as Session[];
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
    // Usando prisma client diretamente;
    await db('user_sessions')
      .where('id', sessionId)
      .update({ is_active: false });
  }
  
  static async invalidateByToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    // Usando prisma client diretamente;
    await db('user_sessions')
      .where('token_hash', tokenHash)
      .update({ is_active: false });
  }
  
  static async invalidateAllUserSessions(userId: string): Promise<void> {
    // Usando prisma client diretamente;
    await db('user_sessions')
      .where('user_id', userId)
      .update({ is_active: false });
  }
  
  static async invalidateOtherUserSessions(userId: string, currentSessionId: string): Promise<void> {
    // Usando prisma client diretamente;
    await db('user_sessions')
      .where('user_id', userId)
      .where('id', '!=', currentSessionId)
      .update({ is_active: false });
  }
  
  // ================================================================
  // LIMPEZA DE SESSÕES EXPIRADAS
  // ================================================================
  
  static async cleanupExpiredSessions(): Promise<number> {
    // Usando prisma client diretamente;
    const result = await db.raw(`
      UPDATE user_sessions 
      SET is_active = FALSE 
      WHERE expires_at <= datetime('now') AND is_active = TRUE
    `);
    
    console.log(`🧹 ${result.changes} sessões expiradas limpas`);
    return result.changes;
  }
  
  static async deleteOldSessions(daysOld: number = 30): Promise<number> {
    // Usando prisma client diretamente;
    const result = await db.raw(`
      DELETE FROM user_sessions 
      WHERE created_at <= datetime('now', '-${daysOld} days')
    `);
    
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
    // Usando prisma client diretamente;
    const totalResult = await db('user_sessions')
      .count('* as total')
      .first() as { total: number };
    const total = totalResult.total;
    
    // Sessões ativas
    const activeResult = await db('user_sessions')
      .where('is_active', true)
      .whereRaw('expires_at > datetime("now")')
      .count('* as total')
      .first() as { total: number };
    const active = activeResult.total;
    
    // Sessões expiradas
    const expiredResult = await db('user_sessions')
      .where(function() {
        this.whereRaw('expires_at <= datetime("now")')
          .orWhere('is_active', false);
      })
      .count('* as total')
      .first() as { total: number };
    const expired = expiredResult.total;
    
    // Por usuário (top 10)
    const byUser = await db('user_sessions')
      .select('user_id', db.raw('COUNT(*) as count'))
      .where('is_active', true)
      .whereRaw('expires_at > datetime("now")')
      .groupBy('user_id')
      .orderBy('count', 'desc')
      .limit(10) as { user_id: string; count: number }[];
    
    return { total, active, expired, byUser };
  }
  
  // ================================================================
  // SESSÕES COM DETALHES DO USUÁRIO
  // ================================================================
  
  static async getSessionsWithUser(limit: number = 50): Promise<SessionWithUser[]> {
    // Usando prisma client diretamente;
    return await db('user_sessions as s')
      .join('users as u', 's.user_id', 'u.id')
      .select(
        's.*',
        'u.nome_completo as user_name',
        'u.email as user_email',
        'u.role as user_role'
      )
      .where('s.is_active', true)
      .whereRaw('s.expires_at > datetime("now")')
      .orderBy('s.created_at', 'desc')
      .limit(limit) as SessionWithUser[];
  }
  
  static async getUserSessionsWithDetails(userId: string): Promise<SessionWithUser[]> {
    // Usando prisma client diretamente;
    return await db('user_sessions as s')
      .join('users as u', 's.user_id', 'u.id')
      .select(
        's.*',
        'u.nome_completo as user_name',
        'u.email as user_email',
        'u.role as user_role'
      )
      .where('s.user_id', userId)
      .orderBy('s.created_at', 'desc') as SessionWithUser[];
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
    // Usando prisma client diretamente;
    return await db('user_sessions as s')
      .join('users as u', 's.user_id', 'u.id')
      .select(
        's.user_id',
        db.raw('COUNT(*) as session_count'),
        'u.nome_completo as user_name',
        'u.email as user_email'
      )
      .where('s.is_active', true)
      .whereRaw('s.expires_at > datetime("now")')
      .groupBy('s.user_id', 'u.nome_completo', 'u.email')
      .havingRaw('COUNT(*) > 1')
      .orderBy('session_count', 'desc') as {
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
    // Usando prisma client diretamente;
    await db('user_sessions')
      .where('id', sessionId)
      .update({
        created_at: db.fn.now()
      });
  }
  
  static async extendSession(sessionId: string, newExpiresAt: string): Promise<void> {
    // Usando prisma client diretamente;
    await db('user_sessions')
      .where('id', sessionId)
      .update({
        expires_at: newExpiresAt
      });
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
  
  static async invalidateAllByUser(userId: string): Promise<void> {
    // Usando prisma client diretamente;
    await db('user_sessions')
      .where('user_id', userId)
      .update({ is_active: false });
  }
  
  static async getActiveByUser(userId: string): Promise<Session[]> {
    // Usando prisma client diretamente;
    return await db('user_sessions')
      .where('user_id', userId)
      .where('is_active', true)
      .whereRaw('expires_at > datetime("now")')
      .orderBy('created_at', 'desc') as Session[];
  }
  
  static async invalidateById(id: string): Promise<void> {
    // Usando prisma client diretamente;
    await db('user_sessions')
      .where('id', id)
      .update({ is_active: false });
  }
}

export default SessionModel;