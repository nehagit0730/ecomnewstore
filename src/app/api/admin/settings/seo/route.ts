import { requireSuperAdmin } from "@/lib/auth-utils";
import { seoConfigSchema } from "@/lib/store-theme-schemas";
import { storeThemeService } from "@/server/services/store-theme.service";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET() {
  try {
    await requireSuperAdmin();
    return Response.json(await storeThemeService.getSeo());
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireSuperAdmin();
    const value = seoConfigSchema.parse(await request.json());
    return Response.json(await storeThemeService.updateSeo(value));
  } catch (error) {
    return toErrorResponse(error);
  }
}
