import globals from 'globals';

export default {
  files: ['apps/mobile/**/*.{ts,tsx}', 'apps/admin/**/*.{ts,tsx}'],
  languageOptions: { globals: globals.browser },
};
