import { requireSuperAdmin } from "@/lib/auth-utils";
import {
  adminCollectionService,
  collectionSchema,
} from "@/server/services/admin-collection.service";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET() {
  try {
    await requireSuperAdmin();
    return Response.json(await adminCollectionService.list());
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = collectionSchema.parse(await request.json());
    const col = await adminCollectionService.create(body);
    return Response.json(col, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
