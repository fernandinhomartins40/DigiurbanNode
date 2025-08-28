// ====================================================================
// 💾 BACKUP SERVICE - DIGIURBAN DATA PROTECTION
// ====================================================================
// Serviço automatizado de backup do banco SQLite
// Rotação de backups e compressão para otimização
// ====================================================================

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../config/logger.js';

const execAsync = promisify(exec);

interface BackupResult {
  success: boolean;
  filename?: string;
  size?: number;
  duration?: number;
  error?: string;
}

interface BackupConfig {
  maxBackups: number;
  compressionLevel: number;
  backupInterval: number; // em horas
  retentionDays: number;
}

export class BackupService {
  private static config: BackupConfig = {
    maxBackups: parseInt(process.env.MAX_BACKUPS || '10'),
    compressionLevel: parseInt(process.env.BACKUP_COMPRESSION || '6'),
    backupInterval: parseInt(process.env.BACKUP_INTERVAL_HOURS || '6'),
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30')
  };

  private static backupDir = path.resolve(process.env.BACKUP_DIR || './data/backups');
  private static dbPath = path.resolve(process.env.DATABASE_PATH || './data/database.sqlite');

  /**
   * Inicializar serviço de backup
   */
  static async initialize(): Promise<void> {
    try {
      // Criar diretório de backup se não existir
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
        logger.info(`📁 Diretório de backup criado: ${this.backupDir}`);
      }

      // Verificar se banco existe
      if (!fs.existsSync(this.dbPath)) {
        logger.warn(`⚠️ Banco de dados não encontrado: ${this.dbPath}`);
        return;
      }

      logger.info('💾 Serviço de backup inicializado');
      logger.info(`   • Diretório: ${this.backupDir}`);
      logger.info(`   • Máximo de backups: ${this.config.maxBackups}`);
      logger.info(`   • Retenção: ${this.config.retentionDays} dias`);
      logger.info(`   • Intervalo: ${this.config.backupInterval}h`);

    } catch (error) {
      logger.error('❌ Erro ao inicializar serviço de backup:', error);
      throw error;
    }
  }

  /**
   * Executar backup do banco de dados
   */
  static async createBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    
    try {
      logger.info('🔄 Iniciando backup do banco de dados...');

      // Verificar se banco existe
      if (!fs.existsSync(this.dbPath)) {
        throw new Error(`Banco de dados não encontrado: ${this.dbPath}`);
      }

      // Gerar nome do arquivo de backup
      const timestamp = new Date().toISOString()
        .replace(/[T:]/g, '-')
        .replace(/\..+/, '')
        .replace(/-/g, '')
        .substring(0, 14);
      
      const backupFilename = `digiurban-backup-${timestamp}.sqlite`;
      const backupPath = path.join(this.backupDir, backupFilename);
      const compressedPath = `${backupPath}.gz`;

      // Copiar banco de dados
      fs.copyFileSync(this.dbPath, backupPath);

      // Comprimir backup
      if (process.env.NODE_ENV === 'production') {
        await this.compressFile(backupPath, compressedPath);
        
        // Remover arquivo não comprimido
        fs.unlinkSync(backupPath);
        
        const finalPath = compressedPath;
        const stats = fs.statSync(finalPath);
        const duration = Date.now() - startTime;

        logger.info(`✅ Backup criado com sucesso: ${path.basename(finalPath)} (${this.formatSize(stats.size)}) em ${duration}ms`);

        return {
          success: true,
          filename: path.basename(finalPath),
          size: stats.size,
          duration
        };
      } else {
        // Em desenvolvimento, não comprimir
        const stats = fs.statSync(backupPath);
        const duration = Date.now() - startTime;

        logger.info(`✅ Backup criado: ${backupFilename} (${this.formatSize(stats.size)}) em ${duration}ms`);

        return {
          success: true,
          filename: backupFilename,
          size: stats.size,
          duration
        };
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      logger.error(`❌ Falha no backup após ${duration}ms:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        duration
      };
    }
  }

  /**
   * Comprimir arquivo usando gzip
   */
  private static async compressFile(inputPath: string, outputPath: string): Promise<void> {
    try {
      const command = `gzip -${this.config.compressionLevel} -c "${inputPath}" > "${outputPath}"`;
      await execAsync(command);
    } catch (error) {
      // Fallback para Node.js se gzip não estiver disponível
      const zlib = await import('zlib');
      const inputStream = fs.createReadStream(inputPath);
      const outputStream = fs.createWriteStream(outputPath);
      const gzip = zlib.createGzip({ level: this.config.compressionLevel });
      
      await new Promise<void>((resolve, reject) => {
        inputStream
          .pipe(gzip)
          .pipe(outputStream)
          .on('finish', () => resolve())
          .on('error', reject);
      });
    }
  }

  /**
   * Limpar backups antigos
   */
  static async cleanupOldBackups(): Promise<{ removed: number; freed: number }> {
    try {
      const backupFiles = await this.getBackupFiles();
      
      if (backupFiles.length <= this.config.maxBackups) {
        return { removed: 0, freed: 0 };
      }

      // Ordenar por data (mais antigos primeiro)
      const sortedFiles = backupFiles.sort((a, b) => a.created - b.created);
      
      // Calcular quantos remover
      const toRemove = sortedFiles.slice(0, sortedFiles.length - this.config.maxBackups);
      
      let freedSpace = 0;
      
      for (const file of toRemove) {
        freedSpace += file.size;
        fs.unlinkSync(file.path);
        logger.info(`🗑️ Backup removido: ${file.name}`);
      }

      logger.info(`🧹 Limpeza concluída: ${toRemove.length} backups removidos (${this.formatSize(freedSpace)} liberados)`);
      
      return {
        removed: toRemove.length,
        freed: freedSpace
      };

    } catch (error) {
      logger.error('❌ Erro na limpeza de backups:', error);
      return { removed: 0, freed: 0 };
    }
  }

  /**
   * Remover backups baseado na retenção por dias
   */
  static async cleanupByRetention(): Promise<{ removed: number; freed: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
      
      const backupFiles = await this.getBackupFiles();
      const expiredFiles = backupFiles.filter(file => file.created < cutoffDate.getTime());
      
      if (expiredFiles.length === 0) {
        return { removed: 0, freed: 0 };
      }

      let freedSpace = 0;
      
      for (const file of expiredFiles) {
        freedSpace += file.size;
        fs.unlinkSync(file.path);
        logger.info(`⏰ Backup expirado removido: ${file.name}`);
      }

      logger.info(`🧹 Limpeza por retenção: ${expiredFiles.length} backups removidos (${this.formatSize(freedSpace)} liberados)`);
      
      return {
        removed: expiredFiles.length,
        freed: freedSpace
      };

    } catch (error) {
      logger.error('❌ Erro na limpeza por retenção:', error);
      return { removed: 0, freed: 0 };
    }
  }

  /**
   * Obter lista de arquivos de backup
   */
  private static async getBackupFiles(): Promise<Array<{
    name: string;
    path: string;
    size: number;
    created: number;
  }>> {
    const files = fs.readdirSync(this.backupDir);
    const backupFiles = files.filter(file => 
      file.startsWith('digiurban-backup-') && 
      (file.endsWith('.sqlite') || file.endsWith('.sqlite.gz'))
    );

    return backupFiles.map(file => {
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);
      
      return {
        name: file,
        path: filePath,
        size: stats.size,
        created: stats.mtime.getTime()
      };
    });
  }

  /**
   * Obter estatísticas dos backups
   */
  static async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup?: string;
    newestBackup?: string;
    averageSize: number;
  }> {
    try {
      const backupFiles = await this.getBackupFiles();
      
      if (backupFiles.length === 0) {
        return {
          totalBackups: 0,
          totalSize: 0,
          averageSize: 0
        };
      }

      const totalSize = backupFiles.reduce((sum, file) => sum + file.size, 0);
      const sortedByDate = backupFiles.sort((a, b) => a.created - b.created);

      return {
        totalBackups: backupFiles.length,
        totalSize,
        averageSize: totalSize / backupFiles.length,
        oldestBackup: sortedByDate[0]?.name,
        newestBackup: sortedByDate[sortedByDate.length - 1]?.name
      };

    } catch (error) {
      logger.error('❌ Erro ao obter estatísticas de backup:', error);
      return {
        totalBackups: 0,
        totalSize: 0,
        averageSize: 0
      };
    }
  }

  /**
   * Restaurar backup
   */
  static async restoreBackup(backupFilename: string): Promise<BackupResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`🔄 Iniciando restauração do backup: ${backupFilename}`);

      const backupPath = path.join(this.backupDir, backupFilename);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Arquivo de backup não encontrado: ${backupFilename}`);
      }

      // Backup do banco atual antes de restaurar
      const currentBackupName = `current-backup-${Date.now()}.sqlite`;
      const currentBackupPath = path.join(this.backupDir, currentBackupName);
      
      if (fs.existsSync(this.dbPath)) {
        fs.copyFileSync(this.dbPath, currentBackupPath);
        logger.info(`💾 Backup do banco atual salvo: ${currentBackupName}`);
      }

      // Descomprimir se necessário
      let sourceFile = backupPath;
      if (backupFilename.endsWith('.gz')) {
        const decompressedPath = backupPath.replace('.gz', '');
        await this.decompressFile(backupPath, decompressedPath);
        sourceFile = decompressedPath;
      }

      // Restaurar banco
      fs.copyFileSync(sourceFile, this.dbPath);

      // Limpar arquivo temporário descomprimido
      if (sourceFile !== backupPath) {
        fs.unlinkSync(sourceFile);
      }

      const duration = Date.now() - startTime;
      logger.info(`✅ Backup restaurado com sucesso em ${duration}ms`);

      return {
        success: true,
        filename: backupFilename,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      logger.error(`❌ Falha na restauração após ${duration}ms:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        duration
      };
    }
  }

  /**
   * Descomprimir arquivo gzip
   */
  private static async decompressFile(inputPath: string, outputPath: string): Promise<void> {
    try {
      const command = `gunzip -c "${inputPath}" > "${outputPath}"`;
      await execAsync(command);
    } catch (error) {
      // Fallback para Node.js se gunzip não estiver disponível
      const zlib = await import('zlib');
      const inputStream = fs.createReadStream(inputPath);
      const outputStream = fs.createWriteStream(outputPath);
      const gunzip = zlib.createGunzip();
      
      await new Promise<void>((resolve, reject) => {
        inputStream
          .pipe(gunzip)
          .pipe(outputStream)
          .on('finish', () => resolve())
          .on('error', reject);
      });
    }
  }

  /**
   * Iniciar job de backup automático
   */
  static startAutomaticBackup(): NodeJS.Timeout {
    const intervalMs = this.config.backupInterval * 60 * 60 * 1000;
    
    logger.info(`🕒 Backup automático configurado para cada ${this.config.backupInterval}h`);
    
    const interval = setInterval(async () => {
      try {
        const result = await this.createBackup();
        
        if (result.success) {
          // Limpar backups antigos após criar novo
          await this.cleanupOldBackups();
          await this.cleanupByRetention();
        }
      } catch (error) {
        logger.error('❌ Erro no backup automático:', error);
      }
    }, intervalMs);

    // Executar backup inicial após 30 segundos
    setTimeout(async () => {
      logger.info('🚀 Executando backup inicial...');
      const result = await this.createBackup();
      
      if (result.success) {
        await this.cleanupOldBackups();
      }
    }, 30000);

    return interval;
  }

  /**
   * Formatear tamanho de arquivo
   */
  private static formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)}${units[unitIndex]}`;
  }
}

export default BackupService;