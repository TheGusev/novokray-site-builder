import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, ChevronDown, MessageCircle, Clock, Send } from "lucide-react";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { GOALS, trackGoal } from "@/lib/analytics";
import { Logo } from "@/components/site/Logo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const NAV = [
  { to: "/price", l: "Цены" },
  { to: "/video", l: "Видео работ" },
  { to: "/garantii", l: "Гарантии" },
  { to: "/blog", l: "Блог" },
  { to: "/faq", l: "FAQ" },
  { to: "/o-kompanii", l: "О компании" },
  { to: "/contacts", l: "Контакты" },
] as const;

const CATEGORY_LABEL: Record<string, string> = {
  vrediteli: "Уничтожение вредителей",
  sanitarnaya: "Санитарная обработка",
  uchastok: "Обработка участков",
  spec: "Спец. услуги",
};

const CATEGORY_HUB_SLUG: Record<string, string> = {
  vrediteli: "unichtozhenie-vrediteley",
  sanitarnaya: "sanitarnaya-obrabotka",
  uchastok: "obrabotka-uchastkov",
  spec: "spec-uslugi",
};

export function Header() {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let anchorY = typeof window !== "undefined" ? window.scrollY : 0;
    let ticking = false;
    const DOWN_THRESHOLD = 8;
    const TOP_ZONE = 80;

    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (y < TOP_ZONE) {
        setHidden(false);
        anchorY = y;
      } else if (y > anchorY + DOWN_THRESHOLD) {
        setHidden(true);
        anchorY = y;
      } else if (y < anchorY) {
        setHidden(false);
        anchorY = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep header visible while menus/sheets are open
  const forceVisible = open || services;

  const grouped = SERVICES.reduce<Record<string, typeof SERVICES>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[transform,background-color,box-shadow,border-color,height] duration-300 will-change-transform ${
        scrolled
          ? "border-border bg-background/95 shadow-card backdrop-blur-md"
          : "border-transparent bg-background/80 backdrop-blur-sm"
      } ${hidden && !forceVisible ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className={`container-x flex items-center justify-between gap-4 transition-all ${scrolled ? "h-14" : "h-16 md:h-18"}`}>
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          <Popover open={services} onOpenChange={setServices}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary data-[state=open]:text-foreground"
                aria-label="Открыть меню услуг"
              >
                Услуги <ChevronDown className={`h-3.5 w-3.5 transition-transform ${services ? "rotate-180" : ""}`} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="center" sideOffset={8} className="w-[min(92vw,720px)] rounded-2xl border-border p-0 shadow-elegant">
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {Object.entries(grouped).map(([cat, list]) => (
                  <div key={cat}>
                    <Link
                      to="/uslugi/$slug"
                      params={{ slug: CATEGORY_HUB_SLUG[cat] ?? "" }}
                      onClick={() => setServices(false)}
                      className="block px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-primary"
                    >
                      {CATEGORY_LABEL[cat] ?? cat} →
                    </Link>
                    <div className="grid">
                      {list.map((s) => (
                        <Link
                          key={s.slug}
                          to="/services/$slug"
                          params={{ slug: s.slug }}
                          onClick={() => setServices(false)}
                          className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-secondary"
                        >
                          <span className="flex items-center gap-3">
                            <s.icon className="h-4 w-4 shrink-0 text-primary" />
                            <span className="text-sm font-medium">{s.title}</span>
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary">
                            от {Math.round(s.priceFrom / 100) / 10}к ₽
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-5 py-3">
                <span className="text-xs text-muted-foreground">{SERVICES.length} направлений · Новосибирск и область</span>
                <Link
                  to="/services"
                  onClick={() => setServices(false)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
                >
                  Все услуги →
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          {NAV.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              activeProps={{ className: "rounded-md px-3 py-2 text-sm font-semibold text-primary bg-secondary" }}
              inactiveProps={{ className: "rounded-md px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary hover:text-foreground" }}
            >
              {i.l}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={SITE.phoneHref} onClick={() => trackGoal(GOALS.callClick, { place: "header" })} className="hidden text-right md:block">
            <div className="font-display text-sm font-bold text-foreground">{SITE.phone}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{SITE.hours}</div>
          </a>
          <a
            href={SITE.telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Telegram ${SITE.telegramHandle}`}
            onClick={() => trackGoal(GOALS.telegramClick, { place: "header" })}
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:border-primary hover:text-primary"
          >
            <Send className="h-4 w-4" />
          </a>
          <a
            href={SITE.phoneHref}
            onClick={() => trackGoal(GOALS.callClick, { place: "header_cta" })}
            className="hidden md:inline-flex items-center gap-2 rounded-xl bg-cta-gradient px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-cta cta-shine transition hover:scale-[1.02]"
          >
            <Phone className="h-4 w-4" /> Вызвать
          </a>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card lg:hidden"
            aria-label="Открыть меню"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile sheet (shadcn Sheet — no duplicate header) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full max-w-[420px] flex-col overflow-y-auto bg-background p-0 sm:max-w-[420px]"
        >
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle className="text-left font-display text-base font-bold">Меню</SheetTitle>
          </SheetHeader>

          <div className="space-y-2 p-4">
            <a
              href={SITE.phoneHref}
              onClick={() => { trackGoal(GOALS.callClick, { place: "mobile_menu" }); setOpen(false); }}
              className="flex items-center justify-between gap-3 rounded-2xl bg-cta-gradient p-4 text-accent-foreground shadow-cta cta-shine"
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Phone className="h-5 w-5" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-display text-base font-extrabold">{SITE.phone}</span>
                  <span className="text-xs opacity-90 flex items-center gap-1"><Clock className="h-3 w-3" /> {SITE.hours}</span>
                </span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">Звонок</span>
            </a>
            <a
              href={SITE.whatsappHref}
              onClick={() => { trackGoal("whatsapp_click", { place: "mobile_menu" }); setOpen(false); }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 font-semibold"
            >
              <MessageCircle className="h-5 w-5 text-success" /> Написать в WhatsApp
            </a>
            <a
              href={SITE.telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { trackGoal(GOALS.telegramClick, { place: "mobile_menu" }); setOpen(false); }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 font-semibold"
            >
              <Send className="h-5 w-5 text-primary" /> Telegram · {SITE.telegramHandle}
            </a>
          </div>

          <div className="border-t border-border p-2">
            <Accordion type="single" collapsible defaultValue="services">
              <AccordionItem value="services" className="border-b-0">
                <AccordionTrigger className="px-3 py-3 font-display text-sm font-bold uppercase tracking-wider hover:no-underline">
                  Услуги · {SERVICES.length}
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-2">
                  {Object.entries(grouped).map(([cat, list]) => (
                    <div key={cat} className="mb-3">
                      <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {CATEGORY_LABEL[cat] ?? cat}
                      </div>
                      {list.map((s) => (
                        <Link
                          key={s.slug}
                          to="/services/$slug"
                          params={{ slug: s.slug }}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 active:bg-secondary"
                        >
                          <span className="flex items-center gap-3">
                            <s.icon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{s.title}</span>
                          </span>
                          <span className="text-xs text-muted-foreground">от {s.priceFrom.toLocaleString("ru-RU")} ₽</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                  <Link
                    to="/services"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-bold text-primary"
                  >
                    Все направления →
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-2 grid">
              {[...NAV, { to: "/faq", l: "Вопросы и ответы" }, { to: "/category/dezinfekciya-novosibirsk", l: "Дезинфекция в Новосибирске" }].map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-foreground active:bg-secondary"
                >
                  {i.l}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-border bg-surface p-4 text-xs text-muted-foreground">
            <div>{SITE.address}</div>
            <div className="mt-1">{SITE.email}</div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
