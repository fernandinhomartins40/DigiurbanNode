
import { FC, useState } from "react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Signature, Plus, Edit, Copy, Trash2, MoreVertical, Check, Download, Eye, Upload, Image } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DigitalSignature {
  id: string;
  name: string;
  type: "text" | "image" | "certificado";
  isDefault: boolean;
  lastUsed: string;
  usageCount: number;
}

const mockSignatures: DigitalSignature[] = [
  {
    id: "1",
    name: "Assinatura Padrão",
    type: "text",
    isDefault: true,
    lastUsed: "Hoje, 14:30",
    usageCount: 183
  },
  {
    id: "2",
    name: "Assinatura Formal",
    type: "text",
    isDefault: false,
    lastUsed: "Ontem",
    usageCount: 97
  },
  {
    id: "3",
    name: "Assinatura com Cargo",
    type: "text",
    isDefault: false,
    lastUsed: "12/05",
    usageCount: 64
  },
  {
    id: "4",
    name: "Assinatura com Imagem",
    type: "image",
    isDefault: false,
    lastUsed: "05/05",
    usageCount: 23
  },
  {
    id: "5",
    name: "Assinatura Digital Certificada",
    type: "certificado",
    isDefault: false,
    lastUsed: "01/05",
    usageCount: 18
  }
];

const signaturePreview = `
João da Silva
Diretor de Administração
Prefeitura Municipal de Nova Cidade

Tel: (99) 9999-9999 | Email: joao.silva@novacidade.gov.br
Av. Principal, 1000 - Centro, Nova Cidade - UF, 99999-999
`;

const AssinaturasDigitais: FC = () => {
  const [selectedTab, setSelectedTab] = useState("all");

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Assinaturas Digitais</h1>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Assinatura
            </Button>
          </div>
        </div>

        <Alert>
          <Signature className="h-4 w-4" />
          <AlertTitle>Assinaturas digitais facilitam a comunicação</AlertTitle>
          <AlertDescription>
            Crie diferentes modelos de assinaturas para usar em seus emails oficiais.
            Você pode definir uma assinatura padrão para uso automático.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-4">
          <div className="w-full">
            <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Minhas Assinaturas</CardTitle>
                      <CardDescription>Gerencie suas assinaturas digitais</CardDescription>
                    </div>
                  </div>
                  
                  <TabsList className="grid grid-cols-4 w-full mt-2">
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="text">Texto</TabsTrigger>
                    <TabsTrigger value="image">Imagem</TabsTrigger>
                    <TabsTrigger value="certificado">Certificado</TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <TabsContent value="all">
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome da Assinatura</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Padrão</TableHead>
                          <TableHead>Último Uso</TableHead>
                          <TableHead>Usos</TableHead>
                          <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockSignatures.map((signature) => (
                          <TableRow key={signature.id}>
                            <TableCell className="font-medium">{signature.name}</TableCell>
                            <TableCell>
                              {signature.type === "text" && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">Texto</Badge>
                              )}
                              {signature.type === "image" && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700">Imagem</Badge>
                              )}
                              {signature.type === "certificado" && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">Certificado</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {signature.isDefault ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>{signature.lastUsed}</TableCell>
                            <TableCell>{signature.usageCount}</TableCell>
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
                                      <Check className="mr-2 h-4 w-4" />
                                      <span>Definir como padrão</span>
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
                
                {/* Conteúdos similares para as outras abas, filtrando pelo tipo de assinatura correspondente */}
                <TabsContent value="text">
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome da Assinatura</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Padrão</TableHead>
                          <TableHead>Último Uso</TableHead>
                          <TableHead>Usos</TableHead>
                          <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockSignatures
                          .filter(signature => signature.type === "text")
                          .map((signature) => (
                          <TableRow key={signature.id}>
                            <TableCell className="font-medium">{signature.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">Texto</Badge>
                            </TableCell>
                            <TableCell>
                              {signature.isDefault ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>{signature.lastUsed}</TableCell>
                            <TableCell>{signature.usageCount}</TableCell>
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
                                      <Check className="mr-2 h-4 w-4" />
                                      <span>Definir como padrão</span>
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
                
                {/* Tabs similares para image e certificado */}
              </Card>
            </Tabs>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>Opções de assinatura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-signature">Assinatura automática</Label>
                    <p className="text-sm text-muted-foreground">Incluir assinatura padrão nos novos emails</p>
                  </div>
                  <Switch id="auto-signature" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reply-signature">Incluir em respostas</Label>
                    <p className="text-sm text-muted-foreground">Adicionar assinatura em emails de resposta</p>
                  </div>
                  <Switch id="reply-signature" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="forward-signature">Incluir em encaminhamentos</Label>
                    <p className="text-sm text-muted-foreground">Adicionar assinatura em emails encaminhados</p>
                  </div>
                  <Switch id="forward-signature" defaultChecked />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox id="separate-signature" />
                  <Label htmlFor="separate-signature">Separar assinatura do texto com uma linha</Label>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Visualização da Assinatura</CardTitle>
                <CardDescription>Assinatura Padrão</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTab === "image" ? (
                  <div className="flex flex-col items-center justify-center border rounded-md p-4">
                    <Image className="h-16 w-16 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Imagem da assinatura</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Upload className="mr-2 h-4 w-4" /> Carregar Imagem
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px] w-full rounded border p-4">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {signaturePreview}
                    </pre>
                  </ScrollArea>
                )}
              </CardContent>
              {selectedTab !== "image" && (
                <CardFooter className="flex justify-between">
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button>
                    <Check className="mr-2 h-4 w-4" />
                    Definir como Padrão
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    
  );
};

export default AssinaturasDigitais;
