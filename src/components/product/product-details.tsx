"use client";

import { useMemo } from "react";
import type { Product } from "@/types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ProductDetailsProps = {
  product: Product;
  className?: string;
};

type DetailTab = {
  id: string;
  label: string;
  content: string;
};

function formatParagraphs(text: string) {
  return text.split(/\n\n+/).filter(Boolean).map((p) => p.trim());
}

export function ProductDetails({ product, className }: ProductDetailsProps) {
  const tabs = useMemo(() => {
    const items: DetailTab[] = [];
    if (product.description?.trim()) {
      items.push({ id: "about", label: "About", content: product.description.trim() });
    }
    if (product.materials?.trim()) {
      items.push({ id: "materials", label: "Materials", content: product.materials.trim() });
    }
    if (product.careInstructions?.trim()) {
      items.push({ id: "care", label: "Care", content: product.careInstructions.trim() });
    }
    if (product.shippingInfo?.trim()) {
      items.push({ id: "shipping", label: "Shipping", content: product.shippingInfo.trim() });
    }
    if (product.returnPolicy?.trim()) {
      items.push({ id: "returns", label: "Returns", content: product.returnPolicy.trim() });
    }
    if (product.sizeChart?.trim()) {
      items.push({ id: "size", label: "Size guide", content: product.sizeChart.trim() });
    }
    return items;
  }, [product]);

  if (!tabs.length && !product.tags.length) return null;

  const defaultTab = tabs[0]?.id ?? "about";

  return (
    <div
      id="product-details"
      className={cn(
        "rounded-sm border border-border/70 bg-card/50 backdrop-blur-sm",
        className
      )}
    >
      {tabs.length > 0 && (
        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="border-b border-border/60 px-4 md:px-6 pt-4 md:pt-5 overflow-x-auto scrollbar-hide">
            <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "relative rounded-none border-0 bg-transparent px-4 py-3 text-xs font-medium uppercase tracking-[0.15em]",
                    "text-muted-foreground shadow-none data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                    "after:absolute after:inset-x-4 after:bottom-0 after:h-px after:scale-x-0 after:bg-foreground after:transition-transform data-[state=active]:after:scale-x-100"
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="mt-0 px-4 md:px-6 py-5 md:py-6 focus-visible:outline-none"
            >
              <div className="space-y-4 text-sm md:text-[15px] leading-relaxed text-foreground/90">
                {formatParagraphs(tab.content).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {product.tags.length > 0 && (
        <div
          className={cn(
            "px-4 md:px-6 py-4 md:py-5",
            tabs.length > 0 && "border-t border-border/60 bg-secondary/30"
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Highlights
          </p>
          <ul className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-background border border-border/80 px-3 py-1 text-xs text-foreground/80 capitalize"
              >
                {tag.replace(/-/g, " ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
