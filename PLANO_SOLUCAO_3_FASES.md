# 🎯 PLANO DE SOLUÇÃO EM 3 FASES - SISTEMA DE BANCO DE DADOS

**Baseado na Auditoria Completa de 2025-01-20**

---

## 🚨 FASE 1: CORREÇÃO IMEDIATA (CRÍTICA)
**⏱️ Tempo Estimado:** 30 minutos
**🎯 Objetivo:** Resolver problemas que impedem funcionamento do GitHub Actions

### 1.1 🔧 Corrigir start-services.sh

**Problema:** GitHub Actions executa comando diferente do deploy local

**Arquivo:** `start-services.sh`
**Linha:** 33

```bash
# ❌ ANTES:
cd /app/backend && npm run db:migrate:deploy

# ✅ DEPOIS:
cd /app/backend && npm run db:push
```

**Comando:**
```bash
sed -i 's/npm run db:migrate:deploy/npm run db:push/g' start-services.sh
```

### 1.2 🌱 Habilitar SystemConfig nos Seeds

**Problema:** Seeds comentados causando warnings

**Arquivo:** `backend/src/database/seed.ts`
**Linhas:** 106-119

```typescript
// ❌ ANTES:
async function seedSystemConfig() {
  console.log('🔧 Configurações do sistema - modelo não implementado no schema')
  console.log('ℹ️ Para implementar, adicione modelo SystemConfig no schema.prisma')
  // TODO: Implementar modelo SystemConfig no schema quando necessário
  // for (const config of SYSTEM_CONFIG) { ... }
  console.log('⚠️ SystemConfig seed pulado - modelo não existe')
}

// ✅ DEPOIS:
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

### 1.3 🔑 Padronizar Credenciais

**Problema:** Senhas diferentes entre scripts

**Arquivos afetados:**
- `backend/src/database/seed.ts:144`
- `backend/scripts/fix-migrations-production.cjs:232`

```typescript
// ✅ SEMPRE usar 'admin123' em todos os ambientes
const hashedPassword = await bcrypt.hash('admin123', 12)
```

### 1.4 ✅ Validação Fase 1

**Checklist:**
- [ ] start-services.sh usa `db:push`
- [ ] SystemConfig seeds habilitados
- [ ] Credenciais padronizadas para `admin123`
- [ ] Teste local funcionando
- [ ] Push para GitHub Actions

---

## 🔧 FASE 2: PADRONIZAÇÃO (ALTA PRIORIDADE)
**⏱️ Tempo Estimado:** 2 horas
**🎯 Objetivo:** Eliminar inconsistências e padronizar ambientes

### 2.1 🗑️ Eliminar Sistema Legacy

**Arquivos para remover:**
```bash
rm backend/src/database/migrationRunner.js
rm backend/dist/database/migrationRunner.js
rm backend/scripts/fix-migrations-production.cjs
```

**Motivo:** Sistema híbrido Knex/Prisma causando conflitos

### 2.2 📝 Criar Script Unificado de Database

**Arquivo:** `scripts/setup-database.sh`

```bash
#!/bin/bash
echo "🗃️ Configurando banco de dados..."

# Verificar se estamos no container
if [ ! -d "/app" ]; then
  echo "❌ Script deve ser executado no container"
  exit 1
fi

# Criar diretório de dados
mkdir -p /app/data

# Limpar banco anterior se existir
if [ -f "/app/data/digiurban.db" ]; then
  echo "🧹 Removendo banco anterior..."
  rm -f /app/data/digiurban.db*
fi

# Configurar DATABASE_URL
export DATABASE_URL="file:/app/data/digiurban.db"

# Verificar se schema existe
if [ ! -f "/app/schema.prisma" ]; then
  echo "❌ Schema Prisma não encontrado"
  exit 1
fi

echo "🚀 Criando schema do banco..."
cd /app/backend && npx prisma db push --schema=../schema.prisma

if [ $? -eq 0 ]; then
  echo "✅ Schema criado com sucesso"
else
  echo "❌ Falha ao criar schema"
  exit 1
fi

echo "🌱 Executando seeds..."
cd /app/backend && node dist/database/seed.js

if [ $? -eq 0 ]; then
  echo "✅ Seeds executados com sucesso"
else
  echo "⚠️ Erro nos seeds, mas continuando..."
fi

echo "🔓 Ativando usuários..."
cd /app/backend && node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  const result = await prisma.user.updateMany({
    data: { status: 'ativo' }
  });
  console.log('✅ ' + result.count + ' usuários ativados');
  await prisma.\$disconnect();
})();"

