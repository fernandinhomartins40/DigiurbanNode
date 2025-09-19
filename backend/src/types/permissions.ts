// ====================================================================
// 🔐 SISTEMA DE PERMISSÕES GRANULARES - DIGIURBAN
// ====================================================================
// Define todas as permissões específicas do sistema
// Substitui o sistema de roles simples por controle granular
// ====================================================================

export interface Permission {
  code: string
  resource: string
  action: string
  description: string
  category: PermissionCategory
}

export type PermissionCategory =
  | 'system'      // Administração do sistema
  | 'users'       // Gestão de usuários
  | 'audit'       // Auditoria e logs
  | 'secretaria'  // Secretarias específicas
  | 'tenant'      // Gestão de tenants
  | 'cidadao'     // Funcionalidades do painel do cidadão

// ====================================================================
// DEFINIÇÃO COMPLETA DE PERMISSÕES
// ====================================================================

export const PERMISSIONS: Record<string, Permission> = {
  // ===== SISTEMA =====
  'system.admin': {
    code: 'system.admin',
    resource: 'system',
    action: 'admin',
    description: 'Administração completa do sistema',
    category: 'system'
  },
  'system.config': {
    code: 'system.config',
    resource: 'system',
    action: 'config',
    description: 'Configurações do sistema',
    category: 'system'
  },
  'system.maintenance': {
    code: 'system.maintenance',
    resource: 'system',
    action: 'maintenance',
    description: 'Modo de manutenção',
    category: 'system'
  },

  // ===== GESTÃO DE USUÁRIOS =====
  'users.create': {
    code: 'users.create',
    resource: 'users',
    action: 'create',
    description: 'Criar novos usuários',
    category: 'users'
  },
  'users.read': {
    code: 'users.read',
    resource: 'users',
    action: 'read',
    description: 'Visualizar usuários',
    category: 'users'
  },
  'users.update': {
    code: 'users.update',
    resource: 'users',
    action: 'update',
    description: 'Editar dados de usuários',
    category: 'users'
  },
  'users.delete': {
    code: 'users.delete',
    resource: 'users',
    action: 'delete',
    description: 'Excluir usuários',
    category: 'users'
  },
  'users.reset_password': {
    code: 'users.reset_password',
    resource: 'users',
    action: 'reset_password',
    description: 'Resetar senhas de usuários',
    category: 'users'
  },
  'users.manage_roles': {
    code: 'users.manage_roles',
    resource: 'users',
    action: 'manage_roles',
    description: 'Alterar roles de usuários',
    category: 'users'
  },
  'users.manage_permissions': {
    code: 'users.manage_permissions',
    resource: 'users',
    action: 'manage_permissions',
    description: 'Gerenciar permissões de usuários',
    category: 'users'
  },
  'users.activate_deactivate': {
    code: 'users.activate_deactivate',
    resource: 'users',
    action: 'activate_deactivate',
    description: 'Ativar/Desativar usuários',
    category: 'users'
  },

  // ===== AUDITORIA =====
  'audit.read': {
    code: 'audit.read',
    resource: 'audit',
    action: 'read',
    description: 'Visualizar logs de auditoria',
    category: 'audit'
  },
  'audit.export': {
    code: 'audit.export',
    resource: 'audit',
    action: 'export',
    description: 'Exportar relatórios de auditoria',
    category: 'audit'
  },
  'audit.manage': {
    code: 'audit.manage',
    resource: 'audit',
    action: 'manage',
    description: 'Gerenciar configurações de auditoria',
    category: 'audit'
  },

  // ===== TENANTS =====
  'tenants.create': {
    code: 'tenants.create',
    resource: 'tenants',
    action: 'create',
    description: 'Criar novos tenants',
    category: 'tenant'
  },
  'tenants.read': {
    code: 'tenants.read',
    resource: 'tenants',
    action: 'read',
    description: 'Visualizar tenants',
    category: 'tenant'
  },
  'tenants.update': {
    code: 'tenants.update',
    resource: 'tenants',
    action: 'update',
    description: 'Editar tenants',
    category: 'tenant'
  },
  'tenants.delete': {
    code: 'tenants.delete',
    resource: 'tenants',
    action: 'delete',
    description: 'Excluir tenants',
    category: 'tenant'
  },

  // ===== PAINEL DO CIDADÃO =====
  'cidadao.dashboard': {
    code: 'cidadao.dashboard',
    resource: 'cidadao',
    action: 'dashboard',
    description: 'Acessar dashboard do cidadão',
    category: 'cidadao'
  },
  'cidadao.protocolos.create': {
    code: 'cidadao.protocolos.create',
    resource: 'cidadao',
    action: 'protocolos_create',
    description: 'Criar protocolos e solicitações',
    category: 'cidadao'
  },
  'cidadao.protocolos.read': {
    code: 'cidadao.protocolos.read',
    resource: 'cidadao',
    action: 'protocolos_read',
    description: 'Visualizar seus protocolos',
    category: 'cidadao'
  },
  'cidadao.servicos.read': {
    code: 'cidadao.servicos.read',
    resource: 'cidadao',
    action: 'servicos_read',
    description: 'Visualizar serviços públicos disponíveis',
    category: 'cidadao'
  },
  'cidadao.informacoes.read': {
    code: 'cidadao.informacoes.read',
    resource: 'cidadao',
    action: 'informacoes_read',
    description: 'Acessar informações públicas',
    category: 'cidadao'
  },
  'cidadao.documentos.download': {
    code: 'cidadao.documentos.download',
    resource: 'cidadao',
    action: 'documentos_download',
    description: 'Baixar documentos públicos',
    category: 'cidadao'
  },
  'cidadao.contato.create': {
    code: 'cidadao.contato.create',
    resource: 'cidadao',
    action: 'contato_create',
    description: 'Entrar em contato com a prefeitura',
    category: 'cidadao'
  },
  'cidadao.agenda.read': {
    code: 'cidadao.agenda.read',
    resource: 'cidadao',
    action: 'agenda_read',
    description: 'Visualizar agenda pública',
    category: 'cidadao'
  },
  'cidadao.noticias.read': {
    code: 'cidadao.noticias.read',
    resource: 'cidadao',
    action: 'noticias_read',
    description: 'Ler notícias e comunicados',
    category: 'cidadao'
  },
  'cidadao.perfil.update': {
    code: 'cidadao.perfil.update',
    resource: 'cidadao',
    action: 'perfil_update',
    description: 'Atualizar seu perfil pessoal',
    category: 'cidadao'
  },

  // ===== SECRETARIAS - GABINETE =====
  'gabinete.read': {
    code: 'gabinete.read',
    resource: 'gabinete',
    action: 'read',
    description: 'Visualizar Gabinete do Prefeito',
    category: 'secretaria'
  },
  'gabinete.write': {
    code: 'gabinete.write',
    resource: 'gabinete',
    action: 'write',
    description: 'Editar dados do Gabinete',
    category: 'secretaria'
  },
  'gabinete.admin': {
    code: 'gabinete.admin',
    resource: 'gabinete',
    action: 'admin',
    description: 'Administrar Gabinete do Prefeito',
    category: 'secretaria'
  },

  // ===== SECRETARIAS - SAÚDE =====
  'saude.read': {
    code: 'saude.read',
    resource: 'saude',
    action: 'read',
    description: 'Visualizar Secretaria de Saúde',
    category: 'secretaria'
  },
  'saude.write': {
    code: 'saude.write',
    resource: 'saude',
    action: 'write',
    description: 'Editar dados da Secretaria de Saúde',
    category: 'secretaria'
  },
  'saude.admin': {
    code: 'saude.admin',
    resource: 'saude',
    action: 'admin',
    description: 'Administrar Secretaria de Saúde',
    category: 'secretaria'
  },

  // ===== SECRETARIAS - EDUCAÇÃO =====
  'educacao.read': {
    code: 'educacao.read',
    resource: 'educacao',
    action: 'read',
    description: 'Visualizar Secretaria de Educação',
    category: 'secretaria'
  },
  'educacao.write': {
    code: 'educacao.write',
    resource: 'educacao',
    action: 'write',
    description: 'Editar dados da Secretaria de Educação',
    category: 'secretaria'
  },
  'educacao.admin': {
    code: 'educacao.admin',
    resource: 'educacao',
    action: 'admin',
    description: 'Administrar Secretaria de Educação',
    category: 'secretaria'
  },

  // ===== SECRETARIAS - ASSISTÊNCIA SOCIAL =====
  'assistencia_social.read': {
    code: 'assistencia_social.read',
    resource: 'assistencia_social',
    action: 'read',
    description: 'Visualizar Secretaria de Assistência Social',
    category: 'secretaria'
  },
  'assistencia_social.write': {
    code: 'assistencia_social.write',
    resource: 'assistencia_social',
    action: 'write',
    description: 'Editar dados da Secretaria de Assistência Social',
    category: 'secretaria'
  },
  'assistencia_social.admin': {
    code: 'assistencia_social.admin',
    resource: 'assistencia_social',
    action: 'admin',
    description: 'Administrar Secretaria de Assistência Social',
    category: 'secretaria'
  },

  // ===== SECRETARIAS - OBRAS =====
  'obras.read': {
    code: 'obras.read',
    resource: 'obras',
    action: 'read',
    description: 'Visualizar Secretaria de Obras',
    category: 'secretaria'
  },
  'obras.write': {
    code: 'obras.write',
    resource: 'obras',
    action: 'write',
    description: 'Editar dados da Secretaria de Obras',
    category: 'secretaria'
  },
  'obras.admin': {
    code: 'obras.admin',
    resource: 'obras',
    action: 'admin',
    description: 'Administrar Secretaria de Obras',
    category: 'secretaria'
  },

  // ===== SECRETARIAS - MEIO AMBIENTE =====
  'meio_ambiente.read': {
    code: 'meio_ambiente.read',
    resource: 'meio_ambiente',
    action: 'read',
    description: 'Visualizar Secretaria de Meio Ambiente',
    category: 'secretaria'
  },
  'meio_ambiente.write': {
    code: 'meio_ambiente.write',
    resource: 'meio_ambiente',
    action: 'write',
    description: 'Editar dados da Secretaria de Meio Ambiente',
    category: 'secretaria'
  },
  'meio_ambiente.admin': {
    code: 'meio_ambiente.admin',
    resource: 'meio_ambiente',
    action: 'admin',
    description: 'Administrar Secretaria de Meio Ambiente',
    category: 'secretaria'
  },

  // ===== DEMAIS SECRETARIAS =====
  'cultura.read': {
    code: 'cultura.read',
    resource: 'cultura',
    action: 'read',
    description: 'Visualizar Secretaria de Cultura',
    category: 'secretaria'
  },
  'cultura.write': {
    code: 'cultura.write',
    resource: 'cultura',
    action: 'write',
    description: 'Editar dados da Secretaria de Cultura',
    category: 'secretaria'
  },
  'cultura.admin': {
    code: 'cultura.admin',
    resource: 'cultura',
    action: 'admin',
    description: 'Administrar Secretaria de Cultura',
    category: 'secretaria'
  },

  'esportes.read': {
    code: 'esportes.read',
    resource: 'esportes',
    action: 'read',
    description: 'Visualizar Secretaria de Esportes',
    category: 'secretaria'
  },
  'esportes.write': {
    code: 'esportes.write',
    resource: 'esportes',
    action: 'write',
    description: 'Editar dados da Secretaria de Esportes',
    category: 'secretaria'
  },
  'esportes.admin': {
    code: 'esportes.admin',
    resource: 'esportes',
    action: 'admin',
    description: 'Administrar Secretaria de Esportes',
    category: 'secretaria'
  },

  'turismo.read': {
    code: 'turismo.read',
    resource: 'turismo',
    action: 'read',
    description: 'Visualizar Secretaria de Turismo',
    category: 'secretaria'
  },
  'turismo.write': {
    code: 'turismo.write',
    resource: 'turismo',
    action: 'write',
    description: 'Editar dados da Secretaria de Turismo',
    category: 'secretaria'
  },
  'turismo.admin': {
    code: 'turismo.admin',
    resource: 'turismo',
    action: 'admin',
    description: 'Administrar Secretaria de Turismo',
    category: 'secretaria'
  },

  'agricultura.read': {
    code: 'agricultura.read',
    resource: 'agricultura',
    action: 'read',
    description: 'Visualizar Secretaria de Agricultura',
    category: 'secretaria'
  },
  'agricultura.write': {
    code: 'agricultura.write',
    resource: 'agricultura',
    action: 'write',
    description: 'Editar dados da Secretaria de Agricultura',
    category: 'secretaria'
  },
  'agricultura.admin': {
    code: 'agricultura.admin',
    resource: 'agricultura',
    action: 'admin',
    description: 'Administrar Secretaria de Agricultura',
    category: 'secretaria'
  },

  'planejamento_urbano.read': {
    code: 'planejamento_urbano.read',
    resource: 'planejamento_urbano',
    action: 'read',
    description: 'Visualizar Secretaria de Planejamento Urbano',
    category: 'secretaria'
  },
  'planejamento_urbano.write': {
    code: 'planejamento_urbano.write',
    resource: 'planejamento_urbano',
    action: 'write',
    description: 'Editar dados da Secretaria de Planejamento Urbano',
    category: 'secretaria'
  },
  'planejamento_urbano.admin': {
    code: 'planejamento_urbano.admin',
    resource: 'planejamento_urbano',
    action: 'admin',
    description: 'Administrar Secretaria de Planejamento Urbano',
    category: 'secretaria'
  },

  'seguranca_publica.read': {
    code: 'seguranca_publica.read',
    resource: 'seguranca_publica',
    action: 'read',
    description: 'Visualizar Secretaria de Segurança Pública',
    category: 'secretaria'
  },
  'seguranca_publica.write': {
    code: 'seguranca_publica.write',
    resource: 'seguranca_publica',
    action: 'write',
    description: 'Editar dados da Secretaria de Segurança Pública',
    category: 'secretaria'
  },
  'seguranca_publica.admin': {
    code: 'seguranca_publica.admin',
    resource: 'seguranca_publica',
    action: 'admin',
    description: 'Administrar Secretaria de Segurança Pública',
    category: 'secretaria'
  },

  'servicos_publicos.read': {
    code: 'servicos_publicos.read',
    resource: 'servicos_publicos',
    action: 'read',
    description: 'Visualizar Secretaria de Serviços Públicos',
    category: 'secretaria'
  },
  'servicos_publicos.write': {
    code: 'servicos_publicos.write',
    resource: 'servicos_publicos',
    action: 'write',
    description: 'Editar dados da Secretaria de Serviços Públicos',
    category: 'secretaria'
  },
  'servicos_publicos.admin': {
    code: 'servicos_publicos.admin',
    resource: 'servicos_publicos',
    action: 'admin',
    description: 'Administrar Secretaria de Serviços Públicos',
    category: 'secretaria'
  },

  'habitacao.read': {
    code: 'habitacao.read',
    resource: 'habitacao',
    action: 'read',
    description: 'Visualizar Secretaria de Habitação',
    category: 'secretaria'
  },
  'habitacao.write': {
    code: 'habitacao.write',
    resource: 'habitacao',
    action: 'write',
    description: 'Editar dados da Secretaria de Habitação',
    category: 'secretaria'
  },
  'habitacao.admin': {
    code: 'habitacao.admin',
    resource: 'habitacao',
    action: 'admin',
    description: 'Administrar Secretaria de Habitação',
    category: 'secretaria'
  }
}

