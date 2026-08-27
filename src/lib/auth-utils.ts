import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";
import type { UserRole } from "@prisma/client";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) throw new AppError("Unauthorized", 401);
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError(
      user.role === "VENDOR"
        ? "Vendor accounts cannot access the admin panel. Use /vendor."
        : "Forbidden — sign in as super admin (admin@veloire.com).",
      403
    );
  }
  return user;
}

/** @deprecated Use requireSuperAdmin */
export const requireAdmin = requireSuperAdmin;

export async function requireVendor() {
  const user = await requireAuth();
  if (user.role !== "VENDOR") throw new AppError("Forbidden", 403);
  return user;
}

export async function requireSuperAdminOrVendor() {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN" && user.role !== "VENDOR") {
    throw new AppError("Forbidden", 403);
  }
  return user;
}

export async function getVendorForUser(userId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
  });
  if (!vendor) throw new AppError("Vendor profile not found", 404);
  return vendor;
}

export async function requireActiveVendor() {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);
  if (vendor.status !== "ACTIVE") {
    throw new AppError("Vendor account is not active", 403);
  }
  return { user, vendor };
}

export function isSuperAdmin(role: UserRole) {
  return role === "SUPER_ADMIN";
}

export function isVendor(role: UserRole) {
  return role === "VENDOR";
}
