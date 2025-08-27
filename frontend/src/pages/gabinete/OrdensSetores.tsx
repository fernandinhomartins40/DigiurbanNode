import React from 'react';


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FC, useState } from "react";
import { AlertCircle, Calendar, Clock, Download, FileText, Plus, Search, Upload, X } from "lucide-react";

// Dados de exemplo para ordens
const ordensData = [
  {
    id: "ORD-2025-001",
    setor: "Secretaria de Saúde",
    assunto: "Relatório mensal de atendimentos",
    dataEnvio: "2025-05-15",
    prazo: "2025-05-20",
    status: "pendente",
  },
  {
    id: "ORD-2025-002",
    setor: "Secretaria de Educação",
    assunto: "Plano de ação para retorno às aulas",
    dataEnvio: "2025-05-14",
    prazo: "2025-05-25",
    status: "em_andamento",
  },
  {
    id: "ORD-2025-003",
    setor: "Departamento de Obras",
    assunto: "Cronograma de obras em andamento",
    dataEnvio: "2025-05-12",
    prazo: "2025-05-18",
    status: "concluida",
  },
  {
    id: "ORD-2025-004",
    setor: "Secretaria de Finanças",
    assunto: "Atualização de previsão orçamentária",
    dataEnvio: "2025-05-10",
    prazo: "2025-05-17",
    status: "concluida",
  },
  {
    id: "ORD-2025-005",
    setor: "Secretaria de Cultura",
    assunto: "Programação de eventos do mês",
    dataEnvio: "2025-05-08",
    prazo: "2025-05-15",
    status: "pendente",
  },
  {
    id: "ORD-2025-006",
    setor: "Departamento Jurídico",
    assunto: "Análise de contratos pendentes",
    dataEnvio: "2025-05-07",
    prazo: "2025-05-21",
    status: "em_andamento",
  },
];

// Detalhes de uma ordem específica
const ordemDetalhada = {
  id: "ORD-2025-002",
  setor: "Secretaria de Educação",
  assunto: "Plano de ação para retorno às aulas",
  descricao: "Elaborar um plano detalhado para o retorno às aulas presenciais, considerando protocolos de segurança, cronograma escalonado e adaptações necessárias nos espaços escolares. Incluir orçamento preliminar para as adaptações.",
  dataEnvio: "2025-05-14",
  prazo: "2025-05-25",
  status: "em_andamento",
  prioridade: "alta",
  responsavel: "Maria Silva",
  responsavelEmail: "maria.silva@educacao.gov.br",
  documentos: [
    { nome: "Protocolo_Sanitário.pdf", tamanho: "1.2 MB", data: "2025-05-14" },
    { nome: "Modelo_Plano.docx", tamanho: "850 KB", data: "2025-05-14" }
  ],
  historico: [
    { data: "2025-05-14", hora: "09:15", acao: "Ordem criada pelo Gabinete", autor: "João Oliveira" },
    { data: "2025-05-14", hora: "10:20", acao: "Ordem recebida pela Secretaria", autor: "Sistema" },
    { data: "2025-05-15", hora: "14:30", acao: "Status atualizado para 'Em andamento'", autor: "Maria Silva" },
    { data: "2025-05-16", hora: "11:45", acao: "Comentário adicionado", autor: "Maria Silva" }
  ],
  comentarios: [
    {
      autor: "Maria Silva",
      data: "2025-05-16",
      hora: "11:45",
      texto: "Estamos elaborando o plano conforme solicitado. Precisaremos de mais informações sobre o orçamento disponível para adaptações nas escolas."
    }
  ]
};

