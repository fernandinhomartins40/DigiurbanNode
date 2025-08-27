import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Wifi,
  Shield,
  Zap,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  TrendingUp,
  TrendingDown,
  Eye,
  Settings,
  RefreshCw,
  Bell,
  Download,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { 
  SuperAdminLayout,
  SuperAdminHeader,
  SuperAdminContent
} from "@/components/super-admin/SuperAdminDesignSystem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

interface SystemMetrics {
  timestamp: string;
  uptime: number;
  response_time: number;
  availability: number;
  error_rate: number;
  throughput: number;
  active_users: number;
  resources: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_io: number;
  };
  database: {
    connections: number;
    query_time: number;
    slow_queries: number;
    size_gb: number;
  };
  security: {
    failed_logins: number;
    blocked_ips: number;
    ssl_cert_days: number;
    vulnerabilities: number;
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'performance' | 'security' | 'infrastructure' | 'application';
  title: string;
  message: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'acknowledged';
  affected_tenants: string[];
  auto_resolve: boolean;
}

interface ServiceStatus {
  name: string;
  category: string;
  status: 'operational' | 'degraded' | 'partial' | 'outage';
  uptime: number;
  response_time: number;
  last_incident?: string;
  dependencies: string[];
}

interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  response_time: number;
  throughput: number;
  errors: number;
}

// ====================================================================
// DADOS MOCK PARA DEMONSTRAÇÃO
// ====================================================================

const mockSystemMetrics: SystemMetrics = {
  timestamp: new Date().toISOString(),
  uptime: 99.7,
  response_time: 1.2,
  availability: 99.9,
  error_rate: 0.8,
  throughput: 2847,
  active_users: 1623,
  resources: {
    cpu_usage: 34.5,
    memory_usage: 67.8,
    disk_usage: 45.2,
    network_io: 12.4
  },
  database: {
    connections: 127,
    query_time: 89.5,
    slow_queries: 3,
    size_gb: 245.7
  },
  security: {
    failed_logins: 12,
    blocked_ips: 4,
    ssl_cert_days: 67,
    vulnerabilities: 0
  }
};

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    category: 'performance',
    title: 'Tempo de resposta elevado',
    message: 'API Gateway apresentando latência acima de 2s nos últimos 15 minutos',
    timestamp: '2024-01-08T14:30:00Z',
    status: 'active',
    affected_tenants: ['SP-001', 'SP-002'],
    auto_resolve: true
  },
  {
    id: '2',
    type: 'critical',
    category: 'infrastructure',
    title: 'Uso de memória crítico',
    message: 'Servidor principal usando 89% da memória disponível',
    timestamp: '2024-01-08T13:45:00Z',
    status: 'acknowledged',
    affected_tenants: [],
    auto_resolve: false
  },
  {
    id: '3',
    type: 'info',
    category: 'security',
    title: 'Certificado SSL próximo do vencimento',
    message: 'Certificado expira em 67 dias - renovação recomendada',
    timestamp: '2024-01-08T10:00:00Z',
    status: 'active',
    affected_tenants: [],
    auto_resolve: false
  },
  {
    id: '4',
    type: 'warning',
    category: 'application',
    title: 'Queries lentas detectadas',
    message: '3 queries com tempo superior a 1s detectadas no banco de dados',
    timestamp: '2024-01-08T12:15:00Z',
    status: 'resolved',
    affected_tenants: [],
    auto_resolve: true
  }
];

const mockServices: ServiceStatus[] = [
  {
    name: 'API Gateway',
    category: 'Core',
    status: 'operational',
    uptime: 99.9,
    response_time: 1.2,
    dependencies: ['Database', 'Authentication']
  },
  {
    name: 'Authentication Service',
    category: 'Security',
    status: 'operational',
    uptime: 99.8,
    response_time: 0.8,
    dependencies: ['Database']
  },
  {
    name: 'Database Cluster',
    category: 'Infrastructure',
    status: 'degraded',
    uptime: 99.7,
    response_time: 89.5,
    last_incident: '2024-01-08T13:00:00Z',
    dependencies: []
  },
  {
    name: 'File Storage',
    category: 'Infrastructure',
    status: 'operational',
    uptime: 99.9,
    response_time: 0.4,
    dependencies: []
  },
  {
    name: 'Email Service',
    category: 'External',
    status: 'operational',
    uptime: 99.6,
    response_time: 2.1,
    dependencies: []
  },
  {
    name: 'Backup System',
    category: 'Infrastructure',
    status: 'operational',
    uptime: 100.0,
    response_time: 0.2,
    dependencies: ['File Storage']
  }
];

