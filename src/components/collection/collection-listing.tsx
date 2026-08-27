"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProductFacets } from "@/lib/api";
import { DEFAULT_PRICE_MAX } from "@/lib/product-list-params";
import { CollectionFilters } from "./collection-filters";
import { InfiniteProductList } from "./infinite-product-list";
import type { ProductsPage } from "@/hooks/use-infinite-products";

type CollectionListingProps = {
  collectionHandle: string;
  initialPage?: ProductsPage;
};

export function CollectionListing({
  collectionHandle,
  initialPage,
}: CollectionListingProps) {
  const { data: facets } = useQuery({
    queryKey: ["product-facets", collectionHandle],
    queryFn: () => fetchProductFacets(collectionHandle),
    staleTime: 60_000,
  });

  const priceBounds = {
    priceMin: facets?.priceMin ?? 0,
    priceMax: facets?.priceMax ?? DEFAULT_PRICE_MAX,
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <Suspense fallback={<div className="animate-pulse h-96 bg-secondary" />}>
          <CollectionFilters
            collectionHandle={collectionHandle}
            priceBounds={priceBounds}
          />
        </Suspense>
      </aside>
      <div>
        <Suspense fallback={<div className="animate-pulse h-96 bg-secondary" />}>
          <InfiniteProductList
            collectionHandle={collectionHandle}
            priceBounds={priceBounds}
            initialPage={initialPage}
          />
        </Suspense>
      </div>
    </div>
  );
}
