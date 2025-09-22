import React, { useState, useEffect } from 'react';
import {
  Shield,
  Database,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Users,
  Key,
  Lock,
  Unlock,
  Archive,
  Trash2,
  FileText,
  Terminal,
  HardDrive,
  Cloud,
  Mail,
  Bell,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Play,
  Pause,
  Stop
} from 'lucide-react';
import { monitoringService, type SystemMetrics, type Alert, type ServiceStatus } from '@/services/monitoringService';
import { 
  SuperAdminLayout,
  SuperAdminHeader,
  SuperAdminContent,
  SuperAdminSection
} from "@/components/super-admin/SuperAdminDesignSystem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  progress: number;
  size: number;
  started_at: string;
  completed_at?: string;
  destination: string;
  retention_days: number;
}

interface MaintenanceTask {
  id: string;
  name: string;
  category: 'database' | 'system' | 'security' | 'cleanup';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduled_at: string;
  estimated_duration: number;
  affects_service: boolean;
  auto_execute: boolean;
}

interface SystemCommand {
  id: string;
  name: string;
  description: string;
  category: 'database' | 'cache' | 'logs' | 'services';
  command: string;
  requires_confirmation: boolean;
  danger_level: 'low' | 'medium' | 'high' | 'critical';
  last_executed?: string;
  execution_time?: number;
}

interface SecurityAction {
  id: string;
  type: 'block_ip' | 'unlock_user' | 'reset_password' | 'revoke_token' | 'ban_tenant';
  target: string;
  reason: string;
  status: 'active' | 'expired' | 'revoked';
  created_at: string;
  expires_at?: string;
  created_by: string;
}

interface StorageStats {
  total_space: number;
  used_space: number;
  available_space: number;
  databases: {
    name: string;
    size: number;
    growth_rate: number;
  }[];
  files: {
    type: string;
    size: number;
    count: number;
  }[];
}

// ====================================================================
// DADOS MOCK PARA DEMONSTRAÇÃO
// ====================================================================

const mockBackupJobs: BackupJob[] = [
  {
    id: '1',
    name: 'Backup Completo Diário',
    type: 'full',
    status: 'running',
    progress: 67,
    size: 15.2,
    started_at: '2024-01-08T02:00:00Z',
    destination: 'AWS S3 - Backup Bucket',
    retention_days: 30
  },
  {
    id: '2',
    name: 'Backup Incremental',
    type: 'incremental',
    status: 'completed',
    progress: 100,
    size: 2.8,
    started_at: '2024-01-08T06:00:00Z',
    completed_at: '2024-01-08T06:15:00Z',
    destination: 'Local Storage - /backups',
    retention_days: 7
  },
  {
    id: '3',
    name: 'Backup de Logs',
    type: 'differential',
    status: 'scheduled',
    progress: 0,
    size: 0,
    started_at: '2024-01-08T18:00:00Z',
    destination: 'External FTP',
    retention_days: 14
  }
];

const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: '1',
    name: 'Otimização do Banco de Dados',
    category: 'database',
    description: 'Reindexação e otimização de tabelas principais',
    status: 'pending',
    scheduled_at: '2024-01-09T02:00:00Z',
    estimated_duration: 45,
    affects_service: true,
    auto_execute: true
  },
  {
    id: '2',
    name: 'Limpeza de Logs Antigos',
    category: 'cleanup',
    description: 'Remoção de logs com mais de 90 dias',
    status: 'completed',
    scheduled_at: '2024-01-08T01:00:00Z',
    estimated_duration: 15,
    affects_service: false,
    auto_execute: true
  },
  {
    id: '3',
    name: 'Atualização de Certificados SSL',
    category: 'security',
    description: 'Renovação automática de certificados',
    status: 'running',
    scheduled_at: '2024-01-08T12:00:00Z',
    estimated_duration: 30,
    affects_service: false,
    auto_execute: false
  }
];

