// ====================================================================
// 🏛️ TENANT MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo de tenant (prefeituras/organizações)
// Gerenciamento multi-tenant com isolamento de dados
// Migrado para Knex.js Query Builder
// ====================================================================

import { prisma } from '../database/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

export type TenantPlano = 'basico' | 'premium' | 'enterprise';
export type TenantStatus = 'ativo' | 'inativo' | 'suspenso';

export interface Tenant {
  id: string;
  tenantCode: string;
  nome: string;
  email: string;
  cidade: string;
  estado: string;
  cnpj: string;
  plano: TenantPlano;
  status: TenantStatus;
  populacao?: number;
  endereco?: string;
  responsavelNome?: string;
  responsavelEmail?: string;
  responsavelTelefone?: string;
  createdAt: Date | string;
  updatedAt: Date | string;

  // ====================================================================
  // NOVOS CAMPOS PARA SUPER ADMIN - FASE 1 (seguindo schema exato)
  // ====================================================================

  // Status do Admin
  hasAdmin?: boolean;
  adminConfirmed?: boolean;
  adminFirstLogin?: boolean;

  // Métricas e Limites
  limiteUsuarios?: number;
  valorMensal?: number;
  usuariosAtivos?: number;
  protocolosMes?: number;

  // Configurações e Métricas (JSON como String)
  configuracoes?: string;
  metricas?: string;
}

export interface CreateTenantData {
  nome: string;
  email: string;
  cidade: string;
  estado: string;
  cnpj: string;
  plano?: TenantPlano;
  status?: TenantStatus;
  populacao?: number;
  endereco?: string;
  responsavel_nome?: string;
  responsavel_email?: string;
  responsavel_telefone?: string;
}

export interface UpdateTenantData {
  nome?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  cnpj?: string;
  plano?: TenantPlano;
  status?: TenantStatus;
  populacao?: number;
  endereco?: string;
  responsavel_nome?: string;
  responsavel_email?: string;
  responsavel_telefone?: string;

  // ====================================================================
  // NOVOS CAMPOS PARA SUPER ADMIN - FASE 1 (seguindo schema exato)
  // ====================================================================

  // Status do Admin
  hasAdmin?: boolean;
  adminConfirmed?: boolean;
  adminFirstLogin?: boolean;

  // Métricas e Limites
  limiteUsuarios?: number;
  valorMensal?: number;
  usuariosAtivos?: number;
  protocolosMes?: number;

  // Configurações e Métricas (JSON como String)
  configuracoes?: string;
  metricas?: string;
}

// ====================================================================
// CONFIGURAÇÕES DE PLANOS
// ====================================================================

export const TENANT_PLANS = {
  basico: {
    name: 'Básico',
    max_users: 50,
    features: ['dashboard', 'protocols', 'reports'],
    price: 0
  },
  premium: {
    name: 'Premium',
    max_users: 200,
    features: ['dashboard', 'protocols', 'reports', 'api', 'integrations'],
    price: 299
  },
  enterprise: {
    name: 'Enterprise',
    max_users: -1, // Ilimitado
    features: ['all'],
    price: 999
  }
};

// ====================================================================
// CLASSE DO MODELO TENANT
// ====================================================================

export class TenantModel {
  
  // ================================================================
  // CRIAÇÃO DE TENANT
  // ================================================================
  
  static async create(tenantData: CreateTenantData): Promise<Tenant> {
    const id = uuidv4();
    
    // Validar dados
    this.validateTenantData(tenantData);
    
    // Verificar CNPJ único
    const existingTenant = await this.findByCNPJ(tenantData.cnpj);
    if (existingTenant) {
      throw new Error('CNPJ já está em uso');
    }
    
    // Gerar código único
    const tenantCode = await this.generateUniqueCode(tenantData.nome);
    
    // Usando prisma client diretamente;
    
    await prisma.tenant.create({
      data: {
        id,
        tenantCode: tenantCode,
        nome: tenantData.nome,
        email: tenantData.email,
        cidade: tenantData.cidade,
        estado: tenantData.estado,
        cnpj: this.cleanCNPJ(tenantData.cnpj),
        plano: tenantData.plano || 'basico',
        status: tenantData.status || 'ativo',
        populacao: tenantData.populacao || null,
        endereco: tenantData.endereco || null,
        responsavelNome: tenantData.responsavel_nome || null,
        responsavelEmail: tenantData.responsavel_email || null,
        responsavelTelefone: tenantData.responsavel_telefone || null
      }
    });
    
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new Error('Erro ao criar tenant');
    }
    
