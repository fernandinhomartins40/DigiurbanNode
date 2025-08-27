
import { FC, useState } from "react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Inbox, Search, Star, MoreVertical, Trash2, Ban, Archive, Flag, Tag, Plus, Users, Clock, FileText, Shield, AlertTriangle, CheckCircle, Send, Reply, Forward } from "lucide-react";

interface EmailMessage {
  id: string;
  read: boolean;
  starred: boolean;
  from: string;
  fromDepartment?: string;
  subject: string;
  excerpt: string;
  date: string;
  hasAttachment: boolean;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'memorando' | 'oficio' | 'circular' | 'comunicado' | 'relatorio' | 'normal';
  status: 'pending' | 'read' | 'replied' | 'forwarded' | 'archived';
  confidential?: boolean;
  requiresResponse?: boolean;
  responseDeadline?: string;
  digitalSignature?: boolean;
  approvalRequired?: boolean;
}

const mockEmails: EmailMessage[] = [
  {
    id: "1",
    read: false,
    starred: true,
    from: "Dra. Maria Santos",
    fromDepartment: "Secretaria de Saúde",
    subject: "Relatório Mensal de Atendimentos - Janeiro 2025",
    excerpt: "Segue anexo o relatório mensal de atendimentos do posto central conforme solicitado...",
    date: "Hoje, 10:45",
    hasAttachment: true,
    priority: "high",
    type: "relatorio",
    status: "pending",
    requiresResponse: true,
    responseDeadline: "2025-02-05",
    digitalSignature: true,
    category: "primary"
  },
  {
    id: "2",
    read: true,
    starred: false,
    from: "Carlos Oliveira",
    fromDepartment: "Departamento Financeiro",
    subject: "OFÍCIO 125/2025 - Aprovação de Verbas - Projeto Cidade Limpa",
    excerpt: "Prezado Sr. Prefeito, informamos que a solicitação de verba para o projeto cidade limpa foi aprovada...",
    date: "Ontem, 16:32",
    hasAttachment: false,
    priority: "medium",
    type: "oficio",
    status: "read",
    digitalSignature: true,
    category: "primary"
  },
  {
    id: "3",
    read: false,
    starred: false,
    from: "Ana Silva",
    fromDepartment: "Secretaria de Educação",
    subject: "MEMORANDO 045/2025 - Calendário Escolar 2025",
    excerpt: "Solicitamos a aprovação do calendário escolar para o ano letivo 2025 conforme documento em anexo...",
    date: "12/05, 08:15",
    hasAttachment: true,
    priority: "high",
    type: "memorando",
    status: "pending",
    requiresResponse: true,
    responseDeadline: "2025-02-10",
    approvalRequired: true,
    category: "updates"
  },
  {
    id: "4",
    read: true,
    starred: true,
    from: "João Costa",
    fromDepartment: "Gabinete Vice-Prefeito",
    subject: "COMUNICADO - Agenda de Reuniões - Próxima Semana",
    excerpt: "Segue a agenda de compromissos e reuniões para a próxima semana conforme decidido na reunião de coordenação...",
    date: "10/05, 17:20",
    hasAttachment: false,
    priority: "medium",
    type: "comunicado",
    status: "read",
    category: "primary"
  },
  {
    id: "5",
    read: true,
    starred: false,
    from: "Mariana Santos",
    fromDepartment: "Recursos Humanos",
    subject: "CIRCULAR 012/2025 - Novas Contratações - Processo Seletivo",
    excerpt: "Encaminhamos a lista de aprovados no último processo seletivo para as vagas em aberto nas secretarias...",
    date: "09/05, 11:05",
    hasAttachment: true,
    priority: "low",
    type: "circular",
    status: "read",
    digitalSignature: true,
    category: "updates"
  },
  {
    id: "6",
    read: false,
    starred: true,
    from: "Paulo Ferreira",
    fromDepartment: "Secretaria de Segurança",
    subject: "URGENTE - Relatório de Ocorrências - Centro da Cidade",
    excerpt: "Senhor Prefeito, reportamos aumento significativo de ocorrências no centro da cidade nas últimas 48h...",
    date: "Hoje, 07:30",
    hasAttachment: true,
    priority: "urgent",
    type: "relatorio",
    status: "pending",
    confidential: true,
    requiresResponse: true,
    responseDeadline: "2025-01-28",
    category: "primary"
  }
];