const mockSystemCommands: SystemCommand[] = [
  {
    id: '1',
    name: 'Limpar Cache Redis',
    description: 'Remove todos os dados em cache do Redis',
    category: 'cache',
    command: 'redis-cli FLUSHALL',
    requires_confirmation: true,
    danger_level: 'medium',
    last_executed: '2024-01-07T14:30:00Z',
    execution_time: 2.5
  },
  {
    id: '2',
    name: 'Reindexar Banco Principal',
    description: 'Executa REINDEX em todas as tabelas',
    category: 'database',
    command: 'psql -c "REINDEX DATABASE digiurban"',
    requires_confirmation: true,
    danger_level: 'high',
    last_executed: '2024-01-05T03:00:00Z',
    execution_time: 245.7
  },
  {
    id: '3',
    name: 'Restart Serviço API',
    description: 'Reinicia o serviço principal da API',
    category: 'services',
    command: 'systemctl restart digiurban-api',
    requires_confirmation: true,
    danger_level: 'critical'
  },
  {
    id: '4',
    name: 'Exportar Logs de Erro',
    description: 'Gera arquivo com logs de erro das últimas 24h',
    category: 'logs',
    command: 'journalctl --since="24 hours ago" --grep="ERROR"',
    requires_confirmation: false,
    danger_level: 'low'
  }
];

const mockSecurityActions: SecurityAction[] = [
  {
    id: '1',
    type: 'block_ip',
    target: '192.168.1.100',
    reason: 'Múltiplas tentativas de login falhadas',
    status: 'active',
    created_at: '2024-01-08T10:30:00Z',
    expires_at: '2024-01-08T22:30:00Z',
    created_by: 'Sistema Automático'
  },
  {
    id: '2',
    type: 'unlock_user',
    target: 'joao.silva@prefeitura.gov.br',
    reason: 'Desbloqueio solicitado pelo admin',
    status: 'active',
    created_at: '2024-01-08T09:15:00Z',
    created_by: 'admin@digiurban.com'
  },
  {
    id: '3',
    type: 'reset_password',
    target: 'maria.santos@campinas.sp.gov.br',
    reason: 'Reset solicitado pelo usuário',
    status: 'expired',
    created_at: '2024-01-07T16:20:00Z',
    expires_at: '2024-01-08T16:20:00Z',
    created_by: 'Sistema Automático'
  }
];

