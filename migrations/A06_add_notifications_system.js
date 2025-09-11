// ====================================================================
// 📦 MIGRAÇÃO A06: SISTEMA DE NOTIFICAÇÕES 
// ====================================================================
// Primeira migration usando Knex.js Query Builder
// Demonstração da nova abordagem com rollback nativo
// ====================================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log('🚀 Executando A06: Sistema de Notificações...');
  
  // Criar tabela de notificações
  await knex.schema.createTable('notifications', (table) => {
    table.string('id').primary();
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('message');
    table.string('type').defaultTo('info').checkIn(['info', 'warning', 'error', 'success']);
    table.string('priority').defaultTo('normal').checkIn(['low', 'normal', 'high', 'urgent']);
    table.boolean('read').defaultTo(false);
    table.timestamp('read_at');
    table.json('metadata'); // Para dados extras como URLs, IDs relacionados, etc.
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Índices para performance
    table.index(['user_id', 'read']);
    table.index(['tenant_id', 'created_at']);
    table.index(['type', 'priority']);
  });

  // Criar tabela de templates de notificação
  await knex.schema.createTable('notification_templates', (table) => {
    table.string('id').primary();
    table.string('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('code').notNullable(); // Como 'user_created', 'password_reset', etc.
    table.string('name').notNullable();
    table.text('title_template').notNullable();
    table.text('message_template').notNullable();
    table.string('type').defaultTo('info').checkIn(['info', 'warning', 'error', 'success']);
    table.string('priority').defaultTo('normal').checkIn(['low', 'normal', 'high', 'urgent']);
    table.boolean('active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Garantir código único por tenant
    table.unique(['tenant_id', 'code']);
    table.index(['tenant_id', 'active']);
  });

  // Criar tabela de configurações de notificação por usuário
  await knex.schema.createTable('user_notification_settings', (table) => {
    table.string('id').primary();
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('notification_type').notNullable();
    table.boolean('email_enabled').defaultTo(true);
    table.boolean('push_enabled').defaultTo(true);
    table.boolean('in_app_enabled').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Garantir configuração única por usuário/tipo
    table.unique(['user_id', 'notification_type']);
    table.index(['user_id']);
  });

  // Inserir templates padrão
  const defaultTemplates = [
    {
      id: 'tpl_user_created',
      tenant_id: null, // Template global
      code: 'user_created',
      name: 'Usuário Criado',
      title_template: 'Bem-vindo ao DigiUrban!',
      message_template: 'Olá {{nome}}, sua conta foi criada com sucesso. Acesse o sistema e configure sua senha.',
      type: 'success',
      priority: 'normal'
    },
    {
      id: 'tpl_password_reset',
      tenant_id: null,
      code: 'password_reset',
      name: 'Reset de Senha',
      title_template: 'Solicitação de Reset de Senha',
      message_template: 'Uma solicitação de reset de senha foi feita para sua conta. Use o link enviado por email.',
      type: 'warning',
      priority: 'high'
    },
    {
      id: 'tpl_user_login_failed',
      tenant_id: null,
      code: 'user_login_failed',
      name: 'Tentativa de Login Falhada',
      title_template: 'Tentativa de acesso negada',
      message_template: 'Houve uma tentativa de acesso à sua conta em {{timestamp}}. Se não foi você, entre em contato conosco.',
      type: 'error',
      priority: 'high'
    }
  ];

  await knex('notification_templates').insert(defaultTemplates);

  console.log('✅ A06: Sistema de Notificações criado com sucesso');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log('🔄 Fazendo rollback A06: Sistema de Notificações...');
  
  // Remover tabelas na ordem inversa (por causa das foreign keys)
  await knex.schema.dropTableIfExists('user_notification_settings');
  await knex.schema.dropTableIfExists('notification_templates');
  await knex.schema.dropTableIfExists('notifications');
  
  console.log('✅ Rollback A06 concluído');
};