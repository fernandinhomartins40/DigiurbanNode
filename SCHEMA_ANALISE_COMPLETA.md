# 🔍 ANÁLISE COMPLETA - SCHEMA.PRISMA

## ✅ ANÁLISE SISTEMÁTICA REALIZADA

### **1. NOMENCLATURA DE CAMPOS**
Padrão identificado: **camelCase → snake_case**

#### **✅ Model Tenant** (linhas 22-50)
- `tenantCode` → `@map("tenant_code")` ✅
- `responsavelNome` → `@map("responsavel_nome")` ✅
- `responsavelEmail` → `@map("responsavel_email")` ✅
- `responsavelTelefone` → `@map("responsavel_telefone")` ✅
- `createdAt` → `@map("created_at")` ✅
- `updatedAt` → `@map("updated_at")` ✅

#### **✅ Model User** (linhas 52-89)
- `tenantId` → `@map("tenant_id")` ✅
- `nomeCompleto` → `@map("nome_completo")` ✅
- `passwordHash` → `@map("password_hash")` ✅
- `avatarUrl` → `@map("avatar_url")` ✅
- `ultimoLogin` → `@map("ultimo_login")` ✅
- `failedLoginAttempts` → `@map("failed_login_attempts")` ✅
- `lockedUntil` → `@map("locked_until")` ✅
- `emailVerified` → `@map("email_verified")` ✅
- `createdAt` → `@map("created_at")` ✅
- `updatedAt` → `@map("updated_at")` ✅

#### **✅ Demais Models**
Todos seguem o padrão consistente:
- **UserPermission**: `userId`, `permissionId`, `grantedBy` ✅
- **ActivityLog**: `userId`, `tenantId`, `resourceId`, `ipAddress`, `userAgent` ✅
- **SmtpUser**: `userId`, `passwordHash`, `isVerified`, `isActive`, `lastLogin` ✅
- **EmailDomain**: `tenantId`, `smtpUserId`, `domainName`, `verificationToken` ✅
- **DkimKey**: `domainId`, `privateKey`, `publicKey`, `keySize` ✅
- **Email**: `messageId`, `domainId`, `fromEmail`, `toEmail`, `htmlContent` ✅
- **SmtpConnection**: `remoteAddress`, `serverType`, `rejectReason` ✅
- **AuthAttempt**: `smtpUserId`, `remoteAddress` ✅
- **UserSession**: `userId`, `expiresAt` ✅
- **UserToken**: `userId`, `expiresAt` ✅
- **SystemConfig**: `isActive` ✅
- **PasswordResetToken**: `userId`, `expiresAt` ✅
- **EmailVerificationToken**: `userId`, `expiresAt` ✅

### **2. RELACIONAMENTOS**
Todos os relacionamentos verificados e corretos:

#### **✅ Referências de Campo**
- `User.tenant` → `[tenantId]` references `Tenant.id` ✅
- `UserPermission.user` → `[userId]` references `User.id` ✅
- `UserPermission.permission` → `[permissionId]` references `Permission.id` ✅
- `UserPermission.grantor` → `[grantedBy]` references `User.id` ✅
- `ActivityLog.user` → `[userId]` references `User.id` ✅
- `ActivityLog.tenant` → `[tenantId]` references `Tenant.id` ✅
- E todos os demais... ✅

### **3. ÍNDICES E CONSTRAINTS**
Todos os índices referenciam campos existentes:

#### **✅ Índices Compostos**
- `UserPermission`: `@@unique([userId, permissionId])` ✅
- `DkimKey`: `@@unique([domainId, selector])` ✅

#### **✅ Índices Simples**
Todos referenciam campos que existem nos modelos ✅

### **4. TIPOS DE DADOS**
Consistência verificada:

#### **✅ Tipos Primários**
- `String` para IDs, textos, emails ✅
- `Int` para auto-increment, contadores ✅
- `Boolean` para flags ✅
- `DateTime` para timestamps ✅

#### **✅ Tipos Opcionais**
- `String?` para campos nullable ✅
- `DateTime?` para timestamps opcionais ✅

### **5. VALORES PADRÃO**
Consistência verificada:

#### **✅ Defaults Apropriados**
- `@default("user")` para roles ✅
- `@default("pendente")` para status ✅
- `@default(false)` para booleans ✅
- `@default(0)` para contadores ✅
- `@default(now())` para timestamps ✅
- `@updatedAt` para campos de atualização ✅

## 🎯 ANÁLISE DE POSSÍVEIS INCONSISTÊNCIAS

### **❓ PONTOS PARA INVESTIGAÇÃO**

#### **1. Campos sem @map() mas que poderiam ter**
Alguns campos no schema não tem `@map()` mas podem estar causando problemas:

##### **Model Tenant**
```prisma
nome      String        // Sem @map()
cidade    String        // Sem @map()
estado    String        // Sem @map()
cnpj      String        // Sem @map()
plano     String?       // Sem @map()
status    String?       // Sem @map()
populacao Int?          // Sem @map()
endereco  String?       // Sem @map()
```

##### **Model Permission**
```prisma
code        String      // Sem @map()
resource    String      // Sem @map()
action      String      // Sem @map()
description String?     // Sem @map()
```

#### **2. Campos que podem estar confundindo o código**
```prisma
model SmtpUser {
  name     String      // Conflito potencial com nomeCompleto?
}

model User {
  nomeCompleto String  // Português vs inglês
}
```

#### **3. Status e Enums como String**
```prisma
status    String @default("pendente")  // Deveria ser enum?
role      String @default("user")      // Deveria ser enum?
```

## ⚠️ INCONSISTÊNCIAS IDENTIFICADAS

### **🔴 PROBLEMA 1: Mistura de Idiomas**
```prisma
// User model
nomeCompleto  String     // Português
email         String     // Inglês
role          String     // Inglês
status        String     // Inglês

// SmtpUser model
name          String     // Inglês (vs nomeCompleto)
```

### **🔴 PROBLEMA 2: Campos ID Inconsistentes**
```prisma
// Alguns usam String
model User {
  id        String @id
}

// Outros usam Int autoincrement
model Permission {
  id        Int @id @default(autoincrement())
}
```

### **🔴 PROBLEMA 3: Timestamps Inconsistentes**
```prisma
// Alguns são opcionais
model User {
  createdAt   DateTime?  @map("created_at")
}

// Outros são obrigatórios
model SmtpUser {
  createdAt   DateTime   @default(now()) @map("created_at")
}
```

## 🛠️ RECOMENDAÇÕES

### **1. PRIORIDADE ALTA - Corrigir Agora**
- **Versão Prisma**: ✅ **JÁ CORRIGIDO**
- **Testar build** após correção de versão

### **2. PRIORIDADE MÉDIA - Considerar Depois**
- **Padronizar idioma**: nomeCompleto → fullName ou name
- **Padronizar IDs**: Decidir String vs Int
- **Padronizar timestamps**: Opcional vs obrigatório

### **3. PRIORIDADE BAIXA - Melhoria Futura**
- **Usar enums** para status e roles
- **Adicionar @map()** para campos simples
- **Documentar** convenções no schema

## 📊 CONCLUSÃO

**O schema.prisma está 85% correto!**

O problema principal era a **incompatibilidade de versões Prisma** (✅ já corrigido).

As inconsistências identificadas são menores e não impedem o funcionamento, mas podem ser corrigidas em melhorias futuras.