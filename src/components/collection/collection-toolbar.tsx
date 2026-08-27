"use client";

import { useCollectionFilters } from "@/hooks/use-collection-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductSortOption } from "@/types/product";
import type { CollectionFilterBounds } from "@/hooks/use-collection-filters";

type CollectionToolbarProps = {
  productCount: number;
  priceBounds?: CollectionFilterBounds;
};

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export function CollectionToolbar({ productCount, priceBounds }: CollectionToolbarProps) {
  const { sort, setSort } = useCollectionFilters(priceBounds);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {productCount} {productCount === 1 ? "product" : "products"}
      </p>
      <Select value={sort} onValueChange={(v) => setSort(v as ProductSortOption)}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
