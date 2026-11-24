import type { CatalogCategory } from './catalog-types';
import { categorySlug } from './category-slug';

export const CATEGORY_PARAM = 'categoria';

export function selectCategory(categories: readonly CatalogCategory[], slugFromUrl: string | null): CatalogCategory | null {
  const requested = categories.find((category) => categorySlug(category.name) === slugFromUrl);
  return requested ?? categories[0] ?? null;
}
