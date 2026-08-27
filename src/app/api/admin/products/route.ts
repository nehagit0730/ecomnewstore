import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminProductService } from "@/server/services/admin-product.service";
import { createProductSchema } from "@/server/validation/admin-product.schema";
import { toErrorResponse } from "@/server/errors/app-error";
import type { ProductApprovalStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(request.url);
    const data = await adminProductService.list({
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
      approvalStatus: (searchParams.get("approvalStatus") as ProductApprovalStatus) || undefined,
      vendorId: searchParams.get("vendorId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return Response.json(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSuperAdmin();
    const body = createProductSchema.parse(await request.json());
    const product = await adminProductService.create(body, user.id);
    return Response.json(product, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
