import { RotateCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CatalogError({ onRetry }: Readonly<{ onRetry: () => void }>) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 px-4 py-8">
      <WifiOff className="size-7" />
      <h2 className="text-title font-extrabold tracking-tight text-balance">O cardápio não carregou</h2>
      <p className="text-pretty text-muted-foreground">
        Confira se o celular está com internet e tente de novo. Se continuar, peça no balcão.
      </p>
      <div className="mt-3 w-full">
        <Button type="button" onClick={onRetry}>
          <RotateCw className="size-5" />
          Tentar de novo
        </Button>
      </div>
    </div>
  );
}
