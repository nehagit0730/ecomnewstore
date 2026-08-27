import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductBreadcrumbsProps = {
  category: string;
  title: string;
  className?: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  accessories: "Accessories",
};

export function ProductBreadcrumbs({ category, title, className }: ProductBreadcrumbsProps) {
  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground", className)}
    >
      <Link href="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
      <Link
        href={`/collections/${category}`}
        className="hover:text-foreground transition-colors"
      >
        {categoryLabel}
      </Link>
      <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
      <span className="text-foreground line-clamp-1">{title}</span>
    </nav>
  );
}
