import type { CatalogResponse } from '@kioskflow/shared';

export type CatalogCategory = CatalogResponse['categories'][number];
export type CatalogProduct = CatalogCategory['products'][number];
