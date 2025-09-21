#!/usr/bin/env node
// ====================================================================
// 🔓 SCRIPT DE ATIVAÇÃO DE USUÁRIOS - DEPLOY DIGIURBAN
// ====================================================================
// Script para ativar todos os usuários após o deploy
// Evita problemas de sintaxe com escape de caracteres em shell
// ====================================================================

const { PrismaClient } = require('@prisma/client');

async function activateUsers() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "file:/app/data/digiurban.db"
      }
    }
  });

  try {
    console.log('🔓 Iniciando ativação de usuários...');

    const result = await prisma.user.updateMany({
      data: { status: 'ativo' }
    });

    console.log(`✅ ${result.count} usuários ativados com sucesso`);

    // Verificar se há usuários ativos
    const activeCount = await prisma.user.count({
      where: { status: 'ativo' }
    });

    console.log(`📊 Total de usuários ativos: ${activeCount}`);

  } catch (error) {
    console.error('❌ Erro na ativação de usuários:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com banco encerrada');
  }
}

// Executar com tratamento de erro
activateUsers()
  .then(() => {
    console.log('✅ Processo de ativação concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha crítica:', error);
    process.exit(1);
  });