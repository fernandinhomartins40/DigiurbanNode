# 🚀 PLANO DE MIGRAÇÃO: Better-SQLite3 → Knex.js + SQLite3

## 📋 Resumo Executivo

**Objetivo**: Migrar sistema de banco de dados de better-sqlite3 para Knex.js + SQLite3 padrão
**Tempo Estimado**: 8-12 dias úteis
**Risco**: Baixo (migração gradual)
**Benefício**: Sistema de migrations robusto + ecosystem maduro

## 🎯 Motivação

### Problemas Atuais
- Sistema de migrations customizado com alta complexidade
- Ausência de rollbacks nativos
- Validação manual de integridade
- Dificuldade para escalar sistema de migrations

### Benefícios Esperados
- ✅ **Rollbacks automáticos** com `exports.down`
- ✅ **CLI nativo** do Knex para gestão de migrations
- ✅ **Schema Builder** TypeScript-friendly
- ✅ **Validação automática** de checksums e integridade
- ✅ **Ecosystem maduro** com 71 migrations de referência
- ✅ **Preparação futura** para PostgreSQL/MySQL se necessário

## 📊 Análise de Impacto

### Código Atual Preparado
```typescript
// JÁ usa padrão assíncrono
const db = await getDatabase();
```
**✅ Zero quebra** na estrutura existente

### Performance
```
Better-SQLite3: ~50-100k ops/sec
SQLite3:        ~30-70k ops/sec
```
**✅ Performance adequada** para aplicação municipal

### Dependências
```diff
- "better-sqlite3": "^12.2.0"
- "@types/better-sqlite3": "^7.6.13"
+ "knex": "^3.1.0" 
+ "sqlite3": "^5.1.7"
+ "@types/sqlite3": "^3.1.8"
```

## 🗓️ CRONOGRAMA DETALHADO

### **FASE 1: PREPARAÇÃO** (2-3 dias)

#### Dia 1: Backup e Dependências
- [ ] ✅ Backup completo banco atual
- [ ] ✅ Instalar Knex.js + SQLite3
- [ ] ✅ Remover better-sqlite3
- [ ] ✅ Atualizar package.json

#### Dia 2: Configuração Base
- [ ] ✅ Criar `knexfile.js` otimizado
- [ ] ✅ Configurar scripts NPM
- [ ] ✅ Setup inicial de testes

### **FASE 2: INFRAESTRUTURA** (3-4 dias)

#### Dia 3-4: Sistema Híbrido
- [ ] ✅ Adaptar `connection.ts` para Knex
- [ ] ✅ Manter compatibilidade com migrations A01-A05
- [ ] ✅ Criar sistema de detecção legacy/knex

#### Dia 5-6: Migration System
- [ ] ✅ Configurar Knex migrations (A06+)
- [ ] ✅ Implementar validação de integridade
- [ ] ✅ Testes de rollback

### **FASE 3: MODELS** (2-3 dias)

#### Dia 7-8: Migração Models
- [ ] ✅ ActivityModel → Knex Query Builder
- [ ] ✅ UserModel → Knex Query Builder
- [ ] ✅ TenantModel → Knex Query Builder
- [ ] ✅ Demais models existentes

### **FASE 4: VALIDAÇÃO** (2-3 dias)

#### Dia 9-10: Testes e Otimização
- [ ] ✅ Testes de integridade completos
- [ ] ✅ Performance benchmarks
- [ ] ✅ Validação de todas as funcionalidades

#### Dia 11-12: Documentação e Deploy
- [ ] ✅ Documentação atualizada
- [ ] ✅ Scripts de deploy ajustados
- [ ] ✅ Rollback plan completo

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### 1. Knexfile.js
```javascript
const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'data', 'digiurban.db')
    },
    migrations: {
      directory: './migrations',
      pattern: /^A\d{2}_.*\.js$/,
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './backend/src/database/seeds'
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, done) => {
        // Configurações SQLite otimizadas
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

  production: {
    client: 'sqlite3',
    connection: {
      filename: '/app/data/digiurban.db'
    },
    migrations: {
      directory: './migrations',
      pattern: /^A\d{2}_.*\.js$/,
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 10,
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON');
        conn.run('PRAGMA journal_mode = WAL');
        conn.run('PRAGMA synchronous = NORMAL');
        conn.run('PRAGMA cache_size = 32000');
        conn.run('PRAGMA temp_store = MEMORY');
        conn.run('PRAGMA mmap_size = 268435456');
        done();
      }
    }
  }
};
```

### 2. Connection.ts Adaptado
```typescript
import knex from 'knex';
import knexConfig from '../../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

export const db = knex(config);

export const getDatabase = () => db;

// Backwards compatibility
export const initializeDatabase = () => db;
export const closeDatabase = async () => await db.destroy();
```

### 3. Nova Migration A06 (Exemplo)
```javascript
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Exemplo: Nova tabela notifications
  await knex.schema.createTable('notifications', (table) => {
    table.string('id').primary();
    table.string('user_id').references('id').inTable('users');
    table.string('title').notNullable();
    table.text('message');
    table.string('type').defaultTo('info');
    table.boolean('read').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('notifications');
};
```

### 4. Model Adaptado
```typescript
// ANTES (Better-SQLite3)
static async create(data: CreateActivityData): Promise<Activity> {
  const db = await getDatabase();
  const id = crypto.randomUUID();
  
  db.prepare(`INSERT INTO activities (...) VALUES (...)`).run(...);
  return await this.findById(id);
}

// DEPOIS (Knex.js)
static async create(data: CreateActivityData): Promise<Activity> {
  const [id] = await db('activities')
    .insert({
      id: crypto.randomUUID(),
      ...data,
      created_at: db.fn.now()
    })
    .returning('id');
    
  return await this.findById(id);
}
```

## 🚨 PLANO DE ROLLBACK

### Se Algo der Errado
1. **Restaurar backup** do banco original
2. **Reverter package.json** para better-sqlite3
3. **Restaurar connection.ts** original
4. **Executar npm install** para dependências antigas

### Critérios de Go/No-Go
- ✅ Todos os testes passando
- ✅ Performance >= 80% da original
- ✅ Zero perda de dados
- ✅ Rollbacks funcionando

## 📈 MÉTRICAS DE SUCESSO

### Performance
- **Tempo resposta**: < 200ms (queries simples)
- **Throughput**: >= 30k ops/sec
- **Memory usage**: <= 150% do atual

### Funcionalidade
- **Migrations**: 100% funcionais
- **Rollbacks**: 100% testados
- **Data integrity**: 100% preservada

### Operacional
- **Deploy time**: < 5 minutos
- **Backup/restore**: < 2 minutos
- **Error rate**: 0% em 48h

## 🔒 CONSIDERAÇÕES DE SEGURANÇA

- Backup automático antes de cada migration
- Validação de checksums em todas as operações
- Logs detalhados de todas as mudanças
- Rollback automático em caso de falha

## 👥 RESPONSABILIDADES

- **Backend Developer**: Implementação técnica
- **DevOps**: Scripts de deploy e monitoramento
- **QA**: Testes de integridade e performance
- **Product Owner**: Validação funcional

---

**Status**: 🚧 Em Progresso
**Última Atualização**: 2025-09-10
**Próxima Revisão**: Após cada fase completada