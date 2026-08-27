import { apiClient } from "@/lib/api-client";
import type { Product } from "@/types/product";

export type ProductsResponse = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchProducts(params: Record<string, string | string[]> = {}) {
  return apiClient<ProductsResponse>("/products", { params });
}

export type ProductFacets = {
  brands: string[];
  colors: { slug: string; name: string; hex: string }[];
  sizes: string[];
  priceMin: number;
  priceMax: number;
};

export async function fetchProductFacets(collection?: string) {
  return apiClient<ProductFacets>("/products/facets", {
    params: collection ? { collection } : {},
  });
}

export async function fetchProduct(handle: string) {
  return apiClient<{ product: Product; related: Product[] }>(`/products/${handle}`);
}

export async function fetchCollections() {
  return apiClient<
    { id: string; handle: string; title: string; description: string | null; image: string | null }[]
  >("/collections");
}
