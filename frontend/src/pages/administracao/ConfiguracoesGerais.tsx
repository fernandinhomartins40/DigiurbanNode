

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, RefreshCw, Mail, Bell, Lock, Clock, Palette, Globe, Database, Server, Shield, AlertTriangle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ConfiguracoesGerais = () => {
  return (
    
      <div className="px-6 py-4">
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Configurações Gerais</h1>
              <p className="text-gray-600 dark:text-gray-400">Configure os parâmetros gerais do sistema</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
              <Button className="gap-1" variant="outline">
                <RefreshCw size={16} />
                Restaurar Padrões
              </Button>
              <Button className="gap-1">
                <Save size={16} />
                Salvar Configurações
              </Button>
            </div>
          </div>

          <Tabs defaultValue="sistema" className="w-full">
            <TabsList className="mb-4 grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-1">
              <TabsTrigger value="sistema">Sistema</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
              <TabsTrigger value="seguranca">Segurança</TabsTrigger>
              <TabsTrigger value="aparencia">Aparência</TabsTrigger>
              <TabsTrigger value="integracao">Integrações</TabsTrigger>
            </TabsList>

            <TabsContent value="sistema" className="mt-0 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>
                    Configure os parâmetros básicos de funcionamento do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="system-name">Nome do Sistema</Label>
                      <Input id="system-name" placeholder="Portal do Cidadão" defaultValue="Portal do Cidadão" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Fuso Horário</Label>
                        <Select defaultValue="America/Sao_Paulo">
                          <SelectTrigger id="timezone">
                            <SelectValue placeholder="Selecione o fuso horário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                            <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                            <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                            <SelectItem value="America/Noronha">Fernando de Noronha (GMT-2)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="date-format">Formato de Data</Label>
                        <Select defaultValue="DD/MM/YYYY">
                          <SelectTrigger id="date-format">
                            <SelectValue placeholder="Selecione o formato" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Opções de Sistema</Label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Ativa o modo de manutenção do sistema
                            </p>
                          </div>
                          <Switch id="maintenance-mode" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="enable-debug">Logs de Debug</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Habilita logs detalhados para depuração
                            </p>
                          </div>
                          <Switch id="enable-debug" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="cache">Cache do Sistema</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Ativa o cache para melhor desempenho
                            </p>
                          </div>
                          <Switch id="cache" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Timeout de Sessão</Label>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Tempo em minutos: 30</span>
                          <span className="text-sm text-gray-500">5min - 120min</span>
                        </div>
                        <Slider defaultValue={[30]} max={120} min={5} step={5} />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Salvar Alterações</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold">Versão do Sistema</h4>
                      <p className="text-sm">v2.5.3 <Badge variant="outline" className="ml-2">Estável</Badge></p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold">Último Backup</h4>
                      <p className="text-sm">20/05/2023 03:00:00</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold">Espaço em Disco</h4>
                      <p className="text-sm">45.3 GB / 100 GB (45.3%)</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold">Banco de Dados</h4>
                      <p className="text-sm">PostgreSQL 14.3</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold">Sistema Operacional</h4>
                      <p className="text-sm">Linux Ubuntu 22.04 LTS</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold">Ambiente</h4>
                      <p className="text-sm">Produção</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    <CardTitle>Configurações de Email</CardTitle>
                  </div>
                  <CardDescription>
                    Configure o servidor de email para envio de notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-server">Servidor SMTP</Label>
                      <Input id="smtp-server" placeholder="smtp.servidor.com.br" defaultValue="smtp.prefeitura.gov.br" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtp-port">Porta</Label>
                        <Input id="smtp-port" type="number" placeholder="587" defaultValue="587" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="encryption">Criptografia</Label>
                        <Select defaultValue="tls">
                          <SelectTrigger id="encryption">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tls">TLS</SelectItem>
                            <SelectItem value="ssl">SSL</SelectItem>
                            <SelectItem value="none">Nenhuma</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email-from">Email de Origem</Label>
                      <Input id="email-from" placeholder="naoresponda@prefeitura.gov.br" defaultValue="naoresponda@prefeitura.gov.br" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtp-user">Usuário SMTP</Label>
                        <Input id="smtp-user" placeholder="usuario" defaultValue="sistema" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="smtp-password">Senha</Label>
                        <Input id="smtp-password" type="password" value="********" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-queue">Fila de Emails</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Use o sistema de filas para envio de emails em lote
                        </p>
                      </div>
                      <Switch id="email-queue" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Testar Configurações</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notificacoes" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <CardTitle>Configurações de Notificações</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Canais de Notificação</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Email</Label>
                            <p className="text-xs text-gray-500">Envio de notificações por email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>SMS</Label>
                            <p className="text-xs text-gray-500">Envio de notificações por SMS</p>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Aplicativo</Label>
                            <p className="text-xs text-gray-500">Notificações no app móvel</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>WhatsApp</Label>
                            <p className="text-xs text-gray-500">Notificações por WhatsApp (requer integração)</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Frequência de Resumos</h3>
                      <RadioGroup defaultValue="diario">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="diario" id="diario" />
                          <Label htmlFor="diario">Diário</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="semanal" id="semanal" />
                          <Label htmlFor="semanal">Semanal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mensal" id="mensal" />
                          <Label htmlFor="mensal">Mensal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="desativado" id="desativado" />
                          <Label htmlFor="desativado">Desativado</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Tipos de Eventos</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Novos Processos</Label>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Alterações em Processos</Label>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Documentos Pendentes</Label>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Mensagens do Sistema</Label>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Eventos de Segurança</Label>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="seguranca" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    <CardTitle>Configurações de Segurança</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Política de Senhas</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min-length">Tamanho Mínimo</Label>
                          <Input id="min-length" type="number" defaultValue="8" min="6" max="20" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="password-expiration">Expiração (dias)</Label>
                          <Input id="password-expiration" type="number" defaultValue="90" min="30" max="180" />
                        </div>
                      </div>
                      
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center justify-between">
                          <Label>Exigir Letras Maiúsculas</Label>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Exigir Números</Label>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Exigir Caracteres Especiais</Label>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Bloquear Senhas Anteriores</Label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Autenticação</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Autenticação de Dois Fatores</Label>
                          <p className="text-xs text-gray-500">Requer verificação adicional no login</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Bloqueio por Tentativas</Label>
                          <p className="text-xs text-gray-500">Bloqueia após várias tentativas falhas</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Single Sign-On</Label>
                          <p className="text-xs text-gray-500">Integração com autenticação unificada</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Segurança Geral</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Registro de Atividades</Label>
                          <p className="text-xs text-gray-500">Registra todas as ações dos usuários</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Criptografia de Dados</Label>
                          <p className="text-xs text-gray-500">Criptografa dados sensíveis no banco</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Verificação de IP</Label>
                          <p className="text-xs text-gray-500">Alerta sobre acessos de locais incomuns</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Salvar Alterações</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="aparencia" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    <CardTitle>Configurações de Aparência</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tema do Sistema</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="border-2 border-primary rounded-md p-2 flex flex-col items-center">
                          <div className="h-8 w-full bg-white mb-1 rounded"></div>
                          <span className="text-xs">Claro</span>
                        </div>
                        <div className="border-2 border-gray-200 rounded-md p-2 flex flex-col items-center">
                          <div className="h-8 w-full bg-gray-800 mb-1 rounded"></div>
                          <span className="text-xs">Escuro</span>
                        </div>
                        <div className="border-2 border-gray-200 rounded-md p-2 flex flex-col items-center">
                          <div className="h-8 w-full bg-gradient-to-r from-white to-gray-800 mb-1 rounded"></div>
                          <span className="text-xs">Automático</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Cor Primária</Label>
                      <div className="flex items-center gap-2">
                        <Input id="primary-color" type="color" defaultValue="#0284c7" className="w-16 h-8 p-1" />
                        <Input defaultValue="#0284c7" className="flex-1" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Cor Secundária</Label>
                      <div className="flex items-center gap-2">
                        <Input id="secondary-color" type="color" defaultValue="#7c3aed" className="w-16 h-8 p-1" />
                        <Input defaultValue="#7c3aed" className="flex-1" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Logo do Sistema</Label>
                      <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 h-32">
                        <p className="text-center text-gray-500">
                          Arraste e solte a imagem ou clique para selecionar
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mostrar Nome do Sistema</Label>
                        <p className="text-xs text-gray-500">Exibe o nome ao lado da logo</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="layout">Layout do Sistema</Label>
                      <Select defaultValue="sidebar">
                        <SelectTrigger id="layout">
                          <SelectValue placeholder="Selecione o layout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sidebar">Menu Lateral</SelectItem>
                          <SelectItem value="topbar">Menu Superior</SelectItem>
                          <SelectItem value="combined">Combinado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="density">Densidade de Interface</Label>
                      <Select defaultValue="compact">
                        <SelectTrigger id="density">
                          <SelectValue placeholder="Selecione a densidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compacta</SelectItem>
                          <SelectItem value="comfortable">Confortável</SelectItem>
                          <SelectItem value="spacious">Espaçosa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="font-size">Tamanho da Fonte</Label>
                      <Select defaultValue="normal">
                        <SelectTrigger id="font-size">
                          <SelectValue placeholder="Selecione o tamanho" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Pequeno</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="large">Grande</SelectItem>
                          <SelectItem value="extra-large">Extra Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Visualizar</Button>
                  <Button>Aplicar Tema</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="integracao" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <CardTitle>Integrações</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="h-6 w-6 text-blue-500" />
                        <div>
                          <h3 className="text-sm font-medium">Banco de Dados Externo</h3>
                          <p className="text-xs text-gray-500">Integração com bancos externos</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Conectado</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Server className="h-6 w-6 text-gray-500" />
                        <div>
                          <h3 className="text-sm font-medium">API de Serviços</h3>
                          <p className="text-xs text-gray-500">Conexão com APIs de serviços do governo</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-purple-500" />
                        <div>
                          <h3 className="text-sm font-medium">Autenticação Gov.br</h3>
                          <p className="text-xs text-gray-500">Integração com o sistema Gov.br</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Desativado</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-orange-500" />
                        <div>
                          <h3 className="text-sm font-medium">Sistema de Alertas</h3>
                          <p className="text-xs text-gray-500">Integração com sistema de alertas da defesa civil</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Erro</Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Adicionar Nova Integração</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api">API REST</SelectItem>
                          <SelectItem value="database">Banco de Dados</SelectItem>
                          <SelectItem value="file">Troca de Arquivos</SelectItem>
                          <SelectItem value="soap">Serviço SOAP</SelectItem>
                          <SelectItem value="ldap">LDAP / Active Directory</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input placeholder="Nome da integração" />
                      <Button>Configurar</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>WebHooks</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notificações de Webhook</Label>
                          <p className="text-xs text-gray-500">Envio de eventos para sistemas externos</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <Input placeholder="URL do Webhook" disabled />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Verificar Conectividade</Button>
                  <Button>Salvar Configurações</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    
  );
};

export default ConfiguracoesGerais;
