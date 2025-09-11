// ====================================================================
// 🔧 KNEX CONFIGURATION - DIGIURBAN BACKEND
// ====================================================================
// Configuração do Knex.js específica para execução do backend
// ====================================================================

const path = require('path');

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'data', 'digiurban.db')
    },
    migrations: {
      directory: path.join(__dirname, '..', 'migrations'),
      pattern: /^A\d{2}_.*\.js$/,
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'database', 'seeds')
    },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 10,
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON');
        conn.run('PRAGMA journal_mode = WAL');
        conn.run('PRAGMA synchronous = NORMAL');
        conn.run('PRAGMA cache_size = 10000');
        conn.run('PRAGMA temp_store = MEMORY');
        conn.run('PRAGMA busy_timeout = 30000');
        done();
      }
    }
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    migrations: {
      directory: path.join(__dirname, '..', 'migrations'),
      pattern: /^A\d{2}_.*\.js$/,
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'database', 'seeds')
    },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 1,
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON');
        conn.run('PRAGMA synchronous = OFF');
        conn.run('PRAGMA cache_size = 10000');
        conn.run('PRAGMA temp_store = MEMORY');
        done();
      }
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL || '/app/data/digiurban.db'
    },
    migrations: {
      directory: path.join(__dirname, '..', 'migrations'),
      pattern: /^A\d{2}_.*\.js$/,
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'database', 'seeds')
    },
    useNullAsDefault: true,
    pool: {
      min: 2,
      max: 20,
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON');
        conn.run('PRAGMA journal_mode = WAL');
        conn.run('PRAGMA synchronous = NORMAL');
        conn.run('PRAGMA cache_size = 32000');
        conn.run('PRAGMA temp_store = MEMORY');
        conn.run('PRAGMA busy_timeout = 30000');
        conn.run('PRAGMA mmap_size = 268435456');
        conn.run('PRAGMA optimize');
        done();
      }
    }
  }
};

module.exports = config;