const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
try {
  const envContent = fs.readFileSync('./.env', 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      process.env[key.trim()] = values.join('=').trim();
    }
  });
} catch (error) {
  console.log('⚠️ Arquivo .env não encontrado, verificando apenas variáveis do sistema');
}

console.log('🔍 Iniciando auditoria de segurança simplificada...\n');

let issues = [];
let warnings = [];
let passed = [];

// Função para adicionar issue
function addIssue(severity, category, description, file, recommendation) {
  const issue = { severity, category, description, file, recommendation };
  issues.push(issue);
  
  const emoji = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : '🟡';
  console.log(`${emoji} [${severity.toUpperCase()}] ${category}: ${description}`);
  if (file) console.log(`   📁 ${file}`);
  console.log(`   💡 ${recommendation}\n`);
}

function addWarning(message) {
  warnings.push(message);
  console.log(`🟡 WARNING: ${message}`);
}

function addPassed(message) {
  passed.push(message);
  console.log(`✅ PASS: ${message}`);
}

// 1. Verificar variáveis de ambiente
console.log('📋 Verificando variáveis de ambiente...');
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET'];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    addIssue('critical', 'environment_config', 
      `Variável de ambiente obrigatória não definida: ${varName}`,
      '.env',
      `Definir ${varName} no arquivo .env`
    );
  } else {
    addPassed(`Variável ${varName} definida`);
  }
});

// Verificar tamanho dos secrets
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  addIssue('high', 'weak_secrets',
    'JWT_SECRET muito curto (< 32 caracteres)',
    '.env',
    'Usar JWT_SECRET com pelo menos 32 caracteres'
  );
} else if (process.env.JWT_SECRET) {
  addPassed('JWT_SECRET tem tamanho adequado');
}

// 2. Verificar arquivos de configuração
console.log('\n📋 Verificando arquivos de configuração...');

try {
  const authConfig = fs.readFileSync('./backend/src/config/auth.ts', 'utf-8');
  
  if (authConfig.includes('origin: "*"')) {
    addIssue('high', 'cors_security',
      'CORS configurado para aceitar qualquer origem',
      'backend/src/config/auth.ts',
      'Configurar origins específicos para CORS'
    );
  } else {
    addPassed('CORS não aceita todas as origens');
  }

  if (authConfig.includes('httpOnly: true')) {
    addPassed('Cookies configurados como httpOnly');
  } else {
    addIssue('high', 'cookie_security',
      'Cookies não configurados como httpOnly',
      'backend/src/config/auth.ts',
      'Configurar cookies com httpOnly: true'
    );
  }
} catch (error) {
  addWarning('Não foi possível verificar arquivo de configuração auth.ts');
}

// 3. Verificar rate limiting
console.log('\n📋 Verificando rate limiting...');
try {
  const rateLimitFile = fs.readFileSync('./backend/src/middleware/rateLimiter.ts', 'utf-8');
  
  if (rateLimitFile.includes('windowMs') && rateLimitFile.includes('max:')) {
    addPassed('Rate limiting configurado');
  } else {
    addIssue('high', 'rate_limiting',
      'Rate limiting não configurado adequadamente',
      'backend/src/middleware/rateLimiter.ts',
      'Configurar windowMs e max para rate limiting'
    );
  }
} catch (error) {
  addIssue('critical', 'missing_protection',
    'Middleware de rate limiting não encontrado',
    null,
    'Implementar sistema de rate limiting'
  );
}

// 4. Verificar se há credenciais hardcoded
console.log('\n📋 Verificando credenciais hardcoded...');
const sensitiveFiles = [
  './backend/src/controllers/authController.ts',
  './backend/src/config/auth.ts',
  './frontend/src/auth/config/authConfig.ts'
];

sensitiveFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Padrões perigosos
    if (content.includes('password:') && content.includes('"') && !content.includes('process.env')) {
      addIssue('critical', 'hardcoded_credentials',
        'Possível credencial hardcoded encontrada',
        file,
        'Mover credenciais para variáveis de ambiente'
      );
    }
    
    if (content.includes('TEST_CREDENTIALS') || content.includes('demo-credentials')) {
      addIssue('critical', 'hardcoded_credentials',
        'Credenciais de teste/demo encontradas',
        file,
        'Remover credenciais de teste do código'
      );
    }
  } catch (error) {
    addWarning(`Não foi possível verificar ${file}`);
  }
});

