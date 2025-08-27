import React from 'react';
import { useAuth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DiagnosticoPermissoes: React.FC = () => {
  const auth = useAuth();

  const testPermissions = [
    'read', 'write', 'delete', 'approve', 'admin',
    'gabinete.access', 'admin.manage', 'system.config'
  ];

  const testPermission = (permission: string) => {
    console.log(`🧪 [TESTE] Testando permissão: ${permission}`);
    const result = auth.hasPermission(permission);
    console.log(`🧪 [TESTE] Resultado para '${permission}': ${result}`);
    return result;
  };

  const logCurrentState = () => {
    console.log(`📊 [DIAGNÓSTICO] Estado completo do auth:`, {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      profile: auth.profile,
      permissions: auth.permissions,
      user: auth.user,
      tenant: auth.tenant,
      error: auth.error
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Diagnóstico de Permissões</h1>
          <p className="text-sm text-muted-foreground">
            Verificação completa do sistema de autenticação e autorização
          </p>
        </div>
        <Button onClick={logCurrentState}>
          Log Estado Completo
        </Button>
      </div>

      {/* Estado de Autenticação */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Autenticação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Autenticado</label>
              <div className="mt-1">
                <Badge variant={auth.isAuthenticated ? "default" : "destructive"}>
                  {auth.isAuthenticated ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Loading</label>
              <div className="mt-1">
                <Badge variant={auth.isLoading ? "secondary" : "outline"}>
                  {auth.isLoading ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <div className="mt-1">
                <Badge variant="outline">
                  {auth.profile?.role || "N/A"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Nome</label>
              <div className="mt-1">
                <Badge variant="outline">
                  {auth.profile?.name || "N/A"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Perfil do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div><strong>ID:</strong> {auth.profile?.id || "N/A"}</div>
            <div><strong>Email:</strong> {auth.profile?.email || "N/A"}</div>
            <div><strong>Role:</strong> {auth.profile?.role || "N/A"}</div>
            <div><strong>Tenant ID:</strong> {auth.profile?.tenant_id || "N/A"}</div>
            <div><strong>Tenant Name:</strong> {auth.profile?.tenant_name || "N/A"}</div>
          </div>
        </CardContent>
      </Card>

      {/* Permissões */}
      <Card>
        <CardHeader>
          <CardTitle>Permissões Carregadas ({auth.permissions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auth.permissions && auth.permissions.length > 0 ? (
              auth.permissions.map((perm, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="secondary">{perm.code || perm.name || JSON.stringify(perm)}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {perm.description || "Sem descrição"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Nenhuma permissão carregada</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teste de Permissões */}
      <Card>
        <CardHeader>
          <CardTitle>Teste de Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {testPermissions.map(permission => {
              const hasPermission = testPermission(permission);
              return (
                <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">{permission}</span>
                  <Badge variant={hasPermission ? "default" : "destructive"}>
                    {hasPermission ? "✅" : "❌"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Funções de Conveniência */}
      <Card>
        <CardHeader>
          <CardTitle>Funções de Conveniência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 border rounded-lg">
              <div className="text-sm font-medium">isAdmin()</div>
              <Badge variant={auth.isAdmin?.() ? "default" : "destructive"}>
                {auth.isAdmin?.() ? "✅" : "❌"}
              </Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-sm font-medium">isSuperAdmin()</div>
              <Badge variant={auth.isSuperAdmin?.() ? "default" : "destructive"}>
                {auth.isSuperAdmin?.() ? "✅" : "❌"}
              </Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-sm font-medium">isManager()</div>
              <Badge variant={auth.isManager?.() ? "default" : "destructive"}>
                {auth.isManager?.() ? "✅" : "❌"}
              </Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-sm font-medium">hasRole('admin')</div>
              <Badge variant={auth.hasRole?.('admin') ? "default" : "destructive"}>
                {auth.hasRole?.('admin') ? "✅" : "❌"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erros */}
      {auth.error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <pre className="text-sm text-red-800">{JSON.stringify(auth.error, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiagnosticoPermissoes;