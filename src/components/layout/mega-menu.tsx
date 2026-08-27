"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { MegaMenuItem } from "@/types/store-theme";

type MegaMenuProps = {
  activeMenu: string | null;
  onClose: () => void;
  items: MegaMenuItem[];
  headerHeight: number;
};

export function MegaMenu({ activeMenu, onClose, items, headerHeight }: MegaMenuProps) {
  const menu = items.find((m) => m.label === activeMenu);

  return (
    <AnimatePresence>
      {menu && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-40 bg-black/20"
            style={{ top: headerHeight }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-full z-50 border-b bg-background shadow-lg"
            onMouseLeave={onClose}
          >
            <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-[1fr_1fr_320px]">
              {menu.columns.map((column) => (
                <div key={column.title}>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {column.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className="text-sm font-medium transition-colors hover:text-gold"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {menu.featured && (
                <Link
                  href={menu.featured.href}
                  onClick={onClose}
                  className="group relative hidden aspect-[4/5] overflow-hidden lg:block"
                >
                  <Image
                    src={menu.featured.image}
                    alt={menu.featured.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="320px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-xs uppercase tracking-widest opacity-80">
                      {menu.featured.subtitle}
                    </p>
                    <p className="font-serif text-xl">{menu.featured.title}</p>
                  </div>
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
