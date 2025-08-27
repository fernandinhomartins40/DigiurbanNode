import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// =====================================================
// TIPOS DE DADOS
// =====================================================

export type TipoNotificacao = 'info' | 'sucesso' | 'aviso' | 'erro' | 'protocolo';

export interface Notificacao {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacao;
  referencia_tipo?: string;
  referencia_id?: string;
  lida: boolean;
  lida_em?: string;
  push_enviado: boolean;
  email_enviado: boolean;
  created_at: string;
}

export interface CriarNotificacaoData {
  usuario_id: string;
  titulo: string;
  mensagem: string;
  tipo?: TipoNotificacao;
  referencia_tipo?: string;
  referencia_id?: string;
}

export interface FiltrosNotificacao {
  tipo?: TipoNotificacao;
  lida?: boolean;
  limit?: number;
  offset?: number;
}

// =====================================================
// SERVIÇO DE NOTIFICAÇÕES
// =====================================================

export const notificacoesService = {
  // Criar nova notificação
  async criar(dados: CriarNotificacaoData): Promise<Notificacao> {
    const { data, error } = await supabase
      .from('notificacoes')
      .insert({
        usuario_id: dados.usuario_id,
        titulo: dados.titulo,
        mensagem: dados.mensagem,
        tipo: dados.tipo || 'info',
        referencia_tipo: dados.referencia_tipo,
        referencia_id: dados.referencia_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Listar notificações do usuário atual
  async listar(filtros?: FiltrosNotificacao): Promise<Notificacao[]> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', user.user.id);

    // Aplicar filtros
    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }

    if (filtros?.lida !== undefined) {
      query = query.eq('lida', filtros.lida);
    }

    // Ordenação e paginação
    query = query.order('created_at', { ascending: false });

    if (filtros?.limit) {
      query = query.limit(filtros.limit);
    }

    if (filtros?.offset) {
      query = query.range(filtros.offset, filtros.offset + (filtros.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Contar notificações não lidas
  async contarNaoLidas(): Promise<number> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('Usuário não autenticado');
    }

    const { count, error } = await supabase
      .from('notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', user.user.id)
      .eq('lida', false);

    if (error) throw error;
    return count || 0;
  },

  // Marcar notificação como lida
  async marcarComoLida(id: string): Promise<Notificacao> {
    const { data, error } = await supabase
      .from('notificacoes')
      .update({ 
        lida: true, 
        lida_em: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Marcar várias notificações como lidas
  async marcarVariasComoLidas(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('notificacoes')
      .update({ 
        lida: true, 
        lida_em: new Date().toISOString() 
      })
      .in('id', ids);

    if (error) throw error;
  },

  // Marcar todas as notificações como lidas
  async marcarTodasComoLidas(): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await supabase
      .from('notificacoes')
      .update({ 
        lida: true, 
        lida_em: new Date().toISOString() 
      })
      .eq('usuario_id', user.user.id)
      .eq('lida', false);

    if (error) throw error;
  },

  // Deletar notificação
  async deletar(id: string): Promise<void> {
    const { error } = await supabase
      .from('notificacoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Deletar várias notificações
  async deletarVarias(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('notificacoes')
      .delete()
      .in('id', ids);

    if (error) throw error;
  },

  // Deletar todas as notificações lidas
  async deletarTodasLidas(): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await supabase
      .from('notificacoes')
      .delete()
      .eq('usuario_id', user.user.id)
      .eq('lida', true);

    if (error) throw error;
  },

  // Subscription para notificações em tempo real
  subscribeToNotifications(
    userId: string, 
    callback: (notificacao: Notificacao) => void
  ): RealtimeChannel {
    return supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `usuario_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notificacao);
        }
      )
      .subscribe();
  },

  // Subscription para atualizações de notificações
  subscribeToNotificationUpdates(
    userId: string,
    callback: (notificacao: Notificacao) => void
  ): RealtimeChannel {
    return supabase
      .channel('user-notification-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notificacoes',
          filter: `usuario_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notificacao);
        }
      )
      .subscribe();
  },

  // Formatar tipo de notificação para exibição
  formatarTipo(tipo: TipoNotificacao): string {
    const tipoMap: Record<TipoNotificacao, string> = {
      'info': 'Informação',
      'sucesso': 'Sucesso',
      'aviso': 'Aviso',
      'erro': 'Erro',
      'protocolo': 'Protocolo'
    };
    
    return tipoMap[tipo] || tipo;
  },

  // Obter cor do tipo de notificação
  obterCorTipo(tipo: TipoNotificacao): string {
    const coresMap: Record<TipoNotificacao, string> = {
      'info': 'blue',
      'sucesso': 'green',
      'aviso': 'yellow',
      'erro': 'red',
      'protocolo': 'purple'
    };
    
    return coresMap[tipo] || 'gray';
  },

  // Obter ícone do tipo de notificação
  obterIconeTipo(tipo: TipoNotificacao): string {
    const iconesMap: Record<TipoNotificacao, string> = {
      'info': 'info-circle',
      'sucesso': 'check-circle',
      'aviso': 'alert-triangle',
      'erro': 'x-circle',
      'protocolo': 'file-text'
    };
    
    return iconesMap[tipo] || 'bell';
  }
};

// =====================================================
// UTILITÁRIOS PARA NOTIFICAÇÕES ESPECÍFICAS
// =====================================================

export const notificacoesUtils = {
  // Notificação de novo protocolo para secretaria
  async notificarNovoProtocolo(
    secretariaId: string,
    numeroProtocolo: string,
    tituloProtocolo: string,
    protocoloId: string
  ): Promise<void> {
    // Buscar usuários da secretaria
    const { data: usuarios } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('secretaria_id', secretariaId)
      .neq('tipo_usuario', 'cidadao');

    if (!usuarios || usuarios.length === 0) return;

    // Criar notificação para cada usuário da secretaria
    const notificacoes = usuarios.map(usuario => ({
      usuario_id: usuario.id,
      titulo: 'Novo Protocolo Recebido',
      mensagem: `Novo protocolo ${numeroProtocolo}: ${tituloProtocolo}`,
      tipo: 'protocolo' as TipoNotificacao,
      referencia_tipo: 'protocolo',
      referencia_id: protocoloId
    }));

    const { error } = await supabase
      .from('notificacoes')
      .insert(notificacoes);

    if (error) throw error;
  },

  // Notificação de atualização de protocolo para cidadão
  async notificarAtualizacaoProtocolo(
    cidadaoId: string,
    numeroProtocolo: string,
    novoStatus: string,
    protocoloId: string
  ): Promise<void> {
    await notificacoesService.criar({
      usuario_id: cidadaoId,
      titulo: 'Protocolo Atualizado',
      mensagem: `Seu protocolo ${numeroProtocolo} foi atualizado para: ${novoStatus}`,
      tipo: 'protocolo',
      referencia_tipo: 'protocolo',
      referencia_id: protocoloId
    });
  },

  // Notificação de aprovação de protocolo
  async notificarAprovacaoProtocolo(
    cidadaoId: string,
    numeroProtocolo: string,
    protocoloId: string
  ): Promise<void> {
    await notificacoesService.criar({
      usuario_id: cidadaoId,
      titulo: 'Protocolo Aprovado',
      mensagem: `Seu protocolo ${numeroProtocolo} foi aprovado pela administração`,
      tipo: 'sucesso',
      referencia_tipo: 'protocolo',
      referencia_id: protocoloId
    });
  },

  // Notificação de rejeição de protocolo
  async notificarRejeicaoProtocolo(
    cidadaoId: string,
    numeroProtocolo: string,
    motivo: string,
    protocoloId: string
  ): Promise<void> {
    await notificacoesService.criar({
      usuario_id: cidadaoId,
      titulo: 'Protocolo Rejeitado',
      mensagem: `Seu protocolo ${numeroProtocolo} foi rejeitado. Motivo: ${motivo}`,
      tipo: 'erro',
      referencia_tipo: 'protocolo',
      referencia_id: protocoloId
    });
  },

  // Notificação de protocolo próximo ao vencimento
  async notificarProtocoloVencendo(
    responsavelId: string,
    numeroProtocolo: string,
    diasRestantes: number,
    protocoloId: string
  ): Promise<void> {
    await notificacoesService.criar({
      usuario_id: responsavelId,
      titulo: 'Protocolo Próximo ao Vencimento',
      mensagem: `O protocolo ${numeroProtocolo} vence em ${diasRestantes} dias`,
      tipo: 'aviso',
      referencia_tipo: 'protocolo',
      referencia_id: protocoloId
    });
  },

  // Notificação de documentos solicitados
  async notificarDocumentosSolicitados(
    cidadaoId: string,
    numeroProtocolo: string,
    documentos: string[],
    protocoloId: string
  ): Promise<void> {
    const listaDocumentos = documentos.join(', ');
    
    await notificacoesService.criar({
      usuario_id: cidadaoId,
      titulo: 'Documentos Solicitados',
      mensagem: `Para o protocolo ${numeroProtocolo}, favor enviar: ${listaDocumentos}`,
      tipo: 'aviso',
      referencia_tipo: 'protocolo',
      referencia_id: protocoloId
    });
  }
};

// =====================================================
// HOOK PARA INTEGRAÇÃO COM REACT
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/auth';

export const useNotificacoes = (filtros?: FiltrosNotificacao) => {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [totalNaoLidas, setTotalNaoLidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar notificações
  const carregarNotificacoes = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const [notificacoesData, countData] = await Promise.all([
        notificacoesService.listar(filtros),
        notificacoesService.contarNaoLidas()
      ]);
      
      setNotificacoes(notificacoesData);
      setTotalNaoLidas(countData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, [user, filtros]);

  // Marcar como lida
  const marcarComoLida = useCallback(async (id: string) => {
    try {
      await notificacoesService.marcarComoLida(id);
      
      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(notif => 
          notif.id === id 
            ? { ...notif, lida: true, lida_em: new Date().toISOString() }
            : notif
        )
      );
      
      setTotalNaoLidas(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar notificação como lida');
    }
  }, []);

  // Marcar todas como lidas
  const marcarTodasComoLidas = useCallback(async () => {
    try {
      await notificacoesService.marcarTodasComoLidas();
      
      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(notif => ({ 
          ...notif, 
          lida: true, 
          lida_em: new Date().toISOString() 
        }))
      );
      
      setTotalNaoLidas(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar todas as notificações como lidas');
    }
  }, []);

  // Deletar notificação
  const deletarNotificacao = useCallback(async (id: string) => {
    try {
      await notificacoesService.deletar(id);
      
      // Remover do estado local
      const notificacao = notificacoes.find(n => n.id === id);
      setNotificacoes(prev => prev.filter(notif => notif.id !== id));
      
      // Atualizar contador se era não lida
      if (notificacao && !notificacao.lida) {
        setTotalNaoLidas(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar notificação');
    }
  }, [notificacoes]);

  // Subscription para novas notificações
  useEffect(() => {
    if (!user) return;

    const subscription = notificacoesService.subscribeToNotifications(
      user.id,
      (novaNotificacao) => {
        setNotificacoes(prev => [novaNotificacao, ...prev]);
        setTotalNaoLidas(prev => prev + 1);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarNotificacoes();
  }, [carregarNotificacoes]);

  return {
    notificacoes,
    totalNaoLidas,
    loading,
    error,
    marcarComoLida,
    marcarTodasComoLidas,
    deletarNotificacao,
    recarregar: carregarNotificacoes
  };
};

// Hook específico para contador de notificações não lidas
export const useNotificacoesNaoLidas = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const carregarCount = async () => {
      try {
        const total = await notificacoesService.contarNaoLidas();
        setCount(total);
      } catch (err) {
        console.error('Erro ao carregar contador de notificações:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarCount();

    // Subscription para atualizações em tempo real
    const subscription = notificacoesService.subscribeToNotifications(
      user.id,
      () => {
        setCount(prev => prev + 1);
      }
    );

    const updateSubscription = notificacoesService.subscribeToNotificationUpdates(
      user.id,
      (notificacao) => {
        if (notificacao.lida) {
          setCount(prev => Math.max(0, prev - 1));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      updateSubscription.unsubscribe();
    };
  }, [user]);

  return { count, loading };
};