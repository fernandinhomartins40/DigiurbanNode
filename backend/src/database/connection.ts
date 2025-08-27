// ====================================================================
// 📦 CONEXÃO SQLite3 - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Configuração otimizada do banco SQLite3 padrão
// Performance, segurança e confiabilidade garantidas
// ====================================================================

import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// ====================================================================
// CONFIGURAÇÕES DO BANCO
// ====================================================================

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'digiurban.db');
const DB_DIR = path.dirname(DB_PATH);

// Garantir que o diretório existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// ====================================================================
// INSTÂNCIA DO BANCO
// ====================================================================

let db: sqlite3.Database;

export const initializeDatabase = (): Promise<sqlite3.Database> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    try {
      console.log('🔄 Inicializando banco SQLite3...');
      console.log('📍 Caminho do banco:', DB_PATH);

      db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ Erro ao conectar com banco:', err);
          reject(err);
          return;
        }

        // Configurações de performance e segurança
        db.serialize(() => {
          db.run('PRAGMA journal_mode = WAL'); // Write-Ahead Logging para melhor concorrência
          db.run('PRAGMA synchronous = NORMAL'); // Balance entre performance e segurança
          db.run('PRAGMA cache_size = 1000'); // Cache de 1MB
          db.run('PRAGMA temp_store = MEMORY'); // Tabelas temporárias em memória
          db.run('PRAGMA foreign_keys = ON'); // Habilitar foreign keys
        });

        console.log('✅ Banco SQLite3 inicializado com sucesso');
        resolve(db);
      });

    } catch (error) {
      console.error('❌ Erro ao inicializar banco:', error);
      reject(new Error(`Falha na inicialização do banco: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
};

// ====================================================================
// FUNÇÕES DE CONEXÃO
// ====================================================================

export const getDatabase = async (): Promise<sqlite3.Database> => {
  if (!db) {
    return await initializeDatabase();
  }
  return db;
};

export const closeDatabase = (): Promise<void> => {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('❌ Erro ao fechar banco:', err);
        } else {
          console.log('✅ Conexão com banco fechada');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
};

// ====================================================================
// FUNÇÕES DE QUERY SEGURAS
// ====================================================================

export const query = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await getDatabase();
      database.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ Erro na query:', sql, params, err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const queryOne = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await getDatabase();
      database.get(sql, params, (err, row) => {
        if (err) {
          console.error('❌ Erro na query (single):', sql, params, err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const execute = (sql: string, params: any[] = []): Promise<sqlite3.RunResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await getDatabase();
      database.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Erro na execução:', sql, params, err);
          reject(err);
        } else {
          resolve(this);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// ====================================================================
// UTILITÁRIOS DE TRANSAÇÃO
// ====================================================================

export const transaction = async <T>(fn: (db: sqlite3.Database) => Promise<T>): Promise<T> => {
  const database = await getDatabase();
  
  return new Promise((resolve, reject) => {
    database.serialize(async () => {
      database.run('BEGIN TRANSACTION');
      
      try {
        const result = await fn(database);
        database.run('COMMIT', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        database.run('ROLLBACK', (rollbackErr) => {
          if (rollbackErr) {
            console.error('❌ Erro no rollback:', rollbackErr);
          }
          reject(error);
        });
      }
    });
  });
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
// BACKUP UTILITIES
// ====================================================================

export const createBackup = async (backupPath: string): Promise<void> => {
  try {
    const database = await getDatabase();
    
    return new Promise((resolve, reject) => {
      const backup = new sqlite3.Database(backupPath);
      
      database.backup(backup, (err) => {
        backup.close();
        if (err) {
          console.error('❌ Erro ao criar backup:', err);
          reject(err);
        } else {
          console.log('✅ Backup criado:', backupPath);
          resolve();
        }
      });
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
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
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