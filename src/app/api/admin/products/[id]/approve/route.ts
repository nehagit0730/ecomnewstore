import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminProductService } from "@/server/services/admin-product.service";
import { toErrorResponse } from "@/server/errors/app-error";

type Props = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Props) {
  try {
    const user = await requireSuperAdmin();
    const { id } = await params;
    const product = await adminProductService.approve(id, user.id);
    return Response.json(product);
  } catch (error) {
    return toErrorResponse(error);
  }
}
