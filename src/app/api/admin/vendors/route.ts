import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminVendorService } from "@/server/services/admin-vendor.service";
import { toErrorResponse } from "@/server/errors/app-error";
import { z } from "zod";

const createVendorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  shopName: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
});

export async function GET() {
  try {
    await requireSuperAdmin();
    const vendors = await adminVendorService.list();
    return Response.json(vendors);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = createVendorSchema.parse(await request.json());
    const vendor = await adminVendorService.create(body);
    return Response.json(vendor, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
