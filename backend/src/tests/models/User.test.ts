// ====================================================================
// 🧪 USER MODEL TESTS - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Testes unitários para o modelo de usuário
// Cobertura completa das funcionalidades principais
// ====================================================================

import { beforeAll, afterAll, beforeEach, describe, test, expect } from '@jest/globals';
import { UserModel, CreateUserData, UpdateUserData, User } from '../../models/User.js';
import { initializeDatabase, closeDatabase } from '../../database/prisma.js';
// import { runMigrations } from '../../database/migrationRunner.js'; // Removido - usando Knex nativo
import bcrypt from 'bcryptjs';

// ====================================================================
// SETUP DOS TESTES
// ====================================================================

beforeAll(async () => {
  // Usar banco em memória para testes
  process.env.DB_PATH = ':memory:';
  
  // Inicializar banco (migrações executadas via Knex em outros contextos)
  initializeDatabase();
  // await runMigrations(); // Removido - usando Knex nativo
});

afterAll(async () => {
  closeDatabase();
});

beforeEach(async () => {
  // Limpar dados antes de cada teste
  await UserModel.hardDelete('test-user-1');
  await UserModel.hardDelete('test-user-2');
  await UserModel.hardDelete('test-user-3');
});

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

const createTestUser = (overrides: Partial<CreateUserData> = {}): CreateUserData => ({
  nome_completo: 'Test User',
  email: 'test@example.com',
  password: 'testpassword123',
  role: 'user',
  status: 'ativo',
  ...overrides
});

// ====================================================================
// TESTES DE CRIAÇÃO
// ====================================================================

