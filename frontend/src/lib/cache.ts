// =====================================================
// SISTEMA DE CACHE OTIMIZADO PARA PERFORMANCE
// =====================================================

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheConfig {
  defaultTTL: number; // Time to live em milissegundos
  maxItems: number;   // Máximo de itens no cache
  cleanupInterval: number; // Intervalo de limpeza em milissegundos
}

export class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutos padrão
      maxItems: 100,
      cleanupInterval: 60 * 1000, // 1 minuto
      ...config
    };

    this.startCleanupTimer();
  }

  // Definir item no cache
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key
    };

    // Se o cache está cheio, remover item mais antigo
    if (this.cache.size >= this.config.maxItems) {
      this.evictOldest();
    }

    this.cache.set(key, item);
    console.log(`[CACHE] Set: ${key} (TTL: ${item.ttl}ms)`);
  }

  // Obter item do cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`[CACHE] Miss: ${key}`);
      return null;
    }

    // Verificar se expirou
    if (this.isExpired(item)) {
      this.cache.delete(key);
      console.log(`[CACHE] Expired: ${key}`);
      return null;
    }

    console.log(`[CACHE] Hit: ${key}`);
    return item.data;
  }

  // Obter ou definir (padrão cache)
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    console.log(`[CACHE] Fetching: ${key}`);
    const data = await fetcher();
    this.set(key, data, ttl);
    
    return data;
  }

  // Invalidar item específico
  invalidate(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`[CACHE] Invalidated: ${key}`);
    }
    return deleted;
  }

  // Invalidar por padrão (regex)
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    console.log(`[CACHE] Invalidated ${count} items matching pattern: ${pattern}`);
    return count;
  }

  // Limpar cache completo
  clear(): void {
    this.cache.clear();
    console.log('[CACHE] Cleared all items');
  }

  // Verificar se item expirou
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  // Remover item mais antigo
  private evictOldest(): void {
    let oldest: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldest = key;
      }
    }

    if (oldest) {
      this.cache.delete(oldest);
      console.log(`[CACHE] Evicted oldest: ${oldest}`);
    }
  }

  // Limpeza periódica de itens expirados
  private cleanup(): void {
    let count = 0;
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      console.log(`[CACHE] Cleanup: removed ${count} expired items`);
    }
  }

  // Iniciar timer de limpeza
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  // Parar timer de limpeza
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }

  // Estatísticas do cache
  getStats() {
    const items = Array.from(this.cache.values());
    const now = Date.now();
    const expired = items.filter(item => this.isExpired(item)).length;
    
    return {
      totalItems: this.cache.size,
      expiredItems: expired,
      activeItems: this.cache.size - expired,
      maxItems: this.config.maxItems,
      defaultTTL: this.config.defaultTTL,
      oldestItem: items.length > 0 ? Math.min(...items.map(i => i.timestamp)) : null,
      newestItem: items.length > 0 ? Math.max(...items.map(i => i.timestamp)) : null
    };
  }
}

// =====================================================
// INSTÂNCIA GLOBAL DO CACHE
// =====================================================

export const globalCache = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  maxItems: 200,
  cleanupInterval: 2 * 60 * 1000 // 2 minutos
});

// =====================================================
// CACHES ESPECIALIZADOS
// =====================================================

// Cache para dados de usuário (TTL longo)
export const userCache = new CacheManager({
  defaultTTL: 15 * 60 * 1000, // 15 minutos
  maxItems: 50,
  cleanupInterval: 5 * 60 * 1000
});

// Cache para secretarias e estrutura organizacional (TTL muito longo)
export const organizationCache = new CacheManager({
  defaultTTL: 60 * 60 * 1000, // 1 hora
  maxItems: 30,
  cleanupInterval: 10 * 60 * 1000
});

// Cache para serviços municipais (TTL médio)
export const servicesCache = new CacheManager({
  defaultTTL: 10 * 60 * 1000, // 10 minutos
  maxItems: 100,
  cleanupInterval: 3 * 60 * 1000
});

// Cache para protocolos (TTL curto, dados sensíveis)
export const protocolsCache = new CacheManager({
  defaultTTL: 2 * 60 * 1000, // 2 minutos
  maxItems: 150,
  cleanupInterval: 1 * 60 * 1000
});

