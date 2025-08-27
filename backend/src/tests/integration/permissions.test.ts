// ====================================================================
// 🧪 TESTES DE INTEGRAÇÃO - SISTEMA DE PERMISSÕES
// ====================================================================
// Testes completos para RBAC e controle de acesso
// Validação de permissões hierárquicas e middleware
// ====================================================================

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { UserModel } from '../../models/User.js';
import { TenantModel } from '../../models/Tenant.js';
import { PermissionService } from '../../services/PermissionService.js';
import { AuthService } from '../../services/AuthService.js';
import { migrate } from '../../database/migrate.js';

describe('Permissions Integration Tests', () => {
  let testTenantId: string;
  let adminUserId: string;
  let regularUserId: string;
  let adminToken: string;
  let userToken: string;

  // ================================================================
  // CONFIGURAÇÃO DOS TESTES
  // ================================================================

  beforeAll(async () => {
    // Executar migrações
    await migrate();

    // Criar tenant de teste
    const tenant = await TenantModel.create({
      nome: 'Tenant Teste Permissions',
      email: 'permissions@teste.com',
      plano: 'profissional',
      status: 'ativo'
    });
    testTenantId = tenant.id;

    // Criar usuário admin
    const adminUser = await UserModel.create({
      nome_completo: 'Admin Teste',
      email: 'admin@teste.com',
      password: 'AdminSenha123!',
      tenant_id: testTenantId,
      role: 'admin',
      status: 'ativo'
    });
    adminUserId = adminUser.id;

    // Criar usuário regular
    const regularUser = await UserModel.create({
      nome_completo: 'User Teste',
      email: 'user@teste.com',
      password: 'UserSenha123!',
      tenant_id: testTenantId,
      role: 'user',
      status: 'ativo'
    });
    regularUserId = regularUser.id;

    // Fazer login dos usuários para obter tokens
    const adminLogin = await AuthService.login({
      email: 'admin@teste.com',
      password: 'AdminSenha123!'
    });
    adminToken = adminLogin.tokens.accessToken;

    const userLogin = await AuthService.login({
      email: 'user@teste.com',
      password: 'UserSenha123!'
    });
    userToken = userLogin.tokens.accessToken;
  });

  afterAll(async () => {
    // Limpeza após testes
    if (adminUserId) await UserModel.delete(adminUserId);
    if (regularUserId) await UserModel.delete(regularUserId);
    if (testTenantId) await TenantModel.delete(testTenantId);
  });

  // ================================================================
  // TESTES DE VERIFICAÇÃO DE PERMISSÕES
  // ================================================================

  describe('POST /api/permissions/check', () => {
    test('admin deve ter permissão para gerenciar usuários', async () => {
      const response = await request(app)
        .post('/api/permissions/check')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: adminUserId,
          permissionCode: 'manage_users'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hasPermission).toBe(true);
    });

    test('usuário regular não deve ter permissão para gerenciar usuários', async () => {
      const response = await request(app)
        .post('/api/permissions/check')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: regularUserId,
          permissionCode: 'manage_users'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hasPermission).toBe(false);
    });

    test('usuário não deve poder verificar permissões de outros sem autorização', async () => {
      const response = await request(app)
        .post('/api/permissions/check')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: adminUserId,
          permissionCode: 'manage_users'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/permissions/check-multiple', () => {
    test('deve verificar múltiplas permissões do admin', async () => {
      const response = await request(app)
        .post('/api/permissions/check-multiple')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: adminUserId,
          permissionCodes: ['manage_users', 'view_users', 'create_users', 'invalid_permission']
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.permissions).toBeDefined();
      expect(response.body.data.permissions['manage_users']).toBe(true);
      expect(response.body.data.permissions['view_users']).toBe(true);
      expect(response.body.data.permissions['create_users']).toBe(true);
      expect(response.body.data.permissions['invalid_permission']).toBe(false);
    });
  });

  describe('POST /api/permissions/check-resource', () => {
    test('deve verificar acesso a recurso específico', async () => {
      const response = await request(app)
        .post('/api/permissions/check-resource')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: adminUserId,
          resource: 'users',
          action: 'create'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.canAccess).toBe(true);
    });
  });

  // ================================================================
  // TESTES DE GESTÃO DE PERMISSÕES
  // ================================================================

  describe('POST /api/permissions/grant', () => {
    test('admin deve poder conceder permissões', async () => {
      const response = await request(app)
        .post('/api/permissions/grant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: regularUserId,
          permissionCode: 'view_reports'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('concedida com sucesso');
    });

    test('usuário regular não deve poder conceder permissões', async () => {
      const response = await request(app)
        .post('/api/permissions/grant')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: regularUserId,
          permissionCode: 'view_reports'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/permissions/revoke', () => {
    test('admin deve poder revogar permissões', async () => {
      // Primeiro conceder a permissão
      await PermissionService.grantPermission(regularUserId, 'view_reports', adminUserId);

      const response = await request(app)
        .post('/api/permissions/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: regularUserId,
          permissionCode: 'view_reports'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('revogada com sucesso');
    });
  });

  // ================================================================
  // TESTES DE CONSULTA
  // ================================================================

  describe('GET /api/permissions/user/:userId/summary', () => {
    test('admin deve obter resumo de permissões de qualquer usuário', async () => {
      const response = await request(app)
        .get(`/api/permissions/user/${regularUserId}/summary`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(regularUserId);
      expect(response.body.data.role).toBe('user');
      expect(response.body.data.directPermissions).toBeDefined();
      expect(response.body.data.rolePermissions).toBeDefined();
      expect(response.body.data.allPermissions).toBeDefined();
    });

    test('usuário deve obter próprio resumo de permissões', async () => {
      const response = await request(app)
        .get(`/api/permissions/user/${regularUserId}/summary`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(regularUserId);
    });

    test('usuário não deve obter resumo de permissões de outros', async () => {
      const response = await request(app)
        .get(`/api/permissions/user/${adminUserId}/summary`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/permissions/users-with/:permissionCode', () => {
    test('admin deve listar usuários com permissão específica', async () => {
      const response = await request(app)
        .get('/api/permissions/users-with/manage_users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(Array.isArray(response.body.data.users)).toBe(true);
      
      // Admin deve estar na lista
      const adminInList = response.body.data.users.some((user: any) => user.id === adminUserId);
      expect(adminInList).toBe(true);
    });

    test('usuário regular não deve poder listar usuários por permissão', async () => {
      const response = await request(app)
        .get('/api/permissions/users-with/manage_users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  // ================================================================
  // TESTES DE HIERARQUIA
  // ================================================================

  describe('POST /api/permissions/can-manage', () => {
    test('admin deve poder gerenciar usuário regular', async () => {
      const response = await request(app)
        .post('/api/permissions/can-manage')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          managerId: adminUserId,
          targetUserId: regularUserId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.canManage).toBe(true);
    });

    test('usuário regular não deve poder gerenciar admin', async () => {
      const response = await request(app)
        .post('/api/permissions/can-manage')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          managerId: regularUserId,
          targetUserId: adminUserId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.canManage).toBe(false);
    });
  });

  // ================================================================
  // TESTES SEM AUTENTICAÇÃO
  // ================================================================

  describe('Rotas protegidas sem token', () => {
    test('deve falhar ao verificar permissão sem token', async () => {
      const response = await request(app)
        .post('/api/permissions/check')
        .send({
          userId: regularUserId,
          permissionCode: 'view_users'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('deve falhar ao conceder permissão sem token', async () => {
      const response = await request(app)
        .post('/api/permissions/grant')
        .send({
          userId: regularUserId,
          permissionCode: 'view_reports'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});