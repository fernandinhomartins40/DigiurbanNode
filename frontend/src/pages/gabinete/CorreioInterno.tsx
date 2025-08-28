import React from 'react';
import { FC, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, Send, Inbox, Archive, Trash2, Plus, Search, 
  Paperclip, Clock, AlertCircle, CheckCircle, Eye,
  Reply, Forward, Star, Filter, Users, MessageSquare
} from "lucide-react";
import { APIClient } from "@/auth";
import { useAuth, UserProfile } from "@/auth";
import { toast } from "react-hot-toast";

interface CorreioMessage {
  id: string;
  remetente_id: string;
  assunto: string;
  conteudo: string;
  prioridade: 'normal' | 'alta' | 'urgente';
  anexos?: string[];
  protocolo_relacionado_id?: string;
  lida: boolean;
  arquivada: boolean;
  excluida: boolean;
  created_at: string;
  updated_at: string;
  remetente?: {
    nome: string;
    email: string;
    secretaria?: { nome: string; sigla: string };
  };
  destinatarios?: {
    destinatario_id: string;
    tipo: 'para' | 'cc' | 'bcc';
    lida: boolean;
    lida_em?: string;
    destinatario: {
      nome: string;
      email: string;
    };
  }[];
  protocolo?: {
    numero_protocolo: string;
    assunto: string;
  };
}

