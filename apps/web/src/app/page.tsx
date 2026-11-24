import { connection } from 'next/server';
import { Suspense } from 'react';
import { fetchCatalog } from '../features/catalog/api/fetch-catalog';
import { parseServerEnv } from '../lib/server-env';

async function CatalogList() {
  await connection();
  const { API_URL } = parseServerEnv(process.env);
  const catalog = await fetchCatalog(API_URL, fetch);
  return (
    <ul>
      {catalog.categories.map((category) => (
        <li key={category.id}>
          <h2>{category.name}</h2>
          <ul>
            {category.products.map((product) => (
              <li key={product.id}>
                {product.name}: {product.priceCents} centavos
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  return (
    <main>
      <h1 className="font-brand text-heading">Burger da Vó</h1>
      <Suspense fallback={<p>Carregando o cardápio…</p>}>
        <CatalogList />
      </Suspense>
    </main>
  );
}
