import type { MegaMenuItem } from "@/types/store-theme";

export function buildMegaMenuFromCollections(
  collections: { title: string; handle: string; image: string | null; description: string | null }[]
): MegaMenuItem[] {
  return collections.slice(0, 6).map((col) => ({
    label: col.title,
    href: `/collections/${col.handle}`,
    columns: [
      {
        title: "Shop",
        links: [
          { label: `All ${col.title}`, href: `/collections/${col.handle}` },
          { label: "New in collection", href: `/collections/${col.handle}?sort=newest` },
        ],
      },
    ],
    featured: col.image
      ? {
          title: col.title,
          subtitle: col.description ?? "Shop the collection",
          image: col.image,
          href: `/collections/${col.handle}`,
        }
      : undefined,
  }));
}
