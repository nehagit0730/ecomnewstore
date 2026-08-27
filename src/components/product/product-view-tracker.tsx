"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export function ProductViewTracker({ handle }: { handle: string }) {
  const { addProduct } = useRecentlyViewed();

  useEffect(() => {
    addProduct(handle);
  }, [handle, addProduct]);

  return null;
}
