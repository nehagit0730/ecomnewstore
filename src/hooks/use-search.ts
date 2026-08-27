"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchProducts } from "@/lib/api";
import { TRENDING_SEARCHES } from "@/lib/constants";
import { useSearchStore } from "@/stores/search-store";

export function useSearchSuggestions(query: string) {
  const { history } = useSearchStore();

  const suggestions = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const res = await fetchProducts({ search: query, limit: "6" });
      return res.items;
    },
    enabled: query.length >= 2,
    staleTime: 30_000,
  });

  const trending = useMemo(() => TRENDING_SEARCHES, []);

  return {
    results: suggestions.data ?? [],
    isLoading: suggestions.isLoading,
    trending,
    history,
  };
}
