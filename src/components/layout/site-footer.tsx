import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, Linkedin, ShieldCheck } from "lucide-react";
import { FooterNewsletter } from "./footer-newsletter";
import { FooterTrustBar } from "./footer-trust-bar";
import type { FooterConfig, ThemeNavLink } from "@/types/store-theme";
import type { LucideIcon } from "lucide-react";

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
};

type SiteFooterProps = {
  footer: FooterConfig;
  logoText: string;
  cmsLinks?: ThemeNavLink[];
};

export function SiteFooter({ footer, logoText, cmsLinks = [] }: SiteFooterProps) {
  const columns = footer.columns.map((col) => {
    if (
      footer.mergeCmsPages &&
      col.title === footer.cmsColumnTitle &&
      cmsLinks.length
    ) {
      const existing = new Set(col.links.map((l) => l.href));
      const merged = [
        ...col.links,
        ...cmsLinks.filter((l) => !existing.has(l.href)),
      ];
      return { ...col, links: merged };
    }
    return col;
  });

  return (
    <footer className="mt-auto border-t bg-secondary/30">
      <FooterTrustBar config={footer.trustBar} />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href="/" className="font-serif text-2xl tracking-[0.15em] uppercase">
              {logoText}
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
              {footer.brand.description}
            </p>
            {footer.brand.socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {footer.brand.socialLinks.map((s) => {
                  const Icon = SOCIAL_ICONS[s.platform.toLowerCase()] ?? Instagram;
                  return (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col) => (
              <FooterColumn key={col.title} title={col.title} links={col.links} />
            ))}
          </div>
        </div>

        {footer.newsletter.enabled && (
          <div className="mt-12 pt-10 border-t border-border/80">
            <FooterNewsletter config={footer.newsletter} />
          </div>
        )}
      </div>

      <div className="border-t border-border/80 bg-background">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {logoText}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {footer.legal.links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
            {footer.legal.supportEmail && (
              <a
                href={`mailto:${footer.legal.supportEmail}`}
                className="hover:text-foreground"
              >
                {footer.legal.supportEmail}
              </a>
            )}
            <Link
              id="footer-admin-sign-in-btn"
              href="/admin"
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: ThemeNavLink[] }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={`${title}-${link.label}-${link.href}`}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
