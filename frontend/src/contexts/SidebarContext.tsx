import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SidebarContextType {
  openMenus: Set<string>;
  toggleMenu: (menuId: string) => void;
  isMenuOpen: (menuId: string) => boolean;
  activeMenuItem: string | null;
  setActiveMenuItem: (item: string | null) => void;
  shouldMenuBeOpen: (basePath: string) => boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);

  // Função para determinar se um menu deve estar aberto baseado na rota atual
  const shouldMenuBeOpen = (basePath: string): boolean => {
    const currentPath = location.pathname;
    
    // Verificação direta primeiro (mais específica)
    if (currentPath.startsWith(`/admin${basePath}`)) {
      return true;
    }
    
    if (currentPath.startsWith(`/cidadao${basePath}`)) {
      return true;
    }
    
    // Para casos especiais do admin e cidadao
    if (basePath === '/admin' && currentPath.startsWith('/admin/')) {
      return true;
    }
    
    if (basePath === '/cidadao' && currentPath.startsWith('/cidadao/')) {
      return true;
    }
    
    return false;
  };

  // Atualizar menus abertos baseado na rota atual
  useEffect(() => {
    console.log('🧭 SidebarContext: Rota mudou para:', location.pathname);
    
    // Lista de todos os basePaths possíveis dos menus
    const menuBasePaths = [
      '/gabinete',
      '/correio', 
      '/administracao',
      '/relatorios',
      '/configuracoes',
      '/saude',
      '/educacao',
      '/assistencia-social',
      '/cultura',
      '/seguranca-publica',
      '/planejamento-urbano',
      '/agricultura',
      '/esportes',
      '/turismo',
      '/habitacao',
      '/meio-ambiente',
      '/obras-publicas',
      '/servicos-publicos'
    ];

    const newOpenMenus = new Set<string>();
    
    // Verificar quais menus devem estar abertos
    menuBasePaths.forEach(basePath => {
      if (shouldMenuBeOpen(basePath)) {
        newOpenMenus.add(basePath);
        console.log(`📂 SidebarContext: Menu ${basePath} deve estar aberto`);
      }
    });
    
    setOpenMenus(newOpenMenus);
    setActiveMenuItem(location.pathname);
  }, [location.pathname]);

  const toggleMenu = (menuId: string) => {
    console.log('🔄 SidebarContext: Toggle menu:', menuId);
    setOpenMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const isMenuOpen = (menuId: string): boolean => {
    return openMenus.has(menuId);
  };

  const value = {
    openMenus,
    toggleMenu,
    isMenuOpen,
    activeMenuItem,
    setActiveMenuItem,
    shouldMenuBeOpen
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}