// ====================================================================
// 🧪 CONFIGURAÇÃO JEST - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Configuração completa para testes unitários e de integração
// Suporte para TypeScript e ES modules
// ====================================================================

export default {
  // Configuração para ES modules
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Diretórios
  rootDir: '../',
  testMatch: [
    '<rootDir>/tests/**/*.test.ts'
  ],
  
  // Transformações
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ESNext'
      }
    }]
  },
  
  // Module name mapping para resolver imports .js
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // Configurações de coleta de cobertura
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/tests/**/*',
    '!src/database/migrations/**/*',
    '!src/database/seeds/**/*'
  ],
  
  // Relatórios de cobertura
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],
  
  // Limites de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Configurações de setup
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],
  
  // Timeout dos testes
  testTimeout: 30000,
  
  // Configurações verbosas
  verbose: true,
  
  // Cache
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Configurações de execução
  maxWorkers: '50%',
  
  // Ignorar arquivos e diretórios
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // Configurações específicas do módulo
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json'
  ],
  
  // Configurações de globals
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Configurações de transformação de módulos
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // Configurações de erro
  errorOnDeprecated: true,
  
  // Configurações de relatórios
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › '
    }]
  ]
};