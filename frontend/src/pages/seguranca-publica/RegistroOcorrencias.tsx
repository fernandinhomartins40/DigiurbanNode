import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Upload
} from "lucide-react";
import { Ocorrencia } from "@/types/seguranca-publica";

const RegistroOcorrencias: FC = () => {
  const [formData, setFormData] = useState({
    tipo: undefined as string | undefined,
    prioridade: "media" as string,
    local: "",
    descricao: "",
    solicitanteNome: "",
    solicitanteTelefone: "",
    solicitanteEmail: "",
    observacoes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Reset form after success
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          tipo: undefined,
          prioridade: "media",
          local: "",
          descricao: "",
          solicitanteNome: "",
          solicitanteTelefone: "",
          solicitanteEmail: "",
          observacoes: ""
        });
      }, 2000);
    }, 1500);
  };

  const handleInputChange = (field: string, value: string | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case "baixa":
        return <Badge className="bg-green-500 text-white">Baixa</Badge>;
      case "media":
        return <Badge className="bg-yellow-500 text-white">Média</Badge>;
      case "alta":
        return <Badge className="bg-orange-500 text-white">Alta</Badge>;
      case "critica":
        return <Badge className="bg-red-500 text-white">Crítica</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Média</Badge>;
    }
  };

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <FileText className="mr-3 h-8 w-8 text-blue-600" />
              Registro de Ocorrências
            </h1>
            <p className="text-muted-foreground mt-2">
              Registre novas ocorrências de segurança pública
            </p>
          </div>
        </div>

        {submitSuccess && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Ocorrência registrada com sucesso! Protocolo: SP2024{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Formulário de Registro</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Ocorrência *</Label>
                      <Select value={formData.tipo || ""} onValueChange={(value) => handleInputChange('tipo', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="furto">Furto</SelectItem>
                          <SelectItem value="roubo">Roubo</SelectItem>
                          <SelectItem value="vandalismo">Vandalismo</SelectItem>
                          <SelectItem value="perturbacao">Perturbação da Ordem</SelectItem>
                          <SelectItem value="acidente">Acidente de Trânsito</SelectItem>
                          <SelectItem value="violencia">Violência Doméstica</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prioridade">Prioridade *</Label>
                      <Select value={formData.prioridade} onValueChange={(value) => handleInputChange('prioridade', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="local">Local da Ocorrência *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="local"
                        placeholder="Endereço completo ou ponto de referência"
                        value={formData.local}
                        onChange={(e) => handleInputChange('local', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Seja o mais específico possível para facilitar o atendimento
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição da Ocorrência *</Label>
                    <textarea
                      id="descricao"
                      placeholder="Descreva detalhadamente o que aconteceu..."
                      value={formData.descricao}
                      onChange={(e) => handleInputChange('descricao', e.target.value)}
                      className="w-full p-3 border rounded-md min-h-[120px] resize-y"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Inclua informações como data, hora, pessoas envolvidas, objetos furtados, etc.
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Dados do Solicitante
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="solicitanteNome">Nome Completo *</Label>
                        <Input
                          id="solicitanteNome"
                          placeholder="Nome completo"
                          value={formData.solicitanteNome}
                          onChange={(e) => handleInputChange('solicitanteNome', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="solicitanteTelefone">Telefone *</Label>
                        <Input
                          id="solicitanteTelefone"
                          placeholder="(11) 99999-9999"
                          value={formData.solicitanteTelefone}
                          onChange={(e) => handleInputChange('solicitanteTelefone', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="solicitanteEmail">Email</Label>
                        <Input
                          id="solicitanteEmail"
                          type="email"
                          placeholder="email@exemplo.com"
                          value={formData.solicitanteEmail}
                          onChange={(e) => handleInputChange('solicitanteEmail', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações Adicionais</Label>
                    <textarea
                      id="observacoes"
                      placeholder="Informações complementares, testemunhas, etc."
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      className="w-full p-3 border rounded-md min-h-[80px] resize-y"
                    />
                  </div>

                  <div className="border border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label className="cursor-pointer">
                          <span className="text-sm text-blue-600 hover:text-blue-500">
                            Clique para anexar arquivos
                          </span>
                          <input type="file" className="hidden" multiple accept="image/*,.pdf,.doc,.docx" />
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Fotos, documentos (máx. 10MB por arquivo)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting || !formData.tipo || !formData.local || !formData.descricao || !formData.solicitanteNome || !formData.solicitanteTelefone}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Registrar Ocorrência
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <div>
                      <h4 className="font-medium text-red-800">Emergências</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Para situações de emergência, ligue imediatamente para 190 (Polícia) ou 193 (Bombeiros)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-800 mb-2">Dicas para o Registro</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Seja específico na descrição</li>
                    <li>• Inclua horário aproximado</li>
                    <li>• Mencione testemunhas</li>
                    <li>• Anexe fotos se possível</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ocorrências hoje</span>
                  <Badge>5</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tempo médio resposta</span>
                  <Badge variant="outline">2.5h</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de resolução</span>
                  <Badge className="bg-green-100 text-green-800">94%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contatos de Emergência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Polícia Militar</span>
                  <span className="font-medium">190</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bombeiros</span>
                  <span className="font-medium">193</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Guarda Municipal</span>
                  <span className="font-medium">(11) 3333-4444</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Defesa Civil</span>
                  <span className="font-medium">199</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    
  );
};

export default RegistroOcorrencias;
