import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth';
import { APIClient } from '@/auth';
import {
  Mail,
  Server,
  Globe,
  Users,
  Shield,
  Activity,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  Zap,
  Calendar,
  BarChart3,
  Settings,
  Database,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  SuperAdminHeader,
  SuperAdminContent,
  SuperAdminKPIGrid,
  SuperAdminKPICard,
  SuperAdminSection,
  SuperAdminActionCard
} from "@/components/super-admin/SuperAdminDesignSystem";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

interface EmailServerStats {
  isRunning: boolean;
  ports: {
    mx: number;
    submission: number;
  };
  stats: {
    totalConnections: number;
    todayEmails: number;
    activeSmtpUsers: number;
  };
}

interface EmailDomain {
  id: string;
  domainName: string;
  isVerified: boolean;
  verifiedAt: string | null;
  dkimEnabled: boolean;
  spfEnabled: boolean;
  smtpUser: {
    email: string;
    name: string;
  };
  tenant: {
    nome: string;
    tenantCode: string;
  } | null;
  emailsCount: number;
  hasActiveDkim: boolean;
  createdAt: string;
}

interface SmtpUser {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin: string | null;
  linkedUser: {
    id: string;
    nomeCompleto: string;
    email: string;
  } | null;
  domainsCount: number;
  createdAt: string;
}

