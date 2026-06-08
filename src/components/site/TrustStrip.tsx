import { ShieldCheck, Clock4, Award, BadgeCheck } from "lucide-react";

export function TrustStrip() {
  const items = [
    { icon: Clock4, t: "Выезд за 60 мин", s: "по Новосибирску, ежедневно 07:00–23:00" },
    { icon: ShieldCheck, t: "Гарантия до 24 мес.", s: "по договору, бесплатная повторка" },
    { icon: Award, t: "12 лет на рынке", s: "более 38 000 объектов с 2014 года" },
    { icon: BadgeCheck, t: "Лицензия + СЭС", s: "сертифицированные препараты 4 класса" },
  ];
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-x grid gap-6 py-10 md:grid-cols-4">
        {items.map((i, k) => (
          <div key={k} className="flex items-start gap-3">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-card">
              <i.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-sm font-bold">{i.t}</div>
              <div className="text-xs text-muted-foreground">{i.s}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
