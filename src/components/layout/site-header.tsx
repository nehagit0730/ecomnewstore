"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "./announcement-bar";
import { MegaMenu } from "./mega-menu";
import { SearchDialog } from "@/components/search/search-dialog";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useSearchStore } from "@/stores/search-store";
import { useSession } from "next-auth/react";
import type { HeaderConfig, MegaMenuItem } from "@/types/store-theme";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const SCROLL_HIDE_AT = 32;
const SCROLL_SHOW_AT = 8;

type SiteHeaderProps = {
  header: HeaderConfig;
  megaMenu: MegaMenuItem[];
};

export function SiteHeader({ header, megaMenu }: SiteHeaderProps) {
  const menuItems = megaMenu;
  const headerRef = useRef<HTMLElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(64);
  const hydrated = useHydrated();
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const openSearch = useSearchStore((s) => s.open);
  const { data: session } = useSession();
  const isAuthenticated = hydrated && !!session?.user;
  const displayItemCount = hydrated ? itemCount : 0;
  const displayWishlistCount = hydrated ? wishlistCount : 0;
  const accountHref = isAuthenticated ? "/account/profile" : "/account/login";

  const showAnnouncementBar = header.announcement.enabled && header.announcement.items.length > 0;
  const collapseAnnouncement = showAnnouncementBar && compact;

  const updateScrollState = useCallback(() => {
    const y = window.scrollY;
    setCompact((prev) => {
      if (!prev && y > SCROLL_HIDE_AT) return true;
      if (prev && y < SCROLL_SHOW_AT) return false;
      return prev;
    });
  }, []);

  useLayoutEffect(() => {
    updateScrollState();
  }, [updateScrollState]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateScrollState();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [updateScrollState]);

  useEffect(() => {
    if (!compact) return;
    setActiveMenu(null);
    setMobileOpen(false);
  }, [compact]);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const measure = () => setHeaderHeight(el.getBoundingClientRect().height);

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [collapseAnnouncement, mobileOpen, showAnnouncementBar, menuItems.length]);

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-background isolate"
        style={{ "--header-height": `${headerHeight}px` } as React.CSSProperties}
      >
        {showAnnouncementBar && (
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-out",
              collapseAnnouncement ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
            )}
            aria-hidden={collapseAnnouncement}
          >
            <div className="overflow-hidden">
              <AnnouncementBar items={header.announcement.items} />
            </div>
          </div>
        )}

        <div
          className={cn(
            "border-b bg-background transition-shadow duration-300",
            compact && "shadow-sm"
          )}
        >
          <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link
              href={header.logo.href}
              className="font-serif text-xl tracking-[0.2em] uppercase md:text-2xl flex items-center gap-2 shrink-0"
            >
              {header.logo.imageUrl ? (
                <Image
                  src={header.logo.imageUrl}
                  alt={header.logo.text}
                  width={120}
                  height={32}
                  className="h-8 w-auto object-contain"
                  priority
                />
              ) : (
                header.logo.text
              )}
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={cn(
                    "text-sm font-medium tracking-wide transition-colors hover:text-gold",
                    activeMenu === item.label && "text-gold"
                  )}
                  onMouseEnter={() => setActiveMenu(item.label)}
                >
                  {item.label}
                </button>
              ))}
              {header.extraLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium tracking-wide",
                    link.highlight ? "text-destructive" : "hover:text-gold"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={openSearch}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href="/wishlist" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                  {displayWishlistCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {displayWishlistCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href={accountHref} aria-label="Account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={openCart}
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {displayItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
                  >
                    {displayItemCount}
                  </motion.span>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="relative" onMouseLeave={() => setActiveMenu(null)}>
          <MegaMenu
            activeMenu={activeMenu}
            onClose={() => setActiveMenu(null)}
            items={menuItems}
            headerHeight={headerHeight}
          />
        </div>

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-b lg:hidden"
            >
              <div className="container mx-auto space-y-4 px-4 py-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-sm font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {header.extraLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block text-sm font-medium",
                      link.highlight && "text-destructive"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <SearchDialog />
      <CartDrawer />
    </>
  );
}
