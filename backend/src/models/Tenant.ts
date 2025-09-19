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
  tenant_code: string;
  nome: string;
  cidade: string;
  estado: string;
  cnpj: string;
  plano: TenantPlano;
  status: TenantStatus;
  populacao?: number;
  endereco?: string;
  responsavel_nome?: string;
  responsavel_email?: string;
  responsavel_telefone?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantData {
  nome: string;
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
    
    await db('tenants').insert({
      id,
      tenant_code: tenantCode,
      nome: tenantData.nome,
      cidade: tenantData.cidade,
      estado: tenantData.estado,
      cnpj: this.cleanCNPJ(tenantData.cnpj),
      plano: tenantData.plano || 'basico',
      status: tenantData.status || 'ativo',
      populacao: tenantData.populacao || null,
      endereco: tenantData.endereco || null,
      responsavel_nome: tenantData.responsavel_nome || null,
      responsavel_email: tenantData.responsavel_email || null,
      responsavel_telefone: tenantData.responsavel_telefone || null
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
    const tenant = await db('tenants')
      .where('id', id)
      .first() as Tenant | undefined;
    return tenant || null;
  }
  
  static async findByCode(tenantCode: string): Promise<Tenant | null> {
    // Usando prisma client diretamente;
    const tenant = await db('tenants')
      .where('tenant_code', tenantCode)
      .first() as Tenant | undefined;
    return tenant || null;
  }
  
  static async findByCNPJ(cnpj: string): Promise<Tenant | null> {
    const cleanedCNPJ = this.cleanCNPJ(cnpj);
    // Usando prisma client diretamente;
    const tenant = await db('tenants')
      .where('cnpj', cleanedCNPJ)
      .first() as Tenant | undefined;
    return tenant || null;
  }
  
  static async findByCity(cidade: string, estado?: string): Promise<Tenant[]> {
    // Usando prisma client diretamente;
    let query = db('tenants')
      .whereRaw('LOWER(cidade) = LOWER(?)', [cidade]);
    
    if (estado) {
      query = query.whereRaw('UPPER(estado) = UPPER(?)', [estado]);
    }
    
    return await query.orderBy('nome') as Tenant[];
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
    if (updates.responsavel_nome !== undefined) updateData.responsavel_nome = updates.responsavel_nome;
    if (updates.responsavel_email !== undefined) updateData.responsavel_email = updates.responsavel_email;
    if (updates.responsavel_telefone !== undefined) updateData.responsavel_telefone = updates.responsavel_telefone;
    
    updateData.updated_at = db.fn.now();
    
    await db('tenants')
      .where('id', id)
      .update(updateData);
    
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
    await db('tenants')
      .where('id', id)
      .update({
        status: 'suspenso',
        updated_at: db.fn.now()
      });
  }
  
  static async hardDelete(id: string): Promise<void> {
    // Usando prisma client diretamente;
    await db('tenants')
      .where('id', id)
      .del();
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
    let query = db('tenants').select('*');
    
    if (options.status) {
      query = query.where('status', options.status);
    }
    
    if (options.plano) {
      query = query.where('plano', options.plano);
    }
    
    if (options.estado) {
      query = query.whereRaw('UPPER(estado) = UPPER(?)', [options.estado]);
    }
    
    query = query.orderBy('nome');
    
    if (options.limit) {
      query = query.limit(options.limit);
      
      if (options.offset) {
        query = query.offset(options.offset);
      }
    }
    
    return await query as Tenant[];
  }
  
  static async count(filters: {
    status?: TenantStatus;
    plano?: TenantPlano;
    estado?: string;
  } = {}): Promise<number> {
    // Usando prisma client diretamente;
    let query = db('tenants');
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.plano) {
      query = query.where('plano', filters.plano);
    }
    
    if (filters.estado) {
      query = query.whereRaw('UPPER(estado) = UPPER(?)', [filters.estado]);
    }
    
    const result = await query.count('* as total').first() as { total: number };
    return result.total;
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
    const statusStats = await db('tenants')
      .select('status', db.raw('COUNT(*) as count'))
      .groupBy('status') as { status: TenantStatus; count: number }[];
    
    const byStatus: Record<TenantStatus, number> = {
      ativo: 0,
      inativo: 0,
      suspenso: 0
    };
    
    statusStats.forEach(stat => {
      byStatus[stat.status] = stat.count;
    });
    
    // Por plano
    const planoStats = await db('tenants')
      .select('plano', db.raw('COUNT(*) as count'))
      .groupBy('plano') as { plano: TenantPlano; count: number }[];
    
    const byPlano: Record<TenantPlano, number> = {
      basico: 0,
      premium: 0,
      enterprise: 0
    };
    
    planoStats.forEach(stat => {
      byPlano[stat.plano] = stat.count;
    });
    
    // Por estado
    const estadoStats = await db('tenants')
      .select('estado', db.raw('COUNT(*) as count'))
      .groupBy('estado')
      .orderBy('count', 'desc') as { estado: string; count: number }[];
    
    const byEstado: Record<string, number> = {};
    estadoStats.forEach(stat => {
      byEstado[stat.estado] = stat.count;
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
  
  static async getUserCount(tenantId: string): Promise<number> {
    // Usando prisma client diretamente;
    const result = await db('users')
      .where('tenant_id', tenantId)
      .where('status', '!=', 'inativo')
      .count('* as total')
      .first() as { total: number };
    return result.total;
  }
  
  static async canAddUser(tenantId: string): Promise<boolean> {
    const tenant = await this.findById(tenantId);
    if (!tenant) return false;
    
    const plan = TENANT_PLANS[tenant.plano];
    if (plan.max_users === -1) return true; // Ilimitado
    
    const userCount = await this.getUserCount(tenantId);
    return userCount < plan.max_users;
  }
  
  static async hasFeature(tenantId: string, feature: string): Promise<boolean> {
    const tenant = await this.findById(tenantId);
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
      const result = await db('tenants')
        .select(
          db.raw('COUNT(*) as total'),
          db.raw('SUM(CASE WHEN status = "ativo" THEN 1 ELSE 0 END) as active'),
          db.raw('SUM(CASE WHEN status != "ativo" THEN 1 ELSE 0 END) as inactive')
        )
        .first();

      const stats = result as any;
      return {
        total: Number(stats?.total) || 0,
        active: Number(stats?.active) || 0,
        inactive: Number(stats?.inactive) || 0
      };
    } catch (error) {
      StructuredLogger.error('Erro ao obter estatísticas de tenants', error as Error);
      return { total: 0, active: 0, inactive: 0 };
    }
  }
}

export default TenantModel;