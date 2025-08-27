import { FC } from "react";
import { Link } from "react-router-dom";
import { SidebarLogo } from "./SidebarLogo";
import { UserProfile } from "./UserProfile";
import { SidebarMenuItem, SidebarMenuGroup, SidebarSubmenu } from "./SidebarMenu";
import { PermissionAwareSidebarMenuItem } from "./SidebarMenu/PermissionAwareSidebarMenuItem";
import { PermissionAwareSidebarSubmenu } from "./SidebarMenu/PermissionAwareSidebarSubmenu";
import { useAuth } from '@/auth';
import { useSidebarScroll } from "@/hooks/useSidebarScroll";
import { 
  Activity, 
  Calendar, 
  Pill, 
  Heart, 
  ArrowRightToLine, 
  TestTube, 
  User, 
  Truck,
  Book,
  School,
  Bus, 
  FileText,
  BookOpenText,
  Users,
  HandHeart,
  Building,
  HandCoins,
  Package,
  Bell,
  Leaf,
  Tractor,
  Handshake,
  Wheat,
  Trophy,
  MapPin,
  UserCheck,
  Headphones,
  Film,
  Compass,
  Landmark,
  Store,
  Map,
  Info,
  Home,
  FileSearch,
  FileBadge,
  AlertTriangle,
  TreeDeciduous,
  Award,
  LucideLeafyGreen,
  BarChart,
  FileWarning,
  Search,
  Clock,
  Car,
  Signpost,
  Construction,
  Hammer,
  Camera,
  Lightbulb, 
  Trash2, 
  Box, 
  Image,
  Shield,
  FileCheck,
  BadgeHelp,
  Radio,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Calculator,
  TrendingUp,
  ShoppingCart,
  ClipboardList,
  ShoppingBag,
  Briefcase,
  BadgeCheck,
  UserPlus,
  ListChecks,
  Mail,
  Presentation,
  GraduationCap,
  Settings,
  Eye,
  LayoutDashboard,
  FileOutput,
  UserCog,
  KeyRound,
  Lock,
  BellRing,
  Languages,
  Network,
  UsersRound,
  ShieldCheck,
  FolderCog,
  ScrollText,
  Mail as EnvelopeMail,
  Send,
  FileType2,
  Signature,
  FileArchive,
  PieChart,
  BarChart3,
  Download,
  UserCircle2,
  Star,
  Palette,
  Wrench
} from "lucide-react";