const CaixaEntrada: FC = () => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [emailToView, setEmailToView] = useState<EmailMessage | null>(null);

  const filteredEmails = mockEmails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || email.priority === filterPriority;
    const matchesType = filterType === "all" || email.type === filterType;
    const matchesStatus = filterStatus === "all" || email.status === filterStatus;
    
    return matchesSearch && matchesPriority && matchesType && matchesStatus;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Urgente</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">Alta</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Baixa</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      memorando: "Memorando",
      oficio: "Ofício",
      circular: "Circular",
      comunicado: "Comunicado",
      relatorio: "Relatório",
      normal: "Normal"
    };
    return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels] || type}</Badge>;
  };

  const getStatusIcon = (email: EmailMessage) => {
    if (email.requiresResponse && email.responseDeadline) {
      const deadline = new Date(email.responseDeadline);
      const today = new Date();
      const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (daysLeft < 1) {
        return <AlertTriangle className="h-4 w-4 text-red-500" title="Resposta vencida" />;
      } else if (daysLeft <= 2) {
        return <Clock className="h-4 w-4 text-orange-500" title="Resposta urgente" />;
      }
    }
    
    if (email.digitalSignature) {
      return <Shield className="h-4 w-4 text-blue-500" title="Documento assinado digitalmente" />;
    }
    
    if (email.approvalRequired) {
      return <CheckCircle className="h-4 w-4 text-purple-500" title="Aprovação necessária" />;
    }
    
    return null;
  };

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Caixa de Entrada</h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Comunicação Interna Avançado
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm py-1 px-3">
              {filteredEmails.filter(e => !e.read).length} não lidos
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3 bg-orange-50 text-orange-700">
              {filteredEmails.filter(e => e.requiresResponse && !e.read).length} aguardam resposta
            </Badge>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Mensagem
            </Button>
          </div>
        </div>

        {/* Métricas e Filtros Avançados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Inbox className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{filteredEmails.length}</div>
              <div className="text-xs text-muted-foreground">Total de Mensagens</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{filteredEmails.filter(e => e.priority === "urgent").length}</div>
              <div className="text-xs text-muted-foreground">Urgentes</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{filteredEmails.filter(e => e.digitalSignature).length}</div>
              <div className="text-xs text-muted-foreground">Assinados Digitalmente</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{filteredEmails.filter(e => e.approvalRequired).length}</div>
              <div className="text-xs text-muted-foreground">Requerem Aprovação</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Avançados */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros Avançados</CardTitle>
            <CardDescription>Filtre por prioridade, tipo de documento e status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Pesquisar mensagens..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="memorando">Memorando</SelectItem>
                  <SelectItem value="oficio">Ofício</SelectItem>
                  <SelectItem value="circular">Circular</SelectItem>
                  <SelectItem value="comunicado">Comunicado</SelectItem>
                  <SelectItem value="relatorio">Relatório</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="read">Lido</SelectItem>
                  <SelectItem value="replied">Respondido</SelectItem>
                  <SelectItem value="forwarded">Encaminhado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <div className="w-full">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Mensagens</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Pesquisar emails..." className="pl-8" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Archive className="mr-2 h-4 w-4" />
                          <span>Arquivar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Flag className="mr-2 h-4 w-4" />
                          <span>Marcar como importante</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tag className="mr-2 h-4 w-4" />
                          <span>Categorizar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Ban className="mr-2 h-4 w-4" />
                          <span>Marcar como spam</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription>Gerencie suas mensagens recebidas</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="primary" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="primary" className="relative">
                      Principal
                      <Badge className="ml-2 bg-blue-500 text-white" variant="secondary">3</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="updates">
                      Atualizações
                      <Badge className="ml-2 bg-green-500 text-white" variant="secondary">2</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="forum">
                      Fóruns
                    </TabsTrigger>
                    <TabsTrigger value="promotions">
                      Promoções
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="primary">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Remetente</TableHead>
                          <TableHead>Assunto</TableHead>
                          <TableHead className="text-right">Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockEmails
                          .filter(email => email.category === "primary")
                          .map((email) => (
                          <TableRow key={email.id} className={email.read ? "" : "font-semibold bg-gray-50"}>
                            <TableCell className="p-2">
                              <Checkbox />
                            </TableCell>
                            <TableCell className="p-2">
                              <Button variant="ghost" size="icon">
                                <Star 
                                  className={`h-4 w-4 ${email.starred ? "fill-yellow-400 text-yellow-400" : ""}`} 
                                />
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">{email.from}</TableCell>
                            <TableCell>
                              <div>
                                <span className="block">{email.subject}</span>
                                <span className="block text-sm text-gray-500 truncate max-w-md">
                                  {email.excerpt}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{email.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  <TabsContent value="updates">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Remetente</TableHead>
                          <TableHead>Assunto</TableHead>
                          <TableHead className="text-right">Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockEmails
                          .filter(email => email.category === "updates")
                          .map((email) => (
                          <TableRow key={email.id} className={email.read ? "" : "font-semibold bg-gray-50"}>
                            <TableCell className="p-2">
                              <Checkbox />
                            </TableCell>
                            <TableCell className="p-2">
                              <Button variant="ghost" size="icon">
                                <Star 
                                  className={`h-4 w-4 ${email.starred ? "fill-yellow-400 text-yellow-400" : ""}`} 
                                />
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">{email.from}</TableCell>
                            <TableCell>
                              <div>
                                <span className="block">{email.subject}</span>
                                <span className="block text-sm text-gray-500 truncate max-w-md">
                                  {email.excerpt}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{email.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  <TabsContent value="forum">
                    <div className="py-10 text-center text-gray-500">
                      <Inbox className="mx-auto h-12 w-12 opacity-30" />
                      <p className="mt-2 text-lg">Nenhuma mensagem nesta categoria</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="promotions">
                    <div className="py-10 text-center text-gray-500">
                      <Inbox className="mx-auto h-12 w-12 opacity-30" />
                      <p className="mt-2 text-lg">Nenhuma mensagem nesta categoria</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    
  );
};

export default CaixaEntrada;
