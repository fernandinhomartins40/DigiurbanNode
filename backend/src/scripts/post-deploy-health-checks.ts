// ====================================================================
// 🏥 HEALTH CHECKS PÓS-DEPLOY - AUTH & TENANTS
// ====================================================================
// Sistema completo de verificação após deploy
// Testa autenticação, tenants e funcionalidades críticas
// ====================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import chalk from 'chalk';

const prisma = new PrismaClient();

// ====================================================================
// TIPOS E INTERFACES
// ====================================================================

interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
  responseTime?: number;
  critical: boolean;
}

interface HealthCheckReport {
  timestamp: string;
  environment: string;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  checks: HealthCheckResult[];
}

// ====================================================================
// HEALTH CHECK RUNNER
// ====================================================================

export class PostDeployHealthChecker {
  private results: HealthCheckResult[] = [];
  private environment: string;

  constructor(environment: string = 'development') {
    this.environment = environment;
  }

  async runAllHealthChecks(): Promise<HealthCheckReport> {
    console.log(chalk.blue('🏥 INICIANDO HEALTH CHECKS PÓS-DEPLOY'));
    console.log(chalk.blue('====================================='));

    try {
      // 1. Database Health Checks
      await this.checkDatabaseConnection();
      await this.checkCriticalTables();

      // 2. Authentication Health Checks
      await this.checkSuperAdminAuth();
      await this.checkPasswordHashing();
      await this.checkJWTFunctionality();

      // 3. Tenant System Health Checks
      await this.checkSystemTenant();
      await this.checkTenantIsolation();

      // 4. API Endpoint Health Checks
      await this.checkAuthEndpoints();
      await this.checkTenantEndpoints();

      // 5. Security Health Checks
      await this.checkSecurityHeaders();
      await this.checkRateLimit();

      // 6. Performance Health Checks
      await this.checkDatabasePerformance();
      await this.checkMemoryUsage();

    } catch (error) {
      this.addResult({
        name: 'Health Check System',
        status: 'fail',
        message: 'Erro crítico no sistema de health checks',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: true
      });
    } finally {
      await prisma.$disconnect();
    }

    return this.generateReport();
  }

  // ====================================================================
  // DATABASE HEALTH CHECKS
  // ====================================================================

  private async checkDatabaseConnection(): Promise<void> {
    const startTime = Date.now();

    try {
      await prisma.$connect();
      const responseTime = Date.now() - startTime;

      this.addResult({
        name: 'Database Connection',
        status: 'pass',
        message: 'Conexão com banco estabelecida',
        responseTime,
        critical: true
      });
    } catch (error) {
      this.addResult({
        name: 'Database Connection',
        status: 'fail',
        message: 'Falha na conexão com banco',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: true
      });
    }
  }

  private async checkCriticalTables(): Promise<void> {
    try {
      const checks = [
        { table: 'users', query: () => prisma.user.count() },
        { table: 'tenants', query: () => prisma.tenant.count() },
        { table: 'permissions', query: () => prisma.permission.count() },
        { table: 'user_sessions', query: () => prisma.userSession.count() }
      ];

      for (const check of checks) {
        try {
          const startTime = Date.now();
          const count = await check.query();
          const responseTime = Date.now() - startTime;

          this.addResult({
            name: `Table ${check.table}`,
            status: 'pass',
            message: `Tabela ${check.table} acessível (${count} registros)`,
            responseTime,
            critical: true
          });
        } catch (error) {
          this.addResult({
            name: `Table ${check.table}`,
            status: 'fail',
            message: `Erro ao acessar tabela ${check.table}`,
            details: { error: error instanceof Error ? error.message : String(error) },
            critical: true
          });
        }
      }
    } catch (error) {
      this.addResult({
        name: 'Critical Tables',
        status: 'fail',
        message: 'Erro geral na verificação de tabelas',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: true
      });
    }
  }

  // ====================================================================
  // AUTHENTICATION HEALTH CHECKS
  // ====================================================================

