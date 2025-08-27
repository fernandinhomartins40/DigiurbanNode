// ====================================================================
// 🧪 TESTES DE INTEGRAÇÃO - AUTENTICAÇÃO
// ====================================================================
// Testes completos para fluxo de autenticação
// Validação de login, logout, refresh token e sessões
// ====================================================================

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { UserModel } from '../../models/User.js';
import { TenantModel } from '../../models/Tenant.js';
import { migrate } from '../../database/migrate.js';

describe('Auth Integration Tests', () => {
  let testTenantId: string;
  let testUserId: string;
  let accessToken: string;
  let refreshToken: string;

  // ================================================================
  // CONFIGURAÇÃO DOS TESTES
  // ================================================================

  beforeAll(async () => {
    // Executar migrações
    await migrate();

    // Criar tenant de teste
    const tenant = await TenantModel.create({
      nome: 'Tenant Teste Auth',
      email: 'auth@teste.com',
      plano: 'basico',
      status: 'ativo'
    });
    testTenantId = tenant.id;

    // Criar usuário de teste
    const user = await UserModel.create({
      nome_completo: 'Usuário Teste Auth',
      email: 'usuario@teste.com',
      password: 'SenhaForte123!',
      tenant_id: testTenantId,
      role: 'user',
      status: 'ativo'
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Limpeza após testes
    if (testUserId) {
      await UserModel.delete(testUserId);
    }
    if (testTenantId) {
      await TenantModel.delete(testTenantId);
    }
  });

  // ================================================================
  // TESTES DE LOGIN
  // ================================================================

  describe('POST /api/auth/login', () => {
    test('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'usuario@teste.com',
          password: 'SenhaForte123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();

      // Armazenar tokens para próximos testes
      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
    });

    test('deve falhar com credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'usuario@teste.com',
          password: 'senhaerrada'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('deve falhar com email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inexistente@teste.com',
          password: 'SenhaForte123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('deve falhar com dados inválidos', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'email-invalido',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });
  });

  // ================================================================
  // TESTES DE REFRESH TOKEN
  // ================================================================

  describe('POST /api/auth/refresh', () => {
    test('deve renovar token com refresh token válido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.expiresAt).toBeDefined();

      // Atualizar token para próximos testes
      accessToken = response.body.data.accessToken;
    });

    test('deve falhar com refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'token-invalido'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ================================================================
  // TESTES DE VALIDAÇÃO DE TOKEN
  // ================================================================

  describe('POST /api/auth/validate', () => {
    test('deve validar token válido', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({
          token: accessToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.valid).toBe(true);
    });

    test('deve falhar com token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({
          token: 'token-invalido'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ================================================================
  // TESTES DE PERFIL
  // ================================================================

  describe('GET /api/auth/profile', () => {
    test('deve obter perfil com token válido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(testUserId);
    });

    test('deve falhar sem token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ================================================================
  // TESTES DE SESSÕES
  // ================================================================

  describe('GET /api/auth/sessions', () => {
    test('deve listar sessões do usuário', async () => {
      const response = await request(app)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sessions).toBeDefined();
      expect(Array.isArray(response.body.data.sessions)).toBe(true);
    });
  });

  // ================================================================
  // TESTES DE LOGOUT
  // ================================================================

  describe('POST /api/auth/logout', () => {
    test('deve fazer logout com token válido', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    test('token deve estar inválido após logout', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ================================================================
  // TESTES DE RATE LIMITING
  // ================================================================

  describe('Rate Limiting', () => {
    test('deve aplicar rate limit após muitas tentativas', async () => {
      // Fazer muitas tentativas de login inválidas
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'inexistente@teste.com',
              password: 'senhaerrada'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Pelo menos uma das últimas requisições deve retornar 429
      const rateLimited = responses.some(response => response.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});