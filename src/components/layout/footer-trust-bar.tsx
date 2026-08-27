import { TRUST_ICON_MAP } from "@/lib/trust-icons";
import { cn } from "@/lib/utils";
import type { FooterConfig } from "@/types/store-theme";

type FooterTrustBarProps = {
  config: FooterConfig["trustBar"];
};

export function FooterTrustBar({ config }: FooterTrustBarProps) {
  if (!config.enabled || !config.items.length) return null;

  return (
    <div className="border-b border-border/80 bg-gradient-to-b from-secondary/50 to-background">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground mb-8">
          {config.heading}
        </p>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
          {config.items.map((item) => {
            const Icon = TRUST_ICON_MAP[item.icon] ?? TRUST_ICON_MAP.truck;
            return (
              <li
                key={`${item.title}-${item.desc}`}
                className={cn(
                  "group relative flex flex-col items-center text-center rounded-sm border border-border/70 bg-card/80 px-3 py-5 sm:px-4 sm:py-6",
                  "shadow-sm shadow-black/[0.02] transition-all duration-300",
                  "hover:border-foreground/15 hover:shadow-md hover:shadow-black/[0.04]"
                )}
              >
                <div
                  className={cn(
                    "mb-3 flex h-11 w-11 items-center justify-center rounded-full",
                    "bg-foreground text-background transition-transform duration-300 group-hover:scale-105"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="text-sm font-medium tracking-tight">{item.title}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground max-w-[11rem]">
                  {item.desc}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
