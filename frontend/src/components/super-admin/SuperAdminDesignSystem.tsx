import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSuperAdminStyles } from "@/hooks/useStyleSystem";

// ====================================================================
// SISTEMA DE DESIGN UNIFICADO SUPER ADMIN
// ====================================================================

// Paleta de cores padronizada
export const SUPER_ADMIN_COLORS = {
  primary: 'blue',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  info: 'indigo',
  secondary: 'purple',
  orange: 'orange'
} as const;

export type ColorVariant = keyof typeof SUPER_ADMIN_COLORS;

// Spacing padronizado
export const SPACING = {
  container: 'container mx-auto p-6 space-y-6 max-w-7xl',
  section: 'space-y-6',
  cardContent: 'p-6',
  buttonGroup: 'flex items-center gap-4',
  inlineGap: 'gap-2'
} as const;

// ====================================================================
// LAYOUT PRINCIPAL PADRONIZADO
// ====================================================================

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ 
  children, 
  className 
}) => {
  const { layout } = useSuperAdminStyles();
  
  return (
    <div className={cn(layout, SPACING.container, className)}>
      {children}
    </div>
  );
};

// ====================================================================
// CONTENT WRAPPER PADRONIZADO
// ====================================================================

interface SuperAdminContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SuperAdminContent: React.FC<SuperAdminContentProps> = ({ 
  children, 
  className 
}) => {
  const { content } = useSuperAdminStyles();
  
  return (
    <div className={cn(content, SPACING.section, className)}>
      {children}
    </div>
  );
};

// ====================================================================
// HEADER PADRONIZADO
// ====================================================================

interface SuperAdminHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  statusInfo?: Array<{
    label: string;
    status?: 'online' | 'offline' | 'warning';
    icon?: LucideIcon | 'pulse';
  }>;
  badges?: Array<{
    text: string;
    variant?: 'success' | 'warning' | 'danger' | 'default' | 'secondary' | 'outline';
    icon?: LucideIcon;
  }>;
  actions?: Array<{
    text: string;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
    icon?: LucideIcon;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
  }>;
  filters?: Array<{
    type: 'select';
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
  }>;
}

