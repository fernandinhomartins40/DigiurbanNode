import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { SidebarLogo } from "./SidebarLogo";
import { UserProfile } from "./UserProfile";
import { SidebarMenuItem, SidebarMenuGroup, SidebarSubmenu } from "./SidebarMenu";
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
  MessageSquare,
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
  Palette
} from "lucide-react";

export const MobileSidebar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { sidebarRef, setMenuItemRef } = useSidebarScroll();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile sidebar trigger */}
      <button
        className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={toggleSidebar}
      >
        <svg
          className="h-6 w-6"
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
      </button>

      {/* Backdrop */}
      <div
        className={`md:hidden absolute inset-y-0 left-0 z-40 bg-gray-600 bg-opacity-75 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
        onClick={toggleSidebar}
      ></div>

      {/* Mobile sidebar */}
      <div
        className={`md:hidden absolute inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out flex flex-col h-full`}
      >
        {/* Topo fixo - Logo e Botão de fechar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <SidebarLogo />
            <button
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={toggleSidebar}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Meio com scroll - Menus */}
        <div ref={sidebarRef} className="flex-1 overflow-y-auto py-2">
          <SidebarMenuGroup title="Portal do Cidadão" icon="🔷">
            <SidebarMenuItem 
              href="/" 
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
              Painel do Cidadão
            </SidebarMenuItem>
            

            <SidebarMenuItem 
              href="/catalogo-servicos"
              onSetRef={setMenuItemRef}
              icon={
                <svg
                  className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
              }
            >
              Catálogo de Serviços
            </SidebarMenuItem>
            
            <SidebarMenuItem 
              href="/meus-protocolos"
              onSetRef={setMenuItemRef}
              icon={<FileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
            >
              Meus Protocolos
            </SidebarMenuItem>
            
            <SidebarMenuItem 
              href="/documentos-pessoais"
              onSetRef={setMenuItemRef}
              icon={<FileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
            >
              Documentos Pessoais
            </SidebarMenuItem>
            
            <SidebarMenuItem 
              href="/minhas-avaliacoes"
              onSetRef={setMenuItemRef}
              icon={<Star className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
            >
              Minhas Avaliações
            </SidebarMenuItem>
          </SidebarMenuGroup>

          <div className="px-3 py-2 mt-3">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
              Área Administrativa
            </div>
            
            <SidebarSubmenu 
              title="Gabinete do Prefeito" 
              icon={<Briefcase className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/gabinete"
            >
              <SidebarMenuItem href="/gabinete/atendimentos">
                <Activity className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/admin/gabinete/dashboard">
                <LayoutDashboard className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Dashboard Executivo
              </SidebarMenuItem>
              <SidebarMenuItem href="/gabinete/mapa-demandas">
                <Map className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Mapa de Demandas
              </SidebarMenuItem>
              <SidebarMenuItem href="/gabinete/relatorios-executivos">
                <FileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Relatórios Executivos
              </SidebarMenuItem>
              <SidebarMenuItem href="/gabinete/ordens-setores">
                <FileOutput className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Ordens aos Setores
              </SidebarMenuItem>
              <SidebarMenuItem href="/gabinete/gerenciar-permissoes">
                <Lock className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Gerenciar Permissões
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Correio Interno" 
              icon={<Mail className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/correio"
            >
              <SidebarMenuItem href="/correio/caixa-entrada">
                <MessageSquare className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Caixa de Entrada
              </SidebarMenuItem>
              <SidebarMenuItem href="/correio/caixa-saida">
                <Send className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Caixa de Saída
              </SidebarMenuItem>
              <SidebarMenuItem href="/correio/novo-email">
                <EnvelopeMail className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Novo Email
              </SidebarMenuItem>
              <SidebarMenuItem href="/correio/rascunhos">
                <FileType2 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Rascunhos
              </SidebarMenuItem>
              <SidebarMenuItem href="/correio/lixeira">
                <FileArchive className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Lixeira
              </SidebarMenuItem>
              <SidebarMenuItem href="/correio/biblioteca-modelos">
                <FileType2 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Biblioteca de Modelos
              </SidebarMenuItem>
              <SidebarMenuItem href="/correio/assinaturas-digitais">
                <Signature className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Assinaturas Digitais
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Administração do Sistema" 
              icon={<Settings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/administracao"
            >
              <SidebarMenuItem href="/administracao/gerenciamento-usuarios">
                <UsersRound className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Gerenciamento de Usuários
              </SidebarMenuItem>
              <SidebarMenuItem href="/administracao/perfis-permissoes">
                <ShieldCheck className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Perfis e Permissões
              </SidebarMenuItem>
              <SidebarMenuItem href="/administracao/setores-grupos">
                <Network className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Setores e Grupos
              </SidebarMenuItem>
              <SidebarMenuItem href="/administracao/configuracoes-gerais">
                <FolderCog className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Configurações Gerais
              </SidebarMenuItem>
              <SidebarMenuItem href="/administracao/auditoria-acessos">
                <ScrollText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Auditoria de Acessos
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Relatórios e Indicadores" 
              icon={<BarChart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/relatorios"
            >
              <SidebarMenuItem href="/relatorios/relatorios">
                <FileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Relatórios
              </SidebarMenuItem>
              <SidebarMenuItem href="/relatorios/indicadores-atendimentos">
                <PieChart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Indicadores de Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/relatorios/estatisticas-uso">
                <BarChart3 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Estatísticas de Uso
              </SidebarMenuItem>
              <SidebarMenuItem href="/relatorios/exportacoes">
                <Download className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Exportações (PDF/Excel)
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Configurações do Usuário" 
              icon={<User className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/configuracoes"
            >
              <SidebarMenuItem href="/configuracoes/meu-perfil">
                <UserCircle2 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Meu Perfil
              </SidebarMenuItem>
              <SidebarMenuItem href="/configuracoes/trocar-senha">
                <KeyRound className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Trocar Senha
              </SidebarMenuItem>
              <SidebarMenuItem href="/configuracoes/preferencias-notificacao">
                <BellRing className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Preferências de Notificação
              </SidebarMenuItem>
              <SidebarMenuItem href="/configuracoes/idioma-acessibilidade">
                <Languages className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Idioma e Acessibilidade
              </SidebarMenuItem>
            </SidebarSubmenu>

            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center mt-4">
              Módulos Setoriais
            </div>
            
            <SidebarSubmenu 
              title="Saúde" 
              icon={
                <svg
                  className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  ></path>
                </svg>
              }
              basePath="/saude"
            >
              <SidebarMenuItem href="/saude/atendimentos">
                <Activity className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/saude/agendamentos-medicos">
                <Calendar className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Agendamentos Médicos
              </SidebarMenuItem>
              <SidebarMenuItem href="/saude/controle-medicamentos">
                <Pill className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Controle de Medicamentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/saude/campanhas-saude">
                <Heart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Campanhas de Saúde
              </SidebarMenuItem>
              <SidebarMenuItem href="/saude/programas-saude">
                <Heart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={3} />
                Programas de Saúde
              </SidebarMenuItem>
              <SidebarMenuItem href="/saude/encaminhamentos-tfd">
                <ArrowRightToLine className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Encaminhamentos TFD
              </SidebarMenuItem>
              <SidebarMenuItem href="/saude/exames">
                <TestTube className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Exames
              </SidebarMenuItem>
              <SidebarMenuItem href="/saude/acs">
                <User className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                ACS - Agentes de Saúde
              </SidebarMenuItem>
              <SidebarMenuItem href="/saude/transporte-pacientes">
                <Truck className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Transporte de Pacientes
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Educação" 
              icon={
                <svg
                  className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  ></path>
                </svg>
              }
              basePath="/educacao"
            >
              <SidebarMenuItem href="/educacao/matricula-alunos">
                <Book className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Matrícula de Alunos
              </SidebarMenuItem>
              <SidebarMenuItem href="/educacao/gestao-escolar">
                <School className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Gestão Escolar
              </SidebarMenuItem>
              <SidebarMenuItem href="/educacao/transporte-escolar">
                <Bus className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Transporte Escolar
              </SidebarMenuItem>
              <SidebarMenuItem href="/educacao/merenda-escolar">
                <BookOpenText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Merenda Escolar
              </SidebarMenuItem>
              <SidebarMenuItem href="/educacao/registro-ocorrencias">
                <FileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Registro de Ocorrências
              </SidebarMenuItem>
              <SidebarMenuItem href="/educacao/calendario-escolar">
                <Calendar className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Calendário Escolar
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Assistência Social" 
              icon={<HandHeart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/assistencia-social"
            >
              <SidebarMenuItem href="/assistencia-social/atendimentos">
                <Users className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/assistencia-social/familias-vulneraveis">
                <HandCoins className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Famílias Vulneráveis
              </SidebarMenuItem>
              <SidebarMenuItem href="/assistencia-social/cras-e-creas">
                <Building className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                CRAS e CREAS
              </SidebarMenuItem>
              <SidebarMenuItem href="/assistencia-social/programas-sociais">
                <HandHeart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={3} />
                Programas Sociais
              </SidebarMenuItem>
              <SidebarMenuItem href="/assistencia-social/gerenciamento-beneficios">
                <HandCoins className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={3} />
                Gerenciamento de Benefícios
              </SidebarMenuItem>
              <SidebarMenuItem href="/assistencia-social/entregas-emergenciais">
                <Package className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Entregas Emergenciais
              </SidebarMenuItem>
              <SidebarMenuItem href="/assistencia-social/registro-visitas">
                <FileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Registro de Visitas
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Cultura" 
              icon={<Headphones className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/cultura"
            >
              <SidebarMenuItem href="/cultura/espacos-culturais">
                <Building className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Espaços Culturais
              </SidebarMenuItem>
              <SidebarMenuItem href="/cultura/projetos-culturais">
                <Book className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={3} />
                Projetos Culturais
              </SidebarMenuItem>
              <SidebarMenuItem href="/cultura/eventos">
                <Film className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Eventos Culturais
              </SidebarMenuItem>
              <SidebarMenuItem href="/cultura/grupos-artisticos">
                <Users className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Grupos Artísticos
              </SidebarMenuItem>
              <SidebarMenuItem href="/cultura/manifestacoes-culturais">
                <Palette className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Manifestações Culturais
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Agricultura" 
              icon={<Leaf className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/agricultura"
            >
              <SidebarMenuItem href="/agricultura/atendimentos">
                <Users className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/agricultura/cadastro-produtores">
                <Tractor className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Cadastro de Produtores
              </SidebarMenuItem>
              <SidebarMenuItem href="/agricultura/assistencia-tecnica">
                <Handshake className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Assistência Técnica
              </SidebarMenuItem>
              <SidebarMenuItem href="/agricultura/programas-rurais">
                <Wheat className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Programas Rurais
              </SidebarMenuItem>
              <SidebarMenuItem href="/agricultura/cursos-capacitacoes">
                <Book className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Cursos e Capacitações
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Esportes" 
              icon={<Trophy className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/esportes"
            >
              <SidebarMenuItem href="/esportes/atendimentos">
                <Activity className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/esportes/atletas-professores">
                <UserCheck className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atletas e Professores
              </SidebarMenuItem>
              <SidebarMenuItem href="/esportes/aulas-treinamentos">
                <School className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Aulas e Treinamentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/esportes/campeonatos-competicoes">
                <Trophy className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={3} />
                Campeonatos e Competições
              </SidebarMenuItem>
              <SidebarMenuItem href="/esportes/espacos-esportivos">
                <MapPin className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Espaços Esportivos
              </SidebarMenuItem>
              <SidebarMenuItem href="/esportes/agendamento-espacos">
                <Calendar className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Agendamento de Espaços
              </SidebarMenuItem>
              <SidebarMenuItem href="/esportes/registro-resultados">
                <FileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Registro de Resultados
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Turismo" 
              icon={<Compass className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/turismo"
            >
              <SidebarMenuItem href="/turismo/atendimentos">
                <Activity className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/turismo/pontos-turisticos">
                <Landmark className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Pontos Turísticos
              </SidebarMenuItem>
              <SidebarMenuItem href="/turismo/estabelecimentos-locais">
                <Store className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Estabelecimentos Locais
              </SidebarMenuItem>
              <SidebarMenuItem href="/turismo/programas-turisticos">
                <Compass className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={3} />
                Programas Turísticos
              </SidebarMenuItem>
              <SidebarMenuItem href="/turismo/mapa-turistico">
                <Map className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Mapa Turístico
              </SidebarMenuItem>
              <SidebarMenuItem href="/turismo/informacoes-turisticas">
                <Info className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Informações Turísticas
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Habitação" 
              icon={<Home className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/habitacao"
            >
              <SidebarMenuItem href="/habitacao/atendimentos">
                <Activity className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/habitacao/inscricoes">
                <FileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Inscrições
              </SidebarMenuItem>
              <SidebarMenuItem href="/habitacao/programas-habitacionais">
                <Building className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Programas Habitacionais
              </SidebarMenuItem>
              <SidebarMenuItem href="/habitacao/unidades-habitacionais">
                <Home className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={3} />
                Unidades Habitacionais
              </SidebarMenuItem>
              <SidebarMenuItem href="/habitacao/regularizacao-fundiaria">
                <FileSearch className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Regularização Fundiária
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Meio Ambiente" 
              icon={<Leaf className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/meio-ambiente"
            >
              <SidebarMenuItem href="/meio-ambiente/atendimentos">
                <Activity className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/meio-ambiente/licencas-ambientais">
                <FileBadge className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Licenças
              </SidebarMenuItem>
              <SidebarMenuItem href="/meio-ambiente/registro-denuncias">
                <AlertTriangle className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Registro de Denúncias
              </SidebarMenuItem>
              <SidebarMenuItem href="/meio-ambiente/areas-protegidas">
                <TreeDeciduous className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Cadastro de Áreas Protegidas
              </SidebarMenuItem>
              <SidebarMenuItem href="/meio-ambiente/programas-ambientais">
                <Leaf className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={3} />
                Programas Ambientais
              </SidebarMenuItem>
              <SidebarMenuItem href="/meio-ambiente/campanhas-ambientais">
                <Award className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Campanhas Ambientais
              </SidebarMenuItem>
              <SidebarMenuItem href="/meio-ambiente/indicadores-ambientais">
                <BarChart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Indicadores Ambientais
              </SidebarMenuItem>
              <SidebarMenuItem href="/meio-ambiente/mapa-ocorrencias">
                <Map className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Mapa de Ocorrências
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Planejamento Urbano" 
              icon={<Building className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/planejamento-urbano"
            >
              <SidebarMenuItem href="/planejamento-urbano/atendimentos">
                <Activity className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/planejamento-urbano/aprovacao-projetos">
                <FileSearch className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Aprovação de Projetos
              </SidebarMenuItem>
              <SidebarMenuItem href="/planejamento-urbano/emissao-alvaras">
                <FileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Emissão de Alvarás
              </SidebarMenuItem>
              <SidebarMenuItem href="/planejamento-urbano/reclamacoes-denuncias">
                <MessageSquare className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Reclamações e Denúncias
              </SidebarMenuItem>
              <SidebarMenuItem href="/planejamento-urbano/consultas-publicas">
                <Search className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Consultas Públicas
              </SidebarMenuItem>
              <SidebarMenuItem href="/planejamento-urbano/mapa-urbano">
                <Map className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Mapa Urbano
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Obras Públicas" 
              icon={<Construction className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/obras-publicas"
            >
              <SidebarMenuItem href="/obras-publicas/atendimentos">
                <Activity className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/obras-publicas/obras-intervencoes">
                <Hammer className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Obras e Pequenas Intervenções
              </SidebarMenuItem>
              <SidebarMenuItem href="/obras-publicas/progresso-obras">
                <BarChart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Progresso de Obras
              </SidebarMenuItem>
              <SidebarMenuItem href="/obras-publicas/mapa-obras">
                <Map className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Mapa de Obras
              </SidebarMenuItem>
              <SidebarMenuItem href="/obras-publicas/feedback-cidadaos">
                <MessageSquare className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Feedback dos Cidadãos
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Serviços Públicos" 
              icon={<Construction className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/servicos-publicos"
            >
              <SidebarMenuItem href="/servicos-publicos/atendimentos">
                <Activity className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/servicos-publicos/iluminacao-publica">
                <Lightbulb className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Iluminação Pública
              </SidebarMenuItem>
              <SidebarMenuItem href="/servicos-publicos/limpeza-urbana">
                <Trash2 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Limpeza Urbana
              </SidebarMenuItem>
              <SidebarMenuItem href="/servicos-publicos/coleta-especial">
                <Box className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Coleta Especial
              </SidebarMenuItem>
              <SidebarMenuItem href="/servicos-publicos/problemas-com-foto">
                <Image className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Problemas com Foto
              </SidebarMenuItem>
              <SidebarMenuItem href="/servicos-publicos/programacao-equipes">
                <Calendar className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Programação de Equipes
              </SidebarMenuItem>
            </SidebarSubmenu>

            <SidebarSubmenu 
              title="Segurança Pública" 
              icon={<Shield className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />}
              basePath="/seguranca-publica"
            >
              <SidebarMenuItem href="/seguranca-publica/atendimentos">
                <Activity className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Atendimentos
              </SidebarMenuItem>
              <SidebarMenuItem href="/seguranca-publica/registro-ocorrencias">
                <FileCheck className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Registro de Ocorrências
              </SidebarMenuItem>
              <SidebarMenuItem href="/seguranca-publica/apoio-guarda">
                <BadgeHelp className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Apoio da Guarda
              </SidebarMenuItem>
              <SidebarMenuItem href="/seguranca-publica/mapa-pontos-criticos">
                <Map className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Mapa de Pontos Críticos
              </SidebarMenuItem>
              <SidebarMenuItem href="/seguranca-publica/alertas-seguranca">
                <Bell className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Alertas de Segurança
              </SidebarMenuItem>
              <SidebarMenuItem href="/seguranca-publica/estatisticas-regionais">
                <BarChart className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Estatísticas Regionais
              </SidebarMenuItem>
              <SidebarMenuItem href="/seguranca-publica/vigilancia-integrada">
                <Radio className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Vigilância Integrada
              </SidebarMenuItem>
            </SidebarSubmenu>
          </div>
        </div>
        
        {/* Parte inferior fixa - Perfil do usuário */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <UserProfile />
        </div>
      </div>
    </>
  );
};
