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