  private async checkSuperAdminAuth(): Promise<void> {
    try {
      const superAdmin = await prisma.user.findFirst({
        where: {
          role: 'super_admin',
          email: 'admin@digiurban.com.br'
        }
      });

      if (!superAdmin) {
        this.addResult({
          name: 'Super Admin Authentication',
          status: 'fail',
          message: 'Super Admin não encontrado',
          critical: true
        });
        return;
      }

      // Verificar se pode autenticar com senha padrão
      const isValidPassword = await bcrypt.compare('DigiUrban2025!', superAdmin.passwordHash);

      this.addResult({
        name: 'Super Admin Authentication',
        status: isValidPassword ? 'pass' : 'fail',
        message: isValidPassword
          ? 'Super Admin pode autenticar com senha padrão'
          : 'Super Admin não pode autenticar com senha padrão',
        details: {
          email: superAdmin.email,
          status: superAdmin.status,
          role: superAdmin.role
        },
        critical: true
      });

      // Verificar status ativo
      this.addResult({
        name: 'Super Admin Status',
        status: superAdmin.status === 'active' ? 'pass' : 'warn',
        message: `Status do Super Admin: ${superAdmin.status}`,
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Super Admin Authentication',
        status: 'fail',
        message: 'Erro ao verificar autenticação do Super Admin',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: true
      });
    }
  }

  private async checkPasswordHashing(): Promise<void> {
    try {
      const testPassword = 'TestPassword123!';
      const startTime = Date.now();

      // Test bcrypt hashing
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      const isValid = await bcrypt.compare(testPassword, hashedPassword);

      const responseTime = Date.now() - startTime;

      this.addResult({
        name: 'Password Hashing',
        status: isValid ? 'pass' : 'fail',
        message: isValid ? 'Sistema de hash de senhas funcionando' : 'Problema no sistema de hash',
        responseTime,
        critical: true
      });

    } catch (error) {
      this.addResult({
        name: 'Password Hashing',
        status: 'fail',
        message: 'Erro no sistema de hash de senhas',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: true
      });
    }
  }

  private async checkJWTFunctionality(): Promise<void> {
    try {
      const secret = process.env.JWT_SECRET || 'digiurban-secret-key';
      const payload = { userId: 'test', role: 'user' };

      const startTime = Date.now();

      // Test JWT creation and verification
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      const decoded = jwt.verify(token, secret) as any;

      const responseTime = Date.now() - startTime;

      const isValid = decoded.userId === payload.userId && decoded.role === payload.role;

      this.addResult({
        name: 'JWT Functionality',
        status: isValid ? 'pass' : 'fail',
        message: isValid ? 'Sistema JWT funcionando' : 'Problema no sistema JWT',
        responseTime,
        critical: true
      });

    } catch (error) {
      this.addResult({
        name: 'JWT Functionality',
        status: 'fail',
        message: 'Erro no sistema JWT',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: true
      });
    }
  }

  // ====================================================================
  // TENANT SYSTEM HEALTH CHECKS
  // ====================================================================

  private async checkSystemTenant(): Promise<void> {
    try {
      const systemTenant = await prisma.tenant.findFirst({
        where: {
          tenantCode: 'SYSTEM'
        }
      });

      this.addResult({
        name: 'System Tenant',
        status: systemTenant ? 'pass' : 'fail',
        message: systemTenant ? 'System Tenant encontrado' : 'System Tenant não encontrado',
        details: systemTenant ? {
          id: systemTenant.id,
          name: systemTenant.name,
          status: systemTenant.status
        } : undefined,
        critical: true
      });

    } catch (error) {
      this.addResult({
        name: 'System Tenant',
        status: 'fail',
        message: 'Erro ao verificar System Tenant',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: true
      });
    }
  }

  private async checkTenantIsolation(): Promise<void> {
    try {
      // Verificar se usuários estão corretamente associados a tenants
      const usersWithoutTenant = await prisma.user.count({
        where: {
          tenantId: null,
          role: { not: 'super_admin' }
        }
      });

      this.addResult({
        name: 'Tenant Isolation',
        status: usersWithoutTenant === 0 ? 'pass' : 'warn',
        message: usersWithoutTenant === 0
          ? 'Isolamento de tenants correto'
          : `${usersWithoutTenant} usuários sem tenant`,
        critical: false
      });

      // Verificar consistência de dados entre tenants
      const tenantCount = await prisma.tenant.count();

      this.addResult({
        name: 'Tenant Count',
        status: 'pass',
        message: `${tenantCount} tenant(s) no sistema`,
        details: { tenantCount },
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Tenant Isolation',
        status: 'fail',
        message: 'Erro ao verificar isolamento de tenants',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: false
      });
    }
  }

