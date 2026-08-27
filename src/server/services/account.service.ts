import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";

export class AccountService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        image: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string | null }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });
  }

  async listAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  async createAddress(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      phone: string;
      isDefault?: boolean;
    }
  ) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    const count = await prisma.address.count({ where: { userId } });
    return prisma.address.create({
      data: {
        userId,
        ...data,
        country: "IN",
        isDefault: data.isDefault ?? count === 0,
      },
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postalCode: string;
      phone: string;
      isDefault: boolean;
    }>
  ) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) throw new AppError("Address not found", 404);

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) throw new AppError("Address not found", 404);
    await prisma.address.delete({ where: { id: addressId } });
    if (existing.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (next) {
        await prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
    return { ok: true };
  }

  async saveCheckoutAddress(
    userId: string,
    input: {
      firstName: string;
      lastName: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      phone: string;
    }
  ) {
    const match = await prisma.address.findFirst({
      where: {
        userId,
        postalCode: input.postalCode,
        line1: input.line1,
      },
    });
    if (match) {
      return prisma.address.update({
        where: { id: match.id },
        data: { ...input, phone: input.phone },
      });
    }
    return this.createAddress(userId, { ...input, isDefault: false });
  }
}

export const accountService = new AccountService();
