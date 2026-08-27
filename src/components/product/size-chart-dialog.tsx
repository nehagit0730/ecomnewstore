"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type SizeChartDialogProps = {
  title: string;
  content: string;
  triggerClassName?: string;
};

export function SizeChartDialog({ title, content, triggerClassName }: SizeChartDialogProps) {
  if (!content.trim()) return null;

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
          triggerClassName
        )}
      >
        Size guide
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-tight">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
