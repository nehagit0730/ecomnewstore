import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { toErrorResponse } from "@/server/errors/app-error";
import { adminReviewService } from "@/server/services/admin-review.service";

const schema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  title: z.string().max(120).optional().nullable(),
  body: z.string().min(1).max(2000).optional(),
  isApproved: z.boolean().optional(),
});

type Props = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = schema.parse(await req.json());
    return Response.json(await adminReviewService.update(id, body));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    return Response.json(await adminReviewService.delete(id));
  } catch (error) {
    return toErrorResponse(error);
  }
}
