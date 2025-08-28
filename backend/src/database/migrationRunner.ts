// ====================================================================
// 🔄 MIGRATION RUNNER - DIGIURBAN SYSTEM
// ====================================================================
// Sistema automatizado de migração para SQLite3
// Controle de versão, rollback e validação de integridade
// ====================================================================

import { getDatabase } from './connection.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ====================================================================
// INTERFACES
// ====================================================================

interface Migration {
  id: number;
  filename: string;
  description: string;
  sql: string;
  checksum: string;
}

interface MigrationResult {
  id: number;
  filename: string;
  success: boolean;
  duration: number;
  error?: string;
}

interface MigrationStatus {
  currentVersion: number;
  targetVersion: number;
  pendingMigrations: Migration[];
  appliedMigrations: Migration[];
  canRollback: boolean;
}

// ====================================================================
// MIGRATION RUNNER
// ====================================================================

export class MigrationRunner {
  private migrationsPath: string;
  private db: any;

  constructor() {
    
    // Determinar caminho das migrações
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFile);
    this.migrationsPath = path.join(currentDir, 'migrations');
    this.db = getDatabase();
  }

  /**
   * Inicializar tabela de controle de migrações
   */
  private async initializeMigrationTable(): Promise<void> {
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id INTEGER PRIMARY KEY,
          filename TEXT NOT NULL UNIQUE,
          description TEXT,
          checksum TEXT NOT NULL,
          applied_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
          execution_time INTEGER NOT NULL,
          rollback_sql TEXT
        )
      `);

      // Índice para performance
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_schema_migrations_id 
        ON schema_migrations(id)
      `);

      StructuredLogger.info('Tabela de migrações inicializada');

    } catch (error) {
      StructuredLogger.error('Erro ao inicializar tabela de migrações', error);
      throw error;
    }
  }

  /**
   * Carregar migrações do diretório
   */
  private async loadMigrations(): Promise<Migration[]> {
    try {
      const files = await fs.readdir(this.migrationsPath);
      const migrations: Migration[] = [];

      for (const filename of files) {
        if (!filename.endsWith('.sql')) {
          continue;
        }

        const match = filename.match(/^(\d{3})_(.+)\.sql$/);
        if (!match) {
          StructuredLogger.warn(`Arquivo de migração inválido ignorado: ${filename}`);
          continue;
        }

        const id = parseInt(match[1]);
        const description = match[2].replace(/_/g, ' ');
        const filePath = path.join(this.migrationsPath, filename);
        const sql = await fs.readFile(filePath, 'utf-8');
        const checksum = await this.generateChecksum(sql);

        migrations.push({
          id,
          filename,
          description,
          sql,
          checksum
        });
      }

      // Ordenar por ID
      migrations.sort((a, b) => a.id - b.id);

      StructuredLogger.debug(`${migrations.length} migrações carregadas`, {
        metadata: {
          migracoes: migrations.map(m => `${m.id}: ${m.description}`)
        }
      });

      return migrations;

    } catch (error) {
      StructuredLogger.error('Erro ao carregar migrações', error);
      throw error;
    }
  }

  /**
   * Gerar checksum MD5 para verificar integridade
   */
  private async generateChecksum(content: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Obter versão atual do schema
   */
  async getCurrentVersion(): Promise<number> {
    await this.initializeMigrationTable();

    try {
      const stmt = this.db.prepare('SELECT MAX(id) as id FROM schema_migrations');
      const result = stmt.get() as { id: number } | undefined;

      return result?.id || 0;
    } catch (error) {
      StructuredLogger.error('Erro ao obter versão atual', error);
      return 0;
    }
  }

  /**
   * Executar uma migração específica
   */
  private async executeMigration(migration: Migration): Promise<MigrationResult> {
    const startTime = performance.now();

    try {
      StructuredLogger.info(`Executando migração ${migration.id}: ${migration.description}`);

      // Executar em transação
      const transaction = this.db.transaction(() => {
        // Executar comandos SQL da migração
        this.db.exec(migration.sql);

        // Registrar migração aplicada
        const stmt = this.db.prepare(`
          INSERT INTO schema_migrations (
            id, filename, description, checksum, applied_at, execution_time
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          migration.id,
          migration.filename,
          migration.description,
          migration.checksum,
          Date.now(),
          Math.round(performance.now() - startTime)
        );
      });
      
      transaction();

      const duration = Math.round(performance.now() - startTime);

      StructuredLogger.info(`Migração ${migration.id} aplicada com sucesso`, {
        metadata: {
          duration: `${duration}ms`
        }
      });

      return {
        id: migration.id,
        filename: migration.filename,
        success: true,
        duration
      };

    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      
      StructuredLogger.error(`Falha na migração ${migration.id}`, error as Error, {
        metadata: {
          filename: migration.filename,
          duration: `${duration}ms`
        }
      });

      return {
        id: migration.id,
        filename: migration.filename,
        success: false,
        duration,
        error: (error as Error).message
      };
    }
  }

  /**
   * Executar todas as migrações pendentes
   */
  async migrate(): Promise<{
    success: boolean;
    results: MigrationResult[];
    newVersion: number;
  }> {
    StructuredLogger.info('Iniciando processo de migração');

    try {
      const status = await this.getStatus();
      
      if (status.pendingMigrations.length === 0) {
        StructuredLogger.info('Nenhuma migração pendente');
        return {
          success: true,
          results: [],
          newVersion: status.currentVersion
        };
      }

      StructuredLogger.info(`${status.pendingMigrations.length} migrações pendentes encontradas`);

      const results: MigrationResult[] = [];
      let allSuccessful = true;

      for (const migration of status.pendingMigrations) {
        const result = await this.executeMigration(migration);
        results.push(result);

        if (!result.success) {
          allSuccessful = false;
          StructuredLogger.error(`Migração falhou, interrompendo processo: ${migration.id}`);
          break;
        }
      }

      const newVersion = await this.getCurrentVersion();

      if (allSuccessful) {
        StructuredLogger.audit('Processo de migração concluído com sucesso', {
          success: true,
          metadata: {
            versaoAnterior: status.currentVersion,
            novaVersao: newVersion,
            migracoes: results.length
          }
        });
      } else {
        StructuredLogger.error('Processo de migração falhou', {
          versaoAnterior: status.currentVersion,
          versaoAtual: newVersion,
          resultados: results
        });
      }

      return {
        success: allSuccessful,
        results,
        newVersion
      };

    } catch (error) {
      StructuredLogger.error('Erro crítico durante migração', error);
      throw error;
    }
  }

  /**
   * Obter status das migrações
   */
  async getStatus(): Promise<MigrationStatus> {
    const currentVersion = await this.getCurrentVersion();
    const allMigrations = await this.loadMigrations();
    
    const appliedMigrations: Migration[] = [];
    const pendingMigrations: Migration[] = [];

    try {
      const stmt = this.db.prepare('SELECT id, filename, checksum FROM schema_migrations ORDER BY id');
      const appliedRecords = stmt.all() as {
        id: number;
        filename: string;
        checksum: string;
      }[];

      for (const migration of allMigrations) {
        const applied = appliedRecords.find((r: any) => r.id === migration.id);
        
        if (applied) {
          // Verificar integridade
          if (applied.checksum !== migration.checksum) {
            StructuredLogger.security('Checksum de migração não confere!', {
              severity: 'critical' as const,
              metadata: {
                migrationId: migration.id,
                filename: migration.filename,
                expected: migration.checksum,
                actual: applied.checksum
              }
            });
          }
          appliedMigrations.push(migration);
        } else {
          pendingMigrations.push(migration);
        }
      }

      const targetVersion = allMigrations.length > 0 ? 
        Math.max(...allMigrations.map(m => m.id)) : 0;

      return {
        currentVersion,
        targetVersion,
        pendingMigrations,
        appliedMigrations,
        canRollback: appliedMigrations.length > 0
      };

    } catch (error) {
      StructuredLogger.error('Erro ao obter status das migrações', error);
      throw error;
    }
  }

  /**
   * Gerar relatório de status das migrações
   */
  async generateReport(): Promise<{
    currentVersion: number;
    totalMigrations: number;
    appliedMigrations: number;
    pendingMigrations: number;
    lastMigration: string | null;
    databaseSize: number;
    details: any[];
  }> {
    try {
      const status = await this.getStatus();

      const stmt = this.db.prepare('SELECT filename, applied_at, execution_time FROM schema_migrations ORDER BY id DESC LIMIT 1');
      const lastMigration = stmt.get() as {
        filename: string;
        applied_at: number;
        execution_time: number;
      } | undefined;

      return {
        currentVersion: status.currentVersion,
        totalMigrations: status.appliedMigrations.length + status.pendingMigrations.length,
        appliedMigrations: status.appliedMigrations.length,
        pendingMigrations: status.pendingMigrations.length,
        lastMigration: lastMigration ? 
          `${lastMigration.filename} (${new Date(lastMigration.applied_at).toISOString()})` : null,
        databaseSize: null,
        details: [
          ...status.appliedMigrations.map(m => ({
            ...m,
            status: 'applied'
          })),
          ...status.pendingMigrations.map(m => ({
            ...m,
            status: 'pending'
          }))
        ]
      };

    } catch (error) {
      StructuredLogger.error('Erro ao gerar relatório de migrações', error);
      throw error;
    }
  }
}

// ====================================================================
// INSTÂNCIA SINGLETON
// ====================================================================

let migrationRunnerInstance: MigrationRunner | null = null;

export const getMigrationRunner = (): MigrationRunner => {
  if (!migrationRunnerInstance) {
    migrationRunnerInstance = new MigrationRunner();
  }
  return migrationRunnerInstance;
};

// ====================================================================
// FUNÇÕES DE COMPATIBILIDADE
// ====================================================================

export const runMigrations = async (): Promise<void> => {
  const runner = getMigrationRunner();
  const result = await runner.migrate();
  
  if (!result.success) {
    throw new Error('Falha na execução das migrações');
  }
};

export const getMigrationStatus = async (): Promise<void> => {
  const runner = getMigrationRunner();
  const status = await runner.getStatus();
  
  console.log('\n📊 STATUS DAS MIGRAÇÕES');
  console.log('========================');
  console.log(`Versão atual: ${status.currentVersion}`);
  console.log(`Versão alvo: ${status.targetVersion}`);
  console.log(`Migrações aplicadas: ${status.appliedMigrations.length}`);
  console.log(`Migrações pendentes: ${status.pendingMigrations.length}`);
  console.log('========================\n');
  
  if (status.pendingMigrations.length > 0) {
    console.log('⏳ Migrações pendentes:');
    status.pendingMigrations.forEach(m => {
      console.log(`  ${m.id.toString().padStart(3, '0')}: ${m.description}`);
    });
  }
  
  if (status.appliedMigrations.length > 0) {
    console.log('✅ Migrações aplicadas:');
    status.appliedMigrations.forEach(m => {
      console.log(`  ${m.id.toString().padStart(3, '0')}: ${m.description}`);
    });
  }
};

export default getMigrationRunner;