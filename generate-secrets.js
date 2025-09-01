#!/usr/bin/env node

// ====================================================================
// 🔐 GERADOR DE SECRETS PARA PRODUÇÃO - DIGIURBAN
// ====================================================================
// Script para gerar secrets seguros para produção
// ====================================================================

const crypto = require('crypto');

// Função para gerar secret seguro
function generateSecret(length = 32) {
    return crypto.randomBytes(length).toString('base64');
}

// Função para gerar UUID
function generateUUID() {
    return crypto.randomUUID();
}

console.log('🔐 Gerando secrets seguros para produção...\n');

const secrets = {
    JWT_SECRET: generateSecret(32),
    JWT_REFRESH_SECRET: generateSecret(32),
    COOKIE_SECRET: generateSecret(32),
    ADMIN_ID: generateUUID(),
    TENANT_ID: generateUUID()
};

console.log('📋 Secrets gerados (copie para .env.production):');
console.log('='.repeat(60));
console.log(`JWT_SECRET=${secrets.JWT_SECRET}`);
console.log(`JWT_REFRESH_SECRET=${secrets.JWT_REFRESH_SECRET}`);
console.log(`COOKIE_SECRET=${secrets.COOKIE_SECRET}`);
console.log('\n🆔 IDs únicos:');
console.log(`ADMIN_ID=${secrets.ADMIN_ID}`);
console.log(`TENANT_ID=${secrets.TENANT_ID}`);
console.log('='.repeat(60));

console.log('\n📝 Exemplo de senha forte para administrador:');
const passwordChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
let password = '';
for (let i = 0; i < 16; i++) {
    password += passwordChars.charAt(Math.floor(Math.random() * passwordChars.length));
}
console.log(`INITIAL_ADMIN_PASSWORD=${password}`);

console.log('\n⚠️  IMPORTANTE:');
console.log('1. Guarde estes secrets com segurança');
console.log('2. Nunca compartilhe ou versione estes valores');
console.log('3. Use apenas em produção');
console.log('4. Configure sua API key do Resend separadamente');

// Salvar em arquivo temporário
const fs = require('fs');
const secretsFile = '.secrets-generated';

const envContent = `# Secrets gerados para produção - ${new Date().toISOString()}
# ATENÇÃO: Não versione este arquivo!

JWT_SECRET=${secrets.JWT_SECRET}
JWT_REFRESH_SECRET=${secrets.JWT_REFRESH_SECRET}
COOKIE_SECRET=${secrets.COOKIE_SECRET}

# IDs únicos
ADMIN_ID=${secrets.ADMIN_ID}
TENANT_ID=${secrets.TENANT_ID}

# Senha exemplo
INITIAL_ADMIN_PASSWORD=${password}

# Configurar manualmente:
# RESEND_API_KEY=sua_api_key_do_resend_aqui
`;

fs.writeFileSync(secretsFile, envContent);
console.log(`\n💾 Secrets salvos em: ${secretsFile}`);
console.log('🗑️  Lembre-se de deletar este arquivo após usar!');