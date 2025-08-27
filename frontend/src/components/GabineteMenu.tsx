
import { FC } from "react";
import { SidebarMenuGroup, SidebarMenuItem } from "./SidebarMenu";
import { 
  Eye, 
  Users, 
  FileText, 
  MapPin, 
  ClipboardList,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  FileSearch,
  Bell
} from "lucide-react";

export const GabineteMenu: FC = () => {
  return (
    <SidebarMenuGroup title="Gabinete do Prefeito" icon={<Eye className="h-4 w-4" />}>
      <SidebarMenuItem 
        href="/admin/gabinete/dashboard"
        icon={<BarChart3 className="mr-3 h-5 w-5" />}
      >
        Dashboard Executivo
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/atendimentos"
        icon={<Users className="mr-3 h-5 w-5" />}
      >
        Atendimentos
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/gerenciar-alertas"
        icon={<Bell className="mr-3 h-5 w-5" />}
      >
        Alertas e Mensagens
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/ordens-setores"
        icon={<FileText className="mr-3 h-5 w-5" />}
      >
        Ordens aos Setores
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/mapa-demandas"
        icon={<MapPin className="mr-3 h-5 w-5" />}
      >
        Mapa de Demandas
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/projetos-estrategicos"
        icon={<ClipboardList className="mr-3 h-5 w-5" />}
      >
        Projetos Estratégicos
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/agenda-executiva"
        icon={<Calendar className="mr-3 h-5 w-5" />}
      >
        Agenda Executiva
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/relatorios-executivos"
        icon={<BarChart3 className="mr-3 h-5 w-5" />}
      >
        Relatórios Executivos
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/monitoramento-kpis"
        icon={<BarChart3 className="mr-3 h-5 w-5" />}
      >
        Monitoramento de KPIs
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/comunicacao-oficial"
        icon={<FileText className="mr-3 h-5 w-5" />}
      >
        Comunicação Oficial
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/auditoria-transparencia"
        icon={<FileSearch className="mr-3 h-5 w-5" />}
      >
        Auditoria e Transparência
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/gerenciar-permissoes"
        icon={<Shield className="mr-3 h-5 w-5" />}
      >
        Gerenciar Permissões
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/gabinete/configuracoes-sistema"
        icon={<Settings className="mr-3 h-5 w-5" />}
      >
        Configurações do Sistema
      </SidebarMenuItem>
    </SidebarMenuGroup>
  );
};
