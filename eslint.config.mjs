import base from './packages/config/eslint/base.mjs';
import node from './packages/config/eslint/node.mjs';
import react from './packages/config/eslint/react.mjs';
import vitest from '@vitest/eslint-plugin';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '.expo/**',
      'android/**',
      'ios/**',
      'apps/mobile/plugins/**',
      'apps/api/scripts/**',
    ],
  },
  ...base,
  node,
  react,
  {
    files: ['apps/**/*.test.{ts,tsx}', 'packages/**/*.test.{ts,tsx}'],
    ...vitest.configs.recommended,
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-disabled-tests': 'error',
      'vitest/no-focused-tests': 'error',
    },
  },
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['apps/api/src/**/*.ts'],
    rules: {
      'max-params': ['error', 4],
    },
  },
  {
    files: ['apps/mobile/app.config.js'],
    languageOptions: { globals: globals.node },
  },
];