describe('UserModel - Criação', () => {
  test('deve criar usuário com dados válidos', async () => {
    const userData = createTestUser();
    
    const user = await UserModel.create(userData);
    
    expect(user).toBeDefined();
    expect(user.nome_completo).toBe(userData.nome_completo);
    expect(user.email).toBe(userData.email.toLowerCase());
    expect(user.role).toBe(userData.role);
    expect(user.status).toBe(userData.status);
    expect(user.password_hash).toBeDefined();
    expect(user.password_hash).not.toBe(userData.password);
    expect(user.id).toBeDefined();
    expect(user.created_at).toBeDefined();
    expect(user.updated_at).toBeDefined();
  });

  test('deve criptografar senha corretamente', async () => {
    const userData = createTestUser({ password: 'minhasenha123' });
    
    const user = await UserModel.create(userData);
    
    const isValidPassword = await bcrypt.compare('minhasenha123', user.password_hash);
    expect(isValidPassword).toBe(true);
    
    const isInvalidPassword = await bcrypt.compare('senhaerrada', user.password_hash);
    expect(isInvalidPassword).toBe(false);
  });

  test('deve converter email para minúsculas', async () => {
    const userData = createTestUser({ email: 'TEST@EXAMPLE.COM' });
    
    const user = await UserModel.create(userData);
    
    expect(user.email).toBe('test@example.com');
  });

  test('deve falhar com email duplicado', async () => {
    const userData = createTestUser();
    
    await UserModel.create(userData);
    
    await expect(UserModel.create(userData)).rejects.toThrow('Email já está em uso');
  });

  test('deve falhar com dados inválidos', async () => {
    // Nome muito curto
    await expect(UserModel.create(createTestUser({ nome_completo: 'A' }))).rejects.toThrow();
    
    // Email inválido
    await expect(UserModel.create(createTestUser({ email: 'email-inválido' }))).rejects.toThrow();
    
    // Senha muito curta
    await expect(UserModel.create(createTestUser({ password: '123' }))).rejects.toThrow();
  });

  test('deve definir valores padrão corretamente', async () => {
    const userData: CreateUserData = {
      nome_completo: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = await UserModel.create(userData);
    
    expect(user.role).toBe('user'); // Padrão
    expect(user.status).toBe('pendente'); // Padrão
    expect(user.failed_login_attempts).toBe(0);
    expect(user.email_verified).toBe(false);
  });
});

// ====================================================================
// TESTES DE BUSCA
// ====================================================================

describe('UserModel - Busca', () => {
  test('deve encontrar usuário por ID', async () => {
    const userData = createTestUser();
    const createdUser = await UserModel.create(userData);
    
    const foundUser = await UserModel.findById(createdUser.id);
    
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(createdUser.id);
    expect(foundUser?.email).toBe(createdUser.email);
  });

  test('deve encontrar usuário por email', async () => {
    const userData = createTestUser();
    const createdUser = await UserModel.create(userData);
    
    const foundUser = await UserModel.findByEmail(createdUser.email);
    
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(createdUser.id);
    expect(foundUser?.email).toBe(createdUser.email);
  });

  test('deve retornar null para usuário inexistente', async () => {
    const foundUser = await UserModel.findById('non-existent-id');
    expect(foundUser).toBeNull();
    
    const foundByEmail = await UserModel.findByEmail('nonexistent@example.com');
    expect(foundByEmail).toBeNull();
  });

  test('deve buscar por role', async () => {
    await UserModel.create(createTestUser({ email: 'admin@test.com', role: 'admin' }));
    await UserModel.create(createTestUser({ email: 'user@test.com', role: 'user' }));
    
    const admins = await UserModel.findByRole('admin');
    const users = await UserModel.findByRole('user');
    
    expect(admins).toHaveLength(1);
    expect(admins[0].role).toBe('admin');
    expect(users).toHaveLength(1);
    expect(users[0].role).toBe('user');
  });
});

// ====================================================================
// TESTES DE ATUALIZAÇÃO
// ====================================================================

describe('UserModel - Atualização', () => {
  test('deve atualizar dados do usuário', async () => {
    const userData = createTestUser();
    const user = await UserModel.create(userData);
    
    const updates: UpdateUserData = {
      nome_completo: 'Updated Name',
      role: 'manager'
    };
    
    const updatedUser = await UserModel.update(user.id, updates);
    
    expect(updatedUser.nome_completo).toBe('Updated Name');
    expect(updatedUser.role).toBe('manager');
    expect(updatedUser.email).toBe(user.email); // Não alterado
    expect(updatedUser.updated_at).not.toBe(user.updated_at);
  });

  test('deve validar email único na atualização', async () => {
    const user1 = await UserModel.create(createTestUser({ email: 'user1@test.com' }));
    const user2 = await UserModel.create(createTestUser({ email: 'user2@test.com' }));
    
    // Tentar atualizar user2 com email de user1
    await expect(
      UserModel.update(user2.id, { email: 'user1@test.com' })
    ).rejects.toThrow('Email já está em uso');
  });

  test('deve permitir manter mesmo email', async () => {
    const user = await UserModel.create(createTestUser());
    
    const updatedUser = await UserModel.update(user.id, { 
      email: user.email,
      nome_completo: 'New Name'
    });
    
    expect(updatedUser.email).toBe(user.email);
    expect(updatedUser.nome_completo).toBe('New Name');
  });

  test('deve falhar para usuário inexistente', async () => {
    await expect(
      UserModel.update('non-existent-id', { nome_completo: 'New Name' })
    ).rejects.toThrow('Usuário não encontrado');
  });
});

// ====================================================================
// TESTES DE AUTENTICAÇÃO
// ====================================================================

describe('UserModel - Autenticação', () => {
  test('deve verificar senha correta', async () => {
    const password = 'mypassword123';
    const user = await UserModel.create(createTestUser({ password }));
    
    const isValid = await UserModel.verifyPassword(user, password);
    
    expect(isValid).toBe(true);
  });

  test('deve rejeitar senha incorreta', async () => {
    const user = await UserModel.create(createTestUser({ password: 'correct123' }));
    
    const isValid = await UserModel.verifyPassword(user, 'wrong123');
    
    expect(isValid).toBe(false);
  });

  test('deve atualizar senha', async () => {
    const user = await UserModel.create(createTestUser({ password: 'old123' }));
    
    await UserModel.updatePassword(user.id, 'new123');
    
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser).toBeDefined();
    
    const oldPasswordValid = await UserModel.verifyPassword(updatedUser!, 'old123');
    const newPasswordValid = await UserModel.verifyPassword(updatedUser!, 'new123');
    
    expect(oldPasswordValid).toBe(false);
    expect(newPasswordValid).toBe(true);
  });

  test('deve atualizar último login', async () => {
    const user = await UserModel.create(createTestUser());
    const originalLogin = user.ultimo_login;
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1s
    await UserModel.updateLastLogin(user.id);
    
    const updatedUser = await UserModel.findById(user.id);
    
    expect(updatedUser?.ultimo_login).not.toBe(originalLogin);
    expect(updatedUser?.ultimo_login).toBeDefined();
  });
});

// ====================================================================
// TESTES DE CONTROLE DE TENTATIVAS
// ====================================================================

