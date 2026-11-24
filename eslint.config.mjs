import eslint from '@eslint/js';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vitest from '@vitest/eslint-plugin';

const TEST_FILES = ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e-spec.ts', '**/*.int-spec.ts'];
const WEB_FILES = ['apps/web/**/*.{ts,tsx}'];
const MIN_SUPPRESSION_REASON_LENGTH = 10;

export default defineConfig(
  globalIgnores([
    '**/node_modules/',
    '**/dist/',
    '**/build/',
    '**/.next/',
    '**/coverage/',
    '**/generated/',
    '**/next-env.d.ts',
  ]),

  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,

  {
    plugins: { '@eslint-community/eslint-comments': eslintComments },
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
          minimumDescriptionLength: MIN_SUPPRESSION_REASON_LENGTH,
        },
      ],
      '@eslint-community/eslint-comments/require-description': 'error',
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@eslint-community/eslint-comments/disable-enable-pair': 'error',
      '@eslint-community/eslint-comments/no-aggregating-enable': 'error',
      '@eslint-community/eslint-comments/no-duplicate-disable': 'error',
      '@eslint-community/eslint-comments/no-unused-enable': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@nestjs/swagger',
              importNames: ['ApiExcludeEndpoint', 'ApiExcludeController', 'ApiIncludeEndpoint'],
              message: 'Every route must stay in the OpenAPI document, where its response schema is checked.',
            },
          ],
        },
      ],
    },
  },

  {
    files: WEB_FILES,
    extends: [nextVitals],
    languageOptions: { globals: { ...globals.browser } },
    settings: { next: { rootDir: 'apps/web/' } },
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    files: TEST_FILES,
    plugins: { vitest },
    languageOptions: { globals: { ...vitest.environments.env.globals } },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-disabled-tests': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/expect-expect': 'error',
      'vitest/no-conditional-expect': 'error',
    },
  },
);
