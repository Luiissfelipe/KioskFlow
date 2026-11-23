import type { PrismaClient } from '../generated/prisma/client.js';

const TEST_DATABASE_SUFFIX = '_test';
const MIGRATIONS_TABLE = '_prisma_migrations';

interface DatabaseNameRow {
  readonly name: string;
}

interface TableNameRow {
  readonly tablename: string;
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function assertConnectedToTestDatabase(prisma: PrismaClient): Promise<void> {
  const [database] = await prisma.$queryRaw<DatabaseNameRow[]>`SELECT current_database() AS name`;
  const databaseName = database?.name ?? '';
  if (!databaseName.endsWith(TEST_DATABASE_SUFFIX)) {
    throw new Error(`resetDatabase only runs on a database ending in "${TEST_DATABASE_SUFFIX}", got "${databaseName}"`);
  }
}

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await assertConnectedToTestDatabase(prisma);
  const tables = await prisma.$queryRaw<TableNameRow[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tablename <> ${MIGRATIONS_TABLE}`;
  if (tables.length === 0) {
    return;
  }
  const tableList = tables.map(({ tablename }) => quoteIdentifier(tablename)).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
}
