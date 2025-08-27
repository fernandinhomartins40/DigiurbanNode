import { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from '@/auth';
import { toast } from "sonner";

export const Footer: FC = () => {
  const { profile: user, isLoading: loading } = useAuth();
  const navigate = useNavigate();

  // Debug do estado loading
  console.log('🔄 [FOOTER-DEBUG] Estado loading no Footer:', loading);
  console.log('👤 [FOOTER-DEBUG] Usuario no Footer:', user ? user.role : 'null');

  const handleSuperAdminAccess = () => {
    // 🎯 LÓGICA CORRIGIDA
    if (user && user.role === 'super_admin') {
      // Já autenticado como super admin
      navigate('/super-admin/dashboard');
    } else if (user) {
      // Autenticado como outro tipo - verificar se tem acesso super admin
      if (['admin', 'super_admin'].includes(user.role)) {
        navigate('/super-admin/dashboard');
      } else {
        // Não tem acesso super admin
        toast.error('Acesso restrito apenas para Super Administradores');
      }
    } else {
      // Não autenticado - ir para formulário dedicado de super admin
      navigate('/super-admin/login');
    }
  };

  const handleAdminAccess = () => {
    if (user) {
      // Já autenticado - ir para dashboard apropriado
      if (user.role === 'super_admin') {
        navigate('/super-admin/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      // Não autenticado - ir para login admin
      navigate('/admin/login');
    }
  };

  const handleCidadaoAccess = () => {
    if (user && user.role === 'citizen') {
      navigate('/cidadao/dashboard');
    } else {
      navigate('/cidadao/login');
    }
  };

  return (
    <footer id="contact" className="gradient-primary text-white py-24 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-48 h-48 gradient-accent rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 gradient-secondary rounded-full opacity-10 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 gradient-warm rounded-full opacity-5 animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 animate-slide-up">
            <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">
              Digiurban
            </h3>
            <p className="text-white/90 mb-8 max-w-md text-lg leading-relaxed drop-shadow-md">
              A plataforma completa para modernizar a gestão municipal e conectar 
              cidadãos com os serviços públicos de forma eficiente e transparente.
            </p>
            <div className="text-white/70 text-lg">
              <p>© 2024 Digiurban. Todos os direitos reservados.</p>
            </div>
          </div>
          
          <div className="animate-fade-in-delay" style={{animationDelay: '0.1s'}}>
            <h4 className="text-xl font-bold mb-6 text-white drop-shadow-md">Produto</h4>
            <ul className="space-y-4 text-white/80">
              <li><a href="#benefits" className="hover:text-yellow-300 transition-all duration-300 hover-lift text-lg relative group">
                Benefícios
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 to-cyan-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a></li>
              <li><a href="#modules" className="hover:text-yellow-300 transition-all duration-300 hover-lift text-lg relative group">
                Módulos
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 to-cyan-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a></li>
              <li><button onClick={handleAdminAccess} disabled={loading} className="hover:text-yellow-300 transition-all duration-300 hover-lift text-lg relative group disabled:opacity-50">
                {user && user.tipo_usuario !== 'cidadao' ? 'Ir para Painel Admin' : 'Portal Admin'}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 to-cyan-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </button></li>
              <li><button onClick={handleCidadaoAccess} disabled={loading} className="hover:text-yellow-300 transition-all duration-300 hover-lift text-lg relative group disabled:opacity-50">
                {user && user.tipo_usuario === 'cidadao' ? 'Ir para Meus Serviços' : 'Portal Cidadão'}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 to-cyan-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </button></li>
            </ul>
          </div>
          
          <div className="animate-fade-in-delay" style={{animationDelay: '0.2s'}}>
            <h4 className="text-xl font-bold mb-6 text-white drop-shadow-md">Suporte</h4>
            <ul className="space-y-4 text-white/80">
              <li><a href="#contact" className="hover:text-yellow-300 transition-all duration-300 hover-lift text-lg relative group">
                Central de Ajuda
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 to-cyan-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a></li>
              <li><a href="#testimonials" className="hover:text-yellow-300 transition-all duration-300 hover-lift text-lg relative group">
                Depoimentos
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 to-cyan-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a></li>
              <li><a href="#contact" className="hover:text-yellow-300 transition-all duration-300 hover-lift text-lg relative group">
                Contato
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 to-cyan-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a></li>
              <li><a href="tel:(11)99999999" className="hover:text-yellow-300 transition-all duration-300 hover-lift text-lg relative group">
                (11) 9999-9999
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 to-cyan-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/30 flex flex-col sm:flex-row justify-between items-center animate-fade-in-delay">
          <div className="text-white/70 text-lg">
            <a href="#" className="hover:text-yellow-300 mr-8 transition-all duration-300 hover-lift">Política de Privacidade</a>
            <a href="#" className="hover:text-yellow-300 mr-8 transition-all duration-300 hover-lift">Termos de Uso</a>
            <a href="#" className="hover:text-yellow-300 transition-all duration-300 hover-lift">Cookies</a>
            {user && user.email === 'fernandinhomartins040@gmail.com' && (
              <button 
                onClick={handleSuperAdminAccess}
                className="ml-8 text-xs text-white/50 hover:text-white/80 transition-all duration-300"
                title="Super Painel Administrativo"
              >
                ⚙️
              </button>
            )}
          </div>
          <div className="mt-6 sm:mt-0 flex gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleAdminAccess}
              className="hover-lift bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:text-white hover:border-white/50 text-lg px-6 py-3 transition-all"
            >
              {user && user.role !== 'citizen' ? 'Ir para Painel Admin' : 'Acesso Administrativo'}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleSuperAdminAccess}
              className="hover-lift bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm text-purple-200 border-purple-400/50 hover:bg-gradient-to-r hover:from-purple-600/40 hover:to-indigo-600/40 hover:text-white hover:border-purple-300 text-lg px-6 py-3 transition-all shadow-lg"
            >
              🔐 Super Admin
            </Button>
            <Button 
              size="lg" 
              onClick={handleCidadaoAccess}
              className="hover-lift glow-primary text-lg px-6 py-3 bg-white text-purple-600 hover:bg-white/90 shadow-glow"
            >
              {user && user.role === 'citizen' ? 'Ir para Meus Serviços' : 'Portal Cidadão'}
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
