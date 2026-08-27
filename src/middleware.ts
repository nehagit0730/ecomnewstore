import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

function getPublicUrl(path: string, req: Parameters<Parameters<typeof auth>[0]>[0]) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const hostHeader = req.headers.get("host");
  const rawHost = forwardedHost || hostHeader || req.nextUrl.host;
  const isRemote =
    rawHost.includes(".run.app") ||
    rawHost.includes("ais-") ||
    (!rawHost.includes("localhost") && !rawHost.includes("127.0.0.1"));

  const cleanHost = isRemote ? rawHost.replace(/:\d+$/, "") : rawHost;
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const proto = isRemote
    ? "https"
    : forwardedProto || req.nextUrl.protocol.replace(":", "") || "http";

  return new URL(path, `${proto}://${cleanHost}`);
}

function loginRedirect(
  req: Parameters<Parameters<typeof auth>[0]>[0],
  loginPath: string,
  callbackPath: string
) {
  const url = getPublicUrl(loginPath, req);
  url.searchParams.set("callbackUrl", callbackPath);
  return NextResponse.redirect(url);
}

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const role = req.auth?.user?.role;

  // 1. Admin login page
  if (path.startsWith("/admin/login")) {
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(getPublicUrl("/admin", req));
    }
    return NextResponse.next();
  }

  // 2. Vendor login page
  if (path.startsWith("/vendor/login")) {
    if (role === "VENDOR") {
      return NextResponse.redirect(getPublicUrl("/vendor", req));
    }
    return NextResponse.next();
  }

  // 3. Admin protected portal
  if (path.startsWith("/admin")) {
    if (role !== "SUPER_ADMIN") {
      if (!req.auth) return loginRedirect(req, "/admin/login", path);
      return NextResponse.redirect(
        getPublicUrl(role === "VENDOR" ? "/vendor" : "/account/profile", req)
      );
    }
  }

  // 4. Vendor protected portal
  if (path.startsWith("/vendor")) {
    if (role !== "VENDOR") {
      if (!req.auth) return loginRedirect(req, "/vendor/login", path);
      return NextResponse.redirect(
        getPublicUrl(role === "SUPER_ADMIN" ? "/admin" : "/account/profile", req)
      );
    }
  }

  // 5. Customer account protected area
  if (
    path.startsWith("/account") &&
    !path.startsWith("/account/login") &&
    !path.startsWith("/account/register") &&
    !path.startsWith("/account/forgot-password") &&
    !path.startsWith("/account/reset-password")
  ) {
    if (!req.auth) {
      return loginRedirect(req, "/account/login", path);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};


