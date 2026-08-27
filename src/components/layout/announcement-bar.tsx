"use client";

type AnnouncementBarProps = {
  items: { id: string; text: string }[];
};

export function AnnouncementBar({ items }: AnnouncementBarProps) {
  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="announcement-track flex whitespace-nowrap py-2.5">
        {loop.map((item, i) => (
          <span
            key={`${item.id}-${i}`}
            className="mx-8 text-xs font-medium tracking-widest uppercase"
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
