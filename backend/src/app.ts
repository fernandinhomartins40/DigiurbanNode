// ====================================================================
// 🚀 APP PRINCIPAL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Aplicação Express com rotas completas de autenticação
// Sistema integrado com middleware de segurança e rate limiting
// ====================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { generalRateLimit } from './middleware/rateLimiter.js';
import { logger } from './config/logger.js';
import { sanitizeAll } from './middleware/validation.js';
import { BackupService } from './services/BackupService.js';
import { EmailService } from './services/EmailService.js';
import { getUltraZendSMTPServer } from './services/UltraZendSMTPServer.js';
import { prisma } from './database/prisma.js';
// Migrations agora são executadas via Knex nativo no deploy
// import { runMigrations } from './database/migrationRunner.js';
import { CORS_CONFIG, SECURITY_HEADERS, validateConfig } from './config/auth.js';
import { metricsMiddleware } from './monitoring/metrics.js';
import { StructuredLogger } from './monitoring/structuredLogger.js';

// Importar todas as rotas
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { tenantRoutes } from './routes/tenants.js';
import { systemRoutes } from './routes/system.js';
import permissionRoutes from './routes/permissions.js';
import activityRoutes from './routes/activities.js';
import registrationRoutes from './routes/registration.js';
import passwordResetRoutes from './routes/passwordReset.js';
import metricsRoutes from './routes/metrics.js';
import healthRoutes from './routes/health.js';
import adminRoutes from './routes/admin.js';
import billingRoutes from './routes/billing.js';
import emailRoutes from './routes/emails.js';
import tenantEmailRoutes from './routes/tenantEmails.js';

const app = express();
const PORT = process.env.PORT || 3021;

// ====================================================================
// MIDDLEWARE DE SEGURANÇA
// ====================================================================

// Validar configurações de segurança
validateConfig();

// Headers de segurança personalizados
app.use(helmet({
  contentSecurityPolicy: false // Usando CSP personalizado
}));

// Aplicar headers de segurança customizados
app.use((req, res, next) => {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  next();
});

// ====================================================================
// ROTA DE HEALTH CHECK (ANTES DO CORS) 
// ====================================================================

// Rota de saúde (sem CORS, rate limit ou outros middlewares)
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ====================================================================
// MIDDLEWARES PRINCIPAIS
// ====================================================================

app.use(cors(CORS_CONFIG));

app.use(compression());

// Rate limiting geral
app.use(generalRateLimit);

// Middleware de métricas Prometheus
app.use(metricsMiddleware);

// Middleware de structured logging
app.use(StructuredLogger.createRequestLogger());

// ====================================================================
// MIDDLEWARE DE PARSING
// ====================================================================

