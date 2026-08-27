"use client";

import { useQuery } from "@tanstack/react-query";
import { useCollectionFilters } from "@/hooks/use-collection-filters";
import { fetchProductFacets } from "@/lib/api";
import { DEFAULT_PRICE_MAX } from "@/lib/product-list-params";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PriceRangeSlider } from "./price-range-slider";
import type { CollectionFilterBounds } from "@/hooks/use-collection-filters";
import type { ProductCategory } from "@/types/product";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
  { value: "accessories", label: "Accessories" },
];

type CollectionFiltersProps = {
  collectionHandle?: string;
  priceBounds?: CollectionFilterBounds;
};

export function CollectionFilters({
  collectionHandle,
  priceBounds: priceBoundsProp,
}: CollectionFiltersProps) {
  const { data: facets } = useQuery({
    queryKey: ["product-facets", collectionHandle],
    queryFn: () => fetchProductFacets(collectionHandle),
    staleTime: 60_000,
  });

  const priceBounds: CollectionFilterBounds = priceBoundsProp ?? {
    priceMin: facets?.priceMin ?? 0,
    priceMax: facets?.priceMax ?? DEFAULT_PRICE_MAX,
  };

  const { filters, toggleFilter, setPriceRange, clearFilters, activeFilterCount } =
    useCollectionFilters(priceBounds);

  const brands = facets?.brands ?? [];
  const colors = facets?.colors ?? [];
  const sizes = facets?.sizes ?? [];

  return (
    <aside className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest">Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-auto p-0">
            Clear all ({activeFilterCount})
          </Button>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
          Category
        </h4>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.value} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.value}`}
                checked={filters.categories.includes(cat.value)}
                onCheckedChange={() => toggleFilter("categories", cat.value)}
              />
              <Label htmlFor={`cat-${cat.value}`} className="text-sm font-normal cursor-pointer">
                {cat.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
          Price
        </h4>
        <PriceRangeSlider
          boundsMin={priceBounds.priceMin}
          boundsMax={priceBounds.priceMax}
          valueMin={filters.priceMin}
          valueMax={filters.priceMax}
          onCommit={setPriceRange}
        />
      </div>

      {brands.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
              Brand
            </h4>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center gap-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={() => toggleFilter("brands", brand)}
                  />
                  <Label htmlFor={`brand-${brand}`} className="text-sm font-normal cursor-pointer">
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {colors.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
              Color
            </h4>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color.slug}
                  type="button"
                  onClick={() => toggleFilter("colors", color.slug)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    filters.colors.includes(color.slug)
                      ? "border-primary scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {sizes.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
              Size
            </h4>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleFilter("sizes", size)}
                  className={`min-w-[2.5rem] border px-2 py-1.5 text-xs transition-colors ${
                    filters.sizes.includes(size)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
