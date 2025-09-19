// ====================================================================
// 🔌 PRISMA CLIENT SETUP - DIGIURBAN SYSTEM
// ====================================================================
// Configuração otimizada do cliente Prisma com pooling e middleware
// Substitui completamente o sistema Knex.js anterior
// ====================================================================

import { PrismaClient, Prisma } from './generated/client/index.js'
import { StructuredLogger } from '../monitoring/structuredLogger.js'

// ====================================================================
// CONFIGURAÇÃO GLOBAL DO CLIENTE
// ====================================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ====================================================================
// MIDDLEWARE DE LOG ESTRUTURADO (TEMPORARILY DISABLED)
// ====================================================================

/*
// TODO: Update middleware to match Prisma v6 API
const logMiddleware: Prisma.Middleware = async (params, next) => {
  const before = Date.now()

  const result = await next(params)

  const after = Date.now()
  const duration = after - before

  // Log apenas queries que demoram mais que 100ms
  if (duration > 100) {
    StructuredLogger.performance('Slow database query', {
      action: 'database_query',
      model: params.model,
      operation: params.action,
      duration,
      threshold: 100
    })
  }

  return result
}
*/

// ====================================================================
// MIDDLEWARE DE AUDITORIA (TEMPORARILY DISABLED)
// ====================================================================

/*
// TODO: Update middleware to match Prisma v6 API
const auditMiddleware: Prisma.Middleware = async (params, next) => {
  // Capturar operações de escrita para auditoria
  const writeOperations = ['create', 'update', 'delete', 'upsert']

  if (writeOperations.includes(params.action)) {
    const before = Date.now()
    const result = await next(params)
    const after = Date.now()

    // Log operações de escrita
    StructuredLogger.business('Database write operation', {
      action: 'database_write',
      model: params.model,
      operation: params.action,
      duration: after - before,
      affectedRecords: Array.isArray(result) ? result.length : 1
    })

    return result
  }

  return next(params)
}

// ====================================================================
// MIDDLEWARE DE SOFT DELETE
// ====================================================================

const softDeleteMiddleware: Prisma.Middleware = async (params, next) => {
  // Implementar soft delete para modelos que precisam
  if (params.action === 'delete') {
    // Converter delete em update com status = 'inativo'
    if (params.model === 'User' || params.model === 'Tenant') {
      params.action = 'update'
      params.args = {
        ...params.args,
        data: {
          status: params.model === 'User' ? 'INATIVO' : 'INATIVO'
        }
      }
    }
  }

  if (params.action === 'deleteMany') {
    // Converter deleteMany em updateMany
    if (params.model === 'User' || params.model === 'Tenant') {
      params.action = 'updateMany'
      params.args = {
        ...params.args,
        data: {
          status: params.model === 'User' ? 'INATIVO' : 'INATIVO'
        }
      }
    }
  }

  return next(params)
}

*/

// ====================================================================
// INSTÂNCIA DO CLIENTE PRISMA
// ====================================================================

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

// ====================================================================
// CONFIGURAÇÃO DE EVENTOS DE LOG
// ====================================================================

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Log apenas queries > 1s
    StructuredLogger.performance('Very slow database query', {
      action: 'database_query',
      query: e.query,
      params: e.params,
      duration: e.duration,
      threshold: 1000
    })
  }
})

prisma.$on('error', (e) => {
  StructuredLogger.error('Database error', new Error(e.message), {
    action: 'database_error',
    target: e.target
  })
})

prisma.$on('warn', (e) => {
  StructuredLogger.warning('Database warning', {
    action: 'database_warning',
    message: e.message
  })
})

// ====================================================================
// APLICAÇÃO DOS MIDDLEWARES (TEMPORARIAMENTE COMENTADO)
// ====================================================================

// TODO: Converter para Prisma 5.x $extends
// prisma.$use(logMiddleware)
// prisma.$use(auditMiddleware)
// prisma.$use(softDeleteMiddleware)

// ====================================================================
// CONFIGURAÇÃO DO SINGLETON
// ====================================================================

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// ====================================================================
// FUNÇÕES DE CONEXÃO E HEALTH CHECK
// ====================================================================

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Conectando ao banco com Prisma...')
    await prisma.$connect()
    console.log('✅ Prisma conectado com sucesso')

    StructuredLogger.info('Prisma database connected', {
      action: 'database_connect',
      resource: 'database'
    })
  } catch (error) {
    console.error('❌ Erro ao conectar Prisma:', error)
    StructuredLogger.error('Prisma connection failed', error as Error, {
      action: 'database_connect',
      errorType: 'connection_error'
    })
    throw error
  }
}

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect()
    console.log('✅ Prisma desconectado')

    StructuredLogger.info('Prisma database disconnected', {
      action: 'database_disconnect',
      resource: 'database'
    })
  } catch (error) {
    console.error('❌ Erro ao desconectar Prisma:', error)
    StructuredLogger.error('Prisma disconnection failed', error as Error, {
      action: 'database_disconnect',
      errorType: 'disconnection_error'
    })
  }
}

export const healthCheck = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('❌ Health check falhou:', error)
    return false
  }
}

// ====================================================================
// FUNÇÕES DE TRANSAÇÃO
// ====================================================================

export const transaction = async <T>(
  fn: (prisma: Prisma.TransactionClient) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(fn)
}

// ====================================================================
// FUNÇÕES DE BACKUP (SQLite)
// ====================================================================

export const createBackup = async (backupPath: string): Promise<void> => {
  const fs = await import('fs')
  const path = await import('path')

  try {
    // Para SQLite, fazemos backup copiando o arquivo
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/digiurban.db'

    // Criar diretório se não existir
    const backupDir = path.dirname(backupPath)
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    fs.copyFileSync(dbPath, backupPath)
    console.log('✅ Backup criado:', backupPath)

    StructuredLogger.info('Database backup created', {
      action: 'database_backup',
      backupPath,
      originalPath: dbPath
    })
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error)
    StructuredLogger.error('Database backup failed', error as Error, {
      action: 'database_backup',
      backupPath
    })
    throw error
  }
}

// ====================================================================
// CLEANUP E SIGNALS
// ====================================================================

process.on('beforeExit', async () => {
  await disconnectDatabase()
})

process.on('SIGINT', async () => {
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await disconnectDatabase()
  process.exit(0)
})

// ====================================================================
// EXPORTS PRINCIPAIS
// ====================================================================

export default prisma

// Re-export tipos úteis
export type {
  User,
  Tenant,
  Permission,
  UserPermission,
  ActivityLog,
  SmtpUser,
  EmailDomain,
  Email,
  SmtpConnection,
  AuthAttempt,
  DkimKey,
  Prisma
} from './generated/client/index.js'