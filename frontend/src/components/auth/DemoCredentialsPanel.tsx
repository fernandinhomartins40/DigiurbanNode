// ====================================================================
// 🧪 COMPONENTE REMOVIDO - CREDENCIAIS HARDCODED REMOVIDAS
// ====================================================================
// Este componente foi desabilitado por segurança
// Use variáveis de ambiente INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD
// ====================================================================

import React from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield } from 'lucide-react';

interface DemoCredentialsPanelProps {
  onFillCredentials: (email: string, password: string) => void;
  className?: string;
}

const DemoCredentialsPanel: React.FC<DemoCredentialsPanelProps> = ({ 
  className = ''
}) => {
  // Componente desabilitado por segurança
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className={`${className}`}>
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Credenciais de demonstração removidas por segurança.</strong>
          <br />
          Para criar um administrador inicial, configure as variáveis de ambiente:
          <br />
          • <code>INITIAL_ADMIN_EMAIL</code>
          <br />
          • <code>INITIAL_ADMIN_PASSWORD</code>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DemoCredentialsPanel;