# 🚨 INCONSISTÊNCIAS MAPEADAS - BACKEND vs FRONTEND vs SCHEMA

## 📊 RESUMO EXECUTIVO

**Schema corrigido**: ✅ Prisma v6.16.2 - nomenclatura **camelCase** para TypeScript
**Backend**: ❌ Mistura snake_case + camelCase
**Frontend**: ❌ Mistura snake_case + camelCase

## 🔍 INCONSISTÊNCIAS NO BACKEND

### **🔴 CRÍTICO: authController.ts**
```typescript
// ❌ ERRADO - Usando snake_case para propriedades
{
  user_id: user.id,              // Deveria ser: userId
  tenant_id: user.tenantId,      // Deveria ser: tenantId
  nome_completo: user.nomeCompleto, // Deveria ser: nomeCompleto
  email_verified: user.emailVerified, // Deveria ser: emailVerified
  created_at: user.createdAt,    // Deveria ser: createdAt
  updated_at: user.updatedAt     // Deveria ser: updatedAt
}
```

### **🔴 CRÍTICO: validation.ts**
```typescript
// ❌ ERRADO - Validation fields usando snake_case
body('nome_completo')  // Deveria ser: body('nomeCompleto')
```

### **🔴 CRÍTICO: Permission.ts**
```typescript
// ❌ ERRADO - Interface usando snake_case
interface Permission {
  created_at: string;  // Deveria ser: createdAt
}
```

### **🔴 CRÍTICO: Services diversos**
- **PermissionService.old.ts**: `userId` undefined, usando `user_id`
- **TokenService**: Mistura `user_id` e `userId`
- **ActivityService**: `tenant_id`, `user_id` em vez de camelCase

## 🔍 INCONSISTÊNCIAS NO FRONTEND

### **🔴 CRÍTICO: authService.ts**
```typescript
// ❌ ERRADO - API responses usando snake_case
{
  name: user.nome_completo,      // Deveria ser: user.nomeCompleto
  tenant_id: user.tenant_id,     // Deveria ser: user.tenantId
  avatar_url: user.avatar_url    // Deveria ser: user.avatarUrl
}
```

### **🔴 CRÍTICO: useAuth.tsx**
```typescript
// ❌ ERRADO - State usando snake_case
user: {
  ...user,
  role: profile.role,
  tenant_id: profile.tenant_id   // Deveria ser: tenantId
}
```

### **🔴 CRÍTICO: PermissionGuard.tsx**
```typescript
// ❌ ERRADO - Accessing com snake_case
profile?.tenant_id              // Deveria ser: profile?.tenantId
```

## 📋 PADRÕES PROBLEMÁTICOS IDENTIFICADOS

### **1. Propriedades de Objeto/JSON**
```typescript
// ❌ PADRÃO ERRADO
{
  user_id: value,
  tenant_id: value,
  nome_completo: value,
  avatar_url: value,
  ultimo_login: value,
  failed_login_attempts: value,
  locked_until: value,
  email_verified: value,
  created_at: value,
  updated_at: value,
  permission_id: value,
  resource_id: value,
  ip_address: value,
  user_agent: value,
  granted_by: value
}

// ✅ PADRÃO CORRETO (Schema Prisma v6.16.2)
{
  userId: value,
  tenantId: value,
  nomeCompleto: value,
  avatarUrl: value,
  ultimoLogin: value,
  failedLoginAttempts: value,
  lockedUntil: value,
  emailVerified: value,
  createdAt: value,
  updatedAt: value,
  permissionId: value,
  resourceId: value,
  ipAddress: value,
  userAgent: value,
  grantedBy: value
}
```

### **2. Validação de Campos**
```typescript
// ❌ PADRÃO ERRADO
body('nome_completo')
body('tenant_id')
body('user_id')

// ✅ PADRÃO CORRETO
body('nomeCompleto')
body('tenantId')
body('userId')
```

### **3. Interfaces TypeScript**
```typescript
// ❌ PADRÃO ERRADO
interface User {
  tenant_id: string;
  nome_completo: string;
  avatar_url: string;
  ultimo_login: Date;
  created_at: Date;
}

// ✅ PADRÃO CORRETO (Schema Prisma)
interface User {
  tenantId: string;
  nomeCompleto: string;
  avatarUrl: string;
  ultimoLogin: Date;
  createdAt: Date;
}
```

## 🎯 ARQUIVOS PRIORITÁRIOS PARA CORREÇÃO

### **Backend - ALTA PRIORIDADE**
1. **`src/controllers/authController.ts`** - 20+ ocorrências
2. **`src/middleware/validation.ts`** - Validações incorretas
3. **`src/models/Permission.ts`** - Interface incorreta
4. **`src/services/PermissionService.old.ts`** - IDs indefinidos
5. **`src/services/TokenService.ts`** - Mistura de padrões
6. **`src/services/ActivityService.ts`** - Logs incorretos

### **Frontend - ALTA PRIORIDADE**
1. **`src/auth/services/authService.ts`** - API responses
2. **`src/auth/hooks/useAuth.tsx`** - State management
3. **`src/auth/guards/PermissionGuard.tsx`** - Acesso a propriedades
4. **`src/types/`** - Interfaces de tipos
5. **`src/components/`** - Props de componentes

### **Shared - MÉDIA PRIORIDADE**
1. **`src/database/audit-seed.ts`** - Seeds de dados
2. **Arquivos de teste** - Assertions e mocks
3. **Configurações** - Environment variables

## 🔧 ESTRATÉGIA DE CORREÇÃO

### **FASE 1: Backend Core (authController.ts)**
- Corrigir todas as ocorrências de snake_case para camelCase
- Testar login/logout/register após correção

### **FASE 2: Validation & Middleware**
- Alinhar validações com schema
- Atualizar middlewares de autenticação

### **FASE 3: Services & Models**
- Corrigir PermissionService.old.ts
- Alinhar TokenService com Prisma
- Corrigir ActivityService logs

### **FASE 4: Frontend Auth**
- Corrigir authService.ts para usar camelCase
- Atualizar useAuth.tsx state
- Corrigir guards e interceptors

### **FASE 5: Frontend Components**
- Atualizar interfaces TypeScript
- Corrigir props de componentes
- Testar UI após mudanças

### **FASE 6: Validação Final**
- Build backend sem erros
- Build frontend sem erros
- Testes E2E funcionando

## ✅ CRITÉRIOS DE SUCESSO

1. **Zero erros TypeScript** no backend
2. **Zero erros TypeScript** no frontend
3. **Nomenclatura consistente** com schema Prisma
4. **APIs funcionando** com nova nomenclatura
5. **Frontend funcionando** com nova nomenclatura
6. **Testes passando** com nova estrutura

## 📈 IMPACTO ESTIMADO

- **Erros atuais**: ~171 linhas
- **Erros esperados após correção**: 0
- **Arquivos afetados**: ~15 backend + ~10 frontend
- **Tempo estimado**: 2-3 horas de correção sistemática
- **Risco**: Baixo (mudanças de nomenclatura apenas)