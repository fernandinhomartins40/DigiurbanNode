// ====================================================================
// 🌱 SEED INICIAL - ADMIN SUPER USER (KNEX COMPATIBLE)
// ====================================================================
// Criação segura de admin inicial via variáveis de ambiente
// ====================================================================

const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('🌱 Iniciando criação de admin inicial...');

  try {
    // Validar variáveis obrigatórias
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
    const adminName = process.env.INITIAL_ADMIN_NAME || 'Super Administrador';
    
    if (!adminEmail || !adminPassword) {
      console.log('⚠️ INITIAL_ADMIN_EMAIL ou INITIAL_ADMIN_PASSWORD não definidos');
      console.log('   Pulando criação de admin inicial...');
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      throw new Error(`🚨 Email inválido: ${adminEmail}`);
    }

    // Verificar se admin já existe
    const existingAdmin = await knex('users').where({ email: adminEmail }).first();
    if (existingAdmin) {
      console.log('✅ Admin inicial já existe:', adminEmail);
      return;
    }

    // Gerar hash seguro da senha
    console.log('🔐 Gerando hash seguro da senha...');
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Verificar se existe tenant padrão
    let tenantId = null;
    const tenantCode = process.env.INITIAL_ADMIN_TENANT_CODE;
    
    if (tenantCode) {
      console.log('🏛️ Verificando tenant:', tenantCode);
      
      // Criar tenant se necessário
      let tenant = await knex('tenants').where({ codigo: tenantCode }).first();
      
      if (!tenant) {
        console.log('🏛️ Criando tenant padrão...');
        [tenantId] = await knex('tenants').insert({
          nome: process.env.INITIAL_ADMIN_TENANT_NAME || 'Administração Central',
          codigo: tenantCode,
          cidade: 'São Paulo',
          estado: 'SP',
          cnpj: process.env.INITIAL_ADMIN_TENANT_CNPJ || '00.000.000/0001-00',
          status: 'ativo',
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log('✅ Tenant criado:', tenantCode);
      } else {
        tenantId = tenant.id;
        console.log('✅ Tenant já existe:', tenantCode);
      }
    }

    // Criar admin inicial
    console.log('👤 Criando usuário admin inicial...');
    const [adminId] = await knex('users').insert({
      nome_completo: adminName,
      email: adminEmail,
      password: passwordHash,
      role: 'super_admin',
      status: 'ativo',
      tenant_id: tenantId,
      email_verified_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ Admin inicial criado com sucesso!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Role: super_admin`);
    console.log(`   ID: ${adminId}`);
    
    // Avisos de segurança
    console.log('\n🔒 IMPORTANTE - SEGURANÇA:');
    console.log('   • Altere a senha após primeiro login');
    console.log('   • Configure 2FA se disponível');
    console.log('   • Monitore logs de acesso regularmente\n');

  } catch (error) {
    console.error('❌ Erro ao criar admin inicial:', error.message);
    throw error;
  }
};