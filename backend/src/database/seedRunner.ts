// ====================================================================
// 🌱 SEED RUNNER - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Sistema automatizado de execução de seeds
// Controle de versão dos dados iniciais
// ====================================================================

import { getDatabase, execute, queryOne } from './connection.js';
import fs from 'fs';
import path from 'path';

// ====================================================================
// CONFIGURAÇÕES
// ====================================================================

const SEEDS_DIR = path.join(__dirname, 'seeds');

interface Seed {
  id: number;
  filename: string;
  name: string;
  seedFunction: () => Promise<void>;
}

interface SeedRecord {
  id: number;
  filename: string;
  executed_at: string;
}

// ====================================================================
// SETUP DA TABELA DE SEEDS
// ====================================================================

const createSeedsTable = (): void => {
  const sql = `
    CREATE TABLE IF NOT EXISTS seeds (
      id INTEGER PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  execute(sql);
  console.log('✅ Tabela de seeds criada/verificada');
};

// ====================================================================
// CARREGAMENTO DINÂMICO DE SEEDS
// ====================================================================

const loadSeeds = async (): Promise<Seed[]> => {
  if (!fs.existsSync(SEEDS_DIR)) {
    console.warn('⚠️ Diretório de seeds não encontrado:', SEEDS_DIR);
    return [];
  }

  const files = fs.readdirSync(SEEDS_DIR)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .sort();

  const seeds: Seed[] = [];

  for (const filename of files) {
    const match = filename.match(/^(\d{3})/);
    if (!match) {
      console.warn(`⚠️ Arquivo ignorado (formato inválido): ${filename}`);
      continue;
    }

    const id = parseInt(match[1]);
    const filepath = path.join(SEEDS_DIR, filename);
    const name = filename.replace(/\.(ts|js)$/, '');

    try {
      // Importar dinamicamente o módulo
      const seedModule = await import(filepath);
      
      // Procurar função de seed (convenções: seed{Name}, run{Name}, default)
      let seedFunction: () => Promise<void> | undefined;
      
      const seedFunctionName = `seed${id.toString().padStart(3, '0')}`;
      if (seedModule[seedFunctionName]) {
        seedFunction = seedModule[seedFunctionName];
      } else if (seedModule.default) {
        seedFunction = seedModule.default;
      } else if (seedModule.run) {
        seedFunction = seedModule.run;
      } else {
        console.warn(`⚠️ Função de seed não encontrada em ${filename}`);
        continue;
      }

      seeds.push({ id, filename, name, seedFunction });

    } catch (error) {
      console.error(`❌ Erro ao carregar seed ${filename}:`, error);
    }
  }

  console.log(`📂 ${seeds.length} seeds carregados`);
  return seeds;
};

// ====================================================================
// VERIFICAÇÃO DE SEEDS EXECUTADOS
// ====================================================================

const getExecutedSeeds = (): SeedRecord[] => {
  try {
    const sql = 'SELECT * FROM seeds ORDER BY id';
    return getDatabase().prepare(sql).all() as SeedRecord[];
  } catch (error) {
    // Se a tabela não existe ainda, retornar array vazio
    return [];
  }
};

// ====================================================================
// EXECUÇÃO DE SEED
// ====================================================================

const executeSeed = async (seed: Seed): Promise<void> => {
  const db = getDatabase();
  
  try {
    console.log(`🌱 Executando seed: ${seed.filename}`);
    const startTime = Date.now();
    
    // Executar seed em transação
    const transaction = db.transaction(async () => {
      await seed.seedFunction();
      
      // Registrar seed como executado
      db.prepare('INSERT OR REPLACE INTO seeds (id, filename) VALUES (?, ?)')
        .run(seed.id, seed.filename);
    });

    await transaction();
    
    const duration = Date.now() - startTime;
    console.log(`✅ Seed executado: ${seed.filename} (${duration}ms)`);

  } catch (error) {
    console.error(`❌ Erro no seed ${seed.filename}:`, error);
    throw error;
  }
};

// ====================================================================
// FUNÇÃO PRINCIPAL DE EXECUÇÃO
// ====================================================================

export const runSeeds = async (forceReseed: boolean = false): Promise<void> => {
  try {
    console.log('🌱 Iniciando processo de seeds...');
    
    // 1. Criar tabela de seeds se não existir
    createSeedsTable();
    
    // 2. Carregar seeds disponíveis
    const availableSeeds = await loadSeeds();
    
    if (availableSeeds.length === 0) {
      console.log('📝 Nenhum seed encontrado');
      return;
    }
    
    // 3. Verificar seeds já executados
    const executedSeeds = getExecutedSeeds();
    const executedIds = executedSeeds.map(s => s.id);
    
    console.log(`📊 Status: ${executedSeeds.length} executados, ${availableSeeds.length} disponíveis`);
    
    // 4. Determinar seeds a executar
    let seedsToRun: Seed[];
    
    if (forceReseed) {
      console.log('🔄 Forçando re-execução de todos os seeds');
      seedsToRun = availableSeeds;
    } else {
      // Apenas seeds pendentes
      seedsToRun = availableSeeds.filter(
        seed => !executedIds.includes(seed.id)
      );
    }
    
    if (seedsToRun.length === 0) {
      console.log('✅ Todos os seeds estão atualizados');
      return;
    }
    
    console.log(`🔄 ${seedsToRun.length} seeds para executar`);
    
    // 5. Executar seeds
    for (const seed of seedsToRun) {
      await executeSeed(seed);
    }
    
    console.log('🎉 Todos os seeds executados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no processo de seeds:', error);
    throw error;
  }
};

// ====================================================================
// SEEDS ESPECÍFICOS
// ====================================================================

export const runSingleSeed = async (seedId: number): Promise<void> => {
  const availableSeeds = await loadSeeds();
  const seed = availableSeeds.find(s => s.id === seedId);
  
  if (!seed) {
    throw new Error(`Seed com ID ${seedId} não encontrado`);
  }
  
  createSeedsTable();
  await executeSeed(seed);
};

// ====================================================================
// RESET DE SEEDS
// ====================================================================

export const resetSeeds = async (): Promise<void> => {
  console.log('🔄 Resetando seeds...');
  
  // Limpar tabela de seeds
  execute('DELETE FROM seeds');
  
  console.log('✅ Seeds resetados');
};

// ====================================================================
// STATUS DOS SEEDS
// ====================================================================

export const getSeedStatus = async (): Promise<void> => {
  try {
    createSeedsTable();
    const availableSeeds = await loadSeeds();
    const executedSeeds = getExecutedSeeds();
    
    console.log('\n🌱 STATUS DOS SEEDS');
    console.log('===================');
    
    for (const seed of availableSeeds) {
      const executed = executedSeeds.find(s => s.id === seed.id);
      const status = executed ? '✅ EXECUTADO' : '⏳ PENDENTE';
      const date = executed ? ` (${executed.executed_at})` : '';
      
      console.log(`${seed.id.toString().padStart(3, '0')}: ${status} - ${seed.filename}${date}`);
    }
    
    console.log('===================\n');
    
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
  }
};

// ====================================================================
// CLI COMMANDS
// ====================================================================

if (require.main === module) {
  const command = process.argv[2];
  const param = process.argv[3];
  
  switch (command) {
    case 'run':
      const forceReseed = param === '--force';
      runSeeds(forceReseed)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'status':
      getSeedStatus()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'reset':
      resetSeeds()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'single':
      const seedId = parseInt(param);
      if (isNaN(seedId)) {
        console.error('❌ ID do seed é obrigatório');
        process.exit(1);
      }
      runSingleSeed(seedId)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log('📚 Comandos disponíveis:');
      console.log('  npm run seed run         - Executar seeds pendentes');
      console.log('  npm run seed run --force - Reexecutar todos os seeds');
      console.log('  npm run seed status      - Status dos seeds');
      console.log('  npm run seed reset       - Resetar seeds');
      console.log('  npm run seed single <id> - Executar seed específico');
  }
}

export default {
  runSeeds,
  runSingleSeed,
  resetSeeds,
  getSeedStatus
};