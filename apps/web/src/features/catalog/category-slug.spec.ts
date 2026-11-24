import { describe, expect, it } from 'vitest';
import { categorySlug } from './category-slug';

describe('categorySlug', () => {
  it('turns a category name into lowercase words joined by hyphens', () => {
    expect(categorySlug('Hambúrgueres Artesanais')).toBe('hamburgueres-artesanais');
  });

  it('keeps a single word as it is, without accents', () => {
    expect(categorySlug('Acompanhamentos')).toBe('acompanhamentos');
  });

  it('removes accents and cedillas', () => {
    expect(categorySlug('Açaí e Pão')).toBe('acai-e-pao');
  });

  it('replaces any run of symbols and spaces with one hyphen', () => {
    expect(categorySlug('Pão  &  Cia / Bebidas')).toBe('pao-cia-bebidas');
  });

  it('does not start or end with a hyphen', () => {
    expect(categorySlug('  Sobremesas! ')).toBe('sobremesas');
  });
});
