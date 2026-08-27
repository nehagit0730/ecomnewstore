import { NextRequest } from "next/server";
import { productService } from "@/server/services/product.service";
import { toErrorResponse } from "@/server/errors/app-error";

function parseListQuery(sp: URLSearchParams) {
  const categorySlugs = sp.getAll("category").filter(Boolean);

  return {
    page: Number(sp.get("page") ?? 1),
    limit: Number(sp.get("limit") ?? 12),
    search: sp.get("search") ?? undefined,
    categorySlugs: categorySlugs.length ? categorySlugs : undefined,
    collectionHandle: sp.get("collection") ?? undefined,
    brands: sp.getAll("brand").filter(Boolean),
    colors: sp.getAll("color").filter(Boolean),
    sizes: sp.getAll("size").filter(Boolean),
    priceMin: sp.has("priceMin") ? Number(sp.get("priceMin")) : undefined,
    priceMax: sp.has("priceMax") ? Number(sp.get("priceMax")) : undefined,
    inStock: sp.get("inStock") === "true",
    sort: sp.get("sort") ?? undefined,
  };
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const idsParam = sp.get("ids");
    if (idsParam) {
      const { storefrontService } = await import("@/server/services/storefront.service");
      const items = await storefrontService.getProductsByIds(idsParam.split(",").filter(Boolean));
      return Response.json({ items, total: items.length, page: 1, limit: items.length });
    }

    const query = parseListQuery(sp);
    const data = await productService.list({
      ...query,
      brands: query.brands.length ? query.brands : undefined,
      colors: query.colors.length ? query.colors : undefined,
      sizes: query.sizes.length ? query.sizes : undefined,
    });
    return Response.json(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