interface EmailStats {
  totalDomains: number;
  activeDomains: number;
  totalUsers: number;
  activeUsers: number;
  dailyEmails: number;
  weeklyEmails: number;
  monthlyEmails: number;
  bounceRate: number;
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const EmailManagement: React.FC = () => {
  const { profile: user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [serverStats, setServerStats] = useState<EmailServerStats | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [smtpUsers, setSmtpUsers] = useState<SmtpUser[]>([]);
  const [showCreateDomain, setShowCreateDomain] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState<{[key: string]: boolean}>({});

  // Estados do formulário de domínio
  const [newDomain, setNewDomain] = useState({
    domainName: '',
    smtpUserId: '',
    tenantId: ''
  });

  // Estados do formulário de usuário SMTP
  const [newSmtpUser, setNewSmtpUser] = useState({
    email: '',
    password: '',
    name: '',
    userId: ''
  });

  // ====================================================================
  // FUNÇÕES DE CARREGAMENTO
  // ====================================================================

  const loadServerStats = async () => {
    try {
      const response = await APIClient.get('/emails/server-stats');
      setServerStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do servidor:', error);
    }
  };

  const loadEmailStats = async () => {
    try {
      const response = await APIClient.get('/emails/stats');
      setEmailStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de email:', error);
    }
  };

  const loadDomains = async () => {
    try {
      const response = await APIClient.get('/emails/domains');
      setDomains(response.data.domains || []);
    } catch (error) {
      console.error('Erro ao carregar domínios:', error);
    }
  };

  const loadSmtpUsers = async () => {
    try {
      const response = await APIClient.get('/emails/smtp-users');
      setSmtpUsers(response.data.users || []);
    } catch (error) {
      console.error('Erro ao carregar usuários SMTP:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadServerStats(),
        loadEmailStats(),
        loadDomains(),
        loadSmtpUsers()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // FUNÇÕES DE CRUD
  // ====================================================================

  const createDomain = async () => {
    try {
      setLoading(true);
      await APIClient.post('/emails/domains', newDomain);
      setNewDomain({ domainName: '', smtpUserId: '', tenantId: '' });
      setShowCreateDomain(false);
      await loadDomains();
    } catch (error) {
      console.error('Erro ao criar domínio:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSmtpUser = async () => {
    try {
      setLoading(true);
      await APIClient.post('/emails/smtp-users', newSmtpUser);
      setNewSmtpUser({ email: '', password: '', name: '', userId: '' });
      setShowCreateUser(false);
      await loadSmtpUsers();
    } catch (error) {
      console.error('Erro ao criar usuário SMTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserPasswordVisibility = (userId: string) => {
    setShowUserPassword(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // ====================================================================
  // EFFECTS
  // ====================================================================

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadAllData();
    }
  }, [user]);

  // ====================================================================
  // FUNÇÕES DE FORMATAÇÃO
  // ====================================================================

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // ====================================================================
  // RENDER
  // ====================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Carregando sistema de email...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SuperAdminHeader
        title="Gestão de Email"
        subtitle="Sistema UltraZend SMTP integrado • Domínios e usuários"
        icon={Mail}
        statusInfo={[
          {
            label: serverStats?.isRunning ? "SMTP Online" : "SMTP Offline",
            status: serverStats?.isRunning ? "online" : "offline",
            icon: "pulse"
          },
          { label: "Atualizado há 1 min", icon: Calendar }
        ]}
        badges={[
          { text: "UltraZend", variant: "success", icon: Zap },
          { text: `${serverStats?.ports.mx}/MX`, variant: "secondary" },
          { text: `${serverStats?.ports.submission}/Sub`, variant: "secondary" }
        ]}
        actions={[
          {
            text: "Atualizar",
            variant: "outline",
            icon: RefreshCw,
            onClick: loadAllData,
            loading: loading
          }
        ]}
      />

      <SuperAdminContent>

        {/* KPIs do Sistema de Email */}
        <SuperAdminKPIGrid>

          {/* Status do Servidor */}
          <SuperAdminKPICard
            title="Servidor SMTP"
            value={serverStats?.isRunning ? "Online" : "Offline"}
            description="Status do UltraZend Server"
            trend={{
              value: serverStats?.isRunning ? "Operacional" : "Inativo",
              direction: serverStats?.isRunning ? "up" : "down",
              label: ""
            }}
            icon={Server}
            variant={serverStats?.isRunning ? "success" : "destructive"}
          />

          {/* Total de Domínios */}
          <SuperAdminKPICard
            title="Domínios Ativos"
            value={emailStats?.activeDomains?.toString() || "0"}
            description={`${emailStats?.totalDomains || 0} total`}
            trend={{
              value: `${emailStats?.activeDomains || 0} verificados`,
              direction: "neutral"
            }}
            icon={Globe}
            variant="primary"
          />

          {/* Usuários SMTP */}
          <SuperAdminKPICard
            title="Usuários SMTP"
            value={emailStats?.activeUsers?.toString() || "0"}
            description={`${emailStats?.totalUsers || 0} total`}
            trend={{
              value: `${serverStats?.stats.activeSmtpUsers || 0} ativos`,
              direction: "up"
            }}
            icon={Users}
            variant="indigo"
          />

          {/* Emails Hoje */}
          <SuperAdminKPICard
            title="Emails Hoje"
            value={serverStats?.stats.todayEmails?.toString() || "0"}
            description="Processados hoje"
            trend={{
              value: `${emailStats?.dailyEmails || 0} enviados`,
              direction: "up"
            }}
            icon={Mail}
            variant="teal"
          />

          {/* Conexões Totais */}
          <SuperAdminKPICard
            title="Conexões SMTP"
            value={serverStats?.stats.totalConnections?.toString() || "0"}
            description="Total de conexões"
            trend={{
              value: "Histórico completo",
              direction: "neutral"
            }}
            icon={Activity}
            variant="purple"
          />

          {/* Taxa de Bounce */}
          <SuperAdminKPICard
            title="Taxa de Bounce"
            value={formatPercentage(emailStats?.bounceRate || 0)}
            description="Taxa de rejeição"
            trend={{
              value: "Abaixo de 5% ideal",
              direction: emailStats?.bounceRate && emailStats.bounceRate < 5 ? "down" : "up"
            }}
            icon={Shield}
            variant={emailStats?.bounceRate && emailStats.bounceRate < 5 ? "success" : "warning"}
          />

        </SuperAdminKPIGrid>

        {/* Gestão de Domínios */}
        <SuperAdminSection
          title={`Domínios de Email (${domains.length})`}
          description="Gestão de domínios autorizados para envio"
          icon={Globe}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Badge variant="secondary">{domains.filter(d => d.isVerified).length} verificados</Badge>
              <Badge variant="outline">{domains.filter(d => d.dkimEnabled).length} com DKIM</Badge>
            </div>

            <Dialog open={showCreateDomain} onOpenChange={setShowCreateDomain}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Domínio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Domínio</DialogTitle>
                  <DialogDescription>
                    Configure um novo domínio para envio de emails
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="domainName">Nome do Domínio</Label>
                    <Input
                      id="domainName"
                      placeholder="exemplo.com.br"
                      value={newDomain.domainName}
                      onChange={(e) => setNewDomain({...newDomain, domainName: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtpUserId">Usuário SMTP</Label>
                    <Select value={newDomain.smtpUserId} onValueChange={(value) => setNewDomain({...newDomain, smtpUserId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário SMTP" />
                      </SelectTrigger>
                      <SelectContent>
                        {smtpUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantId">Tenant (Opcional)</Label>
                    <Input
                      id="tenantId"
                      placeholder="UUID do tenant"
                      value={newDomain.tenantId}
                      onChange={(e) => setNewDomain({...newDomain, tenantId: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDomain(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createDomain} disabled={!newDomain.domainName || !newDomain.smtpUserId}>
                    Criar Domínio
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domínio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SMTP User</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Emails</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">{domain.domainName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {domain.isVerified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <X className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                        {domain.dkimEnabled && (
                          <Badge variant="outline" className="text-xs">DKIM</Badge>
                        )}
                        {domain.spfEnabled && (
                          <Badge variant="outline" className="text-xs">SPF</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{domain.smtpUser.name}</p>
                        <p className="text-xs text-gray-500">{domain.smtpUser.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {domain.tenant ? (
                        <div>
                          <p className="font-medium text-sm">{domain.tenant.nome}</p>
                          <p className="text-xs text-gray-500">{domain.tenant.tenantCode}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Global</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{domain.emailsCount}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(domain.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SuperAdminSection>

        {/* Gestão de Usuários SMTP */}
        <SuperAdminSection
          title={`Usuários SMTP (${smtpUsers.length})`}
          description="Gestão de credenciais de autenticação SMTP"
          icon={Users}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Badge variant="secondary">{smtpUsers.filter(u => u.isActive).length} ativos</Badge>
              <Badge variant="outline">{smtpUsers.filter(u => u.isVerified).length} verificados</Badge>
            </div>

            <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Usuário SMTP
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Usuário SMTP</DialogTitle>
                  <DialogDescription>
                    Configure um novo usuário para autenticação SMTP
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@exemplo.com"
                      value={newSmtpUser.email}
                      onChange={(e) => setNewSmtpUser({...newSmtpUser, email: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Senha segura"
                      value={newSmtpUser.password}
                      onChange={(e) => setNewSmtpUser({...newSmtpUser, password: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      placeholder="Nome do usuário"
                      value={newSmtpUser.name}
                      onChange={(e) => setNewSmtpUser({...newSmtpUser, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="userId">Usuário Vinculado (UUID)</Label>
                    <Input
                      id="userId"
                      placeholder="UUID do usuário do sistema"
                      value={newSmtpUser.userId}
                      onChange={(e) => setNewSmtpUser({...newSmtpUser, userId: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={createSmtpUser}
                    disabled={!newSmtpUser.email || !newSmtpUser.password || !newSmtpUser.name}
                  >
                    Criar Usuário
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Domínios</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {smtpUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        {user.linkedUser && (
                          <p className="text-xs text-gray-500">
                            Vinculado: {user.linkedUser.nomeCompleto}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.isActive ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <X className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                        {user.isVerified && (
                          <Badge variant="outline" className="text-xs">Verificado</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.domainsCount}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserPasswordVisibility(user.id)}
                        >
                          {showUserPassword[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SuperAdminSection>

        {/* Ações Rápidas */}
        <SuperAdminSection
          title="Ações do Sistema"
          description="Operações avançadas do servidor de email"
          icon={Settings}
          variant="primary"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SuperAdminActionCard
              title="Health Check"
              description="Verificar saúde do sistema"
              icon={Activity}
              variant="success"
              onClick={() => {
                // Implementar health check
                console.log('Health check...');
              }}
            />

            <SuperAdminActionCard
              title="Conexões SMTP"
              description="Monitorar conexões ativas"
              icon={Database}
              variant="indigo"
              onClick={() => {
                // Implementar visualização de conexões
                console.log('Ver conexões...');
              }}
            />

            <SuperAdminActionCard
              title="Logs do Sistema"
              description="Auditoria e logs"
              icon={BarChart3}
              variant="purple"
              onClick={() => {
                // Implementar visualização de logs
                console.log('Ver logs...');
              }}
            />
          </div>
        </SuperAdminSection>

      </SuperAdminContent>
    </>
  );
};

export default EmailManagement;