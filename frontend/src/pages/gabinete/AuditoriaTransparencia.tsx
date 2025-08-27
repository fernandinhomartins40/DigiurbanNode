import React from 'react';


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FC } from "react";
import { Shield, AlertTriangle, CheckCircle, FileSearch, Download, ExternalLink, Clock } from "lucide-react";

const auditoriaData = [
  {
    id: "AUD-2025-001",
    titulo: "Auditoria de Contratos 2024",
    categoria: "Contratos",
    status: "concluida",
    dataInicio: "2024-11-01",
    dataFim: "2025-01-15",
    responsavel: "Controladoria Geral",
    valorAuditado: 12500000,
    achados: 3,
    recomendacoes: 8,
    implementadas: 6,
    relatorio: "relatorio_contratos_2024.pdf"
  },
  {
    id: "AUD-2025-002",
    titulo: "Auditoria de Folha de Pagamento",
    categoria: "Recursos Humanos",
    status: "em_andamento",
    dataInicio: "2025-02-01",
    dataFim: "2025-06-30",
    responsavel: "Auditoria Interna",
    valorAuditado: 8900000,
    achados: 1,
    recomendacoes: 4,
    implementadas: 2,
    relatorio: null
  },
  {
    id: "AUD-2025-003",
    titulo: "Auditoria de Obras Públicas",
    categoria: "Obras",
    status: "planejada",
    dataInicio: "2025-07-01",
    dataFim: "2025-10-31",
    responsavel: "Controladoria Geral",
    valorAuditado: 25000000,
    achados: 0,
    recomendacoes: 0,
    implementadas: 0,
    relatorio: null
  }
];

const transparenciaData = [
  {
    categoria: "Portal da Transparência",
    indicador: "Atualização de Dados",
    meta: 100,
    atual: 95,
    status: "atencao"
  },
  {
    categoria: "Prestação de Contas",
    indicador: "Relatórios Mensais",
    meta: 12,
    atual: 11,
    status: "sucesso"
  },
  {
    categoria: "Lei de Acesso à Informação",
    indicador: "Pedidos Respondidos no Prazo",
    meta: 90,
    atual: 88,
    status: "atencao"
  },
  {
    categoria: "Dados Abertos",
    indicador: "Datasets Publicados",
    meta: 25,
    atual: 22,
    status: "sucesso"
  }
];

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    planejada: { label: "Planejada", className: "bg-blue-500 text-blue-50" },
    em_andamento: { label: "Em Andamento", className: "bg-orange-500 text-orange-50" },
    concluida: { label: "Concluída", className: "bg-green-500 text-green-50" },
    suspensa: { label: "Suspensa", className: "bg-red-500 text-red-50" }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-500 text-gray-50" };

  return <Badge className={config.className}>{config.label}</Badge>;
};

const AuditoriaTransparencia: FC = () => {
  return (
    
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Auditoria e Transparência</h1>
          <div className="flex gap-2">
            <Select defaultValue="semestral">
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="semestral">Semestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Gerar Relatório</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Auditorias Ativas</CardTitle>
              <FileSearch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">3 concluídas este ano</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conformidade</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">92%</div>
              <p className="text-xs text-muted-foreground">Índice de conformidade</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Achados Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">2</div>
              <p className="text-xs text-muted-foreground">Requerem ação imediata</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transparência</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95%</div>
              <p className="text-xs text-muted-foreground">Índice de transparência</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="auditorias" className="space-y-6">
          <TabsList>
            <TabsTrigger value="auditorias">Auditorias</TabsTrigger>
            <TabsTrigger value="transparencia">Transparência</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="auditorias" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auditorias em Curso</CardTitle>
                <CardDescription>Acompanhe o progresso das auditorias internas e externas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditoriaData.map((auditoria) => (
                    <div key={auditoria.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{auditoria.titulo}</h3>
                          <p className="text-sm text-muted-foreground">{auditoria.categoria}</p>
                        </div>
                        <StatusBadge status={auditoria.status} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Período:</span>
                            <span>
                              {new Date(auditoria.dataInicio).toLocaleDateString()} - 
                              {new Date(auditoria.dataFim).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Responsável:</span>
                            <span>{auditoria.responsavel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor Auditado:</span>
                            <span>R$ {auditoria.valorAuditado.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Achados:</span>
                            <span className={auditoria.achados > 0 ? "text-red-600" : "text-green-600"}>
                              {auditoria.achados}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Recomendações:</span>
                            <span>{auditoria.recomendacoes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Implementadas:</span>
                            <span className="text-green-600">{auditoria.implementadas}</span>
                          </div>
                        </div>
                      </div>

                      {auditoria.recomendacoes > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Implementação de Recomendações</span>
                            <span>{Math.round((auditoria.implementadas / auditoria.recomendacoes) * 100)}%</span>
                          </div>
                          <Progress value={(auditoria.implementadas / auditoria.recomendacoes) * 100} className="h-2" />
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">{auditoria.id}</div>
                        <div className="flex gap-2">
                          {auditoria.relatorio && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Relatório
                            </Button>
                          )}
                          <Button variant="outline" size="sm">Ver Detalhes</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transparencia" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Índices de Transparência</CardTitle>
                  <CardDescription>Monitoramento dos indicadores de transparência pública</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transparenciaData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.indicador}</span>
                          <span>{item.atual}/{item.meta}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={(item.atual / item.meta) * 100} className="flex-1 h-2" />
                          <div className="flex items-center">
                            {item.status === "sucesso" ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{item.categoria}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portal da Transparência</CardTitle>
                  <CardDescription>Acesso rápido às informações públicas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-between">
                      <span>Receitas e Despesas</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Contratos e Licitações</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Folha de Pagamento</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Convênios</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Dados Abertos</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lei de Acesso à Informação</CardTitle>
                <CardDescription>Solicitações de informação pública</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">127</div>
                    <div className="text-sm text-muted-foreground">Pedidos Recebidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">112</div>
                    <div className="text-sm text-muted-foreground">Respondidos no Prazo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">15</div>
                    <div className="text-sm text-muted-foreground">Em Andamento</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Taxa de Resposta no Prazo</span>
                    <span>88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance e Controles Internos</CardTitle>
                <CardDescription>Monitoramento de conformidade com normas e regulamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Lei de Responsabilidade Fiscal</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">Conforme</div>
                      <div className="text-sm text-muted-foreground">Limites respeitados</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium">LGPD</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">Em Adequação</div>
                      <div className="text-sm text-muted-foreground">85% implementado</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Controles Internos</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Segregação de Funções</span>
                        <Badge className="bg-green-500 text-green-50">Implementado</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Controles de Acesso</span>
                        <Badge className="bg-green-500 text-green-50">Implementado</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Auditoria de Sistemas</span>
                        <Badge className="bg-yellow-500 text-yellow-50">Em Implementação</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Auditoria</CardTitle>
                <CardDescription>Acesse todos os relatórios de auditoria e transparência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <FileSearch className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Relatório Anual de Atividades 2024</div>
                        <div className="text-sm text-muted-foreground">Controladoria Geral • 15/01/2025</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <FileSearch className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Auditoria de Contratos 2024</div>
                        <div className="text-sm text-muted-foreground">Auditoria Interna • 20/01/2025</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Relatório de Transparência Q1 2025</div>
                        <div className="text-sm text-muted-foreground">Em elaboração</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      <Clock className="h-4 w-4 mr-1" />
                      Em breve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default AuditoriaTransparencia;
