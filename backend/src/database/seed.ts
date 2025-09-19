// ====================================================================
// 🌱 SEEDS PRISMA - DIGIURBAN SYSTEM
// ====================================================================
// Seeds iniciais convertidos do Knex para Prisma
// Criação de dados iniciais e configurações padrão
// ====================================================================

import { PrismaClient } from './generated/client/index.js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// ====================================================================
// CONFIGURAÇÕES PADRÃO DO SISTEMA
// ====================================================================

const SYSTEM_CONFIG = [
  {
    key: 'system.name',
    value: 'DigiUrban',
    description: 'Nome do sistema'
  },
  {
    key: 'system.version',
    value: '2.0.0',
    description: 'Versão atual do sistema'
  },
  {
    key: 'system.maintenance_mode',
    value: 'false',
    description: 'Modo de manutenção ativo'
  },
  {
    key: 'auth.max_login_attempts',
    value: '5',
    description: 'Máximo de tentativas de login'
  },
  {
    key: 'auth.lockout_duration',
    value: '900',
    description: 'Duração do bloqueio em segundos (15 min)'
  },
  {
    key: 'email.verification_required',
    value: 'true',
    description: 'Verificação de email obrigatória'
  },
  {
    key: 'uploads.max_file_size',
    value: '10485760',
    description: 'Tamanho máximo de arquivo (10MB)'
  },
  {
    key: 'security.session_timeout',
    value: '86400',
    description: 'Timeout de sessão em segundos (24h)'
  }
]

// ====================================================================
// PERMISSÕES PADRÃO DO SISTEMA
// ====================================================================

const DEFAULT_PERMISSIONS = [
  // Permissões Públicas/Guest
  { code: 'read_public', resource: 'public', action: 'read', description: 'Acesso público' },
  { code: 'create_protocol', resource: 'protocols', action: 'create', description: 'Criar protocolos' },
  { code: 'read_own_protocols', resource: 'protocols', action: 'read_own', description: 'Ver próprios protocolos' },

  // Permissões de Usuário
  { code: 'read_own', resource: 'user_data', action: 'read', description: 'Ler próprios dados' },
  { code: 'update_own', resource: 'user_data', action: 'update', description: 'Atualizar próprios dados' },
  { code: 'manage_protocols', resource: 'protocols', action: 'manage', description: 'Gerenciar protocolos' },
  { code: 'read_department_data', resource: 'department', action: 'read', description: 'Ler dados do departamento' },

  // Permissões de Coordenador
  { code: 'manage_team', resource: 'team', action: 'manage', description: 'Gerenciar equipe' },
  { code: 'view_reports', resource: 'reports', action: 'read', description: 'Ver relatórios' },
  { code: 'manage_department_protocols', resource: 'department_protocols', action: 'manage', description: 'Gerenciar protocolos do departamento' },

  // Permissões de Gerente
  { code: 'manage_department', resource: 'department', action: 'manage', description: 'Gerenciar departamento' },
  { code: 'manage_reports', resource: 'reports', action: 'manage', description: 'Gerenciar relatórios' },
  { code: 'manage_department_users', resource: 'department_users', action: 'manage', description: 'Gerenciar usuários do departamento' },
  { code: 'approve_protocols', resource: 'protocols', action: 'approve', description: 'Aprovar protocolos' },

  // Permissões de Admin
  { code: 'manage_tenant', resource: 'tenant', action: 'manage', description: 'Gerenciar tenant' },
  { code: 'manage_users', resource: 'users', action: 'manage', description: 'Gerenciar usuários' },
  { code: 'manage_all_departments', resource: 'departments', action: 'manage', description: 'Gerenciar todos departamentos' },
  { code: 'manage_municipal_config', resource: 'municipal_config', action: 'manage', description: 'Gerenciar configurações municipais' },
  { code: 'view_all_reports', resource: 'reports', action: 'read_all', description: 'Ver todos os relatórios' },

  // Permissões de Super Admin
  { code: 'all', resource: 'system', action: 'all', description: 'Acesso total ao sistema' },
  { code: 'manage_tenants', resource: 'tenants', action: 'manage', description: 'Gerenciar tenants' },
  { code: 'system_diagnostics', resource: 'diagnostics', action: 'manage', description: 'Diagnósticos do sistema' },
  { code: 'database_access', resource: 'database', action: 'manage', description: 'Acesso ao banco de dados' }
]

