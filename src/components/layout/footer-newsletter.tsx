"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FooterConfig } from "@/types/store-theme";

type FooterNewsletterProps = {
  config: FooterConfig["newsletter"];
};

export function FooterNewsletter({ config }: FooterNewsletterProps) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (!config.enabled) return null;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium">{config.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{config.subtitle}</p>
      </div>
      {done ? (
        <p className="text-sm text-muted-foreground">Thanks for subscribing.</p>
      ) : (
        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) setDone(true);
          }}
        >
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background"
            required
          />
          <Button type="submit" variant="default" className="shrink-0">
            {config.buttonLabel}
          </Button>
        </form>
      )}
    </div>
  );
}
