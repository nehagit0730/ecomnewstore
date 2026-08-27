import { Prisma } from "@prisma/client";
import { DEFAULT_PRICE_MAX } from "@/lib/product-list-params";
import { prisma } from "@/server/db/prisma";
import { PRODUCTS } from "@/data/products";

const storefrontVisibility: Prisma.ProductWhereInput = {
  isActive: true,
  approvalStatus: "APPROVED",
  OR: [{ vendorId: null }, { vendor: { status: "ACTIVE" } }],
};

export type ProductListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categorySlugs?: string[];
  collectionHandle?: string;
  brands?: string[];
  colors?: string[];
  sizes?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sort?: string;
};

function buildVariantFilter(query: ProductListQuery): Prisma.ProductVariantWhereInput | undefined {
  const hasColors = (query.colors?.length ?? 0) > 0;
  const hasSizes = (query.sizes?.length ?? 0) > 0;
  const hasPrice =
    query.priceMin !== undefined || query.priceMax !== undefined;

  if (!hasColors && !hasSizes && !hasPrice && !query.inStock) {
    return undefined;
  }

  return {
    isActive: true,
    ...(hasColors ? { colorSlug: { in: query.colors } } : {}),
    ...(hasSizes
      ? {
          OR: [
            { sizeValue: { in: query.sizes } },
            { sizeLabel: { in: query.sizes } },
          ],
        }
      : {}),
    ...(hasPrice
      ? {
          price: {
            ...(query.priceMin !== undefined ? { gte: query.priceMin } : {}),
            ...(query.priceMax !== undefined ? { lte: query.priceMax } : {}),
          },
        }
      : {}),
    ...(query.inStock ? { inventory: { quantity: { gt: 0 } } } : {}),
  };
}

function mapStaticProductToDbShape(p: typeof PRODUCTS[number]) {
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description,
    brand: p.brand,
    categoryId: p.category,
    materials: p.materials,
    careInstructions: p.careInstructions,
    shippingInfo: p.shippingInfo,
    returnPolicy: p.returnPolicy,
    sizeChart: p.sizeChart,
    isFeatured: Boolean(p.isBestSeller || p.isTrending || p.isNew),
    isNew: Boolean(p.isNew),
    isTrending: Boolean(p.isTrending),
    isBestSeller: Boolean(p.isBestSeller),
    isActive: true,
    approvalStatus: "APPROVED" as const,
    rejectionReason: null,
    rating: p.rating,
    reviewCount: p.reviewCount,
    vendorId: null,
    createdAt: new Date(p.createdAt || "2025-01-01"),
    updatedAt: new Date(),
    images: p.images.map((url, i) => ({
      id: `${p.id}-img-${i}`,
      productId: p.id,
      url,
      altText: p.title,
      sortOrder: i,
      createdAt: new Date(),
    })),
    variants: p.variants.map((v, i) => ({
      id: v.id,
      productId: p.id,
      sku: v.sku,
      colorName: v.color.name,
      colorSlug: v.color.slug,
      colorHex: v.color.hex,
      sizeLabel: v.sizes[0]?.label || "M",
      sizeValue: v.sizes[0]?.value || "M",
      price: new Prisma.Decimal(p.price),
      compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice) : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      inventory: {
        id: `inv-${v.id}`,
        variantId: v.id,
        quantity: p.stockCount,
        reservedQuantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })),
    category: {
      id: p.category,
      name: p.category.charAt(0).toUpperCase() + p.category.slice(1),
      slug: p.category,
    },
  };
}

export class ProductRepository {
  private baseWhere(query: ProductListQuery): Prisma.ProductWhereInput {
    const and: Prisma.ProductWhereInput[] = [storefrontVisibility];

    if (query.search) {
      and.push({
        OR: [
          { title: { contains: query.search, mode: "insensitive" } },
          { brand: { contains: query.search, mode: "insensitive" } },
          { handle: { contains: query.search, mode: "insensitive" } },
        ],
      });
    }

    if (query.categoryId) {
      and.push({ categoryId: query.categoryId });
    }
    if (query.categorySlugs?.length) {
      and.push({ category: { slug: { in: query.categorySlugs } } });
    }
    if (query.brands?.length) {
      and.push({ brand: { in: query.brands } });
    }
    if (query.collectionHandle) {
      and.push({
        collections: { some: { collection: { handle: query.collectionHandle } } },
      });
    }

    const variantFilter = buildVariantFilter(query);
    if (variantFilter) {
      and.push({ variants: { some: variantFilter } });
    }

    return and.length === 1 ? and[0] : { AND: and };
  }

