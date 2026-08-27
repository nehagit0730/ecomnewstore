import { Suspense } from "react";
import Link from "next/link";
import { PortalLoginForm } from "@/components/auth/portal-login-form";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Vendor Sign In",
  path: "/vendor/login",
  noIndex: true,
});

export default function VendorLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md border bg-background p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
          {siteConfig.name}
        </p>
        <h1 className="font-serif text-2xl mb-1">Vendor Portal</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Sign in to manage your shop, products, and orders.
        </p>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
          <PortalLoginForm
            requiredRole="VENDOR"
            defaultCallbackUrl="/vendor"
            wrongRoleMessage="This account is not a vendor. Contact the platform admin or use customer sign in."
          />
        </Suspense>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Platform admin?{" "}
          <Link href="/admin/login" className="text-foreground hover:underline">
            Admin sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
