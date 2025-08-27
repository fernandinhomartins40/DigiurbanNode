import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  SystemType, 
  STYLE_SYSTEMS,
  loadSystemStyles, 
  detectSystemFromRoute,
  getSystemClasses,
  devStylesInfo
} from '../styles/systems/stylesManager';

/**
 * Hook React para gerenciar sistemas de estilos automaticamente
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { currentSystem, systemClasses, switchSystem } = useStyleSystem();
 *   
 *   return (
 *     <div className={systemClasses.layout}>
 *       <header className={systemClasses.header}>
 *         Sistema ativo: {currentSystem}
 *       </header>
 *     </div>
 *   );
 * }
 * ```
 */
export const useStyleSystem = () => {
  const location = useLocation();
  const [currentSystem, setCurrentSystem] = useState<SystemType>('landing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detecta e carrega sistema baseado na rota atual
  const loadSystemFromRoute = useCallback(async (pathname: string) => {
    const detectedSystem = detectSystemFromRoute(pathname);
    
    if (detectedSystem === currentSystem) {
      return; // Já está no sistema correto
    }

    setLoading(true);
    setError(null);

    try {
      await loadSystemStyles(detectedSystem);
      setCurrentSystem(detectedSystem);
      
      // Mostra informações em desenvolvimento
      devStylesInfo();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao carregar estilos: ${errorMessage}`);
      console.error('Erro no useStyleSystem:', err);
    } finally {
      setLoading(false);
    }
  }, [currentSystem]);

  // Carrega sistema manualmente
  const switchSystem = useCallback(async (system: SystemType) => {
    if (system === currentSystem) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loadSystemStyles(system);
      setCurrentSystem(system);
      devStylesInfo();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao alternar sistema: ${errorMessage}`);
      console.error('Erro ao alternar sistema:', err);
    } finally {
      setLoading(false);
    }
  }, [currentSystem]);

  // Escuta mudanças de rota
  useEffect(() => {
    loadSystemFromRoute(location.pathname);
  }, [location.pathname, loadSystemFromRoute]);

  // Classes CSS do sistema atual
  const systemClasses = getSystemClasses(currentSystem);
  const systemConfig = STYLE_SYSTEMS[currentSystem];

  return {
    // Estado atual
    currentSystem,
    systemConfig,
    loading,
    error,

    // Classes CSS
    systemClasses,
    
    // Métodos
    switchSystem,
    loadSystemFromRoute,
    
    // Utilitários
    getClassName: (elementType: keyof typeof systemClasses) => systemClasses[elementType],
    isSystem: (system: SystemType) => currentSystem === system,
    
    // Informações do sistema
    systemInfo: {
      name: systemConfig.name,
      description: systemConfig.description,
      primaryColor: systemConfig.primaryColor,
      features: systemConfig.features
    }
  };
};

/**
 * Hook específico para o sistema Super Admin
 */
export const useSuperAdminStyles = () => {
  const { currentSystem, systemClasses, switchSystem } = useStyleSystem();

  useEffect(() => {
    if (currentSystem !== 'super-admin') {
      switchSystem('super-admin');
    }
  }, [currentSystem, switchSystem]);

  return {
    isActive: currentSystem === 'super-admin',
    classes: systemClasses,
    layout: systemClasses.layout,
    header: systemClasses.header,
    content: systemClasses.content,
    card: systemClasses.card,
    button: systemClasses.button,
    buttonPrimary: systemClasses.buttonPrimary,
    section: systemClasses.section
  };
};

/**
 * Hook específico para o sistema Admin
 */
export const useAdminStyles = () => {
  const { currentSystem, systemClasses, switchSystem } = useStyleSystem();

  useEffect(() => {
    if (currentSystem !== 'admin') {
      switchSystem('admin');
    }
  }, [currentSystem, switchSystem]);

  return {
    isActive: currentSystem === 'admin',
    classes: systemClasses,
    layout: systemClasses.layout,
    header: systemClasses.header,
    content: systemClasses.content,
    card: systemClasses.card,
    button: systemClasses.button,
    buttonPrimary: systemClasses.buttonPrimary,
    section: systemClasses.section
  };
};

/**
 * Hook específico para o sistema Citizen
 */
export const useCitizenStyles = () => {
  const { currentSystem, systemClasses, switchSystem } = useStyleSystem();

  useEffect(() => {
    if (currentSystem !== 'citizen') {
      switchSystem('citizen');
    }
  }, [currentSystem, switchSystem]);

  return {
    isActive: currentSystem === 'citizen',
    classes: systemClasses,
    layout: systemClasses.layout,
    header: systemClasses.header,
    content: systemClasses.content,
    card: systemClasses.card,
    button: systemClasses.button,
    buttonPrimary: systemClasses.buttonPrimary,
    section: systemClasses.section
  };
};

/**
 * Hook específico para o sistema Landing
 */
export const useLandingStyles = () => {
  const { currentSystem, systemClasses, switchSystem } = useStyleSystem();

  useEffect(() => {
    if (currentSystem !== 'landing') {
      switchSystem('landing');
    }
  }, [currentSystem, switchSystem]);

  return {
    isActive: currentSystem === 'landing',
    classes: systemClasses,
    layout: systemClasses.layout,
    header: systemClasses.header,
    content: systemClasses.content,
    card: systemClasses.card,
    button: systemClasses.button,
    buttonPrimary: systemClasses.buttonPrimary,
    section: systemClasses.section
  };
};

/**
 * Componente wrapper para aplicar sistema de estilos automaticamente
 */
interface StyleSystemProviderProps {
  system?: SystemType;
  children: React.ReactNode;
  className?: string;
}

export const StyleSystemProvider: React.FC<StyleSystemProviderProps> = ({
  system,
  children,
  className = ''
}) => {
  const { currentSystem, systemClasses, switchSystem, loading, error } = useStyleSystem();

  // Se um sistema específico foi passado, força a mudança
  useEffect(() => {
    if (system && system !== currentSystem) {
      switchSystem(system);
    }
  }, [system, currentSystem, switchSystem]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading">Carregando sistema de estilos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <div>
          <h2>Erro no sistema de estilos</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${systemClasses.layout} ${className}`} data-system={currentSystem}>
      {children}
    </div>
  );
};

/**
 * HOC para componentes que precisam de um sistema específico
 */
export const withStyleSystem = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredSystem: SystemType
) => {
  const WithStyleSystemComponent = (props: P) => {
    return (
      <StyleSystemProvider system={requiredSystem}>
        <WrappedComponent {...props} />
      </StyleSystemProvider>
    );
  };

  WithStyleSystemComponent.displayName = 
    `withStyleSystem(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithStyleSystemComponent;
};

// HOCs específicos para cada sistema
export const withSuperAdminStyles = <P extends object>(component: React.ComponentType<P>) =>
  withStyleSystem(component, 'super-admin');

export const withAdminStyles = <P extends object>(component: React.ComponentType<P>) =>
  withStyleSystem(component, 'admin');

export const withCitizenStyles = <P extends object>(component: React.ComponentType<P>) =>
  withStyleSystem(component, 'citizen');

export const withLandingStyles = <P extends object>(component: React.ComponentType<P>) =>
  withStyleSystem(component, 'landing');