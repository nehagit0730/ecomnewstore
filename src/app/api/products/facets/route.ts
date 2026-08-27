import { NextRequest } from "next/server";
import { productService } from "@/server/services/product.service";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET(req: NextRequest) {
  try {
    const collection = req.nextUrl.searchParams.get("collection") ?? undefined;
    const facets = await productService.getFacets(collection);
    return Response.json(facets);
  } catch (error) {
    return toErrorResponse(error);
  }
}
