#!/usr/bin/env node

// ====================================================================
// 🌱 SCRIPT DE SEEDS - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Script para executar seeds de dados iniciais
// ====================================================================

import { runInitialSeed } from './seeds/001_initial_data.js';

async function main() {
  try {
    console.log('🌱 Executando seeds...');
    await runInitialSeed();
    console.log('🎉 Seeds executados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro nos seeds:', error);
    process.exit(1);
  }
}

main();