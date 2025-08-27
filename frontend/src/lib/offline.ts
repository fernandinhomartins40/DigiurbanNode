// =====================================================
// SISTEMA DE FALLBACK PARA CONECTIVIDADE OFFLINE
// =====================================================

interface OfflineAction {
  id: string;
  type: 'create_protocol' | 'update_protocol' | 'add_comment' | 'upload_file';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface ConnectionStatus {
  isOnline: boolean;
  lastOnline: number;
  lastOffline: number;
  connectionType?: string;
  effectiveType?: string;
}

export class OfflineManager {
  private pendingActions: OfflineAction[] = [];
  private connectionStatus: ConnectionStatus = {
    isOnline: navigator.onLine,
    lastOnline: Date.now(),
    lastOffline: 0
  };
  private syncInProgress = false;
  private storageKey = 'digiurban_offline_actions';
  private statusKey = 'digiurban_connection_status';

  constructor() {
    this.loadPendingActions();
    this.loadConnectionStatus();
    this.setupEventListeners();
    this.setupNetworkInformation();
  }

  // Configurar listeners de eventos
  private setupEventListeners(): void {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Tentar sincronizar quando a página ganha foco
    window.addEventListener('focus', () => {
      if (navigator.onLine && this.pendingActions.length > 0) {
        this.syncPendingActions();
      }
    });

    // Sincronizar antes da página ser fechada
    window.addEventListener('beforeunload', () => {
      this.savePendingActions();
      this.saveConnectionStatus();
    });
  }

  // Configurar informações de rede (quando disponível)
  private setupNetworkInformation(): void {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection) {
      this.connectionStatus.connectionType = connection.type;
      this.connectionStatus.effectiveType = connection.effectiveType;
      
      connection.addEventListener('change', () => {
        this.connectionStatus.connectionType = connection.type;
        this.connectionStatus.effectiveType = connection.effectiveType;
        console.log('[OFFLINE] Network changed:', {
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink
        });
      });
    }
  }

  // Lidar com evento online
  private handleOnline(): void {
    console.log('[OFFLINE] Connection restored');
    this.connectionStatus.isOnline = true;
    this.connectionStatus.lastOnline = Date.now();
    
    // Tentar sincronizar ações pendentes
    if (this.pendingActions.length > 0) {
      console.log(`[OFFLINE] Syncing ${this.pendingActions.length} pending actions`);
      this.syncPendingActions();
    }
    
    this.saveConnectionStatus();
    this.notifyConnectionChange(true);
  }

  // Lidar com evento offline
  private handleOffline(): void {
    console.log('[OFFLINE] Connection lost');
    this.connectionStatus.isOnline = false;
    this.connectionStatus.lastOffline = Date.now();
    
    this.saveConnectionStatus();
    this.notifyConnectionChange(false);
  }

  // Notificar mudança de conexão
  private notifyConnectionChange(isOnline: boolean): void {
    const event = new CustomEvent('connectionStatusChanged', {
      detail: { isOnline, status: this.connectionStatus }
    });
    window.dispatchEvent(event);
  }

  // Verificar se está online
  isOnline(): boolean {
    return this.connectionStatus.isOnline && navigator.onLine;
  }

  // Obter status da conexão
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  // Adicionar ação para execução offline
  addOfflineAction(
    type: OfflineAction['type'],
    data: any,
    maxRetries: number = 3
  ): string {
    const action: OfflineAction = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    this.pendingActions.push(action);
    this.savePendingActions();
    
    console.log(`[OFFLINE] Action queued: ${type}`, action);
    
    // Se estiver online, tentar sincronizar imediatamente
    if (this.isOnline()) {
      this.syncPendingActions();
    }

    return action.id;
  }

