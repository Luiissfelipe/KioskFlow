import { defineConfig } from 'vitest/config';

const DOMAIN_FLOOR = { lines: 95, branches: 90, perFile: true };
const API_FLOOR = { lines: 70 };

export default defineConfig({
  test: {
    projects: [
      'apps/api/vitest.config.mjs',
      'apps/web/vitest.config.mjs',
      'packages/shared/vitest.config.mjs',
      'scripts/vitest.config.mjs',
    ],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts', 'apps/*/src/**/*.ts', 'scripts/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/*.int-spec.ts', '**/*.d.ts'],
      reporter: ['text-summary', 'lcov'],
      thresholds: {
        'packages/shared/src/**/*.ts': DOMAIN_FLOOR,
        'apps/api/src/**/domain/**/*.ts': DOMAIN_FLOOR,
        'apps/api/src/**/*.ts': API_FLOOR,
      },
    },
  },
});
