// ====================================================================
// 🔍 SCRIPT DE VALIDAÇÃO AUTOMÁTICA - DATABASE INTEGRITY
// ====================================================================
// Sistema completo de validação para garantir integridade do banco
// Verifica schema, dados críticos, referências e consistência
// ====================================================================

import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';

const prisma = new PrismaClient();

// ====================================================================
// TIPOS E INTERFACES
// ====================================================================

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string[];
  critical: boolean;
}

interface ValidationReport {
  totalChecks: number;
  passed: number;
  failed: number;
  critical: number;
  results: ValidationResult[];
}

// ====================================================================
// VALIDADOR PRINCIPAL
// ====================================================================

export class DatabaseIntegrityValidator {
  private results: ValidationResult[] = [];

  async runAllValidations(): Promise<ValidationReport> {
    console.log(chalk.blue('🔍 INICIANDO VALIDAÇÃO DE INTEGRIDADE DO BANCO'));
    console.log(chalk.blue('============================================='));

    try {
      // 1. Validações de Schema
      await this.validateDatabaseConnection();
      await this.validateCoreTablesExist();
      await this.validateTableStructures();

      // 2. Validações de Dados Críticos
      await this.validateSuperAdminExists();
      await this.validateBasicPermissions();
      await this.validateSystemConfig();

      // 3. Validações de Integridade Referencial
      await this.validateForeignKeyIntegrity();
      await this.validateOrphanRecords();

      // 4. Validações de Consistência
      await this.validateUserTenantConsistency();
      await this.validateSessionIntegrity();
      await this.validateBillingConsistency();

      // 5. Validações de Performance
      await this.validateIndexes();
      await this.validateDatabaseSize();

    } catch (error) {
      this.addResult({
        name: 'Database Connection',
        passed: false,
        message: 'Erro crítico de conexão com banco',
        details: [error instanceof Error ? error.message : String(error)],
        critical: true
      });
    } finally {
      await prisma.$disconnect();
    }

    return this.generateReport();
  }

  // ====================================================================
  // VALIDAÇÕES DE SCHEMA
  // ====================================================================

  private async validateDatabaseConnection(): Promise<void> {
    try {
      await prisma.$connect();
      this.addResult({
        name: 'Database Connection',
        passed: true,
        message: 'Conexão com banco estabelecida com sucesso',
        critical: true
      });
    } catch (error) {
      this.addResult({
        name: 'Database Connection',
        passed: false,
        message: 'Falha na conexão com banco',
        details: [error instanceof Error ? error.message : String(error)],
        critical: true
      });
    }
  }

  private async validateCoreTablesExist(): Promise<void> {
    const coreTables = [
      'tenants', 'users', 'user_sessions', 'user_tokens',
      'permissions', 'user_permissions', 'activity_logs',
      'system_config', 'subscription_plans', 'tenant_subscriptions',
      'invoices', 'analytics_events'
    ];

    const existingTables: string[] = [];
    const missingTables: string[] = [];

    for (const table of coreTables) {
      try {
        const result = await prisma.$queryRaw`
          SELECT name FROM sqlite_master
          WHERE type='table' AND name=${table}
        ` as any[];

        if (result.length > 0) {
          existingTables.push(table);
        } else {
          missingTables.push(table);
        }
      } catch (error) {
        missingTables.push(table);
      }
    }

    this.addResult({
      name: 'Core Tables Existence',
      passed: missingTables.length === 0,
      message: `${existingTables.length}/${coreTables.length} tabelas principais encontradas`,
      details: missingTables.length > 0 ? [`Tabelas faltando: ${missingTables.join(', ')}`] : undefined,
      critical: true
    });
  }

