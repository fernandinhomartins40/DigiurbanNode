
import { FC } from "react";
import { 
  Shield, 
  FileText, 
  Users, 
  MapPin, 
  AlertTriangle, 
  BarChart3, 
  Camera 
} from "lucide-react";
import { SidebarMenuItem } from "./SidebarMenu/SidebarMenuItem";
import { SidebarMenuGroup } from "./SidebarMenu/SidebarMenuGroup";

export const SegurancaPublicaMenu: FC = () => {
  return (
    <SidebarMenuGroup title="Segurança Pública" icon={<Shield className="h-4 w-4" />}>
      <SidebarMenuItem 
        href="/seguranca-publica/atendimentos"
        icon={<Shield className="mr-3 h-5 w-5" />}
      >
        Atendimentos
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/seguranca-publica/registro-ocorrencias"
        icon={<FileText className="mr-3 h-5 w-5" />}
      >
        Registro de Ocorrências
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/seguranca-publica/apoio-guarda"
        icon={<Users className="mr-3 h-5 w-5" />}
      >
        Apoio da Guarda
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/seguranca-publica/mapa-pontos-criticos"
        icon={<MapPin className="mr-3 h-5 w-5" />}
      >
        Mapa de Pontos Críticos
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/seguranca-publica/alertas-seguranca"
        icon={<AlertTriangle className="mr-3 h-5 w-5" />}
      >
        Alertas de Segurança
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/seguranca-publica/estatisticas-regionais"
        icon={<BarChart3 className="mr-3 h-5 w-5" />}
      >
        Estatísticas Regionais
      </SidebarMenuItem>
      <SidebarMenuItem 
        href="/seguranca-publica/vigilancia-integrada"
        icon={<Camera className="mr-3 h-5 w-5" />}
      >
        Vigilância Integrada
      </SidebarMenuItem>
    </SidebarMenuGroup>
  );
};

// Export the individual components for backward compatibility
export { SidebarMenuItem } from "./SidebarMenu/SidebarMenuItem";
export { SidebarMenuGroup } from "./SidebarMenu/SidebarMenuGroup";
export { SidebarSubmenu } from "./SidebarMenu/SidebarSubmenu";
