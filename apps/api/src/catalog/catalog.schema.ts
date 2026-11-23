import { z } from 'zod';

const catalogProductSchema = z.object({
  id: z.int(),
  name: z.string(),
  description: z.string(),
  priceCents: z.int(),
});

const catalogExtraSchema = z.object({
  id: z.int(),
  name: z.string(),
  priceCents: z.int(),
});

const catalogCategorySchema = z.object({
  id: z.int(),
  name: z.string(),
  products: z.array(catalogProductSchema),
  extras: z.array(catalogExtraSchema),
});

export const catalogResponseSchema = z.object({
  categories: z.array(catalogCategorySchema),
});

export type CatalogResponse = z.infer<typeof catalogResponseSchema>;
