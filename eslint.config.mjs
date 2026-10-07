import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
    },
  },
  // Application layer (non-domain): no NestJS, no infrastructure, no presentation.
  // Use cases register via useFactory in presentation/modules.
  {
    files: ['src/application/**/*.ts'],
    ignores: ['src/application/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/**', '@infrastructure/**', '@presentation/**'],
              message:
                'Application layer must not depend on NestJS, infrastructure, or presentation.',
            },
          ],
        },
      ],
    },
  },
  // Domain layer: depends on nothing external.
  {
    files: ['src/application/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@nestjs/**',
                '@application/use-cases/**',
                '@application/ports/**',
                '@infrastructure/**',
                '@presentation/**',
              ],
              message:
                'Domain layer must not depend on NestJS, use cases, ports, infrastructure, or presentation.',
            },
          ],
        },
      ],
    },
  },
  // Infrastructure layer: no presentation.
  {
    files: ['src/infrastructure/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@presentation/**'],
              message: 'Infrastructure layer must not depend on presentation.',
            },
          ],
        },
      ],
    },
  },
);
