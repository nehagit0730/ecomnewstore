"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { HomepageLayoutEditor } from "@/components/admin/homepage-layout-editor";
import { HeaderEditor } from "@/components/admin/header-editor";
import { FooterEditor } from "@/components/admin/footer-editor";
import { SeoSettingsEditor } from "@/components/admin/seo-settings-editor";
import type {
  FooterConfig,
  HeaderConfig,
  HomepageConfig,
  SiteSeoConfig,
} from "@/types/store-theme";

const TABS = [
  { id: "homepage", label: "Homepage" },
  { id: "header", label: "Header" },
  { id: "footer", label: "Footer" },
  { id: "seo", label: "SEO & Analytics" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type PickerOption = { handle: string; title: string };

export function StoreContentTabs({
  homepage,
  header,
  footer,
  seo,
  collections,
  categories,
}: {
  homepage: HomepageConfig;
  header: HeaderConfig;
  footer: FooterConfig;
  seo: SiteSeoConfig;
  collections: PickerOption[];
  categories: PickerOption[];
}) {
  const [tab, setTab] = useState<TabId>("homepage");

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "homepage" && (
        <HomepageLayoutEditor
          initial={homepage}
          collections={collections}
          categories={categories}
        />
      )}
      {tab === "header" && <HeaderEditor initial={header} />}
      {tab === "footer" && <FooterEditor initial={footer} />}
      {tab === "seo" && <SeoSettingsEditor initial={seo} />}
    </div>
  );
}
