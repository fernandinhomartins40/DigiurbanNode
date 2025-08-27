// ====================================================================
// 📖 EXEMPLOS DE USO - DIGIURBAN JWT SYSTEM
// ====================================================================
// Exemplos práticos de como usar o sistema de autenticação
// Demonstra todas as funcionalidades principais
// ====================================================================

import React, { useState } from 'react';
import { useAuth, authHelpers, HTTPInterceptor, AuthCacheHelpers } from '../index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ====================================================================
// COMPONENTE DE EXEMPLOS
// ====================================================================

export const AuthExamples: React.FC = () => {
  const { 
    isAuthenticated, 
    user, 
    profile, 
    hasPermission, 
    isAdmin, 
    isSuperAdmin,
    login,
    logout
  } = useAuth();

  const [testEmail, setTestEmail] = useState('admin@exemplo.com');
  const [testPassword, setTestPassword] = useState('123456');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // ====================================================================
  // EXEMPLOS DE VALIDAÇÃO
  // ====================================================================

  const testValidators = () => {
    const emailResult = authHelpers.validateEmail(testEmail);
    const passwordResult = authHelpers.validatePassword(testPassword);
    const nameResult = authHelpers.validateFullName('João Silva');
    const cpfResult = authHelpers.validateCPF('123.456.789-01');

    addResult(`Email válido: ${emailResult.isValid}`);
    addResult(`Senha válida: ${passwordResult.isValid} (${passwordResult.strength})`);
    addResult(`Nome válido: ${nameResult.isValid}`);
    addResult(`CPF válido: ${cpfResult.isValid}`);
  };

  // ====================================================================
  // EXEMPLOS DE FORMATAÇÃO
  // ====================================================================

  const testFormatters = () => {
    const cpf = authHelpers.formatCPF('12345678901');
    const phone = authHelpers.formatPhone('11999887766');
    
    addResult(`CPF formatado: ${cpf}`);
    addResult(`Telefone formatado: ${phone}`);
  };

  // ====================================================================
  // EXEMPLOS DE HIERARQUIA
  // ====================================================================

  const testHierarchy = () => {
    if (!profile) {
      addResult('Usuário não autenticado');
      return;
    }

    const level = authHelpers.getUserLevel(profile.role);
    const canManageUser = authHelpers.canManageUser(profile.role, 'user');
    const initials = authHelpers.getInitials(profile.name);
    const displayName = authHelpers.getDisplayName(profile);
    const roleColor = authHelpers.getRoleColor(profile.role);

    addResult(`Nível hierárquico: ${level}`);
    addResult(`Pode gerenciar usuários: ${canManageUser}`);
    addResult(`Iniciais: ${initials}`);
    addResult(`Nome de exibição: ${displayName}`);
    addResult(`Cor do role: ${roleColor}`);
  };

  // ====================================================================
  // EXEMPLOS DE CACHE
  // ====================================================================

  const testCache = () => {
    // Testar cache
    AuthCacheHelpers.setUserProfile('test-user', { name: 'Teste', role: 'user' });
    const cachedProfile = AuthCacheHelpers.getUserProfile('test-user');
    const stats = AuthCacheHelpers.getStats();

    addResult(`Profile do cache: ${cachedProfile?.name}`);
    addResult(`Estatísticas do cache: ${stats.size} itens, ${stats.hitRate.toFixed(1)}% hit rate`);
  };

  // ====================================================================
  // EXEMPLOS DE INTERCEPTOR
  // ====================================================================

  const testInterceptor = () => {
    const stats = HTTPInterceptor.getStats();
    
    addResult(`Interceptor instalado: ${stats.installed}`);
    addResult(`Fazendo refresh: ${stats.isRefreshing}`);
    addResult(`Tem token: ${stats.hasToken}`);
  };

  // ====================================================================
  // EXEMPLO DE LOGIN
  // ====================================================================

  const testLogin = async () => {
    try {
      await login({ email: testEmail, password: testPassword });
      addResult('Login realizado com sucesso!');
    } catch (error) {
      addResult(`Erro no login: ${error}`);
    }
  };

  // ====================================================================
  // RENDER
  // ====================================================================

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Exemplos do Sistema de Autenticação</h1>
        <p className="text-gray-600 mt-2">Demonstrações práticas das funcionalidades</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Autenticado:</span>
              <Badge variant={isAuthenticated ? "success" : "secondary"}>
                {isAuthenticated ? 'Sim' : 'Não'}
              </Badge>
            </div>
            
            {profile && (
              <>
                <div className="flex items-center justify-between">
                  <span>Nome:</span>
                  <span className="text-sm">{authHelpers.getDisplayName(profile)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Role:</span>
                  <Badge className={authHelpers.getRoleColor(profile.role)}>
                    {authHelpers.getRoleDescription(profile.role)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Nível:</span>
                  <span>{authHelpers.getUserLevel(profile.role)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Admin:</span>
                  <Badge variant={isAdmin() ? "success" : "secondary"}>
                    {isAdmin() ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Super Admin:</span>
                  <Badge variant={isSuperAdmin() ? "success" : "secondary"}>
                    {isSuperAdmin() ? 'Sim' : 'Não'}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Testes de Login */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              {!isAuthenticated ? (
                <Button onClick={testLogin} className="w-full">
                  Fazer Login
                </Button>
              ) : (
                <Button onClick={logout} variant="outline" className="w-full">
                  Fazer Logout
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissões */}
        <Card>
          <CardHeader>
            <CardTitle>Verificação de Permissões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>read_public:</span>
              <Badge variant={hasPermission('read_public') ? "success" : "secondary"}>
                {hasPermission('read_public') ? 'Permitido' : 'Negado'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>manage_users:</span>
              <Badge variant={hasPermission('manage_users') ? "success" : "secondary"}>
                {hasPermission('manage_users') ? 'Permitido' : 'Negado'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>system_config:</span>
              <Badge variant={hasPermission('system_config') ? "success" : "secondary"}>
                {hasPermission('system_config') ? 'Permitido' : 'Negado'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>all:</span>
              <Badge variant={hasPermission('all') ? "success" : "secondary"}>
                {hasPermission('all') ? 'Permitido' : 'Negado'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testes de Funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle>Testes de Funcionalidades</CardTitle>
          <CardDescription>
            Teste as diferentes funcionalidades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="validators">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="validators">Validadores</TabsTrigger>
              <TabsTrigger value="formatters">Formatadores</TabsTrigger>
              <TabsTrigger value="hierarchy">Hierarquia</TabsTrigger>
              <TabsTrigger value="cache">Cache</TabsTrigger>
              <TabsTrigger value="interceptor">Interceptor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="validators" className="space-y-4">
              <Button onClick={testValidators}>Testar Validadores</Button>
              <p className="text-sm text-gray-600">
                Testa validação de email, senha, nome e CPF
              </p>
            </TabsContent>
            
            <TabsContent value="formatters" className="space-y-4">
              <Button onClick={testFormatters}>Testar Formatadores</Button>
              <p className="text-sm text-gray-600">
                Testa formatação de CPF e telefone
              </p>
            </TabsContent>
            
            <TabsContent value="hierarchy" className="space-y-4">
              <Button onClick={testHierarchy} disabled={!isAuthenticated}>
                Testar Hierarquia
              </Button>
              <p className="text-sm text-gray-600">
                Testa funções de hierarquia e perfil
              </p>
            </TabsContent>
            
            <TabsContent value="cache" className="space-y-4">
              <Button onClick={testCache}>Testar Cache</Button>
              <p className="text-sm text-gray-600">
                Testa sistema de cache interno
              </p>
            </TabsContent>
            
            <TabsContent value="interceptor" className="space-y-4">
              <Button onClick={testInterceptor}>Testar Interceptor</Button>
              <p className="text-sm text-gray-600">
                Verifica status do interceptor HTTP
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setTestResults([])}
              >
                Limpar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {testResults.map((result, index) => (
                <Alert key={index}>
                  <AlertDescription className="text-sm font-mono">
                    {result}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthExamples;