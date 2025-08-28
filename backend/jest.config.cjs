// ====================================================================
// 🧪 JEST CONFIGURATION - DIGIURBAN BACKEND TESTS
// ====================================================================
// Configuração simplificada do Jest para TypeScript com CommonJS
// ====================================================================

/** @type {import('jest').Config} */
module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Preset do TypeScript
  preset: 'ts-jest',
  
  // Padrão de arquivos de teste
  testMatch: [
    '**/src/tests/**/*.test.ts',
    '**/src/tests/**/*.spec.ts'
  ],
  
  // Ignorar arquivos
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Setup para testes
  setupFilesAfterEnv: [
    '<rootDir>/src/tests/setup.ts'
  ],
  
  // Transform do TypeScript
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // Resolver módulos
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  
  // Coleta de cobertura
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/tests/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/types/**',
    '!src/**/*.d.ts'
  ],
  
  // Relatórios de cobertura
  coverageReporters: ['text', 'html', 'lcov'],
  coverageDirectory: 'coverage',
  
  // Timeout para testes
  testTimeout: 30000,
  
  // Configurações gerais
  verbose: false,
  silent: false,
  detectOpenHandles: true,
  forceExit: false,
  clearMocks: true,
  restoreMocks: true,
  
  // TypeScript Jest configuration
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true
      }
    }
  }
};