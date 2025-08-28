// ====================================================================
// 🚀 SMART CACHE - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Sistema de cache inteligente com estratégias otimizadas
// TTL dinâmico, invalidação inteligente e performance monitoring
// ====================================================================

import type { UserProfile, TenantInfo, Permission, CacheEntry } from '@/auth/types/auth.types';

// ====================================================================
// CONFIGURAÇÕES DE CACHE
// ====================================================================

const CACHE_CONFIG = {
  // TTL (Time To Live) em milissegundos
  TTL: {
    USER_PROFILE: 15 * 60 * 1000,      // 15 minutos
    PERMISSIONS: 30 * 60 * 1000,       // 30 minutos
    TENANT_INFO: 60 * 60 * 1000,       // 1 hora
    ROLES: 2 * 60 * 60 * 1000,         // 2 horas
    SESSION: 5 * 60 * 1000              // 5 minutos
  },
  
  // Limites de armazenamento
  MAX_ENTRIES: {
    USER_PROFILES: 50,
    PERMISSIONS: 100,
    TENANTS: 20,
    GENERAL: 200
  },
  
  // Chaves de cache
  KEYS: {
    USER_PROFILE: 'auth_user_profile_',
    PERMISSIONS: 'auth_permissions_',
    TENANT: 'auth_tenant_',
    SESSION: 'auth_session_',
    ROLES: 'auth_roles',
    LAST_LOGIN: 'auth_last_login_',
    PREFERENCES: 'auth_preferences_'
  }
} as const;

// ====================================================================
// INTERFACES
// ====================================================================

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

interface CacheMetrics {
  totalEntries: number;
  memoryUsage: number; // bytes estimados
  hitRate: number;
  avgResponseTime: number;
}

// ====================================================================
// CLASSE PRINCIPAL DO CACHE
// ====================================================================

class SmartCache {
  private stats: Record<string, CacheStats> = {};
  private performanceMetrics: Map<string, number[]> = new Map();

  // ====================================================================
  // MÉTODOS PRINCIPAIS
  // ====================================================================

