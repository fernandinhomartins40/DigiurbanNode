import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
}

interface AuditResult {
  passed: boolean;
  issues: SecurityIssue[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  timestamp: string;
}

export class SecurityAuditor {
  private static issues: SecurityIssue[] = [];

  static async runFullAudit(): Promise<AuditResult> {
    this.issues = [];
    console.log('🔍 Iniciando auditoria de segurança completa...');

    await this.checkHardcodedCredentials();
    await this.checkEnvironmentVariables();
    await this.checkCORS();
    await this.checkRateLimiting();
    await this.checkLoggingSecurity();
    await this.checkFilePermissions();
    await this.checkDependencies();
    await this.checkAuthConfiguration();
    await this.checkDatabaseSecurity();
    await this.checkHeadersSecurity();

    const summary = {
      total: this.issues.length,
      critical: this.issues.filter(i => i.severity === 'critical').length,
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length
    };

    const passed = summary.critical === 0 && summary.high === 0;

    const result: AuditResult = {
      passed,
      issues: this.issues,
      summary,
      timestamp: new Date().toISOString()
    };

    // Log do resultado
    StructuredLogger.audit('Security audit completed', {
      action: 'security_audit',
      resource: 'system',
      success: passed,
      details: `Found ${summary.total} issues: ${summary.critical} critical, ${summary.high} high risk`
    });

    this.generateReport(result);
    return result;
  }