  // Sincronizar ações pendentes
  async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline() || this.pendingActions.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`[OFFLINE] Starting sync of ${this.pendingActions.length} actions`);

    const actionsToProcess = [...this.pendingActions];
    let successCount = 0;
    let failCount = 0;

    for (const action of actionsToProcess) {
      try {
        await this.executeAction(action);
        
        // Remover ação bem-sucedida
        this.pendingActions = this.pendingActions.filter(a => a.id !== action.id);
        successCount++;
        
        console.log(`[OFFLINE] Action synced: ${action.type}`);
      } catch (error) {
        console.error(`[OFFLINE] Action failed: ${action.type}`, error);
        
        // Incrementar contador de tentativas
        const actionIndex = this.pendingActions.findIndex(a => a.id === action.id);
        if (actionIndex !== -1) {
          this.pendingActions[actionIndex].retryCount++;
          
          // Remover se excedeu max tentativas
          if (this.pendingActions[actionIndex].retryCount >= action.maxRetries) {
            this.pendingActions.splice(actionIndex, 1);
            console.warn(`[OFFLINE] Action discarded after ${action.maxRetries} attempts: ${action.type}`);
          }
        }
        
        failCount++;
      }
    }

    this.savePendingActions();
    this.syncInProgress = false;
    
    console.log(`[OFFLINE] Sync completed: ${successCount} success, ${failCount} failed`);
    
    // Notificar resultado da sincronização
    const event = new CustomEvent('offlineSyncCompleted', {
      detail: { successCount, failCount, pendingCount: this.pendingActions.length }
    });
    window.dispatchEvent(event);
  }

  // Executar ação específica
  private async executeAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'create_protocol':
        await this.executeCreateProtocol(action.data);
        break;
      case 'update_protocol':
        await this.executeUpdateProtocol(action.data);
        break;
      case 'add_comment':
        await this.executeAddComment(action.data);
        break;
      case 'upload_file':
        await this.executeUploadFile(action.data);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Executar criação de protocolo
  private async executeCreateProtocol(data: any): Promise<void> {
    const { protocolosService } = await import('./protocolos');
    await protocolosService.criar(data.protocolData);
  }

  // Executar atualização de protocolo
  private async executeUpdateProtocol(data: any): Promise<void> {
    const { protocolosService } = await import('./protocolos');
    await protocolosService.atualizar(data.protocolId, data.updateData);
  }

  // Executar adição de comentário
  private async executeAddComment(data: any): Promise<void> {
    const { protocolosService } = await import('./protocolos');
    await protocolosService.adicionarComentario(
      data.protocoloId,
      data.comentario,
      data.tipo,
      data.visivelCidadao
    );
  }

  // Executar upload de arquivo
  private async executeUploadFile(data: any): Promise<void> {
    const { protocolosService } = await import('./protocolos');
    await protocolosService.adicionarAnexo(
      data.protocoloId,
      data.arquivo,
      data.tipoAnexo,
      data.obrigatorio
    );
  }

  // Obter ações pendentes
  getPendingActions(): OfflineAction[] {
    return [...this.pendingActions];
  }

  // Limpar ações pendentes
  clearPendingActions(): void {
    this.pendingActions = [];
    this.savePendingActions();
    console.log('[OFFLINE] Pending actions cleared');
  }

  // Salvar ações pendentes no localStorage
  private savePendingActions(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.pendingActions));
    } catch (error) {
      console.error('[OFFLINE] Failed to save pending actions:', error);
    }
  }

  // Carregar ações pendentes do localStorage
  private loadPendingActions(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.pendingActions = JSON.parse(stored);
        console.log(`[OFFLINE] Loaded ${this.pendingActions.length} pending actions`);
      }
    } catch (error) {
      console.error('[OFFLINE] Failed to load pending actions:', error);
      this.pendingActions = [];
    }
  }

  // Salvar status da conexão
  private saveConnectionStatus(): void {
    try {
      localStorage.setItem(this.statusKey, JSON.stringify(this.connectionStatus));
    } catch (error) {
      console.error('[OFFLINE] Failed to save connection status:', error);
    }
  }

  // Carregar status da conexão
  private loadConnectionStatus(): void {
    try {
      const stored = localStorage.getItem(this.statusKey);
      if (stored) {
        const loaded = JSON.parse(stored);
        this.connectionStatus = { ...this.connectionStatus, ...loaded };
      }
    } catch (error) {
      console.error('[OFFLINE] Failed to load connection status:', error);
    }
  }

  // Verificar qualidade da conexão
  getConnectionQuality(): 'excellent' | 'good' | 'poor' | 'offline' {
    if (!this.isOnline()) return 'offline';

    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (!connection) return 'good'; // Assumir boa conexão se não conseguir detectar

    const effectiveType = connection.effectiveType;
    
    switch (effectiveType) {
      case '4g':
        return 'excellent';
      case '3g':
        return 'good';
      case '2g':
      case 'slow-2g':
        return 'poor';
      default:
        return 'good';
    }
  }

  // Estimar tempo de upload baseado na conexão
  estimateUploadTime(fileSizeBytes: number): number {
    const quality = this.getConnectionQuality();
    
    // Velocidades estimadas em bytes/segundo
    const speeds = {
      excellent: 1000000, // 1MB/s
      good: 300000,       // 300KB/s
      poor: 50000,        // 50KB/s
      offline: 0
    };

    const speed = speeds[quality];
    return speed > 0 ? Math.ceil(fileSizeBytes / speed) : Infinity;
  }
}

