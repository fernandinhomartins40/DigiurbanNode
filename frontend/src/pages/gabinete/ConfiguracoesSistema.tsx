import React from 'react';


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FC } from "react";
import { Save, RefreshCw, Database, Mail, Shield, Bell, Monitor } from "lucide-react";

const ConfiguracoesSistema: FC = () => {
  return (
    
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Restaurar Padrões
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList>
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            <TabsTrigger value="integracao">Integração</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais do Sistema</CardTitle>
                <CardDescription>Defina as configurações básicas do sistema de gestão municipal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nomeMunicipio">Nome do Município</Label>
                      <Input id="nomeMunicipio" defaultValue="Cidade Exemplo" />
                    </div>
                    <div>
                      <Label htmlFor="prefeito">Nome do Prefeito</Label>
                      <Input id="prefeito" defaultValue="João da Silva" />
                    </div>
                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input id="cnpj" defaultValue="12.345.678/0001-90" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="endereco">Endereço da Prefeitura</Label>
                      <Textarea id="endereco" defaultValue="Rua Principal, 123 - Centro" />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" defaultValue="(11) 1234-5678" />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail Oficial</Label>
                      <Input id="email" type="email" defaultValue="contato@prefeitura.gov.br" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configurações de Interface</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tema">Tema Padrão</Label>
                      <Select defaultValue="sistema">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sistema">Seguir Sistema</SelectItem>
                          <SelectItem value="claro">Claro</SelectItem>
                          <SelectItem value="escuro">Escuro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="idioma">Idioma</Label>
                      <Select defaultValue="pt-br">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configurações Funcionais</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Permitir Auto-cadastro de Usuários</Label>
                        <p className="text-sm text-muted-foreground">Permite que cidadãos se cadastrem automaticamente</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Aprovar Protocolos Automaticamente</Label>
                        <p className="text-sm text-muted-foreground">Protocolos simples são aprovados automaticamente</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enviar E-mails de Confirmação</Label>
                        <p className="text-sm text-muted-foreground">Envia confirmações por e-mail para ações importantes</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Configurações de Notificações</CardTitle>
                </div>
                <CardDescription>Configure quando e como as notificações são enviadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notificações por E-mail</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Novos Protocolos</Label>
                        <p className="text-sm text-muted-foreground">Notificar sobre novos protocolos recebidos</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Prazos Vencendo</Label>
                        <p className="text-sm text-muted-foreground">Alertar sobre prazos próximos do vencimento</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Relatórios Semanais</Label>
                        <p className="text-sm text-muted-foreground">Enviar resumo semanal de atividades</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notificações no Sistema</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Alertas em Tempo Real</Label>
                        <p className="text-sm text-muted-foreground">Exibir alertas imediatamente na interface</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sons de Notificação</Label>
                        <p className="text-sm text-muted-foreground">Tocar sons ao receber notificações importantes</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificações Desktop</Label>
                        <p className="text-sm text-muted-foreground">Exibir notificações no desktop do usuário</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Configuração de E-mail SMTP</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpServidor">Servidor SMTP</Label>
                      <Input id="smtpServidor" defaultValue="smtp.prefeitura.gov.br" />
                    </div>
                    <div>
                      <Label htmlFor="smtpPorta">Porta</Label>
                      <Input id="smtpPorta" defaultValue="587" />
                    </div>
                    <div>
                      <Label htmlFor="smtpUsuario">Usuário</Label>
                      <Input id="smtpUsuario" defaultValue="notificacoes@prefeitura.gov.br" />
                    </div>
                    <div>
                      <Label htmlFor="smtpSenha">Senha</Label>
                      <Input id="smtpSenha" type="password" defaultValue="********" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline">Testar Conexão</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>Configurações de Segurança</CardTitle>
                </div>
                <CardDescription>Configure os parâmetros de segurança e proteção do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Políticas de Senha</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="senhaMinimo">Tamanho Mínimo da Senha</Label>
                      <Select defaultValue="8">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 caracteres</SelectItem>
                          <SelectItem value="8">8 caracteres</SelectItem>
                          <SelectItem value="10">10 caracteres</SelectItem>
                          <SelectItem value="12">12 caracteres</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Exigir Letras Maiúsculas</Label>
                        <p className="text-sm text-muted-foreground">Exige pelo menos uma letra maiúscula na senha</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Exigir Caracteres Especiais</Label>
                        <p className="text-sm text-muted-foreground">Exige pelo menos um símbolo na senha</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Acesso ao Sistema</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="expiracaoSessao">Tempo de Expiração da Sessão</Label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">60 minutos</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Autenticação de Dois Fatores</Label>
                        <p className="text-sm text-muted-foreground">Exigir 2FA para usuários administrativos</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Bloquear Múltiplas Tentativas</Label>
                        <p className="text-sm text-muted-foreground">Bloquear conta após 5 tentativas erradas</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configurações Avançadas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Registro de Logs Detalhados</Label>
                        <p className="text-sm text-muted-foreground">Registrar logs detalhados de todas as ações</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Criptografar Dados Sensíveis</Label>
                        <p className="text-sm text-muted-foreground">Criptografar dados pessoais e sensíveis</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Permitir Acesso Remoto</Label>
                        <p className="text-sm text-muted-foreground">Permitir acesso fora da rede interna</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integracao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integração com Outros Sistemas</CardTitle>
                <CardDescription>Configure a integração com sistemas internos e externos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">APIs e Serviços</h3>
                  <div className="border rounded-lg divide-y">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Sistema de Tributação</h4>
                          <p className="text-sm text-muted-foreground">Integração com o sistema de tributos municipais</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      <div className="mt-2">
                        <Label htmlFor="urlTributos">URL da API</Label>
                        <Input id="urlTributos" defaultValue="https://api.tributacao.prefeitura.gov.br" />
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Portal da Transparência</h4>
                          <p className="text-sm text-muted-foreground">Envio automático de dados para o portal</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      <div className="mt-2">
                        <Label htmlFor="urlTransparencia">URL da API</Label>
                        <Input id="urlTransparencia" defaultValue="https://api.transparencia.gov.br" />
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Diário Oficial Eletrônico</h4>
                          <p className="text-sm text-muted-foreground">Publicação automática de atos oficiais</p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                      <div className="mt-2">
                        <Label htmlFor="urlDiario">URL da API</Label>
                        <Input id="urlDiario" defaultValue="https://api.diario.prefeitura.gov.br" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Chaves de API</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="apiKeyTransparencia">API Key - Portal da Transparência</Label>
                      <div className="flex gap-2">
                        <Input id="apiKeyTransparencia" type="password" defaultValue="sk_live_51ABCDEFGHIJKLMN" />
                        <Button variant="outline">Mostrar</Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="apiKeyDiario">API Key - Diário Oficial</Label>
                      <div className="flex gap-2">
                        <Input id="apiKeyDiario" type="password" defaultValue="1a2b3c4d5e6f7g8h9i0j" />
                        <Button variant="outline">Mostrar</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <Button variant="outline">Testar Integrações</Button>
                  <Button variant="default">Gerar Nova Chave</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  <CardTitle>Backup e Recuperação</CardTitle>
                </div>
                <CardDescription>Configure opções de backup, automação e recuperação de dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Backup Automático</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Habilitar Backup Automático</Label>
                        <p className="text-sm text-muted-foreground">Realizar backup automaticamente nos intervalos definidos</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div>
                      <Label htmlFor="frequenciaBackup">Frequência de Backup</Label>
                      <Select defaultValue="diario">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6h">A cada 6 horas</SelectItem>
                          <SelectItem value="12h">A cada 12 horas</SelectItem>
                          <SelectItem value="diario">Diário</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="horarioBackup">Horário de Execução</Label>
                      <Input id="horarioBackup" type="time" defaultValue="02:00" />
                    </div>
                    
                    <div>
                      <Label htmlFor="copias">Número de Cópias Mantidas</Label>
                      <Select defaultValue="10">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 cópias</SelectItem>
                          <SelectItem value="10">10 cópias</SelectItem>
                          <SelectItem value="15">15 cópias</SelectItem>
                          <SelectItem value="30">30 cópias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Local de Armazenamento</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="localArmazenamento">Local Principal</Label>
                      <Select defaultValue="nuvem">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Servidor Local</SelectItem>
                          <SelectItem value="nuvem">Nuvem</SelectItem>
                          <SelectItem value="hibrido">Híbrido (Local + Nuvem)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="nuvemConfig">Configuração da Nuvem</Label>
                      <Select defaultValue="aws">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aws">Amazon AWS</SelectItem>
                          <SelectItem value="azure">Microsoft Azure</SelectItem>
                          <SelectItem value="google">Google Cloud</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="bucketNome">Nome do Bucket/Container</Label>
                      <Input id="bucketNome" defaultValue="prefeitura-backups" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Opções Avançadas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Backup Incremental</Label>
                        <p className="text-sm text-muted-foreground">Armazenar apenas diferenças entre backups</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Criptografar Backup</Label>
                        <p className="text-sm text-muted-foreground">Usar criptografia AES-256 nos arquivos de backup</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compactação</Label>
                        <p className="text-sm text-muted-foreground">Compactar arquivos para economizar espaço</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm">Último backup: <span className="font-medium">18/05/2025 02:15</span></p>
                    <p className="text-sm text-muted-foreground">Tamanho: 2.3 GB</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Restaurar Backup</Button>
                    <Button variant="default">Backup Manual</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs e Auditoria</CardTitle>
                <CardDescription>Configure os registros de log e auditoria do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configurações de Log</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Logs Detalhados</Label>
                        <p className="text-sm text-muted-foreground">Registrar informações detalhadas de operações</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div>
                      <Label htmlFor="nivelLog">Nível de Log</Label>
                      <Select defaultValue="info">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debug">Debug (Todos os detalhes)</SelectItem>
                          <SelectItem value="info">Info (Informativo)</SelectItem>
                          <SelectItem value="warn">Warning (Avisos)</SelectItem>
                          <SelectItem value="error">Error (Apenas erros)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="retencaoLogs">Retenção de Logs</Label>
                      <Select defaultValue="180">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 dias</SelectItem>
                          <SelectItem value="90">90 dias</SelectItem>
                          <SelectItem value="180">180 dias</SelectItem>
                          <SelectItem value="365">1 ano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Auditoria</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auditoria de Acessos</Label>
                        <p className="text-sm text-muted-foreground">Registrar todos os logins e tentativas</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auditoria de Modificações</Label>
                        <p className="text-sm text-muted-foreground">Registrar todas as alterações em registros</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auditoria de Visualização</Label>
                        <p className="text-sm text-muted-foreground">Registrar acessos de visualização a dados sensíveis</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Exportação de Logs</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Exportação Automática</Label>
                        <p className="text-sm text-muted-foreground">Exportar logs automaticamente</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    
                    <div>
                      <Label htmlFor="formatoExportacao">Formato de Exportação</Label>
                      <Select defaultValue="csv">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="destinoExportacao">Destino de Exportação</Label>
                      <Input id="destinoExportacao" defaultValue="/backups/logs/" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default ConfiguracoesSistema;
