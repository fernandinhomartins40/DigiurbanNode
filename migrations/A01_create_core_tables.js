// ====================================================================
// 📦 MIGRAÇÃO A01: CRIAÇÃO DE TABELAS PRINCIPAIS
// ====================================================================
// Sistema completo de autenticação DigiUrban
// Convertido para Knex.js Schema Builder
// ====================================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log('🚀 Executando A01: Criação de Tabelas Principais...');

  // ====================================================================
  // CRIAÇÃO DE TABELAS
  // ====================================================================

  // Tabela de Tenants (Prefeituras)
  await knex.schema.createTable('tenants', (table) => {
    table.string('id').primary();
    table.string('tenant_code').unique().notNullable();
    table.string('nome').notNullable();
    table.string('cidade').notNullable();
    table.string('estado').notNullable();
    table.string('cnpj').unique().notNullable();
    table.string('plano').defaultTo('basico').checkIn(['basico', 'premium', 'enterprise']);
    table.string('status').defaultTo('ativo').checkIn(['ativo', 'inativo', 'suspenso']);
    table.integer('populacao');
    table.string('endereco');
    table.string('responsavel_nome');
    table.string('responsavel_email');
    table.string('responsavel_telefone');
    table.datetime('created_at');
    table.datetime('updated_at');
  });

  // Tabela de Usuários
  await knex.schema.createTable('users', (table) => {
    table.string('id').primary();
    table.string('tenant_id').references('id').inTable('tenants').onDelete('SET NULL');
    table.string('nome_completo').notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('role').defaultTo('user').checkIn(['guest', 'user', 'coordinator', 'manager', 'admin', 'super_admin']);
    table.string('status').defaultTo('pendente').checkIn(['ativo', 'inativo', 'pendente', 'bloqueado']);
    table.string('avatar_url');
    table.datetime('ultimo_login');
    table.integer('failed_login_attempts').defaultTo(0);
    table.datetime('locked_until');
    table.boolean('email_verified').defaultTo(false);
    table.datetime('created_at');
    table.datetime('updated_at');
  });

  // Tabela de Permissões
  await knex.schema.createTable('permissions', (table) => {
    table.increments('id').primary();
    table.string('code').unique().notNullable();
    table.string('resource').notNullable();
    table.string('action').notNullable();
    table.string('description');
    table.datetime('created_at');
  });

  // Tabela de Permissões por Usuário
  await knex.schema.createTable('user_permissions', (table) => {
    table.increments('id').primary();
    table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('permission_id').notNullable().references('id').inTable('permissions').onDelete('CASCADE');
    table.string('granted_by').references('id').inTable('users').onDelete('SET NULL');
    table.datetime('created_at');
    table.unique(['user_id', 'permission_id']);
  });

  // Tabela de Sessões JWT
  await knex.schema.createTable('user_sessions', (table) => {
    table.string('id').primary();
    table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash').notNullable();
    table.string('ip_address');
    table.string('user_agent');
    table.datetime('expires_at').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.datetime('created_at');
  });

  // Tabela de Tokens de Ativação/Reset
  await knex.schema.createTable('user_tokens', (table) => {
    table.string('id').primary();
    table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash').notNullable();
    table.string('token_type').notNullable().checkIn(['activation', 'password_reset', 'email_change']);
    table.datetime('expires_at').notNullable();
    table.datetime('used_at');
    table.datetime('created_at');
  });

  // Tabela de Log de Atividades
  await knex.schema.createTable('activity_logs', (table) => {
    table.increments('id').primary();
    table.string('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('tenant_id').references('id').inTable('tenants').onDelete('SET NULL');
    table.string('action').notNullable();
    table.string('resource');
    table.string('resource_id');
    table.text('details');
    table.string('ip_address');
    table.string('user_agent');
    table.datetime('created_at');
  });

  // Tabela de Configurações do Sistema
  await knex.schema.createTable('system_config', (table) => {
    table.string('key').primary();
    table.string('value').notNullable();
    table.string('description');
    table.datetime('created_at');
    table.datetime('updated_at');
  });

  // ====================================================================
  // CRIAÇÃO DE ÍNDICES
  // ====================================================================

  // Índices para tabela users
  await knex.schema.alterTable('users', (table) => {
    table.index(['email'], 'idx_users_email');
    table.index(['tenant_id'], 'idx_users_tenant');
    table.index(['role'], 'idx_users_role');
    table.index(['status'], 'idx_users_status');
    table.index(['ultimo_login'], 'idx_users_ultimo_login');
  });

  // Índices para tabela tenants
  await knex.schema.alterTable('tenants', (table) => {
    table.index(['tenant_code'], 'idx_tenants_codigo');
    table.index(['cnpj'], 'idx_tenants_cnpj');
    table.index(['status'], 'idx_tenants_status');
  });

  // Índices para tabela user_sessions
  await knex.schema.alterTable('user_sessions', (table) => {
    table.index(['user_id'], 'idx_sessions_user');
    table.index(['expires_at'], 'idx_sessions_expires');
    table.index(['is_active'], 'idx_sessions_active');
    table.index(['token_hash'], 'idx_sessions_token_hash');
  });

  // Índices para tabela permissions
  await knex.schema.alterTable('permissions', (table) => {
    table.index(['code'], 'idx_permissions_code');
    table.index(['resource'], 'idx_permissions_resource');
  });

  // Índices para tabela user_permissions
  await knex.schema.alterTable('user_permissions', (table) => {
    table.index(['user_id'], 'idx_user_permissions_user');
    table.index(['permission_id'], 'idx_user_permissions_permission');
  });

  // Índices para tabela user_tokens
  await knex.schema.alterTable('user_tokens', (table) => {
    table.index(['user_id'], 'idx_user_tokens_user');
    table.index(['token_type'], 'idx_user_tokens_type');
    table.index(['expires_at'], 'idx_user_tokens_expires');
    table.index(['token_hash'], 'idx_user_tokens_hash');
  });

  // Índices para tabela activity_logs
  await knex.schema.alterTable('activity_logs', (table) => {
    table.index(['user_id'], 'idx_activity_user');
    table.index(['tenant_id'], 'idx_activity_tenant');
    table.index(['action'], 'idx_activity_action');
  });

  // ====================================================================
  // CRIAÇÃO DE TRIGGERS
  // ====================================================================

  // Triggers para updated_at - usando SQL raw pois Knex não tem sintaxe nativa para triggers
  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS update_tenants_timestamp
      AFTER UPDATE ON tenants
      FOR EACH ROW
    BEGIN
      UPDATE tenants SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = NEW.id;
    END;
  `);

  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS update_users_timestamp
      AFTER UPDATE ON users
      FOR EACH ROW
    BEGIN
      UPDATE users SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = NEW.id;
    END;
  `);

  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS update_system_config_timestamp
      AFTER UPDATE ON system_config
      FOR EACH ROW
    BEGIN
      UPDATE system_config SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE key = NEW.key;
    END;
  `);

  console.log('✅ A01: Tabelas principais criadas com sucesso');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log('🔄 Fazendo rollback A01: Tabelas Principais...');
  
  // Remover triggers
  await knex.raw('DROP TRIGGER IF EXISTS update_tenants_timestamp');
  await knex.raw('DROP TRIGGER IF EXISTS update_users_timestamp');
  await knex.raw('DROP TRIGGER IF EXISTS update_system_config_timestamp');
  
  // Remover tabelas na ordem inversa (por causa das foreign keys)
  await knex.schema.dropTableIfExists('activity_logs');
  await knex.schema.dropTableIfExists('system_config');
  await knex.schema.dropTableIfExists('user_tokens');
  await knex.schema.dropTableIfExists('user_sessions');
  await knex.schema.dropTableIfExists('user_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('tenants');
  
  console.log('✅ Rollback A01 concluído');
};