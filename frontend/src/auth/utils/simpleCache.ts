// ====================================================================
// 💾 CACHE SIMPLES COM TTL - SISTEMA AUTH2
// ====================================================================
// Cache minimalista e eficiente - SEM race conditions
// 100 linhas vs múltiplos sistemas complexos atuais
// ====================================================================

import type { CacheEntry } from "@/auth/types/auth.types";

// ====================================================================
// CLASSE DE CACHE SIMPLES
// ====================================================================

export class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) { // 5 minutos padrão
    this.ttl = ttlMs;
  }

  /**
   * Buscar item do cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Verificar se expirou
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Adicionar item ao cache
   */
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttl
    });
  }

  /**
   * Remover item específico
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpar cache completo
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Verificar se tem item válido
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Limpeza automática de itens expirados
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Estatísticas do cache
   */
  getStats(): {
    size: number;
    expired: number;
    hitRate: number;
  } {
    const now = Date.now();
    let expired = 0;
    
    for (const [, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        expired++;
      }
    }
    
    return {
      size: this.cache.size,
      expired,
      hitRate: this.cache.size > 0 ? ((this.cache.size - expired) / this.cache.size) * 100 : 0
    };
  }
}

// ====================================================================
// INSTÂNCIA GLOBAL DE CACHE PARA AUTH
// ====================================================================

export const authCache = new SimpleCache<any>(5 * 60 * 1000); // 5 minutos

// Limpeza automática a cada 10 minutos
setInterval(() => {
  authCache.cleanup();
}, 10 * 60 * 1000);

// ====================================================================
// HELPERS ESPECÍFICOS PARA AUTH
// ====================================================================

export const AuthCacheHelpers = {
  /**
   * Cache de perfil de usuário
   */
  getUserProfile: (userId: string) => {
    return authCache.get(`profile:${userId}`);
  },

  setUserProfile: (userId: string, profile: any) => {
    authCache.set(`profile:${userId}`, profile);
  },

  clearUserProfile: (userId: string) => {
    authCache.delete(`profile:${userId}`);
  },

  /**
   * Cache de permissões
   */
  getUserPermissions: (userId: string) => {
    return authCache.get(`permissions:${userId}`);
  },

  setUserPermissions: (userId: string, permissions: unknown[]) => {
    authCache.set(`permissions:${userId}`, permissions);
  },

  /**
   * Cache de tenant
   */
  getTenantInfo: (tenantId: string) => {
    return authCache.get(`tenant:${tenantId}`);
  },

  setTenantInfo: (tenantId: string, tenant: any) => {
    authCache.set(`tenant:${tenantId}`, tenant);
  },

  /**
   * Limpar todo cache de um usuário
   */
  clearUserCache: (userId: string) => {
    authCache.delete(`profile:${userId}`);
    authCache.delete(`permissions:${userId}`);
  },

  /**
   * Limpar todo cache
   */
  clearAll: () => {
    authCache.clear();
  },

  /**
   * Estatísticas
   */
  getStats: () => {
    return authCache.getStats();
  }
};

export default SimpleCache;