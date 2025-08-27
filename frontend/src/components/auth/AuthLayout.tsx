// ====================================================================
// 🎨 AUTH LAYOUT - DIGIURBAN JWT SYSTEM
// ====================================================================
// Layout padronizado para páginas de autenticação
// Design responsivo e consistente em toda aplicação
// ====================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// ====================================================================
// INTERFACES
// ====================================================================

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  footerText?: string;
  className?: string;
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = 'Digiurban',
  subtitle = 'Sistema de Gestão Municipal',
  showBackButton = false,
  backButtonText = 'Voltar',
  backButtonPath = '/auth/login',
  footerText = '© 2024 Digiurban. Sistema seguro com criptografia JWT.',
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 ${className}`}>
      <div className="w-full max-w-md">
        {/* Botão Voltar */}
        {showBackButton && (
          <div className="flex justify-start mb-6">
            <Link 
              to={backButtonPath}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {backButtonText}
            </Link>
          </div>
        )}

        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <span className="text-2xl font-bold">DU</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {subtitle}
          </p>
        </div>

        {/* Conteúdo */}
        {children}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>{footerText}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;