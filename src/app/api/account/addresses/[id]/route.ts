import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";
import { accountService } from "@/server/services/account.service";
import { toErrorResponse } from "@/server/errors/app-error";

const schema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  line1: z.string().min(5).optional(),
  line2: z.string().nullable().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  postalCode: z.string().regex(/^\d{6}$/).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  isDefault: z.boolean().optional(),
});

type Props = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Props) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = schema.parse(await req.json());
    return Response.json(await accountService.updateAddress(user.id, id, body));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    return Response.json(await accountService.deleteAddress(user.id, id));
  } catch (error) {
    return toErrorResponse(error);
  }
}