// =====================================================
// HELPERS PARA GERAÇÃO DE CHAVES
// =====================================================

export const CacheKeys = {
  // Usuários
  userProfile: (userId: string) => `user:profile:${userId}`,
  userPermissions: (userId: string) => `user:permissions:${userId}`,
  
  // Secretarias
  secretaria: (id: string) => `secretaria:${id}`,
  secretariasAtivas: () => 'secretarias:ativas',
  setoresPorSecretaria: (secretariaId: string) => `setores:secretaria:${secretariaId}`,
  
  // Serviços
  servico: (id: string) => `servico:${id}`,
  servicosAtivos: (categoria?: string) => categoria ? `servicos:categoria:${categoria}` : 'servicos:ativos',
  servicosPorSecretaria: (secretariaId: string) => `servicos:secretaria:${secretariaId}`,
  categoriasServicos: () => 'servicos:categorias',
  
  // Protocolos
  protocolo: (id: string) => `protocolo:${id}`,
  protocoloHistorico: (protocoloId: string) => `protocolo:historico:${protocoloId}`,
  protocoloComentarios: (protocoloId: string) => `protocolo:comentarios:${protocoloId}`,
  protocoloAnexos: (protocoloId: string) => `protocolo:anexos:${protocoloId}`,
  protocolosUsuario: (userId: string, status?: string) => 
    status ? `protocolos:user:${userId}:status:${status}` : `protocolos:user:${userId}`,
  protocolosSecretaria: (secretariaId: string, status?: string) => 
    status ? `protocolos:secretaria:${secretariaId}:status:${status}` : `protocolos:secretaria:${secretariaId}`,
  
  // Notificações
  notificacoesUsuario: (userId: string) => `notificacoes:user:${userId}`,
  notificacoesNaoLidas: (userId: string) => `notificacoes:user:${userId}:unread:count`,
  
};

// =====================================================
// INVALIDAÇÃO INTELIGENTE
// =====================================================

export const CacheInvalidation = {
  // Invalidar dados do usuário
  invalidateUser: (userId: string) => {
    userCache.invalidatePattern(`user:.*:${userId}`);
    protocolsCache.invalidatePattern(`protocolos:user:${userId}`);
    globalCache.invalidatePattern(`notificacoes:user:${userId}`);
  },

  // Invalidar dados de protocolo
  invalidateProtocolo: (protocoloId: string) => {
    protocolsCache.invalidatePattern(`protocolo:${protocoloId}`);
    protocolsCache.invalidatePattern(`protocolo:.*:${protocoloId}`);
    // Invalidar listas de protocolos
    protocolsCache.invalidatePattern(`protocolos:.*`);
  },

  // Invalidar dados de secretaria
  invalidateSecretaria: (secretariaId: string) => {
    organizationCache.invalidate(CacheKeys.secretaria(secretariaId));
    organizationCache.invalidate(CacheKeys.secretariasAtivas());
    organizationCache.invalidate(CacheKeys.setoresPorSecretaria(secretariaId));
    servicesCache.invalidate(CacheKeys.servicosPorSecretaria(secretariaId));
    protocolsCache.invalidatePattern(`protocolos:secretaria:${secretariaId}`);
  },

  // Invalidar dados de serviço
  invalidateServico: (servicoId: string, secretariaId?: string) => {
    servicesCache.invalidate(CacheKeys.servico(servicoId));
    servicesCache.invalidate(CacheKeys.servicosAtivos());
    servicesCache.invalidate(CacheKeys.categoriasServicos());
    
    if (secretariaId) {
      servicesCache.invalidate(CacheKeys.servicosPorSecretaria(secretariaId));
    }
  },

  // Limpeza geral (logout, etc.)
  clearAll: () => {
    userCache.clear();
    organizationCache.clear();
    servicesCache.clear();
    protocolsCache.clear();
    globalCache.clear();
  }
};

// =====================================================
// HOOK PARA REACT
// =====================================================

import { useEffect } from 'react';

export const useCache = () => {
  useEffect(() => {
    // Cleanup ao desmontar
    return () => {
      // Não limpar o cache ao desmontar, apenas parar timers se necessário
    };
  }, []);

  return {
    globalCache,
    userCache,
    organizationCache,
    servicesCache,
    protocolsCache,
    CacheKeys,
    CacheInvalidation
  };
};