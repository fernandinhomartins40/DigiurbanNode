
import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye, FileText, Calendar, MessageSquare, Users, Download } from "lucide-react";
import { ConsultaPublica } from "@/types/planejamento-urbano";

const ConsultasPublicas: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");

  // Mock data
  const consultas: ConsultaPublica[] = [
    {
      id: "1",
      titulo: "Revisão do Plano Diretor Municipal 2024",
      descricao: "Consulta pública para discussão das propostas de alteração do Plano Diretor Municipal, com foco na expansão urbana e preservação ambiental.",
      categoria: "plano_diretor",
      status: "ativa",
      dataInicio: "2024-01-15",
      dataFim: "2024-03-15",
      localizacao: {
        endereco: "Câmara Municipal - Plenário Principal",
        coordenadas: { latitude: -23.5505, longitude: -46.6333 }
      },
      documentos: [
        {
          tipo: "Proposta Principal",
          nome: "plano_diretor_proposta_2024.pdf",
          url: "#",
          dataPublicacao: "2024-01-15"
        },
        {
          tipo: "Mapa de Zoneamento",
          nome: "mapa_zoneamento_atual.pdf",
          url: "#",
          dataPublicacao: "2024-01-15"
        },
        {
          tipo: "Estudo de Impacto",
          nome: "estudo_impacto_ambiental.pdf",
          url: "#",
          dataPublicacao: "2024-01-16"
        }
      ],
      contribuicoes: [
        {
          id: "1",
          cidadao: "Maria Silva",
          data: "2024-01-20",
          contribuicao: "Sugiro a criação de mais áreas verdes no setor norte da cidade, especialmente próximo às escolas.",
          status: "analisada"
        },
        {
          id: "2",
          cidadao: "João Santos",
          data: "2024-01-22",
          contribuicao: "Proponho a revisão dos índices de ocupação para pequenos comércios familiares.",
          status: "pendente"
        },
        {
          id: "3",
          cidadao: "Ana Costa",
          data: "2024-01-25",
          contribuicao: "É necessário considerar corredores de mobilidade urbana sustentável.",
          status: "incorporada"
        }
      ],
      responsavel: "Arq. Carlos Mendes",
      resultados: "Em andamento - consolidação das propostas"
    },
    {
      id: "2",
      titulo: "Projeto de Revitalização do Centro Histórico",
      descricao: "Discussão sobre o projeto de revitalização do centro histórico da cidade, incluindo preservação do patrimônio e modernização da infraestrutura.",
      categoria: "projeto_urbano",
      status: "encerrada",
      dataInicio: "2023-11-01",
      dataFim: "2023-12-31",
      localizacao: {
        endereco: "Centro Cultural Municipal",
        coordenadas: { latitude: -23.5515, longitude: -46.6343 }
      },
      documentos: [
        {
          tipo: "Projeto Executivo",
          nome: "revitalizacao_centro_historico.pdf",
          url: "#",
          dataPublicacao: "2023-11-01"
        }
      ],
      contribuicoes: [
        {
          id: "4",
          cidadao: "Pedro Oliveira",
          data: "2023-11-15",
          contribuicao: "Importante manter as características arquitetônicas originais dos prédios históricos.",
          status: "incorporada"
        },
        {
          id: "5",
          cidadao: "Lucia Fernandes",
          data: "2023-11-20",
          contribuicao: "Sugiro a criação de espaços para artistas locais exporem seus trabalhos.",
          status: "incorporada"
        }
      ],
      responsavel: "Arq. Patricia Lima",
      resultados: "Projeto aprovado com modificações sugeridas pela população. Início das obras previsto para março/2024."
    },
    {
      id: "3",
      titulo: "Regulamentação de Food Trucks",
      descricao: "Proposta de regulamentação para funcionamento de food trucks em espaços públicos da cidade.",
      categoria: "regulamentacao",
      status: "planejada",
      dataInicio: "2024-02-01",
      dataFim: "2024-02-29",
      documentos: [
        {
          tipo: "Minuta do Decreto",
          nome: "decreto_food_trucks_minuta.pdf",
          url: "#",
          dataPublicacao: "2024-01-25"
        }
      ],
      contribuicoes: [],
      responsavel: "Dr. Roberto Silva"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planejada": return "bg-blue-100 text-blue-800";
      case "ativa": return "bg-green-100 text-green-800";
      case "encerrada": return "bg-gray-100 text-gray-800";
      case "suspensa": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "plano_diretor": return "bg-purple-100 text-purple-800";
      case "zoneamento": return "bg-orange-100 text-orange-800";
      case "obra_publica": return "bg-blue-100 text-blue-800";
      case "regulamentacao": return "bg-green-100 text-green-800";
      case "projeto_urbano": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getContribuicaoStatusColor = (status: string) => {
    switch (status) {
      case "pendente": return "bg-yellow-100 text-yellow-800";
      case "analisada": return "bg-blue-100 text-blue-800";
      case "incorporada": return "bg-green-100 text-green-800";
      case "rejeitada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredConsultas = consultas.filter(consulta => {
    const matchesSearch = consulta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consulta.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "todos" || consulta.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Consultas Públicas</h1>
            <p className="text-gray-600">Gerencie consultas públicas e participação cidadã</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Consulta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Nova Consulta Pública</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="titulo">Título da Consulta</Label>
                  <Input id="titulo" placeholder="Título descritivo da consulta" />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plano_diretor">Plano Diretor</SelectItem>
                      <SelectItem value="zoneamento">Zoneamento</SelectItem>
                      <SelectItem value="obra_publica">Obra Pública</SelectItem>
                      <SelectItem value="regulamentacao">Regulamentação</SelectItem>
                      <SelectItem value="projeto_urbano">Projeto Urbano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="descricaoConsulta">Descrição</Label>
                  <Textarea id="descricaoConsulta" placeholder="Descreva o objetivo e escopo da consulta" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <Input id="dataInicio" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="dataFim">Data de Fim</Label>
                    <Input id="dataFim" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="local">Local (opcional)</Label>
                  <Input id="local" placeholder="Local para reuniões presenciais" />
                </div>
                <div>
                  <Label htmlFor="responsavelConsulta">Responsável</Label>
                  <Input id="responsavelConsulta" placeholder="Nome do responsável técnico" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Criar Consulta</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar consultas por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="planejada">Planejada</SelectItem>
              <SelectItem value="ativa">Ativa</SelectItem>
              <SelectItem value="encerrada">Encerrada</SelectItem>
              <SelectItem value="suspensa">Suspensa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="consultas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="consultas">Consultas Públicas</TabsTrigger>
            <TabsTrigger value="contribuicoes">Contribuições</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="consultas">
            <div className="grid gap-6">
              {filteredConsultas.map((consulta) => (
                <Card key={consulta.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{consulta.titulo}</CardTitle>
                        <Badge className={getStatusColor(consulta.status)}>
                          {consulta.status}
                        </Badge>
                        <Badge className={getCategoriaColor(consulta.categoria)}>
                          {consulta.categoria.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{consulta.descricao}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          Início: {new Date(consulta.dataInicio).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          Fim: {new Date(consulta.dataFim).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="mr-2 h-4 w-4" />
                          Responsável: {consulta.responsavel}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {consulta.contribuicoes.length} contribuição(ões)
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="mr-2 h-4 w-4" />
                          {consulta.documentos.length} documento(s)
                        </div>
                        {consulta.localizacao && (
                          <div className="text-sm text-gray-600">
                            📍 {consulta.localizacao.endereco}
                          </div>
                        )}
                      </div>
                    </div>

                    {consulta.documentos.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Documentos:</h4>
                        <div className="space-y-2">
                          {consulta.documentos.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div>
                                <span className="text-sm font-medium">{doc.tipo}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  Publicado em {new Date(doc.dataPublicacao).toLocaleDateString()}
                                </span>
                              </div>
                              <Button size="sm" variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Baixar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {consulta.status === "ativa" && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800 mb-1">🟢 Consulta Ativa</h4>
                        <p className="text-sm text-green-700">
                          Esta consulta está aberta para contribuições até {new Date(consulta.dataFim).toLocaleDateString()}
                        </p>
                        <Button size="sm" className="mt-2">Contribuir</Button>
                      </div>
                    )}

                    {consulta.resultados && (
                      <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Resultados:</h4>
                        <p className="text-sm text-blue-700">{consulta.resultados}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contribuicoes">
            <div className="space-y-4">
              {consultas.flatMap(consulta => 
                consulta.contribuicoes.map(contribuicao => (
                  <Card key={contribuicao.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{contribuicao.cidadao}</span>
                          <Badge className={getContribuicaoStatusColor(contribuicao.status)}>
                            {contribuicao.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(contribuicao.data).toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-2">{contribuicao.contribuicao}</p>
                      <div className="text-sm text-gray-500">
                        Consulta: {consultas.find(c => c.contribuicoes.some(cont => cont.id === contribuicao.id))?.titulo}
                      </div>
                      {contribuicao.status === "pendente" && (
                        <div className="mt-3 space-x-2">
                          <Button size="sm" variant="outline">Incorporar</Button>
                          <Button size="sm" variant="outline">Rejeitar</Button>
                          <Button size="sm" variant="outline">Marcar como Analisada</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="relatorios">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participação por Consulta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {consultas.map((consulta) => (
                      <div key={consulta.id} className="flex items-center justify-between">
                        <span className="text-sm">{consulta.titulo.substring(0, 30)}...</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {consulta.contribuicoes.length} contrib.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status das Contribuições</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["pendente", "analisada", "incorporada", "rejeitada"].map((status) => {
                      const count = consultas.flatMap(c => c.contribuicoes).filter(c => c.status === status).length;
                      const total = consultas.flatMap(c => c.contribuicoes).length;
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{status}</span>
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default ConsultasPublicas;
