// Script simples para corrigir banco determinístico
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configuração
const dbPath = path.join(__dirname, '..', 'database', 'digiurban.db');
const backupPath = path.join(__dirname, '..', 'database', `backup_${Date.now()}.db`);

console.log('\n🚀 INICIANDO CORREÇÃO DO BANCO');
console.log('================================');

function generateId() {
    return crypto.randomBytes(16).toString('hex');
}

try {
    // 1. Fazer backup se existir
    if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, backupPath);
        console.log(`✅ Backup criado: ${backupPath}`);
        
        // Remover banco antigo
        fs.unlinkSync(dbPath);
        console.log('✅ Banco antigo removido');
    }
    
    // 2. Criar novo banco
    console.log('🔄 Criando novo banco...');
    const db = new Database(dbPath);
    
    // Configurações SQLite
    db.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA foreign_keys = ON;
    `);
    
    // 3. Criar tabela de migrações
    db.exec(`
        CREATE TABLE schema_migrations (
            id INTEGER PRIMARY KEY,
            filename TEXT NOT NULL UNIQUE,
            description TEXT,
            checksum TEXT NOT NULL,
            applied_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
            execution_time INTEGER NOT NULL,
            rollback_sql TEXT
        );
        CREATE INDEX idx_schema_migrations_id ON schema_migrations(id);
    `);
    
    // 4. Aplicar migração 001 (básica)
    console.log('🔄 Aplicando migração 001...');
    const migration001 = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'database', 'migrations', '001_create_tables.sql'), 
        'utf-8'
    );
    db.exec(migration001);
    
    // Registrar migração
    db.prepare(`
        INSERT INTO schema_migrations (id, filename, description, checksum, applied_at, execution_time)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(1, '001_create_tables.sql', 'create tables', 'hash1', Date.now(), 0);
    
    // 5. Aplicar migração 004 (correção determinística)
    console.log('🔄 Aplicando migração 004 (correção)...');
    const migration004 = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'database', 'migrations', '004_fix_deterministic_schema.sql'), 
        'utf-8'
    );
    db.exec(migration004);
    
    // Registrar migração
    db.prepare(`
        INSERT INTO schema_migrations (id, filename, description, checksum, applied_at, execution_time)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(4, '004_fix_deterministic_schema.sql', 'fix deterministic schema', 'hash4', Date.now(), 0);
    
    // 6. Criar tenant sistema
    console.log('🔄 Criando tenant do sistema...');
    const tenantId = generateId();
    db.prepare(`
        INSERT INTO tenants (
            id, tenant_code, nome, cidade, estado, cnpj,
            plano, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        tenantId, 'system', 'Sistema DigiUrban', 'Sistema', 'BR', '00.000.000/0001-00',
        'enterprise', 'ativo', Date.now(), Date.now()
    );
    
    // 7. Criar super admin
    console.log('🔄 Criando super admin...');
    const userId = generateId();
    const hashedPassword = bcrypt.hashSync('DigiAdmin2024@', 12);
    
    db.prepare(`
        INSERT INTO users (
            id, tenant_id, nome_completo, email, password_hash,
            role, status, email_verified, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        userId, tenantId, 'Super Administrador', 'admin@digiurban.com.br', hashedPassword,
        'super_admin', 'ativo', 1, Date.now(), Date.now()
    );
    
    // 8. Validar
    console.log('🔄 Validando...');
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const tenantCount = db.prepare('SELECT COUNT(*) as count FROM tenants').get().count;
    
    // Testar inserção básica para verificar se não há erro de datetime()
    const insertResult = db.prepare(`
        INSERT INTO activity_logs (
            user_id, tenant_id, action, resource, created_at
        ) VALUES (?, ?, ?, ?, ?)
    `).run(userId, tenantId, 'test', 'validation', Date.now());
    
    db.prepare('DELETE FROM activity_logs WHERE id = ?').run(insertResult.lastInsertRowid);
    
    db.close();
    
    console.log('\n🎉 SUCESSO TOTAL!');
    console.log('==================');
    console.log(`✅ Banco recriado: ${dbPath}`);
    console.log(`✅ Usuários criados: ${userCount}`);
    console.log(`✅ Tenants criados: ${tenantCount}`);
    console.log(`✅ Backup salvo em: ${backupPath}`);
    
    console.log('\n📋 CREDENCIAIS:');
    console.log('Email: admin@digiurban.com.br');
    console.log('Senha: DigiAdmin2024@');
    
    console.log('\n✅ PROBLEMA DATETIME() RESOLVIDO!');
    
} catch (error) {
    console.log(`\n❌ ERRO: ${error.message}`);
    console.log(`❌ Stack: ${error.stack}`);
    process.exit(1);
}