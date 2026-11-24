export interface SeedProduct {
  readonly name: string;
  readonly description: string;
  readonly priceCents: number;
  readonly sortOrder: number;
  readonly imagePath: string;
  readonly isAvailable?: boolean;
}

export interface SeedExtra {
  readonly name: string;
  readonly priceCents: number;
}

export interface SeedCategory {
  readonly name: string;
  readonly sortOrder: number;
  readonly products: readonly SeedProduct[];
  readonly extras: readonly SeedExtra[];
}

export const MENU: readonly SeedCategory[] = [
  {
    name: 'Hambúrgueres Artesanais',
    sortOrder: 1,
    products: [
      {
        name: 'Clássico',
        description: 'Pão brioche, blend de 160 g, queijo prato, alface e tomate',
        priceCents: 2890,
        sortOrder: 1,
        imagePath: 'classico.webp',
      },
      {
        name: 'Bacon Cheddar',
        description: 'Blend de 160 g, cheddar cremoso e bacon crocante',
        priceCents: 3490,
        sortOrder: 2,
        imagePath: 'bacon-cheddar.webp',
      },
      {
        name: 'Duplo Smash',
        description: 'Dois smash de 90 g, cheddar e cebola caramelizada',
        priceCents: 3990,
        sortOrder: 3,
        imagePath: 'duplo-smash.webp',
        isAvailable: false,
      },
      {
        name: 'Veggie',
        description: 'Hambúrguer de grão-de-bico, rúcula e maionese de ervas',
        priceCents: 3290,
        sortOrder: 4,
        imagePath: 'veggie.webp',
      },
    ],
    extras: [
      { name: 'Bacon extra', priceCents: 600 },
      { name: 'Cheddar', priceCents: 400 },
      { name: 'Ovo', priceCents: 300 },
      { name: 'Cebola caramelizada', priceCents: 350 },
    ],
  },
  {
    name: 'Acompanhamentos',
    sortOrder: 2,
    products: [
      {
        name: 'Batata frita',
        description: 'Porção individual com sal e alecrim',
        priceCents: 1490,
        sortOrder: 1,
        imagePath: 'batata-frita.webp',
      },
      {
        name: 'Batata rústica',
        description: 'Com casca, páprica e alho',
        priceCents: 1590,
        sortOrder: 2,
        imagePath: 'batata-rustica.webp',
      },
      {
        name: 'Onion rings',
        description: 'Anéis de cebola empanados',
        priceCents: 1690,
        sortOrder: 3,
        imagePath: 'onion-rings.webp',
      },
    ],
    extras: [
      { name: 'Cheddar e bacon', priceCents: 800 },
      { name: 'Molho da casa', priceCents: 200 },
    ],
  },
  {
    name: 'Bebidas',
    sortOrder: 3,
    products: [
      { name: 'Refrigerante lata', description: '350 ml', priceCents: 700, sortOrder: 1, imagePath: 'refrigerante-lata.webp' },
      {
        name: 'Suco de laranja',
        description: 'Natural, 400 ml',
        priceCents: 1100,
        sortOrder: 2,
        imagePath: 'suco-de-laranja.webp',
      },
      {
        name: 'Água mineral',
        description: '500 ml, com ou sem gás',
        priceCents: 500,
        sortOrder: 3,
        imagePath: 'agua-mineral.webp',
      },
    ],
    extras: [],
  },
  {
    name: 'Sobremesas',
    sortOrder: 4,
    products: [
      {
        name: 'Brownie com sorvete',
        description: 'Brownie de chocolate meio amargo e sorvete de creme',
        priceCents: 1890,
        sortOrder: 1,
        imagePath: 'brownie-com-sorvete.webp',
      },
      {
        name: 'Milkshake de chocolate',
        description: '400 ml',
        priceCents: 1990,
        sortOrder: 2,
        imagePath: 'milkshake-de-chocolate.webp',
      },
      {
        name: 'Petit gâteau',
        description: 'Com sorvete de baunilha',
        priceCents: 2190,
        sortOrder: 3,
        imagePath: 'petit-gateau.webp',
      },
    ],
    extras: [
      { name: 'Calda de chocolate', priceCents: 300 },
      { name: 'Chantilly', priceCents: 250 },
    ],
  },
];
