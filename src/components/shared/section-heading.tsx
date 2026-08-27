import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel = "View all",
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "text-center sm:flex-col sm:items-center",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-2xl tracking-tight md:text-3xl lg:text-[2rem]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground max-w-md">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-2 text-sm font-medium shrink-0 border-b border-foreground pb-0.5 hover:text-muted-foreground hover:border-muted-foreground transition-colors"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
