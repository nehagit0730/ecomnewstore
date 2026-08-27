"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Clock, TrendingUp, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/stores/search-store";
import { useSearchSuggestions } from "@/hooks/use-search";
import { formatPrice } from "@/lib/utils";

export function SearchDialog() {
  const router = useRouter();
  const { isOpen, query, setQuery, close, addToHistory, history, clearHistory } =
    useSearchStore();
  const { results, isLoading, trending } = useSearchSuggestions(query);

  const navigate = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      addToHistory(trimmed);
      close();
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [addToHistory, close, router]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        useSearchStore.getState().open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products, brands..."
              className="border-0 pl-10 pr-10 focus-visible:ring-0 text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && navigate(query)}
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.length >= 2 ? (
            isLoading ? (
              <p className="text-sm text-muted-foreground py-4">Searching...</p>
            ) : results.length ? (
              <ul className="space-y-2">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.handle}`}
                      onClick={() => {
                        addToHistory(query);
                        close();
                      }}
                      className="flex items-center gap-3 rounded-sm p-2 hover:bg-secondary transition-colors"
                    >
                      <div className="relative h-14 w-11 overflow-hidden bg-secondary shrink-0">
                        <Image
                          src={product.featuredImage}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => navigate(query)}
                    className="w-full text-left text-sm font-medium py-2 text-gold hover:underline"
                  >
                    View all results for &quot;{query}&quot;
                  </button>
                </li>
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                No results found
              </p>
            )
          ) : (
            <div className="space-y-6">
              {history.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-widest flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Recent
                    </p>
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {history.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => navigate(term)}
                        className="rounded-full border px-3 py-1 text-xs hover:bg-secondary transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest flex items-center gap-1 mb-2">
                  <TrendingUp className="h-3 w-3" /> Trending
                </p>
                <div className="flex flex-wrap gap-2">
                  {trending.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => navigate(term)}
                      className="rounded-full border px-3 py-1 text-xs hover:bg-secondary transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
