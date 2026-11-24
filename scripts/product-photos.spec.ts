import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { MENU } from '../apps/api/prisma/seed-menu';

const PRODUCT_PHOTOS_FOLDER = join(import.meta.dirname, '..', 'apps', 'web', 'public', 'products');

describe('product photos', () => {
  it('has exactly the files the seed points to, none missing and none extra', () => {
    const photosPointedBySeed = MENU.flatMap((category) => category.products.map((product) => product.imagePath)).sort();

    const photosOnDisk = readdirSync(PRODUCT_PHOTOS_FOLDER).sort();

    expect(photosOnDisk).toEqual(photosPointedBySeed);
  });
});
