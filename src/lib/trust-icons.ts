import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Package,
  BadgeCheck,
  Headphones,
  type LucideIcon,
} from "lucide-react";
import type { TrustIconKey } from "@/types/store-theme";

export const TRUST_ICON_MAP: Record<TrustIconKey, LucideIcon> = {
  truck: Truck,
  "rotate-ccw": RotateCcw,
  "shield-check": ShieldCheck,
  package: Package,
  "badge-check": BadgeCheck,
  headphones: Headphones,
};

export const TRUST_ICON_OPTIONS: { value: TrustIconKey; label: string }[] = [
  { value: "truck", label: "Truck (shipping)" },
  { value: "rotate-ccw", label: "Returns" },
  { value: "shield-check", label: "Security" },
  { value: "package", label: "Package" },
  { value: "badge-check", label: "Verified" },
  { value: "headphones", label: "Support" },
];
