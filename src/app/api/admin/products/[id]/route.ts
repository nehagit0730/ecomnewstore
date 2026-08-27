import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminProductService } from "@/server/services/admin-product.service";
import { updateProductSchema, productFlagsSchema } from "@/server/validation/admin-product.schema";
import { toErrorResponse } from "@/server/errors/app-error";

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const product = await adminProductService.getById(id);
    return Response.json(product);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const user = await requireSuperAdmin();
    const { id } = await params;
    const body = await request.json();

    if (body.flagsOnly) {
      const flags = productFlagsSchema.parse(body);
      const product = await adminProductService.update(id, {
        ...flags,
        ...(flags.approvalStatus === "APPROVED"
          ? { reviewedAt: new Date(), reviewedById: user.id, isActive: true }
          : {}),
      });
      return Response.json(product);
    }

    const input = updateProductSchema.parse(body);
    const product = await adminProductService.updateFull(id, input, user.id);
    return Response.json(product);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    await adminProductService.delete(id);
    return Response.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}