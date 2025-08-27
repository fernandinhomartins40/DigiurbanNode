import { FC } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  active?: boolean;
}

const routeLabels: Record<string, string> = {
  // Rotas principais
  '/admin': 'Painel Administrativo',
  '/admin/dashboard': 'Painel Administrativo',
  '/cidadao': 'Portal do Cidadão',
  '/cidadao/dashboard': 'Portal do Cidadão',
  
  
  // Gabinete
  '/gabinete': 'Gabinete do Prefeito',
  '/gabinete/atendimentos': 'Atendimentos',
  '/gabinete/visao-geral': 'Visão Geral',
  '/gabinete/gerenciar-alertas': 'Gerenciar Alertas',
  '/gabinete/mapa-demandas': 'Mapa de Demandas',
  '/gabinete/relatorios-executivos': 'Relatórios Executivos',
  '/gabinete/ordens-setores': 'Ordens aos Setores',
  '/gabinete/gerenciar-permissoes': 'Gerenciar Permissões',
  '/gabinete/projetos-estrategicos': 'Projetos Estratégicos',
  '/gabinete/agenda-executiva': 'Agenda Executiva',
  '/gabinete/monitoramento-kpis': 'Monitoramento KPIs',
  '/gabinete/comunicacao-oficial': 'Comunicação Oficial',
  '/gabinete/auditoria-transparencia': 'Auditoria e Transparência',
  '/gabinete/configuracoes-sistema': 'Configurações do Sistema',
  
  // Administração
  '/administracao': 'Administração do Sistema',
  '/administracao/gerenciamento-usuarios': 'Gerenciamento de Usuários',
  '/administracao/perfis-permissoes': 'Perfis e Permissões',
  '/administracao/setores-grupos': 'Setores e Grupos',
  '/administracao/configuracoes-gerais': 'Configurações Gerais',
  '/administracao/auditoria-acessos': 'Auditoria de Acessos',
  
  // Configurações
  '/configuracoes': 'Configurações',
  '/configuracoes/meu-perfil': 'Meu Perfil',
  '/configuracoes/trocar-senha': 'Trocar Senha',
  '/configuracoes/preferencias-notificacao': 'Preferências de Notificação',
  '/configuracoes/idioma-acessibilidade': 'Idioma e Acessibilidade',
  
  // Saúde
  '/saude': 'Saúde',
  '/saude/atendimentos': 'Atendimentos',
  '/saude/agendamentos-medicos': 'Agendamentos Médicos',
  '/saude/controle-medicamentos': 'Controle de Medicamentos',
  
  // Educação
  '/educacao': 'Educação',
  '/educacao/matricula-alunos': 'Matrícula de Alunos',
  '/educacao/gestao-escolar': 'Gestão Escolar',
  
  // Cidadão
  '/catalogo-servicos': 'Catálogo de Serviços',
  '/meus-protocolos': 'Meus Protocolos',
  '/documentos-pessoais': 'Documentos Pessoais',
  '/minhas-avaliacoes': 'Minhas Avaliações',
};

export const Breadcrumb: FC = () => {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Determinar o tipo de portal
    const isAdmin = location.pathname.startsWith('/admin');
    const isCidadao = location.pathname.startsWith('/cidadao');
    
    // Adicionar home baseado no tipo de portal
    if (isAdmin) {
      breadcrumbs.push({
        label: 'Painel Administrativo',
        path: '/admin',
      });
    } else if (isCidadao) {
      breadcrumbs.push({
        label: 'Portal do Cidadão',
        path: '/cidadao',
      });
    }
    
    // Construir o caminho progressivamente
    let currentPath = '';
    
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      
      // Pular segmentos de 'admin' e 'cidadao' pois já adicionamos como home
      if (segment === 'admin' || segment === 'cidadao') {
        currentPath += `/${segment}`;
        continue;
      }
      
      currentPath += `/${segment}`;
      
      // Normalizar o path para busca no dicionário (sem prefixos admin/cidadao)
      const normalizedPath = currentPath.replace(/^\/(admin|cidadao)/, '') || '/';
      const label = routeLabels[normalizedPath] || routeLabels[currentPath] || 
                   segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      breadcrumbs.push({
        label,
        path: currentPath,
        active: i === pathSegments.length - 1,
      });
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // Não mostrar breadcrumb se estiver na página inicial
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
      <Home className="w-4 h-4" />
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
          {crumb.active ? (
            <span className="font-medium text-gray-900 dark:text-white">
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};