// Componente para o status das ordens
const OrdemStatus: FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pendente: { label: "Pendente", className: "bg-yellow-500 text-yellow-50" },
    em_andamento: { label: "Em Andamento", className: "bg-blue-500 text-blue-50" },
    concluida: { label: "Concluída", className: "bg-green-500 text-green-50" },
    cancelada: { label: "Cancelada", className: "bg-red-500 text-red-50" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-500 text-gray-50" };

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

// Componente para o indicador de prioridade
const PrioridadeTag: FC<{ prioridade: string }> = ({ prioridade }) => {
  const prioridadeConfig = {
    baixa: { label: "Baixa", className: "bg-green-100 text-green-800 border border-green-200" },
    media: { label: "Média", className: "bg-orange-100 text-orange-800 border border-orange-200" },
    alta: { label: "Alta", className: "bg-red-100 text-red-800 border border-red-200" },
  };

  const config = prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || 
                { label: prioridade, className: "bg-gray-100 text-gray-800 border border-gray-200" };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

// Componente para a lista de ordens
const ListaOrdens: FC<{ ordens: typeof ordensData; onSelectOrdem?: (id: string) => void }> = ({ 
  ordens,
  onSelectOrdem 
}) => (
  <div className="space-y-2">
    {ordens.map((ordem) => (
      <div 
        key={ordem.id}
        className="border p-4 rounded-lg hover:border-primary hover:bg-accent cursor-pointer"
        onClick={() => onSelectOrdem && onSelectOrdem(ordem.id)}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{ordem.assunto}</p>
            <p className="text-sm text-muted-foreground">{ordem.setor}</p>
          </div>
          <OrdemStatus status={ordem.status} />
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-muted-foreground">
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" /> Envio: {new Date(ordem.dataEnvio).toLocaleDateString()}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" /> Prazo: {new Date(ordem.prazo).toLocaleDateString()}
            </span>
          </div>
          <div className="text-xs">{ordem.id}</div>
        </div>
      </div>
    ))}
  </div>
);

// Componente para o formulário de nova ordem
const NovaOrdemForm: FC = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="setor">Setor Destinatário</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="saude">Secretaria de Saúde</SelectItem>
            <SelectItem value="educacao">Secretaria de Educação</SelectItem>
            <SelectItem value="obras">Departamento de Obras</SelectItem>
            <SelectItem value="financas">Secretaria de Finanças</SelectItem>
            <SelectItem value="cultura">Secretaria de Cultura</SelectItem>
            <SelectItem value="juridico">Departamento Jurídico</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="prioridade">Prioridade</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="assunto">Assunto</Label>
      <Input id="assunto" placeholder="Título resumido da ordem" />
    </div>

    <div className="space-y-2">
      <Label htmlFor="descricao">Descrição Detalhada</Label>
      <Textarea id="descricao" placeholder="Descreva detalhadamente o que está sendo solicitado" rows={5} />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="prazo">Prazo</Label>
        <Input id="prazo" type="date" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="responsavel">Responsável (opcional)</Label>
        <Input id="responsavel" placeholder="Nome do responsável" />
      </div>
    </div>

    <div className="space-y-2">
      <Label>Anexos</Label>
      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer">
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Arraste arquivos para anexar ou clique para selecionar</p>
      </div>
    </div>

    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between bg-muted p-2 rounded">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          <span className="text-sm">Documento_exemplo.pdf</span>
        </div>
        <Button variant="ghost" size="sm">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

// Componente para os detalhes da ordem
const DetalheOrdem: FC<{ ordem: typeof ordemDetalhada }> = ({ ordem }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-bold">{ordem.assunto}</h2>
        <p className="text-muted-foreground">{ordem.setor}</p>
      </div>
      <div className="flex items-center gap-2">
        <OrdemStatus status={ordem.status} />
        <PrioridadeTag prioridade={ordem.prioridade} />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="space-y-1">
        <p className="text-muted-foreground">Data de Envio</p>
        <p>{new Date(ordem.dataEnvio).toLocaleDateString()}</p>
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground">Prazo</p>
        <p>{new Date(ordem.prazo).toLocaleDateString()}</p>
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground">ID da Ordem</p>
        <p>{ordem.id}</p>
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground">Responsável</p>
        <p>{ordem.responsavel}</p>
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="font-medium">Descrição</h3>
      <p className="text-sm bg-muted p-4 rounded">{ordem.descricao}</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-medium">Documentos Anexos</h3>
      <div className="space-y-2">
        {ordem.documentos.map((doc, index) => (
          <div key={index} className="flex items-center justify-between bg-muted p-3 rounded">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <div>
                <p className="text-sm font-medium">{doc.nome}</p>
                <p className="text-xs text-muted-foreground">{doc.tamanho} - {doc.data}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span className="text-xs">Baixar</span>
            </Button>
          </div>
        ))}
      </div>
    </div>

    <Separator />

    <div className="space-y-4">
      <h3 className="font-medium">Histórico</h3>
      <div className="space-y-2">
        {ordem.historico.map((item, index) => (
          <div key={index} className="flex gap-4 text-sm">
            <div className="text-muted-foreground w-32">
              {item.data} {item.hora}
            </div>
            <div className="flex-1">
              <p>{item.acao}</p>
              <p className="text-xs text-muted-foreground">por {item.autor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <Separator />

    <div className="space-y-4">
      <h3 className="font-medium">Comentários</h3>
      {ordem.comentarios.map((comentario, index) => (
        <div key={index} className="bg-muted p-4 rounded">
          <div className="flex justify-between mb-2">
            <p className="font-medium">{comentario.autor}</p>
            <p className="text-xs text-muted-foreground">{comentario.data} {comentario.hora}</p>
          </div>
          <p className="text-sm">{comentario.texto}</p>
        </div>
      ))}

      <div className="space-y-2">
        <Textarea placeholder="Adicione um comentário..." className="min-h-[100px]" />
        <div className="flex justify-end">
          <Button>Enviar Comentário</Button>
        </div>
      </div>
    </div>

    <div className="flex justify-between pt-4">
      <Button variant="outline">Voltar</Button>
      <div className="space-x-2">
        <Button variant="outline">Editar Ordem</Button>
        <Button variant={ordem.status === "concluida" ? "outline" : "default"} disabled={ordem.status === "concluida"}>
          {ordem.status === "concluida" ? "Concluída" : "Marcar como Concluída"}
        </Button>
      </div>
    </div>
  </div>
);

// Componente principal da página
const OrdensSetores: FC = () => {
  const [selectedOrdemId, setSelectedOrdemId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleSelectOrdem = (id: string) => {
    setSelectedOrdemId(id);
    setShowDetails(true);
  };

  return (
    
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ordens aos Setores</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Nova Ordem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Nova Ordem de Serviço</DialogTitle>
                <DialogDescription>
                  Preencha os campos abaixo para criar uma nova ordem.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <NovaOrdemForm />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Criar Ordem</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!showDetails ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Ordens</CardTitle>
                  <CardDescription>Gerencie ordens enviadas aos setores</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar ordens..."
                      className="pl-8 w-[250px]"
                    />
                  </div>
                  <Select defaultValue="todos">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os setores</SelectItem>
                      <SelectItem value="saude">Secretaria de Saúde</SelectItem>
                      <SelectItem value="educacao">Secretaria de Educação</SelectItem>
                      <SelectItem value="obras">Departamento de Obras</SelectItem>
                      <SelectItem value="financas">Secretaria de Finanças</SelectItem>
                      <SelectItem value="cultura">Secretaria de Cultura</SelectItem>
                      <SelectItem value="juridico">Departamento Jurídico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="todas">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="todas" className="flex-1">Todas</TabsTrigger>
                  <TabsTrigger value="pendentes" className="flex-1">Pendentes</TabsTrigger>
                  <TabsTrigger value="em_andamento" className="flex-1">Em Andamento</TabsTrigger>
                  <TabsTrigger value="concluidas" className="flex-1">Concluídas</TabsTrigger>
                </TabsList>

                <TabsContent value="todas">
                  <ListaOrdens ordens={ordensData} onSelectOrdem={handleSelectOrdem} />
                </TabsContent>
                <TabsContent value="pendentes">
                  <ListaOrdens 
                    ordens={ordensData.filter(ordem => ordem.status === "pendente")} 
                    onSelectOrdem={handleSelectOrdem}
                  />
                </TabsContent>
                <TabsContent value="em_andamento">
                  <ListaOrdens 
                    ordens={ordensData.filter(ordem => ordem.status === "em_andamento")} 
                    onSelectOrdem={handleSelectOrdem}
                  />
                </TabsContent>
                <TabsContent value="concluidas">
                  <ListaOrdens 
                    ordens={ordensData.filter(ordem => ordem.status === "concluida")} 
                    onSelectOrdem={handleSelectOrdem}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Detalhes da Ordem</CardTitle>
            </CardHeader>
            <CardContent>
              <DetalheOrdem ordem={ordemDetalhada} />
            </CardContent>
          </Card>
        )}

        {!showDetails && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300">Dica</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Para melhor acompanhamento, recomendamos definir prazos realistas e incluir descrições detalhadas nas ordens. 
                Para ordens urgentes, utilize a prioridade alta e entre em contato direto com o responsável do setor.
              </p>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default OrdensSetores;