echo "🔍 Verificando integridade..."
cd /app/backend && node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const tables = await prisma.\$queryRaw\`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name\`;
    console.log('📋 Tabelas criadas:', tables.length);

    const admin = await prisma.user.findFirst({
      where: { role: 'super_admin' },
      select: { email: true, status: true }
    });
    console.log('👤 Super admin:', admin ? admin.email + ' (' + admin.status + ')' : 'NÃO ENCONTRADO');

    await prisma.\$disconnect();
    console.log('✅ Banco configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    await prisma.\$disconnect();
    process.exit(1);
  }
})();"

echo "🎉 Database setup concluído!"
```

### 2.3 🔄 Atualizar start-services.sh

```bash
# Substituir seção de database (linhas 21-38) por:
echo "🗃️ Executando setup do banco..."
chmod +x /app/scripts/setup-database.sh
/app/scripts/setup-database.sh

if [ $? -eq 0 ]; then
  echo "✅ Database configurado com sucesso"
else
  echo "❌ Erro na configuração do database"
  exit 1
fi
```

### 2.4 📦 Atualizar Dockerfile

```dockerfile
# Adicionar após linha 82:
COPY --chown=digiurban:digiurban scripts/ ./scripts/
RUN chmod +x ./scripts/*.sh
```

### 2.5 🌐 Padronizar Environment Variables

**Template unificado para docker-compose.yml e deploy local:**

```yaml
environment:
  # Core
  - NODE_ENV=production
  - PORT=3021

  # Database
  - DATABASE_PATH=/app/data/digiurban.db
  - DATABASE_URL=file:/app/data/digiurban.db

  # Security
  - JWT_SECRET=${JWT_SECRET:-jMFw2+lTay2CtFAlBy1//ieCMk6sUT2ws0jYWMOe72XcHGr0v/DqJTRU8+gSRxgYxzwPTV6uTJEG0D5Omqq/YA==}
  - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-xqitCihoXFOcQg1M5ZDREqC66sBVIHbapxFCG7zS8U8nnsc1NuyX0BpPkMDz6o2pK+vE7TbEdiCH4TKr4lBnlw==}
  - SESSION_SECRET=${SESSION_SECRET:-xqitCihoXFOcQg1M5ZDREqC66sBVIHbapxFCG7zS8U8nnsc1NuyX0BpPkMDz6o2pK+vE7TbEdiCH4TKr4lBnlw==}
  - COOKIE_SECRET=${COOKIE_SECRET:-+4nAMw2izSgWUJf+H0VXDccqbPAdZXfkW+2CgBdX3Io=}

  # URLs
  - API_BASE_URL=${API_BASE_URL:-http://72.60.10.108:3020/api}
  - FRONTEND_URL=${FRONTEND_URL:-http://72.60.10.108:3020}
  - ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-http://72.60.10.108:3020}
  - CORS_ORIGIN=${CORS_ORIGIN:-http://72.60.10.108:3020}

  # Rate Limiting
  - RATE_LIMIT_WINDOW=${RATE_LIMIT_WINDOW:-900000}
  - RATE_LIMIT_MAX=${RATE_LIMIT_MAX:-1000}

  # Security Settings
  - BCRYPT_ROUNDS=${BCRYPT_ROUNDS:-12}
  - SESSION_TIMEOUT=${SESSION_TIMEOUT:-86400}

  # Redis (disabled)
  - REDIS_ENABLED=false
  - ENABLE_REDIS=false
```

### 2.6 ✅ Validação Fase 2

**Checklist:**
- [ ] Arquivos legacy removidos
- [ ] Script setup-database.sh criado e testado
- [ ] start-services.sh atualizado
- [ ] Dockerfile atualizado
- [ ] Environment variables padronizadas
- [ ] Deploy local e GitHub Actions idênticos

---

## 🚀 FASE 3: OTIMIZAÇÃO (MÉDIA PRIORIDADE)
**⏱️ Tempo Estimado:** 4 horas
**🎯 Objetivo:** Melhorar robustez, monitoramento e manutenibilidade

### 3.1 🏥 Health Checks Robustos

**Arquivo:** `scripts/health-check.sh`