  private static async checkHardcodedCredentials() {
    console.log('📋 Verificando credenciais hardcoded...');
    
    const patterns = [
      /password\s*[:=]\s*['"][^'"]{3,}['"]/gi,
      /secret\s*[:=]\s*['"][^'"]{10,}['"]/gi,
      /api[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/gi,
      /(admin|root|test).*[:=].*['"][^'"]+['"]/gi,
      /jwt[_-]?secret\s*[:=]\s*['"][^'"]{10,}['"]/gi
    ];

    try {
      const files = await glob('**/*.{ts,js}', { 
        ignore: ['node_modules/**', 'dist/**', '**/*.test.*', '**/*.spec.*'] 
      });

      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          patterns.forEach(pattern => {
            if (pattern.test(line) && !line.includes('process.env') && !line.includes('[REDACTED]')) {
              this.addIssue({
                severity: 'critical',
                category: 'hardcoded_credentials',
                description: 'Possível credencial hardcoded encontrada',
                file,
                line: index + 1,
                recommendation: 'Mover credenciais para variáveis de ambiente'
              });
            }
          });
        });
      }
    } catch (error: any) {
      console.error('❌ Erro na verificação de credenciais:', error.message);
    }
  }

  private static async checkEnvironmentVariables() {
    console.log('📋 Verificando variáveis de ambiente...');
    
    const requiredVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET', 
      'COOKIE_SECRET',
      'NODE_ENV'
    ];

    const sensitiveVars = [
      'PASSWORD',
      'SECRET',
      'KEY',
      'TOKEN',
      'API_KEY'
    ];

    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        this.addIssue({
          severity: 'critical',
          category: 'environment_config',
          description: `Variável de ambiente obrigatória não definida: ${varName}`,
          recommendation: `Definir ${varName} no arquivo .env`
        });
      }
    });

    // Verificar se secrets têm tamanho adequado
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      this.addIssue({
        severity: 'high',
        category: 'weak_secrets',
        description: 'JWT_SECRET muito curto (< 32 caracteres)',
        recommendation: 'Usar JWT_SECRET com pelo menos 32 caracteres'
      });
    }

    // Verificar se não estão usando valores padrão
    const defaultValues = ['secret', 'password', 'admin', '123456', 'default'];
    Object.entries(process.env).forEach(([key, value]) => {
      if (sensitiveVars.some(sv => key.includes(sv)) && value) {
        if (defaultValues.includes(value.toLowerCase())) {
          this.addIssue({
            severity: 'critical',
            category: 'weak_secrets',
            description: `Variável ${key} usando valor padrão inseguro`,
            recommendation: `Alterar ${key} para um valor complexo e único`
          });
        }
      }
    });
  }

  private static async checkCORS() {
    console.log('📋 Verificando configuração CORS...');
    
    try {
      const configFile = await fs.readFile('./src/config/auth.ts', 'utf-8');
      
      if (configFile.includes('origin: "*"')) {
        this.addIssue({
          severity: 'high',
          category: 'cors_security',
          description: 'CORS configurado para aceitar qualquer origem',
          file: 'src/config/auth.ts',
          recommendation: 'Configurar origins específicos para CORS'
        });
      }

      if (!configFile.includes('credentials: true')) {
        this.addIssue({
          severity: 'medium',
          category: 'cors_security',
          description: 'CORS não configurado para permitir credentials',
          file: 'src/config/auth.ts',
          recommendation: 'Adicionar credentials: true à configuração CORS'
        });
      }
    } catch (error: any) {
      this.addIssue({
        severity: 'medium',
        category: 'config_missing',
        description: 'Não foi possível verificar configuração CORS',
        recommendation: 'Verificar se arquivo de configuração exists'
      });
    }
  }

  private static async checkRateLimiting() {
    console.log('📋 Verificando rate limiting...');
    
    try {
      const rateLimitFile = await fs.readFile('./src/middleware/rateLimiter.ts', 'utf-8');
      
      // Verificar se há rate limits configurados
      if (!rateLimitFile.includes('windowMs') || !rateLimitFile.includes('max:')) {
        this.addIssue({
          severity: 'high',
          category: 'rate_limiting',
          description: 'Rate limiting não configurado adequadamente',
          file: 'src/middleware/rateLimiter.ts',
          recommendation: 'Configurar windowMs e max para rate limiting'
        });
      }

      // Verificar se rate limiting específico para login existe
      if (!rateLimitFile.includes('loginRateLimit') && !rateLimitFile.includes('authRateLimit')) {
        this.addIssue({
          severity: 'high',
          category: 'auth_protection',
          description: 'Rate limiting específico para autenticação não encontrado',
          file: 'src/middleware/rateLimiter.ts',
          recommendation: 'Implementar rate limiting específico para endpoints de auth'
        });
      }
    } catch (error: any) {
      this.addIssue({
        severity: 'critical',
        category: 'missing_protection',
        description: 'Middleware de rate limiting não encontrado',
        recommendation: 'Implementar sistema de rate limiting'
      });
    }
  }

  private static async checkLoggingSecurity() {
    console.log('📋 Verificando segurança de logs...');
    
    try {
      const files = await glob('**/*.{ts,js}', { 
        ignore: ['node_modules/**', 'dist/**'] 
      });

      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Verificar console.log com dados potencialmente sensíveis
        if (content.includes('console.log') && 
            (content.includes('password') || content.includes('token') || content.includes('secret'))) {
          
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes('console.log') && 
                (line.includes('password') || line.includes('token') || line.includes('secret')) &&
                !line.includes('sanitize') && !line.includes('[REDACTED]')) {
              
              this.addIssue({
                severity: 'medium',
                category: 'information_disclosure',
                description: 'Possível log de dados sensíveis',
                file,
                line: index + 1,
                recommendation: 'Usar LogSanitizer para sanitizar logs sensíveis'
              });
            }
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Erro na verificação de logs:', error.message);
    }
  }

  private static async checkFilePermissions() {
    console.log('📋 Verificando permissões de arquivos...');
    
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'database.db',
      'private.key'
    ];

    for (const file of sensitiveFiles) {
      try {
        const stats = await fs.stat(file);
        const mode = stats.mode & parseInt('777', 8);
        
        if (mode > parseInt('600', 8)) {
          this.addIssue({
            severity: 'medium',
            category: 'file_permissions',
            description: `Arquivo ${file} com permissões muito abertas`,
            file,
            recommendation: `Alterar permissões do ${file} para 600 (rw-------)`
          });
        }
      } catch (error) {
        // Arquivo não existe, não é um problema
      }
    }
  }

  private static async checkDependencies() {
    console.log('📋 Verificando dependências...');
    
    try {
      const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf-8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Verificar versões conhecidamente vulneráveis
      const vulnerablePackages = {
        'node-fetch': ['< 2.6.7'],
        'minimist': ['< 1.2.6'],
        'lodash': ['< 4.17.21']
      };

      Object.entries(vulnerablePackages).forEach(([pkg, versions]) => {
        if (dependencies[pkg]) {
          this.addIssue({
            severity: 'medium',
            category: 'vulnerable_dependencies',
            description: `Dependência ${pkg} pode ter vulnerabilidades conhecidas`,
            recommendation: `Atualizar ${pkg} para versão segura`
          });
        }
      });
    } catch (error: any) {
      this.addIssue({
        severity: 'low',
        category: 'dependency_check',
        description: 'Não foi possível verificar dependências',
        recommendation: 'Executar npm audit manualmente'
      });
    }
  }

  private static async checkAuthConfiguration() {
    console.log('📋 Verificando configuração de autenticação...');
    
    try {
      const authConfig = await fs.readFile('./src/config/auth.ts', 'utf-8');
      
      // Verificar se JWT expiration está configurado
      if (!authConfig.includes('expiresIn') || authConfig.includes('expiresIn: "1y"')) {
        this.addIssue({
          severity: 'medium',
          category: 'token_security',
          description: 'Token JWT com expiração muito longa ou não configurada',
          file: 'src/config/auth.ts',
          recommendation: 'Configurar expiração de token JWT para máximo 24h'
        });
      }

      // Verificar se cookies estão configurados como httpOnly
      if (!authConfig.includes('httpOnly: true')) {
        this.addIssue({
          severity: 'high',
          category: 'cookie_security',
          description: 'Cookies não configurados como httpOnly',
          file: 'src/config/auth.ts',
          recommendation: 'Configurar cookies com httpOnly: true'
        });
      }
    } catch (error: any) {
      this.addIssue({
        severity: 'medium',
        category: 'config_missing',
        description: 'Não foi possível verificar configuração de auth',
        recommendation: 'Verificar se arquivo de configuração auth existe'
      });
    }
  }

  private static async checkDatabaseSecurity() {
    console.log('📋 Verificando segurança do banco de dados...');
    
    // Verificar se há queries concatenadas (SQL injection)
    try {
      const files = await glob('**/*.{ts,js}', { 
        ignore: ['node_modules/**', 'dist/**'] 
      });

      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Padrões perigosos de query
        const dangerousPatterns = [
          /query\s*\(\s*['"`][^'"]*\+/g,
          /execute\s*\(\s*['"`][^'"]*\+/g,
          /SELECT.*\+.*FROM/gi,
          /INSERT.*\+.*VALUES/gi
        ];

        const lines = content.split('\n');
        lines.forEach((line, index) => {
          dangerousPatterns.forEach(pattern => {
            if (pattern.test(line)) {
              this.addIssue({
                severity: 'critical',
                category: 'sql_injection',
                description: 'Possível vulnerabilidade de SQL injection',
                file,
                line: index + 1,
                recommendation: 'Usar prepared statements ou parameterized queries'
              });
            }
          });
        });
      }
    } catch (error: any) {
      console.error('❌ Erro na verificação de database:', error.message);
    }
  }

  private static async checkHeadersSecurity() {
    console.log('📋 Verificando headers de segurança...');
    
    try {
      const appFile = await fs.readFile('./src/app.ts', 'utf-8');
      
      const requiredHeaders = [
        'helmet',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection'
      ];

      requiredHeaders.forEach(header => {
        if (!appFile.includes(header)) {
          this.addIssue({
            severity: 'medium',
            category: 'security_headers',
            description: `Header de segurança ${header} não configurado`,
            file: 'src/app.ts',
            recommendation: `Adicionar configuração de ${header}`
          });
        }
      });
    } catch (error: any) {
      this.addIssue({
        severity: 'medium',
        category: 'config_missing',
        description: 'Não foi possível verificar headers de segurança',
        recommendation: 'Verificar configuração de headers no app.ts'
      });
    }
  }

  private static addIssue(issue: SecurityIssue) {
    this.issues.push(issue);
    
    const emoji = {
      critical: '🚨',
      high: '⚠️',
      medium: '🟡',
      low: '🔵'
    }[issue.severity];

    console.log(`${emoji} [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.description}`);
    if (issue.file) {
      console.log(`   📁 ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
    }
    console.log(`   💡 ${issue.recommendation}`);
    console.log('');
  }

  private static async generateReport(result: AuditResult) {
    const reportContent = `
# 🛡️ RELATÓRIO DE AUDITORIA DE SEGURANÇA

**Data:** ${result.timestamp}
**Status:** ${result.passed ? '✅ APROVADO' : '❌ REPROVADO'}

## 📊 Resumo

- **Total de Issues:** ${result.summary.total}
- **Críticas:** ${result.summary.critical}
- **Altas:** ${result.summary.high}
- **Médias:** ${result.summary.medium}
- **Baixas:** ${result.summary.low}

## 🔍 Issues Encontradas

${result.issues.map(issue => `
### ${issue.severity.toUpperCase()}: ${issue.category}

**Descrição:** ${issue.description}
${issue.file ? `**Arquivo:** ${issue.file}${issue.line ? `:${issue.line}` : ''}` : ''}
**Recomendação:** ${issue.recommendation}

`).join('')}

## ✅ Próximos Passos

${result.summary.critical > 0 ? '1. **URGENTE:** Corrigir todas as issues críticas antes do deploy' : ''}
${result.summary.high > 0 ? '2. Corrigir issues de alto risco' : ''}
${result.summary.medium > 0 ? '3. Planejar correção de issues médias' : ''}

---
*Relatório gerado automaticamente pelo DigiUrban Security Auditor*
`;

    try {
      await fs.mkdir('./audit-reports', { recursive: true });
      await fs.writeFile(
        `./audit-reports/security-audit-${new Date().toISOString().split('T')[0]}.md`,
        reportContent
      );
      console.log('📋 Relatório salvo em ./audit-reports/');
    } catch (error) {
      console.error('❌ Erro ao salvar relatório:', error);
    }
  }
}

// Executar auditoria se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  SecurityAuditor.runFullAudit().then(result => {
    console.log('\n🎯 Auditoria de segurança concluída!');
    console.log(`Status: ${result.passed ? '✅ APROVADO' : '❌ REPROVADO'}`);
    console.log(`Issues encontradas: ${result.summary.total}`);
    
    if (!result.passed) {
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Erro na auditoria:', error);
    process.exit(1);
  });
}