export const Sidebar: FC = () => {
  const { sidebarRef, setMenuItemRef } = useSidebarScroll();
  const { profile: user, isCitizen } = useAuth();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Topo fixo - Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <SidebarLogo />
        </div>
        
        {/* Meio com scroll - Menus */}
        <div ref={sidebarRef} className="mt-5 flex-1 flex flex-col overflow-y-auto">
          {/* Painel Administrativo */}
          <SidebarMenuGroup title="Painel Administrativo" icon="🔷">
            <SidebarMenuItem 
              href="/admin" 
              exactMatch={true}
              onSetRef={setMenuItemRef}
              icon={
                <svg
                  className="mr-3 h-5 w-5 text-blue-500 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h7"
                  ></path>
                </svg>
              }
            >
              Painel Administrativo
            </SidebarMenuItem>
            

          </SidebarMenuGroup>

          
          {/* Área Administrativa - apenas para servidores */}
          {!isCitizen() && (
            <div className="px-3 py-2 mt-3">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
                Área Administrativa
              </div>
            
            <PermissionAwareSidebarSubmenu 
              title="Gabinete do Prefeito" 
              icon={<Briefcase className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/gabinete"
              allowedUserTypes={['super_admin', 'admin', 'secretario']}
            >
              <PermissionAwareSidebarMenuItem 
                href="/admin/gabinete/atendimentos" 
                onSetRef={setMenuItemRef}
                allowedUserTypes={['super_admin', 'admin', 'secretario']}
              >
                Atendimentos
              </PermissionAwareSidebarMenuItem>
              <PermissionAwareSidebarMenuItem 
                href="/admin/gabinete/dashboard" 
                onSetRef={setMenuItemRef}
                allowedUserTypes={['super_admin', 'admin', 'secretario']}
              >
                Dashboard Executivo
              </PermissionAwareSidebarMenuItem>
              <PermissionAwareSidebarMenuItem 
                href="/admin/gabinete/mapa-demandas" 
                onSetRef={setMenuItemRef}
                allowedUserTypes={['super_admin', 'admin', 'secretario']}
              >
                Mapa de Demandas
              </PermissionAwareSidebarMenuItem>
              <PermissionAwareSidebarMenuItem 
                href="/admin/gabinete/relatorios-executivos" 
                onSetRef={setMenuItemRef}
                allowedUserTypes={['super_admin', 'admin', 'secretario']}
              >
                Relatórios Executivos
              </PermissionAwareSidebarMenuItem>
              <PermissionAwareSidebarMenuItem 
                href="/admin/gabinete/ordens-setores" 
                onSetRef={setMenuItemRef}
                allowedUserTypes={['super_admin', 'admin']}
              >
                Ordens aos Setores
              </PermissionAwareSidebarMenuItem>
              <PermissionAwareSidebarMenuItem 
                href="/admin/gabinete/gerenciar-permissoes" 
                onSetRef={setMenuItemRef}
                allowedUserTypes={['super_admin']}
              >
                Gerenciar Permissões
              </PermissionAwareSidebarMenuItem>
            </PermissionAwareSidebarSubmenu>

            
            <SidebarSubmenu 
              title="Correio Interno" 
              icon={<Mail className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/correio"
            >
              <SidebarMenuItem href="/admin/correio/caixa-entrada" onSetRef={setMenuItemRef}>
                Caixa de Entrada
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/correio/caixa-saida" onSetRef={setMenuItemRef}>
                Caixa de Saída
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/correio/novo-email" onSetRef={setMenuItemRef}>
                Novo Email
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/correio/rascunhos" onSetRef={setMenuItemRef}>
                Rascunhos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/correio/lixeira" onSetRef={setMenuItemRef}>
                Lixeira
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/correio/biblioteca-modelos" onSetRef={setMenuItemRef}>
                Biblioteca de Modelos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/correio/assinaturas-digitais" onSetRef={setMenuItemRef}>
                Assinaturas Digitais
              </SidebarMenuItem>
            </SidebarSubmenu>

            <PermissionAwareSidebarSubmenu 
              title="Administração do Sistema" 
              icon={<Settings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/administracao"
              allowedUserTypes={['super_admin', 'admin']}
            >
              <PermissionAwareSidebarMenuItem 
                href="/admin/administracao/gerenciamento-usuarios" 
                onSetRef={setMenuItemRef}
                allowedUserTypes={['super_admin', 'admin']}
              >
                Gerenciamento de Usuários
              </PermissionAwareSidebarMenuItem>
              <PermissionAwareSidebarMenuItem 
                href="/admin/administracao/perfis-permissoes" 
                onSetRef={setMenuItemRef}
                allowedUserTypes={['super_admin']}
              >
                Perfis e Permissões
              </PermissionAwareSidebarMenuItem>
              <PermissionAwareSidebarMenuItem 
                href="/admin/administracao/setores-grupos" 
                onSetRef={setMenuItemRef}
                allowedUserTypes={['super_admin', 'admin']}
              >
                Setores e Grupos
              </PermissionAwareSidebarMenuItem>
              <PermissionAwareSidebarMenuItem 
                href="/admin/administracao/configuracoes-gerais" 
                onSetRef={setMenuItemRef}
                allowedUserTypes={['super_admin']}
              >
                Configurações Gerais
              </PermissionAwareSidebarMenuItem>
              <PermissionAwareSidebarMenuItem 
                href="/admin/administracao/auditoria-acessos" 
                onSetRef={setMenuItemRef}
                allowedUserTypes={['super_admin', 'admin']}
              >
                Auditoria de Acessos
              </PermissionAwareSidebarMenuItem>
            </PermissionAwareSidebarSubmenu>

            <SidebarSubmenu 
              title="Relatórios e Indicadores" 
              icon={<BarChart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/relatorios"
            >
              <SidebarMenuItem href="/admin/relatorios/relatorios" onSetRef={setMenuItemRef}>
                Relatórios
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/relatorios/indicadores-atendimentos" onSetRef={setMenuItemRef}>
                Indicadores de Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/relatorios/estatisticas-uso" onSetRef={setMenuItemRef}>
                Estatísticas de Uso
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/relatorios/exportacoes" onSetRef={setMenuItemRef}>
                Exportações (PDF/Excel)
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Configurações do Usuário" 
              icon={<User className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/configuracoes"
            >
              <SidebarMenuItem href="/admin/configuracoes/meu-perfil" onSetRef={setMenuItemRef}>
                Meu Perfil
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/configuracoes/trocar-senha" onSetRef={setMenuItemRef}>
                Trocar Senha
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/configuracoes/preferencias-notificacao" onSetRef={setMenuItemRef}>
                Preferências de Notificação
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/configuracoes/idioma-acessibilidade" onSetRef={setMenuItemRef}>
                Idioma e Acessibilidade
              </SidebarMenuItem>
            </SidebarSubmenu>

              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center mt-4">
                Módulos Setoriais
              </div>
            
            <SidebarSubmenu 
              title="Saúde" 
              icon={<Heart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/saude"
            >
              <SidebarMenuItem href="/admin/saude/atendimentos" onSetRef={setMenuItemRef}>
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/saude/agendamentos-medicos" onSetRef={setMenuItemRef}>
                Agendamentos Médicos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/saude/controle-medicamentos" onSetRef={setMenuItemRef}>
                Controle de Medicamentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/saude/campanhas-saude" onSetRef={setMenuItemRef}>
                Campanhas de Saúde
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/saude/programas-saude" onSetRef={setMenuItemRef}>
                Programas de Saúde
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/saude/encaminhamentos-tfd" onSetRef={setMenuItemRef}>
                Encaminhamentos TFD
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/saude/exames" onSetRef={setMenuItemRef}>
                Exames
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/saude/acs" onSetRef={setMenuItemRef}>
                ACS - Agentes de Saúde
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/saude/transporte-pacientes" onSetRef={setMenuItemRef}>
                Transporte de Pacientes
              </SidebarMenuItem>
            </SidebarSubmenu>

            
            <SidebarSubmenu 
              title="Educação" 
              icon={<Book className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/educacao"
            >
              <SidebarMenuItem href="/admin/educacao/matricula-alunos" onSetRef={setMenuItemRef}>
                Matrícula de Alunos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/educacao/gestao-escolar" onSetRef={setMenuItemRef}>
                Gestão Escolar
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/educacao/transporte-escolar" onSetRef={setMenuItemRef}>
                Transporte Escolar
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/educacao/merenda-escolar" onSetRef={setMenuItemRef}>
                Merenda Escolar
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/educacao/registro-ocorrencias" onSetRef={setMenuItemRef}>
                Registro de Ocorrências
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/educacao/calendario-escolar" onSetRef={setMenuItemRef}>
                Calendário Escolar
              </SidebarMenuItem>
            </SidebarSubmenu>

            
            <SidebarSubmenu 
              title="Assistência Social" 
              icon={<HandHeart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/assistencia-social"
            >
              <SidebarMenuItem href="/admin/assistencia-social/atendimentos" onSetRef={setMenuItemRef}>
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/assistencia-social/familias-vulneraveis" onSetRef={setMenuItemRef}>
                Famílias Vulneráveis
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/assistencia-social/cras-e-creas" onSetRef={setMenuItemRef}>
                CRAS e CREAS
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/assistencia-social/programas-sociais" onSetRef={setMenuItemRef}>
                Programas Sociais
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/assistencia-social/gerenciamento-beneficios" onSetRef={setMenuItemRef}>
                Gerenciamento de Benefícios
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/assistencia-social/entregas-emergenciais" onSetRef={setMenuItemRef}>
                Entregas Emergenciais
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/assistencia-social/registro-visitas" onSetRef={setMenuItemRef}>
                Registro de Visitas
              </SidebarMenuItem>
            </SidebarSubmenu>

            
            <SidebarSubmenu 
              title="Cultura" 
              icon={<Headphones className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/cultura"
            >
              <SidebarMenuItem href="/admin/cultura/espacos-culturais" onSetRef={setMenuItemRef}>
                Espaços Culturais
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/cultura/projetos-culturais" onSetRef={setMenuItemRef}>
                Projetos Culturais
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/cultura/eventos" onSetRef={setMenuItemRef}>
                Eventos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/cultura/grupos-artisticos" onSetRef={setMenuItemRef}>
                Grupos Artísticos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/cultura/oficinas-cursos" onSetRef={setMenuItemRef}>
                Oficinas e Cursos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/cultura/manifestacoes-culturais" onSetRef={setMenuItemRef}>
                Manifestações Culturais
              </SidebarMenuItem>
            </SidebarSubmenu>

            
            <SidebarSubmenu 
              title="Segurança Pública" 
              icon={<Shield className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/seguranca-publica"
            >
              <SidebarMenuItem href="/admin/seguranca-publica/atendimentos" onSetRef={setMenuItemRef}>
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/seguranca-publica/registro-ocorrencias" onSetRef={setMenuItemRef}>
                Registro de Ocorrências
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/seguranca-publica/apoio-guarda" onSetRef={setMenuItemRef}>
                Apoio da Guarda
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/seguranca-publica/mapa-pontos-criticos" onSetRef={setMenuItemRef}>
                Mapa de Pontos Críticos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/seguranca-publica/alertas-seguranca" onSetRef={setMenuItemRef}>
                Alertas de Segurança
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/seguranca-publica/estatisticas-regionais" onSetRef={setMenuItemRef}>
                Estatísticas Regionais
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/seguranca-publica/vigilancia-integrada" onSetRef={setMenuItemRef}>
                Vigilância Integrada
              </SidebarMenuItem>
            </SidebarSubmenu>

            {/* Continue with other submenus, each with proper basePath */}
            <SidebarSubmenu 
              title="Planejamento Urbano" 
              icon={<Building className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/planejamento-urbano"
            >
              <SidebarMenuItem href="/admin/planejamento-urbano/atendimentos" onSetRef={setMenuItemRef}>
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/planejamento-urbano/aprovacao-projetos" onSetRef={setMenuItemRef}>
                Aprovação de Projetos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/planejamento-urbano/emissao-alvaras" onSetRef={setMenuItemRef}>
                Emissão de Alvarás
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/planejamento-urbano/reclamacoes-denuncias" onSetRef={setMenuItemRef}>
                Reclamações e Denúncias
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/planejamento-urbano/consultas-publicas" onSetRef={setMenuItemRef}>
                Consultas Públicas
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/planejamento-urbano/mapa-urbano" onSetRef={setMenuItemRef}>
                Mapa Urbano
              </SidebarMenuItem>
            </SidebarSubmenu>

            {/* Add placeholder submenus for other modules with proper basePaths */}
            <SidebarSubmenu 
              title="Agricultura" 
              icon={<Leaf className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/agricultura"
            >
              <SidebarMenuItem href="/admin/agricultura/atendimentos" onSetRef={setMenuItemRef}>
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/agricultura/cadastro-produtores" onSetRef={setMenuItemRef}>
                Cadastro de Produtores
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/agricultura/assistencia-tecnica" onSetRef={setMenuItemRef}>
                Assistência Técnica
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/agricultura/programas-rurais" onSetRef={setMenuItemRef}>
                Programas Rurais
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/agricultura/cursos-capacitacoes" onSetRef={setMenuItemRef}>
                Cursos e Capacitações
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Esportes" 
              icon={<Trophy className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/esportes"
            >
              <SidebarMenuItem href="/admin/esportes/atendimentos" onSetRef={setMenuItemRef}>
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/esportes/equipes-esportivas" onSetRef={setMenuItemRef}>
                Equipes Esportivas
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/esportes/competicoes-torneios" onSetRef={setMenuItemRef}>
                Competições e Torneios
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/esportes/atletas-federados" onSetRef={setMenuItemRef}>
                Atletas Federados
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/esportes/escolinhas-esportivas" onSetRef={setMenuItemRef}>
                Escolinhas Esportivas
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/esportes/eventos-esportivos" onSetRef={setMenuItemRef}>
                Eventos Esportivos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/esportes/infraestrutura-esportiva" onSetRef={setMenuItemRef}>
                Infraestrutura Esportiva
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Turismo" 
              icon={<Compass className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/turismo"
            >
              <SidebarMenuItem href="/admin/turismo/atendimentos" onSetRef={setMenuItemRef}>
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/turismo/pontos-turisticos" onSetRef={setMenuItemRef}>
                Pontos Turísticos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/turismo/estabelecimentos-locais" onSetRef={setMenuItemRef}>
                Estabelecimentos Locais
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/turismo/programas-turisticos" onSetRef={setMenuItemRef}>
                Programas Turísticos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/turismo/mapa-turistico" onSetRef={setMenuItemRef}>
                Mapa Turístico
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/turismo/informacoes-turisticas" onSetRef={setMenuItemRef}>
                Informações Turísticas
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Habitação" 
              icon={<Home className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/habitacao"
            >
              <SidebarMenuItem href="/admin/habitacao/atendimentos" onSetRef={setMenuItemRef}>
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/habitacao/inscricoes" onSetRef={setMenuItemRef}>
                Inscrições
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/habitacao/programas-habitacionais" onSetRef={setMenuItemRef}>
                Programas Habitacionais
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/habitacao/unidades-habitacionais" onSetRef={setMenuItemRef}>
                Unidades Habitacionais
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/habitacao/regularizacao-fundiaria" onSetRef={setMenuItemRef}>
                Regularização Fundiária
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Meio Ambiente" 
              icon={<TreeDeciduous className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/meio-ambiente"
            >
              <SidebarMenuItem href="/admin/meio-ambiente/atendimentos" onSetRef={setMenuItemRef}>
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/meio-ambiente/licencas-ambientais" onSetRef={setMenuItemRef}>
                Licenças Ambientais
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/meio-ambiente/registro-denuncias" onSetRef={setMenuItemRef}>
                Registro de Denúncias
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/meio-ambiente/areas-protegidas" onSetRef={setMenuItemRef}>
                Áreas Protegidas
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/meio-ambiente/programas-ambientais" onSetRef={setMenuItemRef}>
                Programas Ambientais
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Obras Públicas" 
              icon={<Construction className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/obras-publicas"
            >
              <SidebarMenuItem href="/admin/obras-publicas/atendimentos" onSetRef={setMenuItemRef}>
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/obras-publicas/obras-intervencoes" onSetRef={setMenuItemRef}>
                Obras e Intervenções
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/obras-publicas/progresso-obras" onSetRef={setMenuItemRef}>
                Progresso de Obras
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/obras-publicas/mapa-obras" onSetRef={setMenuItemRef}>
                Mapa de Obras
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Serviços Públicos" 
              icon={<Wrench className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/servicos-publicos"
            >
              <SidebarMenuItem href="/admin/servicos-publicos/atendimentos" onSetRef={setMenuItemRef}>
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/servicos-publicos/iluminacao-publica" onSetRef={setMenuItemRef}>
                Iluminação Pública
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/servicos-publicos/limpeza-urbana" onSetRef={setMenuItemRef}>
                Limpeza Urbana
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/servicos-publicos/coleta-especial" onSetRef={setMenuItemRef}>
                Coleta Especial
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/servicos-publicos/problemas-com-foto" onSetRef={setMenuItemRef}>
                Problemas com Foto
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/servicos-publicos/programacao-equipes" onSetRef={setMenuItemRef}>
                Programação de Equipes
              </SidebarMenuItem>
            </SidebarSubmenu>
            </div>
          )}
        </div>
        
        {/* Parte inferior fixa - Perfil do usuário */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <UserProfile />
        </div>
      </div>
    </div>
  );
};