  private async validateTableStructures(): Promise<void> {
    try {
      // Verificar estrutura da tabela users
      const userColumns = await prisma.$queryRaw`
        PRAGMA table_info(users)
      ` as any[];

      const requiredUserColumns = ['id', 'email', 'password_hash', 'tenant_id', 'role', 'status'];
      const existingUserColumns = userColumns.map((col: any) => col.name);
      const missingUserColumns = requiredUserColumns.filter(col => !existingUserColumns.includes(col));

      this.addResult({
        name: 'Users Table Structure',
        passed: missingUserColumns.length === 0,
        message: `Estrutura da tabela users ${missingUserColumns.length === 0 ? 'válida' : 'incompleta'}`,
        details: missingUserColumns.length > 0 ? [`Colunas faltando: ${missingUserColumns.join(', ')}`] : undefined,
        critical: true
      });

      // Verificar integridade do schema SQLite
      const integrityCheck = await prisma.$queryRaw`
        PRAGMA integrity_check
      ` as any[];

      const isIntegrityOk = integrityCheck.length === 1 && integrityCheck[0].integrity_check === 'ok';

      this.addResult({
        name: 'SQLite Integrity Check',
        passed: isIntegrityOk,
        message: isIntegrityOk ? 'Integridade do banco OK' : 'Problemas de integridade detectados',
        details: !isIntegrityOk ? integrityCheck.map((check: any) => check.integrity_check) : undefined,
        critical: true
      });

    } catch (error) {
      this.addResult({
        name: 'Table Structures',
        passed: false,
        message: 'Erro ao validar estruturas das tabelas',
        details: [error instanceof Error ? error.message : String(error)],
        critical: true
      });
    }
  }

  // ====================================================================
  // VALIDAÇÕES DE DADOS CRÍTICOS
  // ====================================================================

  private async validateSuperAdminExists(): Promise<void> {
    try {
      const superAdmin = await prisma.user.findFirst({
        where: {
          role: 'super_admin',
          email: 'admin@digiurban.com.br'
        }
      });

      this.addResult({
        name: 'Super Admin Existence',
        passed: !!superAdmin,
        message: superAdmin ? 'Super Admin encontrado' : 'Super Admin não encontrado',
        details: superAdmin ? [`ID: ${superAdmin.id}`, `Email: ${superAdmin.email}`] : ['Necessário executar seeds'],
        critical: true
      });

      if (superAdmin) {
        // Verificar se super admin está ativo
        this.addResult({
          name: 'Super Admin Status',
          passed: superAdmin.status === 'active',
          message: `Super Admin status: ${superAdmin.status}`,
          critical: true
        });
      }

    } catch (error) {
      this.addResult({
        name: 'Super Admin Validation',
        passed: false,
        message: 'Erro ao validar Super Admin',
        details: [error instanceof Error ? error.message : String(error)],
        critical: true
      });
    }
  }

  private async validateBasicPermissions(): Promise<void> {
    try {
      const basicPermissions = [
        'users.read', 'users.create', 'users.update', 'users.delete',
        'tenants.read', 'tenants.create', 'tenants.update',
        'system.config', 'system.admin'
      ];

      const existingPermissions = await prisma.permission.findMany({
        where: {
          code: { in: basicPermissions }
        }
      });

      const foundCodes = existingPermissions.map(p => p.code);
      const missingPermissions = basicPermissions.filter(code => !foundCodes.includes(code));

      this.addResult({
        name: 'Basic Permissions',
        passed: missingPermissions.length === 0,
        message: `${foundCodes.length}/${basicPermissions.length} permissões básicas encontradas`,
        details: missingPermissions.length > 0 ? [`Permissões faltando: ${missingPermissions.join(', ')}`] : undefined,
        critical: true
      });

    } catch (error) {
      this.addResult({
        name: 'Basic Permissions',
        passed: false,
        message: 'Erro ao validar permissões básicas',
        details: [error instanceof Error ? error.message : String(error)],
        critical: true
      });
    }
  }

  private async validateSystemConfig(): Promise<void> {
    try {
      const systemConfig = await prisma.systemConfig.findMany();

      this.addResult({
        name: 'System Configuration',
        passed: systemConfig.length > 0,
        message: `${systemConfig.length} configurações do sistema encontradas`,
        details: systemConfig.map(config => `${config.key}: ${config.value}`),
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'System Configuration',
        passed: false,
        message: 'Erro ao validar configurações do sistema',
        details: [error instanceof Error ? error.message : String(error)],
        critical: false
      });
    }
  }

  // ====================================================================
  // VALIDAÇÕES DE INTEGRIDADE REFERENCIAL
  // ====================================================================

