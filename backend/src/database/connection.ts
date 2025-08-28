// ====================================================================
// 📦 CONEXÃO BETTER-SQLITE3 OTIMIZADA - DIGIURBAN SYSTEM
// ====================================================================
// Configuração otimizada do banco SQLite3 com WAL mode, cache otimizado
// Performance, segurança e confiabilidade garantidas
// ====================================================================

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

// ====================================================================
// CONFIGURAÇÕES DO BANCO OTIMIZADAS
// ====================================================================

const DB_PATH = process.env.DATABASE_URL || process.env.DB_PATH || path.join(process.cwd(), 'data', 'digiurban.db');
const DB_DIR = path.dirname(DB_PATH);

// Garantir que o diretório existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// ====================================================================
// INSTÂNCIA DO BANCO
// ====================================================================

let db: Database.Database;

export const initializeDatabase = (): Database.Database => {
  if (db) {
    return db;
  }

  try {
    console.log('🔄 Inicializando banco SQLite3...');
    console.log('📍 Caminho do banco:', DB_PATH);

    db = new Database(DB_PATH);

    // Configurações de performance e segurança otimizadas
    db.exec('PRAGMA journal_mode = WAL'); // Write-Ahead Logging para melhor concorrência
    db.exec('PRAGMA synchronous = NORMAL'); // Balance entre performance e segurança
    db.exec('PRAGMA cache_size = 10000'); // Cache otimizado
    db.exec('PRAGMA temp_store = MEMORY'); // Tabelas temporárias em memória
    db.exec('PRAGMA foreign_keys = ON'); // Habilitar foreign keys
    db.exec('PRAGMA busy_timeout = 30000'); // Timeout para locks
    db.exec('PRAGMA mmap_size = 268435456'); // Memory-mapped I/O - 256MB
    db.exec('PRAGMA optimize'); // Otimizações automáticas

    // Log de inicialização estruturado
    StructuredLogger.info('SQLite database initialized', {
      action: 'database_init',
      resource: 'database',
      metadata: {
        path: DB_PATH,
        cache_size: 10000,
        mmap_size: 268435456,
        mode: 'WAL'
      }
    });

    console.log('✅ Banco SQLite3 inicializado com sucesso');
    return db;

  } catch (error) {
    StructuredLogger.error('Database initialization failed', error, {
      action: 'database_init',
      resource: 'database',
      errorType: 'connection_error',
      metadata: { path: DB_PATH }
    });
    throw new Error(`Falha na inicialização do banco: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// ====================================================================
// FUNÇÕES DE CONEXÃO
// ====================================================================

export const getDatabase = (): Database.Database => {
  if (!db) {
    return initializeDatabase();
  }
  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    try {
      db.close();
      console.log('✅ Conexão com banco fechada');
    } catch (error) {
      console.error('❌ Erro ao fechar banco:', error);
    }
  }
};

// ====================================================================
// FUNÇÕES DE QUERY SEGURAS
// ====================================================================

export const query = (sql: string, params: any[] = []): any[] => {
  try {
    const database = getDatabase();
    return database.prepare(sql).all(...params);
  } catch (error) {
    console.error('❌ Erro na query:', sql, params, error);
    throw error;
  }
};

export const queryOne = (sql: string, params: any[] = []): any => {
  try {
    const database = getDatabase();
    return database.prepare(sql).get(...params);
  } catch (error) {
    console.error('❌ Erro na query (single):', sql, params, error);
    throw error;
  }
};

export const execute = (sql: string, params: any[] = []): Database.RunResult => {
  try {
    const database = getDatabase();
    return database.prepare(sql).run(...params);
  } catch (error) {
    console.error('❌ Erro na execução:', sql, params, error);
    throw error;
  }
};

// ====================================================================
// UTILITÁRIOS DE TRANSAÇÃO
// ====================================================================

export const transaction = <T>(fn: (db: Database.Database) => T): T => {
  const database = getDatabase();
  const transactionFn = database.transaction(fn);
  return transactionFn(database);
};

// ====================================================================
// HEALTH CHECK
// ====================================================================

export const healthCheck = (): boolean => {
  try {
    const result = queryOne('SELECT 1 as health');
    return result && result.health === 1;
  } catch (error) {
    console.error('❌ Health check falhou:', error);
    return false;
  }
};

// ====================================================================
// BACKUP UTILITIES
// ====================================================================

export const createBackup = (backupPath: string): void => {
  try {
    const database = getDatabase();
    
    // Criar diretório se não existir
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Better-sqlite3 suporta backup nativo
    const backup = database.backup(backupPath);
    backup.then(() => {
      console.log('✅ Backup criado:', backupPath);
    }).catch((error) => {
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    });

  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    throw error;
  }
};

// ====================================================================
// INICIALIZAÇÃO AUTOMÁTICA
// ====================================================================

// Processos de cleanup na finalização do processo
process.on('exit', () => {
  closeDatabase();
});

process.on('SIGINT', async () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  closeDatabase();
  process.exit(0);
});

export default {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  transaction,
  query,
  queryOne,
  execute,
  healthCheck,
  createBackup
};