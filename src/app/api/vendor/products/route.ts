import { requireActiveVendor } from "@/lib/auth-utils";
import { vendorProductService } from "@/server/services/vendor-product.service";
import { createProductSchema } from "@/server/validation/admin-product.schema";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET(request: Request) {
  try {
    const { vendor } = await requireActiveVendor();
    const { searchParams } = new URL(request.url);
    const data = await vendorProductService.list(vendor.id, {
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
    });
    return Response.json(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { vendor } = await requireActiveVendor();
    const body = createProductSchema.parse(await request.json());
    const product = await vendorProductService.create(vendor.id, body);
    return Response.json(product, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