```bash
#!/bin/bash
echo "🏥 Executando health check completo..."

ERRORS=0

# 1. Verificar se container está rodando
if ! pgrep -f "node.*app.js" > /dev/null; then
  echo "❌ Backend não está rodando"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Backend está rodando"
fi

# 2. Verificar se banco existe
if [ ! -f "/app/data/digiurban.db" ]; then
  echo "❌ Banco de dados não encontrado"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Banco de dados existe"
fi

# 3. Verificar se tabelas existem
TABLES=$(cd /app/backend && node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  try {
    const prisma = new PrismaClient();
    const result = await prisma.\$queryRaw\`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'\`;
    console.log(result[0].count);
    await prisma.\$disconnect();
  } catch (error) {
    console.log(0);
  }
})();" 2>/dev/null)

if [ "$TABLES" -lt "10" ]; then
  echo "❌ Tabelas insuficientes ($TABLES encontradas)"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Tabelas criadas ($TABLES encontradas)"
fi

# 4. Verificar se super admin existe
ADMIN_EXISTS=$(cd /app/backend && node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  try {
    const prisma = new PrismaClient();
    const admin = await prisma.user.findFirst({ where: { role: 'super_admin' } });
    console.log(admin ? 'true' : 'false');
    await prisma.\$disconnect();
  } catch (error) {
    console.log('false');
  }
})();" 2>/dev/null)

if [ "$ADMIN_EXISTS" != "true" ]; then
  echo "❌ Super admin não encontrado"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Super admin existe"
fi

# 5. Verificar se API responde
if curl -f http://localhost:3021/api/health >/dev/null 2>&1; then
  echo "✅ API respondendo"
else
  echo "❌ API não responde"
  ERRORS=$((ERRORS + 1))
fi

# 6. Testar login do super admin
LOGIN_TEST=$(curl -s -X POST http://localhost:3021/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digiurban.com.br","password":"admin123"}' | grep -c '"success":true')

if [ "$LOGIN_TEST" -eq "1" ]; then
  echo "✅ Login do super admin funcionando"
else
  echo "❌ Login do super admin falhando"
  ERRORS=$((ERRORS + 1))
fi

echo "📊 Health Check Result: $ERRORS erros encontrados"

if [ $ERRORS -eq 0 ]; then
  echo "🎉 Sistema 100% funcional!"
  exit 0
else
  echo "💥 Sistema com problemas!"
  exit 1
fi
```

### 3.2 📊 Logging Estruturado

**Arquivo:** `scripts/database-status.sh`

```bash
#!/bin/bash
echo "📊 Status detalhado do banco de dados..."

cd /app/backend && node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('🔍 Analisando banco de dados...');

    // Contadores básicos
    const tables = await prisma.\$queryRaw\`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name\`;
    const users = await prisma.user.count();
    const tenants = await prisma.tenant.count();
    const permissions = await prisma.permission.count();

    console.log('📋 Tabelas criadas:', tables.length);
    console.log('👥 Usuários:', users);
    console.log('🏢 Tenants:', tenants);
    console.log('🛡️ Permissões:', permissions);

    // Status do super admin
    const admin = await prisma.user.findFirst({
      where: { role: 'super_admin' },
      select: { email: true, status: true, createdAt: true }
    });

    if (admin) {
      console.log('👤 Super Admin:', admin.email);
      console.log('📊 Status:', admin.status);
      console.log('📅 Criado em:', admin.createdAt);
    } else {
      console.log('❌ Super admin não encontrado!');
    }

    // Configurações do sistema
    try {
      const configs = await prisma.systemConfig.count();
      console.log('⚙️ Configurações:', configs);
    } catch (e) {
      console.log('⚙️ Configurações: Modelo não implementado');
    }

    // Tamanho do banco
    const fs = require('fs');
    const stats = fs.statSync('/app/data/digiurban.db');
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log('💾 Tamanho do banco:', fileSizeInMB + ' MB');

    await prisma.\$disconnect();
    console.log('✅ Análise concluída');

  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    await prisma.\$disconnect();
    process.exit(1);
  }
})();"
```

### 3.3 🧪 Testes de Integração

**Arquivo:** `scripts/integration-tests.sh`

```bash
#!/bin/bash
echo "🧪 Executando testes de integração..."

TESTS_PASSED=0
TESTS_FAILED=0

# Função para executar teste
run_test() {
  local test_name="$1"
  local test_command="$2"

  echo "🔍 Testando: $test_name"

  if eval "$test_command"; then
    echo "✅ PASS: $test_name"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo "❌ FAIL: $test_name"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  echo ""
}

# Teste 1: Database Connection
run_test "Database Connection" "
cd /app/backend && node -e \"
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  await prisma.\\\$connect();
  await prisma.\\\$disconnect();
})();\" 2>/dev/null"

# Teste 2: Tables Exist
run_test "Tables Exist" "
cd /app/backend && node -e \"
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  const tables = await prisma.\\\$queryRaw\\\`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'\\\`;
  if (tables[0].count < 10) throw new Error('Insufficient tables');
  await prisma.\\\$disconnect();
})();\" 2>/dev/null"

# Teste 3: Super Admin Exists
run_test "Super Admin Exists" "
cd /app/backend && node -e \"
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  const admin = await prisma.user.findFirst({ where: { role: 'super_admin' } });
  if (!admin) throw new Error('Super admin not found');
  await prisma.\\\$disconnect();
})();\" 2>/dev/null"

# Teste 4: API Health
run_test "API Health Endpoint" "curl -f http://localhost:3021/api/health >/dev/null 2>&1"

# Teste 5: Login Authentication
run_test "Super Admin Login" "
curl -s -X POST http://localhost:3021/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{\"email\":\"admin@digiurban.com.br\",\"password\":\"admin123\"}' | \
  grep -q '\"success\":true'"

# Teste 6: Frontend Static Files
run_test "Frontend Static Files" "curl -f http://localhost:3020/ >/dev/null 2>&1"

# Resultados
echo "📊 RESULTADOS DOS TESTES:"
echo "✅ Testes aprovados: $TESTS_PASSED"
echo "❌ Testes falharam: $TESTS_FAILED"
echo "📈 Taxa de sucesso: $(( TESTS_PASSED * 100 / (TESTS_PASSED + TESTS_FAILED) ))%"

if [ $TESTS_FAILED -eq 0 ]; then
  echo "🎉 TODOS OS TESTES PASSARAM!"
  exit 0
else
  echo "💥 ALGUNS TESTES FALHARAM!"
  exit 1
fi
```