const mockStorageStats: StorageStats = {
  total_space: 500,
  used_space: 245.7,
  available_space: 254.3,
  databases: [
    { name: 'digiurban_main', size: 89.5, growth_rate: 2.3 },
    { name: 'digiurban_logs', size: 45.2, growth_rate: 8.7 },
    { name: 'digiurban_backups', size: 78.9, growth_rate: -1.2 }
  ],
  files: [
    { type: 'Documentos', size: 23.4, count: 15420 },
    { type: 'Imagens', size: 8.7, count: 3240 },
    { type: 'Logs', size: 45.2, count: 89567 },
    { type: 'Outros', size: 12.1, count: 5670 }
  ]
};

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const OperationsManagement: React.FC = () => {
  // Estados existentes (mock data para funcionalidades não implementadas)
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>(mockBackupJobs);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(mockMaintenanceTasks);
  const [systemCommands, setSystemCommands] = useState<SystemCommand[]>(mockSystemCommands);
  const [securityActions, setSecurityActions] = useState<SecurityAction[]>(mockSecurityActions);
  const [storageStats, setStorageStats] = useState<StorageStats>(mockStorageStats);

  // Novos estados para dados reais do monitoringService
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<Alert[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('monitoring');
  
  // Estados para modais
  const [showNewBackupModal, setShowNewBackupModal] = useState(false);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [showNewMaintenanceModal, setShowNewMaintenanceModal] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<SystemCommand | null>(null);
  
  // Estados para formulários
  const [newBackupForm, setNewBackupForm] = useState({
    name: '',
    type: 'incremental' as const,
    destination: '',
    retention_days: 7
  });
  
  const [newMaintenanceForm, setNewMaintenanceForm] = useState({
    name: '',
    category: 'cleanup' as const,
    description: '',
    scheduled_at: '',
    estimated_duration: 30,
    affects_service: false,
    auto_execute: true
  });

  // ====================================================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS REAIS
  // ====================================================================

  const loadSystemMetrics = async () => {
    try {
      const metrics = await monitoringService.getSystemMetrics();
      setSystemMetrics(metrics);

      // Atualizar storageStats com dados reais se disponível
      if (metrics.resources) {
        setStorageStats(prev => ({
          ...prev,
          used_space: (metrics.resources.disk_usage / 100) * prev.total_space,
          available_space: prev.total_space - (metrics.resources.disk_usage / 100) * prev.total_space
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar métricas do sistema:', error);
      toast.error('Erro ao carregar métricas do sistema');
    }
  };

  const loadSystemAlerts = async () => {
    try {
      const alerts = await monitoringService.getSystemAlerts();
      setSystemAlerts(alerts);
    } catch (error) {
      console.error('Erro ao carregar alertas do sistema:', error);
      toast.error('Erro ao carregar alertas do sistema');
    }
  };

  const loadServiceStatus = async () => {
    try {
      const services = await monitoringService.getServiceStatus();
      setServiceStatus(services);
    } catch (error) {
      console.error('Erro ao carregar status dos serviços:', error);
      toast.error('Erro ao carregar status dos serviços');
    }
  };

  const loadAllRealData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSystemMetrics(),
        loadSystemAlerts(),
        loadServiceStatus()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect para carregar dados reais na inicialização
  useEffect(() => {
    loadAllRealData();

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadAllRealData, 30000);
    return () => clearInterval(interval);
  }, []);

  // ====================================================================
  // FUNÇÕES UTILITÁRIAS
  // ====================================================================

  const formatBytes = (bytes: number) => {
    return `${bytes.toFixed(1)} GB`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      running: { label: 'Executando', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Concluído', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Falhado', color: 'bg-red-100 text-red-800' },
      scheduled: { label: 'Agendado', color: 'bg-yellow-100 text-yellow-800' },
      pending: { label: 'Pendente', color: 'bg-gray-100 text-gray-800' },
      active: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      expired: { label: 'Expirado', color: 'bg-gray-100 text-gray-800' },
      revoked: { label: 'Revogado', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getDangerBadge = (level: string) => {
    const dangerConfig = {
      low: { label: 'Baixo', color: 'bg-green-100 text-green-800' },
      medium: { label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Alto', color: 'bg-orange-100 text-orange-800' },
      critical: { label: 'Crítico', color: 'bg-red-100 text-red-800' }
    };
    
    const config = dangerConfig[level as keyof typeof dangerConfig];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const getCommandIcon = (category: string) => {
    switch (category) {
      case 'database': return <Database className="h-5 w-5 text-blue-600" />;
      case 'cache': return <RefreshCw className="h-5 w-5 text-green-600" />;
      case 'logs': return <FileText className="h-5 w-5 text-orange-600" />;
      case 'services': return <Settings className="h-5 w-5 text-purple-600" />;
      default: return <Terminal className="h-5 w-5 text-gray-600" />;
    }
  };

  const executeCommand = (command: SystemCommand) => {
    setSelectedCommand(command);
    setShowCommandModal(true);
  };

  const confirmExecuteCommand = async () => {
    if (!selectedCommand) return;
    
    setLoading(true);
    toast.info(`Executando ${selectedCommand.name}...`);
    
    try {
      // Simular execução com delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Atualizar comando com última execução
      setSystemCommands(prev => prev.map(cmd => 
        cmd.id === selectedCommand.id 
          ? { ...cmd, last_executed: new Date().toISOString(), execution_time: Math.random() * 100 }
          : cmd
      ));
      
      toast.success(`${selectedCommand.name} executado com sucesso!`);
    } catch (error) {
      toast.error(`Erro ao executar ${selectedCommand.name}`);
    } finally {
      setLoading(false);
      setShowCommandModal(false);
      setSelectedCommand(null);
    }
  };

  const handleCreateBackup = () => {
    const newBackup: BackupJob = {
      id: (backupJobs.length + 1).toString(),
      name: newBackupForm.name,
      type: newBackupForm.type,
      status: 'scheduled',
      progress: 0,
      size: 0,
      started_at: new Date().toISOString(),
      destination: newBackupForm.destination,
      retention_days: newBackupForm.retention_days
    };
    
    setBackupJobs(prev => [...prev, newBackup]);
    setNewBackupForm({ name: '', type: 'incremental', destination: '', retention_days: 7 });
    setShowNewBackupModal(false);
    toast.success('Novo job de backup criado!');
  };

  const handleCreateMaintenance = () => {
    const newTask: MaintenanceTask = {
      id: (maintenanceTasks.length + 1).toString(),
      name: newMaintenanceForm.name,
      category: newMaintenanceForm.category,
      description: newMaintenanceForm.description,
      status: 'pending',
      scheduled_at: new Date(newMaintenanceForm.scheduled_at).toISOString(),
      estimated_duration: newMaintenanceForm.estimated_duration,
      affects_service: newMaintenanceForm.affects_service,
      auto_execute: newMaintenanceForm.auto_execute
    };
    
    setMaintenanceTasks(prev => [...prev, newTask]);
    setNewMaintenanceForm({
      name: '', category: 'cleanup', description: '', scheduled_at: '',
      estimated_duration: 30, affects_service: false, auto_execute: true
    });
    setShowNewMaintenanceModal(false);
    toast.success('Nova tarefa de manutenção criada!');
  };

  const runMaintenanceTask = async (taskId: string) => {
    setMaintenanceTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'running' } : task
    ));
    
    toast.info('Executando tarefa de manutenção...');
    
    setTimeout(() => {
      setMaintenanceTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'completed' } : task
      ));
      toast.success('Tarefa de manutenção concluída!');
    }, 5000);
  };

  // ====================================================================
  // RENDER PRINCIPAL
  // ====================================================================

  return (
    <SuperAdminLayout>
      <SuperAdminHeader 
        title="Ferramentas Operacionais"
        subtitle="Administração e manutenção do sistema"
        icon={Settings}
        actions={[
          {
            text: "Atualizar Dados",
            variant: "outline" as const,
            icon: RefreshCw,
            onClick: loadAllRealData,
            loading: loading
          },
          ...(activeTab === 'backups' ? [{
            text: "Novo Backup",
            variant: "default" as const,
            icon: Upload,
            onClick: () => setShowNewBackupModal(true)
          }] : []),
          ...(activeTab === 'maintenance' ? [{
            text: "Agendar Manutenção",
            variant: "default" as const,
            icon: Calendar,
            onClick: () => setShowNewMaintenanceModal(true)
          }] : [])
        ]}
      />

      <SuperAdminContent>

      {/* Tabs de Navegação */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {[
          { id: 'monitoring', label: 'Monitoramento', icon: <Activity className="h-4 w-4" /> },
          { id: 'backups', label: 'Backups', icon: <Archive className="h-4 w-4" /> },
          { id: 'maintenance', label: 'Manutenção', icon: <Settings className="h-4 w-4" /> },
          { id: 'commands', label: 'Comandos', icon: <Terminal className="h-4 w-4" /> },
          { id: 'security', label: 'Segurança', icon: <Shield className="h-4 w-4" /> },
          { id: 'storage', label: 'Armazenamento', icon: <HardDrive className="h-4 w-4" /> }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">

          {/* Métricas do Sistema */}
          {systemMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">CPU</p>
                      <p className="text-2xl font-bold text-blue-900">{systemMetrics.resources.cpu_usage.toFixed(1)}%</p>
                      <p className="text-xs text-blue-600">Uso do processador</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <Progress value={systemMetrics.resources.cpu_usage} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Memória</p>
                      <p className="text-2xl font-bold text-green-900">{systemMetrics.resources.memory_usage.toFixed(1)}%</p>
                      <p className="text-xs text-green-600">RAM utilizada</p>
                    </div>
                    <Database className="h-8 w-8 text-green-600" />
                  </div>
                  <Progress value={systemMetrics.resources.memory_usage} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Disco</p>
                      <p className="text-2xl font-bold text-purple-900">{systemMetrics.resources.disk_usage.toFixed(1)}%</p>
                      <p className="text-xs text-purple-600">Armazenamento</p>
                    </div>
                    <HardDrive className="h-8 w-8 text-purple-600" />
                  </div>
                  <Progress value={systemMetrics.resources.disk_usage} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">Uptime</p>
                      <p className="text-2xl font-bold text-orange-900">{systemMetrics.availability.toFixed(1)}%</p>
                      <p className="text-xs text-orange-600">Disponibilidade</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Status dos Serviços */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status dos Serviços
              </CardTitle>
              <CardDescription>
                Monitoramento em tempo real dos serviços críticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceStatus.map((service, index) => (
                  <Card key={index} className={`p-4 border-l-4 ${
                    service.status === 'operational' ? 'border-l-green-500 bg-green-50/50' :
                    service.status === 'degraded' ? 'border-l-yellow-500 bg-yellow-50/50' :
                    service.status === 'partial' ? 'border-l-orange-500 bg-orange-50/50' :
                    'border-l-red-500 bg-red-50/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.category}</p>
                      </div>
                      <Badge className={
                        service.status === 'operational' ? 'bg-green-100 text-green-800' :
                        service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                        service.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {service.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Uptime: {service.uptime.toFixed(1)}%</p>
                      <p>Resposta: {service.response_time.toFixed(0)}ms</p>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alertas do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas do Sistema ({systemAlerts.length})
              </CardTitle>
              <CardDescription>
                Alertas ativos e histórico de incidentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemAlerts.length > 0 ? systemAlerts.map((alert) => (
                  <Card key={alert.id} className={`p-4 border-l-4 ${
                    alert.type === 'critical' ? 'border-l-red-500 bg-red-50/50' :
                    alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50/50' :
                    'border-l-blue-500 bg-blue-50/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{alert.title}</h3>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleString('pt-BR')} • {alert.category}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={
                          alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {alert.type}
                        </Badge>
                        {alert.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => monitoringService.acknowledgeAlert(alert.id)}
                          >
                            Reconhecer
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p>Nenhum alerta ativo no momento</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'backups' && (
        <div className="space-y-6">
          
          {/* Status Geral de Backups */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Último Backup</p>
                    <p className="text-2xl font-bold text-green-900">Hoje 06:15</p>
                    <p className="text-xs text-green-600">Incremental - 2.8 GB</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Backup Ativo</p>
                    <p className="text-2xl font-bold text-blue-900">67%</p>
                    <p className="text-xs text-blue-600">15.2 GB processados</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Total Armazenado</p>
                    <p className="text-2xl font-bold text-purple-900">245 GB</p>
                    <p className="text-xs text-purple-600">30 dias retenção</p>
                  </div>
                  <Cloud className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Próximo Backup</p>
                    <p className="text-2xl font-bold text-orange-900">18:00</p>
                    <p className="text-xs text-orange-600">Logs differential</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs de Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Jobs de Backup
              </CardTitle>
              <CardDescription>
                Gestão e monitoramento de backups automáticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupJobs.map((job) => (
                  <Card key={job.id} className="bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Archive className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{job.name}</h3>
                            <p className="text-sm text-gray-600">Tipo: {job.type} • Destino: {job.destination}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(job.status)}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {job.status === 'running' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progresso</span>
                            <span>{job.progress}% ({formatBytes(job.size)})</span>
                          </div>
                          <Progress value={job.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mt-3">
                        <span>Iniciado: {new Date(job.started_at).toLocaleString('pt-BR')}</span>
                        <span>Retenção: {job.retention_days} dias</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Tarefas de Manutenção
            </CardTitle>
            <CardDescription>
              Manutenção programada e otimização do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceTasks.map((task) => (
                <Card key={task.id} className="bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          task.category === 'database' ? 'bg-blue-100' :
                          task.category === 'security' ? 'bg-red-100' :
                          task.category === 'cleanup' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {task.category === 'database' ? <Database className="h-6 w-6 text-blue-600" /> :
                           task.category === 'security' ? <Shield className="h-6 w-6 text-red-600" /> :
                           task.category === 'cleanup' ? <Trash2 className="h-6 w-6 text-green-600" /> :
                           <Settings className="h-6 w-6 text-gray-600" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{task.name}</h3>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>Agendado: {new Date(task.scheduled_at).toLocaleString('pt-BR')}</span>
                            <span>Duração: {formatDuration(task.estimated_duration)}</span>
                            {task.affects_service && <span className="text-orange-600">Afeta serviço</span>}
                            {task.auto_execute && <span className="text-blue-600">Auto-executar</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(task.status)}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {task.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600"
                              onClick={() => runMaintenanceTask(task.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'commands' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Comandos do Sistema
            </CardTitle>
            <CardDescription>
              Execução de comandos administrativos e manutenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemCommands.map((command) => (
                <Card key={command.id} className="bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getCommandIcon(command.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{command.name}</h3>
                          {getDangerBadge(command.danger_level)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{command.description}</p>
                        <div className="bg-black/5 rounded p-2 mb-3">
                          <code className="text-xs font-mono">{command.command}</code>
                        </div>
                        {command.last_executed && (
                          <div className="text-xs text-gray-500 mb-3">
                            Último: {new Date(command.last_executed).toLocaleString('pt-BR')}
                            {command.execution_time && ` (${command.execution_time}s)`}
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          onClick={() => executeCommand(command)}
                          className={command.danger_level === 'critical' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Executar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Ações de Segurança
            </CardTitle>
            <CardDescription>
              Bloqueios, desbloqueios e ações de segurança ativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityActions.map((action) => (
                <Card key={action.id} className="bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                          {action.type === 'block_ip' ? <Lock className="h-6 w-6 text-red-600" /> :
                           action.type === 'unlock_user' ? <Unlock className="h-6 w-6 text-green-600" /> :
                           action.type === 'reset_password' ? <Key className="h-6 w-6 text-blue-600" /> :
                           <Shield className="h-6 w-6 text-orange-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg capitalize">
                            {action.type.replace('_', ' ')}
                          </h3>
                          <p className="text-sm text-gray-600">Alvo: {action.target}</p>
                          <p className="text-xs text-gray-500">Razão: {action.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(action.status)}
                        <div className="text-xs text-gray-500 mt-2">
                          <p>Por: {action.created_by}</p>
                          <p>{new Date(action.created_at).toLocaleString('pt-BR')}</p>
                          {action.expires_at && (
                            <p>Expira: {new Date(action.expires_at).toLocaleString('pt-BR')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'storage' && (
        <div className="space-y-6">
          {/* Estatísticas de Armazenamento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Espaço Total</p>
                    <p className="text-3xl font-bold text-blue-900">{formatBytes(storageStats.total_space)}</p>
                    <p className="text-xs text-blue-600">Capacidade total</p>
                  </div>
                  <HardDrive className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Espaço Usado</p>
                    <p className="text-3xl font-bold text-green-900">{formatBytes(storageStats.used_space)}</p>
                    <p className="text-xs text-green-600">{((storageStats.used_space / storageStats.total_space) * 100).toFixed(1)}% do total</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Disponível</p>
                    <p className="text-3xl font-bold text-purple-900">{formatBytes(storageStats.available_space)}</p>
                    <p className="text-xs text-purple-600">Espaço livre</p>
                  </div>
                  <Cloud className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progresso de Uso */}
          <Card>
            <CardHeader>
              <CardTitle>Uso de Armazenamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Utilização geral</span>
                  <span className="font-medium">{formatBytes(storageStats.used_space)} / {formatBytes(storageStats.total_space)}</span>
                </div>
                <Progress value={(storageStats.used_space / storageStats.total_space) * 100} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Detalhamento por Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bancos de Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Bancos de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storageStats.databases.map((db, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{db.name}</span>
                        <div className="text-right">
                          <span className="font-semibold">{formatBytes(db.size)}</span>
                          <span className={`text-xs ml-2 ${db.growth_rate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {db.growth_rate > 0 ? '+' : ''}{db.growth_rate}%/mês
                          </span>
                        </div>
                      </div>
                      <Progress value={(db.size / storageStats.used_space) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Arquivos por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Arquivos por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storageStats.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                      <div>
                        <p className="font-medium">{file.type}</p>
                        <p className="text-xs text-gray-500">{file.count.toLocaleString()} arquivos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatBytes(file.size)}</p>
                        <p className="text-xs text-gray-500">
                          {((file.size / storageStats.used_space) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {/* Modal Novo Backup */}
      <Dialog open={showNewBackupModal} onOpenChange={setShowNewBackupModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Criar Novo Backup
            </DialogTitle>
            <DialogDescription>
              Configure um novo job de backup automático.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="backup_name">Nome do Backup *</Label>
              <Input
                id="backup_name"
                value={newBackupForm.name}
                onChange={(e) => setNewBackupForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Backup Semanal Completo"
              />
            </div>
            
            <div>
              <Label htmlFor="backup_type">Tipo de Backup *</Label>
              <Select 
                value={newBackupForm.type} 
                onValueChange={(value: any) => setNewBackupForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Completo - Backup total</SelectItem>
                  <SelectItem value="incremental">Incremental - Apenas mudanças</SelectItem>
                  <SelectItem value="differential">Diferencial - Mudanças desde o último completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="backup_destination">Destino *</Label>
              <Input
                id="backup_destination"
                value={newBackupForm.destination}
                onChange={(e) => setNewBackupForm(prev => ({ ...prev, destination: e.target.value }))}
                placeholder="Ex: AWS S3, Local Storage, FTP"
              />
            </div>
            
            <div>
              <Label htmlFor="backup_retention">Retenção (dias) *</Label>
              <Input
                id="backup_retention"
                type="number"
                value={newBackupForm.retention_days}
                onChange={(e) => setNewBackupForm(prev => ({ ...prev, retention_days: Number(e.target.value) }))}
                min="1"
                max="365"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBackupModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateBackup}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!newBackupForm.name.trim() || !newBackupForm.destination.trim()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Criar Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nova Tarefa de Manutenção */}
      <Dialog open={showNewMaintenanceModal} onOpenChange={setShowNewMaintenanceModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-600" />
              Criar Nova Tarefa de Manutenção
            </DialogTitle>
            <DialogDescription>
              Configure uma nova tarefa de manutenção programada.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="maintenance_name">Nome da Tarefa *</Label>
              <Input
                id="maintenance_name"
                value={newMaintenanceForm.name}
                onChange={(e) => setNewMaintenanceForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Limpeza de cache semanal"
              />
            </div>
            
            <div>
              <Label htmlFor="maintenance_category">Categoria *</Label>
              <Select 
                value={newMaintenanceForm.category} 
                onValueChange={(value: any) => setNewMaintenanceForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="security">Segurança</SelectItem>
                  <SelectItem value="cleanup">Limpeza</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="maintenance_duration">Duração (minutos) *</Label>
              <Input
                id="maintenance_duration"
                type="number"
                value={newMaintenanceForm.estimated_duration}
                onChange={(e) => setNewMaintenanceForm(prev => ({ ...prev, estimated_duration: Number(e.target.value) }))}
                min="5"
                max="480"
              />
            </div>
            
            <div>
              <Label htmlFor="maintenance_schedule">Agendamento *</Label>
              <Input
                id="maintenance_schedule"
                type="datetime-local"
                value={newMaintenanceForm.scheduled_at}
                onChange={(e) => setNewMaintenanceForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="affects_service"
                checked={newMaintenanceForm.affects_service}
                onChange={(e) => setNewMaintenanceForm(prev => ({ ...prev, affects_service: e.target.checked }))}
              />
              <Label htmlFor="affects_service">Afeta o serviço</Label>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="maintenance_description">Descrição</Label>
              <Textarea
                id="maintenance_description"
                value={newMaintenanceForm.description}
                onChange={(e) => setNewMaintenanceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que esta tarefa fará..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMaintenanceModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateMaintenance}
              className="bg-green-600 hover:bg-green-700"
              disabled={!newMaintenanceForm.name.trim() || !newMaintenanceForm.scheduled_at}
            >
              <Settings className="h-4 w-4 mr-2" />
              Criar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmação de Comando */}
      <Dialog open={showCommandModal} onOpenChange={setShowCommandModal}>
        <DialogContent className="max-w-md">
          {selectedCommand && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-red-600" />
                  Confirmar Execução
                </DialogTitle>
                <DialogDescription>
                  Você tem certeza que deseja executar este comando?
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold">Aviso de Segurança</span>
                  </div>
                  <p className="text-sm text-gray-700">{selectedCommand.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedCommand.description}</p>
                </div>
                
                <div className="bg-black rounded-lg p-3">
                  <code className="text-green-400 text-sm font-mono">{selectedCommand.command}</code>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Nível de Perigo:</span>
                  {getDangerBadge(selectedCommand.danger_level)}
                </div>
                
                {selectedCommand.last_executed && (
                  <div className="text-xs text-gray-500">
                    <p>Última execução: {new Date(selectedCommand.last_executed).toLocaleString('pt-BR')}</p>
                    {selectedCommand.execution_time && <p>Tempo: {selectedCommand.execution_time.toFixed(2)}s</p>}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCommandModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmExecuteCommand}
                  className={`${
                    selectedCommand.danger_level === 'critical' ? 'bg-red-600 hover:bg-red-700' :
                    selectedCommand.danger_level === 'high' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Executando...' : 'Executar Comando'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      </SuperAdminContent>
    </SuperAdminLayout>
  );
};

export default OperationsManagement;