// ====================================================================
// 🌱 SEEDS PRISMA - DIGIURBAN SYSTEM
// ====================================================================
// Seeds iniciais convertidos do Knex para Prisma
// Criação de dados iniciais e configurações padrão
// ====================================================================

import { PrismaClient } from '@prisma/client'
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
  console.log('🔧 Configurando sistema...')

  for (const config of SYSTEM_CONFIG) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: config
    })
  }

  console.log(`✅ ${SYSTEM_CONFIG.length} configurações criadas`)
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
      email: 'sistema@digiurban.com.br',
      cidade: 'Sistema',
      estado: 'SY',
      cnpj: '00000000000000',
      plano: 'ENTERPRISE',
      status: 'ativo'
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
      role: 'super_admin',
      status: 'ativo',
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
      email: 'demo@digiurban.com.br',
      cidade: 'Cidade Demo',
      estado: 'SP',
      cnpj: '12345678901234',
      plano: 'premium',
      status: 'ativo',
      populacao: 50000,
      endereco: 'Rua Principal, 123 - Centro',
      responsavelNome: 'João Silva',
      responsavelEmail: 'joao.silva@demo.gov.br',
      responsavelTelefone: '(11) 99999-9999',
      // NOVOS CAMPOS FASE 1
      hasAdmin: true,
      adminConfirmed: true,
      adminFirstLogin: true,
      limiteUsuarios: 200,
      valorMensal: 4500.00,
      usuariosAtivos: 15,
      protocolosMes: 120,
      configuracoes: JSON.stringify({
        personalizacao_ativa: true,
        backup_automatico: true,
        ssl_customizado: false,
        integracao_terceiros: true
      }),
      metricas: JSON.stringify({
        uptime: 99.8,
        satisfacao: 4.5,
        tempo_resposta: 0.8,
        tickets_abertos: 3
      })
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
      role: 'admin',
      status: 'ativo',
      emailVerified: true,
      // NOVOS CAMPOS FASE 1
      tipoUsuario: 'admin',
      telefone: '(11) 98765-4321',
      ativo: true,
      ultimaAtividade: new Date()
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
// BILLING SEEDS - DADOS DE TESTE PARA SISTEMA DE BILLING
// ====================================================================

async function seedBillingData() {
  console.log('💰 Criando dados de teste para billing...')

  try {
    // Buscar tenant demo para criar faturas
    const demoTenant = await prisma.tenant.findFirst({
      where: { tenantCode: 'DEMO001' }
    });

    if (!demoTenant) {
      console.log('⚠️ Tenant demo não encontrado, pulando billing seeds');
      return;
    }

    // Criar faturas de teste com diferentes status
    const faturas = [
      {
        id: uuidv4(),
        tenantId: demoTenant.id,
        numero: 'FAT-202401-001',
        periodo: 'Janeiro 2024',
        valor: 4500.00,
        descricao: 'Mensalidade Plano Premium - Janeiro 2024',
        status: 'pago',
        dataCriacao: new Date('2024-01-01'),
        dataVencimento: new Date('2024-01-10'),
        dataPagamento: new Date('2024-01-08'),
        metodoPagamento: 'pix',
        desconto: 0,
        taxaAdicional: 0,
        plano: 'premium'
      },
      {
        id: uuidv4(),
        tenantId: demoTenant.id,
        numero: 'FAT-202402-001',
        periodo: 'Fevereiro 2024',
        valor: 4500.00,
        descricao: 'Mensalidade Plano Premium - Fevereiro 2024',
        status: 'pago',
        dataCriacao: new Date('2024-02-01'),
        dataVencimento: new Date('2024-02-10'),
        dataPagamento: new Date('2024-02-09'),
        metodoPagamento: 'cartao',
        desconto: 0,
        taxaAdicional: 0,
        plano: 'premium'
      },
      {
        id: uuidv4(),
        tenantId: demoTenant.id,
        numero: 'FAT-202403-001',
        periodo: 'Março 2024',
        valor: 4500.00,
        descricao: 'Mensalidade Plano Premium - Março 2024',
        status: 'pendente',
        dataCriacao: new Date('2024-03-01'),
        dataVencimento: new Date('2024-03-10'),
        dataPagamento: null,
        metodoPagamento: null,
        desconto: 225.00, // 5% de desconto
        taxaAdicional: 0,
        plano: 'premium'
      },
      {
        id: uuidv4(),
        tenantId: demoTenant.id,
        numero: 'FAT-202312-001',
        periodo: 'Dezembro 2023',
        valor: 4500.00,
        descricao: 'Mensalidade Plano Premium - Dezembro 2023',
        status: 'vencido',
        dataCriacao: new Date('2023-12-01'),
        dataVencimento: new Date('2023-12-10'),
        dataPagamento: null,
        metodoPagamento: null,
        desconto: 0,
        taxaAdicional: 150.00, // Taxa de atraso
        plano: 'premium'
      }
    ];

    // Inserir faturas
    for (const fatura of faturas) {
      await prisma.invoice.upsert({
        where: { numero: fatura.numero },
        update: {},
        create: {
          id: fatura.id,
          tenantId: fatura.tenantId,
          numero: fatura.numero,
          periodo: fatura.periodo,
          valor: fatura.valor,
          descricao: fatura.descricao,
          status: fatura.status,
          dataCriacao: fatura.dataCriacao,
          dataVencimento: fatura.dataVencimento,
          dataPagamento: fatura.dataPagamento,
          metodoPagamento: fatura.metodoPagamento,
          desconto: fatura.desconto,
          taxaAdicional: fatura.taxaAdicional,
          plano: fatura.plano,
          createdAt: fatura.dataCriacao,
          updatedAt: new Date()
        }
      });

      // Criar itens para cada fatura
      await prisma.invoiceItem.create({
        data: {
          invoiceId: fatura.id,
          descricao: 'Assinatura Mensal',
          quantidade: 1,
          valorUnitario: fatura.valor,
          valorTotal: fatura.valor,
          tipo: 'subscription',
          createdAt: fatura.dataCriacao
        }
      });

      console.log(`✅ Fatura ${fatura.numero} criada`);
    }

    // Criar métricas de billing para os últimos meses
    const meses = [
      { periodo: '2023-12', mrr: 13500, receitaMensal: 12750 },
      { periodo: '2024-01', mrr: 18000, receitaMensal: 17100 },
      { periodo: '2024-02', mrr: 22500, receitaMensal: 21375 },
      { periodo: '2024-03', mrr: 27000, receitaMensal: 25650 }
    ];

    for (const mes of meses) {
      await prisma.billingMetrics.upsert({
        where: { periodo: mes.periodo },
        update: {},
        create: {
          periodo: mes.periodo,
          mrr: mes.mrr,
          arr: mes.mrr * 12,
          churnRate: 2.5,
          arpu: mes.mrr / 15, // Assumindo 15 clientes ativos
          ltv: (mes.mrr / 15) / (2.5 / 100), // ARPU / Churn
          cac: 150.00,
          receitaMensal: mes.receitaMensal,
          faturasPendentes: 5,
          valorPendente: 22500,
          faturasVencidas: 2,
          valorVencido: 9000,
          taxaCobranca: 87.5,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`✅ Métricas para ${mes.periodo} criadas`);
    }

    console.log('💰 Seeds de billing concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar seeds de billing:', error);
    throw error;
  }
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
    await seedBillingData()

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