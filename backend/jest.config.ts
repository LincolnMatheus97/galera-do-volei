import type { Config } from 'jest';

const config: Config = {
  // Configuração para aceitar imports do tipo ESM ("import ... from ...")
  preset: 'ts-jest/presets/default-esm', 
  testEnvironment: 'node',
  
  // Onde estão os testes?
  testMatch: ['**/tests/**/*.test.ts'],
  
  // Truque para o Jest entender os imports com ".js" que o TypeScript usa
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // Configurações do TS-Jest
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  
  verbose: true,       // Mostra detalhes
  forceExit: true,     // Fecha o banco depois de terminar
  clearMocks: true,
};

export default config;