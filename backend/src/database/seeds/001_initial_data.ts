// ====================================================================
// 🌱 SEEDS - DADOS INICIAIS DIGIURBAN AUTH SYSTEM
// ====================================================================
// Popula o banco com dados essenciais para funcionamento
// Permissões, usuário super admin e configurações padrão
// ====================================================================

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma.js';
import { PermissionModel } from '../../models/Permission.js';

// ====================================================================
// SEEDS PRINCIPAL
// ====================================================================

export const seed001InitialData = async (): Promise<void> => {
  console.log('🌱 Executando seed: Dados iniciais...');

  try {
    // 1. Limpar dados existentes (para re-seed)
    await clearExistingData();

    // 2. Inserir permissões padrão
    await seedPermissions();

    // 3. Inserir usuário super admin
    await seedSuperAdmin();

    // 4. Inserir tenant padrão para desenvolvimento
    await seedDefaultTenant();

    // 5. Inserir configurações do sistema
    await seedSystemConfig();

    console.log('✅ Seed 001 executado com sucesso');

  } catch (error) {
    console.error('❌ Erro no seed 001:', error);
    throw error;
  }
};

// ====================================================================
// LIMPEZA DE DADOS EXISTENTES
// ====================================================================

const clearExistingData = async (): Promise<void> => {
  console.log('🧹 Limpando dados existentes...');

  // Deletar em ordem para respeitar foreign keys
  await execute('DELETE FROM user_permissions');
  await execute('DELETE FROM user_sessions');
  await execute('DELETE FROM user_tokens');
  await execute('DELETE FROM activity_logs');
  await execute('DELETE FROM users');
  await execute('DELETE FROM permissions');
  await execute('DELETE FROM tenants');
  await execute('DELETE FROM system_config');

  console.log('✅ Dados limpos');
};

// ====================================================================
// SEED DE PERMISSÕES
// ====================================================================

const seedPermissions = async (): Promise<void> => {
  console.log('🔐 Inserindo permissões padrão...');

  const permissions = [
    // Permissões públicas
    { code: 'read_public', resource: 'public', action: 'read', description: 'Acessar conteúdo público' },
    { code: 'create_protocol', resource: 'protocols', action: 'create', description: 'Criar protocolos' },
    { code: 'read_own_protocols', resource: 'protocols', action: 'read_own', description: 'Ver próprios protocolos' },

    // Permissões de usuário básico
    { code: 'read_own', resource: 'user_data', action: 'read', description: 'Ler próprios dados' },
    { code: 'update_own', resource: 'user_data', action: 'update', description: 'Atualizar próprios dados' },
    { code: 'manage_protocols', resource: 'protocols', action: 'manage', description: 'Gerenciar protocolos' },
    { code: 'read_department_data', resource: 'department', action: 'read', description: 'Ler dados do departamento' },

    // Permissões de coordenador
    { code: 'manage_team', resource: 'team', action: 'manage', description: 'Gerenciar equipe' },
    { code: 'view_reports', resource: 'reports', action: 'read', description: 'Ver relatórios' },
    { code: 'manage_department_protocols', resource: 'department_protocols', action: 'manage', description: 'Gerenciar protocolos do departamento' },

    // Permissões de gestor
    { code: 'manage_department', resource: 'department', action: 'manage', description: 'Gerenciar departamento' },
    { code: 'manage_reports', resource: 'reports', action: 'manage', description: 'Gerenciar relatórios' },
    { code: 'manage_department_users', resource: 'department_users', action: 'manage', description: 'Gerenciar usuários do departamento' },
    { code: 'approve_protocols', resource: 'protocols', action: 'approve', description: 'Aprovar protocolos' },

    // Permissões de admin
    { code: 'manage_tenant', resource: 'tenant', action: 'manage', description: 'Gerenciar tenant' },
    { code: 'manage_users', resource: 'users', action: 'manage', description: 'Gerenciar usuários' },
    { code: 'manage_all_departments', resource: 'departments', action: 'manage', description: 'Gerenciar todos departamentos' },
    { code: 'manage_municipal_config', resource: 'municipal_config', action: 'manage', description: 'Gerenciar configurações municipais' },
    { code: 'view_all_reports', resource: 'reports', action: 'read_all', description: 'Ver todos os relatórios' },

    // Permissões de super admin
    { code: 'all', resource: 'system', action: 'all', description: 'Acesso total ao sistema' },
    { code: 'manage_tenants', resource: 'tenants', action: 'manage', description: 'Gerenciar tenants' },
    { code: 'system_diagnostics', resource: 'diagnostics', action: 'manage', description: 'Diagnósticos do sistema' },
    { code: 'database_access', resource: 'database', action: 'manage', description: 'Acesso ao banco de dados' },
    { code: 'system_config', resource: 'system_config', action: 'manage', description: 'Gerenciar configurações do sistema' },

    // Permissões adicionais
    { code: 'export_data', resource: 'data', action: 'export', description: 'Exportar dados' },
    { code: 'import_data', resource: 'data', action: 'import', description: 'Importar dados' },
    { code: 'backup_system', resource: 'system', action: 'backup', description: 'Fazer backup do sistema' },
    { code: 'restore_system', resource: 'system', action: 'restore', description: 'Restaurar backup do sistema' },
    { code: 'view_audit_logs', resource: 'audit', action: 'read', description: 'Ver logs de auditoria' },
    { code: 'manage_integrations', resource: 'integrations', action: 'manage', description: 'Gerenciar integrações' }
  ];

  for (const permission of permissions) {
    await execute(
      'INSERT OR IGNORE INTO permissions (code, resource, action, description) VALUES (?, ?, ?, ?)',
      [permission.code, permission.resource, permission.action, permission.description]
    );
  }

  console.log(`✅ ${permissions.length} permissões inseridas`);
};

