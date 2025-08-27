
import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Eye, Camera } from "lucide-react";
import { ObraPublica, ProgressoObra } from "@/types/obras-publicas";

const ProgressoObras: FC = () => {
  // Mock data for obras
  const obras: ObraPublica[] = [
    {
      id: "1",
      numeroContrato: "CT-2024-001",
      nome: "Pavimentação Av. Principal",
      descricao: "Pavimentação asfáltica da Avenida Principal",
      categoria: "pavimentacao",
      tipo: "nova",
      localizacao: {
        endereco: "Avenida Principal, Centro",
        bairro: "Centro",
        coordenadas: { latitude: -23.5505, longitude: -46.6333 },
        area: 2500
      },
      status: "em_andamento",
      contratada: {
        empresa: "Construtora ABC Ltda",
        cnpj: "12.345.678/0001-90",
        responsavelTecnico: "Eng. João Silva",
        telefone: "(11) 3333-3333",
        email: "joao@construtorabc.com"
      },
      orcamento: {
        valorContratado: 850000,
        valorExecutado: 425000,
        fonte: "Recursos Próprios"
      },
      cronograma: {
        dataInicio: "2024-01-15",
        dataPrevisaoTermino: "2024-04-15",
        percentualConcluido: 65
      },
      fiscalizacao: {
        responsavelFiscalizacao: "Eng. Maria Santos"
      },
      documentos: [],
      fotos: [],
      observacoes: "Obra em andamento normal"
    },
    {
      id: "2",
      numeroContrato: "CT-2024-002",
      nome: "Construção Centro de Saúde",
      descricao: "Construção de novo centro de saúde",
      categoria: "edificacao",
      tipo: "nova",
      localizacao: {
        endereco: "Rua da Saúde, 100",
        bairro: "Vila Nova",
        coordenadas: { latitude: -23.5505, longitude: -46.6333 },
        area: 800
      },
      status: "em_andamento",
      contratada: {
        empresa: "Construtora XYZ S.A.",
        cnpj: "98.765.432/0001-10",
        responsavelTecnico: "Eng. Carlos Lima",
        telefone: "(11) 4444-4444",
        email: "carlos@construtorayz.com"
      },
      orcamento: {
        valorContratado: 1200000,
        valorExecutado: 480000,
        fonte: "Convênio Federal"
      },
      cronograma: {
        dataInicio: "2024-02-01",
        dataPrevisaoTermino: "2024-08-01",
        percentualConcluido: 40
      },
      fiscalizacao: {
        responsavelFiscalizacao: "Eng. Pedro Santos"
      },
      documentos: [],
      fotos: [],
      observacoes: "Obra dentro do cronograma"
    }
  ];

  // Mock data for progresso
  const progressoData = [
    { mes: "Jan", obra1: 10, obra2: 0 },
    { mes: "Fev", obra1: 25, obra2: 15 },
    { mes: "Mar", obra1: 45, obra2: 30 },
    { mes: "Abr", obra1: 65, obra2: 40 },
  ];

  const investimentoData = [
    { mes: "Jan", valor: 85000 },
    { mes: "Fev", valor: 127500 },
    { mes: "Mar", valor: 170000 },
    { mes: "Abr", valor: 212500 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_andamento": return "bg-yellow-100 text-yellow-800";
      case "concluida": return "bg-green-100 text-green-800";
      case "paralisada": return "bg-red-100 text-red-800";
      case "atrasada": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressStatus = (percentual: number, dataTermino: string) => {
    const hoje = new Date();
    const termino = new Date(dataTermino);
    const diasRestantes = Math.ceil((termino.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (percentual >= 100) return "concluida";
    if (diasRestantes < 0) return "atrasada";
    if (diasRestantes < 30 && percentual < 80) return "atrasada";
    return "em_andamento";
  };

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <TrendingUp className="mr-3 h-8 w-8" />
              Progresso de Obras
            </h1>
            <p className="text-gray-600">Acompanhe o progresso e status das obras públicas</p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Concluídas</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Atrasadas</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progresso Médio</p>
                  <p className="text-2xl font-bold text-gray-900">52%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="obras" className="space-y-4">
          <TabsList>
            <TabsTrigger value="obras">Obras em Andamento</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos de Progresso</TabsTrigger>
            <TabsTrigger value="financeiro">Execução Financeira</TabsTrigger>
          </TabsList>

          <TabsContent value="obras">
            <div className="grid gap-4">
              {obras.map((obra) => {
                const statusObra = getProgressStatus(obra.cronograma.percentualConcluido, obra.cronograma.dataPrevisaoTermino);
                return (
                  <Card key={obra.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{obra.nome}</CardTitle>
                          <Badge className={getStatusColor(statusObra)}>
                            {statusObra.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">{obra.categoria}</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Camera className="mr-2 h-4 w-4" />
                            Fotos
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Contratada</p>
                            <p className="text-sm">{obra.contratada.empresa}</p>
                            <p className="text-sm text-gray-600">Fiscal: {obra.fiscalizacao.responsavelFiscalizacao}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Cronograma</p>
                            <p className="text-sm">Início: {new Date(obra.cronograma.dataInicio).toLocaleDateString()}</p>
                            <p className="text-sm">Previsão: {new Date(obra.cronograma.dataPrevisaoTermino).toLocaleDateString()}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Orçamento</p>
                            <p className="text-sm">Contratado: R$ {obra.orcamento.valorContratado.toLocaleString()}</p>
                            <p className="text-sm">Executado: R$ {obra.orcamento.valorExecutado.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Progresso Físico</span>
                            <span className="font-bold">{obra.cronograma.percentualConcluido}%</span>
                          </div>
                          <Progress value={obra.cronograma.percentualConcluido} className="h-3" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Execução Financeira</span>
                            <span className="font-bold">
                              {Math.round((obra.orcamento.valorExecutado / obra.orcamento.valorContratado) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(obra.orcamento.valorExecutado / obra.orcamento.valorContratado) * 100} 
                            className="h-3" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="graficos">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progresso Mensal das Obras</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="obra1" stroke="#8884d8" name="Pavimentação Av. Principal" />
                      <Line type="monotone" dataKey="obra2" stroke="#82ca9d" name="Centro de Saúde" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Em Andamento</span>
                      </div>
                      <span className="text-sm font-medium">2 obras</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Concluídas</span>
                      </div>
                      <span className="text-sm font-medium">5 obras</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Atrasadas</span>
                      </div>
                      <span className="text-sm font-medium">0 obras</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financeiro">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Execução Financeira Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={investimentoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, 'Valor Executado']} />
                      <Bar dataKey="valor" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Total Contratado</p>
                      <p className="text-2xl font-bold text-gray-900">R$ 2.050.000</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Total Executado</p>
                      <p className="text-2xl font-bold text-green-600">R$ 905.000</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Saldo Restante</p>
                      <p className="text-2xl font-bold text-blue-600">R$ 1.145.000</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default ProgressoObras;