  /**
   * Armazenar item no cache com TTL
   */
  set<T>(key: string, data: T, ttl: number): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        expires: Date.now() + ttl
      };

      localStorage.setItem(key, JSON.stringify(entry));
      this.updateStats(key, 'set');
      
      console.log(`💾 [CACHE] Stored: ${key} (TTL: ${ttl}ms)`);
    } catch (error) {
      console.error('❌ [CACHE] Erro ao armazenar:', error);
      this.handleQuotaExceeded();
    }
  }

  /**
   * Recuperar item do cache
   */
  get<T>(key: string): T | null {
    const startTime = Date.now();
    
    try {
      const item = localStorage.getItem(key);
      
      if (!item) {
        this.updateStats(key, 'miss');
        this.recordPerformance(key, Date.now() - startTime);
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Verificar se expirou
      if (entry.expires < Date.now()) {
        localStorage.removeItem(key);
        this.updateStats(key, 'miss');
        console.log(`⏰ [CACHE] Expired: ${key}`);
        this.recordPerformance(key, Date.now() - startTime);
        return null;
      }

      this.updateStats(key, 'hit');
      this.recordPerformance(key, Date.now() - startTime);
      console.log(`🎯 [CACHE] Hit: ${key}`);
      return entry.data;
      
    } catch (error) {
      console.error('❌ [CACHE] Erro ao recuperar:', error);
      localStorage.removeItem(key); // Limpar item corrompido
      this.updateStats(key, 'miss');
      this.recordPerformance(key, Date.now() - startTime);
      return null;
    }
  }

  /**
   * Remover item do cache
   */
  remove(key: string): void {
    localStorage.removeItem(key);
    console.log(`🗑️ [CACHE] Removed: ${key}`);
  }

  /**
   * Verificar se item existe no cache e não expirou
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Limpar cache por padrão de chave
   */
  clearByPattern(pattern: string): number {
    let cleared = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.includes(pattern)) {
        localStorage.removeItem(key);
        cleared++;
      }
    });
    
    console.log(`🧹 [CACHE] Cleared ${cleared} items matching: ${pattern}`);
    return cleared;
  }

  /**
   * Limpar todo o cache
   */
  clear(): void {
    const authKeys = Object.keys(localStorage).filter(key => key.startsWith('auth_'));
    authKeys.forEach(key => localStorage.removeItem(key));
    this.stats = {};
    this.performanceMetrics.clear();
    console.log('🧹 [CACHE] All cache cleared');
  }

  // ====================================================================
  // MÉTODOS ESPECÍFICOS POR TIPO
  // ====================================================================

  // User Profile Cache
  setUserProfile(userId: string, profile: UserProfile): void {
    this.set(`${CACHE_CONFIG.KEYS.USER_PROFILE}${userId}`, profile, CACHE_CONFIG.TTL.USER_PROFILE);
  }

  getUserProfile(userId: string): UserProfile | null {
    return this.get<UserProfile>(`${CACHE_CONFIG.KEYS.USER_PROFILE}${userId}`);
  }

  // Permissions Cache
  setUserPermissions(userId: string, permissions: Permission[]): void {
    this.set(`${CACHE_CONFIG.KEYS.PERMISSIONS}${userId}`, permissions, CACHE_CONFIG.TTL.PERMISSIONS);
  }

  getUserPermissions(userId: string): Permission[] | null {
    return this.get<Permission[]>(`${CACHE_CONFIG.KEYS.PERMISSIONS}${userId}`) || null;
  }

  // Tenant Info Cache
  setTenantInfo(tenantId: string, tenant: TenantInfo): void {
    this.set(`${CACHE_CONFIG.KEYS.TENANT}${tenantId}`, tenant, CACHE_CONFIG.TTL.TENANT_INFO);
  }

  getTenantInfo(tenantId: string): TenantInfo | null {
    return this.get<TenantInfo>(`${CACHE_CONFIG.KEYS.TENANT}${tenantId}`);
  }

  // Session Cache
  setSessionData(userId: string, sessionData: any): void {
    this.set(`${CACHE_CONFIG.KEYS.SESSION}${userId}`, sessionData, CACHE_CONFIG.TTL.SESSION);
  }

  getSessionData(userId: string): any | null {
    return this.get(`${CACHE_CONFIG.KEYS.SESSION}${userId}`);
  }

  // Roles Cache
  setRolesData(roles: any[]): void {
    this.set(CACHE_CONFIG.KEYS.ROLES, roles, CACHE_CONFIG.TTL.ROLES);
  }

  getRolesData(): any[] | null {
    return this.get<any[]>(CACHE_CONFIG.KEYS.ROLES);
  }

  // ====================================================================
  // INVALIDAÇÃO INTELIGENTE
  // ====================================================================

  /**
   * Invalidar cache específico do usuário
   */
  invalidateUser(userId: string): void {
    this.remove(`${CACHE_CONFIG.KEYS.USER_PROFILE}${userId}`);
    this.remove(`${CACHE_CONFIG.KEYS.PERMISSIONS}${userId}`);
    this.remove(`${CACHE_CONFIG.KEYS.SESSION}${userId}`);
    this.remove(`${CACHE_CONFIG.KEYS.PREFERENCES}${userId}`);
    console.log(`🔄 [CACHE] User ${userId} cache invalidated`);
  }

  /**
   * Invalidar cache específico do tenant
   */
  invalidateTenant(tenantId: string): void {
    this.remove(`${CACHE_CONFIG.KEYS.TENANT}${tenantId}`);
    // Invalidar perfis de usuários deste tenant
    this.clearByPattern(`tenant_${tenantId}`);
    console.log(`🔄 [CACHE] Tenant ${tenantId} cache invalidated`);
  }

  /**
   * Invalidação automática baseada em eventos
   */
  onUserUpdated(userId: string): void {
    this.invalidateUser(userId);
    // Invalidar cache relacionado se necessário
  }

  onRoleChanged(userId: string): void {
    this.invalidateUser(userId);
    // Recarregar permissões
  }

  onTenantUpdated(tenantId: string): void {
    this.invalidateTenant(tenantId);
  }

  // ====================================================================
  // LIMPEZA E OTIMIZAÇÃO
  // ====================================================================

  /**
   * Limpeza automática de itens expirados
   */
  cleanup(): number {
    let cleaned = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('auth_')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const entry = JSON.parse(item);
            if (entry.expires && entry.expires < Date.now()) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch (error) {
          // Item corrompido, remover
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });
    
    if (cleaned > 0) {
      console.log(`🧹 [CACHE] Cleanup: removed ${cleaned} expired items`);
    }
    
    return cleaned;
  }

  /**
   * Lidar com quota excedida
   */
  private handleQuotaExceeded(): void {
    console.warn('⚠️ [CACHE] Storage quota exceeded, clearing old entries');
    
    // Estratégia: remover 25% dos itens mais antigos
    const keys = Object.keys(localStorage).filter(key => key.startsWith('auth_'));
    const itemsWithAge = keys.map(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const entry = JSON.parse(item);
          return { key, age: Date.now() - (entry.created || 0) };
        }
      } catch (error) {
        return { key, age: Infinity }; // Marcar para remoção
      }
      return null;
    }).filter(Boolean) as { key: string; age: number }[];

    // Ordenar por idade (mais antigos primeiro)
    itemsWithAge.sort((a, b) => b.age - a.age);
    
    // Remover 25% dos mais antigos
    const toRemove = Math.ceil(itemsWithAge.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(itemsWithAge[i].key);
    }
    
    console.log(`🧹 [CACHE] Removed ${toRemove} old items due to quota`);
  }

  // ====================================================================
  // MÉTRICAS E MONITORING
  // ====================================================================

  private updateStats(key: string, operation: 'hit' | 'miss' | 'set'): void {
    if (!this.stats[key]) {
      this.stats[key] = { hits: 0, misses: 0, size: 0, hitRate: 0 };
    }
    
    const stat = this.stats[key];
    
    if (operation === 'hit') {
      stat.hits++;
    } else if (operation === 'miss') {
      stat.misses++;
    }
    
    const total = stat.hits + stat.misses;
    stat.hitRate = total > 0 ? (stat.hits / total) * 100 : 0;
  }

  private recordPerformance(key: string, duration: number): void {
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, []);
    }
    
    const metrics = this.performanceMetrics.get(key)!;
    metrics.push(duration);
    
    // Manter apenas os últimos 100 registros
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Obter estatísticas do cache
   */
  getStats(): Record<string, CacheStats> {
    return { ...this.stats };
  }

  /**
   * Obter métricas gerais
   */
  getMetrics(): CacheMetrics {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('auth_'));
    const totalHits = Object.values(this.stats).reduce((sum, stat) => sum + stat.hits, 0);
    const totalRequests = Object.values(this.stats).reduce((sum, stat) => sum + stat.hits + stat.misses, 0);
    
    let totalSize = 0;
    keys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) totalSize += item.length * 2; // Rough estimate in bytes
    });

    const allDurations = Array.from(this.performanceMetrics.values()).flat();
    const avgResponseTime = allDurations.length > 0 
      ? allDurations.reduce((sum, time) => sum + time, 0) / allDurations.length 
      : 0;

    return {
      totalEntries: keys.length,
      memoryUsage: totalSize,
      hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      avgResponseTime
    };
  }

  /**
   * Log de performance para debugging
   */
  logPerformance(): void {
    const metrics = this.getMetrics();
    const stats = this.getStats();
    
    console.group('📊 [CACHE] Performance Report');
    console.log('Total entries:', metrics.totalEntries);
    console.log('Memory usage:', `${(metrics.memoryUsage / 1024).toFixed(2)} KB`);
    console.log('Hit rate:', `${metrics.hitRate.toFixed(2)}%`);
    console.log('Avg response time:', `${metrics.avgResponseTime.toFixed(2)}ms`);
    console.table(stats);
    console.groupEnd();
  }
}

