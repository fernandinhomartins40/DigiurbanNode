// ====================================================================
// 🔐 PERMISSION SERVICE - DIGIURBAN SECURITY SYSTEM
// ====================================================================
// Gerencia todas as operações relacionadas a permissões
// Implementa o controle de acesso granular
// ====================================================================

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../database/generated/client/index.js'
import { PERMISSIONS, ROLE_PERMISSIONS, Permission, hasPermission, hasAllPermissions } from '../types/permissions.js'
import { ActivityService } from './ActivityService.js'

const prisma = new PrismaClient()

// ====================================================================
// INTERFACES
// ====================================================================

export interface UserPermissionSummary {
  userId: string;
  userName: string;
  role: string;
  directPermissions: string[];
  rolePermissions: string[];
  allPermissions: string[];
  secretariasWithAccess: string[];
  categoryCounts: Record<string, number>;
}

// ====================================================================
// CLASSE PERMISSION SERVICE
// ====================================================================

export class PermissionService {

  // ====================================================================
  // GESTÃO DE PERMISSÕES
  // ====================================================================

  /**
   * Obtém todas as permissões de um usuário (baseado no role + permissões específicas)
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      // Buscar usuário e suas permissões
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      })

      if (!user) {
        return []
      }

      // Permissões baseadas no role
      const rolePermissions = ROLE_PERMISSIONS[user.role || 'guest'] || []

      // Permissões específicas do usuário
      const userSpecificPermissions = user.permissions.map(up => up.permission.code)

      // Combinar permissões (sem duplicatas)
      const allPermissions = [...new Set([...rolePermissions, ...userSpecificPermissions])]

      return allPermissions
    } catch (error) {
      console.error('❌ [PERMISSION-SERVICE] Erro ao obter permissões do usuário:', error)
      return []
    }
  }

  /**
   * Verifica se um usuário tem uma permissão específica
   */
  static async userHasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    return hasPermission(userPermissions, permissionCode)
  }

  /**
   * Verifica se um usuário tem todas as permissões especificadas
   */
  static async userHasAllPermissions(userId: string, permissionCodes: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    return hasAllPermissions(userPermissions, permissionCodes)
  }

  /**
   * Verifica se um usuário pode acessar uma secretaria específica
   */
  static async userCanAccessSecretaria(userId: string, secretaria: string, action: 'read' | 'write' | 'admin' = 'read'): Promise<boolean> {
    const requiredPermission = `${secretaria}.${action}`
    return await this.userHasPermission(userId, requiredPermission)
  }

  // ====================================================================
  // GESTÃO DE PERMISSÕES ESPECÍFICAS DE USUÁRIO
  // ====================================================================

  /**
   * Concede uma permissão específica a um usuário
   */
  static async grantPermissionToUser(
    userId: string,
    permissionCode: string,
    grantedById: string
  ): Promise<boolean> {
    try {
      // Verificar se a permissão existe
      const permission = await prisma.permission.findUnique({
        where: { code: permissionCode }
      })

      if (!permission) {
        console.error(`❌ [PERMISSION-SERVICE] Permissão não encontrada: ${permissionCode}`)
        return false
      }

      // Verificar se já existe
      const existing = await prisma.userPermission.findUnique({
        where: {
          userId_permissionId: {
            userId,
            permissionId: permission.id
          }
        }
      })

      if (existing) {
        console.warn(`⚠️ [PERMISSION-SERVICE] Usuário já possui a permissão: ${permissionCode}`)
        return true
      }

      // Conceder permissão
      await prisma.userPermission.create({
        data: {
          userId,
          permissionId: permission.id,
          grantedBy: grantedById,
          createdAt: new Date()
        }
      })

      // Log da atividade
      await ActivityService.log({
        user_id: grantedById,
        action: 'grant_permission',
        resource: 'permissions',
        details: JSON.stringify({
          targetUserId: userId,
          permissionCode,
          permissionDescription: permission.description
        })
      })

      console.log(`✅ [PERMISSION-SERVICE] Permissão concedida: ${permissionCode} para usuário ${userId}`)
      return true

    } catch (error) {
      console.error('❌ [PERMISSION-SERVICE] Erro ao conceder permissão:', error)
      return false
    }
  }

  /**
   * Remove uma permissão específica de um usuário
   */
  static async revokePermissionFromUser(
    userId: string,
    permissionCode: string,
    revokedById: string
  ): Promise<boolean> {
    try {
      // Buscar a permissão
      const permission = await prisma.permission.findUnique({
        where: { code: permissionCode }
      })

      if (!permission) {
        console.error(`❌ [PERMISSION-SERVICE] Permissão não encontrada: ${permissionCode}`)
        return false
      }

      // Remover permissão específica
      const deletedPermission = await prisma.userPermission.deleteMany({
        where: {
          userId,
          permissionId: permission.id
        }
      })

      if (deletedPermission.count === 0) {
        console.warn(`⚠️ [PERMISSION-SERVICE] Usuário não possuía a permissão: ${permissionCode}`)
        return true
      }

      // Log da atividade
      await ActivityService.log({
        user_id: revokedById,
        action: 'revoke_permission',
        resource: 'permissions',
        details: JSON.stringify({
          targetUserId: userId,
          permissionCode,
          permissionDescription: permission.description
        })
      })

      console.log(`✅ [PERMISSION-SERVICE] Permissão removida: ${permissionCode} de usuário ${userId}`)
      return true

    } catch (error) {
      console.error('❌ [PERMISSION-SERVICE] Erro ao remover permissão:', error)
      return false
    }
  }

  /**
   * Define permissões específicas para uma secretaria
   */
  static async setSecretariaPermissions(
    userId: string,
    secretaria: string,
    level: 'read' | 'write' | 'admin',
    grantedById: string
  ): Promise<boolean> {
    try {
      // Remover permissões existentes da secretaria
      await this.removeSecretariaPermissions(userId, secretaria, grantedById)

      // Definir permissões baseadas no nível
      const permissionsToGrant: string[] = []

      if (level === 'read') {
        permissionsToGrant.push(`${secretaria}.read`)
      } else if (level === 'write') {
        permissionsToGrant.push(`${secretaria}.read`, `${secretaria}.write`)
      } else if (level === 'admin') {
        permissionsToGrant.push(`${secretaria}.read`, `${secretaria}.write`, `${secretaria}.admin`)
      }

      // Conceder permissões
      for (const permissionCode of permissionsToGrant) {
        await this.grantPermissionToUser(userId, permissionCode, grantedById)
      }

      console.log(`✅ [PERMISSION-SERVICE] Permissões de secretaria definidas: ${secretaria} = ${level} para usuário ${userId}`)
      return true

    } catch (error) {
      console.error('❌ [PERMISSION-SERVICE] Erro ao definir permissões de secretaria:', error)
      return false
    }
  }

  /**
   * Remove todas as permissões de uma secretaria específica
   */
  static async removeSecretariaPermissions(
    userId: string,
    secretaria: string,
    revokedById: string
  ): Promise<boolean> {
    try {
      const secretariaPermissions = [`${secretaria}.read`, `${secretaria}.write`, `${secretaria}.admin`]

      for (const permissionCode of secretariaPermissions) {
        await this.revokePermissionFromUser(userId, permissionCode, revokedById)
      }

      return true
    } catch (error) {
      console.error('❌ [PERMISSION-SERVICE] Erro ao remover permissões de secretaria:', error)
      return false
    }
  }

  // ====================================================================
  // MIDDLEWARE DE AUTORIZAÇÃO
  // ====================================================================

  /**
   * Middleware para verificar permissões específicas
   */
  static requirePermissions(permissions: string[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            error: 'Token de autenticação necessário'
          })
          return
        }

        const userPermissions = await this.getUserPermissions(req.user.id)

        const hasAllPermissions = permissions.every(perm =>
          userPermissions.includes(perm)
        )

        if (!hasAllPermissions) {
          // Log da tentativa não autorizada
          await ActivityService.log({
            user_id: req.user.id,
            action: 'permission_denied',
            resource: 'security',
            details: JSON.stringify({
              requiredPermissions: permissions,
              userPermissions: userPermissions.length,
              endpoint: req.path,
              method: req.method
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          })

          res.status(403).json({
            success: false,
            error: 'Permissões insuficientes',
            required: permissions,
            userRole: req.user.role
          })
          return
        }

        next()

      } catch (error) {
        console.error('❌ [PERMISSION-SERVICE] Erro no middleware de permissões:', error)
        res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        })
      }
    }
  }

  /**
   * Middleware para verificar acesso a secretaria específica
   */
  static requireSecretariaAccess(secretaria: string, action: 'read' | 'write' | 'admin' = 'read') {
    const requiredPermission = `${secretaria}.${action}`
    return this.requirePermissions([requiredPermission])
  }

  // ====================================================================
  // UTILITÁRIOS E CONSULTAS
  // ====================================================================

  /**
   * Lista todas as permissões disponíveis no sistema
   */
  static async getAllPermissions(): Promise<Permission[]> {
    return Object.values(PERMISSIONS)
  }

  /**
   * Obtém estatísticas de permissões de um usuário
   */
  static async getUserPermissionStats(userId: string): Promise<{
    totalPermissions: number
    rolePermissions: number
    specificPermissions: number
    secretariasWithAccess: string[]
    categoryCounts: Record<string, number>
  }> {
    try {
      const userPermissions = await this.getUserPermissions(userId)
      const user = await prisma.user.findUnique({ where: { id: userId } })

      const rolePermissions = ROLE_PERMISSIONS[user?.role || 'guest'] || []
      const specificPermissions = userPermissions.filter(p => !rolePermissions.includes(p))

      // Identificar secretarias com acesso
      const secretariasWithAccess = userPermissions
        .filter(p => p.includes('.'))
        .map(p => p.split('.')[0])
        .filter((s, i, arr) => arr.indexOf(s) === i) // Remove duplicatas
        .filter(s => ['gabinete', 'saude', 'educacao', 'assistencia_social', 'obras', 'meio_ambiente', 'cultura', 'esportes', 'turismo', 'agricultura', 'planejamento_urbano', 'seguranca_publica', 'servicos_publicos', 'habitacao'].includes(s))

      // Contar por categoria
      const categoryCounts: Record<string, number> = {}
      for (const permission of userPermissions) {
        const perm = PERMISSIONS[permission]
        if (perm) {
          categoryCounts[perm.category] = (categoryCounts[perm.category] || 0) + 1
        }
      }

      return {
        totalPermissions: userPermissions.length,
        rolePermissions: rolePermissions.length,
        specificPermissions: specificPermissions.length,
        secretariasWithAccess,
        categoryCounts
      }

    } catch (error) {
      console.error('❌ [PERMISSION-SERVICE] Erro ao obter estatísticas:', error)
      return {
        totalPermissions: 0,
        rolePermissions: 0,
        specificPermissions: 0,
        secretariasWithAccess: [],
        categoryCounts: {}
      }
    }
  }

  /**
   * Verifica se um usuário pode gerenciar permissões de outro usuário
   */
  static async canManageUserPermissions(managerId: string, targetUserId: string): Promise<boolean> {
    // Super admins podem gerenciar qualquer usuário
    if (await this.userHasPermission(managerId, 'users.manage_permissions')) {
      return true
    }

    // Admins podem gerenciar usuários do mesmo tenant
    const manager = await prisma.user.findUnique({ where: { id: managerId } })
    const target = await prisma.user.findUnique({ where: { id: targetUserId } })

    if (!manager || !target) {
      return false
    }

    // Verificar se é admin e se é do mesmo tenant
    if (manager.role === 'admin' && manager.tenantId === target.tenantId) {
      return await this.userHasPermission(managerId, 'users.manage_roles')
    }

    return false
  }

  // ====================================================================
  // INICIALIZAÇÃO E MANUTENÇÃO
  // ====================================================================

  /**
   * Sincroniza as permissões do código com o banco de dados
   */
  static async syncPermissions(): Promise<void> {
    try {
      console.log('🔄 [PERMISSION-SERVICE] Sincronizando permissões...')

      const allPermissions = Object.values(PERMISSIONS)

      for (const permission of allPermissions) {
        await prisma.permission.upsert({
          where: { code: permission.code },
          update: {
            resource: permission.resource,
            action: permission.action,
            description: permission.description
          },
          create: {
            code: permission.code,
            resource: permission.resource,
            action: permission.action,
            description: permission.description,
            createdAt: new Date()
          }
        })
      }

      console.log(`✅ [PERMISSION-SERVICE] ${allPermissions.length} permissões sincronizadas`)

    } catch (error) {
      console.error('❌ [PERMISSION-SERVICE] Erro na sincronização de permissões:', error)
      throw error
    }
  }

  /**
   * Limpa permissões órfãs (não existem mais no código)
   */
  static async cleanupOrphanedPermissions(): Promise<void> {
    try {
      const validPermissionCodes = Object.keys(PERMISSIONS)

      const orphanedPermissions = await prisma.permission.findMany({
        where: {
          code: {
            notIn: validPermissionCodes
          }
        }
      })

      if (orphanedPermissions.length > 0) {
        console.log(`🧹 [PERMISSION-SERVICE] Removendo ${orphanedPermissions.length} permissões órfãs...`)

        await prisma.permission.deleteMany({
          where: {
            code: {
              notIn: validPermissionCodes
            }
          }
        })

        console.log('✅ [PERMISSION-SERVICE] Permissões órfãs removidas')
      }

    } catch (error) {
      console.error('❌ [PERMISSION-SERVICE] Erro ao limpar permissões órfãs:', error)
    }
  }

  // ====================================================================
  // MIDDLEWARE PRÉ-CONFIGURADOS
  // ====================================================================

  // Gestão de usuários
  static requireUserCreate = this.requirePermissions(['users.create'])
  static requireUserRead = this.requirePermissions(['users.read'])
  static requireUserUpdate = this.requirePermissions(['users.update'])
  static requireUserDelete = this.requirePermissions(['users.delete'])
  static requireUserResetPassword = this.requirePermissions(['users.reset_password'])
  static requireUserManageRoles = this.requirePermissions(['users.manage_roles'])
  static requireUserManagePermissions = this.requirePermissions(['users.manage_permissions'])

  // Sistema
  static requireSystemAdmin = this.requirePermissions(['system.admin'])
  static requireSystemConfig = this.requirePermissions(['system.config'])

  // Auditoria
  static requireAuditRead = this.requirePermissions(['audit.read'])
  static requireAuditExport = this.requirePermissions(['audit.export'])

  // Secretarias - Gabinete
  static requireGabineteRead = this.requireSecretariaAccess('gabinete', 'read')
  static requireGabineteWrite = this.requireSecretariaAccess('gabinete', 'write')
  static requireGabineteAdmin = this.requireSecretariaAccess('gabinete', 'admin')

  // Secretarias - Saúde
  static requireSaudeRead = this.requireSecretariaAccess('saude', 'read')
  static requireSaudeWrite = this.requireSecretariaAccess('saude', 'write')
  static requireSaudeAdmin = this.requireSecretariaAccess('saude', 'admin')

  // Secretarias - Educação
  static requireEducacaoRead = this.requireSecretariaAccess('educacao', 'read')
  static requireEducacaoWrite = this.requireSecretariaAccess('educacao', 'write')
  static requireEducacaoAdmin = this.requireSecretariaAccess('educacao', 'admin')
}

export default PermissionService