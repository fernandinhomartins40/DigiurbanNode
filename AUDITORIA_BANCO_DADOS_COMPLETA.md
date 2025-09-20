# 🔍 AUDITORIA COMPLETA - SISTEMA DE BANCO DE DADOS DIGIURBAN

**Data da Auditoria:** 2025-01-20
**Responsável:** Claude Code AI
**Objetivo:** Identificar problemas na criação do banco de dados e execução de seeds/migrations

---

## 📋 RESUMO EXECUTIVO

### 🎯 **Problemas Identificados**
1. **CRÍTICO**: Inconsistência entre configuração local (docker run) vs CI/CD (docker-compose)
2. **CRÍTICO**: Sistema de migrations híbrido (Knex + Prisma) causando conflitos
3. **ALTA**: Seeds com dependência de modelo SystemConfig não implementado no schema
4. **ALTA**: Configuração de environment variables inconsistente entre deploys
5. **MÉDIA**: Paths do schema.prisma com referências relativas problemáticas

### 🎯 **Status Atual**
- ✅ Deploy local funcionando 100%
- ❌ GitHub Actions falhando na criação do banco
- ✅ Schema Prisma válido e completo
- ❌ Seeds executando com warnings

---

## 🔬 ANÁLISE DETALHADA POR COMPONENTE

### 1. **SCHEMA PRISMA** ✅

**Arquivo:** `schema.prisma`
**Status:** VÁLIDO
**Problemas:** Nenhum crítico

```prisma
✅ Definições de modelos: 15 modelos implementados
✅ Relacionamentos: Todos FK definidas corretamente
✅ Índices: Performance otimizada
✅ Generator: Configurado para multiple targets
✅ Datasource: SQLite com DATABASE_URL variável
```

**Observações:**
- Schema completo com sistema de email (UltraZend)
- Suporte a sessões, tokens e autenticação
- Modelo SystemConfig definido mas não usado nos seeds

---

### 2. **SISTEMA DE SEEDS** ⚠️

**Arquivo:** `backend/src/database/seed.ts`
**Status:** FUNCIONAL COM WARNINGS

#### ✅ **Pontos Positivos:**
- Estrutura bem organizada
- Uso correto do Prisma Client
- Geração de UUIDs e hash de senhas
- Super admin com credenciais consistentes

#### ❌ **Problemas Identificados:**

1. **SystemConfig Model Skipped**
   ```typescript
   // Linhas 106-119: Seeds comentados
   console.log('🔧 Configurações do sistema - modelo não implementado no schema')
   console.log('⚠️ SystemConfig seed pulado - modelo não existe')
   ```
   **Impacto:** Configurações do sistema não são persistidas

2. **Inconsistência de Credenciais**
   ```typescript
   // Deploy local: 'admin123'
   const hashedPassword = await bcrypt.hash('admin123', 12)

   // Script migração: 'DigiAdmin2024@'
   const hashedPassword = bcrypt.hashSync('DigiAdmin2024@', 10)
   ```

---

### 3. **SISTEMA DE MIGRATIONS** ❌

**Status:** HÍBRIDO E PROBLEMÁTICO

#### **Problema Principal: Dualidade Knex/Prisma**

**Arquivos Conflitantes:**
- `backend/src/database/migrationRunner.js` - Sistema Knex (antigo)
- `backend/scripts/fix-migrations-production.cjs` - Sistema SQLite direto
- Prisma usando `db:push` ao invés de migrations

#### **Análise do MigrationRunner:**

```javascript
// Linha 23-31: Paths problemáticos
if (process.env.NODE_ENV === 'production' || process.env.DOCKER_ENV === 'true') {
    this.migrationsPath = '/app/migrations';  // ❌ Não existe!
} else {
    const projectRoot = path.resolve(path.dirname(currentFile), '../../../');
    this.migrationsPath = path.join(projectRoot, 'migrations');  // ❌ Não existe!
}
```

**Problema:** Busca pasta `/migrations` que não existe no projeto

---

### 4. **CONFIGURAÇÃO DOCKER** ⚠️

#### **Dockerfile** ✅
**Status:** BEM CONFIGURADO

```dockerfile
✅ Multi-stage build otimizado
✅ Prisma Client gerado corretamente
✅ Permissions não-root configuradas
✅ Schema.prisma copiado corretamente
```

#### **docker-compose.yml** ❌
**Status:** ENVIRONMENT INCOMPLETO

**Problemas Identificados:**

1. **Variáveis Faltantes (CORRIGIDAS):**
   ```yaml
   ✅ SESSION_SECRET: Adicionado
   ✅ API_BASE_URL: Adicionado
   ✅ FRONTEND_URL: Adicionado
   ✅ RATE_LIMIT_*: Adicionado
   ```

