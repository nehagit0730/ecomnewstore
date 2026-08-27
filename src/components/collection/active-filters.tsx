"use client";

import { X } from "lucide-react";
import { useCollectionFilters } from "@/hooks/use-collection-filters";
import { formatPrice } from "@/lib/utils";
import type { CollectionFilterBounds } from "@/hooks/use-collection-filters";

type ActiveFiltersProps = {
  priceBounds?: CollectionFilterBounds;
};

export function ActiveFilters({ priceBounds }: ActiveFiltersProps) {
  const { filters, toggleFilter, clearFilters, activeFilterCount, setPriceRange } =
    useCollectionFilters(priceBounds);

  if (activeFilterCount === 0) return null;

  const chips: { label: string; onRemove: () => void }[] = [];

  filters.categories.forEach((c) =>
    chips.push({ label: c, onRemove: () => toggleFilter("categories", c) })
  );
  filters.brands.forEach((b) =>
    chips.push({ label: b, onRemove: () => toggleFilter("brands", b) })
  );
  filters.colors.forEach((c) =>
    chips.push({ label: c, onRemove: () => toggleFilter("colors", c) })
  );
  filters.sizes.forEach((s) =>
    chips.push({ label: s, onRemove: () => toggleFilter("sizes", s) })
  );

  const bounds = priceBounds ?? { priceMin: 0, priceMax: filters.priceMax };
  if (
    filters.priceMin > bounds.priceMin ||
    filters.priceMax < bounds.priceMax
  ) {
    chips.push({
      label: `${formatPrice(filters.priceMin)} – ${formatPrice(filters.priceMax)}`,
      onRemove: () => setPriceRange(bounds.priceMin, bounds.priceMax),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs hover:bg-secondary transition-colors"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={clearFilters}
        className="text-xs text-muted-foreground hover:text-foreground underline"
      >
        Clear all
      </button>
    </div>
  );
}
