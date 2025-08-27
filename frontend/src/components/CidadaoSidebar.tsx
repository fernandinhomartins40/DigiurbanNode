import { FC } from "react";
import { Link } from "react-router-dom";
import { SidebarLogo } from "./SidebarLogo";
import { UserProfile } from "./UserProfile";
import { SidebarMenuItem, SidebarMenuGroup } from "./SidebarMenu";
import { useAuth } from '@/auth';
import { useSidebarScroll } from "@/hooks/useSidebarScroll";
import { 
  FileText,
  Star,
  Home,
  Search,
  User,
  Settings
} from "lucide-react";
import { SidebarSubmenu } from "./SidebarMenu";

export const CidadaoSidebar: FC = () => {
  const { sidebarRef, setMenuItemRef } = useSidebarScroll();
  const { profile } = useAuth();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Topo fixo - Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <SidebarLogo />
        </div>
        
        {/* Meio com scroll - Menus */}
        <div ref={sidebarRef} className="mt-5 flex-1 flex flex-col overflow-y-auto">
          {/* Portal do Cidadão */}
          <SidebarMenuGroup title="Portal do Cidadão" icon="🔷">
            <SidebarMenuItem 
              href="/cidadao/" 
              exactMatch={true}
              onSetRef={setMenuItemRef}
              icon={<Home className="mr-3 h-5 w-5 text-blue-500 dark:text-blue-400" />}
            >
              Dashboard
            </SidebarMenuItem>
            
            <SidebarMenuItem 
              href="/cidadao/catalogo-servicos"
              onSetRef={setMenuItemRef}
              icon={<Search className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
            >
              Catálogo de Serviços
            </SidebarMenuItem>
            
            <SidebarMenuItem 
              href="/cidadao/meus-protocolos"
              onSetRef={setMenuItemRef}
              icon={<FileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
            >
              Meus Protocolos
            </SidebarMenuItem>
            
            <SidebarMenuItem 
              href="/cidadao/documentos-pessoais"
              onSetRef={setMenuItemRef}
              icon={<FileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
            >
              Documentos Pessoais
            </SidebarMenuItem>
            
            <SidebarMenuItem 
              href="/cidadao/minhas-avaliacoes"
              onSetRef={setMenuItemRef}
              icon={<Star className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
            >
              Minhas Avaliações
            </SidebarMenuItem>

            <SidebarSubmenu 
              title="Configurações" 
              icon={<Settings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/configuracoes"
            >
              <SidebarMenuItem href="/cidadao/configuracoes/meu-perfil" onSetRef={setMenuItemRef}>
                Meu Perfil
              </SidebarMenuItem>
              <SidebarMenuItem href="/cidadao/configuracoes/trocar-senha" onSetRef={setMenuItemRef}>
                Trocar Senha
              </SidebarMenuItem>
              <SidebarMenuItem href="/cidadao/configuracoes/preferencias-notificacao" onSetRef={setMenuItemRef}>
                Preferências de Notificação
              </SidebarMenuItem>
              <SidebarMenuItem href="/cidadao/configuracoes/idioma-acessibilidade" onSetRef={setMenuItemRef}>
                Idioma e Acessibilidade
              </SidebarMenuItem>
            </SidebarSubmenu>
          </SidebarMenuGroup>
        </div>
        
        {/* Parte inferior fixa - Perfil do usuário */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <UserProfile />
        </div>
      </div>
    </div>
  );
};