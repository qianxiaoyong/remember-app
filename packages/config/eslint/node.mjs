import globals from 'globals';

export default {
  files: [
    'apps/api/**/*.{js,mjs,cjs,ts}',
    'packages/**/*.{js,mjs,cjs,ts}',
    'tools/**/*.{js,mjs,cjs,ts}',
  ],
  languageOptions: { globals: globals.node },
};
