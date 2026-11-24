import { connection } from 'next/server';
import { Suspense } from 'react';
import { fetchCatalog } from '@/features/catalog/api/fetch-catalog';
import { CatalogHeader } from '@/features/catalog/components/catalog-header';
import { CatalogMenu } from '@/features/catalog/components/catalog-menu';
import { parseServerEnv } from '@/lib/server-env';

async function CatalogContent() {
  await connection();
  const { API_URL } = parseServerEnv(process.env);
  const catalog = await fetchCatalog(API_URL, fetch);
  return <CatalogMenu categories={catalog.categories} />;
}

export default function HomePage() {
  return (
    <>
      <CatalogHeader />
      <main>
        <Suspense fallback={<p className="px-4">Carregando o cardápio…</p>}>
          <CatalogContent />
        </Suspense>
      </main>
    </>
  );
}
