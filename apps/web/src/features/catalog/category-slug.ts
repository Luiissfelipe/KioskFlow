const DIACRITICS = /\p{Diacritic}/gu;
const RUNS_OF_NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const EDGE_HYPHENS = /^-+|-+$/g;

export function categorySlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replace(RUNS_OF_NON_ALPHANUMERIC, '-')
    .replace(EDGE_HYPHENS, '');
}