export const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({
  title,
  subtitle,
  description,
  icon: Icon,
  statusInfo = [],
  badges = [],
  actions = [],
  filters = []
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-white/20 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              {Icon && (
                <div className="p-3 bg-white/80 rounded-xl shadow-sm border border-white/40 backdrop-blur-sm">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                {(subtitle || description) && (
                  <p className="text-gray-600 text-lg mt-2">
                    {subtitle || description}
                  </p>
                )}
              </div>
            </div>
            {statusInfo.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-gray-500 ml-16">
                {statusInfo.map((info, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {info.icon === 'pulse' ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    ) : info.icon ? (
                      <info.icon className="h-4 w-4" />
                    ) : null}
                    {info.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {badges.map((badge, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className={`${
                  badge.variant === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                  badge.variant === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  badge.variant === 'danger' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {badge.icon && <badge.icon className="h-3 w-3 mr-1" />}
                {badge.text}
              </Badge>
            ))}
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
              >
                {action.loading ? (
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : action.icon ? (
                  <action.icon className="h-4 w-4 mr-2" />
                ) : null}
                {action.text}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// CARDS PADRONIZADOS
// ====================================================================

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: ColorVariant;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  color = 'primary',
  trend,
  className
}) => {
  const colorClass = `text-${SUPER_ADMIN_COLORS[color]}-500`;
  
  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-background to-muted/20",
      className
    )}>
      <CardContent className="p-6 text-center">
        <Icon className={cn("h-8 w-8 mx-auto mb-4", colorClass)} />
        <div className="text-2xl font-bold text-foreground mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-sm text-muted-foreground mb-2">{label}</div>
        {trend && (
          <div className={cn(
            "text-xs font-medium flex items-center justify-center gap-1",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
            <span className="text-muted-foreground">vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ContentCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'gradient';
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  description,
  children,
  actions,
  variant = 'default',
  className
}) => {
  const cardClass = variant === 'gradient' 
    ? "bg-gradient-to-br from-background to-muted/20 border-0" 
    : "";

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200",
      cardClass,
      className
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {actions && (
            <div className={SPACING.inlineGap}>
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

// ====================================================================
// BOTÕES DE AÇÃO PADRONIZADOS
// ====================================================================

interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  children,
  className,
  ...props
}) => {
  return (
    <Button className={cn("gap-2", className)} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Button>
  );
};

// ====================================================================
// TABS PADRONIZADOS
// ====================================================================

interface TabData {
  value: string;
  label: string;
  count?: number;
}

interface SuperAdminTabsProps {
  tabs: TabData[];
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export const SuperAdminTabs: React.FC<SuperAdminTabsProps> = ({
  tabs,
  defaultValue,
  children,
  className
}) => {
  return (
    <Tabs defaultValue={defaultValue} className={cn("w-full", className)}>
      <TabsList className={`grid w-full grid-cols-${tabs.length}`}>
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
};

// ====================================================================
// GRID DE ESTATÍSTICAS PADRONIZADO
// ====================================================================

interface StatsGridProps {
  children: React.ReactNode;
  columns?: {
    default: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  columns = { default: 2, md: 4, lg: 6, xl: 7 },
  className
}) => {
  const gridClass = `grid grid-cols-${columns.default} ${columns.md ? `md:grid-cols-${columns.md}` : ''} ${columns.lg ? `lg:grid-cols-${columns.lg}` : ''} ${columns.xl ? `xl:grid-cols-${columns.xl}` : ''} gap-4`;
  
  return (
    <div className={cn(gridClass, className)}>
      {children}
    </div>
  );
};

// ====================================================================
// SEARCH E FILTERS PADRONIZADOS
// ====================================================================

interface SearchFiltersProps {
  children: React.ReactNode;
  className?: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-4 flex-wrap", className)}>
      {children}
    </div>
  );
};

// ====================================================================
// BADGE DE STATUS PADRONIZADO
// ====================================================================

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'warning';
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const variants = {
    active: 'default',
    success: 'default',
    inactive: 'secondary',
    pending: 'outline',
    error: 'destructive',
    warning: 'outline'
  } as const;

  return (
    <Badge variant={variants[status]}>
      {children}
    </Badge>
  );
};

// ====================================================================
// PROGRESS BAR PADRONIZADO
// ====================================================================

interface SuperAdminProgressProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  color?: ColorVariant;
  className?: string;
}

export const SuperAdminProgress: React.FC<SuperAdminProgressProps> = ({
  value,
  label,
  showPercentage = true,
  color = 'primary',
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-foreground">{label}</span>
          {showPercentage && (
            <span className="text-muted-foreground">{value}%</span>
          )}
        </div>
      )}
      <Progress value={value} className="h-2" />
    </div>
  );
};

// ====================================================================
// LOADING STATE PADRONIZADO
// ====================================================================

export const SuperAdminLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3 text-muted-foreground">Carregando...</span>
    </div>
  );
};

// ====================================================================
// EMPTY STATE PADRONIZADO
// ====================================================================

interface SuperAdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const SuperAdminEmptyState: React.FC<SuperAdminEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
};

// ====================================================================
// COMPONENTES GRID E KPI
// ====================================================================

interface SuperAdminKPIGridProps {
  children: React.ReactNode;
  className?: string;
}

export const SuperAdminKPIGrid: React.FC<SuperAdminKPIGridProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", className)}>
      {children}
    </div>
  );
};

interface SuperAdminKPICardProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'orange' | 'indigo' | 'teal' | 'pink' | 'slate';
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
}

export const SuperAdminKPICard: React.FC<SuperAdminKPICardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  variant = 'primary',
  trend
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50',
    success: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50',
    warning: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200/50',
    danger: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200/50',
    purple: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50',
    orange: 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50',
    indigo: 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200/50',
    teal: 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200/50',
    pink: 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200/50',
    slate: 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200/50'
  };

  const iconClasses = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    indigo: 'text-indigo-600',
    teal: 'text-teal-600',
    pink: 'text-pink-600',
    slate: 'text-slate-600'
  };

  const textClasses = {
    primary: 'text-blue-900',
    success: 'text-green-900',
    warning: 'text-yellow-900',
    danger: 'text-red-900',
    purple: 'text-purple-900',
    orange: 'text-orange-900',
    indigo: 'text-indigo-900',
    teal: 'text-teal-900',
    pink: 'text-pink-900',
    slate: 'text-slate-900'
  };

  const titleClasses = {
    primary: 'text-blue-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700',
    purple: 'text-purple-700',
    orange: 'text-orange-700',
    indigo: 'text-indigo-700',
    teal: 'text-teal-700',
    pink: 'text-pink-700',
    slate: 'text-slate-700'
  };

  return (
    <Card className={cn(variantClasses[variant], "hover:shadow-lg transition-all")}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-sm font-medium", titleClasses[variant])}>{title}</p>
            <p className={cn("text-3xl font-bold", textClasses[variant])}>
              {value}
            </p>
            {trend && (
              <p className={cn("text-xs flex items-center gap-1 mt-1", titleClasses[variant])}>
                {trend.direction === 'up' && '↗'}
                {trend.direction === 'down' && '↘'}
                {trend.value} {trend.label}
              </p>
            )}
            {description && (
              <div className="text-xs text-gray-600 mt-1">{description}</div>
            )}
          </div>
          {Icon && (
            <div className="p-2 rounded-lg bg-white/50">
              <Icon className={cn("h-6 w-6", iconClasses[variant])} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ====================================================================
// COMPONENTE SEÇÃO
// ====================================================================

interface SuperAdminSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'warning' | 'success' | 'full-width';
  children: React.ReactNode;
  className?: string;
}

export const SuperAdminSection: React.FC<SuperAdminSectionProps> = ({
  title,
  description,
  icon: Icon,
  variant = 'default',
  children,
  className
}) => {
  return (
    <Card className={cn("mb-8", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
        {description && (
          <CardDescription>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

// ====================================================================
// COMPONENTE ACTION CARD
// ====================================================================

interface SuperAdminActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: 'primary' | 'purple' | 'success';
  onClick: () => void;
}

export const SuperAdminActionCard: React.FC<SuperAdminActionCardProps> = ({
  title,
  description,
  icon: Icon,
  variant = 'primary',
  onClick
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-md',
    purple: 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-md',
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50 hover:shadow-md'
  };

  const iconBgClasses = {
    primary: 'bg-blue-100 group-hover:bg-blue-200',
    purple: 'bg-purple-100 group-hover:bg-purple-200',
    success: 'bg-green-100 group-hover:bg-green-200'
  };

  const iconClasses = {
    primary: 'text-blue-600',
    purple: 'text-purple-600',
    success: 'text-green-600'
  };

  const titleClasses = {
    primary: 'text-blue-900',
    purple: 'text-purple-900',
    success: 'text-green-900'
  };

  const descClasses = {
    primary: 'text-blue-600',
    purple: 'text-purple-600',
    success: 'text-green-600'
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border transition-all group cursor-pointer",
        variantClasses[variant]
      )}
    >
      <div className={cn(
        "flex items-center justify-center p-2 rounded-lg transition-colors shrink-0",
        iconBgClasses[variant]
      )}>
        <Icon className={cn("h-6 w-6 shrink-0", iconClasses[variant])} />
      </div>
      <div>
        <p className={cn("font-semibold", titleClasses[variant])}>{title}</p>
        <p className={cn("text-sm", descClasses[variant])}>{description}</p>
      </div>
    </div>
  );
};

// ====================================================================
// EXPORT DOS COMPONENTES
// ====================================================================

export default {
  Layout: SuperAdminLayout,
  Header: SuperAdminHeader,
  StatCard,
  ContentCard,
  ActionButton,
  Tabs: SuperAdminTabs,
  StatsGrid,
  SearchFilters,
  StatusBadge,
  Progress: SuperAdminProgress,
  Loading: SuperAdminLoading,
  EmptyState: SuperAdminEmptyState,
  COLORS: SUPER_ADMIN_COLORS,
  SPACING
};