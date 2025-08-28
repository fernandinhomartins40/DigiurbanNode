// =====================================================
// SISTEMA DE NOTIFICAÇÕES EM TEMPO REAL
// =====================================================

import { APIClient } from '@/auth/utils/httpInterceptor'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface NotificacaoRealTime {
  id: string
  user_id: string
  titulo: string
  mensagem: string
  tipo: 'info' | 'success' | 'warning' | 'error'
  categoria: string
  lida: boolean
  metadata?: any
  created_at: string
}

export interface AlertaCritico {
  id: string
  titulo: string
  descricao: string
  nivel: 'baixo' | 'medio' | 'alto' | 'critico'
  origem: string
  origem_id: string
  resolvido: boolean
  created_at: string
}

// =====================================================
// GERENCIADOR DE NOTIFICAÇÕES EM TEMPO REAL
// =====================================================

export class RealtimeNotificationManager {
  private channels: RealtimeChannel[] = []
  private callbacks: Map<string, Function[]> = new Map()
  private userId: string | null = null
  private isConnected = false

  // Conectar ao sistema de notificações
  async connect(userId: string) {
    this.userId = userId
    
    try {
      // Canal para notificações pessoais do usuário
      const userChannel = supabase
        .channel(`notificacoes_user_${userId}`)
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificacoes',
            filter: `user_id=eq.${userId}`
          },
          this.handleNotificacao.bind(this)
        )
        .subscribe()

      // Canal para alertas críticos globais
      const alertsChannel = supabase
        .channel('alertas_criticos')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alertas_criticos'
          },
          this.handleAlertaCritico.bind(this)
        )
        .subscribe()

      // Canal para updates de protocolos relacionados ao usuário
      const protocolsChannel = supabase
        .channel(`protocolos_user_${userId}`)
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'protocolos',
            filter: `cidadao_id=eq.${userId}`
          },
          this.handleProtocoloUpdate.bind(this)
        )
        .subscribe()

      this.channels = [userChannel, alertsChannel, protocolsChannel]
      this.isConnected = true
      
      console.log('✅ Notificações em tempo real conectadas')
      
    } catch (error) {
      console.error('❌ Erro ao conectar notificações:', error)
    }
  }

  // Desconectar do sistema
  async disconnect() {
    for (const channel of this.channels) {
      await supabase.removeChannel(channel)
    }
    
    this.channels = []
    this.callbacks.clear()
    this.isConnected = false
    this.userId = null
    
    console.log('🔌 Notificações desconectadas')
  }

  // Registrar callback para tipo de notificação
  onNotification(type: string, callback: Function) {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, [])
    }
    this.callbacks.get(type)?.push(callback)
  }

  // Remover callback
  offNotification(type: string, callback: Function) {
    const callbacks = this.callbacks.get(type)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // Disparar callbacks registrados
  private triggerCallbacks(type: string, data: any) {
    const callbacks = this.callbacks.get(type) || []
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Erro em callback de notificação:', error)
      }
    })
  }

  // Handler para nova notificação
  private handleNotificacao(payload: any) {
    const notificacao = payload.new as NotificacaoRealTime
    
    console.log('🔔 Nova notificação:', notificacao)
    
    this.triggerCallbacks('notificacao', notificacao)
    this.triggerCallbacks(`notificacao_${notificacao.categoria}`, notificacao)
    
    // Mostrar toast notification
    this.showToast(notificacao)
    
    // Atualizar contador de não lidas
    this.updateUnreadCount()
  }

  // Handler para alerta crítico
  private handleAlertaCritico(payload: any) {
    const alerta = payload.new as AlertaCritico
    
    console.log('🚨 Novo alerta crítico:', alerta)
    
    this.triggerCallbacks('alerta_critico', alerta)
    
    // Notificação mais intrusiva para alertas críticos
    this.showCriticalAlert(alerta)
  }

  // Handler para update de protocolo
  private handleProtocoloUpdate(payload: any) {
    const protocolo = payload.new
    const protocoloAntigo = payload.old
    
    // Se mudou o status
    if (protocolo.status !== protocoloAntigo.status) {
      console.log('📄 Protocolo atualizado:', protocolo.numero_protocolo)
      
      this.triggerCallbacks('protocolo_update', {
        protocolo,
        statusAnterior: protocoloAntigo.status,
        statusNovo: protocolo.status
      })
    }
  }

  // Mostrar toast notification
  private showToast(notificacao: NotificacaoRealTime) {
    // Integração com sistema de toast (ex: react-hot-toast)
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: notificacao.tipo,
          title: notificacao.titulo,
          message: notificacao.mensagem
        }
      }))
    }
  }

  // Mostrar alerta crítico
  private showCriticalAlert(alerta: AlertaCritico) {
    if (typeof window !== 'undefined') {
      // Notificação do browser se permitida
      if (Notification.permission === 'granted') {
        new Notification(`🚨 ${alerta.titulo}`, {
          body: alerta.descricao,
          icon: '/favicon.ico',
          tag: `alerta-${alerta.id}`
        })
      }
      
      // Evento customizado para modal de alerta
      window.dispatchEvent(new CustomEvent('show-critical-alert', {
        detail: alerta
      }))
    }
  }

  // Atualizar contador de não lidas
  private async updateUnreadCount() {
    if (!this.userId) return
    
    try {
      const { count } = await supabase
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('lida', false)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('update-unread-count', {
          detail: { count }
        }))
      }
      
    } catch (error) {
      console.error('Erro ao atualizar contador:', error)
    }
  }

  // Marcar notificação como lida
  async markAsRead(notificacaoId: string) {
    try {
      await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificacaoId)
      
      this.updateUnreadCount()
      
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  // Marcar todas como lidas
  async markAllAsRead() {
    if (!this.userId) return
    
    try {
      await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('user_id', this.userId)
        .eq('lida', false)
      
      this.updateUnreadCount()
      
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  // Criar nova notificação
  async createNotification(
    userId: string, 
    titulo: string, 
    mensagem: string, 
    tipo: NotificacaoRealTime['tipo'] = 'info',
    categoria: string = 'sistema',
    metadata?: any
  ) {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .insert([{
          user_id: userId,
          titulo,
          mensagem,
          tipo,
          categoria,
          metadata
        }])
      
      if (error) throw error
      
      console.log('✅ Notificação criada para usuário:', userId)
      
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error)
      throw error
    }
  }

  // Criar alerta crítico
  async createCriticalAlert(
    titulo: string,
    descricao: string,
    nivel: AlertaCritico['nivel'],
    origem: string,
    origemId: string
  ) {
    try {
      const { error } = await supabase
        .from('alertas_criticos')
        .insert([{
          titulo,
          descricao,
          nivel,
          origem,
          origem_id: origemId
        }])
      
      if (error) throw error
      
      console.log('🚨 Alerta crítico criado')
      
    } catch (error) {
      console.error('❌ Erro ao criar alerta:', error)
      throw error
    }
  }

  // Status da conexão
  get connected() {
    return this.isConnected
  }
}

