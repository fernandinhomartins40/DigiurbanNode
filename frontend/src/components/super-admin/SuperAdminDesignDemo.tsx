import React from 'react';
import { 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  Search
} from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import SuperAdminDesignSystem from './SuperAdminDesignSystem';

const {
  Layout,
  Header,
  StatCard,
  ContentCard,
  ActionButton,
  Tabs,
  StatsGrid,
  SearchFilters,
  StatusBadge,
  Progress,
  COLORS
} = SuperAdminDesignSystem;

// ====================================================================
// DEMO DO DESIGN SYSTEM UNIFICADO
// ====================================================================

const SuperAdminDesignDemo: React.FC = () => {
  // Dados de exemplo
  const stats = [
    { icon: Users, value: 1247, label: 'Total Users', color: 'primary' as const, trend: { value: 12.5, isPositive: true } },
    { icon: Building2, value: 47, label: 'Active Tenants', color: 'success' as const, trend: { value: 8.2, isPositive: true } },
    { icon: DollarSign, value: 'R$ 89.750', label: 'MRR', color: 'warning' as const, trend: { value: 15.3, isPositive: true } },
    { icon: TrendingUp, value: '94.2%', label: 'Uptime', color: 'info' as const, trend: { value: -0.5, isPositive: false } },
    { icon: Activity, value: 15234, label: 'API Calls', color: 'secondary' as const, trend: { value: 23.1, isPositive: true } },
    { icon: AlertTriangle, value: 3, label: 'Active Alerts', color: 'danger' as const },
  ];

  const tabs = [
    { value: 'overview', label: 'Overview', count: 12 },
    { value: 'metrics', label: 'Metrics', count: 8 },
    { value: 'alerts', label: 'Alerts', count: 3 },
    { value: 'reports', label: 'Reports' }
  ];

  return (
    <Layout>
      {/* Header Padronizado */}
      <Header
        title="Super Admin Dashboard"
        description="Comprehensive system overview and management tools"
        badge={{ text: 'Live', variant: 'outline' }}
        actions={
          <>
            <ActionButton icon={RefreshCw} variant="outline">
              Refresh
            </ActionButton>
            <ActionButton icon={Download}>
              Export
            </ActionButton>
            <ActionButton icon={Settings} variant="outline">
              Settings
            </ActionButton>
          </>
        }
      />

      {/* Grid de Estatísticas Padronizado */}
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </StatsGrid>

      {/* Filtros de Pesquisa Padronizados */}
      <SearchFilters>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search everything..."
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </SearchFilters>

      {/* Tabs Padronizados */}
      <Tabs tabs={tabs} defaultValue="overview">
        <div className="space-y-6">
          {/* Overview Tab */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentCard
              title="System Health"
              description="Real-time system status and performance"
              actions={
                <ActionButton size="sm" variant="outline">
                  View Details
                </ActionButton>
              }
            >
              <div className="space-y-4">
                <Progress value={94} label="CPU Usage" />
                <Progress value={67} label="Memory Usage" />
                <Progress value={45} label="Disk Usage" />
                <Progress value={23} label="Network I/O" />
              </div>
            </ContentCard>

            <ContentCard
              title="Recent Activity"
              description="Latest system events and notifications"
              variant="gradient"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">New tenant created</div>
                    <div className="text-sm text-muted-foreground">Prefeitura de São Paulo</div>
                  </div>
                  <StatusBadge status="success">Active</StatusBadge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Payment processed</div>
                    <div className="text-sm text-muted-foreground">R$ 4.500,00</div>
                  </div>
                  <StatusBadge status="success">Completed</StatusBadge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">System alert</div>
                    <div className="text-sm text-muted-foreground">High CPU usage detected</div>
                  </div>
                  <StatusBadge status="warning">Warning</StatusBadge>
                </div>
              </div>
            </ContentCard>
          </div>

          {/* Performance Metrics */}
          <ContentCard
            title="Performance Overview"
            description="Key performance indicators and trends"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Response Time</div>
                <div className="text-2xl font-bold">245ms</div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  -15% vs last month
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Error Rate</div>
                <div className="text-2xl font-bold">0.02%</div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  -45% vs last month
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Throughput</div>
                <div className="text-2xl font-bold">1.2k req/s</div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +23% vs last month
                </div>
              </div>
            </div>
          </ContentCard>
        </div>
      </Tabs>
    </Layout>
  );
};

export default SuperAdminDesignDemo;