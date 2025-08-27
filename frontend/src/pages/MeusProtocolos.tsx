
import { CidadaoLayout } from "@/components/CidadaoLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FC, useState, useEffect } from "react";
import { Search, FileText, ChevronDown, ChevronUp, Calendar, Clock, AlertCircle, CheckCircle, Clock3, FilterX, Star, Eye, Download, MessageSquare } from "lucide-react";
import { useProtocols } from "@/hooks/useProtocols";
import type { ProtocoloCompleto } from "@/hooks/useProtocols";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Mapear status para ícones e cores
const statusConfig = {
  'aberto': { icon: Clock3, color: 'text-gray-500', bgColor: 'bg-gray-100 hover:bg-gray-200', label: 'Aberto' },
  'em_andamento': { icon: Clock3, color: 'text-blue-500', bgColor: 'bg-blue-100 hover:bg-blue-200', label: 'Em Andamento' },
  'aguardando_documentos': { icon: AlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-100 hover:bg-yellow-200', label: 'Aguardando Documentos' },
  'aguardando_aprovacao': { icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-100 hover:bg-orange-200', label: 'Aguardando Aprovação' },
  'aprovado': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100 hover:bg-green-200', label: 'Aprovado' },
  'rejeitado': { icon: FilterX, color: 'text-red-500', bgColor: 'bg-red-100 hover:bg-red-200', label: 'Rejeitado' },
  'concluido': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100 hover:bg-green-200', label: 'Concluído' },
  'cancelado': { icon: FilterX, color: 'text-red-500', bgColor: 'bg-red-100 hover:bg-red-200', label: 'Cancelado' }
};

const MeusProtocolos: FC = () => {
  const navigate = useNavigate();
  const { myProtocols, loading, error: hookError, loadMyProtocols } = useProtocols();
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const error = hookError;

  // Filtrar protocolos por status
  const protocolosPorStatus = (() => {
    if (selectedStatus === 'todos') return myProtocols;
    return myProtocols.filter(p => p.status === selectedStatus);
  })();

  // Filtrar protocolos por termo de busca
  const protocolosFiltrados = (() => {
    if (!searchTerm) return protocolosPorStatus;
    
    return protocolosPorStatus.filter(protocolo =>
      protocolo.numero_protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protocolo.assunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protocolo.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (protocolo.servico?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  })();

  const recarregar = async () => {
    await loadMyProtocols();
  };

  const toggleProtocol = (id: string) => {
    setExpandedProtocol(expandedProtocol === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">Status Desconhecido</Badge>;
    
    return (
      <Badge className={`${config.bgColor} ${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <FileText className="h-5 w-5" />;
    
    const Icon = config.icon;
    return <Icon className={`h-5 w-5 ${config.color}`} />;
  };

  const handleAvaliarProtocolo = async (protocoloId: string) => {
    // Abrir modal de avaliação ou navegar para página de avaliação
    navigate(`/protocolo/${protocoloId}/avaliar`);
  };

  const handleVerDetalhes = (protocoloId: string) => {
    navigate(`/protocolo/${protocoloId}`);
  };

  const handleNovoProtocolo = () => {
    navigate('/catalogo-servicos');
  };

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (dataISO: string) => {
    return new Date(dataISO).toLocaleString('pt-BR');
  };

  const calcularDiasDesde = (dataISO: string) => {
    const agora = new Date();
    const data = new Date(dataISO);
    const diffTime = Math.abs(agora.getTime() - data.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (error) {
    return (
      <CidadaoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Erro ao carregar protocolos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={() => recarregar()}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </CidadaoLayout>
    );
  }

  return (
    <CidadaoLayout>
      <div className="h-full flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Meus Protocolos</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Acompanhe o andamento de suas solicitações
            </p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Input 
              placeholder="Pesquisar protocolos..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="aberto">Abertos</TabsTrigger>
            <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
            <TabsTrigger value="aguardando_documentos">Aguardando</TabsTrigger>
            <TabsTrigger value="concluido">Concluídos</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedStatus} className="mt-0 space-y-4">
            {loading ? (
              // Loading skeleton
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="p-4 pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Skeleton className="h-5 w-5" />
                          <div className="flex-1">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <div className="flex gap-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-40" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-5 w-5" />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              protocolosFiltrados.map((protocolo) => (
                <Card key={protocolo.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-0">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleProtocol(protocolo.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(protocolo.status)}
                        <div className="flex-1">
                          <CardTitle className="text-lg">{protocolo.assunto}</CardTitle>
                          <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <FileText className="h-3.5 w-3.5 mr-1" /> 
                              {protocolo.numero_protocolo}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" /> 
                              {formatarData(protocolo.created_at)}
                            </span>
                            <span>
                              {protocolo.servico?.nome || 'Serviço não informado'}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {calcularDiasDesde(protocolo.created_at)} dias
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusBadge(protocolo.status)}
                        {expandedProtocol === protocolo.id ? 
                          <ChevronUp className="h-5 w-5" /> : 
                          <ChevronDown className="h-5 w-5" />
                        }
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedProtocol === protocolo.id && (
                    <CardContent className="pt-4">
                      <div className="border-t pt-4 mt-2">
                        <h4 className="font-medium mb-2">Descrição</h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {protocolo.descricao}
                        </p>
                        
                        {protocolo.endereco && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Localização</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {protocolo.endereco}
                            </p>
                          </div>
                        )}

                        {protocolo.prazo_estimado && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Prazo Estimado</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatarData(protocolo.prazo_estimado)}
                            </p>
                          </div>
                        )}
                        
                        {protocolo.data_conclusao && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Data de Conclusão</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatarDataHora(protocolo.data_conclusao)}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVerDetalhes(protocolo.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Imprimir
                          </Button>
                          
                          {protocolo.status === 'aguardando_documentos' && (
                            <Button size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Anexar Documentos
                            </Button>
                          )}
                          
                          {protocolo.status === 'concluido' && !protocolo.avaliacao_nota && (
                            <Button 
                              size="sm"
                              onClick={() => handleAvaliarProtocolo(protocolo.id)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Avaliar Serviço
                            </Button>
                          )}

                          {protocolo.avaliacao_nota && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              Avaliado: {protocolo.avaliacao_nota}/5
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
            
            {!loading && protocolosFiltrados.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">Nenhum protocolo encontrado</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? `Nenhum protocolo encontrado para "${searchTerm}"`
                    : selectedStatus !== "todos" 
                      ? `Você não possui protocolos com status "${statusConfig[selectedStatus as keyof typeof statusConfig]?.label || selectedStatus}"`
                      : "Você ainda não possui protocolos registrados."
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-center">
          <Button className="px-6" onClick={handleNovoProtocolo}>
            <FileText className="mr-2 h-4 w-4" />
            Novo Protocolo
          </Button>
        </div>
      </div>
    </CidadaoLayout>
  );
};

export default MeusProtocolos;
