import { CidadaoLayout } from "@/components/CidadaoLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FC, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, FileText, Clock, CheckCircle, AlertCircle, 
  MessageSquare, Star, Download, Upload, MapPin, Calendar,
  User, Building, ChevronRight
} from "lucide-react";
import { useProtocols } from "@/hooks/useProtocols";
import { useAuth } from '@/auth';
import type { ProtocoloCompleto, HistoricoTramitacao } from "@/hooks/useProtocols";
import { toast } from "react-hot-toast";

// Mapear status para ícones e cores
const statusConfig = {
  'aberto': { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-100', label: 'Aberto' },
  'em_andamento': { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-100', label: 'Em Andamento' },
  'aguardando_documentos': { icon: Upload, color: 'text-orange-500', bgColor: 'bg-orange-100', label: 'Aguardando Documentos' },
  'aguardando_aprovacao': { icon: Clock, color: 'text-purple-500', bgColor: 'bg-purple-100', label: 'Aguardando Aprovação' },
  'aprovado': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100', label: 'Aprovado' },
  'rejeitado': { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-100', label: 'Rejeitado' },
  'concluido': { icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-100', label: 'Concluído' },
  'cancelado': { icon: AlertCircle, color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'Cancelado' }
};

const DetalhesProtocolo: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile: user } = useAuth();
  const { 
    myProtocols, 
    protocolHistory, 
    loadProtocolHistory, 
    addComment, 
    evaluateProtocol,
    loading 
  } = useProtocols();

  const [protocolo, setProtocolo] = useState<ProtocoloCompleto | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [evaluationComment, setEvaluationComment] = useState("");

  useEffect(() => {
    if (id && myProtocols.length > 0) {
      const protocoloEncontrado = myProtocols.find(p => p.id === id);
      if (protocoloEncontrado) {
        setProtocolo(protocoloEncontrado);
        loadProtocolHistory(id);
      }
    }
  }, [id, myProtocols, loadProtocolHistory]);

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">Status Desconhecido</Badge>;
    
    const Icon = config.icon;
    return (
      <Badge className={`${config.bgColor} ${config.color} border-0 text-sm`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleAddComment = async () => {
    if (!protocolo || !comment.trim()) return;
    
    try {
      await addComment(protocolo.id, comment, true);
      setComment("");
      setShowCommentModal(false);
      toast.success("Comentário adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar comentário");
    }
  };

  const handleEvaluate = async () => {
    if (!protocolo) return;
    
    try {
      await evaluateProtocol(protocolo.id, rating, evaluationComment.trim() || undefined);
      setShowEvaluationModal(false);
      setEvaluationComment("");
      toast.success("Avaliação enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar avaliação");
    }
  };

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (dataISO: string) => {
    return new Date(dataISO).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <CidadaoLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </CidadaoLayout>
    );
  }

  if (!protocolo) {
    return (
      <CidadaoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Protocolo não encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              O protocolo solicitado não existe ou você não tem permissão para visualizá-lo.
            </p>
            <Button onClick={() => navigate('/meus-protocolos')}>
              Voltar aos Meus Protocolos
            </Button>
          </div>
        </div>
      </CidadaoLayout>
    );
  }

  return (
    <CidadaoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/meus-protocolos')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Detalhes do Protocolo</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Acompanhe o andamento da sua solicitação
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(protocolo.status)}
          </div>
        </div>

        {/* Informações Principais */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">{protocolo.assunto}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {protocolo.numero_protocolo}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Criado em {formatarData(protocolo.created_at)}
                  </span>
                  <span className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {protocolo.secretaria?.nome}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Descrição</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {protocolo.descricao}
              </p>
            </div>

            {protocolo.servico && (
              <div>
                <h4 className="font-medium mb-2">Serviço</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{protocolo.servico.categoria}</Badge>
                  <span className="text-sm">{protocolo.servico.nome}</span>
                </div>
              </div>
            )}

            {protocolo.endereco && (
              <div>
                <h4 className="font-medium mb-2">Localização</h4>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {protocolo.endereco}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-1 text-sm">Prioridade</h4>
                <Badge variant={protocolo.prioridade === 'alta' ? 'destructive' : 
                                protocolo.prioridade === 'urgente' ? 'destructive' : 'outline'}>
                  {protocolo.prioridade.charAt(0).toUpperCase() + protocolo.prioridade.slice(1)}
                </Badge>
              </div>

              {protocolo.prazo_estimado && (
                <div>
                  <h4 className="font-medium mb-1 text-sm">Prazo Estimado</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatarData(protocolo.prazo_estimado)}
                  </p>
                </div>
              )}

              {protocolo.data_conclusao && (
                <div>
                  <h4 className="font-medium mb-1 text-sm">Data de Conclusão</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatarDataHora(protocolo.data_conclusao)}
                  </p>
                </div>
              )}
            </div>

            {/* Avaliação */}
            {protocolo.avaliacao_nota && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Sua Avaliação: {protocolo.avaliacao_nota}/5 estrelas</span>
                </div>
                {protocolo.avaliacao_comentario && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "{protocolo.avaliacao_comentario}"
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Tramitação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Histórico de Tramitação
            </CardTitle>
            <CardDescription>
              Acompanhe todas as ações realizadas em seu protocolo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {protocolHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Nenhuma movimentação registrada ainda
                </p>
              ) : (
                protocolHistory.map((item, index) => (
                  <div key={item.id} className="flex space-x-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      </div>
                      {index < protocolHistory.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-600 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.acao}</p>
                          {item.comentario && item.comentario_publico && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.comentario}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            <span>{item.usuario?.nome || 'Sistema'}</span>
                            <span>•</span>
                            <span>{formatarDataHora(item.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {/* Adicionar Comentário */}
              <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Adicionar Comentário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Comentário</DialogTitle>
                    <DialogDescription>
                      Adicione informações ou esclarecimentos sobre seu protocolo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="comment">Comentário</Label>
                      <Textarea
                        id="comment"
                        placeholder="Digite seu comentário..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCommentModal(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddComment} disabled={!comment.trim()}>
                        Adicionar Comentário
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Avaliar Serviço */}
              {protocolo.status === 'concluido' && !protocolo.avaliacao_nota && (
                <Dialog open={showEvaluationModal} onOpenChange={setShowEvaluationModal}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Star className="h-4 w-4 mr-2" />
                      Avaliar Serviço
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Avaliar Serviço</DialogTitle>
                      <DialogDescription>
                        Sua avaliação nos ajuda a melhorar nossos serviços
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nota (1 a 5 estrelas)</Label>
                        <div className="flex space-x-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className={`text-2xl ${
                                star <= rating ? 'text-yellow-400' : 'text-gray-300'
                              } hover:text-yellow-400 transition-colors`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="evaluation-comment">Comentário (opcional)</Label>
                        <Textarea
                          id="evaluation-comment"
                          placeholder="Conte-nos sobre sua experiência..."
                          value={evaluationComment}
                          onChange={(e) => setEvaluationComment(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowEvaluationModal(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleEvaluate}>
                          Enviar Avaliação
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Imprimir */}
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Imprimir
              </Button>

              {/* Anexar Documentos - se em aguardando_documentos */}
              {protocolo.status === 'aguardando_documentos' && (
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Anexar Documentos
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </CidadaoLayout>
  );
};

export default DetalhesProtocolo;