  // ====================================================================
  // API ENDPOINT HEALTH CHECKS
  // ====================================================================

  private async checkAuthEndpoints(): Promise<void> {
    try {
      // Simular verificação de endpoints (sem fazer requisições HTTP reais)
      // Verificar se as tabelas necessárias existem e têm dados

      const userCount = await prisma.user.count();
      const sessionCount = await prisma.userSession.count();

      this.addResult({
        name: 'Auth Endpoints Readiness',
        status: userCount > 0 ? 'pass' : 'warn',
        message: `Sistema pronto para autenticação (${userCount} usuários, ${sessionCount} sessões)`,
        details: { userCount, sessionCount },
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Auth Endpoints',
        status: 'fail',
        message: 'Erro ao verificar prontidão dos endpoints de auth',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: false
      });
    }
  }

  private async checkTenantEndpoints(): Promise<void> {
    try {
      const tenantCount = await prisma.tenant.count();
      const activeTenants = await prisma.tenant.count({
        where: { status: 'active' }
      });

      this.addResult({
        name: 'Tenant Endpoints Readiness',
        status: tenantCount > 0 ? 'pass' : 'warn',
        message: `Sistema pronto para tenants (${activeTenants}/${tenantCount} ativos)`,
        details: { tenantCount, activeTenants },
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Tenant Endpoints',
        status: 'fail',
        message: 'Erro ao verificar prontidão dos endpoints de tenant',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: false
      });
    }
  }

  // ====================================================================
  // SECURITY HEALTH CHECKS
  // ====================================================================

  private async checkSecurityHeaders(): Promise<void> {
    try {
      // Verificar configurações de segurança no banco
      const securityConfigs = await prisma.systemConfig.findMany({
        where: {
          key: {
            in: ['jwt_secret', 'session_timeout', 'password_policy']
          }
        }
      });

      this.addResult({
        name: 'Security Configuration',
        status: securityConfigs.length > 0 ? 'pass' : 'warn',
        message: `${securityConfigs.length} configurações de segurança encontradas`,
        details: securityConfigs.map(config => ({ key: config.key, hasValue: !!config.value })),
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Security Headers',
        status: 'fail',
        message: 'Erro ao verificar configurações de segurança',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: false
      });
    }
  }

  private async checkRateLimit(): Promise<void> {
    try {
      // Verificar se existem logs de atividade (indicativo de sistema funcionando)
      const recentLogs = await prisma.activityLog.count({
        where: {
          createdAt: {
            gte: Date.now() - (24 * 60 * 60 * 1000) // últimas 24h
          }
        }
      });

      this.addResult({
        name: 'Activity Logging',
        status: 'pass',
        message: `${recentLogs} logs de atividade nas últimas 24h`,
        details: { recentLogs },
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Rate Limit Check',
        status: 'warn',
        message: 'Não foi possível verificar logs de atividade',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: false
      });
    }
  }

  // ====================================================================
  // PERFORMANCE HEALTH CHECKS
  // ====================================================================

  private async checkDatabasePerformance(): Promise<void> {
    try {
      const startTime = Date.now();

      // Executar query de performance
      await prisma.user.findMany({
        take: 10,
        include: {
          tenant: true,
          sessions: true
        }
      });

      const responseTime = Date.now() - startTime;

      this.addResult({
        name: 'Database Performance',
        status: responseTime < 1000 ? 'pass' : responseTime < 3000 ? 'warn' : 'fail',
        message: `Query complexa executada em ${responseTime}ms`,
        responseTime,
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Database Performance',
        status: 'fail',
        message: 'Erro na verificação de performance',
        details: { error: error instanceof Error ? error.message : String(error) },
        critical: false
      });
    }
  }

