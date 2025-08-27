
import { FC } from "react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { FileText, Search, Edit, Plus, Copy, Trash2, MoreVertical, Download, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmailTemplate {
  id: string;
  name: string;
  category: "official" | "notification" | "meeting" | "standard" | "procedures";
  usageCount: number;
  lastUsed: string;
  createdBy: string;
  isShared: boolean;
}

const mockTemplates: EmailTemplate[] = [
  {
    id: "1",
    name: "Ofício Padrão",
    category: "official",
    usageCount: 253,
    lastUsed: "Hoje",
    createdBy: "Gabinete do Prefeito",
    isShared: true
  },
  {
    id: "2",
    name: "Memorando Interno",
    category: "official",
    usageCount: 187,
    lastUsed: "Ontem",
    createdBy: "Secretaria de Administração",
    isShared: true
  },
  {
    id: "3",
    name: "Convite para Reunião",
    category: "meeting",
    usageCount: 124,
    lastUsed: "12/05",
    createdBy: "Gabinete do Prefeito",
    isShared: true
  },
  {
    id: "4",
    name: "Notificação de Prazo",
    category: "notification",
    usageCount: 98,
    lastUsed: "10/05",
    createdBy: "Departamento Jurídico",
    isShared: true
  },
  {
    id: "5",
    name: "Resposta a Solicitação",
    category: "standard",
    usageCount: 76,
    lastUsed: "05/05",
    createdBy: "Você",
    isShared: false
  },
  {
    id: "6",
    name: "Procedimento Administrativo",
    category: "procedures",
    usageCount: 52,
    lastUsed: "01/05",
    createdBy: "Secretaria de Administração",
    isShared: true
  },
  {
    id: "7",
    name: "Circular Informativa",
    category: "notification",
    usageCount: 47,
    lastUsed: "27/04",
    createdBy: "Você",
    isShared: true
  },
  {
    id: "8",
    name: "Pauta de Reunião",
    category: "meeting",
    usageCount: 35,
    lastUsed: "22/04",
    createdBy: "Secretaria de Planejamento",
    isShared: true
  }
];

const templatePreviewContent = `
PREFEITURA MUNICIPAL DE [CIDADE]
GABINETE DO PREFEITO

OFÍCIO Nº [NÚMERO]/[ANO]

[Cidade], [data por extenso]

A Sua Excelência o(a) Senhor(a)
[Nome do destinatário]
[Cargo do destinatário]
[Órgão ou entidade]
[Endereço]
[CEP] – [Cidade]/[UF]

Assunto: [Descrição sucinta do assunto]

Excelentíssimo(a) Senhor(a) [Cargo],

1. Dirijo-me a Vossa Excelência para informar/solicitar/encaminhar [descrever o objetivo do ofício de maneira clara e concisa].

2. [Desenvolvimento do assunto em parágrafos numerados, apresentando as informações, argumentos, solicitações ou considerações pertinentes ao tema].

3. [Conclusão, enfatizando o objetivo principal da comunicação e eventuais expectativas quanto à resposta ou providências].

Respeitosamente,

[Nome do Prefeito]
Prefeito Municipal
`;

const BibliotecaModelos: FC = () => {
  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Biblioteca de Modelos</h1>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Modelo
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="w-full">
            <Tabs defaultValue="all" className="w-full">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Modelos de Email</CardTitle>
                      <CardDescription>Gerencie e use modelos padrão para sua correspondência</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar modelos..." className="pl-8" />
                      </div>
                    </div>
                  </div>
                  
                  <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full mt-2">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="official">Oficiais</TabsTrigger>
                    <TabsTrigger value="meeting">Reuniões</TabsTrigger>
                    <TabsTrigger value="notification">Notificações</TabsTrigger>
                    <TabsTrigger value="standard">Padrões</TabsTrigger>
                    <TabsTrigger value="personal">Meus Modelos</TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <TabsContent value="all">
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome do Modelo</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Usos</TableHead>
                          <TableHead>Último Uso</TableHead>
                          <TableHead>Criado por</TableHead>
                          <TableHead className="text-center">Compartilhado</TableHead>
                          <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockTemplates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>
                              {template.category === "official" && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">Oficial</Badge>
                              )}
                              {template.category === "notification" && (
                                <Badge variant="outline" className="bg-red-50 text-red-700">Notificação</Badge>
                              )}
                              {template.category === "meeting" && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">Reunião</Badge>
                              )}
                              {template.category === "standard" && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700">Padrão</Badge>
                              )}
                              {template.category === "procedures" && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Procedimento</Badge>
                              )}
                            </TableCell>
                            <TableCell>{template.usageCount}</TableCell>
                            <TableCell>{template.lastUsed}</TableCell>
                            <TableCell>{template.createdBy}</TableCell>
                            <TableCell className="text-center">
                              {template.isShared ? "Sim" : "Não"}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" title="Visualizar">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Editar">
                                  <Edit className="h-4 w-4" />
                                </Button>
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
                                      <FileText className="mr-2 h-4 w-4" />
                                      <span>Usar Modelo</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="mr-2 h-4 w-4" />
                                      <span>Duplicar</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="mr-2 h-4 w-4" />
                                      <span>Exportar</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Excluir</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </TabsContent>
                
                {/* Conteúdo similar para as outras abas, filtrando pelos tipos correspondentes */}
                <TabsContent value="official">
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome do Modelo</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Usos</TableHead>
                          <TableHead>Último Uso</TableHead>
                          <TableHead>Criado por</TableHead>
                          <TableHead className="text-center">Compartilhado</TableHead>
                          <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockTemplates
                          .filter(template => template.category === "official")
                          .map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">Oficial</Badge>
                            </TableCell>
                            <TableCell>{template.usageCount}</TableCell>
                            <TableCell>{template.lastUsed}</TableCell>
                            <TableCell>{template.createdBy}</TableCell>
                            <TableCell className="text-center">
                              {template.isShared ? "Sim" : "Não"}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" title="Visualizar">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Editar">
                                  <Edit className="h-4 w-4" />
                                </Button>
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
                                      <FileText className="mr-2 h-4 w-4" />
                                      <span>Usar Modelo</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="mr-2 h-4 w-4" />
                                      <span>Duplicar</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="mr-2 h-4 w-4" />
                                      <span>Exportar</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </TabsContent>
                
                {/* Tabs para meeting, notification, standard, e personal seguiriam a mesma estrutura */}
              </Card>
            </Tabs>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Organização dos modelos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 mr-2">2</Badge>
                      Oficiais
                    </span>
                    <span className="text-sm text-muted-foreground">440 usos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 mr-2">2</Badge>
                      Reuniões
                    </span>
                    <span className="text-sm text-muted-foreground">159 usos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Badge variant="outline" className="bg-red-50 text-red-700 mr-2">2</Badge>
                      Notificações
                    </span>
                    <span className="text-sm text-muted-foreground">145 usos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 mr-2">1</Badge>
                      Padrões
                    </span>
                    <span className="text-sm text-muted-foreground">76 usos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 mr-2">1</Badge>
                      Procedimentos
                    </span>
                    <span className="text-sm text-muted-foreground">52 usos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Badge variant="outline" className="mr-2">2</Badge>
                      Meus Modelos
                    </span>
                    <span className="text-sm text-muted-foreground">123 usos</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Gerenciar Categorias
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Visualização do Modelo</CardTitle>
                <CardDescription>Ofício Padrão</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full rounded border p-4">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {templatePreviewContent}
                  </pre>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Usar Modelo
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    
  );
};

export default BibliotecaModelos;
