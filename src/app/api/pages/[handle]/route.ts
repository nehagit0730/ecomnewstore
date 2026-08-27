import { storefrontService } from "@/server/services/storefront.service";
import { toErrorResponse } from "@/server/errors/app-error";
import { AppError } from "@/server/errors/app-error";

type Props = { params: Promise<{ handle: string }> };

export async function GET(_req: Request, { params }: Props) {
  try {
    const { handle } = await params;
    const page = await storefrontService.getPublishedPage(handle);
    if (!page) throw new AppError("Page not found", 404);
    return Response.json(page);
  } catch (error) {
    return toErrorResponse(error);
  }
}
