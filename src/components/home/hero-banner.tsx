"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ThemeNavLink } from "@/types/store-theme";

type HeroBannerProps = {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageUrl: string;
  quickLinks?: ThemeNavLink[];
};

export function HeroBanner({
  title,
  subtitle,
  ctaLabel = "Shop New Arrivals",
  ctaHref = "/collections/new-arrivals",
  secondaryCtaLabel,
  secondaryCtaHref,
  imageUrl,
  quickLinks = [],
}: HeroBannerProps) {
  return (
    <section className="relative w-full overflow-hidden bg-foreground">
      <div className="relative min-h-[88vh] md:min-h-[92vh]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority
          className="object-cover opacity-90"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-10 md:pb-14 pt-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-4 text-base md:text-lg text-white/80 max-w-lg leading-relaxed">
                  {subtitle}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="luxury" size="lg" asChild>
                  <Link href={ctaHref}>
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {secondaryCtaLabel && secondaryCtaHref && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
                  </Button>
                )}
              </div>
            </motion.div>

            {quickLinks.length > 0 && (
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-6"
                aria-label="Quick shop"
              >
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs font-medium uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </motion.nav>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
