import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { storefrontService } from "@/server/services/storefront.service";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";
import type { HomepageConfig } from "@/types/store-theme";

type FeaturedCategoriesProps = {
  section: HomepageConfig["featuredSection"];
};

export async function FeaturedCategories({ section }: FeaturedCategoriesProps) {
  if (!section.enabled || !section.tiles.length) return null;

  const collections = await storefrontService.getCollections();
  const byHandle = new Map(collections.map((c) => [c.handle, c]));

  const items = section.tiles
    .map((tile, index) => {
      const col = byHandle.get(tile.handle);
      const image = tile.imageUrl ?? col?.image;
      if (!image) return null;
      return {
        id: col?.id ?? tile.handle,
        handle: tile.handle,
        title: tile.title ?? col?.title ?? tile.handle,
        image,
        tagline: tile.tagline,
        index: String(index + 1).padStart(2, "0"),
        featured: !!tile.featured,
        accent: !!tile.accent,
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    handle: string;
    title: string;
    image: string;
    tagline: string;
    index: string;
    featured: boolean;
    accent?: boolean;
  }>;

  if (!items.length) return null;

  const featured = items.find((i) => i.featured) ?? items[0];
  const secondary = items.filter((i) => i.id !== featured.id);

  return (
    <section className="relative overflow-hidden bg-secondary/25">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--accent)/0.12),transparent)] pointer-events-none" />
      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <ScrollReveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
            href={section.linkHref}
            linkLabel={section.linkLabel}
          />
        </ScrollReveal>

        <div className="mt-10 md:mt-14 flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-stretch lg:gap-5">
          <ScrollReveal className="lg:flex-[1.12] lg:min-h-[560px]" delay={0.05}>
            <CollectionTile item={featured} size="featured" className="h-full" />
          </ScrollReveal>

          <div className="flex flex-col gap-3 md:gap-4 lg:flex-1 lg:min-h-[560px]">
            {secondary.map((item, i) => (
              <ScrollReveal key={item.id} className="flex-1 min-h-0" delay={0.1 + i * 0.06}>
                <CollectionTile item={item} size="compact" className="h-full min-h-[168px]" />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type TileItem = {
  handle: string;
  title: string;
  image: string;
  tagline: string;
  index: string;
  accent?: boolean;
};

function CollectionTile({
  item,
  size,
  className,
}: {
  item: TileItem;
  size: "featured" | "compact";
  className?: string;
}) {
  const isFeatured = size === "featured";

  return (
    <Link
      href={`/collections/${item.handle}`}
      className={cn(
        "group relative block overflow-hidden rounded-sm bg-foreground/5 ring-1 ring-border/50",
        "transition-[box-shadow,ring-color] duration-500 hover:ring-foreground/20 hover:shadow-lg hover:shadow-black/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isFeatured ? "min-h-[340px] md:min-h-[420px]" : "min-h-[168px]",
        className
      )}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        sizes={
          isFeatured
            ? "(max-width: 1024px) 100vw, 58vw"
            : "(max-width: 1024px) 100vw, 42vw"
        }
        priority={isFeatured}
      />

      <div
        className={cn(
          "absolute inset-0 transition-colors duration-500",
          item.accent
            ? "bg-gradient-to-t from-black/75 via-black/25 to-black/5 group-hover:from-black/80"
            : "bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/75"
        )}
      />

      {item.accent && (
        <span className="absolute top-4 right-4 z-10 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
          Sale
        </span>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 md:p-6",
          isFeatured && "md:p-8"
        )}
      >
        <div className="min-w-0 text-white">
          <span className="text-[10px] font-medium tabular-nums tracking-[0.35em] text-white/50">
            {item.index}
          </span>
          <h3
            className={cn(
              "font-serif tracking-tight text-white mt-1",
              isFeatured ? "text-3xl md:text-4xl lg:text-5xl" : "text-xl md:text-2xl"
            )}
          >
            {item.title}
          </h3>
          <p
            className={cn(
              "mt-1.5 text-white/70 leading-snug",
              isFeatured ? "text-sm md:text-base max-w-md" : "text-xs md:text-sm line-clamp-1"
            )}
          >
            {item.tagline}
          </p>
        </div>

        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm",
            "text-white transition-all duration-300",
            "group-hover:bg-white group-hover:text-foreground group-hover:border-white",
            isFeatured ? "h-12 w-12 md:h-14 md:w-14" : "h-10 w-10"
          )}
          aria-hidden
        >
          <ArrowUpRight
            className={cn(
              "transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
              isFeatured ? "h-5 w-5 md:h-6 md:w-6" : "h-4 w-4"
            )}
          />
        </span>
      </div>
    </Link>
  );
}
