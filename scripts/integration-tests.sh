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