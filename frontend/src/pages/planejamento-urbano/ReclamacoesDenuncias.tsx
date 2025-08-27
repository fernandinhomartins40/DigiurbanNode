
import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogLarge, DialogLargeContent, DialogLargeHeader, DialogLargeTitle, DialogLargeBody, DialogLargeFooter } from "@/components/ui/dialog-large";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye, AlertTriangle, Camera, MapPin, Calendar, User, FileText } from "lucide-react";
import { ReclamacaoUrbana } from "@/types/planejamento-urbano";

const ReclamacoesDenuncias: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");

  // Mock data
  const reclamacoes: ReclamacaoUrbana[] = [
    {
      id: "1",
      protocolo: "REC-2024-001",
      denunciante: {
        nome: "Ana Silva",
        cpf: "123.456.789-00",
        telefone: "(11) 99999-9999",
        email: "ana@email.com"
      },
      tipoReclamacao: "construcao_irregular",
      descricao: "Construção sendo feita sem alvará aparente, obras muito altas para o local",
      localizacao: {
        endereco: "Rua das Flores, 456",
        coordenadas: { latitude: -23.5505, longitude: -46.6333 }
      },
      gravidade: "alta",
      status: "em_investigacao",
      dataRegistro: "2024-01-15",
      dataVistoria: "2024-01-18",
      fotos: ["foto1.jpg", "foto2.jpg"],
      observacoes: "Denúncia anônima recebida por telefone",
      responsavel: "Fiscal João Santos",
      acoes: [
        {
          data: "2024-01-15",
          acao: "Registro da denúncia",
          responsavel: "Sistema",
          observacao: "Denúncia registrada automaticamente"
        },
        {
          data: "2024-01-16",
          acao: "Atribuição para fiscal",
          responsavel: "Coord. Maria",
          observacao: "Encaminhado para João Santos"
        }
      ]
    },
    {
      id: "2",
      protocolo: "REC-2024-002",
      tipoReclamacao: "poluicao_sonora",
      descricao: "Bar com música alta todos os dias até tarde da noite",
      localizacao: {
        endereco: "Av. Central, 789",
        coordenadas: { latitude: -23.5515, longitude: -46.6343 }
      },
      gravidade: "media",
      status: "comprovada",
      dataRegistro: "2024-01-12",
      dataVistoria: "2024-01-14",
      fotos: [],
      observacoes: "Várias reclamações de vizinhos",
      responsavel: "Fiscal Pedro Lima",
      acoes: [
        {
          data: "2024-01-14",
          acao: "Vistoria realizada",
          responsavel: "Fiscal Pedro",
          observacao: "Constatado ruído excessivo após 22h"
        },
        {
          data: "2024-01-15",
          acao: "Notificação emitida",
          responsavel: "Fiscal Pedro",
          observacao: "Estabelecimento notificado para adequação"
        }
      ]
    },
    {
      id: "3",
      protocolo: "REC-2024-003",
      tipoReclamacao: "ocupacao_via",
      descricao: "Comerciante ocupando calçada com mercadorias",
      localizacao: {
        endereco: "Rua do Comércio, 321",
        coordenadas: { latitude: -23.5525, longitude: -46.6353 }
      },
      gravidade: "baixa",
      status: "resolvida",
      dataRegistro: "2024-01-10",
      dataVistoria: "2024-01-11",
      fotos: ["ocupacao.jpg"],
      observacoes: "Problema solucionado amigavelmente",
      responsavel: "Fiscal Ana Costa",
      acoes: [
        {
          data: "2024-01-11",
          acao: "Orientação verbal",
          responsavel: "Fiscal Ana",
          observacao: "Comerciante orientado e regularizou situação"
        },
        {
          data: "2024-01-12",
          acao: "Verificação de cumprimento",
          responsavel: "Fiscal Ana",
          observacao: "Situação regularizada - caso encerrado"
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registrada": return "bg-blue-100 text-blue-800";
      case "em_investigacao": return "bg-yellow-100 text-yellow-800";
      case "em_vistoria": return "bg-orange-100 text-orange-800";
      case "comprovada": return "bg-red-100 text-red-800";
      case "improcedente": return "bg-gray-100 text-gray-800";
      case "resolvida": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getGravidadeColor = (gravidade: string) => {
    switch (gravidade) {
      case "critica": return "bg-red-100 text-red-800";
      case "alta": return "bg-orange-100 text-orange-800";
      case "media": return "bg-yellow-100 text-yellow-800";
      case "baixa": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "construcao_irregular": return "🏗️";
      case "poluicao_sonora": return "🔊";
      case "ocupacao_via": return "🚧";
      case "propaganda_irregular": return "📢";
      default: return "⚠️";
    }
  };

  const filteredReclamacoes = reclamacoes.filter(reclamacao => {
    const matchesSearch = reclamacao.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reclamacao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reclamacao.denunciante?.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === "todos" || reclamacao.status === selectedStatus;
    const matchesTipo = selectedTipo === "todos" || reclamacao.tipoReclamacao === selectedTipo;
    return matchesSearch && matchesStatus && matchesTipo;
  });

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reclamações e Denúncias</h1>
            <p className="text-gray-600">Gerencie reclamações e denúncias urbanas</p>
          </div>
          <DialogLarge>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Reclamação
              </Button>
            </DialogTrigger>
            <DialogLargeContent>
              <DialogLargeHeader>
                <DialogLargeTitle>Nova Reclamação/Denúncia</DialogLargeTitle>
              </DialogLargeHeader>
              <DialogLargeBody className="scrollbar-modal">
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipoReclamacao">Tipo de Reclamação</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="construcao_irregular">Construção Irregular</SelectItem>
                        <SelectItem value="poluicao_sonora">Poluição Sonora</SelectItem>
                        <SelectItem value="ocupacao_via">Ocupação de Via</SelectItem>
                        <SelectItem value="propaganda_irregular">Propaganda Irregular</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gravidade">Gravidade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a gravidade" />
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
                <div>
                  <Label htmlFor="endereco">Endereço da Ocorrência</Label>
                  <Input id="endereco" placeholder="Endereço completo onde ocorre o problema" />
                </div>
                <div>
                  <Label htmlFor="descricaoReclamacao">Descrição da Reclamação</Label>
                  <Textarea id="descricaoReclamacao" placeholder="Descreva detalhadamente o problema" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomeDenunciante">Nome do Denunciante (opcional)</Label>
                    <Input id="nomeDenunciante" placeholder="Nome completo" />
                  </div>
                  <div>
                    <Label htmlFor="telefoneDenunciante">Telefone (opcional)</Label>
                    <Input id="telefoneDenunciante" placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="anexos">Fotos/Documentos</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Clique para adicionar fotos ou arraste arquivos aqui</p>
                  </div>
                </div>
                </div>
              </DialogLargeBody>
              <DialogLargeFooter>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Registrar</Button>
                </div>
              </DialogLargeFooter>
            </DialogLargeContent>
          </DialogLarge>
        </div>

        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por protocolo, descrição ou denunciante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedTipo} onValueChange={setSelectedTipo}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="construcao_irregular">Construção Irregular</SelectItem>
              <SelectItem value="poluicao_sonora">Poluição Sonora</SelectItem>
              <SelectItem value="ocupacao_via">Ocupação de Via</SelectItem>
              <SelectItem value="propaganda_irregular">Propaganda Irregular</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="registrada">Registrada</SelectItem>
              <SelectItem value="em_investigacao">Em Investigação</SelectItem>
              <SelectItem value="em_vistoria">Em Vistoria</SelectItem>
              <SelectItem value="comprovada">Comprovada</SelectItem>
              <SelectItem value="improcedente">Improcedente</SelectItem>
              <SelectItem value="resolvida">Resolvida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Reclamações</TabsTrigger>
            <TabsTrigger value="mapa">Mapa de Ocorrências</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="lista">
            <div className="grid gap-4">
              {filteredReclamacoes.map((reclamacao) => (
                <Card key={reclamacao.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTipoIcon(reclamacao.tipoReclamacao)}</span>
                        <CardTitle className="text-lg">{reclamacao.protocolo}</CardTitle>
                        <Badge className={getStatusColor(reclamacao.status)}>
                          {reclamacao.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getGravidadeColor(reclamacao.gravidade)}>
                          {reclamacao.gravidade}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          {reclamacao.tipoReclamacao.replace('_', ' ')}
                        </div>
                        {reclamacao.denunciante && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="mr-2 h-4 w-4" />
                            {reclamacao.denunciante.nome}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {reclamacao.localizacao.endereco}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          Registrado: {new Date(reclamacao.dataRegistro).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {reclamacao.responsavel && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="mr-2 h-4 w-4" />
                            Responsável: {reclamacao.responsavel}
                          </div>
                        )}
                        {reclamacao.dataVistoria && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="mr-2 h-4 w-4" />
                            Vistoria: {new Date(reclamacao.dataVistoria).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-700">{reclamacao.descricao}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {reclamacao.fotos.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Camera className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {reclamacao.fotos.length} foto(s)
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {reclamacao.acoes.length} ação(ões)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mapa">
            <Card>
              <CardContent className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600">Mapa das reclamações e denúncias será exibido aqui</p>
                  <p className="text-sm text-gray-500">Visualização geográfica das ocorrências por região</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estatisticas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reclamações por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["construcao_irregular", "poluicao_sonora", "ocupacao_via", "propaganda_irregular"].map((tipo) => {
                      const count = reclamacoes.filter(r => r.tipoReclamacao === tipo).length;
                      const percentage = (count / reclamacoes.length) * 100;
                      return (
                        <div key={tipo} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{tipo.replace('_', ' ')}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status das Reclamações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["registrada", "em_investigacao", "comprovada", "resolvida"].map((status) => {
                      const count = reclamacoes.filter(r => r.status === status).length;
                      const percentage = (count / reclamacoes.length) * 100;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default ReclamacoesDenuncias;
