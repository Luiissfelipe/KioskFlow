'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
import type { CatalogCategory } from '../catalog-types';
import { categorySlug } from '../category-slug';
import { CATEGORY_PARAM } from '../select-category';

type CategoryTabsProps = Readonly<{
  categories: readonly CatalogCategory[];
  selectedId: number;
  onSelect: (slug: string) => void;
}>;

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function CategoryTabs({ categories, selectedId, onSelect }: CategoryTabsProps) {
  const selectedTab = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    selectedTab.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [selectedId]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>, id: number, slug: string) {
    if (!isPlainLeftClick(event)) return;
    event.preventDefault();
    if (id !== selectedId) onSelect(slug);
  }

  return (
    <nav aria-label="Categorias" className="scroll-px-4 overflow-x-auto pt-1.5 pb-2">
      <div className="flex w-max gap-2 px-4">
        {categories.map((category) => {
          const slug = categorySlug(category.name);
          return (
            <a
              key={category.id}
              ref={category.id === selectedId ? selectedTab : undefined}
              href={`?${CATEGORY_PARAM}=${slug}`}
              aria-current={category.id === selectedId ? 'page' : undefined}
              onClick={(event) => handleClick(event, category.id, slug)}
              className="inline-flex min-h-(--target-client) flex-none items-center bg-secondary px-4 font-extrabold whitespace-nowrap text-secondary-foreground hover:brightness-95 aria-[current=page]:bg-foreground aria-[current=page]:text-background"
            >
              {category.name}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
