import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminPageService, pageSchema } from "@/server/services/admin-page.service";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET() {
  try {
    await requireSuperAdmin();
    return Response.json(await adminPageService.list());
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = pageSchema.parse(await request.json());
    const page = await adminPageService.create(body);
    return Response.json(page, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
