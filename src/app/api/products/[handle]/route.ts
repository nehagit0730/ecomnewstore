import { productService } from "@/server/services/product.service";
import { toErrorResponse } from "@/server/errors/app-error";

type Params = { params: Promise<{ handle: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { handle } = await params;
    const product = await productService.getByHandle(handle);
    const related = await productService.getRelated(handle);
    return Response.json({ product, related });
  } catch (error) {
    return toErrorResponse(error);
  }
}
