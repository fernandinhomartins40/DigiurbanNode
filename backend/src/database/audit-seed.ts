// ====================================================================
// 🔍 SEED DE AUDITORIA - USUÁRIOS PARA TODOS OS ROLES
// ====================================================================
// Cria usuários de teste para cada nível de acesso para auditoria completa
// ====================================================================

import { PrismaClient } from './generated/client/index.js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Executando seed de auditoria - criando usuários para todos os roles...')

  try {
    // Verificar se tenant de teste existe, senão criar
    let testTenant = await prisma.tenant.findFirst({
      where: { tenantCode: 'AUDIT001' }
    })

    if (!testTenant) {
      testTenant = await prisma.tenant.create({
        data: {
          id: uuidv4(),
          tenantCode: 'AUDIT001',
          nome: 'Prefeitura Auditoria',
          cidade: 'Cidade Auditoria',
          estado: 'AU',
          cnpj: '98765432100123',
          plano: 'premium',
          status: 'ativo',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Tenant de auditoria criado:', testTenant.nome)
    }

    // Usuários de teste para cada role
    const testUsers = [
      {
        role: 'guest',
        name: 'Cidadão Visitante',
        email: 'guest@audit.com',
        password: 'guest123',
        tenant_id: null // Guest não pertence a tenant
      },
      {
        role: 'cidadao',
        name: 'José da Silva',
        email: 'cidadao@audit.com',
        password: 'cidadao123',
        tenant_id: testTenant.id
      },
      {
        role: 'cidadao',
        name: 'Maria dos Santos',
        email: 'cidadao2@audit.com',
        password: 'cidadao123',
        tenant_id: testTenant.id
      },
      {
        role: 'user',
        name: 'João Servidor',
        email: 'user@audit.com',
        password: 'user123',
        tenant_id: testTenant.id
      },
      {
        role: 'coordinator',
        name: 'Maria Coordenadora',
        email: 'coordinator@audit.com',
        password: 'coord123',
        tenant_id: testTenant.id
      },
      {
        role: 'manager',
        name: 'Carlos Gestor',
        email: 'manager@audit.com',
        password: 'manager123',
        tenant_id: testTenant.id
      },
      {
        role: 'admin',
        name: 'Ana Administradora',
        email: 'admin@audit.com',
        password: 'admin123',
        tenant_id: testTenant.id
      },
      {
        role: 'super_admin',
        name: 'Super Admin Auditoria',
        email: 'superadmin@audit.com',
        password: 'super123',
        tenant_id: null // Super admin é global
      }
    ]

    for (const userData of testUsers) {
      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        console.log(`⏭️ Usuário já existe: ${userData.email}`)
        continue
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12)

      const user = await prisma.user.create({
        data: {
          id: uuidv4(),
          tenantId: userData.tenant_id,
          nomeCompleto: userData.name,
          email: userData.email,
          passwordHash: hashedPassword,
          role: userData.role as any,
          status: 'ativo',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log(`✅ Usuário criado: ${user.email} (${user.role})`)
    }

    // Criar algumas permissões básicas se não existirem
    const basicPermissions = [
      { code: 'read_own', resource: 'user_data', action: 'read', description: 'Ler próprios dados' },
      { code: 'manage_users', resource: 'users', action: 'manage', description: 'Gerenciar usuários' },
      { code: 'manage_tenants', resource: 'tenants', action: 'manage', description: 'Gerenciar tenants' },
      { code: 'system_admin', resource: 'system', action: 'admin', description: 'Administração do sistema' }
    ]

    for (const perm of basicPermissions) {
      const existing = await prisma.permission.findFirst({
        where: { code: perm.code }
      })

      if (!existing) {
        await prisma.permission.create({
          data: {
            ...perm,
            createdAt: new Date()
          }
        })
        console.log(`✅ Permissão criada: ${perm.code}`)
      }
    }

    console.log('\n🎉 Seed de auditoria concluído!')
    console.log('\n📋 USUÁRIOS DE TESTE CRIADOS:')
    console.log('==================================================')
    console.log('GUEST:        guest@audit.com       / guest123')
    console.log('CIDADÃO 1:    cidadao@audit.com     / cidadao123')
    console.log('CIDADÃO 2:    cidadao2@audit.com    / cidadao123')
    console.log('USER:         user@audit.com        / user123')
    console.log('COORDINATOR:  coordinator@audit.com / coord123')
    console.log('MANAGER:      manager@audit.com     / manager123')
    console.log('ADMIN:        admin@audit.com       / admin123')
    console.log('SUPER_ADMIN:  superadmin@audit.com  / super123')
    console.log('==================================================')
    console.log('\n👥 HIERARQUIA DE ROLES ATUALIZADA:')
    console.log('0 - GUEST       (visitantes não autenticados)')
    console.log('1 - CIDADAO     (painel do cidadão)')
    console.log('2 - USER        (servidores - secretaria específica)')
    console.log('3 - COORDINATOR (coordenadores - secretaria específica)')
    console.log('4 - MANAGER     (gestores - secretaria específica)')
    console.log('5 - ADMIN       (administradores - tenant completo)')
    console.log('6 - SUPER_ADMIN (administradores globais)')
    console.log('==================================================')

  } catch (error) {
    console.error('❌ Erro no seed de auditoria:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })