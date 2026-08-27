import Link from "next/link";
import { getSessionUser, getVendorForUser } from "@/lib/auth-utils";
import { VendorSidebar } from "@/components/vendor/vendor-sidebar";
import { PanelSignOutButton } from "@/components/auth/panel-sign-out-button";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role !== "VENDOR") {
    return <>{children}</>;
  }

  let vendor;
  try {
    vendor = await getVendorForUser(user.id);
  } catch {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
          <Link href="/vendor" className="font-serif text-lg shrink-0">
            {vendor.shopName}
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground hidden md:inline">
              {vendor.status}
            </span>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline"
            >
              View store
            </Link>
            <PanelSignOutButton callbackUrl="/vendor/login" />
          </div>
        </div>
      </header>
      {vendor.status !== "ACTIVE" && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm text-center py-2 px-4">
          Your shop is {vendor.status.toLowerCase()}. Contact platform admin to go live.
        </div>
      )}
      <div className="container mx-auto flex gap-8 px-4 py-8">
        <aside className="hidden w-48 shrink-0 md:block">
          <VendorSidebar />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

