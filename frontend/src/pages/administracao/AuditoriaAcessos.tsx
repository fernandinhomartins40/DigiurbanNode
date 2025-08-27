

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, Search, RefreshCw, Eye, AlertCircle, CheckCircle, Clock, XCircle, UserX } from "lucide-react";
import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";

// Mock data para logs de auditoria
const mockAuditLogs = [
  { id: 1, user: "Ana Silva", action: "LOGIN", resource: "Sistema", details: "Login bem-sucedido", status: "Sucesso", ipAddress: "192.168.1.10", timestamp: "20/05/2023 10:15:23" },
  { id: 2, user: "Carlos Santos", action: "UPDATE", resource: "Usuários", details: "Alteração de perfil de usuário", status: "Sucesso", ipAddress: "192.168.1.45", timestamp: "20/05/2023 09:42:18" },
  { id: 3, user: "Sistema", action: "BACKUP", resource: "Banco de Dados", details: "Backup automático diário", status: "Sucesso", ipAddress: "127.0.0.1", timestamp: "20/05/2023 03:00:01" },
  { id: 4, user: "Maria Oliveira", action: "DELETE", resource: "Documentos", details: "Exclusão de documento #12456", status: "Sucesso", ipAddress: "192.168.2.56", timestamp: "19/05/2023 16:23:45" },
  { id: 5, user: "Ricardo Sousa", action: "ACCESS_DENIED", resource: "Relatórios Financeiros", details: "Tentativa de acesso sem permissão", status: "Alerta", ipAddress: "192.168.1.112", timestamp: "19/05/2023 14:05:32" },
  { id: 6, user: "Juliana Costa", action: "EXPORT", resource: "Relatórios", details: "Exportação de relatório completo", status: "Sucesso", ipAddress: "192.168.3.45", timestamp: "19/05/2023 11:34:12" },
  { id: 7, user: "Paulo Mendes", action: "LOGIN_FAILED", resource: "Sistema", details: "Falha na autenticação - senha incorreta", status: "Erro", ipAddress: "200.158.12.45", timestamp: "19/05/2023 08:12:59" },
  { id: 8, user: "Fernando Lima", action: "PERMISSION_CHANGE", resource: "Usuários", details: "Alteração de permissões para grupo Administradores", status: "Sucesso", ipAddress: "192.168.1.10", timestamp: "18/05/2023 17:22:43" },
  { id: 9, user: "Sistema", action: "MAINTENANCE", resource: "Sistema", details: "Início de manutenção programada", status: "Info", ipAddress: "127.0.0.1", timestamp: "18/05/2023 22:00:00" },
  { id: 10, user: "Eduardo Martins", action: "FORCE_LOGOUT", resource: "Sessão", details: "Encerramento forçado de sessão por inatividade", status: "Info", ipAddress: "192.168.4.22", timestamp: "18/05/2023 16:45:10" },
  { id: 11, user: "Desconhecido", action: "BRUTE_FORCE", resource: "Login", details: "Possível ataque de força bruta detectado", status: "Crítico", ipAddress: "45.132.45.78", timestamp: "18/05/2023 03:24:18" },
  { id: 12, user: "Fernanda Lima", action: "CONFIG_CHANGE", resource: "Configurações", details: "Alteração nas configurações de segurança", status: "Sucesso", ipAddress: "192.168.1.45", timestamp: "17/05/2023 14:12:33" },
];

// Função para definir a cor da badge de status
const getStatusColor = (status: string) => {
  switch (status) {
    case "Sucesso":
      return "bg-green-500";
    case "Info":
      return "bg-blue-500";
    case "Alerta":
      return "bg-yellow-500";
    case "Erro":
      return "bg-orange-500";
    case "Crítico":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

// Função para definir o ícone de status
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Sucesso":
      return <CheckCircle className="h-4 w-4" />;
    case "Info":
      return <Clock className="h-4 w-4" />;
    case "Alerta":
      return <AlertCircle className="h-4 w-4" />;
    case "Erro":
      return <XCircle className="h-4 w-4" />;
    case "Crítico":
      return <UserX className="h-4 w-4" />;
    default:
      return null;
  }
};

const AuditoriaAcessos = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  return (
    
      <div className="px-6 py-4">
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Auditoria de Acessos</h1>
              <p className="text-gray-600 dark:text-gray-400">Monitore e consulte os logs de auditoria do sistema</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
              <Button className="gap-1" variant="outline">
                <RefreshCw size={16} />
                Atualizar
              </Button>
              <Button className="gap-1">
                <Download size={16} />
                Exportar Logs
              </Button>
            </div>
          </div>

          <Tabs defaultValue="logs" className="w-full">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <TabsList className="mb-2 md:mb-0">
                <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
                <TabsTrigger value="security">Eventos de Segurança</TabsTrigger>
                <TabsTrigger value="sessions">Sessões Ativas</TabsTrigger>
              </TabsList>
            </div>

            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input className="pl-8" placeholder="Buscar nos logs..." />
                  </div>
                  
                  <div>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="data">Dados</SelectItem>
                        <SelectItem value="security">Segurança</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="success">Sucesso</SelectItem>
                        <SelectItem value="warning">Alerta</SelectItem>
                        <SelectItem value="error">Erro</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <DatePicker 
                      date={startDate} 
                      setDate={setStartDate} 
                      placeholder="Data Início" 
                      className="flex-1" 
                    />
                    <DatePicker 
                      date={endDate} 
                      setDate={setEndDate} 
                      placeholder="Data Fim" 
                      className="flex-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <TabsContent value="logs" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Status</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Ação</TableHead>
                          <TableHead>Recurso</TableHead>
                          <TableHead>Detalhes</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockAuditLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge className={`flex gap-1 items-center ${getStatusColor(log.status)}`}>
                                {getStatusIcon(log.status)}
                                <span className="hidden md:inline">{log.status}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>{log.user}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.resource}</TableCell>
                            <TableCell>{log.details}</TableCell>
                            <TableCell>{log.ipAddress}</TableCell>
                            <TableCell>{log.timestamp}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Eventos de Segurança</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex justify-center items-center py-10">
                    <div className="text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Filtrar Eventos de Segurança</h3>
                      <p className="text-gray-600 max-w-md mb-4">
                        Selecione os filtros acima para visualizar os eventos de segurança do sistema.
                      </p>
                      <Button>Carregar Eventos</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sessions" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Sessões Ativas</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex justify-center items-center py-10">
                    <div className="text-center">
                      <Clock className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Monitoramento de Sessões</h3>
                      <p className="text-gray-600 max-w-md mb-4">
                        Veja e gerencie sessões ativas dos usuários no sistema.
                      </p>
                      <Button>Carregar Sessões</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Mostrando 12 de 1.458 registros</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Anterior</Button>
              <Button variant="outline" size="sm">Próximo</Button>
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default AuditoriaAcessos;
