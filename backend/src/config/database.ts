import Database from 'better-sqlite3';
import { logger } from './logger.js';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'digiurban.db');

export const db = new Database(dbPath, {
  verbose: (message) => logger.debug(message)
});

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');
db.pragma('foreign_keys = ON');
db.pragma('temp_store = MEMORY');

export default db;