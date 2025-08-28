// ====================================================================
// 👑 SCRIPT PARA CRIAR SUPER-ADMIN - DIGIURBAN
// ====================================================================
// Cria usuário super-admin com hash seguro da senha
// Email: fernandinhomartins040@gmail.com
// ====================================================================

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSuperAdmin() {
  console.log('🔐 Criando usuário super-admin...');
  
  const userData = {
    email: 'fernandinhomartins040@gmail.com',
    password: 'Nando157940/',
    nome_completo: 'Fernando Martins',
    role: 'super_admin',
    status: 'ativo'
  };

  try {
    // 1. Gerar ID único
    const id = uuidv4();
    console.log('📝 ID gerado:', id);

    // 2. Hash da senha usando bcrypt
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    console.log('🔒 Senha hasheada com sucesso');

    // 3. Conectar ao banco SQLite
    const dbPath = path.join(__dirname, 'data', 'digiurban.db');
    console.log('📂 Conectando ao banco:', dbPath);
    
    const db = new sqlite3.Database(dbPath);

    // 4. Verificar se usuário já existe
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [userData.email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      console.log('⚠️ Usuário já existe! Atualizando...');
      
      // Atualizar usuário existente
      const updateSql = `
        UPDATE users SET 
          nome_completo = ?,
          password_hash = ?,
          role = ?,
          status = ?,
          email_verified = 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE email = ?
      `;
      
      await new Promise((resolve, reject) => {
        db.run(updateSql, [
          userData.nome_completo,
          hashedPassword,
          userData.role,
          userData.status,
          userData.email
        ], function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
      
      console.log('✅ Super-admin atualizado com sucesso!');
      
    } else {
      console.log('👤 Criando novo usuário...');
      
      // Criar novo usuário
      const insertSql = `
        INSERT INTO users (
          id, tenant_id, nome_completo, email, password_hash,
          role, status, email_verified, avatar_url, failed_login_attempts,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      await new Promise((resolve, reject) => {
        db.run(insertSql, [
          id,
          null, // super_admin não tem tenant específico
          userData.nome_completo,
          userData.email.toLowerCase(),
          hashedPassword,
          userData.role,
          userData.status,
          1, // email_verified = true
          null, // avatar_url
          0 // failed_login_attempts
        ], function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
      
      console.log('✅ Super-admin criado com sucesso!');
    }

    // 5. Verificar criação
    const createdUser = await new Promise((resolve, reject) => {
      db.get('SELECT id, nome_completo, email, role, status, email_verified, created_at FROM users WHERE email = ?', 
        [userData.email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    console.log('📊 Dados do super-admin:');
    console.log('   ID:', createdUser.id);
    console.log('   Nome:', createdUser.nome_completo);
    console.log('   Email:', createdUser.email);
    console.log('   Role:', createdUser.role);
    console.log('   Status:', createdUser.status);
    console.log('   Email verificado:', createdUser.email_verified ? 'Sim' : 'Não');
    console.log('   Criado em:', createdUser.created_at);

    // 6. Fechar conexão
    db.close();
    
    console.log('🎉 Super-admin configurado com sucesso!');
    console.log('');
    console.log('📝 Credenciais:');
    console.log('   Email: fernandinhomartins040@gmail.com');
    console.log('   Senha: Nando157940/');
    console.log('   Role: super_admin');
    console.log('');
    console.log('🚀 Você pode fazer login no sistema agora!');

  } catch (error) {
    console.error('❌ Erro ao criar super-admin:', error.message);
    process.exit(1);
  }
}

// Executar script
createSuperAdmin();