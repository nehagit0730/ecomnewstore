import type { MetadataRoute } from "next";
import { prisma } from "@/server/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [products, collections, pages] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, approvalStatus: "APPROVED" },
      select: { handle: true, updatedAt: true },
    }),
    prisma.collection.findMany({
      where: { isActive: true },
      select: { handle: true, updatedAt: true },
    }),
    prisma.storePage.findMany({
      where: { isPublished: true },
      select: { handle: true, updatedAt: true },
    }),
  ]);

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...products.map((p) => ({
      url: `${base}/products/${p.handle}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...collections.map((c) => ({
      url: `${base}/collections/${c.handle}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...pages.map((p) => ({
      url: `${base}/pages/${p.handle}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
