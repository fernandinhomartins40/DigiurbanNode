import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColumnConfig<T = any> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  className?: string;
  width?: string;
}

export interface ActionConfig<T = any> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  show?: (row: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  title?: string;
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  actions?: ActionConfig<T>[];
  onNew?: () => void;
  newButtonLabel?: string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  title,
  isLoading,
  searchPlaceholder = "Buscar...",
  onSearch,
  actions,
  onNew,
  newButtonLabel = "Novo",
  emptyMessage = "Nenhum item encontrado",
  className
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const getValue = (row: T, key: string): any => {
    return key.split('.').reduce((obj, k) => obj?.[k], row as any);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          {title && <CardTitle>{title}</CardTitle>}
          <div className="flex gap-2">
            {onSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            )}
            {onNew && (
              <Button onClick={onNew} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {newButtonLabel}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead 
                    key={index}
                    className={cn(column.className)}
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </TableHead>
                ))}
                {actions && actions.length > 0 && (
                  <TableHead className="text-right w-24">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column, index) => {
                    const value = getValue(row, column.key as string);
                    return (
                      <TableCell key={index} className={cn(column.className)}>
                        {column.render ? column.render(value, row) : value}
                      </TableCell>
                    );
                  })}
                  {actions && actions.length > 0 && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {actions
                          .filter(action => !action.show || action.show(row))
                          .map((action, actionIndex) => {
                            const Icon = action.icon;
                            return (
                              <Button
                                key={actionIndex}
                                variant={action.variant || "ghost"}
                                size="sm"
                                onClick={() => action.onClick(row)}
                                className={cn("h-8 w-8 p-0", action.className)}
                                title={action.label}
                              >
                                {Icon && <Icon className="h-4 w-4" />}
                              </Button>
                            );
                          })}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Renderizadores comuns para uso nas colunas
export const renderStatus = (status: string, statusConfig?: Record<string, { label: string; variant: any }>) => {
  const config = statusConfig?.[status] || { 
    label: status, 
    variant: 'secondary' as const 
  };
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export const renderDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

export const renderDateTime = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
};

export const renderCurrency = (value: number) => {
  if (value == null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const renderArray = (array: string[], separator = ', ') => {
  if (!array || array.length === 0) return '-';
  return array.join(separator);
};