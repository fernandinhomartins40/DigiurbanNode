
import { FC } from "react";
import { Edit, LogOut, User } from "lucide-react";
import { useAuth } from '@/auth';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const UserProfile: FC = () => {
  const { profile: user, logout: signOut, isCitizen } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('🔐 Iniciando logout...');
      await signOut();
      console.log('✅ Logout realizado com sucesso');
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handleEditProfile = () => {
    if (isCitizen()) {
      navigate('/cidadao/configuracoes/meu-perfil');
    } else {
      navigate('/admin/configuracoes/meu-perfil');
    }
  };

  const getUserDisplayInfo = () => {
    if (!user) return { name: 'Carregando...', subtitle: '' };
    
    if (user.userType === 'citizen') {
      return {
        name: user.fullName,
        subtitle: 'Cidadão'
      };
    } else {
      // Para servidores, mostrar cargo e tipo
      const cargo = user.position || 'Servidor';
      
      const tipoFormatado = {
        'super_admin': 'Super Administrador',
        'admin': 'Administrador',
        'secretary': 'Secretário',
        'director': 'Diretor',
        'coordinator': 'Coordenador',
        'employee': 'Funcionário',
        'attendant': 'Atendente'
      }[user.userType] || user.userType;
      
      const subtitle = `${tipoFormatado}`;
      
      return {
        name: user.fullName,
        subtitle
      };
    }
  };

  const { name, subtitle } = getUserDisplayInfo();

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center space-x-3">
        <div className="relative">
          {/* Avatar com foto de perfil ou ícone padrão */}
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt="Foto de perfil"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
              onError={(e) => {
                // Se houver erro ao carregar a imagem, mostrar avatar padrão
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-500 ${user?.avatarUrl ? 'hidden' : 'flex'}`}
          >
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={handleEditProfile}
          className="flex items-center justify-center space-x-2 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors w-full dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
        >
          <Edit size={14} />
          <span>Editar perfil</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2 text-xs px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors w-full dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <LogOut size={14} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};
