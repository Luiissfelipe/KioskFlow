import { defineProject } from 'vitest/config';

export default defineProject({
  ssr: { resolve: { conditions: ['@kioskflow/source'] } },
  test: { name: 'web', environment: 'node', include: ['src/**/*.spec.ts'] },
});
