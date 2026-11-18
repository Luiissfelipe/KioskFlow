import { join } from 'node:path';
import swc from 'unplugin-swc';
import { defineProject } from 'vitest/config';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  throw new Error('TEST_DATABASE_URL is required to run the api-e2e project');
}

export default defineProject({
  plugins: [swc.vite({ tsconfigFile: join(import.meta.dirname, 'tsconfig.json'), module: { type: 'es6' } })],
  ssr: { resolve: { conditions: ['@kioskflow/source'] } },
  test: {
    name: 'api-e2e',
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    env: { DATABASE_URL: testDatabaseUrl },
  },
});
