import type { CollectionFilters, ProductSortOption } from "@/types/product";

export const DEFAULT_PRICE_MAX = 10000;

export type PriceBounds = {
  min: number;
  max: number;
};

export function buildProductListParams(
  filters: CollectionFilters,
  sort: ProductSortOption,
  options?: {
    collectionHandle?: string;
    defaultPriceMax?: number;
    catalogPriceMin?: number;
  }
): Record<string, string | string[]> {
  const defaultPriceMax = options?.defaultPriceMax ?? DEFAULT_PRICE_MAX;
  const catalogPriceMin = options?.catalogPriceMin ?? 0;
  const params: Record<string, string | string[]> = {
    sort,
    limit: "12",
  };

  if (options?.collectionHandle) {
    params.collection = options.collectionHandle;
  }
  if (filters.categories.length) {
    params.category = filters.categories;
  }
  if (filters.brands.length) {
    params.brand = filters.brands;
  }
  if (filters.colors.length) {
    params.color = filters.colors;
  }
  if (filters.sizes.length) {
    params.size = filters.sizes;
  }

  const priceFiltered =
    filters.priceMin > catalogPriceMin || filters.priceMax < defaultPriceMax;
  if (priceFiltered) {
    params.priceMin = String(filters.priceMin);
    params.priceMax = String(filters.priceMax);
  }

  return params;
}
