import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth';
import { usePermissions } from '@/contexts/PermissionsContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DiagnosticData {
  authUser: any;
  profile: any;
  permissions: unknown[];
  rawUserData: any;
  viewCompatibility: any;
  rlsTest: any;
}

const DiagnosticoPermissoes: React.FC = () => {
  const auth = useAuth();
  const perms = usePermissions();
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);

    try {
      const results: DiagnosticData = {
        authUser: null,
        profile: null,
        permissions: [],
        rawUserData: null,
        viewCompatibility: null,
        rlsTest: null
      };

      // 1. Dados do Auth
      const { data: authData } = await supabase.auth.getUser();
      results.authUser = authData.user;

      // 2. Dados do perfil atual
      results.profile = auth.profile;
      results.permissions = auth.permissions;

      if (authData.user) {
        // 3. Dados brutos da tabela user_profiles
        const { data: rawUser, error: rawError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (rawError) {
          console.error('Erro ao buscar dados brutos:', rawError);
        } else {
          results.rawUserData = rawUser;
        }

        // 4. Teste da view de compatibilidade
        const { data: viewData, error: viewError } = await supabase
          .from('user_profiles_with_role')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (viewError) {
          console.error('Erro na view de compatibilidade:', viewError);
          results.viewCompatibility = { error: viewError.message };
        } else {
          results.viewCompatibility = viewData;
        }

        // 5. Teste básico de RLS - tentar acessar outros usuários
        const { data: rlsData, error: rlsError } = await supabase
          .from('user_profiles')
          .select('id, nome_completo, tipo_usuario')
          .limit(5);

        if (rlsError) {
          results.rlsTest = { error: rlsError.message };
        } else {
          results.rlsTest = { count: rlsData?.length || 0, data: rlsData };
        }
      }

      setDiagnosticData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      runDiagnostic();
    }
  }, [auth.isAuthenticated]);

  const getStatusBadge = (condition: boolean, label: string) => (
    <Badge variant={condition ? "default" : "destructive"}>
      {condition ? '✅' : '❌'} {label}
    </Badge>
  );

  if (!auth.isAuthenticated) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Diagnóstico de Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Usuário não autenticado. Faça login para executar o diagnóstico.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Diagnóstico de Permissões - Admin Panel</CardTitle>
          <Button onClick={runDiagnostic} disabled={loading}>
            {loading ? 'Diagnosticando...' : 'Atualizar Diagnóstico'}
          </Button>
        </CardHeader>
      </Card>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-600">
              <strong>Erro:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {diagnosticData && (
        <>
          {/* Status Geral */}
          <Card>
            <CardHeader>
              <CardTitle>Status Geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(auth.isAuthenticated, 'Autenticado')}
                {getStatusBadge(auth.profile?.role === 'admin', 'Role Admin')}
                {getStatusBadge(auth.isAdmin(), 'isAdmin()')}
                {getStatusBadge(auth.profile?.status === 'ativo', 'Status Ativo')}
                {getStatusBadge(!!auth.profile?.tenant_id, 'Tem Tenant')}
                {getStatusBadge(auth.permissions.length > 0, 'Tem Permissões')}
              </div>
            </CardContent>
          </Card>

          {/* Dados do Usuário */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Auth (Frontend)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {auth.profile?.id}</div>
                  <div><strong>Email:</strong> {auth.profile?.email}</div>
                  <div><strong>Nome:</strong> {auth.profile?.name}</div>
                  <div><strong>Role:</strong> {auth.profile?.role}</div>
                  <div><strong>Tenant ID:</strong> {auth.profile?.tenant_id}</div>
                  <div><strong>Status:</strong> {auth.profile?.status}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados Brutos (Database)</CardTitle>
              </CardHeader>
              <CardContent>
                {diagnosticData.rawUserData ? (
                  <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> {diagnosticData.rawUserData.id}</div>
                    <div><strong>Email:</strong> {diagnosticData.rawUserData.email}</div>
                    <div><strong>Nome:</strong> {diagnosticData.rawUserData.nome_completo}</div>
                    <div><strong>Tipo Usuario:</strong> {diagnosticData.rawUserData.tipo_usuario}</div>
                    <div><strong>Cargo:</strong> {diagnosticData.rawUserData.cargo}</div>
                    <div><strong>Tenant ID:</strong> {diagnosticData.rawUserData.tenant_id}</div>
                    <div><strong>Status:</strong> {diagnosticData.rawUserData.status}</div>
                    <div><strong>Primeiro Acesso:</strong> {diagnosticData.rawUserData.primeiro_acesso ? 'Sim' : 'Não'}</div>
                  </div>
                ) : (
                  <div className="text-red-600">Erro ao carregar dados brutos</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* View de Compatibilidade */}
          <Card>
            <CardHeader>
              <CardTitle>View de Compatibilidade (user_profiles_with_role)</CardTitle>
            </CardHeader>
            <CardContent>
              {diagnosticData.viewCompatibility?.error ? (
                <div className="text-red-600">
                  <strong>Erro:</strong> {diagnosticData.viewCompatibility.error}
                </div>
              ) : diagnosticData.viewCompatibility ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Role:</strong> {diagnosticData.viewCompatibility.role}</div>
                  <div><strong>Hierarchy Level:</strong> {diagnosticData.viewCompatibility.hierarchy_level}</div>
                  <div><strong>Tipo Usuario Original:</strong> {diagnosticData.viewCompatibility.tipo_usuario}</div>
                </div>
              ) : (
                <div className="text-yellow-600">View não acessível</div>
              )}
            </CardContent>
          </Card>

          {/* Teste RLS */}
          <Card>
            <CardHeader>
              <CardTitle>Teste RLS (Row Level Security)</CardTitle>
            </CardHeader>
            <CardContent>
              {diagnosticData.rlsTest?.error ? (
                <div className="text-red-600">
                  <strong>Erro RLS:</strong> {diagnosticData.rlsTest.error}
                </div>
              ) : (
                <div className="space-y-2">
                  <div><strong>Usuários acessíveis:</strong> {diagnosticData.rlsTest.count}</div>
                  {diagnosticData.rlsTest.data && (
                    <div className="space-y-1 text-sm">
                      {diagnosticData.rlsTest.data.map((user: any, index: number) => (
                        <div key={index}>
                          {user.nome_completo} ({user.tipo_usuario})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métodos de Verificação */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Verificação de Permissão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Métodos Hierárquicos:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>isSuperAdmin(): {auth.isSuperAdmin() ? '✅' : '❌'}</li>
                    <li>isAdmin(): {auth.isAdmin() ? '✅' : '❌'}</li>
                    <li>isManager(): {auth.isManager?.() ? '✅' : '❌'}</li>
                    <li>isCoordinator(): {auth.isCoordinator?.() ? '✅' : '❌'}</li>
                    <li>isUser(): {auth.isUser?.() ? '✅' : '❌'}</li>
                  </ul>
                </div>
                <div>
                  <strong>Métodos de Permissão:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>hasPermission('manage_users'): {auth.hasPermission('manage_users') ? '✅' : '❌'}</li>
                    <li>canAccess('users', 'read'): {auth.canAccess('users', 'read') ? '✅' : '❌'}</li>
                    <li>canAccess('system', 'manage'): {auth.canAccess('system', 'manage') ? '✅' : '❌'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissões Atuais */}
          <Card>
            <CardHeader>
              <CardTitle>Permissões Atuais ({auth.permissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {auth.permissions.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  {auth.permissions.map((perm, index) => (
                    <div key={index} className="p-2 bg-gray-100 rounded">
                      <div><strong>Code:</strong> {perm.code}</div>
                      <div><strong>Resource:</strong> {perm.resource}</div>
                      <div><strong>Action:</strong> {perm.action}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-yellow-600">Nenhuma permissão específica encontrada</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DiagnosticoPermissoes;