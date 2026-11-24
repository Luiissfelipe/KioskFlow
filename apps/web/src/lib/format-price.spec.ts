import { formatPriceCents } from '@/lib/format-price';
import { describe, expect, it } from 'vitest';

describe('formatPriceCents', () => {
  it('formats whole cents as brazilian reais', () => {
    expect(formatPriceCents(2890)).toBe('R$ 28,90');
  });

  it('keeps two decimal places for a zero price', () => {
    expect(formatPriceCents(0)).toBe('R$ 0,00');
  });

  it('separates thousands with a dot', () => {
    expect(formatPriceCents(123456)).toBe('R$ 1.234,56');
  });
});
