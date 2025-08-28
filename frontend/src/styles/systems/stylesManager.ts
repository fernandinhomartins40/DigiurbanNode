/* ====================================================================
   GERENCIADOR DE SISTEMAS DE ESTILOS
   Sistema inteligente para carregamento otimizado de CSS por contexto
   ====================================================================*/

export type SystemType = 'super-admin' | 'landing' | 'admin' | 'citizen';

export interface StyleSystemConfig {
  name: string;
  cssFile: string;
  namespace: string;
  description: string;
  primaryColor: string;
  features: string[];
}

// Configuração dos sistemas de estilos
export const STYLE_SYSTEMS: Record<SystemType, StyleSystemConfig> = {
  'super-admin': {
    name: 'Super Admin Panel',
    cssFile: '/src/styles/systems/super-admin.css',
    namespace: 'super-admin',
    description: 'Sistema de estilos para o painel Super Admin com foco em métricas SaaS',
    primaryColor: '#2563eb',
    features: [
      'Design system unificado',
      'Componentes KPI avançados', 
      'Layouts responsivos',
      'Paleta corporativa azul/roxo',
      'Efeitos de vidro e gradientes'
    ]
  },
  
  'landing': {
    name: 'Landing Page',
    cssFile: '/src/styles/systems/landing-page.css',
    namespace: 'landing',
    description: 'Sistema de estilos para páginas públicas e marketing',
    primaryColor: '#1d4ed8',
    features: [
      'Hero sections impactantes',
      'Animações fluidas',
      'CTAs otimizados',
      'Testimonials e features',
      'SEO-friendly'
    ]
  },
  
  'admin': {
    name: 'Admin Panel',
    cssFile: '/src/styles/systems/admin-panel.css',
    namespace: 'admin',
    description: 'Sistema de estilos para gestores e administradores',
    primaryColor: '#0369a1',
    features: [
      'Sidebar navegável',
      'Dashboard widgets',
      'Tabelas de dados',
      'Formulários complexos',
      'Notificações em tempo real'
    ]
  },
  
  'citizen': {
    name: 'Citizen Panel',
    cssFile: '/src/styles/systems/citizen-panel.css',
    namespace: 'citizen',
    description: 'Sistema de estilos amigável para cidadãos',
    primaryColor: '#16a34a',
    features: [
      'Interface amigável',
      'Formulários simplificados',
      'Protocolos visuais',
      'Status tracking',
      'Mobile-first'
    ]
  }
};

// Cache para controlar quais estilos já foram carregados
const loadedStyles = new Set<SystemType>();

/**
 * Carrega dinamicamente os estilos CSS de um sistema específico
 * Usando importação dinâmica para compatibilidade com Vite
 */
export const loadSystemStyles = async (system: SystemType): Promise<void> => {
  // Se já foi carregado, não carrega novamente
  if (loadedStyles.has(system)) {
    return;
  }

  const config = STYLE_SYSTEMS[system];
  
  try {
    // Remove estilos de outros sistemas se necessário
    await unloadOtherSystems(system);
    
    // Carrega o CSS usando importação dinâmica
    let cssModule;
    switch (system) {
      case 'super-admin':
        cssModule = await import('./super-admin.css?inline');
        break;
      case 'landing':
        cssModule = await import('./landing-page.css?inline');
        break;
      case 'admin':
        cssModule = await import('./admin-panel.css?inline');
        break;
      case 'citizen':
        cssModule = await import('./citizen-panel.css?inline');
        break;
      default:
        throw new Error(`Sistema '${system}' não encontrado`);
    }
    
    // Cria e injeta o CSS
    const style = document.createElement('style');
    style.id = `styles-${system}`;
    style.setAttribute('data-system', system);
    style.textContent = cssModule.default || '';
    
    document.head.appendChild(style);
    
    // Define o sistema no body para ativação de estilos condicionais
    document.body.setAttribute('data-system', system);
    document.body.className = `system-${system}`;
    
    // Marca como carregado
    loadedStyles.add(system);
    
    console.log(`✅ Sistema de estilos '${config.name}' carregado com sucesso`);
    
  } catch (error) {
    console.error(`❌ Erro ao carregar estilos do sistema '${system}':`, error);
    // Fallback: apenas define as classes no body
    document.body.setAttribute('data-system', system);
    document.body.className = `system-${system}`;
    loadedStyles.add(system);
  }
};

/**
 * Remove estilos de outros sistemas para evitar conflitos
 */
const unloadOtherSystems = async (currentSystem: SystemType): Promise<void> => {
  const otherSystems = (Object.keys(STYLE_SYSTEMS) as SystemType[])
    .filter(system => system !== currentSystem);
  
  otherSystems.forEach(system => {
    const existingStyle = document.getElementById(`styles-${system}`);
    if (existingStyle) {
      existingStyle.remove();
      loadedStyles.delete(system);
      console.log(`🗑️ Estilos do sistema '${system}' removidos`);
    }
  });
};

