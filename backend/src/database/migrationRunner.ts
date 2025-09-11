// ====================================================================
// 🔄 MIGRATION RUNNER - DIGIURBAN SYSTEM (ATUALIZADO)
// ====================================================================
// Sistema automatizado de migração para SQLite3 com Knex.js
// Controle de versão, rollback e validação de integridade
// Atualizado para nomenclatura A01, A02, A03... e pasta /migrations
// Migrado para Knex.js Query Builder
// ====================================================================

import { getDatabase } from './connection.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Knex } from 'knex';

// ====================================================================
// INTERFACES
// ====================================================================

interface Migration {
  id: string;
  filename: string;
  description: string;
  sql: string;
  checksum: string;
  sequence: number;
}

interface MigrationResult {
  id: string;
  filename: string;
  success: boolean;
  duration: number;
  error?: string;
}

interface MigrationStatus {
  currentVersion: string;
  targetVersion: string;
  pendingMigrations: Migration[];
  appliedMigrations: Migration[];
  canRollback: boolean;
}

// ====================================================================
// MIGRATION RUNNER
// ====================================================================

export class MigrationRunner {
  private migrationsPath: string;
  private db: Knex;

  constructor() {
    // Caminho para pasta de migrations - padronizado para produção e desenvolvimento
    const currentFile = fileURLToPath(import.meta.url);
    
    if (process.env.NODE_ENV === 'production' || process.env.DOCKER_ENV === 'true') {
      // Em produção (container Docker), usar caminho absoluto
      this.migrationsPath = '/app/migrations';
    } else {
      // Para desenvolvimento local, resolver a partir do arquivo atual
      const projectRoot = path.resolve(path.dirname(currentFile), '../../../'); // backend/dist/database -> backend -> root
      this.migrationsPath = path.join(projectRoot, 'migrations');
    }
    
    this.db = getDatabase();
    
    StructuredLogger.info('Migration Runner inicializado', {
      metadata: {
        migrationsPath: this.migrationsPath,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  }

  /**
   * Inicializar tabela de controle de migrações
   */
  private async initializeMigrationTable(): Promise<void> {
    try {
      // Verificar se tabela existe
      const tableExists = await this.db.raw(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='schema_migrations'
      `);
      
      const hasTable = tableExists && tableExists.length > 0 && tableExists[0].length > 0;

      if (!hasTable) {
        // Criar nova tabela com formato atualizado
        await this.db.raw(`
          CREATE TABLE schema_migrations (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL UNIQUE,
            description TEXT,
            checksum TEXT NOT NULL,
            applied_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
            execution_time INTEGER NOT NULL,
            sequence_number INTEGER NOT NULL
          )
        `);
        
        StructuredLogger.info('Nova tabela de migrações criada');
      } else {
        // Verificar se precisa migrar tabela existente
        const columnInfo = await this.db.raw('PRAGMA table_info(schema_migrations)');
        const hasSequenceColumn = columnInfo.some((col: any) => col.name === 'sequence_number');

        if (!hasSequenceColumn) {
          // Migrar tabela existente para novo formato
          StructuredLogger.info('Migrando tabela de migrações para novo formato');
          
          await this.db.raw(`
            -- Criar nova tabela
            CREATE TABLE schema_migrations_new (
              id TEXT PRIMARY KEY,
              filename TEXT NOT NULL UNIQUE,
              description TEXT,
              checksum TEXT NOT NULL,
              applied_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
              execution_time INTEGER NOT NULL,
              sequence_number INTEGER NOT NULL
            );
            
            -- Migrar dados existentes (convertendo id numérico para formato A0X)
            INSERT INTO schema_migrations_new (
              id, filename, description, checksum, applied_at, execution_time, sequence_number
            )
            SELECT 
              CASE 
                WHEN typeof(id) = 'integer' THEN 'A' || printf('%02d', id)
                ELSE id
              END as id,
              filename,
              description,
              checksum,
              applied_at,
              execution_time,
              CASE 
                WHEN typeof(id) = 'integer' THEN id
                ELSE CAST(substr(id, 2) AS INTEGER)
              END as sequence_number
            FROM schema_migrations;
            
            -- Substituir tabela antiga
            DROP TABLE schema_migrations;
            ALTER TABLE schema_migrations_new RENAME TO schema_migrations;
          `);
          
          StructuredLogger.info('Migração da tabela de migrações concluída');
        }
      }

      // Índice para performance
      await this.db.raw(`
        CREATE INDEX IF NOT EXISTS idx_schema_migrations_sequence 
        ON schema_migrations(sequence_number)
      `);

      StructuredLogger.info('Tabela de migrações inicializada');

    } catch (error) {
      StructuredLogger.error('Erro ao inicializar tabela de migrações', error);
      throw error;
    }
  }

  /**
   * Carregar migrações do diretório com nova nomenclatura A01, A02, etc.
   */
  private async loadMigrations(): Promise<Migration[]> {
    try {
      // Verificar se pasta de migrations existe
      try {
        await fs.access(this.migrationsPath);
      } catch {
        StructuredLogger.warn(`Pasta de migrations não encontrada: ${this.migrationsPath}`);
        return [];
      }

      const files = await fs.readdir(this.migrationsPath);
      const migrations: Migration[] = [];

      for (const filename of files) {
        if (!filename.endsWith('.sql')) {
          continue;
        }

        // Nova regex para A01, A02, A03, etc.
        const match = filename.match(/^A(\d{2})_(.+)\.sql$/);
        if (!match) {
          StructuredLogger.warn(`Arquivo de migração inválido ignorado: ${filename}`);
          continue;
        }

        const sequenceStr = match[1];
        const sequence = parseInt(sequenceStr);
        const id = `A${sequenceStr}`;
        const description = match[2].replace(/_/g, ' ');
        const filePath = path.join(this.migrationsPath, filename);
        
        try {
          const sql = await fs.readFile(filePath, 'utf-8');
          const checksum = await this.generateChecksum(sql);

          migrations.push({
            id,
            filename,
            description,
            sql,
            checksum,
            sequence
          });
        } catch (fileError) {
          StructuredLogger.error(`Erro ao ler migração ${filename}`, fileError);
          continue;
        }
      }

      // Ordenar por sequence number
      migrations.sort((a, b) => a.sequence - b.sequence);

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
   * Obter versão atual do schema (formato A01, A02, etc.)
   */
  async getCurrentVersion(): Promise<string> {
    await this.initializeMigrationTable();

    try {
      const result = await this.db('schema_migrations')
        .select('id')
        .orderBy('sequence_number', 'desc')
        .limit(1)
        .first() as { id: string } | undefined;

      return result?.id || 'A00';
    } catch (error) {
      StructuredLogger.error('Erro ao obter versão atual', error);
      return 'A00';
    }
  }

  /**
   * Verificar se uma migração já foi aplicada
   */
  private async isMigrationApplied(migrationId: string): Promise<boolean> {
    try {
      const result = await this.db('schema_migrations')
        .select('id')
        .where('id', migrationId)
        .first();
      return !!result;
    } catch (error) {
      StructuredLogger.error(`Erro ao verificar migração ${migrationId}`, error);
      return false;
    }
  }

  /**
   * Executar uma migração específica
   */
  private async executeMigration(migration: Migration): Promise<MigrationResult> {
    const startTime = performance.now();

    try {
      StructuredLogger.info(`Executando migração ${migration.id}: ${migration.description}`);

      // Verificar se já foi aplicada
      if (await this.isMigrationApplied(migration.id)) {
        StructuredLogger.info(`Migração ${migration.id} já foi aplicada, pulando...`);
        return {
          id: migration.id,
          filename: migration.filename,
          success: true,
          duration: 0
        };
      }

      StructuredLogger.info(`Iniciando execução da migração ${migration.id}`, {
        metadata: {
          sql_length: migration.sql.length,
          checksum: migration.checksum,
          filename: migration.filename
        }
      });

      // Log do conteúdo SQL (apenas primeiras linhas para debug)
      const sqlPreview = migration.sql.split('\n').slice(0, 3).join('\n');
      StructuredLogger.debug(`SQL Preview para ${migration.id}`, {
        metadata: { sql_preview: sqlPreview }
      });

      // Executar em transação
      await this.db.transaction(async (trx) => {
        StructuredLogger.info(`Executando SQL da migração ${migration.id}...`);
        
        // Dividir SQL em comandos individuais PRESERVANDO ORDEM
        const sqlCommands = migration.sql
          .split(';')
          .map(cmd => cmd.trim())
          .filter(cmd => {
            // Filtrar comandos vazios, mas preservar ordem
            if (cmd.length === 0) return false;
            // Remover comandos que são apenas comentários
            if (cmd.startsWith('--')) return false;
            // Remover comandos que são apenas quebras de linha/espaços
            if (!cmd.replace(/\s/g, '')) return false;
            return true;
          });

        // Debug detalhado do parsing SQL
        console.log(`[DEBUG] Conteúdo SQL original (primeiros 500 chars): ${migration.sql.substring(0, 500)}`);
        console.log(`[DEBUG] Total de comandos após split: ${sqlCommands.length}`);
        
        // Debug: mostrar as primeiras linhas do arquivo como foram lidas
        const lines = migration.sql.split('\n').slice(0, 20);
        console.log(`[DEBUG] Primeiras 20 linhas do arquivo como lido:`);
        lines.forEach((line, i) => {
          console.log(`[DEBUG] Linha ${i + 1}: ${line}`);
        });
        
        console.log(`[DEBUG] Primeiros 5 comandos parseados:`);
        sqlCommands.slice(0, 5).forEach((cmd, i) => {
          console.log(`[DEBUG] Comando ${i + 1}: ${cmd.substring(0, 150)}${cmd.length > 150 ? '...' : ''}`);
        });

        StructuredLogger.info(`Executando ${sqlCommands.length} comandos SQL para ${migration.id}`);

        // Executar cada comando separadamente para melhor debug
        for (let i = 0; i < sqlCommands.length; i++) {
          const command = sqlCommands[i];
          if (command.trim()) {
            try {
              console.log(`[DEBUG] Executando comando ${i + 1}/${sqlCommands.length} da migração ${migration.id}:`);
              console.log(`[DEBUG] SQL: ${command.substring(0, 200)}${command.length > 200 ? '...' : ''}`);
              
              await trx.raw(command);
              
              console.log(`[DEBUG] ✅ Comando ${i + 1}/${sqlCommands.length} executado com sucesso`);
              StructuredLogger.debug(`Comando ${i + 1}/${sqlCommands.length} executado com sucesso`);
            } catch (cmdError: any) {
              console.error(`[ERROR] ❌ Falha no comando ${i + 1}/${sqlCommands.length} da migração ${migration.id}:`);
              console.error(`[ERROR] SQL que falhou: ${command}`);
              console.error(`[ERROR] Erro SQLite: ${cmdError.message}`);
              console.error(`[ERROR] Stack: ${cmdError.stack}`);
              
              StructuredLogger.error(`Erro no comando ${i + 1}: ${command.substring(0, 100)}...`, cmdError);
              throw cmdError;
            }
          }
        }

        StructuredLogger.info(`Todos os comandos SQL da migração ${migration.id} executados com sucesso`);

        // Registrar migração aplicada
        const duration = Math.round(performance.now() - startTime);
        
        await trx('schema_migrations').insert({
          id: migration.id,
          filename: migration.filename,
          description: migration.description,
          checksum: migration.checksum,
          applied_at: Date.now(),
          execution_time: duration,
          sequence_number: migration.sequence
        });

        StructuredLogger.info(`Migração ${migration.id} registrada na tabela schema_migrations`);
      });

      // Verificar se tabelas foram criadas (apenas para A01)
      if (migration.id === 'A01') {
        try {
          const tables = await this.db.raw('SELECT name FROM sqlite_master WHERE type="table"');
          const tableList = Array.isArray(tables) ? tables : [];
          StructuredLogger.info(`Verificação pós-migração A01: ${tableList.length} tabelas encontradas`, {
            metadata: { tables: tableList.map((t: any) => t.name) }
          });
        } catch (verifyError) {
          StructuredLogger.warn('Não foi possível verificar tabelas criadas', verifyError);
        }
      }

      const duration = Math.round(performance.now() - startTime);

      StructuredLogger.info(`Migração ${migration.id} executada com sucesso`, {
        metadata: {
          duration: `${duration}ms`,
          arquivo: migration.filename
        }
      });

      return {
        id: migration.id,
        filename: migration.filename,
        success: true,
        duration
      };

    } catch (error: any) {
      const duration = Math.round(performance.now() - startTime);
      
      StructuredLogger.error(`Erro ao executar migração ${migration.id}`, {
        error: error.message,
        metadata: {
          duration: `${duration}ms`,
          arquivo: migration.filename,
          stack: error.stack
        }
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
  async runMigrations(): Promise<MigrationResult[]> {
    try {
      await this.initializeMigrationTable();
      
      const migrations = await this.loadMigrations();
      if (migrations.length === 0) {
        StructuredLogger.info('Nenhuma migração encontrada');
        return [];
      }

      const currentVersion = await this.getCurrentVersion();
      const results: MigrationResult[] = [];

      StructuredLogger.info(`Versão atual: ${currentVersion}, ${migrations.length} migrações disponíveis`);

      for (const migration of migrations) {
        console.log(`[INFO] 🚀 Iniciando migração ${migration.id}: ${migration.description}`);
        
        const result = await this.executeMigration(migration);
        results.push(result);

        if (!result.success) {
          console.error(`[ERROR] ❌ Migração ${migration.id} falhou!`);
          console.error(`[ERROR] Erro: ${result.error}`);
          console.error(`[ERROR] Arquivo: ${migration.filename}`);
          
          StructuredLogger.error(`Migração ${migration.id} falhou, interrompendo execução`);
          break;
        } else {
          console.log(`[INFO] ✅ Migração ${migration.id} executada com sucesso em ${result.duration}ms`);
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

      StructuredLogger.info(`Migrações concluídas: ${successCount}/${results.length} em ${totalTime}ms`);

      // Atualizar versão do schema no system_config
      const finalVersion = await this.getCurrentVersion();
      if (finalVersion !== 'A00') {
        try {
          await this.db.raw(`
            INSERT OR REPLACE INTO system_config (key, value, description, updated_at) 
            VALUES (?, ?, 'Versão atual do schema após migrations', datetime('now'))
          `, ['schema_version', finalVersion]);
        } catch (configError) {
          StructuredLogger.warn('Erro ao atualizar schema_version em system_config', configError);
        }
      }

      return results;

    } catch (error) {
      StructuredLogger.error('Erro ao executar migrações', error);
      throw error;
    }
  }

  /**
   * Obter status detalhado das migrações
   */
  async getMigrationStatus(): Promise<MigrationStatus> {
    try {
      await this.initializeMigrationTable();
      
      const migrations = await this.loadMigrations();
      const currentVersion = await this.getCurrentVersion();
      
      const appliedMigrations: Migration[] = [];
      const pendingMigrations: Migration[] = [];

      for (const migration of migrations) {
        if (await this.isMigrationApplied(migration.id)) {
          appliedMigrations.push(migration);
        } else {
          pendingMigrations.push(migration);
        }
      }

      const targetVersion = migrations.length > 0 ? migrations[migrations.length - 1].id : currentVersion;

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
   * Validar integridade das migrações aplicadas
   */
  async validateMigrations(): Promise<boolean> {
    try {
      const migrations = await this.loadMigrations();
      let isValid = true;

      for (const migration of migrations) {
        if (await this.isMigrationApplied(migration.id)) {
          const applied = await this.db('schema_migrations')
            .select('checksum')
            .where('id', migration.id)
            .first() as { checksum: string } | undefined;

          if (applied && applied.checksum !== migration.checksum) {
            StructuredLogger.error(`Checksum inválido para migração ${migration.id}`);
            isValid = false;
          }
        }
      }

      return isValid;
    } catch (error) {
      StructuredLogger.error('Erro ao validar migrações', error);
      return false;
    }
  }
}

// ====================================================================
// FUNÇÕES EXPORTADAS PARA COMPATIBILIDADE
// ====================================================================

export async function runMigrations(): Promise<void> {
  const runner = new MigrationRunner();
  const results = await runner.runMigrations();
  
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    throw new Error(`${failed.length} migrações falharam`);
  }
}

export async function getMigrationStatus(): Promise<MigrationStatus> {
  const runner = new MigrationRunner();
  return await runner.getMigrationStatus();
}

export async function validateMigrations(): Promise<boolean> {
  const runner = new MigrationRunner();
  return await runner.validateMigrations();
}

export default MigrationRunner;