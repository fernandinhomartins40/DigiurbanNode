// ====================================================================
// 🚀 MIGRATION RUNNER - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Sistema automatizado de migrações para SQLite3
// Controle de versão do banco de dados
// ====================================================================

import { getDatabase, execute, query, transaction } from './connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ====================================================================
// CONFIGURAÇÕES
// ====================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

interface Migration {
  id: number;
  filename: string;
  sql: string;
}

interface MigrationRecord {
  id: number;
  filename: string;
  executed_at: string;
}

// ====================================================================
// SETUP DA TABELA DE MIGRAÇÕES
// ====================================================================

const createMigrationsTable = async (): Promise<void> => {
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await execute(sql);
  console.log('✅ Tabela de migrações criada/verificada');
};

// ====================================================================
// CARREGAMENTO DE MIGRAÇÕES
// ====================================================================

const loadMigrations = (): Migration[] => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.warn('⚠️ Diretório de migrações não encontrado:', MIGRATIONS_DIR);
    return [];
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

  const migrations: Migration[] = [];

  for (const filename of files) {
    const match = filename.match(/^(\d{3})/);
    if (!match) {
      console.warn(`⚠️ Arquivo ignorado (formato inválido): ${filename}`);
      continue;
    }

    const id = parseInt(match[1]);
    const filepath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filepath, 'utf8');

    migrations.push({ id, filename, sql });
  }

  console.log(`📂 ${migrations.length} migrações carregadas`);
  return migrations;
};

// ====================================================================
// VERIFICAÇÃO DE MIGRAÇÕES EXECUTADAS
// ====================================================================

const getExecutedMigrations = async (): Promise<MigrationRecord[]> => {
  try {
    const sql = 'SELECT * FROM migrations ORDER BY id';
    return await query(sql) as MigrationRecord[];
  } catch (error) {
    // Se a tabela não existe ainda, retornar array vazio
    return [];
  }
};

// ====================================================================
// EXECUÇÃO DE MIGRAÇÃO
// ====================================================================

const executeMigration = async (migration: Migration): Promise<void> => {
  try {
    console.log(`🔄 Executando migração: ${migration.filename}`);
    
    // Dividir SQL em statements individuais
    const statements = migration.sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Executar dentro de uma transação
    await transaction(async (db) => {
      // Executar o SQL completo de uma vez usando a instância do banco
      const database = await getDatabase();
      
      return new Promise<void>((resolve, reject) => {
        database.serialize(() => {
          database.exec(migration.sql, (err) => {
            if (err) {
              reject(err);
              return;
            }
            
            // Registrar migração como executada
            database.run('INSERT INTO migrations (id, filename) VALUES (?, ?)', 
              [migration.id, migration.filename], (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
          });
        });
      });
    });

    console.log(`✅ Migração executada: ${migration.filename}`);

  } catch (error) {
    console.error(`❌ Erro na migração ${migration.filename}:`, error);
    throw error;
  }
};

// ====================================================================
// FUNÇÃO PRINCIPAL DE MIGRAÇÃO
// ====================================================================

export const runMigrations = async (): Promise<void> => {
  try {
    console.log('🚀 Iniciando processo de migrações...');
    
    // 1. Criar tabela de migrações se não existir
    await createMigrationsTable();
    
    // 2. Carregar migrações disponíveis
    const availableMigrations = loadMigrations();
    
    if (availableMigrations.length === 0) {
      console.log('📝 Nenhuma migração encontrada');
      return;
    }
    
    // 3. Verificar migrações já executadas
    const executedMigrations = await getExecutedMigrations();
    const executedIds = executedMigrations.map(m => m.id);
    
    console.log(`📊 Status: ${executedMigrations.length} executadas, ${availableMigrations.length} disponíveis`);
    
    // 4. Encontrar migrações pendentes
    const pendingMigrations = availableMigrations.filter(
      migration => !executedIds.includes(migration.id)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✅ Todas as migrações estão atualizadas');
      return;
    }
    
    console.log(`🔄 ${pendingMigrations.length} migrações pendentes`);
    
    // 5. Executar migrações pendentes
    for (const migration of pendingMigrations) {
      await executeMigration(migration);
    }
    
    console.log('🎉 Todas as migrações executadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no processo de migrações:', error);
    throw error;
  }
};

// ====================================================================
// ROLLBACK (FUNCIONALIDADE FUTURA)
// ====================================================================

export const rollbackMigration = async (targetId: number): Promise<void> => {
  console.warn('⚠️ Rollback não implementado ainda');
  console.log(`Rollback solicitado para migração: ${targetId}`);
  
  // TODO: Implementar rollback
  // - Verificar se migração foi executada
  // - Executar script de rollback (se existir)
  // - Remover registro da tabela migrations
};

// ====================================================================
// STATUS DAS MIGRAÇÕES
// ====================================================================

export const getMigrationStatus = async (): Promise<void> => {
  try {
    const availableMigrations = loadMigrations();
    const executedMigrations = await getExecutedMigrations();
    
    console.log('\n📊 STATUS DAS MIGRAÇÕES');
    console.log('========================');
    
    for (const migration of availableMigrations) {
      const executed = executedMigrations.find(m => m.id === migration.id);
      const status = executed ? '✅ EXECUTADA' : '⏳ PENDENTE';
      const date = executed ? ` (${executed.executed_at})` : '';
      
      console.log(`${migration.id.toString().padStart(3, '0')}: ${status} - ${migration.filename}${date}`);
    }
    
    console.log('========================\n');
    
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
  }
};

// ====================================================================
// CLI COMMANDS
// ====================================================================

const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const command = process.argv[2];
  
  switch (command) {
    case 'up':
      runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'status':
      getMigrationStatus()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'rollback':
      const targetId = parseInt(process.argv[3]);
      if (isNaN(targetId)) {
        console.error('❌ ID da migração é obrigatório para rollback');
        process.exit(1);
      }
      rollbackMigration(targetId)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log('📚 Comandos disponíveis:');
      console.log('  npm run migrate up      - Executar migrações pendentes');
      console.log('  npm run migrate status   - Status das migrações');
      console.log('  npm run migrate rollback <id> - Rollback (futuro)');
  }
}

export default {
  runMigrations,
  rollbackMigration,
  getMigrationStatus
};