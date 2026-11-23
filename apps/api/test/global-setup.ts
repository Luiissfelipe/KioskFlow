import { spawnSync } from 'node:child_process';
import type { TestProject } from 'vitest/node';

const API_ROOT = new URL('..', import.meta.url);
const MIGRATE_COMMAND = 'pnpm exec prisma migrate deploy';

export default function setup(project: TestProject): void {
  const databaseUrl = project.config.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing from the api-db project env');
  }
  const migration = spawnSync(MIGRATE_COMMAND, {
    cwd: API_ROOT,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
  if (migration.status !== 0) {
    throw new Error(`${MIGRATE_COMMAND} failed with exit code ${migration.status}`);
  }
}
