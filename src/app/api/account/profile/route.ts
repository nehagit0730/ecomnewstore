import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";
import { accountService } from "@/server/services/account.service";
import { toErrorResponse } from "@/server/errors/app-error";

const patchSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    return Response.json(await accountService.getProfile(user.id));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    const body = patchSchema.parse(await req.json());
    return Response.json(await accountService.updateProfile(user.id, body));
  } catch (error) {
    return toErrorResponse(error);
  }
}
