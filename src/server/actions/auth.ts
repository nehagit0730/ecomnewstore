"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/server/db/prisma";
import { AuthError } from "next-auth";
import type { UserRole } from "@prisma/client";

export type LoginResult = {
  success?: boolean;
  error?: string;
  role?: UserRole;
};

export async function loginWithCredentials(params: {
  email: string;
  password: string;
  requiredRole?: UserRole;
}): Promise<LoginResult> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const rawPassword = params.password.trim();

  try {
    // 1. Verify user exists and role matches if specified
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user && params.requiredRole && user.role !== params.requiredRole) {
      if (params.requiredRole === "SUPER_ADMIN") {
        return {
          error:
            "This account is not a Super Admin. Please sign in with an admin account (admin@veloire.com).",
        };
      }
      if (params.requiredRole === "VENDOR") {
        return {
          error:
            "This account is not a Vendor. Please sign in with a vendor account (vendor@veloire.com).",
        };
      }
    }

    // 2. Perform NextAuth sign-in
    await signIn("credentials", {
      email: normalizedEmail,
      password: rawPassword,
      redirect: false,
    });

    return { success: true, role: user?.role };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password. Please check your credentials." };
        default:
          return { error: "Authentication failed. Please try again." };
      }
    }

    const message = (error as Error)?.message ?? "";
    if (message.includes("NEXT_REDIRECT")) {
      return { success: true };
    }
    if (message.includes("CredentialsSignin") || message.includes("authorize")) {
      return { error: "Invalid email or password. Please check your credentials." };
    }

    return { error: "Invalid email or password. Please check your credentials." };
  }
}

export async function logoutUser(): Promise<{ success: boolean }> {
  try {
    await signOut({ redirect: false });
  } catch (error) {
    const message = (error as Error)?.message ?? "";
    if (!message.includes("NEXT_REDIRECT")) {
      console.error("Logout error:", error);
    }
  }
  return { success: true };
}

