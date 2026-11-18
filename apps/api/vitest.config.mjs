import { join } from 'node:path';
import swc from 'unplugin-swc';
import { defineProject } from 'vitest/config';

export default defineProject({
  plugins: [swc.vite({ tsconfigFile: join(import.meta.dirname, 'tsconfig.json'), module: { type: 'es6' } })],
  ssr: { resolve: { conditions: ['@kioskflow/source'] } },
  test: { name: 'api', globals: true, environment: 'node', include: ['src/**/*.spec.ts'] },
});
