import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

const DEFAULT_SECRET = "veloire-store-secret-token-jwt-key-production-32chars";

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET || DEFAULT_SECRET;
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET || DEFAULT_SECRET;
}
if (!process.env.AUTH_TRUST_HOST) {
  process.env.AUTH_TRUST_HOST = "true";
}

export const authConfig = {
  secret: process.env.AUTH_SECRET || DEFAULT_SECRET,
  trustHost: true,
  pages: {
    signIn: "/account/login",
    newUser: "/account/register",
  },
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    authorized() {
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
