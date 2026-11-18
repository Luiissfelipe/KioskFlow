import { PrismaService } from './prisma.service.js';

const TEST_ENV = { NODE_ENV: 'test', PORT: 3001, DATABASE_URL: 'postgresql://user:pass@localhost:5432/kioskflow' } as const;

describe('PrismaService', () => {
  it('closes the connection pool on shutdown even if it never connected', async () => {
    const service = new PrismaService(TEST_ENV);

    await expect(service.onModuleDestroy()).resolves.toBeUndefined();
  });
});
