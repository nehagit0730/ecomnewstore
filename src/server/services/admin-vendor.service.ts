import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";
import bcrypt from "bcryptjs";
import type { VendorStatus } from "@prisma/client";

export class AdminVendorService {
  async list() {
    return prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, firstName: true, lastName: true, isActive: true } },
        _count: { select: { products: true } },
      },
    });
  }

  async create(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    shopName: string;
    slug: string;
    description?: string;
    status?: VendorStatus;
  }) {
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("Email already registered", 409);

    const slugTaken = await prisma.vendor.findUnique({ where: { slug: input.slug } });
    if (slugTaken) throw new AppError("Shop slug already taken", 409);

    const passwordHash = await bcrypt.hash(input.password, 12);

    return prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: "VENDOR",
        emailVerified: new Date(),
        vendor: {
          create: {
            shopName: input.shopName,
            slug: input.slug,
            description: input.description,
            status: input.status ?? "ACTIVE",
          },
        },
        cart: { create: {} },
      },
      include: { vendor: true },
    });
  }

  async updateStatus(vendorId: string, status: VendorStatus) {
    return prisma.vendor.update({
      where: { id: vendorId },
      data: { status },
    });
  }
}

export const adminVendorService = new AdminVendorService();
