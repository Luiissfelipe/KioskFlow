import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { createApp } from '../src/create-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { resetDatabase } from './reset-database.js';

describe('GET /catalog with a real postgres', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createApp();
    app.useLogger(false);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists available products and extras of each category in display order', async () => {
    const drinks = await prisma.category.create({ data: { name: 'Bebidas', sortOrder: 2 } });
    const burgers = await prisma.category.create({ data: { name: 'Hambúrgueres Artesanais', sortOrder: 1 } });
    const juice = await prisma.product.create({
      data: { categoryId: drinks.id, name: 'Suco de laranja', description: 'Natural, 400 ml', priceCents: 1100, sortOrder: 1 },
    });
    const cheeseburger = await prisma.product.create({
      data: { categoryId: burgers.id, name: 'Cheeseburger', description: 'Pão, carne e cheddar', priceCents: 3290, sortOrder: 2 },
    });
    const classic = await prisma.product.create({
      data: { categoryId: burgers.id, name: 'Clássico', description: 'Pão, carne e salada', priceCents: 2890, sortOrder: 1, imagePath: 'classico.webp' },
    });
    const cheddar = await prisma.extra.create({ data: { categoryId: burgers.id, name: 'Cheddar', priceCents: 400 } });
    const bacon = await prisma.extra.create({ data: { categoryId: burgers.id, name: 'Bacon extra', priceCents: 600 } });

    const response = await request(app.getHttpServer() as Server).get('/catalog');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      categories: [
        {
          id: burgers.id,
          name: 'Hambúrgueres Artesanais',
          products: [
            { id: classic.id, name: 'Clássico', description: 'Pão, carne e salada', priceCents: 2890, imagePath: 'classico.webp' },
            { id: cheeseburger.id, name: 'Cheeseburger', description: 'Pão, carne e cheddar', priceCents: 3290, imagePath: null },
          ],
          extras: [
            { id: bacon.id, name: 'Bacon extra', priceCents: 600 },
            { id: cheddar.id, name: 'Cheddar', priceCents: 400 },
          ],
        },
        {
          id: drinks.id,
          name: 'Bebidas',
          products: [{ id: juice.id, name: 'Suco de laranja', description: 'Natural, 400 ml', priceCents: 1100, imagePath: null }],
          extras: [],
        },
      ],
    });
  });

  it('hides sold-out products and extras', async () => {
    const burgers = await prisma.category.create({ data: { name: 'Hambúrgueres Artesanais', sortOrder: 1 } });
    const classic = await prisma.product.create({
      data: { categoryId: burgers.id, name: 'Clássico', description: 'Pão, carne e salada', priceCents: 2890, sortOrder: 1, imagePath: 'classico.webp' },
    });
    await prisma.product.create({
      data: { categoryId: burgers.id, name: 'Duplo', description: 'Duas carnes', priceCents: 3890, sortOrder: 2, isAvailable: false },
    });
    const cheddar = await prisma.extra.create({ data: { categoryId: burgers.id, name: 'Cheddar', priceCents: 400 } });
    await prisma.extra.create({ data: { categoryId: burgers.id, name: 'Bacon extra', priceCents: 600, isAvailable: false } });

    const response = await request(app.getHttpServer() as Server).get('/catalog');

    expect(response.body).toEqual({
      categories: [
        {
          id: burgers.id,
          name: 'Hambúrgueres Artesanais',
          products: [{ id: classic.id, name: 'Clássico', description: 'Pão, carne e salada', priceCents: 2890, imagePath: 'classico.webp' }],
          extras: [{ id: cheddar.id, name: 'Cheddar', priceCents: 400 }],
        },
      ],
    });
  });

  it('omits a category without available products', async () => {
    const desserts = await prisma.category.create({ data: { name: 'Sobremesas', sortOrder: 1 } });
    const drinks = await prisma.category.create({ data: { name: 'Bebidas', sortOrder: 2 } });
    await prisma.product.create({
      data: { categoryId: desserts.id, name: 'Brownie', description: 'Com nozes', priceCents: 1400, sortOrder: 1, isAvailable: false },
    });
    await prisma.extra.create({ data: { categoryId: desserts.id, name: 'Calda de chocolate', priceCents: 300 } });
    const juice = await prisma.product.create({
      data: { categoryId: drinks.id, name: 'Suco de laranja', description: 'Natural, 400 ml', priceCents: 1100, sortOrder: 1 },
    });

    const response = await request(app.getHttpServer() as Server).get('/catalog');

    expect(response.body).toEqual({
      categories: [
        {
          id: drinks.id,
          name: 'Bebidas',
          products: [{ id: juice.id, name: 'Suco de laranja', description: 'Natural, 400 ml', priceCents: 1100, imagePath: null }],
          extras: [],
        },
      ],
    });
  });
});
