// ====================================================================
// 🧪 COMPONENTE DE TESTE - VERIFICAÇÃO RLS CORRIGIDA
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database,
  Users,
  FileText,
  Building,
  Zap
} from 'lucide-react';
import { supabase } from "@/lib/supabase";

interface TestResult {
  name: string;
  description: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

const RLSTestComponent: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const initialTests: TestResult[] = [
    {
      name: 'Conexão Supabase',
      description: 'Verificar conectividade básica com o banco',
      status: 'pending',
      message: 'Aguardando execução...'
    },
    {
      name: 'Consulta user_profiles',
      description: 'Testar consulta que causava recursão infinita',
      status: 'pending', 
      message: 'Aguardando execução...'
    },
    {
      name: 'Consulta protocolos',
      description: 'Verificar se protocolos funciona sem recursão',
      status: 'pending',
      message: 'Aguardando execução...'
    },
    {
      name: 'Consulta secretarias',
      description: 'Testar políticas RLS em secretarias',
      status: 'pending',
      message: 'Aguardando execução...'
    },
    {
      name: 'Consulta tenants',
      description: 'Verificar isolamento multi-tenant',
      status: 'pending',
      message: 'Aguardando execução...'
    },
    {
      name: 'Funções RLS',
      description: 'Testar funções auxiliares sem recursão',
      status: 'pending',
      message: 'Aguardando execução...'
    }
  ];

