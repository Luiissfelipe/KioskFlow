import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { MENU, type SeedCategory } from './seed-menu.js';

function readDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to seed the database');
  }
  return databaseUrl;
}

async function seedCategory(prisma: PrismaClient, { products, extras, ...category }: SeedCategory): Promise<void> {
  const { id: categoryId } = await prisma.category.upsert({
    where: { name: category.name },
    update: {},
    create: category,
  });
  for (const product of products) {
    await prisma.product.upsert({
      where: { categoryId_name: { categoryId, name: product.name } },
      update: { imagePath: product.imagePath },
      create: { ...product, categoryId },
    });
  }
  for (const extra of extras) {
    await prisma.extra.upsert({
      where: { categoryId_name: { categoryId, name: extra.name } },
      update: {},
      create: { ...extra, categoryId },
    });
  }
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: readDatabaseUrl() }) });
try {
  for (const category of MENU) {
    await seedCategory(prisma, category);
  }
} finally {
  await prisma.$disconnect();
}
