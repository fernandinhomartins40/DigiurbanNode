import React from 'react';


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FC, useState } from "react";
import { FileText, Send, Eye, Edit, Trash2, Plus, Search, Calendar, User } from "lucide-react";

const comunicacoesData = [
  {
    id: "COM-2025-001",
    titulo: "Decreto de Emergência Climática",
    tipo: "decreto",
    status: "publicado",
    autor: "Gabinete do Prefeito",
    dataCreacao: "2025-05-15",
    dataPublicacao: "2025-05-18",
    canal: "Diário Oficial",
    conteudo: "Decreta estado de emergência climática no município devido às fortes chuvas...",
    anexos: ["decreto_001_2025.pdf"],
    visualizacoes: 1245
  },
  {
    id: "COM-2025-002",
    titulo: "Nota de Esclarecimento - Obras na Av. Principal",
    tipo: "nota",
    status: "rascunho",
    autor: "Assessoria de Comunicação",
    dataCreacao: "2025-05-17",
    dataPublicacao: null,
    canal: "Site e Redes Sociais",
    conteudo: "A Prefeitura esclarece sobre o cronograma de obras na Avenida Principal...",
    anexos: [],
    visualizacoes: 0
  },
  {
    id: "COM-2025-003",
    titulo: "Comunicado - Alteração no Atendimento",
    tipo: "comunicado",
    status: "agendado",
    autor: "Secretaria de Administração",
    dataCreacao: "2025-05-16",
    dataPublicacao: "2025-05-20",
    canal: "Múltiplos Canais",
    conteudo: "Comunicamos a alteração no horário de atendimento durante a semana de...",
    anexos: ["cronograma_atendimento.pdf"],
    visualizacoes: 0
  },
  {
    id: "COM-2025-004",
    titulo: "Edital de Licitação - Reforma da Praça Central",
    tipo: "edital",
    status: "publicado",
    autor: "Departamento de Licitações",
    dataCreacao: "2025-05-10",
    dataPublicacao: "2025-05-12",
    canal: "Diário Oficial",
    conteudo: "Torna público o Edital de Concorrência Pública nº 001/2025...",
    anexos: ["edital_001_2025.pdf", "projeto_praca.pdf"],
    visualizacoes: 892
  }
];

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    rascunho: { label: "Rascunho", className: "bg-gray-500 text-gray-50" },
    revisao: { label: "Em Revisão", className: "bg-yellow-500 text-yellow-50" },
    aprovado: { label: "Aprovado", className: "bg-blue-500 text-blue-50" },
    agendado: { label: "Agendado", className: "bg-orange-500 text-orange-50" },
    publicado: { label: "Publicado", className: "bg-green-500 text-green-50" },
    arquivado: { label: "Arquivado", className: "bg-gray-400 text-gray-50" }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-500 text-gray-50" };

  return <Badge className={config.className}>{config.label}</Badge>;
};

const TipoBadge: FC<{ tipo: string }> = ({ tipo }) => {
  const tipoConfig = {
    decreto: { label: "Decreto", className: "bg-purple-100 text-purple-800 border border-purple-200" },
    portaria: { label: "Portaria", className: "bg-blue-100 text-blue-800 border border-blue-200" },
    nota: { label: "Nota", className: "bg-green-100 text-green-800 border border-green-200" },
    comunicado: { label: "Comunicado", className: "bg-orange-100 text-orange-800 border border-orange-200" },
    edital: { label: "Edital", className: "bg-red-100 text-red-800 border border-red-200" }
  };

  const config = tipoConfig[tipo as keyof typeof tipoConfig] || { label: tipo, className: "bg-gray-100 text-gray-800" };

  return <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>{config.label}</span>;
};