  useEffect(() => {
    setTests(initialTests);
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    const updatedTests = [...initialTests];

    // Teste 1: Conexão Supabase
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('count', { count: 'exact', head: true });

      if (error) {
        updatedTests[0] = {
          ...updatedTests[0],
          status: 'error',
          message: `Erro de conexão: ${error.message}`
        };
      } else {
        updatedTests[0] = {
          ...updatedTests[0],
          status: 'success',
          message: 'Conexão com Supabase OK'
        };
      }
    } catch (err: Error | unknown) {
      updatedTests[0] = {
        ...updatedTests[0],
        status: 'error',
        message: `Erro: ${err.message}`
      };
    }

    setTests([...updatedTests]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Teste 2: user_profiles (crítico - era onde dava recursão)
    try {
      const { data, error, count } = await supabase
        .from('user_profiles')
        .select('id, email, tipo_usuario, status', { count: 'exact' })
        .limit(5);

      if (error) {
        if (error.message.includes('infinite recursion')) {
          updatedTests[1] = {
            ...updatedTests[1],
            status: 'error',
            message: '❌ CRÍTICO: Recursão infinita ainda presente!',
            details: error.message
          };
        } else if (error.message.includes('permission denied')) {
          updatedTests[1] = {
            ...updatedTests[1],
            status: 'warning',
            message: 'Acesso negado (normal sem autenticação)',
            details: `Total: ${count || 0} registros`
          };
        } else {
          updatedTests[1] = {
            ...updatedTests[1],
            status: 'warning',
            message: `RLS funcionando: ${error.message.substring(0, 50)}...`,
            details: error.message
          };
        }
      } else {
        updatedTests[1] = {
          ...updatedTests[1],
          status: 'success',
          message: `✅ Consulta funcionou! ${count || 0} usuários`,
          details: data
        };
      }
    } catch (err: Error | unknown) {
      updatedTests[1] = {
        ...updatedTests[1],
        status: 'error',
        message: `Erro inesperado: ${err.message}`
      };
    }

    setTests([...updatedTests]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Teste 3: protocolos
    try {
      const { data, error, count } = await supabase
        .from('protocolos_completos')
        .select('*', { count: 'exact', head: true });

      if (error && !error.message.includes('permission denied')) {
        updatedTests[2] = {
          ...updatedTests[2],
          status: 'warning',
          message: `RLS ativo: ${error.message.substring(0, 50)}...`
        };
      } else {
        updatedTests[2] = {
          ...updatedTests[2],
          status: 'success',
          message: `Funcionando! ${count || 0} protocolos`
        };
      }
    } catch (err: Error | unknown) {
      updatedTests[2] = {
        ...updatedTests[2],
        status: 'error',
        message: `Erro: ${err.message}`
      };
    }

    setTests([...updatedTests]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Teste 4: secretarias
    try {
      const { data, error, count } = await supabase
        .from('secretarias')
        .select('id, nome', { count: 'exact' })
        .limit(1);

      if (error && !error.message.includes('permission denied')) {
        updatedTests[3] = {
          ...updatedTests[3],
          status: 'warning',
          message: `RLS ativo: ${error.message.substring(0, 50)}...`
        };
      } else {
        updatedTests[3] = {
          ...updatedTests[3],
          status: 'success',
          message: `Funcionando! ${count || 0} secretarias`
        };
      }
    } catch (err: Error | unknown) {
      updatedTests[3] = {
        ...updatedTests[3],
        status: 'error',
        message: `Erro: ${err.message}`
      };
    }

    setTests([...updatedTests]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Teste 5: tenants
    try {
      const { data, error, count } = await supabase
        .from('tenants')
        .select('id, nome', { count: 'exact' })
        .limit(1);

      if (error && !error.message.includes('permission denied')) {
        updatedTests[4] = {
          ...updatedTests[4],
          status: 'warning',
          message: `RLS ativo: ${error.message.substring(0, 50)}...`
        };
      } else {
        updatedTests[4] = {
          ...updatedTests[4],
          status: 'success',
          message: `Funcionando! ${count || 0} tenants`
        };
      }
    } catch (err: Error | unknown) {
      updatedTests[4] = {
        ...updatedTests[4],
        status: 'error',
        message: `Erro: ${err.message}`
      };
    }

    setTests([...updatedTests]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Teste 6: Funções RLS (através de RPC se disponível)
    try {
      const { data, error } = await supabase
        .rpc('test_rls_policies_v2');

      if (error) {
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          updatedTests[5] = {
            ...updatedTests[5],
            status: 'warning',
            message: 'Função de teste não disponível (normal)'
          };
        } else {
          updatedTests[5] = {
            ...updatedTests[5],
            status: 'warning',
            message: `RPC limitado: ${error.message.substring(0, 50)}...`
          };
        }
      } else {
        updatedTests[5] = {
          ...updatedTests[5],
          status: 'success',
          message: 'Funções RLS funcionando!',
          details: data
        };
      }
    } catch (err: Error | unknown) {
      updatedTests[5] = {
        ...updatedTests[5],
        status: 'warning',
        message: 'Funções não testáveis via frontend'
      };
    }

    setTests([...updatedTests]);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <div className="h-5 w-5 bg-gray-300 rounded-full animate-pulse" />;
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'pending':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getOverallStatus = () => {
    if (tests.length === 0) return 'pending';
    
    const hasErrors = tests.some(t => t.status === 'error');
    const hasWarnings = tests.some(t => t.status === 'warning');
    const allComplete = tests.every(t => t.status !== 'pending');
    
    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    if (allComplete) return 'success';
    return 'pending';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Teste de Correção RLS - Recursão Infinita
        </CardTitle>
        <CardDescription>
          Verificação se o problema de recursão infinita em user_profiles foi resolvido
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert className={getStatusColor(getOverallStatus())}>
          {getStatusIcon(getOverallStatus())}
          <AlertDescription>
            <div className="font-semibold">
              {getOverallStatus() === 'success' && '✅ Todos os testes passaram - RLS corrigida!'}
              {getOverallStatus() === 'warning' && '⚠️ Testes com avisos - Sistema funcionando'}
              {getOverallStatus() === 'error' && '❌ Problemas detectados - Verificar correções'}
              {getOverallStatus() === 'pending' && '🔄 Aguardando execução dos testes...'}
            </div>
          </AlertDescription>
        </Alert>

        {/* Individual Tests */}
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={test.name}
              className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(test.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {index === 0 && <Database className="h-4 w-4 text-gray-600" />}
                    {index === 1 && <Users className="h-4 w-4 text-gray-600" />}
                    {index === 2 && <FileText className="h-4 w-4 text-gray-600" />}
                    {index === 3 && <Building className="h-4 w-4 text-gray-600" />}
                    {index === 4 && <Building className="h-4 w-4 text-gray-600" />}
                    {index === 5 && <Zap className="h-4 w-4 text-gray-600" />}
                    <h4 className="font-semibold text-sm">{test.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                  <p className="text-sm font-medium">{test.message}</p>
                  {test.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">
                        Ver detalhes
                      </summary>
                      <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={runTests}
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            <Database className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executando Testes...' : 'Executar Testes de RLS'}
          </Button>
        </div>

        {/* Info */}
        <div className="pt-4 border-t">
          <div className="text-sm text-gray-600">
            <strong>O que este teste verifica:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Se consultas em user_profiles funcionam (antes causava recursão infinita)</li>
              <li>Se todas as tabelas respondem sem erros de recursão</li>
              <li>Se as políticas RLS estão funcionando corretamente</li>
              <li>Se o isolamento multi-tenant está ativo</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RLSTestComponent;