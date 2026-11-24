'use client';

import { CatalogError } from '@/features/catalog/components/catalog-error';
import { CatalogHeader } from '@/features/catalog/components/catalog-header';

export default function MenuError({ retry }: Readonly<{ retry: () => void }>) {
  return (
    <>
      <CatalogHeader />
      <main>
        <CatalogError onRetry={retry} />
      </main>
    </>
  );
}
