import { requireSuperAdmin } from "@/lib/auth-utils";
import { headerConfigSchema } from "@/lib/store-theme-schemas";
import { storeThemeService } from "@/server/services/store-theme.service";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET() {
  try {
    await requireSuperAdmin();
    return Response.json(await storeThemeService.getHeader());
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireSuperAdmin();
    const value = headerConfigSchema.parse(await request.json());
    return Response.json(await storeThemeService.updateHeader(value));
  } catch (error) {
    return toErrorResponse(error);
  }
}
