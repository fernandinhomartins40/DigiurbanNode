/**
 * SISTEMA SIMPLIFICADO DE NOTIFICAÇÕES - SEM SUPABASE
 * 
 * Implementação básica que pode ser expandida com WebSockets futuramente.
 * Remove todas as dependências do Supabase.
 */

export interface NotificacaoRealTime {
  id: string;
  user_id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  categoria: string;
  lida: boolean;
  metadata?: any;
  created_at: string;
}

export interface AlertaCritico {
  id: string;
  titulo: string;
  descricao: string;
  nivel: 'baixo' | 'medio' | 'alto' | 'critico';
  origem: string;
  origem_id: string;
  resolvido: boolean;
  created_at: string;
}

// =====================================================
// GERENCIADOR SIMPLIFICADO DE NOTIFICAÇÕES
// =====================================================

export class SimpleNotificationManager {
  private callbacks: Map<string, Function[]> = new Map();
  private notifications: NotificacaoRealTime[] = [];
  private alerts: AlertaCritico[] = [];
  private userId: string | null = null;

  // Conectar (por enquanto apenas salva o user ID)
  async connect(userId: string) {
    this.userId = userId;
    console.log(`📡 Notifications connected for user: ${userId}`);
    
    // Carregar notificações existentes
    await this.loadNotifications();
    return true;
  }

  // Desconectar
  disconnect() {
    this.callbacks.clear();
    this.userId = null;
    console.log('📡 Notifications disconnected');
  }

  // Carregar notificações (mock por enquanto)
  private async loadNotifications() {
    try {
      // Futuramente, fazer chamada para API
      // Por enquanto, criar algumas notificações de exemplo
      this.notifications = [
        {
          id: '1',
          user_id: this.userId!,
          titulo: 'Bem-vindo ao Sistema',
          mensagem: 'Sistema DigiUrban inicializado com sucesso',
          tipo: 'success',
          categoria: 'sistema',
          lida: false,
          created_at: new Date().toISOString()
        }
      ];

      this.alerts = [];
      
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  }

  // Obter notificações
  getNotifications(): NotificacaoRealTime[] {
    return this.notifications;
  }

  // Obter alertas
  getAlerts(): AlertaCritico[] {
    return this.alerts;
  }

  // Marcar notificação como lida
  async markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.lida = true;
      this.triggerCallback('notification_read', notification);
    }
  }

  // Adicionar notificação (para testes)
  addNotification(notification: Omit<NotificacaoRealTime, 'id' | 'created_at'>) {
    const newNotification: NotificacaoRealTime = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    this.notifications.unshift(newNotification);
    this.triggerCallback('new_notification', newNotification);
  }

  // Adicionar alerta (para testes)
  addAlert(alert: Omit<AlertaCritico, 'id' | 'created_at'>) {
    const newAlert: AlertaCritico = {
      ...alert,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    this.alerts.unshift(newAlert);
    this.triggerCallback('new_alert', newAlert);
  }

  // Resolver alerta
  async resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolvido = true;
      this.triggerCallback('alert_resolved', alert);
    }
  }

  // Registrar callback
  on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  // Remover callback
  off(event: string, callback: Function) {
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Disparar callback
  private triggerCallback(event: string, data: any) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no callback ${event}:`, error);
        }
      });
    }
  }

  // Estatísticas
  getStats() {
    const total = this.notifications.length;
    const unread = this.notifications.filter(n => !n.lida).length;
    const alerts = this.alerts.filter(a => !a.resolvido).length;
    
    return {
      total_notifications: total,
      unread_notifications: unread,
      active_alerts: alerts
    };
  }
}

// Instância global
export const notificationManager = new SimpleNotificationManager();

// Hook para usar em componentes React
import { useState, useEffect } from 'react';

export const useRealtimeNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<NotificacaoRealTime[]>([]);
  const [alerts, setAlerts] = useState<AlertaCritico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      const init = async () => {
        await notificationManager.connect(userId);
        setNotifications(notificationManager.getNotifications());
        setAlerts(notificationManager.getAlerts());
        setLoading(false);
      };

      init();

      // Registrar callbacks
      const onNewNotification = () => {
        setNotifications(notificationManager.getNotifications());
      };

      const onNewAlert = () => {
        setAlerts(notificationManager.getAlerts());
      };

      notificationManager.on('new_notification', onNewNotification);
      notificationManager.on('new_alert', onNewAlert);
      notificationManager.on('notification_read', onNewNotification);
      notificationManager.on('alert_resolved', onNewAlert);

      return () => {
        notificationManager.off('new_notification', onNewNotification);
        notificationManager.off('new_alert', onNewAlert);
        notificationManager.off('notification_read', onNewNotification);
        notificationManager.off('alert_resolved', onNewAlert);
      };
    }
  }, [userId]);

  return {
    notifications,
    alerts,
    loading,
    markAsRead: notificationManager.markAsRead.bind(notificationManager),
    resolveAlert: notificationManager.resolveAlert.bind(notificationManager),
    stats: notificationManager.getStats()
  };
};