// =====================================================
// INSTÂNCIA GLOBAL
// =====================================================

export const notificationManager = new RealtimeNotificationManager()

// =====================================================
// HOOK PARA REACT
// =====================================================

import { useEffect, useState } from 'react'
import { useAuth } from '@/auth';

export const useRealtimeNotifications = () => {
  const { profile: user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    // Conectar ao sistema de notificações
    notificationManager.connect(user.id).then(() => {
      setConnected(true)
    })

    // Listeners para eventos
    const handleUnreadUpdate = (event: CustomEvent) => {
      setUnreadCount(event.detail.count || 0)
    }

    window.addEventListener('update-unread-count', handleUnreadUpdate as EventListener)

    // Buscar contagem inicial
    const fetchInitialCount = async () => {
      try {
        const { count } = await supabase
          .from('notificacoes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('lida', false)
        
        setUnreadCount(count || 0)
      } catch (error) {
        console.error('Erro ao buscar contagem inicial:', error)
      }
    }

    fetchInitialCount()

    return () => {
      window.removeEventListener('update-unread-count', handleUnreadUpdate as EventListener)
      notificationManager.disconnect()
      setConnected(false)
    }
  }, [user?.id])

  return {
    connected,
    unreadCount,
    markAsRead: notificationManager.markAsRead.bind(notificationManager),
    markAllAsRead: notificationManager.markAllAsRead.bind(notificationManager),
    onNotification: notificationManager.onNotification.bind(notificationManager),
    offNotification: notificationManager.offNotification.bind(notificationManager)
  }
}