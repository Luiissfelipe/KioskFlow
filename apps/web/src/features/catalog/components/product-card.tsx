import Image from 'next/image';
import { formatPriceCents } from '@/lib/format-price';
import type { CatalogProduct } from '../catalog-types';

const PHOTO_WIDTH = 800;
const PHOTO_HEIGHT = 600;
const PHOTO_CLASS_NAME = 'size-24 flex-none bg-secondary object-cover';

export function ProductCard({ product }: Readonly<{ product: CatalogProduct }>) {
  return (
    <li className="flex gap-3 py-3">
      {product.imagePath ? (
        <Image
          src={`/products/${product.imagePath}`}
          alt=""
          width={PHOTO_WIDTH}
          height={PHOTO_HEIGHT}
          sizes="96px"
          className={PHOTO_CLASS_NAME}
        />
      ) : (
        <span aria-hidden="true" className={PHOTO_CLASS_NAME} />
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="font-brand text-title text-balance">{product.name}</h3>
        <p className="line-clamp-2 text-meta text-muted-foreground">{product.description}</p>
        <p className="font-extrabold tabular-nums whitespace-nowrap">{formatPriceCents(product.priceCents)}</p>
      </div>
    </li>
  );
}
