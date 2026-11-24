const brazilianReais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const CENTS_PER_REAL = 100;

export function formatPriceCents(priceCents: number): string {
  return brazilianReais.format(priceCents / CENTS_PER_REAL);
}