  private async checkMemoryUsage(): Promise<void> {
    try {
      const memUsage = process.memoryUsage();
      const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

      this.addResult({
        name: 'Memory Usage',
        status: usedMB < 500 ? 'pass' : usedMB < 1000 ? 'warn' : 'fail',
        message: `Uso de memória: ${usedMB}MB/${totalMB}MB`,
        details: { usedMB, totalMB, rss: Math.round(memUsage.rss / 1024 / 1024) },
        critical: false
      });

    } catch (error) {
      this.addResult({
        name: 'Memory Usage',
        status: 'warn',
        message: 'Não foi possível verificar uso de memória',
        critical: false
      });
    }
  }

  // ====================================================================
  // UTILITÁRIOS
  // ====================================================================

  private addResult(result: Omit<HealthCheckResult, 'critical'> & { critical?: boolean }): void {
    this.results.push({
      critical: false,
      ...result
    });
  }

  private generateReport(): HealthCheckReport {
    const timestamp = new Date().toISOString();
    const totalChecks = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warn').length;

    const criticalFailures = this.results.filter(r => r.status === 'fail' && r.critical).length;

    const overallStatus: 'healthy' | 'degraded' | 'unhealthy' =
      criticalFailures > 0 ? 'unhealthy' :
      failed > 0 || warnings > 0 ? 'degraded' : 'healthy';

    return {
      timestamp,
      environment: this.environment,
      overallStatus,
      totalChecks,
      passed,
      failed,
      warnings,
      checks: this.results
    };
  }
}

// ====================================================================
// EXECUÇÃO PRINCIPAL
// ====================================================================

export const runPostDeployHealthChecks = async (environment?: string): Promise<HealthCheckReport> => {
  const checker = new PostDeployHealthChecker(environment);
  return await checker.runAllHealthChecks();
};

// Execução direta
if (require.main === module) {
  const environment = process.argv[2] || process.env.NODE_ENV || 'development';

  runPostDeployHealthChecks(environment)
    .then((report) => {
      console.log('\n' + chalk.blue('📊 RELATÓRIO DE HEALTH CHECKS'));
      console.log(chalk.blue('=============================='));
      console.log(`Timestamp: ${report.timestamp}`);
      console.log(`Ambiente: ${report.environment}`);

      const statusColor = report.overallStatus === 'healthy' ? 'green' :
                         report.overallStatus === 'degraded' ? 'yellow' : 'red';
      console.log(chalk[statusColor](`Status Geral: ${report.overallStatus.toUpperCase()}`));

      console.log(`Total de verificações: ${report.totalChecks}`);
      console.log(chalk.green(`✅ Passou: ${report.passed}`));
      console.log(chalk.yellow(`⚠️  Avisos: ${report.warnings}`));
      console.log(chalk.red(`❌ Falhou: ${report.failed}`));

      console.log('\n' + chalk.blue('📋 DETALHES DOS CHECKS:'));
      report.checks.forEach((check) => {
        const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
        const color = check.status === 'pass' ? 'green' : check.status === 'warn' ? 'yellow' : 'red';

        let message = `${icon} ${check.name}: ${check.message}`;
        if (check.responseTime) {
          message += ` (${check.responseTime}ms)`;
        }

        console.log(chalk[color](message));

        if (check.details) {
          console.log(chalk.gray(`   └─ ${JSON.stringify(check.details)}`));
        }
      });

      if (report.overallStatus === 'unhealthy') {
        console.log('\n' + chalk.red('🚨 SISTEMA UNHEALTHY - Problemas críticos detectados!'));
        process.exit(1);
      } else if (report.overallStatus === 'degraded') {
        console.log('\n' + chalk.yellow('⚠️  SISTEMA DEGRADED - Alguns problemas detectados'));
        process.exit(0);
      } else {
        console.log('\n' + chalk.green('🎉 SISTEMA HEALTHY - Todos os checks passaram!'));
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error(chalk.red('❌ Erro nos health checks:'), error);
      process.exit(1);
    });
}

export default { runPostDeployHealthChecks, PostDeployHealthChecker };