import React, { useState, useEffect } from 'react';
import { 
  SuperAdminLayout,
  SuperAdminHeader,
  SuperAdminContent,
  SuperAdminKPIGrid,
  SuperAdminKPICard,
  SuperAdminSection
} from "@/components/super-admin/SuperAdminDesignSystem";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { APIClient } from '@/auth';
import { Download, Database, Shield, Code, Zap, HardDrive, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SchemaData {
  metadata: {
    project_ref: string;
    export_format: string;
    filter_applied: string;
    generated_at: string;
  };
  statistics: {
    total_tables: number;
    total_policies: number;
    total_functions: number;
    total_triggers: number;
    total_indexes: number;
    total_buckets: number;
    tables_with_rls: number;
    export_timestamp: string;
  };
  schema: {
    tables?: unknown[];
    policies?: unknown[];
    functions?: unknown[];
    triggers?: unknown[];
    indexes?: unknown[];
    buckets?: unknown[];
    storage_policies?: unknown[];
  };
}

const SchemaManagement: React.FC = () => {
  const [schemaData, setSchemaData] = useState<SchemaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchSchema = async (format = 'json', filter = 'all') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_detailed_schema_info', {
        format_param: format,
        filter_param: filter
      });

      if (error) throw error;
      
      setSchemaData(data);
      toast.success('Schema loaded successfully');
    } catch (error) {
      console.error('Error fetching schema:', error);
      toast.error('Failed to fetch schema');
    } finally {
      setLoading(false);
    }
  };

  const downloadSchema = async (format: string) => {
    try {
      const { data, error } = await supabase.rpc('get_detailed_schema_info', {
        format_param: format,
        filter_param: selectedFilter
      });

      if (error) throw error;

      const blob = new Blob([
        format === 'json' ? JSON.stringify(data, null, 2) : data
      ], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schema-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Schema exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading schema:', error);
      toast.error('Failed to download schema');
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  const filteredTables = schemaData?.schema.tables?.filter(table =>
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredPolicies = schemaData?.schema.policies?.filter(policy =>
    policy.tablename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.policyname.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <SuperAdminLayout>
      <SuperAdminHeader 
        title="Schema Management"
        subtitle="Comprehensive database schema analysis and export"
        icon={Database}
        filters={[
          {
            type: "select",
            value: selectedFilter,
            onChange: setSelectedFilter,
            options: [
              { value: "all", label: "All Components" },
              { value: "tables", label: "Tables Only" },
              { value: "policies", label: "Policies Only" },
              { value: "functions", label: "Functions Only" },
              { value: "triggers", label: "Triggers Only" }
            ]
          }
        ]}
        actions={[
          {
            text: "Refresh",
            variant: "outline",
            icon: RefreshCw,
            onClick: () => fetchSchema(exportFormat, selectedFilter),
            disabled: loading,
            loading: loading
          },
          {
            text: "Export JSON",
            variant: "default",
            icon: Download,
            onClick: () => downloadSchema('json'),
            disabled: !schemaData
          },
          {
            text: "Export CSV",
            variant: "outline",
            icon: Download,
            onClick: () => downloadSchema('csv'),
            disabled: !schemaData
          }
        ]}
      />

      <SuperAdminContent>
        {/* Statistics Overview */}
        {schemaData && (
          <SuperAdminKPIGrid>
            <SuperAdminKPICard
              title="Tables"
              value={schemaData.statistics.total_tables.toString()}
              icon={Database}
              variant="primary"
            />

            <SuperAdminKPICard
              title="RLS Policies"
              value={schemaData.statistics.total_policies.toString()}
              icon={Shield}
              variant="success"
            />

            <SuperAdminKPICard
              title="Functions"
              value={schemaData.statistics.total_functions.toString()}
              icon={Code}
              variant="purple"
            />

            <SuperAdminKPICard
              title="Triggers"
              value={schemaData.statistics.total_triggers.toString()}
              icon={Zap}
              variant="warning"
            />

            <SuperAdminKPICard
              title="Indexes"
              value={schemaData.statistics.total_indexes.toString()}
              icon={HardDrive}
              variant="orange"
            />

            <SuperAdminKPICard
              title="Storage Buckets"
              value={schemaData.statistics.total_buckets.toString()}
              icon={Database}
              variant="indigo"
            />

            <SuperAdminKPICard
              title="RLS Coverage"
              value={`${Math.round((schemaData.statistics.tables_with_rls / schemaData.statistics.total_tables) * 100)}%`}
              icon={Shield}
              variant={schemaData.statistics.tables_with_rls / schemaData.statistics.total_tables > 0.8 ? "success" : "danger"}
            />
          </SuperAdminKPIGrid>
        )}

        {/* Search */}
        <SuperAdminSection title="Search & Filter" description="Find specific database components">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables, policies, functions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </SuperAdminSection>

        {/* Schema Details */}
        {schemaData && (
          <SuperAdminSection 
            title="Database Schema Details" 
            description="Detailed view of all database components"
            variant="full-width"
          >
            <Tabs defaultValue="tables" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="tables">Tables ({filteredTables.length})</TabsTrigger>
            <TabsTrigger value="policies">Policies ({filteredPolicies.length})</TabsTrigger>
            <TabsTrigger value="functions">Functions ({schemaData.schema.functions?.length || 0})</TabsTrigger>
            <TabsTrigger value="triggers">Triggers ({schemaData.schema.triggers?.length || 0})</TabsTrigger>
            <TabsTrigger value="indexes">Indexes ({schemaData.schema.indexes?.length || 0})</TabsTrigger>
            <TabsTrigger value="storage">Storage ({schemaData.schema.buckets?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="tables" className="space-y-4">
            <div className="grid gap-4">
              {filteredTables.map((table) => (
                <Card key={table.table_name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{table.table_name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={table.table_type === 'BASE TABLE' ? 'default' : 'secondary'}>
                          {table.table_type}
                        </Badge>
                        <Badge variant={
                          schemaData.schema.policies?.some(p => p.tablename === table.table_name) 
                            ? 'default' : 'destructive'
                        }>
                          {schemaData.schema.policies?.some(p => p.tablename === table.table_name) 
                            ? 'RLS Enabled' : 'No RLS'
                          }
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {table.columns?.length || 0} columns
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                        {table.columns?.slice(0, 6).map((col: any) => (
                          <div key={col.column_name} className="flex items-center gap-2">
                            <span className="font-medium">{col.column_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {col.data_type}
                            </Badge>
                          </div>
                        ))}
                        {table.columns?.length > 6 && (
                          <div className="text-muted-foreground">
                            +{table.columns.length - 6} more columns
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <div className="grid gap-4">
              {filteredPolicies.map((policy) => (
                <Card key={`${policy.tablename}-${policy.policyname}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{policy.policyname}</CardTitle>
                      <div className="flex gap-2">
                        <Badge>{policy.tablename}</Badge>
                        <Badge variant="outline">{policy.cmd}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {policy.qual && (
                        <div>
                          <span className="font-medium">Condition:</span>
                          <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                            {policy.qual}
                          </code>
                        </div>
                      )}
                      {policy.with_check && (
                        <div>
                          <span className="font-medium">Check:</span>
                          <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                            {policy.with_check}
                          </code>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="functions" className="space-y-4">
            <div className="grid gap-4">
              {schemaData.schema.functions?.map((func) => (
                <Card key={func.function_name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{func.function_name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge>{func.language}</Badge>
                        <Badge variant="outline">{func.security_type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Returns:</span>
                        <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                          {func.return_type}
                        </code>
                      </div>
                      {func.arguments && (
                        <div>
                          <span className="font-medium">Arguments:</span>
                          <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                            {func.arguments}
                          </code>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="triggers" className="space-y-4">
            <div className="grid gap-4">
              {schemaData.schema.triggers?.map((trigger) => (
                <Card key={`${trigger.table_name}-${trigger.trigger_name}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{trigger.trigger_name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge>{trigger.table_name}</Badge>
                        <Badge variant="outline">{trigger.event}</Badge>
                        <Badge variant="secondary">{trigger.action_timing}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="font-medium">Action:</span>
                      <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                        {trigger.action_statement}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="indexes" className="space-y-4">
            <div className="grid gap-4">
              {schemaData.schema.indexes?.map((index) => (
                <Card key={index.indexname}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{index.indexname}</CardTitle>
                      <Badge>{index.tablename}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {index.indexdef}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <div className="grid gap-4">
              {schemaData.schema.buckets?.map((bucket) => (
                <Card key={bucket.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{bucket.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={bucket.public ? 'default' : 'secondary'}>
                          {bucket.public ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>Created: {new Date(bucket.created_at).toLocaleDateString()}</div>
                      <div>Updated: {new Date(bucket.updated_at).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
            </Tabs>
          </SuperAdminSection>
        )}
      </SuperAdminContent>
    </SuperAdminLayout>
  );
};

export default SchemaManagement;