const CorreioInterno: FC = () => {
  const { profile: user } = useAuth();
  const [messages, setMessages] = useState<CorreioMessage[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<CorreioMessage | null>(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Formulário nova mensagem
  const [newMessage, setNewMessage] = useState({
    destinatarios: [] as string[],
    assunto: '',
    conteudo: '',
    prioridade: 'normal' as 'normal' | 'alta' | 'urgente',
    protocolo_relacionado_id: ''
  });

  useEffect(() => {
    if (user) {
      loadMessages();
      loadUsers();
    }
  }, [user, activeTab]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('correio_interno')
        .select(`
          *,
          remetente:user_profiles!remetente_id(
            nome, email,
            secretaria:secretarias(nome, sigla)
          ),
          destinatarios:correio_destinatarios(
            destinatario_id, tipo, lida, lida_em,
            destinatario:user_profiles(nome, email)
          ),
          protocolo:protocolos_completos(numero_protocolo, assunto)
        `)
        .order('created_at', { ascending: false });

      // Filtrar por aba
      if (activeTab === 'inbox') {
        // Mensagens recebidas
        query = query.or(`remetente_id.eq.${user?.id},destinatarios.destinatario_id.eq.${user?.id}`);
      } else if (activeTab === 'sent') {
        // Mensagens enviadas
        query = query.eq('remetente_id', user?.id);
      } else if (activeTab === 'archived') {
        // Mensagens arquivadas
        query = query.eq('arquivada', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id, nome, email, secretaria_id,
          secretaria:secretarias(nome, sigla)
        `)
        .neq('id', user?.id) // Excluir o próprio usuário
        .eq('ativo', true);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const sendMessage = async () => {
    try {
      if (!newMessage.assunto.trim() || !newMessage.conteudo.trim() || newMessage.destinatarios.length === 0) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      // Criar a mensagem
      const { data: messageData, error: messageError } = await supabase
        .from('correio_interno')
        .insert({
          remetente_id: user?.id,
          assunto: newMessage.assunto,
          conteudo: newMessage.conteudo,
          prioridade: newMessage.prioridade,
          protocolo_relacionado_id: newMessage.protocolo_relacionado_id || null
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Criar os destinatários
      const destinatarios = newMessage.destinatarios.map(destId => ({
        correio_id: messageData.id,
        destinatario_id: destId,
        tipo: 'para' as const
      }));

      const { error: destError } = await supabase
        .from('correio_destinatarios')
        .insert(destinatarios);

      if (destError) throw destError;

      toast.success('Mensagem enviada com sucesso!');
      setShowNewMessage(false);
      setNewMessage({
        destinatarios: [],
        assunto: '',
        conteudo: '',
        prioridade: 'normal',
        protocolo_relacionado_id: ''
      });
      loadMessages();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('correio_destinatarios')
        .update({ 
          lida: true, 
          lida_em: new Date().toISOString() 
        })
        .eq('correio_id', messageId)
        .eq('destinatario_id', user?.id);

      if (error) throw error;
      
      // Atualizar localmente
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, lida: true }
            : msg
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const archiveMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('correio_interno')
        .update({ arquivada: true })
        .eq('id', messageId);

      if (error) throw error;
      
      toast.success('Mensagem arquivada');
      loadMessages();
    } catch (error) {
      console.error('Erro ao arquivar:', error);
      toast.error('Erro ao arquivar mensagem');
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (!searchTerm) return true;
    return msg.assunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
           msg.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
           msg.remetente?.nome.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getUnreadCount = () => {
    return messages.filter(msg => !msg.lida && msg.remetente_id !== user?.id).length;
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'urgente': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Correio Interno</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sistema de comunicação interna da prefeitura
          </p>
        </div>
        
        <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Mensagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Mensagem</DialogTitle>
              <DialogDescription>
                Envie uma mensagem para outros funcionários da prefeitura
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Destinatários *</Label>
                <Select 
                  value={newMessage.destinatarios.join(',')} 
                  onValueChange={(value) => setNewMessage(prev => ({ 
                    ...prev, 
                    destinatarios: value ? [value] : [] 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione os destinatários" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.nome} - {user.secretaria?.sigla}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assunto *</Label>
                <Input
                  value={newMessage.assunto}
                  onChange={(e) => setNewMessage(prev => ({ 
                    ...prev, 
                    assunto: e.target.value 
                  }))}
                  placeholder="Assunto da mensagem"
                />
              </div>

              <div>
                <Label>Prioridade</Label>
                <Select 
                  value={newMessage.prioridade} 
                  onValueChange={(value: 'normal' | 'alta' | 'urgente') => 
                    setNewMessage(prev => ({ ...prev, prioridade: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mensagem *</Label>
                <Textarea
                  value={newMessage.conteudo}
                  onChange={(e) => setNewMessage(prev => ({ 
                    ...prev, 
                    conteudo: e.target.value 
                  }))}
                  placeholder="Digite sua mensagem..."
                  rows={6}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewMessage(false)}>
                  Cancelar
                </Button>
                <Button onClick={sendMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-6 h-full">
        {/* Lista de Mensagens */}
        <div className="w-1/3 flex flex-col">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Mensagens</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar mensagens..."
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="inbox" className="flex items-center">
                    <Inbox className="h-4 w-4 mr-1" />
                    Recebidas
                    {getUnreadCount() > 0 && (
                      <Badge className="ml-2 bg-red-500">{getUnreadCount()}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent">
                    <Send className="h-4 w-4 mr-1" />
                    Enviadas
                  </TabsTrigger>
                  <TabsTrigger value="archived">
                    <Archive className="h-4 w-4 mr-1" />
                    Arquivadas
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="p-4 text-center">Carregando...</div>
                ) : filteredMessages.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma mensagem encontrada</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          selectedMessage?.id === message.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        } ${!message.lida && message.remetente_id !== user?.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                        onClick={() => {
                          setSelectedMessage(message);
                          if (!message.lida && message.remetente_id !== user?.id) {
                            markAsRead(message.id);
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {message.remetente?.nome.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm ${!message.lida && message.remetente_id !== user?.id ? 'font-semibold' : ''}`}>
                                {message.remetente?.nome}
                              </p>
                              <div className="flex items-center space-x-1">
                                <Badge className={`text-xs ${getPriorityColor(message.prioridade)}`}>
                                  {message.prioridade}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatDate(message.created_at)}
                                </span>
                              </div>
                            </div>
                            <p className={`text-sm mt-1 ${!message.lida && message.remetente_id !== user?.id ? 'font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                              {message.assunto}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {message.conteudo}
                            </p>
                            {message.protocolo && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Protocolo {message.protocolo.numero_protocolo}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Visualizador de Mensagem */}
        <div className="flex-1">
          <Card className="h-full">
            {selectedMessage ? (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{selectedMessage.assunto}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {selectedMessage.remetente?.nome.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{selectedMessage.remetente?.nome}</span>
                        </div>
                        <span>•</span>
                        <span>{formatDate(selectedMessage.created_at)}</span>
                        <Badge className={getPriorityColor(selectedMessage.prioridade)}>
                          {selectedMessage.prioridade}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => archiveMessage(selectedMessage.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <Separator />
                
                <CardContent className="pt-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap">
                      {selectedMessage.conteudo}
                    </div>
                  </div>

                  {selectedMessage.protocolo && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium mb-2">Protocolo Relacionado</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {selectedMessage.protocolo.numero_protocolo}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedMessage.protocolo.assunto}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedMessage.destinatarios && selectedMessage.destinatarios.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Destinatários</h4>
                      <div className="space-y-1">
                        {selectedMessage.destinatarios.map((dest, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{dest.destinatario.nome}</span>
                            <div className="flex items-center space-x-2">
                              {dest.lida ? (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Lida {dest.lida_em && `em ${formatDate(dest.lida_em)}`}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Não lida
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Selecione uma mensagem para visualizar</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CorreioInterno;