import base from './packages/config/eslint/base.mjs';
import node from './packages/config/eslint/node.mjs';
import react from './packages/config/eslint/react.mjs';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '.expo/**',
      'android/**',
      'ios/**',
    ],
  },
  ...base,
  node,
  react,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
];
