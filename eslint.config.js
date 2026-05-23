import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import globals from 'globals';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [
      'helix-importer-ui/**',
      '**/*.min.js',
      '__extras/**',
      'scripts/aem.js',
      'scripts/scripts.js',
      'scripts/delayed.js',
      'scripts/vendor/**',
    ],
  },
  ...compat.extends('airbnb-base', 'prettier'),
  {
    files: ['eslint.config.js', 'vitest.config.js', 'playwright.config.js', '**/*.test.js', 'tests/**/*.js'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/no-unresolved': 'off',
    },
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'import/extensions': ['error', { js: 'always' }],
      'linebreak-style': ['error', 'unix'],
      'no-param-reassign': [2, { props: false }],
    },
  },
];
