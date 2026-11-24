'use client';

import { useSearchParams } from 'next/navigation';
import type { CatalogCategory } from '../catalog-types';
import { CATEGORY_PARAM, selectCategory } from '../select-category';
import { CategoryTabs } from './category-tabs';
import { ProductCard } from './product-card';

function showCategoryInUrl(slug: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(CATEGORY_PARAM, slug);
  window.history.pushState(null, '', `?${params.toString()}`);
}

export function CatalogMenu({ categories }: Readonly<{ categories: readonly CatalogCategory[] }>) {
  const searchParams = useSearchParams();
  const selected = selectCategory(categories, searchParams.get(CATEGORY_PARAM));
  if (!selected) return null;

  return (
    <>
      <CategoryTabs categories={categories} selectedId={selected.id} onSelect={showCategoryInUrl} />
      <h2 className="px-4 pt-3 text-title font-extrabold tracking-tight text-balance">{selected.name}</h2>
      <ul className="px-4 pb-2">
        {selected.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </>
  );
}
