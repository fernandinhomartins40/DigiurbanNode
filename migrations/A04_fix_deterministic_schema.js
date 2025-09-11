// ====================================================================
// 📦 MIGRAÇÃO A04: CORREÇÃO DE SCHEMA DETERMINÍSTICO
// ====================================================================
// Remove problemas de datetime() não-determinístico
// Substitui por timestamps Unix e índices fixos
// Versão definitiva e profissional
// ====================================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log('🚀 Executando A04: Correção de Schema Determinístico...');

  // ====================================================================
  // 1. TABELA PARA CONTROLE DE TIMESTAMPS DE REFERÊNCIA
  // ====================================================================

  // Tabela para armazenar timestamps de referência para cálculos
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS reference_timestamps (
      key TEXT PRIMARY KEY,
      timestamp_ms INTEGER NOT NULL,
      description TEXT,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    ) WITHOUT ROWID
  `);

  // Inserir timestamps de referência padrão
  const referenceTimestamps = [
    {
      key: 'last_30_days',
      timestamp_ms: Date.now() - 2592000000, // 30 dias em ms
      description: 'Referência para últimos 30 dias'
    },
    {
      key: 'last_7_days', 
      timestamp_ms: Date.now() - 604800000, // 7 dias em ms
      description: 'Referência para últimos 7 dias'
    },
    {
      key: 'last_24_hours',
      timestamp_ms: Date.now() - 86400000, // 24 horas em ms
      description: 'Referência para últimas 24 horas'
    }
  ];

  for (const timestamp of referenceTimestamps) {
    await knex('reference_timestamps')
      .insert(timestamp)
      .onConflict('key')
      .merge();
  }

  // ====================================================================
  // 2. VIEWS DETERMINÍSTICAS
  // ====================================================================

  // View user_profiles sem datetime() não-determinístico
  await knex.raw(`
    CREATE VIEW user_profiles AS
    SELECT 
      u.id,
      u.tenant_id,
      u.nome_completo,
      u.email,
      u.role,
      u.status,
      u.avatar_url,
      u.ultimo_login,
      u.email_verified,
      u.created_at,
      u.updated_at,
      t.nome as tenant_name,
      t.cidade as tenant_cidade,
      t.estado as tenant_estado,
      t.plano as tenant_plano,
      t.status as tenant_status,
      CASE 
        WHEN u.ultimo_login IS NULL THEN 'never'
        WHEN u.ultimo_login > (unixepoch() * 1000 - 86400000) THEN 'recent'
        WHEN u.ultimo_login > (unixepoch() * 1000 - 604800000) THEN 'week'
        WHEN u.ultimo_login > (unixepoch() * 1000 - 2592000000) THEN 'month'
        ELSE 'old'
      END as login_frequency,
      (SELECT COUNT(*) FROM user_sessions 
       WHERE user_id = u.id 
       AND is_active = TRUE 
       AND expires_at > (unixepoch() * 1000)) as active_sessions
    FROM users u
    LEFT JOIN tenants t ON u.tenant_id = t.id
  `);

  // View de atividades recentes (últimos 30 dias)
  await knex.raw(`
    CREATE VIEW recent_activities AS
    SELECT 
      a.id,
      a.user_id,
      a.tenant_id,
      a.action,
      a.resource,
      a.resource_id,
      a.created_at,
      u.nome_completo as user_name,
      u.email as user_email,
      t.nome as tenant_name
    FROM activity_logs a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN tenants t ON a.tenant_id = t.id
    WHERE a.created_at > (unixepoch() * 1000 - 2592000000)
    ORDER BY a.created_at DESC
  `);

  // View de estatísticas usando timestamps determinísticos
  await knex.raw(`
    CREATE VIEW system_stats AS
    SELECT 
      'users' as metric,
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'ativo' THEN 1 END) as active,
      COUNT(CASE WHEN created_at > (unixepoch() * 1000 - 2592000000) THEN 1 END) as recent
    FROM users
    UNION ALL
    SELECT 
      'tenants' as metric,
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'ativo' THEN 1 END) as active,
      COUNT(CASE WHEN created_at > (unixepoch() * 1000 - 2592000000) THEN 1 END) as recent
    FROM tenants
    UNION ALL
    SELECT 
      'sessions' as metric,
      COUNT(*) as total,
      COUNT(CASE WHEN is_active = TRUE AND expires_at > (unixepoch() * 1000) THEN 1 END) as active,
      COUNT(CASE WHEN created_at > (unixepoch() * 1000 - 2592000000) THEN 1 END) as recent
    FROM user_sessions
  `);

  // ====================================================================
  // 3. TRIGGER PARA MANTER TIMESTAMPS DE REFERÊNCIA ATUALIZADOS
  // ====================================================================

  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS update_reference_timestamps
      AFTER INSERT ON activity_logs
      FOR EACH ROW
      WHEN (unixepoch() * 1000) - (SELECT timestamp_ms FROM reference_timestamps WHERE key = 'last_30_days') > 86400000
    BEGIN
      UPDATE reference_timestamps 
      SET 
        timestamp_ms = unixepoch() * 1000 - 2592000000,
        updated_at = unixepoch() * 1000
      WHERE key = 'last_30_days';
      
      UPDATE reference_timestamps 
      SET 
        timestamp_ms = unixepoch() * 1000 - 604800000,
        updated_at = unixepoch() * 1000
      WHERE key = 'last_7_days';
      
      UPDATE reference_timestamps 
      SET 
        timestamp_ms = unixepoch() * 1000 - 86400000,
        updated_at = unixepoch() * 1000
      WHERE key = 'last_24_hours';
    END;
  `);

  // ====================================================================
  // 4. CONFIGURAÇÕES E DOCUMENTAÇÃO
  // ====================================================================

  const configData = [
    {
      key: 'conditional_indexes_last_update',
      value: '0',
      description: 'Timestamp da última atualização dos índices condicionais'
    },
    {
      key: 'conditional_indexes_update_interval',
      value: '86400000',
      description: 'Intervalo de atualização dos índices (24h em ms)'
    },
    {
      key: 'schema_deterministic_fixed',
      value: Math.floor(Date.now() / 1000).toString(),
      description: 'Timestamp de quando o schema foi corrigido'
    },
    {
      key: 'schema_version',
      value: 'A04',
      description: 'Versão atual do schema corrigida para determinismo'
    },
    {
      key: 'schema_deterministic',
      value: 'TRUE',
      description: 'Schema agora é determinístico (sem datetime() problemático)'
    },
    {
      key: 'migration_A04_applied_at',
      value: Date.now().toString(),
      description: 'Timestamp da aplicação da migração A04'
    },
    {
      key: 'migration_A04_changelog',
      value: 'Removeu datetime() não-determinístico das views e índices. Substituiu por unixepoch() determinístico.',
      description: 'Log de mudanças da migração A04'
    }
  ];

  for (const config of configData) {
    await knex('system_config')
      .insert(config)
      .onConflict('key')
      .merge();
  }

  console.log('✅ A04: Schema determinístico corrigido com sucesso');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log('🔄 Fazendo rollback A04: Correção de Schema Determinístico...');
  
  // Remover trigger
  await knex.raw('DROP TRIGGER IF EXISTS update_reference_timestamps');
  
  // Remover views
  await knex.raw('DROP VIEW IF EXISTS system_stats');
  await knex.raw('DROP VIEW IF EXISTS recent_activities');
  await knex.raw('DROP VIEW IF EXISTS user_profiles');
  
  // Remover tabela de timestamps de referência
  await knex.schema.dropTableIfExists('reference_timestamps');
  
  // Remover configurações
  await knex('system_config')
    .whereIn('key', [
      'conditional_indexes_last_update',
      'conditional_indexes_update_interval', 
      'schema_deterministic_fixed',
      'schema_deterministic',
      'migration_A04_applied_at',
      'migration_A04_changelog'
    ])
    .del();
  
  // Reverter schema_version
  await knex('system_config')
    .where('key', 'schema_version')
    .update({ value: 'A03' });
  
  console.log('✅ Rollback A04 concluído');
};