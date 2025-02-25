import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transforms TypeScript files
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'], // Add ts and tsx extensions for Jest to recognize
  testMatch: ['**/*.test.ts'], // Adjust test file location if needed
  moduleNameMapper: {
    '@cosmjs/crypto': require.resolve('@cosmjs/crypto'),  // Ensure this points correctly
  }
};

export default config;