2. **Redis Configuração:**
   ```yaml
   ✅ REDIS_ENABLED=false: Configurado
   ✅ ENABLE_REDIS=false: Configurado
   ```

#### **start-services.sh** ⚠️

```bash
# Linha 33: Problema identificado
cd /app/backend && npm run db:migrate:deploy
```

**Problema:** Usa `migrate:deploy` mas não há migrations Prisma, apenas schema push

---

### 5. **COMPARAÇÃO DEPLOY LOCAL vs GITHUB ACTIONS**

| Aspecto | Deploy Local ✅ | GitHub Actions ❌ | Status |
|---------|----------------|-------------------|---------|
| **Runtime** | `docker run` | `docker-compose` | ⚠️ Diferentes |
| **Database Setup** | `npx prisma db push` | `npx prisma db push` | ✅ Idêntico |
| **Seeds** | `node dist/database/seed.js` | `node dist/database/seed.js` | ✅ Idêntico |
| **User Activation** | `node -e "..."` | `echo > activate_users.js` | ✅ Corrigido |
| **Password** | `admin123` | `admin123` | ✅ Corrigido |
| **Environment** | Variáveis completas | Variáveis completas | ✅ Corrigido |

#### **Diferenças Críticas Identificadas:**

1. **Container Runtime:**
   - **Local:** `docker run` com variáveis dinâmicas
   - **CI/CD:** `docker-compose` com variáveis fixas

2. **Start Script Execution:**
   - **Local:** Executa diretamente `npx prisma db push`
   - **CI/CD:** Executa `npm run db:migrate:deploy` via start-services.sh

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **INCONSISTÊNCIA NO START SCRIPT**

**Arquivo:** `start-services.sh:33`
```bash
❌ cd /app/backend && npm run db:migrate:deploy
```

**Problema:**
- `db:migrate:deploy` busca migrations que não existem
- Deploy local usa `db:push` diretamente
- CI/CD está executando comando diferente

### 2. **MIGRATION RUNNER BUSCANDO PATHS INEXISTENTES**

**Arquivo:** `backend/src/database/migrationRunner.js:25-31`
```javascript
❌ this.migrationsPath = '/app/migrations';          // Não existe!
❌ this.migrationsPath = path.join(projectRoot, 'migrations'); // Não existe!
```

### 3. **SEEDS COM MODELO FALTANTE**

**Arquivo:** `backend/src/database/seed.ts:106-119`
```typescript
❌ SystemConfig seeds comentados porque modelo não existe no schema
```

**Mas o modelo EXISTE no schema:**
```prisma
✅ model SystemConfig {
  id          Int      @id @default(autoincrement())
  key         String   @unique
  value       String
  description String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([key])
  @@index([isActive])
  @@map("system_config")
}
```

---

## 📋 PLANO DE SOLUÇÃO EM 3 FASES

### 🎯 **FASE 1: CORREÇÃO IMEDIATA (CRÍTICA)**

#### **1.1 Corrigir start-services.sh**
```bash
# ANTES (linha 33):
cd /app/backend && npm run db:migrate:deploy

# DEPOIS:
cd /app/backend && npm run db:push
```

#### **1.2 Habilitar SystemConfig nos Seeds**
```typescript
// Descomentar e corrigir seed SystemConfig
async function seedSystemConfig() {
  console.log('🔧 Configurando sistema...')

  for (const config of SYSTEM_CONFIG) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: config
    })
  }

  console.log('✅ SystemConfig configurado')
}
```

#### **1.3 Padronizar Credenciais**
```typescript
// Usar SEMPRE admin123 em todos os ambientes
const hashedPassword = await bcrypt.hash('admin123', 12)
```

### 🎯 **FASE 2: PADRONIZAÇÃO (ALTA PRIORIDADE)**

#### **2.1 Eliminar Migration Runner Legacy**
- Remover `backend/src/database/migrationRunner.js`
- Remover `backend/scripts/fix-migrations-production.cjs`
- Usar APENAS Prisma `db:push` para desenvolvimento

#### **2.2 Centralizar Database Setup**
```bash
# Criar script unificado: scripts/setup-database.sh
#!/bin/bash
echo "🗃️ Configurando banco de dados..."

# Limpar banco anterior
rm -f /app/data/digiurban.db*

# Criar schema
npx prisma db push --schema=../schema.prisma

# Executar seeds
node dist/database/seed.js

# Ativar usuários
node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  await prisma.user.updateMany({ data: { status: 'ativo' } });
  await prisma.\$disconnect();
})();"

echo "✅ Banco configurado com sucesso"
```

