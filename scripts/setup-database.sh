#!/bin/sh
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