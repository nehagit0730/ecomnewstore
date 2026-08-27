import { Suspense } from "react";
import Link from "next/link";
import { PortalLoginForm } from "@/components/auth/portal-login-form";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Admin Sign In",
  path: "/admin/login",
  noIndex: true,
});

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md border bg-background p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
          {siteConfig.name}
        </p>
        <h1 className="font-serif text-2xl mb-1">Super Admin</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Sign in to manage the store, vendors, and catalog.
        </p>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
          <PortalLoginForm
            requiredRole="SUPER_ADMIN"
            defaultCallbackUrl="/admin"
            wrongRoleMessage="This account is not a super admin. Use the vendor portal or customer sign in."
          />
        </Suspense>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Vendor?{" "}
          <Link href="/vendor/login" className="text-foreground hover:underline">
            Vendor sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