// ====================================================================
// FUNÇÕES DE SEED
// ====================================================================

async function seedSystemConfig() {
  console.log('🔧 Criando configurações do sistema...')

  for (const config of SYSTEM_CONFIG) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: config
    })
  }

  console.log(`✅ ${SYSTEM_CONFIG.length} configurações do sistema criadas/atualizadas`)
}

async function seedPermissions() {
  console.log('🛡️ Criando permissões padrão...')

  for (const permission of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {
        resource: permission.resource,
        action: permission.action,
        description: permission.description
      },
      create: permission
    })
  }

  console.log(`✅ ${DEFAULT_PERMISSIONS.length} permissões criadas/atualizadas`)
}

async function seedSuperAdmin() {
  console.log('👤 Criando Super Admin...')

  const superAdminId = uuidv4()
  const hashedPassword = await bcrypt.hash('admin123', 12)

  // Criar tenant para o super admin
  const systemTenant = await prisma.tenant.upsert({
    where: { tenantCode: 'SYSTEM' },
    update: {},
    create: {
      id: uuidv4(),
      tenantCode: 'SYSTEM',
      nome: 'Sistema DigiUrban',
      cidade: 'Sistema',
      estado: 'SY',
      cnpj: '00000000000000',
      plano: 'ENTERPRISE',
      status: 'ATIVO'
    }
  })

  // Criar super admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@digiurban.com.br' },
    update: {},
    create: {
      id: superAdminId,
      tenantId: systemTenant.id,
      nomeCompleto: 'Super Administrador',
      email: 'admin@digiurban.com.br',
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ATIVO',
      emailVerified: true
    }
  })

  // Conceder todas as permissões para o super admin
  const allPermissions = await prisma.permission.findMany()

  for (const permission of allPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: superAdmin.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        userId: superAdmin.id,
        permissionId: permission.id
      }
    })
  }

  console.log('✅ Super Admin criado com sucesso')
  console.log('📧 Email: admin@digiurban.com.br')
  console.log('🔑 Senha: admin123')
  console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!')
}

async function seedTenantDemo() {
  console.log('🏛️ Criando tenant de demonstração...')

  const demoTenantId = uuidv4()
  const demoUserId = uuidv4()

  // Criar tenant demo
  const demoTenant = await prisma.tenant.upsert({
    where: { tenantCode: 'DEMO001' },
    update: {},
    create: {
      id: demoTenantId,
      tenantCode: 'DEMO001',
      nome: 'Prefeitura Municipal de Demonstração',
      cidade: 'Cidade Demo',
      estado: 'SP',
      cnpj: '12345678901234',
      plano: 'PREMIUM',
      status: 'ATIVO',
      populacao: 50000,
      endereco: 'Rua Principal, 123 - Centro',
      responsavelNome: 'João Silva',
      responsavelEmail: 'joao.silva@demo.gov.br',
      responsavelTelefone: '(11) 99999-9999'
    }
  })

  // Criar usuário admin do tenant demo
  const hashedPassword = await bcrypt.hash('demo123', 12)

  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo.gov.br' },
    update: {},
    create: {
      id: demoUserId,
      tenantId: demoTenant.id,
      nomeCompleto: 'Administrador Demo',
      email: 'admin@demo.gov.br',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      status: 'ATIVO',
      emailVerified: true
    }
  })

  // Conceder permissões de admin para o usuário demo
  const adminPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { code: { startsWith: 'manage_' } },
        { code: { startsWith: 'view_' } },
        { code: { startsWith: 'read_' } }
      ]
    }
  })

  for (const permission of adminPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: demoAdmin.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        userId: demoAdmin.id,
        permissionId: permission.id
      }
    })
  }

  console.log('✅ Tenant demo criado com sucesso')
  console.log('🏛️ Tenant: Prefeitura Municipal de Demonstração')
  console.log('📧 Email: admin@demo.gov.br')
  console.log('🔑 Senha: demo123')
}

// ====================================================================
// FUNÇÃO PRINCIPAL DE SEED
// ====================================================================

async function main() {
  console.log('🌱 Iniciando seeds do banco de dados...')

  try {
    await seedSystemConfig()
    await seedPermissions()
    await seedSuperAdmin()
    await seedTenantDemo()

    console.log('✅ Seeds executados com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// ====================================================================
// EXECUÇÃO DOS SEEDS
// ====================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default main