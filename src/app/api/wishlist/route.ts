import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET() {
  try {
    const user = await requireAuth();
    const items = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 2 },
            variants: { include: { inventory: true }, take: 1 },
          },
        },
      },
    });
    return Response.json(items);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { productId } = await req.json();
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });
    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return Response.json({ added: false });
    }
    await prisma.wishlist.create({ data: { userId: user.id, productId } });
    return Response.json({ added: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
