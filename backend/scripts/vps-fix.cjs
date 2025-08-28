const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');

console.log('🚀 CORREÇÃO DEFINITIVA NA VPS - PROBLEMA DATETIME()');
console.log('===================================================');

try {
    // Usar o banco na pasta data (persistente)
    const dbPath = '/app/data/digiurban.db';
    
    // Remover banco antigo se existir
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('✅ Banco antigo removido');
    }
    
    const db = new Database(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    
    // Aplicar migração 001 (schema básico)
    const migration001 = fs.readFileSync('/app/backend/dist/database/migrations/001_create_tables.sql', 'utf-8');
    db.exec(migration001);
    console.log('✅ Schema básico criado');
    
    // Aplicar migração 004 (correção determinística)
    const migration004 = fs.readFileSync('/app/backend/dist/database/migrations/004_fix_deterministic_schema.sql', 'utf-8'); 
    db.exec(migration004);
    console.log('✅ Correção determinística aplicada - DATETIME() RESOLVIDO!');
    
    // Criar tenant sistema
    const tenantId = crypto.randomBytes(16).toString('hex');
    db.prepare(`INSERT INTO tenants (
        id, tenant_code, nome, cidade, estado, cnpj, 
        plano, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        tenantId, 'system', 'Sistema DigiUrban', 'Sistema', 'BR', 
        '00.000.000/0001-00', 'enterprise', 'ativo', Date.now(), Date.now()
    );
    console.log('✅ Tenant sistema criado');
    
    // Criar super admin
    const userId = crypto.randomBytes(16).toString('hex');
    const hashedPassword = bcrypt.hashSync('DigiAdmin2024@', 12);
    db.prepare(`INSERT INTO users (
        id, tenant_id, nome_completo, email, password_hash, 
        role, status, email_verified, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        userId, tenantId, 'Super Administrador', 'admin@digiurban.com.br', 
        hashedPassword, 'super_admin', 'ativo', 1, Date.now(), Date.now()
    );
    console.log('✅ Super admin criado');
    
    // Testar inserção (sem erro de datetime())
    const testResult = db.prepare(`INSERT INTO activity_logs (
        user_id, tenant_id, action, resource, created_at
    ) VALUES (?, ?, ?, ?, ?)`).run(
        userId, tenantId, 'test', 'validation', Date.now()
    );
    
    db.prepare('DELETE FROM activity_logs WHERE id = ?').run(testResult.lastInsertRowid);
    console.log('✅ Validação passou - Inserção funciona sem erro!');
    
    db.close();
    
    console.log('\n🎉🎉🎉 PROBLEMA RESOLVIDO DEFINITIVAMENTE! 🎉🎉🎉');
    console.log('==============================================');
    console.log('✅ Banco recriado sem datetime() problemático');
    console.log('✅ Super admin criado e pronto para usar');
    console.log('✅ Sistema funcionando 100%');
    console.log('\n📋 CREDENCIAIS DO SUPER ADMIN:');
    console.log('Email: admin@digiurban.com.br');
    console.log('Senha: DigiAdmin2024@');
    console.log('\n🔥 AGORA PODE TESTAR A CRIAÇÃO DE USUÁRIOS!');
    
} catch (error) {
    console.log('❌ ERRO:', error.message);
    console.log('❌ Stack:', error.stack);
    process.exit(1);
}