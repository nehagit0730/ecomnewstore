import { Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export function ProductPurchaseNotes() {
  const items = [
    {
      icon: Truck,
      label: "Free delivery",
      detail: `Orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
    },
    {
      icon: RotateCcw,
      label: "Easy returns",
      detail: "30-day policy",
    },
    {
      icon: ShieldCheck,
      label: "Secure pay",
      detail: "Encrypted checkout",
    },
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-3 border-t border-border/80 pt-6">
      {items.map(({ icon: Icon, label, detail }) => (
        <li key={label} className="flex gap-3 items-start">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
            <Icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          </span>
          <span>
            <p className="text-xs font-medium">{label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{detail}</p>
          </span>
        </li>
      ))}
    </ul>
  );
}
