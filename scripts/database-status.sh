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