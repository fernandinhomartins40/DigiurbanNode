// ====================================================================
// 🧪 SETUP DOS TESTES - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Configuração inicial para execução dos testes
// Setup de ambiente e limpeza de dados
// ====================================================================

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====================================================================
// CONFIGURAÇÃO DE AMBIENTE
// ====================================================================

// Carregar variáveis de ambiente para testes
dotenv.config({ 
  path: path.resolve(__dirname, '../../.env.test') 
});

// Configurações padrão para testes
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduzir logs durante testes
process.env.DATABASE_URL = process.env.DATABASE_URL || ':memory:'; // SQLite em memória

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
// CONFIGURAÇÕES DE BANCO DE DADOS PARA TESTES
// ====================================================================

// Mock para funções de tempo (se necessário)
beforeEach(() => {
  // Reset de mocks antes de cada teste
  jest.clearAllMocks();
});

// ====================================================================
// UTILITÁRIOS DE TESTE
// ====================================================================

// Função auxiliar para esperar um tempo determinado
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Função para gerar dados de teste aleatórios
export const generateTestData = {
  email: (): string => `test${Math.random().toString(36).substr(2, 9)}@teste.com`,
  password: (): string => `TestPass${Math.random().toString(36).substr(2, 4)}!`,
  name: (): string => `Test User ${Math.random().toString(36).substr(2, 5)}`,
  tenantName: (): string => `Test Tenant ${Math.random().toString(36).substr(2, 5)}`,
  uuid: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};

// Função para limpar dados de teste
export const cleanupTestData = {
  users: [] as string[],
  tenants: [] as string[],
  
  addUser: (userId: string) => {
    cleanupTestData.users.push(userId);
  },
  
  addTenant: (tenantId: string) => {
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