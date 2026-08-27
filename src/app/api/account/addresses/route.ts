import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";
import { accountService } from "@/server/services/account.service";
import { toErrorResponse } from "@/server/errors/app-error";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().regex(/^\d{6}$/),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    return Response.json(await accountService.listAddresses(user.id));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = schema.parse(await req.json());
    const address = await accountService.createAddress(user.id, body);
    return Response.json(address, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
