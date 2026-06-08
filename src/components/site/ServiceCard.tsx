import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { Service } from "@/data/services";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-elegant"
    >
      <span className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-hero group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          от {service.priceFrom.toLocaleString("ru-RU")} ₽
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold leading-tight text-balance">{service.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{service.lead.slice(0, 130)}…</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Гарантия по договору</span>
        <span className="inline-flex items-center gap-1 font-bold text-primary transition-all group-hover:gap-2">
          Подробнее <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