  private async validateForeignKeyIntegrity(): Promise<void> {
    try {
      // Verificar foreign keys da tabela users
      const usersWithInvalidTenants = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM users
        WHERE tenant_id IS NOT NULL
        AND tenant_id NOT IN (SELECT id FROM tenants)
      ` as any[];

      this.addResult({
        name: 'Users-Tenants Foreign Keys',
        passed: usersWithInvalidTenants[0].count === 0,
        message: `${usersWithInvalidTenants[0].count} usuários com tenant_id inválido`,
        critical: true
      });

      // Verificar foreign keys da tabela user_sessions
      const sessionsWithInvalidUsers = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM user_sessions
        WHERE user_id NOT IN (SELECT id FROM users)
      ` as any[];

      this.addResult({
        name: 'Sessions-Users Foreign Keys',
        passed: sessionsWithInvalidUsers[0].count === 0,
        message: `${sessionsWithInvalidUsers[0].count} sessões com user_id inválido`,
        critical: true
      });

    } catch (error) {
      this.addResult({
        name: 'Foreign Key Integrity',
        passed: false,
        message: 'Erro ao validar integridade referencial',
        details: [error instanceof Error ? error.message : String(error)],
        critical: true
      });
    }
  }

  private async validateOrphanRecords(): Promise<void> {
    try {
      // Verificar sessões órfãs (usuários deletados)
      const orphanSessions = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM user_sessions
        WHERE user_id NOT IN (SELECT id FROM users)
      ` as any[];

      this.addResult({
        name: 'Orphan Sessions',
        passed: orphanSessions[0].count === 0,
        message: `${orphanSessions[0].count} sessões órfãs encontradas`,
        critical: false
      });

      // Verificar tokens órfãos
      const orphanTokens = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM user_tokens
        WHERE user_id NOT IN (SELECT id FROM users)
      ` as any[];

      this.addResult({
        name: 'Orphan Tokens',
        passed: orphanTokens[0].count === 0,
        message: `${orphanTokens[0].count} tokens órfãos encontrados`,
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Orphan Records',
        passed: false,
        message: 'Erro ao validar registros órfãos',
        details: [error instanceof Error ? error.message : String(error)],
        critical: false
      });
    }
  }

  // ====================================================================
  // VALIDAÇÕES DE CONSISTÊNCIA
  // ====================================================================

  private async validateUserTenantConsistency(): Promise<void> {
    try {
      const usersCount = await prisma.user.count();
      const activeUsersCount = await prisma.user.count({
        where: { status: 'active' }
      });

      this.addResult({
        name: 'User Count Consistency',
        passed: true,
        message: `${activeUsersCount}/${usersCount} usuários ativos`,
        critical: false
      });

      // Verificar consistência de roles
      const invalidRoles = await prisma.user.findMany({
        where: {
          role: {
            notIn: ['super_admin', 'admin', 'user', 'viewer']
          }
        }
      });

      this.addResult({
        name: 'User Roles Consistency',
        passed: invalidRoles.length === 0,
        message: `${invalidRoles.length} usuários com roles inválidas`,
        details: invalidRoles.map(user => `${user.email}: ${user.role}`),
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'User-Tenant Consistency',
        passed: false,
        message: 'Erro ao validar consistência usuário-tenant',
        details: [error instanceof Error ? error.message : String(error)],
        critical: false
      });
    }
  }

