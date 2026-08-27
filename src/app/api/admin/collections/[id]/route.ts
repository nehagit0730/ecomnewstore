import { requireSuperAdmin } from "@/lib/auth-utils";
import {
  adminCollectionService,
  collectionSchema,
} from "@/server/services/admin-collection.service";
import { toErrorResponse } from "@/server/errors/app-error";

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    return Response.json(await adminCollectionService.getById(id));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = collectionSchema.partial().parse(await request.json());
    return Response.json(await adminCollectionService.update(id, body));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    await adminCollectionService.delete(id);
    return Response.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
