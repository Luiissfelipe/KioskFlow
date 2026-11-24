import { describe, expect, it } from 'vitest';
import { CatalogUnavailableError, fetchCatalog } from './fetch-catalog';

const API_URL = 'http://localhost:3001';

const catalogBody = {
  categories: [
    {
      id: 1,
      name: 'Hambúrgueres',
      products: [{ id: 10, name: 'Clássico', description: 'Pão brioche', priceCents: 2890, imagePath: 'classico.webp' }],
      extras: [{ id: 20, name: 'Bacon', priceCents: 500 }],
    },
  ],
};

function respondWith(body: unknown, status = 200) {
  const requestedUrls: string[] = [];
  const fetchFn = (url: URL) => {
    requestedUrls.push(url.href);
    return Promise.resolve(new Response(JSON.stringify(body), { status }));
  };
  return { fetchFn, requestedUrls };
}

describe('fetchCatalog', () => {
  it('returns the catalog sent by the api', async () => {
    const { fetchFn } = respondWith(catalogBody);

    const catalog = await fetchCatalog(API_URL, fetchFn);

    expect(catalog).toEqual(catalogBody);
  });

  it('requests the catalog route of the configured api', async () => {
    const { fetchFn, requestedUrls } = respondWith(catalogBody);

    await fetchCatalog(API_URL, fetchFn);

    expect(requestedUrls).toEqual(['http://localhost:3001/catalog']);
  });

  it('fails with the status when the api does not answer with success', async () => {
    const { fetchFn } = respondWith({ code: 'DATABASE_UNAVAILABLE' }, 503);

    const request = fetchCatalog(API_URL, fetchFn);

    await expect(request).rejects.toThrow(CatalogUnavailableError);
    await expect(request).rejects.toMatchObject({ status: 503 });
  });

  it('rejects a response outside the catalog contract', async () => {
    const productWithoutImagePath = { id: 10, name: 'Clássico', description: 'Pão brioche', priceCents: 2890 };
    const body = { categories: [{ ...catalogBody.categories[0], products: [productWithoutImagePath] }] };
    const { fetchFn } = respondWith(body);

    const request = fetchCatalog(API_URL, fetchFn);

    await expect(request).rejects.toThrow(/imagePath/);
  });
});
