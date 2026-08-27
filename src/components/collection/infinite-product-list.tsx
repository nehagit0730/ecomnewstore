"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInfiniteProducts, type ProductsPage } from "@/hooks/use-infinite-products";
import type { Product } from "@/types/product";
import { useCollectionFilters } from "@/hooks/use-collection-filters";
import { buildProductListParams, DEFAULT_PRICE_MAX } from "@/lib/product-list-params";
import type { CollectionFilterBounds } from "@/hooks/use-collection-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { CollectionToolbar } from "./collection-toolbar";
import { ActiveFilters } from "./active-filters";
import { Button } from "@/components/ui/button";

type InfiniteProductListProps = {
  collectionHandle?: string;
  priceBounds?: CollectionFilterBounds;
  initialPage?: ProductsPage;
};

export function InfiniteProductList({
  collectionHandle,
  priceBounds = { priceMin: 0, priceMax: DEFAULT_PRICE_MAX },
  initialPage,
}: InfiniteProductListProps) {
  const { sort, filters } = useCollectionFilters(priceBounds);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filterParams = useMemo(
    () =>
      buildProductListParams(filters, sort, {
        collectionHandle,
        defaultPriceMax: priceBounds.priceMax,
        catalogPriceMin: priceBounds.priceMin,
      }),
    [filters, sort, collectionHandle, priceBounds]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useInfiniteProducts(filterParams, initialPage);

  const products: Product[] = data?.pages.flatMap((p) => p.products) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading && !initialPage) {
    return (
      <div className="space-y-6">
        <div className="h-10 animate-pulse bg-secondary rounded-sm" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Could not load products."}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CollectionToolbar productCount={total} priceBounds={priceBounds} />
      <ActiveFilters priceBounds={priceBounds} />
      {isFetching && !isFetchingNextPage && (
        <p className="text-xs text-muted-foreground">Updating results…</p>
      )}
      {products.length ? (
        <>
          <ProductGrid products={products} columns={3} />
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <p className="text-sm text-muted-foreground">Loading more...</p>
            )}
            {hasNextPage && !isFetchingNextPage && (
              <Button variant="outline" onClick={() => fetchNextPage()}>
                Load More
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No products match your filters.</p>
        </div>
      )}
    </div>
  );
}
