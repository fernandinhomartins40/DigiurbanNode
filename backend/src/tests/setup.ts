// ====================================================================
// 🧪 SETUP DOS TESTES OTIMIZADO - DIGIURBAN SYSTEM
// ====================================================================
// Configuração inicial para execução dos testes com SQLite otimizado
// Setup de ambiente, database em memória e limpeza automatizada
// ====================================================================

import dotenv from 'dotenv';
import path from 'path';
import { prisma } from '../database/prisma.js';
import { StructuredLogger } from '../monitoring/structuredLogger.js';

// ====================================================================
// CONFIGURAÇÃO DE AMBIENTE
// ====================================================================

// Carregar variáveis de ambiente para testes
dotenv.config({ 
  path: path.resolve(__dirname, '../../.env.test') 
});

// Configurações padrão para testes
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.DATABASE_PATH = ':memory:'; // SQLite em memória para testes
process.env.SQLITE_CACHE_SIZE = '1000'; // Cache menor para testes
process.env.SQLITE_POOL_SIZE = '3'; // Pool menor para testes

// ====================================================================
// CONFIGURAÇÕES GLOBAIS DE TESTE
// ====================================================================

// Configurar timeouts mais longos se necessário
jest.setTimeout(30000);

// Configurar timezone para consistência
process.env.TZ = 'America/Sao_Paulo';

// ====================================================================
// MOCKS GLOBAIS
// ====================================================================

// Mock para console em testes (reduzir ruído)
const originalConsole = { ...console };

beforeAll(() => {
  // Silenciar logs durante testes, exceto erros críticos
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  // Manter console.error para debug quando necessário
});

afterAll(() => {
  // Restaurar console original
  Object.assign(console, originalConsole);
});

// ====================================================================
// SETUP DE BANCO DE DADOS PARA TESTES
// ====================================================================

// Variável removida - usando conexão direta do prisma()

