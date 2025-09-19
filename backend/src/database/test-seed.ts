// ====================================================================
// 🌱 SEED DE TESTE - DIGIURBAN PRISMA
// ====================================================================

import { PrismaClient } from './generated/client/index.js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Executando seed de teste...')

  try {
    // Criar tenant de teste
    const testTenant = await prisma.tenant.create({
      data: {
        id: uuidv4(),
        tenantCode: 'TEST001',
        nome: 'Prefeitura de Teste',
        cidade: 'Cidade Teste',
        estado: 'TS',
        cnpj: '12345678901234',
        plano: 'premium',
        status: 'ativo',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Tenant criado:', testTenant.nome)

    // Criar super admin
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const superAdmin = await prisma.user.create({
      data: {
        id: uuidv4(),
        tenantId: testTenant.id,
        nomeCompleto: 'Super Administrador',
        email: 'admin@teste.com',
        passwordHash: hashedPassword,
        role: 'super_admin',
        status: 'ativo',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Super Admin criado:', superAdmin.email)

    // Criar algumas permissões
    const permissions = [
      { code: 'manage_users', resource: 'users', action: 'manage', description: 'Gerenciar usuários' },
      { code: 'manage_tenants', resource: 'tenants', action: 'manage', description: 'Gerenciar tenants' },
      { code: 'view_reports', resource: 'reports', action: 'read', description: 'Ver relatórios' }
    ]

    for (const perm of permissions) {
      await prisma.permission.create({
        data: {
          ...perm,
          createdAt: new Date()
        }
      })
    }

    console.log('✅ Permissões criadas:', permissions.length)

    console.log('🎉 Seed executado com sucesso!')

  } catch (error) {
    console.error('❌ Erro no seed:', error)
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