#!/usr/bin/env node

// ====================================================================
// 🚀 SCRIPT DE MIGRAÇÃO - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Script para executar migrações do banco de dados
// ====================================================================

import { runMigrations, getMigrationStatus } from './migrationRunner.js';

const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case 'up':
      case undefined:
        console.log('🚀 Executando migrações...');
        await runMigrations();
        break;
        
      case 'status':
        console.log('📊 Status das migrações...');
        await getMigrationStatus();
        break;
        
      default:
        console.log('📚 Comandos disponíveis:');
        console.log('  npm run db:migrate        - Executar migrações pendentes');
        console.log('  npm run db:migrate status - Status das migrações');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

main();