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

  constructor() {
    
    // Determinar caminho das migrações
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFile);
    this.migrationsPath = path.join(currentDir, 'migrations');
  }

  /**
   * Inicializar tabela de controle de migrações
   */
  private async initializeMigrationTable(): Promise<void> {
    try {
      await this.pool.executeStatement(`
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
      await this.pool.executeStatement(`
        CREATE INDEX IF NOT EXISTS idx_schema_migrations_id 
        ON schema_migrations(id)
      `);

      SafeLogger.info('Tabela de migrações inicializada');

    } catch (error) {
      SafeLogger.error('Erro ao inicializar tabela de migrações', error);
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
          SafeLogger.warn(`Arquivo de migração inválido ignorado: ${filename}`);
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

      SafeLogger.debug(`${migrations.length} migrações carregadas`, {
        migrações: migrations.map(m => `${m.id}: ${m.description}`)
      });

      return migrations;

    } catch (error) {
      SafeLogger.error('Erro ao carregar migrações', error);
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
      const result = await this.pool.executeQuery<{ id: number }>(
        'SELECT MAX(id) as id FROM schema_migrations'
      );

      return result[0]?.id || 0;
    } catch (error) {
      SafeLogger.error('Erro ao obter versão atual', error);
      return 0;
    }
  }

  /**
   * Executar uma migração específica
   */
  private async executeMigration(migration: Migration): Promise<MigrationResult> {
    const startTime = performance.now();

    try {
      SafeLogger.info(`Executando migração ${migration.id}: ${migration.description}`);

      // Executar em transação
      await this.pool.executeTransaction((db) => {
        // Executar comandos SQL da migração
        db.exec(migration.sql);

        // Registrar migração aplicada
        db.prepare(`
          INSERT INTO schema_migrations (
            id, filename, description, checksum, applied_at, execution_time
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          migration.id,
          migration.filename,
          migration.description,
          migration.checksum,
          Date.now(),
          Math.round(performance.now() - startTime)
        );
      });

      const duration = Math.round(performance.now() - startTime);

      SafeLogger.info(`Migração ${migration.id} aplicada com sucesso`, {
        duration: `${duration}ms`
      });

      return {
        id: migration.id,
        filename: migration.filename,
        success: true,
        duration
      };

    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      
      SafeLogger.error(`Falha na migração ${migration.id}`, error, {
        filename: migration.filename,
        duration: `${duration}ms`
      });

      return {
        id: migration.id,
        filename: migration.filename,
        success: false,
        duration,
        error: error.message
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
    SafeLogger.info('Iniciando processo de migração');

    try {
      const status = await this.getStatus();
      
      if (status.pendingMigrations.length === 0) {
        SafeLogger.info('Nenhuma migração pendente');
        return {
          success: true,
          results: [],
          newVersion: status.currentVersion
        };
      }

      SafeLogger.info(`${status.pendingMigrations.length} migrações pendentes encontradas`);

      const results: MigrationResult[] = [];
      let allSuccessful = true;

      for (const migration of status.pendingMigrations) {
        const result = await this.executeMigration(migration);
        results.push(result);

        if (!result.success) {
          allSuccessful = false;
          SafeLogger.error(`Migração falhou, interrompendo processo: ${migration.id}`);
          break;
        }
      }

      const newVersion = await this.getCurrentVersion();

      if (allSuccessful) {
        SafeLogger.audit('Processo de migração concluído com sucesso', {
          versaoAnterior: status.currentVersion,
          novaVersao: newVersion,
          migracoes: results.length
        });
      } else {
        SafeLogger.error('Processo de migração falhou', {
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
      SafeLogger.error('Erro crítico durante migração', error);
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
      const appliedRecords = await this.pool.executeQuery<{
        id: number;
        filename: string;
        checksum: string;
      }>('SELECT id, filename, checksum FROM schema_migrations ORDER BY id');

      for (const migration of allMigrations) {
        const applied = appliedRecords.find(r => r.id === migration.id);
        
        if (applied) {
          // Verificar integridade
          if (applied.checksum !== migration.checksum) {
            SafeLogger.security('Checksum de migração não confere!', {
              migrationId: migration.id,
              filename: migration.filename,
              expected: migration.checksum,
              actual: applied.checksum
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
      SafeLogger.error('Erro ao obter status das migrações', error);
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
      const healthStatus = await this.pool.getHealthStatus();

      const lastMigrationRecord = await this.pool.executeQuery<{
        filename: string;
        applied_at: number;
        execution_time: number;
      }>(
        'SELECT filename, applied_at, execution_time FROM schema_migrations ORDER BY id DESC LIMIT 1'
      );

      const lastMigration = lastMigrationRecord[0];

      return {
        currentVersion: status.currentVersion,
        totalMigrations: status.appliedMigrations.length + status.pendingMigrations.length,
        appliedMigrations: status.appliedMigrations.length,
        pendingMigrations: status.pendingMigrations.length,
        lastMigration: lastMigration ? 
          `${lastMigration.filename} (${new Date(lastMigration.applied_at).toISOString()})` : null,
        databaseSize: healthStatus.details.stats.databaseSize,
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
      SafeLogger.error('Erro ao gerar relatório de migrações', error);
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