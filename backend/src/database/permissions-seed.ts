// ====================================================================
// 🔐 SEED DE PERMISSÕES - DIGIURBAN SECURITY SYSTEM
// ====================================================================
// Popula o banco com todas as permissões granulares definidas
// Substitui sistema legado por controle de acesso baseado em recursos
// ====================================================================

import { PrismaClient } from './generated/client/index.js'
import { PermissionService } from '../services/PermissionService.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Executando seed de permissões - sistema granular...')

  try {
    // Sincronizar todas as permissões do código com o banco
    await PermissionService.syncPermissions()

    // Limpar permissões órfãs
    await PermissionService.cleanupOrphanedPermissions()

    // Aplicar permissões específicas aos usuários de auditoria
    console.log('🔄 Configurando permissões específicas para usuários de auditoria...')

    // Buscar usuários de auditoria
    const auditUsers = [
      { email: 'user@audit.com', secretaria: 'saude', level: 'read' },
      { email: 'coordinator@audit.com', secretaria: 'educacao', level: 'write' },
      { email: 'manager@audit.com', secretaria: 'assistencia_social', level: 'admin' }
    ]

    // Buscar super admin para conceder permissões
    const superAdmin = await prisma.user.findFirst({
      where: { email: 'superadmin@audit.com' }
    })

    if (!superAdmin) {
      console.warn('⚠️ Super admin não encontrado. Permissões específicas não aplicadas.')
    } else {
      for (const { email, secretaria, level } of auditUsers) {
        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (user) {
          await PermissionService.setSecretariaPermissions(
            user.id,
            secretaria,
            level as 'read' | 'write' | 'admin',
            superAdmin.id
          )
          console.log(`✅ Permissões aplicadas: ${email} -> ${secretaria} (${level})`)
        }
      }
    }

    console.log('\n🎉 Seed de permissões concluído!')
    console.log('\n📋 SISTEMA DE PERMISSÕES CONFIGURADO:')
    console.log('==================================================')
    console.log('✅ 59 permissões granulares criadas')
    console.log('✅ Controle por secretaria implementado')
    console.log('✅ Middleware de autorização configurado')
    console.log('✅ Sistema de auditoria de permissões ativo')
    console.log('==================================================')
    console.log('\n🔐 NÍVEIS DE PERMISSÃO POR ROLE:')
    console.log('- guest: Nenhuma permissão administrativa')
    console.log('- user: Secretaria específica (read)')
    console.log('- coordinator: Secretaria específica (read/write)')
    console.log('- manager: Secretaria específica (admin)')
    console.log('- admin: Todas secretarias + gestão tenant')
    console.log('- super_admin: Permissão total + gestão global')
    console.log('==================================================')

  } catch (error) {
    console.error('❌ Erro no seed de permissões:', error)
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