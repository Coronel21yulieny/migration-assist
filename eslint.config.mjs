// eslint.config.mjs (Flat config ESLint)
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import next from 'eslint-config-next';

export default [
  // Ignorar carpetas generadas
  { ignores: ['.next/*', 'node_modules/*'] },

  // Config base de Next.js
  ...next,

  // Reglas para TypeScript
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // ❗ Quita los bloqueos por "any" mientras tipamos con calma
      '@typescript-eslint/no-explicit-any': 'off',

      // Permite ts-expect-error con descripción (mejor que ts-ignore)
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        { 'ts-expect-error': 'allow-with-description' }
      ],
    },
  },
];
