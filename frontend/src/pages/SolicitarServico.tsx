import { CidadaoLayout } from "@/components/CidadaoLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FC, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Clock, DollarSign, AlertCircle, CheckCircle, Upload, MapPin } from "lucide-react";
import { useProtocols } from "@/hooks/useProtocols";
import type { ServicoMunicipal, NovoProtocolo } from "@/hooks/useProtocols";

const SolicitarServico: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const servicoId = searchParams.get('service');
  
  const { services, createProtocol, loading: hookLoading } = useProtocols();

  const [servico, setServico] = useState<ServicoMunicipal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [protocolNumber, setProtocolNumber] = useState<string | null>(null);

  // Dados do formulário
  const [formData, setFormData] = useState({
    assunto: '',
    descricao: '',
    endereco: '',
    localizacao_gps: undefined as { x: number, y: number } | undefined,
    dados_formulario: {} as any,
    documentos_anexos: [] as string[],
    prioridade: 'normal' as 'baixa' | 'normal' | 'alta' | 'urgente'
  });

  // Carregar dados do serviço
  useEffect(() => {
    if (!servicoId) {
      setError('Serviço não especificado');
      setLoading(false);
      return;
    }

    if (!hookLoading && services.length > 0) {
      const servicoEncontrado = services.find(s => s.id === servicoId);
      if (!servicoEncontrado) {
        setError('Serviço não encontrado');
      } else {
        setServico(servicoEncontrado);
        setFormData(prev => ({
          ...prev,
          assunto: `Solicitação de ${servicoEncontrado.nome}`
        }));
      }
      setLoading(false);
    }
  }, [servicoId, services, hookLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!servico || !formData.assunto.trim() || !formData.descricao.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const dadosProtocolo: NovoProtocolo = {
        servico_id: servico.id,
        assunto: formData.assunto,
        descricao: formData.descricao,
        endereco: formData.endereco || undefined,
        localizacao_gps: formData.localizacao_gps,
        dados_formulario: formData.dados_formulario,
        documentos_anexos: formData.documentos_anexos,
        prioridade: formData.prioridade
      };

      const protocolo = await createProtocol(dadosProtocolo);
      if (protocolo) {
        setProtocolNumber(protocolo.numero_protocolo);
        setSuccess(true);
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          navigate(`/meus-protocolos`);
        }, 3000);
      } else {
        setError('Erro ao criar protocolo. Tente novamente.');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar protocolo');
    } finally {
      setSubmitting(false);
    }
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
          </div>
        </div>
      </CidadaoLayout>
    );
  }

  if (error && !servico) {
    return (
      <CidadaoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Erro ao carregar serviço
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={() => navigate('/catalogo-servicos')}>
              Voltar ao Catálogo
            </Button>
          </div>
        </div>
      </CidadaoLayout>
    );
  }

  if (success) {
    return (
      <CidadaoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-green-500 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Protocolo Criado com Sucesso!
            </h3>
            {protocolNumber && (
              <div className="mb-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Nº {protocolNumber}
                </Badge>
              </div>
            )}
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Sua solicitação foi registrada e você será redirecionado para acompanhar o andamento.
              Anote o número do protocolo para futuras consultas.
            </p>
          </div>
        </div>
      </CidadaoLayout>
    );
  }

  return (
    <CidadaoLayout>
      <div className="space-y-6">
        <div>
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/catalogo-servicos')}
          >
            ← Voltar ao Catálogo
          </Button>
          <h1 className="text-2xl font-bold">Solicitar Serviço</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Preencha as informações para criar sua solicitação
          </p>
        </div>

        {/* Informações do Serviço */}
        {servico && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{servico.nome}</CardTitle>
                  <CardDescription className="mt-1">
                    {servico.descricao}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {servico.categoria}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Prazo: {servico.tempo_estimado_dias} dias
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {servico.taxa > 0 ? `R$ ${servico.taxa.toFixed(2)}` : 'Gratuito'}
                </div>
                {servico.secretaria && (
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {servico.secretaria?.nome}
                  </div>
                )}
              </div>

              {servico.documentos_necessarios && servico.documentos_necessarios.length > 0 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Documentos necessários:</strong> {servico.documentos_necessarios.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

            </CardHeader>
          </Card>
        )}

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Solicitação</CardTitle>
            <CardDescription>
              Forneça as informações necessárias para processar sua solicitação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="assunto">Assunto da Solicitação *</Label>
                <Input
                  id="assunto"
                  value={formData.assunto}
                  onChange={(e) => setFormData(prev => ({ ...prev, assunto: e.target.value }))}
                  placeholder="Ex: Solicitação de Certidão de Residência"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição Detalhada *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva detalhadamente sua solicitação..."
                  className="min-h-24"
                  required
                />
              </div>

              {/* Campo de localização (sempre opcional) */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center text-sm font-medium">
                  <MapPin className="h-4 w-4 mr-2" />
                  Localização (Opcional)
                </div>
                
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                    placeholder="Rua, número, bairro... (opcional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Informe o endereço se este serviço estiver relacionado a um local específico
                  </p>
                </div>
              </div>

              {/* Seção de upload de documentos */}
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center text-sm font-medium text-blue-800 dark:text-blue-200">
                  <Upload className="h-4 w-4 mr-2" />
                  Anexar Documentos (Opcional)
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Os documentos podem ser anexados após a criação do protocolo, através da página de acompanhamento.
                    Você receberá instruções sobre quais documentos são necessários.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/catalogo-servicos')}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Criando Protocolo...' : 'Criar Protocolo'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </CidadaoLayout>
  );
};

export default SolicitarServico;