  async findMany(query: ProductListQuery) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 12, 100);
    const skip = (page - 1) * limit;

    try {
      const where = this.baseWhere(query);

      let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ createdAt: "desc" }];
      switch (query.sort) {
        case "newest":
          orderBy = [{ createdAt: "desc" }];
          break;
        case "featured":
          orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
          break;
        case "best-selling":
          orderBy = [{ isBestSeller: "desc" }, { createdAt: "desc" }];
          break;
        case "rating":
          orderBy = [{ rating: "desc" }];
          break;
        default:
          orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
      }

      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 2 },
            variants: {
              where: { isActive: true },
              include: { inventory: true },
            },
            category: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.product.count({ where }),
      ]);

      return { items, total, page, limit };
    } catch {
      // Fallback to static PRODUCTS
      let filtered = [...PRODUCTS];

      if (query.search) {
        const q = query.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.handle.toLowerCase().includes(q)
        );
      }

      if (query.categorySlugs?.length) {
        filtered = filtered.filter((p) => query.categorySlugs?.includes(p.category));
      }

      if (query.collectionHandle) {
        if (query.collectionHandle === "new-arrivals") {
          filtered = filtered.filter((p) => p.isNew);
        } else if (query.collectionHandle === "best-sellers") {
          filtered = filtered.filter((p) => p.isBestSeller);
        } else if (query.collectionHandle === "trending") {
          filtered = filtered.filter((p) => p.isTrending);
        } else if (["men", "women", "kids", "accessories"].includes(query.collectionHandle)) {
          filtered = filtered.filter((p) => p.category === query.collectionHandle);
        }
      }

      if (query.brands?.length) {
        filtered = filtered.filter((p) => query.brands?.includes(p.brand));
      }

      if (query.colors?.length) {
        filtered = filtered.filter((p) =>
          p.colors.some((c) => query.colors?.includes(c.slug))
        );
      }

      if (query.sizes?.length) {
        filtered = filtered.filter((p) =>
          p.sizes.some((s) => query.sizes?.includes(s))
        );
      }

      if (query.priceMin !== undefined) {
        filtered = filtered.filter((p) => p.price >= query.priceMin!);
      }
      if (query.priceMax !== undefined) {
        filtered = filtered.filter((p) => p.price <= query.priceMax!);
      }
      if (query.inStock) {
        filtered = filtered.filter((p) => p.inStock);
      }

      switch (query.sort) {
        case "newest":
          filtered.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
          break;
        case "featured":
          filtered.sort((a, b) => (b.isBestSeller || b.isTrending ? 1 : 0) - (a.isBestSeller || a.isTrending ? 1 : 0));
          break;
        case "best-selling":
          filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
          break;
        case "rating":
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case "price-asc":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          filtered.sort((a, b) => b.price - a.price);
          break;
      }

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit);
      const items = paginated.map(mapStaticProductToDbShape);

      return { items, total, page, limit };
    }
  }

  async getFacets(collectionHandle?: string) {
    try {
      const where = this.baseWhere({ collectionHandle });

      const products = await prisma.product.findMany({
        where,
        select: {
          brand: true,
          variants: {
            where: { isActive: true },
            select: {
              colorSlug: true,
              colorName: true,
              colorHex: true,
              sizeLabel: true,
              sizeValue: true,
              price: true,
            },
          },
        },
      });

      const brandSet = new Set<string>();
      const colorMap = new Map<string, { slug: string; name: string; hex: string }>();
      const sizeSet = new Set<string>();
      let priceMin = Infinity;
      let priceMax = 0;

      for (const product of products) {
        if (product.brand) brandSet.add(product.brand);
        for (const v of product.variants) {
          if (v.colorSlug) {
            colorMap.set(v.colorSlug, {
              slug: v.colorSlug,
              name: v.colorName,
              hex: v.colorHex ?? "#888888",
            });
          }
          if (v.sizeLabel) sizeSet.add(v.sizeLabel);
          if (v.sizeValue) sizeSet.add(v.sizeValue);
          const price = Number(v.price);
          if (price < priceMin) priceMin = price;
          if (price > priceMax) priceMax = price;
        }
      }

      const sortSizes = (a: string, b: string) => {
        const order = ["XS", "S", "M", "L", "XL", "XXL", "OS"];
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.localeCompare(b);
      };

      return {
        brands: [...brandSet].sort(),
        colors: [...colorMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
        sizes: [...sizeSet].sort(sortSizes),
        priceMin: priceMin === Infinity ? 0 : Math.floor(priceMin),
        priceMax: priceMax === 0 ? DEFAULT_PRICE_MAX : Math.ceil(priceMax),
      };
    } catch {
      // Fallback facets from PRODUCTS
      const brandSet = new Set<string>();
      const colorMap = new Map<string, { slug: string; name: string; hex: string }>();
      const sizeSet = new Set<string>();
      let priceMin = Infinity;
      let priceMax = 0;

      let list = PRODUCTS;
      if (collectionHandle && ["men", "women", "kids", "accessories"].includes(collectionHandle)) {
        list = list.filter((p) => p.category === collectionHandle);
      }

      for (const p of list) {
        if (p.brand) brandSet.add(p.brand);
        for (const c of p.colors) {
          colorMap.set(c.slug, { slug: c.slug, name: c.name, hex: c.hex });
        }
        for (const s of p.sizes) {
          sizeSet.add(s);
        }
        if (p.price < priceMin) priceMin = p.price;
        if (p.price > priceMax) priceMax = p.price;
      }

      const sortSizes = (a: string, b: string) => {
        const order = ["XS", "S", "M", "L", "XL", "XXL", "OS"];
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.localeCompare(b);
      };

      return {
        brands: [...brandSet].sort(),
        colors: [...colorMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
        sizes: [...sizeSet].sort(sortSizes),
        priceMin: priceMin === Infinity ? 0 : Math.floor(priceMin),
        priceMax: priceMax === 0 ? DEFAULT_PRICE_MAX : Math.ceil(priceMax),
      };
    }
  }

  async findByHandle(handle: string) {
    try {
      const product = await prisma.product.findFirst({
        where: {
          handle,
          ...storefrontVisibility,
        },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: {
            where: { isActive: true },
            include: { inventory: true },
            orderBy: [{ colorSlug: "asc" }, { sizeValue: "asc" }],
          },
          category: true,
          reviews: {
            where: { isApproved: true },
            take: 20,
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { firstName: true, lastName: true, image: true } },
            },
          },
        },
      });
      if (product) return product;
    } catch {
      // Fallback
    }

    const fallback = PRODUCTS.find((p) => p.handle === handle);
    if (!fallback) return null;
    return {
      ...mapStaticProductToDbShape(fallback),
      reviews: [],
      vendor: null,
    };
  }

  async findRelated(productId: string, categoryId: string | null, limit = 4) {
    try {
      const related = await prisma.product.findMany({
        where: {
          ...storefrontVisibility,
          id: { not: productId },
          ...(categoryId ? { categoryId } : {}),
        },
        take: limit,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 2 },
          variants: { where: { isActive: true }, take: 1, include: { inventory: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      });
      if (related.length > 0) return related;
    } catch {
      // Fallback
    }

    const staticProduct = PRODUCTS.find((p) => p.id === productId);
    const category = staticProduct?.category || categoryId || "men";
    const others = PRODUCTS.filter((p) => p.id !== productId && p.category === category).slice(
      0,
      limit
    );
    return others.map(mapStaticProductToDbShape);
  }
}

export const productRepository = new ProductRepository();