const ComunicacaoOficial: FC = () => {
  const [selectedComunicacao, setSelectedComunicacao] = useState<string | null>(null);

  const comunicacao = selectedComunicacao ? comunicacoesData.find(c => c.id === selectedComunicacao) : null;

  return (
    
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Comunicação Oficial</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Nova Comunicação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Nova Comunicação Oficial</DialogTitle>
                <DialogDescription>
                  Crie uma nova comunicação oficial para publicação.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo de Comunicação</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="decreto">Decreto</SelectItem>
                        <SelectItem value="portaria">Portaria</SelectItem>
                        <SelectItem value="nota">Nota de Esclarecimento</SelectItem>
                        <SelectItem value="comunicado">Comunicado</SelectItem>
                        <SelectItem value="edital">Edital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="canal">Canal de Publicação</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário Oficial</SelectItem>
                        <SelectItem value="site">Site Oficial</SelectItem>
                        <SelectItem value="redes">Redes Sociais</SelectItem>
                        <SelectItem value="multiplos">Múltiplos Canais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" placeholder="Digite o título da comunicação" />
                </div>
                <div>
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <Textarea id="conteudo" placeholder="Digite o conteúdo da comunicação" rows={8} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataPublicacao">Data de Publicação</Label>
                    <Input id="dataPublicacao" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="status">Status Inicial</Label>
                    <Select defaultValue="rascunho">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="revisao">Em Revisão</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancelar</Button>
                <Button variant="outline">Salvar Rascunho</Button>
                <Button>Criar e Enviar para Revisão</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Comunicações</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">68% do total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Revisão</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5K</div>
              <p className="text-xs text-muted-foreground">Total do mês</p>
            </CardContent>
          </Card>
        </div>

        {!selectedComunicacao ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comunicações Oficiais</CardTitle>
                  <CardDescription>Gerencie todas as comunicações oficiais da prefeitura</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar comunicações..." className="pl-8 w-[250px]" />
                  </div>
                  <Select defaultValue="todos">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="decreto">Decretos</SelectItem>
                      <SelectItem value="portaria">Portarias</SelectItem>
                      <SelectItem value="nota">Notas</SelectItem>
                      <SelectItem value="comunicado">Comunicados</SelectItem>
                      <SelectItem value="edital">Editais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="todos">
                <TabsList className="mb-4">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="rascunho">Rascunhos</TabsTrigger>
                  <TabsTrigger value="revisao">Em Revisão</TabsTrigger>
                  <TabsTrigger value="agendado">Agendados</TabsTrigger>
                  <TabsTrigger value="publicado">Publicados</TabsTrigger>
                </TabsList>

                <TabsContent value="todos" className="space-y-4">
                  {comunicacoesData.map((comunicacao) => (
                    <div 
                      key={comunicacao.id}
                      className="border p-4 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedComunicacao(comunicacao.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{comunicacao.titulo}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {comunicacao.conteudo}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <TipoBadge tipo={comunicacao.tipo} />
                          <StatusBadge status={comunicacao.status} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{comunicacao.autor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Criado: {new Date(comunicacao.dataCreacao).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          <span>{comunicacao.canal}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>{comunicacao.visualizacoes} visualizações</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-xs text-muted-foreground">
                          {comunicacao.anexos.length > 0 && (
                            <span>{comunicacao.anexos.length} anexo(s)</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{comunicacao.id}</div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <TipoBadge tipo={comunicacao?.tipo || ""} />
                    <StatusBadge status={comunicacao?.status || ""} />
                  </div>
                  <CardTitle>{comunicacao?.titulo}</CardTitle>
                  <CardDescription>Por {comunicacao?.autor} • {comunicacao?.canal}</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedComunicacao(null)}>
                  Voltar à Lista
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Informações da Comunicação</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data de Criação:</span>
                      <span>{new Date(comunicacao?.dataCreacao || "").toLocaleDateString()}</span>
                    </div>
                    {comunicacao?.dataPublicacao && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Publicação:</span>
                        <span>{new Date(comunicacao.dataPublicacao).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Canal:</span>
                      <span>{comunicacao?.canal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visualizações:</span>
                      <span>{comunicacao?.visualizacoes}</span>
                    </div>
                  </div>
                </div>

                {comunicacao?.anexos && comunicacao.anexos.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Anexos</h3>
                    <div className="space-y-2">
                      {comunicacao.anexos.map((anexo, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm p-2 border rounded">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{anexo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Conteúdo</h3>
                <div className="bg-muted p-4 rounded text-sm">
                  {comunicacao?.conteudo}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                {comunicacao?.status === "rascunho" && (
                  <Button variant="outline">Enviar para Revisão</Button>
                )}
                {comunicacao?.status === "aprovado" && (
                  <Button>Publicar Agora</Button>
                )}
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    
  );
};

export default ComunicacaoOficial;
