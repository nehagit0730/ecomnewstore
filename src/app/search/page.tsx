import { Suspense } from "react";
import { SearchResults } from "@/components/search/search-results";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Search",
  path: "/search",
  noIndex: true,
});

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="font-serif text-3xl mb-8">Search</h1>
      <Suspense fallback={<div className="animate-pulse h-96 bg-secondary" />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
