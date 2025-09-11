// ====================================================================
// 📧 MIGRAÇÃO A05: SISTEMA DE LOGS DE E-MAIL
// ====================================================================
// Adiciona tabela para controle de envio de e-mails transacionais
// Inclui rate limiting, templates e logs de atividade de e-mail
// ====================================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log('🚀 Executando A05: Sistema de Logs de E-mail...');

  // ====================================================================
  // 1. TABELA DE LOGS DE E-MAIL
  // ====================================================================

  await knex.schema.createTable('email_logs', (table) => {
    table.increments('id').primary();
    
    // Informações básicas do e-mail
    table.string('to_email').notNullable();
    table.string('from_email');
    table.string('subject').notNullable();
    table.string('template'); // nome do template usado
    
    // Status e controle
    table.string('status').notNullable().defaultTo('queued').checkIn(['sent', 'failed', 'queued']);
    table.string('message_id'); // ID retornado pelo provedor (Resend)
    
    // Informações de erro
    table.text('error_message');
    table.integer('retry_count').notNullable().defaultTo(0);
    
    // Metadados
    table.text('details'); // JSON com dados extras
    
    // Relacionamentos opcionais
    table.string('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('tenant_id').references('id').inTable('tenants').onDelete('SET NULL');
    
    // Timestamps
    table.bigInteger('created_at').notNullable().defaultTo(knex.raw('(unixepoch() * 1000)'));
    table.bigInteger('sent_at'); // quando foi efetivamente enviado
  });

  // ====================================================================
  // 2. ÍNDICES PARA PERFORMANCE
  // ====================================================================

  await knex.schema.alterTable('email_logs', (table) => {
    table.index(['to_email', 'created_at'], 'idx_email_logs_recipient_date');
    table.index(['status', 'created_at'], 'idx_email_logs_status');
    table.index(['template', 'created_at'], 'idx_email_logs_template');
    table.index(['user_id', 'created_at'], 'idx_email_logs_user');
    table.index(['tenant_id', 'created_at'], 'idx_email_logs_tenant');
  });

  // ====================================================================
  // 3. TABELA DE TOKENS DE RECUPERAÇÃO DE SENHA
  // ====================================================================

  await knex.schema.createTable('password_reset_tokens', (table) => {
    table.increments('id').primary();
    table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token').notNullable().unique();
    table.bigInteger('expires_at').notNullable();
    table.bigInteger('used_at');
    table.bigInteger('created_at').notNullable().defaultTo(knex.raw('(unixepoch() * 1000)'));
    
    // Metadados de segurança
    table.string('ip_address');
    table.string('user_agent');
  });

  await knex.schema.alterTable('password_reset_tokens', (table) => {
    table.index(['token'], 'idx_password_reset_tokens_token');
    table.index(['expires_at'], 'idx_password_reset_tokens_expires');
    table.index(['user_id', 'created_at'], 'idx_password_reset_tokens_user');
  });

  // ====================================================================
  // 4. TABELA DE TOKENS DE VERIFICAÇÃO DE E-MAIL
  // ====================================================================

  await knex.schema.createTable('email_verification_tokens', (table) => {
    table.increments('id').primary();
    table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token').notNullable().unique();
    table.bigInteger('expires_at').notNullable();
    table.bigInteger('verified_at');
    table.bigInteger('created_at').notNullable().defaultTo(knex.raw('(unixepoch() * 1000)'));
    
    // Metadados de segurança
    table.string('ip_address');
    table.string('user_agent');
  });

  await knex.schema.alterTable('email_verification_tokens', (table) => {
    table.index(['token'], 'idx_email_verification_tokens_token');
    table.index(['expires_at'], 'idx_email_verification_tokens_expires');
    table.index(['user_id', 'created_at'], 'idx_email_verification_tokens_user');
  });

  // ====================================================================
  // 5. TRIGGERS PARA LIMPEZA AUTOMÁTICA
  // ====================================================================

  // Trigger para limpar tokens de recuperação expirados
  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS cleanup_expired_password_tokens
      AFTER INSERT ON password_reset_tokens
      FOR EACH ROW
      WHEN (unixepoch() * 1000) % 3600000 < 1000
    BEGIN
      DELETE FROM password_reset_tokens 
      WHERE expires_at < (unixepoch() * 1000);
    END;
  `);

  // Trigger para limpar tokens de verificação expirados
  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS cleanup_expired_verification_tokens
      AFTER INSERT ON email_verification_tokens
      FOR EACH ROW
      WHEN (unixepoch() * 1000) % 3600000 < 1000
    BEGIN
      DELETE FROM email_verification_tokens 
      WHERE expires_at < (unixepoch() * 1000);
    END;
  `);

  // Trigger para limpar logs antigos de e-mail (90 dias)
  await knex.raw(`
    CREATE TRIGGER IF NOT EXISTS cleanup_old_email_logs
      AFTER INSERT ON email_logs
      FOR EACH ROW
      WHEN (unixepoch() * 1000) % 86400000 < 1000
    BEGIN
      DELETE FROM email_logs 
      WHERE created_at < (unixepoch() * 1000 - 7776000000);
    END;
  `);

  // ====================================================================
  // 6. VIEW PARA ESTATÍSTICAS DE E-MAIL
  // ====================================================================

  await knex.raw(`
    CREATE VIEW email_stats AS
    SELECT 
      'emails_sent_today' as metric,
      COUNT(*) as value
    FROM email_logs 
    WHERE status = 'sent' 
    AND sent_at > (unixepoch() * 1000 - 86400000)
    
    UNION ALL
    
    SELECT 
      'emails_failed_today' as metric,
      COUNT(*) as value
    FROM email_logs 
    WHERE status = 'failed' 
    AND created_at > (unixepoch() * 1000 - 86400000)
    
    UNION ALL
    
    SELECT 
      'emails_queued' as metric,
      COUNT(*) as value
    FROM email_logs 
    WHERE status = 'queued'
    
    UNION ALL
    
    SELECT 
      'password_resets_pending' as metric,
      COUNT(*) as value
    FROM password_reset_tokens 
    WHERE used_at IS NULL 
    AND expires_at > (unixepoch() * 1000)
    
    UNION ALL
    
    SELECT 
      'email_verifications_pending' as metric,
      COUNT(*) as value
    FROM email_verification_tokens 
    WHERE verified_at IS NULL 
    AND expires_at > (unixepoch() * 1000)
  `);

  // ====================================================================
  // 7. CONFIGURAÇÕES DO SISTEMA DE E-MAIL
  // ====================================================================

  const emailConfigs = [
    { key: 'email_service_enabled', value: 'false', description: 'Se o serviço de e-mail está habilitado' },
    { key: 'email_rate_limit_per_hour', value: '100', description: 'Limite de e-mails por destinatário por hora' },
    { key: 'email_rate_limit_per_day', value: '1000', description: 'Limite de e-mails por destinatário por dia' },
    { key: 'email_retry_max_attempts', value: '3', description: 'Número máximo de tentativas de reenvio' },
    { key: 'email_retry_delay_ms', value: '1000', description: 'Delay entre tentativas em milissegundos' },
    { key: 'password_reset_token_lifetime', value: '3600000', description: 'Tempo de vida do token de recuperação (1 hora em ms)' },
    { key: 'email_verification_token_lifetime', value: '86400000', description: 'Tempo de vida do token de verificação (24 horas em ms)' },
    { key: 'schema_version', value: 'A05', description: 'Versão atual do schema com sistema de e-mail' },
    { key: 'migration_A05_applied_at', value: Date.now().toString(), description: 'Timestamp da aplicação da migração A05' },
    { key: 'email_system_installed', value: 'TRUE', description: 'Sistema de e-mail transacional instalado' },
    { 
      key: 'migration_A05_changelog', 
      value: 'Adicionado sistema completo de e-mail: logs, tokens de recuperação/verificação, configurações e limpeza automática', 
      description: 'Log de mudanças da migração A05'
    }
  ];

  for (const config of emailConfigs) {
    await knex('system_config')
      .insert(config)
      .onConflict('key')
      .merge();
  }

  console.log('✅ A05: Sistema de e-mail criado com sucesso');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log('🔄 Fazendo rollback A05: Sistema de Logs de E-mail...');
  
  // Remover triggers
  await knex.raw('DROP TRIGGER IF EXISTS cleanup_expired_password_tokens');
  await knex.raw('DROP TRIGGER IF EXISTS cleanup_expired_verification_tokens');
  await knex.raw('DROP TRIGGER IF EXISTS cleanup_old_email_logs');
  
  // Remover view
  await knex.raw('DROP VIEW IF EXISTS email_stats');
  
  // Remover tabelas
  await knex.schema.dropTableIfExists('email_verification_tokens');
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('email_logs');
  
  // Remover configurações
  await knex('system_config')
    .whereIn('key', [
      'email_service_enabled', 'email_rate_limit_per_hour', 'email_rate_limit_per_day',
      'email_retry_max_attempts', 'email_retry_delay_ms', 'password_reset_token_lifetime',
      'email_verification_token_lifetime', 'migration_A05_applied_at', 'email_system_installed',
      'migration_A05_changelog'
    ])
    .del();
  
  // Reverter schema_version
  await knex('system_config')
    .where('key', 'schema_version')
    .update({ value: 'A04' });
  
  console.log('✅ Rollback A05 concluído');
};