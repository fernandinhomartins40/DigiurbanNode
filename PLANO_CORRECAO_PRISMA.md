# 🎯 PLANO DE CORREÇÃO SISTEMÁTICA - DIGIURBAN PRISMA

## 🔍 PROBLEMA IDENTIFICADO

### **CAUSA RAIZ**: Incompatibilidade de versões Prisma
- **Prisma CLI**: 6.16.2
- **@prisma/client**: 5.22.0
- **Resultado**: Cliente gerado com tipos inconsistentes

### **SINTOMAS**:
1. Escalares usam `tenant_id` (snake_case)
2. Inputs usam `tenantId` (camelCase)
3. Código TypeScript espera camelCase
4. **261 erros** de incompatibilidade de tipos

## 📋 PLANO DE CORREÇÃO EM FASES

### **FASE 1: Alinhar Versões Prisma** ⚡
```bash
cd backend
npm install @prisma/client@6.16.2
npx prisma generate
```

**Objetivo**: Sincronizar versões CLI e cliente

### **FASE 2: Verificar Geração** 🔍
```bash
# Testar se tipos agora usam camelCase
grep -A 5 "scalars:" src/database/generated/client/index.d.ts
```

**Verificar se**: `tenant_id` → `tenantId`

### **FASE 3: Se Ainda Houver Problemas - Ajustar Schema** 📝

**Opção A**: Forçar camelCase no schema
```prisma
model User {
  tenantId String? @map("tenant_id")  // Explicit camelCase
}
```

**Opção B**: Aceitar snake_case no TypeScript
```typescript
// Ajustar código para usar tenant_id em vez de tenantId
```

### **FASE 4: Regenerar e Testar** 🔄
```bash
npx prisma generate
npx tsc --noEmit
```

### **FASE 5: Correção Sistemática por Arquivo** 🛠️

1. **Controllers** (25 arquivos)
2. **Services** (15 arquivos)
3. **Models** (8 arquivos)
4. **Middleware** (5 arquivos)
5. **Utils** (3 arquivos)

## 🎯 ESTRATÉGIA PREFERIDA

### **1. Atualizar @prisma/client**
```bash
npm install @prisma/client@6.16.2
npx prisma generate
```

### **2. Testar Build**
```bash
npx tsc --noEmit | wc -l
```

### **3. Se Tipos Estiverem Corretos**:
- Corrigir código TypeScript para usar tipos gerados
- Manter schema.prisma como está

### **4. Se Tipos Ainda Estiverem Errados**:
- Investigar configurações Prisma específicas
- Considerar downgrade ou ajuste manual

## ⚠️ PONTOS CRÍTICOS

1. **Não alterar banco de dados** - mantém `snake_case`
2. **TypeScript deve usar nomenclatura do cliente gerado**
3. **Testar a cada mudança** para evitar regressões
4. **Um arquivo por vez** para rastreamento preciso

## 🔄 ROLLBACK PLAN

Se algo der errado:
```bash
git checkout schema.prisma
npm install @prisma/client@5.22.0
npx prisma generate
```

## ✅ CRITÉRIOS DE SUCESSO

1. **Zero erros TypeScript**: `npx tsc --noEmit`
2. **Tipos consistentes**: Escalares = Inputs
3. **Funcionalidade preservada**: Testes passando
4. **Performance mantida**: Sem impacto no runtime