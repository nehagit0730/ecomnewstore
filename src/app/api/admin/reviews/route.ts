import { requireSuperAdmin } from "@/lib/auth-utils";
import { toErrorResponse } from "@/server/errors/app-error";
import { adminReviewService } from "@/server/services/admin-review.service";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") ?? undefined;
    const approvedParam = searchParams.get("approved");
    const approved =
      approvedParam === "true" ? true : approvedParam === "false" ? false : undefined;

    return Response.json(await adminReviewService.list({ productId, approved }));
  } catch (error) {
    return toErrorResponse(error);
  }
}
