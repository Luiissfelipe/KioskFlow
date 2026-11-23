import { join } from 'node:path';
import swc from 'unplugin-swc';
import { defineProject } from 'vitest/config';

const TEST_DATABASE_SUFFIX = '_test';

function readTestDatabaseUrl() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error('TEST_DATABASE_URL is required to run the api-db project');
  }
  const databaseName = decodeURIComponent(new URL(testDatabaseUrl).pathname.slice(1));
  if (!databaseName.endsWith(TEST_DATABASE_SUFFIX)) {
    throw new Error(`TEST_DATABASE_URL must name a database ending in "${TEST_DATABASE_SUFFIX}", got "${databaseName}"`);
  }
  return testDatabaseUrl;
}

export default defineProject({
  plugins: [swc.vite({ tsconfigFile: join(import.meta.dirname, 'tsconfig.json'), module: { type: 'es6' } })],
  ssr: { resolve: { conditions: ['@kioskflow/source'] } },
  test: {
    name: 'api-db',
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    env: { DATABASE_URL: readTestDatabaseUrl() },
    globalSetup: ['test/global-setup.ts'],
    fileParallelism: false,
  },
});
