import { requireSuperAdmin } from "@/lib/auth-utils";
import { footerConfigSchema } from "@/lib/store-theme-schemas";
import { storeThemeService } from "@/server/services/store-theme.service";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET() {
  try {
    await requireSuperAdmin();
    return Response.json(await storeThemeService.getFooter());
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireSuperAdmin();
    const value = footerConfigSchema.parse(await request.json());
    return Response.json(await storeThemeService.updateFooter(value));
  } catch (error) {
    return toErrorResponse(error);
  }
}
