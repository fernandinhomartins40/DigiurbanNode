// ====================================================================
// 📦 MIGRAÇÃO A02: SISTEMA HIERÁRQUICO DE ROLES
// ====================================================================
// Sistema hierárquico com 6 níveis de acesso
// guest -> user -> coordinator -> manager -> admin -> super_admin
// ====================================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log('🚀 Executando A02: Sistema Hierárquico de Roles...');

  // Criar tabela de níveis hierárquicos para consulta
  await knex.schema.createTable('role_hierarchy', (table) => {
    table.string('role').primary();
    table.integer('level').notNullable();
    table.string('name').notNullable();
    table.string('description').notNullable();
  });

  // Inserir dados da hierarquia
  const roleHierarchy = [
    {
      role: 'guest',
      level: 0,
      name: 'Visitante',
      description: 'Cidadão com acesso público aos serviços municipais'
    },
    {
      role: 'user',
      level: 1,
      name: 'Funcionário',
      description: 'Atendente/Funcionário com operações básicas'
    },
    {
      role: 'coordinator',
      level: 2,
      name: 'Coordenador',
      description: 'Coordenador de equipes e supervisor de operações'
    },
    {
      role: 'manager',
      level: 3,
      name: 'Gestor de Secretaria',
      description: 'Secretário/Diretor com gestão completa da secretaria'
    },
    {
      role: 'admin',
      level: 4,
      name: 'Administrador Municipal',
      description: 'Prefeito/Vice-Prefeito com gestão municipal completa'
    },
    {
      role: 'super_admin',
      level: 5,
      name: 'Super Administrador',
      description: 'Desenvolvedor/Suporte com acesso sistêmico total'
    }
  ];

  await knex('role_hierarchy').insert(roleHierarchy);

  // Criar índices para otimização
  await knex.schema.alterTable('role_hierarchy', (table) => {
    table.index(['level'], 'idx_role_hierarchy_level');
  });

  // Atualizar usuários existentes se necessário (preservar dados atuais)
  // Não alterar usuários que já têm roles válidos
  await knex('users')
    .whereNotIn('role', ['guest', 'user', 'coordinator', 'manager', 'admin', 'super_admin'])
    .update({ role: 'user' });

  // Registrar migração no sistema
  const configData = [
    {
      key: 'schema_version',
      value: 'A02',
      description: 'Versão atual do schema com hierarquia de roles'
    },
    {
      key: 'migration_A02_applied_at',
      value: Date.now().toString(),
      description: 'Timestamp da aplicação da migração A02'
    },
    {
      key: 'role_hierarchy_installed',
      value: 'TRUE',
      description: 'Sistema de hierarquia de roles instalado'
    }
  ];

  for (const config of configData) {
    await knex('system_config')
      .insert(config)
      .onConflict('key')
      .merge();
  }

  console.log('✅ A02: Sistema de hierarquia de roles criado com sucesso');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log('🔄 Fazendo rollback A02: Sistema Hierárquico de Roles...');
  
  // Remover configurações do sistema
  await knex('system_config')
    .whereIn('key', ['schema_version', 'migration_A02_applied_at', 'role_hierarchy_installed'])
    .del();

  // Reverter roles dos usuários para o padrão
  await knex('users')
    .whereIn('role', ['coordinator', 'manager'])
    .update({ role: 'user' });

  // Remover tabela de hierarquia
  await knex.schema.dropTableIfExists('role_hierarchy');
  
  console.log('✅ Rollback A02 concluído');
};