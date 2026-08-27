import { requireSuperAdmin } from "@/lib/auth-utils";
import { homepageConfigSchema } from "@/lib/store-theme-schemas";
import { storeThemeService } from "@/server/services/store-theme.service";
import { toErrorResponse } from "@/server/errors/app-error";
import { z } from "zod";

const legacyHeroSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  imageUrl: z.string().min(1),
});

export async function GET() {
  try {
    await requireSuperAdmin();
    return Response.json(await storeThemeService.getHomepage());
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    if (body.hero && !body.featuredSection) {
      const current = await storeThemeService.getHomepage();
      const hero = legacyHeroSchema.parse(body);
      return Response.json(
        await storeThemeService.updateHomepage({ ...current, hero })
      );
    }
    const value = homepageConfigSchema.parse(body);
    return Response.json(await storeThemeService.updateHomepage(value));
  } catch (error) {
    return toErrorResponse(error);
  }
}
