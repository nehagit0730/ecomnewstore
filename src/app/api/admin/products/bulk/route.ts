import { NextRequest } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminProductService } from "@/server/services/admin-product.service";
import { toErrorResponse } from "@/server/errors/app-error";

export async function DELETE(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json(
        { error: "Invalid or empty product IDs" },
        { status: 400 }
      );
    }

    const result = await adminProductService.bulkDelete(ids);
    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}