    return tenant;
  }
  
  // ================================================================
  // BUSCA DE TENANTS
  // ================================================================
  
  static async findById(id: string): Promise<Tenant | null> {
    // Usando prisma client diretamente;
    const tenant = await prisma.tenant.findUnique({
      where: { id }
    }) as Tenant | null;
    return tenant;
  }
  
  static async findByCode(tenantCode: string): Promise<Tenant | null> {
    // Usando prisma client diretamente;
    const tenant = await prisma.tenant.findUnique({
      where: { tenantCode: tenantCode }
    }) as Tenant | null;
    return tenant;
  }
  
  static async findByCNPJ(cnpj: string): Promise<Tenant | null> {
    const cleanedCNPJ = this.cleanCNPJ(cnpj);
    // Usando prisma client diretamente;
    const tenant = await prisma.tenant.findUnique({
      where: { cnpj: cleanedCNPJ }
    }) as Tenant | null;
    return tenant;
  }
  
  static async findByCity(cidade: string, estado?: string): Promise<Tenant[]> {
    // Usando prisma client diretamente;
    const whereClause: any = {
      cidade: {
        equals: cidade,
        mode: 'insensitive'
      }
    };

    if (estado) {
      whereClause.estado = {
        equals: estado,
        mode: 'insensitive'
      };
    }

    return await prisma.tenant.findMany({
      where: whereClause,
      orderBy: { nome: 'asc' }
    }) as Tenant[];
  }
  
  // ================================================================
  // ATUALIZAÇÃO DE TENANT
  // ================================================================
  
  static async update(id: string, updates: UpdateTenantData): Promise<Tenant> {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new Error('Tenant não encontrado');
    }
    
    // Verificar se novo CNPJ já existe
    if (updates.cnpj) {
      const existingTenant = await this.findByCNPJ(updates.cnpj);
      if (existingTenant && existingTenant.id !== id) {
        throw new Error('CNPJ já está em uso');
      }
    }
    
    // Verificar se há atualizações
    const hasUpdates = Object.keys(updates).length > 0;
    if (!hasUpdates) {
      return tenant; // Nenhuma atualização
    }
    
    // Usando prisma client diretamente;
    const updateData: any = {};
    
    if (updates.nome) updateData.nome = updates.nome;
    if (updates.cidade) updateData.cidade = updates.cidade;
    if (updates.estado) updateData.estado = updates.estado.toUpperCase();
    if (updates.cnpj) updateData.cnpj = this.cleanCNPJ(updates.cnpj);
    if (updates.plano) updateData.plano = updates.plano;
    if (updates.status) updateData.status = updates.status;
    if (updates.populacao !== undefined) updateData.populacao = updates.populacao;
    if (updates.endereco !== undefined) updateData.endereco = updates.endereco;
    if (updates.responsavel_nome !== undefined) updateData.responsavelNome = updates.responsavel_nome;
    if (updates.responsavel_email !== undefined) updateData.responsavelEmail = updates.responsavel_email;
    if (updates.responsavel_telefone !== undefined) updateData.responsavelTelefone = updates.responsavel_telefone;

    // ====================================================================
    // NOVOS CAMPOS PARA SUPER ADMIN - FASE 1 (seguindo schema exato)
    // ====================================================================

    // Status do Admin
    if (updates.hasAdmin !== undefined) updateData.hasAdmin = updates.hasAdmin;
    if (updates.adminConfirmed !== undefined) updateData.adminConfirmed = updates.adminConfirmed;
    if (updates.adminFirstLogin !== undefined) updateData.adminFirstLogin = updates.adminFirstLogin;

    // Métricas e Limites
    if (updates.limiteUsuarios !== undefined) updateData.limiteUsuarios = updates.limiteUsuarios;
    if (updates.valorMensal !== undefined) updateData.valorMensal = updates.valorMensal;
    if (updates.usuariosAtivos !== undefined) updateData.usuariosAtivos = updates.usuariosAtivos;
    if (updates.protocolosMes !== undefined) updateData.protocolosMes = updates.protocolosMes;

    // Configurações e Métricas
    if (updates.configuracoes !== undefined) updateData.configuracoes = updates.configuracoes;
    if (updates.metricas !== undefined) updateData.metricas = updates.metricas;

    updateData.updatedAt = new Date();

    await prisma.tenant.update({
      where: { id },
      data: updateData
    });
    
    const updatedTenant = await this.findById(id);
    if (!updatedTenant) {
      throw new Error('Erro ao atualizar tenant');
    }
    
    return updatedTenant;
  }
  
  // ================================================================
  // SOFT DELETE
  // ================================================================
  
  static async softDelete(id: string): Promise<void> {
    // Usando prisma client diretamente;
    await prisma.tenant.update({
      where: { id },
      data: {
        status: 'suspenso',
        updatedAt: new Date()
      }
    });
  }
  
  static async hardDelete(id: string): Promise<void> {
    // Usando prisma client diretamente;
    await prisma.tenant.delete({
      where: { id }
    });
  }
  
  // ================================================================
  // LISTAGEM E PAGINAÇÃO
  // ================================================================
  
  static async list(options: {
    limit?: number;
    offset?: number;
    status?: TenantStatus;
    plano?: TenantPlano;
    estado?: string;
  } = {}): Promise<Tenant[]> {
    // Usando prisma client diretamente;
    const whereClause: any = {};

    if (options.status) {
      whereClause.status = options.status;
    }

    if (options.plano) {
      whereClause.plano = options.plano;
    }

    if (options.estado) {
      whereClause.estado = {
        equals: options.estado,
        mode: 'insensitive'
      };
    }

    const queryOptions: any = {
      where: whereClause,
      orderBy: { nome: 'asc' }
    };

    if (options.limit) {
      queryOptions.take = options.limit;

      if (options.offset) {
        queryOptions.skip = options.offset;
      }
    }

    return await prisma.tenant.findMany(queryOptions) as Tenant[];
  }
  
  static async count(filters: {
    status?: TenantStatus;
    plano?: TenantPlano;
    estado?: string;
  } = {}): Promise<number> {
    // Usando prisma client diretamente;
    const whereClause: any = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.plano) {
      whereClause.plano = filters.plano;
    }

    if (filters.estado) {
      whereClause.estado = {
        equals: filters.estado,
        mode: 'insensitive'
      };
    }

    return await prisma.tenant.count({
      where: whereClause
    });
  }
  
  // ================================================================
  // ESTATÍSTICAS
  // ================================================================
  
  static async getStats(): Promise<{
    total: number;
    byStatus: Record<TenantStatus, number>;
    byPlano: Record<TenantPlano, number>;
    byEstado: Record<string, number>;
  }> {
    // Total
    const total = await this.count();
    
    // Por status
    // Usando prisma client diretamente;
    const statusStats = await prisma.tenant.groupBy({
      by: ['status'],
      _count: { _all: true }
    });
    
    const byStatus: Record<TenantStatus, number> = {
      ativo: 0,
      inativo: 0,
      suspenso: 0
    };
    
    statusStats.forEach(stat => {
      byStatus[stat.status as TenantStatus] = stat._count._all;
    });
    
    // Por plano
    const planoStats = await prisma.tenant.groupBy({
      by: ['plano'],
      _count: { _all: true }
    });
    
    const byPlano: Record<TenantPlano, number> = {
      basico: 0,
      premium: 0,
      enterprise: 0
    };
    
    planoStats.forEach(stat => {
      byPlano[stat.plano as TenantPlano] = stat._count._all;
    });
    
    // Por estado
    const estadoStats = await (prisma.tenant.groupBy as any)({
      by: ['estado'],
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } }
    });
    
    const byEstado: Record<string, number> = {};
    estadoStats.forEach(stat => {
      byEstado[stat.estado] = stat._count._all;
    });
    
    return {
      total,
      byStatus,
      byPlano,
      byEstado
    };
  }
  
  // ================================================================
  // GERAÇÃO DE CÓDIGO ÚNICO
  // ================================================================
  
  static async generateUniqueCode(nome: string): Promise<string> {
    // Criar código base (primeiras 3 letras + 3 dígitos)
    const baseCode = nome
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .substring(0, 3)
      .padEnd(3, 'A');
    
    // Tentar códigos sequenciais até encontrar um único
    for (let i = 1; i <= 999; i++) {
      const code = `${baseCode}${i.toString().padStart(3, '0')}`;
      
      const existing = await this.findByCode(code);
      if (!existing) {
        return code;
      }
    }
    
    // Fallback: usar timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `TEN${timestamp}`;
  }
  
  // ================================================================
  // VALIDAÇÕES E UTILITÁRIOS
  // ================================================================
  
  private static validateTenantData(tenantData: CreateTenantData): void {
    if (!tenantData.nome || tenantData.nome.trim().length < 2) {
      throw new Error('Nome é obrigatório (mínimo 2 caracteres)');
    }
    
    if (!tenantData.cidade || tenantData.cidade.trim().length < 2) {
      throw new Error('Cidade é obrigatória (mínimo 2 caracteres)');
    }
    
    if (!tenantData.estado || tenantData.estado.trim().length !== 2) {
      throw new Error('Estado deve ter 2 caracteres (sigla)');
    }
    
    if (!tenantData.cnpj || !this.isValidCNPJ(tenantData.cnpj)) {
      throw new Error('CNPJ inválido');
    }
  }
  
  private static cleanCNPJ(cnpj: string): string {
    return cnpj.replace(/[^\d]/g, '');
  }
  
  private static isValidCNPJ(cnpj: string): boolean {
    const cleaned = this.cleanCNPJ(cnpj);
    
    if (cleaned.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleaned)) return false; // Todos iguais
    
    // Validação dos dígitos verificadores
    let sum = 0;
    let weight = 2;
    
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleaned[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    sum = 0;
    weight = 2;
    
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleaned[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return digit1 === parseInt(cleaned[12]) && digit2 === parseInt(cleaned[13]);
  }
  
  // ================================================================
  // VERIFICAÇÕES DE PLANO
  // ================================================================
  
  static async getUserCount(tenant_id: string): Promise<number> {
    // Usando prisma client diretamente;
    return await prisma.user.count({
      where: {
        tenantId: tenant_id,
        status: { not: 'inativo' }
      }
    });
  }
  
  static async canAddUser(tenant_id: string): Promise<boolean> {
    const tenant = await this.findById(tenant_id);
    if (!tenant) return false;
    
    const plan = TENANT_PLANS[tenant.plano];
    if (plan.max_users === -1) return true; // Ilimitado
    
    const userCount = await this.getUserCount(tenant_id);
    return userCount < plan.max_users;
  }
  
  static async hasFeature(tenant_id: string, feature: string): Promise<boolean> {
    const tenant = await this.findById(tenant_id);
    if (!tenant) return false;
    
    const plan = TENANT_PLANS[tenant.plano];
    return plan.features.includes('all') || plan.features.includes(feature);
  }
  
  static async updateTenant(id: string, updates: UpdateTenantData): Promise<Tenant> {
    return this.update(id, updates);
  }
  
  static async checkCnpjExists(cnpj: string): Promise<boolean> {
    const existing = await this.findByCNPJ(cnpj);
    return existing !== null;
  }
  
  static async generateUniqueTenantCode(nome: string = 'DEFAULT'): Promise<string> {
    return this.generateUniqueCode(nome);
  }
  
  static async createTenant(data: CreateTenantData): Promise<Tenant> {
    return this.create(data);
  }
  
  static async getTenants(options: any = {}): Promise<{ tenants: Tenant[], total: number }> {
    const tenants = await this.list(options);
    const total = await this.count(options);
    return { tenants, total };
  }
  
  static async getTenantById(id: string): Promise<Tenant | null> {
    return this.findById(id);
  }
  
  static async checkCodeExists(code: string): Promise<boolean> {
    const existing = await this.findByCode(code);
    return existing !== null;
  }

  /**
   * Obter estatísticas básicas de tenants para métricas SaaS
   */
  static async getTenantStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    try {
      // Usando prisma client diretamente;
      const [total, active, inactive] = await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { status: 'ativo' } }),
        prisma.tenant.count({ where: { status: { not: 'ativo' } } })
      ]);

      return {
        total: total || 0,
        active: active || 0,
        inactive: inactive || 0
      };
    } catch (error) {
      StructuredLogger.error('Erro ao obter estatísticas de tenants', error as Error);
      return { total: 0, active: 0, inactive: 0 };
    }
  }

  // ====================================================================
  // MÉTODOS PARA NOVOS CAMPOS - FASE 1 (seguindo schema exato)
  // ====================================================================

  /**
   * Método para buscar tenants com todos os campos, incluindo novos
   */
  static async findMany(options: {
    select?: any;
    where?: any;
    include?: any;
  } = {}): Promise<Tenant[]> {
    return await prisma.tenant.findMany(options) as Tenant[];
  }

  /**
   * Método para buscar tenant único com opções
   */
  static async findUnique(options: {
    where: any;
    select?: any;
    include?: any;
  }): Promise<Tenant | null> {
    return await prisma.tenant.findUnique(options) as Tenant | null;
  }

  /**
   * Atualizar status do admin do tenant
   */
  static async updateAdminStatus(id: string, hasAdmin: boolean, adminConfirmed?: boolean, adminFirstLogin?: boolean): Promise<Tenant> {
    const updateData: any = { hasAdmin, updatedAt: new Date() };

    if (adminConfirmed !== undefined) updateData.adminConfirmed = adminConfirmed;
    if (adminFirstLogin !== undefined) updateData.adminFirstLogin = adminFirstLogin;

    await prisma.tenant.update({
      where: { id },
      data: updateData
    });

    const updatedTenant = await this.findById(id);
    if (!updatedTenant) throw new Error('Erro ao atualizar status do admin');

    return updatedTenant;
  }

  /**
   * Atualizar métricas do tenant
   */
  static async updateMetrics(id: string, usuariosAtivos: number, protocolosMes: number): Promise<Tenant> {
    await prisma.tenant.update({
      where: { id },
      data: {
        usuariosAtivos,
        protocolosMes,
        updatedAt: new Date()
      }
    });

    const updatedTenant = await this.findById(id);
    if (!updatedTenant) throw new Error('Erro ao atualizar métricas');

    return updatedTenant;
  }

  /**
   * Atualizar configurações do tenant (JSON)
   */
  static async updateConfiguracoes(id: string, configuracoes: any): Promise<Tenant> {
    await prisma.tenant.update({
      where: { id },
      data: {
        configuracoes: JSON.stringify(configuracoes),
        updatedAt: new Date()
      }
    });

    const updatedTenant = await this.findById(id);
    if (!updatedTenant) throw new Error('Erro ao atualizar configurações');

    return updatedTenant;
  }

  /**
   * Obter configurações parseadas
   */
  static parseConfiguracoes(tenant: Tenant): any {
    if (!tenant.configuracoes) return {};
    try {
      return JSON.parse(tenant.configuracoes);
    } catch {
      return {};
    }
  }

  /**
   * Obter métricas parseadas
   */
  static parseMetricas(tenant: Tenant): any {
    if (!tenant.metricas) return {};
    try {
      return JSON.parse(tenant.metricas);
    } catch {
      return {};
    }
  }
}

export default TenantModel;