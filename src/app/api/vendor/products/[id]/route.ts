import { requireActiveVendor } from "@/lib/auth-utils";
import { vendorProductService } from "@/server/services/vendor-product.service";
import { updateProductSchema } from "@/server/validation/admin-product.schema";
import { toErrorResponse } from "@/server/errors/app-error";
import { adminProductService } from "@/server/services/admin-product.service";

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  try {
    const { vendor } = await requireActiveVendor();
    const { id } = await params;
    return Response.json(await vendorProductService.getById(vendor.id, id));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { vendor } = await requireActiveVendor();
    const { id } = await params;
    const body = updateProductSchema.parse(await request.json());
    await vendorProductService.getById(vendor.id, id);
    const product = await adminProductService.updateFull(id, {
      ...body,
      approvalStatus: "PENDING_REVIEW",
      isActive: false,
    });
    return Response.json(product);
  } catch (error) {
    return toErrorResponse(error);
  }
}
