// ====================================================================
// 🔍 COMPONENTE DE STATUS DO SISTEMA DE AUTENTICAÇÃO
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield, 
  Database, 
  Lock,
  Users,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/auth';
import { authRateLimiter } from "@/utils/rateLimiter";
import { supabase } from "@/lib/supabase";

interface SystemCheck {
  id: string;
  name: string;
  description: string;
  status: 'checking' | 'success' | 'warning' | 'error';
  message: string;
  icon: React.ComponentType<any>;
}

const AuthSystemStatus: React.FC = () => {
  const { profile: user, isLoading: loading } = useAuth();
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // ====================================================================
  // DEFINIÇÃO DOS TESTES
  // ====================================================================

  const runSystemChecks = async () => {
    setIsRunning(true);
    
    const initialChecks: SystemCheck[] = [
      {
        id: 'supabase_connection',
        name: 'Conexão Supabase',
        description: 'Verificar conectividade com o banco de dados',
        status: 'checking',
        message: 'Testando conexão...',
        icon: Database
      },
      {
        id: 'auth_system',
        name: 'Sistema de Autenticação',
        description: 'Verificar se o sistema AUTH2 está funcionando',
        status: 'checking',
        message: 'Verificando autenticação...',
        icon: Shield
      },
      {
        id: 'rls_policies',
        name: 'Políticas RLS',
        description: 'Testar se as políticas RLS não causam recursão',
        status: 'checking',
        message: 'Testando políticas...',
        icon: Lock
      },
      {
        id: 'rate_limiting',
        name: 'Rate Limiting',
        description: 'Verificar sistema de proteção contra força bruta',
        status: 'checking',
        message: 'Testando rate limiting...',
        icon: Zap
      },
      {
        id: 'user_profiles',
        name: 'Perfis de Usuário',
        description: 'Verificar se consultas em user_profiles funcionam',
        status: 'checking',
        message: 'Consultando perfis...',
        icon: Users
      }
    ];

    setChecks(initialChecks);

    // Executar testes sequencialmente com delay
    for (let i = 0; i < initialChecks.length; i++) {
      const check = initialChecks[i];
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay visual
        
        let result: Partial<SystemCheck> = {};
        
        switch (check.id) {
          case 'supabase_connection':
            result = await testSupabaseConnection();
            break;
          case 'auth_system':
            result = await testAuthSystem();
            break;
          case 'rls_policies':
            result = await testRLSPolicies();
            break;
          case 'rate_limiting':
            result = await testRateLimiting();
            break;
          case 'user_profiles':
            result = await testUserProfiles();
            break;
        }
        
        setChecks(prev => prev.map((c, index) => 
          index === i ? { ...c, ...result } : c
        ));
        
      } catch (error) {
        setChecks(prev => prev.map((c, index) => 
          index === i ? { 
            ...c, 
            status: 'error' as const, 
            message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          } : c
        ));
      }
    }
    
    setIsRunning(false);
  };

  // ====================================================================
  // TESTES INDIVIDUAIS
  // ====================================================================

  const testSupabaseConnection = async (): Promise<Partial<SystemCheck>> => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('count', { count: 'exact', head: true });

      if (error) {
        return {
          status: 'error',
          message: `Erro de conexão: ${error.message}`
        };
      }

      return {
        status: 'success',
        message: 'Conexão com Supabase funcionando corretamente'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Erro de rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

  const testAuthSystem = async (): Promise<Partial<SystemCheck>> => {
    try {
      // Verificar se o hook está funcionando
      if (loading) {
        return {
          status: 'warning',
          message: 'Sistema de autenticação ainda carregando'
        };
      }

      if (user) {
        return {
          status: 'success',
          message: `Usuário autenticado: ${user.nome_completo} (${user.tipo_usuario})`
        };
      } else {
        return {
          status: 'warning',
          message: 'Nenhum usuário autenticado (normal se não logado)'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Erro no sistema de auth: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

  const testRLSPolicies = async (): Promise<Partial<SystemCheck>> => {
    try {
      // Tentar consulta que anteriormente causava recursão infinita
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, tipo_usuario')
        .limit(1);

      if (error) {
        if (error.message.includes('infinite recursion')) {
          return {
            status: 'error',
            message: 'CRÍTICO: Recursão infinita detectada nas políticas RLS!'
          };
        } else if (error.message.includes('permission denied')) {
          return {
            status: 'success',
            message: 'Políticas RLS funcionando (acesso negado esperado)'
          };
        } else {
          return {
            status: 'warning',
            message: `Erro RLS: ${error.message}`
          };
        }
      }

      return {
        status: 'success',
        message: 'Políticas RLS funcionando sem recursão'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Erro ao testar RLS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

  const testRateLimiting = async (): Promise<Partial<SystemCheck>> => {
    try {
      // Testar funcionalidades básicas do rate limiter
      const testEmail = 'test@example.com';
      
      // Verificar se pode tentar login
      const canAttempt = authRateLimiter.canAttemptLogin(testEmail);
      
      if (canAttempt.canAttempt) {
        // Simular algumas tentativas falhadas
        authRateLimiter.recordFailedAttempt(testEmail);
        authRateLimiter.recordFailedAttempt(testEmail);
        
        const afterAttempts = authRateLimiter.canAttemptLogin(testEmail);
        
        if (afterAttempts.attemptsLeft !== undefined && afterAttempts.attemptsLeft < canAttempt.attemptsLeft!) {
          // Limpar teste
          authRateLimiter.recordSuccessfulLogin(testEmail);
          
          return {
            status: 'success',
            message: 'Rate limiting funcionando corretamente'
          };
        } else {
          return {
            status: 'warning',
            message: 'Rate limiting pode não estar funcionando'
          };
        }
      } else {
        return {
          status: 'warning',
          message: 'Rate limiting ativo (pode ser de testes anteriores)'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Erro no rate limiting: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

  const testUserProfiles = async (): Promise<Partial<SystemCheck>> => {
    try {
      // Tentar consulta básica em user_profiles
      const { data, error, count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        if (error.message.includes('infinite recursion')) {
          return {
            status: 'error',
            message: 'CRÍTICO: Recursão infinita em user_profiles!'
          };
        } else {
          return {
            status: 'warning',
            message: `Acesso limitado: ${error.message}`
          };
        }
      }

      return {
        status: 'success',
        message: `Consulta funcionando. ${count || 0} usuários encontrados.`
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Erro na consulta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

  // ====================================================================
  // EFEITOS
  // ====================================================================

  useEffect(() => {
    // Executar testes automaticamente ao montar o componente
    runSystemChecks();
  }, []);

  // ====================================================================
  // RENDER HELPERS
  // ====================================================================

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: SystemCheck['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getOverallStatus = () => {
    if (checks.length === 0) return 'checking';
    
    const hasErrors = checks.some(c => c.status === 'error');
    const hasWarnings = checks.some(c => c.status === 'warning');
    const allComplete = checks.every(c => c.status !== 'checking');
    
    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    if (allComplete) return 'success';
    return 'checking';
  };

  // ====================================================================
  // RENDER
  // ====================================================================

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Status do Sistema de Autenticação
        </CardTitle>
        <CardDescription>
          Verificação automática dos componentes críticos de segurança
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert className={getStatusColor(getOverallStatus())}>
          {getStatusIcon(getOverallStatus())}
          <AlertDescription>
            <div className="font-semibold">
              {getOverallStatus() === 'success' && '✅ Sistema funcionando corretamente'}
              {getOverallStatus() === 'warning' && '⚠️ Sistema funcionando com avisos'}
              {getOverallStatus() === 'error' && '❌ Problemas críticos detectados'}
              {getOverallStatus() === 'checking' && '🔄 Verificando sistema...'}
            </div>
          </AlertDescription>
        </Alert>

        {/* Individual Checks */}
        <div className="space-y-3">
          {checks.map((check) => (
            <div
              key={check.id}
              className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <check.icon className="h-4 w-4 text-gray-600" />
                    <h4 className="font-semibold text-sm">{check.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{check.description}</p>
                  <p className="text-sm font-medium">{check.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={runSystemChecks}
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Verificando...' : 'Executar Testes Novamente'}
          </Button>
        </div>

        {/* Statistics */}
        {authRateLimiter && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-sm mb-2">Estatísticas de Segurança</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total de tentativas:</span>
                <span className="ml-2 font-medium">{authRateLimiter.getSecurityStats().totalAttempts}</span>
              </div>
              <div>
                <span className="text-gray-600">IPs bloqueados:</span>
                <span className="ml-2 font-medium">{authRateLimiter.getSecurityStats().blockedIPs}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthSystemStatus;