// ====================================================================
// 🛡️ SECRETARIA GUARD - ISOLAMENTO POR SECRETARIA
// ====================================================================
// Protege rotas específicas de secretarias baseado em permissões granulares
// Implementa o controle de acesso por departamento
// ====================================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth';
import { toast } from 'sonner';

// ====================================================================
// INTERFACES
// ====================================================================

interface SecretariaGuardProps {
  children: React.ReactNode;
  secretaria: string;
  requiredLevel?: 'read' | 'write' | 'admin';
  fallbackPath?: string;
  showToast?: boolean;
  customMessage?: string;
}

// ====================================================================
// MAPEAMENTO DE SECRETARIAS
// ====================================================================

const SECRETARIAS_VALIDAS = [
  'gabinete',
  'saude',
  'educacao',
  'assistencia_social',
  'obras',
  'meio_ambiente',
  'cultura',
  'esportes',
  'turismo',
  'agricultura',
  'planejamento_urbano',
  'seguranca_publica',
  'servicos_publicos',
  'habitacao'
];

const SECRETARIA_NAMES: Record<string, string> = {
  gabinete: 'Gabinete do Prefeito',
  saude: 'Secretaria de Saúde',
  educacao: 'Secretaria de Educação',
  assistencia_social: 'Secretaria de Assistência Social',
  obras: 'Secretaria de Obras',
  meio_ambiente: 'Secretaria de Meio Ambiente',
  cultura: 'Secretaria de Cultura',
  esportes: 'Secretaria de Esportes',
  turismo: 'Secretaria de Turismo',
  agricultura: 'Secretaria de Agricultura',
  planejamento_urbano: 'Secretaria de Planejamento Urbano',
  seguranca_publica: 'Secretaria de Segurança Pública',
  servicos_publicos: 'Secretaria de Serviços Públicos',
  habitacao: 'Secretaria de Habitação'
};

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

export const SecretariaGuard: React.FC<SecretariaGuardProps> = ({
  children,
  secretaria,
  requiredLevel = 'read',
  fallbackPath = '/unauthorized',
  showToast = true,
  customMessage
}) => {
  const { profile: user, hasPermission, isAuthenticated } = useAuth();
  const location = useLocation();

  // Validar autenticação
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Validar secretaria
  if (!SECRETARIAS_VALIDAS.includes(secretaria)) {
    console.error(`❌ [SecretariaGuard] Secretaria inválida: ${secretaria}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Super admin tem acesso total
  if (user.role === 'super_admin') {
    console.log(`✅ [SecretariaGuard] Acesso liberado: super_admin tem acesso total`);
    return <>{children}</>;
  }

  // Construir permissão necessária
  const requiredPermission = `${secretaria}.${requiredLevel}`;

  // Verificar permissão específica
  const hasSecretariaAccess = hasPermission(requiredPermission);

  // Log da verificação
  console.log(`🛡️ [SecretariaGuard] Verificando acesso:`, {
    user: user.email,
    role: user.role,
    secretaria,
    requiredLevel,
    requiredPermission,
    hasAccess: hasSecretariaAccess,
    path: location.pathname
  });

  if (!hasSecretariaAccess) {
    // Preparar mensagem de erro
    const secretariaName = SECRETARIA_NAMES[secretaria] || secretaria;
    const levelText = {
      read: 'visualizar',
      write: 'editar',
      admin: 'administrar'
    }[requiredLevel];

    const message = customMessage ||
      `Acesso negado à ${secretariaName}. Permissão necessária: ${levelText}.`;

    // Mostrar toast se habilitado
    if (showToast) {
      toast.error(message);
    }

    console.log(`❌ [SecretariaGuard] Acesso negado:`, {
      reason: message,
      requiredPermission,
      userRole: user.role
    });

    // Redirecionar
    return <Navigate to={fallbackPath} replace />;
  }

  console.log(`✅ [SecretariaGuard] Acesso liberado para ${secretaria}`);
  return <>{children}</>;
};

// ====================================================================
// COMPONENTES DE CONVENIÊNCIA POR SECRETARIA
// ====================================================================

// Gabinete
export const GabineteGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="gabinete" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Saúde
export const SaudeGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="saude" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Educação
export const EducacaoGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="educacao" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Assistência Social
export const AssistenciaSocialGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="assistencia_social" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Obras
export const ObrasGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="obras" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Meio Ambiente
export const MeioAmbienteGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="meio_ambiente" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Cultura
export const CulturaGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="cultura" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Esportes
export const EsportesGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="esportes" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Turismo
export const TurismoGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="turismo" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Agricultura
export const AgriculturaGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="agricultura" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Planejamento Urbano
export const PlanejamentoUrbanoGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="planejamento_urbano" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Segurança Pública
export const SegurancaPublicaGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="seguranca_publica" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Serviços Públicos
export const ServicosPublicosGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="servicos_publicos" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// Habitação
export const HabitacaoGuard: React.FC<{
  children: React.ReactNode;
  level?: 'read' | 'write' | 'admin';
}> = ({ children, level = 'read' }) => (
  <SecretariaGuard secretaria="habitacao" requiredLevel={level}>
    {children}
  </SecretariaGuard>
);

// ====================================================================
// HOOK DE CONVENIÊNCIA
// ====================================================================

export const useSecretariaAccess = () => {
  const { hasPermission } = useAuth();

  const canAccessSecretaria = (secretaria: string, level: 'read' | 'write' | 'admin' = 'read'): boolean => {
    if (!SECRETARIAS_VALIDAS.includes(secretaria)) {
      return false;
    }

    const permission = `${secretaria}.${level}`;
    return hasPermission(permission);
  };

  const getSecretariasWithAccess = (level: 'read' | 'write' | 'admin' = 'read'): string[] => {
    return SECRETARIAS_VALIDAS.filter(secretaria =>
      canAccessSecretaria(secretaria, level)
    );
  };

  return {
    canAccessSecretaria,
    getSecretariasWithAccess,
    SECRETARIAS_VALIDAS,
    SECRETARIA_NAMES
  };
};

export default SecretariaGuard;