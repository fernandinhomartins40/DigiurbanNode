// ====================================================================
// 🛡️ SISTEMA SEGURO DE CREDENCIAIS DE DEMONSTRAÇÃO
// ====================================================================

interface DemoCredentials {
  email: string;
  password: string;
  tipo: string;
  description: string;
  autoFill?: boolean;
}

// Verificar se estamos em ambiente de desenvolvimento
const isDevelopment = import.meta.env.DEV;
const showDemoCredentials = import.meta.env.VITE_SHOW_DEMO_CREDENTIALS === 'true';

// Credenciais carregadas de variáveis de ambiente (SEGURO)
export const DEMO_CREDENTIALS: DemoCredentials[] = isDevelopment && showDemoCredentials ? [
  {
    email: import.meta.env.VITE_DEMO_SUPER_ADMIN_EMAIL || 'admin@digiurban.com.br',
    password: import.meta.env.VITE_DEMO_SUPER_ADMIN_PASSWORD || 'demo123',
    tipo: 'Super Administrador',
    description: 'Acesso total ao sistema multi-tenant',
    autoFill: true
  },
  {
    email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'superadmin@digiurban.test',
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'demo123',
    tipo: 'Administrador', 
    description: 'Administrador municipal',
    autoFill: true
  },
  {
    email: import.meta.env.VITE_DEMO_USER_EMAIL || 'funcionario@demo.local',
    password: import.meta.env.VITE_DEMO_USER_PASSWORD || 'demo123',
    tipo: 'Funcionário',
    description: 'Acesso limitado por secretaria'
  }
] : [];

// Função para preencher campos automaticamente (apenas desenvolvimento)
export const fillDemoCredentials = (
  credential: DemoCredentials,
  setEmail: (email: string) => void,
  setPassword: (password: string) => void
) => {
  if (!isDevelopment) {
    console.warn('🚨 Credenciais demo só disponíveis em desenvolvimento');
    return;
  }

  setEmail(credential.email);
  setPassword(credential.password);
  
  // Log para desenvolvimento (removido automaticamente em produção)
  console.log('🧪 Demo credential filled:', credential.tipo);
};

// Verificação de segurança: impedir uso em produção
if (!isDevelopment && DEMO_CREDENTIALS.length > 0) {
  throw new Error('🚨 ERRO DE SEGURANÇA: Credenciais demo detectadas em produção!');
}

// Função para verificar se deve mostrar painel demo
export const shouldShowDemoPanel = (): boolean => {
  return isDevelopment && showDemoCredentials && DEMO_CREDENTIALS.length > 0;
};

// Função para obter mensagem de ambiente
export const getDemoEnvironmentInfo = (): string => {
  if (!isDevelopment) return '';
  
  if (showDemoCredentials) {
    return '🧪 Ambiente de Demonstração - Credenciais de teste habilitadas';
  } else {
    return '🔒 Ambiente de Desenvolvimento - Para habilitar credenciais demo, configure VITE_SHOW_DEMO_CREDENTIALS=true';
  }
};

export default {
  DEMO_CREDENTIALS,
  fillDemoCredentials,
  shouldShowDemoPanel,
  getDemoEnvironmentInfo
};