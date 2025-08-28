import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Clock, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { APIClient } from '@/auth/utils/httpInterceptor';
import { useAuth } from '@/auth'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Notificacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'protocolo_atualizado' | 'protocolo_criado' | 'documento_solicitado' | 'avaliacao_solicitada' | 'mensagem';
  protocolo_id?: string;
  protocolo_numero?: string;
  lida: boolean;
  created_at: string;
  data_completa?: any;
}

const NotificacoesRealTime = () => {
  const { profile: user } = useAuth();
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Carregar notificações iniciais
  useEffect(() => {
    if (!user) return;
    
    carregarNotificacoes();
    configurarRealtimeSubscription();
  }, [user]);

  const carregarNotificacoes = async () => {
    try {
      // Simulando notificações baseadas em protocolos recentes
      // Na implementação real, isso viria de uma tabela de notificações
      const { data: protocolos, error } = await supabase
        .from('protocolos_completos')
        .select(`
          id,
          numero_protocolo,
          assunto,
          status,
          created_at,
          updated_at
        `)
        .eq('cidadao_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Converter protocolos em notificações
      const notificacoesSimuladas: Notificacao[] = [];
      
      protocolos?.forEach(protocolo => {
        const agora = new Date();
        const criadoEm = new Date(protocolo.created_at);
        const atualizadoEm = new Date(protocolo.updated_at);
        
        // Notificação de criação (se criado hoje)
        if (agora.getTime() - criadoEm.getTime() < 24 * 60 * 60 * 1000) {
          notificacoesSimuladas.push({
            id: `criacao-${protocolo.id}`,
            titulo: 'Protocolo Criado',
            descricao: `Seu protocolo ${protocolo.numero_protocolo} foi registrado com sucesso`,
            tipo: 'protocolo_criado',
            protocolo_id: protocolo.id,
            protocolo_numero: protocolo.numero_protocolo,
            lida: false,
            created_at: protocolo.created_at,
            data_completa: protocolo
          });
        }
        
        // Notificação de atualização (se atualizado recentemente e diferente da criação)
        if (atualizadoEm.getTime() !== criadoEm.getTime() && 
            agora.getTime() - atualizadoEm.getTime() < 48 * 60 * 60 * 1000) {
          notificacoesSimuladas.push({
            id: `atualizacao-${protocolo.id}`,
            titulo: 'Protocolo Atualizado',
            descricao: `Status do protocolo ${protocolo.numero_protocolo} foi alterado para "${getStatusLabel(protocolo.status)}"`,
            tipo: 'protocolo_atualizado',
            protocolo_id: protocolo.id,
            protocolo_numero: protocolo.numero_protocolo,
            lida: Math.random() > 0.5, // Simular algumas lidas
            created_at: protocolo.updated_at,
            data_completa: protocolo
          });
        }

        // Notificações específicas por status
        if (protocolo.status === 'aguardando_documentos') {
          notificacoesSimuladas.push({
            id: `docs-${protocolo.id}`,
            titulo: 'Documentos Solicitados',
            descricao: `Documentos adicionais são necessários para o protocolo ${protocolo.numero_protocolo}`,
            tipo: 'documento_solicitado',
            protocolo_id: protocolo.id,
            protocolo_numero: protocolo.numero_protocolo,
            lida: false,
            created_at: protocolo.updated_at,
            data_completa: protocolo
          });
        }

        if (protocolo.status === 'concluido') {
          notificacoesSimuladas.push({
            id: `avaliacao-${protocolo.id}`,
            titulo: 'Avalie Nosso Serviço',
            descricao: `Seu protocolo ${protocolo.numero_protocolo} foi concluído. Que tal avaliar nosso atendimento?`,
            tipo: 'avaliacao_solicitada',
            protocolo_id: protocolo.id,
            protocolo_numero: protocolo.numero_protocolo,
            lida: false,
            created_at: protocolo.updated_at,
            data_completa: protocolo
          });
        }
      });

      // Ordenar por data mais recente
      notificacoesSimuladas.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotificacoes(notificacoesSimuladas);
      setNaoLidas(notificacoesSimuladas.filter(n => !n.lida).length);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setLoading(false);
    }
  };

  const configurarRealtimeSubscription = () => {
    if (!user) return;

    // Escutar mudanças nos protocolos do usuário
    const subscription = supabase
      .channel('protocolo_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'protocolos_completos',
          filter: `cidadao_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Change received!', payload);
          
          // Recarregar notificações quando houver mudanças
          await carregarNotificacoes();
          
          // Mostrar toast para mudanças importantes
          if (payload.eventType === 'UPDATE') {
            const protocolo = payload.new as any;
            toast.success(
              `Protocolo ${protocolo.numero_protocolo} atualizado para: ${getStatusLabel(protocolo.status)}`,
              { duration: 5000 }
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const marcarComoLida = async (notificacaoId: string) => {
    setNotificacoes(prev => 
      prev.map(n => 
        n.id === notificacaoId ? { ...n, lida: true } : n
      )
    );
    setNaoLidas(prev => Math.max(0, prev - 1));
  };

  const marcarTodasComoLidas = async () => {
    setNotificacoes(prev => 
      prev.map(n => ({ ...n, lida: true }))
    );
    setNaoLidas(0);
  };

  const handleNotificacaoClick = (notificacao: Notificacao) => {
    marcarComoLida(notificacao.id);
    setOpen(false);
    
    if (notificacao.protocolo_id) {
      navigate(`/protocolo/${notificacao.protocolo_id}`);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'aberto': 'Aberto',
      'em_andamento': 'Em Andamento', 
      'aguardando_documentos': 'Aguardando Documentos',
      'aguardando_aprovacao': 'Aguardando Aprovação',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getIconForTipo = (tipo: string) => {
    switch (tipo) {
      case 'protocolo_criado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'protocolo_atualizado':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'documento_solicitado':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'avaliacao_solicitada':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatarTempo = (dataISO: string) => {
    const agora = new Date();
    const data = new Date(dataISO);
    const diffInMs = agora.getTime() - data.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else if (diffInDays === 1) {
      return 'Ontem';
    } else {
      return `${diffInDays} dias atrás`;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {naoLidas > 99 ? '99+' : naoLidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            {naoLidas > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={marcarTodasComoLidas}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Carregando notificações...
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    !notificacao.lida ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => handleNotificacaoClick(notificacao)}
                >
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIconForTipo(notificacao.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notificacao.lida ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notificacao.titulo}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notificacao.descricao}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatarTempo(notificacao.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notificacao.lida && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificacoesRealTime;