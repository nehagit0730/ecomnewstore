import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET() {
  try {
    await requireSuperAdmin();
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
    return Response.json(customers);
  } catch (error) {
    return toErrorResponse(error);
  }
}
