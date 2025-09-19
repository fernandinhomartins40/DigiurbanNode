# 📋 NOMENCLATURA DE REFERÊNCIA - SCHEMA CORRIGIDO

## 🎯 CAMPOS DO SCHEMA (APÓS CORREÇÃO PRISMA v6.16.2)

### **User Model** - Nomenclatura TypeScript
```typescript
interface User {
  id: string
  tenantId: string | null           // ✅ camelCase
  nomeCompleto: string              // ✅ camelCase
  email: string
  passwordHash: string              // ✅ camelCase
  role: string
  status: string
  avatarUrl: string | null          // ✅ camelCase
  ultimoLogin: Date | null          // ✅ camelCase
  failedLoginAttempts: number | null // ✅ camelCase
  lockedUntil: Date | null          // ✅ camelCase
  emailVerified: boolean | null     // ✅ camelCase
  createdAt: Date | null            // ✅ camelCase
  updatedAt: Date | null            // ✅ camelCase
}
```

### **Tenant Model** - Nomenclatura TypeScript
```typescript
interface Tenant {
  id: string
  tenantCode: string                // ✅ camelCase
  nome: string
  cidade: string
  estado: string
  cnpj: string
  plano: string | null
  status: string | null
  populacao: number | null
  endereco: string | null
  responsavelNome: string | null    // ✅ camelCase
  responsavelEmail: string | null   // ✅ camelCase
  responsavelTelefone: string | null // ✅ camelCase
  createdAt: Date | null            // ✅ camelCase
  updatedAt: Date | null            // ✅ camelCase
}
```

### **UserPermission Model** - Nomenclatura TypeScript
```typescript
interface UserPermission {
  id: number
  userId: string                    // ✅ camelCase
  permissionId: number              // ✅ camelCase
  grantedBy: string | null          // ✅ camelCase
  createdAt: Date | null            // ✅ camelCase
}
```

### **ActivityLog Model** - Nomenclatura TypeScript
```typescript
interface ActivityLog {
  id: number
  userId: string | null             // ✅ camelCase
  tenantId: string | null           // ✅ camelCase
  action: string
  resource: string | null
  resourceId: string | null         // ✅ camelCase
  details: string | null
  ipAddress: string | null          // ✅ camelCase
  userAgent: string | null          // ✅ camelCase
  createdAt: Date | null            // ✅ camelCase
}
```

### **EmailDomain Model** - Nomenclatura TypeScript
```typescript
interface EmailDomain {
  id: number
  tenantId: string | null           // ✅ camelCase
  smtpUserId: number                // ✅ camelCase
  domainName: string                // ✅ camelCase
  isVerified: boolean               // ✅ camelCase
  verificationToken: string | null  // ✅ camelCase
  verifiedAt: Date | null           // ✅ camelCase
  verificationMethod: string | null // ✅ camelCase
  dkimEnabled: boolean              // ✅ camelCase
  spfEnabled: boolean               // ✅ camelCase
  createdAt: Date                   // ✅ camelCase
  updatedAt: Date                   // ✅ camelCase
}
```

## 🚨 PADRÕES QUE O CÓDIGO DEVE SEGUIR

### **1. Sempre usar camelCase no TypeScript**
```typescript
// ✅ CORRETO
user.tenantId
user.nomeCompleto
user.avatarUrl
user.ultimoLogin
user.failedLoginAttempts
user.lockedUntil
user.emailVerified
user.createdAt

// ❌ ERRADO (snake_case)
user.tenant_id
user.nome_completo
user.avatar_url
user.ultimo_login
user.failed_login_attempts
user.locked_until
user.email_verified
user.created_at
```

### **2. Queries Prisma usam camelCase**
```typescript
// ✅ CORRETO
await prisma.user.findUnique({
  where: { id: userId },
  include: { tenant: true }
})

await prisma.user.update({
  where: { id },
  data: {
    tenantId: newTenantId,
    ultimoLogin: new Date(),
    emailVerified: true
  }
})

// ❌ ERRADO
await prisma.user.update({
  where: { id },
  data: {
    tenant_id: newTenantId,        // snake_case
    ultimo_login: new Date(),      // snake_case
    email_verified: true           // snake_case
  }
})
```

### **3. Relacionamentos usam camelCase**
```typescript
// ✅ CORRETO
await prisma.userPermission.create({
  data: {
    userId: user.id,
    permissionId: permission.id,
    grantedBy: admin.id
  }
})

// ❌ ERRADO
await prisma.userPermission.create({
  data: {
    user_id: user.id,              // snake_case
    permission_id: permission.id,  // snake_case
    granted_by: admin.id           // snake_case
  }
})
```

## 🔍 ÁREAS A VERIFICAR

### **Backend**
1. **Models** (`src/models/`)
2. **Services** (`src/services/`)
3. **Controllers** (`src/controllers/`)
4. **Middleware** (`src/middleware/`)
5. **Routes** (`src/routes/`)
6. **Utils** (`src/utils/`)

### **Frontend**
1. **Types/Interfaces** (`src/types/`)
2. **API calls** (`src/services/`)
3. **Components** (`src/components/`)
4. **Stores/Context** (`src/store/`)
5. **Utils** (`src/utils/`)

## 🎯 CHECKLIST DE VERIFICAÇÃO

### **✅ Verificar se o código usa:**
- [ ] `tenantId` (não `tenant_id`)
- [ ] `userId` (não `user_id`)
- [ ] `nomeCompleto` (não `nome_completo`)
- [ ] `passwordHash` (não `password_hash`)
- [ ] `avatarUrl` (não `avatar_url`)
- [ ] `ultimoLogin` (não `ultimo_login`)
- [ ] `failedLoginAttempts` (não `failed_login_attempts`)
- [ ] `lockedUntil` (não `locked_until`)
- [ ] `emailVerified` (não `email_verified`)
- [ ] `createdAt` (não `created_at`)
- [ ] `updatedAt` (não `updated_at`)
- [ ] `permissionId` (não `permission_id`)
- [ ] `resourceId` (não `resource_id`)
- [ ] `ipAddress` (não `ip_address`)
- [ ] `userAgent` (não `user_agent`)
- [ ] `grantedBy` (não `granted_by`)

### **✅ Verificar interfaces e tipos**
- [ ] Interfaces TypeScript seguem nomenclatura do schema
- [ ] Props de componentes React seguem nomenclatura
- [ ] Responses de API seguem nomenclatura
- [ ] Requests para API seguem nomenclatura