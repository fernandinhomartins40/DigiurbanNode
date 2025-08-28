// ====================================================================
// 🏛️ TENANT MODEL - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Modelo de tenant (prefeituras/organizações)
// Gerenciamento multi-tenant com isolamento de dados
// ====================================================================

import { query, queryOne, execute } from '../database/connection.js';
import { v4 as uuidv4 } from 'uuid';

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
    
    const sql = `
      INSERT INTO tenants (
        id, tenant_code, nome, cidade, estado, cnpj, plano, status,
        populacao, endereco, responsavel_nome, responsavel_email, responsavel_telefone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      tenantCode,
      tenantData.nome,
      tenantData.cidade,
      tenantData.estado,
      this.cleanCNPJ(tenantData.cnpj),
      tenantData.plano || 'basico',
      tenantData.status || 'ativo',
      tenantData.populacao || null,
      tenantData.endereco || null,
      tenantData.responsavel_nome || null,
      tenantData.responsavel_email || null,
      tenantData.responsavel_telefone || null
    ];
    
    await execute(sql, params);
    
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
    const sql = 'SELECT * FROM tenants WHERE id = ?';
    const tenant = await queryOne(sql, [id]) as Tenant;
    return tenant || null;
  }
  
  static async findByCode(tenantCode: string): Promise<Tenant | null> {
    const sql = 'SELECT * FROM tenants WHERE tenant_code = ?';
    const tenant = await queryOne(sql, [tenantCode]) as Tenant;
    return tenant || null;
  }
  
  static async findByCNPJ(cnpj: string): Promise<Tenant | null> {
    const cleanedCNPJ = this.cleanCNPJ(cnpj);
    const sql = 'SELECT * FROM tenants WHERE cnpj = ?';
    const tenant = await queryOne(sql, [cleanedCNPJ]) as Tenant;
    return tenant || null;
  }
  
  static async findByCity(cidade: string, estado?: string): Promise<Tenant[]> {
    let sql = 'SELECT * FROM tenants WHERE LOWER(cidade) = LOWER(?)';
    const params = [cidade];
    
    if (estado) {
      sql += ' AND UPPER(estado) = UPPER(?)';
      params.push(estado);
    }
    
    sql += ' ORDER BY nome';
    return await query(sql, params) as Tenant[];
  }
  
  // ================================================================
  // ATUALIZAÇÃO DE TENANT
  // ================================================================
  
  static async update(id: string, updates: UpdateTenantData): Promise<Tenant> {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new Error('Tenant não encontrado');
    }
    
    // Construir query dinâmica
    const updateFields: string[] = [];
    const params: any[] = [];
    
    if (updates.nome) {
      updateFields.push('nome = ?');
      params.push(updates.nome);
    }
    
    if (updates.cidade) {
      updateFields.push('cidade = ?');
      params.push(updates.cidade);
    }
    
    if (updates.estado) {
      updateFields.push('estado = ?');
      params.push(updates.estado.toUpperCase());
    }
    
    if (updates.cnpj) {
      // Verificar se novo CNPJ já existe
      const existingTenant = await this.findByCNPJ(updates.cnpj);
      if (existingTenant && existingTenant.id !== id) {
        throw new Error('CNPJ já está em uso');
      }
      updateFields.push('cnpj = ?');
      params.push(this.cleanCNPJ(updates.cnpj));
    }
    
    if (updates.plano) {
      updateFields.push('plano = ?');
      params.push(updates.plano);
    }
    
    if (updates.status) {
      updateFields.push('status = ?');
      params.push(updates.status);
    }
    
    if (updates.populacao !== undefined) {
      updateFields.push('populacao = ?');
      params.push(updates.populacao);
    }
    
    if (updates.endereco !== undefined) {
      updateFields.push('endereco = ?');
      params.push(updates.endereco);
    }
    
    if (updates.responsavel_nome !== undefined) {
      updateFields.push('responsavel_nome = ?');
      params.push(updates.responsavel_nome);
    }
    
    if (updates.responsavel_email !== undefined) {
      updateFields.push('responsavel_email = ?');
      params.push(updates.responsavel_email);
    }
    
    if (updates.responsavel_telefone !== undefined) {
      updateFields.push('responsavel_telefone = ?');
      params.push(updates.responsavel_telefone);
    }
    
    if (updateFields.length === 0) {
      return tenant; // Nenhuma atualização
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const sql = `UPDATE tenants SET ${updateFields.join(', ')} WHERE id = ?`;
    await execute(sql, params);
    
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
    const sql = 'UPDATE tenants SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await execute(sql, ['suspenso', id]);
  }
  
  static async hardDelete(id: string): Promise<void> {
    const sql = 'DELETE FROM tenants WHERE id = ?';
    await execute(sql, [id]);
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
    let sql = 'SELECT * FROM tenants WHERE 1=1';
    const params: any[] = [];
    
    if (options.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }
    
    if (options.plano) {
      sql += ' AND plano = ?';
      params.push(options.plano);
    }
    
    if (options.estado) {
      sql += ' AND UPPER(estado) = UPPER(?)';
      params.push(options.estado);
    }
    
    sql += ' ORDER BY nome';
    
    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
      
      if (options.offset) {
        sql += ' OFFSET ?';
        params.push(options.offset);
      }
    }
    
    return await query(sql, params) as Tenant[];
  }
  
  static async count(filters: {
    status?: TenantStatus;
    plano?: TenantPlano;
    estado?: string;
  } = {}): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM tenants WHERE 1=1';
    const params: any[] = [];
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.plano) {
      sql += ' AND plano = ?';
      params.push(filters.plano);
    }
    
    if (filters.estado) {
      sql += ' AND UPPER(estado) = UPPER(?)';
      params.push(filters.estado);
    }
    
    const result = await queryOne(sql, params) as { count: number };
    return result.count;
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
    const statusStats = await query(`
      SELECT status, COUNT(*) as count 
      FROM tenants 
      GROUP BY status
    `) as { status: TenantStatus; count: number }[];
    
    const byStatus: Record<TenantStatus, number> = {
      ativo: 0,
      inativo: 0,
      suspenso: 0
    };
    
    statusStats.forEach(stat => {
      byStatus[stat.status] = stat.count;
    });
    
    // Por plano
    const planoStats = await query(`
      SELECT plano, COUNT(*) as count 
      FROM tenants 
      GROUP BY plano
    `) as { plano: TenantPlano; count: number }[];
    
    const byPlano: Record<TenantPlano, number> = {
      basico: 0,
      premium: 0,
      enterprise: 0
    };
    
    planoStats.forEach(stat => {
      byPlano[stat.plano] = stat.count;
    });
    
    // Por estado
    const estadoStats = await query(`
      SELECT estado, COUNT(*) as count 
      FROM tenants 
      GROUP BY estado 
      ORDER BY count DESC
    `) as { estado: string; count: number }[];
    
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
    const sql = 'SELECT COUNT(*) as count FROM users WHERE tenant_id = ? AND status != ?';
    const result = await queryOne(sql, [tenantId, 'inativo']) as { count: number };
    return result.count;
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
}

export default TenantModel;