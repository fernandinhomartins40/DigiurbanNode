
import { FC, useState } from "react";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from '@/auth';

export const PublicNavbar: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile: user, isLoading: loading } = useAuth();
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    if (user && user.userType !== 'citizen') {
      // Usuário já logado como admin/servidor, vai para dashboard
      navigate('/admin/dashboard');
    } else {
      // Usuário não logado ou é cidadão, vai para login admin
      navigate('/admin/login');
    }
  };

  const handleCidadaoAccess = () => {
    if (user && user.userType === 'citizen') {
      // Usuário já logado como cidadão, vai para dashboard
      navigate('/cidadao/dashboard');
    } else {
      // Usuário não logado ou é admin, vai para login cidadão
      navigate('/cidadao/login');
    }
  };
  
  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-elegant border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold text-gradient gradient-primary bg-clip-text text-transparent">
                Digiurban
              </h1>
            </div>
            <div className="hidden md:block ml-12">
              <div className="flex items-baseline space-x-8">
                <a href="#benefits" className="text-gray-700 hover:text-purple-600 px-4 py-3 text-lg font-medium transition-all duration-300 hover-lift relative group">
                  Benefícios
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
                <a href="#modules" className="text-gray-700 hover:text-purple-600 px-4 py-3 text-lg font-medium transition-all duration-300 hover-lift relative group">
                  Módulos
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
                <a href="#testimonials" className="text-gray-700 hover:text-purple-600 px-4 py-3 text-lg font-medium transition-all duration-300 hover-lift relative group">
                  Depoimentos
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
                <a href="#contact" className="text-gray-700 hover:text-purple-600 px-4 py-3 text-lg font-medium transition-all duration-300 hover-lift relative group">
                  Contato
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleAdminAccess}
              className="hover-lift text-lg px-6 py-3 border-purple-200 text-purple-600 hover:bg-purple-50 shadow-sm"
            >
              {user && user.userType !== 'citizen' ? 'Ir para Painel Admin' : 'Portal Admin'}
            </Button>
            <Button 
              onClick={handleCidadaoAccess}
              className="hover-lift glow-primary text-lg px-6 py-3 gradient-primary text-white shadow-elegant"
            >
              {user && user.userType === 'citizen' ? 'Ir para Meus Serviços' : 'Portal Cidadão'}
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-purple-100 bg-white/95 backdrop-blur-sm">
              <a href="#benefits" className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                Benefícios
              </a>
              <a href="#modules" className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                Módulos
              </a>
              <a href="#testimonials" className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                Depoimentos
              </a>
              <a href="#contact" className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                Contato
              </a>
              <div className="pt-4 border-t border-purple-100 space-y-3">
                <button
                  onClick={handleAdminAccess}
                  className="block w-full px-4 py-3 text-base font-medium text-purple-600 border border-purple-200 rounded-lg text-center hover:bg-purple-50 transition-all"
                >
                  {user && user.userType !== 'citizen' ? 'Ir para Painel Admin' : 'Portal Admin'}
                </button>
                <button
                  onClick={handleCidadaoAccess}
                  className="block w-full px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-center hover:shadow-lg transition-all"
                >
                  {user && user.userType === 'citizen' ? 'Ir para Meus Serviços' : 'Portal Cidadão'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
