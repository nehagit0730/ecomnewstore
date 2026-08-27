"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/types/product";

export type ProductsPage = {
  products: Product[];
  total: number;
  hasMore: boolean;
};

export function useInfiniteProducts(
  params: Record<string, string | string[]> = {},
  initialPage?: ProductsPage
) {
  return useInfiniteQuery({
    queryKey: ["products", params],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetchProducts({
        ...params,
        page: String(pageParam),
        limit: params.limit ?? "12",
      });
      const limit = Number(params.limit ?? 12);
      return {
        products: result.items,
        total: result.total,
        hasMore: pageParam * limit < result.total,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [1] }
      : undefined,
    retry: 2,
  });
}
