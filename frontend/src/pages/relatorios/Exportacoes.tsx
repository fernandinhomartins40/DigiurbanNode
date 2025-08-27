
import { FC, useState } from "react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Download, FileSpreadsheet, FileText, Calendar, Clock, 
  Settings, ListChecks, BarChart, FileCheck
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Exportacoes: FC = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleGerarExportacao = () => {
    toast({
      title: "Exportação iniciada",
      description: "O seu relatório está sendo gerado e ficará disponível em breve.",
    });
  };

  const handleAgendarExportacao = () => {
    toast({
      title: "Exportação agendada",
      description: "Seu relatório será gerado e enviado conforme o agendamento.",
    });
  };

  return (
    
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Exportações (PDF/Excel)</h1>
        </div>

        <Tabs defaultValue="gerar">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="gerar">Gerar Exportação</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gerar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Nova Exportação</CardTitle>
                    <CardDescription>Configure as opções para gerar seu relatório</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tipo de Relatório</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="atendimentos">Atendimentos</SelectItem>
                            <SelectItem value="protocolos">Protocolos</SelectItem>
                            <SelectItem value="usuarios">Usuários</SelectItem>
                            <SelectItem value="servicos">Serviços</SelectItem>
                            <SelectItem value="avaliacoes">Avaliações</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Formato</label>
                        <Select defaultValue="pdf">
                          <SelectTrigger>
                            <SelectValue placeholder="Formato" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="xls">Excel (XLS)</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Data Inicial</label>
                        <DatePicker date={startDate} setDate={setStartDate} placeholder="Selecionar data" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Data Final</label>
                        <DatePicker date={endDate} setDate={setEndDate} placeholder="Selecionar data" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Setor/Departamento</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="saude">Saúde</SelectItem>
                          <SelectItem value="educacao">Educação</SelectItem>
                          <SelectItem value="assistencia">Assistência Social</SelectItem>
                          <SelectItem value="urbanismo">Urbanismo</SelectItem>
                          <SelectItem value="meio-ambiente">Meio Ambiente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Campos a incluir</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="field1" defaultChecked />
                          <Label htmlFor="field1">Dados básicos</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="field2" defaultChecked />
                          <Label htmlFor="field2">Datas e prazos</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="field3" defaultChecked />
                          <Label htmlFor="field3">Responsáveis</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="field4" />
                          <Label htmlFor="field4">Histórico completo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="field5" />
                          <Label htmlFor="field5">Documentos anexos</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="field6" defaultChecked />
                          <Label htmlFor="field6">Estatísticas</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Título do Relatório</label>
                      <Input placeholder="Ex: Relatório Mensal de Atendimentos" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Observações</label>
                      <textarea 
                        className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Observações adicionais para o relatório"
                      ></textarea>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleGerarExportacao} className="w-full">
                      <Download className="h-4 w-4 mr-2" /> Gerar Exportação
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Modelos Recentes</CardTitle>
                    <CardDescription>Relatórios pré-configurados</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <button className="flex items-center w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                      <FileSpreadsheet className="h-5 w-5 mr-3 text-blue-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Atendimentos Mensais</p>
                        <p className="text-xs text-gray-500">Excel • Todos os setores</p>
                      </div>
                    </button>
                    
                    <button className="flex items-center w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
                      <FileText className="h-5 w-5 mr-3 text-purple-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Protocolos Pendentes</p>
                        <p className="text-xs text-gray-500">PDF • Filtrado por prazo</p>
                      </div>
                    </button>
                    
                    <button className="flex items-center w-full p-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                      <BarChart className="h-5 w-5 mr-3 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Desempenho de Setores</p>
                        <p className="text-xs text-gray-500">PDF • Com gráficos</p>
                      </div>
                    </button>
                    
                    <button className="flex items-center w-full p-3 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors">
                      <ListChecks className="h-5 w-5 mr-3 text-amber-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Avaliações Cidadãos</p>
                        <p className="text-xs text-gray-500">Excel • Consolidado</p>
                      </div>
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Exportações</CardTitle>
                <CardDescription>Relatórios gerados nos últimos 90 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-4 text-left font-medium">Nome do Relatório</th>
                        <th className="py-2 px-4 text-left font-medium">Tipo</th>
                        <th className="py-2 px-4 text-left font-medium">Formato</th>
                        <th className="py-2 px-4 text-left font-medium">Data da Geração</th>
                        <th className="py-2 px-4 text-left font-medium">Status</th>
                        <th className="py-2 px-4 text-left font-medium">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">Atendimentos Mensal - Maio 2025</td>
                        <td className="py-3 px-4">Atendimentos</td>
                        <td className="py-3 px-4">PDF</td>
                        <td className="py-3 px-4">18/05/2025 14:32</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Concluído</span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">Relatório de Protocolos - Abril 2025</td>
                        <td className="py-3 px-4">Protocolos</td>
                        <td className="py-3 px-4">Excel</td>
                        <td className="py-3 px-4">28/04/2025 10:15</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Concluído</span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">Desempenho por Setores - Q1 2025</td>
                        <td className="py-3 px-4">Desempenho</td>
                        <td className="py-3 px-4">PDF</td>
                        <td className="py-3 px-4">15/04/2025 16:42</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Concluído</span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">Análise de Usuários - Março 2025</td>
                        <td className="py-3 px-4">Usuários</td>
                        <td className="py-3 px-4">Excel</td>
                        <td className="py-3 px-4">02/04/2025 09:28</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Concluído</span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4">Relatório Executivo - Q1 2025</td>
                        <td className="py-3 px-4">Executivo</td>
                        <td className="py-3 px-4">PDF</td>
                        <td className="py-3 px-4">20/05/2025 08:10</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Processando</span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" disabled>
                            <Clock className="h-4 w-4 mr-2" />
                            Aguarde
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="agendamentos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Agendar Nova Exportação</CardTitle>
                    <CardDescription>Configure relatórios periódicos automáticos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome do Agendamento</label>
                      <Input placeholder="Ex: Relatório Mensal de Desempenho" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tipo de Relatório</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="atendimentos">Atendimentos</SelectItem>
                            <SelectItem value="protocolos">Protocolos</SelectItem>
                            <SelectItem value="usuarios">Usuários</SelectItem>
                            <SelectItem value="desempenho">Desempenho</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Formato</label>
                        <Select defaultValue="pdf">
                          <SelectTrigger>
                            <SelectValue placeholder="Formato" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Frequência</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar frequência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diario">Diário</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="trimestral">Trimestral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Próxima Execução</label>
                        <DatePicker date={startDate} setDate={setStartDate} placeholder="Selecionar data" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Horário</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar horário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">00:00</SelectItem>
                            <SelectItem value="3">03:00</SelectItem>
                            <SelectItem value="6">06:00</SelectItem>
                            <SelectItem value="12">12:00</SelectItem>
                            <SelectItem value="18">18:00</SelectItem>
                            <SelectItem value="21">21:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Destinatários (E-mails)</label>
                      <Input placeholder="email1@exemplo.com, email2@exemplo.com" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="option1" />
                        <Label htmlFor="option1">Salvar cópia no histórico</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="option2" />
                        <Label htmlFor="option2">Incluir análise comparativa com período anterior</Label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleAgendarExportacao} className="w-full">
                      <Calendar className="h-4 w-4 mr-2" /> Agendar Exportação
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Agendamentos Ativos</CardTitle>
                    <CardDescription>Relatórios programados</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 border rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Relatório Gerencial</p>
                          <p className="text-xs text-gray-500">Mensal • PDF</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>Próximo: 01/06/2025</span>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Atividade Semanal</p>
                          <p className="text-xs text-gray-500">Semanal • Excel</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>Próximo: 27/05/2025</span>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Monitoramento Diário</p>
                          <p className="text-xs text-gray-500">Diário • CSV</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>Próximo: 21/05/2025</span>
                      </div>
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

export default Exportacoes;
