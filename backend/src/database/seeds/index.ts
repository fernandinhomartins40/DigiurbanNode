// ====================================================================
// 🌱 SEED RUNNER - EXECUÇÃO POR AMBIENTE
// ====================================================================
// Sistema inteligente de seeds baseado no ambiente
// Executa seeds apropriados para desenvolvimento ou produção
// ====================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ====================================================================
// CONFIGURAÇÃO DE AMBIENTES
// ====================================================================

const ENVIRONMENT = process.env.NODE_ENV || 'development';
const SEED_CONFIG = {
  base: [
    '001_initial_admin',
    '001_initial_data'
  ],
  development: [
    // Adicionar seeds de desenvolvimento futuramente se necessário
  ],
  production: [
    // Seeds apenas para produção (se necessário)
  ]
};

// ====================================================================
// RUNNER PRINCIPAL
// ====================================================================

export const runSeeds = async (environment?: string): Promise<void> => {
  const env = environment || ENVIRONMENT;

  console.log(`🚀 Iniciando seeds para ambiente: ${env}`);
  console.log('====================================');

  try {
    // 1. Executar seeds base (sempre)
    console.log('📋 Executando seeds base...');
    for (const seedName of SEED_CONFIG.base) {
      await executeSeed(seedName);
    }

    // 2. Executar seeds do ambiente específico
    const envSeeds = env === 'production'
      ? SEED_CONFIG.production
      : SEED_CONFIG.development;

    if (envSeeds.length > 0) {
      console.log(`🎯 Executando seeds de ${env}...`);
      for (const seedName of envSeeds) {
        await executeSeed(seedName);
      }
    }

    console.log('\n🎉 Todos os seeds executados com sucesso!');
    console.log(`✅ Ambiente: ${env}`);
    console.log(`✅ Seeds executados: ${SEED_CONFIG.base.length + envSeeds.length}`);

  } catch (error) {
    console.error('❌ Erro na execução dos seeds:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// ====================================================================
// EXECUTOR DE SEED INDIVIDUAL
// ====================================================================

const executeSeed = async (seedName: string): Promise<void> => {
  console.log(`  🔄 Executando: ${seedName}`);

  try {
    // Dinamicamente importar e executar o seed
    const seedModule = await import(`./${seedName}.js`);

    if (typeof seedModule.default === 'function') {
      await seedModule.default();
    } else if (typeof seedModule.run === 'function') {
      await seedModule.run();
    } else {
      console.warn(`  ⚠️  Seed ${seedName} não possui função executável`);
    }

    console.log(`  ✅ Concluído: ${seedName}`);

  } catch (error) {
    console.error(`  ❌ Erro no seed ${seedName}:`, error);
    throw error;
  }
};

// ====================================================================
// UTILITÁRIOS
// ====================================================================

export const listAvailableSeeds = (): void => {
  console.log('📋 Seeds disponíveis por ambiente:');
  console.log('================================');

  console.log('\n🔹 Base (sempre executados):');
  SEED_CONFIG.base.forEach(seed => console.log(`  - ${seed}`));

  console.log('\n🔹 Desenvolvimento:');
  SEED_CONFIG.development.forEach(seed => console.log(`  - ${seed}`));

  console.log('\n🔹 Produção:');
  SEED_CONFIG.production.forEach(seed => console.log(`  - ${seed}`));
};

export const runSpecificSeeds = async (seedNames: string[]): Promise<void> => {
  console.log(`🎯 Executando seeds específicos: ${seedNames.join(', ')}`);

  try {
    for (const seedName of seedNames) {
      await executeSeed(seedName);
    }
    console.log('✅ Seeds específicos executados com sucesso!');
  } catch (error) {
    console.error('❌ Erro na execução de seeds específicos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// ====================================================================
// EXECUÇÃO DIRETA
// ====================================================================

// Se executado diretamente, rodar seeds do ambiente atual
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    listAvailableSeeds();
    process.exit(0);
  }

  if (args.includes('--specific')) {
    const seedIndex = args.indexOf('--specific');
    const specificSeeds = args.slice(seedIndex + 1);

    if (specificSeeds.length === 0) {
      console.error('❌ Especifique os seeds a executar após --specific');
      process.exit(1);
    }

    runSpecificSeeds(specificSeeds)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('❌ Erro:', error);
        process.exit(1);
      });
  } else {
    runSeeds()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('❌ Erro:', error);
        process.exit(1);
      });
  }
}

export default { runSeeds, listAvailableSeeds, runSpecificSeeds };