// ====================================================================
// MAPEAMENTO DE PERMISSÕES POR ROLE
// ====================================================================

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  guest: [
    // Guests não têm permissões - apenas acesso público
  ],

  cidadao: [
    // Cidadãos autenticados - acesso ao painel do cidadão
    'cidadao.dashboard',
    'cidadao.protocolos.create',
    'cidadao.protocolos.read',
    'cidadao.servicos.read',
    'cidadao.informacoes.read',
    'cidadao.documentos.download',
    'cidadao.contato.create',
    'cidadao.agenda.read',
    'cidadao.noticias.read',
    'cidadao.perfil.update'
  ],

  user: [
    // Usuários básicos - acesso limitado a uma secretaria específica (read)
    // As permissões específicas serão definidas por usuário individual
  ],

  coordinator: [
    // Coordenadores - read/write em secretaria específica
    // As permissões específicas serão definidas por usuário individual
  ],

  manager: [
    // Gestores - admin em secretaria específica
    // As permissões específicas serão definidas por usuário individual
  ],

  admin: [
    // Administradores de tenant - acesso completo ao tenant
    'users.create',
    'users.read',
    'users.update',
    'users.reset_password',
    'users.activate_deactivate',
    'audit.read',
    'audit.export',

    // Acesso a todas as secretarias em modo admin
    'gabinete.read', 'gabinete.write', 'gabinete.admin',
    'saude.read', 'saude.write', 'saude.admin',
    'educacao.read', 'educacao.write', 'educacao.admin',
    'assistencia_social.read', 'assistencia_social.write', 'assistencia_social.admin',
    'obras.read', 'obras.write', 'obras.admin',
    'meio_ambiente.read', 'meio_ambiente.write', 'meio_ambiente.admin',
    'cultura.read', 'cultura.write', 'cultura.admin',
    'esportes.read', 'esportes.write', 'esportes.admin',
    'turismo.read', 'turismo.write', 'turismo.admin',
    'agricultura.read', 'agricultura.write', 'agricultura.admin',
    'planejamento_urbano.read', 'planejamento_urbano.write', 'planejamento_urbano.admin',
    'seguranca_publica.read', 'seguranca_publica.write', 'seguranca_publica.admin',
    'servicos_publicos.read', 'servicos_publicos.write', 'servicos_publicos.admin',
    'habitacao.read', 'habitacao.write', 'habitacao.admin'
  ],

  super_admin: [
    // Super administradores - acesso total ao sistema
    'system.admin',
    'system.config',
    'system.maintenance',

    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'users.reset_password',
    'users.manage_roles',
    'users.manage_permissions',
    'users.activate_deactivate',

    'audit.read',
    'audit.export',
    'audit.manage',

    'tenants.create',
    'tenants.read',
    'tenants.update',
    'tenants.delete',

    // Acesso total a todas as secretarias
    'gabinete.read', 'gabinete.write', 'gabinete.admin',
    'saude.read', 'saude.write', 'saude.admin',
    'educacao.read', 'educacao.write', 'educacao.admin',
    'assistencia_social.read', 'assistencia_social.write', 'assistencia_social.admin',
    'obras.read', 'obras.write', 'obras.admin',
    'meio_ambiente.read', 'meio_ambiente.write', 'meio_ambiente.admin',
    'cultura.read', 'cultura.write', 'cultura.admin',
    'esportes.read', 'esportes.write', 'esportes.admin',
    'turismo.read', 'turismo.write', 'turismo.admin',
    'agricultura.read', 'agricultura.write', 'agricultura.admin',
    'planejamento_urbano.read', 'planejamento_urbano.write', 'planejamento_urbano.admin',
    'seguranca_publica.read', 'seguranca_publica.write', 'seguranca_publica.admin',
    'servicos_publicos.read', 'servicos_publicos.write', 'servicos_publicos.admin',
    'habitacao.read', 'habitacao.write', 'habitacao.admin'
  ]
}

