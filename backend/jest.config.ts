import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testTimeout: 30000,
  setupFiles: ['<rootDir>/src/__tests__/setup.env.ts'],
};

export default config;
