import { prisma } from '../database/prisma.js';
import { logger } from './logger.js';

// Usar a conexão Prisma do sistema
export const db = prisma;

// Configurações de performance aplicadas no prisma.ts
logger.info('Database configuration loaded (Prisma)');

export default db;