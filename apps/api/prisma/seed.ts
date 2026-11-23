import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

interface SeedProduct {
  readonly name: string;
  readonly description: string;
  readonly priceCents: number;
  readonly sortOrder: number;
  readonly isAvailable?: boolean;
}

interface SeedExtra {
  readonly name: string;
  readonly priceCents: number;
}

interface SeedCategory {
  readonly name: string;
  readonly sortOrder: number;
  readonly products: readonly SeedProduct[];
  readonly extras: readonly SeedExtra[];
}

const MENU: readonly SeedCategory[] = [
  {
    name: 'Hambúrgueres Artesanais',
    sortOrder: 1,
    products: [
      { name: 'Clássico', description: 'Pão brioche, blend de 160 g, queijo prato, alface e tomate', priceCents: 2890, sortOrder: 1 },
      { name: 'Bacon Cheddar', description: 'Blend de 160 g, cheddar cremoso e bacon crocante', priceCents: 3490, sortOrder: 2 },
      { name: 'Duplo Smash', description: 'Dois smash de 90 g, cheddar e cebola caramelizada', priceCents: 3990, sortOrder: 3, isAvailable: false },
      { name: 'Veggie', description: 'Hambúrguer de grão-de-bico, rúcula e maionese de ervas', priceCents: 3290, sortOrder: 4 },
    ],
    extras: [
      { name: 'Bacon extra', priceCents: 600 },
      { name: 'Cheddar', priceCents: 400 },
      { name: 'Ovo', priceCents: 300 },
      { name: 'Cebola caramelizada', priceCents: 350 },
    ],
  },
  {
    name: 'Acompanhamentos',
    sortOrder: 2,
    products: [
      { name: 'Batata frita', description: 'Porção individual com sal e alecrim', priceCents: 1490, sortOrder: 1 },
      { name: 'Batata rústica', description: 'Com casca, páprica e alho', priceCents: 1590, sortOrder: 2 },
      { name: 'Onion rings', description: 'Anéis de cebola empanados', priceCents: 1690, sortOrder: 3 },
    ],
    extras: [
      { name: 'Cheddar e bacon', priceCents: 800 },
      { name: 'Molho da casa', priceCents: 200 },
    ],
  },
  {
    name: 'Bebidas',
    sortOrder: 3,
    products: [
      { name: 'Refrigerante lata', description: '350 ml', priceCents: 700, sortOrder: 1 },
      { name: 'Suco de laranja', description: 'Natural, 400 ml', priceCents: 1100, sortOrder: 2 },
      { name: 'Água mineral', description: '500 ml, com ou sem gás', priceCents: 500, sortOrder: 3 },
    ],
    extras: [],
  },
  {
    name: 'Sobremesas',
    sortOrder: 4,
    products: [
      { name: 'Brownie com sorvete', description: 'Brownie de chocolate meio amargo e sorvete de creme', priceCents: 1890, sortOrder: 1 },
      { name: 'Milkshake de chocolate', description: '400 ml', priceCents: 1990, sortOrder: 2 },
      { name: 'Petit gâteau', description: 'Com sorvete de baunilha', priceCents: 2190, sortOrder: 3 },
    ],
    extras: [
      { name: 'Calda de chocolate', priceCents: 300 },
      { name: 'Chantilly', priceCents: 250 },
    ],
  },
];

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
      update: {},
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
