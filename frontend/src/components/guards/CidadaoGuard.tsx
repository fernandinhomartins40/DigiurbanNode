// ====================================================================
// 🏛️ CIDADÃO GUARD - PROTEÇÃO DO PAINEL DO CIDADÃO
// ====================================================================
// Protege rotas específicas do painel do cidadão baseado em permissões
// Implementa o controle de acesso para funcionalidades públicas autenticadas
// ====================================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth';
import { toast } from 'sonner';

// ====================================================================
// INTERFACES
// ====================================================================

interface CidadaoGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
  showToast?: boolean;
  customMessage?: string;
}

// ====================================================================
// PERMISSÕES VÁLIDAS DO CIDADÃO
// ====================================================================

const CIDADAO_PERMISSIONS = [
  'cidadao.dashboard',
  'cidadao.protocolos.create',
  'cidadao.protocolos.read',
  'cidadao.servicos.read',
  'cidadao.informacoes.read',
  'cidadao.documentos.download',
  'cidadao.contato.create',
  'cidadao.agenda.read',
  'cidadao.noticias.read',
  'cidadao.perfil.update'
];

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  'cidadao.dashboard': 'acessar o painel do cidadão',
  'cidadao.protocolos.create': 'criar protocolos e solicitações',
  'cidadao.protocolos.read': 'visualizar seus protocolos',
  'cidadao.servicos.read': 'consultar serviços públicos',
  'cidadao.informacoes.read': 'acessar informações públicas',
  'cidadao.documentos.download': 'baixar documentos',
  'cidadao.contato.create': 'entrar em contato com a prefeitura',
  'cidadao.agenda.read': 'visualizar agenda pública',
  'cidadao.noticias.read': 'ler notícias e comunicados',
  'cidadao.perfil.update': 'atualizar seu perfil'
};

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

export const CidadaoGuard: React.FC<CidadaoGuardProps> = ({
  children,
  requiredPermission = 'cidadao.dashboard',
  fallbackPath = '/cidadao/login',
  showToast = true,
  customMessage
}) => {
  const { profile: user, hasPermission, isAuthenticated } = useAuth();
  const location = useLocation();

  // Validar autenticação
  if (!isAuthenticated || !user) {
    if (showToast) {
      toast.error('Você precisa estar logado para acessar esta área');
    }
    return <Navigate to="/cidadao/login" replace />;
  }

  // Verificar se é cidadão ou super_admin
  const isCidadao = user.role === 'cidadao';
  const isSuperAdmin = user.role === 'super_admin';

  if (!isCidadao && !isSuperAdmin) {
    const message = customMessage ||
      'Esta área é exclusiva para cidadãos. Use o painel administrativo apropriado.';

    if (showToast) {
      toast.error(message);
    }

    console.log(`❌ [CidadaoGuard] Acesso negado:`, {
      reason: 'Role não é cidadão',
      userRole: user.role,
      requiredRole: 'cidadao',
      path: location.pathname
    });

    return <Navigate to="/unauthorized" replace />;
  }

  // Validar permissão específica
  if (requiredPermission && !CIDADAO_PERMISSIONS.includes(requiredPermission)) {
    console.error(`❌ [CidadaoGuard] Permissão inválida: ${requiredPermission}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Super admin tem acesso total (para testes e suporte)
  if (isSuperAdmin) {
    console.log(`✅ [CidadaoGuard] Acesso liberado: super_admin tem acesso total`);
    return <>{children}</>;
  }

  // Verificar permissão específica para cidadãos
  const hasRequiredPermission = hasPermission(requiredPermission);

  // Log da verificação
  console.log(`🏛️ [CidadaoGuard] Verificando acesso:`, {
    user: user.email,
    role: user.role,
    requiredPermission,
    hasPermission: hasRequiredPermission,
    path: location.pathname
  });

  if (!hasRequiredPermission) {
    const permissionDescription = PERMISSION_DESCRIPTIONS[requiredPermission] || requiredPermission;
    const message = customMessage ||
      `Você não tem permissão para ${permissionDescription}.`;

    if (showToast) {
      toast.error(message);
    }

    console.log(`❌ [CidadaoGuard] Acesso negado:`, {
      reason: message,
      requiredPermission,
      userRole: user.role
    });

    return <Navigate to={fallbackPath} replace />;
  }

  console.log(`✅ [CidadaoGuard] Acesso liberado para ${requiredPermission}`);
  return <>{children}</>;
};

// ====================================================================
// COMPONENTES DE CONVENIÊNCIA
// ====================================================================

// Dashboard do Cidadão
export const CidadaoDashboardGuard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <CidadaoGuard requiredPermission="cidadao.dashboard">
    {children}
  </CidadaoGuard>
);

// Protocolos
export const CidadaoProtocolosGuard: React.FC<{
  children: React.ReactNode;
  action: 'create' | 'read';
}> = ({ children, action }) => (
  <CidadaoGuard requiredPermission={`cidadao.protocolos.${action}`}>
    {children}
  </CidadaoGuard>
);

// Serviços Públicos
export const CidadaoServicosGuard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <CidadaoGuard requiredPermission="cidadao.servicos.read">
    {children}
  </CidadaoGuard>
);

// Informações Públicas
export const CidadaoInformacoesGuard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <CidadaoGuard requiredPermission="cidadao.informacoes.read">
    {children}
  </CidadaoGuard>
);

// Documentos
export const CidadaoDocumentosGuard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <CidadaoGuard requiredPermission="cidadao.documentos.download">
    {children}
  </CidadaoGuard>
);

// Contato
export const CidadaoContatoGuard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <CidadaoGuard requiredPermission="cidadao.contato.create">
    {children}
  </CidadaoGuard>
);

// Agenda Pública
export const CidadaoAgendaGuard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <CidadaoGuard requiredPermission="cidadao.agenda.read">
    {children}
  </CidadaoGuard>
);

// Notícias
export const CidadaoNoticiasGuard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <CidadaoGuard requiredPermission="cidadao.noticias.read">
    {children}
  </CidadaoGuard>
);

// Perfil
export const CidadaoPerfilGuard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <CidadaoGuard requiredPermission="cidadao.perfil.update">
    {children}
  </CidadaoGuard>
);

// ====================================================================
// HOOK DE CONVENIÊNCIA
// ====================================================================

export const useCidadaoAccess = () => {
  const { profile: user, hasPermission } = useAuth();

  const isCidadao = user?.role === 'cidadao';
  const isSuperAdmin = user?.role === 'super_admin';
  const canAccessCidadaoPanel = isCidadao || isSuperAdmin;

  const canAccessPermission = (permission: string): boolean => {
    if (!canAccessCidadaoPanel) return false;
    if (!CIDADAO_PERMISSIONS.includes(permission)) return false;
    return hasPermission(permission);
  };

  return {
    isCidadao,
    canAccessCidadaoPanel,
    canAccessPermission,
    canCreateProtocolo: () => canAccessPermission('cidadao.protocolos.create'),
    canViewProtocolos: () => canAccessPermission('cidadao.protocolos.read'),
    canViewServicos: () => canAccessPermission('cidadao.servicos.read'),
    canDownloadDocumentos: () => canAccessPermission('cidadao.documentos.download'),
    canContact: () => canAccessPermission('cidadao.contato.create'),
    canUpdatePerfil: () => canAccessPermission('cidadao.perfil.update'),
    CIDADAO_PERMISSIONS,
    PERMISSION_DESCRIPTIONS
  };
};

export default CidadaoGuard;