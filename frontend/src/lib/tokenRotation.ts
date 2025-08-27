// ====================================================================
// 🔄 SISTEMA DE ROTAÇÃO AUTOMÁTICA DE TOKENS - DIGIURBAN2
// ====================================================================

import React from 'react';
import { supabase } from './supabase';

interface TokenRotationConfig {
  intervalMinutes: number;
  warningThresholdMinutes: number;
  maxRetries: number;
  enableAutoRotation: boolean;
}

interface TokenInfo {
  expiresAt: number;
  issuedAt: number;
  refreshToken?: string;
  rotationCount: number;
  lastRotation: number;
}

class TokenRotationManager {
  private config: TokenRotationConfig;
  private rotationTimer?: NodeJS.Timeout;
  private tokenInfo: TokenInfo | null = null;
  private rotationInProgress = false;

  constructor(config?: Partial<TokenRotationConfig>) {
    this.config = {
      intervalMinutes: 45, // Aumentar para 45 minutos (reduzir frequência)
      warningThresholdMinutes: 10, // Avisar 10 minutos antes da expiração
      maxRetries: 2, // Reduzir tentativas para diminuir overhead
      enableAutoRotation: true,
      ...config
    };

    this.initializeTokenRotation();
  }

  // ====================================================================
  // INICIALIZAÇÃO
  // ====================================================================

  private initializeTokenRotation() {
    if (!this.config.enableAutoRotation) {
      console.log('🔄 Rotação automática de tokens desabilitada');
      return;
    }

    // Verificar token atual na inicialização
    this.checkCurrentToken();

    // Configurar timer de rotação
    this.setupRotationTimer();

    // Listener para mudanças de autenticação
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.updateTokenInfo(session);
        this.setupRotationTimer();
      } else if (event === 'SIGNED_OUT') {
        this.clearRotationTimer();
        this.tokenInfo = null;
      }
    });

    console.log('🔄 Sistema de rotação de tokens inicializado');
  }

  // ====================================================================
  // VERIFICAÇÃO E ATUALIZAÇÃO DE TOKENS
  // ====================================================================

  private async checkCurrentToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        this.updateTokenInfo(session);
        
        // Verificar se precisa de rotação imediata
        if (this.shouldRotateToken()) {
          await this.rotateToken();
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar token atual:', error);
    }
  }

  private updateTokenInfo(session: any) {
    if (!session.expires_at) {
      console.warn('⚠️ Token sem data de expiração definida');
      return;
    }

    this.tokenInfo = {
      expiresAt: session.expires_at * 1000, // Converter para milliseconds
      issuedAt: Date.now(),
      refreshToken: session.refresh_token,
      rotationCount: this.tokenInfo?.rotationCount || 0,
      lastRotation: this.tokenInfo?.lastRotation || Date.now()
    };

    console.log('🔄 Token info atualizada:', {
      expiresIn: Math.round((this.tokenInfo.expiresAt - Date.now()) / 60000),
      rotationCount: this.tokenInfo.rotationCount
    });
  }

  // ====================================================================
  // LÓGICA DE ROTAÇÃO
  // ====================================================================

  private shouldRotateToken(): boolean {
    if (!this.tokenInfo) return false;
    
    // Evitar rotação se já está em progresso
    if (this.rotationInProgress) {
      console.log('⏭️ Rotação já em progresso, aguardando...');
      return false;
    }

    const now = Date.now();
    const timeUntilExpiry = this.tokenInfo.expiresAt - now;
    const warningThreshold = this.config.warningThresholdMinutes * 60 * 1000;

    // Só rotacionar se realmente próximo do vencimento (mais conservador)
    if (timeUntilExpiry <= warningThreshold) {
      console.log(`⚠️ Token expira em ${Math.round(timeUntilExpiry / 60000)} minutos - rotação necessária`);
      return true;
    }

    // Rotação por intervalo: só se passou MUITO tempo (mais conservador)
    const timeSinceLastRotation = now - this.tokenInfo.lastRotation;
    const rotationInterval = this.config.intervalMinutes * 60 * 1000;

    if (timeSinceLastRotation >= rotationInterval && timeUntilExpiry > warningThreshold * 2) {
      console.log('🔄 Intervalo de rotação atingido (token ainda válido)');
      return true;
    }

    return false;
  }

  private async rotateToken(retryCount = 0): Promise<boolean> {
    if (this.rotationInProgress) {
      console.log('🔄 Rotação já em andamento...');
      return false;
    }

    if (retryCount >= this.config.maxRetries) {
      console.error('❌ Máximo de tentativas de rotação atingido');
      return false;
    }

    this.rotationInProgress = true;

    try {
      console.log(`🔄 Iniciando rotação de token (tentativa ${retryCount + 1})`);

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      if (data.session) {
        this.updateTokenInfo(data.session);
        
        if (this.tokenInfo) {
          this.tokenInfo.rotationCount += 1;
          this.tokenInfo.lastRotation = Date.now();
        }

        // Resetar timer de rotação
        this.setupRotationTimer();

        console.log('✅ Token rotacionado com sucesso');
        
        // Emit evento customizado para notificar outras partes da aplicação
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tokenRotated', {
            detail: { rotationCount: this.tokenInfo?.rotationCount }
          }));
        }

        return true;
      } else {
        throw new Error('Sessão não retornada após refresh');
      }

    } catch (error: Error | unknown) {
      console.error(`❌ Erro na rotação do token (tentativa ${retryCount + 1}):`, error);

      // Tentar novamente após delay exponencial
      if (retryCount < this.config.maxRetries - 1) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
        console.log(`🔄 Tentando novamente em ${delay}ms...`);
        
        setTimeout(() => {
          this.rotateToken(retryCount + 1);
        }, delay);
      } else {
        // Falha crítica - forçar logout para segurança
        console.error('🚨 Falha crítica na rotação de tokens - forçando logout');
        await supabase.auth.logout();
      }

      return false;
    } finally {
      this.rotationInProgress = false;
    }
  }

  // ====================================================================
  // TIMER DE ROTAÇÃO
  // ====================================================================

  private setupRotationTimer() {
    this.clearRotationTimer();

    if (!this.config.enableAutoRotation || !this.tokenInfo) return;

    // Calcular próxima verificação
    const checkInterval = Math.min(
      this.config.intervalMinutes * 60 * 1000, // Intervalo configurado
      60 * 1000 // Máximo de 1 minuto entre verificações
    );

    this.rotationTimer = setInterval(() => {
      if (this.shouldRotateToken()) {
        this.rotateToken();
      }
    }, checkInterval);

    console.log(`🔄 Timer de rotação configurado (${checkInterval / 1000}s)`);
  }

  private clearRotationTimer() {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = undefined;
    }
  }

  // ====================================================================
  // MÉTODOS PÚBLICOS
  // ====================================================================

  /**
   * Forçar rotação manual do token
   */
  public async forceRotation(): Promise<boolean> {
    console.log('🔄 Rotação manual solicitada');
    return await this.rotateToken();
  }

  /**
   * Obter informações do token atual
   */
  public getTokenInfo(): TokenInfo | null {
    return this.tokenInfo;
  }

  /**
   * Verificar se o token está próximo do vencimento
   */
  public isTokenExpiringSoon(): boolean {
    if (!this.tokenInfo) return false;

    const timeUntilExpiry = this.tokenInfo.expiresAt - Date.now();
    const warningThreshold = this.config.warningThresholdMinutes * 60 * 1000;

    return timeUntilExpiry <= warningThreshold;
  }

  /**
   * Obter tempo restante até expiração em minutos
   */
  public getTimeUntilExpiry(): number {
    if (!this.tokenInfo) return 0;
    return Math.max(0, Math.round((this.tokenInfo.expiresAt - Date.now()) / 60000));
  }

  /**
   * Configurar rotação automática
   */
  public setAutoRotation(enabled: boolean) {
    this.config.enableAutoRotation = enabled;
    
    if (enabled) {
      this.setupRotationTimer();
    } else {
      this.clearRotationTimer();
    }

    console.log(`🔄 Rotação automática ${enabled ? 'habilitada' : 'desabilitada'}`);
  }

  /**
   * Obter estatísticas de rotação
   */
  public getRotationStats() {
    return {
      rotationCount: this.tokenInfo?.rotationCount || 0,
      lastRotation: this.tokenInfo?.lastRotation || 0,
      timeUntilExpiry: this.getTimeUntilExpiry(),
      isExpiringSoon: this.isTokenExpiringSoon(),
      autoRotationEnabled: this.config.enableAutoRotation
    };
  }

  /**
   * Destruir instância e limpar timers
   */
  public destroy() {
    this.clearRotationTimer();
    this.tokenInfo = null;
    this.rotationInProgress = false;
    console.log('🔄 Sistema de rotação de tokens destruído');
  }
}

