import { catalogResponseSchema, type CatalogResponse } from '@kioskflow/shared';

const CATALOG_ROUTE = '/catalog';

export type FetchCatalogResponse = (url: URL) => Promise<Response>;

export class CatalogUnavailableError extends Error {
  constructor(readonly status: number) {
    super(`Catalog request failed with status ${status}`);
    this.name = 'CatalogUnavailableError';
  }
}

export async function fetchCatalog(apiUrl: string, fetchFn: FetchCatalogResponse): Promise<CatalogResponse> {
  const response = await fetchFn(new URL(CATALOG_ROUTE, apiUrl));
  if (!response.ok) {
    throw new CatalogUnavailableError(response.status);
  }
  return catalogResponseSchema.parse(await response.json());
}
