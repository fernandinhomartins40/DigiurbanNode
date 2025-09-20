// ====================================================================
// 🔧 PRISMA TYPES HELPER - DIGIURBAN SYSTEM
// ====================================================================
// Inferência de tipos do Prisma Client de forma mais robusta
// ====================================================================

import { PrismaClient } from '@prisma/client'

// Criar instância para inferência de tipos
const prisma = new PrismaClient()

// ====================================================================
// TYPES INFERIDOS DO PRISMA CLIENT
// ====================================================================

export type User = Awaited<ReturnType<typeof prisma.user.findFirst>> & {}
export type Tenant = Awaited<ReturnType<typeof prisma.tenant.findFirst>> & {}
export type Permission = Awaited<ReturnType<typeof prisma.permission.findFirst>> & {}
export type UserPermission = Awaited<ReturnType<typeof prisma.userPermission.findFirst>> & {}
export type ActivityLog = Awaited<ReturnType<typeof prisma.activityLog.findFirst>> & {}
export type SmtpUser = Awaited<ReturnType<typeof prisma.smtpUser.findFirst>> & {}
export type EmailDomain = Awaited<ReturnType<typeof prisma.emailDomain.findFirst>> & {}
export type Email = Awaited<ReturnType<typeof prisma.email.findFirst>> & {}
export type SmtpConnection = Awaited<ReturnType<typeof prisma.smtpConnection.findFirst>> & {}
export type AuthAttempt = Awaited<ReturnType<typeof prisma.authAttempt.findFirst>> & {}
export type DkimKey = Awaited<ReturnType<typeof prisma.dkimKey.findFirst>> & {}

// ====================================================================
// PRISMA NAMESPACE TYPES
// ====================================================================

export type { Prisma } from '@prisma/client'

// ====================================================================
// UTILITY TYPES
// ====================================================================

export type UserCreateInput = Parameters<typeof prisma.user.create>[0]['data']
export type UserUpdateInput = Parameters<typeof prisma.user.update>[0]['data']
export type UserWhereInput = Parameters<typeof prisma.user.findFirst>[0]['where']

export type TenantCreateInput = Parameters<typeof prisma.tenant.create>[0]['data']
export type TenantUpdateInput = Parameters<typeof prisma.tenant.update>[0]['data']
export type TenantWhereInput = Parameters<typeof prisma.tenant.findFirst>[0]['where']