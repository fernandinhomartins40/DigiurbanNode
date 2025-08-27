
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Visita } from "@/types/assistencia-social";
import { Search, Plus, MapPin, Calendar, FileText, User, CheckCircle2, AlertCircle, Home, Eye, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockVisitas: Visita[] = [
  {
    id: "1",
    familia: "Família Silva",
    endereco: "Rua das Flores, 123 - Centro",
    dataVisita: "2023-05-15T10:30:00",
    tecnico: "Maria Oliveira",
    motivo: "Acompanhamento de família beneficiária do Bolsa Família",
    relatorio: "Visita realizada para verificação das condicionalidades do programa. Família está cumprindo com os requisitos, crianças frequentando escola regularmente. Foi observado que a família necessita de encaminhamento para programa de qualificação profissional, pois o responsável está desempregado há 3 meses.",
    situacaoEncontrada: "Situação de vulnerabilidade social por desemprego do responsável. Condições de habitação adequadas.",
    encaminhamentos: ["Programa de Qualificação Profissional", "CRAS - Atualização Cadastro Único"],
    status: "realizada"
  },
  {
    id: "2",
    familia: "Família Oliveira",
    endereco: "Av. Principal, 456 - Vila Nova",
    dataVisita: "2023-05-18T14:00:00",
    tecnico: "Carlos Mendes",
    motivo: "Denúncia de possível violação de direitos de criança",
    relatorio: "Visita realizada após denúncia anônima. Foi constatado que a criança não está em situação de risco conforme denunciado. Família apresenta vínculos familiares preservados, porém foi identificada situação de vulnerabilidade econômica.",
    situacaoEncontrada: "Não foi constatada violação de direitos conforme denúncia. Família em situação de insegurança alimentar.",
    encaminhamentos: ["CRAS - Inclusão em programa de segurança alimentar", "Atualização do Cadastro Único"],
    status: "realizada",
    anexos: ["relatorio_tecnico_id2.pdf", "fotos_id2.zip"]
  },
  {
    id: "3",
    familia: "Família Pereira",
    endereco: "Rua dos Ipês, 789 - Jardim América",
    dataVisita: "2023-05-22T09:00:00",
    tecnico: "Ana Souza",
    motivo: "Avaliação para concessão de benefício eventual",
    relatorio: "",
    situacaoEncontrada: "",
    status: "agendada"
  },
  {
    id: "4",
    familia: "Família Santos",
    endereco: "Rua dos Pinheiros, 101 - Jardim das Flores",
    dataVisita: "2023-05-10T16:00:00",
    tecnico: "Roberto Alves",
    motivo: "Visita pós-concessão de Auxílio Moradia Emergencial",
    relatorio: "Visita realizada para verificar a aplicação do benefício concedido. Foi constatado que a família está utilizando o recurso adequadamente para pagamento de aluguel conforme previsto. Situação habitacional atual é satisfatória, mas temporária.",
    situacaoEncontrada: "Família em situação habitacional adequada (aluguel), mas necessita acompanhamento para solução definitiva de moradia.",
    encaminhamentos: ["Secretaria de Habitação - Programa Minha Casa Minha Vida"],
    status: "realizada",
    anexos: ["relatorio_habitacional_id4.pdf"]
  },
  {
    id: "5",
    familia: "Família Costa",
    endereco: "Rua das Margaridas, 234 - Centro",
    dataVisita: "2023-05-19T13:30:00",
    tecnico: "Juliana Lima",
    motivo: "Acompanhamento de idoso em situação de vulnerabilidade",
    relatorio: "Visita realizada para acompanhamento de idoso que vive sozinho. Foi verificado que o idoso está com dificuldades de locomoção e necessita de mais apoio para atividades diárias. Possui aposentadoria que garante sua subsistência básica.",
    situacaoEncontrada: "Idoso com autonomia parcialmente comprometida, necessitando de apoio para atividades instrumentais da vida diária.",
    encaminhamentos: ["CRAS - Inclusão no Programa Cuidador Social", "UBS - Avaliação geriátrica"],
    status: "realizada"
  },
  {
    id: "6",
    familia: "Família Rodrigues",
    endereco: "Av. das Palmeiras, 567 - Vila São João",
    dataVisita: "2023-05-23T15:00:00",
    tecnico: "Carlos Mendes",
    motivo: "Verificação de acessibilidade para pessoa com deficiência",
    relatorio: "",
    situacaoEncontrada: "",
    status: "agendada"
  },
  {
    id: "7",
    familia: "Família Almeida",
    endereco: "Rua dos Girassóis, 890 - Jardim Primavera",
    dataVisita: "2023-05-16T10:00:00",
    tecnico: "Maria Oliveira",
    motivo: "Acompanhamento de família em descumprimento de condicionalidades",
    relatorio: "Visita cancelada. A família não foi encontrada no endereço na data e horário agendados. Vizinhos informaram que a família mudou-se há cerca de uma semana.",
    situacaoEncontrada: "Família não localizada no endereço cadastrado.",
    status: "cancelada"
  }
];

export default function RegistroVisitas() {
  const { toast } = useToast();
  const [visitas, setVisitas] = useState<Visita[]>(mockVisitas);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visitaSelecionada, setVisitaSelecionada] = useState<Visita | null>(null);
  
  const handleSearch = () => {
    let results = [...mockVisitas];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (visita) =>
          visita.familia.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visita.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visita.tecnico.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visita.motivo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "todos") {
      results = results.filter(visita => visita.status === statusFilter);
    }
    
    setVisitas(results);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendada":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Agendada</Badge>;
      case "realizada":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Realizada</Badge>;
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Cancelada</Badge>;
      case "redesignada":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Redesignada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Registro de Visitas</h1>
          <div className="flex items-center gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Visita
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Agendar Nova Visita</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para agendar uma nova visita técnica.
                  </DialogDescription>
                </DialogHeader>
                <NovaVisitaForm onSubmit={() => {
                  setIsDialogOpen(false);
                  toast({
                    title: "Visita agendada",
                    description: "A visita foi agendada com sucesso."
                  });
                }} onCancel={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros de Busca</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por família, endereço, técnico ou motivo..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select defaultValue="todos" onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status da visita" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="redesignada">Redesignada</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="proximas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="proximas">Próximas Visitas</TabsTrigger>
            <TabsTrigger value="realizadas">Realizadas</TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="proximas" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Família</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitas.filter(v => v.status === 'agendada').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhuma visita agendada encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visitas
                        .filter(v => v.status === 'agendada')
                        .map((visita) => (
                          <TableRow key={visita.id}>
                            <TableCell>
                              <div className="font-medium">{visita.familia}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                <span className="text-sm truncate max-w-xs">
                                  {visita.endereco}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatDate(visita.dataVisita)}</div>
                              <div className="text-xs text-gray-500">{formatTime(visita.dataVisita)}</div>
                            </TableCell>
                            <TableCell>{visita.tecnico}</TableCell>
                            <TableCell>
                              <span className="text-sm truncate block max-w-xs">
                                {visita.motivo}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="mr-2" onClick={() => setVisitaSelecionada(visita)}>
                                Ver
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {
                                toast({
                                  title: "Atualização de visita",
                                  description: `Atualizando status da visita à ${visita.familia}`
                                });
                              }}>
                                Atualizar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="realizadas" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Família</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitas.filter(v => v.status === 'realizada' || v.status === 'cancelada').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhuma visita realizada ou cancelada encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visitas
                        .filter(v => v.status === 'realizada' || v.status === 'cancelada')
                        .map((visita) => (
                          <TableRow key={visita.id}>
                            <TableCell>
                              <div className="font-medium">{visita.familia}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                <span className="text-sm truncate max-w-xs">
                                  {visita.endereco}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatDate(visita.dataVisita)}</div>
                              <div className="text-xs text-gray-500">{formatTime(visita.dataVisita)}</div>
                            </TableCell>
                            <TableCell>{visita.tecnico}</TableCell>
                            <TableCell>{getStatusBadge(visita.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => setVisitaSelecionada(visita)}>
                                Ver Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="todas" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Família</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhuma visita encontrada com os critérios de busca.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visitas.map((visita) => (
                        <TableRow key={visita.id}>
                          <TableCell>
                            <div className="font-medium">{visita.familia}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                              <span className="text-sm truncate max-w-xs">
                                {visita.endereco}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(visita.dataVisita)}</div>
                            <div className="text-xs text-gray-500">{formatTime(visita.dataVisita)}</div>
                          </TableCell>
                          <TableCell>{visita.tecnico}</TableCell>
                          <TableCell>{getStatusBadge(visita.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="mr-2" onClick={() => setVisitaSelecionada(visita)}>
                              Ver
                            </Button>
                            {visita.status === 'agendada' && (
                              <Button variant="outline" size="sm" onClick={() => {
                                toast({
                                  title: "Atualização de visita",
                                  description: `Atualizando status da visita à ${visita.familia}`
                                });
                              }}>
                                Atualizar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {visitaSelecionada && (
          <Dialog open={!!visitaSelecionada} onOpenChange={() => setVisitaSelecionada(null)}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Detalhes da Visita</DialogTitle>
                  {getStatusBadge(visitaSelecionada.status)}
                </div>
                <DialogDescription>
                  Visita à {visitaSelecionada.familia} em {formatDate(visitaSelecionada.dataVisita)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">FAMÍLIA</h3>
                    <p className="text-base font-medium mt-1">{visitaSelecionada.familia}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">DATA DA VISITA</h3>
                    <p className="text-base font-medium mt-1">
                      {formatDate(visitaSelecionada.dataVisita)}, {formatTime(visitaSelecionada.dataVisita)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ENDEREÇO</h3>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <p className="text-sm">{visitaSelecionada.endereco}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">TÉCNICO RESPONSÁVEL</h3>
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <p className="text-sm">{visitaSelecionada.tecnico}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">MOTIVO DA VISITA</h3>
                  <p className="mt-1 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    {visitaSelecionada.motivo}
                  </p>
                </div>
                
                {(visitaSelecionada.status === 'realizada' || visitaSelecionada.status === 'cancelada') && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">SITUAÇÃO ENCONTRADA</h3>
                      <p className="mt-1 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        {visitaSelecionada.situacaoEncontrada}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">RELATÓRIO DA VISITA</h3>
                      <p className="mt-1 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md min-h-[100px]">
                        {visitaSelecionada.relatorio}
                      </p>
                    </div>
                    
                    {visitaSelecionada.encaminhamentos && visitaSelecionada.encaminhamentos.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">ENCAMINHAMENTOS</h3>
                        <div className="space-y-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          {visitaSelecionada.encaminhamentos.map((encaminhamento, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                              {encaminhamento}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {visitaSelecionada.anexos && visitaSelecionada.anexos.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">ANEXOS</h3>
                        <div className="space-y-2">
                          {visitaSelecionada.anexos.map((anexo, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="text-sm">{anexo}</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setVisitaSelecionada(null)}>
                  Fechar
                </Button>
                {visitaSelecionada.status === 'agendada' && (
                  <Button onClick={() => {
                    toast({
                      title: "Atualização de visita",
                      description: `Atualizando status da visita à ${visitaSelecionada.familia}`
                    });
                    setVisitaSelecionada(null);
                  }}>
                    Registrar Visita
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="mr-2 h-5 w-5 text-yellow-500" />
                Agendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {visitas.filter(v => v.status === 'agendada').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                Realizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {visitas.filter(v => v.status === 'realizada').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                Canceladas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {visitas.filter(v => v.status === 'cancelada').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Home className="mr-2 h-5 w-5 text-blue-500" />
                Visitas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {visitas.filter(v => {
                  const today = new Date().toISOString().split('T')[0];
                  const visitaDate = new Date(v.dataVisita).toISOString().split('T')[0];
                  return visitaDate === today;
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Visitas</CardTitle>
            <CardDescription>
              Visitas agendadas para os próximos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visitas
                .filter(v => v.status === 'agendada')
                .slice(0, 3)
                .map((visita) => (
                  <div key={visita.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{visita.familia}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(visita.dataVisita)}
                        <Clock className="h-3.5 w-3.5 mx-1" />
                        {formatTime(visita.dataVisita)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span className="truncate max-w-xs">
                          {visita.endereco}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">
                        <span className="block text-right">Técnico:</span>
                        <span className="font-medium">{visita.tecnico}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setVisitaSelecionada(visita)}>
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
                
                {visitas.filter(v => v.status === 'agendada').length === 0 && (
                  <p className="text-center py-4 text-gray-500">
                    Nenhuma visita agendada para os próximos dias.
                  </p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}

interface NovaVisitaFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

function NovaVisitaForm({ onSubmit, onCancel }: NovaVisitaFormProps) {
  const [formData, setFormData] = useState({
    familia: "",
    endereco: "",
    dataVisita: "",
    tecnico: "",
    motivo: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <label htmlFor="familia" className="text-sm font-medium">
            Nome da Família
          </label>
          <Input
            id="familia"
            name="familia"
            value={formData.familia}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="endereco" className="text-sm font-medium">
            Endereço Completo
          </label>
          <Input
            id="endereco"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="dataVisita" className="text-sm font-medium">
              Data e Hora da Visita
            </label>
            <Input
              id="dataVisita"
              name="dataVisita"
              type="datetime-local"
              value={formData.dataVisita}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tecnico" className="text-sm font-medium">
              Técnico Responsável
            </label>
            <Select
              value={formData.tecnico}
              onValueChange={(value) => handleSelectChange("tecnico", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maria Oliveira">Maria Oliveira</SelectItem>
                <SelectItem value="Carlos Mendes">Carlos Mendes</SelectItem>
                <SelectItem value="Ana Souza">Ana Souza</SelectItem>
                <SelectItem value="Roberto Alves">Roberto Alves</SelectItem>
                <SelectItem value="Juliana Lima">Juliana Lima</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="motivo" className="text-sm font-medium">
            Motivo da Visita
          </label>
          <textarea
            id="motivo"
            name="motivo"
            className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            value={formData.motivo}
            onChange={handleChange}
            placeholder="Descreva o motivo da visita técnica..."
            required
          ></textarea>
        </div>
      </div>
      
      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Agendar Visita
        </Button>
      </DialogFooter>
    </form>
  );
}
