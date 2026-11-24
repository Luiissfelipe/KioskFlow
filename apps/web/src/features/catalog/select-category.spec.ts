import { describe, expect, it } from 'vitest';
import type { CatalogCategory } from './catalog-types';
import { selectCategory } from './select-category';

function categoryNamed(id: number, name: string): CatalogCategory {
  return { id, name, products: [], extras: [] };
}

const burgers = categoryNamed(2, 'Hambúrgueres Artesanais');
const sides = categoryNamed(3, 'Acompanhamentos');
const drinks = categoryNamed(4, 'Bebidas');
const breads = categoryNamed(5, 'Pães Quentes');
const categories = [burgers, sides, drinks, breads];

describe('selectCategory', () => {
  it('returns the category whose slug is in the url', () => {
    expect(selectCategory(categories, 'acompanhamentos')).toBe(sides);
  });

  it('matches a name with accents and spaces through its slug', () => {
    expect(selectCategory(categories, 'paes-quentes')).toBe(breads);
  });

  it('returns the first category when the url has no category', () => {
    expect(selectCategory(categories, null)).toBe(burgers);
  });

  it('returns the first category when the url slug is not in the menu', () => {
    expect(selectCategory(categories, 'sobremesas')).toBe(burgers);
  });

  it('does not match a slug that is only the start of a name', () => {
    expect(selectCategory(categories, 'acompanha')).toBe(burgers);
  });

  it('does not read a category id as a slug', () => {
    expect(selectCategory(categories, '3')).toBe(burgers);
  });

  it('returns null when the menu has no category', () => {
    expect(selectCategory([], 'bebidas')).toBeNull();
  });
});
