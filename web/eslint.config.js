import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    files: ['server.js'],
    ...js.configs.recommended,
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['public/app.js'],
    ...js.configs.recommended,
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
