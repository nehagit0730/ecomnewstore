import { DEFAULT_SIZE_CHART } from "@/lib/size-chart-defaults";
import { prisma } from "@/server/db/prisma";
import { productRepository } from "@/server/repositories/product.repository";
import { mapDbProductToCard } from "@/server/mappers/product.mapper";
import type { Product } from "@/types/product";
import { PRODUCTS } from "@/data/products";
import { COLLECTIONS } from "@/data/collections";

const storefrontProductWhere = {
  isActive: true,
  approvalStatus: "APPROVED" as const,
  OR: [{ vendorId: null }, { vendor: { status: "ACTIVE" as const } }],
};

export class StorefrontService {
  async getApprovedProducts(limit = 12): Promise<Product[]> {
    try {
      const rows = await prisma.product.findMany({
        where: storefrontProductWhere,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 2 },
          variants: { where: { isActive: true }, include: { inventory: true } },
          category: { select: { slug: true } },
        },
      });
      return rows.map((p) =>
        mapDbProductToCard({
          ...p,
          description: p.description,
          materials: p.materials,
          careInstructions: p.careInstructions,
          shippingInfo: p.shippingInfo,
          returnPolicy: p.returnPolicy,
          createdAt: p.createdAt,
          variants: p.variants,
        })
      );
    } catch {
      return PRODUCTS.slice(0, limit);
    }
  }

  async getNewArrivals(limit = 8): Promise<Product[]> {
    try {
      const rows = await prisma.product.findMany({
        where: { ...storefrontProductWhere, isNew: true },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 2 },
          variants: { where: { isActive: true }, include: { inventory: true } },
          category: { select: { slug: true } },
        },
      });
      if (rows.length < limit) {
        const extra = await prisma.product.findMany({
          where: storefrontProductWhere,
          take: limit - rows.length,
          orderBy: { createdAt: "desc" },
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 2 },
            variants: { where: { isActive: true }, include: { inventory: true } },
            category: { select: { slug: true } },
          },
        });
        rows.push(...extra.filter((e) => !rows.find((r) => r.id === e.id)));
      }
      return rows.map((p) =>
        mapDbProductToCard({
          ...p,
          description: p.description,
          materials: p.materials,
          careInstructions: p.careInstructions,
          shippingInfo: p.shippingInfo,
          returnPolicy: p.returnPolicy,
          createdAt: p.createdAt,
          variants: p.variants,
        })
      );
    } catch {
      const newItems = PRODUCTS.filter((p) => p.isNew);
      return (newItems.length ? newItems : PRODUCTS).slice(0, limit);
    }
  }

  async getBestSellers(limit = 8): Promise<Product[]> {
    try {
      const rows = await prisma.product.findMany({
        where: { ...storefrontProductWhere, isBestSeller: true },
        take: limit,
        orderBy: { reviewCount: "desc" },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 2 },
          variants: { where: { isActive: true }, include: { inventory: true } },
          category: { select: { slug: true } },
        },
      });
      return rows.map((p) =>
        mapDbProductToCard({
          ...p,
          description: p.description,
          materials: p.materials,
          careInstructions: p.careInstructions,
          shippingInfo: p.shippingInfo,
          returnPolicy: p.returnPolicy,
          createdAt: p.createdAt,
          variants: p.variants,
        })
      );
    } catch {
      const best = PRODUCTS.filter((p) => p.isBestSeller);
      return (best.length ? best : PRODUCTS).slice(0, limit);
    }
  }

  async getTrending(limit = 8): Promise<Product[]> {
    try {
      const rows = await prisma.product.findMany({
        where: { ...storefrontProductWhere, isTrending: true },
        take: limit,
        orderBy: { rating: "desc" },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 2 },
          variants: { where: { isActive: true }, include: { inventory: true } },
          category: { select: { slug: true } },
        },
      });
      return rows.map((p) =>
        mapDbProductToCard({
          ...p,
          description: p.description,
          materials: p.materials,
          careInstructions: p.careInstructions,
          shippingInfo: p.shippingInfo,
          returnPolicy: p.returnPolicy,
          createdAt: p.createdAt,
          variants: p.variants,
        })
      );
    } catch {
      const trending = PRODUCTS.filter((p) => p.isTrending);
      return (trending.length ? trending : PRODUCTS).slice(0, limit);
    }
  }

  private mapProductRows(
    rows: Awaited<ReturnType<typeof productRepository.findMany>>["items"]
  ): Product[] {
    return rows.map((p) =>
      mapDbProductToCard({
        ...p,
        description: p.description,
        materials: p.materials,
        careInstructions: p.careInstructions,
        shippingInfo: p.shippingInfo,
        returnPolicy: p.returnPolicy,
        createdAt: p.createdAt,
        variants: p.variants,
      })
    );
  }

  async getProductsByCollection(handle: string, limit = 8): Promise<Product[]> {
    const { items } = await productRepository.findMany({
      collectionHandle: handle,
      limit,
      sort: "newest",
    });
    return this.mapProductRows(items);
  }

  async getProductsByCategory(slug: string, limit = 8): Promise<Product[]> {
    const { items } = await productRepository.findMany({
      categorySlugs: [slug],
      limit,
      sort: "newest",
    });
    return this.mapProductRows(items);
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) return [];
    try {
      const rows = await prisma.product.findMany({
        where: { id: { in: ids }, ...storefrontProductWhere },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 2 },
          variants: { where: { isActive: true }, include: { inventory: true } },
          category: { select: { slug: true } },
        },
      });
      const byId = new Map(rows.map((r) => [r.id, r]));
      return ids
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((p) =>
          mapDbProductToCard({
            ...p!,
            description: p!.description,
            materials: p!.materials,
            careInstructions: p!.careInstructions,
            shippingInfo: p!.shippingInfo,
            returnPolicy: p!.returnPolicy,
            createdAt: p!.createdAt,
            variants: p!.variants,
          })
        );
    } catch {
      return PRODUCTS.filter((p) => ids.includes(p.id));
    }
  }

  async getCollection(handle: string) {
    try {
      const col = await prisma.collection.findFirst({
        where: { handle, isActive: true },
        include: {
          products: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                  variants: { take: 1 },
                },
              },
            },
          },
        },
      });
      if (col) return col;
    } catch {
      // Fallback
    }

    const fallback = COLLECTIONS.find((c) => c.handle === handle);
    if (!fallback) return null;
    return {
      id: fallback.id,
      title: fallback.title,
      handle: fallback.handle,
      description: fallback.description || null,
      image: fallback.image || null,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      products: [],
    };
  }

  async getCollections() {
    try {
      const list = await prisma.collection.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
      if (list.length > 0) return list;
    } catch {
      // Fallback
    }

    return COLLECTIONS.map((c, i) => ({
      id: c.id,
      title: c.title,
      handle: c.handle,
      description: c.description || null,
      image: c.image || null,
      isActive: true,
      sortOrder: i,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async getCategories() {
    try {
      const list = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      });
      if (list.length > 0) return list;
    } catch {
      // Fallback
    }

    return [
      { id: "cat-men", name: "Men", slug: "men", isActive: true, sortOrder: 1, _count: { products: 24 } },
      { id: "cat-women", name: "Women", slug: "women", isActive: true, sortOrder: 2, _count: { products: 28 } },
      { id: "cat-kids", name: "Kids", slug: "kids", isActive: true, sortOrder: 3, _count: { products: 16 } },
      { id: "cat-accessories", name: "Accessories", slug: "accessories", isActive: true, sortOrder: 4, _count: { products: 18 } },
    ];
  }

  async getPublishedPage(handle: string) {
    try {
      const page = await prisma.storePage.findFirst({
        where: { handle, isPublished: true },
      });
      if (page) return page;
    } catch {
      // Fallback
    }

    const staticPages: Record<string, { title: string; body: string }> = {
      "about-us": {
        title: "About Veloire",
        body: "Veloire is dedicated to timeless luxury and mindful craftsmanship.",
      },
      "shipping-policy": {
        title: "Shipping Policy",
        body: "We offer complimentary standard shipping across India on orders above ₹1,999.",
      },
      "return-policy": {
        title: "Return & Exchange Policy",
        body: "Enjoy hassle-free returns and exchanges within 30 days of delivery.",
      },
      "contact-us": {
        title: "Contact Us",
        body: "Need help? Reach our concierge team at support@veloire.com.",
      },
      "privacy-policy": {
        title: "Privacy Policy",
        body: "Your privacy is paramount to us.",
      },
      "terms-of-service": {
        title: "Terms of Service",
        body: "Welcome to Veloire. By using our website, you agree to our terms.",
      },
    };

    const found = staticPages[handle];
    if (!found) return null;
    return {
      id: `page-${handle}`,
      title: found.title,
      handle,
      body: found.body,
      isPublished: true,
      showInFooter: true,
      seoTitle: found.title,
      seoDescription: found.body,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getFooterPages() {
    try {
      const pages = await prisma.storePage.findMany({
        where: { isPublished: true, showInFooter: true },
        orderBy: { sortOrder: "asc" },
        select: { title: true, handle: true },
      });
      if (pages.length > 0) return pages;
    } catch {
      // Fallback
    }

    return [
      { title: "About Us", handle: "about-us" },
      { title: "Shipping Policy", handle: "shipping-policy" },
      { title: "Return Policy", handle: "return-policy" },
      { title: "Privacy Policy", handle: "privacy-policy" },
      { title: "Terms of Service", handle: "terms-of-service" },
      { title: "Contact Us", handle: "contact-us" },
    ];
  }

  async getSizeChart() {
    try {
      const setting = await prisma.siteSetting.findUnique({
        where: { key: "storefront.sizeChart" },
      });
      const value = setting?.value as { title?: string; content?: string } | undefined;
      return {
        title: value?.title?.trim() || DEFAULT_SIZE_CHART.title,
        content: value?.content?.trim() || DEFAULT_SIZE_CHART.content,
      };
    } catch {
      return {
        title: DEFAULT_SIZE_CHART.title,
        content: DEFAULT_SIZE_CHART.content,
      };
    }
  }

  async getHomeHero() {
    const { storeThemeService } = await import("@/server/services/store-theme.service");
    const homepage = await storeThemeService.getHomepage();
    return homepage.hero;
  }
}

export const storefrontService = new StorefrontService();
