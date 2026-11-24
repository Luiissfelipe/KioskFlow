const TAB_COUNT = 3;
const CARD_COUNT = 4;

function placeholders(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index);
}

export function CatalogSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Carregando o cardápio…
      </p>
      <div aria-hidden="true">
        <div className="pt-1.5 pb-2">
          <div className="flex gap-2 px-4">
            {placeholders(TAB_COUNT).map((index) => (
              <div key={index} className="h-11 w-28 flex-none bg-secondary" />
            ))}
          </div>
        </div>
        <div className="px-4 pt-3">
          <div className="h-6 w-3/5 bg-secondary" />
        </div>
        <ul className="px-4 pb-2">
          {placeholders(CARD_COUNT).map((index) => (
            <li key={index} className="flex gap-3 py-3">
              <div className="size-24 flex-none bg-secondary" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <div className="h-4 w-2/3 bg-secondary" />
                <div className="h-4 w-full bg-secondary" />
                <div className="h-4 w-2/5 bg-secondary" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
