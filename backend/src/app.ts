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
import { errorHandler } from './middleware/errorHandler.js';
import { generalRateLimit } from './middleware/rateLimiter.js';
import { logger } from './config/logger.js';

// Importar todas as rotas
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import permissionRoutes from './routes/permissions.js';
import activityRoutes from './routes/activities.js';
import registrationRoutes from './routes/registration.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ====================================================================
// MIDDLEWARE DE SEGURANÇA
// ====================================================================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || false
    : true,
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(compression());

// Rate limiting geral
app.use(generalRateLimit);

// ====================================================================
// MIDDLEWARE DE PARSING
// ====================================================================

app.use(express.json({ 
  limit: '10mb',
  strict: true
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// ====================================================================
// ROTAS DA API
// ====================================================================

// Rota de saúde (sem rate limit específico)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas de registro
app.use('/api/registration', registrationRoutes);

// Rotas de usuários
app.use('/api/users', userRoutes);

// Rotas de permissões
app.use('/api/permissions', permissionRoutes);

// Rotas de atividades/logs
app.use('/api/activities', activityRoutes);

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

const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor Digiurban Auth rodando na porta ${PORT}`);
  logger.info(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  
  // Log das rotas disponíveis
  logger.info('🛣️  Rotas disponíveis:');
  logger.info('   • /api/auth/* - Autenticação e sessões');
  logger.info('   • /api/registration/* - Registro de usuários e tenants');
  logger.info('   • /api/users/* - Gerenciamento de usuários');
  logger.info('   • /api/permissions/* - Sistema de permissões RBAC');
  logger.info('   • /api/activities/* - Logs e auditoria');
});

// ====================================================================
// GRACEFUL SHUTDOWN
// ====================================================================

process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    logger.info('✅ Servidor encerrado graciosamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT recebido. Encerrando servidor...');
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