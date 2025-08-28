import { getDatabase } from '../database/connection.js';
import { logger } from './logger.js';

// Usar a conexão padrão do sistema
export const db = getDatabase();

// Configurações de performance serão aplicadas na connection.ts
logger.info('Database configuration loaded');

export default db;