// ====================================================================
// INSTÂNCIA GLOBAL E UTILITÁRIOS
// ====================================================================

export const smartCache = new SmartCache();

// Auto cleanup a cada 10 minutos
setInterval(() => {
  smartCache.cleanup();
}, 10 * 60 * 1000);

// Log de performance a cada hora (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  setInterval(() => {
    smartCache.logPerformance();
  }, 60 * 60 * 1000);
}

// Helpers for backward compatibility
export const AuthCacheHelpers = {
  setUserProfile: (userId: string, profile: UserProfile) => 
    smartCache.setUserProfile(userId, profile),
  
  getUserProfile: (userId: string) => 
    smartCache.getUserProfile(userId),
  
  setUserPermissions: (userId: string, permissions: Permission[]) => 
    smartCache.setUserPermissions(userId, permissions),
  
  getUserPermissions: (userId: string) => 
    smartCache.getUserPermissions(userId),
  
  setTenantInfo: (tenantId: string, tenant: TenantInfo) => 
    smartCache.setTenantInfo(tenantId, tenant),
  
  getTenantInfo: (tenantId: string) => 
    smartCache.getTenantInfo(tenantId),
  
  clearUserCache: (userId: string) => 
    smartCache.invalidateUser(userId),
  
  clearAllCache: () => 
    smartCache.clear()
};

export default smartCache;