describe('UserModel - Controle de Tentativas', () => {
  test('deve incrementar tentativas falhadas', async () => {
    const user = await UserModel.create(createTestUser());
    
    await UserModel.incrementFailedAttempts(user.id);
    
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.failed_login_attempts).toBe(1);
  });

  test('deve resetar tentativas falhadas', async () => {
    const user = await UserModel.create(createTestUser());
    
    await UserModel.incrementFailedAttempts(user.id);
    await UserModel.incrementFailedAttempts(user.id);
    
    let updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.failed_login_attempts).toBe(2);
    
    await UserModel.resetFailedAttempts(user.id);
    
    updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.failed_login_attempts).toBe(0);
  });

  test('deve bloquear após muitas tentativas', async () => {
    const user = await UserModel.create(createTestUser());
    
    // Simular 5 tentativas falhadas
    for (let i = 0; i < 5; i++) {
      await UserModel.incrementFailedAttempts(user.id);
    }
    
    const blockedUser = await UserModel.findById(user.id);
    const isLocked = await UserModel.isLocked(blockedUser!);
    
    expect(isLocked).toBe(true);
    expect(blockedUser?.locked_until).toBeDefined();
  });
});

// ====================================================================
// TESTES DE HIERARQUIA
// ====================================================================

describe('UserModel - Hierarquia', () => {
  test('deve verificar nível de permissão corretamente', async () => {
    expect(UserModel.hasPermissionLevel('admin', 'user')).toBe(true);
    expect(UserModel.hasPermissionLevel('user', 'admin')).toBe(false);
    expect(UserModel.hasPermissionLevel('super_admin', 'admin')).toBe(true);
    expect(UserModel.hasPermissionLevel('coordinator', 'manager')).toBe(false);
    expect(UserModel.hasPermissionLevel('manager', 'coordinator')).toBe(true);
  });

  test('deve identificar super admin', async () => {
    const superAdmin = await UserModel.create(createTestUser({ role: 'super_admin' }));
    const normalUser = await UserModel.create(createTestUser({ 
      email: 'user@test.com', 
      role: 'user' 
    }));
    
    expect(UserModel.isSuperAdmin(superAdmin)).toBe(true);
    expect(UserModel.isSuperAdmin(normalUser)).toBe(false);
  });

  test('deve identificar admin', async () => {
    const admin = await UserModel.create(createTestUser({ role: 'admin' }));
    const superAdmin = await UserModel.create(createTestUser({ 
      email: 'super@test.com', 
      role: 'super_admin' 
    }));
    const user = await UserModel.create(createTestUser({ 
      email: 'user@test.com', 
      role: 'user' 
    }));
    
    expect(UserModel.isAdmin(admin)).toBe(true);
    expect(UserModel.isAdmin(superAdmin)).toBe(true);
    expect(UserModel.isAdmin(user)).toBe(false);
  });
});

// ====================================================================
// TESTES DE LISTAGEM
// ====================================================================

describe('UserModel - Listagem', () => {
  test('deve listar usuários com paginação', async () => {
    // Criar 5 usuários
    for (let i = 1; i <= 5; i++) {
      await UserModel.create(createTestUser({ email: `user${i}@test.com` }));
    }
    
    const page1 = await UserModel.list({ limit: 2, offset: 0 });
    const page2 = await UserModel.list({ limit: 2, offset: 2 });
    
    expect(page1).toHaveLength(2);
    expect(page2).toHaveLength(2);
    expect(page1[0].id).not.toBe(page2[0].id);
  });

  test('deve filtrar por status', async () => {
    await UserModel.create(createTestUser({ email: 'ativo@test.com', status: 'ativo' }));
    await UserModel.create(createTestUser({ email: 'inativo@test.com', status: 'inativo' }));
    
    const ativos = await UserModel.list({ status: 'ativo' });
    const inativos = await UserModel.list({ status: 'inativo' });
    
    expect(ativos).toHaveLength(1);
    expect(ativos[0].status).toBe('ativo');
    expect(inativos).toHaveLength(1);
    expect(inativos[0].status).toBe('inativo');
  });

  test('deve contar usuários corretamente', async () => {
    const initialCount = await UserModel.count();
    
    await UserModel.create(createTestUser({ email: 'count1@test.com' }));
    await UserModel.create(createTestUser({ email: 'count2@test.com' }));
    
    const finalCount = await UserModel.count();
    
    expect(finalCount).toBe(initialCount + 2);
  });
});

// ====================================================================
// TESTES DE SANITIZAÇÃO
// ====================================================================

describe('UserModel - Sanitização', () => {
  test('deve remover senha do usuário sanitizado', async () => {
    const user = await UserModel.create(createTestUser());
    
    const sanitized = UserModel.sanitizeUser(user);
    
    expect(sanitized).not.toHaveProperty('password_hash');
    expect(sanitized).toHaveProperty('id');
    expect(sanitized).toHaveProperty('email');
    expect(sanitized).toHaveProperty('nome_completo');
  });
});