// ====================================================================
// INSTÂNCIA SINGLETON
// ====================================================================

// Configuração baseada no ambiente
const isDevelopment = import.meta.env.DEV;
const config = isDevelopment ? {
  intervalMinutes: 30, // Mais relaxado em desenvolvimento
  warningThresholdMinutes: 10,
  enableAutoRotation: true
} : {
  intervalMinutes: 15, // Mais restritivo em produção
  warningThresholdMinutes: 5,
  enableAutoRotation: true
};

export const tokenRotationManager = new TokenRotationManager(config);

// Hook para React
export const useTokenRotation = () => {
  const [stats, setStats] = React.useState(tokenRotationManager.getRotationStats());

  React.useEffect(() => {
    const updateStats = () => setStats(tokenRotationManager.getRotationStats());
    
    // Atualizar stats a cada minuto
    const interval = setInterval(updateStats, 60000);
    
    // Listener para rotações de token
    const handleTokenRotation = () => updateStats();
    window.addEventListener('tokenRotated', handleTokenRotation);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tokenRotated', handleTokenRotation);
    };
  }, []);

  return {
    ...stats,
    forceRotation: () => tokenRotationManager.forceRotation(),
    setAutoRotation: (enabled: boolean) => tokenRotationManager.setAutoRotation(enabled)
  };
};

export default tokenRotationManager;