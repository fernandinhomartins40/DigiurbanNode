// ====================================================================
// 🧪 TESTES UNITÁRIOS - SERVIÇOS
// ====================================================================
// Testes unitários para os principais serviços
// Validação de lógica de negócio e funções críticas
// ====================================================================

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { UserModel } from '../../models/User.js';
import { TenantModel } from '../../models/Tenant.js';
import { AuthService } from '../../services/AuthService.js';
import { PermissionService } from '../../services/PermissionService.js';
import { ActivityService } from '../../services/ActivityService.js';
import { RegistrationService } from '../../services/RegistrationService.js';
// import { migrate } from '../../database/migrate.js'; // Removido - usando Knex nativo

describe('Services Unit Tests', () => {
  let testTenantId: string;
  let testUserId: string;
  let adminUserId: string;

  // ================================================================
  // CONFIGURAÇÃO DOS TESTES
  // ================================================================

  beforeAll(async () => {
    // await migrate(); // Removido - usando Knex nativo

    // Criar tenant de teste
    const tenant = await TenantModel.create({
      nome: 'Tenant Teste Services',
      email: 'services@teste.com',
      plano: 'empresarial',
      status: 'ativo'
    });
    testTenantId = tenant.id;

    // Criar usuário regular de teste
    const user = await UserModel.create({
      nome_completo: 'User Services Teste',
      email: 'userservices@teste.com',
      password: 'UserSenha123!',
      tenant_id: testTenantId,
      role: 'user',
      status: 'ativo'
    });
    testUserId = user.id;

    // Criar usuário admin de teste
    const admin = await UserModel.create({
      nome_completo: 'Admin Services Teste',
      email: 'adminservices@teste.com',
      password: 'AdminSenha123!',
      tenant_id: testTenantId,
      role: 'admin',
      status: 'ativo'
    });
    adminUserId = admin.id;
  });

  afterAll(async () => {
    // Limpeza após testes
    if (testUserId) await UserModel.delete(testUserId);
    if (adminUserId) await UserModel.delete(adminUserId);
    if (testTenantId) await TenantModel.delete(testTenantId);
  });

  // ================================================================
  // TESTES DO AUTH SERVICE
  // ================================================================

  describe('AuthService', () => {
    let validTokens: any;

    test('deve fazer login com credenciais válidas', async () => {
      const result = await AuthService.login({
        email: 'userservices@teste.com',
        password: 'UserSenha123!',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('userservices@teste.com');
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();

      validTokens = result.tokens;
    });

    test('deve falhar login com credenciais inválidas', async () => {
      await expect(AuthService.login({
        email: 'userservices@teste.com',
        password: 'senhaerrada',
        ipAddress: '127.0.0.1'
      })).rejects.toThrow();
    });

    test('deve validar token válido', async () => {
      const validation = await AuthService.validateToken(validTokens.accessToken);

      expect(validation.valid).toBe(true);
      expect(validation.user).toBeDefined();
      expect(validation.user!.id).toBe(testUserId);
    });

    test('deve falhar validação com token inválido', async () => {
      const validation = await AuthService.validateToken('token-invalido');

      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    test('deve renovar token com refresh token válido', async () => {
      const result = await AuthService.refreshToken({
        refreshToken: validTokens.refreshToken
      });

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    test('deve fazer logout corretamente', async () => {
      const result = await AuthService.logout(testUserId, validTokens.accessToken);

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });
  });

  // ================================================================
  // TESTES DO PERMISSION SERVICE
  // ================================================================

  describe('PermissionService', () => {
    test('admin deve ter permissões administrativas', async () => {
      const hasPermission = await PermissionService.hasPermission(adminUserId, 'manage_users');
      expect(hasPermission).toBe(true);
    });

    test('usuário regular não deve ter permissões administrativas', async () => {
      const hasPermission = await PermissionService.hasPermission(testUserId, 'manage_users');
      expect(hasPermission).toBe(false);
    });

    test('deve verificar múltiplas permissões corretamente', async () => {
      const hasAny = await PermissionService.hasAnyPermission(adminUserId, ['manage_users', 'invalid_permission']);
      expect(hasAny).toBe(true);

      const hasAll = await PermissionService.hasAllPermissions(testUserId, ['read_own_data', 'invalid_permission']);
      expect(hasAll).toBe(false);
    });

    test('deve verificar acesso a recursos', async () => {
      const canAccess = await PermissionService.canAccessResource(adminUserId, 'users', 'create');
      expect(canAccess).toBe(true);

      const cantAccess = await PermissionService.canAccessResource(testUserId, 'users', 'create');
      expect(cantAccess).toBe(false);
    });

    test('deve verificar hierarquia de usuários', async () => {
      const canManage = await PermissionService.canManageUser(adminUserId, testUserId);
      expect(canManage).toBe(true);

      const cantManage = await PermissionService.canManageUser(testUserId, adminUserId);
      expect(cantManage).toBe(false);
    });

    test('deve conceder e revogar permissões', async () => {
      // Conceder permissão
      const grantResult = await PermissionService.grantPermission(testUserId, 'view_reports', adminUserId);
      expect(grantResult.success).toBe(true);

      // Verificar se foi concedida
      const hasPermission = await PermissionService.hasPermission(testUserId, 'view_reports');
      expect(hasPermission).toBe(true);

      // Revogar permissão
      const revokeResult = await PermissionService.revokePermission(testUserId, 'view_reports', adminUserId);
      expect(revokeResult.success).toBe(true);

      // Verificar se foi revogada
      const hasPermissionAfter = await PermissionService.hasPermission(testUserId, 'view_reports');
      expect(hasPermissionAfter).toBe(false);
    });

    test('deve obter resumo de permissões do usuário', async () => {
      const summary = await PermissionService.getUserPermissionSummary(testUserId);

      expect(summary.userId).toBe(testUserId);
      expect(summary.role).toBe('user');
      expect(summary.directPermissions).toBeDefined();
      expect(summary.rolePermissions).toBeDefined();
      expect(summary.allPermissions).toBeDefined();
      expect(typeof summary.canAccess).toBe('function');
    });
  });

  // ================================================================
  // TESTES DO ACTIVITY SERVICE
  // ================================================================

  describe('ActivityService', () => {
    let testActivityId: number;

    test('deve registrar atividade corretamente', async () => {
      const activity = await ActivityService.log({
        user_id: testUserId,
        tenant_id: testTenantId,
        action: 'test_action',
        resource: 'test_resource',
        details: JSON.stringify({ test: 'data' }),
        ip_address: '127.0.0.1',
        user_agent: 'test-agent'
      });

      expect(activity.id).toBeDefined();
      expect(activity.user_id).toBe(testUserId);
      expect(activity.action).toBe('test_action');
      expect(activity.resource).toBe('test_resource');

      testActivityId = activity.id;
    });

    test('deve buscar atividades com filtros', async () => {
      const activities = await ActivityService.findActivities({
        user_id: testUserId,
        limit: 10
      });

      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeGreaterThan(0);

      const testActivity = activities.find(a => a.id === testActivityId);
      expect(testActivity).toBeDefined();
    });

    test('deve buscar atividades do usuário', async () => {
      const activities = await ActivityService.getUserActivities(testUserId, 5);

      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeGreaterThan(0);
      expect(activities.every(a => a.user_id === testUserId)).toBe(true);
    });

    test('deve gerar estatísticas de atividade', async () => {
      const stats = await ActivityService.getActivityStats(testTenantId, 7);

      expect(stats.totalActivities).toBeGreaterThanOrEqual(0);
      expect(stats.actionBreakdown).toBeDefined();
      expect(stats.userBreakdown).toBeDefined();
      expect(stats.resourceBreakdown).toBeDefined();
      expect(stats.dailyActivity).toBeDefined();
      expect(Array.isArray(stats.dailyActivity)).toBe(true);
    });

    test('deve identificar atividades suspeitas', async () => {
      // Registrar atividade suspeita
      await ActivityService.log({
        user_id: testUserId,
        tenant_id: testTenantId,
        action: 'login_failed',
        resource: 'auth',
        ip_address: '192.168.1.1'
      });

      const suspicious = await ActivityService.getSuspiciousActivities(testTenantId);

      expect(Array.isArray(suspicious)).toBe(true);
      // Deve conter pelo menos a atividade suspeita que acabamos de criar
      const hasSuspicious = suspicious.some(a => a.action === 'login_failed');
      expect(hasSuspicious).toBe(true);
    });

    test('deve usar métodos de conveniência para logs', async () => {
      // Teste log de login
      await ActivityService.logLogin(testUserId, testTenantId, '127.0.0.1', 'test-agent');

      // Teste log de logout
      await ActivityService.logLogout(testUserId, testTenantId);

      // Teste log CRUD
      await ActivityService.logCRUD('create', 'test_entity', '123', testUserId, testTenantId, {
        name: 'test'
      });

      // Verificar se os logs foram criados
      const activities = await ActivityService.getUserActivities(testUserId, 20);
      const hasLogin = activities.some(a => a.action === 'login');
      const hasLogout = activities.some(a => a.action === 'logout');
      const hasCrud = activities.some(a => a.action === 'create');

      expect(hasLogin).toBe(true);
      expect(hasLogout).toBe(true);
      expect(hasCrud).toBe(true);
    });
  });

  // ================================================================
  // TESTES DO REGISTRATION SERVICE
  // ================================================================

  describe('RegistrationService', () => {
    test('deve registrar novo usuário', async () => {
      const result = await RegistrationService.registerUser({
        nome_completo: 'Novo Usuário Teste',
        email: 'novousuario@teste.com',
        password: 'NovaSenha123!',
        tenant_id: testTenantId,
        role: 'user',
        ipAddress: '127.0.0.1'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('novousuario@teste.com');
      expect(result.requiresActivation).toBe(true);

      // Limpeza
      await UserModel.delete(result.user.id);
    });

    test('deve registrar novo tenant com admin', async () => {
      const result = await RegistrationService.registerTenant({
        nome: 'Novo Tenant Teste',
        email: 'novotenant@teste.com',
        plano: 'basico',
        admin_nome_completo: 'Admin Novo Tenant',
        admin_email: 'adminnovotenant@teste.com',
        admin_password: 'AdminNovo123!',
        ipAddress: '127.0.0.1'
      });

      expect(result.success).toBe(true);
      expect(result.tenant).toBeDefined();
      expect(result.admin).toBeDefined();
      expect(result.tenant.nome).toBe('Novo Tenant Teste');
      expect(result.admin.email).toBe('adminnovotenant@teste.com');

      // Limpeza
      await UserModel.delete(result.admin.id);
      await TenantModel.delete(result.tenant.id);
    });

    test('deve obter estatísticas de registro', async () => {
      const stats = await RegistrationService.getRegistrationStats(testTenantId);

      expect(stats.totalUsers).toBeGreaterThanOrEqual(0);
      expect(stats.activeUsers).toBeGreaterThanOrEqual(0);
      expect(stats.pendingUsers).toBeGreaterThanOrEqual(0);
      expect(stats.recentRegistrations).toBeGreaterThanOrEqual(0);
      expect(stats.registrationsByRole).toBeDefined();
    });

    test('deve validar dados de registro', async () => {
      // Teste com email já existente
      await expect(RegistrationService.registerUser({
        nome_completo: 'Usuário Duplicado',
        email: 'userservices@teste.com', // Email já existe
        password: 'SenhaDuplicada123!',
        tenant_id: testTenantId,
        role: 'user'
      })).rejects.toThrow();
    });
  });
});