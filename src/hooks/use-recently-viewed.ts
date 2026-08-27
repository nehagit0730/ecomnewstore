"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/types/product";

const STORAGE_KEY = "veloire-recently-viewed";
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [handles, setHandles] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHandles(JSON.parse(stored));
    } catch {
      setHandles([]);
    }
  }, []);

  const addProduct = useCallback((handle: string) => {
    setHandles((prev) => {
      const next = [handle, ...prev.filter((h) => h !== handle)].slice(
        0,
        MAX_ITEMS
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { handles, addProduct };
}

export function filterRecentlyViewed(
  handles: string[],
  products: Product[],
  excludeHandle?: string
): Product[] {
  return handles
    .filter((h) => h !== excludeHandle)
    .map((h) => products.find((p) => p.handle === h))
    .filter((p): p is Product => !!p);
}
