import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CatalogResponse } from './catalog.schema.js';

const AVAILABLE = { isAvailable: true } as const;
const DISPLAY_ORDER = [{ sortOrder: 'asc' }, { id: 'asc' }] as const;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listAvailable(): Promise<CatalogResponse> {
    const categories = await this.prisma.category.findMany({
      where: { products: { some: AVAILABLE } },
      orderBy: [...DISPLAY_ORDER],
      select: {
        id: true,
        name: true,
        products: {
          where: AVAILABLE,
          orderBy: [...DISPLAY_ORDER],
          select: { id: true, name: true, description: true, priceCents: true },
        },
        extras: {
          where: AVAILABLE,
          orderBy: { name: 'asc' },
          select: { id: true, name: true, priceCents: true },
        },
      },
    });
    return { categories };
  }
}