// 5. Verificar package.json para vulnerabilidades conhecidas
console.log('\n📋 Verificando dependências...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./backend/package.json', 'utf-8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Dependências com vulnerabilidades conhecidas
  const vulnerablePackages = {
    'node-fetch': 'Atualizar para >= 2.6.7',
    'minimist': 'Atualizar para >= 1.2.6'
  };

  let foundVulnerable = false;
  Object.entries(vulnerablePackages).forEach(([pkg, fix]) => {
    if (dependencies[pkg]) {
      addIssue('medium', 'vulnerable_dependencies',
        `Dependência ${pkg} pode ter vulnerabilidades conhecidas`,
        'backend/package.json',
        fix
      );
      foundVulnerable = true;
    }
  });
  
  if (!foundVulnerable) {
    addPassed('Não foram encontradas dependências vulneráveis conhecidas');
  }
} catch (error) {
  addWarning('Não foi possível verificar dependências');
}

// 6. Verificar headers de segurança
console.log('\n📋 Verificando headers de segurança...');
try {
  const appFile = fs.readFileSync('./backend/src/app.ts', 'utf-8');
  
  if (appFile.includes('helmet')) {
    addPassed('Helmet configurado para headers de segurança');
  } else {
    addIssue('medium', 'security_headers',
      'Helmet não configurado',
      'backend/src/app.ts',
      'Adicionar helmet para headers de segurança'
    );
  }
} catch (error) {
  addWarning('Não foi possível verificar configuração de headers');
}

// 7. Verificar sistema de logs
console.log('\n📋 Verificando sistema de logs...');
try {
  const logSanitizer = fs.readFileSync('./backend/src/utils/logSanitizer.ts', 'utf-8');
  
  if (logSanitizer.includes('sanitize')) {
    addPassed('Sistema de sanitização de logs implementado');
  } else {
    addIssue('medium', 'information_disclosure',
      'Sistema de sanitização de logs não encontrado',
      null,
      'Implementar sanitização de logs sensíveis'
    );
  }
} catch (error) {
  addWarning('Não foi possível verificar sistema de logs');
}

// 8. Verificar estrutura de observabilidade
console.log('\n📋 Verificando observabilidade...');
try {
  const metricsFile = fs.readFileSync('./backend/src/monitoring/metrics.ts', 'utf-8');
  if (metricsFile.includes('prometheus')) {
    addPassed('Sistema de métricas Prometheus implementado');
  }
} catch (error) {
  addWarning('Sistema de métricas não encontrado');
}

try {
  const structuredLogger = fs.readFileSync('./backend/src/monitoring/structuredLogger.ts', 'utf-8');
  if (structuredLogger.includes('StructuredLogger')) {
    addPassed('Sistema de structured logging implementado');
  }
} catch (error) {
  addWarning('Sistema de structured logging não encontrado');
}

try {
  const healthCheck = fs.readFileSync('./backend/src/monitoring/healthCheck.ts', 'utf-8');
  if (healthCheck.includes('HealthChecker')) {
    addPassed('Sistema de health checks implementado');
  }
} catch (error) {
  addWarning('Sistema de health checks não encontrado');
}

// Gerar relatório final
console.log('\n' + '='.repeat(60));
console.log('🛡️ RELATÓRIO FINAL DE AUDITORIA DE SEGURANÇA');
console.log('='.repeat(60));

const critical = issues.filter(i => i.severity === 'critical').length;
const high = issues.filter(i => i.severity === 'high').length;
const medium = issues.filter(i => i.severity === 'medium').length;

console.log(`\n📊 RESUMO:`);
console.log(`- Issues Críticas: ${critical}`);
console.log(`- Issues Altas: ${high}`);
console.log(`- Issues Médias: ${medium}`);
console.log(`- Warnings: ${warnings.length}`);
console.log(`- Verificações Aprovadas: ${passed.length}`);

const overallStatus = critical === 0 && high === 0;
console.log(`\n🎯 STATUS GERAL: ${overallStatus ? '✅ APROVADO' : '❌ REPROVADO'}`);

if (critical > 0) {
  console.log('\n🚨 AÇÃO URGENTE NECESSÁRIA: Existem vulnerabilidades críticas que devem ser corrigidas imediatamente!');
}

if (high > 0) {
  console.log('\n⚠️ ATENÇÃO: Existem vulnerabilidades de alto risco que devem ser corrigidas antes do deploy.');
}

console.log('\n' + '='.repeat(60));

// Retornar código de saída apropriado
process.exit(overallStatus ? 0 : 1);