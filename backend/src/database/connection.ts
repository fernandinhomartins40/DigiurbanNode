// ====================================================================
// 📦 CONEXÃO KNEX.JS OTIMIZADA - DIGIURBAN SYSTEM
// ====================================================================
// Configuração otimizada do banco SQLite3 com Knex.js Query Builder
// Performance, segurança e confiabilidade garantidas
// ====================================================================

import knex, { Knex } from 'knex';
import path from 'path';
import fs from 'fs';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

// Importar configuração do Knex
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const knexConfig = require('../../knexfile.cjs');

// ====================================================================
// CONFIGURAÇÕES DO BANCO OTIMIZADAS
// ====================================================================

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Garantir que o diretório do banco existe
const dbPath = typeof config.connection === 'string' 
  ? config.connection 
  : config.connection.filename;

if (dbPath && dbPath !== ':memory:') {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// ====================================================================
// INSTÂNCIA DO BANCO
// ====================================================================

let db: Knex;

export const initializeDatabase = (): Knex => {
  if (db) {
    return db;
  }

  try {
    console.log('🔄 Inicializando banco SQLite3 com Knex.js...');
    console.log('📍 Ambiente:', environment);
    console.log('📍 Caminho do banco:', dbPath);

    db = knex(config);

    // Log de inicialização estruturado
    StructuredLogger.info('Knex.js database initialized', {
      action: 'database_init',
      resource: 'database',
      metadata: {
        environment,
        path: dbPath,
        client: config.client,
        poolMin: config.pool?.min,
        poolMax: config.pool?.max
      }
    });

    console.log('✅ Banco SQLite3 com Knex.js inicializado com sucesso');
    return db;

  } catch (error) {
    StructuredLogger.error('Knex.js database initialization failed', error, {
      action: 'database_init',
      resource: 'database',
      errorType: 'connection_error',
      metadata: { path: dbPath, environment }
    });
    throw new Error(`Falha na inicialização do banco: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// ====================================================================
// FUNÇÕES DE CONEXÃO
// ====================================================================

export const getDatabase = (): Knex => {
  if (!db) {
    return initializeDatabase();
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    try {
      await db.destroy();
      console.log('✅ Conexão com banco fechada');
    } catch (error) {
      console.error('❌ Erro ao fechar banco:', error);
    }
  }
};

// ====================================================================
// FUNÇÕES DE QUERY COMPATÍVEIS (Para backwards compatibility)
// ====================================================================

export const query = async (sql: string, params: any[] = []): Promise<any[]> => {
  try {
    const database = getDatabase();
    return await database.raw(sql, params);
  } catch (error) {
    console.error('❌ Erro na query:', sql, params, error);
    throw error;
  }
};

export const queryOne = async (sql: string, params: any[] = []): Promise<any> => {
  try {
    const database = getDatabase();
    const result = await database.raw(sql, params);
    return result[0] || null;
  } catch (error) {
    console.error('❌ Erro na query (single):', sql, params, error);
    throw error;
  }
};

export const execute = async (sql: string, params: any[] = []): Promise<any> => {
  try {
    const database = getDatabase();
    return await database.raw(sql, params);
  } catch (error) {
    console.error('❌ Erro na execução:', sql, params, error);
    throw error;
  }
};

// ====================================================================
// UTILITÁRIOS DE TRANSAÇÃO
// ====================================================================

export const transaction = async <T>(fn: (trx: Knex.Transaction) => Promise<T>): Promise<T> => {
  const database = getDatabase();
  return await database.transaction(fn);
};

// ====================================================================
// HEALTH CHECK
// ====================================================================

export const healthCheck = async (): Promise<boolean> => {
  try {
    const result = await queryOne('SELECT 1 as health');
    return result && result.health === 1;
  } catch (error) {
    console.error('❌ Health check falhou:', error);
    return false;
  }
};

// ====================================================================
// BACKUP UTILITIES (Adaptado para Knex.js)
// ====================================================================

export const createBackup = async (backupPath: string): Promise<void> => {
  try {
    const database = getDatabase();
    
    // Criar diretório se não existir
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Para SQLite, podemos fazer um backup copiando o arquivo
    // Em produção, isso seria mais sofisticado
    if (dbPath && dbPath !== ':memory:') {
      fs.copyFileSync(dbPath, backupPath);
      console.log('✅ Backup criado:', backupPath);
    } else {
      console.warn('⚠️ Backup não suportado para banco em memória');
    }

  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    throw error;
  }
};

// ====================================================================
// MIGRATION HELPERS
// ====================================================================

export const runKnexMigrations = async (): Promise<void> => {
  try {
    const database = getDatabase();
    const [batchNo, log] = await database.migrate.latest();
    
    if (log.length === 0) {
      console.log('✅ Nenhuma migration pendente');
    } else {
      console.log(`✅ Executadas ${log.length} migrations no batch ${batchNo}`);
      log.forEach((migration) => {
        console.log(`  - ${migration}`);
      });
    }
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    throw error;
  }
};

export const rollbackKnexMigrations = async (): Promise<void> => {
  try {
    const database = getDatabase();
    const [batchNo, log] = await database.migrate.rollback();
    
    if (log.length === 0) {
      console.log('✅ Nenhuma migration para rollback');
    } else {
      console.log(`✅ Rollback de ${log.length} migrations do batch ${batchNo}`);
      log.forEach((migration) => {
        console.log(`  - ${migration}`);
      });
    }
  } catch (error) {
    console.error('❌ Erro ao fazer rollback:', error);
    throw error;
  }
};

// ====================================================================
// INICIALIZAÇÃO AUTOMÁTICA
// ====================================================================

// Processos de cleanup na finalização do processo
process.on('exit', () => {
  if (db) {
    // Knex.js cleanup is async, but exit event cannot wait
    console.log('🔄 Processo finalizando...');
  }
});

process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

// ====================================================================
// EXPORTS PRINCIPAIS
// ====================================================================

export default {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  transaction,
  query,
  queryOne,
  execute,
  healthCheck,
  createBackup,
  runKnexMigrations,
  rollbackKnexMigrations
};

// Export da instância Knex para uso direto
export { db as knex };