# 📋 ANÁLISE DE NOMENCLATURA - DIGIURBAN PRISMA SCHEMA

## 🔍 PROBLEMAS IDENTIFICADOS NO SCHEMA.PRISMA

### 1. **INCONSISTÊNCIAS DE MAPEAMENTO**

#### **User Model (Linhas 52-89)**
```prisma
model User {
  id                  String       @id
  tenantId            String?      @map("tenant_id")     // ✅ Correto: camelCase -> snake_case
  nomeCompleto        String       @map("nome_completo")  // ✅ Correto
  email               String       @unique
  passwordHash        String       @map("password_hash")  // ✅ Correto
  // ...
}
```

**PROBLEMA**: No cliente gerado, os tipos mostram `tenant_id` em vez de `tenantId`:
- **Schema**: `tenantId String? @map("tenant_id")`
- **Cliente Prisma**: Retorna `tenant_id: string | null`
- **Esperado**: Deveria retornar `tenantId: string | null`

#### **UserPermission Model (Linhas 106-121)**
```prisma
model UserPermission {
  id           Int        @id @default(autoincrement())
  userId       String     @map("user_id")               // ❌ PROBLEMA: Inconsistente
  permissionId Int        @map("permission_id")          // ❌ PROBLEMA: Inconsistente
  grantedBy    String?    @map("granted_by")            // ❌ PROBLEMA: Inconsistente
}
```

**PROBLEMA**: Referência composta incorreta na linha 117:
```prisma
@@unique([userId, permissionId], map: "user_permissions_user_id_permission_id_unique")
```

### 2. **PADRÕES MISTOS DE NOMENCLATURA**

#### **Campos de Data/Timestamp**
- ✅ **Correto**: `createdAt DateTime? @map("created_at")`
- ✅ **Correto**: `updatedAt DateTime? @map("updated_at")`
- ✅ **Correto**: `lockedUntil DateTime? @map("locked_until")`

#### **Campos de Relacionamento**
- ✅ **Correto**: `tenantId String? @map("tenant_id")`
- ❌ **Problema**: `userId String @map("user_id")` - Cliente retorna `user_id` não `userId`

### 3. **INCONSISTÊNCIAS NOS AGREGADOS**

#### **Do Cliente Prisma Gerado**:
```typescript
export type UserMinAggregateOutputType = {
  id: string | null
  tenant_id: string | null          // ❌ Deveria ser tenantId
  nomeCompleto: string | null
  // ...
}

export type UserMinAggregateInputType = {
  id?: true
  tenantId?: true                   // ✅ Correto aqui
  nomeCompleto?: true
  // ...
}
```

### 4. **PADRÃO CORRETO IDENTIFICADO**

#### **No Schema Prisma**:
```prisma
model User {
  tenantId     String?   @map("tenant_id")     // Campo TypeScript
  //           ^^^^^^^   ^^^^^^^^^^^^^^^
  //           camelCase  snake_case (DB)
}
```

#### **No Cliente Esperado**:
```typescript
type User = {
  tenantId: string | null    // ❌ Atual: tenant_id
  // Deveria usar camelCase no TypeScript
}
```

## 🎯 ESTRATÉGIA DE CORREÇÃO

### **FASE 1: Correção do Schema Base**
1. Verificar todos os `@map()` para consistência
2. Garantir que campos TypeScript usem camelCase
3. Garantir que mapeamento de DB use snake_case

### **FASE 2: Regeneração Prisma**
1. `npx prisma generate`
2. Verificar tipos gerados

### **FASE 3: Correção Sistemática**
1. Controllers: Usar propriedades camelCase dos tipos Prisma
2. Services: Alinhar com tipos Prisma gerados
3. Models: Adaptar para nova nomenclatura

## 📋 CHECKLIST DE CAMPOS A CORRIGIR

### **User Model**
- ✅ `tenantId` → DB: `tenant_id`
- ✅ `nomeCompleto` → DB: `nome_completo`
- ✅ `passwordHash` → DB: `password_hash`
- ✅ `avatarUrl` → DB: `avatar_url`
- ✅ `ultimoLogin` → DB: `ultimo_login`
- ✅ `failedLoginAttempts` → DB: `failed_login_attempts`
- ✅ `lockedUntil` → DB: `locked_until`
- ✅ `emailVerified` → DB: `email_verified`
- ✅ `createdAt` → DB: `created_at`
- ✅ `updatedAt` → DB: `updated_at`

### **UserPermission Model**
- ❌ `userId` → `user_id` (verificar mapeamento)
- ❌ `permissionId` → `permission_id` (verificar mapeamento)
- ❌ `grantedBy` → `granted_by` (verificar mapeamento)

### **ActivityLog Model**
- ❌ `userId` → `user_id` (verificar mapeamento)
- ❌ `tenantId` → `tenant_id` (verificar mapeamento)
- ❌ `resourceId` → `resource_id` (verificar mapeamento)
- ❌ `ipAddress` → `ip_address` (verificar mapeamento)
- ❌ `userAgent` → `user_agent` (verificar mapeamento)

## 🔧 PRÓXIMOS PASSOS

1. **Corrigir Schema**: Padronizar `@map()` directives
2. **Regenerar**: `npx prisma generate`
3. **Testar**: Verificar tipos gerados
4. **Corrigir**: Código TypeScript sistematicamente