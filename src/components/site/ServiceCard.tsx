import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { Service } from "@/data/services";
import { SERVICE_IMAGES, SERVICE_IMAGE_META } from "@/data/images";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  const image = SERVICE_IMAGES[service.slug];
  const meta = SERVICE_IMAGE_META[service.slug];
  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-elegant"
    >
      <span className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      {image && (
        <div className="relative -mx-5 -mt-5 mb-4 aspect-[16/10] overflow-hidden bg-secondary">
          <img
            src={image}
            alt={meta?.cardAlt ?? `Услуга «${service.title}» — Дез-Федерация, Новосибирск`}
            title={meta?.cardTitle ?? service.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-card backdrop-blur">
            <Icon className="h-3.5 w-3.5" /> {service.category === "vrediteli" ? "Вредители" : service.category === "uchastok" ? "Участок" : service.category === "sanitarnaya" ? "Санитарная" : "Спец."}
          </span>
          <span className="absolute right-3 top-3 whitespace-nowrap rounded-full bg-cta-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground shadow-cta">
            от&nbsp;{service.priceFrom.toLocaleString("ru-RU")}&nbsp;₽
          </span>
        </div>
      )}
      {!image && (
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-hero group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <span className="whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          от&nbsp;{service.priceFrom.toLocaleString("ru-RU")}&nbsp;₽
        </span>
      </div>
      )}
      <h3 className={`${image ? "" : "mt-4"} font-display text-lg font-bold leading-tight text-balance`}>{service.title}</h3>
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