  private async validateSessionIntegrity(): Promise<void> {
    try {
      const expiredSessions = await prisma.userSession.count({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      const totalSessions = await prisma.userSession.count();

      this.addResult({
        name: 'Session Integrity',
        passed: true,
        message: `${totalSessions - expiredSessions}/${totalSessions} sessões válidas`,
        details: expiredSessions > 0 ? [`${expiredSessions} sessões expiradas para limpeza`] : undefined,
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Session Integrity',
        passed: false,
        message: 'Erro ao validar integridade das sessões',
        details: [error instanceof Error ? error.message : String(error)],
        critical: false
      });
    }
  }

  private async validateBillingConsistency(): Promise<void> {
    try {
      // Verificar se existem tabelas de billing
      const billingTables = await prisma.$queryRaw`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name IN ('subscription_plans', 'tenant_subscriptions', 'invoices')
      ` as any[];

      if (billingTables.length > 0) {
        const plansCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM subscription_plans` as any[];

        this.addResult({
          name: 'Billing System',
          passed: plansCount[0].count > 0,
          message: `${plansCount[0].count} planos de assinatura disponíveis`,
          critical: false
        });
      } else {
        this.addResult({
          name: 'Billing System',
          passed: true,
          message: 'Sistema de billing não instalado',
          critical: false
        });
      }

    } catch (error) {
      this.addResult({
        name: 'Billing Consistency',
        passed: false,
        message: 'Erro ao validar consistência do billing',
        details: [error instanceof Error ? error.message : String(error)],
        critical: false
      });
    }
  }

  // ====================================================================
  // VALIDAÇÕES DE PERFORMANCE
  // ====================================================================

  private async validateIndexes(): Promise<void> {
    try {
      const indexes = await prisma.$queryRaw`
        SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'
      ` as any[];

      const criticalIndexes = [
        'idx_users_email', 'idx_users_tenant_id', 'idx_user_sessions_token',
        'idx_activity_logs_created_at'
      ];

      const existingIndexNames = indexes.map((idx: any) => idx.name);
      const missingIndexes = criticalIndexes.filter(idx => !existingIndexNames.includes(idx));

      this.addResult({
        name: 'Database Indexes',
        passed: missingIndexes.length === 0,
        message: `${existingIndexNames.length} índices encontrados`,
        details: missingIndexes.length > 0 ? [`Índices críticos faltando: ${missingIndexes.join(', ')}`] : undefined,
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Database Indexes',
        passed: false,
        message: 'Erro ao validar índices',
        details: [error instanceof Error ? error.message : String(error)],
        critical: false
      });
    }
  }

  private async validateDatabaseSize(): Promise<void> {
    try {
      const dbStats = await prisma.$queryRaw`
        SELECT
          page_count * page_size as size_bytes,
          page_count,
          page_size
        FROM pragma_page_count(), pragma_page_size()
      ` as any[];

      const sizeInMB = dbStats[0].size_bytes / (1024 * 1024);

      this.addResult({
        name: 'Database Size',
        passed: sizeInMB < 100, // Alert if DB > 100MB
        message: `Tamanho do banco: ${sizeInMB.toFixed(2)} MB`,
        details: [`${dbStats[0].page_count} páginas de ${dbStats[0].page_size} bytes`],
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Database Size',
        passed: false,
        message: 'Erro ao validar tamanho do banco',
        details: [error instanceof Error ? error.message : String(error)],
        critical: false
      });
    }
  }

  // ====================================================================
  // UTILITÁRIOS
  // ====================================================================

  private addResult(result: ValidationResult): void {
    this.results.push(result);
  }

  private generateReport(): ValidationReport {
    const totalChecks = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const critical = this.results.filter(r => !r.passed && r.critical).length;

    return {
      totalChecks,
      passed,
      failed,
      critical,
      results: this.results
    };
  }
}

// ====================================================================
// EXECUÇÃO PRINCIPAL
// ====================================================================

export const validateDatabaseIntegrity = async (): Promise<ValidationReport> => {
  const validator = new DatabaseIntegrityValidator();
  return await validator.runAllValidations();
};

// Execução direta
if (require.main === module) {
  validateDatabaseIntegrity()
    .then((report) => {
      console.log('\n' + chalk.blue('📊 RELATÓRIO DE VALIDAÇÃO'));
      console.log(chalk.blue('=========================='));
      console.log(`Total de verificações: ${report.totalChecks}`);
      console.log(chalk.green(`✅ Passou: ${report.passed}`));
      console.log(chalk.red(`❌ Falhou: ${report.failed}`));
      console.log(chalk.yellow(`🚨 Críticas: ${report.critical}`));

      console.log('\n' + chalk.blue('📋 DETALHES:'));
      report.results.forEach((result) => {
        const icon = result.passed ? '✅' : '❌';
        const color = result.passed ? 'green' : (result.critical ? 'red' : 'yellow');

        console.log(chalk[color](`${icon} ${result.name}: ${result.message}`));

        if (result.details) {
          result.details.forEach(detail => {
            console.log(chalk.gray(`   └─ ${detail}`));
          });
        }
      });

      if (report.critical > 0) {
        console.log('\n' + chalk.red('🚨 ATENÇÃO: Problemas críticos encontrados!'));
        process.exit(1);
      } else {
        console.log('\n' + chalk.green('🎉 Validação concluída com sucesso!'));
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error(chalk.red('❌ Erro na validação:'), error);
      process.exit(1);
    });
}

export default { validateDatabaseIntegrity, DatabaseIntegrityValidator };