### 3.4 🔄 Automação no GitHub Actions

**Adicionar ao workflow:**

```yaml
- name: 🧪 Testes de Integração
  run: |
    echo "🧪 Executando testes de integração..."

    # Aguardar sistema estabilizar
    sleep 30

    # Executar health check
    sshpass -p "${{ secrets.VPS_PASSWORD }}" ssh -o StrictHostKeyChecking=no ${{ env.VPS_USER }}@${{ env.VPS_HOST }} "
    cd ${{ env.APP_DIR }}
    docker exec ${{ env.CONTAINER_NAME }} /app/scripts/health-check.sh
    "

    # Executar testes de integração
    sshpass -p "${{ secrets.VPS_PASSWORD }}" ssh -o StrictHostKeyChecking=no ${{ env.VPS_USER }}@${{ env.VPS_HOST }} "
    cd ${{ env.APP_DIR }}
    docker exec ${{ env.CONTAINER_NAME }} /app/scripts/integration-tests.sh
    "

    # Status do banco
    sshpass -p "${{ secrets.VPS_PASSWORD }}" ssh -o StrictHostKeyChecking=no ${{ env.VPS_USER }}@${{ env.VPS_HOST }} "
    cd ${{ env.APP_DIR }}
    docker exec ${{ env.CONTAINER_NAME }} /app/scripts/database-status.sh
    "

- name: 📊 Relatório Final
  if: always()
  run: |
    echo "📊 RELATÓRIO FINAL DO DEPLOY"
    echo "=========================="
    echo "🎯 Ambiente: Produção"
    echo "🌐 URL: http://${{ env.VPS_HOST }}:${{ env.APP_PORT }}"
    echo "📅 Deploy: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    echo "📦 Commit: ${{ github.sha }}"
    echo "✅ Status: DEPLOY CONCLUÍDO"
```

### 3.5 ✅ Validação Fase 3

**Checklist:**
- [ ] Health checks implementados
- [ ] Logging estruturado
- [ ] Testes de integração
- [ ] Automação no CI/CD
- [ ] Documentação atualizada
- [ ] Monitoramento em produção

---

## 📋 CHECKLIST GERAL DE IMPLEMENTAÇÃO

### ✅ **Fase 1 - Crítico** (30 min)
- [ ] Corrigir start-services.sh (db:migrate:deploy → db:push)
- [ ] Habilitar SystemConfig seeds
- [ ] Padronizar credenciais para admin123
- [ ] Testar deploy local
- [ ] Testar GitHub Actions

### ✅ **Fase 2 - Padronização** (2h)
- [ ] Remover arquivos legacy (migrationRunner, fix-migrations)
- [ ] Criar setup-database.sh unificado
- [ ] Atualizar start-services.sh
- [ ] Atualizar Dockerfile
- [ ] Padronizar environment variables
- [ ] Validar ambos os deploys

### ✅ **Fase 3 - Otimização** (4h)
- [ ] Implementar health-check.sh
- [ ] Implementar database-status.sh
- [ ] Implementar integration-tests.sh
- [ ] Atualizar GitHub Actions workflow
- [ ] Documentar procedimentos
- [ ] Treinar equipe

---

## 🎯 RESULTADO ESPERADO

Após implementação completa das 3 fases:

1. ✅ **Deploy Local e GitHub Actions 100% idênticos**
2. ✅ **Database criado consistentemente em ambos ambientes**
3. ✅ **Seeds executados sem warnings**
4. ✅ **Login funcionando com admin@digiurban.com.br / admin123**
5. ✅ **Health checks robustos**
6. ✅ **Monitoramento e logging estruturado**
7. ✅ **Testes automatizados**
8. ✅ **Sistema 100% funcional e confiável**

---

**📝 Documento criado em:** 2025-01-20
**🔄 Última atualização:** 2025-01-20
**👨‍💻 Responsável:** Claude Code AI