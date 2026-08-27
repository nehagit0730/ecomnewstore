"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DEFAULT_PRICE_MAX } from "@/lib/product-list-params";
import type { CollectionFilters, ProductSortOption } from "@/types/product";

export type CollectionFilterBounds = {
  priceMin: number;
  priceMax: number;
};

export function useCollectionFilters(bounds: CollectionFilterBounds = {
  priceMin: 0,
  priceMax: DEFAULT_PRICE_MAX,
}) {
  const { priceMin: catalogPriceMin, priceMax: catalogPriceMax } = bounds;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = (searchParams.get("sort") as ProductSortOption) || "featured";

  const filters: CollectionFilters = useMemo(() => {
    const categories = searchParams.getAll("category") as CollectionFilters["categories"];
    const brands = searchParams.getAll("brand");
    const colors = searchParams.getAll("color");
    const sizes = searchParams.getAll("size");
    const priceMin = searchParams.has("priceMin")
      ? Number(searchParams.get("priceMin"))
      : catalogPriceMin;
    const priceMax = searchParams.has("priceMax")
      ? Number(searchParams.get("priceMax"))
      : catalogPriceMax;

    return {
      categories,
      brands,
      colors,
      sizes,
      priceMin,
      priceMax,
    };
  }, [searchParams, catalogPriceMin, catalogPriceMax]);

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        params.delete(key);
        if (value === null) return;
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      });

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const setSort = (value: ProductSortOption) => updateParams({ sort: value });

  const paramKeys: Record<
    keyof Pick<CollectionFilters, "categories" | "brands" | "colors" | "sizes">,
    string
  > = {
    categories: "category",
    brands: "brand",
    colors: "color",
    sizes: "size",
  };

  const toggleFilter = (
    key: keyof Pick<CollectionFilters, "categories" | "brands" | "colors" | "sizes">,
    value: string
  ) => {
    const current = filters[key] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [paramKeys[key]]: next.length ? next : null });
  };

  const setPriceRange = useCallback(
    (min: number, max: number) => {
      const atCatalogDefaults = min <= catalogPriceMin && max >= catalogPriceMax;
      updateParams({
        priceMin: atCatalogDefaults ? null : String(min),
        priceMax: atCatalogDefaults ? null : String(max),
      });
    },
    [catalogPriceMin, catalogPriceMax, updateParams]
  );

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length) count += filters.categories.length;
    if (filters.brands.length) count += filters.brands.length;
    if (filters.colors.length) count += filters.colors.length;
    if (filters.sizes.length) count += filters.sizes.length;
    if (filters.priceMin > catalogPriceMin || filters.priceMax < catalogPriceMax) {
      count += 1;
    }
    return count;
  }, [filters, catalogPriceMin, catalogPriceMax]);

  return {
    sort,
    filters,
    setSort,
    toggleFilter,
    setPriceRange,
    clearFilters,
    activeFilterCount,
    updateParams,
  };
}
