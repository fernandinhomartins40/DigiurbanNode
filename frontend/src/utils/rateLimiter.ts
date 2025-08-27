// ====================================================================
// 🛡️ SISTEMA DE RATE LIMITING - PROTEÇÃO CONTRA FORÇA BRUTA
// ====================================================================

interface LoginAttempt {
  email: string;
  timestamp: number;
  count: number;
  blockedUntil?: number;
  ipAddress?: string;
}

interface RateLimitConfig {
  maxAttempts: number;
  lockoutDuration: number; // em milliseconds
  cleanupInterval: number; // em milliseconds
}

class RateLimiter {
  private attempts: Map<string, LoginAttempt> = new Map();
  private ipAttempts: Map<string, LoginAttempt> = new Map();
  private config: RateLimitConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      maxAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutos
      cleanupInterval: 5 * 60 * 1000, // 5 minutos
      ...config
    };

    // Iniciar limpeza automática de tentativas antigas
    this.startCleanup();
  }

  // ====================================================================
  // VERIFICAÇÕES DE RATE LIMITING
  // ====================================================================

  canAttemptLogin(email: string, ipAddress?: string): {
    canAttempt: boolean;
    reason?: string;
    remainingTime?: number;
    attemptsLeft?: number;
  } {
    const now = Date.now();
    
    // Verificar rate limit por email
    const emailCheck = this.checkEmailLimit(email, now);
    if (!emailCheck.canAttempt) {
      return emailCheck;
    }

    // Verificar rate limit por IP (se fornecido)
    if (ipAddress) {
      const ipCheck = this.checkIpLimit(ipAddress, now);
      if (!ipCheck.canAttempt) {
        return ipCheck;
      }
    }

    // Calcular tentativas restantes
    const emailAttempt = this.attempts.get(email);
    const attemptsLeft = emailAttempt 
      ? this.config.maxAttempts - emailAttempt.count
      : this.config.maxAttempts;

    return {
      canAttempt: true,
      attemptsLeft
    };
  }

  private checkEmailLimit(email: string, now: number) {
    const attempt = this.attempts.get(email);
    
    if (!attempt) {
      return { canAttempt: true, attemptsLeft: this.config.maxAttempts };
    }

    // Se passou do tempo de lockout, limpar tentativas
    if (attempt.blockedUntil && now > attempt.blockedUntil) {
      this.attempts.delete(email);
      return { canAttempt: true, attemptsLeft: this.config.maxAttempts };
    }

    // Verificar se está bloqueado
    if (attempt.count >= this.config.maxAttempts) {
      const remainingTime = attempt.blockedUntil ? attempt.blockedUntil - now : 0;
      return {
        canAttempt: false,
        reason: `Muitas tentativas para este email. Bloqueado por ${Math.ceil(remainingTime / 60000)} minutos.`,
        remainingTime
      };
    }

    return {
      canAttempt: true,
      attemptsLeft: this.config.maxAttempts - attempt.count
    };
  }

  private checkIpLimit(ipAddress: string, now: number) {
    const attempt = this.ipAttempts.get(ipAddress);
    
    if (!attempt) {
      return { canAttempt: true };
    }

    // Se passou do tempo de lockout, limpar tentativas
    if (attempt.blockedUntil && now > attempt.blockedUntil) {
      this.ipAttempts.delete(ipAddress);
      return { canAttempt: true };
    }

    // Verificar se está bloqueado (limite mais alto para IP)
    const maxIpAttempts = this.config.maxAttempts * 3; // 3x mais tentativas por IP
    if (attempt.count >= maxIpAttempts) {
      const remainingTime = attempt.blockedUntil ? attempt.blockedUntil - now : 0;
      return {
        canAttempt: false,
        reason: `Muitas tentativas deste IP. Bloqueado por ${Math.ceil(remainingTime / 60000)} minutos.`,
        remainingTime
      };
    }

    return { canAttempt: true };
  }

  // ====================================================================
  // REGISTRO DE TENTATIVAS
  // ====================================================================

  recordFailedAttempt(email: string, ipAddress?: string): void {
    const now = Date.now();
    
    // Registrar por email
    this.recordEmailAttempt(email, now, false);
    
    // Registrar por IP (se fornecido)
    if (ipAddress) {
      this.recordIpAttempt(ipAddress, now, false);
    }

    // Log de segurança
    console.warn(`🚨 Tentativa de login falhada:`, {
      email,
      ipAddress,
      timestamp: new Date(now).toISOString()
    });
  }

  recordSuccessfulLogin(email: string, ipAddress?: string): void {
    console.log(`✅ Login bem-sucedido para:`, email);
    
    // Limpar tentativas após login bem-sucedido
    this.attempts.delete(email);
    if (ipAddress) {
      // Não limpar IP completamente, apenas reduzir contador
      const ipAttempt = this.ipAttempts.get(ipAddress);
      if (ipAttempt && ipAttempt.count > 0) {
        ipAttempt.count = Math.max(0, ipAttempt.count - 1);
      }
    }
  }

  private recordEmailAttempt(email: string, timestamp: number, success: boolean) {
    const existing = this.attempts.get(email);
    
    if (existing) {
      existing.count += 1;
      existing.timestamp = timestamp;
      
      // Se atingiu o limite, definir tempo de bloqueio
      if (existing.count >= this.config.maxAttempts) {
        existing.blockedUntil = timestamp + this.config.lockoutDuration;
      }
    } else {
      this.attempts.set(email, {
        email,
        timestamp,
        count: 1
      });
    }
  }

  private recordIpAttempt(ipAddress: string, timestamp: number, success: boolean) {
    const maxIpAttempts = this.config.maxAttempts * 3;
    const existing = this.ipAttempts.get(ipAddress);
    
    if (existing) {
      existing.count += 1;
      existing.timestamp = timestamp;
      
      // Se atingiu o limite de IP, definir tempo de bloqueio
      if (existing.count >= maxIpAttempts) {
        existing.blockedUntil = timestamp + this.config.lockoutDuration;
      }
    } else {
      this.ipAttempts.set(ipAddress, {
        email: '', // IP não tem email associado
        timestamp,
        count: 1,
        ipAddress
      });
    }
  }

  // ====================================================================
  // UTILITÁRIOS
  // ====================================================================

  getRemainingLockoutTime(email: string): number {
    const attempt = this.attempts.get(email);
    if (!attempt || !attempt.blockedUntil) return 0;
    
    const remaining = attempt.blockedUntil - Date.now();
    return Math.max(0, remaining);
  }

  getAttemptInfo(email: string): {
    attempts: number;
    isBlocked: boolean;
    remainingTime: number;
    attemptsLeft: number;
  } {
    const attempt = this.attempts.get(email);
    
    if (!attempt) {
      return {
        attempts: 0,
        isBlocked: false,
        remainingTime: 0,
        attemptsLeft: this.config.maxAttempts
      };
    }

    const remainingTime = this.getRemainingLockoutTime(email);
    const isBlocked = remainingTime > 0;
    const attemptsLeft = Math.max(0, this.config.maxAttempts - attempt.count);

    return {
      attempts: attempt.count,
      isBlocked,
      remainingTime,
      attemptsLeft
    };
  }

  // Obter estatísticas de segurança
  getSecurityStats(): {
    totalAttempts: number;
    blockedEmails: number;
    blockedIPs: number;
    recentAttempts: number;
  } {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    
    let totalAttempts = 0;
    let blockedEmails = 0;
    let recentAttempts = 0;

    // Estatísticas por email
    for (const attempt of this.attempts.values()) {
      totalAttempts += attempt.count;
      if (attempt.timestamp > lastHour) {
        recentAttempts++;
      }
      if (attempt.blockedUntil && attempt.blockedUntil > now) {
        blockedEmails++;
      }
    }

    let blockedIPs = 0;
    // Estatísticas por IP
    for (const attempt of this.ipAttempts.values()) {
      if (attempt.blockedUntil && attempt.blockedUntil > now) {
        blockedIPs++;
      }
    }

    return {
      totalAttempts,
      blockedEmails,
      blockedIPs,
      recentAttempts
    };
  }

  // ====================================================================
  // LIMPEZA E MANUTENÇÃO
  // ====================================================================

  private startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredAttempts();
    }, this.config.cleanupInterval);
  }

  private cleanupExpiredAttempts() {
    const now = Date.now();
    let cleaned = 0;

    // Limpar tentativas de email expiradas
    for (const [email, attempt] of this.attempts.entries()) {
      if (attempt.blockedUntil && now > attempt.blockedUntil) {
        this.attempts.delete(email);
        cleaned++;
      } else if (!attempt.blockedUntil && now - attempt.timestamp > this.config.lockoutDuration) {
        // Limpar tentativas antigas que não resultaram em bloqueio
        this.attempts.delete(email);
        cleaned++;
      }
    }

    // Limpar tentativas de IP expiradas
    for (const [ip, attempt] of this.ipAttempts.entries()) {
      if (attempt.blockedUntil && now > attempt.blockedUntil) {
        this.ipAttempts.delete(ip);
        cleaned++;
      } else if (!attempt.blockedUntil && now - attempt.timestamp > this.config.lockoutDuration) {
        this.ipAttempts.delete(ip);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Limpeza de rate limiting: ${cleaned} registros removidos`);
    }
  }

  // Limpar todos os registros (para testes ou reset manual)
  clearAll(): void {
    this.attempts.clear();
    this.ipAttempts.clear();
    console.log('🧹 Rate limiter completamente resetado');
  }

  // Parar limpeza automática (cleanup)
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }
}

// ====================================================================
// INSTÂNCIA SINGLETON
// ====================================================================

// Configuração padrão para produção
const rateLimiter = new RateLimiter({
  maxAttempts: 5,        // 5 tentativas por email
  lockoutDuration: 15 * 60 * 1000, // 15 minutos de bloqueio
  cleanupInterval: 5 * 60 * 1000    // Limpeza a cada 5 minutos
});

// Configuração para desenvolvimento (mais permissiva)
const devRateLimiter = new RateLimiter({
  maxAttempts: 10,       // 10 tentativas em dev
  lockoutDuration: 2 * 60 * 1000,  // 2 minutos em dev
  cleanupInterval: 1 * 60 * 1000    // Limpeza a cada 1 minuto
});

// Selecionar rate limiter baseado no ambiente
const isDevelopment = import.meta.env.DEV;
export const authRateLimiter = isDevelopment ? devRateLimiter : rateLimiter;

// Função utilitária para obter IP do cliente (melhorada)
export const getClientIP = (): string => {
  // Em produção, obter IP real do servidor/proxy
  if (typeof window !== 'undefined') {
    // Tentar obter IP real via WebRTC (limitado)
    try {
      // Fallback: usar fingerprint mais robusto do navegador
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('DigiUrban Security Check', 2, 2);
        const fingerprint = canvas.toDataURL();
        const hash = fingerprint.substring(fingerprint.length - 10);
        return 'browser_' + hash;
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível gerar fingerprint do navegador');
    }
    
    // Fallback final: identificador persistente
    let clientId = localStorage.getItem('client_ip_id');
    if (!clientId) {
      clientId = 'client_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem('client_ip_id', clientId);
    }
    return clientId;
  }
  return 'server_unknown';
};

// Função para validar se o rate limiting está sendo bypassado
export const validateRateLimitIntegrity = (attempts: Map<string, any>): boolean => {
  try {
    // Verificar se o número de tentativas é realista
    const now = Date.now();
    let suspiciousActivity = false;
    
    attempts.forEach((attempt, key) => {
      // Verificar tentativas muito rápidas (possível bot)
      if (attempt.count > 10 && now - attempt.timestamp < 60000) { // 10 tentativas em 1 minuto
        console.warn(`🚨 Atividade suspeita detectada para: ${key}`);
        suspiciousActivity = true;
      }
      
      // Verificar padrões anômalos
      if (attempt.count > 100) { // Mais de 100 tentativas
        console.warn(`🚨 Rate limiting pode estar sendo bypassado: ${key}`);
        suspiciousActivity = true;
      }
    });
    
    return !suspiciousActivity;
  } catch (error) {
    console.error('❌ Erro na validação de integridade:', error);
    return false;
  }
};

export default authRateLimiter;