const performanceHistory: PerformanceData[] = [
  { timestamp: '14:00', cpu: 28.5, memory: 62.1, response_time: 1.1, throughput: 2450, errors: 2 },
  { timestamp: '14:15', cpu: 32.1, memory: 64.8, response_time: 1.3, throughput: 2680, errors: 1 },
  { timestamp: '14:30', cpu: 34.5, memory: 67.8, response_time: 1.2, throughput: 2847, errors: 0 },
  { timestamp: '14:45', cpu: 31.2, memory: 65.4, response_time: 1.0, throughput: 2912, errors: 1 },
  { timestamp: '15:00', cpu: 29.8, memory: 63.2, response_time: 0.9, throughput: 3045, errors: 0 }
];

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const MonitoringManagement: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>(mockSystemMetrics);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [services, setServices] = useState<ServiceStatus[]>(mockServices);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Estados para modais
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceStatus | null>(null);

  // ====================================================================
  // EFEITOS E ATUALIZAÇÕES
  // ====================================================================

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simular atualização de métricas
        setMetrics(prev => ({
          ...prev,
          timestamp: new Date().toISOString(),
          response_time: prev.response_time + (Math.random() - 0.5) * 0.2,
          resources: {
            ...prev.resources,
            cpu_usage: Math.max(0, Math.min(100, prev.resources.cpu_usage + (Math.random() - 0.5) * 5)),
            memory_usage: Math.max(0, Math.min(100, prev.resources.memory_usage + (Math.random() - 0.5) * 3))
          }
        }));
      }, 30000); // Atualizar a cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // ====================================================================
  // FUNÇÕES DE AÇÃO
  // ====================================================================

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowAlertDetails(true);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
    toast.success('Alerta marcado como resolvido!');
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
    toast.info('Alerta reconhecido!');
  };

  const handleViewService = (service: ServiceStatus) => {
    setSelectedService(service);
    setShowServiceDetails(true);
  };

  const handleRestartService = (serviceName: string) => {
    toast.info(`Reiniciando ${serviceName}...`);
    setTimeout(() => {
      toast.success(`${serviceName} reiniciado com sucesso!`);
      setServices(prev => prev.map(service => 
        service.name === serviceName ? { ...service, status: 'operational', uptime: 100.0 } : service
      ));
    }, 3000);
  };

  const refreshMetrics = async () => {
    setLoading(true);
    toast.info('Atualizando métricas...');
    
    // Simular atualização
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        timestamp: new Date().toISOString(),
        response_time: Math.max(0.5, prev.response_time + (Math.random() - 0.5) * 0.3),
        throughput: prev.throughput + Math.floor((Math.random() - 0.5) * 200),
        resources: {
          ...prev.resources,
          cpu_usage: Math.max(0, Math.min(100, prev.resources.cpu_usage + (Math.random() - 0.5) * 10)),
          memory_usage: Math.max(0, Math.min(100, prev.resources.memory_usage + (Math.random() - 0.5) * 5))
        }
      }));
      setLoading(false);
      toast.success('Métricas atualizadas!');
    }, 2000);
  };

  // ====================================================================
  // FUNÇÕES UTILITÁRIAS
  // ====================================================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      case 'outage': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'partial': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'outage': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string, status: string) => {
    if (status === 'resolved') return 'bg-gray-100 text-gray-800 opacity-60';
    
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatBytes = (bytes: number) => {
    return `${bytes.toFixed(1)} GB`;
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(1)}ms`;
  };

  // ====================================================================
  // RENDER PRINCIPAL
  // ====================================================================

  return (
    <SuperAdminLayout>
      <SuperAdminHeader 
        title="Sistema de Monitoramento"
        subtitle="Monitoramento técnico e operacional em tempo real"
        icon={Monitor}
        actions={[
          {
            text: autoRefresh ? "Auto-Refresh" : "Auto-Refresh",
            variant: autoRefresh ? "default" : "outline",
            icon: RefreshCw,
            onClick: () => setAutoRefresh(!autoRefresh),
            className: autoRefresh ? "bg-green-600 hover:bg-green-700" : ""
          },
          {
            text: "Atualizar",
            variant: "outline",
            icon: RefreshCw,
            onClick: refreshMetrics,
            disabled: loading
          },
          {
            text: `Alertas (${alerts.filter(a => a.status === 'active').length})`,
            variant: "outline",
            icon: Bell
          },
          {
            text: "Relatório",
            variant: "outline",
            icon: Download
          }
        ]}
      />

      <SuperAdminContent>

      {/* Status Geral do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Uptime */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Uptime</p>
                <p className="text-3xl font-bold text-green-900">{metrics.uptime}%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3" />
                  Sistema operacional
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Tempo de Resposta */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Resposta</p>
                <p className="text-3xl font-bold text-blue-900">{metrics.response_time.toFixed(1)}s</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <Zap className="h-3 w-3" />
                  Tempo médio
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Usuários Ativos */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Usuários Ativos</p>
                <p className="text-3xl font-bold text-purple-900">{metrics.active_users.toLocaleString()}</p>
                <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  Em tempo real
                </p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Erro */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Taxa de Erro</p>
                <p className="text-3xl font-bold text-orange-900">{metrics.error_rate}%</p>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  {metrics.error_rate < 1 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  Últimas 24h
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recursos do Sistema */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Recursos do Sistema
          </CardTitle>
          <CardDescription>
            Monitoramento de CPU, memória, disco e rede
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* CPU */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">CPU</span>
                </div>
                <span className="text-sm font-semibold">{metrics.resources.cpu_usage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.resources.cpu_usage} className="h-2" />
              <p className="text-xs text-gray-500">
                {metrics.resources.cpu_usage < 50 ? 'Normal' : 
                 metrics.resources.cpu_usage < 80 ? 'Moderado' : 'Alto'}
              </p>
            </div>

            {/* Memória */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Memória</span>
                </div>
                <span className="text-sm font-semibold">{metrics.resources.memory_usage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.resources.memory_usage} className="h-2" />
              <p className="text-xs text-gray-500">
                {metrics.resources.memory_usage < 60 ? 'Normal' : 
                 metrics.resources.memory_usage < 85 ? 'Moderado' : 'Crítico'}
              </p>
            </div>

            {/* Disco */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Disco</span>
                </div>
                <span className="text-sm font-semibold">{metrics.resources.disk_usage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.resources.disk_usage} className="h-2" />
              <p className="text-xs text-gray-500">
                {formatBytes(metrics.database.size_gb)} utilizados
              </p>
            </div>

            {/* Rede */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Rede I/O</span>
                </div>
                <span className="text-sm font-semibold">{metrics.resources.network_io.toFixed(1)} MB/s</span>
              </div>
              <Progress value={(metrics.resources.network_io / 50) * 100} className="h-2" />
              <p className="text-xs text-gray-500">
                {metrics.throughput} req/min
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Status dos Serviços */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Status dos Serviços
          </CardTitle>
          <CardDescription>
            Monitoramento de todos os serviços e componentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, index) => (
              <Card key={index} className="bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleViewService(service)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span className="font-semibold">{service.name}</span>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">{service.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resposta:</span>
                      <span className="font-medium">
                        {service.response_time < 100 ? 
                          formatTime(service.response_time) : 
                          `${service.response_time.toFixed(0)}ms`
                        }
                      </span>
                    </div>
                    {service.dependencies.length > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        Deps: {service.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                  
                  {service.status !== 'operational' && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full text-blue-600 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestartService(service.name);
                        }}
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Reiniciar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas e Notificações ({alerts.filter(a => a.status === 'active').length} ativos)
          </CardTitle>
          <CardDescription>
            Monitoramento de problemas e situações que requerem atenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`border transition-all ${
                alert.status === 'resolved' ? 'opacity-60' : 'hover:shadow-md'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getAlertColor(alert.type, alert.status)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge className={getAlertColor(alert.type, alert.status)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.category}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{new Date(alert.timestamp).toLocaleString('pt-BR')}</span>
                          {alert.affected_tenants.length > 0 && (
                            <span>Afeta: {alert.affected_tenants.join(', ')}</span>
                          )}
                          {alert.auto_resolve && (
                            <span className="text-blue-600">Auto-resolve</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-blue-600 hover:bg-blue-50"
                        onClick={() => handleViewAlert(alert)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {alert.status === 'active' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleResolveAlert(alert.id)}
                            title="Resolver alerta"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-orange-600 hover:bg-orange-50"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            title="Reconhecer alerta"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Detalhes do Alerta */}
      <Dialog open={showAlertDetails} onOpenChange={setShowAlertDetails}>
        <DialogContent className="max-w-2xl">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getAlertIcon(selectedAlert.type)}
                  Detalhes do Alerta: {selectedAlert.title}
                </DialogTitle>
                <DialogDescription>
                  Informações detalhadas sobre o alerta do sistema
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Informações Gerais */}
                <div className={`p-4 rounded-lg ${getAlertColor(selectedAlert.type, selectedAlert.status)}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Tipo:</span>
                      <p className="font-semibold">{selectedAlert.type.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Categoria:</span>
                      <p className="font-semibold">{selectedAlert.category}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Status:</span>
                      <p className="font-semibold">{selectedAlert.status}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Auto-resolve:</span>
                      <p className="font-semibold">{selectedAlert.auto_resolve ? 'Sim' : 'Não'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Mensagem */}
                <div>
                  <h4 className="font-semibold mb-2">Descrição do Problema:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedAlert.message}</p>
                </div>
                
                {/* Tenants Afetados */}
                {selectedAlert.affected_tenants.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tenants Afetados:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlert.affected_tenants.map(tenant => (
                        <Badge key={tenant} variant="outline">{tenant}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Timeline */}
                <div>
                  <h4 className="font-semibold mb-2">Linha do Tempo:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Detectado:</span> {new Date(selectedAlert.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAlertDetails(false)}>
                  Fechar
                </Button>
                {selectedAlert.status === 'active' && (
                  <>
                    <Button 
                      onClick={() => {
                        handleAcknowledgeAlert(selectedAlert.id);
                        setShowAlertDetails(false);
                      }}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Reconhecer
                    </Button>
                    <Button 
                      onClick={() => {
                        handleResolveAlert(selectedAlert.id);
                        setShowAlertDetails(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolver
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Detalhes do Serviço */}
      <Dialog open={showServiceDetails} onOpenChange={setShowServiceDetails}>
        <DialogContent className="max-w-2xl">
          {selectedService && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedService.status)}
                  {selectedService.name} - Detalhes
                </DialogTitle>
                <DialogDescription>
                  Informações detalhadas sobre o serviço
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Status Atual */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">Status Atual</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="mt-1">
                        <Badge className={getStatusColor(selectedService.status)}>
                          {selectedService.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Categoria:</span>
                      <p className="font-medium">{selectedService.category}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Uptime:</span>
                      <p className="font-medium text-green-600">{selectedService.uptime}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tempo de Resposta:</span>
                      <p className="font-medium">
                        {selectedService.response_time < 100 ? 
                          formatTime(selectedService.response_time) : 
                          `${selectedService.response_time.toFixed(0)}ms`
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Dependências */}
                {selectedService.dependencies.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Dependências:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.dependencies.map(dep => (
                        <Badge key={dep} variant="outline" className="bg-gray-100">{dep}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Último Incidente */}
                {selectedService.last_incident && (
                  <div>
                    <h4 className="font-semibold mb-2">Último Incidente:</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedService.last_incident).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
                
                {/* Métricas Históricas */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Histórico de Performance:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Uptime médio (7 dias):</span>
                      <span className="font-medium">{selectedService.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo resposta médio:</span>
                      <span className="font-medium">
                        {selectedService.response_time < 100 ? 
                          formatTime(selectedService.response_time) : 
                          `${selectedService.response_time.toFixed(0)}ms`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowServiceDetails(false)}>
                  Fechar
                </Button>
                {selectedService.status !== 'operational' && (
                  <Button 
                    onClick={() => {
                      handleRestartService(selectedService.name);
                      setShowServiceDetails(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reiniciar Serviço
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      </SuperAdminContent>
    </SuperAdminLayout>
  );
};

export default MonitoringManagement;