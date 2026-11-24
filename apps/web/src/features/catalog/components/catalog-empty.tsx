import { Utensils } from 'lucide-react';

export function CatalogEmpty() {
  return (
    <div className="flex flex-col items-start gap-3 px-4 py-8">
      <Utensils className="size-7" />
      <h2 className="text-title font-extrabold tracking-tight text-balance">Acabou tudo por hoje</h2>
      <p className="text-pretty text-muted-foreground">
        A vó vendeu o cardápio inteiro. Pergunte no balcão quando a próxima fornada sai.
      </p>
    </div>
  );
}
