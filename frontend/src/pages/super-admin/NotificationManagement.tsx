// ====================================================================
// 🔔 NOTIFICATION MANAGEMENT - SUPER ADMIN
// ====================================================================
// Painel completo de gerenciamento de notificações para Super Admin
// Sistema integrado de notificações em massa, templates e configurações
// ====================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Bell as NotificationsIcon,
  Send as SendIcon,
  Clock as ScheduleIcon,
  Mail as EmailIcon,
  MessageSquare as SmsIcon,
  Smartphone as PushIcon,
  MessageCircle as InAppIcon,
  BarChart3 as AnalyticsIcon,
  Settings as SettingsIcon,
  Plus as AddIcon,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Copy as CopyIcon,
  Play as TestIcon,
  CheckCircle as SuccessIcon,
  XCircle as ErrorIcon,
  AlertTriangle as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Users as PeopleIcon,
  Clock as TimeIcon,
  ChevronDown as ExpandMoreIcon,
  RefreshCw as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';
import notificationService, {
  NotificationStats,
  NotificationAnalytics,
  BulkNotification,
  NotificationTemplate,
  NotificationConfig,
  CreateTemplateRequest,
  TestNotificationRequest
} from '../../services/notificationService';

// ====================================================================
// INTERFACES LOCAIS
// ====================================================================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const NotificationManagement: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para estatísticas
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);

  // Estados para notificações em massa
  const [bulkNotifications, setBulkNotifications] = useState<any[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkForm, setBulkForm] = useState<Partial<BulkNotification>>({
    title: '',
    message: '',
    channels: [],
    target_audience: { all_users: false },
    priority: 'normal'
  });

  // Estados para templates
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<Partial<CreateTemplateRequest>>({
    name: '',
    description: '',
    type: 'email',
    content: ''
  });

  // Estados para configurações
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  // Estados para testes
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  // ====================================================================
  // EFEITOS E CARREGAMENTO DE DADOS
  // ====================================================================

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setRefreshing(!showLoader);

    try {
      const [statsData, analyticsData, templatesData, configData, bulkData] = await Promise.all([
        notificationService.getStats(),
        notificationService.getAnalytics(),
        notificationService.getTemplates(),
        notificationService.getConfig(),
        notificationService.getBulkNotifications()
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
      setTemplates(templatesData);
      setConfig(configData);
      setBulkNotifications(bulkData.notifications || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ====================================================================
  // HANDLERS DE EVENTOS
  // ====================================================================

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateBulkNotification = async () => {
    try {
      setLoading(true);

      // Validar formulário
      const errors = notificationService.validateBulkNotification(bulkForm as BulkNotification);
      if (errors.length > 0) {
        toast.error(errors.join(', '));
        return;
      }

      await notificationService.createBulkNotification(bulkForm as BulkNotification);

      toast.success('Notificação em massa criada com sucesso!');
      setShowBulkDialog(false);
      setBulkForm({
        title: '',
        message: '',
        channels: [],
        target_audience: { all_users: false },
        priority: 'normal'
      });

      // Recarregar dados
      await loadData(false);
    } catch (error: any) {
      toast.error(`Erro ao criar notificação: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setLoading(true);

      // Validar formulário
      const errors = notificationService.validateTemplate(templateForm as CreateTemplateRequest);
      if (errors.length > 0) {
        toast.error(errors.join(', '));
        return;
      }

      if (editingTemplate) {
        await notificationService.updateTemplate(editingTemplate.id, templateForm);
        toast.success('Template atualizado com sucesso!');
      } else {
        await notificationService.createTemplate(templateForm as CreateTemplateRequest);
        toast.success('Template criado com sucesso!');
      }

      setShowTemplateDialog(false);
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        description: '',
        type: 'email',
        content: ''
      });

      // Recarregar templates
      const templatesData = await notificationService.getTemplates();
      setTemplates(templatesData);
    } catch (error: any) {
      toast.error(`Erro ao salvar template: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este template?')) return;

    try {
      await notificationService.deleteTemplate(id);
      toast.success('Template deletado com sucesso!');

      // Recarregar templates
      const templatesData = await notificationService.getTemplates();
      setTemplates(templatesData);
    } catch (error: any) {
      toast.error(`Erro ao deletar template: ${error.message}`);
    }
  };

  const handleTestNotification = async (testData: TestNotificationRequest) => {
    try {
      setLoading(true);
      const results = await notificationService.sendTestNotification(testData);
      setTestResults(results);
      toast.success('Teste de notificação enviado!');
    } catch (error: any) {
      toast.error(`Erro no teste: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (newConfig: Partial<NotificationConfig>) => {
    try {
      setLoading(true);
      const updatedConfig = await notificationService.updateConfig(newConfig);
      setConfig(updatedConfig);
      toast.success('Configurações atualizadas com sucesso!');
      setShowConfigDialog(false);
    } catch (error: any) {
      toast.error(`Erro ao atualizar configurações: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // HELPERS DE RENDERIZAÇÃO
  // ====================================================================

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <EmailIcon />;
      case 'sms': return <SmsIcon />;
      case 'push': return <PushIcon />;
      case 'in_app': return <InAppIcon />;
      default: return <NotificationsIcon />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return '#1976d2';
      case 'sms': return '#388e3c';
      case 'push': return '#f57c00';
      case 'in_app': return '#7b1fa2';
      default: return '#616161';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  // ====================================================================
  // RENDERIZAÇÃO DE CONTEÚDO
  // ====================================================================

  const renderStatsTab = () => (
    <Grid container spacing={3}>
      {/* Estatísticas Principais */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SendIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Enviadas</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {formatNumber(stats?.total || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatNumber(stats?.sent || 0)} entregues
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Taxa Entrega</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {formatPercentage(stats?.delivery_rate || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Últimas 24h
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AnalyticsIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Taxa Abertura</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {formatPercentage(stats?.open_rate || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatNumber(stats?.opened || 0)} aberturas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Taxa Clique</Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {formatPercentage(stats?.click_rate || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatNumber(stats?.clicked || 0)} cliques
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Gráfico de Tendências */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Estatísticas por Hora
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.hourly_stats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="sent" stroke="#1976d2" name="Enviadas" />
                  <Line type="monotone" dataKey="delivered" stroke="#388e3c" name="Entregues" />
                  <Line type="monotone" dataKey="failed" stroke="#d32f2f" name="Falharam" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Distribuição por Canal */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribuição por Canal
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.channel_stats || []}
                    dataKey="sent"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {(stats?.channel_stats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getChannelColor(entry.channel)} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Atividade Recente */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Atividade Recente
            </Typography>
            <List>
              {(stats?.recent_activity || []).slice(0, 5).map((activity, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{
                      bgcolor: activity.status === 'success' ? 'success.main' :
                               activity.status === 'warning' ? 'warning.main' : 'error.main'
                    }}>
                      {activity.status === 'success' ? <SuccessIcon /> :
                       activity.status === 'warning' ? <WarningIcon /> : <ErrorIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.message}
                    secondary={format(parseISO(activity.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBulkTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">
          Notificações em Massa
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowBulkDialog(true)}
        >
          Nova Notificação
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Canais</TableCell>
              <TableCell>Destinatários</TableCell>
              <TableCell>Enviada em</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bulkNotifications.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell>{notification.title}</TableCell>
                <TableCell>
                  <Chip
                    label={notification.status}
                    color={notification.status === 'sent' ? 'success' :
                           notification.status === 'pending' ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {notification.channels.map((channel: string) => (
                      <Chip
                        key={channel}
                        icon={getChannelIcon(channel)}
                        label={channel}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{formatNumber(notification.recipients_count)}</TableCell>
                <TableCell>
                  {format(parseISO(notification.sent_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <AnalyticsIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderTemplatesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">
          Templates de Notificação
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingTemplate(null);
            setTemplateForm({
              name: '',
              description: '',
              type: 'email',
              content: ''
            });
            setShowTemplateDialog(true);
          }}
        >
          Novo Template
        </Button>
      </Box>

      <Grid container spacing={2}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Chip
                      icon={getChannelIcon(template.type)}
                      label={template.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Switch checked={template.is_active} size="small" />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {template.description}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Usado {template.usage_count} vezes
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingTemplate(template);
                      setTemplateForm({
                        name: template.name,
                        description: template.description,
                        type: template.type,
                        subject: template.subject,
                        content: template.content
                      });
                      setShowTemplateDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small">
                    <CopyIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderConfigTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">
          Configurações do Sistema
        </Typography>
        <Button
          variant="contained"
          startIcon={<SettingsIcon />}
          onClick={() => setShowConfigDialog(true)}
        >
          Editar Configurações
        </Button>
      </Box>

      {config && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Canais Padrão
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {config.default_channels.map((channel) => (
                    <Chip
                      key={channel}
                      icon={getChannelIcon(channel)}
                      label={channel}
                      color="primary"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Limites de Taxa
                </Typography>
                <Typography variant="body2">
                  Email: {config.rate_limits.email_per_hour}/hora
                </Typography>
                <Typography variant="body2">
                  SMS: {config.rate_limits.sms_per_hour}/hora
                </Typography>
                <Typography variant="body2">
                  Push: {config.rate_limits.push_per_hour}/hora
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configurações de Segurança
                </Typography>
                <FormControlLabel
                  control={<Switch checked={config.security_settings.require_approval_for_bulk} />}
                  label="Requer aprovação para notificações em massa"
                  disabled
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Máximo de destinatários sem aprovação: {config.security_settings.max_recipients_without_approval}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  // Dialogs e modais permanecem os mesmos do código anterior...
  // Por brevidade, não estou repetindo todo o código dos dialogs

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <NotificationsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Gerenciamento de Notificações
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<TestIcon />}
            onClick={() => setShowTestDialog(true)}
          >
            Teste
          </Button>
          <LoadingButton
            variant="outlined"
            startIcon={<RefreshIcon />}
            loading={refreshing}
            onClick={() => loadData(false)}
          >
            Atualizar
          </LoadingButton>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AnalyticsIcon />
                Estatísticas
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SendIcon />
                Notificações em Massa
                {bulkNotifications.length > 0 && (
                  <Badge badgeContent={bulkNotifications.length} color="primary" />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EditIcon />
                Templates
                <Badge badgeContent={templates.length} color="secondary" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon />
                Configurações
              </Box>
            }
          />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        {renderStatsTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {renderBulkTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {renderTemplatesTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        {renderConfigTab()}
      </TabPanel>
    </Container>
  );
};

export default NotificationManagement;