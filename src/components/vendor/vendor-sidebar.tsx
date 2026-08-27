"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/vendor", label: "Dashboard", exact: true },
  { href: "/vendor/products", label: "My products" },
  { href: "/vendor/products/new", label: "Add product" },
  { href: "/vendor/orders", label: "Orders" },
  { href: "/vendor/sales", label: "Sales" },
];

export function VendorSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block rounded-sm px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "hover:bg-background"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
