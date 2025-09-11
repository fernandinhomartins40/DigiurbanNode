// ====================================================================
// 📦 MIGRAÇÃO A03: OTIMIZAÇÃO DE PERFORMANCE
// ====================================================================
// Performance tuning para SQLite3
// Índices compostos, particionamento lógico e otimizações
// ====================================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log('🚀 Executando A03: Otimização de Performance...');

  // ====================================================================
  // 1. OTIMIZAÇÕES DE ÍNDICES COMPOSTOS
  // ====================================================================

  // Índices compostos para queries frequentes
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_tenant_status_role ON users(tenant_id, status, role)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_email_status ON users(email, status)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_sessions_user_active_expires ON user_sessions(user_id, is_active, expires_at)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_activity_tenant_action_created ON activity_logs(tenant_id, action, created_at DESC)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_activity_user_created_desc ON activity_logs(user_id, created_at DESC)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_user_permissions_user_permission ON user_permissions(user_id, permission_id)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_tokens_user_type_expires ON user_tokens(user_id, token_type, expires_at)');

  // ====================================================================
  // 2. ÍNDICES PARCIAIS PARA ECONOMIA DE ESPAÇO
  // ====================================================================

  await knex.raw("CREATE INDEX IF NOT EXISTS idx_users_active_email ON users(email) WHERE status = 'ativo'");
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_sessions_active_user ON user_sessions(user_id) WHERE is_active = TRUE');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_tokens_unused ON user_tokens(user_id, token_type) WHERE used_at IS NULL');
  await knex.raw("CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(tenant_code, nome) WHERE status = 'ativo'");

  // ====================================================================
  // 3. TABELAS DE AUDITORIA OTIMIZADAS
  // ====================================================================

  // Tabela de auditoria para mudanças críticas
  await knex.schema.createTable('audit_trail', (table) => {
    table.increments('id').primary();
    table.string('table_name').notNullable();
    table.string('record_id').notNullable();
    table.string('operation').notNullable().checkIn(['INSERT', 'UPDATE', 'DELETE']);
    table.text('old_values'); // JSON
    table.text('new_values'); // JSON
    table.string('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('ip_address');
    table.bigInteger('created_at').notNullable().defaultTo(knex.raw('(unixepoch() * 1000)'));
  });

  // Índices para audit_trail
  await knex.schema.alterTable('audit_trail', (table) => {
    table.index(['table_name', 'record_id'], 'idx_audit_table_record');
    table.index(['user_id', 'created_at'], 'idx_audit_user_created');
    table.index(['created_at'], 'idx_audit_created_desc');
  });

  // ====================================================================
  // 4. TABELA DE RATE LIMITING OTIMIZADA
  // ====================================================================

  // Remover tabela antiga se existir
  await knex.raw('DROP TABLE IF EXISTS rate_limits_old');

  // Criar tabela otimizada de rate limiting
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS rate_limits_optimized (
      key TEXT PRIMARY KEY,
      hits INTEGER NOT NULL DEFAULT 0,
      window_start INTEGER NOT NULL,
      window_ms INTEGER NOT NULL,
      max_hits INTEGER NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    ) WITHOUT ROWID
  `);

  // Índices para rate limiting
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits_optimized(window_start)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_rate_limits_updated_at ON rate_limits_optimized(updated_at)');

  // ====================================================================
  // 5. TABELAS DE CACHE PARA PERFORMANCE
  // ====================================================================

  // Cache de permissões de usuário
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS user_permissions_cache (
      user_id TEXT NOT NULL,
      permissions TEXT NOT NULL,
      role TEXT NOT NULL,
      tenant_id TEXT,
      last_updated INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      PRIMARY KEY (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) WITHOUT ROWID
  `);

  await knex.raw('CREATE INDEX IF NOT EXISTS idx_permissions_cache_updated ON user_permissions_cache(last_updated)');

  // Cache de estatísticas por tenant
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS tenant_stats_cache (
      tenant_id TEXT PRIMARY KEY,
      user_count INTEGER DEFAULT 0,
      active_users INTEGER DEFAULT 0,
      last_activity INTEGER,
      total_actions INTEGER DEFAULT 0,
      last_calculated INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    ) WITHOUT ROWID
  `);

  // ====================================================================
  // 6. TRIGGERS PARA CACHE E AUDITORIA
  // ====================================================================

  // Trigger para invalidar cache de permissões
  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS invalidate_user_permissions_cache
      AFTER UPDATE OF role, status ON users
      FOR EACH ROW
    BEGIN
      DELETE FROM user_permissions_cache WHERE user_id = NEW.id;
    END;
  `);

  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS invalidate_permissions_cache_on_change
      AFTER INSERT ON user_permissions
      FOR EACH ROW
    BEGIN
      DELETE FROM user_permissions_cache WHERE user_id = NEW.user_id;
    END;
  `);

  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS invalidate_permissions_cache_on_delete
      AFTER DELETE ON user_permissions
      FOR EACH ROW
    BEGIN
      DELETE FROM user_permissions_cache WHERE user_id = OLD.user_id;
    END;
  `);

  // Trigger para auditoria de mudanças em users
  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS audit_users_changes
      AFTER UPDATE ON users
      FOR EACH ROW
      WHEN OLD.role != NEW.role 
        OR OLD.status != NEW.status 
        OR OLD.tenant_id != NEW.tenant_id
    BEGIN
      INSERT INTO audit_trail (
        table_name, record_id, operation, 
        old_values, new_values, user_id, created_at
      ) VALUES (
        'users', NEW.id, 'UPDATE',
        json_object(
          'role', OLD.role,
          'status', OLD.status,
          'tenant_id', OLD.tenant_id
        ),
        json_object(
          'role', NEW.role,
          'status', NEW.status,
          'tenant_id', NEW.tenant_id
        ),
        NEW.id,
        unixepoch() * 1000
      );
    END;
  `);

  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS audit_users_insert
      AFTER INSERT ON users
      FOR EACH ROW
    BEGIN
      INSERT INTO audit_trail (
        table_name, record_id, operation, 
        new_values, user_id, created_at
      ) VALUES (
        'users', NEW.id, 'INSERT',
        json_object(
          'nome_completo', NEW.nome_completo,
          'email', NEW.email,
          'role', NEW.role,
          'status', NEW.status,
          'tenant_id', NEW.tenant_id
        ),
        NEW.id,
        unixepoch() * 1000
      );
    END;
  `);

  // Trigger para atualizar estatísticas de tenant
  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS update_tenant_stats_on_user_change
      AFTER INSERT ON users
      FOR EACH ROW
      WHEN NEW.tenant_id IS NOT NULL
    BEGIN
      INSERT OR REPLACE INTO tenant_stats_cache (
        tenant_id, user_count, active_users, last_calculated
      ) 
      SELECT 
        NEW.tenant_id,
        (SELECT COUNT(*) FROM users WHERE tenant_id = NEW.tenant_id),
        (SELECT COUNT(*) FROM users WHERE tenant_id = NEW.tenant_id AND status = 'ativo'),
        unixepoch() * 1000;
    END;
  `);

  // ====================================================================
  // 7. CONFIGURAÇÕES DE MANUTENÇÃO
  // ====================================================================

  const maintenanceConfigs = [
    { key: 'maintenance_last_vacuum', value: '0', description: 'Timestamp do último VACUUM executado' },
    { key: 'maintenance_last_analyze', value: '0', description: 'Timestamp do último ANALYZE executado' },
    { key: 'maintenance_last_checkpoint', value: '0', description: 'Timestamp do último checkpoint WAL' },
    { key: 'maintenance_vacuum_threshold', value: '0.25', description: 'Threshold de fragmentação para VACUUM automático' },
    { key: 'cache_permissions_ttl', value: '3600000', description: 'TTL do cache de permissões em ms (1 hora)' },
    { key: 'cache_stats_ttl', value: '300000', description: 'TTL do cache de estatísticas em ms (5 minutos)' },
    { key: 'audit_retention_days', value: '90', description: 'Dias de retenção para audit_trail' },
    { key: 'rate_limit_cleanup_hours', value: '24', description: 'Horas para limpeza de rate_limits' },
    { key: 'schema_version', value: 'A03', description: 'Versão atual do schema com otimizações de performance' },
    { key: 'migration_A03_applied_at', value: Date.now().toString(), description: 'Timestamp da aplicação da migração A03' },
    { key: 'performance_optimizations_installed', value: 'TRUE', description: 'Otimizações de performance instaladas' }
  ];

  for (const config of maintenanceConfigs) {
    await knex('system_config')
      .insert(config)
      .onConflict('key')
      .merge();
  }

  console.log('✅ A03: Otimizações de performance aplicadas com sucesso');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log('🔄 Fazendo rollback A03: Otimização de Performance...');
  
  // Remover triggers
  await knex.raw('DROP TRIGGER IF EXISTS invalidate_user_permissions_cache');
  await knex.raw('DROP TRIGGER IF EXISTS invalidate_permissions_cache_on_change');
  await knex.raw('DROP TRIGGER IF EXISTS invalidate_permissions_cache_on_delete');
  await knex.raw('DROP TRIGGER IF EXISTS audit_users_changes');
  await knex.raw('DROP TRIGGER IF EXISTS audit_users_insert');
  await knex.raw('DROP TRIGGER IF EXISTS update_tenant_stats_on_user_change');
  
  // Remover tabelas de cache e auditoria
  await knex.schema.dropTableIfExists('tenant_stats_cache');
  await knex.schema.dropTableIfExists('user_permissions_cache');
  await knex.schema.dropTableIfExists('rate_limits_optimized');
  await knex.schema.dropTableIfExists('audit_trail');
  
  // Remover índices (SQLite remove automaticamente quando a tabela é removida)
  // Mas remover os índices adicionais nas tabelas existentes
  await knex.raw('DROP INDEX IF EXISTS idx_users_tenant_status_role');
  await knex.raw('DROP INDEX IF EXISTS idx_users_email_status');
  await knex.raw('DROP INDEX IF EXISTS idx_sessions_user_active_expires');
  await knex.raw('DROP INDEX IF EXISTS idx_activity_tenant_action_created');
  await knex.raw('DROP INDEX IF EXISTS idx_activity_user_created_desc');
  await knex.raw('DROP INDEX IF EXISTS idx_permissions_resource_action');
  await knex.raw('DROP INDEX IF EXISTS idx_user_permissions_user_permission');
  await knex.raw('DROP INDEX IF EXISTS idx_tokens_user_type_expires');
  await knex.raw('DROP INDEX IF EXISTS idx_users_active_email');
  await knex.raw('DROP INDEX IF EXISTS idx_sessions_active_user');
  await knex.raw('DROP INDEX IF EXISTS idx_tokens_unused');
  await knex.raw('DROP INDEX IF EXISTS idx_tenants_active');
  
  // Remover configurações
  await knex('system_config')
    .whereIn('key', [
      'maintenance_last_vacuum', 'maintenance_last_analyze', 'maintenance_last_checkpoint',
      'maintenance_vacuum_threshold', 'cache_permissions_ttl', 'cache_stats_ttl',
      'audit_retention_days', 'rate_limit_cleanup_hours', 'migration_A03_applied_at',
      'performance_optimizations_installed'
    ])
    .del();
  
  // Reverter schema_version
  await knex('system_config')
    .where('key', 'schema_version')
    .update({ value: 'A02' });
  
  console.log('✅ Rollback A03 concluído');
};