// Cookie parser para httpOnly cookies seguros
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(express.json({ 
  limit: '10mb',
  strict: true
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Sanitização global de todas as entradas
app.use(sanitizeAll);

// ====================================================================
// ROTAS DA API
// ====================================================================

// Outras rotas da API virão aqui

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas de registro
app.use('/api/registration', registrationRoutes);

// Rotas de recuperação de senha
app.use('/api/password-reset', passwordResetRoutes);

// Rotas de usuários
app.use('/api/users', userRoutes);

// Rotas de tenants
app.use('/api/tenants', tenantRoutes);

// Rotas de sistema
app.use('/api/system', systemRoutes);

// Rotas de permissões
app.use('/api/permissions', permissionRoutes);

// Rotas de atividades/logs
app.use('/api/activities', activityRoutes);

// Rotas administrativas (super admin)
app.use('/api', adminRoutes);

// Rotas de billing e métricas SaaS (super admin)
app.use('/api', billingRoutes);

// Rotas de métricas (Prometheus)
app.use('/api', metricsRoutes);

// Rotas de health check
app.use('/api', healthRoutes);

// Rotas de sistema de email (UltraZend Integration)
app.use('/api/emails', emailRoutes);

// Rotas de email para tenants (Sistema isolado por tenant)
app.use('/api/tenant/emails', tenantEmailRoutes);

// ====================================================================
// ROTA 404
// ====================================================================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// ====================================================================
// MIDDLEWARE DE ERRO
// ====================================================================

app.use(errorHandler);

// ====================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ====================================================================

// Inicializar instância do UltraZend SMTP Server
const smtpServer = getUltraZendSMTPServer(prisma);

const server = app.listen(PORT, async () => {
  logger.info(`🚀 Servidor Digiurban Auth rodando na porta ${PORT}`);
  logger.info(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health Check: http://localhost:${PORT}/api/health`);

  // Inicializar serviços
  try {
    // Migrations são executadas via Knex nativo no script de deploy
    logger.info('🗄️  Banco de dados pronto (migrations executadas via Knex)');

    // 2. Inicializar serviços
    await BackupService.initialize();

    // 3. Inicializar serviço de e-mail integrado (UltraZend + DigiUrban)
    logger.info('📧 Inicializando serviço de e-mail integrado...');
    EmailService.initialize();
    if (EmailService.isConfigured()) {
      logger.info('✅ EmailService configurado com UltraZend SMTP');
    } else {
      logger.warn('⚠️  EmailService em modo simulação (configuração SMTP ausente)');
    }

    // 4. Inicializar UltraZend SMTP Server (se configurado)
    if (process.env.SMTP_ENABLE === 'true') {
      logger.info('📨 Inicializando UltraZend SMTP Server...');
      try {
        await smtpServer.start();
        const stats = await smtpServer.getServerStats();
        logger.info(`✅ UltraZend SMTP Server ativo nas portas MX:${stats.ports.mx} / Submission:${stats.ports.submission}`);
      } catch (smtpError) {
        logger.error('❌ Erro ao inicializar UltraZend SMTP Server:', smtpError);
        logger.warn('⚠️  Sistema continuará sem servidor SMTP próprio');
      }
    } else {
      logger.info('ℹ️  UltraZend SMTP Server desabilitado (SMTP_ENABLE != true)');
    }

    // Iniciar backup automático em produção
    if (process.env.NODE_ENV === 'production') {
      BackupService.startAutomaticBackup();
    }

  } catch (error) {
    logger.error('❌ Erro ao inicializar serviços:', error);
  }
  
  // Log das rotas disponíveis
  logger.info('🛣️  Rotas disponíveis:');
  logger.info('   • /api/auth/* - Autenticação e sessões');
  logger.info('   • /api/registration/* - Registro de usuários e tenants');
  logger.info('   • /api/users/* - Gerenciamento de usuários');
  logger.info('   • /api/tenants/* - Gerenciamento de tenants');
  logger.info('   • /api/system/* - Logs de sistema e diagnósticos');
  logger.info('   • /api/permissions/* - Sistema de permissões RBAC');
  logger.info('   • /api/activities/* - Logs e auditoria');
  logger.info('   • /api/emails/* - Sistema integrado de email (UltraZend)');
  logger.info('   • /api/tenant/emails/* - Sistema de email para tenants (isolado)');
});

// ====================================================================
// GRACEFUL SHUTDOWN
// ====================================================================

process.on('SIGTERM', async () => {
  logger.info('🛑 SIGTERM recebido. Encerrando servidor...');

  // Parar UltraZend SMTP Server primeiro
  if (smtpServer.isServerRunning()) {
    logger.info('📨 Parando UltraZend SMTP Server...');
    await smtpServer.stop();
  }

  server.close(() => {
    logger.info('✅ Servidor encerrado graciosamente');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('🛑 SIGINT recebido. Encerrando servidor...');

  // Parar UltraZend SMTP Server primeiro
  if (smtpServer.isServerRunning()) {
    logger.info('📨 Parando UltraZend SMTP Server...');
    await smtpServer.stop();
  }

  server.close(() => {
    logger.info('✅ Servidor encerrado graciosamente');
    process.exit(0);
  });
});

// ====================================================================
// TRATAMENTO DE ERROS NÃO CAPTURADOS
// ====================================================================

process.on('unhandledRejection', (reason, promise) => {
  logger.error('🚨 Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

export default app;