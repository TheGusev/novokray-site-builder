import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/data/services";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition group-hover:bg-hero group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-bold leading-tight">{service.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{service.lead.slice(0, 140)}…</p>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-sm font-semibold text-foreground">от {service.priceFrom.toLocaleString("ru-RU")} ₽</span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
          Подробнее <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
