// ====================================================================
// 🧪 COMPONENTE SEGURO PARA CREDENCIAIS DE DEMONSTRAÇÃO
// ====================================================================

import React from 'react';
import { Button } from '../ui/button';
import { Shield, User, Crown } from 'lucide-react';
import { 
  DEMO_CREDENTIALS, 
  fillDemoCredentials, 
  shouldShowDemoPanel, 
  getDemoEnvironmentInfo 
} from "@/config/demo-credentials";

interface DemoCredentialsPanelProps {
  onFillCredentials: (email: string, password: string) => void;
  className?: string;
}

const DemoCredentialsPanel: React.FC<DemoCredentialsPanelProps> = ({ 
  onFillCredentials,
  className = ''
}) => {
  // Não renderizar se não deve mostrar painel demo
  if (!shouldShowDemoPanel()) {
    return null;
  }

  const handleFillCredentials = (email: string, password: string, tipo: string) => {
    onFillCredentials(email, password);
    console.log('🧪 Credenciais preenchidas:', tipo);
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'Super Administrador':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'Administrador':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-700 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="animate-pulse">🧪</div>
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          Ambiente de Demonstração
        </p>
      </div>
      
      <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
        {getDemoEnvironmentInfo()}
      </p>
      
      <div className="space-y-2">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
          Credenciais de Teste Disponíveis:
        </p>
        
        {DEMO_CREDENTIALS.map((credential, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleFillCredentials(
              credential.email, 
              credential.password, 
              credential.tipo
            )}
            className="w-full justify-start text-left h-auto py-2 px-3 bg-white/50 hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-800"
          >
            <div className="flex items-center gap-3 w-full">
              {getIcon(credential.tipo)}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                  {credential.tipo}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {credential.description}
                </div>
                <div className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate mt-1">
                  {credential.email}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          ⚠️ Estas credenciais são apenas para demonstração e não funcionam em produção
        </p>
      </div>
    </div>
  );
};

export default DemoCredentialsPanel;