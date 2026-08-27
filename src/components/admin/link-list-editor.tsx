"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ThemeNavLink } from "@/types/store-theme";

type LinkListEditorProps = {
  label: string;
  links: ThemeNavLink[];
  onChange: (links: ThemeNavLink[]) => void;
  showDescription?: boolean;
};

export function LinkListEditor({
  label,
  links,
  onChange,
  showDescription,
}: LinkListEditorProps) {
  const update = (index: number, patch: Partial<ThemeNavLink>) => {
    onChange(links.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...links, { label: "", href: "" }])}
        >
          Add link
        </Button>
      </div>
      {links.length === 0 && (
        <p className="text-xs text-muted-foreground">No links yet.</p>
      )}
      {links.map((link, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] border rounded-sm p-3 bg-secondary/20">
          <Input
            placeholder="Label"
            value={link.label}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <Input
            placeholder="/collections/men"
            value={link.href}
            onChange={(e) => update(i, { href: e.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => onChange(links.filter((_, j) => j !== i))}
          >
            Remove
          </Button>
          {showDescription && (
            <Input
              className="sm:col-span-3"
              placeholder="Description (optional)"
              value={link.description ?? ""}
              onChange={(e) => update(i, { description: e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
  );
}
