import { requireActiveVendor } from "@/lib/auth-utils";
import { vendorProductService } from "@/server/services/vendor-product.service";
import { toErrorResponse } from "@/server/errors/app-error";

type Props = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Props) {
  try {
    const { vendor } = await requireActiveVendor();
    const { id } = await params;
    const product = await vendorProductService.submitForReview(vendor.id, id);
    return Response.json(product);
  } catch (error) {
    return toErrorResponse(error);
  }
}
