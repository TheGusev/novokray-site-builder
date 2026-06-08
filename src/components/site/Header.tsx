import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, X, ChevronDown } from "lucide-react";
import { SITE } from "@/data/site";
import { PRIORITY_SERVICES, SERVICES } from "@/data/services";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold text-foreground">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-hero text-primary-foreground shadow-elegant">ДФ</span>
          <span className="hidden sm:inline">Дез-Федерация</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground">
              Услуги <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 mt-1 w-[640px] -translate-x-1/2 rounded-xl border border-border bg-card p-4 opacity-0 shadow-elegant transition-all group-hover:visible group-hover:opacity-100">
              <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Приоритетные направления</div>
              <div className="grid grid-cols-2 gap-1">
                {PRIORITY_SERVICES.map((s) => (
                  <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-secondary">
                    <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <div className="text-sm font-semibold">{s.title}</div>
                      <div className="text-xs text-muted-foreground">от {s.priceFrom.toLocaleString("ru-RU")} ₽</div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/services" className="mt-3 block border-t border-border pt-3 text-center text-sm font-semibold text-primary hover:underline">
                Все {SERVICES.length} направлений →
              </Link>
            </div>
          </div>
          {[
            { to: "/price", l: "Цены" },
            { to: "/garantii", l: "Гарантии" },
            { to: "/blog", l: "Блог" },
            { to: "/o-kompanii", l: "О компании" },
            { to: "/contacts", l: "Контакты" },
          ].map((i) => (
            <Link
              key={i.to}
              to={i.to}
              activeProps={{ className: "rounded-md px-3 py-2 text-sm font-semibold text-primary bg-secondary" }}
              inactiveProps={{ className: "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground" }}
            >
              {i.l}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={SITE.phoneHref} className="hidden text-right md:block">
            <div className="font-display text-sm font-bold text-foreground">{SITE.phone}</div>
            <div className="text-xs text-muted-foreground">{SITE.hours}</div>
          </a>
          <a href={SITE.phoneHref} className="hidden md:inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-accent transition hover:opacity-95">
            <Phone className="h-4 w-4" /> Вызвать
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border lg:hidden"
            aria-label="Меню"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Услуги</div>
            {SERVICES.slice(0, 6).map((s) => (
              <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">
                {s.title}
              </Link>
            ))}
            <Link to="/services" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-primary hover:bg-secondary">
              Все направления →
            </Link>
            <div className="my-3 border-t border-border" />
            {[
              { to: "/price", l: "Цены" },
              { to: "/garantii", l: "Гарантии" },
              { to: "/blog", l: "Блог" },
              { to: "/o-kompanii", l: "О компании" },
              { to: "/faq", l: "Вопросы и ответы" },
              { to: "/contacts", l: "Контакты" },
            ].map((i) => (
              <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">
                {i.l}
              </Link>
            ))}
            <a href={SITE.phoneHref} className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-accent-gradient px-4 py-3 font-semibold text-accent-foreground shadow-accent">
              <Phone className="h-4 w-4" /> {SITE.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
