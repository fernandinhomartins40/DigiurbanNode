import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Settings,
  Monitor,
  LogOut,
  Menu,
  X,
  Home,
  Zap,
  Calendar,
  Users,
  Database
} from 'lucide-react';
import { useAuth } from '@/auth';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile: user, logout: signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Detectar mudanças de tamanho da tela e configurar estado inicial
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1280; // Aumentado para xl (1280px)
      setIsMobile(mobile);
      
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Configurar estado inicial
    handleResize();

    // Usar debounce para melhor performance
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const navigationItems = [
    {
      name: 'Dashboard Executivo',
      href: '/super-admin/dashboard',
      icon: LayoutDashboard,
      description: 'KPIs e métricas SaaS'
    },
    {
      name: 'Gestão de Tenants',
      href: '/super-admin/tenants',
      icon: Building2,
      description: 'Administrar prefeituras'
    },
    {
      name: 'Gestão de Usuários',
      href: '/super-admin/users',
      icon: Users,
      description: 'Administrar usuários'
    },
    {
      name: 'Gestão Financeira',
      href: '/super-admin/billing',
      icon: DollarSign,
      description: 'Billing e receitas'
    },
    {
      name: 'Analytics',
      href: '/super-admin/analytics',
      icon: BarChart3,
      description: 'Relatórios empresariais'
    },
    {
      name: 'Monitoramento',
      href: '/super-admin/monitoring',
      icon: Monitor,
      description: 'Sistema técnico'
    },
    {
      name: 'Ferramentas',
      href: '/super-admin/operations',
      icon: Shield,
      description: 'Operações'
    },
    {
      name: 'Configurações',
      href: '/super-admin/settings',
      icon: Settings,
      description: 'Config globais'
    },
    {
      name: 'Schema DB',
      href: '/super-admin/schema',
      icon: Database,
      description: 'Estrutura BD'
    }
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href || (href === '/super-admin/dashboard' && location.pathname === '/super-admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex relative">
      
      {/* Overlay mobile */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 xl:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Sempre fixa */}
      <aside className={`
        ${isSidebarOpen ? 'w-80' : 'w-0 xl:w-16'} 
        fixed left-0 top-0 h-full z-50
        bg-white/90 backdrop-blur-lg border-r border-gray-200/50 shadow-xl
        transition-all duration-300 ease-in-out flex flex-col
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        overflow-hidden
      `}>
        
        {/* Header da Sidebar - Compacto */}
        <header className="flex-shrink-0 p-3 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-blue-600 text-lg">🎛️</span>
                <div className="flex-1">
                  <h1 className="text-sm font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Super Admin
                  </h1>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Online</span>
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4 border-green-200/50">
                      <Zap className="h-2 w-2 mr-1 text-orange-500" />
                      Prod
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            
            {/* Toggle button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/70 p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
              aria-label={isSidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
            >
              {isSidebarOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </header>


        {/* Navegação Principal - Expandida */}
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center w-full rounded-lg transition-all duration-200 
                  ${isSidebarOpen 
                    ? 'gap-2.5 px-2.5 py-2.5' 
                    : 'justify-center p-2.5 xl:p-2'
                  }
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-indigo-600/10 text-blue-700 border border-blue-200/50 shadow-sm ring-1 ring-blue-100/50' 
                    : 'text-gray-700 hover:bg-gray-50/80 hover:text-blue-600 hover:shadow-sm'
                  }
                `}
                title={!isSidebarOpen ? item.name : undefined}
              >
                {/* Icon Container */}
                <div className={`
                  flex items-center justify-center rounded-md transition-all duration-200 flex-shrink-0
                  ${isSidebarOpen ? 'p-1.5' : 'p-1'}
                  ${isActive 
                    ? 'bg-blue-100 text-blue-600 shadow-sm' 
                    : 'bg-gray-100/70 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }
                `}>
                  <IconComponent className={`
                    ${isSidebarOpen ? 'h-4 w-4' : 'h-4 w-4'} 
                    transition-all duration-200
                    ${isActive ? 'text-blue-600' : 'text-current'}
                  `} />
                </div>
                
                {/* Content - só aparece quando sidebar está aberta */}
                {isSidebarOpen && (
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm leading-tight truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 leading-tight truncate mt-0.5">{item.description}</p>
                      </div>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200 ml-2 flex-shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Indicador ativo para sidebar collapsed */}
                {!isSidebarOpen && isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout - Compacto */}
        <footer className={`flex-shrink-0 border-t border-gray-200/50 bg-gray-50/30 ${isSidebarOpen ? 'p-3' : 'p-2'}`}>
          {isSidebarOpen && user && (
            <div className="flex items-center gap-2 mb-2 px-2 py-2 rounded-lg bg-white/70 border border-gray-200/30">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {(user.nome || user.fullName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs leading-tight truncate text-gray-900">
                  {user.nome || user.fullName || 'Super Admin'}
                </p>
                <p className="text-xs text-gray-500 leading-tight truncate">
                  {user.email}
                </p>
              </div>
              <Link
                to="/"
                className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Voltar ao Site"
              >
                <Home className="h-4 w-4" />
              </Link>
            </div>
          )}

          {!isSidebarOpen && user && (
            <div className="flex flex-col items-center gap-2 mb-2">
              <div 
                className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm"
                title={user.nome || user.fullName || user.email}
              >
                {(user.nome || user.fullName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <Link
                to="/"
                className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Voltar ao Site"
              >
                <Home className="h-3 w-3" />
              </Link>
            </div>
          )}
          
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200/50 transition-all duration-200 text-xs py-2"
            title={!isSidebarOpen ? 'Sair' : undefined}
          >
            <LogOut className="h-3 w-3 text-red-600" />
            {isSidebarOpen && <span className="ml-1.5 font-medium">Sair</span>}
          </Button>
        </footer>

      </aside>

      {/* Main Content - com margem esquerda para não ficar atrás da sidebar */}
      <main className={`
        flex-1 flex flex-col min-h-screen overflow-hidden
        ${isMobile 
          ? 'ml-0' 
          : isSidebarOpen 
            ? 'ml-80' 
            : 'ml-16'
        }
        transition-all duration-300 ease-in-out
      `}>
        {/* Header mobile com botão menu */}
        {isMobile && (
          <header className="flex-shrink-0 bg-white/90 backdrop-blur-lg border-b border-gray-200/50 px-4 py-3 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100/70 -ml-2"
              >
                <Menu className="h-5 w-5" />
                <span className="ml-2 font-medium">Menu</span>
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🎛️</span>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Super Admin
                </h1>
              </div>
              <div className="w-16"></div> {/* Spacer para centralizar */}
            </div>
          </header>
        )}
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>

    </div>
  );
};

export default SuperAdminLayout;