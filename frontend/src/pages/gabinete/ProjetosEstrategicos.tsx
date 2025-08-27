import React from 'react';


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FC, useState } from "react";
import { Calendar, Filter, Plus, Search, Target, TrendingUp, Users, AlertTriangle } from "lucide-react";

const projetosData = [
  {
    id: "PROJ-001",
    nome: "Modernização do Centro Histórico",
    descricao: "Revitalização completa do centro histórico da cidade",
    status: "em_andamento",
    prioridade: "alta",
    progresso: 65,
    dataInicio: "2025-01-15",
    dataFim: "2025-12-31",
    orcamento: 2500000,
    orcamentoGasto: 1625000,
    responsavel: "Secretaria de Obras",
    equipe: ["João Silva", "Maria Santos", "Pedro Oliveira"],
    metas: [
      { descricao: "Restauração de fachadas", concluida: true },
      { descricao: "Nova iluminação LED", concluida: true },
      { descricao: "Paisagismo das praças", concluida: false },
      { descricao: "Sinalização turística", concluida: false }
    ]
  },
  {
    id: "PROJ-002",
    nome: "Sistema de Transporte Inteligente",
    descricao: "Implementação de sistema de monitoramento e otimização do transporte público",
    status: "planejamento",
    prioridade: "media",
    progresso: 25,
    dataInicio: "2025-03-01",
    dataFim: "2025-10-31",
    orcamento: 1800000,
    orcamentoGasto: 450000,
    responsavel: "Secretaria de Transportes",
    equipe: ["Ana Costa", "Carlos Mendes"],
    metas: [
      { descricao: "Estudo de viabilidade", concluida: true },
      { descricao: "Licitação de equipamentos", concluida: false },
      { descricao: "Instalação de sistema", concluida: false },
      { descricao: "Treinamento equipes", concluida: false }
    ]
  },
  {
    id: "PROJ-003",
    nome: "Programa Habitação Popular",
    descricao: "Construção de 500 unidades habitacionais para famílias de baixa renda",
    status: "execucao",
    prioridade: "alta",
    progresso: 85,
    dataInicio: "2024-08-01",
    dataFim: "2025-06-30",
    orcamento: 15000000,
    orcamentoGasto: 12750000,
    responsavel: "Secretaria de Habitação",
    equipe: ["Roberto Lima", "Fernanda Souza", "Marcos Pereira", "Lucia Martins"],
    metas: [
      { descricao: "Aquisição de terrenos", concluida: true },
      { descricao: "Projetos arquitetônicos", concluida: true },
      { descricao: "Construção das unidades", concluida: false },
      { descricao: "Entrega das chaves", concluida: false }
    ]
  }
];

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    planejamento: { label: "Planejamento", className: "bg-blue-500 text-blue-50" },
    em_andamento: { label: "Em Andamento", className: "bg-orange-500 text-orange-50" },
    execucao: { label: "Execução", className: "bg-green-500 text-green-50" },
    concluido: { label: "Concluído", className: "bg-gray-500 text-gray-50" },
    pausado: { label: "Pausado", className: "bg-red-500 text-red-50" }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-500 text-gray-50" };

  return <Badge className={config.className}>{config.label}</Badge>;
};

const PrioridadeBadge: FC<{ prioridade: string }> = ({ prioridade }) => {
  const prioridadeConfig = {
    alta: { label: "Alta", className: "bg-red-100 text-red-800 border border-red-200" },
    media: { label: "Média", className: "bg-orange-100 text-orange-800 border border-orange-200" },
    baixa: { label: "Baixa", className: "bg-green-100 text-green-800 border border-green-200" }
  };

  const config = prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || { label: prioridade, className: "bg-gray-100 text-gray-800" };

  return <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>{config.label}</span>;
};

const ProjetosEstrategicos: FC = () => {
  const [selectedProjeto, setSelectedProjeto] = useState<string | null>(null);

  const projeto = selectedProjeto ? projetosData.find(p => p.id === selectedProjeto) : null;

  return (
    
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projetos Estratégicos</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Projeto Estratégico</DialogTitle>
                <DialogDescription>
                  Preencha as informações do novo projeto estratégico.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Projeto</Label>
                    <Input id="nome" placeholder="Digite o nome do projeto" />
                  </div>
                  <div>
                    <Label htmlFor="responsavel">Setor Responsável</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="obras">Secretaria de Obras</SelectItem>
                        <SelectItem value="saude">Secretaria de Saúde</SelectItem>
                        <SelectItem value="educacao">Secretaria de Educação</SelectItem>
                        <SelectItem value="transportes">Secretaria de Transportes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" placeholder="Descreva o projeto" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Label htmlFor="orcamento">Orçamento (R$)</Label>
                  <Input id="orcamento" type="number" placeholder="0" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Criar Projeto</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 novos este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">67% do total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45M</div>
              <p className="text-xs text-muted-foreground">R$ 32M executado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projetos Atrasados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">2</div>
              <p className="text-xs text-muted-foreground">Requerem atenção</p>
            </CardContent>
          </Card>
        </div>

        {!selectedProjeto ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Projetos</CardTitle>
                  <CardDescription>Gerencie todos os projetos estratégicos da gestão</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar projetos..." className="pl-8 w-[250px]" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="todos">
                <TabsList className="mb-4">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
                  <TabsTrigger value="andamento">Em Andamento</TabsTrigger>
                  <TabsTrigger value="execucao">Execução</TabsTrigger>
                  <TabsTrigger value="concluido">Concluídos</TabsTrigger>
                </TabsList>

                <TabsContent value="todos" className="space-y-4">
                  {projetosData.map((projeto) => (
                    <div 
                      key={projeto.id}
                      className="border p-4 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedProjeto(projeto.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{projeto.nome}</h3>
                          <p className="text-sm text-muted-foreground">{projeto.descricao}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={projeto.status} />
                          <PrioridadeBadge prioridade={projeto.prioridade} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{projeto.progresso}%</span>
                        </div>
                        <Progress value={projeto.progresso} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                        <span>{projeto.responsavel}</span>
                        <span>{projeto.id}</span>
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
                  <CardTitle>{projeto?.nome}</CardTitle>
                  <CardDescription>{projeto?.descricao}</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedProjeto(null)}>
                  Voltar à Lista
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div><StatusBadge status={projeto?.status || ""} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <div><PrioridadeBadge prioridade={projeto?.prioridade || ""} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Progresso</Label>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Conclusão</span>
                      <span>{projeto?.progresso}%</span>
                    </div>
                    <Progress value={projeto?.progresso} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Informações do Projeto</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data de Início:</span>
                      <span>{new Date(projeto?.dataInicio || "").toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data de Fim:</span>
                      <span>{new Date(projeto?.dataFim || "").toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Orçamento:</span>
                      <span>R$ {projeto?.orcamento.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gasto:</span>
                      <span>R$ {projeto?.orcamentoGasto.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Responsável:</span>
                      <span>{projeto?.responsavel}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Equipe do Projeto</h3>
                  <div className="space-y-2">
                    {projeto?.equipe.map((membro, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{membro}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Metas do Projeto</h3>
                <div className="space-y-2">
                  {projeto?.metas.map((meta, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 border rounded">
                      <input 
                        type="checkbox" 
                        checked={meta.concluida} 
                        readOnly 
                        className="rounded"
                      />
                      <span className={meta.concluida ? "line-through text-muted-foreground" : ""}>
                        {meta.descricao}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Editar Projeto</Button>
                <Button>Atualizar Progresso</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    
  );
};

export default ProjetosEstrategicos;
