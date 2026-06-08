import { Sparkles } from "lucide-react";

export interface TldrItem { label: string; value: string }

export function TldrBlock({ items, title = "Кратко" }: { items: TldrItem[]; title?: string }) {
  return (
    <aside className="speakable not-prose mt-6 rounded-2xl border border-primary/20 bg-secondary/40 p-5 shadow-card">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-cta-gradient px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-foreground shadow-cta">
        <Sparkles className="h-3 w-3" /> {title}
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {items.map((it) => (
          <div key={it.label} className="flex justify-between gap-3 border-b border-border/50 pb-1.5 last:border-0">
            <dt className="text-muted-foreground">{it.label}</dt>
            <dd className="text-right font-semibold text-foreground">{it.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}