// ====================================================================
// UTILITÁRIOS
// ====================================================================

export const getAllPermissions = (): Permission[] => {
  return Object.values(PERMISSIONS)
}

export const getPermissionsByCategory = (category: PermissionCategory): Permission[] => {
  return Object.values(PERMISSIONS).filter(perm => perm.category === category)
}

export const getPermissionsByRole = (role: string): string[] => {
  return ROLE_PERMISSIONS[role] || []
}

export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission)
}

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(perm => userPermissions.includes(perm))
}

export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(perm => userPermissions.includes(perm))
}

export const canAccessSecretaria = (userPermissions: string[], secretaria: string, action: 'read' | 'write' | 'admin' = 'read'): boolean => {
  const requiredPermission = `${secretaria}.${action}`
  return userPermissions.includes(requiredPermission)
}

// ====================================================================
// ROLE HIERARCHY - NÍVEIS DE ACESSO ATUALIZADOS
// ====================================================================

export const ROLE_HIERARCHY: Record<string, number> = {
  guest: 0,        // Visitantes não autenticados
  cidadao: 1,      // Cidadãos autenticados (painel público)
  user: 2,         // Servidores básicos (secretaria específica)
  coordinator: 3,  // Coordenadores (secretaria específica)
  manager: 4,      // Gestores (secretaria específica)
  admin: 5,        // Administradores (tenant completo)
  super_admin: 6   // Super administradores (sistema global)
}