#### **2.3 Unificar Environment Variables**
```yaml
# docker-compose.yml e deploy local devem usar EXATAMENTE as mesmas variáveis
environment:
  - NODE_ENV=production
  - DATABASE_URL=file:/app/data/digiurban.db
  - JWT_SECRET=${JWT_SECRET}
  - SESSION_SECRET=${SESSION_SECRET}
  - API_BASE_URL=${API_BASE_URL}
  - FRONTEND_URL=${FRONTEND_URL}
  - CORS_ORIGIN=${CORS_ORIGIN}
  - REDIS_ENABLED=false
```

### 🎯 **FASE 3: OTIMIZAÇÃO (MÉDIA PRIORIDADE)**

#### **3.1 Implementar Health Checks Robustos**
```bash
# Health check que verifica:
# 1. Container iniciado
# 2. Banco criado
# 3. Tabelas existem
# 4. Super admin existe
# 5. Login funciona
```

#### **3.2 Logging e Monitoramento**
```javascript
// Adicionar logs estruturados para debug
console.log('📊 Database Status:', {
  tablesCount: await prisma.$queryRaw`SELECT COUNT(*) FROM sqlite_master WHERE type='table'`,
  usersCount: await prisma.user.count(),
  adminExists: !!(await prisma.user.findFirst({ where: { role: 'super_admin' } }))
})
```

#### **3.3 Testes de Integração**
```javascript
// Criar testes que validem:
// 1. Criação do banco
// 2. Execução dos seeds
// 3. Login do super admin
// 4. API funcionando
```

---

## 🔧 IMPLEMENTAÇÃO IMEDIATA

### **Correções Urgentes a Aplicar:**

#### **1. start-services.sh**
```bash
# Linha 33: Trocar migrate:deploy por db:push
- cd /app/backend && npm run db:migrate:deploy
+ cd /app/backend && npm run db:push
```

#### **2. seed.ts**
```typescript
// Descomentar linhas 112-117 e implementar SystemConfig
async function seedSystemConfig() {
  console.log('🔧 Configurando sistema...')

  for (const config of SYSTEM_CONFIG) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: config
    })
  }

  console.log(`✅ ${SYSTEM_CONFIG.length} configurações criadas`)
}
```

#### **3. Verificação no GitHub Actions**
```yaml
# Adicionar step de validação após deploy:
- name: 🔍 Validar Deploy
  run: |
    # Verificar se banco foi criado
    docker exec ${{ env.CONTAINER_NAME }} sh -c 'ls -la /app/data/digiurban.db'

    # Verificar se tabelas existem
    docker exec ${{ env.CONTAINER_NAME }} sh -c 'cd /app/backend && node -e "
      const { PrismaClient } = require(\"@prisma/client\");
      (async () => {
        const prisma = new PrismaClient();
        const tables = await prisma.\$queryRaw\`SELECT name FROM sqlite_master WHERE type=\"table\"\`;
        console.log(\"📋 Tabelas:\", tables.length);
        await prisma.\$disconnect();
      })();"'

    # Verificar se super admin existe
    docker exec ${{ env.CONTAINER_NAME }} sh -c 'cd /app/backend && node -e "
      const { PrismaClient } = require(\"@prisma/client\");
      (async () => {
        const prisma = new PrismaClient();
        const admin = await prisma.user.findFirst({ where: { role: \"super_admin\" } });
        console.log(\"👤 Super admin:\", admin ? \"EXISTS\" : \"NOT_FOUND\");
        await prisma.\$disconnect();
      })();"'
```

---

## 🎯 CONCLUSÃO

### **Causa Raiz Identificada:**
O problema principal é a **inconsistência entre deploys**:
- Deploy local executa `npx prisma db push` diretamente
- GitHub Actions executa `npm run db:migrate:deploy` via start-services.sh
- `db:migrate:deploy` falha porque não há migrations, apenas schema push

### **Solução Imediata:**
1. ✅ Corrigir start-services.sh para usar `db:push`
2. ✅ Habilitar seeds do SystemConfig
3. ✅ Padronizar credenciais para `admin123`

### **Prioridade de Implementação:**
1. **URGENTE**: Aplicar correções da Fase 1
2. **ALTA**: Implementar Fase 2 (padronização)
3. **MÉDIA**: Implementar Fase 3 (otimização)

### **Tempo Estimado:**
- **Fase 1**: 30 minutos (correções críticas)
- **Fase 2**: 2 horas (padronização completa)
- **Fase 3**: 4 horas (otimização e testes)

---

**📝 Documento gerado em:** `2025-01-20`
**🔍 Próxima revisão:** Após implementação da Fase 1
**👨‍💻 Responsável:** Claude Code AI