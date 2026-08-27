import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminProductService } from "@/server/services/admin-product.service";
import { rejectProductSchema } from "@/server/validation/admin-product.schema";
import { toErrorResponse } from "@/server/errors/app-error";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  try {
    const user = await requireSuperAdmin();
    const { id } = await params;
    const { reason } = rejectProductSchema.parse(await request.json());
    const product = await adminProductService.reject(id, user.id, reason);
    return Response.json(product);
  } catch (error) {
    return toErrorResponse(error);
  }
}
