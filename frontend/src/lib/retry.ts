// =====================================================
// SISTEMA DE RETRY PARA OPERAÇÕES CRÍTICAS
// =====================================================

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  jitter: boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
  exponentialBackoff: true,
  jitter: true
};

export class RetryManager {
  private static instance: RetryManager;
  
  static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager();
    }
    return RetryManager.instance;
  }

  // Executar operação com retry automático
  async execute<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        console.log(`[RETRY] Tentativa ${attempt}/${finalConfig.maxAttempts}`);
        
        const data = await operation();
        
        return {
          success: true,
          data,
          attempts: attempt,
          totalTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`[RETRY] Falha na tentativa ${attempt}:`, error);

        // Se não é a última tentativa, aguardar antes de tentar novamente
        if (attempt < finalConfig.maxAttempts) {
          const delay = this.calculateDelay(attempt, finalConfig);
          console.log(`[RETRY] Aguardando ${delay}ms antes da próxima tentativa...`);
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: finalConfig.maxAttempts,
      totalTime: Date.now() - startTime
    };
  }

  // Calcular delay com backoff exponencial e jitter
  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = config.baseDelay;

    if (config.exponentialBackoff) {
      delay = Math.min(config.baseDelay * Math.pow(2, attempt - 1), config.maxDelay);
    }

    if (config.jitter) {
      // Adicionar variação aleatória de ±25%
      const jitterRange = delay * 0.25;
      delay += (Math.random() - 0.5) * 2 * jitterRange;
    }

    return Math.max(Math.floor(delay), 100); // Mínimo 100ms
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Verificar se o erro é recuperável
  isRetryableError(error: any): boolean {
    if (!error) return false;

    // Códigos de erro HTTP recuperáveis
    const retryableHttpCodes = [408, 429, 500, 502, 503, 504];
    if (error.status && retryableHttpCodes.includes(error.status)) {
      return true;
    }

    // Códigos de erro do Supabase recuperáveis
    const retryableSupabaseCodes = [
      'PGRST301', // Connection timeout
      'PGRST302', // Connection lost
      'PGRST503', // Service unavailable
    ];
    if (error.code && retryableSupabaseCodes.includes(error.code)) {
      return true;
    }

    // Erros de rede
    const networkErrors = [
      'NetworkError',
      'TypeError: Failed to fetch',
      'timeout',
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED'
    ];
    const errorMessage = error.message?.toLowerCase() || '';
    if (networkErrors.some(netError => errorMessage.includes(netError.toLowerCase()))) {
      return true;
    }

    return false;
  }
}

// Instância singleton
export const retryManager = RetryManager.getInstance();

// =====================================================
// DECORATORS E WRAPPERS PARA OPERAÇÕES CRÍTICAS
// =====================================================

// Wrapper para operações do Supabase
export async function withRetry<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const result = await retryManager.execute(operation, config);
  
  if (result.success) {
    console.log(`[RETRY] Operação bem-sucedida após ${result.attempts} tentativa(s) em ${result.totalTime}ms`);
    return result.data!;
  } else {
    console.error(`[RETRY] Operação falhou após ${result.attempts} tentativa(s):`, result.error);
    throw result.error;
  }
}

// Wrapper específico para operações críticas do protocolo
export async function withProtocolRetry<T>(
  operation: () => Promise<T>
): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 15000,
    exponentialBackoff: true,
    jitter: true
  });
}

// Wrapper para operações de upload de arquivo
export async function withUploadRetry<T>(
  operation: () => Promise<T>
): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 3,
    baseDelay: 3000,
    maxDelay: 20000,
    exponentialBackoff: true,
    jitter: false // Upload sem jitter para ser mais previsível
  });
}

// Wrapper para operações de notificação
export async function withNotificationRetry<T>(
  operation: () => Promise<T>
): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 2,
    baseDelay: 500,
    maxDelay: 2000,
    exponentialBackoff: false,
    jitter: true
  });
}

// =====================================================
// TYPES PARA TYPESCRIPT
// =====================================================

export type RetryableOperation<T> = () => Promise<T>;
export type CriticalOperation<T> = RetryableOperation<T>;