import { defineProject } from 'vitest/config';

export default defineProject({
  resolve: { tsconfigPaths: true },
  ssr: { resolve: { conditions: ['@kioskflow/source'] } },
  test: { name: 'web', environment: 'node', include: ['src/**/*.spec.ts'] },
});
