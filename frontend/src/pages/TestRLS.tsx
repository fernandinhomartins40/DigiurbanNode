// ====================================================================
// 📄 PÁGINA DE TESTE RLS - VERIFICAÇÃO DAS CORREÇÕES
// ====================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, CheckCircle } from 'lucide-react';
import RLSTestComponent from "@/components/auth/RLSTestComponent";
import AuthSystemStatus from "@/components/auth/AuthSystemStatus";

const TestRLS: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Database className="h-8 w-8 text-blue-600" />
                Teste de Correções RLS
              </h1>
              <p className="text-gray-600 mt-1">
                Verificação das correções aplicadas para resolver recursão infinita
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Correções Aplicadas</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Script <code>25_corrigir_rls_recursao_v2.sql</code> foi executado com sucesso.
                  Os testes abaixo verificam se o problema de recursão infinita foi resolvido.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Teste RLS */}
        <div className="space-y-8">
          <RLSTestComponent />
          
          {/* Status do Sistema de Auth */}
          <AuthSystemStatus />
        </div>

        {/* Footer with instructions */}
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">
            📋 Como interpretar os resultados:
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-green-700">Sucesso:</strong> Consulta funcionou perfeitamente - RLS corrigida
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-4 w-4 bg-yellow-500 rounded flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-yellow-700">Aviso:</strong> RLS ativo, acesso negado (comportamento esperado sem login)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-4 w-4 bg-red-500 rounded flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-red-700">Erro:</strong> Problema detectado - verificar configuração
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong>Importante:</strong> Se o teste "Consulta user_profiles" mostrar sucesso ou aviso 
              (ao invés de erro de recursão infinita), significa que a correção funcionou!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRLS;