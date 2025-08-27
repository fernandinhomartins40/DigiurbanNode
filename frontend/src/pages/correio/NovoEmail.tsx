
import { FC } from "react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Paperclip, Clock, TextQuote, Image, FileText, MoreVertical, Save, PanelLeftClose } from "lucide-react";

const NovoEmail: FC = () => {
  return (
    
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Novo Email</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Salvar Rascunho
            </Button>
            <Button size="sm">
              <Send className="mr-2 h-4 w-4" />
              Enviar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Composição da Mensagem</CardTitle>
                <CardDescription>Preencha os dados para enviar sua mensagem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="to">Para</Label>
                  <Input 
                    id="to" 
                    placeholder="Destinatário" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cc">Cc</Label>
                  <Input 
                    id="cc" 
                    placeholder="Cópia" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bcc">Cco</Label>
                  <Input 
                    id="bcc" 
                    placeholder="Cópia oculta" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input 
                    id="subject" 
                    placeholder="Assunto do email" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="content">Conteúdo</Label>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" title="Inserir imagem">
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Inserir documento">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Inserir citação">
                        <TextQuote className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Formatação</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Formato Padrão</DropdownMenuItem>
                          <DropdownMenuItem>Formato Oficial</DropdownMenuItem>
                          <DropdownMenuItem>Memorando</DropdownMenuItem>
                          <DropdownMenuItem>Ofício</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <Textarea 
                    id="content" 
                    placeholder="Escreva sua mensagem aqui..." 
                    className="min-h-[200px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Anexos</Label>
                  <div className="border border-dashed rounded-lg p-6 text-center">
                    <Paperclip className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Arraste arquivos aqui ou clique para anexar
                    </p>
                    <input 
                      type="file" 
                      className="hidden" 
                      id="file-upload" 
                      multiple 
                    />
                    <Button variant="outline" size="sm" className="mt-2">
                      Selecionar Arquivos
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Agendar Envio
                </Button>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Email
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Modelos e Assinaturas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="templates">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="templates">Modelos</TabsTrigger>
                    <TabsTrigger value="signatures">Assinaturas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="templates" className="space-y-4 pt-4">
                    <div>
                      <Label>Modelos Disponíveis</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecionar modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Básicos</SelectLabel>
                            <SelectItem value="oficio">Ofício</SelectItem>
                            <SelectItem value="memorando">Memorando</SelectItem>
                            <SelectItem value="circular">Circular</SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Específicos</SelectLabel>
                            <SelectItem value="resposta-padrao">Resposta Padrão</SelectItem>
                            <SelectItem value="convite-reuniao">Convite para Reunião</SelectItem>
                            <SelectItem value="notificacao">Notificação</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Ofício</h4>
                        <Button variant="ghost" size="sm">Usar</Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Modelo formal para comunicação oficial entre órgãos públicos.
                      </p>
                    </div>

                    <div className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Memorando</h4>
                        <Button variant="ghost" size="sm">Usar</Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Comunicação interna entre departamentos.
                      </p>
                    </div>

                    <div className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Convite para Reunião</h4>
                        <Button variant="ghost" size="sm">Usar</Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Template para convidar participantes para reuniões.
                      </p>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Ver Biblioteca Completa
                    </Button>
                  </TabsContent>
                  <TabsContent value="signatures" className="space-y-4 pt-4">
                    <div>
                      <Label>Assinaturas Disponíveis</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecionar assinatura" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="padrao">Padrão</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="completa">Completa</SelectItem>
                          <SelectItem value="simples">Simples</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium">Assinatura Padrão</h4>
                      <div className="mt-2 pt-2 border-t text-sm">
                        <p>João da Silva</p>
                        <p>Diretor de Administração</p>
                        <p>Prefeitura Municipal</p>
                        <p>Tel: (99) 9999-9999</p>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Gerenciar Assinaturas
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    
  );
};

export default NovoEmail;