// =====================================================
// INSTÂNCIA GLOBAL E HELPERS
// =====================================================

export const offlineManager = new OfflineManager();

// Helper para executar operações com fallback offline
export async function executeWithOfflineFallback<T>(
  operation: () => Promise<T>,
  offlineAction?: {
    type: OfflineAction['type'];
    data: any;
    maxRetries?: number;
  }
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('[OFFLINE] Operation failed:', error);
    
    if (offlineAction && !offlineManager.isOnline()) {
      console.log('[OFFLINE] Queueing action for later sync');
      offlineManager.addOfflineAction(
        offlineAction.type,
        offlineAction.data,
        offlineAction.maxRetries
      );
      
      // Retornar um resultado temporário ou lançar erro específico
      throw new Error('OFFLINE_QUEUED');
    }
    
    throw error;
  }
}

// =====================================================
// HOOK PARA REACT
// =====================================================

import { useState, useEffect } from 'react';

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(offlineManager.isOnline());
  const [pendingActionsCount, setPendingActionsCount] = useState(
    offlineManager.getPendingActions().length
  );
  const [connectionQuality, setConnectionQuality] = useState(
    offlineManager.getConnectionQuality()
  );

  useEffect(() => {
    const handleConnectionChange = (event: any) => {
      setIsOnline(event.detail.isOnline);
      setConnectionQuality(offlineManager.getConnectionQuality());
    };

    const handleSyncCompleted = (event: any) => {
      setPendingActionsCount(event.detail.pendingCount);
    };

    window.addEventListener('connectionStatusChanged', handleConnectionChange);
    window.addEventListener('offlineSyncCompleted', handleSyncCompleted);

    // Atualizar contadores periodicamente
    const interval = setInterval(() => {
      setPendingActionsCount(offlineManager.getPendingActions().length);
      setConnectionQuality(offlineManager.getConnectionQuality());
    }, 5000);

    return () => {
      window.removeEventListener('connectionStatusChanged', handleConnectionChange);
      window.removeEventListener('offlineSyncCompleted', handleSyncCompleted);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    pendingActionsCount,
    connectionQuality,
    connectionStatus: offlineManager.getConnectionStatus(),
    syncPendingActions: () => offlineManager.syncPendingActions(),
    clearPendingActions: () => {
      offlineManager.clearPendingActions();
      setPendingActionsCount(0);
    }
  };
};