// ====================================================================
// SEED DE SUPER ADMIN
// ====================================================================

const seedSuperAdmin = async (): Promise<void> => {
  console.log('👑 Criando usuário super admin...');

  const superAdminId = uuidv4();
  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@digiurban.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'DigiUrban@2025!';
  const passwordHash = await bcrypt.hash(password, 12);

  // Inserir super admin
  await execute(`
    INSERT OR REPLACE INTO users (
      id, tenant_id, nome_completo, email, password_hash, 
      role, status, email_verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    superAdminId,
    null, // Super admin não pertence a nenhum tenant
    'Super Administrator',
    email,
    passwordHash,
    'super_admin',
    'ativo',
    true
  ]);

  console.log(`✅ Super admin criado: ${email}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔑 Senha padrão: ${password}`);
  }

  // Conceder todas as permissões ao super admin
  const permissions = await query('SELECT id FROM permissions');
  
  for (const permission of permissions) {
    await execute(
      'INSERT OR IGNORE INTO user_permissions (user_id, permission_id) VALUES (?, ?)',
      [superAdminId, permission.id]
    );
  }

  console.log(`✅ ${permissions.length} permissões concedidas ao super admin`);
};

// ====================================================================
// SEED DE TENANT PADRÃO (DESENVOLVIMENTO)
// ====================================================================

const seedDefaultTenant = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    console.log('⏭️ Pulando tenant padrão (produção)');
    return;
  }

  console.log('🏛️ Criando tenant padrão para desenvolvimento...');

  const tenantId = uuidv4();
  const adminId = uuidv4();

  // Inserir tenant de desenvolvimento
  await execute(`
    INSERT OR REPLACE INTO tenants (
      id, tenant_code, nome, cidade, estado, cnpj, plano, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    tenantId,
    'DEV001',
    'Prefeitura de Desenvolvimento',
    'São Paulo',
    'SP',
    '12345678000195', // CNPJ válido fictício
    'premium',
    'ativo'
  ]);

  // Inserir admin do tenant
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  
  await execute(`
    INSERT OR REPLACE INTO users (
      id, tenant_id, nome_completo, email, password_hash, 
      role, status, email_verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    adminId,
    tenantId,
    'Admin Desenvolvimento',
    'admin@dev.digiurban.com',
    adminPasswordHash,
    'admin',
    'ativo',
    true
  ]);

  console.log('✅ Tenant de desenvolvimento criado');
  console.log('📧 Admin: admin@dev.digiurban.com / admin123');
};

// ====================================================================
// SEED DE CONFIGURAÇÕES DO SISTEMA
// ====================================================================

const seedSystemConfig = async (): Promise<void> => {
  console.log('⚙️ Inserindo configurações do sistema...');

  const configs = [
    // Configurações de autenticação
    { key: 'auth.password_min_length', value: '8', description: 'Comprimento mínimo da senha' },
    { key: 'auth.password_require_uppercase', value: 'true', description: 'Senha requer letra maiúscula' },
    { key: 'auth.password_require_lowercase', value: 'true', description: 'Senha requer letra minúscula' },
    { key: 'auth.password_require_numbers', value: 'true', description: 'Senha requer números' },
    { key: 'auth.password_require_special', value: 'false', description: 'Senha requer caracteres especiais' },
    { key: 'auth.max_login_attempts', value: '5', description: 'Máximo de tentativas de login' },
    { key: 'auth.lockout_duration', value: '900', description: 'Duração do bloqueio em segundos' },
    { key: 'auth.session_timeout', value: '86400', description: 'Timeout da sessão em segundos' },

    // Configurações do sistema
    { key: 'system.name', value: 'DigiUrban', description: 'Nome do sistema' },
    { key: 'system.version', value: '2.0.0', description: 'Versão do sistema' },
    { key: 'system.maintenance_mode', value: 'false', description: 'Modo de manutenção' },
    { key: 'system.allow_registration', value: 'true', description: 'Permitir auto-registro' },
    { key: 'system.email_verification_required', value: 'true', description: 'Verificação de email obrigatória' },

    // Configurações de email
    { key: 'email.enabled', value: 'false', description: 'Email habilitado' },
    { key: 'email.smtp_host', value: '', description: 'Servidor SMTP' },
    { key: 'email.smtp_port', value: '587', description: 'Porta SMTP' },
    { key: 'email.smtp_secure', value: 'true', description: 'SMTP seguro' },
    { key: 'email.from_name', value: 'DigiUrban System', description: 'Nome do remetente' },
    { key: 'email.from_address', value: 'noreply@digiurban.com', description: 'Email do remetente' },

    // Configurações de upload
    { key: 'upload.max_file_size', value: '10485760', description: 'Tamanho máximo de arquivo (bytes)' },
    { key: 'upload.allowed_types', value: 'jpg,jpeg,png,pdf,doc,docx,xls,xlsx', description: 'Tipos de arquivo permitidos' },

    // Configurações de log
    { key: 'log.level', value: 'info', description: 'Nível de log' },
    { key: 'log.retention_days', value: '30', description: 'Retenção de logs em dias' },

    // Configurações de backup
    { key: 'backup.enabled', value: 'true', description: 'Backup automático habilitado' },
    { key: 'backup.frequency', value: 'daily', description: 'Frequência de backup' },
    { key: 'backup.retention_days', value: '7', description: 'Retenção de backups em dias' }
  ];

  for (const config of configs) {
    await execute(
      'INSERT OR REPLACE INTO system_config (key, value, description) VALUES (?, ?, ?)',
      [config.key, config.value, config.description]
    );
  }

  console.log(`✅ ${configs.length} configurações inseridas`);
};

// ====================================================================
// SEED DE DADOS DE TESTE (APENAS DESENVOLVIMENTO)
// ====================================================================

export const seedTestData = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    console.log('⏭️ Pulando dados de teste (produção)');
    return;
  }

  console.log('🧪 Inserindo dados de teste...');

  // Criar usuários de teste
  const testUsers = [
    {
      nome: 'João Silva',
      email: 'joao@test.com',
      role: 'user',
      tenant_id: (await query('SELECT id FROM tenants WHERE tenant_code = ?', ['DEV001']))[0]?.id
    },
    {
      nome: 'Maria Santos',
      email: 'maria@test.com', 
      role: 'coordinator',
      tenant_id: (await query('SELECT id FROM tenants WHERE tenant_code = ?', ['DEV001']))[0]?.id
    },
    {
      nome: 'Carlos Oliveira',
      email: 'carlos@test.com',
      role: 'manager',
      tenant_id: (await query('SELECT id FROM tenants WHERE tenant_code = ?', ['DEV001']))[0]?.id
    }
  ];

  const passwordHash = await bcrypt.hash('test123', 12);

  for (const user of testUsers) {
    const userId = uuidv4();
    await execute(`
      INSERT OR REPLACE INTO users (
        id, tenant_id, nome_completo, email, password_hash, 
        role, status, email_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      user.tenant_id,
      user.nome,
      user.email,
      passwordHash,
      user.role,
      'ativo',
      true
    ]);
  }

  console.log(`✅ ${testUsers.length} usuários de teste criados`);
};

// ====================================================================
// FUNÇÃO PRINCIPAL
// ====================================================================

export const runInitialSeed = async (): Promise<void> => {
  console.log('🚀 Iniciando seeds de dados iniciais...');
  
  await seed001InitialData();
  
  // Dados de teste apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    await seedTestData();
  }
  
  console.log('🎉 Seeds executados com sucesso!');
};

// Executar se chamado diretamente
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  runInitialSeed()
    .then(() => {
      console.log('✅ Seeds finalizados');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro nos seeds:', error);
      process.exit(1);
    });
}

export default { seed001InitialData, seedTestData, runInitialSeed };