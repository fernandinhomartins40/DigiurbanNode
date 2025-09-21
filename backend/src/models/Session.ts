// ====================================================================
// 🔐 SESSION MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo de sessões JWT para controle de autenticação
// Implementa UserSession usando Prisma ORM
// ====================================================================

// @ts-ignore
import type { UserSession } from '@prisma/client';

import { prisma } from '../database/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSessionData {
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
}

export interface SessionWithUser {
  id: string;
  userId: string;
  user_name: string;
  user_email: string;
  user_role: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
}

// ====================================================================
// CLASSE DO MODELO SESSION (PLACEHOLDER)
// ====================================================================

export class SessionModel {

  // ================================================================
  // CRIAÇÃO DE SESSÃO
  // ================================================================

  static async create(sessionData: CreateSessionData): Promise<Session> {
    try {
      const tokenHash = this.hashToken(sessionData.token);

      const userSession = await prisma.userSession.create({
        data: {
          id: uuidv4(),
          userId: sessionData.userId,
          token: sessionData.token,
          tokenHash,
          ipAddress: sessionData.ipAddress,
          userAgent: sessionData.userAgent,
          expiresAt: new Date(sessionData.expiresAt),
          isActive: true,
          lastActivity: new Date()
        }
      });

      return {
        id: userSession.id,
        userId: userSession.userId,
        tokenHash: userSession.tokenHash,
        ipAddress: userSession.ipAddress || undefined,
        userAgent: userSession.userAgent || undefined,
        expiresAt: userSession.expiresAt.toISOString(),
        isActive: userSession.isActive,
        createdAt: userSession.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }
  }

  // ================================================================
  // BUSCA DE SESSÕES
  // ================================================================

  static async findById(id: string): Promise<Session | null> {
    try {
      const userSession = await prisma.userSession.findUnique({
        where: { id }
      });

      if (!userSession) return null;

      return {
        id: userSession.id,
        userId: userSession.userId,
        tokenHash: userSession.tokenHash,
        ipAddress: userSession.ipAddress || undefined,
        userAgent: userSession.userAgent || undefined,
        expiresAt: userSession.expiresAt.toISOString(),
        isActive: userSession.isActive,
        createdAt: userSession.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar sessão por ID:', error);
      return null;
    }
  }

  static async findByToken(token: string): Promise<Session | null> {
    try {
      const tokenHash = this.hashToken(token);
      const userSession = await prisma.userSession.findFirst({
        where: {
          tokenHash,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!userSession) return null;

      return {
        id: userSession.id,
        userId: userSession.userId,
        tokenHash: userSession.tokenHash,
        ipAddress: userSession.ipAddress || undefined,
        userAgent: userSession.userAgent || undefined,
        expiresAt: userSession.expiresAt.toISOString(),
        isActive: userSession.isActive,
        createdAt: userSession.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar sessão por token:', error);
      return null;
    }
  }

  static async findByUser(userId: string): Promise<Session[]> {
    try {
      const userSessions = await prisma.userSession.findMany({
        where: { userId }
      });

      return userSessions.map(session => ({
        id: session.id,
        userId: session.userId,
        tokenHash: session.tokenHash,
        ipAddress: session.ipAddress || undefined,
        userAgent: session.userAgent || undefined,
        expiresAt: session.expiresAt.toISOString(),
        isActive: session.isActive,
        createdAt: session.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Erro ao buscar sessões do usuário:', error);
      return [];
    }
  }

  static async getActiveSessions(userId: string): Promise<Session[]> {
    try {
      const userSessions = await prisma.userSession.findMany({
        where: {
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      return userSessions.map(session => ({
        id: session.id,
        userId: session.userId,
        tokenHash: session.tokenHash,
        ipAddress: session.ipAddress || undefined,
        userAgent: session.userAgent || undefined,
        expiresAt: session.expiresAt.toISOString(),
        isActive: session.isActive,
        createdAt: session.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Erro ao buscar sessões ativas:', error);
      return [];
    }
  }

  // ================================================================
  // VALIDAÇÃO DE SESSÃO
  // ================================================================

  static async validateSession(token: string): Promise<{
    valid: boolean;
    session?: Session;
    reason?: string;
  }> {
    try {
      const session = await this.findByToken(token);

      if (!session) {
        return { valid: false, reason: 'Sessão não encontrada ou inválida' };
      }

      if (!session.isActive) {
        return { valid: false, reason: 'Sessão inativa' };
      }

      if (new Date(session.expiresAt) <= new Date()) {
        await this.invalidate(session.id);
        return { valid: false, reason: 'Sessão expirada' };
      }

      // Atualizar última atividade
      await this.updateLastActivity(session.id);

      return { valid: true, session };
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return { valid: false, reason: 'Erro interno' };
    }
  }

  // ================================================================
  // INVALIDAÇÃO DE SESSÕES
  // ================================================================

  static async invalidate(sessionId: string): Promise<void> {
    try {
      await prisma.userSession.update({
        where: { id: sessionId },
        data: { isActive: false }
      });
    } catch (error) {
      console.error('Erro ao invalidar sessão:', error);
    }
  }

  static async invalidateByToken(token: string): Promise<void> {
    try {
      const tokenHash = this.hashToken(token);
      await prisma.userSession.updateMany({
        where: { tokenHash },
        data: { isActive: false }
      });
    } catch (error) {
      console.error('Erro ao invalidar sessão por token:', error);
    }
  }

  static async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      await prisma.userSession.updateMany({
        where: { userId },
        data: { isActive: false }
      });
    } catch (error) {
      console.error('Erro ao invalidar todas as sessões do usuário:', error);
    }
  }

  static async invalidateOtherUserSessions(userId: string, currentSessionId: string): Promise<void> {
    try {
      await prisma.userSession.updateMany({
        where: {
          userId,
          id: { not: currentSessionId }
        },
        data: { isActive: false }
      });
    } catch (error) {
      console.error('Erro ao invalidar outras sessões do usuário:', error);
    }
  }

  // ================================================================
  // LIMPEZA DE SESSÕES EXPIRADAS
  // ================================================================

  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await prisma.userSession.updateMany({
        where: {
          expiresAt: {
            lte: new Date()
          },
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      return result.count;
    } catch (error) {
      console.error('Erro ao limpar sessões expiradas:', error);
      return 0;
    }
  }

  static async deleteOldSessions(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.userSession.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          isActive: false
        }
      });

      return result.count;
    } catch (error) {
      console.error('Erro ao deletar sessões antigas:', error);
      return 0;
    }
  }

  // ================================================================
  // ESTATÍSTICAS DE SESSÕES
  // ================================================================

  static async getSessionStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byUser: { userId: string; count: number }[];
  }> {
    try {
      const total = await prisma.userSession.count();
      const active = await prisma.userSession.count({
        where: {
          isActive: true,
          expiresAt: { gt: new Date() }
        }
      });

      const byUser = await prisma.userSession.groupBy({
        by: ['userId'],
        _count: { id: true },
        where: { isActive: true }
      });

      return {
        total,
        active,
        expired: total - active,
        byUser: byUser.map(item => ({
          userId: item.userId,
          count: item._count.id
        }))
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de sessões:', error);
      return { total: 0, active: 0, expired: 0, byUser: [] };
    }
  }

  // ================================================================
  // SESSÕES COM DETALHES DO USUÁRIO
  // ================================================================

  static async getSessionsWithUser(limit: number = 50): Promise<SessionWithUser[]> {
    try {
      const sessions = await prisma.userSession.findMany({
        take: limit,
        include: {
          user: {
            select: {
              nomeCompleto: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        user_name: session.user.nomeCompleto,
        user_email: session.user.email,
        user_role: session.user.role,
        ipAddress: session.ipAddress || undefined,
        userAgent: session.userAgent || undefined,
        expiresAt: session.expiresAt.toISOString(),
        createdAt: session.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Erro ao obter sessões com usuários:', error);
      return [];
    }
  }

  static async getUserSessionsWithDetails(userId: string): Promise<SessionWithUser[]> {
    try {
      const sessions = await prisma.userSession.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              nomeCompleto: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        user_name: session.user.nomeCompleto,
        user_email: session.user.email,
        user_role: session.user.role,
        ipAddress: session.ipAddress || undefined,
        userAgent: session.userAgent || undefined,
        expiresAt: session.expiresAt.toISOString(),
        createdAt: session.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Erro ao obter sessões do usuário com detalhes:', error);
      return [];
    }
  }

  // ================================================================
  // DETECÇÃO DE MÚLTIPLAS SESSÕES
  // ================================================================

  static async getMultipleSessionUsers(): Promise<{
    userId: string;
    session_count: number;
    user_name: string;
    user_email: string;
  }[]> {
    try {
      const result = await prisma.userSession.groupBy({
        by: ['userId'],
        _count: { id: true },
        where: {
          isActive: true,
          expiresAt: { gt: new Date() }
        },
        having: {
          id: { _count: { gt: 1 } }
        }
      });

      const usersWithMultipleSessions = await Promise.all(
        result.map(async (item) => {
          const user = await prisma.user.findUnique({
            where: { id: item.userId },
            select: {
              nomeCompleto: true,
              email: true
            }
          });

          return {
            userId: item.userId,
            session_count: item._count.id,
            user_name: user?.nomeCompleto || 'Usuário não encontrado',
            user_email: user?.email || 'email não encontrado'
          };
        })
      );

      return usersWithMultipleSessions;
    } catch (error) {
      console.error('Erro ao obter usuários com múltiplas sessões:', error);
      return [];
    }
  }

  // ================================================================
  // ATUALIZAÇÃO DE SESSÃO
  // ================================================================

  static async updateLastActivity(sessionId: string): Promise<void> {
    try {
      await prisma.userSession.update({
        where: { id: sessionId },
        data: { lastActivity: new Date() }
      });
    } catch (error) {
      console.error('Erro ao atualizar última atividade:', error);
    }
  }

  static async extendSession(sessionId: string, newExpiresAt: string): Promise<void> {
    try {
      await prisma.userSession.update({
        where: { id: sessionId },
        data: { expiresAt: new Date(newExpiresAt) }
      });
    } catch (error) {
      console.error('Erro ao estender sessão:', error);
    }
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
    console.log('ℹ️ SessionModel cleanup job iniciado');

    const interval = setInterval(async () => {
      try {
        const cleanedCount = await this.cleanupExpiredSessions();
        if (cleanedCount > 0) {
          console.log(`🧹 Limpeza automática: ${cleanedCount} sessões expiradas invalidadas`);
        }
      } catch (error) {
        console.error('Erro no job de limpeza de sessões:', error);
      }
    }, intervalMinutes * 60 * 1000);

    return interval;
  }

  static startOldSessionsCleanupJob(intervalHours: number = 24, daysOld: number = 30): NodeJS.Timeout {
    console.log('ℹ️ SessionModel old sessions cleanup job iniciado');

    const interval = setInterval(async () => {
      try {
        const deletedCount = await this.deleteOldSessions(daysOld);
        if (deletedCount > 0) {
          console.log(`🧹 Limpeza automática: ${deletedCount} sessões antigas removidas`);
        }
      } catch (error) {
        console.error('Erro no job de limpeza de sessões antigas:', error);
      }
    }, intervalHours * 60 * 60 * 1000);

    return interval;
  }

  // Aliases para compatibilidade
  static async invalidateAllByUser(userId: string): Promise<void> {
    return this.invalidateAllUserSessions(userId);
  }

  static async getActiveByUser(userId: string): Promise<Session[]> {
    return this.getActiveSessions(userId);
  }

  static async invalidateById(id: string): Promise<void> {
    return this.invalidate(id);
  }
}

export default SessionModel;