export const setupTestDatabase = async (): Promise<void> => {
  try {
    // Inicializar conexão de testes
    const db = await prisma();
    
    // Executar migrations básicas para testes
    await new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        db.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            tenant_id TEXT,
            nome_completo TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            status TEXT DEFAULT 'ativo',
            avatar_url TEXT,
            ultimo_login DATETIME,
            failed_login_attempts INTEGER DEFAULT 0,
            locked_until DATETIME,
            email_verified BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }

          db.exec(`
            CREATE TABLE IF NOT EXISTS tenants (
              id TEXT PRIMARY KEY,
              tenant_code TEXT UNIQUE NOT NULL,
              nome TEXT NOT NULL,
              cidade TEXT NOT NULL,
              estado TEXT NOT NULL,
              cnpj TEXT UNIQUE NOT NULL,
              plano TEXT DEFAULT 'basico',
              status TEXT DEFAULT 'ativo',
              populacao INTEGER,
              endereco TEXT,
              responsavel_nome TEXT,
              responsavel_email TEXT,
              responsavel_telefone TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) {
              reject(err);
              return;
            }

            // Criar índices básicos
            db.exec(`
              CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
              CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
              CREATE INDEX IF NOT EXISTS idx_tenants_code ON tenants(tenant_code);
            `, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        });
      });
    });
    
    StructuredLogger.info('Database de teste inicializado');
  } catch (error) {
    StructuredLogger.error('Erro ao inicializar database de teste', error);
    throw error;
  }
};

export const cleanupTestDatabase = async (): Promise<void> => {
  try {
    const db = await prisma();
    
    // Limpar todas as tabelas usando promises
    await new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        db.run('DELETE FROM users', (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          db.run('DELETE FROM tenants', (err) => {
            if (err) {
              reject(err);
              return;
            }
            
            // Reset auto-increment se necessário
            db.run('DELETE FROM sqlite_sequence WHERE name IN ("users", "tenants")', (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        });
      });
    });
    
    StructuredLogger.debug('Database de teste limpo');
  } catch (error) {
    StructuredLogger.error('Erro ao limpar database de teste', error);
  }
};

export const teardownTestDatabase = async (): Promise<void> => {
  try {
    // Para testes, não fechamos a conexão principal, apenas limpamos
    // A conexão será fechada quando o processo de teste terminar
    StructuredLogger.info('Database de teste finalizado');
  } catch (error) {
    StructuredLogger.error('Erro ao finalizar database de teste', error);
  }
};

// Setup e cleanup automáticos
beforeAll(async () => {
  await setupTestDatabase();
});

beforeEach(async () => {
  // Reset de mocks e limpar dados antes de cada teste
  jest.clearAllMocks();
  await cleanupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

// ====================================================================
// UTILITÁRIOS DE TESTE OTIMIZADOS
// ====================================================================

// Função auxiliar para esperar um tempo determinado
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Gerador de dados de teste com validações
export const generateTestData = {
  email: (): string => `test${Date.now()}${Math.random().toString(36).substr(2, 5)}@teste.com`,
  
  password: (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let result = 'Test';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  name: (): string => `Test User ${Date.now().toString().slice(-6)}`,
  
  tenantName: (): string => `Test Tenant ${Date.now().toString().slice(-6)}`,
  
  cnpj: (): string => {
    // Gerar CNPJ válido para testes
    const base = '12345678000';
    const digits = this.calculateCNPJDigits(base);
    return base + digits;
  },
  
  calculateCNPJDigits: (base: string): string => {
    // Algoritmo simplificado para gerar dígitos válidos
    let sum = 0;
    let weight = 2;
    
    for (let i = base.length - 1; i >= 0; i--) {
      sum += parseInt(base[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    sum = 0;
    weight = 2;
    const baseWithDigit1 = base + digit1;
    
    for (let i = baseWithDigit1.length - 1; i >= 0; i--) {
      sum += parseInt(baseWithDigit1[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return `${digit1}${digit2}`;
  },
  
  uuid: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // Gerar dados completos de usuário para teste
  user: (overrides: any = {}) => ({
    nome_completo: generateTestData.name(),
    email: generateTestData.email(),
    password: generateTestData.password(),
    role: 'user',
    status: 'ativo',
    ...overrides
  }),

  // Gerar dados completos de tenant para teste
  tenant: (overrides: any = {}) => ({
    nome: generateTestData.tenantName(),
    cidade: 'São Paulo',
    estado: 'SP',
    cnpj: generateTestData.cnpj(),
    plano: 'basico',
    status: 'ativo',
    ...overrides
  })
};

// Função para limpar dados de teste
export const cleanupTestData = {
  users: [] as string[],
  tenants: [] as string[],
  
  addUser: (user_id: string) => {
    cleanupTestData.users.push(userId);
  },
  
  addTenant: (tenant_id: string) => {
    cleanupTestData.tenants.push(tenantId);
  },
  
  reset: () => {
    cleanupTestData.users = [];
    cleanupTestData.tenants = [];
  }
};

// ====================================================================
// CONFIGURAÇÃO DE LIMPEZA APÓS TESTES
// ====================================================================

afterEach(async () => {
  // Limpeza automática de dados de teste (se implementado)
  // Esta função pode ser expandida para limpar dados específicos
  
  // Reset do estado de cleanup
  cleanupTestData.reset();
});

// ====================================================================
// CONFIGURAÇÕES DE SEGURANÇA PARA TESTES
// ====================================================================

// Desabilitar verificações de rate limiting durante testes
process.env.DISABLE_RATE_LIMITING = 'true';

// Usar configurações de JWT mais simples para testes
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// ====================================================================
// CONFIGURAÇÕES DE EMAIL PARA TESTES
// ====================================================================

// Desabilitar envio de emails reais durante testes
process.env.DISABLE_EMAIL_SENDING = 'true';
process.env.EMAIL_PROVIDER = 'test';

console.info('🧪 Setup de testes configurado com sucesso');
console.info(`📁 Ambiente: ${process.env.NODE_ENV}`);
console.info(`🗄️  Banco: ${process.env.DATABASE_URL}`);