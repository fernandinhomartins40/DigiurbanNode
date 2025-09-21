// ====================================================================
// 🌱 SEED INICIAL - ADMIN SUPER USER
// ====================================================================
// Criação segura de admin inicial via variáveis de ambiente
// Substitui credenciais hardcoded por configuração segura
// ====================================================================

import bcrypt from 'bcryptjs';
import { UserModel } from '../../models/User.js';
import { TenantModel } from '../../models/Tenant.js';
import { logger } from '../../config/logger.js';

export class InitialAdminSeed {
  /**
   * Criar admin inicial seguro
   */
  static async run(): Promise<void> {
    try {
      console.log('🌱 Iniciando criação de admin inicial...');

      // Validar variáveis obrigatórias
      const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
      const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
      
      if (!adminEmail || !adminPassword) {
        const missingVars = [];
        if (!adminEmail) missingVars.push('INITIAL_ADMIN_EMAIL');
        if (!adminPassword) missingVars.push('INITIAL_ADMIN_PASSWORD');
        
        throw new Error(
          `🚨 ERRO: Variáveis de ambiente obrigatórias não definidas: ${missingVars.join(', ')}\n` +
          'Configure estas variáveis antes de executar o seed.'
        );
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(adminEmail)) {
        throw new Error(`🚨 ERRO: Email inválido: ${adminEmail}`);
      }

      // Validar força da senha
      if (adminPassword.length < 8) {
        throw new Error('🚨 ERRO: INITIAL_ADMIN_PASSWORD deve ter pelo menos 8 caracteres');
      }

      // Verificar se admin já existe
      const existingAdmin = await UserModel.findByEmail(adminEmail);
      if (existingAdmin) {
        console.log('✅ Admin inicial já existe:', adminEmail);
        return;
      }

      // Gerar hash seguro da senha
      console.log('🔐 Gerando hash seguro da senha...');
      const passwordHash = await bcrypt.hash(adminPassword, 12);

      // Criar tenant padrão para super admin se necessário
      let tenantId: string | null = null;
      const tenantCode = process.env.INITIAL_ADMIN_TENANT_CODE;
      
      if (tenantCode) {
        console.log('🏛️ Criando tenant para admin:', tenantCode);
        
        // Verificar se tenant já existe
        const existingTenant = await TenantModel?.findByCode?.(tenantCode);
        
        if (!existingTenant) {
          const tenant = await TenantModel?.create?.({
            nome: process.env.INITIAL_ADMIN_TENANT_NAME || 'Administração Central',
            email: process.env.INITIAL_ADMIN_TENANT_EMAIL || 'admin@digiurban.gov.br',
            cidade: 'São Paulo',
            estado: 'SP',
            cnpj: process.env.INITIAL_ADMIN_TENANT_CNPJ || '00.000.000/0001-00',
            status: 'ativo'
          });
          tenantId = tenant?.id;
          console.log('✅ Tenant criado:', tenantCode);
        } else {
          tenantId = existingTenant.id;
          console.log('✅ Tenant já existe:', tenantCode);
        }
      }

      // Criar admin inicial
      console.log('👤 Criando usuário admin inicial...');
      const admin = await UserModel.create({
        nomeCompleto: process.env.INITIAL_ADMIN_NAME || 'Super Administrador',
        email: adminEmail,
        password: passwordHash,
        role: 'super_admin',
        status: 'ativo',
        tenantId: tenantId,
      });

      // Log de sucesso (sem dados sensíveis)
      logger.info('Admin inicial criado com sucesso', {
        admin_id: admin.id,
        email: adminEmail,
        role: admin.role,
        tenantId: tenantId,
        action: 'initial_admin_seed'
      });

      console.log('✅ Admin inicial criado com sucesso!');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   ID: ${admin.id}`);
      
      // Avisos de segurança
      console.log('\n🔒 IMPORTANTE - SEGURANÇA:');
      console.log('   • Altere a senha após primeiro login');
      console.log('   • Configure 2FA se disponível');
      console.log('   • Monitore logs de acesso regularmente');
      console.log('   • Remova as variáveis de ambiente após primeiro uso\n');

    } catch (error) {
      logger.error('Erro ao criar admin inicial', { error: error.message });
      console.error('❌ Erro ao criar admin inicial:', error.message);
      throw error;
    }
  }

  /**
   * Validar ambiente antes de executar
   */
  static validateEnvironment(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredVars = ['INITIAL_ADMIN_EMAIL', 'INITIAL_ADMIN_PASSWORD'];
    
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        errors.push(`Variável ${varName} não definida`);
      }
    });

    // Validações adicionais em produção
    if (process.env.NODE_ENV === 'production') {
      const email = process.env.INITIAL_ADMIN_EMAIL;
      const password = process.env.INITIAL_ADMIN_PASSWORD;
      
      if (email && (email.includes('demo') || email.includes('test'))) {
        errors.push('Email de admin não deve conter "demo" ou "test" em produção');
      }
      
      if (password && password.length < 12) {
        errors.push('Senha de admin deve ter pelo menos 12 caracteres em produção');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Executar validação e seed
   */
  static async execute(): Promise<void> {
    const validation = this.validateEnvironment();
    
    if (!validation.valid) {
      console.error('❌ Validação de ambiente falhou:');
      validation.errors.forEach(error => console.error(`   • ${error}`));
      throw new Error('Ambiente não configurado corretamente para seed');
    }

    await this.run();
  }
}

// Permitir execução direta do script
if (import.meta.url === `file://${process.argv[1]}`) {
  InitialAdminSeed.execute()
    .then(() => {
      console.log('🎉 Seed concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed falhou:', error);
      process.exit(1);
    });
}

export default InitialAdminSeed;