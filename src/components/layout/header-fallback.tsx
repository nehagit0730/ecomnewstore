import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

/** Visible immediately while store header config loads from the database */
export function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="w-5 lg:hidden" aria-hidden />
        <Link
          href="/"
          className="font-serif text-xl tracking-[0.2em] uppercase md:text-2xl"
        >
          {SITE_NAME}
        </Link>
        <div className="hidden lg:block flex-1" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-sm bg-secondary/80 animate-pulse" />
          <div className="h-9 w-9 rounded-sm bg-secondary/80 animate-pulse" />
          <div className="h-9 w-9 rounded-sm bg-secondary/80 animate-pulse" />
        </div>
      </div>
    </header>
  );
}