/**
 * Detecta automaticamente qual sistema deve ser carregado baseado na rota
 */
export const detectSystemFromRoute = (pathname: string): SystemType => {
  if (pathname.startsWith('/super-admin')) {
    return 'super-admin';
  }
  
  if (pathname.startsWith('/admin') || 
      pathname.startsWith('/gabinete') ||
      pathname.startsWith('/agricultura') ||
      pathname.startsWith('/saude') ||
      pathname.startsWith('/educacao') ||
      pathname.startsWith('/seguranca') ||
      pathname.startsWith('/obras') ||
      pathname.startsWith('/planejamento') ||
      pathname.startsWith('/meio-ambiente') ||
      pathname.startsWith('/assistencia-social') ||
      pathname.startsWith('/cultura') ||
      pathname.startsWith('/esportes') ||
      pathname.startsWith('/habitacao') ||
      pathname.startsWith('/servicos-publicos') ||
      pathname.startsWith('/turismo') ||
      pathname.startsWith('/relatorios') ||
      pathname.startsWith('/administracao') ||
      pathname.startsWith('/correio') ||
      pathname.startsWith('/configuracoes')) {
    return 'admin';
  }
  
  if (pathname.startsWith('/cidadao') ||
      pathname.startsWith('/meus-protocolos') ||
      pathname.startsWith('/catalogo-servicos') ||
      pathname.startsWith('/criar-protocolo') ||
      pathname.startsWith('/solicitar-servico')) {
    return 'citizen';
  }
  
  // Página inicial ou rotas públicas
  if (pathname === '/' || 
      pathname === '/landing' ||
      pathname.startsWith('/auth')) {
    return 'landing';
  }
  
  // Default para landing se não conseguir detectar
  return 'landing';
};

/**
 * Inicializa o sistema de estilos baseado na rota atual
 */
export const initializeStyleSystem = async (): Promise<void> => {
  const currentPath = window.location.pathname;
  const system = detectSystemFromRoute(currentPath);
  
  console.log(`🎨 Inicializando sistema de estilos: ${STYLE_SYSTEMS[system].name}`);
  console.log(`📍 Rota detectada: ${currentPath} → ${system}`);
  
  await loadSystemStyles(system);
};

/**
 * Hook para mudanças de rota (React Router)
 */
export const useStyleSystemRouter = () => {
  const switchToSystem = async (system: SystemType) => {
    await loadSystemStyles(system);
  };
  
  const switchToRoute = async (pathname: string) => {
    const system = detectSystemFromRoute(pathname);
    await switchToSystem(system);
  };
  
  return {
    switchToSystem,
    switchToRoute,
    getCurrentSystem: () => document.body.getAttribute('data-system') as SystemType,
    getSystemConfig: (system: SystemType) => STYLE_SYSTEMS[system]
  };
};

/**
 * Utilitários para aplicar classes CSS específicas do sistema
 */
export const getSystemClasses = (system: SystemType) => {
  const config = STYLE_SYSTEMS[system];
  return {
    namespace: config.namespace,
    layout: `${config.namespace}-layout`,
    header: `${config.namespace}-header`,
    content: `${config.namespace}-content`,
    card: `${config.namespace}-card`,
    button: `${config.namespace}-button`,
    buttonPrimary: `${config.namespace}-button--primary`,
    buttonSecondary: `${config.namespace}-button--secondary`,
    section: `${config.namespace}-section`,
  };
};

/**
 * Pré-carrega estilos críticos no build
 */
export const preloadCriticalStyles = async () => {
  // Sempre carrega o sistema base
  const baseStyles = document.createElement('link');
  baseStyles.rel = 'stylesheet';
  baseStyles.href = '/src/styles/systems/index.css';
  baseStyles.id = 'styles-base';
  document.head.appendChild(baseStyles);
  
  // Pré-carrega estilos da landing para performance inicial
  const landingLink = document.createElement('link');
  landingLink.rel = 'preload';
  landingLink.as = 'style';
  landingLink.href = STYLE_SYSTEMS.landing.cssFile;
  document.head.appendChild(landingLink);
};

/**
 * Middleware para desenvolvimento - mostra informações do sistema ativo
 */
export const devStylesInfo = () => {
  if (import.meta.env.NODE_ENV === 'development') {
    const currentSystem = document.body.getAttribute('data-system') as SystemType;
    if (currentSystem && STYLE_SYSTEMS[currentSystem]) {
      const config = STYLE_SYSTEMS[currentSystem];
      console.group('🎨 Sistema de Estilos Ativo');
      console.log('Sistema:', config.name);
      console.log('Namespace:', config.namespace);
      console.log('Cor Primária:', config.primaryColor);
      console.log('Features:', config.features.join(', '));
      console.groupEnd();
    }
  }
};

// Auto-inicialização quando o módulo é importado
if (typeof window !== 'undefined') {
  // Aguarda o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStyleSystem);
  } else {
    initializeStyleSystem();
  }
}